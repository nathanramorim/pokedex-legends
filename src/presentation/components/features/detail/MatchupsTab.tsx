import { computeMatchups } from '@/application';
import type { PokemonType, TypeRelations } from '@/domain';
import { TypeBadge } from '../../ui';
import styles from './tabs.module.css';

const fmt = (m: number) => `${m === 0.25 ? '¼' : m === 0.5 ? '½' : m}×`;

function Section({ title, children, empty }: { title: string; children: React.ReactNode[]; empty: string }) {
  return (
    <section className={styles.section} aria-label={title}>
      <h3>{title}</h3>
      {children.length > 0 ? <div className={styles.row} style={{ justifyContent: 'flex-start' }}>{children}</div> : <p className={styles.empty}>{empty}</p>}
    </section>
  );
}

export function MatchupsTab({ relations }: { relations: TypeRelations[] }) {
  const m = computeMatchups(relations);
  const plain = (types: PokemonType[]) => types.map((t) => <TypeBadge key={t} type={t} />);
  return (
    <div className={styles.stack}>
      <Section title="Efetivo contra" empty="Nenhum tipo em especial.">{plain(m.effectiveAgainst)}</Section>
      <Section title="Vulnerável contra" empty="Sem fraquezas.">
        {m.weaknesses.map((w) => <TypeBadge key={w.type} type={w.type} suffix={fmt(w.multiplier)} />)}
      </Section>
      <Section title="Resiste a" empty="Sem resistências.">
        {m.resistances.map((r) => <TypeBadge key={r.type} type={r.type} suffix={fmt(r.multiplier)} />)}
      </Section>
      <Section title="Imune a" empty="Sem imunidades.">{plain(m.immunities)}</Section>
    </div>
  );
}
