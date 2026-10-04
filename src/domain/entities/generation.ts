export interface Generation {
  id: number;
  label: string;
  firstId: number;
  lastId: number;
}

export const GENERATIONS: readonly Generation[] = [
  { id: 1, label: 'Kanto', firstId: 1, lastId: 151 },
  { id: 2, label: 'Johto', firstId: 152, lastId: 251 },
  { id: 3, label: 'Hoenn', firstId: 252, lastId: 386 },
  { id: 4, label: 'Sinnoh', firstId: 387, lastId: 493 },
  { id: 5, label: 'Unova', firstId: 494, lastId: 649 },
  { id: 6, label: 'Kalos', firstId: 650, lastId: 721 },
  { id: 7, label: 'Alola', firstId: 722, lastId: 809 },
  { id: 8, label: 'Galar', firstId: 810, lastId: 905 },
  { id: 9, label: 'Paldea', firstId: 906, lastId: 1025 },
];

export function generationOf(pokemonId: number): Generation | undefined {
  return GENERATIONS.find((g) => pokemonId >= g.firstId && pokemonId <= g.lastId);
}
