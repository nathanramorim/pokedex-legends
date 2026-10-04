import type { PokemonType } from '@/domain';
import { TypeIcon } from '../type-icon/TypeIcon';
import { TYPE_LABELS } from '../type-labels';
import styles from './TypeBadge.module.css';

interface Props {
  type: PokemonType;
  /** Mostra só o ícone (rótulo continua acessível). */
  compact?: boolean;
  suffix?: string;
}

export function TypeBadge({ type, compact = false, suffix }: Props) {
  const label = TYPE_LABELS[type];
  return (
    <span className={styles.badge} style={{ background: `var(--type-${type})`, color: `var(--type-on-${type})` }} title={label}>
      <TypeIcon type={type} size={compact ? 18 : 16} />
      {compact ? <span className={styles.srOnly}>{label}</span> : <span>{label}</span>}
      {suffix ? <strong className={styles.suffix}>{suffix}</strong> : null}
    </span>
  );
}
