import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';

export function Rain({
  intensity,
  precipitation,
  windSpeed = 0,
  windDirection = 0,
  color,
}: {
  intensity: number;
  precipitation: 'none' | 'rain' | 'snow';
  windSpeed?: number; // km/h
  windDirection?: number; // meteorological degrees (direction the wind comes from)
  color?: string;
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
    const wind = Number.isFinite(windSpeed) ? Math.min(Math.max(windSpeed, 0), 50) : 0;
    const direction = Number.isFinite(windDirection) ? windDirection : 0;
    const drift = Math.sin(direction * Math.PI / 180) * wind * 0.05;
    const driftZ = -Math.cos(direction * Math.PI / 180) * wind * 0.05;
    for (let i = 0; i < count; i++) {
      const fallSpeed = vel[i] * 60 * (isSnow ? 1.3 : 4);
      pos[i * 3 + 1] -= fallSpeed * step;
      const swayStart = state.clock.elapsedTime - step;
      pos[i * 3] += drift * step;
      pos[i * 3 + 2] += driftZ * step;
      if (pos[i * 3 + 1] < -10) {
        // Keep travel beyond the boundary, including any complete volume crossings.
        const overshoot = (-10 - pos[i * 3 + 1]) % 35;
        pos[i * 3 + 1] = 25 - overshoot;
      }
      if (isSnow) {
        // Integrate sway exactly across frames and volume crossings.
        pos[i * 3] += 0.36 / 0.8 * (
          Math.cos(swayStart * 0.8 + i) - Math.cos(state.clock.elapsedTime * 0.8 + i)
        );
      }
      // Wrap horizontal movement without losing distance at the edge.
      pos[i * 3] = ((pos[i * 3] + 25) % 50 + 50) % 50 - 25;
      pos[i * 3 + 2] = ((pos[i * 3 + 2] + 22) % 20 + 20) % 20 - 22;
      dummy.current.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      dummy.current.rotation.z = isSnow ? state.clock.elapsedTime * 0.2 + i : Math.atan2(drift, fallSpeed);
      dummy.current.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.current.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {isSnow ? <circleGeometry args={[0.045, 8]} /> : <planeGeometry args={[0.025, 0.8]} />}
      <meshBasicMaterial color={color ?? (isSnow ? '#f5fbff' : '#b6c4cf')} transparent depthWrite={false} opacity={isSnow ? 0.75 : 0.38} side={2} />
    </instancedMesh>
  );
}
