import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import { BackSide, Color, ShaderMaterial, Vector2, Vector3 } from 'three';
import { blendColor } from './utils';
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
  uniform vec3 cloudColor;
  uniform float haze;
  uniform float sunVisibility;
  uniform float cloudCover;
  uniform float elapsed;
  uniform vec2 wind;
  uniform vec2 cloudOffset;
  varying vec3 vWorldDir;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), f.x), f.y);
  }

  float cloudNoise(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 turn = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amplitude;
      p = turn * p + 17.3;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 dir = normalize(vWorldDir);
    // Keep sunrise and sunset color near the lower horizon, with a blue upper sky.
    float h = smoothstep(-0.65, 0.35, dir.y);
    vec3 sky = mix(bottomColor, topColor, pow(h, 0.6));
    float horizonHaze = pow(1.0 - h, 1.7);
    sky = mix(sky, weatherColor, haze * (0.72 + horizonHaze * 0.25));

    // A continuous cloud field adds distant wisps and becomes a sheet in overcast weather.
    vec2 p = dir.xy / max(0.5, -dir.z) * vec2(3.4, 2.6);
    float sheet = cloudNoise(p + cloudOffset - wind * elapsed * 0.006);
    float overcast = smoothstep(0.45, 1.0, cloudCover);
    float threshold = mix(0.9, 0.25, cloudCover);
    float cloudMask = smoothstep(threshold, threshold + 0.14, sheet);
    vec3 sheetColor = mix(cloudColor, weatherColor, overcast) * (0.85 + sheet * 0.24);
    sky = mix(sky, sheetColor, overcast * 0.95 + cloudMask * (1.0 - overcast) * 0.06);

    float sunDot = dot(dir, normalize(sunDirection));
    float sunGlow = pow(max(sunDot, 0.0), 64.0) * 0.18;
    float sunHalo = pow(max(sunDot, 0.0), 6.0) * 0.035;
    float sunMask = smoothstep(-0.08, 0.12, sunDirection.y);
    sky += sunColor * (sunGlow + sunHalo) * sunMask * sunVisibility;

    gl_FragColor = vec4(sky, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function SkyDome({
  timeVisuals,
  visuals,
  cloudCover = 25,
  windSpeed = 0,
  windDirection = 270,
}: {
  timeVisuals: TimeVisuals;
  visuals: WeatherVisuals;
  cloudCover?: number;
  windSpeed?: number;
  windDirection?: number;
}) {
  const material = useRef<ShaderMaterial>(null);
  const [cloudOffset] = useState(() => new Vector2(Math.random() * 1000, Math.random() * 1000));
  const daylight = Math.min(1, timeVisuals.ambientIntensity / (Math.PI / 1.5));
  const weatherColor = blendColor(timeVisuals.horizonColor, visuals.cloudColor, daylight * 0.85);
  const cloudColor = blendColor(timeVisuals.cloudTint, visuals.cloudColor, daylight * 0.4);
  const angle = (windDirection + 180) * Math.PI / 180;
  const uniforms = useMemo(
    () => ({
      topColor: { value: new Color(timeVisuals.zenithColor) },
      bottomColor: { value: new Color(timeVisuals.horizonColor) },
      sunDirection: { value: new Vector3(...timeVisuals.sunPosition).normalize() },
      sunColor: { value: new Color(timeVisuals.sunGlowColor) },
      weatherColor: { value: new Color(weatherColor) },
      cloudColor: { value: new Color(cloudColor) },
      haze: { value: Math.min(0.95, visuals.skyMute + visuals.turbidity / 60) },
      sunVisibility: { value: visuals.sunVisibility },
      cloudCover: { value: cloudCover / 100 },
      elapsed: { value: 0 },
      wind: { value: new Vector2(Math.sin(angle), Math.cos(angle) * 0.22).multiplyScalar(Math.min(3.5, windSpeed / 20)) },
      cloudOffset: { value: cloudOffset },
    }),
    [
      timeVisuals.horizonColor,
      timeVisuals.sunGlowColor,
      timeVisuals.sunPosition,
      timeVisuals.zenithColor,
      weatherColor,
      cloudColor,
      visuals.skyMute,
      visuals.sunVisibility,
      visuals.turbidity,
      cloudCover,
      cloudOffset,
      angle,
      windSpeed,
    ],
  );

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.elapsed.value = clock.elapsedTime;
  });

  return (
    <mesh>
      <sphereGeometry args={[500, 32, 15]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={BackSide}
        depthWrite={false}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}
