'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button } from '@/presentation/components/ui';
import { isIosSafari, isStandalone, readDismissed, saveDismissed } from './install-state';
import styles from './pwa.module.css';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type EnvMode = 'none' | 'ios' | 'default';

const subscribeNoop = () => () => {};

/** Lê o ambiente no cliente; no servidor devolve 'none' (evita divergência na hidratação). */
function readEnvMode(): EnvMode {
  const standalone = isStandalone({
    standaloneMedia: window.matchMedia?.('(display-mode: standalone)').matches ?? false,
    iosStandalone: (navigator as Navigator & { standalone?: boolean }).standalone === true,
  });
  if (standalone || readDismissed(window.localStorage)) return 'none';
  // O Safari do iOS não dispara beforeinstallprompt: mostramos o passo a passo.
  return isIosSafari(navigator.userAgent, navigator.maxTouchPoints) ? 'ios' : 'default';
}

/** Convite para instalar: botão no Android/Chrome e dica no Safari do iOS. */
export function InstallPrompt() {
  const env = useSyncExternalStore(subscribeNoop, readEnvMode, () => 'none' as EnvMode);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (env !== 'default') return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [env]);

  const mode = dismissed || env === 'none' ? 'hidden' : env === 'ios' ? 'ios' : deferred ? 'android' : 'hidden';

  const dismiss = () => {
    saveDismissed(window.localStorage);
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === 'dismissed') dismiss();
  };

  if (mode === 'hidden') return null;

  return (
    <aside className={styles.banner} role="region" aria-label="Instalar o app">
      {mode === 'android' ? (
        <>
          <p className={styles.text}>
            <strong>Instale a Pokédex</strong> na tela inicial e abra em tela cheia.
          </p>
          <div className={styles.actions}>
            <Button onClick={install}>Instalar app</Button>
            <Button variant="ghost" onClick={dismiss}>Agora não</Button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.text}>
            <strong>Instale a Pokédex:</strong> toque em <span aria-label="Compartilhar">⎋ Compartilhar</span> e depois em{' '}
            <strong>Adicionar à Tela de Início</strong>.
          </p>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={dismiss}>Entendi</Button>
          </div>
        </>
      )}
    </aside>
  );
}
