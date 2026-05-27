import type { TimeVisuals } from './types';

export function SceneBackground({ timeVisuals }: { timeVisuals: TimeVisuals }) {
  return (
    <>
      <color attach="background" args={[timeVisuals.skyColor]} />
      <fog attach="fog" args={[timeVisuals.skyColor, 10, 50]} />
    </>
  );
}
