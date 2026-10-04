# Módulos — pokemon-data

## domain
**Responsabilidade:** regras e tipos puros, sem framework.
- [ ] Entidades Pokemon, Stat, Move, Type, Ability
- [ ] Porta `PokemonRepository`

## application
**Responsabilidade:** casos de uso.
- [ ] ListPokemon (paginado), SearchPokemon, GetPokemonDetail

## infrastructure
**Responsabilidade:** acesso à PokéAPI.
- [ ] `PokeApiPokemonRepository` + mappers DTO → entidade
- [ ] Cache (fetch do Next/ISR)

## presentation
**Responsabilidade:** UI reutilizável, mobile-first.
- [ ] `ui/`: Button, Badge de tipo, Tabs acessíveis, StatBar, Screen (moldura de tela da Pokédex)
- [ ] `features/`: DexShell, PokemonCard, PokemonList, abas Sobre / Status / Evoluções / Golpes / Tipos
- [ ] Tokens de cor da Pokédex
- [ ] `three/`: PokemonStage (cena Three.js client-only), animação de entrada/idle, interação (arrastar/girar, toque), fallback estático, cleanup ao desmontar

## main
**Responsabilidade:** composição de dependências e `env.ts`.
- [ ] Injetar repositório nos casos de uso
