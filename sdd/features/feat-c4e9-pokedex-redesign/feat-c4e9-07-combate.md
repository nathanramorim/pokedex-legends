# feat-c4e9-07-combate — Detalhe: Combate (efetivo e vulnerável)

**Branch:** `feat/c4e9-pokedex-redesign` (única para todas as subtarefas)
**Discovery:** `sdd/discovery/discovery-c4e9-pokedex-redesign.md`
**Depende de:** 02, 03, 05
**Tamanho:** M
**Status:** `done`

## Objetivo
Aba Combate com multiplicadores por tipo, inclusive tipo duplo.

## Critério de conclusão
```bash
npm test -- matchups
```
Cobre CA5 (ex.: Charizard 4× Rock).

## Tarefas
- [x] **07-1** Caso de uso GetMatchups combinando damage_relations
- [x] **07-2** Aba Combate: efetivo contra / vulnerável contra / imune, com ícones de tipo

## Arquivos gerados
`src/application/GetMatchups.ts`, `src/presentation/components/features/detail/Matchups*`

## Skills relevantes
(consultar `skills/index.md`; regras 10 e 11 da `constitution.md`)
