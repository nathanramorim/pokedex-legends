import type { PokemonRepository, PokemonSummary, PokemonType } from '@/domain';

export interface PokemonListItem extends PokemonSummary {
  types: PokemonType[];
}

export function listPokemon(repo: PokemonRepository) {
  return async (): Promise<PokemonListItem[]> => {
    const [all, typeIndex] = await Promise.all([repo.listAll(), repo.getTypeIndex()]);
    return all.map((p) => ({ ...p, types: typeIndex[p.id] ?? [] }));
  };
}
