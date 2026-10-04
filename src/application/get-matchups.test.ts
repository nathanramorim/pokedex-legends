import { fireRelations, flyingRelations } from '@/test/fixtures';
import { computeMatchups } from './get-matchups';

describe('computeMatchups (CA5)', () => {
  it('tipo simples: fogo é fraco a água/terra/pedra em 2×', () => {
    const m = computeMatchups([fireRelations]);
    expect(m.weaknesses).toEqual([
      { type: 'water', multiplier: 2 }, { type: 'ground', multiplier: 2 }, { type: 'rock', multiplier: 2 },
    ]);
    expect(m.effectiveAgainst).toEqual(['grass', 'ice', 'bug', 'steel']);
  });

  it('tipo duplo: Charizard leva 4× de Pedra', () => {
    const m = computeMatchups([fireRelations, flyingRelations]);
    expect(m.weaknesses[0]).toEqual({ type: 'rock', multiplier: 4 });
    expect(m.weaknesses.map((w) => w.type)).toEqual(['rock', 'water', 'electric']);
  });

  it('tipo duplo: Terra anulado pelo Voador vira imunidade; fraquezas se cancelam', () => {
    const m = computeMatchups([fireRelations, flyingRelations]);
    expect(m.immunities).toEqual(['ground']);
    expect(m.weaknesses.some((w) => w.type === 'ice')).toBe(false); // 2× (voador) × 0.5× (fogo) = 1×
  });

  it('resistências 0.25× aparecem primeiro', () => {
    const m = computeMatchups([fireRelations, flyingRelations]);
    expect(m.resistances[0]).toEqual({ type: 'grass', multiplier: 0.25 });
    expect(m.resistances.map((r) => r.type)).toContain('fire');
  });

  it('une os tipos efetivos dos dois tipos', () => {
    const m = computeMatchups([fireRelations, flyingRelations]);
    expect(m.effectiveAgainst).toEqual(['grass', 'ice', 'fighting', 'bug', 'steel']);
  });
});
