import { clampRotation, dragToRotation, floatOffset, MAX_ROTATION, springStep } from './stage-math';

describe('stage-math', () => {
  it('limita a rotação ao máximo', () => {
    expect(clampRotation(10)).toBe(MAX_ROTATION);
    expect(clampRotation(-10)).toBe(-MAX_ROTATION);
    expect(clampRotation(0.2)).toBe(0.2);
  });

  it('arrasto proporcional à largura e limitado', () => {
    expect(dragToRotation(0, 300)).toBe(0);
    expect(dragToRotation(150, 300)).toBeGreaterThan(0);
    expect(dragToRotation(10_000, 300)).toBe(MAX_ROTATION);
    expect(dragToRotation(100, 0)).toBe(0);
  });

  it('mola converge para o alvo', () => {
    let s = { value: 0.8, velocity: 0 };
    for (let i = 0; i < 300; i++) s = springStep(s, 0, 1 / 60);
    expect(Math.abs(s.value)).toBeLessThan(0.001);
  });

  it('flutuação fica dentro da amplitude', () => {
    for (let t = 0; t < 10; t += 0.1) expect(Math.abs(floatOffset(t, 0.06))).toBeLessThanOrEqual(0.06);
  });
});
