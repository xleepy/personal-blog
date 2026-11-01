/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function loadSource(relativePath, overrides = {}, globals = {}) {
  const filename = path.join(__dirname, '..', relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require: (name) => overrides[name] ?? require(name),
    ...globals,
  }, { filename });
  return exports;
}

const { getTimeOfDay } = loadSource('src/components/canvas/utils.ts');
const periods = ['night', 'sunrise', 'morning', 'midday', 'afternoon', 'sunset', 'dusk'];
function weights(date) {
  const { period, nextPeriod, blend } = getTimeOfDay(date);
  assert.ok(periods.includes(period) && periods.includes(nextPeriod));
  assert.ok(Number.isFinite(blend) && blend >= 0 && blend <= 1);
  return periods.map((name) => (name === period ? 1 - blend : 0) + (name === nextPeriod ? blend : 0));
}
function difference(a, b) {
  return Math.max(...a.map((value, index) => Math.abs(value - b[index])));
}

test('every month retains all seven periods with continuous phase boundaries', () => {
  for (let month = 0; month < 12; month++) {
    for (const day of [1, 15]) {
      const start = new Date(2026, month, day);
      const seen = new Set();
      let previous = weights(start);
      for (let second = 30; second <= 86_400; second += 30) {
        const date = new Date(start.getTime() + second * 1000);
        const current = weights(date);
        seen.add(getTimeOfDay(date).period);
        assert.ok(difference(previous, current) < 0.02, `${date}: abrupt palette change`);
        previous = current;
      }
      assert.equal(seen.size, 7, `month ${month + 1}, day ${day}: missing phase`);
    }
  }
});

test('seasonal transitions remain continuous across month and year boundaries', () => {
  for (const year of [2026, 2028]) {
    for (let month = 0; month < 12; month++) {
      for (let hour = 0; hour < 24; hour += 0.25) {
        const last = new Date(year, month, 0, Math.floor(hour), (hour % 1) * 60);
        const first = new Date(year, month, 1, Math.floor(hour), (hour % 1) * 60);
        // The two-hour seasonal sunset range can move by about two minutes per day.
        assert.ok(difference(weights(last), weights(first)) < 0.04, `${first}: seasonal jump`);
      }
    }
  }
});

test('time includes seconds and night stays stable across midnight', () => {
  const a = getTimeOfDay(new Date(2026, 9, 28, 12, 0, 0));
  const b = getTimeOfDay(new Date(2026, 9, 28, 12, 0, 30));
  assert.notEqual(a.blend, b.blend);
  assert.equal(difference(weights(new Date(2026, 9, 28, 23, 59, 59)), weights(new Date(2026, 9, 29, 0))), 0);
});

test('time hook refreshes on timer, focus and visible resume, then cleans up', () => {
  const listeners = new Map();
  let intervalCallback;
  let intervalDelay;
  let cleanup;
  let updates = 0;
  const document = {
    visibilityState: 'hidden',
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  const window = {
    setInterval: (callback, delay) => { intervalCallback = callback; intervalDelay = delay; return 1; },
    clearInterval: (id) => assert.equal(id, 1),
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  const { useTimeOfDay } = loadSource('src/hooks/useTimeOfDay.ts', {
    '@/components/canvas/solar': { getSolarVisuals: (date, latitude, longitude) => ({ date, latitude, longitude }) },
    react: {
      useState: (initialize) => [initialize(), (date) => { assert.ok(date instanceof Date); updates++; }],
      useEffect: (callback) => { cleanup = callback(); },
    },
  }, { Date, window, document });
  const result = useTimeOfDay(50, 14);
  assert.equal(result.latitude, 50);
  assert.equal(result.longitude, 14);
  assert.ok(result.date instanceof Date);
  assert.equal(updates, 0, 'effect must not synchronously set state');
  assert.equal(intervalDelay, 30_000);
  intervalCallback();
  listeners.get('focus')();
  listeners.get('visibilitychange')();
  assert.equal(updates, 2);
  document.visibilityState = 'visible';
  listeners.get('visibilitychange')();
  assert.equal(updates, 3);
  cleanup();
  assert.equal(listeners.size, 0);
});
