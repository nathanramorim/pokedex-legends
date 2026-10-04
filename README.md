# Pokédex Legends

Pokédex mobile-first feita com Next.js, Three.js e dados da [PokéAPI](https://pokeapi.co).

- Lista com todos os Pokémon, busca e filtros por tipo e geração
- Detalhe em abas: sobre, habilidades, golpes, evoluções, combate, Mega, itens e captura
- Palco 3D interativo (Three.js) e layout para retrato e landscape
- Clean Architecture (`domain`, `application`, `infrastructure`, `presentation`, `main`)

## Rodando

```bash
npm install
npm run dev     # desenvolvimento
npm run build && npm start -- -p 3111
npm run lint && npm test
```

O protótipo HTML original está arquivado em `legacy/`.
