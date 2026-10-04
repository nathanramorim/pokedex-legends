import { notFound } from 'next/navigation';
import { PokemonNotFoundError } from '@/domain';
import { DexShell } from '@/presentation/components/dex-shell/DexShell';
import { PokemonDetailView } from '@/presentation/components/features/detail/PokemonDetailView';
import { StateMessage } from '@/presentation/components/ui';
import { env } from '@/main/config/env';
import { useCases } from '@/main/container';
import { formatName } from '@/presentation/format';

export const revalidate = 86400;
export const dynamicParams = true;

type Params = { params: Promise<{ id: string }> };

async function load(id: string) {
  if (!/^\d+$/.test(id) || Number(id) < 1) return { status: 'not-found' as const };
  try {
    return { status: 'ok' as const, detail: await useCases.getPokemonDetail(Number(id)) };
  } catch (error) {
    return error instanceof PokemonNotFoundError ? { status: 'not-found' as const } : { status: 'error' as const };
  }
}

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const result = await load(id);
  return { title: result.status === 'ok' ? `${formatName(result.detail.pokemon.name)} · Pokédex` : 'Pokédex' };
}

export default async function PokemonPage({ params }: Params) {
  const { id } = await params;
  const result = await load(id);
  if (result.status === 'not-found') notFound();
  return (
    <DexShell>
      {result.status === 'ok' ? (
        <PokemonDetailView detail={result.detail} itemIconBaseUrl={env.itemIconBaseUrl} />
      ) : (
        <StateMessage kind="error">Não foi possível carregar este Pokémon. Tente novamente em instantes.</StateMessage>
      )}
    </DexShell>
  );
}
