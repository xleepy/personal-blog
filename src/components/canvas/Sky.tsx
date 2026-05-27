import { Cloud, Clouds, Sky as SkyImpl } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Group, MeshLambertMaterial, Object3DEventMap } from 'three';
import { blendColor, getTimeOfDay } from './utils';
import { TIME_VISUALS } from './constants';
import type { CloudConfig, WeatherVisuals } from './types';

export function Sky({ windSpeed, visuals }: { windSpeed?: number; visuals: WeatherVisuals }) {
  const cloudRefs = useRef<(Group<Object3DEventMap> | null)[]>([]);

  const windFactor = windSpeed ? Math.max(0.5, windSpeed / 20) : 1;
  const { period } = getTimeOfDay();
  const timeVisuals = TIME_VISUALS[period];

  const blendedCloudColor = blendColor(timeVisuals.cloudTint, visuals.cloudColor, 0.5);
  const blendedSunPosition: [number, number, number] = [
    timeVisuals.sunPosition[0],
    timeVisuals.sunPosition[1],
    timeVisuals.sunPosition[2],
  ];

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
      <SkyImpl
        sunPosition={blendedSunPosition}
        turbidity={visuals.turbidity}
        rayleigh={visuals.rayleigh}
      />
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
