export const env = {
  pokeApiBaseUrl: process.env.NEXT_PUBLIC_POKEAPI_URL ?? 'https://pokeapi.co/api/v2',
  artworkBaseUrl:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork',
  itemIconBaseUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items',
  revalidateSeconds: 60 * 60 * 24,
} as const;
