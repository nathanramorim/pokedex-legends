# feat-c4e9-06-evolucoes-mega — Detalhe: Evoluções e Mega

**Branch:** `feat/c4e9-pokedex-redesign` (única para todas as subtarefas)
**Discovery:** `sdd/discovery/discovery-c4e9-pokedex-redesign.md`
**Depende de:** 02, 03, 05
**Tamanho:** M
**Status:** `done`

## Objetivo
Abas Evoluções (cadeias lineares e ramificadas) e Mega (ou estado vazio).

## Critério de conclusão
```bash
npm test -- evolution mega
```
Cobre CA6 e CA7.

## Tarefas
- [x] **06-1** Aba Evoluções com condições (nível, item, etc.)
- [x] **06-2** Cadeia ramificada (ex.: Eevee)
- [x] **06-3** Aba Mega via varieties `-mega*`; estado vazio explícito

## Arquivos gerados
`src/presentation/components/features/detail/{Evolutions,Mega}*`

## Skills relevantes
(consultar `skills/index.md`; regras 10 e 11 da `constitution.md`)
