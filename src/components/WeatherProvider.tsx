'use client';

import type { ReactNode } from 'react';
import { WeatherContext, useWeatherState } from '@/hooks/useWeather';

export function WeatherProvider({ children }: { children: ReactNode }) {
  const state = useWeatherState();
  return <WeatherContext.Provider value={state}>{children}</WeatherContext.Provider>;
}
