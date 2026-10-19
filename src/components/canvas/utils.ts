import type { WeatherData } from '@/hooks/useWeather';
import type { TimeOfDay, TimeVisuals } from './types';

// Blends around the weather location's solar times. Uses local 06:00/18:00 only
// before weather arrives. Polar days and nights use the API daylight flag.
export function getTimeOfDay(
  now: number,
  solar?: Pick<WeatherData, 'sunrise' | 'sunset' | 'isDay'> | null,
): { period: TimeOfDay; nextPeriod: TimeOfDay; blend: number } {
  const localDay = new Date(now);
  const sunrise = solar ? solar.sunrise : new Date(localDay).setHours(6, 0, 0, 0);
  const sunset = solar ? solar.sunset : new Date(localDay).setHours(18, 0, 0, 0);
  if (sunrise == null || sunset == null || sunset <= sunrise) {
    const period = solar?.isDay ? 'midday' : 'night';
    return { period, nextPeriod: period, blend: 0 };
  }

  const daylight = sunset - sunrise;
  const twilight = Math.min(45 * 60_000, daylight * 0.1);
  const stops: { at: number; period: TimeOfDay }[] = [
    { at: sunrise - twilight, period: 'night' },
    { at: sunrise, period: 'sunrise' },
    { at: sunrise + daylight * 0.2, period: 'morning' },
    { at: sunrise + daylight * 0.5, period: 'midday' },
    { at: sunrise + daylight * 0.78, period: 'afternoon' },
    { at: sunset, period: 'sunset' },
    { at: sunset + twilight * 0.65, period: 'dusk' },
    { at: sunset + twilight * 1.65, period: 'night' },
  ];

  for (let index = 0; index < stops.length - 1; index++) {
    const current = stops[index];
    const next = stops[index + 1];
    if (now >= current.at && now < next.at) {
      const t = (now - current.at) / (next.at - current.at);
      return { period: current.period, nextPeriod: next.period, blend: t * t * (3 - 2 * t) };
    }
  }
  return { period: 'night', nextPeriod: 'night', blend: 0 };
}

export function blendColor(color1: string, color2: string, t: number): string {
  const hex = (c: string) => parseInt(c.slice(1), 16);
  const r1 = (hex(color1) >> 16) & 0xff;
  const g1 = (hex(color1) >> 8) & 0xff;
  const b1 = hex(color1) & 0xff;
  const r2 = (hex(color2) >> 16) & 0xff;
  const g2 = (hex(color2) >> 8) & 0xff;
  const b2 = hex(color2) & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function blendTimeVisuals(current: TimeVisuals, next: TimeVisuals, t: number): TimeVisuals {
  return {
    skyColor: blendColor(current.skyColor, next.skyColor, t),
    zenithColor: blendColor(current.zenithColor, next.zenithColor, t),
    horizonColor: blendColor(current.horizonColor, next.horizonColor, t),
    sunGlowColor: blendColor(current.sunGlowColor, next.sunGlowColor, t),
    sunPosition: [
      current.sunPosition[0] + (next.sunPosition[0] - current.sunPosition[0]) * t,
      current.sunPosition[1] + (next.sunPosition[1] - current.sunPosition[1]) * t,
      current.sunPosition[2] + (next.sunPosition[2] - current.sunPosition[2]) * t,
    ] as [number, number, number],
    ambientIntensity: current.ambientIntensity + (next.ambientIntensity - current.ambientIntensity) * t,
    cloudTint: blendColor(current.cloudTint, next.cloudTint, t),
  };
}
