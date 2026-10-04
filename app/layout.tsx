import type { Metadata, Viewport } from 'next';
import { InstallPrompt } from '@/presentation/pwa/InstallPrompt';
import { ServiceWorkerRegister } from '@/presentation/pwa/ServiceWorkerRegister';
import '@/presentation/styles/tokens.css';

export const metadata: Metadata = {
  title: 'Pokédex',
  description: 'Pokédex mobile-first com dados da PokéAPI',
  applicationName: 'Pokédex Legends',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/icons/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'Pokédex', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#dc0a2d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
