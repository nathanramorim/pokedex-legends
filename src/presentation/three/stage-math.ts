/** Funções puras da animação do palco (testáveis sem WebGL). */

export const MAX_ROTATION = (50 * Math.PI) / 180;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const clampRotation = (radians: number) => clamp(radians, -MAX_ROTATION, MAX_ROTATION);

/** Converte arrasto horizontal (px) em rotação (rad) relativa à largura do palco. */
export const dragToRotation = (deltaX: number, stageWidth: number) =>
  stageWidth > 0 ? clampRotation((deltaX / stageWidth) * Math.PI) : 0;

export interface Spring {
  value: number;
  velocity: number;
}

/** Mola amortecida em direção ao alvo (usada para voltar ao centro e para o "pulso"). */
export function springStep(spring: Spring, target: number, dt: number, stiffness = 90, damping = 14): Spring {
  const step = Math.min(dt, 1 / 30);
  const acceleration = stiffness * (target - spring.value) - damping * spring.velocity;
  const velocity = spring.velocity + acceleration * step;
  return { value: spring.value + velocity * step, velocity };
}

/** Flutuação vertical suave. */
export const floatOffset = (time: number, amplitude = 0.06, speed = 1.6) => Math.sin(time * speed) * amplitude;

/** Inclinação leve de repouso para dar sensação de vida. */
export const swayAngle = (time: number, amplitude = 0.05, speed = 0.9) => Math.sin(time * speed) * amplitude;

export const KEY_ROTATION_STEP = (12 * Math.PI) / 180;

/* ---------- Efeitos de golpe ---------- */

export const clamp01 = (value: number) => clamp(value, 0, 1);
export const easeOut = (t: number) => 1 - (1 - clamp01(t)) ** 3;
export const easeIn = (t: number) => clamp01(t) ** 3;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Pico em p = 0.5; 0 nas pontas. */
export const envelope = (p: number) => Math.sin(clamp01(p) * Math.PI);

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

/** Trajetória do projétil: sai do Pokémon, faz um arco leve e cruza a cena. */
export function projectilePoint(p: number): Point3 {
  const t = easeOut(clamp01(p) * 0.85 + 0.15 * clamp01(p));
  return { x: lerp(0.3, 1.3, t), y: lerp(0, 0.35, t) + Math.sin(t * Math.PI) * 0.25, z: 0.4 };
}
