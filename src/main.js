import './styles.css';
import { hasSupabaseConfig, supabase } from './supabase.js';
import {
  SAMPLE_WEATHER,
  fetchCurrentWeather,
  getWeatherMissionGuide,
  getWeatherPresentation,
} from './weather.js';

// 앱의 화면 구조를 한곳에서 관리합니다. 이후 단계에서 각 화면에 실제 기능을 연결합니다.
const pages = {
  home: {
    eyebrow: '오늘도 가볍게 Green ON!',
    title: '시원함은 그대로,\n지구는 더 가볍게',
    description: '캐리어 에어컨과 함께 친환경 냉방 습관을 만들어 보세요.',
  },
  mission: {
    eyebrow: 'GREEN MISSION',
    title: '오늘의 작은 실천이\n큰 변화를 만들어요',
    description: '적정 냉방 습관으로 에너지를 아끼고 GREEN POINT를 모아 보세요.',
  },
  wallet: {
    eyebrow: 'GREEN WALLET',
    title: '좋은 습관만큼\n포인트도 차곡차곡',
    description: '포인트 적립 및 사용 내역은 추후 단계에서 연결됩니다.',
  },
  shop: {
    eyebrow: 'GREEN REWARD',
    title: '모은 마음을\n기분 좋은 보상으로',
    description: '리워드 상품과 구매 기능은 추후 단계에서 연결됩니다.',
  },
  my: {
    eyebrow: 'MY GREENON',
    title: '나의 친환경 기록을\n한눈에 확인해요',
    description: '나의 GREEN LEVEL과 친환경 냉방 기록을 한눈에 확인해 보세요.',
  },
};

const icons = {
  leaf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.8 4.2C14.4 4.1 8.1 5.6 5.4 9.7c-2 3.1-.7 6.6 1.2 8.4 1.8-4.8 5.2-7.5 9.7-9.6-3.7 2.8-6.2 5.7-7.2 9.1 2.5.7 5.6-.1 7.3-2.5 2.8-3.9 2.3-8.2 3.4-10.9Z"/></svg>',
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z"/></svg>',
  mission: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v3H8V4Zm-2 2H5v15h14V6h-1v3H6V6Zm3 7 2 2 4-4 1.5 1.5L11 18l-3.5-3.5L9 13Z"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H18v3H6.5a.5.5 0 0 0 0 1H20v12H6a2 2 0 0 1-2-2V6.5ZM16 12a2 2 0 1 0 0 4h2v-4h-2Z"/></svg>',
  shop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 12H4L5 8Zm4 2v2a3 3 0 0 0 6 0v-2h-2v2a1 1 0 0 1-2 0v-2H9Zm0-3a3 3 0 0 1 6 0h-2a1 1 0 0 0-2 0H9Z"/></svg>',
  my: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0H5Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10a4 4 0 0 0 .6-8A6 6 0 0 0 6.2 9.2 4.5 4.5 0 0 0 7 18Z"/></svg>',
  rain: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 15h10a4 4 0 0 0 .6-8A6 6 0 0 0 6.2 6.2 4.5 4.5 0 0 0 7 15Zm1 3-1 2m5-2-1 2m5-2-1 2"/></svg>',
  air: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v7H4V6Zm3 10c1.5 0 1.5 2 3 2s1.5-2 3-2 1.5 2 3 2 1.5-2 3-2"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>',
  thermometer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14.8V5a2 2 0 1 1 4 0v9.8a4 4 0 1 1-4 0Z"/><path d="M12 8v8"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Zm6 11 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z"/></svg>',
  power: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v9"/><path d="M7.2 6.8a7 7 0 1 0 9.6 0"/></svg>',
  fan: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M12 10c-1-5 1-7 3-6 2 1 1 5-1 7M14 12c5-1 7 1 6 3-1 2-5 1-7-1M12 14c1 5-1 7-3 6-2-1-1-5 1-7M10 12c-5 1-7-1-6-3 1-2 5-1 7 1"/></svg>',
  filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5V5Zm4 0v14m6-14v14M5 9h14M5 15h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 3 20h18L12 4Z"/><path d="M12 9v5m0 3v.1"/></svg>',
  cup: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h11v9a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V7Zm11 2h2a2 2 0 0 1 0 4h-2M8 3v2m4-2v2"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 12H4L5 8Zm4 1V7a3 3 0 0 1 6 0v2"/></svg>',
  snow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M4 7l16 10M20 7 4 17M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4 1-1-4m13 7-4-1 1 4M17 7l-1 4 4-1M7 17l1-4-4 1"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2M5 10h14v10H5V10Zm7 4v2"/></svg>',
  chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9m7 10V5m7 14v-7M3 20h18"/></svg>',
  logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5m4-3 4-4-4-4m4 4H9"/></svg>',
};

let TODAY_MISSION = {
  id: 'cooling-26-60',
  title: '26°C 지키고 시원하게 절약하기',
  description: '에너지 사용은 줄이고 건강한 냉방 습관을 만들어 보세요.',
  targetTemperature: 26,
  targetMinutes: 60,
  rewardPoints: 300,
};

let weatherState = {
  ...SAMPLE_WEATHER,
  status: 'loading',
  error: null,
};

// 상품 목록은 로그인 후 Supabase rewards 테이블에서만 불러옵니다.
let REWARD_PRODUCTS = [];

const CATEGORY_LABELS = {
  ALL: '전체',
  FOOD: 'FOOD',
  LIFE: 'LIFE',
  CARRIER: 'CARRIER',
};

// 한국 날짜를 기준으로 오늘의 미션 참여 상태를 구분합니다.
function getKoreanDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function createInitialMissionState() {
  return {
    recordId: null,
    missionId: TODAY_MISSION.id,
    date: getKoreanDateKey(),
    status: 'available',
    progressMinutes: 0,
    startedAt: null,
    completedAt: null,
    failureReason: null,
  };
}

let missionState = createInitialMissionState();

function createInitialAirconState() {
  return {
    deviceName: '거실 Carrier All New 에어로 18단',
    power: true,
    mode: 'COOL',
    temperature: 26,
    fan: 'AUTO',
    usageMinutes: 0,
    filterStatus: 'NORMAL',
    sensorStatus: 'NORMAL',
    updatedAt: new Date().toISOString(),
  };
}

let airconState = createInitialAirconState();

function createInitialPointState() {
  return {
    balance: 0,
    awardedMissionKeys: [],
    transactions: [],
  };
}

let pointState = createInitialPointState();
let walletFilter = 'ALL';
let rewardOrders = [];
let profileState = null;
let greenLevels = [];
let shopCategory = 'ALL';
let selectedRewardId = null;

// 인증 상태는 Supabase가 확인한 사용자 정보만 신뢰합니다.
// 사용자 권한 판단에 수정 가능한 user_metadata를 사용하지 않습니다.
let authUser = null;
let authMode = 'LOGIN';
let authLoading = false;
let dataLoading = false;
let authSyncVersion = 0;

function createOrderId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function mapMissionRecord(record) {
  if (!record) return createInitialMissionState();
  return {
    recordId: record.id,
    missionId: record.mission_id,
    date: record.mission_date,
    status: String(record.status || 'AVAILABLE').toLowerCase(),
    progressMinutes: Number(record.progress_minutes) || 0,
    startedAt: record.started_at,
    completedAt: record.completed_at,
    failureReason: record.failure_reason,
  };
}

function mapAirconRecord(record) {
  if (!record) return createInitialAirconState();
  return {
    deviceName: record.device_name,
    power: record.power_on,
    mode: record.mode,
    temperature: Number(record.target_temperature_c),
    fan: record.fan_mode,
    usageMinutes: Number(record.usage_minutes) || 0,
    filterStatus: record.filter_status,
    sensorStatus: record.sensor_status,
    updatedAt: record.updated_at,
  };
}

function mapPointTransaction(record) {
  return {
    id: String(record.id),
    type: record.transaction_type,
    amount: Number(record.amount),
    balanceAfter: Number(record.balance_after),
    sourceType: record.source_type,
    sourceId: record.source_id,
    title: record.title,
    description: record.description || '',
    createdAt: record.created_at,
  };
}

function resetSupabaseState() {
  missionState = createInitialMissionState();
  airconState = createInitialAirconState();
  pointState = createInitialPointState();
  rewardOrders = [];
  profileState = null;
  greenLevels = [];
  REWARD_PRODUCTS = [];
  selectedRewardId = null;
}

function requireAuth(actionLabel) {
  if (authUser && supabase) return true;
  showPage('my');
  setAuthMode('LOGIN');
  setAuthFeedback(`${actionLabel} 기능은 로그인 후 사용할 수 있어요.`, 'danger');
  return false;
}

async function ensureProfile(user) {
  const metadataName = user?.user_metadata?.display_name;
  const displayName =
    (typeof metadataName === 'string' && metadataName.trim()) ||
    user?.email?.split('@')[0] ||
    'GreenON 사용자';

  const existing = await supabase
    .from('profiles')
    .select('id, display_name, current_points, green_level_id, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;

  const inserted = await supabase
    .from('profiles')
    .insert({ id: user.id, display_name: displayName.slice(0, 30) })
    .select('id, display_name, current_points, green_level_id, created_at, updated_at')
    .maybeSingle();
  if (inserted.error && inserted.error.code !== '23505') throw inserted.error;
  if (inserted.data) return inserted.data;

  const retried = await supabase
    .from('profiles')
    .select('id, display_name, current_points, green_level_id, created_at, updated_at')
    .eq('id', user.id)
    .single();
  if (retried.error) throw retried.error;
  return retried.data;
}

async function ensureAircon(userId) {
  const existing = await supabase.from('aircon_status').select('*').eq('user_id', userId).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;

  const initial = createInitialAirconState();
  const inserted = await supabase
    .from('aircon_status')
    .insert({
      user_id: userId,
      device_name: initial.deviceName,
      power_on: initial.power,
      mode: initial.mode,
      target_temperature_c: initial.temperature,
      fan_mode: initial.fan,
      usage_minutes: initial.usageMinutes,
      filter_status: initial.filterStatus,
      sensor_status: initial.sensorStatus,
    })
    .select('*')
    .maybeSingle();
  if (inserted.error && inserted.error.code !== '23505') throw inserted.error;
  if (inserted.data) return inserted.data;

  const retried = await supabase.from('aircon_status').select('*').eq('user_id', userId).single();
  if (retried.error) throw retried.error;
  return retried.data;
}

function mapRewardOrder(record, products = REWARD_PRODUCTS) {
  const product = products.find((item) => item.id === record.reward_id);
  return {
    id: String(record.id),
    productId: record.reward_id,
    productName: product?.name || 'GREEN REWARD',
    category: product?.category || 'LIFE',
    price: Number(record.price_paid),
    status: record.status,
    createdAt: record.ordered_at,
  };
}

async function fetchWalletAndOrders(userId, products = REWARD_PRODUCTS) {
  const [pointsResult, ordersResult, profileResult] = await Promise.all([
    supabase.from('point_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('reward_orders').select('*').eq('user_id', userId).order('ordered_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, display_name, current_points, green_level_id, created_at, updated_at')
      .eq('id', userId)
      .single(),
  ]);
  if (pointsResult.error) throw pointsResult.error;
  if (ordersResult.error) throw ordersResult.error;
  if (profileResult.error) throw profileResult.error;

  const transactions = pointsResult.data.map(mapPointTransaction);
  return {
    profile: profileResult.data,
    pointState: {
      balance: Number(profileResult.data.current_points) || 0,
      awardedMissionKeys: transactions
        .filter((transaction) => transaction.type === 'EARN' && transaction.sourceType === 'MISSION')
        .map((transaction) => transaction.sourceId),
      transactions,
    },
    orders: ordersResult.data.map((order) => mapRewardOrder(order, products)),
  };
}

async function refreshWalletAndOrders(userId = authUser?.id) {
  if (!userId || authUser?.id !== userId) return;
  const walletData = await fetchWalletAndOrders(userId);
  if (authUser?.id !== userId) return;
  profileState = walletData.profile;
  pointState = walletData.pointState;
  rewardOrders = walletData.orders;
}

async function loadSupabaseDataForUser(user, version) {
  dataLoading = true;
  renderAll();

  try {
    const profile = await ensureProfile(user);
    const [missionResult, rewardsResult, levelsResult] = await Promise.all([
      supabase.from('missions').select('*').eq('is_active', true).order('created_at').limit(1).maybeSingle(),
      supabase.from('rewards').select('*').eq('is_active', true).order('created_at'),
      supabase.from('green_levels').select('*').order('sort_order'),
    ]);
    if (missionResult.error) throw missionResult.error;
    if (rewardsResult.error) throw rewardsResult.error;
    if (levelsResult.error) throw levelsResult.error;
    if (!missionResult.data) throw new Error('활성 GREEN MISSION이 없습니다.');

    const mission = missionResult.data;
    const products = rewardsResult.data.map((reward) => ({
      id: reward.id,
      category: reward.category,
      name: reward.name,
      description: reward.description,
      price: Number(reward.price_points),
      icon: reward.icon_name,
      tone: reward.color_tone,
    }));

    const [userMissionResult, aircon, walletData] = await Promise.all([
      supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('mission_id', mission.id)
        .eq('mission_date', getKoreanDateKey())
        .maybeSingle(),
      ensureAircon(user.id),
      fetchWalletAndOrders(user.id, products),
    ]);
    if (userMissionResult.error) throw userMissionResult.error;

    if (version !== authSyncVersion || authUser?.id !== user.id) return;

    TODAY_MISSION = {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      targetTemperature: Number(mission.target_temperature_c),
      targetMinutes: Number(mission.target_minutes),
      rewardPoints: Number(mission.reward_points),
    };
    REWARD_PRODUCTS = products;
    greenLevels = levelsResult.data;
    profileState = walletData.profile || profile;
    missionState = userMissionResult.data
      ? mapMissionRecord(userMissionResult.data)
      : createInitialMissionState();
    airconState = mapAirconRecord(aircon);
    pointState = walletData.pointState;
    rewardOrders = walletData.orders;
  } catch (error) {
    if (version === authSyncVersion) {
      console.error('Supabase 사용자 데이터를 불러오지 못했습니다.', error);
      setAuthFeedback('사용자 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.', 'danger');
    }
  } finally {
    if (version === authSyncVersion) {
      dataLoading = false;
      renderAll();
    }
  }
}

async function synchronizeAuthUser(user) {
  const version = ++authSyncVersion;
  authUser = user ?? null;

  if (!authUser) {
    dataLoading = false;
    resetSupabaseState();
    renderAll();
    return;
  }

  await loadSupabaseDataForUser(authUser, version);
}

async function persistAirconState(previousState) {
  const { data, error } = await supabase
    .from('aircon_status')
    .update({
      device_name: airconState.deviceName,
      power_on: airconState.power,
      mode: airconState.mode,
      target_temperature_c: airconState.temperature,
      fan_mode: airconState.fan,
      usage_minutes: airconState.usageMinutes,
      filter_status: airconState.filterStatus,
      sensor_status: airconState.sensorStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', authUser.id)
    .select('*')
    .single();

  if (error) {
    airconState = previousState;
    renderAll();
    const feedback = document.querySelector('#simulation-feedback');
    feedback.textContent = '에어컨 상태를 저장하지 못했어요. 네트워크 연결을 확인해 주세요.';
    feedback.classList.add('is-danger');
    return false;
  }

  airconState = mapAirconRecord(data);
  renderAll();
  return true;
}

async function performMissionAction(action) {
  if (!requireAuth('GREEN MISSION')) return null;
  const { data, error } = await supabase.rpc('perform_green_mission_action', {
    p_action: action,
    p_mission_id: TODAY_MISSION.id,
  });

  const feedback = document.querySelector('#simulation-feedback');
  if (error) {
    console.error('GREEN MISSION 상태를 저장하지 못했습니다.', error);
    feedback.textContent = '미션 상태를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.';
    feedback.classList.add('is-danger');
    return null;
  }

  missionState = mapMissionRecord(data.mission);
  airconState = mapAirconRecord(data.aircon);
  pointState.balance = Number(data.balance_after) || 0;
  feedback.textContent = data.feedback || '미션 상태를 저장했어요.';
  feedback.classList.toggle('is-danger', missionState.status === 'failed');

  if (data.reward_awarded || missionState.status === 'success') {
    await refreshWalletAndOrders();
  }
  renderAll();
  return data;
}

const MODE_LABELS = {
  COOL: '냉방',
  DRY: '제습',
  FAN: '송풍',
};

const FAN_LABELS = {
  AUTO: '자동',
  LOW: '약풍',
  HIGH: '강풍',
};

// 미션에 필요한 에어컨 조건을 한곳에서 판정합니다.
// 다음 Supabase 단계에서도 서버에서 읽은 상태를 같은 형태로 넣을 수 있습니다.
function getMissionConditionResult() {
  const checks = [
    {
      id: 'power',
      label: 'POWER가 켜져 있어요',
      failure: '에어컨 전원이 꺼져 있어요',
      passed: airconState.power,
    },
    {
      id: 'mode',
      label: '냉방 모드로 운전 중이에요',
      failure: '냉방 모드가 아니에요',
      passed: airconState.mode === 'COOL',
    },
    {
      id: 'temperature',
      label: `설정 온도가 ${TODAY_MISSION.targetTemperature}°C 이상이에요`,
      failure: `설정 온도가 ${TODAY_MISSION.targetTemperature}°C보다 낮아요`,
      passed: airconState.temperature >= TODAY_MISSION.targetTemperature,
    },
    {
      id: 'filter',
      label: '필터와 센서가 정상이에요',
      failure: '필터 점검 또는 센서 오류가 있어요',
      passed:
        airconState.filterStatus === 'NORMAL' && airconState.sensorStatus === 'NORMAL',
    },
  ];

  const failedChecks = checks.filter((check) => !check.passed);
  return {
    checks,
    isValid: failedChecks.length === 0,
    reason: failedChecks.map((check) => check.failure).join(', '),
  };
}

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#home" aria-label="Carrier GreenON 홈" data-go-home>
        <span class="brand-mark">${icons.leaf}</span>
        <span>Carrier <strong>GreenON</strong></span>
      </a>
      <button class="profile-button" id="profile-button" type="button" aria-label="MY GreenON 열기">
        ${icons.my}
      </button>
    </header>

    <main id="main-content">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow" id="page-eyebrow">${pages.home.eyebrow}</p>
          <h1 id="hero-title">${pages.home.title.replace('\n', '<br />')}</h1>
          <p class="hero-description" id="page-description">${pages.home.description}</p>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <span class="orbit orbit-one"></span>
          <span class="orbit orbit-two"></span>
          <div class="logo-bubble">
            ${icons.leaf}
          </div>
          <span class="eco-badge">ECO<br /><strong>ON</strong></span>
        </div>
      </section>

      <section class="dashboard" id="home-dashboard" aria-label="오늘의 GreenON 요약">
        <article class="status-card weather-card" id="weather-card">
          <div class="card-heading">
            <div>
              <span class="card-label">현재 날씨</span>
              <h2 id="weather-title">서울, 날씨 확인 중</h2>
            </div>
            <span class="weather-icon" id="weather-icon">${icons.sun}</span>
          </div>
          <div class="weather-value">
            <strong id="weather-temperature">28°C</strong>
            <span id="weather-humidity">습도 54%</span>
          </div>
          <p class="weather-apparent" id="weather-apparent">체감온도 30°C</p>
          <p class="preview-note" id="weather-source">샘플 날씨로 화면을 준비하고 있어요.</p>
        </article>

        <article class="status-card aircon-card" id="home-aircon-card">
          <div class="card-heading">
            <div>
              <span class="card-label">나의 에어컨</span>
              <h2 id="home-aircon-name">거실 Carrier</h2>
            </div>
            <span class="air-icon">${icons.air}</span>
          </div>
          <div class="device-status">
            <span class="status-dot" id="home-aircon-dot"></span>
            <span id="home-aircon-status">정상 운전 중</span>
          </div>
          <p class="aircon-summary" id="home-aircon-summary">POWER ON · 냉방 26°C · FAN 자동</p>
        </article>

        <article class="mission-preview" id="home-mission-card">
          <div class="mission-copy">
            <span class="card-label">오늘의 GREEN MISSION</span>
            <h2 id="home-mission-title">${TODAY_MISSION.title}</h2>
            <p id="home-mission-description">적정 온도를 지키고 GREEN POINT를 모아 보세요.</p>
          </div>
          <button class="primary-button" id="view-mission-button" type="button">
            <span id="home-mission-button-label">미션 보러가기</span>
            ${icons.arrow}
          </button>
        </article>

        <article class="point-preview" id="home-point-card">
          <div class="point-icon">${icons.leaf}</div>
          <div>
            <span class="card-label">GREEN POINT</span>
            <strong id="home-point-balance">0 P</strong>
          </div>
          <button class="point-link-button" id="view-wallet-button" type="button">
            지갑 보기
            ${icons.arrow}
          </button>
        </article>

        <article class="aircon-simulator" id="aircon-simulator" aria-labelledby="simulator-title">
          <header class="simulator-heading">
            <div>
              <span class="card-label">VIRTUAL CARRIER IoT</span>
              <h2 id="simulator-title">에어컨 상태 시뮬레이션</h2>
              <p>실제 Carrier API가 아닌 학습용 가상 데이터입니다.</p>
            </div>
            <span class="simulator-live-badge" id="simulator-live-badge">
              <span></span> LIVE
            </span>
          </header>

          <div class="aircon-health" id="aircon-health" aria-live="polite">
            <span class="health-icon" id="aircon-health-icon">${icons.check}</span>
            <div>
              <strong id="aircon-health-title">에어컨 상태가 정상이에요</strong>
              <p id="aircon-health-description">미션에 도전하기 좋은 상태입니다.</p>
            </div>
          </div>

          <div class="aircon-readings" aria-label="가상 에어컨 현재 상태">
            <div><small>POWER</small><strong id="aircon-power-value">ON</strong></div>
            <div><small>MODE</small><strong id="aircon-mode-value">냉방</strong></div>
            <div><small>온도</small><strong id="aircon-temperature-value">26°C</strong></div>
            <div><small>FAN</small><strong id="aircon-fan-value">자동</strong></div>
            <div><small>사용시간</small><strong id="aircon-usage-value">0분</strong></div>
            <div><small>필터</small><strong id="aircon-filter-value">정상</strong></div>
          </div>

          <div class="simulator-controls">
            <div class="control-field">
              <span class="control-label">POWER</span>
              <button class="toggle-control" id="power-control" type="button" aria-pressed="true">
                ${icons.power}<span id="power-control-label">켜짐</span>
              </button>
            </div>

            <label class="control-field" for="mode-control">
              <span class="control-label">운전 MODE</span>
              <select id="mode-control">
                <option value="COOL">냉방</option>
                <option value="DRY">제습</option>
                <option value="FAN">송풍</option>
              </select>
            </label>

            <div class="control-field">
              <span class="control-label">설정온도</span>
              <div class="temperature-control">
                <button id="temperature-down" type="button" aria-label="설정온도 1도 내리기">−</button>
                <strong id="temperature-control-value">26°C</strong>
                <button id="temperature-up" type="button" aria-label="설정온도 1도 올리기">＋</button>
              </div>
            </div>

            <label class="control-field" for="fan-control">
              <span class="control-label">FAN 상태</span>
              <select id="fan-control">
                <option value="AUTO">자동</option>
                <option value="LOW">약풍</option>
                <option value="HIGH">강풍</option>
              </select>
            </label>

            <div class="control-field">
              <span class="control-label">필터 상태</span>
              <button class="toggle-control" id="filter-control" type="button" aria-pressed="false">
                ${icons.filter}<span id="filter-control-label">정상</span>
              </button>
            </div>

            <div class="control-field">
              <span class="control-label">센서 상태</span>
              <button class="toggle-control" id="sensor-control" type="button" aria-pressed="false">
                ${icons.spark}<span id="sensor-control-label">정상</span>
              </button>
            </div>
          </div>

          <div class="simulation-actions">
            <button class="simulate-button" id="simulate-30-button" type="button">
              ${icons.clock}
              시간 +30분 시뮬레이션
            </button>
            <button class="reset-simulation-button" id="reset-simulation-button" type="button">
              에어컨·미션 초기화
            </button>
          </div>
          <p class="simulation-feedback" id="simulation-feedback" aria-live="polite">
            미션에 참여한 후 +30분 버튼을 눌러 진행해 보세요.
          </p>
        </article>
      </section>

      <section class="mission-page" id="mission-page" aria-labelledby="mission-page-title" hidden>
        <header class="feature-heading">
          <div>
            <p class="eyebrow">GREEN MISSION</p>
            <h1 id="mission-page-title">오늘의 작은 실천이<br />큰 변화를 만들어요</h1>
          </div>
          <div class="mission-day-badge" aria-label="오늘의 미션">
            <span>TODAY</span>
            ${icons.leaf}
          </div>
        </header>

        <article class="mission-detail-card">
          <div class="mission-card-topline">
            <span class="mission-number">MISSION 01</span>
            <span class="mission-state-badge" id="mission-state-badge">참여 가능</span>
          </div>

          <div class="mission-title-row">
            <span class="mission-main-icon">${icons.thermometer}</span>
            <div>
              <h2 id="mission-detail-title">${TODAY_MISSION.title}</h2>
              <p id="mission-detail-description">${TODAY_MISSION.description}</p>
            </div>
          </div>

          <div class="mission-facts" aria-label="미션 정보">
            <div class="mission-fact">
              <span>${icons.thermometer}</span>
              <div><small>설정 온도</small><strong id="mission-target-temperature">${TODAY_MISSION.targetTemperature}°C 이상</strong></div>
            </div>
            <div class="mission-fact">
              <span>${icons.clock}</span>
              <div><small>유지 시간</small><strong id="mission-target-minutes">${TODAY_MISSION.targetMinutes}분</strong></div>
            </div>
            <div class="mission-fact reward-fact">
              <span>${icons.spark}</span>
              <div><small>성공 보상</small><strong id="mission-reward-points">${TODAY_MISSION.rewardPoints}P</strong></div>
            </div>
          </div>

          <div class="mission-condition-panel" id="mission-condition-panel">
            <div class="condition-heading">
              <div>
                <span class="card-label">LIVE CONDITION</span>
                <strong id="mission-condition-title">현재 조건을 확인하고 있어요</strong>
              </div>
              <span class="condition-state" id="mission-condition-state">확인 중</span>
            </div>
            <ul class="condition-list" id="mission-condition-list"></ul>
          </div>

          <div class="mission-progress-block">
            <div class="progress-heading">
              <div>
                <span class="card-label">MISSION PROGRESS</span>
                <strong id="mission-progress-label">0 / ${TODAY_MISSION.targetMinutes}분</strong>
              </div>
              <strong class="progress-percent" id="mission-progress-percent">0%</strong>
            </div>
            <div
              class="progress-track"
              id="mission-progress-track"
              role="progressbar"
              aria-label="미션 진행률"
              aria-valuemin="0"
              aria-valuemax="${TODAY_MISSION.targetMinutes}"
              aria-valuenow="0"
            >
              <span id="mission-progress-bar"></span>
            </div>
          </div>
        </article>

        <article class="mission-status-card" id="mission-status-card" tabindex="-1" aria-live="polite">
          <span class="status-illustration">${icons.leaf}</span>
          <div class="mission-status-copy">
            <span class="card-label" id="mission-status-kicker">READY</span>
            <h2 id="mission-status-title">미션을 시작할 준비가 됐어요</h2>
            <p id="mission-status-description">
              참여 버튼을 누르면 오늘의 미션 진행 상태가 저장됩니다.
            </p>
          </div>
          <div class="mission-actions">
            <button class="mission-start-button" id="mission-start-button" type="button">
              미션 참여하기
              ${icons.arrow}
            </button>
            <button class="mission-cancel-button" id="mission-cancel-button" type="button" hidden>
              참여 취소
            </button>
          </div>
        </article>

        <aside class="mission-guide" aria-label="미션 진행 안내">
          <span class="guide-number">IoT</span>
          <div>
            <strong>가상 에어컨으로 미션을 진행해 보세요</strong>
            <p>POWER ON · 냉방 · 26°C 이상 · 정상 필터/센서 조건을 맞춘 뒤 +30분을 눌러 주세요.</p>
          </div>
          <button class="open-simulator-button" id="open-simulator-button" type="button">
            시뮬레이터 열기
            ${icons.arrow}
          </button>
        </aside>
      </section>

      <section class="wallet-page" id="wallet-page" aria-labelledby="wallet-page-title" hidden>
        <header class="feature-heading wallet-heading">
          <div>
            <p class="eyebrow">GREEN WALLET</p>
            <h1 id="wallet-page-title">좋은 습관만큼<br />포인트도 차곡차곡</h1>
          </div>
          <div class="wallet-heading-icon" aria-hidden="true">${icons.wallet}</div>
        </header>

        <article class="wallet-balance-card" aria-label="현재 GREEN POINT">
          <div class="wallet-balance-topline">
            <div>
              <span class="wallet-balance-label">사용 가능한 GREEN POINT</span>
              <strong class="wallet-balance" id="wallet-balance">0 <small>P</small></strong>
            </div>
            <span class="wallet-leaf-mark">${icons.leaf}</span>
          </div>
          <p id="wallet-balance-message">GREEN MISSION을 완료하고 첫 포인트를 모아 보세요.</p>
          <div class="wallet-stats">
            <div>
              <span>총 적립</span>
              <strong id="wallet-earned-total">0P</strong>
            </div>
            <div>
              <span>총 사용</span>
              <strong id="wallet-spent-total">0P</strong>
            </div>
          </div>
        </article>

        <section class="wallet-history-card" aria-labelledby="wallet-history-title">
          <div class="wallet-history-heading">
            <div>
              <span class="card-label">POINT HISTORY</span>
              <h2 id="wallet-history-title">포인트 이용내역</h2>
            </div>
            <span class="history-count" id="wallet-history-count">0건</span>
          </div>

          <div class="history-filters" role="group" aria-label="포인트 내역 필터">
            <button class="history-filter is-active" type="button" data-wallet-filter="ALL" aria-pressed="true">
              전체
            </button>
            <button class="history-filter" type="button" data-wallet-filter="EARN" aria-pressed="false">
              적립
            </button>
            <button class="history-filter" type="button" data-wallet-filter="SPEND" aria-pressed="false">
              사용
            </button>
          </div>

          <ul class="transaction-list" id="transaction-list"></ul>
          <div class="wallet-empty" id="wallet-empty" aria-live="polite">
            <span>${icons.wallet}</span>
            <strong id="wallet-empty-title">아직 포인트 내역이 없어요</strong>
            <p id="wallet-empty-description">미션에 성공하면 적립 내역이 여기에 표시됩니다.</p>
          </div>
        </section>

        <aside class="wallet-guide">
          <span>${icons.spark}</span>
          <div>
            <strong>포인트 사용내역은 리워드 구매와 연결됩니다</strong>
            <p>리워드 상품을 구매하면 사용 포인트와 남은 잔액이 자동으로 기록돼요.</p>
          </div>
        </aside>
      </section>

      <section class="shop-page" id="shop-page" aria-labelledby="shop-page-title" hidden>
        <header class="feature-heading shop-heading">
          <div>
            <p class="eyebrow">GREEN REWARD SHOP</p>
            <h1 id="shop-page-title">모은 마음을<br />기분 좋은 보상으로</h1>
          </div>
          <div class="shop-balance-pill" aria-label="보유 GREEN POINT">
            <span>${icons.leaf}</span>
            <div><small>MY POINT</small><strong id="shop-balance">0P</strong></div>
          </div>
        </header>

        <section class="reward-catalog" aria-labelledby="reward-catalog-title">
          <div class="catalog-heading">
            <div>
              <span class="card-label">GREEN PICKS</span>
              <h2 id="reward-catalog-title">리워드 상품</h2>
            </div>
            <span class="catalog-count" id="catalog-count">6개</span>
          </div>

          <div class="category-filters" role="group" aria-label="리워드 카테고리">
            <button class="category-filter is-active" type="button" data-shop-category="ALL" aria-pressed="true">전체</button>
            <button class="category-filter" type="button" data-shop-category="FOOD" aria-pressed="false">FOOD</button>
            <button class="category-filter" type="button" data-shop-category="LIFE" aria-pressed="false">LIFE</button>
            <button class="category-filter" type="button" data-shop-category="CARRIER" aria-pressed="false">CARRIER</button>
          </div>

          <div class="product-grid" id="product-grid" aria-live="polite"></div>
        </section>

        <section class="reward-orders-card" aria-labelledby="reward-orders-title">
          <div class="catalog-heading">
            <div>
              <span class="card-label">MY REWARDS</span>
              <h2 id="reward-orders-title">구매내역</h2>
            </div>
            <span class="catalog-count" id="reward-order-count">0건</span>
          </div>
          <ul class="reward-order-list" id="reward-order-list"></ul>
          <div class="reward-order-empty" id="reward-order-empty">
            <span>${icons.shop}</span>
            <strong>아직 구매한 리워드가 없어요</strong>
            <p>모은 GREEN POINT로 첫 리워드를 만나 보세요.</p>
          </div>
        </section>

        <div class="purchase-toast" id="purchase-toast" role="status" hidden>
          <span>${icons.check}</span>
          <div><strong>리워드 구매 완료!</strong><p id="purchase-toast-message"></p></div>
          <button id="close-purchase-toast" type="button" aria-label="구매 완료 알림 닫기">×</button>
        </div>

        <dialog class="reward-dialog" id="reward-dialog" aria-labelledby="reward-dialog-title">
          <button class="dialog-close" id="close-reward-dialog" type="button" aria-label="상품 상세 닫기">×</button>
          <div class="dialog-product-visual" id="dialog-product-visual">${icons.shop}</div>
          <span class="dialog-category" id="dialog-category">FOOD</span>
          <h2 id="reward-dialog-title">상품명</h2>
          <p class="dialog-description" id="dialog-description"></p>
          <div class="dialog-point-row">
            <div><small>상품 가격</small><strong id="dialog-price">0P</strong></div>
            <div><small>보유 포인트</small><strong id="dialog-balance">0P</strong></div>
          </div>
          <div class="point-shortage-warning" id="point-shortage-warning" role="alert" hidden>
            <span>${icons.alert}</span>
            <div><strong>포인트가 부족해요</strong><p id="point-shortage-message"></p></div>
          </div>
          <button class="purchase-reward-button" id="purchase-reward-button" type="button">
            포인트로 구매하기
          </button>
          <p class="dialog-helper">구매 즉시 GREEN POINT가 차감되고 구매내역에 저장됩니다.</p>
        </dialog>
      </section>

      <section class="my-page" id="my-page" aria-labelledby="my-page-title" hidden>
        <header class="feature-heading my-heading">
          <div>
            <p class="eyebrow">MY GREENON</p>
            <h1 id="my-page-title">나의 친환경 기록을<br />한눈에 확인해요</h1>
          </div>
          <div class="my-heading-icon" aria-hidden="true">${icons.my}</div>
        </header>

        <section class="auth-card" id="auth-card" aria-labelledby="auth-title">
          <div class="auth-visual" aria-hidden="true">
            <span>${icons.lock}</span>
            <small>SAFE GREEN LIFE</small>
          </div>
          <div class="auth-content">
            <span class="card-label">SUPABASE AUTH</span>
            <h2 id="auth-title">GreenON에 오신 것을 환영해요</h2>
            <p>로그인하고 나만의 미션, 포인트와 친환경 기록을 안전하게 관리하세요.</p>

            <div class="auth-tabs" role="tablist" aria-label="인증 방식">
              <button class="auth-tab is-active" id="login-tab" type="button" role="tab" aria-selected="true" data-auth-mode="LOGIN">로그인</button>
              <button class="auth-tab" id="signup-tab" type="button" role="tab" aria-selected="false" data-auth-mode="SIGNUP">회원가입</button>
            </div>

            <form class="auth-form" id="auth-form" novalidate>
              <label class="auth-field" id="auth-name-field" for="auth-name" hidden>
                <span>이름</span>
                <input id="auth-name" name="name" type="text" autocomplete="name" maxlength="30" placeholder="그린온" />
              </label>
              <label class="auth-field" for="auth-email">
                <span>이메일</span>
                <input id="auth-email" name="email" type="email" autocomplete="email" required placeholder="greenon@example.com" />
              </label>
              <label class="auth-field" for="auth-password">
                <span>비밀번호</span>
                <input id="auth-password" name="password" type="password" autocomplete="current-password" minlength="8" required placeholder="8자 이상 입력해 주세요" />
              </label>
              <label class="auth-field" id="auth-password-confirm-field" for="auth-password-confirm" hidden>
                <span>비밀번호 확인</span>
                <input id="auth-password-confirm" name="passwordConfirm" type="password" autocomplete="new-password" minlength="8" placeholder="비밀번호를 한 번 더 입력해 주세요" />
              </label>
              <button class="auth-submit" id="auth-submit" type="submit">로그인</button>
            </form>

            <div class="auth-feedback" id="auth-feedback" role="status" aria-live="polite" hidden></div>
            <p class="auth-security-note">브라우저에는 Supabase publishable key만 사용하며 비밀키는 저장하지 않습니다.</p>
          </div>
        </section>

        <div class="my-dashboard" id="my-dashboard" hidden>
          <article class="profile-overview-card">
            <div class="profile-avatar" aria-hidden="true">${icons.my}</div>
            <div class="profile-summary">
              <span class="card-label">GREENON MEMBER</span>
              <h2 id="profile-name">GreenON 사용자</h2>
              <p id="profile-email"></p>
            </div>
            <button class="logout-button" id="logout-button" type="button">
              ${icons.logout}<span>로그아웃</span>
            </button>
          </article>

          <article class="green-level-card" aria-labelledby="green-level-title">
            <div class="level-card-heading">
              <div>
                <span class="card-label">MY GREEN LEVEL</span>
                <h2 id="green-level-title">GREEN SEED</h2>
              </div>
              <span class="level-symbol" id="green-level-symbol">${icons.leaf}</span>
            </div>
            <p id="green-level-description">첫 친환경 냉방 미션을 시작해 보세요.</p>
            <div class="level-progress-copy">
              <span id="level-progress-label">다음 레벨까지 300P</span>
              <strong id="level-progress-percent">0%</strong>
            </div>
            <div class="level-progress-track" role="progressbar" aria-label="GREEN LEVEL 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="level-progress-track">
              <span id="level-progress-bar"></span>
            </div>
          </article>

          <section class="green-report-card" aria-labelledby="green-report-title">
            <div class="report-heading">
              <div>
                <span class="card-label">GREEN REPORT</span>
                <h2 id="green-report-title">나의 친환경 냉방 리포트</h2>
              </div>
              <span class="report-icon">${icons.chart}</span>
            </div>
            <div class="report-grid">
              <div><small>성공 미션</small><strong id="report-missions">0회</strong><span>좋은 습관 완성</span></div>
              <div><small>친환경 냉방</small><strong id="report-minutes">0분</strong><span>26°C 이상 유지</span></div>
              <div><small>예상 절감 에너지</small><strong id="report-energy">0.0kWh</strong><span>시뮬레이션 기준</span></div>
              <div><small>예상 탄소 절감</small><strong id="report-carbon">0.0kg</strong><span>교육용 환산 수치</span></div>
            </div>
            <div class="report-footer">
              <span>${icons.shop}</span>
              <p><strong id="report-rewards">0개의 리워드</strong>를 친환경 실천으로 만났어요.</p>
            </div>
          </section>
        </div>
      </section>

      <section class="empty-page" id="empty-page" aria-live="polite" hidden>
        <span class="empty-icon" id="empty-icon">${icons.leaf}</span>
        <p class="eyebrow" id="empty-eyebrow"></p>
        <h2 id="empty-title"></h2>
        <p id="empty-description"></p>
        <button class="secondary-button" type="button" data-go-home>홈으로 돌아가기</button>
      </section>
    </main>

    <nav class="bottom-nav" aria-label="주요 메뉴">
      <button class="nav-item is-active" type="button" data-page="home" aria-current="page">
        ${icons.home}<span>홈</span>
      </button>
      <button class="nav-item" type="button" data-page="mission">
        ${icons.mission}<span>미션</span>
      </button>
      <button class="nav-item" type="button" data-page="wallet">
        ${icons.wallet}<span>지갑</span>
      </button>
      <button class="nav-item" type="button" data-page="shop">
        ${icons.shop}<span>리워드</span>
      </button>
      <button class="nav-item" type="button" data-page="my">
        ${icons.my}<span>MY</span>
      </button>
    </nav>
  </div>
`;

const homeDashboard = document.querySelector('#home-dashboard');
const emptyPage = document.querySelector('#empty-page');
const homeHero = document.querySelector('.hero');
const missionPage = document.querySelector('#mission-page');
const walletPage = document.querySelector('#wallet-page');
const shopPage = document.querySelector('#shop-page');
const myPage = document.querySelector('#my-page');
const navItems = document.querySelectorAll('[data-page]');

function getAirconHealth() {
  if (airconState.sensorStatus === 'ERROR') {
    return {
      isDanger: true,
      title: '센서 오류가 감지됐어요',
      description: '정확한 운전 데이터 확인을 위해 센서 상태를 정상으로 바꿔 주세요.',
    };
  }

  if (airconState.filterStatus === 'CHECK') {
    return {
      isDanger: true,
      title: '필터 점검이 필요해요',
      description: '쾌적하고 효율적인 냉방을 위해 필터 상태를 확인해 주세요.',
    };
  }

  return {
    isDanger: false,
    title: '에어컨 상태가 정상이에요',
    description: '필터와 센서가 모두 정상입니다.',
  };
}

function renderWeather() {
  const presentation = getWeatherPresentation(weatherState);
  const weatherCard = document.querySelector('#weather-card');
  const source = document.querySelector('#weather-source');

  weatherCard.classList.toggle('is-danger', weatherState.status === 'error');
  weatherCard.setAttribute('aria-busy', String(weatherState.status === 'loading'));
  document.querySelector('#weather-title').textContent =
    `${weatherState.locationName}, ${presentation.label}`;
  document.querySelector('#weather-icon').innerHTML = icons[presentation.icon] || icons.cloud;
  document.querySelector('#weather-temperature').textContent = `${weatherState.temperature}°C`;
  document.querySelector('#weather-humidity').textContent = `습도 ${weatherState.humidity}%`;
  document.querySelector('#weather-apparent').textContent =
    `체감온도 ${weatherState.apparentTemperature}°C`;

  if (weatherState.status === 'loading') {
    source.textContent = '샘플 날씨 표시 중 · 실시간 날씨를 불러오고 있어요.';
  } else if (weatherState.status === 'error') {
    source.textContent = '날씨 API 연결 실패 · 샘플 데이터로 표시 중입니다.';
  } else {
    source.innerHTML =
      '<a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> 실시간 데이터';
  }
}

async function initializeWeather() {
  weatherState = { ...SAMPLE_WEATHER, status: 'loading', error: null };
  renderAll();

  try {
    weatherState = {
      ...(await fetchCurrentWeather()),
      status: 'ready',
      error: null,
    };
  } catch (error) {
    console.warn('실시간 날씨를 불러오지 못해 샘플 데이터를 표시합니다.', error);
    weatherState = {
      ...SAMPLE_WEATHER,
      status: 'error',
      error: error?.message || 'WEATHER_FETCH_FAILED',
    };
  }

  renderAll();
}

function renderAircon() {
  const health = getAirconHealth();
  const powerLabel = airconState.power ? 'ON' : 'OFF';

  document.querySelector('#home-aircon-name').textContent = airconState.deviceName;
  document.querySelector('#home-aircon-card').classList.toggle('is-danger', health.isDanger);
  document.querySelector('#home-aircon-dot').classList.toggle('is-danger', health.isDanger);
  document.querySelector('#home-aircon-status').textContent = health.title;
  document.querySelector('#home-aircon-summary').textContent =
    `POWER ${powerLabel} · ${MODE_LABELS[airconState.mode]} ${airconState.temperature}°C · FAN ${FAN_LABELS[airconState.fan]}`;

  document.querySelector('#aircon-health').classList.toggle('is-danger', health.isDanger);
  document.querySelector('#aircon-health-icon').innerHTML = health.isDanger ? icons.alert : icons.check;
  document.querySelector('#aircon-health-title').textContent = health.title;
  document.querySelector('#aircon-health-description').textContent = health.description;
  document.querySelector('#simulator-live-badge').classList.toggle('is-danger', health.isDanger);

  document.querySelector('#aircon-power-value').textContent = powerLabel;
  document.querySelector('#aircon-mode-value').textContent = MODE_LABELS[airconState.mode];
  document.querySelector('#aircon-temperature-value').textContent = `${airconState.temperature}°C`;
  document.querySelector('#aircon-fan-value').textContent = FAN_LABELS[airconState.fan];
  document.querySelector('#aircon-usage-value').textContent = `${airconState.usageMinutes}분`;
  document.querySelector('#aircon-filter-value').textContent =
    airconState.filterStatus === 'NORMAL' ? '정상' : '점검 필요';
  document.querySelector('#aircon-filter-value').classList.toggle(
    'danger-value',
    airconState.filterStatus === 'CHECK',
  );

  const powerControl = document.querySelector('#power-control');
  powerControl.setAttribute('aria-pressed', String(airconState.power));
  powerControl.classList.toggle('is-on', airconState.power);
  document.querySelector('#power-control-label').textContent = airconState.power ? '켜짐' : '꺼짐';

  document.querySelector('#mode-control').value = airconState.mode;
  document.querySelector('#temperature-control-value').textContent = `${airconState.temperature}°C`;
  document.querySelector('#fan-control').value = airconState.fan;

  const filterControl = document.querySelector('#filter-control');
  const filterNeedsCheck = airconState.filterStatus === 'CHECK';
  filterControl.setAttribute('aria-pressed', String(filterNeedsCheck));
  filterControl.classList.toggle('is-danger', filterNeedsCheck);
  document.querySelector('#filter-control-label').textContent = filterNeedsCheck ? '점검 필요' : '정상';

  const sensorControl = document.querySelector('#sensor-control');
  const hasSensorError = airconState.sensorStatus === 'ERROR';
  sensorControl.setAttribute('aria-pressed', String(hasSensorError));
  sensorControl.classList.toggle('is-danger', hasSensorError);
  document.querySelector('#sensor-control-label').textContent = hasSensorError ? '오류' : '정상';
}

function renderMission() {
  const isActive = missionState.status === 'active';
  const isSuccess = missionState.status === 'success';
  const isFailed = missionState.status === 'failed';
  const condition = getMissionConditionResult();
  const isWarning = isActive && !condition.isValid;
  const progress = missionState.progressMinutes;
  const progressPercent = Math.round((progress / TODAY_MISSION.targetMinutes) * 100);
  const weatherGuide = getWeatherMissionGuide(weatherState, TODAY_MISSION);

  document.querySelector('#mission-detail-title').textContent = weatherGuide.title;
  document.querySelector('#mission-detail-description').textContent = weatherGuide.description;
  document.querySelector('#mission-target-temperature').textContent =
    `${TODAY_MISSION.targetTemperature}°C 이상`;
  document.querySelector('#mission-target-minutes').textContent = `${TODAY_MISSION.targetMinutes}분`;
  document.querySelector('#mission-reward-points').textContent = `${TODAY_MISSION.rewardPoints}P`;

  const stateBadge = document.querySelector('#mission-state-badge');
  stateBadge.className = 'mission-state-badge';
  if (isSuccess) {
    stateBadge.textContent = '미션 성공';
    stateBadge.classList.add('is-success');
  } else if (isFailed) {
    stateBadge.textContent = '미션 실패';
    stateBadge.classList.add('is-danger');
  } else if (isWarning) {
    stateBadge.textContent = '조건 확인';
    stateBadge.classList.add('is-danger');
  } else if (isActive) {
    stateBadge.textContent = '진행 중';
    stateBadge.classList.add('is-active');
  } else {
    stateBadge.textContent = '참여 가능';
  }

  document.querySelector('#mission-progress-label').textContent = `${progress} / ${TODAY_MISSION.targetMinutes}분`;
  document.querySelector('#mission-progress-percent').textContent = `${progressPercent}%`;
  document.querySelector('#mission-progress-bar').style.width = `${progressPercent}%`;
  document.querySelector('#mission-progress-track').setAttribute('aria-valuenow', String(progress));
  document
    .querySelector('#mission-progress-track')
    .setAttribute('aria-valuemax', String(TODAY_MISSION.targetMinutes));
  document.querySelector('#mission-progress-track').classList.toggle('is-success', isSuccess);
  document.querySelector('#mission-progress-track').classList.toggle('is-danger', isFailed);

  const conditionPanel = document.querySelector('#mission-condition-panel');
  conditionPanel.classList.toggle('is-danger', !condition.isValid);
  document.querySelector('#mission-condition-title').textContent = condition.isValid
    ? '미션 조건을 모두 충족했어요'
    : '미션 조건을 다시 확인해 주세요';
  document.querySelector('#mission-condition-state').textContent = condition.isValid
    ? '충족'
    : `${condition.checks.filter((check) => !check.passed).length}개 확인`;
  document.querySelector('#mission-condition-list').innerHTML = condition.checks
    .map(
      (check) => `
        <li class="${check.passed ? 'is-passed' : 'is-failed'}">
          <span>${check.passed ? icons.check : icons.alert}</span>
          ${check.label}
        </li>
      `,
    )
    .join('');

  const statusCard = document.querySelector('#mission-status-card');
  statusCard.className = 'mission-status-card';
  if (isSuccess) statusCard.classList.add('is-success');
  else if (isFailed || isWarning) statusCard.classList.add('is-danger');
  else if (isActive) statusCard.classList.add('is-active');

  let statusKicker = 'READY';
  let statusTitle = '미션을 시작할 준비가 됐어요';
  let statusDescription = `참여 버튼을 누른 뒤 에어컨 시뮬레이터로 ${TODAY_MISSION.targetMinutes}분을 진행해 보세요.`;

  if (isSuccess) {
    statusKicker = 'SUCCESS';
    statusTitle = 'GREEN MISSION 성공!';
    statusDescription = `${TODAY_MISSION.targetMinutes}분 동안 친환경 냉방 조건을 지켜 ${TODAY_MISSION.rewardPoints}P가 GREEN WALLET에 지급됐어요.`;
  } else if (isFailed) {
    statusKicker = 'FAILED';
    statusTitle = '미션에 실패했어요';
    statusDescription = missionState.failureReason || '냉방 조건을 지키지 못했어요. 다시 도전해 보세요.';
  } else if (isWarning) {
    statusKicker = 'WARNING';
    statusTitle = '미션 조건을 확인해 주세요';
    statusDescription = `${condition.reason}. 이 상태에서 시간을 진행하면 미션이 실패합니다.`;
  } else if (isActive) {
    statusKicker = 'IN PROGRESS';
    statusTitle = progress > 0 ? '좋아요, 친환경 냉방을 유지 중이에요' : '미션에 참여하고 있어요';
    statusDescription = '현재 조건이 정상입니다. 시뮬레이터에서 +30분을 눌러 진행해 주세요.';
  }

  document.querySelector('#mission-status-kicker').textContent = statusKicker;
  document.querySelector('#mission-status-title').textContent = statusTitle;
  document.querySelector('#mission-status-description').textContent = statusDescription;

  const startButton = document.querySelector('#mission-start-button');
  startButton.hidden = isActive || isSuccess;
  startButton.childNodes[0].textContent = isFailed ? '다시 도전하기 ' : '미션 참여하기 ';
  document.querySelector('#mission-cancel-button').hidden = !isActive;

  let homeTitle = weatherGuide.title;
  let homeDescription = `${weatherGuide.description} 성공하면 ${TODAY_MISSION.rewardPoints}P를 받을 수 있어요.`;
  let homeButtonLabel = '미션 보러가기';

  if (isSuccess) {
    homeTitle = '오늘의 GREEN MISSION 성공!';
    homeDescription = `${progress}/${TODAY_MISSION.targetMinutes}분 완료 · ${TODAY_MISSION.rewardPoints}P 지급 완료`;
    homeButtonLabel = '성공 기록 보기';
  } else if (isFailed) {
    homeTitle = '미션에 다시 도전해 볼까요?';
    homeDescription = missionState.failureReason || '미션 조건을 확인해 주세요.';
    homeButtonLabel = '다시 도전하기';
  } else if (isActive) {
    homeTitle = isWarning
      ? '미션 조건을 확인해 주세요'
      : `${TODAY_MISSION.targetTemperature}°C 냉방 미션에 참여 중이에요`;
    homeDescription = isWarning
      ? condition.reason
      : `현재 ${progress}/${TODAY_MISSION.targetMinutes}분 · 조건 정상`;
    homeButtonLabel = '진행 상황 보기';
  }

  document.querySelector('#home-mission-title').textContent = homeTitle;
  document.querySelector('#home-mission-description').textContent = homeDescription;
  document.querySelector('#home-mission-button-label').textContent = homeButtonLabel;
  const homeMissionCard = document.querySelector('#home-mission-card');
  homeMissionCard.classList.toggle('is-active', isActive && !isWarning);
  homeMissionCard.classList.toggle('is-success', isSuccess);
  homeMissionCard.classList.toggle('is-danger', isFailed || isWarning);
}

function formatPoint(value) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function renderWallet() {
  const earnedTotal = pointState.transactions
    .filter((transaction) => transaction.type === 'EARN')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const spentTotal = pointState.transactions
    .filter((transaction) => transaction.type === 'SPEND')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const filteredTransactions = pointState.transactions.filter(
    (transaction) => walletFilter === 'ALL' || transaction.type === walletFilter,
  );

  document.querySelector('#home-point-balance').textContent = `${formatPoint(pointState.balance)} P`;
  document.querySelector('#home-point-card').classList.toggle('has-points', pointState.balance > 0);
  document.querySelector('#wallet-balance').innerHTML = `${formatPoint(pointState.balance)} <small>P</small>`;
  document.querySelector('#wallet-earned-total').textContent = `${formatPoint(earnedTotal)}P`;
  document.querySelector('#wallet-spent-total').textContent = `${formatPoint(spentTotal)}P`;
  document.querySelector('#wallet-balance-message').textContent = pointState.balance > 0
    ? '친환경 냉방으로 모은 소중한 포인트예요.'
    : 'GREEN MISSION을 완료하고 첫 포인트를 모아 보세요.';
  document.querySelector('#wallet-history-count').textContent = `${filteredTransactions.length}건`;

  document.querySelectorAll('[data-wallet-filter]').forEach((button) => {
    const isCurrent = button.dataset.walletFilter === walletFilter;
    button.classList.toggle('is-active', isCurrent);
    button.setAttribute('aria-pressed', String(isCurrent));
  });

  const transactionList = document.querySelector('#transaction-list');
  transactionList.innerHTML = filteredTransactions
    .map((transaction) => {
      const isEarn = transaction.type === 'EARN';
      const createdAt = new Date(transaction.createdAt);
      const formattedDate = Number.isNaN(createdAt.getTime())
        ? '날짜 정보 없음'
        : new Intl.DateTimeFormat('ko-KR', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(createdAt);

      return `
        <li class="transaction-item ${isEarn ? 'is-earn' : 'is-spend'}">
          <span class="transaction-icon">${isEarn ? icons.leaf : icons.shop}</span>
          <div class="transaction-copy">
            <strong>${transaction.title}</strong>
            <span>${transaction.description}</span>
            <time datetime="${transaction.createdAt}">${formattedDate}</time>
          </div>
          <strong class="transaction-amount">${isEarn ? '+' : '−'}${formatPoint(transaction.amount)}P</strong>
        </li>
      `;
    })
    .join('');

  const walletEmpty = document.querySelector('#wallet-empty');
  walletEmpty.hidden = filteredTransactions.length > 0;
  transactionList.hidden = filteredTransactions.length === 0;

  if (filteredTransactions.length === 0) {
    const isSpendFilter = walletFilter === 'SPEND';
    document.querySelector('#wallet-empty-title').textContent = isSpendFilter
      ? '아직 사용한 포인트가 없어요'
      : '아직 포인트 내역이 없어요';
    document.querySelector('#wallet-empty-description').textContent = isSpendFilter
      ? '리워드 상품을 구매하면 사용내역이 여기에 기록됩니다.'
      : '미션에 성공하면 적립 내역이 여기에 표시됩니다.';
  }
}

function renderShop() {
  const visibleProducts = REWARD_PRODUCTS.filter(
    (product) => shopCategory === 'ALL' || product.category === shopCategory,
  );

  document.querySelector('#shop-balance').textContent = `${formatPoint(pointState.balance)}P`;
  document.querySelector('#catalog-count').textContent = `${visibleProducts.length}개`;
  document.querySelector('#reward-order-count').textContent = `${rewardOrders.length}건`;

  document.querySelectorAll('[data-shop-category]').forEach((button) => {
    const isCurrent = button.dataset.shopCategory === shopCategory;
    button.classList.toggle('is-active', isCurrent);
    button.setAttribute('aria-pressed', String(isCurrent));
  });

  const productGrid = document.querySelector('#product-grid');
  productGrid.innerHTML = visibleProducts.length
    ? visibleProducts
        .map(
          (product) => `
        <button
          class="product-card"
          type="button"
          data-product-id="${product.id}"
          aria-label="${product.name} 상세 보기, ${formatPoint(product.price)}포인트"
        >
          <span class="product-visual tone-${product.tone}">
            <span class="product-category">${CATEGORY_LABELS[product.category]}</span>
            <span class="product-icon">${icons[product.icon] || icons.shop}</span>
          </span>
          <span class="product-info">
            <strong>${product.name}</strong>
            <span>${product.description}</span>
            <b>${formatPoint(product.price)}P</b>
          </span>
        </button>
          `,
        )
        .join('')
    : `<p class="data-empty-message">${
        dataLoading
          ? 'Supabase에서 리워드 상품을 불러오는 중이에요.'
          : authUser
            ? '현재 구매할 수 있는 리워드가 없어요.'
            : '로그인하면 Supabase의 GREEN REWARD 상품을 확인할 수 있어요.'
      }</p>`;

  document.querySelector('#reward-order-list').innerHTML = rewardOrders
    .map((order) => {
      const product = REWARD_PRODUCTS.find((item) => item.id === order.productId);
      const orderedAt = new Date(order.createdAt);
      const formattedDate = Number.isNaN(orderedAt.getTime())
        ? '날짜 정보 없음'
        : new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(orderedAt);

      return `
        <li class="reward-order-item">
          <span class="order-product-icon tone-${product?.tone || 'blue'}">
            ${icons[product?.icon || 'shop']}
          </span>
          <div>
            <strong>${order.productName}</strong>
            <span>${formattedDate}</span>
            <small>주문번호 ${order.id.slice(0, 8).toUpperCase()}</small>
          </div>
          <div class="order-price">
            <strong>−${formatPoint(order.price)}P</strong>
            <span>구매 완료</span>
          </div>
        </li>
      `;
    })
    .join('');

  document.querySelector('#reward-order-empty').hidden = rewardOrders.length > 0;
  document.querySelector('#reward-order-list').hidden = rewardOrders.length === 0;
}

function openRewardDialog(productId) {
  const product = REWARD_PRODUCTS.find((item) => item.id === productId);
  if (!product) return;

  selectedRewardId = product.id;
  const dialog = document.querySelector('#reward-dialog');
  dialog.classList.remove('is-danger');
  document.querySelector('#point-shortage-warning').hidden = true;
  document.querySelector('#dialog-product-visual').className =
    `dialog-product-visual tone-${product.tone}`;
  document.querySelector('#dialog-product-visual').innerHTML = icons[product.icon];
  document.querySelector('#dialog-category').textContent = CATEGORY_LABELS[product.category];
  document.querySelector('#reward-dialog-title').textContent = product.name;
  document.querySelector('#dialog-description').textContent = product.description;
  document.querySelector('#dialog-price').textContent = `${formatPoint(product.price)}P`;
  document.querySelector('#dialog-balance').textContent = `${formatPoint(pointState.balance)}P`;
  document.querySelector('#purchase-reward-button').textContent =
    `${formatPoint(product.price)}P로 구매하기`;
  dialog.showModal();
}

async function purchaseSelectedReward() {
  const product = REWARD_PRODUCTS.find((item) => item.id === selectedRewardId);
  if (!product) return;
  if (!requireAuth('리워드 구매')) {
    document.querySelector('#reward-dialog').close();
    return;
  }

  const dialog = document.querySelector('#reward-dialog');
  const warning = document.querySelector('#point-shortage-warning');
  const purchaseButton = document.querySelector('#purchase-reward-button');

  try {
    await refreshWalletAndOrders();
    renderAll();
  } catch (error) {
    console.error('최신 포인트 잔액을 확인하지 못했습니다.', error);
    dialog.classList.add('is-danger');
    warning.hidden = false;
    document.querySelector('#point-shortage-message').textContent =
      '최신 포인트 잔액을 확인하지 못했어요. 네트워크 연결을 확인해 주세요.';
    return;
  }

  if (pointState.balance < product.price) {
    const shortage = product.price - pointState.balance;
    dialog.classList.add('is-danger');
    warning.hidden = false;
    document.querySelector('#point-shortage-message').textContent =
      `${formatPoint(shortage)}P가 더 필요합니다. 현재 ${formatPoint(pointState.balance)}P를 보유하고 있어요.`;
    return;
  }

  purchaseButton.disabled = true;
  purchaseButton.textContent = '안전하게 구매 중...';
  const requestId = createOrderId();
  const { data, error } = await supabase.rpc('purchase_green_reward', {
    p_reward_id: product.id,
    p_request_id: requestId,
  });

  if (error) {
    console.error('GREEN REWARD 구매에 실패했습니다.', error);
    dialog.classList.add('is-danger');
    warning.hidden = false;
    document.querySelector('#point-shortage-message').textContent =
      error.message?.includes('INSUFFICIENT_POINTS')
        ? '포인트가 부족해 구매할 수 없어요. 최신 잔액을 다시 확인해 주세요.'
        : '구매 정보를 저장하지 못했어요. 포인트는 차감되지 않았습니다.';
    purchaseButton.disabled = false;
    purchaseButton.textContent = `${formatPoint(product.price)}P로 구매하기`;
    return;
  }

  pointState.balance = Number(data?.balance_after) || 0;
  try {
    await refreshWalletAndOrders();
  } catch (refreshError) {
    console.error('구매 후 최신 내역을 불러오지 못했습니다.', refreshError);
  }
  purchaseButton.disabled = false;
  dialog.close();
  renderAll();

  document.querySelector('#purchase-toast-message').textContent =
    `${product.name} 구매로 ${formatPoint(product.price)}P가 차감됐어요.`;
  document.querySelector('#purchase-toast').hidden = false;
}

// Supabase의 누적 적립 기록과 GREEN LEVEL 기준으로 현재 레벨을 계산합니다.
function getGreenLevelData() {
  const earnedPoints = pointState.transactions
    .filter((transaction) => transaction.type === 'EARN')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const fallbackLevels = [
    {
      title: 'GREEN SEED',
      min: 0,
      next: 300,
      description: '첫 친환경 냉방 미션을 시작해 작은 씨앗을 깨워 보세요.',
    },
    {
      title: 'GREEN SPROUT',
      min: 300,
      next: 1000,
      description: '꾸준한 적정 냉방 습관으로 푸른 새싹이 자라고 있어요.',
    },
    {
      title: 'GREEN LEAF',
      min: 1000,
      next: 2500,
      description: '에너지 절약을 일상으로 만든 멋진 GREENON 실천가예요.',
    },
    {
      title: 'GREEN FOREST',
      min: 2500,
      next: null,
      description: '친환경 냉방 습관으로 나만의 푸른 숲을 완성했어요.',
    },
  ];
  const levels = greenLevels.length
    ? greenLevels.map((level) => ({
        title: level.name,
        min: Number(level.min_points),
        next: level.max_points === null ? null : Number(level.max_points),
        description: level.description,
      }))
    : fallbackLevels;
  const currentLevel =
    [...levels].reverse().find((level) => earnedPoints >= level.min) || levels[0];
  const progress = currentLevel.next
    ? Math.round(((earnedPoints - currentLevel.min) / (currentLevel.next - currentLevel.min)) * 100)
    : 100;

  return {
    ...currentLevel,
    earnedPoints,
    progress: Math.max(0, Math.min(progress, 100)),
    remaining: currentLevel.next ? Math.max(currentLevel.next - earnedPoints, 0) : 0,
  };
}

function getAuthUserName(user) {
  if (profileState?.display_name) return profileState.display_name;
  const metadataName = user?.user_metadata?.display_name;
  if (typeof metadataName === 'string' && metadataName.trim()) return metadataName.trim();
  return user?.email?.split('@')[0] || 'GreenON 사용자';
}

function renderMy() {
  const authCard = document.querySelector('#auth-card');
  const myDashboard = document.querySelector('#my-dashboard');
  const profileButton = document.querySelector('#profile-button');
  const isSignedIn = Boolean(authUser);

  authCard.hidden = isSignedIn;
  myDashboard.hidden = !isSignedIn;
  profileButton.classList.toggle('is-authenticated', isSignedIn);
  profileButton.setAttribute(
    'aria-label',
    isSignedIn ? `${getAuthUserName(authUser)}님의 MY GreenON 열기` : '로그인 또는 회원가입 열기',
  );

  if (!isSignedIn) return;

  const level = getGreenLevelData();
  const completedMissionCount = pointState.awardedMissionKeys.length;
  const greenCoolingMinutes = completedMissionCount * TODAY_MISSION.targetMinutes;
  const estimatedEnergy = completedMissionCount * 0.72;
  const estimatedCarbon = completedMissionCount * 0.33;

  document.querySelector('#profile-name').textContent = dataLoading
    ? '데이터를 불러오는 중...'
    : `${getAuthUserName(authUser)}님`;
  document.querySelector('#profile-email').textContent = authUser.email || '이메일 정보 없음';
  document.querySelector('#green-level-title').textContent = level.title;
  document.querySelector('#green-level-description').textContent = level.description;
  document.querySelector('#level-progress-label').textContent = level.next
    ? `다음 레벨까지 ${formatPoint(level.remaining)}P`
    : '최고 레벨을 달성했어요';
  document.querySelector('#level-progress-percent').textContent = `${level.progress}%`;
  document.querySelector('#level-progress-bar').style.width = `${level.progress}%`;
  document.querySelector('#level-progress-track').setAttribute('aria-valuenow', level.progress);
  document.querySelector('#report-missions').textContent = `${completedMissionCount}회`;
  document.querySelector('#report-minutes').textContent = `${formatPoint(greenCoolingMinutes)}분`;
  document.querySelector('#report-energy').textContent = `${estimatedEnergy.toFixed(1)}kWh`;
  document.querySelector('#report-carbon').textContent = `${estimatedCarbon.toFixed(1)}kg`;
  document.querySelector('#report-rewards').textContent = `${rewardOrders.length}개의 리워드`;
}

function setAuthFeedback(message, type = 'info') {
  const feedback = document.querySelector('#auth-feedback');
  feedback.textContent = message;
  feedback.className = `auth-feedback is-${type}`;
  feedback.hidden = false;
}

function clearAuthFeedback() {
  const feedback = document.querySelector('#auth-feedback');
  feedback.hidden = true;
  feedback.textContent = '';
  feedback.className = 'auth-feedback';
}

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === 'SIGNUP';
  const passwordInput = document.querySelector('#auth-password');

  document.querySelectorAll('[data-auth-mode]').forEach((button) => {
    const isCurrent = button.dataset.authMode === mode;
    button.classList.toggle('is-active', isCurrent);
    button.setAttribute('aria-selected', isCurrent);
  });
  document.querySelector('#auth-name-field').hidden = !isSignup;
  document.querySelector('#auth-password-confirm-field').hidden = !isSignup;
  document.querySelector('#auth-name').required = isSignup;
  document.querySelector('#auth-password-confirm').required = isSignup;
  document.querySelector('#auth-submit').textContent = isSignup ? 'GreenON 시작하기' : '로그인';
  passwordInput.autocomplete = isSignup ? 'new-password' : 'current-password';
  clearAuthFeedback();
}

function getKoreanAuthError(error) {
  const message = error?.message?.toLowerCase() || '';
  if (message.includes('email not confirmed')) {
    return '이메일 인증이 아직 완료되지 않았어요. 받은 편지함의 인증 링크를 확인해 주세요.';
  }
  if (message.includes('invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않아요.';
  }
  if (message.includes('already registered') || message.includes('already exists')) {
    return '이미 가입된 이메일이에요. 로그인해 주세요.';
  }
  if (message.includes('email rate limit')) {
    return '인증 이메일 요청이 많아요. 잠시 후 다시 시도해 주세요.';
  }
  if (message.includes('valid email') || message.includes('email address')) {
    return '사용할 수 있는 이메일 주소를 입력해 주세요.';
  }
  if (message.includes('password')) {
    return '비밀번호를 확인해 주세요. 8자 이상 입력하는 것을 권장해요.';
  }
  return '인증 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.';
}

function updateAuthSubmitState() {
  const submitButton = document.querySelector('#auth-submit');
  submitButton.disabled = authLoading;
  submitButton.textContent = authLoading
    ? '안전하게 확인 중...'
    : authMode === 'SIGNUP'
      ? 'GreenON 시작하기'
      : '로그인';
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  clearAuthFeedback();

  if (!hasSupabaseConfig || !supabase) {
    setAuthFeedback('Supabase 환경변수가 없어 인증을 시작할 수 없어요.', 'danger');
    return;
  }

  const emailInput = document.querySelector('#auth-email');
  const passwordInput = document.querySelector('#auth-password');
  const name = document.querySelector('#auth-name').value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const passwordConfirm = document.querySelector('#auth-password-confirm').value;

  if (!email || !emailInput.checkValidity()) {
    setAuthFeedback('올바른 이메일 주소를 입력해 주세요.', 'danger');
    emailInput.focus();
    return;
  }
  if (password.length < 8) {
    setAuthFeedback('비밀번호는 8자 이상 입력해 주세요.', 'danger');
    passwordInput.focus();
    return;
  }
  if (authMode === 'SIGNUP' && !name) {
    setAuthFeedback('GreenON에서 사용할 이름을 입력해 주세요.', 'danger');
    document.querySelector('#auth-name').focus();
    return;
  }
  if (authMode === 'SIGNUP' && password !== passwordConfirm) {
    setAuthFeedback('두 비밀번호가 서로 달라요.', 'danger');
    document.querySelector('#auth-password-confirm').focus();
    return;
  }

  authLoading = true;
  updateAuthSubmitState();

  try {
    if (authMode === 'SIGNUP') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name },
          emailRedirectTo: `${globalThis.location.origin}/`,
        },
      });
      if (error) throw error;

      if (data.session) {
        await synchronizeAuthUser(data.user);
        showPage('my');
      } else {
        setAuthFeedback('가입 신청이 완료됐어요. 이메일의 인증 링크를 확인해 주세요.', 'success');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await synchronizeAuthUser(data.user);
      showPage('my');
    }
  } catch (error) {
    setAuthFeedback(getKoreanAuthError(error), 'danger');
  } finally {
    authLoading = false;
    updateAuthSubmitState();
  }
}

async function initializeAuth() {
  if (!hasSupabaseConfig || !supabase) {
    setAuthFeedback('Supabase 연결 정보가 필요해요. .env 환경변수를 확인해 주세요.', 'danger');
    return;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error && error.name !== 'AuthSessionMissingError') {
    setAuthFeedback('로그인 상태를 확인하지 못했어요. 네트워크 연결을 확인해 주세요.', 'danger');
  }
  await synchronizeAuthUser(data.user ?? null);

  // 인증 콜백이 끝난 다음 사용자 데이터를 조회해 인증 클라이언트의 잠금을 방해하지 않습니다.
  supabase.auth.onAuthStateChange((_event, session) => {
    globalThis.setTimeout(() => {
      void synchronizeAuthUser(session?.user ?? null);
    }, 0);
  });
}

function renderAll() {
  renderWeather();
  renderAircon();
  renderMission();
  renderWallet();
  renderShop();
  renderMy();
}

// 하단 메뉴를 눌렀을 때 화면의 기본 골격을 전환합니다.
// 실제 미션·지갑·리워드 기능은 각 개발 단계에서 이 자리에 추가합니다.
function showPage(pageName) {
  const page = pages[pageName] ?? pages.home;
  const isHome = pageName === 'home';
  const isMission = pageName === 'mission';
  const isWallet = pageName === 'wallet';
  const isShop = pageName === 'shop';
  const isMy = pageName === 'my';

  navItems.forEach((item) => {
    const isCurrent = item.dataset.page === pageName;
    item.classList.toggle('is-active', isCurrent);
    if (isCurrent) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });

  homeHero.hidden = !isHome;
  homeDashboard.hidden = !isHome;
  missionPage.hidden = !isMission;
  walletPage.hidden = !isWallet;
  shopPage.hidden = !isShop;
  myPage.hidden = !isMy;
  emptyPage.hidden = isHome || isMission || isWallet || isShop || isMy;

  if (!isHome && !isMission && !isWallet && !isShop && !isMy) {
    document.querySelector('#empty-eyebrow').textContent = page.eyebrow;
    document.querySelector('#empty-title').innerHTML = page.title.replace('\n', '<br />');
    document.querySelector('#empty-description').textContent = page.description;
  }

  window.history.replaceState(null, '', `#${pageName}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navItems.forEach((item) => {
  item.addEventListener('click', () => showPage(item.dataset.page));
});

document.querySelectorAll('[data-go-home]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    showPage('home');
  });
});

document.querySelector('#view-mission-button').addEventListener('click', () => showPage('mission'));
document.querySelector('#view-wallet-button').addEventListener('click', () => showPage('wallet'));
document.querySelector('#profile-button').addEventListener('click', () => showPage('my'));

document.querySelectorAll('[data-auth-mode]').forEach((button) => {
  button.addEventListener('click', () => setAuthMode(button.dataset.authMode));
});
document.querySelector('#auth-form').addEventListener('submit', handleAuthSubmit);
document.querySelector('#logout-button').addEventListener('click', async () => {
  if (!supabase) return;
  const logoutButton = document.querySelector('#logout-button');
  logoutButton.disabled = true;
  const { error } = await supabase.auth.signOut();
  logoutButton.disabled = false;

  if (error) {
    setAuthFeedback('로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.', 'danger');
    return;
  }
  await synchronizeAuthUser(null);
  setAuthMode('LOGIN');
  setAuthFeedback('안전하게 로그아웃했어요.', 'success');
});

document.querySelectorAll('[data-wallet-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    walletFilter = button.dataset.walletFilter;
    renderWallet();
  });
});

document.querySelectorAll('[data-shop-category]').forEach((button) => {
  button.addEventListener('click', () => {
    shopCategory = button.dataset.shopCategory;
    renderShop();
  });
});

document.querySelector('#product-grid').addEventListener('click', (event) => {
  const productCard = event.target.closest('[data-product-id]');
  if (productCard) openRewardDialog(productCard.dataset.productId);
});

const rewardDialog = document.querySelector('#reward-dialog');
document.querySelector('#close-reward-dialog').addEventListener('click', () => rewardDialog.close());
document.querySelector('#purchase-reward-button').addEventListener('click', purchaseSelectedReward);
document.querySelector('#close-purchase-toast').addEventListener('click', () => {
  document.querySelector('#purchase-toast').hidden = true;
});
rewardDialog.addEventListener('click', (event) => {
  if (event.target === rewardDialog) rewardDialog.close();
});

document.querySelector('#mission-start-button').addEventListener('click', async () => {
  const result = await performMissionAction('START');
  if (result) document.querySelector('#mission-status-card').focus({ preventScroll: true });
});

document.querySelector('#mission-cancel-button').addEventListener('click', async () => {
  await performMissionAction('CANCEL');
});

async function updateAirconState(nextState) {
  if (!requireAuth('가상 에어컨 조작')) return;
  const previousState = { ...airconState };
  airconState = { ...airconState, ...nextState, updatedAt: new Date().toISOString() };
  renderAll();
  document.querySelector('#simulation-feedback').classList.remove('is-danger');
  await persistAirconState(previousState);
}

document.querySelector('#power-control').addEventListener('click', () => {
  updateAirconState({ power: !airconState.power });
});

document.querySelector('#mode-control').addEventListener('change', (event) => {
  updateAirconState({ mode: event.target.value });
});

document.querySelector('#temperature-down').addEventListener('click', () => {
  updateAirconState({ temperature: Math.max(18, airconState.temperature - 1) });
});

document.querySelector('#temperature-up').addEventListener('click', () => {
  updateAirconState({ temperature: Math.min(30, airconState.temperature + 1) });
});

document.querySelector('#fan-control').addEventListener('change', (event) => {
  updateAirconState({ fan: event.target.value });
});

document.querySelector('#filter-control').addEventListener('click', () => {
  updateAirconState({
    filterStatus: airconState.filterStatus === 'NORMAL' ? 'CHECK' : 'NORMAL',
  });
});

document.querySelector('#sensor-control').addEventListener('click', () => {
  updateAirconState({
    sensorStatus: airconState.sensorStatus === 'NORMAL' ? 'ERROR' : 'NORMAL',
  });
});

document.querySelector('#simulate-30-button').addEventListener('click', async () => {
  await performMissionAction('SIMULATE');
});

document.querySelector('#reset-simulation-button').addEventListener('click', async () => {
  await performMissionAction('RESET');
});

document.querySelector('#open-simulator-button').addEventListener('click', () => {
  showPage('home');
  requestAnimationFrame(() => {
    document.querySelector('#aircon-simulator').scrollIntoView({ behavior: 'smooth' });
  });
});

// 새로고침해도 현재 해시와 맞는 기본 화면을 표시합니다.
renderAll();
setAuthMode('LOGIN');
initializeAuth();
initializeWeather();
const initialPage = window.location.hash.slice(1);
if (initialPage && pages[initialPage]) showPage(initialPage);
