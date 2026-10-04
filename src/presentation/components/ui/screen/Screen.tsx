import type { HTMLAttributes } from 'react';
import styles from './Screen.module.css';

/** Moldura de "tela" verde da Pokédex. */
export function Screen({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.screen, className].filter(Boolean).join(' ')} {...rest} />;
}
