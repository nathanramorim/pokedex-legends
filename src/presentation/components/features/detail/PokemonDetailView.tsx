import Link from 'next/link';
import type { PokemonDetail } from '@/application';
import { formatName, formatNumber } from '@/presentation/format';
import { Screen, Tabs, TypeBadge, type TabItem } from '../../ui';
import { PokemonStage } from '@/presentation/three/PokemonStage';
import { AboutTab } from './AboutTab';
import { AbilitiesTab } from './AbilitiesTab';
import { ItemsTab } from './ItemsTab';
import { MovesTab } from './MovesTab';
import { EvolutionsTab } from './EvolutionsTab';
import { MegaTab } from './MegaTab';
import { MatchupsTab } from './MatchupsTab';
import { CaptureTab } from './CaptureTab';
import styles from './PokemonDetailView.module.css';

interface Props {
  detail: PokemonDetail;
  itemIconBaseUrl: string;
}

export function PokemonDetailView({ detail, itemIconBaseUrl }: Props) {
  const { pokemon, species, abilities } = detail;

  const tabs: TabItem[] = [
    { id: 'about', label: 'Sobre', content: <AboutTab pokemon={pokemon} species={species} /> },
    { id: 'abilities', label: 'Habilidades', content: <AbilitiesTab slots={pokemon.abilities} abilities={abilities} /> },
    { id: 'moves', label: 'Golpes', content: <MovesTab moves={detail.moves} /> },
    { id: 'evolutions', label: 'Evoluções', content: <EvolutionsTab chain={detail.evolution} currentId={pokemon.id} /> },
    { id: 'matchups', label: 'Combate', content: <MatchupsTab relations={detail.typeRelations} /> },
    { id: 'mega', label: 'Mega', content: <MegaTab forms={detail.megaForms} /> },
    { id: 'items', label: 'Itens', content: <ItemsTab items={pokemon.heldItems} /> },
    { id: 'capture', label: 'Captura', content: <CaptureTab pokemon={pokemon} species={species} itemIconBaseUrl={itemIconBaseUrl} /> },
  ];

  return (
    <div className={styles.view}>
      <section className={styles.stage} aria-label={`Imagem de ${formatName(pokemon.name)}`}>
        <Link href="/" className={styles.back}>← Voltar</Link>
        <Screen className={styles.screen}>
          <PokemonStage
            imageUrl={pokemon.artworkUrl}
            name={formatName(pokemon.name)}
            accentToken={`--type-${pokemon.types[0] ?? 'normal'}`}
          />
        </Screen>
        <header className={styles.title}>
          <span className={styles.number}>{formatNumber(pokemon.id)}</span>
          <h1>{formatName(pokemon.name)}</h1>
          <span className={styles.types}>
            {pokemon.types.map((t) => <TypeBadge key={t} type={t} />)}
          </span>
        </header>
      </section>
      <section className={styles.info}>
        <Tabs items={tabs} ariaLabel={`Informações de ${formatName(pokemon.name)}`} />
      </section>
    </div>
  );
}
