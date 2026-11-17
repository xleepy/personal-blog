const RAD = Math.PI / 180;
const J2000_NOON = Date.UTC(2000, 0, 1, 12);

/** Convert local west/up/north directions to a frame fixed on the celestial sphere. */
export function getStarFrame(now: Date, latitude: number, longitude: number) {
  // US Naval Observatory approximation for Greenwich mean sidereal time.
  const days = (now.getTime() - J2000_NOON) / 86_400_000;
  const siderealDegrees = ((18.697375 + 24.065709824279 * days) * 15 + longitude) % 360;
  const sinTime = Math.sin(siderealDegrees * RAD);
  const cosTime = Math.cos(siderealDegrees * RAD);
  const sinLatitude = Math.sin(latitude * RAD);
  const cosLatitude = Math.cos(latitude * RAD);
  // Row-major, for Matrix3.set. The final row points to the north celestial pole.
  return [
    sinTime, cosLatitude * cosTime, -sinLatitude * cosTime,
    -cosTime, cosLatitude * sinTime, -sinLatitude * sinTime,
    0, sinLatitude, cosLatitude,
  ] as const;
}

export type SkyView = { yaw: number; pitch: number };

export function getSkyView(sun: [number, number, number], latitude: number): SkyView {
  const [west, up, north] = sun;
  const elevation = Math.atan2(up, Math.hypot(west, north));
  const nightYaw = latitude < 0 ? Math.PI : 0;
  const sunYaw = Math.hypot(west, north) > 1e-6 ? Math.atan2(-west, -north) : nightYaw;
  // Preserve the east-to-west composition even in a narrow portrait frame.
  const headingOffset = west * 8 * RAD;
  const turn = sunYaw + headingOffset - nightYaw;
  const twilight = Math.max(0, Math.min(1, (elevation / RAD + 12) / 10));
  return {
    yaw: nightYaw + Math.atan2(Math.sin(turn), Math.cos(turn)) * twilight * twilight * (3 - 2 * twilight),
    // Frame the low Sun above the taskbar, and leave room for the zenith in summer.
    pitch: Math.max(14 * RAD, Math.min(72 * RAD, elevation * 0.9)),
  };
}
