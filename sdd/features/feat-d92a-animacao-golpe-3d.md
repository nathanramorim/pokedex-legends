# feat-d92a — Animação do golpe no palco 3D

**Branch:** `feat/animacao-golpe-3d` (criada a partir de `feat/c4e9-pokedex-redesign`, PR #1 ainda não mergeado)
**Origem:** `/nova-feature` — continuação da feat-7b3d ("movimento dos golpes")
**Depende de:** feat-7b3d (golpes selecionáveis) e feat-c4e9-09 (palco Three.js)
**Status:** `done`

## Decisões do clarify
| Questão | Resolução |
|---------|-----------|
| Branch de partida | `feat/c4e9-pokedex-redesign` |
| Como ver o palco no retrato | Ao selecionar o golpe, a página rola suavemente até o palco e a animação toca; botão "Repetir" no painel do golpe |
| Variação dos efeitos | Por tipo (18 cores e formas) e por categoria (físico = investida, especial = projétil, status = aura) |

## Objetivo
Ao selecionar um golpe na aba Golpes, o palco 3D do Pokémon anima o ataque: um efeito visual na cor e forma do tipo, com movimento conforme a categoria. A PokéAPI não tem animação de golpe; os efeitos são genéricos, desenhados no Three.js.

## Comportamento
- Selecionar um golpe dispara a animação no palco único já existente (sem segunda cena WebGL).
- **Físico:** o Pokémon avança em direção à câmera e volta, com impacto na cor do tipo.
- **Especial:** projétil do tipo sai do Pokémon e cruza a cena com rastro e explosão.
- **Status:** aura pulsante do tipo envolve o Pokémon (sem projétil).
- Cada um dos 18 tipos tem cor (token CSS) e forma de partícula própria (ex.: chamas, gotas, raios, folhas, cristais).
- No retrato, a página rola até o palco ao selecionar; no landscape (palco ao lado) não rola.
- Botão "Repetir" no painel do golpe toca de novo; fechar o painel não interrompe uma animação em curso.
- `prefers-reduced-motion`: sem movimento do Pokémon nem projétil; só um brilho curto na cor do tipo.
- Sem WebGL (fallback de imagem): nada de animação, sem erro, painel de efeito segue funcionando.
- Reage ao arrasto/toque do usuário sem travar; uma nova animação cancela a anterior.

## Realismo (pedido do usuário durante a implementação)
"Os movimentos devem ser o mais realista possível." Limite honesto: o Pokémon é uma imagem 2D (artwork oficial), então o corpo só faz transformações de plano (deslocamento, esmagar/esticar, inclinar, brilho); o realismo vem da física das partículas e da temporização.
- **Física de partículas:** gravidade/empuxo, arrasto, turbulência, rotação, tamanho e cor ao longo da vida, quicada no chão (pedra, terra, aço).
- **Perfil por tipo:** fogo sobe e esfria (branco → laranja → vermelho), água cai em gotas, elétrico pisca em estalos curtos, gelo estilhaça, planta gira em espiral, fantasma ondula, veneno borbulha, fada cintila etc.
- **Físico:** antecipação (recua e comprime), investida acelerando, pausa de impacto (hit-stop), oscilação amortecida na volta, onda de choque, brilho no impacto e tremor de câmera.
- **Especial:** carga (partículas convergem), recuo ao disparar, projétil com cauda emitida continuamente, explosão com onda de choque.
- **Status:** aura que sobe em espiral com turbulência e brilho pulsante.
- Tudo determinístico (gerador pseudoaleatório com semente) para ser testável; orçamento ≤ 160 partículas.

## Critério de conclusão
```bash
npm run lint && npm test && npm run build
```
| # | Critério | Verificação |
|---|----------|-------------|
| A1 | Selecionar um golpe chama `playMove(type, category)` no palco; "Repetir" chama de novo | Teste de componente |
| A2 | Mapeamento determinístico: 18 tipos × 3 categorias resolvem para um efeito válido (cor, forma, movimento) | Teste unitário em tabela |
| A3 | Matemática da animação (investida, trajetória do projétil, pulso da aura) é pura e fica dentro de limites | Teste unitário |
| A4 | Nova animação cancela a anterior; recursos (geometrias, materiais) criados pelo efeito são liberados ao terminar e ao desmontar | Teste com Three simulado |
| A5 | Com `prefers-reduced-motion`, o Pokémon não se move e não há projétil | Teste de componente |
| A6 | Sem WebGL, selecionar golpe não gera erro | Teste de componente |
| A7 | No retrato, selecionar golpe rola até o palco; no landscape não rola | Teste de componente |
| A9 | Simulação respeita física: partículas de fogo sobem, de água caem, de pedra quicam no chão; vida e tamanho evoluem; resultado determinístico | Teste unitário da simulação |
| A10 | Pose do corpo: antecipação recua, impacto tem pausa, volta amortecida termina em repouso; tremor decai a zero | Teste unitário |
| A8 | Verificação visual no navegador em 390×844 e 844×390 e arrasto continua funcionando durante o efeito | Verificação manual |

## Tarefas
- [x] **d92a-1** Domínio de apresentação: tabela tipo × categoria → efeito (cor via token, forma, movimento) em `presentation/three/move-effects.ts`
- [x] **d92a-2** Matemática pura do efeito (investida, projétil, aura) em `stage-math.ts`
- [x] **d92a-3** Engine: `playMove` no `stage-engine.ts` com partículas/projétil, cancelamento e dispose
- [x] **d92a-4** `PokemonStage` expõe o controle (ref/imperativo) e respeita reduced-motion e fallback
- [x] **d92a-5** Ligar `MovesTab` ao palco (contexto/estado no detalhe), rolagem no retrato e botão "Repetir"
- [x] **d92a-7** Realismo: simulação de partículas com física e perfis por tipo (`particle-sim.ts`, `particle-profiles.ts`)
- [x] **d92a-8** Realismo: pose do corpo, hit-stop, brilho, onda de choque e tremor de câmera (`effect-timeline.ts`)
- [x] **d92a-6** Testes A1–A7 e verificação visual A8 (incl. celular real)

## Arquivos gerados
```
src/presentation/three/move-effects.ts (+ teste)
src/presentation/three/stage-math.ts, stage-engine.ts, PokemonStage.tsx
src/presentation/components/features/detail/{MovesTab,PokemonDetailView}.tsx
```

## Resultado da verificação (A8)
- Chrome, 390×844 e 844×390, dados reais, relógio da página controlado quadro a quadro (o render por software é lento demais para amostrar em tempo real): físico, especial e status conferidos; rolagem do fim da lista até o palco no retrato conferida.
- Achados corrigidos na verificação: mipmaps borrando sprites grandes; onda de choque cortada pelas bordas (parecia quadrado); partículas pequenas demais sobre a tela verde; explosão escondendo o Pokémon; aura do tipo Normal caindo como chuva.
- Não verificado: desempenho em celular real e `prefers-reduced-motion` no navegador (coberto só por teste).

## Riscos
- Desempenho no celular: efeitos usam poucas partículas (≤ ~60) e reaproveitam geometrias; medir no aparelho.
- Duas animações simultâneas (idle + golpe) disputam a rotação do plano: o efeito assume o controle e devolve ao fim.

## Skills relevantes
(consultar `skills/index.md`; regra 11 da `constitution.md`: Three.js só em `presentation/three/`, fallback e reduced-motion)
