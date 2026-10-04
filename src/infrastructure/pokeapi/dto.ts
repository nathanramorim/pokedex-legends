export interface NamedRef {
  name: string;
  url: string;
}

export interface PokemonDto {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: NamedRef }[];
  stats: { base_stat: number; stat: NamedRef }[];
  abilities: { ability: NamedRef; is_hidden: boolean }[];
  held_items: { item: NamedRef }[];
  moves: {
    move: NamedRef;
    version_group_details: { level_learned_at: number; move_learn_method: NamedRef; version_group: NamedRef }[];
  }[];
}

export interface MoveDto {
  name: string;
  type: NamedRef;
  damage_class: NamedRef | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  effect_chance: number | null;
  target: NamedRef;
  effect_entries: { effect: string; short_effect: string; language: NamedRef }[];
  flavor_text_entries: { flavor_text: string; language: NamedRef }[];
}

export interface SpeciesDto {
  id: number;
  name: string;
  capture_rate: number;
  is_legendary: boolean;
  is_mythical: boolean;
  habitat: NamedRef | null;
  color: NamedRef;
  genera: { genus: string; language: NamedRef }[];
  flavor_text_entries: { flavor_text: string; language: NamedRef }[];
  evolution_chain: { url: string } | null;
  varieties: { is_default: boolean; pokemon: NamedRef }[];
}

export interface EvolutionDetailDto {
  trigger: NamedRef | null;
  min_level: number | null;
  item: NamedRef | null;
  held_item: NamedRef | null;
  known_move: NamedRef | null;
  location: NamedRef | null;
  min_happiness: number | null;
  time_of_day: string;
}

export interface ChainLinkDto {
  species: NamedRef;
  evolution_details: EvolutionDetailDto[];
  evolves_to: ChainLinkDto[];
}

export interface EvolutionChainDto {
  chain: ChainLinkDto;
}

export interface AbilityDto {
  name: string;
  effect_entries: { short_effect: string; language: NamedRef }[];
  flavor_text_entries: { flavor_text: string; language: NamedRef }[];
}

export interface TypeDto {
  name: string;
  damage_relations: Record<
    | 'double_damage_to' | 'half_damage_to' | 'no_damage_to'
    | 'double_damage_from' | 'half_damage_from' | 'no_damage_from',
    NamedRef[]
  >;
  pokemon: { pokemon: NamedRef }[];
}

export interface ListDto {
  count: number;
  results: NamedRef[];
}
