import type { TimeOfDay, TimeVisuals } from './types';

export function getTimeOfDay(now: Date = new Date()): { period: TimeOfDay; nextPeriod: TimeOfDay; blend: number } {
  const hour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600 + now.getMilliseconds() / 3_600_000;
  const yearStart = Date.UTC(now.getFullYear(), 0, 1);
  const daysInYear = (Date.UTC(now.getFullYear() + 1, 0, 1) - yearStart) / 86_400_000;
  // Use calendar days, rather than elapsed local timestamps, so DST cannot shift the season.
  const calendarDay = (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - yearStart) / 86_400_000 + hour / 24;
  const summer = Math.cos(2 * Math.PI * (calendarDay / daysInYear - 171 / 365));
  const sunrise = 5.5 - 1.5 * summer;
  const sunset = 18 + 2 * summer;
  const anchors: { hour: number; period: TimeOfDay }[] = [
    { hour: sunrise - 1.5, period: 'night' },
    { hour: sunrise, period: 'sunrise' },
    { hour: sunrise + 2, period: 'morning' },
    { hour: 10, period: 'midday' },
    { hour: Math.min(16, sunset - 2), period: 'afternoon' },
    { hour: sunset, period: 'sunset' },
    { hour: sunset + 1, period: 'dusk' },
    { hour: sunset + 2.5, period: 'night' },
  ];

  for (let index = 0; index < anchors.length - 1; index++) {
    const current = anchors[index];
    const next = anchors[index + 1];
    if (hour >= current.hour && hour < next.hour) {
      return {
        period: current.period,
        nextPeriod: next.period,
        blend: (hour - current.hour) / (next.hour - current.hour),
      };
    }
  }
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
