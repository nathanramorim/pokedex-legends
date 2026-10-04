import Image from 'next/image';
import { captureDifficulty, recommendPokeball, type PokeballName, type Pokemon, type PokemonSpecies } from '@/domain';
import { formatName } from '@/presentation/format';
import styles from './tabs.module.css';

const BALL_LABELS: Record<PokeballName, string> = {
  'poke-ball': 'Poké Ball', 'great-ball': 'Great Ball', 'ultra-ball': 'Ultra Ball', 'master-ball': 'Master Ball',
  'net-ball': 'Net Ball', 'dive-ball': 'Dive Ball', 'dusk-ball': 'Dusk Ball', 'quick-ball': 'Quick Ball',
};

const DIFFICULTY_LABELS = { easy: 'Fácil', medium: 'Média', hard: 'Difícil', 'very-hard': 'Muito difícil' } as const;

interface Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  itemIconBaseUrl: string;
}

export function CaptureTab({ pokemon, species, itemIconBaseUrl }: Props) {
  const rec = recommendPokeball({
    captureRate: species.captureRate,
    habitat: species.habitat,
    types: pokemon.types,
    isLegendary: species.isLegendary,
    isMythical: species.isMythical,
  });
  const difficulty = captureDifficulty(species.captureRate);

  return (
    <div className={styles.stack}>
      <div className={`${styles.card} ${styles.ball}`}>
        <Image src={`${itemIconBaseUrl}/${rec.ball}.png`} alt="" width={48} height={48} unoptimized />
        <div>
          <span className={styles.muted}>Pokébola recomendada</span>
          <br />
          <strong>{BALL_LABELS[rec.ball]}</strong>
        </div>
      </div>
      <p>{rec.reason}</p>
      {rec.alternative ? <p className={styles.muted}>Alternativa: {BALL_LABELS[rec.alternative]}</p> : null}
      <dl className={styles.facts}>
        <div><dt>Taxa de captura</dt><dd>{species.captureRate}/255</dd></div>
        <div><dt>Dificuldade</dt><dd>{DIFFICULTY_LABELS[difficulty]}</dd></div>
        {species.habitat ? <div><dt>Habitat</dt><dd>{formatName(species.habitat)}</dd></div> : null}
      </dl>
      <p className={styles.muted}>Dica baseada em regras sobre os dados da Pokédex; não é uma regra oficial do jogo.</p>
    </div>
  );
}
