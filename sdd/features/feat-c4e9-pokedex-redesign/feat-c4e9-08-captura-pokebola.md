# feat-c4e9-08-captura-pokebola — Captura: dica de Pokébola

**Branch:** `feat/c4e9-pokedex-redesign` (única para todas as subtarefas)
**Discovery:** `sdd/discovery/discovery-c4e9-pokedex-redesign.md`
**Depende de:** 02, 03, 05
**Tamanho:** M
**Status:** `done`

## Objetivo
Regra de domínio que recomenda a Pokébola com motivo e a aba Captura.

## Critério de conclusão
```bash
npm test -- pokeball
```
Cobre CA8 (função pura; lendário/místico nunca recebe Poké Ball comum).

## Tarefas
- [x] **08-1** `recommendPokeball` no domínio (capture_rate, habitat, tipos, cor, lendário/místico)
- [x] **08-2** Testes em tabela
- [x] **08-3** Aba Captura: Pokébola, motivo e taxa de captura

## Arquivos gerados
`src/domain/pokeball/**`, `src/presentation/components/features/detail/Capture*`

## Skills relevantes
(consultar `skills/index.md`; regras 10 e 11 da `constitution.md`)
