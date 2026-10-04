# feat-c4e9-09-three-stage — Three.js: palco do Pokémon

**Branch:** `feat/c4e9-pokedex-redesign` (única para todas as subtarefas)
**Discovery:** `sdd/discovery/discovery-c4e9-pokedex-redesign.md`
**Depende de:** 03, 05
**Tamanho:** G
**Status:** `done`

## Objetivo
Cena Three.js com o artwork do Pokémon animado e interativo (D7 define extras).

## Critério de conclusão
```bash
npm test -- three && npm run build
```
Cobre CA10 (arrasto/toque, reduced-motion, cleanup, fallback sem WebGL).

## Tarefas
- [x] **09-1** PokemonStage client-only (import dinâmico, sem SSR)
- [x] **09-2** Parallax, flutuação e giro por arrasto/toque
- [x] **09-3** Fallback para imagem e respeito a `prefers-reduced-motion`
- [x] **09-4** Cleanup de geometrias, texturas e renderer
- [x] **09-5** Definir orçamento de desempenho em celular (D7)

## Arquivos gerados
`src/presentation/three/**`

## Skills relevantes
(consultar `skills/index.md`; regras 10 e 11 da `constitution.md`)
