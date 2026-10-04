/** Linha do tempo do corpo do Pokémon durante um golpe. Funções puras, p = progresso 0..1. */

export interface BodyPose {
  /** Deslocamento em direção à câmera. */
  z: number;
  scaleX: number;
  scaleY: number;
  rotZ: number;
  /** Brilho de impacto (0..1). */
  flash: number;
  /** Intensidade do tremor de câmera. */
  shake: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - (1 - clamp01(t)) ** 3;
const easeIn = (t: number) => clamp01(t) ** 3;
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const RUSH = { anticipation: 0.2, impact: 0.38, holdEnd: 0.44, reach: 1.3 } as const;
export const PROJECTILE = { charge: 0.25, impact: 0.66 } as const;

const REST: BodyPose = { z: 0, scaleX: 1, scaleY: 1, rotZ: 0, flash: 0, shake: 0 };

/** Físico: antecipa, acelera, pausa no impacto e volta com oscilação amortecida. */
export function rushPose(progress: number): BodyPose {
  const p = clamp01(progress);
  const { anticipation, impact, holdEnd, reach } = RUSH;
  let z: number;
  let scaleX = 1;
  let scaleY = 1;
  let rotZ = 0;

  if (p < anticipation) {
    const t = easeOut(p / anticipation);
    z = -0.35 * t;
    scaleY = 1 - 0.07 * t; // comprime
    scaleX = 1 + 0.04 * t;
    rotZ = 0.1 * t;
  } else if (p < impact) {
    const t = easeIn((p - anticipation) / (impact - anticipation));
    z = lerp(-0.35, reach, t);
    scaleY = lerp(0.93, 1.06, t); // estica na aceleração
    scaleX = lerp(1.04, 0.97, t);
    rotZ = lerp(0.1, -0.12, t);
  } else if (p < holdEnd) {
    // pausa de impacto (hit-stop): corpo quase parado, com leve vibração
    z = reach;
    scaleY = 1.02;
    scaleX = 1.02;
    rotZ = -0.12 + Math.sin(((p - impact) / (holdEnd - impact)) * Math.PI * 6) * 0.015;
  } else {
    const u = (p - holdEnd) / (1 - holdEnd);
    const decay = Math.exp(-5 * u);
    z = reach * decay * Math.cos(6 * u) * (1 - u ** 6); // volta com leve overshoot
    scaleY = 1 + 0.03 * Math.sin(u * Math.PI * 3) * decay;
    scaleX = 1 - 0.02 * Math.sin(u * Math.PI * 3) * decay;
    rotZ = -0.12 * decay;
  }

  const since = Math.max(0, p - impact);
  return {
    z, scaleX, scaleY, rotZ,
    flash: p >= impact ? Math.exp(-14 * since) : 0,
    shake: p >= impact ? 0.07 * Math.exp(-8 * since) : 0,
  };
}

/** Especial: inspira e inclina, dispara com recuo e volta; impacto distante dá só um tremor leve. */
export function projectilePose(progress: number): BodyPose {
  const p = clamp01(progress);
  const { charge, impact } = PROJECTILE;
  if (p < charge) {
    const t = smooth(p / charge);
    return {
      z: -0.32 * t, scaleX: 1 + 0.04 * t, scaleY: 1 - 0.05 * t, rotZ: 0.06 * t,
      flash: 0.25 * t * t, shake: 0,
    };
  }
  const u = p - charge;
  const recoil = Math.exp(-8 * u);
  return {
    z: -0.32 * recoil * Math.cos(9 * u),
    scaleX: 1 + 0.04 * recoil, scaleY: 1 - 0.05 * recoil, rotZ: 0.06 * recoil,
    flash: 0.5 * Math.exp(-12 * u),
    shake: p >= impact ? 0.035 * Math.exp(-8 * (p - impact)) : 0,
  };
}

/** Status: sem deslocamento, apenas respira e brilha em pulsos que somem no fim. */
export function auraPose(progress: number): BodyPose {
  const p = clamp01(progress);
  const env = Math.sin(p * Math.PI);
  const pulse = Math.sin(p * Math.PI * 6);
  return {
    ...REST,
    scaleX: 1 + 0.03 * pulse * env,
    scaleY: 1 + 0.03 * pulse * env,
    flash: 0.35 * env * (0.5 + 0.5 * pulse),
  };
}

export const bodyPoseFor = (motion: 'rush' | 'projectile' | 'aura', progress: number): BodyPose =>
  motion === 'rush' ? rushPose(progress) : motion === 'projectile' ? projectilePose(progress) : auraPose(progress);

/** Posição da câmera tremendo: deslocamento determinístico a partir do tempo. */
export const shakeOffset = (time: number, intensity: number) => ({
  x: Math.sin(time * 71) * intensity,
  y: Math.cos(time * 83) * intensity * 0.8,
});
