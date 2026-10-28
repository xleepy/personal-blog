'use client';
import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
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
  const { weather, status, source } = useWeather();

  const Icon = weather ? ICON_MAP[weather.condition] : Cloud;
  const label = weather
    ? [LABEL_MAP[weather.condition], status === 'stale' ? 'Stale' : status === 'refreshing' ? 'Refreshing…' : null, source === 'prague' ? 'Prague fallback' : null].filter(Boolean).join(' · ')
    : status === 'unavailable' ? 'Weather unavailable' : 'Loading weather…';
  const temperature = weather ? Math.round(weather.temperature) : null;

  return (
    <div className="win98-weather-tray" role="status" title={label} aria-label={`${temperature !== null ? `${temperature}°C · ` : ''}${label}`}>
      <Icon aria-hidden="true" size={18} />
      <span className="font-bold">{temperature !== null ? `${temperature}°C${status === 'stale' ? '*' : ''}` : '—°'}</span>
      <span className="hidden truncate sm:inline">{label}</span>
    </div>
  );
}
