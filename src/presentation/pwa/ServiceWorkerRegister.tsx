'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/presentation/components/ui';
import styles from './pwa.module.css';

/** Registra o service worker (só em produção) e avisa quando há versão nova. */
export function ServiceWorkerRegister() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    let cancelled = false;

    const watch = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting && navigator.serviceWorker.controller) setWaiting(registration.waiting);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller && !cancelled) setWaiting(worker);
        });
      });
    };

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async (registration) => {
        watch(registration);
        // Guarda os arquivos da página atual para ela abrir offline na próxima vez.
        const ready = await navigator.serviceWorker.ready;
        const urls = performance
          .getEntriesByType('resource')
          .map((entry) => entry.name)
          .filter((name) => name.includes('/_next/static/'));
        ready.active?.postMessage({ type: 'CACHE_URLS', urls });
        ready.active?.postMessage({ type: 'CACHE_PAGE', url: window.location.href });
      })
      .catch(() => {
        /* sem service worker o app funciona normalmente, só não abre offline */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!waiting) return null;

  const update = () => {
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
    waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  return (
    <aside className={styles.banner} role="status" aria-live="polite">
      <p className={styles.text}>
        <strong>Nova versão disponível.</strong>
      </p>
      <div className={styles.actions}>
        <Button onClick={update}>Atualizar</Button>
      </div>
    </aside>
  );
}
