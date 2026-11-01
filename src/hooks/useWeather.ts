'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type WeatherCondition = 'clear' | 'partly-cloudy' | 'overcast' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';

export type WeatherData = {
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  cloudCover?: number;
  cloudCoverLow?: number;
  cloudCoverMid?: number;
  cloudCoverHigh?: number;
  precipitation?: number; // mm/hour equivalent
  windDirection?: number;
  latitude: number;
  longitude: number;
};

export type WeatherState = {
  weather: WeatherData | null;
  status: 'loading' | 'ready' | 'refreshing' | 'stale' | 'unavailable';
  source: 'location' | 'prague' | null;
  updatedAt: number | null;
};

const PRAGUE = { lat: 50.0755, lon: 14.4378 };
const REFRESH_INTERVAL = 15 * 60 * 1000;
const REQUEST_TIMEOUT = 10000;
const INITIAL_STATE: WeatherState = {
  weather: null,
  status: 'loading',
  source: null,
  updatedAt: null,
};

export const WeatherContext = createContext<WeatherState | null>(null);

function mapWeatherCode(code: number): WeatherCondition {
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'partly-cloudy';
  if (code === 3) return 'overcast';
  if ([45, 48].includes(code)) return 'fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 97, 99].includes(code)) return 'thunderstorm';
  throw new Error('Unknown weather code');
}

async function fetchWeather(lat: number, lon: number, signal: AbortSignal): Promise<WeatherData> {
  const request = new AbortController();
  const abort = () => request.abort();
  signal.addEventListener('abort', abort, { once: true });
  if (signal.aborted) request.abort();
  const timeout = window.setTimeout(abort, REQUEST_TIMEOUT);

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,cloud_cover,precipitation,wind_direction_10m,cloud_cover_low,cloud_cover_mid,cloud_cover_high`,
      { signal: request.signal },
    );
    if (!res.ok) throw new Error('Weather fetch failed');
    const data = await res.json();
    const c = data.current;
    if (!c || ![c.weather_code, c.temperature_2m, c.relative_humidity_2m, c.wind_speed_10m].every(Number.isFinite)) {
      throw new Error('Invalid weather response');
    }
    return {
      condition: mapWeatherCode(c.weather_code),
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      weatherCode: c.weather_code,
      cloudCover: Number.isFinite(c.cloud_cover) ? Math.min(100, Math.max(0, c.cloud_cover)) : undefined,
      cloudCoverLow: Number.isFinite(c.cloud_cover_low) ? Math.min(100, Math.max(0, c.cloud_cover_low)) : undefined,
      cloudCoverMid: Number.isFinite(c.cloud_cover_mid) ? Math.min(100, Math.max(0, c.cloud_cover_mid)) : undefined,
      cloudCoverHigh: Number.isFinite(c.cloud_cover_high) ? Math.min(100, Math.max(0, c.cloud_cover_high)) : undefined,
      precipitation: Number.isFinite(c.precipitation)
        ? Math.max(0, c.precipitation) * 3600 / (Number.isFinite(c.interval) && c.interval > 0 ? c.interval : 900)
        : undefined,
      windDirection: Number.isFinite(c.wind_direction_10m) ? ((c.wind_direction_10m % 360) + 360) % 360 : undefined,
      latitude: lat,
      longitude: lon,
    };
  } finally {
    window.clearTimeout(timeout);
    signal.removeEventListener('abort', abort);
  }
}

function getPosition(signal: AbortSignal): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    if (signal.aborted) {
      reject(new DOMException('Location request cancelled', 'AbortError'));
      return;
    }
    let settled = false;
    const settle = (complete: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
      complete();
    };
    const abort = () => {
      settle(() => reject(new DOMException('Location request cancelled', 'AbortError')));
    };
    // The native timeout can exclude time spent waiting for permission.
    const timeout = window.setTimeout(
      () => settle(() => reject(new Error('Location request timed out'))),
      REQUEST_TIMEOUT,
    );
    signal.addEventListener('abort', abort, { once: true });
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => settle(() => resolve(position)),
        (error) => settle(() => reject(error)),
        { timeout: REQUEST_TIMEOUT, maximumAge: REFRESH_INTERVAL },
      );
    } catch (error) {
      settle(() => reject(error));
    }
  });
}

export function useWeatherState(): WeatherState {
  const [state, setState] = useState<WeatherState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;
    let loading = false;
    let controller: AbortController | null = null;
    let current = INITIAL_STATE;
    let coordinates: { lat: number; lon: number; source: 'location' | 'prague' } | null = null;

    function publish(next: WeatherState) {
      if (cancelled) return;
      current = next;
      setState(next);
    }

    async function load() {
      if (loading || cancelled) return;
      loading = true;
      controller = new AbortController();
      const signal = controller.signal;
      publish({ ...current, status: current.weather ? 'refreshing' : 'loading' });

      try {
        if (!coordinates) {
          try {
            const pos = await getPosition(signal);
            coordinates = { lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'location' };
          } catch {
            if (signal.aborted) return;
            coordinates = { ...PRAGUE, source: 'prague' };
          }
        }

        let source = coordinates.source;
        let weather: WeatherData;
        try {
          weather = await fetchWeather(coordinates.lat, coordinates.lon, signal);
        } catch {
          if (signal.aborted) return;
          if (source === 'prague') throw new Error('Weather unavailable');
          weather = await fetchWeather(PRAGUE.lat, PRAGUE.lon, signal);
          source = 'prague';
        }
        publish({ weather, status: 'ready', source, updatedAt: Date.now() });
      } catch {
        if (!signal.aborted) publish({ ...current, status: current.weather ? 'stale' : 'unavailable' });
      } finally {
        loading = false;
      }
    }

    const refreshIfStale = () => {
      if (document.visibilityState === 'visible' && (current.updatedAt === null || Date.now() - current.updatedAt >= REFRESH_INTERVAL)) {
        void load();
      }
    };

    void load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, REFRESH_INTERVAL);
    document.addEventListener('visibilitychange', refreshIfStale);
    window.addEventListener('focus', refreshIfStale);
    return () => {
      cancelled = true;
      controller?.abort();
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshIfStale);
      window.removeEventListener('focus', refreshIfStale);
    };
  }, []);

  return state;
}

export function useWeather(): WeatherState {
  const state = useContext(WeatherContext);
  if (!state) throw new Error('useWeather must be used within WeatherProvider');
  return state;
}
