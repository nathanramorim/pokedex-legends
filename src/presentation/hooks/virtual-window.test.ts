import { computeWindow } from './virtual-window';

describe('computeWindow', () => {
  it('lista vazia não renderiza nada', () => {
    expect(computeWindow({ scrollTop: 0, viewportHeight: 800, rowHeight: 100, rowCount: 0 })).toEqual({ start: 0, end: 0 });
  });
  it('topo: renderiza só o visível + overscan', () => {
    expect(computeWindow({ scrollTop: 0, viewportHeight: 800, rowHeight: 100, rowCount: 500 })).toEqual({ start: 0, end: 11 });
  });
  it('meio: janela acompanha a rolagem', () => {
    expect(computeWindow({ scrollTop: 5000, viewportHeight: 800, rowHeight: 100, rowCount: 500 })).toEqual({ start: 47, end: 61 });
  });
  it('fim: não passa do total', () => {
    const r = computeWindow({ scrollTop: 99999, viewportHeight: 800, rowHeight: 100, rowCount: 500 });
    expect(r.end).toBe(500);
    expect(r.start).toBeLessThanOrEqual(500);
  });
});
