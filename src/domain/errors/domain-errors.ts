export class PokemonNotFoundError extends Error {
  constructor(public readonly key: string | number) {
    super(`Pokémon não encontrado: ${key}`);
    this.name = 'PokemonNotFoundError';
  }
}

export class PokemonDataUnavailableError extends Error {
  constructor(message = 'Não foi possível carregar os dados da Pokédex.') {
    super(message);
    this.name = 'PokemonDataUnavailableError';
  }
}
