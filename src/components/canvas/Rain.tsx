import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';

export function Rain({
  intensity,
  precipitation,
}: {
  intensity: number;
  precipitation: 'none' | 'rain' | 'snow';
}) {
  const isSnow = precipitation === 'snow';
  const count = precipitation === 'none' ? 0 : Math.floor((isSnow ? 900 : 2000) * intensity);
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useRef(new Object3D());
  const positions = useRef<Float32Array | null>(null);
  const velocities = useRef<Float32Array | null>(null);

  useEffect(() => {
    positions.current = new Float32Array(count * 3);
    velocities.current = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions.current[i * 3] = (Math.random() - 0.5) * 50;
      positions.current[i * 3 + 1] = Math.random() * 30 - 5;
      positions.current[i * 3 + 2] = -(Math.random() * 20 + 2);
      velocities.current[i] = isSnow ? 0.025 + Math.random() * 0.04 : 0.2 + Math.random() * 0.3;
    }
  }, [count, isSnow]);

  useFrame((state, delta) => {
    if (!meshRef.current || !positions.current || !velocities.current) return;
    // Preserve the original 60 fps speed, and avoid a large jump after a paused tab.
    const step = Math.min(Math.max(delta, 0), 0.05);
    const pos = positions.current;
    const vel = velocities.current;
    for (let i = 0; i < count; i++) {
      const fallSpeed = vel[i] * 60 * intensity * (isSnow ? 1.3 : 4);
      pos[i * 3 + 1] -= fallSpeed * step;
      let swayStart = state.clock.elapsedTime - step;
      if (pos[i * 3 + 1] < -10) {
        // Keep travel beyond the boundary, including any complete volume crossings.
        const overshoot = (-10 - pos[i * 3 + 1]) % 35;
        pos[i * 3 + 1] = 25 - overshoot;
        pos[i * 3] = (Math.random() - 0.5) * 50;
        pos[i * 3 + 2] = -(Math.random() * 20 + 2);
        swayStart = state.clock.elapsedTime - overshoot / fallSpeed;
      }
      if (isSnow) {
        // Integrate sway exactly, including only time since the last respawn.
        pos[i * 3] += 0.36 / 0.8 * (
          Math.cos(swayStart * 0.8 + i) - Math.cos(state.clock.elapsedTime * 0.8 + i)
        );
      }
      dummy.current.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      dummy.current.rotation.z = isSnow ? state.clock.elapsedTime * 0.2 + i : -0.15;
      dummy.current.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.current.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {isSnow ? <circleGeometry args={[0.045, 8]} /> : <planeGeometry args={[0.03, 1.5]} />}
      <meshBasicMaterial color={isSnow ? '#f5fbff' : '#9fc4e2'} transparent opacity={isSnow ? 0.75 : 0.38} side={2} />
    </instancedMesh>
  );
}
