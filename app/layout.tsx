import type { Metadata, Viewport } from 'next';
import '@/presentation/styles/tokens.css';

export const metadata: Metadata = {
  title: 'Pokédex',
  description: 'Pokédex mobile-first com dados da PokéAPI',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#dc0a2d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
