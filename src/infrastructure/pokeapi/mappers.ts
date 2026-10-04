import type {
  Ability,
  EvolutionDetail,
  EvolutionNode,
  MegaForm,
  Move,
  MoveCategory,
  Pokemon,
  PokemonSpecies,
  PokemonSummary,
  PokemonType,
  TypeRelations,
} from '@/domain';
import { isPokemonType } from '@/domain';
import type {
  AbilityDto,
  ChainLinkDto,
  EvolutionDetailDto,
  ListDto,
  MoveDto,
  NamedRef,
  PokemonDto,
  SpeciesDto,
  TypeDto,
} from './dto';

export const idFromUrl = (url: string): number => {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : NaN;
};

const clean = (text: string) => text.replace(/[\f\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();

const english = <T extends { language: NamedRef }>(entries: T[]): T[] =>
  entries.filter((e) => e.language.name === 'en');

const toTypes = (refs: NamedRef[]): PokemonType[] => refs.map((r) => r.name).filter(isPokemonType);

export const artworkUrlFor = (baseUrl: string, id: number) => `${baseUrl}/${id}.png`;

export function mapList(dto: ListDto): PokemonSummary[] {
  return dto.results
    .map((r) => ({ id: idFromUrl(r.url), name: r.name }))
    .filter((p) => Number.isFinite(p.id))
    .sort((a, b) => a.id - b.id);
}

export function mapPokemon(dto: PokemonDto, artworkBaseUrl: string, itemIconBaseUrl: string): Pokemon {
  return {
    id: dto.id,
    name: dto.name,
    height: dto.height,
    weight: dto.weight,
    types: toTypes([...dto.types].sort((a, b) => a.slot - b.slot).map((t) => t.type)),
    stats: dto.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    abilities: dto.abilities.map((a) => ({ name: a.ability.name, isHidden: a.is_hidden })),
    heldItems: dto.held_items.map((h) => ({ name: h.item.name, iconUrl: `${itemIconBaseUrl}/${h.item.name}.png` })),
    artworkUrl: artworkUrlFor(artworkBaseUrl, dto.id),
  };
}

export function mapSpecies(dto: SpeciesDto): PokemonSpecies {
  const flavor = english(dto.flavor_text_entries).at(-1)?.flavor_text ?? '';
  return {
    id: dto.id,
    name: dto.name,
    genus: english(dto.genera)[0]?.genus ?? '',
    description: clean(flavor),
    captureRate: dto.capture_rate,
    habitat: dto.habitat?.name ?? null,
    color: dto.color.name,
    isLegendary: dto.is_legendary,
    isMythical: dto.is_mythical,
    evolutionChainId: dto.evolution_chain ? idFromUrl(dto.evolution_chain.url) : null,
    varieties: dto.varieties.map((v) => ({ name: v.pokemon.name, isDefault: v.is_default })),
  };
}

const mapDetail = (d: EvolutionDetailDto): EvolutionDetail => ({
  trigger: d.trigger?.name ?? 'level-up',
  minLevel: d.min_level,
  item: d.item?.name ?? null,
  heldItem: d.held_item?.name ?? null,
  knownMove: d.known_move?.name ?? null,
  location: d.location?.name ?? null,
  minHappiness: d.min_happiness,
  timeOfDay: d.time_of_day || null,
});

export function mapEvolutionChain(link: ChainLinkDto, artworkBaseUrl: string): EvolutionNode {
  const id = idFromUrl(link.species.url);
  return {
    id,
    name: link.species.name,
    artworkUrl: artworkUrlFor(artworkBaseUrl, id),
    details: link.evolution_details.map(mapDetail),
    evolvesTo: link.evolves_to.map((next) => mapEvolutionChain(next, artworkBaseUrl)),
  };
}

export function mapAbility(dto: AbilityDto): Ability {
  const effect = english(dto.effect_entries)[0]?.short_effect;
  const flavor = english(dto.flavor_text_entries).at(-1)?.flavor_text;
  return { name: dto.name, description: clean(effect ?? flavor ?? '') };
}

export function mapTypeRelations(dto: TypeDto): TypeRelations {
  const r = dto.damage_relations;
  return {
    type: dto.name as PokemonType,
    doubleDamageTo: toTypes(r.double_damage_to),
    halfDamageTo: toTypes(r.half_damage_to),
    noDamageTo: toTypes(r.no_damage_to),
    doubleDamageFrom: toTypes(r.double_damage_from),
    halfDamageFrom: toTypes(r.half_damage_from),
    noDamageFrom: toTypes(r.no_damage_from),
  };
}

export function mapTypeMembers(dto: TypeDto, maxSpeciesId: number): number[] {
  return dto.pokemon.map((p) => idFromUrl(p.pokemon.url)).filter((id) => id <= maxSpeciesId);
}

export function megaLabel(name: string): string {
  const [base, , suffix] = name.split('-');
  const title = base.charAt(0).toUpperCase() + base.slice(1);
  return suffix ? `Mega ${title} ${suffix.toUpperCase()}` : `Mega ${title}`;
}

export function mapMega(dto: PokemonDto, artworkBaseUrl: string): MegaForm {
  return {
    name: dto.name,
    label: megaLabel(dto.name),
    artworkUrl: artworkUrlFor(artworkBaseUrl, dto.id),
    types: toTypes(dto.types.map((t) => t.type)),
  };
}

export interface LevelUpEntry {
  name: string;
  level: number;
}

/**
 * Golpes aprendidos por nível na geração mais recente em que o Pokémon aparece.
 * A PokéAPI lista as versões em ordem cronológica; usamos o grupo de versões
 * que aparece por último nas entradas de level-up.
 */
export function pickLevelUpMoves(dto: PokemonDto): LevelUpEntry[] {
  const entries = dto.moves.flatMap((m) =>
    m.version_group_details
      .filter((d) => d.move_learn_method.name === 'level-up')
      .map((d) => ({ name: m.move.name, level: d.level_learned_at, group: d.version_group.name })),
  );
  if (entries.length === 0) return [];
  const counts = new Map<string, number>();
  entries.forEach((e) => counts.set(e.group, (counts.get(e.group) ?? 0) + 1));
  // grupo mais recente = último na ordem em que aparece nos detalhes dos golpes
  const order: string[] = [];
  dto.moves.forEach((m) => m.version_group_details.forEach((d) => {
    if (!order.includes(d.version_group.name)) order.push(d.version_group.name);
  }));
  const withLevelUp = order.filter((g) => counts.has(g));
  const group = withLevelUp.at(-1) ?? [...counts.keys()][0];
  const sorted = entries
    .filter((e) => e.group === group)
    .map((e) => ({ name: e.name, level: Math.max(1, e.level) }))
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  // a API repete o mesmo golpe em vários níveis/entradas: fica o primeiro (menor nível)
  return sorted.filter((e, i) => sorted.findIndex((o) => o.name === e.name) === i);
}

const CATEGORIES: MoveCategory[] = ['physical', 'special', 'status'];

export function mapMove(dto: MoveDto, level: number): Move | null {
  if (!isPokemonType(dto.type.name)) return null;
  const category = CATEGORIES.find((c) => c === dto.damage_class?.name) ?? 'status';
  return {
    name: dto.name,
    type: dto.type.name,
    category,
    power: dto.power,
    accuracy: dto.accuracy,
    pp: dto.pp,
    level,
    effect: moveEffectText(dto),
    effectChance: dto.effect_chance ?? null,
    priority: dto.priority ?? 0,
    target: dto.target?.name ?? '',
  };
}

/** Texto do efeito em inglês, com `$effect_chance` substituído pelo valor real. */
export function moveEffectText(dto: MoveDto): string {
  const short = english(dto.effect_entries ?? [])[0]?.short_effect;
  const flavor = english(dto.flavor_text_entries ?? []).at(-1)?.flavor_text;
  const text = clean(short ?? flavor ?? '');
  const chance = dto.effect_chance;
  if (chance === null || chance === undefined) return text.replace(/\$effect_chance%?\s*/g, '').trim();
  const withValue = text.replace(/\$effect_chance/g, String(chance));
  // A PokéAPI às vezes omite o número ("Has a chance to ..."): injeta o valor real.
  if (/\d+%/.test(withValue)) return withValue.trim();
  return withValue.replace(/\b(an? )chance\b/i, `$1${chance}% chance`).trim();
}
