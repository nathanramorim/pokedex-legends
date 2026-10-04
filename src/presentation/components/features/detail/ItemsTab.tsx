import Image from 'next/image';
import type { HeldItem } from '@/domain';
import { formatName } from '@/presentation/format';
import { StateMessage } from '../../ui';
import styles from './tabs.module.css';

export function ItemsTab({ items }: { items: HeldItem[] }) {
  if (items.length === 0) {
    return <StateMessage kind="empty" title="Sem itens">Este Pokémon não costuma carregar itens na natureza.</StateMessage>;
  }
  return (
    <>
      <p className={styles.muted}>Itens que este Pokémon pode estar carregando quando encontrado.</p>
      <ul className={styles.grid}>
        {items.map((item) => (
          <li key={item.name} className={styles.card}>
            <Image src={item.iconUrl} alt="" width={40} height={40} unoptimized />
            <span>{formatName(item.name)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
