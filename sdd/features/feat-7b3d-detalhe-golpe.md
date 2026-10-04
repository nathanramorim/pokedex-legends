# feat-7b3d — Detalhe do golpe ao selecionar

**Branch:** `feat/c4e9-pokedex-redesign` (mantida por decisão do usuário; repositório sem commits, `main` ainda não existe)
**Origem:** `/nova-feature` — "em golpes deve permitir selecionar e visualizar a ação do golpe do pokemon"
**Depende de:** aba Golpes (feat-c4e9, já implementada)
**Status:** `done`

## Decisões do clarify
| Questão | Resolução |
|---------|-----------|
| O que é "ação do golpe" | Painel com detalhes do efeito (texto + dados), sem animação 3D |
| Branch | Seguir em `feat/c4e9-pokedex-redesign` |

## Objetivo
Na aba Golpes, cada golpe pode ser selecionado e mostra o que ele faz: descrição do efeito e dados completos, vindos da PokéAPI.

## Comportamento
- Cada card de golpe vira um botão (`aria-expanded`); tocar abre o detalhe logo abaixo do card. Só um aberto por vez; tocar de novo ou em outro fecha.
- Detalhe mostra: descrição do efeito, alvo, prioridade, chance do efeito secundário (quando houver) e os dados já exibidos (tipo, categoria, poder, precisão, PP).
- `$effect_chance` do texto da API é substituído pelo valor real.
- Teclado: Enter/Espaço abrem e fecham; foco visível; alvo de toque ≥ 44px.

## Critério de conclusão
```bash
npm run lint && npm test && npm run build
```
| # | Critério | Verificação |
|---|----------|-------------|
| M1 | Selecionar um golpe exibe a descrição do efeito; selecionar outro troca; selecionar o mesmo fecha | Teste de componente |
| M2 | `$effect_chance` é substituído pelo número; golpe sem texto mostra "Sem descrição disponível." | Teste do mapper |
| M3 | Prioridade e alvo aparecem formatados em PT-BR (ex.: "Um oponente", "Prioridade +1") | Teste de componente |
| M4 | Botão com `aria-expanded` e `aria-controls`, operável por teclado | Teste de acessibilidade |
| M5 | Layout em 390×844 e 844×390 sem rolagem horizontal | Verificação visual |

## Tarefas
- [x] **7b3d-1** Domínio: estender `Move` com `effect`, `effectChance`, `priority`, `target`
- [x] **7b3d-2** Infra: `MoveDto` e `mapMove` (texto em inglês `short_effect`, fallback `flavor_text`, substituição de `$effect_chance`)
- [x] **7b3d-3** UI: `MovesTab` com card selecionável e painel de detalhe (acordeão de seleção única)
- [x] **7b3d-4** Rótulos PT-BR de alvo (`target`) e prioridade em `presentation/format`
- [x] **7b3d-5** Testes M1–M4 e verificação visual M5

## Arquivos gerados
```
src/domain/entities/pokemon.ts (Move)
src/infrastructure/pokeapi/{dto,mappers}.ts
src/presentation/components/features/detail/MovesTab.tsx, moves.module.css
src/presentation/format.ts
src/test/fixtures.ts
```

## Observações
O texto do efeito vem em inglês (a PokéAPI não traz PT-BR para a maioria dos golpes); rótulos e dados da interface ficam em PT-BR.

## Skills relevantes
(consultar `skills/index.md`; regras 10 e 11 da `constitution.md`)
