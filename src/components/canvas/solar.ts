import type { TimeOfDay, TimeVisuals } from './types';
import { blendTimeVisuals } from './utils';
import { getLunarVisuals } from './lunar';

const RAD = Math.PI / 180;

/** NOAA's approximate solar equations, using UTC so travel and DST don't move the sun. */
export function getSolarPosition(now: Date, latitude: number, longitude: number) {
  const year = now.getUTCFullYear();
  const start = Date.UTC(year, 0, 1);
  const days = (Date.UTC(year + 1, 0, 1) - start) / 86_400_000;
  const day = (now.getTime() - start) / 86_400_000;
  const gamma = 2 * Math.PI / days * (day - 0.5);
  const equation = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  const declination = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60
    + now.getUTCMilliseconds() / 60_000;
  const solarMinutes = ((utcMinutes + equation + longitude * 4) % 1440 + 1440) % 1440;
  const hourAngle = (solarMinutes / 4 - 180) * RAD;
  const lat = Math.max(-90, Math.min(90, latitude)) * RAD;
  const east = -Math.cos(declination) * Math.sin(hourAngle);
  const up = Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
  const north = Math.cos(lat) * Math.sin(declination) - Math.sin(lat) * Math.cos(declination) * Math.cos(hourAngle);
  return {
    elevation: Math.asin(Math.max(-1, Math.min(1, up))) / RAD,
    // The fixed view faces south: east is on the left, north is behind the camera.
    direction: [-east, up, north] as [number, number, number],
    morning: hourAngle < 0,
    solarHour: solarMinutes / 60,
  };
}

// Elevation anchors keep polar day/night and the whole twilight continuous.
const PALETTE: { elevation: number; visuals: TimeVisuals }[] = [
  { elevation: -18, visuals: { skyColor: '#080e1c', zenithColor: '#050b18', horizonColor: '#141f32', sunGlowColor: '#36415a', sunPosition: [0, -1, 0], ambientIntensity: 0.035, cloudTint: '#111b2b' } },
  { elevation: -12, visuals: { skyColor: '#142039', zenithColor: '#0c1830', horizonColor: '#293951', sunGlowColor: '#765965', sunPosition: [0, -1, 0], ambientIntensity: 0.07, cloudTint: '#263047' } },
  { elevation: -6, visuals: { skyColor: '#405675', zenithColor: '#1b3155', horizonColor: '#9b7c81', sunGlowColor: '#d28b68', sunPosition: [0, -1, 0], ambientIntensity: 0.18, cloudTint: '#65677a' } },
  { elevation: -0.833, visuals: { skyColor: '#718da9', zenithColor: '#365e8b', horizonColor: '#e8b78f', sunGlowColor: '#ffba72', sunPosition: [0, 0, -1], ambientIntensity: 0.45, cloudTint: '#c19d8c' } },
  { elevation: 6, visuals: { skyColor: '#7cadd1', zenithColor: '#397bb2', horizonColor: '#d5d9d7', sunGlowColor: '#ffe3b5', sunPosition: [0, 0, -1], ambientIntensity: 0.85, cloudTint: '#e9ded0' } },
  { elevation: 20, visuals: { skyColor: '#73a9d0', zenithColor: '#2e77b4', horizonColor: '#c8dce7', sunGlowColor: '#fff3dc', sunPosition: [0, 1, -1], ambientIntensity: 1.25, cloudTint: '#f0f3f3' } },
  { elevation: 60, visuals: { skyColor: '#64a1d0', zenithColor: '#2265a5', horizonColor: '#bed8e9', sunGlowColor: '#fff9ef', sunPosition: [0, 1, 0], ambientIntensity: 1.65, cloudTint: '#f8fafb' } },
];

export function getSolarVisuals(now: Date, latitude = 50.0755, longitude = 14.4378) {
  const solar = getSolarPosition(now, latitude, longitude);
  let timeVisuals = PALETTE[0].visuals;
  for (let i = 1; i < PALETTE.length; i++) {
    const low = PALETTE[i - 1];
    const high = PALETTE[i];
    if (solar.elevation >= high.elevation) {
      timeVisuals = high.visuals;
    } else if (solar.elevation > low.elevation) {
      const fraction = (solar.elevation - low.elevation) / (high.elevation - low.elevation);
      timeVisuals = blendTimeVisuals(low.visuals, high.visuals, fraction * fraction * (3 - 2 * fraction));
      break;
    }
  }
  let period: TimeOfDay;
  if (solar.elevation < -12) period = 'night';
  else if (solar.elevation < -0.833) period = solar.morning ? 'sunrise' : 'dusk';
  else if (solar.elevation < 6) period = solar.morning ? 'sunrise' : 'sunset';
  else if (solar.solarHour < 10) period = 'morning';
  else if (solar.solarHour < 14) period = 'midday';
  else period = 'afternoon';
  return {
    ...solar,
    period,
    timeVisuals: { ...timeVisuals, sunPosition: solar.direction },
    moon: getLunarVisuals(now, latitude, longitude, solar.direction),
  };
}
