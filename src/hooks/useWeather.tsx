'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type WeatherCondition = 'clear' | 'partly-cloudy' | 'overcast' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';

export type WeatherData = {
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  weatherCode: number;
  isDay: boolean;
  // Solar times are Unix timestamps in milliseconds, independent of the browser time zone.
  sunrise: number | null;
  sunset: number | null;
  location: 'local' | 'Prague';
};

type WeatherState = {
  weather: WeatherData | null;
  now: number | null;
  error: boolean;
};

const WeatherContext = createContext<WeatherState | null>(null);
const PRAGUE = { lat: 50.0755, lon: 14.4378 };
const REFRESH_INTERVAL = 15 * 60 * 1000;

function mapWeatherCode(code: number): WeatherCondition {
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'partly-cloudy';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 97, 99].includes(code)) return 'thunderstorm';
  throw new Error(`Unknown weather code: ${code}`);
}

async function fetchWeather(
  { lat, lon }: typeof PRAGUE,
  location: WeatherData['location'],
  signal: AbortSignal,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,wind_direction_10m,cloud_cover,is_day',
    daily: 'sunrise,sunset',
    timezone: 'auto',
    timeformat: 'unixtime',
    forecast_days: '1',
    wind_speed_unit: 'kmh',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();
  const c = data.current;
  const measurements = [c?.temperature_2m, c?.relative_humidity_2m, c?.wind_speed_10m, c?.wind_direction_10m, c?.cloud_cover, c?.weather_code];
  if (!measurements.every(Number.isFinite) || ![0, 1].includes(c?.is_day)) {
    throw new Error('Invalid weather data');
  }
  const sunrise = data.daily?.sunrise?.[0];
  const sunset = data.daily?.sunset?.[0];

  return {
    condition: mapWeatherCode(c.weather_code),
    temperature: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    windSpeed: Math.max(0, c.wind_speed_10m),
    windDirection: c.wind_direction_10m,
    cloudCover: Math.min(100, Math.max(0, c.cloud_cover)),
    weatherCode: c.weather_code,
    isDay: c.is_day === 1,
    sunrise: Number.isFinite(sunrise) && sunrise > 0 ? sunrise * 1000 : null,
    sunset: Number.isFinite(sunset) && sunset > 0 ? sunset * 1000 : null,
    location,
  };
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10_000, maximumAge: REFRESH_INTERVAL });
  });
}

// Shares one location lookup and one weather request across consumers. Refreshes every
// 15 minutes and on return to the page. Failed refreshes retain the last weather data.
export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loading = false;
    let located = false;
    let lastRefresh = 0;
    let position = PRAGUE;
    let location: WeatherData['location'] = 'Prague';
    let controller: AbortController | undefined;

    async function load() {
      if (loading || cancelled) return;
      loading = true;
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(), 12_000);
      try {
        let data: WeatherData;
        try {
          data = await fetchWeather(position, location, controller.signal);
        } catch (err) {
          if (location === 'Prague' || controller.signal.aborted) throw err;
          data = await fetchWeather(PRAGUE, 'Prague', controller.signal);
        }
        if (!cancelled) {
          setWeather(data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        window.clearTimeout(timeout);
        lastRefresh = Date.now();
        loading = false;
      }
    }

    async function start() {
      try {
        const pos = await getPosition();
        position = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        location = 'local';
      } catch {
        // The existing location fallback uses Prague when geolocation is unavailable.
      }
      located = true;
      await load();
    }

    function resume() {
      if (document.visibilityState !== 'visible') return;
      setNow(Date.now());
      if (located && Date.now() - lastRefresh >= REFRESH_INTERVAL) void load();
    }

    void start();
    const initialTick = window.setTimeout(() => setNow(Date.now()), 0);
    const clock = window.setInterval(() => setNow(Date.now()), 30_000);
    const refresh = window.setInterval(() => void load(), REFRESH_INTERVAL);
    document.addEventListener('visibilitychange', resume);
    return () => {
      cancelled = true;
      controller?.abort();
      window.clearTimeout(initialTick);
      window.clearInterval(clock);
      window.clearInterval(refresh);
      document.removeEventListener('visibilitychange', resume);
    };
  }, []);

  return <WeatherContext.Provider value={{ weather, now, error }}>{children}</WeatherContext.Provider>;
}

// Returns the shared weather and clock. Both stay null until client loading starts.
export function useWeather() {
  const state = useContext(WeatherContext);
  if (!state) throw new Error('useWeather must be used within WeatherProvider');
  return state;
}
