begin;

-- 미션 결과와 포인트는 브라우저가 직접 변경하지 못하도록 권한을 회수합니다.
-- 앱은 아래의 제한된 RPC를 통해서만 상태 전이와 포인트 적립을 수행합니다.
revoke insert on table public.user_missions from authenticated;
revoke update (
  status,
  progress_minutes,
  started_at,
  completed_at,
  failure_reason,
  updated_at
) on table public.user_missions from authenticated;
revoke usage, select on sequence public.user_missions_id_seq from authenticated;

create or replace function public.perform_green_mission_action(
  p_action text,
  p_mission_id text default 'cooling-26-60'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_action text := upper(trim(p_action));
  v_today date := ((now() at time zone 'Asia/Seoul')::date);
  v_mission public.missions%rowtype;
  v_user_mission public.user_missions%rowtype;
  v_aircon public.aircon_status%rowtype;
  v_profile public.profiles%rowtype;
  v_point_transaction_id bigint;
  v_reward_awarded boolean := false;
  v_lifetime_points bigint := 0;
  v_level_id text;
  v_failure_reason text;
  v_feedback text;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'AUTH_REQUIRED';
  end if;

  if v_action not in ('START', 'CANCEL', 'SIMULATE', 'RESET') then
    raise exception using errcode = '22023', message = 'INVALID_MISSION_ACTION';
  end if;

  select mission.*
  into v_mission
  from public.missions as mission
  where mission.id = p_mission_id
    and mission.is_active = true;

  if not found then
    raise exception using errcode = 'P0002', message = 'MISSION_NOT_FOUND';
  end if;

  -- 프로필과 가상 에어컨은 사용자별로 최초 한 번만 생성합니다.
  insert into public.profiles (id, display_name)
  values (v_user_id, 'GreenON 사용자')
  on conflict (id) do nothing;

  insert into public.aircon_status (user_id, device_name)
  values (v_user_id, '거실 Carrier All New 에어로 18단')
  on conflict (user_id) do nothing;

  insert into public.user_missions (user_id, mission_id, mission_date)
  values (v_user_id, v_mission.id, v_today)
  on conflict (user_id, mission_id, mission_date) do nothing;

  -- 모든 미션 동작은 같은 순서(미션 → 에어컨 → 프로필)로 잠급니다.
  select user_mission.*
  into v_user_mission
  from public.user_missions as user_mission
  where user_mission.user_id = v_user_id
    and user_mission.mission_id = v_mission.id
    and user_mission.mission_date = v_today
  for update;

  select aircon.*
  into v_aircon
  from public.aircon_status as aircon
  where aircon.user_id = v_user_id
  for update;

  if v_action = 'START' then
    update public.user_missions
    set status = 'ACTIVE',
        progress_minutes = 0,
        started_at = now(),
        completed_at = null,
        failure_reason = null,
        updated_at = now()
    where id = v_user_mission.id
    returning * into v_user_mission;

    v_feedback := 'GREEN MISSION을 시작했어요.';
  elsif v_action = 'CANCEL' then
    update public.user_missions
    set status = 'AVAILABLE',
        progress_minutes = 0,
        started_at = null,
        completed_at = null,
        failure_reason = null,
        updated_at = now()
    where id = v_user_mission.id
    returning * into v_user_mission;

    v_feedback := '미션 참여를 취소했어요.';
  elsif v_action = 'RESET' then
    update public.aircon_status
    set device_name = '거실 Carrier All New 에어로 18단',
        power_on = true,
        mode = 'COOL',
        target_temperature_c = 26,
        fan_mode = 'AUTO',
        usage_minutes = 0,
        filter_status = 'NORMAL',
        sensor_status = 'NORMAL',
        updated_at = now()
    where user_id = v_user_id
    returning * into v_aircon;

    update public.user_missions
    set status = 'AVAILABLE',
        progress_minutes = 0,
        started_at = null,
        completed_at = null,
        failure_reason = null,
        updated_at = now()
    where id = v_user_mission.id
    returning * into v_user_mission;

    v_feedback := '에어컨과 미션을 초기화했어요. 이미 지급된 포인트는 유지됩니다.';
  else
    if v_aircon.power_on then
      update public.aircon_status
      set usage_minutes = usage_minutes + 30,
          updated_at = now()
      where user_id = v_user_id
      returning * into v_aircon;
    end if;

    if v_user_mission.status = 'ACTIVE' then
      v_failure_reason := concat_ws(', ',
        case when not v_aircon.power_on then '에어컨 전원이 꺼져 있어요' end,
        case when v_aircon.mode <> 'COOL' then '냉방 모드가 아니에요' end,
        case when v_aircon.target_temperature_c < v_mission.target_temperature_c
          then format('설정 온도가 %s°C보다 낮아요', v_mission.target_temperature_c) end,
        case when v_aircon.filter_status <> 'NORMAL' or v_aircon.sensor_status <> 'NORMAL'
          then '필터 점검 또는 센서 오류가 있어요' end
      );

      if v_failure_reason <> '' then
        update public.user_missions
        set status = 'FAILED',
            failure_reason = v_failure_reason,
            updated_at = now()
        where id = v_user_mission.id
        returning * into v_user_mission;

        v_feedback := '조건 위반으로 미션이 실패했어요: ' || v_failure_reason;
      else
        update public.user_missions
        set progress_minutes = least(progress_minutes + 30, v_mission.target_minutes),
            status = case
              when progress_minutes + 30 >= v_mission.target_minutes then 'SUCCESS'
              else 'ACTIVE'
            end,
            completed_at = case
              when progress_minutes + 30 >= v_mission.target_minutes then now()
              else completed_at
            end,
            failure_reason = null,
            updated_at = now()
        where id = v_user_mission.id
        returning * into v_user_mission;

        if v_user_mission.status = 'SUCCESS' then
          select profile.*
          into v_profile
          from public.profiles as profile
          where profile.id = v_user_id
          for update;

          insert into public.point_transactions (
            user_id,
            transaction_type,
            amount,
            balance_after,
            source_type,
            source_id,
            title,
            description
          )
          values (
            v_user_id,
            'EARN',
            v_mission.reward_points,
            v_profile.current_points + v_mission.reward_points,
            'MISSION',
            v_user_mission.id::text,
            'GREEN MISSION 성공',
            v_mission.title
          )
          on conflict (user_id, source_type, source_id)
            where source_id is not null
          do nothing
          returning id into v_point_transaction_id;

          if v_point_transaction_id is not null then
            select coalesce(sum(point.amount), 0)
            into v_lifetime_points
            from public.point_transactions as point
            where point.user_id = v_user_id
              and point.transaction_type = 'EARN';

            select level.id
            into v_level_id
            from public.green_levels as level
            where v_lifetime_points >= level.min_points
              and (level.max_points is null or v_lifetime_points < level.max_points)
            order by level.sort_order desc
            limit 1;

            update public.profiles
            set current_points = current_points + v_mission.reward_points,
                green_level_id = coalesce(v_level_id, green_level_id),
                updated_at = now()
            where id = v_user_id
            returning * into v_profile;

            v_reward_awarded := true;
          end if;

          v_feedback := format(
            '%s분 친환경 냉방을 완료해 GREEN MISSION에 성공했어요!',
            v_mission.target_minutes
          );
        else
          v_feedback := format(
            '조건을 잘 지켰어요. 현재 %s/%s분입니다.',
            v_user_mission.progress_minutes,
            v_mission.target_minutes
          );
        end if;
      end if;
    elsif v_user_mission.status = 'AVAILABLE' then
      v_feedback := '에어컨 시간은 진행됐지만 미션에는 아직 참여하지 않았어요.';
    elsif v_user_mission.status = 'SUCCESS' then
      v_feedback := '오늘의 미션은 이미 성공했어요.';
    else
      v_feedback := '미션 화면에서 다시 도전한 뒤 시간을 진행해 주세요.';
    end if;
  end if;

  if v_profile.id is null then
    select profile.*
    into v_profile
    from public.profiles as profile
    where profile.id = v_user_id;
  end if;

  return jsonb_build_object(
    'mission', to_jsonb(v_user_mission),
    'aircon', to_jsonb(v_aircon),
    'reward_awarded', v_reward_awarded,
    'balance_after', v_profile.current_points,
    'feedback', v_feedback
  );
end;
$$;

create or replace function public.purchase_green_reward(
  p_reward_id text,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_reward public.rewards%rowtype;
  v_profile public.profiles%rowtype;
  v_existing_order public.reward_orders%rowtype;
  v_point_transaction_id bigint;
  v_order public.reward_orders%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'AUTH_REQUIRED';
  end if;

  if p_request_id is null then
    raise exception using errcode = '22023', message = 'REQUEST_ID_REQUIRED';
  end if;

  select reward.*
  into v_reward
  from public.rewards as reward
  where reward.id = p_reward_id
    and reward.is_active = true;

  if not found then
    raise exception using errcode = 'P0002', message = 'REWARD_NOT_FOUND';
  end if;

  insert into public.profiles (id, display_name)
  values (v_user_id, 'GreenON 사용자')
  on conflict (id) do nothing;

  select profile.*
  into v_profile
  from public.profiles as profile
  where profile.id = v_user_id
  for update;

  select reward_order.*
  into v_existing_order
  from public.reward_orders as reward_order
  join public.point_transactions as point
    on point.id = reward_order.point_transaction_id
  where point.user_id = v_user_id
    and point.source_type = 'REWARD'
    and point.source_id = p_request_id::text;

  if found then
    if v_existing_order.reward_id <> p_reward_id then
      raise exception using errcode = '22023', message = 'REQUEST_ID_REUSED';
    end if;

    return jsonb_build_object(
      'order', to_jsonb(v_existing_order),
      'balance_after', v_profile.current_points,
      'already_processed', true
    );
  end if;

  if v_profile.current_points < v_reward.price_points then
    raise exception using errcode = 'P0001', message = 'INSUFFICIENT_POINTS';
  end if;

  update public.profiles
  set current_points = current_points - v_reward.price_points,
      updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  insert into public.point_transactions (
    user_id,
    transaction_type,
    amount,
    balance_after,
    source_type,
    source_id,
    title,
    description
  )
  values (
    v_user_id,
    'SPEND',
    v_reward.price_points,
    v_profile.current_points,
    'REWARD',
    p_request_id::text,
    '리워드 구매 · ' || v_reward.name,
    v_reward.category || ' 카테고리'
  )
  returning id into v_point_transaction_id;

  insert into public.reward_orders (
    user_id,
    reward_id,
    point_transaction_id,
    price_paid
  )
  values (
    v_user_id,
    v_reward.id,
    v_point_transaction_id,
    v_reward.price_points
  )
  returning * into v_order;

  return jsonb_build_object(
    'order', to_jsonb(v_order),
    'balance_after', v_profile.current_points,
    'already_processed', false
  );
end;
$$;

-- 함수는 기본적으로 모든 역할이 실행할 수 있으므로 공개·비로그인 권한을 반드시 제거합니다.
revoke execute on function public.perform_green_mission_action(text, text) from public, anon;
revoke execute on function public.purchase_green_reward(text, uuid) from public, anon;
grant execute on function public.perform_green_mission_action(text, text) to authenticated;
grant execute on function public.purchase_green_reward(text, uuid) to authenticated;

comment on function public.perform_green_mission_action(text, text) is
  '인증 사용자 자신의 오늘 미션을 진행하고 성공 보상을 원자적으로 지급합니다.';
comment on function public.purchase_green_reward(text, uuid) is
  '인증 사용자 자신의 포인트로 리워드를 원자적으로 구매하며 요청 ID로 중복 구매를 막습니다.';

commit;
