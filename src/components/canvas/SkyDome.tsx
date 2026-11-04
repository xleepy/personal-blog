import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, Color, ShaderMaterial, Vector2, Vector3 } from 'three';
import type { TimeVisuals } from './types';
import type { Atmosphere } from './atmosphere';
import type { LunarVisuals } from './lunar';
import { createCloudNoise } from './cloudNoise';
import { CLOUD_SHADER } from './cloudShader';

const vertexShader = `
  varying vec3 vDirection;
  void main() {
    vDirection = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 topColor, horizonColor, sunDirection, sunColor, cloudColor;
  uniform vec3 moonDirection, moonLightDirection;
  uniform vec2 cloudOffset;
  uniform float cover, haze, daylight, sunVisibility, celestialVisibility, storm;
  uniform float moonSinRadius, moonFraction;
  varying vec3 vDirection;
  const vec3 moonColor = vec3(0.79, 0.88, 1.0);

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  ${CLOUD_SHADER}

  void main() {
    vec3 dir = normalize(vDirection);
    float elevation = max(dir.y, 0.0);
    float gradient = pow(clamp(elevation, 0.0, 1.0), 0.45);
    vec3 sky = mix(horizonColor, topColor, gradient);
    float horizon = exp(-elevation * 7.0);
    // Desaturate heavy weather without introducing a daylight-grey night sky.
    float luminance = dot(sky, vec3(0.2126, 0.7152, 0.0722));
    vec3 muted = mix(vec3(luminance), cloudColor * 0.7, 0.35);
    sky = mix(sky, muted, haze * (0.8 + horizon * 0.2));

    float sunDot = max(dot(dir, sunDirection), 0.0);
    float aboveHorizon = smoothstep(-0.018, 0.005, sunDirection.y);
    float halo = pow(sunDot, 12.0) * 0.12 + pow(sunDot, 120.0) * 0.22;
    // The sun subtends ~0.53 degrees; derivatives keep the small disc stable.
    float discWidth = max(fwidth(sunDot), 0.000002);
    float disc = smoothstep(0.999989 - discWidth, 0.999989 + discWidth, sunDot);
    sky += sunColor * (halo + disc * 2.8) * aboveHorizon * sunVisibility;
    float twilight = exp(-abs(sunDirection.y) * 15.0) * (1.0 - haze) * (1.0 - daylight * 0.35);
    sky += sunColor * pow(sunDot, 3.0) * horizon * twilight * 0.12;

    float moonDot = max(dot(dir, moonDirection), 0.0);
    float moonlight = pow(moonFraction, 2.5) * smoothstep(0.0, 0.22, moonDirection.y)
      * (1.0 - daylight) * celestialVisibility;
    float moonHalo = pow(moonDot, 12.0);
    sky += moonColor * moonlight * (0.003 + moonHalo * 0.028 + pow(moonDot, 85.0) * 0.11);
    vec3 moonScatter = moonColor * moonlight * (0.008 + moonHalo * 0.034);

    // Shade a sphere in the tangent plane. The projected Sun sets the bright limb.
    float pixelAngle = 0.45 * max(length(dFdx(dir)), length(dFdy(dir)));
    float moonDisc = 0.0;
    float moonSurfaceLight = 0.0;
    if (moonDot > 0.9995 && dir.y > -pixelAngle) {
      vec3 offset = (dir - moonDirection * moonDot) / moonSinRadius;
      float radius = length(offset);
      float edge = max(pixelAngle / moonSinRadius, 0.001);
      moonDisc = (1.0 - smoothstep(1.0 - edge, 1.0 + edge, radius)) * smoothstep(-pixelAngle, pixelAngle, dir.y);
      vec3 normal = offset / max(1.0, radius) - moonDirection * sqrt(max(0.0, 1.0 - radius * radius));
      float incidence = dot(normal, moonLightDirection);
      float phaseEdge = min(0.18, edge * 0.35);
      moonSurfaceLight = smoothstep(-phaseEdge, phaseEdge, incidence) * (0.72 + 0.28 * max(incidence, 0.0));
    }

    // Each star keeps its brightness. Brighter stars emerge earlier in twilight.
    vec2 starUV = vec2(atan(dir.x, -dir.z), asin(clamp(dir.y, -1.0, 1.0))) * 240.0;
    vec2 cell = floor(starUV), local = fract(starUV) - 0.5;
    float seed = hash(cell);
    float star = (1.0 - smoothstep(0.015, 0.12 + fwidth(starUV.x), length(local))) * step(0.996, seed);
    float brightness = clamp((seed - 0.996) / 0.004, 0.0, 1.0);
    float fadeStart = sin(radians(mix(12.0, 4.0, brightness)));
    float fadeEnd = sin(radians(mix(18.0, 10.0, brightness)));
    float visibility = smoothstep(fadeStart, fadeEnd, -sunDirection.y) * celestialVisibility;
    float starLight = star * mix(0.12, 1.0, brightness * brightness) * visibility * smoothstep(0.0, 0.15, dir.y);

    float celestialTransmission = 1.0;
    sky = upperClouds(sky, dir, twilight, moonScatter, celestialTransmission);
    sky = lowerClouds(sky, dir, moonScatter, celestialTransmission);
    sky = mix(sky, muted, haze * horizon * 0.48);
    sky += vec3(0.55, 0.65, 0.85) * starLight * (1.0 - moonDisc) * celestialTransmission;
    float moonContrast = mix(1.05, 0.40, daylight) * mix(0.4, 1.0, smoothstep(0.0, 0.22, moonDirection.y));
    sky += moonColor * moonDisc * moonSurfaceLight * moonContrast * smoothstep(0.002, 0.02, moonFraction)
      * celestialTransmission * celestialVisibility;
    gl_FragColor = vec4(max(sky, vec3(0.0)), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function SkyDome({ timeVisuals, visuals, moon, windSpeed = 0, windDirection = 270 }: {
  timeVisuals: TimeVisuals;
  visuals: Atmosphere;
  moon: LunarVisuals;
  windSpeed?: number;
  windDirection?: number;
}) {
  const materialRef = useRef<ShaderMaterial>(null);
  const [noiseTexture] = useState(createCloudNoise);
  useEffect(() => () => noiseTexture.dispose(), [noiseTexture]);
  const targets = useMemo(() => ({
    top: new Color(timeVisuals.zenithColor),
    horizon: new Color(timeVisuals.horizonColor),
    sun: new Color(timeVisuals.sunGlowColor),
    cloud: new Color(timeVisuals.cloudTint),
    direction: new Vector3(...timeVisuals.sunPosition).normalize(),
    moonDirection: new Vector3(...moon.direction),
    moonLightDirection: new Vector3(...moon.lightDirection).normalize(),
  }), [timeVisuals, moon]);
  const [uniforms] = useState(() => ({
    topColor: { value: targets.top.clone() }, horizonColor: { value: targets.horizon.clone() },
    sunColor: { value: targets.sun.clone() }, cloudColor: { value: targets.cloud.clone() },
    sunDirection: { value: targets.direction.clone() },
    moonDirection: { value: targets.moonDirection.clone() },
    moonLightDirection: { value: targets.moonLightDirection.clone() },
    moonSinRadius: { value: moon.sinRadius }, moonFraction: { value: moon.fraction },
    cloudOffset: { value: new Vector2(3.2, 1.7) },
    cover: { value: visuals.cloudCover }, haze: { value: visuals.skyMute },
    daylight: { value: Math.max(0, Math.min(1, (targets.direction.y + 0.22) / 0.16)) }, sunVisibility: { value: visuals.sunVisibility },
    celestialVisibility: { value: visuals.celestialVisibility },
    storm: { value: visuals.rainIntensity / 1.55 },
    cloudNoise: { value: noiseTexture },
    lowCover: { value: visuals.lowCloudCover }, highCover: { value: visuals.highCloudCover },
    cloudDepth: { value: visuals.cloudDepth }, flatness: { value: visuals.cloudFlatness },
    raggedness: { value: visuals.cloudRaggedness }, waves: { value: visuals.cloudWaves },
    opticalDepth: { value: visuals.cloudOpticalDepth },
    marchSteps: { value: 36 },
  }));

  useFrame((state, delta) => {
    const uniforms = materialRef.current?.uniforms;
    if (!uniforms) return;
    const step = Math.min(delta, 0.05);
    // Weather/UI transitions follow elapsed time even in a throttled background tab.
    // Only physical advection uses the capped step, to avoid teleporting clouds on resume.
    const alpha = 1 - Math.exp(-Math.max(delta, 0) * 3);
    uniforms.topColor.value.lerp(targets.top, alpha);
    uniforms.horizonColor.value.lerp(targets.horizon, alpha);
    uniforms.sunColor.value.lerp(targets.sun, alpha);
    uniforms.cloudColor.value.lerp(targets.cloud, alpha);
    uniforms.sunDirection.value.lerp(targets.direction, alpha).normalize();
    // Smooth clock ticks, and place the Moon immediately after a location or preview jump.
    const moonAlpha = uniforms.moonDirection.value.dot(targets.moonDirection) > 0.999 ? alpha : 1;
    uniforms.moonDirection.value.lerp(targets.moonDirection, moonAlpha).normalize();
    uniforms.moonLightDirection.value.lerp(targets.moonLightDirection, moonAlpha).normalize();
    uniforms.moonSinRadius.value += (moon.sinRadius - uniforms.moonSinRadius.value) * moonAlpha;
    uniforms.moonFraction.value += (moon.fraction - uniforms.moonFraction.value) * moonAlpha;
    const approach = (current: number, target: number) => current + (target - current) * alpha;
    uniforms.cover.value = approach(uniforms.cover.value, visuals.cloudCover);
    uniforms.lowCover.value = approach(uniforms.lowCover.value, visuals.lowCloudCover);
    uniforms.highCover.value = approach(uniforms.highCover.value, visuals.highCloudCover);
    uniforms.cloudDepth.value = approach(uniforms.cloudDepth.value, visuals.cloudDepth);
    uniforms.flatness.value = approach(uniforms.flatness.value, visuals.cloudFlatness);
    uniforms.raggedness.value = approach(uniforms.raggedness.value, visuals.cloudRaggedness);
    uniforms.waves.value = approach(uniforms.waves.value, visuals.cloudWaves);
    uniforms.opticalDepth.value = approach(uniforms.opticalDepth.value, visuals.cloudOpticalDepth);
    uniforms.marchSteps.value = state.size.width < 600 ? 22 : 36;
    uniforms.haze.value = approach(uniforms.haze.value, visuals.skyMute);
    uniforms.sunVisibility.value = approach(uniforms.sunVisibility.value, visuals.sunVisibility);
    uniforms.celestialVisibility.value = approach(uniforms.celestialVisibility.value, visuals.celestialVisibility);
    uniforms.storm.value = approach(uniforms.storm.value, visuals.rainIntensity / 1.55);
    uniforms.daylight.value = approach(uniforms.daylight.value, Math.max(0, Math.min(1, (targets.direction.y + 0.22) / 0.16)));
    const speed = Math.max(0, Math.min(windSpeed, 100)) * 0.00045;
    const angle = windDirection * Math.PI / 180;
    uniforms.cloudOffset.value.x -= Math.sin(angle) * speed * step;
    uniforms.cloudOffset.value.y += Math.cos(angle) * speed * step;
  });

  return (
    <mesh renderOrder={-100}>
      <sphereGeometry args={[500, 48, 24]} />
      <shaderMaterial key={fragmentShader} ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
        uniforms={uniforms} side={BackSide} depthWrite={false} fog={false} toneMapped={false} />
    </mesh>
  );
}
