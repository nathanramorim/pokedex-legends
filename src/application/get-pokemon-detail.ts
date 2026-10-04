import type {
  Ability,
  EvolutionNode,
  MegaForm,
  Move,
  Pokemon,
  PokemonRepository,
  PokemonSpecies,
  TypeRelations,
} from '@/domain';

export interface PokemonDetail {
  pokemon: Pokemon;
  species: PokemonSpecies;
  abilities: Ability[];
  evolution: EvolutionNode | null;
  megaForms: MegaForm[];
  moves: Move[];
  typeRelations: TypeRelations[];
}

export function getPokemonDetail(repo: PokemonRepository) {
  return async (idOrName: string | number): Promise<PokemonDetail> => {
    const pokemon = await repo.getPokemon(idOrName);
    const species = await repo.getSpecies(pokemon.id);
    const megaNames = species.varieties.filter((v) => !v.isDefault && v.name.includes('-mega')).map((v) => v.name);

    const [abilities, evolution, megaForms, typeRelations, moves] = await Promise.all([
      Promise.all(pokemon.abilities.map((a) => repo.getAbility(a.name))),
      species.evolutionChainId ? repo.getEvolutionChain(species.evolutionChainId) : Promise.resolve(null),
      repo.getMegaForms(megaNames),
      Promise.all(pokemon.types.map((t) => repo.getTypeRelations(t))),
      repo.getLevelUpMoves(pokemon.id),
    ]);

    return { pokemon, species, abilities, evolution, megaForms, typeRelations, moves };
  };
}
