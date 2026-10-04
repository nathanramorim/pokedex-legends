/* Service worker da Pokédex Legends.
 * - Navegação: rede primeiro; sem rede usa o cache e, por fim, a página /offline.
 * - /_next/static e ícones: cache primeiro (arquivos com hash, não mudam).
 * - Imagens (sprites) e PokéAPI: stale-while-revalidate, com limite de entradas.
 * Mude VERSION para invalidar todos os caches. */
const VERSION = 'v1';
const PAGES_CACHE = `pokedex-pages-${VERSION}`;
const STATIC_CACHE = `pokedex-static-${VERSION}`;
const IMAGES_CACHE = `pokedex-images-${VERSION}`;
const DATA_CACHE = `pokedex-data-${VERSION}`;
const CURRENT_CACHES = [PAGES_CACHE, STATIC_CACHE, IMAGES_CACHE, DATA_CACHE];

const OFFLINE_URL = '/offline';
const LIMITS = { [PAGES_CACHE]: 60, [IMAGES_CACHE]: 400, [DATA_CACHE]: 200 };
const IMAGE_HOSTS = ['raw.githubusercontent.com'];
const DATA_HOSTS = ['pokeapi.co'];

const isCacheable = (response) => Boolean(response) && response.ok && (response.type === 'basic' || response.type === 'cors');

async function trim(cacheName) {
  const limit = LIMITS[cacheName];
  if (!limit) return;
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - limit; i++) await cache.delete(keys[i]);
}

async function put(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  await trim(cacheName);
}

/** URLs de /_next/static citadas num HTML (para a página offline abrir com estilo). */
function assetsIn(html) {
  const found = new Set();
  for (const match of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) found.add(match[0]);
  return [...found];
}

async function cacheAll(cacheName, urls) {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (isCacheable(response)) await cache.put(url, response);
      } catch {
        /* melhor esforço */
      }
    }),
  );
}

async function precache() {
  const pages = await caches.open(PAGES_CACHE);
  const response = await fetch(OFFLINE_URL);
  if (!isCacheable(response)) throw new Error('offline indisponível');
  const html = await response.clone().text();
  await pages.put(OFFLINE_URL, response);
  await cacheAll(STATIC_CACHE, [...assetsIn(html), '/icons/icon-192.png']);
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) await put(PAGES_CACHE, request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request, { ignoreSearch: true });
    return cached || (await caches.match(OFFLINE_URL)) || Response.error();
  }
}

async function cacheFirst(cacheName, request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (isCacheable(response)) await put(cacheName, request, response.clone());
  return response;
}

async function staleWhileRevalidate(cacheName, request, { cors = false } = {}) {
  const key = request.url;
  const cached = await caches.match(key);
  // Imagens vindas de <img> são "no-cors" (opacas e caras na cota): buscamos de novo com CORS.
  const network = fetch(cors ? new Request(key, { mode: 'cors', credentials: 'omit' }) : request)
    .then(async (response) => {
      if (isCacheable(response)) await put(cacheName, key, response.clone());
      return response;
    })
    .catch(() => null);
  if (cached) return cached;
  return (await network) || Response.error();
}

/** Decide a estratégia; devolve undefined quando o service worker não deve interferir. */
function strategyFor(request, url, origin) {
  if (request.method !== 'GET') return undefined;
  if (request.mode === 'navigate') return () => networkFirstNavigation(request);
  if (url.origin === origin) {
    if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) return () => cacheFirst(STATIC_CACHE, request);
    return undefined;
  }
  if (IMAGE_HOSTS.includes(url.hostname) && request.destination === 'image') return () => staleWhileRevalidate(IMAGES_CACHE, request, { cors: true });
  if (DATA_HOSTS.includes(url.hostname)) return () => staleWhileRevalidate(DATA_CACHE, request);
  return undefined;
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith('pokedex-') && !CURRENT_CACHES.includes(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const strategy = strategyFor(event.request, url, self.location.origin);
  if (strategy) event.respondWith(strategy());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  if (data.type === 'CACHE_PAGE' && typeof data.url === 'string') {
    // A primeira página não passou pelo service worker (ainda não controlava): guarda agora.
    const url = new URL(data.url, self.location.origin);
    if (url.origin === self.location.origin) {
      event.waitUntil(
        fetch(url.href)
          .then((response) => (isCacheable(response) ? put(PAGES_CACHE, url.href, response.clone()) : undefined))
          .catch(() => undefined),
      );
    }
  }
  if (data.type === 'CACHE_URLS' && Array.isArray(data.urls)) {
    const same = data.urls.filter((u) => typeof u === 'string' && new URL(u, self.location.origin).origin === self.location.origin);
    event.waitUntil(cacheAll(STATIC_CACHE, same.filter((u) => u.includes('/_next/static/'))));
  }
});
