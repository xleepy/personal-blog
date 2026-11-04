import { getMoonIllumination, getMoonPosition } from 'suncalc';

const RAD = Math.PI / 180;
const MOON_RADIUS_KM = 1737.4;

export function getLunarVisuals(now: Date, latitude: number, longitude: number, sun: [number, number, number]) {
  const { azimuth, altitude, distance } = getMoonPosition(now, latitude, longitude);
  const { fraction } = getMoonIllumination(now);
  const horizontal = Math.cos(altitude * RAD);
  // SunCalc measures azimuth clockwise from north. The scene faces south.
  const direction: [number, number, number] = [
    -Math.sin(azimuth * RAD) * horizontal,
    Math.sin(altitude * RAD),
    Math.cos(azimuth * RAD) * horizontal,
  ];

  // Project the Sun onto the Moon's sky plane for the bright limb orientation.
  // The component toward the observer sets the illuminated fraction of the disk.
  const alignment = direction[0] * sun[0] + direction[1] * sun[1] + direction[2] * sun[2];
  const x = sun[0] - alignment * direction[0];
  const y = sun[1] - alignment * direction[1];
  const z = sun[2] - alignment * direction[2];
  const phaseCosine = 2 * fraction - 1;
  const tangentScale = Math.sqrt(Math.max(0, 1 - phaseCosine * phaseCosine)) / Math.max(1e-6, Math.hypot(x, y, z));
  const lightDirection: [number, number, number] = [
    x * tangentScale - direction[0] * phaseCosine,
    y * tangentScale - direction[1] * phaseCosine,
    z * tangentScale - direction[2] * phaseCosine,
  ];

  return { direction, lightDirection, sinRadius: MOON_RADIUS_KM / distance, fraction };
}

export type LunarVisuals = ReturnType<typeof getLunarVisuals>;
