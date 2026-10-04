import type { ReactNode } from 'react';
import styles from './StateMessage.module.css';

type Kind = 'loading' | 'error' | 'empty';

interface Props {
  kind: Kind;
  title?: string;
  children?: ReactNode;
}

const DEFAULT_TITLES: Record<Kind, string> = {
  loading: 'Carregando…',
  error: 'Algo deu errado',
  empty: 'Nada por aqui',
};

export function StateMessage({ kind, title, children }: Props) {
  return (
    <div className={styles.box} role={kind === 'error' ? 'alert' : 'status'} aria-live="polite">
      {kind === 'loading' ? <span className={styles.spinner} aria-hidden="true" /> : null}
      <strong>{title ?? DEFAULT_TITLES[kind]}</strong>
      {children ? <p className={styles.text}>{children}</p> : null}
    </div>
  );
}
