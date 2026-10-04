import { readFileSync } from 'node:fs';
import { POKEMON_TYPES, type MoveCategory } from '@/domain';
import { drawShape } from './draw-shapes';
import { effectFor, type EffectShape } from './move-effects';
import { PROFILES } from './particle-profiles';
import { envelope, projectilePoint } from './stage-math';

const CATEGORIES: MoveCategory[] = ['physical', 'special', 'status'];
const tokens = readFileSync('src/presentation/styles/tokens.css', 'utf8');

describe('effectFor (A2)', () => {
  it('resolve os 18 tipos × 3 categorias para um efeito válido', () => {
    for (const type of POKEMON_TYPES) {
      for (const category of CATEGORIES) {
        const e = effectFor(type, category);
        expect(e).toMatchObject({ type, category });
        expect(e.duration).toBeGreaterThan(0.5);
        expect(tokens).toContain(`${e.colorToken}:`); // cor vem do token do tipo
        expect(PROFILES[type]).toBeDefined(); // física do tipo
      }
    }
  });

  it('categoria define o movimento e é determinística', () => {
    expect(effectFor('fire', 'physical').motion).toBe('rush');
    expect(effectFor('fire', 'special').motion).toBe('projectile');
    expect(effectFor('fire', 'status').motion).toBe('aura');
    expect(effectFor('water', 'special')).toEqual(effectFor('water', 'special'));
  });

  it('cada tipo tem uma forma própria', () => {
    const shapes = new Set<EffectShape>(POKEMON_TYPES.map((t) => effectFor(t, 'special').shape));
    expect(shapes.size).toBe(POKEMON_TYPES.length);
  });
});

describe('matemática do palco (A3)', () => {
  it('projétil avança da esquerda para a direita e fica na cena', () => {
    expect(projectilePoint(0).x).toBeLessThan(projectilePoint(0.5).x);
    expect(projectilePoint(0.5).x).toBeLessThan(projectilePoint(1).x);
    for (let p = -1; p <= 2; p += 0.1) {
      const pt = projectilePoint(p);
      expect(Math.abs(pt.x)).toBeLessThanOrEqual(1.9);
      expect(Math.abs(pt.y)).toBeLessThanOrEqual(1);
    }
  });

  it('envelope volta a zero nas pontas', () => {
    expect(envelope(0)).toBeCloseTo(0);
    expect(envelope(0.5)).toBeCloseTo(1);
    expect(envelope(1)).toBeCloseTo(0);
  });
});

describe('drawShape', () => {
  it('desenha algo para cada uma das 18 formas', () => {
    const shapes = POKEMON_TYPES.map((t) => effectFor(t, 'special').shape);
    for (const shape of shapes) {
      const calls: string[] = [];
      const ctx = new Proxy({} as Record<string, unknown>, {
        get: (target, key: string) => (key in target ? target[key] : (...args: unknown[]) => { void args; calls.push(key); }),
        set: (target, key: string, value) => { target[key] = value; return true; },
      }) as unknown as CanvasRenderingContext2D;
      drawShape(ctx, shape, 64);
      expect(calls.some((c) => ['fill', 'stroke', 'fillRect'].includes(c)), shape).toBe(true);
    }
  });
});
