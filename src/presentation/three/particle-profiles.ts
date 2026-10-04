import type { PokemonType } from '@/domain';

/** Comportamento físico das partículas de cada tipo. Unidades: cena (altura visível ≈ 3,8). */
export interface ParticleProfile {
  /** Aceleração vertical: positivo cai, negativo sobe (empuxo). */
  gravity: number;
  /** Amortecimento por segundo. */
  drag: number;
  /** Aceleração lateral suave e pseudoaleatória. */
  turbulence: number;
  /** Aceleração tangencial em torno do centro do efeito (espirais). */
  swirl: number;
  /** Rotação máxima (rad/s). */
  spin: number;
  /** Formas que não devem girar (chama, gota, coração...). */
  upright: boolean;
  /** Tamanho no início e no fim da vida (1,9 ≈ 50 px num palco de 273 px). */
  sizeStart: number;
  sizeEnd: number;
  life: [number, number];
  speed: [number, number];
  /** Coeficiente de restituição ao tocar o chão (0 = não quica). */
  bounce: number;
  /** Cintilação do brilho (0..1). */
  twinkle: number;
  /** Tremor aleatório de posição por quadro. */
  jitter: number;
  /** Mistura com branco no início da vida (calor/brilho). */
  startMix: number;
  /** Mistura com preto no fim da vida (esfriar/escurecer). */
  endMix: number;
}

const base: ParticleProfile = {
  gravity: 1, drag: 1.2, turbulence: 0.2, swirl: 0, spin: 3, upright: false,
  sizeStart: 1.5, sizeEnd: 0.6, life: [0.5, 0.9], speed: [1, 2.2], bounce: 0,
  twinkle: 0, jitter: 0, startMix: 0.25, endMix: 0.2,
};

const make = (overrides: Partial<ParticleProfile>): ParticleProfile => ({ ...base, ...overrides });

export const PROFILES: Record<PokemonType, ParticleProfile> = {
  normal: make({ gravity: 0.6, drag: 2.5, sizeStart: 1.7, sizeEnd: 0.4 }),
  // sobe, esfria (branco → laranja → escuro) e encolhe
  fire: make({ gravity: -1.6, drag: 1.4, turbulence: 1.2, upright: true, spin: 0, sizeStart: 1.1, sizeEnd: 0.25, life: [0.45, 0.95], startMix: 0.75, endMix: 0.55 }),
  // gotas em arco e queda
  water: make({ gravity: 4.2, drag: 0.35, turbulence: 0.25, upright: true, spin: 0, sizeStart: 1.1, sizeEnd: 0.8, life: [0.6, 1.1], startMix: 0.45, endMix: 0.15 }),
  // estalos curtos, tremidos e muito claros
  electric: make({ gravity: 0, drag: 2.8, turbulence: 0.6, jitter: 0.06, spin: 7, sizeStart: 1.7, sizeEnd: 0.6, life: [0.16, 0.34], speed: [1.5, 3.2], twinkle: 0.7, startMix: 0.85, endMix: 0.05 }),
  // folhas em espiral, caem devagar girando
  grass: make({ gravity: 0.9, drag: 0.9, turbulence: 0.9, swirl: 2.2, spin: 7, sizeStart: 1.3, sizeEnd: 0.8, life: [0.7, 1.2], startMix: 0.2, endMix: 0.35 }),
  // estilhaços rápidos que caem
  ice: make({ gravity: 2.6, drag: 0.25, spin: 4, sizeStart: 1.3, sizeEnd: 0.7, life: [0.6, 1], speed: [1.6, 3.2], twinkle: 0.4, startMix: 0.7, endMix: 0.1 }),
  // explosão seca que freia rápido
  fighting: make({ gravity: 0.3, drag: 4.2, spin: 2, sizeStart: 2.1, sizeEnd: 0.2, life: [0.3, 0.55], speed: [2, 4.2], startMix: 0.5, endMix: 0.3 }),
  // bolhas que sobem balançando e crescem
  poison: make({ gravity: -0.7, drag: 1.1, turbulence: 1, upright: true, spin: 0, sizeStart: 0.8, sizeEnd: 1.5, life: [0.8, 1.4], speed: [0.5, 1.4], startMix: 0.2, endMix: 0.25 }),
  // poeira e pedras que quicam
  ground: make({ gravity: 5, drag: 0.7, bounce: 0.35, spin: 4, sizeStart: 1.1, sizeEnd: 0.9, life: [0.8, 1.3], speed: [1.2, 3], startMix: 0, endMix: 0.2 }),
  // vento em espiral
  flying: make({ gravity: -0.2, drag: 1.1, turbulence: 0.5, swirl: 4.2, spin: 5, sizeStart: 1.4, sizeEnd: 0.6, life: [0.6, 1], speed: [1, 2.4], startMix: 0.55, endMix: 0.05 }),
  // ondas lentas e suaves
  psychic: make({ gravity: -0.15, drag: 0.8, turbulence: 0.4, swirl: 1.4, spin: 1.5, sizeStart: 1, sizeEnd: 2.2, life: [0.8, 1.3], speed: [0.6, 1.4], twinkle: 0.25, startMix: 0.4, endMix: 0.1 }),
  // faíscas ágeis e erráticas
  bug: make({ gravity: 0.5, drag: 1.5, turbulence: 2.4, jitter: 0.03, spin: 6, sizeStart: 0.9, sizeEnd: 0.4, life: [0.5, 0.9], speed: [1.5, 3], startMix: 0.3, endMix: 0.25 }),
  // pedras pesadas que quicam
  rock: make({ gravity: 6, drag: 0.4, bounce: 0.4, spin: 6, sizeStart: 1.8, sizeEnd: 1.3, life: [0.9, 1.4], speed: [1.6, 3.4], startMix: 0, endMix: 0.3 }),
  // fiapos que ondulam e piscam
  ghost: make({ gravity: -0.5, drag: 1, turbulence: 1.6, upright: true, spin: 0, sizeStart: 1.5, sizeEnd: 0.8, life: [0.8, 1.4], speed: [0.6, 1.6], twinkle: 0.5, startMix: 0.3, endMix: 0.35 }),
  // garras e chamas rápidas
  dragon: make({ gravity: -0.4, drag: 1.8, turbulence: 0.7, spin: 4, sizeStart: 1.8, sizeEnd: 0.4, life: [0.45, 0.8], speed: [1.8, 3.6], startMix: 0.55, endMix: 0.45 }),
  // sombras que se contraem para o centro
  dark: make({ gravity: -0.1, drag: 1.3, turbulence: 0.7, swirl: -3, spin: 3, sizeStart: 1.6, sizeEnd: 0.5, life: [0.7, 1.2], speed: [1, 2.2], startMix: 0, endMix: 0.6 }),
  // faíscas metálicas que quicam
  steel: make({ gravity: 3.4, drag: 0.6, bounce: 0.45, spin: 8, sizeStart: 1, sizeEnd: 0.5, life: [0.6, 1], speed: [2, 4], twinkle: 0.4, startMix: 0.7, endMix: 0.2 }),
  // brilhos que cintilam e flutuam
  fairy: make({ gravity: -0.3, drag: 1, turbulence: 0.8, upright: true, spin: 0, sizeStart: 1.1, sizeEnd: 1.6, life: [0.8, 1.4], speed: [0.6, 1.6], twinkle: 0.85, startMix: 0.55, endMix: 0 }),
};

export type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const clean = hex.trim().replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.padEnd(6, '0');
  const n = parseInt(full.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const WHITE: Rgb = [1, 1, 1];
export const BLACK: Rgb = [0, 0, 0];
