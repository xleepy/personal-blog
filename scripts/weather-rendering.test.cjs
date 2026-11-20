/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the frame callback with real R3F uniform handling. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const THREE = require('three');
const { applyProps } = require('@react-three/fiber');

function load(name, overrides = {}) {
  const filename = path.join(__dirname, '../src/components/canvas', name);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: (id) => overrides[id]
    ?? (id.startsWith('./') ? load(`${id.slice(2)}.ts`, overrides) : require(id)) }, { filename });
  return exports;
}

function createSkySimulation(t) {
  let frame, cursor = 0, mounted = false;
  const slots = [], materials = [], cleanups = [], draws = [];
  const slot = (initialize) => {
    const index = cursor++;
    if (!(index in slots)) slots[index] = initialize();
    return slots[index];
  };
  const previousTarget = new THREE.WebGLRenderTarget();
  t.after(() => {
    for (const cleanup of cleanups) cleanup?.();
    for (const material of materials) material.dispose();
    previousTarget.dispose();
  });
  let boundTarget = previousTarget;
  const gl = {
    extensions: { has: () => true },
    getDrawingBufferSize: (size) => size.set(3024, 1506),
    getRenderTarget: () => boundTarget,
    setRenderTarget: (target) => { boundTarget = target; },
    render: (scene, camera) => draws.push({ scene, camera, target: boundTarget }),
  };
  const { SkyDome } = load('SkyDome.tsx', {
    react: {
      useRef: (value) => slot(() => ({ current: value })),
      useState: (initialize) => [slot(() => typeof initialize === 'function' ? initialize() : initialize)],
      useMemo: (initialize) => initialize(),
      useEffect: (effect) => { if (!mounted) cleanups.push(effect()); },
    },
    '@react-three/fiber': {
      useThree: (select) => select({ gl, invalidate: () => {} }),
      useFrame: (callback) => { frame = callback; },
      createPortal: (children) => children,
    },
  });
  const { getAtmosphere } = load('atmosphere.ts');
  const sky = load('solar.ts').getSolarVisuals(new Date('2026-03-20T11:00:00Z'));
  const state = { size: { width: 1512, height: 753 }, camera: new THREE.PerspectiveCamera() };
  const mountMaterials = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'shaderMaterial') {
      const material = new THREE.ShaderMaterial();
      // R3F clones uniform wrappers, but retains Vector/Color values by reference.
      applyProps(material, { uniforms: node.props.uniforms });
      node.props.ref.current = material;
      materials.push(material);
    }
    for (const child of [].concat(node.props?.children ?? [])) mountMaterials(child);
  };
  const render = (condition, options = {}) => {
    cursor = 0;
    const visuals = getAtmosphere({ condition, cloudCover: condition === 'fog' ? 100 : 0 });
    const tree = SkyDome({ sky, visuals, reducedMotion: false, ...options });
    if (!mounted) mountMaterials(tree);
    mounted = true;
    return visuals;
  };

  return { render, materials, state, draws, previousTarget, gl, step: (delta) => frame(state, delta) };
}

test('solar composite follows clear → fog → clear with independent R3F scalar uniforms', (t) => {
  const { render, materials, state, draws, previousTarget, gl, step } = createSkySimulation(t);
  render('clear');
  const cloud = materials.find((material) => material.uniforms.cloudNoise);
  const composite = materials.find((material) => material.uniforms.skyTexture);
  assert.notEqual(cloud.uniforms.sunVisibility, composite.uniforms.sunVisibility);
  for (const condition of ['clear', 'fog', 'clear']) {
    const visuals = render(condition);
    for (let tick = 0; tick < 120; tick++) {
      step(1 / 24);
      assert.equal(composite.uniforms.sunVisibility.value, cloud.uniforms.sunVisibility.value,
        `${condition}: solar disc and cloud lighting disagree`);
    }
    assert.ok(Math.abs(composite.uniforms.sunVisibility.value - visuals.sunVisibility) < 0.000001);
    assert.equal(gl.getRenderTarget(), previousTarget, 'offscreen rendering must restore the caller target');
  }
  assert.equal(draws.length, 360);
  assert.equal(draws.at(-1).camera, state.camera);
  const target = draws.at(-1).target;
  assert.ok(target.width * target.height <= 640 * 360, 'cloud work must retain its pixel budget');
  assert.equal(composite.uniforms.skyTexture.value, target.texture);
  assert.deepEqual(composite.uniforms.outputResolution.value.toArray(), [3024, 1506]);
});

test('strong wind produces the same cloud drift rate at 24 and 12 fps', (t) => {
  const { render, materials, step } = createSkySimulation(t);
  render('overcast', { windSpeed: 40, windDirection: 270 });
  const { value: offset } = materials.find((material) => material.uniforms.cloudOffset).uniforms.cloudOffset;
  const advanceOneSecond = (fps) => {
    const start = offset.x;
    for (let tick = 0; tick < fps; tick++) step(1 / fps);
    return offset.x - start;
  };

  const initialY = offset.y;
  const drift = advanceOneSecond(24);
  assert.ok(drift >= 0.12, 'westerly wind should shift the cloud pattern east at a perceptible rate');
  assert.equal(offset.y, initialY);
  assert.ok(Math.abs(advanceOneSecond(12) - drift) < 1e-9);

  const beforePause = offset.x;
  step(60);
  assert.ok(Math.abs(offset.x - beforePause - drift / 10) < 1e-9);

  render('overcast', { windSpeed: 40, reducedMotion: true });
  assert.equal(advanceOneSecond(24), 0, 'reduced motion should stop cloud movement even in strong wind');

  render('overcast', { windSpeed: 0 });
  assert.equal(advanceOneSecond(24), 0);
});
