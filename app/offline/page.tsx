import Link from 'next/link';
import { DexShell } from '@/presentation/components/dex-shell/DexShell';
import { StateMessage } from '@/presentation/components/ui';

export const dynamic = 'force-static';
export const metadata = { title: 'Sem conexão · Pokédex', robots: { index: false } };

/** Página mostrada quando não há internet e a tela pedida ainda não foi visitada. */
export default function OfflinePage() {
  return (
    <DexShell>
      <div style={{ background: 'var(--dex-white)', border: '3px solid var(--dex-ink)', borderRadius: 'var(--radius)' }}>
        <StateMessage kind="empty" title="Você está sem internet">
          Esta tela ainda não foi guardada no aparelho. Os Pokémon que você já abriu continuam disponíveis.
        </StateMessage>
      </div>
      {/* Sem JavaScript o Link vira um <a> comum: a página funciona mesmo sem os scripts em cache */}
      <Link href="/" prefetch={false} style={{ alignSelf: 'center', color: 'var(--dex-white)', fontWeight: 800, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
        Tentar de novo
      </Link>
    </DexShell>
  );
}
