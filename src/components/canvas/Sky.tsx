import { Cloud, Clouds } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Group, MeshLambertMaterial, Object3DEventMap } from 'three';
import { blendColor } from './utils';
import { SkyDome } from './SkyDome';
import type { CloudConfig, TimeVisuals, WeatherVisuals } from './types';

export function Sky({
  windSpeed,
  visuals,
  timeVisuals,
}: {
  windSpeed?: number;
  visuals: WeatherVisuals;
  timeVisuals: TimeVisuals;
}) {
  const cloudRefs = useRef<(Group<Object3DEventMap> | null)[]>([]);

  const windFactor = windSpeed ? Math.max(0.5, windSpeed / 20) : 1;

  const precipitationWeight = visuals.precipitation === 'none' ? 0 : 0.22;
  const cloudWeatherWeight = Math.min(0.9, 0.35 + visuals.skyMute * 0.45 + visuals.rainIntensity * 0.08 + precipitationWeight);
  const blendedCloudColor = blendColor(timeVisuals.cloudTint, visuals.cloudColor, cloudWeatherWeight);

  const [cloudConfigs] = useState<CloudConfig[]>(() =>
    Array.from({ length: 16 }, () => ({
      position: [
        (Math.random() - 0.5) * 30,
        Math.random() * 4 + 2,
        -(Math.random() * 10 + 5),
      ] as [number, number, number],
      seed: Math.floor(Math.random() * 100),
      speed: 0.003 + Math.random() * 0.004,
    })),
  );

  useFrame((state, delta) => {
    const clouds = cloudRefs.current.filter(Boolean) as Group<Object3DEventMap>[];
    const { width } = state.viewport;
    const halfWidth = width / 2 + 25;
    clouds.forEach((cloud, index) => {
      const config = cloudConfigs[index];
      const moveSpeed = config.speed * windFactor * visuals.speedMultiplier * delta * 60;
      cloud.position.x += moveSpeed;
      if (cloud.position.x > halfWidth) {
        cloud.position.x = -halfWidth;
        cloud.position.y = (Math.random() - 0.5) * 6 + 3;
      }
    });
  });

  return (
    <>
      <SkyDome timeVisuals={timeVisuals} visuals={visuals} />
      <group>
        <Clouds material={MeshLambertMaterial} limit={400}>
          {cloudConfigs.slice(0, visuals.cloudCount).map((config, i) => (
            <Cloud
              key={i}
              ref={(el) => {
                cloudRefs.current[i] = el;
              }}
              position={config.position}
              seed={config.seed}
              color={blendedCloudColor}
              opacity={visuals.cloudOpacity}
            />
          ))}
        </Clouds>
      </group>
    </>
  );
}
