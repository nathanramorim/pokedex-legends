import { DexShell } from '@/presentation/components/dex-shell/DexShell';
import { StateMessage } from '@/presentation/components/ui';

export default function Loading() {
  return (
    <DexShell>
      <StateMessage kind="loading" title="Carregando Pokémon…" />
    </DexShell>
  );
}
