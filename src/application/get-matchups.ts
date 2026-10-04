import type { PokemonType, TypeRelations } from '@/domain';
import { POKEMON_TYPES } from '@/domain';

export interface Matchup {
  type: PokemonType;
  multiplier: number;
}

export interface Matchups {
  /** Tipos que os golpes dos tipos do Pokémon atingem com dano dobrado. */
  effectiveAgainst: PokemonType[];
  /** Tipos atacantes que causam dano maior que 1×, do mais perigoso ao menos. */
  weaknesses: Matchup[];
  resistances: Matchup[];
  immunities: PokemonType[];
}

function incomingMultiplier(attacker: PokemonType, defending: TypeRelations[]): number {
  return defending.reduce((total, d) => {
    if (d.noDamageFrom.includes(attacker)) return total * 0;
    if (d.doubleDamageFrom.includes(attacker)) return total * 2;
    if (d.halfDamageFrom.includes(attacker)) return total * 0.5;
    return total;
  }, 1);
}

/** Combina as relações de 1 ou 2 tipos do Pokémon. */
export function computeMatchups(relations: TypeRelations[]): Matchups {
  const all = POKEMON_TYPES.map((type) => ({ type, multiplier: incomingMultiplier(type, relations) }));
  const effective = new Set<PokemonType>();
  relations.forEach((r) => r.doubleDamageTo.forEach((t) => effective.add(t)));

  return {
    effectiveAgainst: POKEMON_TYPES.filter((t) => effective.has(t)),
    weaknesses: all.filter((m) => m.multiplier > 1).sort((a, b) => b.multiplier - a.multiplier),
    resistances: all.filter((m) => m.multiplier > 0 && m.multiplier < 1).sort((a, b) => a.multiplier - b.multiplier),
    immunities: all.filter((m) => m.multiplier === 0).map((m) => m.type),
  };
}
