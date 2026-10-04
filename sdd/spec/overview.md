# Overview — pokemon-data

Pokédex web mobile-first em Next.js, reformulando um protótipo HTML já conectado à PokéAPI. Lista Pokémon e mostra os dados em abas legíveis, com visual fiel a uma Pokédex física. Estrutura em Clean Architecture e UI componentizada.

## Índice
- `stack.md` — tecnologias
- `modules.md` — componentes
- `flows.md` — fluxos principais
- `decisions.md` — decisões de design

---

## Arquitetura (C4 Model)

### Nível 1: Contexto
```mermaid
graph TB
  User((Treinador<br/>no celular)) --> Dex[Pokédex Web]
  Dex --> Api[PokéAPI<br/>pokeapi.co]
```

### Nível 2: Containers
```mermaid
graph LR
  Browser[Navegador<br/>mobile-first] --> Next[Next.js App<br/>rotas + UI React]
  Next --> Api[(PokéAPI REST)]
```

### Nível 3: Componentes (camadas)
```mermaid
graph LR
  Pres[presentation<br/>componentes, hooks] --> App[application<br/>casos de uso]
  App --> Dom[domain<br/>entidades + portas]
  Infra[infrastructure<br/>PokeApiRepository] --> Dom
  Main[main<br/>composição] --> Pres
  Main --> Infra
```
