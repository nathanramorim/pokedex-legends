import type { PokemonDetail } from '@/application';
import type { TypeRelations } from '@/domain';

const rel = (type: TypeRelations['type'], r: Partial<TypeRelations>): TypeRelations => ({
  type, doubleDamageTo: [], halfDamageTo: [], noDamageTo: [], doubleDamageFrom: [], halfDamageFrom: [], noDamageFrom: [], ...r,
});

export const fireRelations = rel('fire', {
  doubleDamageFrom: ['water', 'ground', 'rock'],
  halfDamageFrom: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
  doubleDamageTo: ['grass', 'ice', 'bug', 'steel'],
  halfDamageTo: ['fire', 'water', 'rock', 'dragon'],
});

export const flyingRelations = rel('flying', {
  doubleDamageFrom: ['electric', 'ice', 'rock'],
  halfDamageFrom: ['grass', 'fighting', 'bug'],
  noDamageFrom: ['ground'],
  doubleDamageTo: ['grass', 'fighting', 'bug'],
  halfDamageTo: ['electric', 'rock', 'steel'],
});

export const charizardDetail: PokemonDetail = {
  pokemon: {
    id: 6, name: 'charizard', types: ['fire', 'flying'], height: 17, weight: 905,
    stats: [
      { name: 'hp', value: 78 }, { name: 'attack', value: 84 }, { name: 'defense', value: 78 },
      { name: 'special-attack', value: 109 }, { name: 'special-defense', value: 85 }, { name: 'speed', value: 100 },
    ],
    abilities: [{ name: 'blaze', isHidden: false }, { name: 'solar-power', isHidden: true }],
    heldItems: [],
    artworkUrl: 'https://art/6.png',
  },
  species: {
    id: 6, name: 'charizard', genus: 'Flame Pokémon', description: 'Spits fire that is hot enough to melt boulders.',
    captureRate: 45, habitat: 'mountain', color: 'red', isLegendary: false, isMythical: false, evolutionChainId: 2,
    varieties: [],
  },
  abilities: [
    { name: 'blaze', description: 'Powers up Fire-type moves in a pinch.' },
    { name: 'solar-power', description: 'Boosts Sp. Atk in sunshine.' },
  ],
  evolution: null,
  megaForms: [],
  moves: [
    { name: 'scratch', type: 'normal', category: 'physical', power: 40, accuracy: 100, pp: 35, level: 1, effect: 'Inflicts regular damage with no additional effect.', effectChance: null, priority: 0, target: 'selected-pokemon' },
    { name: 'ember', type: 'fire', category: 'special', power: 40, accuracy: 100, pp: 25, level: 7, effect: 'Has a 10% chance to burn the target.', effectChance: 10, priority: 0, target: 'selected-pokemon' },
    { name: 'dragon-dance', type: 'dragon', category: 'status', power: null, accuracy: null, pp: 20, level: 40, effect: '', effectChance: null, priority: 1, target: 'user' },
  ],
  typeRelations: [fireRelations, flyingRelations],
};
