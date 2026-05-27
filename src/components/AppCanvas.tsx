'use client'
import { Cloud, Clouds, Sky as SkyImpl } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Group, InstancedMesh, MeshLambertMaterial, Object3D, Object3DEventMap } from "three";
import { useWeather, type WeatherCondition } from "@/hooks/useWeather";

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
  rainIntensity: number;
  cloudCount: number;
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
    rainIntensity: 0,
    cloudCount: 4,
  },
  'partly-cloudy': {
    cloudColor: '#f0f0f0',
    cloudOpacity: 0.7,
    turbidity: 1,
    rayleigh: 1,
    sunPosition: [100, 20, 100],
    ambientIntensity: Math.PI / 2,
    speedMultiplier: 1.2,
    rainIntensity: 0,
    cloudCount: 6,
  },
  overcast: {
    cloudColor: '#b0b0b0',
    cloudOpacity: 0.9,
    turbidity: 10,
    rayleigh: 2,
    sunPosition: [100, 10, 100],
    ambientIntensity: Math.PI / 3,
    speedMultiplier: 0.8,
    rainIntensity: 0,
    cloudCount: 8,
  },
  fog: {
    cloudColor: '#d0d0d0',
    cloudOpacity: 1,
    turbidity: 20,
    rayleigh: 4,
    sunPosition: [100, 5, 100],
    ambientIntensity: Math.PI / 4,
    speedMultiplier: 0.3,
    rainIntensity: 0,
    cloudCount: 10,
  },
  drizzle: {
    cloudColor: '#707070',
    cloudOpacity: 0.9,
    turbidity: 12,
    rayleigh: 3,
    sunPosition: [40, 8, 40],
    ambientIntensity: Math.PI / 3.5,
    speedMultiplier: 1.5,
    rainIntensity: 0.3,
    cloudCount: 8,
  },
  rain: {
    cloudColor: '#3a3a3a',
    cloudOpacity: 1,
    turbidity: 18,
    rayleigh: 4,
    sunPosition: [30, 3, 30],
    ambientIntensity: Math.PI / 5,
    speedMultiplier: 2.5,
    rainIntensity: 1.2,
    cloudCount: 12,
  },
  snow: {
    cloudColor: '#e0e0e0',
    cloudOpacity: 0.85,
    turbidity: 5,
    rayleigh: 1,
    sunPosition: [100, 15, 100],
    ambientIntensity: Math.PI / 2.5,
    speedMultiplier: 0.5,
    rainIntensity: 0,
    cloudCount: 6,
  },
  thunderstorm: {
    cloudColor: '#2a2a2a',
    cloudOpacity: 1,
    turbidity: 25,
    rayleigh: 5,
    sunPosition: [10, 2, 10],
    ambientIntensity: Math.PI / 8,
    speedMultiplier: 5,
    rainIntensity: 2,
    cloudCount: 16,
  },
};

const DEFAULT_VISUALS = VISUALS.clear;

function Sky({ windSpeed, visuals }: { windSpeed?: number; visuals: WeatherVisuals }) {
  const cloudRefs = useRef<(Group<Object3DEventMap> | null)[]>([]);

  const windFactor = windSpeed ? Math.max(0.5, windSpeed / 20) : 1;

  const [cloudConfigs] = useState<CloudConfig[]>(() =>
    Array.from({ length: 16 }, () => ({
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
          {cloudConfigs.slice(0, visuals.cloudCount).map((config, i) => (
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

function Rain({ intensity }: { intensity: number }) {
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

export const AppCanvas = () => {
  const weather = useWeather();
  const visuals = weather ? VISUALS[weather.condition] : DEFAULT_VISUALS;

  const accentColor = visuals.rainIntensity > 0 ? '#808080' : 'red';
  const accentScale = visuals.rainIntensity > 0 ? 0.1 : 1;

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <Sky windSpeed={weather?.windSpeed} visuals={visuals} />
        <Rain intensity={visuals.rainIntensity} />
        <ambientLight intensity={visuals.ambientIntensity} />
        <spotLight position={[0, 40, 0]} decay={0} distance={45} penumbra={1} intensity={100} />
        <spotLight position={[-20, 0, 10]} color={accentColor} angle={0.15} decay={0} penumbra={-1} intensity={30 * accentScale} />
        <spotLight position={[20, -10, 10]} color={accentColor} angle={0.2} decay={0} penumbra={-1} intensity={20 * accentScale} />
      </Canvas>
    </div>
  );
};
