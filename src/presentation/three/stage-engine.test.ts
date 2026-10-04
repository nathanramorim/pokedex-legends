import * as RealThree from 'three';
import { afterEach, beforeEach, vi } from 'vitest';
import { effectFor, type ResolvedEffect } from './move-effects';
import { createStage } from './stage-engine';
import type { MoveCategory, PokemonType } from '@/domain';

const scenes: RealThree.Scene[] = [];

class FakeRenderer {
  constructor() {}
  setPixelRatio() {}
  setClearColor() {}
  setSize() {}
  render() {}
  dispose() {}
  forceContextLoss() {}
}
class FakeScene extends RealThree.Scene {
  constructor() { super(); scenes.push(this); }
}
class FakeLoader {
  setCrossOrigin() {}
  async loadAsync() { return new RealThree.Texture(); }
}

const FakeThree = { ...RealThree, WebGLRenderer: FakeRenderer, Scene: FakeScene, TextureLoader: FakeLoader } as unknown as typeof RealThree;

let now = 0;
let pending: ((t: number) => void) | null = null;

beforeEach(() => {
  scenes.length = 0;
  now = 1000;
  pending = null;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => { pending = cb; return 1; });
  vi.stubGlobal('cancelAnimationFrame', () => { pending = null; });
  window.HTMLCanvasElement.prototype.getContext = (() => null) as never;
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function setup(reducedMotion = false) {
  const container = document.createElement('div');
  Object.defineProperty(container, 'clientWidth', { value: 300 });
  Object.defineProperty(container, 'clientHeight', { value: 300 });
  const canvas = document.createElement('canvas');
  return createStage(FakeThree, container, canvas, { imageUrl: 'x', accentColor: '#ff0000', reducedMotion });
}

const resolve = (type: PokemonType, category: MoveCategory): ResolvedEffect => ({ ...effectFor(type, category), color: '#f08030' });

function effectPoints() {
  return scenes[0].children.filter((c): c is RealThree.Points => c instanceof RealThree.Points && c.material instanceof RealThree.ShaderMaterial);
}

/** Avança o relógio em quadros de ~16 ms. */
function play(ms: number) {
  for (let t = 0; t < ms; t += 16) {
    now += 16;
    const cb = pending;
    pending = null;
    cb?.(now);
  }
}

function stats(points: RealThree.Points) {
  const pos = points.geometry.getAttribute('position');
  const alpha = points.geometry.getAttribute('aAlpha');
  let visible = 0;
  let maxX = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    if (alpha.getX(i) > 0.05 && Math.abs(pos.getX(i)) <= 2.2 && Math.abs(pos.getY(i)) <= 2.2) {
      visible++;
      maxX = Math.max(maxX, pos.getX(i));
    }
  }
  return { visible, maxX };
}

const bodyOf = () => scenes[0].children.find((c) => c instanceof RealThree.Mesh && (c.geometry as RealThree.PlaneGeometry).parameters?.width === 2.7) as RealThree.Mesh;

describe('efeitos do golpe no engine, com Three real (A8–A10)', () => {
  it('especial: carga converge, projétil voa para a direita e explode com muitas partículas', async () => {
    const stage = await setup();
    stage.playMove(resolve('fire', 'special'));
    const [points] = effectPoints();
    expect(points).toBeDefined();

    play(300); // carga (p ≈ 0.2)
    expect(stats(points).visible).toBeGreaterThan(8);

    play(500); // voo (p ≈ 0.53)
    const flight = stats(points);
    expect(flight.visible).toBeGreaterThan(8);
    expect(flight.maxX).toBeGreaterThan(0.5);

    play(450); // explosão (p ≈ 0.83)
    expect(stats(points).visible).toBeGreaterThan(15);
    stage.dispose();
  });

  it('físico: avança até o alcance, brilha e treme no impacto; depois volta ao repouso', async () => {
    const stage = await setup();
    stage.playMove(resolve('fighting', 'physical'));
    const [points] = effectPoints();
    const body = bodyOf();
    const bodyColor = (body.material as RealThree.MeshBasicMaterial).color;

    play(16 * 3);
    expect(body.position.z).toBeLessThan(0); // antecipação recua

    play(510); // perto do impacto (0.38 × 1.3 s ≈ 494 ms) e dentro do hit-stop
    expect(body.position.z).toBeGreaterThan(1);
    expect(bodyColor.r).toBeGreaterThan(1.2); // brilho de impacto
    expect(stats(points).visible).toBeGreaterThan(10);

    play(1650);
    expect(body.position.z).toBeCloseTo(0, 1);
    expect(bodyColor.r).toBeCloseTo(1, 1);
    stage.dispose();
  });

  it('status: aura visível no meio; efeito é removido quando termina e as partículas somem', async () => {
    const stage = await setup();
    stage.playMove(resolve('normal', 'status'));
    const [points] = effectPoints();
    play(900);
    expect(stats(points).visible).toBeGreaterThan(8);
    play(4000);
    expect(effectPoints()).toHaveLength(0);
    stage.dispose();
  });

  it('água cai em aura (vem de cima) e fogo sobe (vem de baixo)', async () => {
    const stage = await setup();
    stage.playMove(resolve('water', 'status'));
    const [water] = effectPoints();
    play(300);
    const wy = water.geometry.getAttribute('position');
    const wa = water.geometry.getAttribute('aAlpha');
    let top = 0;
    let n = 0;
    for (let i = 0; i < wy.count; i++) if (wa.getX(i) > 0.05) { top += wy.getY(i); n++; }
    expect(n).toBeGreaterThan(0);
    expect(top / n).toBeGreaterThan(0.2);
    stage.playMove(resolve('fire', 'status'));
    const [fire] = effectPoints();
    play(100);
    const fy = fire.geometry.getAttribute('position');
    const fa = fire.geometry.getAttribute('aAlpha');
    let bottom = 0;
    let m = 0;
    for (let i = 0; i < fy.count; i++) if (fa.getX(i) > 0.05) { bottom += fy.getY(i); m++; }
    expect(m).toBeGreaterThan(0);
    expect(bottom / m).toBeLessThan(0);
    stage.dispose();
  });

  it('nova animação cancela a anterior e libera os recursos', async () => {
    const stage = await setup();
    stage.playMove(resolve('fire', 'special'));
    const first = effectPoints()[0];
    const dispose = vi.spyOn(first.geometry, 'dispose');
    stage.playMove(resolve('water', 'physical'));
    expect(dispose).toHaveBeenCalled();
    expect(effectPoints()).toHaveLength(1);
    expect(effectPoints()[0]).not.toBe(first);
    stage.dispose();
    expect(effectPoints()).toHaveLength(0);
  });

  it('movimento reduzido: sem partículas e sem deslocamento do corpo', async () => {
    const stage = await setup(true);
    stage.playMove(resolve('fire', 'physical'));
    expect(effectPoints()).toHaveLength(0);
    play(600);
    expect(bodyOf().position.z).toBe(0);
    stage.dispose();
  });
});
