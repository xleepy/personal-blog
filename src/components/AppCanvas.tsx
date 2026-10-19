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
  const { weather, now } = useWeather();
  const preset = weather ? WEATHER_VISUALS[weather.condition] : DEFAULT_WEATHER_VISUALS;
  const visuals = {
    ...preset,
    cloudCount: weather
      ? weather.cloudCover === 0 ? 0 : Math.ceil(preset.cloudCount * (0.35 + weather.cloudCover * 0.0065))
      : preset.cloudCount,
  };
  const { period, nextPeriod, blend } = now === null
    ? { period: 'night', nextPeriod: 'night', blend: 0 } as const
    : getTimeOfDay(now, weather);

  useEffect(() => {
    if (now !== null) document.documentElement.setAttribute('data-time', period);
  }, [period, now]);

  useEffect(() => {
    document.documentElement.setAttribute('data-weather', weather?.condition ?? 'unknown');
  }, [weather?.condition]);

  const currentPeriodVisuals = TIME_VISUALS[period];
  const nextPeriodVisuals = TIME_VISUALS[nextPeriod];

  const timeVisuals = blendTimeVisuals(currentPeriodVisuals, nextPeriodVisuals, blend);
  const blendedAmbient = timeVisuals.ambientIntensity * (visuals.ambientIntensity / (Math.PI / 1.5));
  const daylight = Math.min(1, timeVisuals.ambientIntensity / (Math.PI / 1.5));
  const weatherLightColor = blendColor(timeVisuals.cloudTint, visuals.cloudColor, daylight);
  const lightWeatherBlend = Math.min(0.85, visuals.skyMute + visuals.rainIntensity * 0.12);
  const skyLightColor = blendColor(timeVisuals.zenithColor, weatherLightColor, lightWeatherBlend * 0.45);
  const groundLightColor = blendColor(timeVisuals.horizonColor, weatherLightColor, lightWeatherBlend);
  const sunColor = blendColor(timeVisuals.sunGlowColor, weatherLightColor, Math.min(0.75, lightWeatherBlend));
  const sunIntensity = 2.4 * visuals.sunVisibility * Math.min(1, Math.max(0, timeVisuals.sunPosition[1]) / 25);

  if (now === null) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <Canvas dpr={[1, 1.5]}>
        <SceneBackground timeVisuals={timeVisuals} visuals={visuals} />
        <Sky
          windSpeed={weather?.windSpeed}
          windDirection={weather?.windDirection}
          cloudCover={weather?.cloudCover}
          visuals={visuals}
          timeVisuals={timeVisuals}
        />
        <Rain intensity={visuals.rainIntensity} precipitation={visuals.precipitation} />
        <Lightning active={weather?.condition === 'thunderstorm'} />
        <ambientLight intensity={blendedAmbient} />
        <hemisphereLight args={[skyLightColor, groundLightColor, blendedAmbient * 0.55]} />
        <directionalLight
          // Cloud particles face the camera. Reflect depth to light their visible surfaces.
          position={[timeVisuals.sunPosition[0], timeVisuals.sunPosition[1], Math.abs(timeVisuals.sunPosition[2])]}
          color={sunColor}
          intensity={sunIntensity}
        />
      </Canvas>
    </div>
  );
};
