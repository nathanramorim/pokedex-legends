'use client';

import { useMemo, useState } from 'react';
import { EMPTY_FILTERS, filterPokemon, type PokemonFilters, type PokemonListItem } from '@/application';
import { StateMessage } from '../../ui';
import { FilterBar } from './FilterBar';
import { PokemonGrid } from './PokemonGrid';
import styles from './PokemonBrowser.module.css';

interface Props {
  items: PokemonListItem[];
  artworkBaseUrl: string;
}

export function PokemonBrowser({ items, artworkBaseUrl }: Props) {
  const [filters, setFilters] = useState<PokemonFilters>(EMPTY_FILTERS);
  const visible = useMemo(() => filterPokemon(items, filters), [items, filters]);

  return (
    <div className={styles.browser}>
      <FilterBar filters={filters} onChange={setFilters} resultCount={visible.length} totalCount={items.length} />
      {visible.length === 0 ? (
        <StateMessage kind="empty" title="Nenhum Pokémon encontrado">
          Tente remover algum filtro ou mudar a busca.
        </StateMessage>
      ) : (
        <PokemonGrid items={visible} artworkBaseUrl={artworkBaseUrl} />
      )}
    </div>
  );
}
