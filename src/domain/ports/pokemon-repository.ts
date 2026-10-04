import type {
  Ability,
  EvolutionNode,
  MegaForm,
  Move,
  Pokemon,
  PokemonSpecies,
  PokemonSummary,
} from '../entities/pokemon';
import type { PokemonType, TypeRelations } from '../entities/pokemon-type';

export interface PokemonRepository {
  /** Todas as espécies, ordenadas por número da Pokédex. */
  listAll(): Promise<PokemonSummary[]>;
  /** Índice número → tipos para todas as espécies (para cards e filtros). */
  getTypeIndex(): Promise<Record<number, PokemonType[]>>;
  getPokemon(idOrName: string | number): Promise<Pokemon>;
  getSpecies(idOrName: string | number): Promise<PokemonSpecies>;
  getEvolutionChain(chainId: number): Promise<EvolutionNode>;
  getAbility(name: string): Promise<Ability>;
  getTypeRelations(type: PokemonType): Promise<TypeRelations>;
  /** Golpes aprendidos por nível, ordenados por nível. */
  getLevelUpMoves(idOrName: string | number): Promise<Move[]>;
  getMegaForms(varietyNames: string[]): Promise<MegaForm[]>;
}
