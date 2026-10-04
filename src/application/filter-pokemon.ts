import type { PokemonType } from '@/domain';
import { GENERATIONS } from '@/domain';
import type { PokemonListItem } from './list-pokemon';

export interface PokemonFilters {
  query: string;
  /** O Pokémon precisa ter TODOS os tipos selecionados. */
  types: PokemonType[];
  generation: number | null;
}

export const EMPTY_FILTERS: PokemonFilters = { query: '', types: [], generation: null };

const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[-\s]/g, '');

export function filterPokemon(items: PokemonListItem[], filters: PokemonFilters): PokemonListItem[] {
  const query = normalize(filters.query.trim().replace(/^#/, ''));
  const generation = GENERATIONS.find((g) => g.id === filters.generation) ?? null;

  return items.filter((p) => {
    if (generation && (p.id < generation.firstId || p.id > generation.lastId)) return false;
    if (!filters.types.every((t) => p.types.includes(t))) return false;
    if (!query) return true;
    return normalize(p.name).includes(query) || String(p.id) === query || String(p.id).padStart(4, '0').includes(query);
  });
}

export function hasActiveFilters(filters: PokemonFilters): boolean {
  return Boolean(filters.query.trim()) || filters.types.length > 0 || filters.generation !== null;
}
