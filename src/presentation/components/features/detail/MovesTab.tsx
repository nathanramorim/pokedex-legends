'use client';

import { useId, useState } from 'react';
import type { Move } from '@/domain';
import { useMoveStage } from '@/presentation/three/StageContext';
import { describePriority, describeTarget, formatName } from '@/presentation/format';
import { Button, CATEGORY_LABELS, DamageClassIcon, StateMessage, TYPE_LABELS, TypeIcon } from '../../ui';
import styles from './moves.module.css';

const stat = (value: number | null) => (value === null ? '—' : String(value));

export function MovesTab({ moves }: { moves: Move[] }) {
  const baseId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const stage = useMoveStage();

  if (moves.length === 0) {
    return <StateMessage kind="empty" title="Sem golpes">Não há golpes por nível disponíveis.</StateMessage>;
  }

  return (
    <>
      <p className={styles.note}>Toque em um golpe para ver o que ele faz e como ele anima.</p>
      <ul className={styles.list} aria-label="Golpes">
        {moves.map((move) => {
          const open = selected === move.name;
          const panelId = `${baseId}-${move.name}`;
          return (
            <li key={`${move.name}-${move.level}`} className={`${styles.move} ${open ? styles.open : ''}`}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => {
                  setSelected(open ? null : move.name);
                  if (!open) stage.playMove(move.type, move.category);
                }}
              >
                <span
                  className={styles.icon}
                  style={{ background: `var(--type-${move.type})`, color: `var(--type-on-${move.type})` }}
                  title={TYPE_LABELS[move.type]}
                  role="img"
                  aria-label={`Tipo ${TYPE_LABELS[move.type]}`}
                >
                  <TypeIcon type={move.type} size={26} />
                </span>
                <span className={styles.body}>
                  <span className={styles.head}>
                    <strong>{formatName(move.name)}</strong>
                    <span className={styles.level}>Nv. {move.level}</span>
                  </span>
                  <span className={styles.stats}>
                    <span className={styles.category} title={CATEGORY_LABELS[move.category]}>
                      <DamageClassIcon category={move.category} />
                      {CATEGORY_LABELS[move.category]}
                    </span>
                    <span>Poder <b>{stat(move.power)}</b></span>
                    <span>Precisão <b>{stat(move.accuracy)}</b></span>
                    <span>PP <b>{stat(move.pp)}</b></span>
                  </span>
                </span>
                <span className={styles.chevron} aria-hidden="true">{open ? '▲' : '▼'}</span>
              </button>
              {open ? (
                <div id={panelId} role="region" aria-label={`Efeito de ${formatName(move.name)}`} className={styles.detail}>
                  <p className={styles.effect}>{move.effect || 'Sem descrição disponível.'}</p>
                  <dl className={styles.facts}>
                    <div><dt>Alvo</dt><dd>{describeTarget(move.target)}</dd></div>
                    <div><dt>Prioridade</dt><dd>{describePriority(move.priority)}</dd></div>
                    {move.effectChance !== null ? <div><dt>Chance do efeito</dt><dd>{move.effectChance}%</dd></div> : null}
                  </dl>
                  <Button variant="ghost" className={styles.replay} onClick={() => stage.playMove(move.type, move.category)}>
                    Repetir animação
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
