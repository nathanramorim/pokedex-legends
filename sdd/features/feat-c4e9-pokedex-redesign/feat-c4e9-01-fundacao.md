# feat-c4e9-01-fundacao — Fundação

**Branch:** `feat/c4e9-pokedex-redesign` (única para todas as subtarefas)
**Discovery:** `sdd/discovery/discovery-c4e9-pokedex-redesign.md`
**Depende de:** —
**Tamanho:** M
**Status:** `done`

## Objetivo
Projeto Next.js + TypeScript com camadas da Clean Architecture, tokens da paleta Pokédex e testes rodando.

## Critério de conclusão
```bash
git rev-parse --is-inside-work-tree && npm run lint && npm test && npm run build
```
Cobre CA11 (lint de dependência entre camadas).

## Tarefas
- [x] **01-1** `git init`, remoto GitHub, branch `feat/c4e9-pokedex-redesign` (nunca em main)
- [x] **01-2** Fixar versões (Next, TS, Three.js, Vitest) via context7; decidir D1 (CSS Modules/Tailwind) e D5
- [x] **01-3** Estrutura `src/{domain,application,infrastructure,presentation,main}`
- [x] **01-4** Regra de lint: domain/application sem React, Next, Three, fetch
- [x] **01-5** Tokens de cor e `env.ts`
- [x] **01-6** Mover protótipo para `legacy/`

## Arquivos gerados
`package.json`, `tsconfig.json`, `src/**`, `app/layout.tsx`, `src/main/config/env.ts`, `legacy/`

## Skills relevantes
(consultar `skills/index.md`; regras 10 e 11 da `constitution.md`)
