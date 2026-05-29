import { useMemo } from 'react';
import { BackSide, Color, Vector3 } from 'three';
import type { TimeVisuals, WeatherVisuals } from './types';

const vertexShader = `
  varying vec3 vWorldDir;
  void main() {
    vWorldDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform vec3 sunDirection;
  uniform vec3 sunColor;
  uniform vec3 weatherColor;
  uniform float haze;
  uniform float sunVisibility;
  varying vec3 vWorldDir;

  void main() {
    vec3 dir = normalize(vWorldDir);
    float h = dir.y * 0.5 + 0.5;
    vec3 sky = mix(bottomColor, topColor, pow(h, 0.6));
    float horizonHaze = pow(1.0 - h, 1.7);
    sky = mix(sky, weatherColor, haze * (0.72 + horizonHaze * 0.25));

    float sunDot = dot(dir, normalize(sunDirection));
    float sunGlow = pow(max(sunDot, 0.0), 10.0) * 0.45;
    float sunHalo = pow(max(sunDot, 0.0), 2.0) * 0.14;
    float sunMask = smoothstep(-0.1, 0.2, sunDirection.y);
    sky += sunColor * (sunGlow + sunHalo) * sunMask * sunVisibility;

    gl_FragColor = vec4(sky, 1.0);
  }
`;

export function SkyDome({
  timeVisuals,
  visuals,
}: {
  timeVisuals: TimeVisuals;
  visuals: WeatherVisuals;
}) {
  const uniforms = useMemo(
    () => ({
      topColor: { value: new Color(timeVisuals.zenithColor) },
      bottomColor: { value: new Color(timeVisuals.horizonColor) },
      sunDirection: { value: new Vector3(...timeVisuals.sunPosition).normalize() },
      sunColor: { value: new Color(timeVisuals.sunGlowColor) },
      weatherColor: { value: new Color(visuals.cloudColor) },
      haze: { value: Math.min(0.95, visuals.skyMute + visuals.turbidity / 60) },
      sunVisibility: { value: visuals.sunVisibility },
    }),
    [
      timeVisuals.horizonColor,
      timeVisuals.sunGlowColor,
      timeVisuals.sunPosition,
      timeVisuals.zenithColor,
      visuals.cloudColor,
      visuals.skyMute,
      visuals.sunVisibility,
      visuals.turbidity,
    ],
  );

  return (
    <mesh>
      <sphereGeometry args={[500, 32, 15]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
