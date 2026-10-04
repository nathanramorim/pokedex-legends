export const formatName = (name: string) =>
  name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export const formatNumber = (id: number) => `#${String(id).padStart(4, '0')}`;

import type { EvolutionDetail } from '@/domain';

const TIME_OF_DAY: Record<string, string> = { day: 'de dia', night: 'à noite' };

export function describeEvolution(details: EvolutionDetail[]): string {
  if (details.length === 0) return '';
  const d = details[0];
  const parts: string[] = [];
  if (d.trigger === 'trade') parts.push(d.heldItem ? `Troca segurando ${formatName(d.heldItem)}` : 'Troca');
  else if (d.trigger === 'use-item' && d.item) parts.push(`Usar ${formatName(d.item)}`);
  else if (d.minLevel) parts.push(`Nível ${d.minLevel}`);
  else if (d.minHappiness) parts.push(`Amizade ${d.minHappiness}+`);
  else if (d.knownMove) parts.push(`Conhecendo ${formatName(d.knownMove)}`);
  else if (d.location) parts.push(`Em ${formatName(d.location)}`);
  else parts.push('Evolui');
  if (d.timeOfDay && TIME_OF_DAY[d.timeOfDay]) parts.push(TIME_OF_DAY[d.timeOfDay]);
  if (d.minLevel && d.trigger === 'level-up' && parts[0] !== `Nível ${d.minLevel}`) parts.push(`nível ${d.minLevel}`);
  return parts.join(' ');
}

const TARGET_LABELS: Record<string, string> = {
  'specific-move': 'Depende do golpe',
  'selected-pokemon-me-first': 'Um oponente (Me First)',
  ally: 'Um aliado',
  'users-field': 'Lado do usuário',
  'user-or-ally': 'O usuário ou um aliado',
  'opponents-field': 'Lado dos oponentes',
  user: 'O próprio usuário',
  'random-opponent': 'Um oponente aleatório',
  'all-other-pokemon': 'Todos os outros Pokémon',
  'selected-pokemon': 'Um oponente',
  'all-opponents': 'Todos os oponentes',
  'entire-field': 'Campo inteiro',
  'user-and-allies': 'O usuário e os aliados',
  'all-pokemon': 'Todos os Pokémon',
  'all-allies': 'Todos os aliados',
  'fainting-pokemon': 'Pokémon derrotado',
};

export const describeTarget = (target: string): string =>
  TARGET_LABELS[target] ?? (target ? formatName(target) : 'Não informado');

export const describePriority = (priority: number): string =>
  priority === 0 ? 'Normal' : `${priority > 0 ? '+' : ''}${priority}`;
