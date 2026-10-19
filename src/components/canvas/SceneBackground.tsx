import type { TimeVisuals, WeatherVisuals } from './types';
import { blendColor } from './utils';

export function SceneBackground({
  timeVisuals,
  visuals,
}: {
  timeVisuals: TimeVisuals;
  visuals: WeatherVisuals;
}) {
  const daylight = Math.min(1, timeVisuals.ambientIntensity / (Math.PI / 1.5));
  const fogColor = blendColor(timeVisuals.horizonColor, visuals.cloudColor, visuals.skyMute * daylight * 0.45);

  return (
    <>
      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, visuals.fogNear, visuals.fogFar]} />
    </>
  );
}
