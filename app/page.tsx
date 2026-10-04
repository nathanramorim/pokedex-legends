import { StateMessage } from '@/presentation/components/ui';
import { DexShell } from '@/presentation/components/dex-shell/DexShell';
import { PokemonBrowser } from '@/presentation/components/features/list/PokemonBrowser';
import { env } from '@/main/config/env';
import { useCases } from '@/main/container';

export const revalidate = 86400;

async function loadList() {
  try {
    return await useCases.listPokemon();
  } catch {
    return null;
  }
}

export default async function Home() {
  const items = await loadList();
  return (
    <DexShell>
      <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Pokédex</h1>
      {items ? (
        <PokemonBrowser items={items} artworkBaseUrl={env.artworkBaseUrl} />
      ) : (
        <StateMessage kind="error">Não foi possível carregar a lista. Tente novamente em instantes.</StateMessage>
      )}
    </DexShell>
  );
}
