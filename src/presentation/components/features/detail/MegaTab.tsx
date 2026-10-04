import Image from 'next/image';
import type { MegaForm } from '@/domain';
import { StateMessage, TypeBadge } from '../../ui';
import styles from './tabs.module.css';

export function MegaTab({ forms }: { forms: MegaForm[] }) {
  if (forms.length === 0) {
    return <StateMessage kind="empty" title="Sem Mega Evolução">Este Pokémon não possui forma Mega.</StateMessage>;
  }
  return (
    <ul className={styles.list}>
      {forms.map((form) => (
        <li key={form.name} className={`${styles.card} ${styles.mega}`}>
          <Image src={form.artworkUrl} alt={form.label} width={120} height={120} unoptimized loading="lazy" />
          <strong>{form.label}</strong>
          <span className={styles.row}>{form.types.map((t) => <TypeBadge key={t} type={t} />)}</span>
        </li>
      ))}
    </ul>
  );
}
