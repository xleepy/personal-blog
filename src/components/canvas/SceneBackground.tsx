import type { TimeVisuals, WeatherVisuals } from './types';
import { blendColor } from './utils';

export function SceneBackground({
  timeVisuals,
  visuals,
}: {
  timeVisuals: TimeVisuals;
  visuals: WeatherVisuals;
}) {
  const fogColor = blendColor(timeVisuals.horizonColor, timeVisuals.cloudTint, visuals.skyMute * 0.6);

  return (
    <>
      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, visuals.fogNear, visuals.fogFar]} />
    </>
  );
}
