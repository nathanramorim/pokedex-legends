# Discovery c4e9 — Pokédex redesign (visão de produto)

## Porquê
O protótipo HTML funciona e já consome a PokéAPI, mas é um arquivo único de ~2.100 linhas, centrado em um "card" colecionável. O novo conceito troca o card por uma Pokédex de consulta, legível no celular, componentizada e fácil de evoluir.

## Para quem
Treinador/fã que consulta no celular, em retrato ou deitado (landscape), para saber rápido o que um Pokémon é, contra o que é forte ou fraco e como capturá-lo.

## Escopo (o que o usuário pediu)
1. Mobile-first; **landscape** tem melhor aproveitamento (palco 3D ao lado e informações ao lado), **retrato** também suportado.
2. **Lista** com todos os Pokémon (~1.000+), busca e **filtros amigáveis com ícones** (tipo, geração).
3. **Detalhe** por Pokémon, informações **em abas** legíveis. Sem card.
4. Conteúdo do detalhe: habilidades, evoluções, efetivo contra, vulnerável contra, mega evolução, itens e **dica de qual Pokébola usar**.
5. Visual idêntico ao de uma Pokédex física (paleta em `stack.md`).
6. **Three.js** anima o Pokémon (artwork 2D em cena 3D) e responde à interação do usuário.
7. Mesma API: PokéAPI v2.

## Fora de escopo
Card colecionável e editor de carta, galeria de ícones do protótipo, modelos 3D reais, contas/login, persistência própria.

## Abas do detalhe (proposta)
| Aba | Conteúdo |
|-----|----------|
| Sobre | Número, nome, tipos, altura, peso, descrição, status base |
| Habilidades | Habilidades normais e oculta, com descrição |
| Evoluções | Cadeia completa com condição de evolução |
| Combate | Efetivo contra / vulnerável contra (multiplicadores por tipo) |
| Mega | Formas Mega (quando existirem) |
| Itens | Itens que o Pokémon pode carregar na natureza |
| Captura | Pokébola recomendada + motivo + taxa de captura |

## Regra de produto: dica de Pokébola
A PokéAPI não fornece essa informação; ela é **derivada por regras** a partir de `capture_rate`, `habitat`, tipos, cor e flags lendário/místico. Sempre exibe o motivo da recomendação. É uma dica, não uma verdade do jogo.

## Decisões deste discovery
| Questão | Resolução |
|---------|-----------|
| Dica de Pokébola | Heurística sobre dados da API |
| Three.js | Sprite/artwork 2D em cena 3D (parallax, flutuação, giro por arrasto/toque) |
| Lista completa | Todos os nomes/IDs de uma vez + lista virtualizada; detalhes sob demanda |

## Riscos de produto
- Filtro por tipo precisa de dados extras por Pokémon (ver critérios).
- Heurística de Pokébola pode discordar de guias de jogo; mitigar mostrando o motivo.
