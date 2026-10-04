import Link from 'next/link';
import { DexShell } from '@/presentation/components/dex-shell/DexShell';
import { StateMessage } from '@/presentation/components/ui';

export default function NotFound() {
  return (
    <DexShell>
      <StateMessage kind="empty" title="Pokémon não encontrado">
        <Link href="/">Voltar para a lista</Link>
      </StateMessage>
    </DexShell>
  );
}
