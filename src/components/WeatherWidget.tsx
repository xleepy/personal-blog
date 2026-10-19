'use client';
import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Moon,
  Sun,
  Wind,
  type Icon as FeatherIcon,
} from 'react-feather';
import { useWeather, type WeatherCondition } from '@/hooks/useWeather';

const ICON_MAP: Record<WeatherCondition, FeatherIcon> = {
  clear: Sun,
  'partly-cloudy': Cloud,
  overcast: Cloud,
  fog: Wind,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  thunderstorm: CloudLightning,
};

const LABEL_MAP: Record<WeatherCondition, string> = {
  clear: 'Clear',
  'partly-cloudy': 'Partly cloudy',
  overcast: 'Overcast',
  fog: 'Fog',
  drizzle: 'Drizzle',
  rain: 'Rain',
  snow: 'Snow',
  thunderstorm: 'Thunderstorm',
};

export default function WeatherWidget() {
  const { weather, now, error } = useWeather();

  const condition: WeatherCondition = weather?.condition ?? 'clear';
  const isDay = weather?.sunrise != null && weather?.sunset != null && now !== null
    ? now >= weather.sunrise && now < weather.sunset
    : weather?.isDay ?? true;
  const Icon = condition === 'clear' && !isDay ? Moon : ICON_MAP[condition];
  const label = weather ? LABEL_MAP[condition] : error ? 'Weather unavailable' : 'Loading…';
  const temperature = weather ? Math.round(weather.temperature) : null;
  const description = weather
    ? `${weather.location === 'Prague' ? 'Prague' : 'Local weather'} · ${label} · ${weather.cloudCover}% cloud cover · Wind ${Math.round(weather.windSpeed)} km/h${error ? ' · Last available data' : ''}`
    : label;

  return (
    <div className="win98-weather-tray" role="status" title={description}>
      <Icon aria-hidden="true" size={18} />
      <span className="font-bold">{temperature !== null ? `${temperature}°C` : '—°'}</span>
      <span className="hidden truncate sm:inline">{label}</span>
    </div>
  );
}
