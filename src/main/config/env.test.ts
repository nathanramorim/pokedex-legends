import { env } from './env';

describe('env', () => {
  it('aponta para a PokéAPI v2 por padrão', () => {
    expect(env.pokeApiBaseUrl).toContain('pokeapi.co/api/v2');
  });
});
