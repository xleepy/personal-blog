export type CloudConfig = {
  position: [number, number, number];
  seed: number;
  speed: number;
};

export type WeatherVisuals = {
  cloudColor: string;
  cloudOpacity: number;
  turbidity: number;
  rayleigh: number;
  sunPosition: [number, number, number];
  ambientIntensity: number;
  speedMultiplier: number;
  rainIntensity: number;
  precipitation: 'none' | 'rain' | 'snow';
  cloudCount: number;
  fogNear: number;
  fogFar: number;
  skyMute: number;
  sunVisibility: number;
};

export type TimeOfDay = 'night' | 'sunrise' | 'morning' | 'midday' | 'afternoon' | 'sunset' | 'dusk';

export type TimeVisuals = {
  skyColor: string;
  zenithColor: string;
  horizonColor: string;
  sunGlowColor: string;
  sunPosition: [number, number, number];
  ambientIntensity: number;
  cloudTint: string;
};
