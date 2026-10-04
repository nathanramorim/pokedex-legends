'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { effectFor } from './move-effects';
import { useMoveStage } from './StageContext';
import type { Stage } from './stage-engine';
import styles from './PokemonStage.module.css';

interface Props {
  imageUrl: string;
  name: string;
  /** Nome do token CSS do tipo principal, ex.: `--type-fire`. */
  accentToken: string;
}

type Status = 'loading' | 'ready' | 'fallback';

/** Palco 3D (Three.js, só no cliente). Cai para imagem estática sem WebGL ou em erro. */
export function PokemonStage({ imageUrl, name, accentToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const bridge = useMoveStage();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    let cancelled = false;
    let stage: Stage | null = null;

    (async () => {
      try {
        const THREE = await import('three');
        const { createStage } = await import('./stage-engine');
        const accent = getComputedStyle(document.documentElement).getPropertyValue(accentToken).trim() || '#dc0a2d';
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const created = await createStage(THREE, container, canvas, {
          imageUrl,
          accentColor: accent,
          reducedMotion,
          onContextLost: () => !cancelled && setStatus('fallback'),
        });
        if (cancelled) {
          created.dispose();
          return;
        }
        stage = created;
        stageRef.current = created;
        bridge.register({
          element: container,
          play: (type, category) => {
            const effect = effectFor(type, category);
            const color = getComputedStyle(document.documentElement).getPropertyValue(effect.colorToken).trim() || '#ffffff';
            created.playMove({ ...effect, color });
          },
        });
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('fallback');
      }
    })();

    return () => {
      cancelled = true;
      bridge.register(null);
      stageRef.current = null;
      stage?.dispose();
    };
  }, [imageUrl, accentToken, bridge]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') stageRef.current?.nudge(-1);
    else if (e.key === 'ArrowRight') stageRef.current?.nudge(1);
    else if (e.key === 'Enter' || e.key === ' ') stageRef.current?.react();
    else return;
    e.preventDefault();
  };

  const ready = status === 'ready';
  return (
    <div ref={containerRef} className={styles.stage} data-status={status}>
      {!ready ? (
        <Image src={imageUrl} alt={name} width={280} height={280} unoptimized priority className={styles.fallback} />
      ) : null}
      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${ready ? styles.visible : ''}`}
        tabIndex={ready ? 0 : -1}
        role="img"
        aria-label={`${name}. Arraste ou use as setas para girar; toque ou Enter para reagir.`}
        aria-hidden={!ready}
        onKeyDown={onKeyDown}
      />
      {ready ? <span className={styles.hint} aria-hidden="true">Arraste para girar · toque para reagir</span> : null}
    </div>
  );
}
