import nunjucks from 'nunjucks';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { formatPriceFrom } from '../src/assets/js/utils/format.js';

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
const publicImagesDir = path.resolve(root, 'public/images');

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

// Mirrors every src/templates/data/*.json into public/data/ so client-side
// JS (product detail page routing by ?slug=, the projects map) can fetch it
// at runtime — public/ is served as-is by both `vite dev` and the
// production build.
function publishData() {
  if (!fs.existsSync(dataDir)) return;
  fs.mkdirSync(publicDataDir, { recursive: true });
  for (const file of fs.readdirSync(dataDir)) {
    if (!file.endsWith('.json')) continue;
    fs.copyFileSync(path.join(dataDir, file), path.join(publicDataDir, file));
  }
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
// runtime URL — same reasoning as publishData(): src/ isn't served
// as-is by Vite, only public/ is, so anything fetched/`<img src>`'d at
// runtime rather than imported by JS/CSS has to be mirrored into public/.
function publishImageDir(subdir, logger) {
  const srcDir = path.join(imagesDir, subdir);
  if (!fs.existsSync(srcDir)) return;
  const destDir = path.join(publicImagesDir, subdir);
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.join(srcDir, file);
    if (!fs.statSync(srcFile).isFile()) continue;
    try {
      copyIfChanged(srcFile, path.join(destDir, file));
    } catch (err) {
      const message = `[nunjucks-pages] failed to publish image ${subdir}/${file}: ${err.message}`;
      if (logger) logger.error(message);
      else console.error(message);
    }
  }
}

function publishStaticAssets(logger) {
  fs.mkdirSync(publicImagesDir, { recursive: true });

  // Loose files directly under src/assets/images/ (logo, hero banners, …)
  // that need a stable runtime URL — mirrored 1:1 into public/images/.
  publishImageDir('.', logger);

  // Photography subfolders — src/assets/images/<subdir>/ ->
  // public/images/<subdir>/, same "src isn't served as-is" reasoning.
  // Discovered automatically so a new subfolder doesn't need a code change.
  for (const entry of fs.readdirSync(imagesDir, { withFileTypes: true })) {
    if (entry.isDirectory()) publishImageDir(entry.name, logger);
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

// Reads width/height straight from a .webp header (VP8 / VP8L / VP8X) so
// templates can emit explicit <img width height> and reserve layout space
// without a runtime image library. Falls back to `fallback` for remote or
// unreadable images.
function webpSize(file) {
  try {
    const fd = fs.openSync(file, 'r');
    const b = Buffer.alloc(32);
    fs.readSync(fd, b, 0, 32, 0);
    fs.closeSync(fd);
    if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
    }
    if (kind === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  } catch {
    // fall through to the caller's fallback
  }
  return null;
}

// `{{ item.image | imgsize }}` -> `width="W" height="H"` for local /images/*.webp.
// Remote images (dikan.kz CDN, YouTube thumbnails) can't be probed at build
// time, so they get the caller-supplied fallback ("640x480").
function imgSizeAttrs(src, fallback = '800x600') {
  const local = typeof src === 'string' && src.startsWith('/images/') ? webpSize(path.join(imagesDir, src.slice('/images/'.length))) : null;
  const [fw, fh] = fallback.split('x');
  const { width, height } = local || { width: fw, height: fh };
  return new nunjucks.runtime.SafeString(`width="${width}" height="${height}"`);
}

function renderPages(env, logger) {
  const data = loadData();
  publishData();
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
  env.addFilter('imgsize', imgSizeAttrs);
  env.addFilter('pricefrom', formatPriceFrom);

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
