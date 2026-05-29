import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { PointLight } from 'three';

export function Lightning({ active }: { active: boolean }) {
  const lightRef = useRef<PointLight>(null);
  const nextFlash = useRef(1.5);
  const flashTime = useRef(0);

  useFrame((state, delta) => {
    if (!lightRef.current) return;

    if (!active) {
      lightRef.current.intensity = 0;
      return;
    }

    flashTime.current = Math.max(0, flashTime.current - delta);
    nextFlash.current -= delta;

    if (nextFlash.current <= 0) {
      flashTime.current = 0.08 + Math.random() * 0.08;
      nextFlash.current = 2.5 + Math.random() * 5;
      lightRef.current.position.set((Math.random() - 0.5) * 28, 12 + Math.random() * 8, -12 - Math.random() * 14);
    }

    const pulse = flashTime.current > 0 ? 1 + Math.sin(state.clock.elapsedTime * 90) * 0.25 : 0;
    lightRef.current.intensity = pulse * 45;
  });

  return <pointLight ref={lightRef} color="#dbe8ff" distance={80} decay={1.6} intensity={0} />;
}
