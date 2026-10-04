import Image from 'next/image';
import Link from 'next/link';
import type { EvolutionNode } from '@/domain';
import { describeEvolution, formatName, formatNumber } from '@/presentation/format';
import { StateMessage } from '../../ui';
import styles from './evolutions.module.css';

function Node({ node, currentId }: { node: EvolutionNode; currentId: number }) {
  return (
    <li className={styles.item}>
      <Link
        href={`/pokemon/${node.id}`}
        className={`${styles.node} ${node.id === currentId ? styles.current : ''}`}
        aria-current={node.id === currentId ? 'page' : undefined}
      >
        <Image src={node.artworkUrl} alt="" width={64} height={64} unoptimized loading="lazy" />
        <span>
          <strong>{formatName(node.name)}</strong>
          <small>{formatNumber(node.id)}</small>
        </span>
      </Link>
      {node.evolvesTo.length > 0 ? (
        <ul className={styles.branches}>
          {node.evolvesTo.map((next) => (
            <li key={next.id} className={styles.branch}>
              <span className={styles.condition}>↓ {describeEvolution(next.details) || 'Evolui'}</span>
              <ul className={styles.tree}><Node node={next} currentId={currentId} /></ul>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function EvolutionsTab({ chain, currentId }: { chain: EvolutionNode | null; currentId: number }) {
  if (!chain || chain.evolvesTo.length === 0) {
    return <StateMessage kind="empty" title="Não evolui">Este Pokémon não tem linha evolutiva.</StateMessage>;
  }
  return <ul className={styles.tree} aria-label="Linha evolutiva"><Node node={chain} currentId={currentId} /></ul>;
}
