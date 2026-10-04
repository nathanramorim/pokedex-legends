'use client';

import { GENERATIONS, POKEMON_TYPES, type PokemonType } from '@/domain';
import { hasActiveFilters, type PokemonFilters } from '@/application';
import { Button, TypeIcon, TYPE_LABELS } from '../../ui';
import styles from './FilterBar.module.css';

interface Props {
  filters: PokemonFilters;
  onChange: (next: PokemonFilters) => void;
  resultCount: number;
  totalCount: number;
}

export function FilterBar({ filters, onChange, resultCount, totalCount }: Props) {
  const toggleType = (type: PokemonType) => {
    const types = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type];
    onChange({ ...filters, types });
  };

  return (
    <section className={styles.bar} aria-label="Filtros">
      <label className={styles.search}>
        <span className={styles.srOnly}>Buscar por nome ou número</span>
        <input
          type="search"
          inputMode="search"
          placeholder="Buscar nome ou número"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
        />
      </label>

      <div className={styles.group} role="group" aria-label="Filtrar por tipo">
        {POKEMON_TYPES.map((type) => {
          const pressed = filters.types.includes(type);
          return (
            <button
              key={type}
              type="button"
              aria-pressed={pressed}
              aria-label={TYPE_LABELS[type]}
              title={TYPE_LABELS[type]}
              className={`${styles.typeButton} ${pressed ? styles.pressed : ''}`}
              style={{ background: `var(--type-${type})`, color: `var(--type-on-${type})` }}
              onClick={() => toggleType(type)}
            >
              <TypeIcon type={type} size={22} />
            </button>
          );
        })}
      </div>

      <div className={styles.group} role="group" aria-label="Filtrar por geração">
        {GENERATIONS.map((g) => {
          const pressed = filters.generation === g.id;
          return (
            <button
              key={g.id}
              type="button"
              aria-pressed={pressed}
              className={`${styles.chip} ${pressed ? styles.chipOn : ''}`}
              onClick={() => onChange({ ...filters, generation: pressed ? null : g.id })}
            >
              <strong>{g.id}ª</strong> {g.label}
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span aria-live="polite">
          {resultCount} de {totalCount} Pokémon
        </span>
        {hasActiveFilters(filters) ? (
          <Button variant="ghost" onClick={() => onChange({ query: '', types: [], generation: null })}>
            Limpar filtros
          </Button>
        ) : null}
      </div>
    </section>
  );
}
