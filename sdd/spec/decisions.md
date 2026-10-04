# Decisões — pokemon-data

## Resolvidas

| # | Decisão | Resolução | Motivo |
|---|---------|-----------|--------|
| R1 | Framework | Next.js (App Router) + TypeScript | Pedido do usuário |
| R2 | Arquitetura | Clean Architecture | Pedido do usuário |
| R3 | UI | Mobile-first, componentes reaproveitados, dados por abas | Pedido do usuário |
| R4 | Visual | Cores fiéis a uma Pokédex física | Pedido do usuário |
| R5 | Fonte de dados | PokéAPI, já usada no protótipo | Pedido do usuário |
| R6 | Animação e interatividade | Three.js, client-only, isolado em `presentation/three/` | Pedido do usuário |
| R7 | Dica de Pokébola | Heurística de domínio sobre dados da API, com motivo (discovery c4e9) | Usuário |
| R8 | Three.js | Artwork 2D em cena 3D, sem modelos 3D reais (resolve D6) | Usuário |
| R9 | Lista | Todos os Pokémon, lista virtualizada, detalhes sob demanda | Usuário |
| R10 | Card colecionável | Removido do novo conceito | Usuário |
| R11 | Estilo (D1) | CSS Modules + tokens em CSS variables, sem dependência extra | Simples, tokens únicos |
| R12 | Three.js (D6/D7) | Three.js puro; arrastar/girar, toque reage, setas/Enter; sem giroscópio | Leve em celular |
| R13 | Lista | Virtualização própria (`useVirtualGrid`), sem lib | Menos dependências |

## Abertas

| # | Questão |
|---|---------|
| D2 | [x] Resolvida: 7 abas (Sobre, Habilidades, Evoluções, Combate, Mega, Itens, Captura) |
| D3 | [x] Resolvida: card, editor e galeria descartados; protótipo arquivado em `legacy/` |
| D4 | [x] Resolvida: todas as 1025 espécies; busca, tipo e geração |
| D5 | [ ] Hospedagem (Vercel?) |
