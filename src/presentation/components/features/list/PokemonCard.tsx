import Image from 'next/image';
import Link from 'next/link';
import type { PokemonListItem } from '@/application';
import { formatName, formatNumber } from '@/presentation/format';
import { TypeBadge } from '../../ui';
import styles from './PokemonCard.module.css';

interface Props {
  pokemon: PokemonListItem;
  artworkBaseUrl: string;
}

export function PokemonCard({ pokemon, artworkBaseUrl }: Props) {
  return (
    <Link href={`/pokemon/${pokemon.id}`} className={styles.card} aria-label={`${formatName(pokemon.name)}, ${formatNumber(pokemon.id)}`}>
      <span className={styles.number}>{formatNumber(pokemon.id)}</span>
      <Image
        src={`${artworkBaseUrl}/${pokemon.id}.png`}
        alt=""
        width={96}
        height={96}
        unoptimized
        loading="lazy"
        className={styles.image}
      />
      <span className={styles.name}>{formatName(pokemon.name)}</span>
      <span className={styles.types}>
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} compact />
        ))}
      </span>
    </Link>
  );
}
