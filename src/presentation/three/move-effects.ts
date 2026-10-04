import type { MoveCategory, PokemonType } from '@/domain';

export type EffectShape =
  | 'star' | 'flame' | 'drop' | 'bolt' | 'leaf' | 'diamond' | 'burst' | 'bubble' | 'dust'
  | 'swirl' | 'ring' | 'spark' | 'rock' | 'wisp' | 'claw' | 'crescent' | 'gear' | 'heart';

export type EffectMotion = 'rush' | 'projectile' | 'aura';

export interface MoveEffect {
  type: PokemonType;
  category: MoveCategory;
  motion: EffectMotion;
  shape: EffectShape;
  /** Token CSS com a cor do tipo (fonte única das cores). */
  colorToken: string;
  /** Duração em segundos (a física das partículas vem de `particle-profiles.ts`). */
  duration: number;
}

export interface ResolvedEffect extends MoveEffect {
  color: string;
}

const SHAPES: Record<PokemonType, EffectShape> = {
  normal: 'star', fire: 'flame', water: 'drop', electric: 'bolt', grass: 'leaf', ice: 'diamond',
  fighting: 'burst', poison: 'bubble', ground: 'dust', flying: 'swirl', psychic: 'ring', bug: 'spark',
  rock: 'rock', ghost: 'wisp', dragon: 'claw', dark: 'crescent', steel: 'gear', fairy: 'heart',
};

const MOTIONS: Record<MoveCategory, { motion: EffectMotion; duration: number }> = {
  physical: { motion: 'rush', duration: 1.3 },
  special: { motion: 'projectile', duration: 1.5 },
  status: { motion: 'aura', duration: 1.8 },
};

/** Tipo + categoria → efeito. Função pura e determinística. */
export function effectFor(type: PokemonType, category: MoveCategory): MoveEffect {
  return {
    type,
    category,
    shape: SHAPES[type],
    colorToken: `--type-${type}`,
    ...MOTIONS[category],
  };
}
