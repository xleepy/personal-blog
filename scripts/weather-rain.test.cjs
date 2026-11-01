/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the real frame callback without WebGL. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, '../src/components/canvas/Rain.tsx'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
).outputText;

function simulate(precipitation, intensity, windSpeed = 0, windDirection = 0) {
  const refs = [];
  let frame;
  const mesh = { setMatrixAt() {}, instanceMatrix: { needsUpdate: false } };
  const math = Object.create(Math);
  math.random = () => 0.5;
  const exportsObject = {};
  vm.runInNewContext(source, {
    exports: exportsObject,
    Math: math,
    require: (name) => {
      if (name === '@react-three/fiber') return { useFrame: (callback) => { frame = callback; } };
      if (name === 'react') return {
        useEffect: (callback) => callback(),
        useRef: (value) => {
          const ref = { current: refs.length === 0 ? mesh : value };
          refs.push(ref);
          return ref;
        },
      };
      return require(name);
    },
  });
  exportsObject.Rain({ precipitation, intensity, windSpeed, windDirection });
  return {
    step: (time, delta) => frame({ clock: { elapsedTime: time } }, delta),
    position: () => Array.from(refs[2].current.slice(0, 3)),
    detach: () => { refs[0].current = null; },
  };
}

function close(a, b, tolerance = 0.001) {
  for (let i = 0; i < a.length; i++) assert.ok(Math.abs(a[i] - b[i]) < tolerance, `${a} vs ${b}`);
}

for (const [kind, intensity] of [['rain', 1], ['snow', 0.65]]) {
  test(`${kind} preserves fall speed at 30, 60 and 120 fps`, () => {
    const expectedSpeed = (kind === 'snow' ? 0.045 * 1.3 : 0.35 * 4) * 60;
    const positions = [30, 60, 120].map((fps) => {
      const simulation = simulate(kind, intensity);
      for (let frame = 1; frame <= fps; frame++) simulation.step(frame / fps, 1 / fps);
      return simulation.position();
    });
    for (const position of positions) {
      close(position, positions[1]);
      const unwrapped = 10 - expectedSpeed;
      const expectedY = unwrapped < -10 ? 25 - ((-10 - unwrapped) % 35) : unwrapped;
      assert.ok(Math.abs(position[1] - expectedY) < 0.001);
    }
  });

  test(`${kind} preserves overshoot and sway through repeated respawns`, () => {
    const positions = [30, 60, 120].map((fps) => {
      const simulation = simulate(kind, intensity);
      for (let frame = 1; frame <= fps * 30; frame++) simulation.step(frame / fps, 1 / fps);
      return simulation.position();
    });
    for (const position of positions) close(position, positions[1], 0.003);
    const speed = (kind === 'snow' ? 0.045 * 1.3 : 0.35 * 4) * 60;
    const expected = 25 - ((-10 - (10 - speed * 30)) % 35);
    assert.ok(Math.abs(positions[1][1] - expected) < 0.003);
  });

  test(`${kind} caps resumed frames and ignores detached meshes`, () => {
    const paused = simulate(kind, intensity);
    const normal = simulate(kind, intensity);
    paused.step(20, 20);
    normal.step(20, 0.05);
    close(paused.position(), normal.position());
    paused.detach();
    paused.step(21, 1);
    close(paused.position(), normal.position());
  });
}


test('intensity changes particle count without changing fall speed', () => {
  for (const kind of ['rain', 'snow']) {
    const light = simulate(kind, 0.2);
    const heavy = simulate(kind, 1);
    light.step(1, 0.05);
    heavy.step(1, 0.05);
    close(light.position(), heavy.position());
  }
});

test('wind direction controls drift on both axes while zero wind remains calm', () => {
  for (const kind of ['rain', 'snow']) {
    const calm = simulate(kind, 1, 0, 90);
    calm.step(0.05, 0.05);
    const calmPosition = calm.position();
    for (const [direction, axis, sign] of [[90, 0, 1], [270, 0, -1], [0, 2, -1], [180, 2, 1]]) {
      const windy = simulate(kind, 1, 50, direction);
      windy.step(0.05, 0.05);
      assert.ok((windy.position()[axis] - calmPosition[axis]) * sign > 0, `${kind} ${direction}`);
    }
  }
});

test('wind wraps both horizontal axes consistently at 30, 60 and 120 fps', () => {
  for (const [direction, axis, expected] of [[90, 0, -22.5], [270, 0, 22.5], [0, 2, -19.5], [180, 2, -4.5]]) {
    const positions = [30, 60, 120].map((fps) => {
      const simulation = simulate('rain', 1, 50, direction);
      // Avoid landing exactly on the depth boundary due to Float32 rounding.
      for (let frame = 1; frame <= fps * 11; frame++) simulation.step(frame / fps, 1 / fps);
      return simulation.position();
    });
    for (const position of positions) {
      close(position, positions[1], 0.003);
      assert.ok(Math.abs(position[axis] - expected) < 0.003);
    }
  }
});
