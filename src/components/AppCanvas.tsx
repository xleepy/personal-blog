'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { useWeather } from '@/hooks/useWeather';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import {
  Lightning,
  Rain,
  SceneBackground,
  Sky,
} from './canvas';
import { getAtmosphere } from './canvas/atmosphere';
import { DEFAULT_DEBUG_SETTINGS, getDebugTime, getDebugWeather, isWeatherDebugActive } from './canvas/debug';

const WeatherDebugPanel = process.env.NODE_ENV === 'development'
  ? dynamic(() => import('./WeatherDebugPanel'), { ssr: false })
  : null;

export const AppCanvas = () => {
  const { weather: liveWeather } = useWeather();
  const [debug, setDebug] = useState(DEFAULT_DEBUG_SETTINGS);
  const weather = process.env.NODE_ENV === 'development' ? getDebugWeather(liveWeather, debug) : liveWeather;
  const visuals = getAtmosphere(weather, process.env.NODE_ENV === 'development' ? debug.clouds : 'auto');
  const liveTime = useTimeOfDay(liveWeather?.latitude, liveWeather?.longitude);
  const { period, timeVisuals } = (process.env.NODE_ENV === 'development' ? getDebugTime(debug) : null) ?? liveTime;
  const debugActive = process.env.NODE_ENV === 'development' && isWeatherDebugActive(debug);

  useEffect(() => {
    if (debugActive) document.documentElement.setAttribute('data-sky-debug', 'true');
    else document.documentElement.removeAttribute('data-sky-debug');
    return () => document.documentElement.removeAttribute('data-sky-debug');
  }, [debugActive]);

  useEffect(() => {
    document.documentElement.setAttribute('data-time', period);
  }, [period]);

  useEffect(() => {
    document.documentElement.setAttribute('data-weather', weather?.condition ?? 'unavailable');
  }, [weather?.condition]);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 60 }}
          onCreated={({ camera }) => camera.lookAt(0, 5.2, -5)}>
          <SceneBackground timeVisuals={timeVisuals} visuals={visuals} />
          <Sky windSpeed={weather?.windSpeed} windDirection={weather?.windDirection} visuals={visuals} timeVisuals={timeVisuals} />
          <Rain intensity={visuals.rainIntensity} precipitation={visuals.precipitation}
            windSpeed={weather?.windSpeed} windDirection={weather?.windDirection} color={timeVisuals.cloudTint} />
          <Lightning active={weather?.condition === 'thunderstorm'} />
        </Canvas>
      </div>
      {WeatherDebugPanel && <WeatherDebugPanel settings={debug} onChange={setDebug} weather={weather} />}
    </>
  );
};
