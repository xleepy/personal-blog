import type { WeatherCondition, WeatherData } from '@/hooks/useWeather';
import type { CloudProfile, TimeOfDay } from './types';
import { getSolarVisuals } from './solar';

const REFERENCE_DATE = '2026-03-20';

export type WeatherDebugSettings = {
  weather: 'live' | WeatherCondition | 'unavailable';
  time: 'live' | TimeOfDay | 'custom';
  hour: number;
  date: string;
  clouds: 'auto' | CloudProfile;
  cloudCover: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  windDirection: number | null;
};

export const DEFAULT_DEBUG_SETTINGS: WeatherDebugSettings = {
  weather: 'live', time: 'live', hour: 11, date: REFERENCE_DATE, clouds: 'auto',
  cloudCover: null, precipitation: null, windSpeed: null, windDirection: null,
};

const PRESETS: Record<WeatherCondition, { code: number; cover: number; rain: number; wind: number }> = {
  clear: { code: 0, cover: 0, rain: 0, wind: 5 },
  'partly-cloudy': { code: 2, cover: 45, rain: 0, wind: 12 },
  overcast: { code: 3, cover: 100, rain: 0, wind: 15 },
  fog: { code: 45, cover: 100, rain: 0, wind: 0 },
  drizzle: { code: 53, cover: 95, rain: 0.2, wind: 8 },
  rain: { code: 63, cover: 100, rain: 2, wind: 20 },
  snow: { code: 73, cover: 100, rain: 0.6, wind: 8 },
  thunderstorm: { code: 95, cover: 100, rain: 6, wind: 40 },
};

export function isWeatherDebugActive(settings: WeatherDebugSettings) {
  return settings.weather !== 'live' || settings.time !== 'live' || settings.clouds !== 'auto'
    || settings.cloudCover !== null || settings.precipitation !== null
    || settings.windSpeed !== null || settings.windDirection !== null;
}

export function getDebugWeather(live: WeatherData | null, settings: WeatherDebugSettings): WeatherData | null {
  if (settings.weather === 'unavailable') return null;
  const manual = settings.clouds !== 'auto' || settings.cloudCover !== null || settings.precipitation !== null
    || settings.windSpeed !== null || settings.windDirection !== null;
  if (settings.weather === 'live' && !manual) return live;

  const condition = settings.weather === 'live' ? live?.condition ?? 'clear' : settings.weather;
  const preset = PRESETS[condition];
  const base: WeatherData = settings.weather === 'live' && live ? live : {
    condition, weatherCode: preset.code,
    temperature: condition === 'snow' ? -2 : 15, humidity: condition === 'fog' ? 100 : 65,
    cloudCover: preset.cover, precipitation: preset.rain,
    windSpeed: preset.wind, windDirection: 270,
    latitude: live?.latitude ?? 50.0755, longitude: live?.longitude ?? 14.4378,
  };
  return {
    ...base,
    cloudCover: settings.cloudCover ?? (settings.clouds !== 'auto'
      ? Math.max(base.cloudCover ?? 0, settings.clouds.startsWith('stratus') && settings.clouds !== 'stratus-fractus'
        ? 100 : settings.clouds === 'stratocumulus' ? 70 : 45) : base.cloudCover),
    // A manual total replaces the observed layers, so the coverage slider has a predictable effect.
    cloudCoverLow: settings.cloudCover !== null ? undefined : base.cloudCoverLow,
    cloudCoverMid: settings.cloudCover !== null ? undefined : base.cloudCoverMid,
    cloudCoverHigh: settings.cloudCover !== null ? undefined : base.cloudCoverHigh,
    precipitation: settings.precipitation ?? base.precipitation,
    windSpeed: settings.windSpeed ?? base.windSpeed,
    windDirection: settings.windDirection ?? base.windDirection,
  };
}

const PRESET_HOURS: Record<TimeOfDay, number> = {
  night: 23, sunrise: 5.25, morning: 7.5, midday: 11, afternoon: 14, sunset: 17, dusk: 18,
};

export function getDebugTime(settings: WeatherDebugSettings) {
  if (settings.time === 'live') return null;
  const hour = settings.time === 'custom' ? settings.hour : PRESET_HOURS[settings.time];
  // A fixed reference location/date makes every preset available, including in polar night.
  const customDate = settings.time === 'custom' ? Date.parse(`${settings.date}T00:00:00Z`) : NaN;
  const midnight = Number.isFinite(customDate) ? customDate : Date.parse(`${REFERENCE_DATE}T00:00:00Z`);
  return getSolarVisuals(new Date(midnight + hour * 3_600_000), 50.0755, 14.4378);
}
