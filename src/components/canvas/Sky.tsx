import { SkyDome } from './SkyDome';
import type { TimeVisuals } from './types';
import type { Atmosphere } from './atmosphere';
import type { LunarVisuals } from './lunar';

export function Sky(props: {
  windSpeed?: number;
  windDirection?: number;
  visuals: Atmosphere;
  timeVisuals: TimeVisuals;
  moon: LunarVisuals;
}) {
  return <SkyDome {...props} />;
}
