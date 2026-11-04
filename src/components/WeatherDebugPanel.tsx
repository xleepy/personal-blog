'use client';

import type { WeatherData } from '@/hooks/useWeather';
import { DEFAULT_DEBUG_SETTINGS, type WeatherDebugSettings } from '@/components/canvas/debug';
import styles from './WeatherDebugPanel.module.css';

type Props = {
  settings: WeatherDebugSettings;
  onChange: (settings: WeatherDebugSettings) => void;
  weather: WeatherData | null;
};

type Measurement = 'cloudCover' | 'precipitation' | 'windSpeed' | 'windDirection';

const measurements: { key: Measurement; label: string; unit: string; max: number; step: number; fallback: number }[] = [
  { key: 'cloudCover', label: 'Облачность', unit: '%', max: 100, step: 1, fallback: 50 },
  { key: 'precipitation', label: 'Осадки', unit: 'мм/ч', max: 10, step: 0.1, fallback: 1 },
  { key: 'windSpeed', label: 'Скорость ветра', unit: 'км/ч', max: 80, step: 1, fallback: 10 },
  { key: 'windDirection', label: 'Направление ветра', unit: '°', max: 360, step: 15, fallback: 180 },
];

export default function WeatherDebugPanel({ settings, onChange, weather }: Props) {
  const active = settings.weather !== 'live' || settings.time !== 'live' || settings.clouds !== 'auto' || measurements.some(({ key }) => settings[key] !== null);
  const hour = Math.floor(settings.hour);
  const minutes = Math.round((settings.hour - hour) * 60);

  return (
    <details className={`win98-window ${styles.panel}`} open>
      <summary className={styles.title}>Отладка неба {active && <span>• Предпросмотр</span>}</summary>
      <div className={styles.content}>
        <label className={styles.selectField}>
          Погода
          <select value={settings.weather} onChange={(event) => onChange({ ...settings, weather: event.target.value as WeatherDebugSettings['weather'] })}>
            <option value="live">Текущая</option>
            <option value="clear">Ясно</option>
            <option value="partly-cloudy">Переменная облачность</option>
            <option value="overcast">Пасмурно</option>
            <option value="fog">Туман</option>
            <option value="drizzle">Морось</option>
            <option value="rain">Дождь</option>
            <option value="snow">Снег</option>
            <option value="thunderstorm">Гроза</option>
            <option value="unavailable">Недоступна</option>
          </select>
        </label>
        <label className={styles.selectField}>
          Тип облаков
          <select value={settings.clouds} disabled={settings.weather === 'unavailable'} onChange={(event) => onChange({ ...settings, clouds: event.target.value as WeatherDebugSettings['clouds'] })}>
            <option value="auto">Авто по погоде</option>
            <option value="cumulus">Кучевые</option>
            <option value="stratus">Слоистые — ровный слой (nebulosus)</option>
            <option value="stratus-fractus">Слоистые — рваные (fractus)</option>
            <option value="stratus-undulatus">Слоистые — волнистые (undulatus)</option>
            <option value="stratus-translucidus">Слоистые — просвечивающие</option>
            <option value="stratocumulus">Слоисто-кучевые</option>
            <option value="cirrus">Перистые — тонкие</option>
            <option value="mixed">Смешанные слои</option>
          </select>
        </label>
        <label className={styles.selectField}>
          Время суток
          <select value={settings.time} onChange={(event) => onChange({ ...settings, time: event.target.value as WeatherDebugSettings['time'] })}>
            <option value="live">Текущее</option>
            <option value="night">Ночь</option>
            <option value="sunrise">Рассвет</option>
            <option value="morning">Утро</option>
            <option value="midday">Полдень</option>
            <option value="afternoon">День</option>
            <option value="sunset">Закат</option>
            <option value="dusk">Сумерки</option>
            <option value="custom">Своё время</option>
          </select>
        </label>
        {settings.time === 'custom' && (
          <>
            <label className={styles.rangeField}>
              <span>Дата UTC</span>
              <input type="date" value={settings.date} onChange={(event) => onChange({ ...settings, date: event.target.value })} />
            </label>
            <label className={styles.rangeField}>
              <span>Время UTC: {String(hour).padStart(2, '0')}:{String(minutes).padStart(2, '0')}</span>
              <input type="range" min="0" max="23.75" step="0.25" value={settings.hour} onChange={(event) => onChange({ ...settings, hour: Number(event.target.value) })} />
            </label>
          </>
        )}
        <p className={styles.note}>Пресеты времени: Прага, равноденствие.</p>
        <fieldset className={styles.measurements} disabled={settings.weather === 'unavailable'}>
          <legend>Параметры погоды</legend>
          <label className={styles.selectField}>
            Покров неба
            <select value={settings.cloudCover === null ? 'auto' : [0, 5, 20, 40, 70, 100].includes(settings.cloudCover) ? String(settings.cloudCover) : 'custom'} onChange={(event) => onChange({ ...settings, cloudCover: event.target.value === 'auto' ? null : Number(event.target.value) })}>
              <option value="auto">Авто</option>
              <option value="0">0% — без облаков</option>
              <option value="5">5% — единичные</option>
              <option value="20">20% — отдельные</option>
              <option value="40">40% — рассеянные</option>
              <option value="70">70% — разорванный покров</option>
              <option value="100">100% — сплошной</option>
              <option value="custom" disabled>Своё значение</option>
            </select>
          </label>
          {measurements.map(({ key, label, unit, max, step, fallback }) => {
            const value = settings[key];
            const precipitationDisabled = key === 'precipitation' && !['drizzle', 'rain', 'snow', 'thunderstorm'].includes(weather?.condition ?? '');
            return (
              <div className={styles.measurement} key={key}>
                <div className={styles.measurementHeader}>
                  <label htmlFor={`debug-${key}`}>{label}: {value === null ? 'авто' : `${value} ${unit}`}</label>
                  <label><input type="checkbox" aria-label={`${label}: автоматически`} disabled={precipitationDisabled} checked={value === null} onChange={(event) => onChange({ ...settings, [key]: event.target.checked ? null : Math.min(max, Math.max(0, weather?.[key] ?? fallback)) })} /> Авто</label>
                </div>
                <input id={`debug-${key}`} type="range" min="0" max={max} step={step} value={value ?? Math.min(max, Math.max(0, weather?.[key] ?? fallback))} disabled={value === null || precipitationDisabled} onChange={(event) => onChange({ ...settings, [key]: Number(event.target.value) })} />
                {precipitationDisabled && <p className={styles.note}>Выберите морось, дождь, снег или грозу.</p>}
              </div>
            );
          })}
        </fieldset>
        <p className={styles.note}>Панель меняет фон; в трее — текущая погода.</p>
        <button className={`win98-button ${styles.reset}`} type="button" onClick={() => onChange({ ...DEFAULT_DEBUG_SETTINGS })}>Вернуть реальную погоду</button>
      </div>
    </details>
  );
}
