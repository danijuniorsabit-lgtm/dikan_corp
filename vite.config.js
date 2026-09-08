import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nunjucksPages from './plugins/nunjucks-pages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pages = [
  'index',
  'products',
  'product-detail',
  'calculator',
  'finance',
  'services',
  'about',
  'projects',
  'equipment',
  'faq',
];

export default defineConfig({
  root: __dirname,
  base: '/',
  // Vite copies this directory's contents to the dist root as-is, on both
  // `vite dev` and `vite build` — this is what puts public/favicon.ico,
  // favicon.svg and images/logo.jpg (the DIKAN gear+wheat mark, referenced
  // from base.njk's <link rel="icon">/<link rel="apple-touch-icon"> tags)
  // at the site root without any extra copy step. logo/team/product photos
  // under src/assets/images/ are mirrored into public/images/ first, by
  // plugins/nunjucks-pages.js, then land here the same way.
  publicDir: 'public',
  plugins: [nunjucksPages()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((name) => [name, path.resolve(__dirname, `${name}.html`)])
      ),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
