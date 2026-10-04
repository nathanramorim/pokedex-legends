'use client';

import { Button, StateMessage } from '@/presentation/components/ui';
import { DexShell } from '@/presentation/components/dex-shell/DexShell';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <DexShell>
      <StateMessage kind="error">Algo inesperado aconteceu.</StateMessage>
      <Button onClick={reset}>Tentar novamente</Button>
    </DexShell>
  );
}
