'use client';
import { useState } from 'react';
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
import GlassContainer from './GlassContainer';
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
  const weather = useWeather();
  const [expanded, setExpanded] = useState(false);

  const condition: WeatherCondition = weather?.condition ?? 'clear';
  const Icon = ICON_MAP[condition];
  const label = weather ? LABEL_MAP[condition] : 'Loading…';
  const temperature = weather ? Math.round(weather.temperature) : null;

  return (
    <div className="fixed bottom-4 right-4 z-20 flex max-w-[calc(100vw-2rem)] flex-col-reverse items-end gap-2 md:bottom-6 md:right-6">
      <GlassContainer
        as="button"
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-label={expanded ? 'Hide weather' : 'Show weather'}
        aria-expanded={expanded}
        className="grid size-11 place-items-center p-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:hidden"
      >
        <Icon aria-hidden="true" className="size-5" />
      </GlassContainer>
      <GlassContainer
        role="status"
        className={`w-max max-w-full p-3 ${expanded ? 'block' : 'hidden'} md:block`}
      >
        <div className="flex items-center gap-3 text-[var(--text-primary)]">
          <Icon aria-hidden="true" className="size-8 shrink-0" />
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-none">
              {temperature !== null ? `${temperature}°C` : '—°'}
            </span>
            <span className="text-xs text-[var(--text-muted)]">{label}</span>
          </div>
        </div>
      </GlassContainer>
    </div>
  );
}
