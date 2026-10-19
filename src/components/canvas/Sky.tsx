import { Cloud, Clouds, type CloudProps } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Group, MeshLambertMaterial, Vector3 } from 'three';
import { blendColor } from './utils';
import { SkyDome } from './SkyDome';
import type { TimeVisuals, WeatherVisuals } from './types';

const MAX_CLOUDS = 20;
const CLOUD_MARGIN = 22;

type CloudConfig = {
  position: [number, number, number];
  seed: number;
  speed: number;
  bounds: [number, number, number];
  scale: [number, number, number];
  segments: number;
  baseSegments: number;
  volume: number;
  opacity: number;
  growth: number;
  evolution: number;
  distribute: NonNullable<CloudProps['distribute']>;
  distributeCrown: NonNullable<CloudProps['distribute']>;
};

// Normalized positions cover the visible sky at any aspect ratio. Each cloud has
// its own depth, silhouette, density, and rate of change. Recycling changes its shape.
function createCloud(): CloudConfig {
  const wispy = Math.random() < 0.25;
  const size = 0.65 + Math.random() * 0.8;
  const segments = 16 + Math.floor(Math.random() * 8);
  const baseSegments = wispy ? segments : Math.floor(segments * 0.45);
  const lobes = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => new Vector3(
    (Math.random() - 0.5) * 1.1,
    0.08 + Math.random() * 0.3,
    (Math.random() - 0.5) * 1.2,
  ));
  const base = Array.from({ length: baseSegments }, (_, index) => ({
    point: new Vector3(
      lobes[index % lobes.length].x + (Math.random() - 0.5) * 0.3,
      -0.15 + (Math.random() - 0.5) * 0.08,
      lobes[index % lobes.length].z + (Math.random() - 0.5) * 0.3,
    ),
    volume: 0.45 + Math.random() * 0.25,
  }));
  const crown = Array.from({ length: segments - baseSegments }, (_, index) => ({
    point: lobes[index % lobes.length].clone().add(new Vector3(
      (Math.random() - 0.5) * 0.45,
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.5,
    )),
    volume: 0.5 + Math.random() * 0.5,
  }));
  return {
    position: [Math.random() * 2 - 1, Math.random() * 1.8 - 0.7, -12 - Math.random() * 32],
    seed: Math.floor(Math.random() * 1_000_000),
    speed: 0.18 + Math.random() * 0.25,
    bounds: [4 + Math.random() * 5, wispy ? 0.2 + Math.random() * 0.4 : 2.2 + Math.random() * 2, 1 + Math.random() * 2],
    scale: [size, size, size],
    segments,
    baseSegments,
    volume: wispy ? 2.5 + Math.random() * 2 : 5 + Math.random() * 4,
    opacity: wispy ? 0.18 + Math.random() * 0.18 : 0.75 + Math.random() * 0.25,
    growth: 0.2 + Math.random() * 0.7,
    evolution: 0.015 + Math.random() * 0.025,
    distribute: (_, index) => base[index],
    distributeCrown: (_, index) => crown[index],
  };
}

// Renders an irregular cloud field. Wind direction is projected onto the sky;
// clouds are replaced beyond the viewport so they never jump or repeat on screen.
export function Sky({
  windSpeed = 0,
  windDirection = 270,
  cloudCover,
  visuals,
  timeVisuals,
}: {
  windSpeed?: number;
  windDirection?: number;
  cloudCover?: number;
  visuals: WeatherVisuals;
  timeVisuals: TimeVisuals;
}) {
  const cloudRefs = useRef<(Group | null)[]>([]);
  const target = useRef(new Vector3());
  const [cloudConfigs, setCloudConfigs] = useState(() => Array.from({ length: MAX_CLOUDS }, createCloud));
  const windFactor = Math.min(3.5, Math.max(0, windSpeed) / 20);
  const windAngle = (windDirection + 180) * Math.PI / 180;
  const windX = Math.sin(windAngle);
  const windY = Math.cos(windAngle) * 0.22;
  const daylight = Math.min(1, timeVisuals.ambientIntensity / (Math.PI / 1.5));
  const cloudWeatherWeight = Math.min(0.85, 0.2 + visuals.skyMute * 0.55);
  const blendedCloudColor = blendColor(timeVisuals.cloudTint, visuals.cloudColor, cloudWeatherWeight * daylight);
  const shadowColor = blendColor(timeVisuals.zenithColor, blendedCloudColor, 0.6 + visuals.skyMute * 0.32);

  useFrame((state, delta) => {
    const replacements = new Map<number, CloudConfig>();
    cloudConfigs.forEach((config, index) => {
      const cloud = cloudRefs.current[index];
      if (!cloud || index >= visuals.cloudCount) return;
      target.current.set(0, 0, config.position[2]);
      const view = state.viewport.getCurrentViewport(state.camera, target.current);
      const halfWidth = view.width / 2 + CLOUD_MARGIN;
      const halfHeight = view.height / 2 + CLOUD_MARGIN;
      if (!cloud.userData.placed) {
        cloud.position.set(config.position[0] * view.width / 2, config.position[1] * view.height / 2, config.position[2]);
        cloud.userData.placed = true;
      }
      const travel = config.speed * windFactor * Math.min(delta, 0.1);
      cloud.position.x += windX * travel;
      cloud.position.y += windY * travel;
      if (Math.abs(cloud.position.x) > halfWidth || Math.abs(cloud.position.y) > halfHeight) {
        const next = createCloud();
        target.current.set(0, 0, next.position[2]);
        const nextView = state.viewport.getCurrentViewport(state.camera, target.current);
        if (Math.abs(cloud.position.x) > halfWidth) {
          cloud.position.set(-Math.sign(windX) * (nextView.width / 2 + CLOUD_MARGIN), next.position[1] * nextView.height / 2, next.position[2]);
        } else {
          cloud.position.set(next.position[0] * nextView.width / 2, -Math.sign(windY) * (nextView.height / 2 + CLOUD_MARGIN), next.position[2]);
        }
        replacements.set(index, next);
      }
    });
    if (replacements.size > 0) {
      setCloudConfigs(current => current.map((config, index) => replacements.get(index) ?? config));
    }
  });

  return (
    <>
      <SkyDome timeVisuals={timeVisuals} visuals={visuals} cloudCover={cloudCover} windSpeed={windSpeed} windDirection={windDirection} />
      <Clouds material={MeshLambertMaterial} limit={MAX_CLOUDS * 24} frustumCulled={false}>
        {cloudConfigs.slice(0, visuals.cloudCount).map((config, index) => (
          <group
            key={index}
            ref={el => { cloudRefs.current[index] = el; }}
            scale={config.scale}
          >
            <Cloud
              seed={config.seed}
              bounds={config.bounds}
              segments={config.baseSegments}
              volume={config.volume}
              distribute={config.distribute}
              growth={config.growth * 0.4}
              speed={config.evolution * (0.25 + windFactor)}
              fade={8}
              color={config.baseSegments === config.segments ? blendedCloudColor : shadowColor}
              opacity={visuals.cloudOpacity * config.opacity}
            />
            {config.segments > config.baseSegments && (
              <Cloud
                seed={config.seed + 1}
                bounds={config.bounds}
                segments={config.segments - config.baseSegments}
                volume={config.volume}
                distribute={config.distributeCrown}
                growth={config.growth}
                speed={config.evolution * (0.25 + windFactor)}
                fade={8}
                color={blendedCloudColor}
                opacity={visuals.cloudOpacity * config.opacity}
              />
            )}
          </group>
        ))}
      </Clouds>
    </>
  );
}
