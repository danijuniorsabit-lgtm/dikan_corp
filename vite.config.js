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
