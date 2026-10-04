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
