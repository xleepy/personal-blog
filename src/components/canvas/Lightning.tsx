import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AdditiveBlending, ShaderMaterial } from 'three';

const nextInterval = () => 8 + Math.random() * 17;

export function Lightning({ active }: { active: boolean }) {
  // Start disabled until the browser preference is known.
  const [reducedMotion, setReducedMotion] = useState(true);
  const material = useRef<ShaderMaterial>(null);
  const nextFlash = useRef(8);
  const flashTime = useRef(-1);
  const uniforms = useMemo(() => ({ pulse: { value: 0 } }), []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    nextFlash.current = nextInterval();
    flashTime.current = -1;
    if (material.current) material.current.uniforms.pulse.value = 0;
  }, [active, reducedMotion]);

  useFrame((_, delta) => {
    if (!material.current) return;
    if (!active || reducedMotion) {
      material.current.uniforms.pulse.value = 0;
      return;
    }

    // A resumed tab should not consume an entire interval in one frame.
    const step = Math.min(Math.max(delta, 0), 0.05);
    nextFlash.current -= step;
    if (nextFlash.current <= 0) {
      flashTime.current = 0;
      nextFlash.current = nextInterval();
    }

    if (flashTime.current >= 0) {
      flashTime.current += step;
      const time = flashTime.current;
      // Two brief, softly faded pulses separated by a pause.
      const first = Math.max(0, 1 - Math.abs(time - 0.10) / 0.10);
      const second = Math.max(0, 1 - Math.abs(time - 0.36) / 0.12);
      material.current.uniforms.pulse.value = 0.14 * Math.max(first, second * 0.65);
      if (time >= 0.48) flashTime.current = -1;
    } else {
      material.current.uniforms.pulse.value = 0;
    }
  });

  if (!active || reducedMotion) return null;

  return (
    <mesh position={[0, 20, -80]} renderOrder={-50}>
      <planeGeometry args={[400, 250]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        fog={false}
        toneMapped={false}
        blending={AdditiveBlending}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float pulse;
          varying vec2 vUv;
          void main() {
            float glow = 1.0 - smoothstep(0.0, 0.72, length((vUv - vec2(0.5, 0.5)) * vec2(1.0, 1.1)));
            gl_FragColor = vec4(0.72, 0.82, 1.0, pulse * glow);
          }
        `}
      />
    </mesh>
  );
}
