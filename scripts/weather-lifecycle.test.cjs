/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS regression harness. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Execute the real hook with deterministic React/browser boundaries; no network or DOM required.
const source = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, '../src/hooks/useWeather.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;
const flush = () => new Promise((resolve) => setImmediate(resolve));
const response = (weatherCode = 0) => ({
  ok: true,
  json: async () => ({
    current: {
      weather_code: weatherCode,
      temperature_2m: 12,
      relative_humidity_2m: 55,
      wind_speed_10m: 8,
    },
  }),
});

function createHarness({ fetcher, denied = false, pendingLocation = false } = {}) {
  let state;
  let effect;
  let interval;
  let locationCalls = 0;
  let resolveLocation;
  let now = 1000000;
  let timerId = 0;
  const listeners = new Map();
  const timers = new Map();
  const calls = [];
  const react = {
    createContext: (value) => ({ value }),
    useContext: (context) => context.value,
    useState: (initial) => {
      state = initial;
      return [state, (value) => { state = value; }];
    },
    useEffect: (callback) => { effect = callback; },
  };
  const document = {
    visibilityState: 'visible',
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  const sandbox = {
    exports: {},
    require: (name) => { assert.equal(name, 'react'); return react; },
    AbortController,
    DOMException,
    Date: { now: () => now },
    navigator: {
      geolocation: {
        getCurrentPosition: (success, failure) => {
          locationCalls++;
          resolveLocation = success;
          if (pendingLocation) return;
          if (denied) failure(new Error('denied'));
          else success({ coords: { latitude: 1, longitude: 2 } });
        },
      },
    },
    document,
    window: {
      setTimeout: (callback, delay) => {
        assert.equal(delay, 10000);
        timers.set(++timerId, callback);
        return timerId;
      },
      clearTimeout: (id) => timers.delete(id),
      setInterval: (callback, delay) => {
        assert.equal(delay, 900000);
        interval = callback;
        return 1;
      },
      clearInterval: () => { interval = null; },
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: (name) => listeners.delete(name),
    },
    fetch: async (url, options) => {
      calls.push({ url, ...options });
      return fetcher ? fetcher(url, options, calls.length) : response();
    },
  };
  vm.runInNewContext(source, sandbox);
  sandbox.exports.useWeatherState();
  const cleanup = effect();
  return {
    get state() { return state; },
    get locationCalls() { return locationCalls; },
    get interval() { return interval; },
    calls,
    listeners,
    timers,
    cleanup,
    completeLocation: () => resolveLocation({ coords: { latitude: 1, longitude: 2 } }),
    advance: (milliseconds) => { now += milliseconds; },
    tick: () => interval(),
    emit: (name) => listeners.get(name)(),
    document,
    context: sandbox.exports.WeatherContext,
    consumer: sandbox.exports.useWeather,
  };
}

test('snow showers 85/86 map to snow; repeated consumers share the provider state', async () => {
  for (const code of [85, 86]) {
    const h = createHarness({ fetcher: async () => response(code) });
    await flush();
    assert.equal(h.state.weather.condition, 'snow');
    assert.equal(h.state.source, 'location');
    h.context.value = h.state;
    assert.equal(h.consumer(), h.state);
    assert.equal(h.consumer(), h.state);
    assert.equal(h.calls.length, 1);
    assert.equal(h.locationCalls, 1);
    h.cleanup();
  }
});

test('location request failure falls back to Prague; denied location fetches Prague once', async () => {
  const fallback = createHarness({ fetcher: async (url, options, count) => {
    if (count === 1) throw new Error('network');
    return response(61);
  } });
  await flush();
  assert.equal(fallback.state.source, 'prague');
  assert.equal(fallback.calls.length, 2);
  assert.match(fallback.calls[1].url, /latitude=50\.0755/);
  fallback.cleanup();
  const denied = createHarness({ denied: true });
  await flush();
  assert.equal(denied.state.source, 'prague');
  assert.equal(denied.calls.length, 1);
  denied.cleanup();
});

test('total failure and unsupported weather codes leave weather unavailable', async () => {
  for (const fetcher of [async () => { throw new Error('offline'); }, async () => response(83)]) {
    const h = createHarness({ fetcher });
    await flush();
    assert.equal(h.state.status, 'unavailable');
    assert.equal(h.state.weather, null);
    assert.equal(h.state.updatedAt, null);
    assert.equal(h.calls.length, 2);
    h.cleanup();
  }
});

test('15 minute refresh retains failed data as stale; visibility/focus recover only stale data', async () => {
  let failing = false;
  const h = createHarness({ fetcher: async () => {
    if (failing) throw new Error('offline');
    return response();
  } });
  await flush();
  const previous = h.state.weather;
  const updatedAt = h.state.updatedAt;
  failing = true;
  h.advance(900001);
  h.tick();
  await flush();
  assert.equal(h.state.status, 'stale');
  assert.equal(h.state.weather, previous);
  assert.equal(h.state.updatedAt, updatedAt);
  failing = false;
  h.emit('visibilitychange');
  await flush();
  assert.equal(h.state.status, 'ready');
  assert.ok(h.state.updatedAt > updatedAt);
  const count = h.calls.length;
  h.emit('focus');
  await flush();
  assert.equal(h.calls.length, count);
  h.document.visibilityState = 'hidden';
  h.advance(900001);
  h.tick();
  await flush();
  assert.equal(h.calls.length, count);
  h.document.visibilityState = 'visible';
  h.emit('focus');
  await flush();
  assert.equal(h.calls.length, count + 1);
  assert.equal(h.locationCalls, 1);
  h.cleanup();
  assert.equal(h.listeners.size, 0);
  assert.equal(h.timers.size, 0);
  assert.equal(h.interval, null);
});

const pendingFetch = (url, { signal }) => new Promise((resolve, reject) => {
  signal.addEventListener('abort', () => reject(new Error('aborted')));
});

test('unmount aborts requests without state updates or fallback; pending geolocation cannot fetch', async () => {
  const h = createHarness({ fetcher: pendingFetch });
  await flush();
  const previous = h.state;
  h.cleanup();
  await flush();
  assert.equal(h.calls[0].signal.aborted, true);
  assert.equal(h.state, previous);
  assert.equal(h.calls.length, 1);
  assert.equal(h.timers.size, 0);
  const location = createHarness({ pendingLocation: true });
  assert.equal(location.timers.size, 1);
  location.cleanup();
  await flush();
  assert.equal(location.calls.length, 0);
  assert.equal(location.timers.size, 0);
  location.completeLocation();
  await flush();
  assert.equal(location.calls.length, 0);
});

test('untouched location permission times out to Prague and ignores a late location callback', async () => {
  const h = createHarness({ pendingLocation: true });
  await flush();
  assert.equal(h.state.status, 'loading');
  assert.equal(h.calls.length, 0);
  assert.equal(h.timers.size, 1);
  h.timers.values().next().value();
  await flush();
  assert.equal(h.state.status, 'ready');
  assert.equal(h.state.source, 'prague');
  assert.equal(h.calls.length, 1);
  assert.match(h.calls[0].url, /latitude=50\.0755/);
  assert.equal(h.timers.size, 0);
  const previous = h.state;
  h.completeLocation();
  await flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.state, previous);
  h.cleanup();
});

test('fetch timeout aborts both attempts and ends unavailable', async () => {
  const h = createHarness({ fetcher: pendingFetch });
  await flush();
  h.timers.values().next().value();
  await flush();
  assert.equal(h.calls[0].signal.aborted, true);
  assert.equal(h.calls.length, 2);
  h.timers.values().next().value();
  await flush();
  assert.equal(h.calls[1].signal.aborted, true);
  assert.equal(h.state.status, 'unavailable');
  h.cleanup();
  assert.equal(h.timers.size, 0);
});
