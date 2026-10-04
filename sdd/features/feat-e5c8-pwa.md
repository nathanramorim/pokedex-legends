# feat-e5c8 — PWA instalável no Android e iOS

**Branch:** `feat/pwa` (criada a partir de `feat/animacao-golpe-3d`; PRs #1 e #2 ainda não mergeados)
**Origem:** `/nova-feature` — "transformar em pwa para instalar no Android e iOS"
**Depende de:** app publicado em HTTPS (Vercel: `pokedex-legends.vercel.app`); iOS e service worker exigem HTTPS (localhost vale para testes)
**Status:** `done`

## Decisões do clarify
| Questão | Resolução |
|---------|-----------|
| Branch de partida | `feat/animacao-golpe-3d` |
| Offline | Instalável + abre offline: tela amigável sem internet e cache do que o usuário já viu (lista, Pokémon visitados, imagens). Sem pré-carregar tudo |
| Ícone | Gerado a partir da Pokébola do favicon (`app/icon.svg`), fundo vermelho Pokédex, com versão maskable (Android) |

## Objetivo
Permitir instalar a Pokédex na tela inicial do Android e do iOS, abrir em tela cheia como um app e continuar abrindo sem internet (com o que já foi visto).

## Comportamento
- **Manifesto** (`app/manifest.ts`): `name` "Pokédex Legends", `short_name` "Pokédex", `display: standalone`, `orientation: any` (landscape é suportado), `theme_color` vermelho Pokédex, `background_color`, `lang: pt-BR`, `start_url: /`, `id`, ícones 192/512 (`any`) e 512 (`maskable`).
- **iOS:** `apple-touch-icon` 180×180 PNG, `appleWebApp` (capable, título, barra de status), `viewport-fit=cover` e margens seguras (`env(safe-area-inset-*)`) no cabeçalho/rodapé para não ficar sob o notch.
- **Service worker** (`public/sw.js`, escrito à mão, sem dependência nova), registrado só em produção:
  - Navegação: rede primeiro; sem rede cai para a página em cache e, na falta, para `/offline`.
  - `/_next/static/*`: cache primeiro (arquivos com hash, imutáveis).
  - PokéAPI (JSON) e imagens (`raw.githubusercontent.com`): "stale-while-revalidate", só respostas OK, com limite de entradas (descarta as mais antigas).
  - Imagens são re-buscadas com `mode: cors` (o CDN permite) para evitar respostas opacas, que inflam a cota de armazenamento.
  - Só `GET`; versão no nome do cache e limpeza de versões antigas na ativação.
- **Página `/offline`** estática, pré-cacheada, no visual da Pokédex, com botão "Tentar de novo".
- **Instalação:** Android/Chrome mostra botão "Instalar app" (evento `beforeinstallprompt`); iOS/Safari (sem esse evento) mostra uma dica "Compartilhar → Adicionar à Tela de Início". Aviso dispensável (lembra a escolha) e escondido quando já está instalado (`display-mode: standalone`).
- **Atualização:** nova versão do service worker ativa sozinha na próxima abertura; aviso "Nova versão disponível — Atualizar" quando houver uma esperando.
- Cabeçalhos: `/sw.js` e `/manifest.webmanifest` sem cache longo (`no-cache`); `Service-Worker-Allowed: /`.

## Critério de conclusão
```bash
npm run lint && npm test && npm run build
```
| # | Critério | Verificação |
|---|----------|-------------|
| P1 | Manifesto válido: campos obrigatórios, `display: standalone`, ícones 192/512 e maskable apontando para arquivos existentes | Teste do manifesto |
| P2 | Os PNGs têm exatamente 192×192, 512×512, 512×512 (maskable) e 180×180 | Teste lendo o cabeçalho PNG |
| P3 | `<head>` traz `apple-touch-icon`, `apple-mobile-web-app-capable`, `theme-color` e `viewport-fit=cover` | Teste do layout/metadata |
| P4 | Roteamento do service worker: navegação rede→cache→`/offline`; estáticos cache-first; API e imagens stale-while-revalidate; não-GET e erros nunca vão para o cache | Teste do `sw.js` com ambiente simulado |
| P5 | Limite de entradas: ao passar do teto, as mais antigas saem; caches de versões antigas são apagados na ativação | Teste do `sw.js` |
| P6 | Registro só em produção e sem erro quando o navegador não suporta service worker | Teste de componente |
| P7 | Android: `beforeinstallprompt` mostra o botão e instala; iOS Safari: mostra a dica; instalado (standalone): não mostra nada; dispensar lembra a escolha | Teste de componente |
| P8 | `/offline` renderiza e o botão tenta recarregar | Teste de componente |
| P9 | Chrome considera instalável (sem erros de instalabilidade) no build de produção | Verificação via DevTools (`Page.getInstallabilityErrors`) |
| P10 | Com a rede cortada, o app instalado abre: lista e Pokémon já visitados carregam; um não visitado mostra a tela offline | Verificação no navegador (rede offline) |
| P11 | Instalar e abrir em Android e iOS reais, em retrato e landscape, sem faixa sob o notch | Teste manual no aparelho (após deploy) |

## Tarefas
- [x] **e5c8-1** Gerar ícones PNG (192, 512, maskable 512, 180) a partir de `app/icon.svg` com script reproduzível em `scripts/` e arquivos em `public/icons/`
- [x] **e5c8-2** Manifesto em `app/manifest.ts` e metadata iOS/tema/viewport no layout; margens seguras no `DexShell`
- [x] **e5c8-3** Service worker `public/sw.js` com as estratégias, limites e versionamento
- [x] **e5c8-4** Página `/offline` e pré-cache dela
- [x] **e5c8-5** `ServiceWorkerRegister` (só produção) e aviso de nova versão
- [x] **e5c8-6** `InstallPrompt` (Android e dica iOS), com lembrança da dispensa
- [x] **e5c8-7** Cabeçalhos do `sw.js` e do manifesto em `next.config.ts`
- [x] **e5c8-8** Testes P1–P8, verificação P9–P10 e lista de checagem manual P11

## Arquivos gerados
```
app/manifest.ts, app/offline/page.tsx, app/layout.tsx
public/sw.js, public/icons/*.png
scripts/generate-icons.mjs
src/presentation/pwa/{ServiceWorkerRegister,InstallPrompt}.tsx
next.config.ts
```

## Resultado da verificação
- **P9:** Chrome (DevTools) sem erros de manifesto e sem erros de instalabilidade no build de produção.
- **P10:** com o servidor desligado de verdade, páginas já visitadas (lista, Charizard, Eevee) abrem completas e uma não visitada mostra `/offline`. A emulação de rede do DevTools não vale aqui: ela não atinge as requisições do service worker.
- **P11 pendente:** instalar em Android e iPhone reais (precisa do deploy em HTTPS).
- Achados na verificação: o primeiro carregamento não passava pelo service worker (corrigido com `CACHE_PAGE`); contraste do texto da tela offline (painel branco).

## Riscos
- **iOS é mais limitado:** sem `beforeinstallprompt`, sem splash automática (ícone e cor de fundo cobrem o essencial), e o Safari pode limpar o cache de sites pouco usados.
- **Cache velho:** HTML dinâmico em cache pode mostrar dados antigos; por isso navegação é rede primeiro.
- **Cota de armazenamento:** imagens sem limite encheriam o cache; há teto de entradas.
- **Dependência de ferramenta de imagem:** gerar PNG exige uma lib (ex.: `sharp`) só em desenvolvimento; os PNGs ficam commitados.

## Skills relevantes
(consultar `skills/index.md`; regras 10 e 11 da `constitution.md`)
