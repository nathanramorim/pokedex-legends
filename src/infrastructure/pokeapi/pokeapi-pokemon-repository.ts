import {
  POKEMON_TYPES,
  PokemonDataUnavailableError,
  PokemonNotFoundError,
  type PokemonRepository,
  type PokemonType,
} from '@/domain';
import type {
  AbilityDto, EvolutionChainDto, ListDto, MoveDto, PokemonDto, SpeciesDto, TypeDto,
} from './dto';
import {
  mapAbility, mapEvolutionChain, mapList, mapMega, mapPokemon, mapSpecies,
  mapMove, mapTypeMembers, mapTypeRelations, pickLevelUpMoves,
} from './mappers';

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export interface PokeApiOptions {
  baseUrl: string;
  artworkBaseUrl: string;
  itemIconBaseUrl: string;
  revalidateSeconds: number;
  fetcher?: FetchLike;
}

type NextInit = RequestInit & { next?: { revalidate: number } };

export class PokeApiPokemonRepository implements PokemonRepository {
  private readonly fetcher: FetchLike;
  private speciesCount: Promise<number> | null = null;

  constructor(private readonly options: PokeApiOptions) {
    this.fetcher = options.fetcher ?? ((url, init) => fetch(url, init));
  }

  private async get<T>(path: string, key?: string | number): Promise<T> {
    const init: NextInit = { next: { revalidate: this.options.revalidateSeconds } };
    let response: Response;
    try {
      response = await this.fetcher(`${this.options.baseUrl}${path}`, init);
    } catch {
      throw new PokemonDataUnavailableError();
    }
    if (response.status === 404) throw new PokemonNotFoundError(key ?? path);
    if (!response.ok) throw new PokemonDataUnavailableError();
    return (await response.json()) as T;
  }

  private async getSpeciesCount(): Promise<number> {
    this.speciesCount ??= this.get<ListDto>('/pokemon-species?limit=1').then((d) => d.count);
    return this.speciesCount;
  }

  async listAll() {
    const count = await this.getSpeciesCount();
    return mapList(await this.get<ListDto>(`/pokemon-species?limit=${count}`));
  }

  async getTypeIndex() {
    const [count, types] = await Promise.all([
      this.getSpeciesCount(),
      Promise.all(POKEMON_TYPES.map((t) => this.get<TypeDto>(`/type/${t}`))),
    ]);
    const index: Record<number, PokemonType[]> = {};
    types.forEach((dto, i) => {
      for (const id of mapTypeMembers(dto, count)) (index[id] ??= []).push(POKEMON_TYPES[i]);
    });
    return index;
  }

  async getPokemon(idOrName: string | number) {
    return mapPokemon(await this.get<PokemonDto>(`/pokemon/${idOrName}`, idOrName), this.options.artworkBaseUrl, this.options.itemIconBaseUrl);
  }

  async getSpecies(idOrName: string | number) {
    return mapSpecies(await this.get<SpeciesDto>(`/pokemon-species/${idOrName}`, idOrName));
  }

  async getEvolutionChain(chainId: number) {
    const dto = await this.get<EvolutionChainDto>(`/evolution-chain/${chainId}`, chainId);
    return mapEvolutionChain(dto.chain, this.options.artworkBaseUrl);
  }

  async getAbility(name: string) {
    return mapAbility(await this.get<AbilityDto>(`/ability/${name}`, name));
  }

  async getTypeRelations(type: PokemonType) {
    return mapTypeRelations(await this.get<TypeDto>(`/type/${type}`, type));
  }

  async getLevelUpMoves(idOrName: string | number) {
    const entries = pickLevelUpMoves(await this.get<PokemonDto>(`/pokemon/${idOrName}`, idOrName));
    const moves = await Promise.all(
      entries.map(async (e) => mapMove(await this.get<MoveDto>(`/move/${e.name}`, e.name), e.level)),
    );
    return moves.filter((m): m is NonNullable<typeof m> => m !== null);
  }

  async getMegaForms(varietyNames: string[]) {
    const dtos = await Promise.all(varietyNames.map((n) => this.get<PokemonDto>(`/pokemon/${n}`, n)));
    return dtos.map((d) => mapMega(d, this.options.artworkBaseUrl));
  }
}
