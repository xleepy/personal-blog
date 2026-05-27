import type { TimeOfDay } from './types';

export function getTimeOfDay(): { period: TimeOfDay; blend: number } {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const month = now.getMonth();

  const sunriseStart = 5 + (month >= 5 && month <= 7 ? -1 : month >= 11 || month <= 1 ? 2 : 0.5);
  const sunriseEnd = sunriseStart + 2;
  const sunsetStart = 18 + (month >= 5 && month <= 7 ? 2 : month >= 11 || month <= 1 ? -2 : 0);
  const sunsetEnd = sunsetStart + 2;

  if (hour < sunriseStart) return { period: 'night', blend: 1 };
  if (hour < sunriseEnd) return { period: 'sunrise', blend: (hour - sunriseStart) / 2 };
  if (hour < 10) return { period: 'morning', blend: (hour - sunriseEnd) / (10 - sunriseEnd) };
  if (hour < 16) return { period: 'midday', blend: (hour - 10) / 6 };
  if (hour < sunsetStart) return { period: 'afternoon', blend: (hour - 16) / (sunsetStart - 16) };
  if (hour < sunsetEnd) return { period: 'sunset', blend: (hour - sunsetStart) / 2 };
  if (hour < 22) return { period: 'dusk', blend: (hour - sunsetEnd) / (22 - sunsetEnd) };
  return { period: 'night', blend: 1 };
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
