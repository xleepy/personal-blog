import type { WeatherData } from '@/hooks/useWeather';
import { DEFAULT_WEATHER_VISUALS, WEATHER_VISUALS } from './constants';
import type { CloudProfile } from './types';

const COVER = { clear: 0.04, 'partly-cloudy': 0.42, overcast: 0.98, fog: 1, drizzle: 0.95, rain: 0.98, snow: 0.96, thunderstorm: 1 };

export function getAtmosphere(weather: WeatherData | null, cloudOverride: CloudProfile | 'auto' = 'auto') {
  const preset = weather ? WEATHER_VISUALS[weather.condition] : DEFAULT_WEATHER_VISUALS;
  // An unavailable observation uses a quiet neutral sky, without invented precipitation.
  const cover = weather ? (weather.cloudCover === undefined ? COVER[weather.condition] : weather.cloudCover / 100) : 0.25;
  const cloudCover = Math.max(0, Math.min(1, cover));
  const isFog = weather?.condition === 'fog';
  const hasLayers = Number.isFinite(weather?.cloudCoverLow)
    && Number.isFinite(weather?.cloudCoverMid) && Number.isFinite(weather?.cloudCoverHigh);
  // Incomplete layers cannot establish a clear lower sky; total cover is the safer fallback.
  let lowCloudCover = hasLayers
    ? Math.max(weather!.cloudCoverLow!, weather!.cloudCoverMid!) / 100 : cloudCover;
  let highCloudCover = Number.isFinite(weather?.cloudCoverHigh) ? weather!.cloudCoverHigh! / 100 : cloudCover * 0.2;
  const convective = weather?.condition === 'thunderstorm' || [80, 81, 82, 85, 86].includes(weather?.weatherCode ?? -1);
  // A shower code and layer estimates can disagree across grid cells or update times.
  // Keep a substantial lower cloud body rather than rendering only high wisps.
  if (convective && lowCloudCover < 0.15) lowCloudCover = Math.max(cloudCover, 0.55);
  // Layer coverage is evidence for altitude, not a diagnosis of cloud genus or atmospheric stability.
  let cloudProfile: CloudProfile = lowCloudCover < 0.08 && highCloudCover > 0.08 ? 'cirrus'
    : !convective && ['overcast', 'fog', 'drizzle', 'rain', 'snow'].includes(weather?.condition ?? '') ? 'stratus'
    : highCloudCover > 0.25 && lowCloudCover > 0.08 ? 'mixed'
    : !convective && lowCloudCover > 0.6 ? 'stratocumulus' : 'cumulus';
  if (cloudOverride !== 'auto' && weather) {
    cloudProfile = cloudOverride;
    lowCloudCover = cloudOverride === 'cirrus' ? 0 : cloudCover;
    highCloudCover = cloudOverride === 'cirrus' ? cloudCover : cloudOverride === 'mixed' ? cloudCover * 0.65 : 0;
  }
  const rainIntensity = preset.precipitation === 'none' ? 0
    : weather?.precipitation === undefined ? preset.rainIntensity
    : Math.min(1.55, Math.sqrt(weather.precipitation) * 0.8);
  const overcast = Math.max(0, (lowCloudCover - 0.5) * 2);
  const isStratus = cloudProfile.startsWith('stratus');
  const thin = cloudProfile === 'stratus-translucidus';
  return {
    ...preset,
    cloudCover,
    lowCloudCover,
    highCloudCover,
    cloudProfile,
    cloudFlatness: isStratus ? 1 : cloudProfile === 'stratocumulus' ? 0.55 : 0,
    cloudRaggedness: cloudProfile === 'stratus-fractus' ? 1 : 0,
    cloudWaves: cloudProfile === 'stratus-undulatus' ? 1 : cloudProfile === 'stratocumulus' ? 0.2 : 0,
    cloudOpticalDepth: thin ? 0.08 : cloudProfile === 'stratus-fractus' ? 0.75 : 1,
    // Fair-weather humilis has little vertical extent; reserve towers for showers/storms.
    cloudDepth: thin ? 0.1 : cloudProfile === 'stratus-fractus' ? 0.16 : isStratus ? 0.28
      : cloudProfile === 'stratocumulus' ? 0.18 : convective ? 1 : 0.24,
    rainIntensity,
    // Fog is scattering near the observer; it is independent of the cloud layer.
    skyMute: isFog ? 0.94 : Math.min(0.9, overcast * (thin ? 0.12 : 0.54) + rainIntensity * 0.1),
    sunVisibility: (1 - lowCloudCover * (thin ? 0.35 : 0.92)) * (1 - highCloudCover * 0.2) * (isFog ? 0.12 : 1),
    cloudOpacity: 0.75 + overcast * 0.25,
  };
}

export type Atmosphere = ReturnType<typeof getAtmosphere>;
