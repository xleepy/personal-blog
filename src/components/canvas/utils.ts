import type { TimeOfDay, TimeVisuals } from './types';

export function getTimeOfDay(): { period: TimeOfDay; nextPeriod: TimeOfDay; blend: number } {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const month = now.getMonth();

  const sunriseStart = 5 + (month >= 5 && month <= 7 ? -1 : month >= 11 || month <= 1 ? 2 : 0.5);
  const sunriseEnd = sunriseStart + 2;
  const sunsetStart = 18 + (month >= 5 && month <= 7 ? 2 : month >= 11 || month <= 1 ? -2 : 0);
  const sunsetEnd = sunsetStart + 2;

  if (hour < sunriseStart) return { period: 'night', nextPeriod: 'sunrise', blend: 0 };
  if (hour < sunriseEnd) return { period: 'sunrise', nextPeriod: 'morning', blend: (hour - sunriseStart) / 2 };
  if (hour < 10) return { period: 'morning', nextPeriod: 'midday', blend: (hour - sunriseEnd) / (10 - sunriseEnd) };
  if (hour < 16) return { period: 'midday', nextPeriod: 'afternoon', blend: (hour - 10) / 6 };
  if (hour < sunsetStart) return { period: 'afternoon', nextPeriod: 'sunset', blend: (hour - 16) / (sunsetStart - 16) };
  if (hour < sunsetEnd) return { period: 'sunset', nextPeriod: 'dusk', blend: (hour - sunsetStart) / 2 };
  if (hour < 22) return { period: 'dusk', nextPeriod: 'night', blend: (hour - sunsetEnd) / (22 - sunsetEnd) };
  return { period: 'night', nextPeriod: 'sunrise', blend: 0 };
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
