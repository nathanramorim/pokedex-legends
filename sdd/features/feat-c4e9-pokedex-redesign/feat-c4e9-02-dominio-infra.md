# feat-c4e9-02-dominio-infra — Domínio e infraestrutura

**Branch:** `feat/c4e9-pokedex-redesign` (única para todas as subtarefas)
**Discovery:** `sdd/discovery/discovery-c4e9-pokedex-redesign.md`
**Depende de:** 01
**Tamanho:** M
**Status:** `done`

## Objetivo
Entidades, porta `PokemonRepository` e adaptador da PokéAPI com cache.

## Critério de conclusão
```bash
npm test -- domain infrastructure
```
Mappers testados com fixtures de respostas reais; erros de API viram erros de domínio (CA12 base).

## Tarefas
- [x] **02-1** Entidades Pokemon, Stat, Move, Type, Ability, EvolutionNode
- [x] **02-2** Porta `PokemonRepository`
- [x] **02-3** `PokeApiPokemonRepository` (pokemon, species, evolution-chain, type, generation, ability)
- [x] **02-4** Mappers DTO → entidade e cache via fetch do Next
- [x] **02-5** Casos de uso ListPokemon, GetPokemonDetail

## Arquivos gerados
`src/domain/**`, `src/application/**`, `src/infrastructure/**`, fixtures de teste

## Skills relevantes
(consultar `skills/index.md`; regras 10 e 11 da `constitution.md`)
