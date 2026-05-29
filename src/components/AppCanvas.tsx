'use client';
import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useWeather } from '@/hooks/useWeather';
import {
  DEFAULT_WEATHER_VISUALS,
  blendColor,
  blendTimeVisuals,
  getTimeOfDay,
  Lightning,
  Rain,
  SceneBackground,
  Sky,
  TIME_VISUALS,
  WEATHER_VISUALS,
} from './canvas';

export const AppCanvas = () => {
  const weather = useWeather();
  const visuals = weather ? WEATHER_VISUALS[weather.condition] : DEFAULT_WEATHER_VISUALS;
  const { period, nextPeriod, blend } = getTimeOfDay();

  useEffect(() => {
    document.documentElement.setAttribute('data-time', period);
  }, [period]);

  const currentPeriodVisuals = TIME_VISUALS[period];
  const nextPeriodVisuals = TIME_VISUALS[nextPeriod];

  const timeVisuals = blendTimeVisuals(currentPeriodVisuals, nextPeriodVisuals, blend);
  const blendedAmbient = timeVisuals.ambientIntensity * (visuals.ambientIntensity / (Math.PI / 1.5));
  const apparentSunPosition = timeVisuals.sunPosition.map(
    (value, index) => value + (visuals.sunPosition[index] - value) * Math.min(0.4, visuals.turbidity / 40),
  ) as [number, number, number];
  const lightWeatherBlend = Math.min(0.85, visuals.skyMute + visuals.rainIntensity * 0.12);
  const skyLightColor = blendColor(timeVisuals.zenithColor, visuals.cloudColor, lightWeatherBlend * 0.45);
  const groundLightColor = blendColor(timeVisuals.horizonColor, visuals.cloudColor, lightWeatherBlend);
  const sunColor = blendColor(timeVisuals.sunGlowColor, visuals.cloudColor, Math.min(0.75, lightWeatherBlend));
  const sunIntensity = Math.max(0.08, 2.4 * visuals.sunVisibility);

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <SceneBackground timeVisuals={timeVisuals} visuals={visuals} />
        <Sky windSpeed={weather?.windSpeed} visuals={visuals} timeVisuals={timeVisuals} />
        <Rain intensity={visuals.rainIntensity} precipitation={visuals.precipitation} />
        <Lightning active={weather?.condition === 'thunderstorm'} />
        <ambientLight intensity={blendedAmbient} />
        <hemisphereLight args={[skyLightColor, groundLightColor, blendedAmbient * 0.55]} />
        <directionalLight
          position={apparentSunPosition}
          color={sunColor}
          intensity={sunIntensity}
        />
      </Canvas>
    </div>
  );
};
