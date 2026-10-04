import { recommendPokeball, type CaptureProfile } from './recommend-pokeball';

const base: CaptureProfile = { captureRate: 255, habitat: 'grassland', types: ['normal'], isLegendary: false, isMythical: false };

describe('recommendPokeball (CA8)', () => {
  it('é determinística', () => {
    expect(recommendPokeball(base)).toEqual(recommendPokeball({ ...base }));
  });

  const cases: [string, Partial<CaptureProfile>, string][] = [
    ['fácil', { captureRate: 255 }, 'poke-ball'],
    ['mediano', { captureRate: 150 }, 'quick-ball'],
    ['difícil', { captureRate: 60 }, 'great-ball'],
    ['muito difícil', { captureRate: 3 }, 'ultra-ball'],
    ['água', { types: ['water'] }, 'net-ball'],
    ['inseto', { types: ['bug'] }, 'net-ball'],
    ['mar', { habitat: 'sea' }, 'dive-ball'],
    ['caverna', { habitat: 'cave' }, 'dusk-ball'],
    ['fantasma', { types: ['ghost'] }, 'dusk-ball'],
  ];

  it.each(cases)('%s', (_name, patch, expected) => {
    expect(recommendPokeball({ ...base, ...patch }).ball).toBe(expected);
  });

  it('lendário e místico nunca recebem Poké Ball comum e trazem motivo', () => {
    for (const flags of [{ isLegendary: true }, { isMythical: true }]) {
      const r = recommendPokeball({ ...base, captureRate: 255, ...flags });
      expect(r.ball).not.toBe('poke-ball');
      expect(r.ball).toBe('ultra-ball');
      expect(r.reason.length).toBeGreaterThan(10);
    }
  });

  it('toda recomendação tem motivo textual', () => {
    expect(recommendPokeball(base).reason).toMatch(/Poké Ball/);
  });
});
