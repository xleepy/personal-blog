'use client'
import { Cloud, Clouds, Sky as SkyImpl } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Group, MeshLambertMaterial, Object3DEventMap } from "three";
import { useWeather, type WeatherCondition, type WeatherData } from "@/hooks/useWeather";

type CloudConfig = {
  position: [number, number, number];
  seed: number;
  speed: number;
};

type WeatherVisuals = {
  cloudColor: string;
  cloudOpacity: number;
  turbidity: number;
  rayleigh: number;
  sunPosition: [number, number, number];
  ambientIntensity: number;
  speedMultiplier: number;
};

const VISUALS: Record<WeatherCondition, WeatherVisuals> = {
  clear: {
    cloudColor: '#ffffff',
    cloudOpacity: 0.4,
    turbidity: 0.1,
    rayleigh: 0.5,
    sunPosition: [100, 20, 100],
    ambientIntensity: Math.PI / 1.5,
    speedMultiplier: 1,
  },
  'partly-cloudy': {
    cloudColor: '#f0f0f0',
    cloudOpacity: 0.7,
    turbidity: 1,
    rayleigh: 1,
    sunPosition: [100, 20, 100],
    ambientIntensity: Math.PI / 2,
    speedMultiplier: 1.2,
  },
  overcast: {
    cloudColor: '#b0b0b0',
    cloudOpacity: 0.9,
    turbidity: 10,
    rayleigh: 2,
    sunPosition: [100, 10, 100],
    ambientIntensity: Math.PI / 3,
    speedMultiplier: 0.8,
  },
  fog: {
    cloudColor: '#d0d0d0',
    cloudOpacity: 1,
    turbidity: 20,
    rayleigh: 4,
    sunPosition: [100, 5, 100],
    ambientIntensity: Math.PI / 4,
    speedMultiplier: 0.3,
  },
  drizzle: {
    cloudColor: '#808080',
    cloudOpacity: 0.85,
    turbidity: 8,
    rayleigh: 2,
    sunPosition: [50, 10, 50],
    ambientIntensity: Math.PI / 3,
    speedMultiplier: 1.5,
  },
  rain: {
    cloudColor: '#606060',
    cloudOpacity: 0.95,
    turbidity: 10,
    rayleigh: 3,
    sunPosition: [50, 5, 50],
    ambientIntensity: Math.PI / 4,
    speedMultiplier: 2,
  },
  snow: {
    cloudColor: '#e0e0e0',
    cloudOpacity: 0.85,
    turbidity: 5,
    rayleigh: 1,
    sunPosition: [100, 15, 100],
    ambientIntensity: Math.PI / 2.5,
    speedMultiplier: 0.5,
  },
  thunderstorm: {
    cloudColor: '#404040',
    cloudOpacity: 1,
    turbidity: 20,
    rayleigh: 4,
    sunPosition: [20, 5, 20],
    ambientIntensity: Math.PI / 6,
    speedMultiplier: 3,
  },
};

const DEFAULT_VISUALS = VISUALS.clear;

function Sky({ weather }: { weather: WeatherData | null }) {
  const cloudRefs = useRef<(Group<Object3DEventMap> | null)[]>([]);

  const visuals = weather ? VISUALS[weather.condition] : DEFAULT_VISUALS;
  const windFactor = weather ? Math.max(0.5, weather.windSpeed / 20) : 1;

  const [cloudConfigs] = useState<CloudConfig[]>(() =>
    Array.from({ length: 6 }, () => ({
      position: [
        (Math.random() - 0.5) * 30,
        Math.random() * 4 + 2,
        -(Math.random() * 10 + 5),
      ] as [number, number, number],
      seed: Math.floor(Math.random() * 100),
      speed: 0.03 + Math.random() * 0.04,
    })),
  );

  useFrame((state) => {
    const clouds = cloudRefs.current.filter(Boolean) as Group<Object3DEventMap>[];
    const { height, width } = state.viewport;
    const widthWithMargin = width + 5;
    clouds.forEach((cloud, index) => {
      const config = cloudConfigs[index];
      const targetPosition = cloud.position.clone();
      targetPosition.x += config.speed * windFactor * visuals.speedMultiplier;
      if (targetPosition.x > widthWithMargin) {
        targetPosition.y = height * (0.5 - Math.random());
        targetPosition.x = -widthWithMargin;
      }
      cloud.position.lerp(targetPosition, 0.01);
    });
  });

  return (
    <>
      <SkyImpl
        sunPosition={visuals.sunPosition}
        turbidity={visuals.turbidity}
        rayleigh={visuals.rayleigh}
      />
      <group>
        <Clouds material={MeshLambertMaterial} limit={400}>
          {cloudConfigs.map((config, i) => (
            <Cloud
              key={i}
              ref={(el) => { cloudRefs.current[i] = el; }}
              position={config.position}
              seed={config.seed}
              color={visuals.cloudColor}
              opacity={visuals.cloudOpacity}
            />
          ))}
        </Clouds>
      </group>
    </>
  );
}

export const AppCanvas = () => {
  const weather = useWeather();
  const visuals = weather ? VISUALS[weather.condition] : DEFAULT_VISUALS;

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <Sky weather={weather} />
        <ambientLight intensity={visuals.ambientIntensity} />
        <spotLight position={[0, 40, 0]} decay={0} distance={45} penumbra={1} intensity={100} />
        <spotLight position={[-20, 0, 10]} color="red" angle={0.15} decay={0} penumbra={-1} intensity={30} />
        <spotLight position={[20, -10, 10]} color="red" angle={0.2} decay={0} penumbra={-1} intensity={20} />
      </Canvas>
    </div>
  );
};
