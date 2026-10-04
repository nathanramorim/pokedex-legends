# Stack — pokemon-data

## Dependências

| Camada | Escolha | Versão | Motivo |
|--------|---------|--------|--------|
| Runtime | Node.js | LTS (fixar na feat-00) | Exigido pelo Next.js |
| Framework | Next.js (App Router) | fixar via context7 na feat-00 | Pedido do usuário |
| Linguagem | TypeScript | fixar na feat-00 | Tipos nas portas/entidades da Clean Architecture |
| UI | React | a que o Next exigir | Componentização |
| Estilo | CSS Modules ou Tailwind | decidir (D1) | Tokens de cor da Pokédex |
| 3D / animação | Three.js (com ou sem @react-three/fiber, ver D6) | fixar via context7 na feat-00 | Animar Pokémon e interação do usuário; protótipo já usa Three.js |
| Dados | PokéAPI v2 | — | Já integrada no protótipo |
| Testes | Vitest + Testing Library | fixar na feat-00 | Critérios executáveis |
| DB | none | — | Sem persistência |

## Paleta Pokédex (tokens iniciais, validar visualmente na feat de design)
| Token | Valor | Uso |
|-------|-------|-----|
| `--dex-red` | `#DC0A2D` | Carcaça principal |
| `--dex-red-dark` | `#9E0620` | Sombras/dobradiça |
| `--dex-lens-blue` | `#28AAFD` | Lente / luz de destaque |
| `--dex-screen` | `#98CB98` | Fundo da tela (verde-acinzentado) |
| `--dex-ink` | `#222224` | Texto e bordas |
| `--dex-white` | `#FFFFFF` | Painéis, botões |
| `--dex-yellow` / `--dex-green` | `#FFCB05` / `#2DBE60` | Luzes indicadoras |
Cores por tipo (fogo, água...) ficam em tokens separados.

## Layout do projeto
```
src/
  domain/            # entidades (Pokemon, Stat, Move, Type), portas (PokemonRepository)
  application/       # casos de uso (ListPokemon, GetPokemonDetail, SearchPokemon)
  infrastructure/    # PokeApiPokemonRepository, mappers DTO → entidade
  presentation/
    components/      # ui/ (Button, Badge, Tabs, StatBar) e features/ (PokemonCard, DexShell)
    three/           # cena, loader de sprite/modelo, controles, fallback (client-only)
    hooks/
    styles/          # tokens
  main/              # composição (injeção de dependências, env.ts)
app/                 # rotas Next: / (lista), /pokemon/[id] (abas)
legacy/              # protótipo HTML (index.html, app.js, styles.css) após migração
```
