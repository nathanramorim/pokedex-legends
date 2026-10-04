# Lições Aprendidas — pokemon-data

Padrões de erro já corrigidos, consultados por Builder/Revisor antes de implementar (lido no READ-MIN). Entradas mais recentes primeiro; o arquivo é aparado automaticamente para respeitar o orçamento (2 KB) via `forge-sdd lessons add`.

- Antes de validar no navegador, matar `next-server` antigo (`pkill -f next-server`): servidor velho serve HTML novo com CSS 404.
- `no-restricted-imports` com padrão `three/*` bloqueia `@/presentation/three/...`; use `paths` para `three` e padrões só de `three/addons/*`. Barrel `@/x` precisa de padrão `@/x` e `@/x/*`.
- `next/dynamic` com `ssr:false` deixou o palco vazio; `import('three')` dentro de `useEffect` basta e mantém imagem no SSR.
- Chrome headless tem largura mínima ~500px: validar 390px com iframe ou DevTools `setDeviceMetricsOverride`.
- Texto branco em cores de tipo falha WCAG (13 de 18); usar tokens `--type-on-<tipo>`.
- Hook que devolve objeto com `ref` e lido no render quebra `react-hooks/refs`; devolver tupla `[ref, dados]`.
