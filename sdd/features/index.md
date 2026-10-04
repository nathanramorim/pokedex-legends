# Index de Features — pokemon-data

## Dependency graph

```
main
└─ feat/foundation (template legado, substituído pela 01 abaixo)
└─ feat/c4e9-pokedex-redesign (branch única)
   01 fundação
   ├─ 02 domínio/infra ─┬─ 05 detalhe base ─┬─ 06 evoluções/mega
   │                    │                   ├─ 07 combate
   │                    │                   ├─ 08 captura/pokébola
   │                    │                   └─ 09 three stage (também 03)
   │                    └─ 04 lista/filtros (também 03)
   └─ 03 shell/UI ──────┘
   10 acabamento (depende de 04–09)
```

## Índice

| # | Arquivo | Branch | Depende de | Status |
|---|---------|--------|-----------|--------|
| 00 | feat-00-foundation.md | feat/foundation | — | todo (template não preenchido; use a 01) |
| c4e9-01 | feat-c4e9-pokedex-redesign/feat-c4e9-01-fundacao.md | feat/c4e9-pokedex-redesign | — | done |
| c4e9-02 | feat-c4e9-pokedex-redesign/feat-c4e9-02-dominio-infra.md | feat/c4e9-pokedex-redesign | 01 | done |
| c4e9-03 | feat-c4e9-pokedex-redesign/feat-c4e9-03-shell-ui.md | feat/c4e9-pokedex-redesign | 01 | done |
| c4e9-04 | feat-c4e9-pokedex-redesign/feat-c4e9-04-lista-filtros.md | feat/c4e9-pokedex-redesign | 02, 03 | done |
| c4e9-05 | feat-c4e9-pokedex-redesign/feat-c4e9-05-detalhe-base.md | feat/c4e9-pokedex-redesign | 02, 03 | done |
| c4e9-06 | feat-c4e9-pokedex-redesign/feat-c4e9-06-evolucoes-mega.md | feat/c4e9-pokedex-redesign | 02, 03, 05 | done |
| c4e9-07 | feat-c4e9-pokedex-redesign/feat-c4e9-07-combate.md | feat/c4e9-pokedex-redesign | 02, 03, 05 | done |
| c4e9-08 | feat-c4e9-pokedex-redesign/feat-c4e9-08-captura-pokebola.md | feat/c4e9-pokedex-redesign | 02, 03, 05 | done |
| c4e9-09 | feat-c4e9-pokedex-redesign/feat-c4e9-09-three-stage.md | feat/c4e9-pokedex-redesign | 03, 05 | done |
| c4e9-10 | feat-c4e9-pokedex-redesign/feat-c4e9-10-acabamento.md | feat/c4e9-pokedex-redesign | 04–09 | done |
| 7b3d | feat-7b3d-detalhe-golpe.md | feat/c4e9-pokedex-redesign | aba Golpes | done |
| d92a | feat-d92a-animacao-golpe-3d.md | feat/animacao-golpe-3d | 7b3d, c4e9-09 | done |
| e5c8 | feat-e5c8-pwa.md | feat/pwa | d92a | done |
