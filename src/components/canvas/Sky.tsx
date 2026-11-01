import { SkyDome } from './SkyDome';
import type { TimeVisuals } from './types';
import type { Atmosphere } from './atmosphere';

export function Sky(props: {
  windSpeed?: number;
  windDirection?: number;
  visuals: Atmosphere;
  timeVisuals: TimeVisuals;
}) {
  return <SkyDome {...props} />;
}
