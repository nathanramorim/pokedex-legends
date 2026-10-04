export interface WindowInput {
  /** Distância (px) entre o topo da lista e o topo da viewport; negativa quando a lista rolou. */
  scrollTop: number;
  viewportHeight: number;
  rowHeight: number;
  rowCount: number;
  overscan?: number;
}

export interface WindowRange {
  start: number;
  end: number; // exclusivo
}

export function computeWindow({ scrollTop, viewportHeight, rowHeight, rowCount, overscan = 3 }: WindowInput): WindowRange {
  if (rowCount <= 0 || rowHeight <= 0) return { start: 0, end: 0 };
  const first = Math.floor(scrollTop / rowHeight);
  const last = Math.ceil((scrollTop + viewportHeight) / rowHeight);
  const start = Math.min(rowCount, Math.max(0, first - overscan));
  const end = Math.min(rowCount, Math.max(start, last + overscan));
  return { start, end };
}
