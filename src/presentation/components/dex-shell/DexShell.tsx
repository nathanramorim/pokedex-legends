import type { ReactNode } from 'react';
import styles from './DexShell.module.css';

interface Props {
  children: ReactNode;
  title?: string;
}

/** Carcaça vermelha da Pokédex: lente azul e LEDs; vira trilho lateral em landscape. */
export function DexShell({ children, title = 'Pokédex' }: Props) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.lens} aria-hidden="true" />
        <span className={styles.leds} aria-hidden="true">
          <i className={styles.red} />
          <i className={styles.yellow} />
          <i className={styles.green} />
        </span>
        <span className={styles.title}>{title}</span>
      </header>
      <main className={styles.body}>{children}</main>
    </div>
  );
}
