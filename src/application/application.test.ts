import type { PokemonRepository } from '@/domain';
import { getPokemonDetail } from './get-pokemon-detail';
import { listPokemon } from './list-pokemon';

const base = {
  listAll: async () => [{ id: 1, name: 'bulbasaur' }, { id: 2, name: 'ivysaur' }],
  getTypeIndex: async () => ({ 1: ['grass' as const, 'poison' as const] }),
  getPokemon: async () => ({
    id: 6, name: 'charizard', types: ['fire' as const, 'flying' as const], stats: [], height: 1, weight: 1,
    abilities: [{ name: 'blaze', isHidden: false }], heldItems: [], artworkUrl: '',
  }),
  getSpecies: async () => ({
    id: 6, name: 'charizard', genus: '', description: '', captureRate: 45, habitat: null, color: 'red',
    isLegendary: false, isMythical: false, evolutionChainId: null,
    varieties: [{ name: 'charizard', isDefault: true }, { name: 'charizard-mega-x', isDefault: false }, { name: 'charizard-gmax', isDefault: false }],
  }),
  getEvolutionChain: async () => ({ id: 1, name: 'x', artworkUrl: '', details: [], evolvesTo: [] }),
  getAbility: async (name: string) => ({ name, description: 'd' }),
  getTypeRelations: async (type: never) => ({ type, doubleDamageTo: [], halfDamageTo: [], noDamageTo: [], doubleDamageFrom: [], halfDamageFrom: [], noDamageFrom: [] }),
  getLevelUpMoves: async () => [{ name: 'ember', type: 'fire' as const, category: 'special' as const, power: 40, accuracy: 100, pp: 25, level: 7, effect: '', effectChance: null, priority: 0, target: 'selected-pokemon' }],
  getMegaForms: async (names: string[]) => names.map((n) => ({ name: n, label: n, artworkUrl: '', types: [] })),
} as unknown as PokemonRepository;

describe('casos de uso', () => {
  it('listPokemon une tipos à lista', async () => {
    const list = await listPokemon(base)();
    expect(list).toHaveLength(2);
    expect(list[0].types).toEqual(['grass', 'poison']);
    expect(list[1].types).toEqual([]);
  });

  it('getPokemonDetail pede só formas mega, sem evolução quando não há cadeia', async () => {
    const d = await getPokemonDetail(base)(6);
    expect(d.megaForms.map((m) => m.name)).toEqual(['charizard-mega-x']);
    expect(d.evolution).toBeNull();
    expect(d.typeRelations).toHaveLength(2);
    expect(d.abilities[0].name).toBe('blaze');
  });
});
