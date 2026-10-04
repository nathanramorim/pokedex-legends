/* ========================================================
   POKÉMON LEGENDS Z-A — HUD INTERACTIVE ENGINE & POKÉAPI V2
   ======================================================== */

// Global App State
const state = {
  view: 'pokedex', // 'pokedex' | 'detail'
  currentPokeId: 6, // Active Pokémon in detail view (Charizard by default)
  searchQuery: '',
  activeType: 'all',
  activeGen: 'all',
  sortOrder: 'id-asc',
  pokemonList: [], // Master list of Pokémon summaries for the grid
  pokemonCache: new Map(), // Full details cache
  offset: 0,
  limit: 24,
  isLoading: false,
  mode: 'card', // 'card' | 'template'
  enableTilt: true,
  enableAudio: true,
  enableParticles: true,
  audioCtx: null,
  three: {
    scene: null,
    camera: null,
    renderer: null,
    particleSystem: null,
    particlesData: [],
    mouse: { x: 0, y: 0 },
    animId: null,
    currentPalette: null
  },
  cardData: {
    id: 'Nº 0006',
    name: 'Charizard',
    category: 'Pokémon Chamas',
    type1: 'fire',
    type2: 'flying',
    hp: 160,
    stats: {
      atk: { val: 104, max: 200 },
      def: { val: 98, max: 200 },
      spa: { val: 159, max: 200 },
      spd: { val: 115, max: 200 },
      spe: { val: 100, max: 200 }
    },
    ability: {
      name: 'Drought (Clima Seco)',
      desc: 'Ao entrar em campo, ativa o clima de sol, aumentando o poder dos golpes do tipo Fogo e reduzindo a força de golpes do tipo Água.'
    },
    nature: {
      name: 'Modesta (↑ At. Esp. / ↓ Ataque)',
      desc: 'Maximiza o dano especial, mantendo boa consistência.'
    },
    item: {
      name: 'Charizardite Y',
      desc: 'Permite a Mega Evolução e aumenta muito o Ataque Especial e o poder dos golpes do tipo Fogo.'
    },
    mega: {
      name: 'Mega Charizard Y',
      type1: 'fire',
      type2: 'flying',
      desc: 'Aumenta muito o Ataque Especial e o poder dos golpes do tipo Fogo, tornando o Charizard um dos Pokémon mais fortes e versáteis do jogo.'
    }
  }
};

// Type Translations & Gradients
const TYPE_META = {
  normal: { name: 'NORMAL', pt: 'Normal', bg: 'linear-gradient(135deg, #78909c, #455a64)', color: '#90a4ae' },
  fire: { name: 'FOGO', pt: 'Fogo', bg: 'linear-gradient(135deg, #ff5722, #c62828)', color: '#ff7043' },
  water: { name: 'ÁGUA', pt: 'Água', bg: 'linear-gradient(135deg, #2196f3, #0d47a1)', color: '#42a5f5' },
  grass: { name: 'PLANTA', pt: 'Planta', bg: 'linear-gradient(135deg, #4caf50, #1b5e20)', color: '#66bb6a' },
  electric: { name: 'ELÉTRICO', pt: 'Elétrico', bg: 'linear-gradient(135deg, #ffb300, #f57f17)', color: '#ffd54f' },
  ice: { name: 'GELO', pt: 'Gelo', bg: 'linear-gradient(135deg, #26c6da, #00838f)', color: '#4dd0e1' },
  fighting: { name: 'LUTADOR', pt: 'Lutador', bg: 'linear-gradient(135deg, #d84315, #870000)', color: '#ff5722' },
  poison: { name: 'VENENO', pt: 'Veneno', bg: 'linear-gradient(135deg, #8e24aa, #4a148c)', color: '#ab47bc' },
  ground: { name: 'TERRA', pt: 'Terra', bg: 'linear-gradient(135deg, #a1887f, #4e342e)', color: '#bcaaa4' },
  flying: { name: 'VOADOR', pt: 'Voador', bg: 'linear-gradient(135deg, #42a5f5, #1565c0)', color: '#64b5f6' },
  psychic: { name: 'PSÍQUICO', pt: 'Psíquico', bg: 'linear-gradient(135deg, #ec407a, #880e4f)', color: '#f06292' },
  bug: { name: 'INSETO', pt: 'Inseto', bg: 'linear-gradient(135deg, #7cb342, #33691e)', color: '#9ccc65' },
  rock: { name: 'ROCHA', pt: 'Rocha', bg: 'linear-gradient(135deg, #8d6e63, #3e2723)', color: '#a1887f' },
  ghost: { name: 'FANTASMA', pt: 'Fantasma', bg: 'linear-gradient(135deg, #5e35b1, #311b92)', color: '#7e57c2' },
  dragon: { name: 'DRAGÃO', pt: 'Dragão', bg: 'linear-gradient(135deg, #3949ab, #1a237e)', color: '#5c6bc0' },
  steel: { name: 'AÇO', pt: 'Aço', bg: 'linear-gradient(135deg, #78909c, #37474f)', color: '#90a4ae' },
  dark: { name: 'NOTURNO', pt: 'Noturno', bg: 'linear-gradient(135deg, #424242, #181818)', color: '#616161' },
  fairy: { name: 'FADA', pt: 'Fada', bg: 'linear-gradient(135deg, #f06292, #ad1457)', color: '#f48fb1' }
};

// Generation ID Ranges
const GEN_RANGES = {
  gen1: [1, 151],
  gen2: [152, 251],
  gen3: [252, 386],
  gen4: [387, 493],
  gen5: [494, 649],
  gen6: [650, 721],
  gen7: [722, 809],
  gen8: [810, 898],
  gen9: [899, 1025]
};

// Type Effectiveness Matrix (Damage taken by defending type)
const TYPE_CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

// Rich Seed Data Repository (Instant Offline Availability & Seed Baseline)
const POKEMON_SEEDS = [
  {
    id: 6,
    name: 'Charizard',
    category: 'Pokémon Chamas',
    types: ['fire', 'flying'],
    stats: { hp: 160, atk: 104, def: 98, spa: 159, spd: 115, spe: 100 },
    bst: 534,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    ability: 'Drought (Clima Seco)',
    abilityDesc: 'Ao entrar em campo, ativa o sol brilhante, aumentando o poder de golpes Fogo e enfraquecendo Água.',
    nature: 'Modesta (↑ At. Esp. / ↓ Ataque)',
    natureDesc: 'Maximiza o dano especial destrutivo, mantendo alta consistência ofensiva.',
    item: 'Charizardite Y',
    itemDesc: 'Permite a Mega Evolução Y, elevando os atributos especiais a patamares devastadores.',
    mega: {
      name: 'Mega Charizard Y',
      types: ['fire', 'flying'],
      desc: 'Concede poder colossal de Fogo sob sol permanente, incinerando defesas com facilidade extrema.'
    },
    moves: [
      { name: 'Flamethrower', type: 'fire', power: 90, acc: 100, desc: 'Chamas densas que causam dano consistente de alto impacto.' },
      { name: 'Air Slash', type: 'flying', power: 75, acc: 95, desc: 'Lâminas de ar pressurizado com boa chance de fazer o alvo recuar.' },
      { name: 'Solar Beam', type: 'grass', power: 120, acc: 100, desc: 'Feixe solar instantâneo no sol, neutralizando alvos de Água e Rocha.' },
      { name: 'Dragon Pulse', type: 'dragon', power: 85, acc: 100, desc: 'Onda dracônica devastadora com alcance neutro perfeito.' }
    ]
  },
  {
    id: 25,
    name: 'Pikachu',
    category: 'Pokémon Rato',
    types: ['electric'],
    stats: { hp: 110, atk: 95, def: 60, spa: 90, spd: 70, spe: 120 },
    bst: 320,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    ability: 'Lightning Rod (Para-Raios)',
    abilityDesc: 'Atrai todos os ataques Elétricos em campo, anulando o dano e aumentando seu Ataque Especial.',
    nature: 'Tímida (↑ Velocidade / ↓ Ataque)',
    natureDesc: 'Potencializa ao máximo a agilidade para golpear primeiro em todas as trocas.',
    item: 'Light Ball (Esfera Luminosa)',
    itemDesc: 'Dobra o Ataque e o Ataque Especial de Pikachu, tornando-o um atacante formidável.',
    mega: {
      name: 'Gigantamax Pikachu',
      types: ['electric'],
      desc: 'Armazena energia elétrica gigantesca em sua cauda, paralisando todos os oponentes.'
    },
    moves: [
      { name: 'Thunderbolt', type: 'electric', power: 90, acc: 100, desc: 'Descarga elétrica de alta voltagem com chance de paralisar o adversário.' },
      { name: 'Volt Tackle', type: 'electric', power: 120, acc: 100, desc: 'Investida elétrica lendária de poder extremo.' },
      { name: 'Iron Tail', type: 'steel', power: 100, acc: 75, desc: 'Golpeia com a cauda endurecida como aço para cobrir tipos Rocha e Fada.' },
      { name: 'Nasty Plot', type: 'dark', power: '--', acc: '--', desc: 'Estimula pensamentos astutos para dobrar bruscamente o Ataque Especial.' }
    ]
  },
  {
    id: 448,
    name: 'Lucario',
    category: 'Pokémon Aura',
    types: ['fighting', 'steel'],
    stats: { hp: 145, atk: 145, def: 88, spa: 140, spd: 70, spe: 112 },
    bst: 525,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
    ability: 'Adaptability (Adaptabilidade)',
    abilityDesc: 'Golpes do mesmo tipo do Pokémon têm seu bônus STAB aumentado para 2.0x em vez de 1.5x.',
    nature: 'Ingênua (↑ Velocidade / ↓ Def. Esp.)',
    natureDesc: 'Potencializa a velocidade de reação e mobilidade ofensiva híbrida.',
    item: 'Lucarionite',
    itemDesc: 'Ativa a Mega Evolução para canalizar as energias de Aura em golpes físicos e especiais letais.',
    mega: {
      name: 'Mega Lucario',
      types: ['fighting', 'steel'],
      desc: 'Canaliza sua aura guerreira com pulsos implacáveis que quebram qualquer defesa.'
    },
    moves: [
      { name: 'Close Combat', type: 'fighting', power: 120, acc: 100, desc: 'Luta corpo a corpo intensa que rompe qualquer barreira.' },
      { name: 'Flash Cannon', type: 'steel', power: 80, acc: 100, desc: 'Feixe de luz metálica que causa dano especial devastador.' },
      { name: 'Aura Sphere', type: 'fighting', power: 80, acc: 100, desc: 'Esfera pura de aura concentrada que nunca erra o alvo.' },
      { name: 'Extreme Speed', type: 'normal', power: 80, acc: 100, desc: 'Ataque de prioridade relâmpago que supera qualquer ação adversária.' }
    ]
  },
  {
    id: 94,
    name: 'Gengar',
    category: 'Pokémon Sombra',
    types: ['ghost', 'poison'],
    stats: { hp: 135, atk: 65, def: 80, spa: 170, spd: 95, spe: 130 },
    bst: 500,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    ability: 'Shadow Tag (Aprisionar)',
    abilityDesc: 'Impede terminantemente que os Pokémon oponentes troquem ou fujam do campo.',
    nature: 'Tímida (↑ Velocidade / ↓ Ataque)',
    natureDesc: 'Maximiza a velocidade para disparar golpes espectrais e hipnose com prioridade.',
    item: 'Gengarite',
    itemDesc: 'Permite a Mega Evolução em Mega Gengar, criando portais dimensionais sinistros.',
    mega: {
      name: 'Mega Gengar',
      types: ['ghost', 'poison'],
      desc: 'Mergulha no chão de outra dimensão, prendendo os adversários em uma armadilha sem fuga.'
    },
    moves: [
      { name: 'Shadow Ball', type: 'ghost', power: 80, acc: 100, desc: 'Esfera espectral condensada que pode reduzir a Defesa Especial do oponente.' },
      { name: 'Sludge Bomb', type: 'poison', power: 90, acc: 100, desc: 'Lança detritos tóxicos que frequentemente envenenam o alvo.' },
      { name: 'Focus Blast', type: 'fighting', power: 120, acc: 70, desc: 'Golpe de aura marcial potente para anular oponentes do tipo Noturno e Aço.' },
      { name: 'Destiny Bond', type: 'ghost', power: '--', acc: '--', desc: 'Se o usuário desmaiar pelo ataque adversário, o oponente é nocauteado junto.' }
    ]
  },
  {
    id: 150,
    name: 'Mewtwo',
    category: 'Pokémon Genético',
    types: ['psychic'],
    stats: { hp: 180, atk: 150, def: 90, spa: 194, spd: 120, spe: 140 },
    bst: 680,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    ability: 'Pressure (Pressão Cósmica)',
    abilityDesc: 'A presença intimidadora faz o adversário gastar o dobro de PP a cada investida.',
    nature: 'Modesta (↑ At. Esp. / ↓ Ataque)',
    natureDesc: 'Eleva o Ataque Especial ao ápice absoluto de poder destrutivo.',
    item: 'Mewtwonite Y',
    itemDesc: 'Desperta a Mega Evolução Y, ultrapassando os limites da mente e da matéria.',
    mega: {
      name: 'Mega Mewtwo Y',
      types: ['psychic'],
      desc: 'Concentração psíquica monumental capaz de manipular gravidade e tempo.'
    },
    moves: [
      { name: 'Psystrike', type: 'psychic', power: 100, acc: 100, desc: 'Onda psíquica colossal que calcula o dano contra a Defesa física do alvo.' },
      { name: 'Aura Sphere', type: 'fighting', power: 80, acc: 100, desc: 'Projeção pura de energia inerrável.' },
      { name: 'Ice Beam', type: 'ice', power: 90, acc: 100, desc: 'Raio congelante ideal para cobrir tipos Dragão, Voador e Terra.' },
      { name: 'Calm Mind', type: 'psychic', power: '--', acc: '--', desc: 'Acalma os pensamentos para elevar At. Especial e Def. Especial simultaneamente.' }
    ]
  },
  {
    id: 658,
    name: 'Greninja',
    category: 'Pokémon Ninja',
    types: ['water', 'dark'],
    stats: { hp: 144, atk: 110, def: 75, spa: 135, spd: 78, spe: 145 },
    bst: 530,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png',
    ability: 'Battle Bond (Vínculo de Batalha)',
    abilityDesc: 'Ao derrotar um oponente, transforma-se na forma Ash-Greninja, ampliando todos os atributos.',
    nature: 'Tímida (↑ Velocidade / ↓ Ataque)',
    natureDesc: 'Velocidade implacável para golpear das sombras como um verdadeiro shinobi.',
    item: 'Life Orb (Esfera Vital)',
    itemDesc: 'Sacrifica 10% do PS a cada ataque para impulsionar o dano de todos os golpes em 30%.',
    mega: {
      name: 'Ash-Greninja',
      types: ['water', 'dark'],
      desc: 'Forma sincronizada que arremessa shurikens d\'água gigantes de imenso poder cortante.'
    },
    moves: [
      { name: 'Water Shuriken', type: 'water', power: 20, acc: 100, desc: 'Shurikens aquáticas de prioridade que acertam de 2 a 5 vezes consecutivas.' },
      { name: 'Dark Pulse', type: 'dark', power: 80, acc: 100, desc: 'Ondas sombrias com chance de fazer o inimigo recuar.' },
      { name: 'Hydro Pump', type: 'water', power: 110, acc: 80, desc: 'Torrente de água em alta pressão para nocautes fulminantes.' },
      { name: 'Ice Beam', type: 'ice', power: 90, acc: 100, desc: 'Cobre fraquezas contra tipos Planta e Dragão com precisão.' }
    ]
  },
  {
    id: 9,
    name: 'Blastoise',
    category: 'Pokémon Marisco',
    types: ['water'],
    stats: { hp: 158, atk: 90, def: 135, spa: 135, spd: 120, spe: 80 },
    bst: 530,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    ability: 'Mega Launcher (Mega Disparador)',
    abilityDesc: 'Aumenta em 50% o poder de golpes baseados em pulsos e esferas de energia.',
    nature: 'Modesta (↑ At. Esp. / ↓ Ataque)',
    natureDesc: 'Amplifica o poder dos canhões de água e pulsos especiais.',
    item: 'Blastoisinite',
    itemDesc: 'Ativa a Mega Evolução com um canhão central maciço nas costas.',
    mega: {
      name: 'Mega Blastoise',
      types: ['water'],
      desc: 'Canhões hidráulicos de alcance continental com precisão milimétrica.'
    },
    moves: [
      { name: 'Hydro Pump', type: 'water', power: 110, acc: 80, desc: 'Rajada colunar de água pesada disparada por canhões.' },
      { name: 'Dark Pulse', type: 'dark', power: 80, acc: 100, desc: 'Pulso sombrio amplificado pelo Mega Launcher.' },
      { name: 'Aura Sphere', type: 'fighting', power: 80, acc: 100, desc: 'Esfera inerrável fortalecida pela habilidade especial.' },
      { name: 'Ice Beam', type: 'ice', power: 90, acc: 100, desc: 'Congelamento absoluto contra tipos Planta.' }
    ]
  },
  {
    id: 3,
    name: 'Venusaur',
    category: 'Pokémon Semente',
    types: ['grass', 'poison'],
    stats: { hp: 160, atk: 95, def: 115, spa: 130, spd: 125, spe: 85 },
    bst: 525,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
    ability: 'Thick Fat (Gordura Espessa)',
    abilityDesc: 'Reduz à metade o dano recebido de ataques do tipo Fogo e Gelo.',
    nature: 'Calma (↑ Def. Esp. / ↓ Ataque)',
    natureDesc: 'Torna Venusaur um pilar defensivo quase intransponível sob sol ou chuva.',
    item: 'Venusaurite',
    itemDesc: 'Permite a Mega Evolução com uma flor tropical gigante nas costas.',
    mega: {
      name: 'Mega Venusaur',
      types: ['grass', 'poison'],
      desc: 'Perfeita sinergia defensiva que anula suas maiores vulnerabilidades elementares.'
    },
    moves: [
      { name: 'Giga Drain', type: 'grass', power: 75, acc: 100, desc: 'Drena a energia vital do alvo restaurando metade do dano em PS.' },
      { name: 'Sludge Bomb', type: 'poison', power: 90, acc: 100, desc: 'Bomba ácida potente que neutraliza tipos Fada e Planta.' },
      { name: 'Earth Power', type: 'ground', power: 90, acc: 100, desc: 'Erupção subterrânea para surpreender oponentes de Aço e Fogo.' },
      { name: 'Synthesis', type: 'grass', power: '--', acc: '--', desc: 'Restaura até 66% da vida total do Pokémon através de fotossíntese.' }
    ]
  },
  {
    id: 384,
    name: 'Rayquaza',
    category: 'Pokémon Céu',
    types: ['dragon', 'flying'],
    stats: { hp: 180, atk: 180, def: 100, spa: 180, spd: 100, spe: 115 },
    bst: 680,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png',
    ability: 'Delta Stream (Corrente Delta)',
    abilityDesc: 'Cria ventos celestiais misteriosos que eliminam as fraquezas dos Pokémon Voadores.',
    nature: 'Firme (↑ Ataque / ↓ At. Esp.)',
    natureDesc: 'Foco total no poder físico devastador da investida Dragon Ascent.',
    item: 'Life Orb',
    itemDesc: 'Pode megaevoluir sem Mega Stone ao dominar o golpe Dragon Ascent.',
    mega: {
      name: 'Mega Rayquaza',
      types: ['dragon', 'flying'],
      desc: 'O ápice dos céus de Hoenn, dominador das camadas atmosféricas mais altas.'
    },
    moves: [
      { name: 'Dragon Ascent', type: 'flying', power: 120, acc: 100, desc: 'Mergulho celestial supersônico de poder formidável.' },
      { name: 'Dragon Dance', type: 'dragon', power: '--', acc: '--', desc: 'Dança ancestral que eleva o Ataque e a Velocidade simultaneamente.' },
      { name: 'Extreme Speed', type: 'normal', power: 80, acc: 100, desc: 'Golpeia antes de qualquer reação oponente.' },
      { name: 'Earthquake', type: 'ground', power: 100, acc: 100, desc: 'Terremoto catastrófico que atinge todos em terra.' }
    ]
  },
  {
    id: 445,
    name: 'Garchomp',
    category: 'Pokémon Mach',
    types: ['dragon', 'ground'],
    stats: { hp: 168, atk: 155, def: 105, spa: 90, spd: 95, spe: 120 },
    bst: 600,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png',
    ability: 'Rough Skin (Pele Áspera)',
    abilityDesc: 'Oponentes que tocarem em Garchomp sofrem dano reflexivo automático.',
    nature: 'Alegre (↑ Velocidade / ↓ At. Esp.)',
    natureDesc: 'Garante ultrapassar rivais de 100 de Velocidade base com facilidade.',
    item: 'Rocky Helmet (Capacete Dentado)',
    itemDesc: 'Combina com a Pele Áspera para punir severamente qualquer golpe físico.',
    mega: {
      name: 'Mega Garchomp',
      types: ['dragon', 'ground'],
      desc: 'Braços que se transformam em foices de diamante, cortando blindagens ao meio.'
    },
    moves: [
      { name: 'Earthquake', type: 'ground', power: 100, acc: 100, desc: 'Tremor sísmico destrutivo com bônus STAB.' },
      { name: 'Outrage', type: 'dragon', power: 120, acc: 100, desc: 'Fúria dracônica incontrolável por 2 a 3 turnos seguidos.' },
      { name: 'Swords Dance', type: 'normal', power: '--', acc: '--', desc: 'Dobra o poder ofensivo físico instantaneamente.' },
      { name: 'Stone Edge', type: 'rock', power: 100, acc: 80, desc: 'Lâminas de rocha com alta probabilidade de acerto crítico.' }
    ]
  },
  {
    id: 700,
    name: 'Sylveon',
    category: 'Pokémon Entrelaçado',
    types: ['fairy'],
    stats: { hp: 160, atk: 75, def: 75, spa: 125, spd: 140, spe: 70 },
    bst: 525,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/700.png',
    ability: 'Pixilate (Pele de Fada)',
    abilityDesc: 'Converte golpes do tipo Normal para Fada e aumenta seu poder em 20%.',
    nature: 'Modesta (↑ At. Esp. / ↓ Ataque)',
    natureDesc: 'Transforma o golpe Hyper Voice em uma muralha sonora devastadora.',
    item: 'Leftovers (Restos)',
    itemDesc: 'Recupera 1/16 do PS máximo ao final de cada turno de combate.',
    mega: {
      name: 'Sylveon Tera Stellar',
      types: ['fairy'],
      desc: 'Canaliza fitas de afeto radiante que neutralizam instintos agressivos.'
    },
    moves: [
      { name: 'Hyper Voice', type: 'normal', power: 90, acc: 100, desc: 'Voz hiperbólica convertida para o tipo Fada com dano massivo.' },
      { name: 'Mystical Fire', type: 'fire', power: 75, acc: 100, desc: 'Fogo místico que reduz o Ataque Especial do adversário.' },
      { name: 'Wish', type: 'normal', power: '--', acc: '--', desc: 'Faz um desejo que cura metade da vida total no turno seguinte.' },
      { name: 'Protect', type: 'normal', power: '--', acc: '--', desc: 'Cria um escudo impenetrável bloqueando ataques por um turno.' }
    ]
  },
  {
    id: 197,
    name: 'Umbreon',
    category: 'Pokémon Luz Lunar',
    types: ['dark'],
    stats: { hp: 165, atk: 75, def: 125, spa: 70, spd: 145, spe: 75 },
    bst: 525,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png',
    ability: 'Synchronize (Sincronia)',
    abilityDesc: 'Transmite qualquer efeito de Queimadura, Paralisia ou Veneno de volta ao agressor.',
    nature: 'Calma (↑ Def. Esp. / ↓ Ataque)',
    natureDesc: 'Maximiza a resistência especial tornando-o imune a quebras táticas.',
    item: 'Leftovers',
    itemDesc: 'Manutenção de vida passiva essencial para tanques defensivos de longo prazo.',
    mega: {
      name: 'Umbreon Noturno',
      types: ['dark'],
      desc: 'Seus anéis dourados brilham na penumbra absorvendo a energia lunar.'
    },
    moves: [
      { name: 'Foul Play', type: 'dark', power: 95, acc: 100, desc: 'Usa a própria força do adversário contra ele mesmo.' },
      { name: 'Moonlight', type: 'fairy', power: '--', acc: '--', desc: 'Cura PS usando a suave luz da lua.' },
      { name: 'Toxic', type: 'poison', power: '--', acc: 90, desc: 'Envenena gravemente o alvo aumentando o dano a cada turno.' },
      { name: 'Wish', type: 'normal', power: '--', acc: '--', desc: 'Concede cura sustentada para si ou para o companheiro que entrar.' }
    ]
  },
  {
    id: 282,
    name: 'Gardevoir',
    category: 'Pokémon Abraço',
    types: ['psychic', 'fairy'],
    stats: { hp: 148, atk: 75, def: 75, spa: 165, spd: 135, spe: 100 },
    bst: 518,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png',
    ability: 'Pixilate (Pele de Fada)',
    abilityDesc: 'Converte golpes do tipo Normal para Fada, elevando o poder de ataque.',
    nature: 'Tímida (↑ Velocidade / ↓ Ataque)',
    natureDesc: 'Velocidade máxima para disparar ataques psíquicos antes de ser atingida.',
    item: 'Gardevoirite',
    itemDesc: 'Desperta a Mega Evolução criando miniaturas de buracos negros de proteção.',
    mega: {
      name: 'Mega Gardevoir',
      types: ['psychic', 'fairy'],
      desc: 'Elegância transcendental capaz de distorcer o espaço para proteger seu treinador.'
    },
    moves: [
      { name: 'Hyper Voice', type: 'normal', power: 90, acc: 100, desc: 'Onda sonora mística convertida para tipo Fada com poder esmagador.' },
      { name: 'Psyshock', type: 'psychic', power: 80, acc: 100, desc: 'Materializa ondas psíquicas que atingem a Defesa física.' },
      { name: 'Focus Blast', type: 'fighting', power: 120, acc: 70, desc: 'Cobre fraquezas de Aço com força marcial intensa.' },
      { name: 'Calm Mind', type: 'psychic', power: '--', acc: '--', desc: 'Harmoniza a mente para elevar At. Esp. e Def. Esp.' }
    ]
  },
  {
    id: 212,
    name: 'Scizor',
    category: 'Pokémon Pinça',
    types: ['bug', 'steel'],
    stats: { hp: 150, atk: 160, def: 120, spa: 65, spd: 90, spe: 75 },
    bst: 500,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/212.png',
    ability: 'Technician (Técnico Perito)',
    abilityDesc: 'Fortalece em 50% todos os golpes que possuam poder base de 60 ou menor.',
    nature: 'Firme (↑ Ataque / ↓ At. Esp.)',
    natureDesc: 'Foco total no Bullet Punch prioritário com impacto letal.',
    item: 'Scizorite',
    itemDesc: 'Garante a Mega Evolução com blindagem de aço endurecido reforçado.',
    mega: {
      name: 'Mega Scizor',
      types: ['bug', 'steel'],
      desc: 'Pinças pesadas como guilhotinas industriais com apenas uma fraqueza a Fogo.'
    },
    moves: [
      { name: 'Bullet Punch', type: 'steel', power: 40, acc: 100, desc: 'Soco de aço prioritário impulsionado pelo Technician para 60 de poder.' },
      { name: 'U-turn', type: 'bug', power: 70, acc: 100, desc: 'Ataque veloz de retirada permitindo trocar de Pokémon após o golpe.' },
      { name: 'Swords Dance', type: 'normal', power: '--', acc: '--', desc: 'Eleva o Ataque em 2 estágios transformando Bullet Punch em nocaute certo.' },
      { name: 'Roost', type: 'flying', power: '--', acc: '--', desc: 'Pousa para recompor metade do PS e recuperar a energia corporal.' }
    ]
  },
  {
    id: 248,
    name: 'Tyranitar',
    category: 'Pokémon Armadura',
    types: ['rock', 'dark'],
    stats: { hp: 170, atk: 154, def: 130, spa: 105, spd: 110, spe: 71 },
    bst: 600,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png',
    ability: 'Sand Stream (Tempestade de Areia)',
    abilityDesc: 'Invoca uma tempestade de areia perpétua que eleva a Defesa Especial de Rocha em 50%.',
    nature: 'Firme (↑ Ataque / ↓ At. Esp.)',
    natureDesc: 'Poder físico destrutivo capaz de rachar montanhas inteiras.',
    item: 'Tyranitarite',
    itemDesc: 'Ativa a Mega Evolução com carapaça reforçada e fendas vulcânicas de energia.',
    mega: {
      name: 'Mega Tyranitar',
      types: ['rock', 'dark'],
      desc: 'O gigante indomável dos desertos, inabalável sob rajadas de areia cortante.'
    },
    moves: [
      { name: 'Stone Edge', type: 'rock', power: 100, acc: 80, desc: 'Arremesso de monólitos de rocha com altíssima taxa de crítico.' },
      { name: 'Crunch', type: 'dark', power: 80, acc: 100, desc: 'Mordida trituradora de mandíbula colossal que enfraquece a defesa.' },
      { name: 'Earthquake', type: 'ground', power: 100, acc: 100, desc: 'Racha o solo sob os pés dos inimigos terrestres.' },
      { name: 'Dragon Dance', type: 'dragon', power: '--', acc: '--', desc: 'Impulsiona velocidade e força física para um avanço irrefreável.' }
    ]
  },
  {
    id: 149,
    name: 'Dragonite',
    category: 'Pokémon Dragão',
    types: ['dragon', 'flying'],
    stats: { hp: 165, atk: 154, def: 105, spa: 110, spd: 110, spe: 90 },
    bst: 600,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
    ability: 'Multiscale (Multiescamas)',
    abilityDesc: 'Reduz à metade qualquer dano recebido enquanto os pontos de vida estiverem cheios.',
    nature: 'Firme (↑ Ataque / ↓ At. Esp.)',
    natureDesc: 'Aproveita a proteção do Multiscale para preparar Dragon Dance em segurança.',
    item: 'Weakness Policy (Seguro Fraqueza)',
    itemDesc: 'Se atingido por golpe superefetivo, dobra imediatamente o Ataque e o At. Especial.',
    mega: {
      name: 'Dragonite Gigantamax',
      types: ['dragon', 'flying'],
      desc: 'Circunda o globo em menos de dezesseis horas resgatando marinheiros em alto-mar.'
    },
    moves: [
      { name: 'Extreme Speed', type: 'normal', power: 80, acc: 100, desc: 'Ataque de prioridade pura sem tempo de reação para o adversário.' },
      { name: 'Outrage', type: 'dragon', power: 120, acc: 100, desc: 'Fúria dos dragões ancestrais com impacto cataclísmico.' },
      { name: 'Dragon Dance', type: 'dragon', power: '--', acc: '--', desc: 'Prepara o terreno com velocidade e dano aumentados.' },
      { name: 'Fire Punch', type: 'fire', power: 75, acc: 100, desc: 'Soco de chamas que incinera oponentes do tipo Aço como Scizor e Ferrothorn.' }
    ]
  },
  {
    id: 143,
    name: 'Snorlax',
    category: 'Pokémon Dorminhoco',
    types: ['normal'],
    stats: { hp: 200, atk: 120, def: 75, spa: 75, spd: 120, spe: 40 },
    bst: 540,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
    ability: 'Thick Fat (Gordura Espessa)',
    abilityDesc: 'Amortece golpes de Fogo e Gelo reduzindo o dano pela metade.',
    nature: 'Cautelosa (↑ Def. Esp. / ↓ At. Esp.)',
    natureDesc: 'Torna Snorlax uma esponja de golpes especiais praticamente inquebrável.',
    item: 'Leftovers',
    itemDesc: 'Combina perfeitamente com sua imensa barra de vida recuperando fatias generosas de PS.',
    mega: {
      name: 'Gigantamax Snorlax',
      types: ['normal'],
      desc: 'Um parque ecológico inteiro floresce sobre sua barriga colina.'
    },
    moves: [
      { name: 'Body Slam', type: 'normal', power: 85, acc: 100, desc: 'Queda de corpo inteiro pesada com alta probabilidade de paralisia.' },
      { name: 'Rest', type: 'psychic', power: '--', acc: '--', desc: 'Dorme por dois turnos restaurando 100% de sua vida e curando qualquer status.' },
      { name: 'Sleep Talk', type: 'normal', power: '--', acc: '--', desc: 'Executa aleatoriamente um golpe do repertório enquanto está dormindo.' },
      { name: 'Curse', type: 'ghost', power: '--', acc: '--', desc: 'Sacrifica velocidade para elevar o Ataque e a Defesa física.' }
    ]
  },
  {
    id: 130,
    name: 'Gyarados',
    category: 'Pokémon Atrocidade',
    types: ['water', 'flying'],
    stats: { hp: 165, atk: 145, def: 89, spa: 70, spd: 110, spe: 91 },
    bst: 540,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png',
    ability: 'Intimidate (Intimidação)',
    abilityDesc: 'Ao entrar em campo, diminui o Ataque dos Pokémon adversários com seu olhar feroz.',
    nature: 'Alegre (↑ Velocidade / ↓ At. Esp.)',
    natureDesc: 'Acelera seu movimento para ultrapassar adversários com Dragon Dance.',
    item: 'Gyaradosite',
    itemDesc: 'Ativa a Mega Evolução assumindo o tipo Água/Noturno com a habilidade Mold Breaker.',
    mega: {
      name: 'Mega Gyarados',
      types: ['water', 'dark'],
      desc: 'Fúria submarina capaz de navegar contra correntes extremas e despedaçar navios.'
    },
    moves: [
      { name: 'Waterfall', type: 'water', power: 80, acc: 100, desc: 'Avança com a força de uma cachoeira com chance de fazer o alvo recuar.' },
      { name: 'Dragon Dance', type: 'dragon', power: '--', acc: '--', desc: 'Dança marítima que amplia o Ataque e a Velocidade de forma consistente.' },
      { name: 'Crunch', type: 'dark', power: 80, acc: 100, desc: 'Mordida implacável com suporte do tipo Noturno na Mega Evolução.' },
      { name: 'Ice Fang', type: 'ice', power: 65, acc: 95, desc: 'Dentes congelantes para superar dragões e tipos Planta.' }
    ]
  },
  {
    id: 887,
    name: 'Dragapult',
    category: 'Pokémon Furtivo',
    types: ['dragon', 'ghost'],
    stats: { hp: 148, atk: 130, def: 85, spa: 110, spd: 85, spe: 152 },
    bst: 600,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/887.png',
    ability: 'Infiltrator (Infiltrador)',
    abilityDesc: 'Ignora barreiras de proteção como Reflect, Light Screen e Substitute.',
    nature: 'Ingênua (↑ Velocidade / ↓ Def. Esp.)',
    natureDesc: 'Velocidade estonteante de jato supersônico, um dos mais rápidos de todo o ecossistema.',
    item: 'Choice Specs (Óculos de Escolha)',
    itemDesc: 'Aumenta o Ataque Especial em 50%, prendendo-se no primeiro golpe executado.',
    mega: {
      name: 'Dragapult Furtivo',
      types: ['dragon', 'ghost'],
      desc: 'Lança Dreepys de seus chifres como mísseis guiados por ectoplasma em velocidade Mach.'
    },
    moves: [
      { name: 'Dragon Darts', type: 'dragon', power: 50, acc: 100, desc: 'Dispara dois projéteis velozes atingindo alvos com precisão cirúrgica.' },
      { name: 'Shadow Ball', type: 'ghost', power: 80, acc: 100, desc: 'Lança orbe fantasmagórica que corrói defesas especiais.' },
      { name: 'U-turn', type: 'bug', power: 70, acc: 100, desc: 'Garante o controle do ritmo de batalha pivotando com segurança.' },
      { name: 'Flamethrower', type: 'fire', power: 90, acc: 100, desc: 'Surpreende oponentes de Aço tentando bloquear seu caminho.' }
    ]
  },
  {
    id: 1008,
    name: 'Miraidon',
    category: 'Pokémon Paradoxal',
    types: ['electric', 'dragon'],
    stats: { hp: 170, atk: 95, def: 110, spa: 155, spd: 125, spe: 145 },
    bst: 670,
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1008.png',
    ability: 'Hadron Engine (Motor de Hádrons)',
    abilityDesc: 'Ativa o Terreno Elétrico e energiza seu motor futurista aumentando o At. Especial em 33%.',
    nature: 'Tímida (↑ Velocidade / ↓ Ataque)',
    natureDesc: 'Agilidade eletrocibernética futurista quase inalcançável.',
    item: 'Choice Specs',
    itemDesc: 'Multiplica a potência do raio Electro Drift a patamares cósmicos.',
    mega: {
      name: 'Modo Propulsor Miraidon',
      types: ['electric', 'dragon'],
      desc: 'Forma cibernética avançada originária do futuro distante com propulsores de íons.'
    },
    moves: [
      { name: 'Electro Drift', type: 'electric', power: 100, acc: 100, desc: 'Disparo futurista de elétrons acelerados com dano extra se superefetivo.' },
      { name: 'Draco Meteor', type: 'dragon', power: 130, acc: 90, desc: 'Chuva de cometas estelares com força de destruição em massa.' },
      { name: 'Volt Switch', type: 'electric', power: 70, acc: 100, desc: 'Ataca em alta velocidade retornando para a Poké Ball estrategicamente.' },
      { name: 'Overheat', type: 'fire', power: 130, acc: 90, desc: 'Superaquecimento termoelétrico para aniquilar defensores de Aço e Terra.' }
    ]
  }
];

// Three.js Particle Palettes by Elemental Type
const TYPE_PARTICLE_PALETTES = {
  fire: [new THREE.Color(1.0, 0.9, 0.2), new THREE.Color(1.0, 0.5, 0.05), new THREE.Color(1.0, 0.2, 0.0), new THREE.Color(0.8, 0.05, 0.0)],
  water: [new THREE.Color(0.2, 0.8, 1.0), new THREE.Color(0.1, 0.5, 0.95), new THREE.Color(0.0, 0.3, 0.8), new THREE.Color(0.6, 0.95, 1.0)],
  grass: [new THREE.Color(0.4, 0.95, 0.3), new THREE.Color(0.2, 0.8, 0.2), new THREE.Color(0.1, 0.6, 0.15), new THREE.Color(0.8, 0.95, 0.4)],
  electric: [new THREE.Color(1.0, 0.95, 0.2), new THREE.Color(1.0, 0.8, 0.0), new THREE.Color(0.4, 0.9, 1.0), new THREE.Color(1.0, 1.0, 0.7)],
  psychic: [new THREE.Color(1.0, 0.3, 0.7), new THREE.Color(0.8, 0.1, 0.6), new THREE.Color(0.5, 0.1, 0.8), new THREE.Color(1.0, 0.6, 0.9)],
  ice: [new THREE.Color(0.5, 0.95, 1.0), new THREE.Color(0.2, 0.8, 0.95), new THREE.Color(0.8, 0.98, 1.0), new THREE.Color(0.3, 0.6, 0.9)],
  dragon: [new THREE.Color(0.4, 0.4, 0.95), new THREE.Color(0.7, 0.2, 0.8), new THREE.Color(0.9, 0.3, 0.3), new THREE.Color(1.0, 0.8, 0.3)],
  ghost: [new THREE.Color(0.6, 0.2, 0.9), new THREE.Color(0.4, 0.1, 0.7), new THREE.Color(0.2, 0.05, 0.4), new THREE.Color(0.7, 0.4, 1.0)],
  dark: [new THREE.Color(0.5, 0.2, 0.4), new THREE.Color(0.3, 0.1, 0.3), new THREE.Color(0.15, 0.15, 0.2), new THREE.Color(0.8, 0.4, 0.2)],
  steel: [new THREE.Color(0.8, 0.9, 1.0), new THREE.Color(0.6, 0.7, 0.8), new THREE.Color(0.4, 0.5, 0.6), new THREE.Color(1.0, 0.85, 0.4)],
  fighting: [new THREE.Color(1.0, 0.4, 0.1), new THREE.Color(0.8, 0.2, 0.05), new THREE.Color(0.6, 0.1, 0.0), new THREE.Color(1.0, 0.7, 0.3)],
  poison: [new THREE.Color(0.7, 0.1, 0.8), new THREE.Color(0.5, 0.05, 0.6), new THREE.Color(0.3, 0.7, 0.2), new THREE.Color(0.9, 0.3, 0.9)],
  ground: [new THREE.Color(0.85, 0.65, 0.35), new THREE.Color(0.7, 0.5, 0.2), new THREE.Color(0.5, 0.35, 0.15), new THREE.Color(1.0, 0.8, 0.4)],
  rock: [new THREE.Color(0.8, 0.7, 0.4), new THREE.Color(0.6, 0.5, 0.3), new THREE.Color(0.4, 0.3, 0.2), new THREE.Color(0.9, 0.8, 0.5)],
  bug: [new THREE.Color(0.6, 0.9, 0.2), new THREE.Color(0.4, 0.7, 0.1), new THREE.Color(0.8, 0.7, 0.1), new THREE.Color(0.3, 0.5, 0.05)],
  flying: [new THREE.Color(0.5, 0.7, 1.0), new THREE.Color(0.7, 0.85, 1.0), new THREE.Color(0.9, 0.95, 1.0), new THREE.Color(0.4, 0.6, 0.9)],
  fairy: [new THREE.Color(1.0, 0.55, 0.8), new THREE.Color(1.0, 0.75, 0.9), new THREE.Color(0.8, 0.4, 0.7), new THREE.Color(1.0, 0.9, 0.95)],
  normal: [new THREE.Color(0.9, 0.85, 0.75), new THREE.Color(0.7, 0.7, 0.7), new THREE.Color(0.5, 0.5, 0.5), new THREE.Color(1.0, 0.9, 0.6)]
};

// DOM Elements Cache
const DOM = {
  // Screens & Views
  viewPokedex: document.getElementById('viewPokedex'),
  viewDetail: document.getElementById('viewDetail'),
  btnNavList: document.getElementById('btnNavList'),
  btnNavDetail: document.getElementById('btnNavDetail'),
  btnBackToList: document.getElementById('btnBackToList'),
  detailViewSwitcher: document.getElementById('detailViewSwitcher'),
  brandNav: document.getElementById('brandNav'),

  // Search & Filters
  pokeSearchInput: document.getElementById('pokeSearchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  selGenFilter: document.getElementById('selGenFilter'),
  selSortOrder: document.getElementById('selSortOrder'),
  typeChipsContainer: document.getElementById('typeChipsContainer'),
  pokemonGrid: document.getElementById('pokemonGrid'),
  btnLoadMore: document.getElementById('btnLoadMore'),
  resultsCount: document.getElementById('resultsCount'),
  apiStatusLabel: document.getElementById('apiStatusLabel'),

  // Detail Navigation Stepper
  btnPrevPoke: document.getElementById('btnPrevPoke'),
  btnNextPoke: document.getElementById('btnNextPoke'),
  lblCurrentPoke: document.getElementById('lblCurrentPoke'),

  // Detailed HUD Card
  cardScaleContainer: document.getElementById('cardScaleContainer'),
  cardViewport: document.getElementById('cardViewport'),
  tiltWrapper: document.getElementById('tiltWrapper'),
  card: document.getElementById('pokemonCard'),
  holoFoil: document.getElementById('holoFoil'),
  canvas: document.getElementById('threeCanvas'),
  charizardArt: document.getElementById('charizardArt'),
  editorDrawer: document.getElementById('editorDrawer'),

  // Header Panel
  txtPokeId: document.getElementById('txtPokeId'),
  txtPokeName: document.getElementById('txtPokeName'),
  txtPokeCategory: document.getElementById('txtPokeCategory'),
  badgeType1: document.getElementById('badgeType1'),
  badgeType2: document.getElementById('badgeType2'),
  txtType1: document.getElementById('txtType1'),
  txtType2: document.getElementById('txtType2'),

  // Role Panel
  txtRole1: document.getElementById('txtRole1'),
  txtRole2: document.getElementById('txtRole2'),
  txtRole3: document.getElementById('txtRole3'),
  iconRole1: document.getElementById('iconRole1'),
  iconRole2: document.getElementById('iconRole2'),
  iconRole3: document.getElementById('iconRole3'),

  // Stats Panel
  txtHp: document.getElementById('txtHp'),
  barAtk: document.getElementById('barAtk'),
  barDef: document.getElementById('barDef'),
  barSpa: document.getElementById('barSpa'),
  barSpd: document.getElementById('barSpd'),
  barSpe: document.getElementById('barSpe'),
  valAtk: document.getElementById('valAtk'),
  valDef: document.getElementById('valDef'),
  valSpa: document.getElementById('valSpa'),
  valSpd: document.getElementById('valSpd'),
  valSpe: document.getElementById('valSpe'),

  // Moves
  movesContainer: document.getElementById('movesContainer'),

  // Weakness & Strength Grids
  strongTypesGrid: document.getElementById('strongTypesGrid'),
  weakTypesList: document.getElementById('weakTypesList'),

  // Bottom Panels
  txtItemName: document.getElementById('txtItemName'),
  txtItemDesc: document.getElementById('txtItemDesc'),
  imgItem: document.getElementById('imgItem'),
  txtAbilityName: document.getElementById('txtAbilityName'),
  txtAbilityDesc: document.getElementById('txtAbilityDesc'),
  imgAbility: document.getElementById('imgAbility'),
  txtNatureName: document.getElementById('txtNatureName'),
  txtNatureDesc: document.getElementById('txtNatureDesc'),
  imgNature: document.getElementById('imgNature'),
  txtMegaName: document.getElementById('txtMegaName'),
  txtMegaType1: document.getElementById('txtMegaType1'),
  txtMegaType2: document.getElementById('txtMegaType2'),
  megaPill1: document.getElementById('megaPill1'),
  megaPill2: document.getElementById('megaPill2'),
  txtMegaDesc: document.getElementById('txtMegaDesc'),
  imgMegaArt: document.getElementById('imgMegaArt'),

  // Toolbar & Modes
  btnModeCard: document.getElementById('btnModeCard'),
  btnModeTemplate: document.getElementById('btnModeTemplate'),
  btnModeParticles: document.getElementById('btnModeParticles'),
  lblParticles: document.getElementById('lblParticles'),
  btnToggleEditor: document.getElementById('btnToggleEditor'),
  btnCloseEditor: document.getElementById('btnCloseEditor'),
  btnToggle3D: document.getElementById('btnToggle3D'),
  lblTilt: document.getElementById('lblTilt'),
  btnToggleAudio: document.getElementById('btnToggleAudio'),
  lblAudio: document.getElementById('lblAudio'),
  btnResetStats: document.getElementById('btnResetStats'),
  btnPrintCard: document.getElementById('btnPrintCard'),

  // Editor Inputs
  selPreset: document.getElementById('selPreset'),
  inpPokeId: document.getElementById('inpPokeId'),
  inpPokeName: document.getElementById('inpPokeName'),
  inpPokeCategory: document.getElementById('inpPokeCategory'),
  selType1: document.getElementById('selType1'),
  selType2: document.getElementById('selType2'),
  rngHp: document.getElementById('rngHp'),
  rngAtk: document.getElementById('rngAtk'),
  rngDef: document.getElementById('rngDef'),
  rngSpa: document.getElementById('rngSpa'),
  rngSpd: document.getElementById('rngSpd'),
  rngSpe: document.getElementById('rngSpe'),
  lblValHp: document.getElementById('lblValHp'),
  lblValAtk: document.getElementById('lblValAtk'),
  lblValDef: document.getElementById('lblValDef'),
  lblValSpa: document.getElementById('lblValSpa'),
  lblValSpd: document.getElementById('lblValSpd'),
  lblValSpe: document.getElementById('lblValSpe'),
  inpHabName: document.getElementById('inpHabName'),
  inpHabDesc: document.getElementById('inpHabDesc'),
  inpNatName: document.getElementById('inpNatName'),
  inpNatDesc: document.getElementById('inpNatDesc'),
  inpMegaName: document.getElementById('inpMegaName'),
  inpItemName: document.getElementById('inpItemName'),
  btnResetDefault: document.getElementById('btnResetDefault')
};

// ================= SOUND ENGINE =================
function playSound(type = 'click') {
  if (!state.enableAudio) return;
  try {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = state.audioCtx;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'whoosh') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.15);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (e) {
    // Audio Context handled quietly
  }
}

// ================= POKÉAPI SERVICE =================
const PokeAPIService = {
  baseUrl: 'https://pokeapi.co/api/v2',

  // Format ID with leading zeroes: 6 -> 'Nº 0006'
  formatId(id) {
    return `Nº ${String(id).padStart(4, '0')}`;
  },

  // Capitalize name
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Get artwork URL
  getArtworkUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  },

  // Calculate Base Stat Total
  getBST(stats) {
    if (!stats) return 0;
    return (stats.hp || 0) + (stats.atk || 0) + (stats.def || 0) + (stats.spa || 0) + (stats.spd || 0) + (stats.spe || 0);
  },

  // Fetch list of Pokémon with basic info
  async fetchList(offset = 0, limit = 24) {
    try {
      const response = await fetch(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`, { cache: 'force-cache' });
      if (!response.ok) throw new Error('Falha ao conectar na PokéAPI');
      const data = await response.json();

      DOM.apiStatusLabel.textContent = 'PokéAPI v2 Online';
      const indicator = document.querySelector('.status-indicator-dot');
      if (indicator) indicator.style.background = '#00e676';

      // Fetch basic details in parallel (types & stats for listing)
      const detailPromises = data.results.map(async (item) => {
        try {
          const detailRes = await fetch(item.url, { cache: 'force-cache' });
          if (!detailRes.ok) return null;
          const p = await detailRes.json();
          return {
            id: p.id,
            name: this.capitalize(p.name),
            types: p.types.map(t => t.type.name),
            stats: {
              hp: p.stats[0]?.base_stat || 50,
              atk: p.stats[1]?.base_stat || 50,
              def: p.stats[2]?.base_stat || 50,
              spa: p.stats[3]?.base_stat || 50,
              spd: p.stats[4]?.base_stat || 50,
              spe: p.stats[5]?.base_stat || 50
            },
            bst: p.stats.reduce((acc, s) => acc + s.base_stat, 0),
            artwork: p.sprites?.other?.['official-artwork']?.front_default || this.getArtworkUrl(p.id)
          };
        } catch (e) {
          return null;
        }
      });

      const details = (await Promise.all(detailPromises)).filter(Boolean);
      return details;
    } catch (err) {
      console.warn('PokéAPI offline ou bloqueada no ambiente local. Usando catálogo integrado:', err);
      DOM.apiStatusLabel.textContent = 'Banco Integrado (Offline)';
      const indicator = document.querySelector('.status-indicator-dot');
      if (indicator) indicator.style.background = '#ffb300';
      return null;
    }
  },

  // Fetch single full Pokémon details for HUD Card
  async fetchDetail(idOrName) {
    const key = String(idOrName).toLowerCase();
    if (state.pokemonCache.has(key)) {
      return state.pokemonCache.get(key);
    }

    // Check seed baseline first for instant rich content
    const seed = POKEMON_SEEDS.find(s => s.id === Number(idOrName) || s.name.toLowerCase() === key);
    if (seed && (!navigator.onLine || !this.isNetworkAvailable)) {
      state.pokemonCache.set(key, seed);
      return seed;
    }

    try {
      const [pokeRes, speciesRes] = await Promise.all([
        fetch(`${this.baseUrl}/pokemon/${key}`, { cache: 'force-cache' }),
        fetch(`${this.baseUrl}/pokemon-species/${key}`, { cache: 'force-cache' }).catch(() => null)
      ]);

      if (!pokeRes.ok) throw new Error('Pokémon não encontrado');
      const p = await pokeRes.json();
      const s = speciesRes && speciesRes.ok ? await speciesRes.json() : null;

      // Genus / Category translation
      let category = 'Pokémon';
      if (s && s.genera) {
        const ptGenus = s.genera.find(g => g.language.name === 'pt' || g.language.name === 'pt-BR');
        const enGenus = s.genera.find(g => g.language.name === 'en');
        category = ptGenus ? ptGenus.genus : (enGenus ? enGenus.genus.replace(' Pokémon', '') + ' Pokémon' : 'Pokémon');
      } else if (seed) {
        category = seed.category;
      }

      // Types
      const types = p.types.map(t => t.type.name);

      // Stats
      const stats = {
        hp: p.stats[0]?.base_stat || 70,
        atk: p.stats[1]?.base_stat || 70,
        def: p.stats[2]?.base_stat || 70,
        spa: p.stats[3]?.base_stat || 70,
        spd: p.stats[4]?.base_stat || 70,
        spe: p.stats[5]?.base_stat || 70
      };

      // Ability
      const firstAbility = p.abilities[0]?.ability?.name || 'Pressure';
      const abilityFormatted = this.capitalize(firstAbility.replace('-', ' '));

      // 4 Moves
      const moves = [];
      const moveSlice = p.moves.slice(0, 4);
      for (const m of moveSlice) {
        try {
          const moveRes = await fetch(m.move.url, { cache: 'force-cache' });
          if (moveRes.ok) {
            const md = await moveRes.json();
            const ptEntry = md.flavor_text_entries?.find(e => e.language.name === 'pt' || e.language.name === 'pt-BR');
            const enEntry = md.flavor_text_entries?.find(e => e.language.name === 'en');
            moves.push({
              name: this.capitalize(md.name.replace('-', ' ')),
              type: md.type.name,
              power: md.power || '--',
              acc: md.accuracy ? `${md.accuracy}%` : '--',
              desc: ptEntry?.flavor_text?.replace(/\n|\f/g, ' ') || enEntry?.flavor_text?.replace(/\n|\f/g, ' ') || 'Golpe tático avançado.'
            });
          }
        } catch (e) {
          moves.push({
            name: this.capitalize(m.move.name.replace('-', ' ')),
            type: types[0] || 'normal',
            power: 80,
            acc: '100%',
            desc: 'Ataque de energia elemental de alta precisão.'
          });
        }
      }

      // If seed has moves and API had fewer than 4, fill from seed
      if (moves.length < 4 && seed && seed.moves) {
        while (moves.length < 4 && seed.moves[moves.length]) {
          moves.push(seed.moves[moves.length]);
        }
      }

      const fullData = {
        id: p.id,
        name: this.capitalize(p.name),
        category: category,
        types: types,
        stats: stats,
        bst: Object.values(stats).reduce((a, b) => a + b, 0),
        artwork: p.sprites?.other?.['official-artwork']?.front_default || this.getArtworkUrl(p.id),
        ability: seed ? seed.ability : `${abilityFormatted} (Habilidade)`,
        abilityDesc: seed ? seed.abilityDesc : `Habilidade nativa que confere vantagens táticas e adaptação elemental em combate.`,
        nature: seed ? seed.nature : (stats.spa > stats.atk ? 'Modesta (↑ At. Esp. / ↓ Ataque)' : 'Firme (↑ Ataque / ↓ At. Esp.)'),
        natureDesc: seed ? seed.natureDesc : 'Distribuição de esforço otimizada para maximizar atributos dominantes.',
        item: seed ? seed.item : (types[0] === 'fire' ? 'Charcoal' : (types[0] === 'water' ? 'Mystic Water' : 'Life Orb')),
        itemDesc: seed ? seed.itemDesc : 'Item competitivo que potencializa a ofensividade e o impacto dos golpes.',
        mega: seed ? seed.mega : {
          name: `Forma Potencializada ${this.capitalize(p.name)}`,
          types: types,
          desc: `Amplifica a ressonância de energia de combate, liberando o potencial máximo do Pokémon.`
        },
        moves: moves.length > 0 ? moves : (seed?.moves || [])
      };

      state.pokemonCache.set(key, fullData);
      state.pokemonCache.set(String(p.id), fullData);
      return fullData;
    } catch (e) {
      if (seed) {
        state.pokemonCache.set(key, seed);
        return seed;
      }
      // Generate standard fallback object
      const idNum = Number(idOrName) || 1;
      return {
        id: idNum,
        name: this.capitalize(String(idOrName)),
        category: 'Pokémon Selvagem',
        types: ['normal'],
        stats: { hp: 120, atk: 85, def: 80, spa: 85, spd: 80, spe: 80 },
        bst: 450,
        artwork: this.getArtworkUrl(idNum),
        ability: 'Adaptability (Habilidade)',
        abilityDesc: 'Adapta-se ao ambiente de batalha de forma equilibrada.',
        nature: 'Equilibrada (Neutro)',
        natureDesc: 'Mantém proporções sólidas em todos os atributos.',
        item: 'Leftovers',
        itemDesc: 'Recupera vida passivamente a cada turno.',
        mega: { name: `Forma Especial`, types: ['normal'], desc: 'Libera impulsos de combate.' },
        moves: [
          { name: 'Tackle', type: 'normal', power: 40, acc: 100, desc: 'Investida rápida e precisa.' },
          { name: 'Quick Attack', type: 'normal', power: 40, acc: 100, desc: 'Ataque veloz com prioridade.' },
          { name: 'Protect', type: 'normal', power: '--', acc: '--', desc: 'Protege contra ataques por um turno.' },
          { name: 'Hyper Beam', type: 'normal', power: 150, acc: 90, desc: 'Feixe concentrado de destruição máxima.' }
        ]
      };
    }
  }
};

// ================= VIEW NAVIGATION (SWITCH BETWEEN POKÉDEX & HUD CARD) =================
function switchView(viewName) {
  state.view = viewName;
  playSound('whoosh');

  if (viewName === 'pokedex') {
    DOM.viewPokedex.classList.remove('is-hidden');
    DOM.viewDetail.classList.add('is-hidden');
    DOM.detailViewSwitcher.classList.add('is-hidden');
    DOM.btnNavList.classList.add('active');
    DOM.btnNavDetail.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (viewName === 'detail') {
    DOM.viewPokedex.classList.add('is-hidden');
    DOM.viewDetail.classList.remove('is-hidden');
    DOM.detailViewSwitcher.classList.remove('is-hidden');
    DOM.btnNavList.classList.remove('active');
    DOM.btnNavDetail.classList.add('active');
    handleResize();
    animateStats();
  }
}

// ================= POKÉDEX GRID RENDERING & FILTERING =================
function renderPokemonGrid(list) {
  DOM.pokemonGrid.innerHTML = '';

  if (!list || list.length === 0) {
    DOM.pokemonGrid.innerHTML = `
      <div class="grid-empty-state">
        <span class="grid-empty-icon">🔍</span>
        <h3 class="grid-empty-title">Nenhum Pokémon encontrado</h3>
        <p class="grid-empty-desc">Tente pesquisar por outro nome, número ou alterar o filtro de tipo.</p>
      </div>
    `;
    DOM.resultsCount.textContent = '0 Pokémon encontrados';
    return;
  }

  DOM.resultsCount.textContent = `${list.length} Pokémon exibidos`;

  list.forEach(poke => {
    const card = document.createElement('div');
    card.className = 'poke-grid-card';
    card.setAttribute('data-id', poke.id);

    const typeBadgesHtml = poke.types.map(t => {
      const meta = TYPE_META[t] || { name: t.toUpperCase() };
      return `
        <span class="card-type-badge type-${t}">
          <span class="card-type-icon icon-${t}"></span>
          ${meta.name}
        </span>
      `;
    }).join('');

    card.innerHTML = `
      <span class="card-num-tag">${PokeAPIService.formatId(poke.id)}</span>
      <div class="card-art-container">
        <img src="${poke.artwork}" alt="${poke.name}" class="card-art-img" loading="lazy">
      </div>
      <h3 class="card-poke-name">${poke.name}</h3>
      <div class="card-types-row">
        ${typeBadgesHtml}
      </div>
      <div class="card-footer-action">
        <span class="stat-bst">BST: <strong>${poke.bst || 500}</strong></span>
        <span class="btn-card-view">Ver HUD ▶</span>
      </div>
    `;

    // Click handler to open HUD Card Detail
    card.addEventListener('click', () => {
      openPokemonDetail(poke.id);
    });

    DOM.pokemonGrid.appendChild(card);
  });
}

// Filter and Sort Engine
function applyFiltersAndSort() {
  let filtered = [...state.pokemonList];

  // 1. Text Search Filter (name or number)
  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      String(p.id) === q || 
      String(p.id).padStart(4, '0').includes(q)
    );
  }

  // 2. Generation / Region Filter
  if (state.activeGen !== 'all' && GEN_RANGES[state.activeGen]) {
    const [min, max] = GEN_RANGES[state.activeGen];
    filtered = filtered.filter(p => p.id >= min && p.id <= max);
  }

  // 3. Type Filter
  if (state.activeType !== 'all') {
    filtered = filtered.filter(p => p.types.includes(state.activeType));
  }

  // 4. Sort Order
  switch (state.sortOrder) {
    case 'id-asc':
      filtered.sort((a, b) => a.id - b.id);
      break;
    case 'id-desc':
      filtered.sort((a, b) => b.id - a.id);
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'bst-desc':
      filtered.sort((a, b) => (b.bst || 0) - (a.bst || 0));
      break;
  }

  renderPokemonGrid(filtered);
}

// Load Initial Pokémon Batch
async function initPokedexCatalog() {
  // 1. Load Seed Data immediately so there is zero waiting time
  state.pokemonList = POKEMON_SEEDS.map(s => ({
    id: s.id,
    name: s.name,
    types: s.types,
    stats: s.stats,
    bst: s.bst,
    artwork: s.artwork
  }));

  applyFiltersAndSort();

  // 2. Query PokéAPI v2 asynchronously to fetch the full 24 initial Pokémon
  try {
    const apiList = await PokeAPIService.fetchList(0, 24);
    if (apiList && apiList.length > 0) {
      // Merge with seed data (avoiding duplicates)
      const existingIds = new Set(apiList.map(p => p.id));
      const seedsToKeep = state.pokemonList.filter(s => !existingIds.has(s.id));
      state.pokemonList = [...apiList, ...seedsToKeep];
      applyFiltersAndSort();
    }
  } catch (err) {
    console.warn('PokéAPI offline, mantendo base integrada.', err);
  }
}

// Load More Pokémon
async function loadMorePokemon() {
  if (state.isLoading) return;
  state.isLoading = true;
  DOM.btnLoadMore.innerHTML = '<span class="icon">⏳</span> Carregando da PokéAPI...';
  playSound('click');

  state.offset += state.limit;
  const nextBatch = await PokeAPIService.fetchList(state.offset, state.limit);

  if (nextBatch && nextBatch.length > 0) {
    const existingIds = new Set(state.pokemonList.map(p => p.id));
    const unique = nextBatch.filter(p => !existingIds.has(p.id));
    state.pokemonList = [...state.pokemonList, ...unique];
    applyFiltersAndSort();
  } else {
    // If PokéAPI offline or end reached
    DOM.btnLoadMore.innerHTML = '<span class="icon">✓</span> Todos os Pokémon carregados';
    DOM.btnLoadMore.disabled = true;
  }

  state.isLoading = false;
  DOM.btnLoadMore.innerHTML = '<span class="icon">⚡</span> Carregar Mais Pokémon';
}

// ================= DYNAMIC HUD CARD HYDRATION =================
async function openPokemonDetail(idOrName) {
  playSound('whoosh');
  switchView('detail');
  await loadAndDisplayPokemon(idOrName);
}

// Compute Role in Team dynamically based on stats profile
function computeRoles(p) {
  const roles = [];
  const s = p.stats;

  // Role 1: Offense
  if (s.spa >= s.atk && s.spa >= 110) {
    roles.push({ text: 'Atacante Especial', roleClass: 'role-special' });
  } else if (s.atk > s.spa && s.atk >= 110) {
    roles.push({ text: 'Atacante Físico', roleClass: 'role-physical' });
  } else if (s.def >= 110 || s.spd >= 110) {
    roles.push({ text: 'Muralha Defensiva', roleClass: 'role-defense' });
  } else {
    roles.push({ text: 'Pivô Tático Híbrido', roleClass: 'role-tactical' });
  }

  // Role 2: Mobility / Bulk
  if (s.spe >= 105) {
    roles.push({ text: 'Alta Velocidade de Reação', roleClass: 'role-speed' });
  } else if (s.hp >= 120) {
    roles.push({ text: 'Reserva Robusta de PS', roleClass: 'role-hp' });
  } else if (s.def >= 100 && s.spd >= 100) {
    roles.push({ text: 'Defesa Mista Balanceada', roleClass: 'role-mixed' });
  } else {
    roles.push({ text: 'Combatente Versátil', roleClass: 'role-versatile' });
  }

  // Role 3: Typings and coverage
  const t1 = p.types[0];
  const t2 = p.types[1];
  const t1Pt = TYPE_META[t1]?.pt || t1;
  const t2Pt = t2 ? (TYPE_META[t2]?.pt || t2) : null;
  const covText = t2Pt ? `Presença Ofensiva ${t1Pt} / ${t2Pt}` : `Domínio Puro do Tipo ${t1Pt}`;
  roles.push({ text: covText, roleClass: 'role-coverage' });

  return roles;
}

// Calculate Type Weaknesses (Defense) & Strengths (Offense)
function computeTypeMatchups(types) {
  const multipliers = {};
  const allTypes = Object.keys(TYPE_CHART);

  allTypes.forEach(t => {
    multipliers[t] = 1.0;
  });

  // Calculate defensive weaknesses (damage taken by defending types)
  types.forEach(defType => {
    allTypes.forEach(atkType => {
      const chart = TYPE_CHART[atkType];
      if (chart && chart[defType] !== undefined) {
        multipliers[atkType] *= chart[defType];
      }
    });
  });

  const weaknesses = [];
  const strengths = [];

  // Weaknesses: types that hit for 2x or 4x
  Object.entries(multipliers).forEach(([t, mult]) => {
    if (mult >= 2.0) {
      weaknesses.push({ type: t, mult: mult });
    }
  });

  // Strengths: types that the Pokémon's types hit for 2x (offensive coverage)
  types.forEach(atkType => {
    const chart = TYPE_CHART[atkType];
    if (chart) {
      Object.entries(chart).forEach(([defType, mult]) => {
        if (mult === 2.0 && !strengths.includes(defType)) {
          strengths.push(defType);
        }
      });
    }
  });

  return { weaknesses, strengths };
}

// Load and populate the HUD Card with fetched Pokémon data
async function loadAndDisplayPokemon(idOrName) {
  const p = await PokeAPIService.fetchDetail(idOrName);
  if (!p) return;

  state.currentPokeId = p.id;

  // Stepper Header Text
  DOM.lblCurrentPoke.textContent = `#${String(p.id).padStart(4, '0')} ${p.name}`;

  // 1. Identity & Header
  DOM.txtPokeId.textContent = PokeAPIService.formatId(p.id);
  DOM.txtPokeName.textContent = p.name;
  DOM.txtPokeCategory.textContent = p.category;

  // Artwork
  DOM.charizardArt.src = p.artwork;
  DOM.charizardArt.alt = p.name;

  // Types Badges
  const t1 = p.types[0] || 'normal';
  const t2 = p.types[1] || 'none';
  updateTypeBadges(t1, t2);

  // 2. Roles Panel
  const roles = computeRoles(p);
  DOM.txtRole1.textContent = roles[0].text;
  if (DOM.iconRole1) DOM.iconRole1.className = `role-icon ${roles[0].roleClass}`;
  DOM.txtRole2.textContent = roles[1].text;
  if (DOM.iconRole2) DOM.iconRole2.className = `role-icon ${roles[1].roleClass}`;
  DOM.txtRole3.textContent = roles[2].text;
  if (DOM.iconRole3) DOM.iconRole3.className = `role-icon ${roles[2].roleClass}`;

  // 3. Stats Panel (HUD panel removed per design request)
  if (DOM.txtHp) DOM.txtHp.textContent = p.stats.hp;
  state.cardData.stats.atk.val = p.stats.atk;
  state.cardData.stats.def.val = p.stats.def;
  state.cardData.stats.spa.val = p.stats.spa;
  state.cardData.stats.spd.val = p.stats.spd;
  state.cardData.stats.spe.val = p.stats.spe;

  // 4. Moves Panel
  renderMoves(p.moves);

  // 5. Strengths (Forte Contra)
  const matchups = computeTypeMatchups(p.types);
  renderMatchups(matchups.strengths, matchups.weaknesses);

  // 6. Item, Ability, Nature, Mega
  DOM.txtItemName.textContent = p.item || 'Item Competitivo';
  DOM.txtItemDesc.textContent = p.itemDesc || 'Item balanceado para combate.';

  DOM.txtAbilityName.textContent = p.ability || 'Habilidade';
  DOM.txtAbilityDesc.textContent = p.abilityDesc || 'Vantagem tática elemental em campo.';

  DOM.txtNatureName.textContent = p.nature || 'Modesta (↑ At. Esp. / ↓ Ataque)';
  DOM.txtNatureDesc.textContent = p.natureDesc || 'Otimização de atributos em combate.';

  // Apply Pure CSS Elemental Theme to Card
  DOM.card.className = (state.mode === 'template' ? 'pokemon-card mode-template theme-' : 'pokemon-card theme-') + t1;

  if (p.mega) {
    DOM.txtMegaName.textContent = p.mega.name;
    DOM.txtMegaDesc.textContent = p.mega.desc;
    const mt1 = p.mega.types[0] || t1;
    const mt2 = p.mega.types[1] || null;
    DOM.txtMegaType1.textContent = TYPE_META[mt1]?.name || mt1.toUpperCase();
    DOM.megaPill1.className = `type-pill pill-${mt1}`;

    if (mt2) {
      DOM.megaPill2.className = `type-pill pill-${mt2}`;
      DOM.txtMegaType2.textContent = TYPE_META[mt2]?.name || mt2.toUpperCase();
    } else {
      DOM.megaPill2.className = 'type-pill is-hidden';
    }
  }

  // 7. Update 3D Three.js Particle Theme
  updateParticleTheme(t1);

  // 8. Animate Stats Bars
  animateStats();

  // 9. Sync Customizer Drawer Inputs
  syncCardToDrawer(p);
}

// Render 4 Moves
function renderMoves(moves) {
  DOM.movesContainer.innerHTML = '';
  if (!moves || moves.length === 0) return;

  moves.slice(0, 4).forEach((m, idx) => {
    const meta = TYPE_META[m.type] || { name: m.type.toUpperCase(), bg: '#ff5722' };
    const moveCard = document.createElement('div');
    moveCard.className = 'move-card';
    moveCard.id = `moveCard${idx + 1}`;

    moveCard.innerHTML = `
      <div class="move-badge-col">
        <span class="move-badge-icon icon-${m.type}"></span>
      </div>
      <div class="move-content-col">
        <div class="move-header-line">
          <div class="move-title-group">
            <span class="move-title">${m.name}</span>
            <span class="move-type-pill pill-${m.type}">
              <span>${meta.name}</span>
            </span>
          </div>
          <div class="move-stats-group">
            <div class="move-stat-item">
              <span class="stat-lbl">Poder</span>
              <strong class="stat-num">${m.power}</strong>
            </div>
            <div class="move-stat-item">
              <span class="stat-lbl">Precisão</span>
              <strong class="stat-num">${m.acc}</strong>
            </div>
          </div>
        </div>
        <p class="move-description">${m.desc}</p>
      </div>
    `;

    DOM.movesContainer.appendChild(moveCard);
  });
}

// Render Forte Contra & Vulnerável A
function renderMatchups(strengths, weaknesses) {
  // Strong Against
  DOM.strongTypesGrid.innerHTML = '';
  const displayStrengths = strengths.length > 0 ? strengths.slice(0, 6) : ['grass', 'bug', 'ice', 'steel'];
  displayStrengths.forEach(typeKey => {
    const ptName = TYPE_META[typeKey]?.pt || PokeAPIService.capitalize(typeKey);
    const item = document.createElement('div');
    item.className = 'type-entry';
    item.innerHTML = `
      <span class="type-circle-icon icon-${typeKey}"></span>
      <span class="type-label">${ptName}</span>
    `;
    DOM.strongTypesGrid.appendChild(item);
  });

  // Weaknesses
  DOM.weakTypesList.innerHTML = '';
  const displayWeaknesses = weaknesses.length > 0 ? weaknesses.slice(0, 4) : [{ type: 'water', mult: 2 }, { type: 'rock', mult: 4 }, { type: 'electric', mult: 2 }];
  displayWeaknesses.forEach(w => {
    const ptName = TYPE_META[w.type]?.pt || PokeAPIService.capitalize(w.type);
    const multClass = w.mult >= 4 ? 'mult-4x' : (w.mult >= 2 ? 'mult-2x' : (w.mult >= 1.5 ? 'mult-1-5x' : 'mult-1x'));
    const row = document.createElement('div');
    row.className = 'vuln-row';
    row.innerHTML = `
      <div class="vuln-type">
        <span class="type-circle-icon icon-${w.type}"></span>
        <span class="type-label">${ptName}</span>
      </div>
      <span class="vuln-mult-badge ${multClass}"></span>
    `;
    DOM.weakTypesList.appendChild(row);
  });
}

// Dynamic particle theme transition
function updateParticleTheme(primaryType) {
  if (!state.three.particleSystem) return;
  const palette = TYPE_PARTICLE_PALETTES[primaryType] || TYPE_PARTICLE_PALETTES.fire;
  state.three.currentPalette = palette;

  const colors = state.three.particleSystem.geometry.attributes.color.array;
  const count = colors.length / 3;

  for (let i = 0; i < count; i++) {
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  state.three.particleSystem.geometry.attributes.color.needsUpdate = true;
}

// ================= SCALE & RESIZE ADAPTATION (DESKTOP & MOBILE) =================
function handleResize() {
  if (state.view !== 'detail' || !DOM.cardViewport) return;

  const isMobile = window.innerWidth < 768;
  const horizPadding = isMobile ? 16 : 40;
  const vertPadding = isMobile ? 120 : 160;

  const availableW = Math.max(260, window.innerWidth - horizPadding);
  const availableH = Math.max(380, window.innerHeight - vertPadding);

  const scaleX = availableW / 682;
  const scaleY = availableH / 1024;

  let appliedScale;
  if (isMobile) {
    // Mobile mode: scale to fit screen width cleanly, allowing natural vertical scroll
    appliedScale = Math.max(0.42, Math.min(scaleX, 1.0));
  } else {
    // Desktop/Tablet mode: fit within available viewport without clipping
    appliedScale = Math.max(0.48, Math.min(scaleX, scaleY, 1.0));
  }

  DOM.cardViewport.style.transform = `scale(${appliedScale})`;
  DOM.cardViewport.style.transformOrigin = 'top center';

  const scaledW = Math.round(682 * appliedScale);
  const scaledH = Math.round(1024 * appliedScale);

  if (DOM.cardScaleContainer) {
    DOM.cardScaleContainer.style.width = `${scaledW}px`;
    DOM.cardScaleContainer.style.height = `${scaledH}px`;
    DOM.cardScaleContainer.style.marginBottom = '24px';
  } else if (DOM.cardViewport.parentElement) {
    DOM.cardViewport.parentElement.style.width = `${scaledW}px`;
    DOM.cardViewport.parentElement.style.height = `${scaledH}px`;
  }
}

window.addEventListener('resize', handleResize);

// ================= 3D HOLOGRAPHIC TILT EFFECT =================
function setupTilt() {
  let isHovering = false;

  DOM.cardViewport.addEventListener('mouseenter', () => {
    // Disable tilt on mobile/touch screens to preserve smooth thumb scrolling
    if (window.innerWidth < 768) return;
    isHovering = true;
  });

  DOM.cardViewport.addEventListener('mousemove', (e) => {
    if (!isHovering || window.innerWidth < 768) return;

    const rect = DOM.card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    state.three.mouse.x = (x / rect.width) * 2 - 1;
    state.three.mouse.y = -(y / rect.height) * 2 + 1;

    if (state.enableTilt) {
      const rotateX = ((y - centerY) / centerY) * -9;
      const rotateY = ((x - centerX) / centerX) * 9;
      DOM.tiltWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    const foilX = (x / rect.width) * 100;
    const foilY = (y / rect.height) * 100;
    DOM.holoFoil.style.setProperty('--foil-x', `${foilX}%`);
    DOM.holoFoil.style.setProperty('--foil-y', `${foilY}%`);
  });

  DOM.cardViewport.addEventListener('mouseleave', () => {
    isHovering = false;
    DOM.tiltWrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
    state.three.mouse.x = 0;
    state.three.mouse.y = 0;
  });
}

// ================= STAT BARS ANIMATION =================
function animateStats() {
  playSound('whoosh');
  if (!DOM.barAtk) return;
  const bars = [
    { el: DOM.barAtk, valEl: DOM.valAtk, target: state.cardData.stats.atk.val },
    { el: DOM.barDef, valEl: DOM.valDef, target: state.cardData.stats.def.val },
    { el: DOM.barSpa, valEl: DOM.valSpa, target: state.cardData.stats.spa.val },
    { el: DOM.barSpd, valEl: DOM.valSpd, target: state.cardData.stats.spd.val },
    { el: DOM.barSpe, valEl: DOM.valSpe, target: state.cardData.stats.spe.val }
  ];

  bars.forEach(({ el, valEl, target }) => {
    if (!el || !valEl) return;
    el.style.width = '0%';
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 25));

    setTimeout(() => {
      const pct = Math.min(100, Math.round((target / 200) * 100));
      el.style.width = `${pct}%`;

      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        valEl.textContent = current;
      }, 25);
    }, 150);
  });
}

// ================= VIEW MODES =================
function setMode(newMode) {
  state.mode = newMode;
  playSound('click');

  DOM.btnModeCard.classList.toggle('active', newMode === 'card');
  DOM.btnModeTemplate.classList.toggle('active', newMode === 'template');
  DOM.card.classList.toggle('mode-template', newMode === 'template');
  handleResize();
}

// ================= TYPE BADGE RENDERER (PURE CSS) =================
function updateTypeBadges(t1, t2) {
  const meta1 = TYPE_META[t1] || TYPE_META.normal;
  DOM.txtType1.textContent = meta1.name;
  DOM.badgeType1.className = `type-badge badge-${t1}`;

  if (t2 && t2 !== 'none' && TYPE_META[t2]) {
    const meta2 = TYPE_META[t2];
    DOM.badgeType2.className = `type-badge badge-${t2}`;
    DOM.txtType2.textContent = meta2.name;
  } else {
    DOM.badgeType2.className = 'type-badge is-hidden';
  }
}

// Sync Card values to Drawer Inputs
function syncCardToDrawer(p) {
  DOM.inpPokeId.value = PokeAPIService.formatId(p.id);
  DOM.inpPokeName.value = p.name;
  DOM.inpPokeCategory.value = p.category;
  DOM.selType1.value = p.types[0] || 'fire';
  DOM.selType2.value = p.types[1] || 'none';
  DOM.rngHp.value = p.stats.hp;
  DOM.rngAtk.value = p.stats.atk;
  DOM.rngDef.value = p.stats.def;
  DOM.rngSpa.value = p.stats.spa;
  DOM.rngSpd.value = p.stats.spd;
  DOM.rngSpe.value = p.stats.spe;

  DOM.lblValHp.textContent = p.stats.hp;
  DOM.lblValAtk.textContent = p.stats.atk;
  DOM.lblValDef.textContent = p.stats.def;
  DOM.lblValSpa.textContent = p.stats.spa;
  DOM.lblValSpd.textContent = p.stats.spd;
  DOM.lblValSpe.textContent = p.stats.spe;

  DOM.inpHabName.value = p.ability;
  DOM.inpHabDesc.value = p.abilityDesc;
  DOM.inpNatName.value = p.nature;
  DOM.inpNatDesc.value = p.natureDesc;
  DOM.inpItemName.value = p.item;
  DOM.inpMegaName.value = p.mega?.name || '';
}

// Live edit synchronization from Drawer
function syncEditorToCard() {
  state.cardData.id = DOM.inpPokeId.value;
  state.cardData.name = DOM.inpPokeName.value;
  state.cardData.category = DOM.inpPokeCategory.value;
  state.cardData.type1 = DOM.selType1.value;
  state.cardData.type2 = DOM.selType2.value;
  state.cardData.hp = parseInt(DOM.rngHp.value, 10);
  state.cardData.stats.atk.val = parseInt(DOM.rngAtk.value, 10);
  state.cardData.stats.def.val = parseInt(DOM.rngDef.value, 10);
  state.cardData.stats.spa.val = parseInt(DOM.rngSpa.value, 10);
  state.cardData.stats.spd.val = parseInt(DOM.rngSpd.value, 10);
  state.cardData.stats.spe.val = parseInt(DOM.rngSpe.value, 10);

  DOM.txtPokeId.textContent = state.cardData.id;
  DOM.txtPokeName.textContent = state.cardData.name;
  DOM.txtPokeCategory.textContent = state.cardData.category;
  if (DOM.txtHp) DOM.txtHp.textContent = state.cardData.hp;

  updateTypeBadges(state.cardData.type1, state.cardData.type2);

  if (DOM.valAtk) DOM.valAtk.textContent = state.cardData.stats.atk.val;
  if (DOM.barAtk) DOM.barAtk.style.width = `${Math.min(100, Math.round((state.cardData.stats.atk.val / 200) * 100))}%`;

  if (DOM.valDef) DOM.valDef.textContent = state.cardData.stats.def.val;
  if (DOM.barDef) DOM.barDef.style.width = `${Math.min(100, Math.round((state.cardData.stats.def.val / 200) * 100))}%`;

  if (DOM.valSpa) DOM.valSpa.textContent = state.cardData.stats.spa.val;
  if (DOM.barSpa) DOM.barSpa.style.width = `${Math.min(100, Math.round((state.cardData.stats.spa.val / 200) * 100))}%`;

  if (DOM.valSpd) DOM.valSpd.textContent = state.cardData.stats.spd.val;
  if (DOM.barSpd) DOM.barSpd.style.width = `${Math.min(100, Math.round((state.cardData.stats.spd.val / 200) * 100))}%`;

  if (DOM.valSpe) DOM.valSpe.textContent = state.cardData.stats.spe.val;
  if (DOM.barSpe) DOM.barSpe.style.width = `${Math.min(100, Math.round((state.cardData.stats.spe.val / 200) * 100))}%`;

  DOM.txtAbilityName.textContent = DOM.inpHabName.value;
  DOM.txtAbilityDesc.textContent = DOM.inpHabDesc.value;
  DOM.txtNatureName.textContent = DOM.inpNatName.value;
  DOM.txtNatureDesc.textContent = DOM.inpNatDesc.value;
  DOM.txtMegaName.textContent = DOM.inpMegaName.value;
  DOM.txtItemName.textContent = DOM.inpItemName.value;

  DOM.lblValHp.textContent = state.cardData.hp;
  DOM.lblValAtk.textContent = state.cardData.stats.atk.val;
  DOM.lblValDef.textContent = state.cardData.stats.def.val;
  DOM.lblValSpa.textContent = state.cardData.stats.spa.val;
  DOM.lblValSpd.textContent = state.cardData.stats.spd.val;
  DOM.lblValSpe.textContent = state.cardData.stats.spe.val;
}

// ================= EVENT LISTENERS =================
function setupEvents() {
  // Navigation Tabs
  DOM.btnNavList.addEventListener('click', () => switchView('pokedex'));
  DOM.btnNavDetail.addEventListener('click', () => switchView('detail'));
  DOM.btnBackToList.addEventListener('click', () => switchView('pokedex'));
  DOM.brandNav.addEventListener('click', () => switchView('pokedex'));

  // Stepper Controls in Detail View
  DOM.btnPrevPoke.addEventListener('click', () => {
    let prevId = state.currentPokeId - 1;
    if (prevId < 1) prevId = 1025;
    loadAndDisplayPokemon(prevId);
  });

  DOM.btnNextPoke.addEventListener('click', () => {
    let nextId = state.currentPokeId + 1;
    if (nextId > 1025) nextId = 1;
    loadAndDisplayPokemon(nextId);
  });

  // Search Input Filter
  DOM.pokeSearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    DOM.btnClearSearch.classList.toggle('is-hidden', !state.searchQuery);
    applyFiltersAndSort();
  });

  DOM.pokeSearchInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const query = DOM.pokeSearchInput.value.trim().toLowerCase();
      if (!query) return;

      // If user typed a number or exact name that might not be in initial batch
      DOM.apiStatusLabel.textContent = 'Buscando na PokéAPI...';
      const detail = await PokeAPIService.fetchDetail(query);
      if (detail) {
        // Add to list if not present
        if (!state.pokemonList.some(p => p.id === detail.id)) {
          state.pokemonList.unshift({
            id: detail.id,
            name: detail.name,
            types: detail.types,
            stats: detail.stats,
            bst: detail.bst,
            artwork: detail.artwork
          });
        }
        openPokemonDetail(detail.id);
      }
    }
  });

  DOM.btnClearSearch.addEventListener('click', () => {
    DOM.pokeSearchInput.value = '';
    state.searchQuery = '';
    DOM.btnClearSearch.classList.add('is-hidden');
    applyFiltersAndSort();
    DOM.pokeSearchInput.focus();
  });

  // Generation Dropdown Filter
  DOM.selGenFilter.addEventListener('change', (e) => {
    state.activeGen = e.target.value;
    playSound('click');
    applyFiltersAndSort();
  });

  // Sort Order Dropdown
  DOM.selSortOrder.addEventListener('change', (e) => {
    state.sortOrder = e.target.value;
    playSound('click');
    applyFiltersAndSort();
  });

  // Type Chips Filter
  const typeChips = DOM.typeChipsContainer.querySelectorAll('.type-chip');
  typeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      playSound('click');
      typeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeType = chip.getAttribute('data-type');
      applyFiltersAndSort();
    });
  });

  // Load More Button
  DOM.btnLoadMore.addEventListener('click', loadMorePokemon);

  // Detail View Mode Buttons
  DOM.btnModeCard.addEventListener('click', () => setMode('card'));
  DOM.btnModeTemplate.addEventListener('click', () => setMode('template'));
  DOM.btnModeParticles.addEventListener('click', () => {
    playSound('click');
    state.enableParticles = !state.enableParticles;
    DOM.lblParticles.textContent = state.enableParticles ? 'ON' : 'OFF';
  });

  // Editor Drawer
  DOM.btnToggleEditor.addEventListener('click', () => {
    playSound('click');
    DOM.editorDrawer.classList.toggle('open');
  });

  DOM.btnCloseEditor.addEventListener('click', () => {
    playSound('click');
    DOM.editorDrawer.classList.remove('open');
  });

  // 3D Tilt Toggle
  DOM.btnToggle3D.addEventListener('click', () => {
    playSound('click');
    state.enableTilt = !state.enableTilt;
    DOM.lblTilt.textContent = state.enableTilt ? 'ON' : 'OFF';
    if (!state.enableTilt) {
      DOM.tiltWrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  });

  // Audio Toggle
  DOM.btnToggleAudio.addEventListener('click', () => {
    state.enableAudio = !state.enableAudio;
    DOM.lblAudio.textContent = state.enableAudio ? 'ON' : 'OFF';
    if (state.enableAudio) playSound('click');
  });

  // Reanimate
  DOM.btnResetStats.addEventListener('click', animateStats);

  // Print
  DOM.btnPrintCard.addEventListener('click', () => {
    playSound('click');
    window.print();
  });

  // Reset to default
  DOM.btnResetDefault.addEventListener('click', () => {
    loadAndDisplayPokemon(6);
  });

  // Preset selector in Drawer
  DOM.selPreset.addEventListener('change', (e) => {
    loadAndDisplayPokemon(e.target.value);
  });

  // Editor Inputs Live Change
  const inputs = [
    DOM.inpPokeId, DOM.inpPokeName, DOM.inpPokeCategory,
    DOM.selType1, DOM.selType2,
    DOM.rngHp, DOM.rngAtk, DOM.rngDef, DOM.rngSpa, DOM.rngSpd, DOM.rngSpe,
    DOM.inpHabName, DOM.inpHabDesc, DOM.inpNatName, DOM.inpNatDesc,
    DOM.inpMegaName, DOM.inpItemName
  ];

  inputs.forEach(inp => {
    inp.addEventListener('input', syncEditorToCard);
  });

  // Delegated sound effect on interactive hovers
  document.body.addEventListener('mouseenter', (e) => {
    if (e.target && e.target.matches && e.target.matches('.poke-grid-card, .move-card, .type-chip, .panel, .type-entry, .vuln-row, .pokeball-badge, .btn-tool, .nav-tab-btn, .btn-step, .btn-load-more')) {
      playSound('hover');
    }
  }, true);
}

// ================= ICON GALLERY CATALOG =================
const ICONS_CATALOG = [
  // Types
  { cat: 'types', name: 'Normal', iconClass: 'icon-normal' },
  { cat: 'types', name: 'Fogo (Fire)', iconClass: 'icon-fire' },
  { cat: 'types', name: 'Água (Water)', iconClass: 'icon-water' },
  { cat: 'types', name: 'Elétrico (Electric)', iconClass: 'icon-electric' },
  { cat: 'types', name: 'Planta (Grass)', iconClass: 'icon-grass' },
  { cat: 'types', name: 'Gelo (Ice)', iconClass: 'icon-ice' },
  { cat: 'types', name: 'Lutador (Fighting)', iconClass: 'icon-fighting' },
  { cat: 'types', name: 'Voador (Flying)', iconClass: 'icon-flying' },
  { cat: 'types', name: 'Venenoso (Poison)', iconClass: 'icon-poison' },
  { cat: 'types', name: 'Terra (Ground)', iconClass: 'icon-ground' },
  { cat: 'types', name: 'Rocha (Rock)', iconClass: 'icon-rock' },
  { cat: 'types', name: 'Inseto (Bug)', iconClass: 'icon-bug' },
  { cat: 'types', name: 'Fantasma (Ghost)', iconClass: 'icon-ghost' },
  { cat: 'types', name: 'Aço (Steel)', iconClass: 'icon-steel' },
  { cat: 'types', name: 'Psíquico (Psychic)', iconClass: 'icon-psychic' },
  { cat: 'types', name: 'Fada (Fairy)', iconClass: 'icon-fairy' },
  { cat: 'types', name: 'Dragão (Dragon)', iconClass: 'icon-dragon' },
  { cat: 'types', name: 'Noturno (Dark)', iconClass: 'icon-dark' },

  // Battle
  { cat: 'battle', name: 'Espada (Ataque)', iconClass: 'icon-sword' },
  { cat: 'battle', name: 'Escudo (Defesa)', iconClass: 'icon-shield' },
  { cat: 'battle', name: 'Raio (Velocidade)', iconClass: 'icon-speed-bolt' },
  { cat: 'battle', name: 'Brilho (At. Esp.)', iconClass: 'icon-sp-atk-star' },
  { cat: 'battle', name: 'Mira (Precisão)', iconClass: 'icon-crosshair' },
  { cat: 'battle', name: 'Engrenagem (Habilidade)', iconClass: 'icon-gear' },
  { cat: 'battle', name: 'Estrela 8 Pontas', iconClass: 'icon-star8' },
  { cat: 'battle', name: 'Músculo (Físico)', iconClass: 'icon-muscle' },
  { cat: 'battle', name: 'Asa (Velocidade/Voador)', iconClass: 'icon-wing' },
  { cat: 'battle', name: 'Esfera Mágica', iconClass: 'icon-orb' },
  { cat: 'battle', name: 'Coração (PS / Vida)', iconClass: 'icon-heart-hp' },
  { cat: 'battle', name: 'Barras de Nível', iconClass: 'icon-bars' },
  { cat: 'battle', name: 'EXP (Experiência)', iconClass: 'icon-exp' },
  { cat: 'battle', name: 'DNA (Mega Evolução)', iconClass: 'icon-dna-mega' },
  { cat: 'battle', name: 'Rank Up', iconClass: 'icon-rank-up' },
  { cat: 'battle', name: 'Amizade (Friendship)', iconClass: 'icon-friendship' },
  { cat: 'battle', name: 'Equipe (Team)', iconClass: 'icon-team' },

  // Multipliers
  { cat: 'multipliers', name: 'Multiplicador 2×', iconClass: 'icon-mult-2x' },
  { cat: 'multipliers', name: 'Multiplicador 1.5×', iconClass: 'icon-mult-1-5x' },
  { cat: 'multipliers', name: 'Multiplicador 1×', iconClass: 'icon-mult-1x' },
  { cat: 'multipliers', name: 'Multiplicador 0.5×', iconClass: 'icon-mult-0-5x' },
  { cat: 'multipliers', name: 'Multiplicador 0×', iconClass: 'icon-mult-0x' },
  { cat: 'multipliers', name: 'Terreno Montanha', iconClass: 'icon-terrain-mountain' },
  { cat: 'multipliers', name: 'Terreno Água', iconClass: 'icon-terrain-water' },
  { cat: 'multipliers', name: 'Terreno Grama', iconClass: 'icon-terrain-grass' },
  { cat: 'multipliers', name: 'Terreno Vento', iconClass: 'icon-terrain-wind' },
  { cat: 'multipliers', name: 'Cristal', iconClass: 'icon-terrain-crystal' },
  { cat: 'multipliers', name: 'Nuvem', iconClass: 'icon-cloud' },
  { cat: 'multipliers', name: 'Sol', iconClass: 'icon-sun-bright' },
  { cat: 'multipliers', name: 'Chuva', iconClass: 'icon-rain' },
  { cat: 'multipliers', name: 'Neblina', iconClass: 'icon-fog' },
  { cat: 'multipliers', name: 'Lua', iconClass: 'icon-moon' },
  { cat: 'multipliers', name: 'Escudo Hexagonal', iconClass: 'icon-shield-hex' },

  // Pokeballs
  { cat: 'pokeballs', name: 'Poké Ball', iconClass: 'icon-pokeball' },
  { cat: 'pokeballs', name: 'Great Ball', iconClass: 'icon-greatball' },
  { cat: 'pokeballs', name: 'Ultra Ball', iconClass: 'icon-ultraball' },
  { cat: 'pokeballs', name: 'Master Ball', iconClass: 'icon-masterball' },
  { cat: 'pokeballs', name: 'Premier Ball', iconClass: 'icon-premierball' },
  { cat: 'pokeballs', name: 'Safari Ball', iconClass: 'icon-safariball' },
  { cat: 'pokeballs', name: 'Quick Ball', iconClass: 'icon-quickball' },
  { cat: 'pokeballs', name: 'Heal Ball', iconClass: 'icon-healball' },
  { cat: 'pokeballs', name: 'Nest Ball', iconClass: 'icon-nestball' },
  { cat: 'pokeballs', name: 'Love Ball', iconClass: 'icon-loveball' },
  { cat: 'pokeballs', name: 'Moon Ball', iconClass: 'icon-moonball' },
  { cat: 'pokeballs', name: 'Dusk Ball', iconClass: 'icon-duskball' },
  { cat: 'pokeballs', name: 'Repeat Ball', iconClass: 'icon-repeatball' },
  { cat: 'pokeballs', name: 'Net Ball', iconClass: 'icon-netball' },
  { cat: 'pokeballs', name: 'Dive Ball', iconClass: 'icon-diveball' },
  { cat: 'pokeballs', name: 'Timer Ball', iconClass: 'icon-timerball' },

  // Items
  { cat: 'items', name: 'Choice Band', iconClass: 'icon-choice-band' },
  { cat: 'items', name: 'Choice Specs', iconClass: 'icon-choice-specs' },
  { cat: 'items', name: 'Choice Scarf', iconClass: 'icon-choice-scarf' },
  { cat: 'items', name: 'Life Orb', iconClass: 'icon-life-orb' },
  { cat: 'items', name: 'Leftovers', iconClass: 'icon-leftovers' },
  { cat: 'items', name: 'Assault Vest', iconClass: 'icon-assault-vest' },
  { cat: 'items', name: 'Focus Sash', iconClass: 'icon-focus-sash' },
  { cat: 'items', name: 'Rocky Helmet', iconClass: 'icon-rocky-helmet' },
  { cat: 'items', name: 'Lucky Egg', iconClass: 'icon-lucky-egg' },
  { cat: 'items', name: 'Light Clay', iconClass: 'icon-light-clay' },
  { cat: 'items', name: 'Coleira Competitiva', iconClass: 'icon-collar' },
  { cat: 'items', name: 'Mint Leaf', iconClass: 'icon-mint-leaf' },
  { cat: 'items', name: 'White Herb', iconClass: 'icon-white-herb' },
  { cat: 'items', name: 'Red Card', iconClass: 'icon-red-card' },
  { cat: 'items', name: 'Cristal Evolutivo', iconClass: 'icon-stone-crystal' },
  { cat: 'items', name: 'Eviolite', iconClass: 'icon-eviolite' },

  // Badges & Alerts
  { cat: 'badges', name: 'Coroa Bronze', iconClass: 'icon-crown-bronze' },
  { cat: 'badges', name: 'Coroa Prata', iconClass: 'icon-crown-silver' },
  { cat: 'badges', name: 'Coroa Ouro', iconClass: 'icon-crown-gold' },
  { cat: 'badges', name: 'Coroa Platina', iconClass: 'icon-crown-platinum' },
  { cat: 'badges', name: 'Coroa Diamante', iconClass: 'icon-crown-diamond' },
  { cat: 'badges', name: 'Seta Cima (Verde)', iconClass: 'icon-arrow-up' },
  { cat: 'badges', name: 'Seta Baixo (Vermelho)', iconClass: 'icon-arrow-down' },
  { cat: 'badges', name: 'Traço (Neutro)', iconClass: 'icon-minus' },
  { cat: 'badges', name: 'Polegar Cima (Forte Contra)', iconClass: 'icon-thumbs-up' },
  { cat: 'badges', name: 'Polegar Baixo', iconClass: 'icon-thumbs-down' },
  { cat: 'badges', name: 'Alerta (Vulnerável A)', iconClass: 'icon-warning-alert' },
  { cat: 'badges', name: 'Caveira (Perigo/K.O.)', iconClass: 'icon-skull' },
  { cat: 'badges', name: 'Espadas Cruzadas', iconClass: 'icon-crossed-swords' },
  { cat: 'badges', name: 'Bandeira', iconClass: 'icon-flag' },
  { cat: 'badges', name: 'Insígnia Estrela', iconClass: 'icon-star-badge' },
  { cat: 'badges', name: 'Escudo Protetor', iconClass: 'icon-shield-badge' },
  { cat: 'badges', name: 'Troféu Campeão', iconClass: 'icon-trophy' },

  // Weather
  { cat: 'weather', name: 'Sol Intenso (Drought)', iconClass: 'icon-weather-sun' },
  { cat: 'weather', name: 'Nuvens', iconClass: 'icon-weather-clouds' },
  { cat: 'weather', name: 'Chuva (Drizzle)', iconClass: 'icon-weather-rain' },
  { cat: 'weather', name: 'Trovão / Tempestade', iconClass: 'icon-weather-thunder' },
  { cat: 'weather', name: 'Nevasca (Snow)', iconClass: 'icon-weather-snow' },
  { cat: 'weather', name: 'Ciclone', iconClass: 'icon-weather-cyclone' },
  { cat: 'weather', name: 'Vórtice Psíquico', iconClass: 'icon-weather-vortex' },
  { cat: 'weather', name: 'Tempestade de Areia', iconClass: 'icon-weather-sandstorm' },
  { cat: 'weather', name: 'Folhas Dançantes', iconClass: 'icon-weather-leaves' },
  { cat: 'weather', name: 'Arco-íris', iconClass: 'icon-weather-rainbow' },
  { cat: 'weather', name: 'Brilho Estelar', iconClass: 'icon-weather-sparkles' },
  { cat: 'weather', name: 'Portal Dimensional', iconClass: 'icon-portal-blue' }
];

function setupIconGallery() {
  const modal = document.getElementById('modalIconGallery');
  const btnOpen = document.getElementById('btnOpenIconGallery');
  const btnClose = document.getElementById('btnCloseGallery');
  const btnCloseFooter = document.getElementById('btnCloseGalleryFooter');
  const grid = document.getElementById('galleryGrid');
  const tabBtns = document.querySelectorAll('.modal-tabs .tab-btn');

  function renderGallery(catFilter = 'all') {
    grid.innerHTML = '';

    if (catFilter === 'fullsheet') {
      const fullView = document.createElement('div');
      fullView.className = 'fullsheet-view';
      fullView.innerHTML = `
        <h4 class="gallery-fullsheet-title">Cartela Completa Original (Sprite Sheet 1024×682)</h4>
        <div class="fullsheet-canvas" title="Cartela Completa"></div>
      `;
      grid.appendChild(fullView);
      return;
    }

    const filtered = catFilter === 'all' 
      ? ICONS_CATALOG 
      : ICONS_CATALOG.filter(item => item.cat === catFilter);

    filtered.forEach(icon => {
      const card = document.createElement('div');
      card.className = 'icon-card-item';
      card.title = `Clique para copiar classe CSS: .${icon.iconClass}`;
      card.innerHTML = `
        <span class="icon-card-preview ${icon.iconClass}"></span>
        <span class="icon-card-name">${icon.name}</span>
        <span class="icon-card-cat">${icon.cat}</span>
      `;

      card.addEventListener('click', () => {
        playSound('click');
        navigator.clipboard?.writeText(icon.iconClass);
        card.style.borderColor = '#00e676';
        const origName = icon.name;
        card.querySelector('.icon-card-name').textContent = 'Copiado! ✓';
        card.querySelector('.icon-card-name').style.color = '#00e676';
        setTimeout(() => {
          card.style.borderColor = '';
          card.querySelector('.icon-card-name').textContent = origName;
          card.querySelector('.icon-card-name').style.color = '';
        }, 1200);
      });

      grid.appendChild(card);
    });
  }

  btnOpen.addEventListener('click', () => {
    playSound('whoosh');
    modal.classList.add('open');
    renderGallery('all');
  });

  const closeModal = () => {
    playSound('click');
    modal.classList.remove('open');
  };

  btnClose.addEventListener('click', closeModal);
  btnCloseFooter.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery(btn.dataset.cat);
    });
  });
}

// ================= THREE.JS 3D PARTICLE ENGINE =================
function initThreeEngine() {
  if (typeof THREE === 'undefined') {
    console.warn('Three.js não carregado, usando fallback 2D');
    initCanvasFallback();
    return;
  }

  const canvas = DOM.canvas;
  const width = 682;
  const height = 1024;

  const scene = new THREE.Scene();
  state.three.scene = scene;

  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.z = 500;
  state.three.camera = camera;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.warn('WebGL não disponível:', err);
    initCanvasFallback();
    return;
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  state.three.renderer = renderer;

  // Particle Texture
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 64;
  texCanvas.height = 64;
  const ctx = texCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(255, 220, 80, 0.9)');
  grad.addColorStop(0.5, 'rgba(255, 100, 20, 0.6)');
  grad.addColorStop(0.8, 'rgba(220, 30, 5, 0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const particleTexture = new THREE.CanvasTexture(texCanvas);

  // Particles Geometry & Data
  const particleCount = 220;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const particlesData = [];

  const defaultPalette = TYPE_PARTICLE_PALETTES.fire;
  state.three.currentPalette = defaultPalette;

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 550;
    const y = (Math.random() - 0.5) * 800;
    const z = (Math.random() - 0.5) * 200;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const c = defaultPalette[Math.floor(Math.random() * defaultPalette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    sizes[i] = Math.random() * 22 + 8;

    particlesData.push({
      vy: Math.random() * 1.8 + 0.8,
      vx: (Math.random() - 0.5) * 0.6,
      vz: (Math.random() - 0.5) * 0.4,
      seed: Math.random() * 100
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 20,
    vertexColors: true,
    map: particleTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
  state.three.particleSystem = particleSystem;
  state.three.particlesData = particlesData;

  const clock = new THREE.Clock();

  function animate() {
    state.three.animId = requestAnimationFrame(animate);

    if (!state.enableParticles) {
      renderer.clear();
      return;
    }

    const time = clock.getElapsedTime();
    const pos = geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      const data = particlesData[i];

      pos[i * 3 + 1] += data.vy;
      pos[i * 3] += Math.sin(time * 1.5 + data.seed) * 0.7 + data.vx;
      pos[i * 3 + 2] += Math.cos(time * 1.2 + data.seed) * 0.4 + data.vz;

      // Mouse interactive force field
      if (state.three.mouse.x !== 0 || state.three.mouse.y !== 0) {
        const dx = pos[i * 3] - state.three.mouse.x * 250;
        const dy = pos[i * 3 + 1] - state.three.mouse.y * 400;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 1) {
          pos[i * 3] += (dx / dist) * 1.2;
          pos[i * 3 + 1] += (dy / dist) * 1.2;
        }
      }

      if (pos[i * 3 + 1] > 480) {
        pos[i * 3 + 1] = -480;
        pos[i * 3] = (Math.random() - 0.5) * 550;
      }
    }

    geometry.attributes.position.needsUpdate = true;

    camera.position.x += (state.three.mouse.x * 25 - camera.position.x) * 0.05;
    camera.position.y += (-state.three.mouse.y * 25 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
}

// Fallback 2D Canvas if Three.js/WebGL is unavailable
function initCanvasFallback() {
  const canvas = DOM.canvas;
  const ctx = canvas.getContext('2d');
  canvas.width = 682;
  canvas.height = 1024;

  const particles = [];
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 4 + 2,
      vy: Math.random() * 2 + 1,
      color: 'rgba(255, 150, 30, 0.75)'
    });
  }

  function render2D() {
    if (!state.enableParticles) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      requestAnimationFrame(render2D);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y -= p.vy;
      if (p.y < 0) {
        p.y = canvas.height;
        p.x = Math.random() * canvas.width;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    requestAnimationFrame(render2D);
  }
  render2D();
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  setupTilt();
  setupEvents();
  setupIconGallery();
  initThreeEngine();
  initPokedexCatalog();
  loadAndDisplayPokemon(6); // Pre-load Charizard as initial active card
  switchView('pokedex'); // Default to home Pokédex search view
});
