import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';

export function Rain({ intensity }: { intensity: number }) {
  const count = Math.floor(2000 * intensity);
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useRef(new Object3D());
  const positions = useRef<Float32Array | null>(null);
  const velocities = useRef<Float32Array | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    positions.current = new Float32Array(count * 3);
    velocities.current = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions.current[i * 3] = (Math.random() - 0.5) * 50;
      positions.current[i * 3 + 1] = Math.random() * 30 - 5;
      positions.current[i * 3 + 2] = -(Math.random() * 20 + 2);
      velocities.current[i] = 0.2 + Math.random() * 0.3;
    }
  }, [count]);

  useFrame(() => {
    if (!meshRef.current || !positions.current || !velocities.current) return;
    const pos = positions.current;
    const vel = velocities.current;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= vel[i] * intensity * 4;
      if (pos[i * 3 + 1] < -10) {
        pos[i * 3 + 1] = 25;
        pos[i * 3] = (Math.random() - 0.5) * 50;
        pos[i * 3 + 2] = -(Math.random() * 20 + 2);
      }
      dummy.current.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      dummy.current.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.current.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[0.03, 1.5]} />
      <meshBasicMaterial color="#a0c4e8" transparent opacity={0.4} side={2} />
    </instancedMesh>
  );
}
