import { readFileSync } from 'node:fs';
import { metadata, viewport } from '../../app/layout';
import manifest from '../../app/manifest';

/** Largura e altura lidas do cabeçalho IHDR de um PNG. */
function pngSize(path: string) {
  const buf = readFileSync(path);
  expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe('manifesto (P1)', () => {
  const m = manifest();

  it('tem os campos de instalação', () => {
    expect(m.name).toBe('Pokédex Legends');
    expect(m.short_name).toBe('Pokédex');
    expect(m.display).toBe('standalone');
    expect(m.start_url).toBe('/');
    expect(m.scope).toBe('/');
    expect(m.lang).toBe('pt-BR');
    expect(m.orientation).toBe('any'); // retrato e landscape
    expect(m.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(m.background_color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('declara ícones 192, 512 e maskable que existem em public/', () => {
    const icons = m.icons ?? [];
    const find = (size: string, purpose: string) => icons.find((i) => i.sizes === size && i.purpose === purpose);
    for (const [size, purpose] of [['192x192', 'any'], ['512x512', 'any'], ['512x512', 'maskable']] as const) {
      const icon = find(size, purpose);
      expect(icon, `${size} ${purpose}`).toBeDefined();
      expect(icon?.type).toBe('image/png');
      expect(() => readFileSync(`public${icon!.src}`)).not.toThrow();
    }
  });
});

describe('ícones (P2)', () => {
  it.each([
    ['public/icons/icon-192.png', 192],
    ['public/icons/icon-512.png', 512],
    ['public/icons/icon-maskable-512.png', 512],
    ['public/icons/apple-touch-icon.png', 180],
  ])('%s tem %i×%i', (path, size) => {
    expect(pngSize(path)).toEqual({ width: size, height: size });
  });
});

describe('metadata do iOS e tema (P3)', () => {
  it('declara apple-touch-icon, modo app, manifesto e cor do tema', () => {
    expect(metadata.icons).toMatchObject({ apple: '/icons/apple-touch-icon.png' });
    expect(metadata.appleWebApp).toMatchObject({ capable: true, title: 'Pokédex' });
    expect(metadata.manifest).toBe('/manifest.webmanifest');
    expect(viewport.themeColor).toBe('#dc0a2d');
  });

  it('usa a tela inteira (viewport-fit=cover) e as margens seguras no shell', () => {
    expect(viewport.viewportFit).toBe('cover');
    const css = readFileSync('src/presentation/components/dex-shell/DexShell.module.css', 'utf8');
    for (const side of ['top', 'bottom', 'left', 'right']) expect(css).toContain(`env(safe-area-inset-${side})`);
  });
});

describe('cabeçalhos (service worker e manifesto não ficam em cache longo)', () => {
  it('next.config define no-cache para /sw.js e /manifest.webmanifest', async () => {
    const { default: config } = await import('../../next.config');
    const rules = (await config.headers?.()) ?? [];
    const sw = rules.find((r) => r.source === '/sw.js');
    const man = rules.find((r) => r.source === '/manifest.webmanifest');
    expect(sw?.headers).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'Cache-Control', value: expect.stringContaining('no-cache') }),
      expect.objectContaining({ key: 'Service-Worker-Allowed', value: '/' }),
    ]));
    expect(man?.headers).toEqual(expect.arrayContaining([expect.objectContaining({ key: 'Cache-Control', value: expect.stringContaining('no-cache') })]));
  });
});
