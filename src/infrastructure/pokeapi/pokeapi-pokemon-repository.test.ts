import { PokemonDataUnavailableError, PokemonNotFoundError } from '@/domain';
import { PokeApiPokemonRepository, type FetchLike } from './pokeapi-pokemon-repository';
import { idFromUrl, megaLabel } from './mappers';

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

const ref = (name: string, url = `https://x/${name}/`) => ({ name, url });

function repo(fetcher: FetchLike) {
  return new PokeApiPokemonRepository({
    baseUrl: 'https://api',
    artworkBaseUrl: 'https://art',
    itemIconBaseUrl: 'https://items',
    revalidateSeconds: 10,
    fetcher,
  });
}

describe('mappers', () => {
  it('extrai id da url', () => {
    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon-species/25/')).toBe(25);
  });
  it('formata nome de mega', () => {
    expect(megaLabel('charizard-mega-x')).toBe('Mega Charizard X');
    expect(megaLabel('venusaur-mega')).toBe('Mega Venusaur');
  });
});

describe('PokeApiPokemonRepository', () => {
  it('lista todas as espécies usando count e ordena', async () => {
    const calls: string[] = [];
    const r = repo((url) => {
      calls.push(url);
      if (url.endsWith('limit=1')) return json({ count: 2, results: [] });
      return json({
        count: 2,
        results: [ref('ivysaur', 'https://x/pokemon-species/2/'), ref('bulbasaur', 'https://x/pokemon-species/1/')],
      });
    });
    const all = await r.listAll();
    expect(all.map((p) => p.id)).toEqual([1, 2]);
    expect(calls.at(-1)).toContain('limit=2');
  });

  it('mapeia pokémon com tipos em ordem de slot e artwork', async () => {
    const r = repo(() =>
      json({
        id: 6, name: 'charizard', height: 17, weight: 905,
        types: [{ slot: 2, type: ref('flying') }, { slot: 1, type: ref('fire') }],
        stats: [{ base_stat: 78, stat: ref('hp') }],
        abilities: [{ ability: ref('blaze'), is_hidden: false }],
        held_items: [],
      }),
    );
    const p = await r.getPokemon(6);
    expect(p.types).toEqual(['fire', 'flying']);
    expect(p.artworkUrl).toBe('https://art/6.png');
  });

  it('404 vira PokemonNotFoundError', async () => {
    await expect(repo(() => json({}, 404)).getPokemon('xyz')).rejects.toBeInstanceOf(PokemonNotFoundError);
  });

  it('falha de rede ou 500 vira PokemonDataUnavailableError', async () => {
    await expect(repo(() => Promise.reject(new Error('net'))).getPokemon(1)).rejects.toBeInstanceOf(
      PokemonDataUnavailableError,
    );
    await expect(repo(() => json({}, 500)).getPokemon(1)).rejects.toBeInstanceOf(PokemonDataUnavailableError);
  });

  it('mapeia cadeia ramificada de evolução', async () => {
    const link = (name: string, id: number, to: unknown[] = []) => ({
      species: ref(name, `https://x/pokemon-species/${id}/`),
      evolution_details: [],
      evolves_to: to,
    });
    const r = repo(() => json({ chain: link('eevee', 133, [link('vaporeon', 134), link('jolteon', 135)]) }));
    const chain = await r.getEvolutionChain(67);
    expect(chain.evolvesTo.map((n) => n.name)).toEqual(['vaporeon', 'jolteon']);
  });

  it('monta índice de tipos ignorando formas alternativas', async () => {
    const r = repo((url) => {
      if (url.includes('pokemon-species')) return json({ count: 1025, results: [] });
      const member = (id: number) => ({ pokemon: ref('p', `https://x/pokemon/${id}/`) });
      const name = url.split('/').pop();
      const pokemon = name === 'fire' ? [member(6), member(10034)] : name === 'flying' ? [member(6)] : [];
      return json({ name, damage_relations: {}, pokemon });
    });
    const index = await r.getTypeIndex();
    expect(index[6]).toEqual(['fire', 'flying']);
    expect(index[10034]).toBeUndefined();
  });
});

describe('golpes por nível', () => {
  const detail = (name: string, ...entries: [string, string, number][]) => ({
    move: ref(name),
    version_group_details: entries.map(([method, group, level]) => ({
      level_learned_at: level, move_learn_method: ref(method), version_group: ref(group),
    })),
  });

  it('usa o grupo mais recente, ordena por nível, ignora TM e remove duplicatas', async () => {
    const r = repo((url) => {
      if (url.includes('/pokemon/')) {
        return json({
          id: 6, name: 'charizard', height: 1, weight: 1, types: [], stats: [], abilities: [], held_items: [],
          moves: [
            detail('flamethrower', ['level-up', 'red-blue', 46], ['level-up', 'sword-shield', 54]),
            detail('ember', ['level-up', 'red-blue', 9], ['level-up', 'sword-shield', 0]),
            detail('fly', ['machine', 'red-blue', 0], ['machine', 'sword-shield', 0]),
            detail('old-move', ['level-up', 'red-blue', 5]),
            detail('flamethrower', ['level-up', 'sword-shield', 30]),
          ],
        });
      }
      const name = url.split('/').pop()!;
      return json({ name, type: ref('fire'), damage_class: ref('special'), power: 40, accuracy: 100, pp: 25 });
    });
    const moves = await r.getLevelUpMoves(6);
    expect(moves.map((m) => [m.name, m.level])).toEqual([['ember', 1], ['flamethrower', 30]]);
    expect(moves[0]).toMatchObject({ type: 'fire', category: 'special', power: 40, pp: 25 });
  });

  it('descarta golpes de tipo desconhecido', async () => {
    const r = repo((url) => {
      if (url.includes('/pokemon/')) {
        return json({ id: 1, name: 'x', height: 1, weight: 1, types: [], stats: [], abilities: [], held_items: [], moves: [detail('weird', ['level-up', 'g', 1])] });
      }
      return json({ name: 'weird', type: ref('stellar'), damage_class: ref('physical'), power: 1, accuracy: 1, pp: 1 });
    });
    expect(await r.getLevelUpMoves(1)).toEqual([]);
  });
});

import { moveEffectText } from './mappers';
import type { MoveDto } from './dto';

describe('moveEffectText (M2)', () => {
  const base = { name: 'ember', type: ref('fire'), damage_class: ref('special'), power: 40, accuracy: 100, pp: 25, priority: 0, effect_chance: 10, target: ref('selected-pokemon'), effect_entries: [], flavor_text_entries: [] } as MoveDto;
  const en = ref('en', 'x');

  it('substitui $effect_chance pelo valor real', () => {
    const dto = { ...base, effect_entries: [{ effect: '', short_effect: 'Has a $effect_chance% chance to burn the target.', language: en }] };
    expect(moveEffectText(dto)).toBe('Has a 10% chance to burn the target.');
  });
  it('cai para o flavor text em inglês e limpa quebras de linha', () => {
    const dto = { ...base, flavor_text_entries: [{ flavor_text: 'Hits\nhard.', language: ref('pt', 'x') }, { flavor_text: 'Hits\fhard\nfoes.', language: en }] };
    expect(moveEffectText(dto)).toBe('Hits hard foes.');
  });
  it('injeta o percentual quando a API omite o número', () => {
    const dto = { ...base, effect_entries: [{ effect: '', short_effect: 'Has a chance to burn the target.', language: en }] };
    expect(moveEffectText(dto)).toBe('Has a 10% chance to burn the target.');
  });
  it('não duplica quando o texto já traz o percentual', () => {
    const dto = { ...base, effect_entries: [{ effect: '', short_effect: 'Has a 30% chance to flinch.', language: en }] };
    expect(moveEffectText(dto)).toBe('Has a 30% chance to flinch.');
  });
  it('sem chance, não deixa o marcador cru no texto', () => {
    const dto = { ...base, effect_chance: null, effect_entries: [{ effect: '', short_effect: 'Hits hard.', language: en }] };
    expect(moveEffectText(dto)).toBe('Hits hard.');
  });
  it('sem texto devolve vazio', () => {
    expect(moveEffectText(base)).toBe('');
  });
});
