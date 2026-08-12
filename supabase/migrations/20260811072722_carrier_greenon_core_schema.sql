begin;

-- GREEN LEVEL 기준은 공개 참조 데이터이며 사용자가 직접 변경할 수 없습니다.
create table public.green_levels (
  id text primary key,
  name text not null unique,
  min_points bigint not null check (min_points >= 0),
  max_points bigint check (max_points is null or max_points > min_points),
  description text not null,
  sort_order smallint not null unique check (sort_order > 0),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  current_points bigint not null default 0 check (current_points >= 0),
  green_level_id text not null default 'green_seed'
    references public.green_levels (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.missions (
  id text primary key,
  title text not null,
  description text not null,
  target_temperature_c smallint not null check (target_temperature_c between 18 and 30),
  target_minutes smallint not null check (target_minutes > 0),
  reward_points bigint not null check (reward_points > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_missions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  mission_id text not null references public.missions (id),
  mission_date date not null default ((now() at time zone 'Asia/Seoul')::date),
  status text not null default 'AVAILABLE'
    check (status in ('AVAILABLE', 'ACTIVE', 'SUCCESS', 'FAILED')),
  progress_minutes smallint not null default 0
    check (progress_minutes between 0 and 1440),
  started_at timestamptz,
  completed_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mission_id, mission_date)
);

create table public.point_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  transaction_type text not null check (transaction_type in ('EARN', 'SPEND')),
  amount bigint not null check (amount > 0),
  balance_after bigint not null check (balance_after >= 0),
  source_type text not null,
  source_id text,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.rewards (
  id text primary key,
  category text not null check (category in ('FOOD', 'LIFE', 'CARRIER')),
  name text not null,
  description text not null,
  price_points bigint not null check (price_points > 0),
  icon_name text not null,
  color_tone text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reward_orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  reward_id text not null references public.rewards (id),
  point_transaction_id bigint unique
    references public.point_transactions (id),
  price_paid bigint not null check (price_paid > 0),
  status text not null default 'COMPLETED'
    check (status in ('COMPLETED', 'CANCELLED')),
  ordered_at timestamptz not null default now()
);

create table public.aircon_status (
  user_id uuid primary key references auth.users (id) on delete cascade,
  device_name text not null default '거실 Carrier',
  power_on boolean not null default true,
  mode text not null default 'COOL' check (mode in ('COOL', 'DRY', 'FAN')),
  target_temperature_c smallint not null default 26
    check (target_temperature_c between 18 and 30),
  fan_mode text not null default 'AUTO' check (fan_mode in ('AUTO', 'LOW', 'HIGH')),
  usage_minutes integer not null default 0 check (usage_minutes >= 0),
  filter_status text not null default 'NORMAL'
    check (filter_status in ('NORMAL', 'CHECK')),
  sensor_status text not null default 'NORMAL'
    check (sensor_status in ('NORMAL', 'ERROR')),
  updated_at timestamptz not null default now()
);

-- 외래키 조회와 사용자별 최신 기록 조회를 위한 인덱스입니다.
create index profiles_green_level_id_idx on public.profiles (green_level_id);
create index user_missions_mission_id_idx on public.user_missions (mission_id);
create index user_missions_user_created_idx
  on public.user_missions (user_id, created_at desc);
create index point_transactions_user_created_idx
  on public.point_transactions (user_id, created_at desc);
create unique index point_transactions_user_source_uidx
  on public.point_transactions (user_id, source_type, source_id)
  where source_id is not null;
create index reward_orders_user_ordered_idx
  on public.reward_orders (user_id, ordered_at desc);
create index reward_orders_reward_id_idx on public.reward_orders (reward_id);

-- 앱에서 사용하는 기본 레벨, 미션, 리워드 데이터를 저장합니다.
insert into public.green_levels (id, name, min_points, max_points, description, sort_order)
values
  ('green_seed', 'GREEN SEED', 0, 300, '첫 친환경 냉방 미션을 시작해 작은 씨앗을 깨워 보세요.', 1),
  ('green_sprout', 'GREEN SPROUT', 300, 1000, '꾸준한 적정 냉방 습관으로 푸른 새싹이 자라고 있어요.', 2),
  ('green_leaf', 'GREEN LEAF', 1000, 2500, '에너지 절약을 일상으로 만든 멋진 GreenON 실천가예요.', 3),
  ('green_forest', 'GREEN FOREST', 2500, null, '친환경 냉방 습관으로 나만의 푸른 숲을 완성했어요.', 4);

insert into public.missions (
  id,
  title,
  description,
  target_temperature_c,
  target_minutes,
  reward_points
)
values (
  'cooling-26-60',
  '26°C 지키고 시원하게 절약하기',
  '에너지 사용은 줄이고 건강한 냉방 습관을 만들어 보세요.',
  26,
  60,
  300
);

insert into public.rewards (
  id,
  category,
  name,
  description,
  price_points,
  icon_name,
  color_tone
)
values
  ('food-zero-iced-tea', 'FOOD', '제로 아이스티 교환권', '가볍고 시원한 무가당 아이스티 한 잔으로 미션 성공을 축하해요.', 200, 'cup', 'sky'),
  ('food-green-salad', 'FOOD', '그린 샐러드 교환권', '신선한 채소로 채운 한 끼를 가까운 제휴 매장에서 이용해 보세요.', 600, 'leaf', 'green'),
  ('life-reusable-pouch', 'LIFE', '리유저블 멀티 파우치', '재활용 원단으로 만든 가벼운 파우치로 작은 물건을 정리해요.', 500, 'bag', 'violet'),
  ('life-eco-bag', 'LIFE', 'GreenON 데일리 에코백', '일상에서 비닐 사용을 줄여 주는 튼튼한 친환경 에코백입니다.', 800, 'bag', 'green'),
  ('carrier-filter-care', 'CARRIER', '캐리어 필터 케어 쿠폰', '쾌적한 냉방을 위한 캐리어 에어컨 필터 케어 할인 쿠폰입니다.', 1200, 'filter', 'blue'),
  ('carrier-cleaning', 'CARRIER', '에어컨 전문 세척 할인권', '캐리어 전문 엔지니어의 에어컨 세척 서비스에 사용할 수 있어요.', 2500, 'snow', 'sky');

-- public은 노출 스키마이므로 모든 테이블에서 RLS를 명시적으로 활성화합니다.
alter table public.green_levels enable row level security;
alter table public.profiles enable row level security;
alter table public.missions enable row level security;
alter table public.user_missions enable row level security;
alter table public.point_transactions enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_orders enable row level security;
alter table public.aircon_status enable row level security;

-- 기본 권한을 제거한 뒤 앱에 필요한 최소 권한만 다시 부여합니다.
revoke all on table public.green_levels from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.missions from anon, authenticated;
revoke all on table public.user_missions from anon, authenticated;
revoke all on table public.point_transactions from anon, authenticated;
revoke all on table public.rewards from anon, authenticated;
revoke all on table public.reward_orders from anon, authenticated;
revoke all on table public.aircon_status from anon, authenticated;

grant select on table public.green_levels to authenticated;
grant select on table public.missions to authenticated;
grant select on table public.rewards to authenticated;

grant select on table public.profiles to authenticated;
grant insert (id, display_name) on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;

grant select, insert on table public.user_missions to authenticated;
grant update (
  status,
  progress_minutes,
  started_at,
  completed_at,
  failure_reason,
  updated_at
) on table public.user_missions to authenticated;
grant usage, select on sequence public.user_missions_id_seq to authenticated;

grant select on table public.point_transactions to authenticated;
grant select on table public.reward_orders to authenticated;

grant select, insert on table public.aircon_status to authenticated;
grant update (
  device_name,
  power_on,
  mode,
  target_temperature_c,
  fan_mode,
  usage_minutes,
  filter_status,
  sensor_status,
  updated_at
) on table public.aircon_status to authenticated;

-- 참조 데이터는 로그인 사용자에게 읽기만 허용합니다.
create policy "authenticated users can read green levels"
on public.green_levels for select
to authenticated
using (true);

create policy "authenticated users can read missions"
on public.missions for select
to authenticated
using (true);

create policy "authenticated users can read rewards"
on public.rewards for select
to authenticated
using (true);

-- 사용자 데이터는 모든 정책에서 auth.uid()와 소유자 ID를 함께 검사합니다.
create policy "users can read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "users can create own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "users can update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "users can read own missions"
on public.user_missions for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users can create own missions"
on public.user_missions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users can update own missions"
on public.user_missions for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users can read own point transactions"
on public.point_transactions for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users can read own reward orders"
on public.reward_orders for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users can read own aircon status"
on public.aircon_status for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users can create own aircon status"
on public.aircon_status for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users can update own aircon status"
on public.aircon_status for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

commit;
