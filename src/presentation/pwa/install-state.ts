/** Detecção de ambiente para o convite de instalação (funções puras, testáveis). */

export function isIos(userAgent: string, maxTouchPoints = 0): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  // iPadOS 13+ se apresenta como Mac, mas tem tela de toque
  return /Macintosh/.test(userAgent) && maxTouchPoints > 1;
}

/** Safari de verdade (navegadores de terceiros no iOS não instalam PWA pelo menu da mesma forma). */
export function isIosSafari(userAgent: string, maxTouchPoints = 0): boolean {
  return isIos(userAgent, maxTouchPoints) && /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(userAgent);
}

export interface DisplayEnv {
  standaloneMedia: boolean;
  /** `navigator.standalone` (só no iOS). */
  iosStandalone: boolean;
}

export const isStandalone = ({ standaloneMedia, iosStandalone }: DisplayEnv) => standaloneMedia || iosStandalone;

export const DISMISS_KEY = 'pokedex:install-dismissed';

export function readDismissed(storage: Pick<Storage, 'getItem'> | undefined): boolean {
  try {
    return storage?.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveDismissed(storage: Pick<Storage, 'setItem'> | undefined) {
  try {
    storage?.setItem(DISMISS_KEY, '1');
  } catch {
    /* modo privado: tudo bem, o aviso volta na próxima visita */
  }
}
