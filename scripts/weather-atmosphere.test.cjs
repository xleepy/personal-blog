/* eslint-disable @typescript-eslint/no-require-imports -- Exercise TypeScript modules in Node. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const { Matrix3, PerspectiveCamera, Vector3 } = require('three');

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
const { getStarFrame } = load('celestial');
const { getDebugTime, DEFAULT_DEBUG_SETTINGS } = load('debug');
const prague = [50.0755, 14.4378];
const at = (date, coords = prague) => getSolarPosition(new Date(date), ...coords);

test('the Sun stays in frame at both horizons and high noon in portrait and landscape', () => {
  const scenes = [
    getDebugTime({ ...DEFAULT_DEBUG_SETTINGS, time: 'sunrise' }),
    getDebugTime({ ...DEFAULT_DEBUG_SETTINGS, time: 'sunset' }),
    getSolarVisuals(new Date('2026-06-21T11:00:00Z'), ...prague),
    getSolarVisuals(new Date('2026-06-21T02:00:00Z'), -33.87, 151.21),
    getSolarVisuals(new Date('2026-03-20T12:07:00Z'), 0, 0),
  ];
  for (const aspect of [16 / 9, 390 / 844]) {
    const camera = new PerspectiveCamera(60, aspect);
    const projected = scenes.map(({ view, direction }) => {
      camera.rotation.set(view.pitch, view.yaw, 0, 'YXZ');
      camera.updateMatrixWorld();
      const sun = new Vector3(...direction).multiplyScalar(500).project(camera);
      assert.ok(Math.abs(sun.x) < 0.9 && Math.abs(sun.y) < 0.9 && Math.abs(sun.z) < 1, sun.toArray());
      return sun;
    });
    assert.ok(projected[0].x < 0 && projected[1].x > 0);
  }
});

test('stars turn once per sidereal day about the local celestial pole', () => {
  const siderealDay = 86_164_090;
  const epoch = Date.UTC(2000, 0, 1, 12);
  for (const latitude of [0, 50, -34]) {
    const matrix = (offset, longitude = 0) => new Matrix3().set(...getStarFrame(new Date(epoch + offset), latitude, longitude));
    const radians = latitude * Math.PI / 180;
    const pole = new Vector3(0, Math.sin(radians), Math.cos(radians));
    const equator = new Vector3(0, Math.cos(radians), -Math.sin(radians));
    const start = equator.clone().applyMatrix3(matrix(0));
    const quarterTurn = matrix(siderealDay / 4);
    assert.ok(pole.clone().applyMatrix3(quarterTurn).distanceTo(new Vector3(0, 0, 1)) < 1e-6);
    assert.ok(Math.abs(start.dot(equator.clone().applyMatrix3(quarterTurn))) < 1e-6);
    assert.ok(start.distanceTo(equator.clone().applyMatrix3(matrix(siderealDay))) < 1e-6);
    assert.ok(equator.clone().applyMatrix3(quarterTurn).distanceTo(equator.clone().applyMatrix3(matrix(0, 90))) < 1e-6);
  }
});

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

test('lunar position, illumination and angular size agree with Horizons', () => {
  // JPL Horizons observer table, target 301, geodetic coordinates at 0 km,
  // APPARENT=AIRLESS and QUANTITIES=4,10,13 (azimuth, altitude, illumination, diameter).
  // https://ssd-api.jpl.nasa.gov/doc/horizons.html
  const sydney = [-33.8688, 151.2093];
  const fixtures = [
    [prague, '2026-10-18T18:00:00Z', 192.287884, 14.597398, 0.5058627, 1787.575],
    [prague, '2026-11-09T23:00:00Z', 354.059622, -64.106284, 0.0066343, 1768.013],
    [sydney, '2026-11-24T13:00:00Z', 8.581326, 29.492403, 0.9974053, 2003.431],
  ];
  const degrees = 180 / Math.PI;
  for (const [coordinates, date, azimuth, altitude, fraction, diameter] of fixtures) {
    const { moon } = getSolarVisuals(new Date(date), ...coordinates);
    const [x, y, z] = moon.direction;
    const moonAzimuth = (Math.atan2(-x, z) * degrees + 360) % 360;
    const moonAltitude = Math.asin(y) * degrees;
    const diameterArcseconds = Math.asin(moon.sinRadius) * degrees * 7200;
    // SunCalc uses apparent altitude with refraction and an Earth-centered distance.
    assert.ok(Math.abs(moonAzimuth - azimuth) < 0.15, `${date}: azimuth ${moonAzimuth}`);
    assert.ok(Math.abs(moonAltitude - altitude) < 0.6, `${date}: altitude ${moonAltitude}`);
    assert.ok(Math.abs(moon.fraction - fraction) < 0.01, `${date}: fraction ${moon.fraction}`);
    assert.ok(Math.abs(diameterArcseconds - diameter) < 35, `${date}: diameter ${diameterArcseconds}`);
    assert.ok(Math.abs(Math.hypot(...moon.lightDirection) - 1) < 1e-6, `${date}: light direction`);
  }
});

test('the waxing quarter faces the Sun and lights half the apparent disk', () => {
  const { moon, direction: sunDirection } = getSolarVisuals(new Date('2026-10-18T18:00:00Z'), ...prague);
  const dot = (a, b) => a.reduce((sum, component, index) => sum + component * b[index], 0);
  // At this quarter the Sun lies almost in the Moon's sky plane.
  assert.ok(dot(moon.lightDirection, sunDirection) > 0.99);
  assert.ok(Math.abs(dot(moon.lightDirection, moon.direction)) < 0.03);
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
