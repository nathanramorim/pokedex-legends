import { PROJECTILE, RUSH, auraPose, bodyPoseFor, projectilePose, rushPose, shakeOffset } from './effect-timeline';

const finite = (pose: Record<string, number>) => Object.values(pose).every(Number.isFinite);

describe('rushPose (A10)', () => {
  it('antecipa: recua e comprime antes de avançar', () => {
    const p = rushPose(RUSH.anticipation);
    expect(p.z).toBeLessThan(-0.3);
    expect(p.scaleY).toBeLessThan(1);
  });

  it('acelera até o alcance no impacto', () => {
    expect(rushPose(RUSH.impact).z).toBeCloseTo(RUSH.reach, 1);
    expect(rushPose(0.3).z).toBeLessThan(rushPose(0.35).z);
  });

  it('pausa no impacto (hit-stop): corpo parado e brilho/tremor no máximo', () => {
    const start = rushPose(RUSH.impact);
    const mid = rushPose((RUSH.impact + RUSH.holdEnd) / 2);
    const end = rushPose(RUSH.holdEnd - 1e-6);
    expect(mid.z).toBe(RUSH.reach);
    expect(end.z).toBe(RUSH.reach);
    expect(start.flash).toBeCloseTo(1, 1);
    expect(start.shake).toBeGreaterThan(0.05);
  });

  it('volta com overshoot amortecido e termina em repouso', () => {
    let overshoot = false;
    for (let p = RUSH.holdEnd; p <= 1; p += 0.01) if (rushPose(p).z < -0.01) overshoot = true;
    expect(overshoot).toBe(true);
    const end = rushPose(1);
    expect(end.z).toBeCloseTo(0, 2);
    expect(end.scaleX).toBeCloseTo(1, 1);
    expect(end.scaleY).toBeCloseTo(1, 1);
    expect(end.rotZ).toBeCloseTo(0, 1);
    expect(end.flash).toBeLessThan(0.01);
    expect(end.shake).toBeLessThan(0.005);
  });

  it('tremor e brilho só existem depois do impacto e decaem', () => {
    expect(rushPose(RUSH.impact - 0.01).shake).toBe(0);
    expect(rushPose(RUSH.impact - 0.01).flash).toBe(0);
    expect(rushPose(RUSH.impact + 0.05).shake).toBeGreaterThan(rushPose(RUSH.impact + 0.3).shake);
  });
});

describe('projectilePose / auraPose', () => {
  it('especial: inclina para trás na carga, recua ao disparar e volta ao repouso', () => {
    expect(projectilePose(PROJECTILE.charge).z).toBeLessThan(-0.25);
    expect(projectilePose(PROJECTILE.charge + 0.01).flash).toBeGreaterThan(0.3);
    const end = projectilePose(1);
    expect(end.z).toBeCloseTo(0, 1);
    expect(end.scaleX).toBeCloseTo(1, 1);
  });

  it('especial: tremor leve só depois do impacto', () => {
    expect(projectilePose(PROJECTILE.impact - 0.02).shake).toBe(0);
    expect(projectilePose(PROJECTILE.impact + 0.01).shake).toBeGreaterThan(0);
    expect(projectilePose(PROJECTILE.impact + 0.01).shake).toBeLessThan(rushPose(RUSH.impact).shake);
  });

  it('status: sem deslocamento, respira e o brilho some no fim', () => {
    for (let p = 0; p <= 1; p += 0.1) expect(auraPose(p).z).toBe(0);
    expect(auraPose(0.4).flash).toBeGreaterThan(0);
    expect(auraPose(1).flash).toBeCloseTo(0, 5);
    expect(auraPose(1).scaleX).toBeCloseTo(1, 5);
  });

  it('todas as poses são finitas e limitadas em qualquer progresso', () => {
    for (const motion of ['rush', 'projectile', 'aura'] as const) {
      for (let p = -0.5; p <= 1.5; p += 0.02) {
        const pose = bodyPoseFor(motion, p);
        expect(finite(pose as unknown as Record<string, number>)).toBe(true);
        expect(Math.abs(pose.z)).toBeLessThanOrEqual(RUSH.reach + 0.001);
        expect(pose.scaleX).toBeGreaterThan(0.85);
        expect(pose.scaleX).toBeLessThan(1.15);
        expect(pose.flash).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('shakeOffset', () => {
  it('é proporcional à intensidade e nula sem ela', () => {
    const none = shakeOffset(1.3, 0);
    expect(none.x).toBeCloseTo(0, 10);
    expect(none.y).toBeCloseTo(0, 10);
    const a = shakeOffset(0.5, 0.05);
    expect(Math.abs(a.x)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(a.y)).toBeLessThanOrEqual(0.05);
  });
});
