# Pokédex Legends

> Uma Pokédex feita à mão, com carinho, para o meu enteado achar rapidinho o Pokémon que está procurando no **Pokémon Legends**. 💛

**👉 Experimente agora: [pokedex-legends.vercel.app](https://pokedex-legends.vercel.app)**

Ela foi pensada para o **celular** (em pé ou deitado), com letras grandes, abas separadas e tudo à mão, do jeito que dá para consultar com uma mão só enquanto a outra segura o controle.

---

## O que ela faz

### 🔎 Achar o Pokémon
- Lista com **todos os 1025 Pokémon**
- **Busca** por nome ou número
- **Filtros com ícones** por tipo (fogo, água, planta...) e por geração (Kanto, Johto, Hoenn...)
- Dá para combinar filtros, por exemplo "Fogo + Voador" da região de Kanto

### 📖 Tudo sobre cada Pokémon, em abas
| Aba | O que mostra |
|-----|--------------|
| **Sobre** | Descrição, altura, peso e status base |
| **Habilidades** | Cada habilidade (inclusive a oculta) e o que ela faz |
| **Golpes** | Os golpes que aprende por nível, com tipo, categoria, poder, precisão e PP. Toque num golpe para ver o que ele faz **e assistir a animação** |
| **Evoluções** | A linha de evolução completa, com a condição de cada uma |
| **Combate** | Contra quem é forte, contra quem é fraco (com os multiplicadores 2× e 4×), o que resiste e a que é imune |
| **Mega** | As Mega Evoluções, quando existem |
| **Itens** | Itens que o Pokémon pode estar carregando |
| **Captura** | A **Pokébola recomendada** para capturar, com o motivo, mais a taxa de captura |

### ✨ Pokémon que se mexe
O Pokémon aparece num palco 3D: dá para **girar com o dedo** e **tocar** para ele reagir. Ao escolher um golpe, ele executa o ataque: uma investida, um projétil ou uma aura, cada tipo com o seu efeito (o fogo sobe, a água cai, a pedra quica, o raio estala...).

---

## 📲 Instalar no celular

Dá para ter a Pokédex como um app, com ícone na tela inicial e em tela cheia. Abra [pokedex-legends.vercel.app](https://pokedex-legends.vercel.app) e:

- **Android (Chrome):** toque em **Instalar app** quando o aviso aparecer (ou em ⋮ → *Instalar app*).
- **iPhone/iPad (Safari):** toque em **Compartilhar** (o quadradinho com a seta) → **Adicionar à Tela de Início**. No iPhone precisa ser pelo Safari.

Depois de instalada, ela **abre mesmo sem internet**: os Pokémon que você já abriu ficam guardados no aparelho. Um Pokémon que você nunca abriu precisa de internet na primeira vez.

---

## Um aviso sincero

- Os dados vêm da [PokéAPI](https://pokeapi.co), que cobre **todos os jogos da série**. Então a Pokédex é geral e **não é específica do Legends**: um golpe ou habilidade pode ser diferente no jogo.
- A **dica de Pokébola** é uma sugestão minha, calculada a partir da taxa de captura, do habitat, do tipo e de o Pokémon ser lendário. Ajuda bastante, mas **não é uma regra oficial do jogo**.
- Os textos de descrição dos Pokémon e dos golpes vêm **em inglês** (a API quase não tem tradução). O resto da tela é em português.

---

## Quer rodar no seu computador?

Precisa do [Node.js](https://nodejs.org) instalado.

```bash
git clone https://github.com/nathanramorim/pokedex-legends.git
cd pokedex-legends
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:3000`).

**Para ver no celular:** deixe o celular no mesmo Wi-Fi e abra `http://<IP-do-seu-computador>:<porta>`.

Outros comandos úteis:

| Comando | Para quê |
|---------|----------|
| `npm run build` | Gera a versão de produção |
| `npm start` | Roda a versão de produção |
| `npm test` | Roda os testes |
| `npm run lint` | Confere o código |

---

## Como é feita (para quem tem curiosidade)

- **[Next.js](https://nextjs.org)** + **TypeScript**
- **[Three.js](https://threejs.org)** para o palco 3D e as animações dos golpes
- **[PokéAPI](https://pokeapi.co)** como fonte dos dados
- **Clean Architecture**, com o código separado em camadas:

```
src/
  domain/          regras e tipos (o que é um Pokémon, uma Pokébola...)
  application/     casos de uso (listar, filtrar, calcular fraquezas)
  infrastructure/  conversa com a PokéAPI
  presentation/    telas, componentes e o palco 3D
  main/            liga tudo
```

- Componentes reaproveitados, visual com as cores de uma Pokédex de verdade e acessibilidade (navegação por teclado, contraste, respeito a "reduzir movimento")
- O protótipo antigo, em HTML puro, está guardado em `legacy/`

---

## Créditos e avisos

- Dados e imagens: [PokéAPI](https://pokeapi.co) e [PokeAPI/sprites](https://github.com/PokeAPI/sprites)
- Pokémon e todos os nomes relacionados são marcas de **Nintendo, Game Freak e The Pokémon Company**. Este é um projeto de fã, **sem fins lucrativos** e sem ligação com elas.

Feito com 💛 para quem gosta de caçar Pokémon.
