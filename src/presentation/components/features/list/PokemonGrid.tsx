'use client';

import type { PokemonListItem } from '@/application';
import { useVirtualGrid } from '@/presentation/hooks/useVirtualGrid';
import { PokemonCard } from './PokemonCard';
import styles from './PokemonGrid.module.css';

const ROW_HEIGHT = 168;
const GAP = 10;

interface Props {
  items: PokemonListItem[];
  artworkBaseUrl: string;
}

export function PokemonGrid({ items, artworkBaseUrl }: Props) {
  const [containerRef, grid] = useVirtualGrid({ itemCount: items.length, minColumnWidth: 130, rowHeight: ROW_HEIGHT, gap: GAP });
  const rows = [];
  for (let row = grid.start; row < grid.end; row++) {
    const slice = items.slice(row * grid.columns, (row + 1) * grid.columns);
    rows.push(
      <ul
        key={row}
        className={styles.row}
        style={{ top: grid.rowTop(row), height: ROW_HEIGHT, gridTemplateColumns: `repeat(${grid.columns}, 1fr)`, gap: GAP }}
      >
        {slice.map((p) => (
          <li key={p.id} className={styles.cell}>
            <PokemonCard pokemon={p} artworkBaseUrl={artworkBaseUrl} />
          </li>
        ))}
      </ul>,
    );
  }
  return (
    <div ref={containerRef} className={styles.container} style={{ height: grid.totalHeight }} data-testid="pokemon-grid">
      {rows}
    </div>
  );
}
