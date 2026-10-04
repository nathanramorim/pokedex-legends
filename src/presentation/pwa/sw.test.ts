import { readFileSync } from 'node:fs';
import { vi } from 'vitest';

const ORIGIN = 'https://app.test';
const SW_CODE = readFileSync('public/sw.js', 'utf8');

type FakeRequest = { url: string; method: string; mode: string; destination: string };
const req = (path: string, over: Partial<FakeRequest> = {}): FakeRequest => ({
  url: path.startsWith('http') ? path : `${ORIGIN}${path}`, method: 'GET', mode: 'no-cors', destination: '', ...over,
});

/** Resposta falsa que também serve para tipos que `new Response` não cria (opaque). */
function res(body = 'ok', init: { status?: number; type?: string } = {}) {
  const status = init.status ?? 200;
  const r = {
    ok: status >= 200 && status < 300, status, type: init.type ?? 'basic', body,
    clone() { return res(body, init); },
    async text() { return body; },
  };
  return r;
}

function loadSw() {
  const store = new Map<string, Map<string, ReturnType<typeof res>>>();
  const norm = (r: string | { url: string }) => {
    const u = typeof r === 'string' ? r : r.url;
    return u.startsWith('http') ? u : `${ORIGIN}${u}`;
  };
  const cache = (name: string) => {
    if (!store.has(name)) store.set(name, new Map());
    const m = store.get(name)!;
    return {
      put: async (r: string | { url: string }, response: ReturnType<typeof res>) => { m.set(norm(r), response); },
      keys: async () => [...m.keys()].map((url) => ({ url })),
      delete: async (r: string | { url: string }) => m.delete(norm(r)),
    };
  };
  const caches = {
    open: async (name: string) => cache(name),
    keys: async () => [...store.keys()],
    delete: async (name: string) => store.delete(name),
    match: async (r: string | { url: string }, opts?: { ignoreSearch?: boolean }) => {
      const key = norm(r);
      for (const m of store.values()) {
        if (m.has(key)) return m.get(key);
        if (opts?.ignoreSearch) {
          const base = key.split('?')[0];
          for (const [k, v] of m) if (k.split('?')[0] === base) return v;
        }
      }
      return undefined;
    },
  };
  const handlers: Record<string, (e: unknown) => void> = {};
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type: string, fn: (e: unknown) => void) => { handlers[type] = fn; },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn(async () => {}) },
  };
  const fetchMock = vi.fn<(r: unknown) => Promise<ReturnType<typeof res>>>();
  const ResponseStub = { error: () => ({ ok: false, status: 0, type: 'error' }) };
  class RequestStub {
    url: string; mode: string; credentials: string; method = 'GET';
    constructor(url: string, init: { mode?: string; credentials?: string } = {}) { this.url = url; this.mode = init.mode ?? 'cors'; this.credentials = init.credentials ?? 'same-origin'; }
  }
  new Function('self', 'caches', 'fetch', 'Response', 'Request', code())(self, caches, fetchMock, ResponseStub, RequestStub);

  function code() { return SW_CODE; }
  const wait = async (p: Promise<unknown>) => p;

  return {
    store, fetchMock, self,
    async install() {
      let p: Promise<unknown> = Promise.resolve();
      handlers.install({ waitUntil: (x: Promise<unknown>) => { p = x; } });
      await wait(p);
    },
    async activate() {
      let p: Promise<unknown> = Promise.resolve();
      handlers.activate({ waitUntil: (x: Promise<unknown>) => { p = x; } });
      await wait(p);
    },
    /** Devolve a resposta do service worker, ou 'ignored' se ele não interferiu. */
    async fetch(request: FakeRequest) {
      let p: Promise<unknown> | undefined;
      handlers.fetch({ request, respondWith: (x: Promise<unknown>) => { p = x; } });
      return p ? ((await p) as ReturnType<typeof res>) : ('ignored' as const);
    },
    async message(data: unknown) {
      let p: Promise<unknown> = Promise.resolve();
      handlers.message({ data, waitUntil: (x: Promise<unknown>) => { p = x; } });
      await wait(p);
    },
    cacheNames: () => [...store.keys()],
    size: (name: string) => store.get(name)?.size ?? 0,
  };
}

const OFFLINE_HTML = '<link href="/_next/static/css/app.css"/><script src="/_next/static/chunks/main.js"></script>';

describe('service worker — instalação (P4)', () => {
  it('pré-cacheia /offline, seus arquivos estáticos e o ícone', async () => {
    const sw = loadSw();
    sw.fetchMock.mockImplementation(async (r) => res(String((r as string).toString().includes('offline') ? OFFLINE_HTML : 'x')));
    await sw.install();
    expect(sw.store.get('pokedex-pages-v1')?.has(`${ORIGIN}/offline`)).toBe(true);
    const statics = [...(sw.store.get('pokedex-static-v1')?.keys() ?? [])];
    expect(statics).toEqual(expect.arrayContaining([`${ORIGIN}/_next/static/css/app.css`, `${ORIGIN}/_next/static/chunks/main.js`, `${ORIGIN}/icons/icon-192.png`]));
  });
});

describe('service worker — navegação (P4)', () => {
  it('online: devolve a página e guarda uma cópia', async () => {
    const sw = loadSw();
    sw.fetchMock.mockResolvedValue(res('<html>pokemon 6</html>'));
    const r = await sw.fetch(req('/pokemon/6', { mode: 'navigate' }));
    expect((r as ReturnType<typeof res>).body).toContain('pokemon 6');
    expect(sw.store.get('pokedex-pages-v1')?.has(`${ORIGIN}/pokemon/6`)).toBe(true);
  });

  it('offline: serve a página já visitada; a não visitada cai em /offline', async () => {
    const sw = loadSw();
    sw.fetchMock.mockResolvedValueOnce(res('<html>visitada</html>'));
    await sw.fetch(req('/pokemon/6', { mode: 'navigate' }));
    sw.store.get('pokedex-pages-v1')!.set(`${ORIGIN}/offline`, res('<html>sem internet</html>'));

    sw.fetchMock.mockRejectedValue(new Error('offline'));
    expect(((await sw.fetch(req('/pokemon/6', { mode: 'navigate' }))) as ReturnType<typeof res>).body).toContain('visitada');
    expect(((await sw.fetch(req('/pokemon/25', { mode: 'navigate' }))) as ReturnType<typeof res>).body).toContain('sem internet');
  });

  it('ignora a query ao procurar a página em cache offline', async () => {
    const sw = loadSw();
    sw.fetchMock.mockResolvedValueOnce(res('<html>lista</html>'));
    await sw.fetch(req('/', { mode: 'navigate' }));
    sw.fetchMock.mockRejectedValue(new Error('offline'));
    expect(((await sw.fetch(req('/?utm=x', { mode: 'navigate' }))) as ReturnType<typeof res>).body).toContain('lista');
  });

  it('não guarda respostas de erro', async () => {
    const sw = loadSw();
    sw.fetchMock.mockResolvedValue(res('erro', { status: 500 }));
    await sw.fetch(req('/pokemon/6', { mode: 'navigate' }));
    expect(sw.size('pokedex-pages-v1')).toBe(0);
  });
});

describe('service worker — estáticos, imagens e dados (P4)', () => {
  it('/_next/static usa cache primeiro: a segunda leitura não vai à rede', async () => {
    const sw = loadSw();
    sw.fetchMock.mockResolvedValue(res('js'));
    await sw.fetch(req('/_next/static/chunks/a.js'));
    await sw.fetch(req('/_next/static/chunks/a.js'));
    expect(sw.fetchMock).toHaveBeenCalledTimes(1);
  });

  it('imagens: stale-while-revalidate, rebuscando com CORS (sem resposta opaca)', async () => {
    const sw = loadSw();
    const image = req('https://raw.githubusercontent.com/PokeAPI/sprites/6.png', { destination: 'image' });
    sw.fetchMock.mockResolvedValue(res('png-v1'));
    expect(((await sw.fetch(image)) as ReturnType<typeof res>).body).toBe('png-v1');
    expect((sw.fetchMock.mock.calls[0][0] as { mode: string }).mode).toBe('cors');

    sw.fetchMock.mockResolvedValue(res('png-v2'));
    const second = (await sw.fetch(image)) as ReturnType<typeof res>;
    expect(second.body).toBe('png-v1'); // devolve o antigo na hora
    await new Promise((r) => setTimeout(r, 0));
    expect(sw.size('pokedex-images-v1')).toBe(1);
    expect([...sw.store.get('pokedex-images-v1')!.values()][0].body).toBe('png-v2'); // atualizado em segundo plano
  });

  it('imagem sem rede e sem cache vira erro, não exceção', async () => {
    const sw = loadSw();
    sw.fetchMock.mockRejectedValue(new Error('offline'));
    const r = (await sw.fetch(req('https://raw.githubusercontent.com/x/1.png', { destination: 'image' }))) as { ok: boolean };
    expect(r.ok).toBe(false);
  });

  it('PokéAPI usa stale-while-revalidate', async () => {
    const sw = loadSw();
    sw.fetchMock.mockResolvedValue(res('{"a":1}'));
    await sw.fetch(req('https://pokeapi.co/api/v2/pokemon/6'));
    expect(sw.size('pokedex-data-v1')).toBe(1);
  });

  it('não interfere em não-GET, mesma origem fora do estático e hosts desconhecidos', async () => {
    const sw = loadSw();
    expect(await sw.fetch(req('/api/x', { method: 'POST' }))).toBe('ignored');
    expect(await sw.fetch(req('/pokemon/6?_rsc=abc'))).toBe('ignored');
    expect(await sw.fetch(req('https://exemplo.com/img.png', { destination: 'image' }))).toBe('ignored');
    expect(sw.fetchMock).not.toHaveBeenCalled();
  });

  it('nunca guarda respostas opacas ou com erro', async () => {
    const sw = loadSw();
    sw.fetchMock.mockResolvedValue(res('x', { type: 'opaque' }));
    await sw.fetch(req('/_next/static/a.js'));
    sw.fetchMock.mockResolvedValue(res('x', { status: 404 }));
    await sw.fetch(req('/_next/static/b.js'));
    expect(sw.size('pokedex-static-v1')).toBe(0);
  });
});

describe('service worker — limites e versões (P5)', () => {
  it('passando do teto, as entradas mais antigas saem', async () => {
    const sw = loadSw();
    sw.fetchMock.mockResolvedValue(res('png'));
    for (let i = 0; i < 405; i++) await sw.fetch(req(`https://raw.githubusercontent.com/s/${i}.png`, { destination: 'image' }));
    await new Promise((r) => setTimeout(r, 20));
    const keys = [...sw.store.get('pokedex-images-v1')!.keys()];
    expect(keys).toHaveLength(400);
    expect(keys).not.toContain('https://raw.githubusercontent.com/s/0.png');
    expect(keys).toContain('https://raw.githubusercontent.com/s/404.png');
  });

  it('ao ativar, apaga caches antigos do app, preserva os de outros e assume as abas', async () => {
    const sw = loadSw();
    sw.store.set('pokedex-pages-v0', new Map());
    sw.store.set('pokedex-static-v1', new Map());
    sw.store.set('outro-app-cache', new Map());
    await sw.activate();
    expect(sw.cacheNames()).toEqual(expect.arrayContaining(['pokedex-static-v1', 'outro-app-cache']));
    expect(sw.cacheNames()).not.toContain('pokedex-pages-v0');
    expect(sw.self.clients.claim).toHaveBeenCalled();
  });

  it('CACHE_PAGE guarda a página atual (só da mesma origem)', async () => {
    const sw = loadSw();
    sw.fetchMock.mockResolvedValue(res('<html>lista</html>'));
    await sw.message({ type: 'CACHE_PAGE', url: `${ORIGIN}/` });
    await sw.message({ type: 'CACHE_PAGE', url: 'https://evil.test/' });
    expect([...sw.store.get('pokedex-pages-v1')!.keys()]).toEqual([`${ORIGIN}/`]);
    expect(sw.fetchMock).toHaveBeenCalledTimes(1);
  });

  it('SKIP_WAITING ativa a nova versão; CACHE_URLS guarda só estáticos da mesma origem', async () => {
    const sw = loadSw();
    await sw.message({ type: 'SKIP_WAITING' });
    expect(sw.self.skipWaiting).toHaveBeenCalled();

    sw.fetchMock.mockResolvedValue(res('js'));
    await sw.message({ type: 'CACHE_URLS', urls: [`${ORIGIN}/_next/static/a.js`, 'https://evil.test/_next/static/b.js', `${ORIGIN}/pokemon/6`] });
    expect([...sw.store.get('pokedex-static-v1')!.keys()]).toEqual([`${ORIGIN}/_next/static/a.js`]);
  });
});
