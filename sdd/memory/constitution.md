# Constituição — pokemon-data

## Missão
Pokédex web mobile-first, em Next.js, que lista Pokémon e exibe os dados de cada um em abas legíveis, com visual fiel a uma Pokédex clássica (vermelha, lente azul, tela verde-acinzentada).

## Stack
| Camada | Escolha | Motivo |
|--------|---------|--------|
| Runtime | Node.js + Next.js (App Router) + TypeScript | Pedido do usuário; SSR/ISR para cache da PokéAPI |
| UI | React + CSS Modules/Tailwind (decidir na feat-00) | Componentização reaproveitável |
| Dados | PokéAPI (REST, somente leitura) | Já usada no protótipo HTML |
| Animação 3D | Three.js | Animações dos Pokémon e interatividade do usuário (rotação, toque, arrasto) |
| DB | none | Sem persistência própria |
| Config | `src/main/config/env.ts` | Config centralizado |
| Secrets | `.env.local` | Nenhum secret previsto hoje |

## Decisões resolvidas
| Decisão | Resolução |
|---------|-----------|
| Framework | Next.js |
| Arquitetura | Clean Architecture (domain / application / infrastructure / presentation) |
| Abordagem de UI | Mobile-first; breakpoints crescem a partir de 360px |
| Detalhe do Pokémon | Informações separadas por abas |
| Paleta | Fiel a uma Pokédex física (tokens em `design tokens`, nunca hex solto em componente) |
| Three.js | Obrigatório para animar os Pokémon e para a interatividade do usuário; roda só no cliente (import dinâmico, sem SSR), isolado em `presentation/three/` |
| Origem do redesign | Reformulação do protótipo `index.html`/`app.js`/`styles.css` (mantido como referência até a migração terminar) |

## Ferramentas e Integrações
| Campo | Valor |
|-------|-------|
| VCS / Work Item System | github |

Consulte `sdd/memory/mcps.md` para o status real de cada MCP configurado (`ativo`/`indisponível`) antes de assumir que ele responde. Se "VCS / Work Item System" for `azure-devops`, use `az repos pr create` (ou instrução equivalente documentada) em vez de `gh pr create`. Se `nenhum`, deixe a branch pronta e informe o usuário, sem tentar nenhum comando de VCS.

Obs.: a pasta ainda não é um repositório git; rodar `git init` e conectar o remoto GitHub antes da primeira branch.

## Regras (máx. 10)
1. Sem commits diretos em main
2. Branch por feature
3. Config centralizado em `src/main/config/env.ts`
4. Secrets em .env (nunca commit)
5. Antes de usar lib externa, consultar context7 com versão exata — desde que `sdd/memory/mcps.md` o liste como `ativo`; se `indisponível`, usar a documentação oficial da lib
6. Toda feature tem critério executável
7. Feature quebrada em subpasta (`sdd/features/<prefixo>-ID-<nome>/`) usa uma única branch agrupando todas as subtarefas — nunca uma branch por subtarefa. Antes de criar a branch, pergunte a branch de partida (default `main`) e verifique (`git branch --list <prefixo>/ID-*`) se já existe uma branch da mesma feature/fix a retomar.
8. Idioma do chat: PT-BR. Idioma de commits e PRs (título e descrição): PT-BR.
9. Nível de Linguagem: padrão
10. Dependência da Clean Architecture aponta só para dentro: `presentation → application → domain`; `infrastructure` implementa portas do `domain`. `domain` não importa React, Next nem fetch. Componentes de UI não chamam a PokéAPI direto e são reutilizados (nada de markup duplicado entre telas).
11. Three.js só em `presentation/three/`, nunca em `domain`/`application`. Cena 3D deve ter fallback estático (imagem) e respeitar `prefers-reduced-motion`; liberar recursos (geometrias, texturas, renderer) ao desmontar o componente.
