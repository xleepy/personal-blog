'use client'
import { useState, useEffect } from 'react';

export type WeatherCondition = 'clear' | 'partly-cloudy' | 'overcast' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';

export type WeatherData = {
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
};

const PRAGUE = { lat: 50.0755, lon: 14.4378 };

const DEFAULT_WEATHER: WeatherData = {
  condition: 'clear',
  temperature: 20,
  humidity: 50,
  windSpeed: 10,
  weatherCode: 0,
};

function mapWeatherCode(code: number): WeatherCondition {
  if (code === 0) return 'clear';
  if (code <= 2) return 'partly-cloudy';
  if (code === 3) return 'overcast';
  if (code <= 48) return 'fog';
  if (code <= 57) return 'drizzle';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 86) return 'rain';
  return 'thunderstorm';
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m`
  );
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();
  const c = data.current;
  return {
    condition: mapWeatherCode(c.weather_code),
    temperature: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    weatherCode: c.weather_code,
  };
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
  });
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let { lat, lon } = PRAGUE;

      try {
        const pos = await getPosition();
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      } catch {}

      try {
        const data = await fetchWeather(lat, lon);
        if (!cancelled) setWeather(data);
      } catch {
        try {
          const data = await fetchWeather(PRAGUE.lat, PRAGUE.lon);
          if (!cancelled) setWeather(data);
        } catch {
          if (!cancelled) setWeather(DEFAULT_WEATHER);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return weather;
}
