# feat-c4e9-04-lista-filtros — Lista completa, busca e filtros

**Branch:** `feat/c4e9-pokedex-redesign` (única para todas as subtarefas)
**Discovery:** `sdd/discovery/discovery-c4e9-pokedex-redesign.md`
**Depende de:** 02, 03
**Tamanho:** G
**Status:** `done`

## Objetivo
Listar todos os Pokémon com lista virtualizada, busca e filtros com ícones (tipo, geração).

## Critério de conclusão
```bash
npm test -- list filters
```
Cobre CA1, CA2, CA3, CA12.

## Tarefas
- [x] **04-1** Caso de uso de lista completa (`count` → todos)
- [x] **04-2** Filtros por tipo (múltiplos) e geração via /type e /generation; busca por nome/número
- [x] **04-3** Lista virtualizada com PokemonCard reutilizável
- [x] **04-4** Barra de filtros com ícones de tipo, amigável no toque

## Arquivos gerados
`app/page.tsx`, `src/presentation/components/features/list/**`, `src/application/**`

## Skills relevantes
(consultar `skills/index.md`; regras 10 e 11 da `constitution.md`)
