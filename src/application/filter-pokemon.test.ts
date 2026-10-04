import { EMPTY_FILTERS, filterPokemon, hasActiveFilters } from './filter-pokemon';
import type { PokemonListItem } from './list-pokemon';

const items: PokemonListItem[] = [
  { id: 1, name: 'bulbasaur', types: ['grass', 'poison'] },
  { id: 6, name: 'charizard', types: ['fire', 'flying'] },
  { id: 4, name: 'charmander', types: ['fire'] },
  { id: 152, name: 'chikorita', types: ['grass'] },
  { id: 122, name: 'mr-mime', types: ['psychic', 'fairy'] },
];

describe('filterPokemon', () => {
  it('sem filtros devolve todos', () => {
    expect(filterPokemon(items, EMPTY_FILTERS)).toHaveLength(5);
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it('filtra por tipo (todos os tipos selecionados)', () => {
    expect(filterPokemon(items, { ...EMPTY_FILTERS, types: ['fire'] }).map((p) => p.id)).toEqual([6, 4]);
    expect(filterPokemon(items, { ...EMPTY_FILTERS, types: ['fire', 'flying'] }).map((p) => p.id)).toEqual([6]);
    expect(filterPokemon(items, { ...EMPTY_FILTERS, types: ['fire', 'water'] })).toEqual([]);
  });

  it('filtra por geração', () => {
    expect(filterPokemon(items, { ...EMPTY_FILTERS, generation: 2 }).map((p) => p.id)).toEqual([152]);
  });

  it('busca por nome parcial, número e ignora hífen/acento', () => {
    expect(filterPokemon(items, { ...EMPTY_FILTERS, query: 'char' }).map((p) => p.id)).toEqual([6, 4]);
    expect(filterPokemon(items, { ...EMPTY_FILTERS, query: '#6' }).map((p) => p.id)).toEqual([6]);
    expect(filterPokemon(items, { ...EMPTY_FILTERS, query: 'mr mime' }).map((p) => p.id)).toEqual([122]);
  });

  it('combina busca, tipo e geração', () => {
    const r = filterPokemon(items, { query: 'c', types: ['grass'], generation: 2 });
    expect(r.map((p) => p.id)).toEqual([152]);
  });
});
