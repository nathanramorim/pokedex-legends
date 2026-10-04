import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const threePaths = [{ name: 'three', message: 'Three.js só em src/presentation/three/' }];
const threePatterns = ['three/addons/*', 'three/examples/*'];

const forbiddenInCore = {
  paths: [
    { name: 'react' },
    { name: 'react-dom' },
    { name: 'next' },
    ...threePaths,
  ],
  patterns: ['next/*', 'react-dom/*', ...threePatterns, '@/presentation', '@/presentation/*', '@/infrastructure', '@/infrastructure/*', '@/main', '@/main/*'],
};

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: ['legacy/**', '.next/**', 'node_modules/**'] },
  {
    // Clean Architecture: domain não depende de ninguém de fora
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { paths: forbiddenInCore.paths, patterns: [...forbiddenInCore.patterns, '@/application', '@/application/*'] }],
      'no-restricted-globals': ['error', 'fetch'],
    },
  },
  {
    // application depende só de domain
    files: ['src/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', forbiddenInCore],
      'no-restricted-globals': ['error', 'fetch'],
    },
  },
  {
    // infrastructure não conhece a UI
    files: ['src/infrastructure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { paths: [{ name: 'react' }, { name: 'react-dom' }, ...threePaths], patterns: [...threePatterns, '@/presentation', '@/presentation/*'] }],
    },
  },
  {
    // UI não chama a API direto e só Three em presentation/three
    files: ['src/presentation/**/*.{ts,tsx}'],
    ignores: ['src/presentation/three/**'],
    rules: {
      'no-restricted-imports': ['error', { paths: threePaths, patterns: [...threePatterns, '@/infrastructure', '@/infrastructure/*'] }],
    },
  },
];

export default config;
