/* eslint-disable @typescript-eslint/no-require-imports -- Exercise TypeScript modules in Node. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function load(name) {
  const filename = path.join(__dirname, '../src/components/canvas', `${name}.ts`);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: (id) => id.startsWith('./') ? load(id.slice(2)) : require(id) }, { filename });
  return exports;
}

const { getAtmosphere } = load('atmosphere');
const { DEFAULT_DEBUG_SETTINGS, getDebugWeather, getDebugTime, isWeatherDebugActive } = load('debug');
const live = Object.freeze({
  condition: 'partly-cloudy', weatherCode: 2, temperature: 12, humidity: 55, windSpeed: 8,
  cloudCover: 60, cloudCoverLow: 40, cloudCoverMid: 0, cloudCoverHigh: 50,
  latitude: 89, longitude: 0,
});
const settings = (overrides = {}) => ({ ...DEFAULT_DEBUG_SETTINGS, ...overrides });

test('observed cloud layers select cirrus, stratus, and mixed skies', () => {
  const cirrus = getAtmosphere({ ...live, cloudCoverLow: 0, cloudCoverMid: 0, cloudCoverHigh: 100 });
  assert.equal(cirrus.cloudProfile, 'cirrus');
  assert.equal(cirrus.lowCloudCover, 0);
  assert.equal(cirrus.highCloudCover, 1);
  const stratus = getAtmosphere({ ...live, condition: 'overcast', weatherCode: 3, cloudCoverLow: 100, cloudCoverHigh: 0 });
  assert.equal(stratus.cloudProfile, 'stratus');
  assert.equal(stratus.cloudDepth, 0.28);
  assert.equal(stratus.lowCloudCover, 1);
  assert.equal(stratus.highCloudCover, 0);
  const mixed = getAtmosphere(live);
  assert.equal(mixed.cloudProfile, 'mixed');
  assert.equal(mixed.lowCloudCover, 0.4);
  assert.equal(mixed.highCloudCover, 0.5);
});

test('thunderstorm and shower codes produce deep convective clouds', () => {
  const fair = getAtmosphere({ ...live, cloudCoverHigh: 0 });
  for (const [condition, weatherCode] of [['thunderstorm', 95], ['rain', 80], ['rain', 81], ['rain', 82], ['snow', 85], ['snow', 86]]) {
    const cloud = getAtmosphere({ ...live, condition, weatherCode, cloudCoverLow: 100, cloudCoverHigh: 0 });
    assert.equal(cloud.cloudProfile, 'cumulus', `${condition} ${weatherCode}`);
    assert.equal(cloud.cloudDepth, 1, `${condition} ${weatherCode}`);
    assert.ok(fair.cloudDepth < cloud.cloudDepth / 2, 'fair-weather clouds must stay shallower than storm towers');
  }
});

test('partial layer data falls back to total cover rather than assuming clear lower layers', () => {
  const cloud = getAtmosphere({ ...live, cloudCover: 80, cloudCoverLow: undefined, cloudCoverMid: undefined, cloudCoverHigh: 100 });
  assert.equal(cloud.lowCloudCover, 0.8);
  assert.equal(cloud.highCloudCover, 1);
  assert.equal(cloud.cloudProfile, 'mixed');
  const noHigh = getAtmosphere({ ...live, cloudCover: 50, cloudCoverLow: 0, cloudCoverMid: 0, cloudCoverHigh: undefined });
  assert.equal(noHigh.lowCloudCover, 0.5);
  assert.equal(noHigh.highCloudCover, 0.1);
});

test('convective conditions retain a lower cloud body even with high-only layer reports', () => {
  for (const [condition, weatherCode] of [['thunderstorm', 95], ['rain', 80], ['snow', 86]]) {
    const weather = { ...live, condition, weatherCode, cloudCover: 20, cloudCoverLow: 0, cloudCoverMid: 0, cloudCoverHigh: 100 };
    const cloud = getAtmosphere(weather);
    assert.ok(['cumulus', 'mixed'].includes(cloud.cloudProfile), `${condition} ${weatherCode}`);
    assert.equal(cloud.lowCloudCover, 0.55);
    assert.equal(cloud.cloudDepth, 1);
    const manual = getAtmosphere(weather, 'cirrus');
    assert.equal(manual.cloudProfile, 'cirrus');
    assert.equal(manual.lowCloudCover, 0);
  }
});

test('manual cloud profiles change the selected layers and geometry', () => {
  const base = getDebugWeather(live, settings({ clouds: 'cirrus' }));
  const cirrus = getAtmosphere(base, 'cirrus');
  const stratus = getAtmosphere(getDebugWeather(live, settings({ clouds: 'stratus' })), 'stratus');
  assert.equal(cirrus.cloudProfile, 'cirrus');
  assert.equal(cirrus.lowCloudCover, 0);
  assert.ok(cirrus.highCloudCover > 0);
  assert.equal(stratus.cloudProfile, 'stratus');
  assert.ok(stratus.lowCloudCover > 0);
  assert.equal(stratus.highCloudCover, 0);
  assert.notEqual(cirrus.cloudDepth, stratus.cloudDepth);
});

test('stratus variants and stratocumulus expose distinct shape parameters', () => {
  const profile = (name) => getAtmosphere(live, name);
  const uniform = profile('stratus');
  const fractus = profile('stratus-fractus');
  const waves = profile('stratus-undulatus');
  const thin = profile('stratus-translucidus');
  const stratocumulus = profile('stratocumulus');
  assert.ok(fractus.cloudRaggedness > uniform.cloudRaggedness);
  assert.ok(waves.cloudWaves > uniform.cloudWaves);
  assert.ok(thin.cloudOpticalDepth < uniform.cloudOpticalDepth);
  assert.ok(stratocumulus.cloudFlatness > 0);
  assert.ok(stratocumulus.cloudFlatness < uniform.cloudFlatness);
  assert.ok(stratocumulus.cloudDepth > 0);
  assert.ok(stratocumulus.cloudDepth < getAtmosphere({ ...live, condition: 'thunderstorm', weatherCode: 95, cloudCoverHigh: 0 }).cloudDepth);
});

test('full translucent and opaque stratus retain cover but differ in light transmission', () => {
  const weather = { ...live, cloudCover: 100 };
  const opaque = getAtmosphere(weather, 'stratus');
  const thin = getAtmosphere(weather, 'stratus-translucidus');
  assert.equal(thin.cloudCover, 1);
  assert.equal(thin.lowCloudCover, opaque.lowCloudCover);
  assert.ok(thin.cloudOpticalDepth < opaque.cloudOpticalDepth);
  assert.ok(thin.skyMute < opaque.skyMute);
  assert.ok(thin.sunVisibility > opaque.sunVisibility);
});

test('broken lower fair-weather deck selects stratocumulus while showers remain deep', () => {
  const weather = { ...live, cloudCover: 70, cloudCoverLow: 70, cloudCoverMid: 0, cloudCoverHigh: 0 };
  const fair = getAtmosphere(weather);
  const shower = getAtmosphere({ ...weather, condition: 'rain', weatherCode: 80 });
  assert.equal(fair.cloudProfile, 'stratocumulus');
  assert.equal(shower.cloudProfile, 'cumulus');
  assert.ok(shower.cloudDepth > fair.cloudDepth);
});

test('all manual profiles respect explicit zero coverage without changing live API data', () => {
  const profiles = ['cumulus', 'stratus', 'stratus-fractus', 'stratus-undulatus', 'stratus-translucidus', 'stratocumulus', 'cirrus', 'mixed'];
  const before = JSON.stringify(live);
  for (const clouds of profiles) {
    const manual = getDebugWeather(live, settings({ clouds, cloudCover: 0 }));
    const atmosphere = getAtmosphere(manual, clouds);
    assert.equal(atmosphere.cloudProfile, clouds);
    assert.equal(atmosphere.cloudCover, 0, clouds);
    assert.equal(atmosphere.lowCloudCover, 0, clouds);
    assert.equal(atmosphere.highCloudCover, 0, clouds);
    assert.equal(JSON.stringify(live), before, clouds);
    assert.equal(getDebugWeather(live, DEFAULT_DEBUG_SETTINGS), live, clouds);
  }
});

test('manual zero total overrides measured cloud layers without mutating the live reading', () => {
  const input = Object.freeze({ ...live, cloudCover: 100, cloudCoverLow: 100, cloudCoverHigh: 0 });
  const manual = getDebugWeather(input, settings({ cloudCover: 0 }));
  const atmosphere = getAtmosphere(manual);
  assert.equal(manual.cloudCover, 0);
  assert.equal(manual.cloudCoverLow, undefined);
  assert.equal(atmosphere.lowCloudCover, 0);
  assert.equal(atmosphere.highCloudCover, 0);
  assert.equal(input.cloudCoverLow, 100);
  assert.equal(input.cloudCover, 100);
});

test('reset returns the exact unmodified live reading', () => {
  const manual = settings({ weather: 'rain', clouds: 'stratus', cloudCover: 20, windSpeed: 3 });
  assert.equal(isWeatherDebugActive(manual), true);
  assert.notEqual(getDebugWeather(live, manual), live);
  assert.equal(isWeatherDebugActive(DEFAULT_DEBUG_SETTINGS), false);
  assert.equal(getDebugWeather(live, DEFAULT_DEBUG_SETTINGS), live);
  assert.equal(live.cloudCoverLow, 40);
  assert.equal(live.windSpeed, 8);
});

test('all time presets return their named period independently of live location', () => {
  for (const time of ['night', 'sunrise', 'morning', 'midday', 'afternoon', 'sunset', 'dusk']) {
    assert.equal(getDebugTime(settings({ time })).period, time, time);
  }
  assert.equal(getDebugTime(DEFAULT_DEBUG_SETTINGS), null);
});
