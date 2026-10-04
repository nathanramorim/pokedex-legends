import type { PokemonType } from '@/domain';

const PATHS: Record<PokemonType, string> = {
  normal: 'M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
  fire: 'M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3-1-4 0-7 1-10z',
  water: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z',
  electric: 'M13 2 5 13h5l-1 9 9-12h-5l0-8z',
  grass: 'M5 19C5 10 10 5 20 4c0 10-5 15-12 15l-3 3-1-1 3-3c-1-2-1-4 0-6',
  ice: 'M11 2h2v6l4-3 1 2-4 3 4 3-1 2-4-3v6h-2v-6l-4 3-1-2 4-3-4-3 1-2 4 3z',
  fighting: 'M6 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zm3 0v3h2V9zm4 0v3h2V9z',
  poison: 'M12 3a7 7 0 0 0-3 13v3h6v-3a7 7 0 0 0-3-13zm-2.500 7a1.500 1.500 0 1 1 0 3 1.500 1.500 0 0 1 0-3zm5 0a1.500 1.500 0 1 1 0 3 1.500 1.500 0 0 1 0-3z',
  ground: 'M2 19 9 7l4 6 3-4 6 10z',
  flying: 'M3 14c4-1 6-4 9-9 1 4 4 7 9 9-4 0-6 1-9 5-3-4-5-5-9-5z',
  psychic: 'M12 6C6 6 3 12 3 12s3 6 9 6 9-6 9-6-3-6-9-6zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
  bug: 'M12 6a3 3 0 0 1 3 3v1h3v2h-3v1l3 2-1 2-3-1v2h-4v-2l-3 1-1-2 3-2v-1H6v-2h3V9a3 3 0 0 1 3-3z',
  rock: 'M7 4h10l4 6-3 10H6L3 10z',
  ghost: 'M12 3a7 7 0 0 0-7 7v11l3-2 2 2 2-2 2 2 2-2 3 2V10a7 7 0 0 0-7-7zM9.500 9a1.500 1.500 0 1 1 0 3 1.500 1.500 0 0 1 0-3zm5 0a1.500 1.500 0 1 1 0 3 1.500 1.500 0 0 1 0-3z',
  dragon: 'M4 6c3 0 5 2 6 4l3-1 3 2-2 3 3 4-4-1-3 3-1-4C5 15 3 11 4 6z',
  dark: 'M15 3a9 9 0 1 0 6 14 7 7 0 0 1-6-14z',
  steel: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM10 2h4l1 3 3-1 2 3-3 2 1 3 3 1v4l-3 1-1 3-3-1-2 3-2-3-3 1-1-3-3-1v-4l3-1 1-3-3-2 2-3 3 1z',
  fairy: 'M12 2l2.500 6.500L21 11l-6.500 2.500L12 20l-2.500-6.500L3 11l6.500-2.500z',
};

interface Props {
  type: PokemonType;
  size?: number;
  className?: string;
}

export function TypeIcon({ type, size = 20, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[type]} fillRule="evenodd" />
    </svg>
  );
}
