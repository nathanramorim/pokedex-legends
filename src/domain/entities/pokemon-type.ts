export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export function isPokemonType(value: string): value is PokemonType {
  return (POKEMON_TYPES as readonly string[]).includes(value);
}

/** Relações de dano de um tipo atacante/defensor, no formato da PokéAPI. */
export interface TypeRelations {
  type: PokemonType;
  doubleDamageTo: PokemonType[];
  halfDamageTo: PokemonType[];
  noDamageTo: PokemonType[];
  doubleDamageFrom: PokemonType[];
  halfDamageFrom: PokemonType[];
  noDamageFrom: PokemonType[];
}
