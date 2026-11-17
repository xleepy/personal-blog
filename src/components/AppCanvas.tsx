'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useThree } from '@react-three/fiber';
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
import { blendColor } from './canvas/utils';
import { WeatherCanvas } from './canvas/WeatherCanvas';

const WeatherDebugPanel = process.env.NODE_ENV === 'development'
  ? dynamic(() => import('./WeatherDebugPanel'), { ssr: false })
  : null;

const SKY_FRAME_INTERVAL = 1000 / 24;

function SkyFrameBudget({ reducedMotion }: { reducedMotion: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    let timer: number | undefined;
    const update = () => {
      window.clearInterval(timer);
      if (!document.hidden) {
        invalidate();
        if (!reducedMotion) timer = window.setInterval(() => invalidate(), SKY_FRAME_INTERVAL);
      }
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
      window.clearInterval(timer);
    };
  }, [invalidate, reducedMotion]);

  return null;
}

export const AppCanvas = () => {
  const { weather: liveWeather, location } = useWeather();
  const [debug, setDebug] = useState(DEFAULT_DEBUG_SETTINGS);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const weather = process.env.NODE_ENV === 'development' ? getDebugWeather(liveWeather, debug) : liveWeather;
  const visuals = getAtmosphere(weather, process.env.NODE_ENV === 'development' ? debug.clouds : 'auto');
  const liveTime = useTimeOfDay(location?.latitude, location?.longitude);
  const sky = (process.env.NODE_ENV === 'development' ? getDebugTime(debug) : null) ?? liveTime;
  const { period, timeVisuals } = sky;
  const debugActive = process.env.NODE_ENV === 'development' && isWeatherDebugActive(debug);
  const fallbackTop = blendColor(timeVisuals.zenithColor, timeVisuals.cloudTint, visuals.skyMute);
  const fallbackHorizon = blendColor(timeVisuals.horizonColor, timeVisuals.cloudTint, visuals.skyMute);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

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
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true"
        style={reducedMotion === null ? undefined : { background: `linear-gradient(${fallbackTop}, ${fallbackHorizon})` }}>
        {reducedMotion !== null && (
          <WeatherCanvas>
            <SkyFrameBudget reducedMotion={reducedMotion} />
            <SceneBackground timeVisuals={timeVisuals} visuals={visuals} />
            <Sky windSpeed={weather?.windSpeed} windDirection={weather?.windDirection} visuals={visuals}
              sky={sky} reducedMotion={reducedMotion} />
            <Rain intensity={visuals.rainIntensity} precipitation={visuals.precipitation}
              windSpeed={weather?.windSpeed} windDirection={weather?.windDirection} reducedMotion={reducedMotion} />
            <Lightning active={!reducedMotion && weather?.condition === 'thunderstorm'} />
          </WeatherCanvas>
        )}
      </div>
      {WeatherDebugPanel && <WeatherDebugPanel settings={debug} onChange={setDebug} weather={weather} />}
    </>
  );
};
