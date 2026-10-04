// Gera os ícones do PWA a partir da Pokébola nas cores da Pokédex.
// Uso: node scripts/generate-icons.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const RED = '#dc0a2d';
const RED_DARK = '#9e0620';
const INK = '#222224';

/** Pokébola centralizada; `scale` é a fração da largura ocupada pela bola. */
function iconSvg(size, scale) {
  const c = size / 2;
  const r = (size * scale) / 2;
  const stroke = Math.max(2, size * 0.028);
  const button = r * 0.3;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${RED}"/>
  <circle cx="${c}" cy="${c}" r="${r}" fill="#fff"/>
  <path d="M${c - r} ${c}a${r} ${r} 0 0 1 ${r * 2} 0z" fill="${RED_DARK}"/>
  <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${INK}" stroke-width="${stroke}"/>
  <line x1="${c - r}" y1="${c}" x2="${c + r}" y2="${c}" stroke="${INK}" stroke-width="${stroke}"/>
  <circle cx="${c}" cy="${c}" r="${button}" fill="#fff" stroke="${INK}" stroke-width="${stroke}"/>
  <circle cx="${c}" cy="${c}" r="${button * 0.45}" fill="#fff" stroke="${INK}" stroke-width="${stroke * 0.5}"/>
</svg>`;
}

const ICONS = [
  // [arquivo, tamanho, fração ocupada pela bola]
  ['icon-192.png', 192, 0.62],
  ['icon-512.png', 512, 0.62],
  // maskable: a bola cabe na zona segura (círculo central de 80%)
  ['icon-maskable-512.png', 512, 0.5],
  ['apple-touch-icon.png', 180, 0.62],
];

await mkdir('public/icons', { recursive: true });
for (const [file, size, scale] of ICONS) {
  const png = await sharp(Buffer.from(iconSvg(size, scale))).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(`public/icons/${file}`, png);
  console.log(`✓ public/icons/${file} (${size}×${size})`);
}
