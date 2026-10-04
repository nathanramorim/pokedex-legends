import type { MoveCategory } from '@/domain';

const PATHS: Record<MoveCategory, string> = {
  // explosão (físico)
  physical: 'M12 2l2.200 5.300L20 6l-2.500 5L22 14l-5.500 1L15 21l-3-4-3 4-1.500-6L2 14l4.500-3L4 6l5.800 1.300z',
  // espiral (especial)
  special: 'M12 3a9 9 0 1 0 9 9h-3a6 6 0 1 1-6-6zm0 5a4 4 0 1 0 4 4h-2.500a1.500 1.500 0 1 1-1.500-1.500z',
  // escudo (status)
  status: 'M12 2 4 5v6c0 5 3.400 9.300 8 11 4.600-1.700 8-6 8-11V5z',
};

export const CATEGORY_LABELS: Record<MoveCategory, string> = {
  physical: 'Físico',
  special: 'Especial',
  status: 'Status',
};

export function DamageClassIcon({ category, size = 16 }: { category: MoveCategory; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={PATHS[category]} fillRule="evenodd" />
    </svg>
  );
}
