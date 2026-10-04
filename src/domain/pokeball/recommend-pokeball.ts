import type { PokemonType } from '../entities/pokemon-type';

export type PokeballName =
  | 'poke-ball' | 'great-ball' | 'ultra-ball' | 'master-ball'
  | 'net-ball' | 'dive-ball' | 'dusk-ball' | 'quick-ball';

export type CaptureDifficulty = 'easy' | 'medium' | 'hard' | 'very-hard';

export interface CaptureProfile {
  captureRate: number;
  habitat: string | null;
  types: PokemonType[];
  isLegendary: boolean;
  isMythical: boolean;
}

export interface PokeballRecommendation {
  ball: PokeballName;
  alternative: PokeballName | null;
  reason: string;
  difficulty: CaptureDifficulty;
}

export function captureDifficulty(captureRate: number): CaptureDifficulty {
  if (captureRate >= 200) return 'easy';
  if (captureRate >= 120) return 'medium';
  if (captureRate >= 45) return 'hard';
  return 'very-hard';
}

/**
 * Dica derivada por regras (a PokéAPI não fornece isso). Função pura:
 * mesma entrada, mesma saída. Ordem das regras = prioridade.
 */
export function recommendPokeball(profile: CaptureProfile): PokeballRecommendation {
  const difficulty = captureDifficulty(profile.captureRate);
  const { types, habitat } = profile;
  const result = (ball: PokeballName, reason: string, alternative: PokeballName | null = null): PokeballRecommendation => ({
    ball, alternative, reason, difficulty,
  });

  if (profile.isLegendary || profile.isMythical) {
    return result(
      'ultra-ball',
      'Lendário ou mítico: taxa de captura muito baixa. Enfraqueça bem e cause status (sono ou paralisia) antes de usar a Ultra Ball.',
      'master-ball',
    );
  }
  if (types.includes('water') || types.includes('bug')) {
    return result('net-ball', 'Tipo Água ou Inseto: a Net Ball tem bônus de captura contra esses tipos.', 'ultra-ball');
  }
  if (habitat === 'sea' || habitat === 'waters-edge') {
    return result('dive-ball', 'Vive no mar ou na beira da água: a Dive Ball funciona melhor em água ou pescando.', 'great-ball');
  }
  if (habitat === 'cave' || types.includes('ghost') || types.includes('dark')) {
    return result('dusk-ball', 'Vive em cavernas ou é Fantasma/Sombrio: a Dusk Ball rende mais em locais escuros ou à noite.', 'ultra-ball');
  }
  if (difficulty === 'very-hard') {
    return result('ultra-ball', 'Taxa de captura muito baixa: use a Ultra Ball depois de enfraquecer o Pokémon.', 'master-ball');
  }
  if (difficulty === 'hard') {
    return result('great-ball', 'Captura difícil: a Great Ball ajuda, principalmente com o Pokémon enfraquecido.', 'ultra-ball');
  }
  if (difficulty === 'medium') {
    return result('quick-ball', 'Captura mediana: a Quick Ball é ótima se for lançada no primeiro turno.', 'great-ball');
  }
  return result('poke-ball', 'Captura fácil: a Poké Ball comum é suficiente.', 'quick-ball');
}
