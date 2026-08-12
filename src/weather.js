const OPEN_METEO_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

export const SEOUL_LOCATION = {
  name: '서울',
  latitude: 37.5665,
  longitude: 126.978,
};

// 네트워크가 없을 때도 날씨 카드의 구조를 확인할 수 있는 안전한 샘플입니다.
export const SAMPLE_WEATHER = {
  locationName: SEOUL_LOCATION.name,
  temperature: 28,
  apparentTemperature: 30,
  humidity: 54,
  weatherCode: 1,
  isDay: true,
  observedAt: null,
  source: 'sample',
};

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

export function parseWeatherResponse(payload, location = SEOUL_LOCATION) {
  const current = payload?.current;
  if (
    !current ||
    !isFiniteNumber(current.temperature_2m) ||
    !isFiniteNumber(current.apparent_temperature) ||
    !isFiniteNumber(current.relative_humidity_2m) ||
    !isFiniteNumber(current.weather_code)
  ) {
    throw new Error('INVALID_WEATHER_RESPONSE');
  }

  return {
    locationName: location.name,
    temperature: Math.round(Number(current.temperature_2m)),
    apparentTemperature: Math.round(Number(current.apparent_temperature)),
    humidity: Math.round(Number(current.relative_humidity_2m)),
    weatherCode: Number(current.weather_code),
    isDay: Number(current.is_day) !== 0,
    observedAt: current.time || null,
    source: 'open-meteo',
  };
}

export async function fetchCurrentWeather(location = SEOUL_LOCATION, options = {}) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), options.timeoutMs || 8000);
  const parameters = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,is_day',
    timezone: 'Asia/Seoul',
    forecast_days: '1',
  });

  try {
    const response = await fetch(`${OPEN_METEO_ENDPOINT}?${parameters}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`WEATHER_HTTP_${response.status}`);
    return parseWeatherResponse(await response.json(), location);
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export function getWeatherPresentation(weather) {
  const code = Number(weather.weatherCode);
  if (code === 0) return { label: '맑음', icon: 'sun' };
  if ([1, 2, 3].includes(code)) return { label: code === 3 ? '흐림' : '구름 조금', icon: 'cloud' };
  if ([45, 48].includes(code)) return { label: '안개', icon: 'cloud' };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: '이슬비', icon: 'rain' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: '비', icon: 'rain' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: '눈', icon: 'snow' };
  if ([95, 96, 99].includes(code)) return { label: '뇌우', icon: 'rain' };
  return { label: '날씨 확인', icon: 'cloud' };
}

// 실제 보상 조건은 DB 미션 그대로 유지하고 날씨에 맞는 안내만 제공합니다.
export function getWeatherMissionGuide(weather, baseMission) {
  const isRainy = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]
    .includes(Number(weather.weatherCode));

  if (weather.temperature >= 30 || weather.apparentTemperature >= 32) {
    return {
      type: 'hot',
      label: '무더운 날 미션',
      title: `무더워도 ${baseMission.targetTemperature}°C 지키기`,
      description: `체감 ${weather.apparentTemperature}°C예요. 과도한 냉방 없이 ${baseMission.targetMinutes}분을 유지해 보세요.`,
    };
  }

  if (weather.humidity >= 70 || isRainy) {
    return {
      type: 'humid',
      label: '습한 날 미션',
      title: `습한 날에도 ${baseMission.targetTemperature}°C 지키기`,
      description: `현재 습도 ${weather.humidity}%예요. 과냉방을 피하고 쾌적한 냉방 습관을 지켜 보세요.`,
    };
  }

  return {
    type: 'mild',
    label: '오늘의 맞춤 미션',
    title: baseMission.title,
    description: `현재 ${weather.temperature}°C예요. 적정 온도를 유지하며 친환경 냉방을 실천해 보세요.`,
  };
}
