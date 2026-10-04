import type { PokemonType } from './pokemon-type';

/** Item mínimo da lista (uma espécie). */
export interface PokemonSummary {
  id: number;
  name: string;
}

export interface Stat {
  name: string;
  value: number;
}

export interface AbilitySlot {
  name: string;
  isHidden: boolean;
}

export interface Ability {
  name: string;
  description: string;
}

export interface HeldItem {
  name: string;
  iconUrl: string;
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  stats: Stat[];
  /** decímetros */
  height: number;
  /** hectogramas */
  weight: number;
  abilities: AbilitySlot[];
  heldItems: HeldItem[];
  artworkUrl: string;
}

export interface SpeciesVariety {
  name: string;
  isDefault: boolean;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  genus: string;
  description: string;
  captureRate: number;
  habitat: string | null;
  color: string;
  isLegendary: boolean;
  isMythical: boolean;
  evolutionChainId: number | null;
  varieties: SpeciesVariety[];
}

export interface EvolutionDetail {
  trigger: string;
  minLevel: number | null;
  item: string | null;
  heldItem: string | null;
  knownMove: string | null;
  location: string | null;
  minHappiness: number | null;
  timeOfDay: string | null;
}

export interface EvolutionNode {
  id: number;
  name: string;
  artworkUrl: string;
  details: EvolutionDetail[];
  evolvesTo: EvolutionNode[];
}

export type MoveCategory = 'physical' | 'special' | 'status';

export interface Move {
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  /** Nível em que o Pokémon aprende o golpe (1 = desde o início). */
  level: number;
  /** Descrição do efeito (inglês, vinda da PokéAPI); vazio se não houver. */
  effect: string;
  /** Chance (%) do efeito secundário, quando existir. */
  effectChance: number | null;
  priority: number;
  /** Alvo no formato da PokéAPI (ex.: selected-pokemon). */
  target: string;
}

export interface MegaForm {
  name: string;
  label: string;
  artworkUrl: string;
  types: PokemonType[];
}
