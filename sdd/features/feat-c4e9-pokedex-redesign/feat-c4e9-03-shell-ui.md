# feat-c4e9-03-shell-ui — Shell Pokédex e UI base

**Branch:** `feat/c4e9-pokedex-redesign` (única para todas as subtarefas)
**Discovery:** `sdd/discovery/discovery-c4e9-pokedex-redesign.md`
**Depende de:** 01
**Tamanho:** M
**Status:** `done`

## Objetivo
Moldura da Pokédex e componentes reutilizáveis, com layout retrato e landscape.

## Critério de conclusão
```bash
npm test -- presentation/ui
```
CA9 verificado em 390×844 e 844×390; Tabs com `role=tablist` e teclado (base de CA4).

## Tarefas
- [x] **03-1** DexShell (carcaça vermelha, lente azul, tela verde)
- [x] **03-2** Button, TypeBadge, Tabs acessível, StatBar, Screen
- [x] **03-3** Layout por orientação (empilhado vs. duas colunas)
- [x] **03-4** Estados de loading, erro e vazio reutilizáveis

## Arquivos gerados
`src/presentation/components/ui/**`, `src/presentation/styles/**`

## Skills relevantes
(consultar `skills/index.md`; regras 10 e 11 da `constitution.md`)
