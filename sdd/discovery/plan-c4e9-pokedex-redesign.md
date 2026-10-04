# Plano c4e9 — Pokédex redesign (roadmap preliminar)

Quebra sugerida para `/split-features`, em `sdd/features/feat-c4e9-pokedex-redesign/`, **uma única branch** (regra 7).

| # | Tarefa | Depende de | Tamanho |
|---|--------|-----------|---------|
| 1 | Fundação: `git init`, Next.js + TS, estrutura de camadas, lint de dependência, tokens da paleta, testes | — | M |
| 2 | Domínio e infra: entidades, `PokemonRepository`, `PokeApiPokemonRepository`, mappers, cache | 1 | M |
| 3 | Shell Pokédex e componentes de UI base (moldura, Tabs, Badge de tipo, StatBar), layout retrato/landscape | 1 | M |
| 4 | Lista completa virtualizada, busca e filtros com ícones (tipo, geração) | 2, 3 | G |
| 5 | Detalhe: abas Sobre, Habilidades, Itens | 2, 3 | M |
| 6 | Detalhe: Evoluções e Mega | 2, 3 | M |
| 7 | Detalhe: Combate (efetivo/vulnerável, tipo duplo) | 2, 3 | M |
| 8 | Captura: regra de domínio da Pokébola + aba | 2, 3 | M |
| 9 | Three.js: palco do Pokémon, animação, interação, fallback | 3, 5 | G |
| 10 | Acabamento: acessibilidade, estados de erro/vazio, desempenho, remover/arquivar protótipo | todas | M |

Ordem: 1 → 2 → 3 → (4, 5, 6, 7, 8 em paralelo possível) → 9 → 10.

## Decisões em aberto antes de implementar
- D1 CSS Modules ou Tailwind; D5 hospedagem; D7 orçamento de desempenho e interações extras (giroscópio).
- Validar visualmente a paleta (hex iniciais em `stack.md`).
- Bloqueio: a pasta ainda não é repositório git.
