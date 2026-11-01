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

const { getSolarPosition, getSolarVisuals } = load('solar');
const { getAtmosphere } = load('atmosphere');
const prague = [50.0755, 14.4378];
const at = (date, coords = prague) => getSolarPosition(new Date(date), ...coords);

// Solar noon elevation is approximately 90 - latitude + declination, with
// declination approximately 0 at the equinox and +/-23.44 degrees at solstices.
// Reference: https://gml.noaa.gov/grad/solcalc/solareqns.PDF
test('solar elevation follows equinox and solstice geometry in both hemispheres', () => {
  for (const [date, expected] of [['2026-03-20T11:00:00Z', 40], ['2026-06-21T11:00:00Z', 63], ['2026-12-21T11:00:00Z', 16]]) {
    assert.ok(Math.abs(at(date).elevation - expected) < 2, date);
  }
  const sydney = [-33.87, 151.21];
  assert.ok(at('2026-12-21T02:00:00Z', sydney).elevation > at('2026-06-21T02:00:00Z', sydney).elevation + 40);
});

test('sun travels from east to west and equivalent UTC offsets give identical positions', () => {
  assert.ok(at('2026-03-20T06:00:00Z').direction[0] < 0);
  assert.ok(at('2026-03-20T16:00:00Z').direction[0] > 0);
  const a = at('2026-03-29T03:30:00+02:00');
  const b = at('2026-03-29T01:30:00Z');
  assert.equal(a.elevation, b.elevation);
  assert.equal(a.solarHour, b.solarHour);
});

test('polar day and night remain finite and elevations change continuously', () => {
  for (const latitude of [-90, -80, 80, 90]) {
    for (const date of ['2026-06-21T00:00:00Z', '2026-12-21T00:00:00Z']) {
      const s = at(date, [latitude, 0]);
      assert.ok(Number.isFinite(s.elevation));
      assert.ok(s.direction.every(Number.isFinite));
      assert.equal(Math.sign(s.elevation), Math.sign(latitude) * (date.includes('-06-') ? 1 : -1));
    }
  }
  for (const start of ['2026-03-20T04:00:00Z', '2026-06-21T11:00:00Z', '2026-12-31T23:59:30Z']) {
    const t = Date.parse(start);
    const a = getSolarVisuals(new Date(t), ...prague);
    const b = getSolarVisuals(new Date(t + 60_000), ...prague);
    assert.ok(Math.abs(a.elevation - b.elevation) < 0.3, start);
    assert.ok(Math.abs(a.timeVisuals.ambientIntensity - b.timeVisuals.ambientIntensity) < 0.03, start);
  }
});

test('measured cloud and precipitation values control atmosphere without inventing rain', () => {
  const weather = { condition: 'rain', cloudCover: 0, precipitation: 0 };
  const clear = getAtmosphere(weather);
  const overcast = getAtmosphere({ ...weather, cloudCover: 100 });
  assert.equal(clear.cloudCover, 0);
  assert.equal(overcast.cloudCover, 1);
  assert.ok(clear.sunVisibility > overcast.sunVisibility);
  assert.ok(overcast.skyMute > clear.skyMute);
  assert.equal(clear.rainIntensity, 0);
  assert.ok(getAtmosphere({ ...weather, precipitation: 4 }).rainIntensity > 0);
  const unavailable = getAtmosphere(null);
  assert.equal(unavailable.rainIntensity, 0);
  assert.equal(unavailable.cloudCover, 0.25);
});
