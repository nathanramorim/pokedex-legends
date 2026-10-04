import type { Pokemon, PokemonSpecies } from '@/domain';
import { StatBar } from '../../ui';
import { STAT_LABELS } from './labels';
import styles from './tabs.module.css';

interface Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
}

const meters = (dm: number) => (dm / 10).toLocaleString('pt-BR', { minimumFractionDigits: 1 });
const kilos = (hg: number) => (hg / 10).toLocaleString('pt-BR', { minimumFractionDigits: 1 });

export function AboutTab({ pokemon, species }: Props) {
  const total = pokemon.stats.reduce((sum, s) => sum + s.value, 0);
  return (
    <div className={styles.stack}>
      {species.genus ? <p className={styles.genus}>{species.genus}</p> : null}
      {species.description ? <p>{species.description}</p> : null}
      <dl className={styles.facts}>
        <div><dt>Altura</dt><dd>{meters(pokemon.height)} m</dd></div>
        <div><dt>Peso</dt><dd>{kilos(pokemon.weight)} kg</dd></div>
      </dl>
      <h3 className={styles.heading}>Status base</h3>
      <div className={styles.stats}>
        {pokemon.stats.map((s) => (
          <StatBar key={s.name} label={STAT_LABELS[s.name] ?? s.name} value={s.value} />
        ))}
        <StatBar label="Total" value={total} max={780} />
      </div>
    </div>
  );
}
