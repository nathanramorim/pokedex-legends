import { getPokemonDetail, listPokemon } from '@/application';
import { PokeApiPokemonRepository } from '@/infrastructure';
import { env } from './config/env';

const repository = new PokeApiPokemonRepository({
  baseUrl: env.pokeApiBaseUrl,
  artworkBaseUrl: env.artworkBaseUrl,
  itemIconBaseUrl: env.itemIconBaseUrl,
  revalidateSeconds: env.revalidateSeconds,
});

export const useCases = {
  listPokemon: listPokemon(repository),
  getPokemonDetail: getPokemonDetail(repository),
};
