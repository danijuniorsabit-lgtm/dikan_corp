import nunjucks from 'nunjucks';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const templatesDir = path.resolve(root, 'src/templates');
const pagesDir = path.resolve(templatesDir, 'pages');
const componentsDir = path.resolve(templatesDir, 'components');
const layoutsDir = path.resolve(templatesDir, 'layouts');
const dataDir = path.resolve(templatesDir, 'data');
const publicDataDir = path.resolve(root, 'public/data');
const imagesDir = path.resolve(root, 'src/assets/images');
const modelsDir = path.resolve(root, 'src/assets/models');
const publicModelsDir = path.resolve(root, 'public/models');

function loadData() {
  const data = {};
  if (!fs.existsSync(dataDir)) return data;
  for (const file of fs.readdirSync(dataDir)) {
    if (file.endsWith('.json')) {
      const key = path.basename(file, '.json');
      data[key] = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
    }
  }
  return data;
}

// Mirrors data/products.json into public/data/ so client-side JS (product
// detail page routing by ?slug=) can fetch it at runtime — public/ is served
// as-is by both `vite dev` and the production build.
function publishProductsData() {
  fs.mkdirSync(publicDataDir, { recursive: true });
  fs.copyFileSync(
    path.join(dataDir, 'products.json'),
    path.join(publicDataDir, 'products.json')
  );
}

// Skips the copy once source and destination already match (mtime + size) —
// the 3D models are tens of MB each, not worth re-copying on every unrelated
// template edit during `vite dev`.
function copyIfChanged(src, dest) {
  const srcStat = fs.statSync(src);
  if (fs.existsSync(dest)) {
    const destStat = fs.statSync(dest);
    if (destStat.size === srcStat.size && destStat.mtimeMs >= srcStat.mtimeMs) return;
  }
  fs.copyFileSync(src, dest);
}

// Assets authored under src/assets/ (logo, .glb models) that need a stable
// runtime URL — same reasoning as publishProductsData(): src/ isn't served
// as-is by Vite, only public/ is, so anything fetched/`<img src>`'d at
// runtime rather than imported by JS/CSS has to be mirrored into public/.
function publishStaticAssets(logger) {
  const logoSrc = path.join(imagesDir, 'logo.jpg');
  if (fs.existsSync(logoSrc)) {
    const publicImagesDir = path.resolve(root, 'public/images');
    fs.mkdirSync(publicImagesDir, { recursive: true });
    copyIfChanged(logoSrc, path.join(publicImagesDir, 'logo.jpg'));
  }

  if (fs.existsSync(modelsDir)) {
    fs.mkdirSync(publicModelsDir, { recursive: true });
    for (const file of fs.readdirSync(modelsDir)) {
      if (!file.endsWith('.glb')) continue;
      try {
        copyIfChanged(path.join(modelsDir, file), path.join(publicModelsDir, file));
      } catch (err) {
        const message = `[nunjucks-pages] failed to publish model ${file}: ${err.message}`;
        if (logger) logger.error(message);
        else console.error(message);
      }
    }
  }
}

function renderPages(env, logger) {
  const data = loadData();
  publishProductsData();
  publishStaticAssets(logger);
  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.njk'));
  for (const file of files) {
    const name = path.basename(file, '.njk');
    try {
      const html = env.render(file, { ...data, page: name, ...pageContext(name, data) });
      fs.writeFileSync(path.resolve(root, `${name}.html`), html, 'utf-8');
    } catch (err) {
      const message = `[nunjucks-pages] failed to render ${file}: ${err.message}`;
      if (logger) logger.error(message);
      else console.error(message);
    }
  }
}

// Per-page context that can't be expressed as static JSON (derived from
// other data files) — kept here rather than in Nunjucks (Nunjucks has no
// reliable array-exclude/slice built-in) so templates stay presentation-only.
function pageContext(name, data) {
  if (name === 'product-detail' && data.products?.items?.length) {
    const [currentProduct, ...similarProducts] = data.products.items;
    return { currentProduct, similarProducts };
  }
  return {};
}

function isInsideTemplates(file) {
  const rel = path.relative(templatesDir, file);
  return Boolean(rel) && !rel.startsWith('..') && !path.isAbsolute(rel);
}

// Renders src/templates/pages/*.njk (extending layouts/, including components/,
// fed by data/*.json) into static *.html files at the project root — the real
// entry points Vite/Rollup build against, and the same files that later map
// 1:1 onto Bitrix header.php/footer.php + component templates.
export default function nunjucksPages() {
  const env = nunjucks.configure([pagesDir, componentsDir, layoutsDir], {
    autoescape: true,
    noCache: true,
    trimBlocks: true,
    lstripBlocks: true,
  });

  return {
    name: 'nunjucks-pages',
    async buildStart() {
      renderPages(env, this.warn ? this : null);
    },
    configureServer(server) {
      server.watcher.add(templatesDir);
      const rerender = (file) => {
        if (!isInsideTemplates(file)) return;
        renderPages(env, server.config.logger);
        server.config.logger.info(
          `[nunjucks-pages] rebuilt (${path.relative(root, file)} changed)`,
          {
            timestamp: true,
          }
        );
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('change', rerender);
      server.watcher.on('add', rerender);
      server.watcher.on('unlink', rerender);
    },
  };
}
