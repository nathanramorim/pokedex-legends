'use client';

import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';
import type { MoveCategory, PokemonType } from '@/domain';

export interface StageRegistration {
  element: HTMLElement;
  play(type: PokemonType, category: MoveCategory): void;
}

export interface StageBridge {
  register(registration: StageRegistration | null): void;
  playMove(type: PokemonType, category: MoveCategory): void;
}

const SCROLL_WAIT_MS = 450;

export const StageBridgeContext = createContext<StageBridge | null>(null);

/** Liga a aba Golpes ao palco 3D (que vive em outra parte da tela). */
export function MoveStageProvider({ children }: { children: ReactNode }) {
  const registration = useRef<StageRegistration | null>(null);

  const bridge = useMemo<StageBridge>(
    () => ({
      register(next) {
        registration.current = next;
      },
      playMove(type, category) {
        const stage = registration.current;
        if (!stage) return; // sem WebGL ou ainda carregando: nada a animar
        const rect = stage.element.getBoundingClientRect();
        const visible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (visible) {
          stage.play(type, category);
          return;
        }
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        stage.element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        window.setTimeout(() => {
          if (registration.current === stage) stage.play(type, category);
        }, reduced ? 0 : SCROLL_WAIT_MS);
      },
    }),
    [],
  );

  return <StageBridgeContext.Provider value={bridge}>{children}</StageBridgeContext.Provider>;
}

const NOOP: StageBridge = { register() {}, playMove() {} };

/** Fora de um provider (ou sem palco), tocar um golpe não faz nada. */
export function useMoveStage(): StageBridge {
  return useContext(StageBridgeContext) ?? NOOP;
}
