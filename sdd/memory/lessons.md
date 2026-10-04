# Lições Aprendidas — pokemon-data

Padrões de erro já corrigidos, consultados por Builder/Revisor antes de implementar (lido no READ-MIN). Entradas mais recentes primeiro; o arquivo é aparado automaticamente para respeitar o orçamento (2 KB) via `forge-sdd lessons add`.

- Antes de validar no navegador, matar `next-server` antigo (`pkill -f next-server`): servidor velho serve HTML novo com CSS 404.
- `no-restricted-imports` com padrão `three/*` bloqueia `@/presentation/three/...`; use `paths` para `three` e padrões só de `three/addons/*`. Barrel `@/x` precisa de padrão `@/x` e `@/x/*`.
- `next/dynamic` com `ssr:false` deixou o palco vazio; `import('three')` dentro de `useEffect` basta e mantém imagem no SSR.
- Chrome headless tem largura mínima ~500px: validar 390px com iframe ou DevTools `setDeviceMetricsOverride`.
- Texto branco em cores de tipo falha WCAG (13 de 18); usar tokens `--type-on-<tipo>`.
- Hook que devolve objeto com `ref` e lido no render quebra `react-hooks/refs`; devolver tupla `[ref, dados]`.
- Chrome headless com GL por software renderiza ~1 quadro por vários segundos: para validar animação, controlar `performance.now` e `requestAnimationFrame` e avançar quadro a quadro; `addScriptToEvaluateOnNewDocument` exige `Page.enable`.
- Misturar o timestamp do `requestAnimationFrame` com `performance.now()` desalinha o início de efeitos; usar um relógio só.
- Sprites de partículas grandes e girados: desligar mipmaps e limitar `gl_PointSize` (GPUs móveis têm teto).
- Um anel que expande perto da câmera é cortado pelo canvas e parece um quadrado translúcido; limitar o raio ao quadro.
- Blend aditivo some sobre fundo claro (tela verde da Pokédex): usar blend normal.
- `Network.emulateNetworkConditions` do DevTools não atinge o fetch do service worker: para testar offline, desligar o servidor.
- Service worker só controla a página depois de ativar: a primeira página precisa ser guardada por mensagem (`CACHE_PAGE`), senão o 1º offline cai na tela offline.
- Não pré-cachear só o HTML de `/offline`: o CSS/JS dele também precisa entrar no cache (extrair `/_next/static/*` do HTML).
- Imagens `no-cors` ficam opacas e inflam a cota do cache: re-buscar com `mode: 'cors'` quando o CDN permite.
- Lint do React barra `setState` direto em efeito: ler ambiente do cliente com `useSyncExternalStore`.