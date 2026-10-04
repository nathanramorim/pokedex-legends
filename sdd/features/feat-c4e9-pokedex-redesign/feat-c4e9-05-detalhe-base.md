# feat-c4e9-05-detalhe-base — Detalhe: Sobre, Habilidades, Itens

**Branch:** `feat/c4e9-pokedex-redesign` (única para todas as subtarefas)
**Discovery:** `sdd/discovery/discovery-c4e9-pokedex-redesign.md`
**Depende de:** 02, 03
**Tamanho:** M
**Status:** `done`

## Objetivo
Rota de detalhe com abas Sobre, Habilidades e Itens.

## Critério de conclusão
```bash
npm test -- detail
```
Parte de CA4 (abas navegáveis por toque e teclado).

## Tarefas
- [x] **05-1** Rota `/pokemon/[id]` e container de abas
- [x] **05-2** Aba Sobre (tipos, medidas, descrição, status)
- [x] **05-3** Aba Habilidades (normais e oculta, com texto)
- [x] **05-4** Aba Itens (held_items)

## Arquivos gerados
`app/pokemon/[id]/page.tsx`, `src/presentation/components/features/detail/**`

## Skills relevantes
(consultar `skills/index.md`; regras 10 e 11 da `constitution.md`)
