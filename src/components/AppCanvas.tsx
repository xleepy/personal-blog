'use client';
import { Canvas } from '@react-three/fiber';
import { useWeather } from '@/hooks/useWeather';
import {
  DEFAULT_WEATHER_VISUALS,
  getTimeOfDay,
  Rain,
  SceneBackground,
  Sky,
  TIME_VISUALS,
  WEATHER_VISUALS,
} from './canvas';

export const AppCanvas = () => {
  const weather = useWeather();
  const visuals = weather ? WEATHER_VISUALS[weather.condition] : DEFAULT_WEATHER_VISUALS;
  const { period } = getTimeOfDay();
  const timeVisuals = TIME_VISUALS[period];
  const blendedAmbient = timeVisuals.ambientIntensity * (visuals.ambientIntensity / (Math.PI / 1.5));

  const accentColor = visuals.rainIntensity > 0 ? '#808080' : 'red';
  const accentScale = visuals.rainIntensity > 0 ? 0.1 : 1;

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <SceneBackground timeVisuals={timeVisuals} />
        <Sky windSpeed={weather?.windSpeed} visuals={visuals} />
        <Rain intensity={visuals.rainIntensity} />
        <ambientLight intensity={blendedAmbient} />
        <spotLight position={[0, 40, 0]} decay={0} distance={45} penumbra={1} intensity={100} />
        <spotLight
          position={[-20, 0, 10]}
          color={accentColor}
          angle={0.15}
          decay={0}
          penumbra={-1}
          intensity={30 * accentScale}
        />
        <spotLight
          position={[20, -10, 10]}
          color={accentColor}
          angle={0.2}
          decay={0}
          penumbra={-1}
          intensity={20 * accentScale}
        />
      </Canvas>
    </div>
  );
};
