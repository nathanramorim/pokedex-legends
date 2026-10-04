import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import OfflinePage from '../../../app/offline/page';
import { InstallPrompt } from './InstallPrompt';
import { ServiceWorkerRegister } from './ServiceWorkerRegister';
import { DISMISS_KEY, isIos, isIosSafari, isStandalone, readDismissed } from './install-state';

const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const IPHONE_CHROME = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0 Mobile/15E148 Safari/604.1';
const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Mobile Safari/537.36';

const setUa = (ua: string) => Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
const setMedia = (standalone: boolean) => {
  window.matchMedia = ((q: string) => ({ matches: standalone && q.includes('standalone'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as unknown as typeof window.matchMedia;
};

beforeEach(() => {
  localStorage.clear();
  setMedia(false);
  setUa(ANDROID_CHROME);
  Object.defineProperty(navigator, 'standalone', { value: undefined, configurable: true });
});
afterEach(() => {
  vi.unstubAllEnvs();
  Reflect.deleteProperty(navigator, 'serviceWorker');
});

describe('detecção de ambiente', () => {
  it('reconhece iOS, Safari do iOS e iPadOS que se diz Mac', () => {
    expect(isIos(IPHONE_SAFARI)).toBe(true);
    expect(isIos(ANDROID_CHROME)).toBe(false);
    expect(isIos('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toBe(true); // iPad
    expect(isIos('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0)).toBe(false); // Mac de verdade
    expect(isIosSafari(IPHONE_SAFARI)).toBe(true);
    expect(isIosSafari(IPHONE_CHROME)).toBe(false);
  });

  it('standalone por media query ou navigator.standalone', () => {
    expect(isStandalone({ standaloneMedia: true, iosStandalone: false })).toBe(true);
    expect(isStandalone({ standaloneMedia: false, iosStandalone: true })).toBe(true);
    expect(isStandalone({ standaloneMedia: false, iosStandalone: false })).toBe(false);
  });

  it('lê a dispensa e tolera storage quebrado', () => {
    expect(readDismissed(undefined)).toBe(false);
    expect(readDismissed({ getItem: () => '1' })).toBe(true);
    expect(readDismissed({ getItem: () => { throw new Error('bloqueado'); } })).toBe(false);
  });
});

describe('InstallPrompt (P7)', () => {
  function fireInstallEvent(outcome: 'accepted' | 'dismissed' = 'accepted') {
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: vi.fn(async () => {}),
      userChoice: Promise.resolve({ outcome }),
    });
    act(() => { window.dispatchEvent(event); });
    return event;
  }

  it('Android: sem o evento não mostra nada; com o evento mostra "Instalar app"', () => {
    render(<InstallPrompt />);
    expect(screen.queryByRole('region', { name: 'Instalar o app' })).not.toBeInTheDocument();
    const event = fireInstallEvent();
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByRole('button', { name: 'Instalar app' })).toBeInTheDocument();
  });

  it('Android: instalar chama o prompt do navegador e esconde o aviso', async () => {
    render(<InstallPrompt />);
    const event = fireInstallEvent('accepted');
    fireEvent.click(screen.getByRole('button', { name: 'Instalar app' }));
    await waitFor(() => expect(event.prompt).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Instalar o app' })).not.toBeInTheDocument());
  });

  it('Android: recusar no diálogo do sistema lembra a escolha', async () => {
    render(<InstallPrompt />);
    fireInstallEvent('dismissed');
    fireEvent.click(screen.getByRole('button', { name: 'Instalar app' }));
    await waitFor(() => expect(localStorage.getItem(DISMISS_KEY)).toBe('1'));
  });

  it('iOS Safari: mostra o passo a passo "Adicionar à Tela de Início"', () => {
    setUa(IPHONE_SAFARI);
    render(<InstallPrompt />);
    expect(screen.getByRole('region', { name: 'Instalar o app' })).toHaveTextContent('Adicionar à Tela de Início');
    expect(screen.queryByRole('button', { name: 'Instalar app' })).not.toBeInTheDocument();
  });

  it('iOS com Chrome (CriOS): não mostra a dica do Safari', () => {
    setUa(IPHONE_CHROME);
    render(<InstallPrompt />);
    expect(screen.queryByRole('region', { name: 'Instalar o app' })).not.toBeInTheDocument();
  });

  it('já instalado (standalone): não mostra nada, nem com o evento', () => {
    setMedia(true);
    render(<InstallPrompt />);
    fireInstallEvent();
    expect(screen.queryByRole('region', { name: 'Instalar o app' })).not.toBeInTheDocument();
  });

  it('iOS já na tela inicial (navigator.standalone): não mostra a dica', () => {
    setUa(IPHONE_SAFARI);
    Object.defineProperty(navigator, 'standalone', { value: true, configurable: true });
    render(<InstallPrompt />);
    expect(screen.queryByRole('region', { name: 'Instalar o app' })).not.toBeInTheDocument();
  });

  it('dispensar esconde e lembra: a próxima visita não mostra de novo', () => {
    setUa(IPHONE_SAFARI);
    const first = render(<InstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }));
    expect(screen.queryByRole('region', { name: 'Instalar o app' })).not.toBeInTheDocument();
    expect(localStorage.getItem(DISMISS_KEY)).toBe('1');
    first.unmount();
    render(<InstallPrompt />);
    expect(screen.queryByRole('region', { name: 'Instalar o app' })).not.toBeInTheDocument();
  });
});

describe('ServiceWorkerRegister (P6)', () => {
  function fakeServiceWorker(registration: Partial<ServiceWorkerRegistration> = {}) {
    const listeners: Record<string, () => void> = {};
    const active = { postMessage: vi.fn() };
    const reg = { waiting: null, installing: null, addEventListener: vi.fn(), active, ...registration } as unknown as ServiceWorkerRegistration;
    const sw = {
      controller: {},
      register: vi.fn(async () => reg),
      ready: Promise.resolve({ active } as unknown as ServiceWorkerRegistration),
      addEventListener: vi.fn((type: string, fn: () => void) => { listeners[type] = fn; }),
    };
    Object.defineProperty(navigator, 'serviceWorker', { value: sw, configurable: true });
    return { sw, reg, active, listeners };
  }

  it('fora de produção não registra', () => {
    const { sw } = fakeServiceWorker();
    render(<ServiceWorkerRegister />);
    expect(sw.register).not.toHaveBeenCalled();
  });

  it('em produção registra /sw.js e pede para guardar os arquivos da página', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { sw, active } = fakeServiceWorker();
    render(<ServiceWorkerRegister />);
    await waitFor(() => expect(sw.register).toHaveBeenCalledWith('/sw.js', { scope: '/' }));
    await waitFor(() => expect(active.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'CACHE_URLS' })));
    expect(active.postMessage).toHaveBeenCalledWith({ type: 'CACHE_PAGE', url: window.location.href });
  });

  it('em produção, sem suporte a service worker, não quebra', () => {
    vi.stubEnv('NODE_ENV', 'production');
    Reflect.deleteProperty(navigator, 'serviceWorker');
    expect(() => render(<ServiceWorkerRegister />)).not.toThrow();
  });

  it('falha ao registrar não derruba a página', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { sw } = fakeServiceWorker();
    sw.register.mockRejectedValue(new Error('bloqueado'));
    expect(() => render(<ServiceWorkerRegister />)).not.toThrow();
    await waitFor(() => expect(sw.register).toHaveBeenCalled());
  });

  it('versão nova esperando mostra o aviso e "Atualizar" pede SKIP_WAITING', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const waiting = { postMessage: vi.fn() };
    const { listeners } = fakeServiceWorker({ waiting: waiting as unknown as ServiceWorker });
    render(<ServiceWorkerRegister />);
    const button = await screen.findByRole('button', { name: 'Atualizar' });
    expect(screen.getByRole('status')).toHaveTextContent('Nova versão disponível');
    fireEvent.click(button);
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(listeners.controllerchange).toBeDefined(); // recarrega quando a nova versão assumir
  });
});

describe('página offline (P8)', () => {
  it('explica a situação e oferece "Tentar de novo" para a lista', () => {
    render(<OfflinePage />);
    expect(screen.getByText('Você está sem internet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tentar de novo' })).toHaveAttribute('href', '/');
  });
});
