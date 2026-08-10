# Architecture

## What this is

The DIKAN corporate frontend, built standalone before Bitrix integration
(see `BITRIX-INTEGRATION.md` for that later step). It's a static
multi-page site — 8 real HTML pages, no client-side router, no framework —
built with Vite, SCSS, vanilla ES6+ modules, Nunjucks templating, Bootstrap 5
(grid/utilities only), and GSAP.

The site's actual content (agricultural grain-cleaning equipment: catalog,
product detail, a quote wizard, financing/leasing) was reverse-engineered
from the Figma exports in `design/*.png`, not from `PROMPT.md.txt`'s generic
corporate-brochure brief — see the plan/decision log for how the two were
reconciled. `PROMPT.md.txt`'s non-visual requirements (BEM, no jQuery, no
duplication, SEO, performance, adaptive breakpoints) apply throughout
regardless.

## Build pipeline

```
src/templates/**/*.njk  →  plugins/nunjucks-pages.js  →  /*.html (project root)  →  Vite/Rollup
src/assets/scss/main.scss                              →  bundled CSS
src/assets/js/main.js                                   →  bundled JS
```

`plugins/nunjucks-pages.js` is a small **custom** Vite plugin (not a
third-party `vite-plugin-nunjucks`) — it renders every
`src/templates/pages/*.njk` file (extending `layouts/base.njk`, including
`components/*.njk`, fed by `data/*.json`) into a real static `*.html` file
at the project root. It runs in `buildStart` (covers both `vite build` and
`vite dev` cold start) and watches `src/templates/**` during dev, re-rendering
and triggering a full reload on change. Root-level `*.html` files are
**generated** — don't hand-edit them; edit the `.njk` source.

Why a custom plugin instead of a published one: its whole job is three
well-documented, stable `nunjucks` APIs (`configure`, `env.render`,
`FileSystemLoader` search paths) — safer to own outright than depend on a
third-party plugin's exact option shape.

One per-page context enrichment lives in the plugin itself
(`pageContext()`): `product-detail.njk` needs a "current product" +
"similar products" split that Nunjucks has no reliable array-exclude/slice
for — computed in JS, kept out of the templates, which stay presentation-only.

## Directory map

```
src/templates/
  layouts/base.njk       <head> (SEO/OG/schema.org), header/footer/cta-banner includes, {% block content %}
  pages/*.njk             one per route, extends base.njk
  components/**/*.njk     one folder per component family (header, hero, product, calculator, finance, ui, …)
  data/*.json              nav, products, projects, testimonials, partners, downloads, seo — templates loop over this, not hardcoded markup

src/assets/
  scss/                    abstracts (tokens/mixins) → vendor (Bootstrap, cherry-picked) → base → layout → components → pages
  js/                      core (dom-ready, breakpoints, lazy-load) → components (one module per interactive component) → three (scaffolded, unwired) → utils
  images/ icons/ fonts/ models/   see each folder's placeholder notes
```

## Templating conventions

- Reusable pieces are Nunjucks **macros** (`{% macro %}` + `{% from "x.njk" import y %}`), not copy-pasted markup — e.g. `ui/button.njk`, `ui/breadcrumbs.njk`, `product/product-card.njk`, `ui/filter-bar.njk` (shared by the product catalog _and_ the projects grid, since both use the same barrel/vibration/air taxonomy).
- Page-level sections that are only ever used once per page (e.g. `hero/hero.njk`) are still their own file, included with `{% include %}` — keeps `pages/*.njk` a thin list of includes, and keeps CSS/JS organized 1:1 with template files.
- Inline SVG icons live once in `ui/icons.njk` as macros — never duplicated per component.

## CSS conventions

- **BEM** throughout (`.product-card__body`, `.product-card--row`), enforced loosely by `.stylelintrc.json`'s `selector-class-pattern`.
- **No inline styles** — the one intentional exception is JS setting CSS custom properties for genuinely dynamic values (range-slider fill %, gauge needle angle/arc) via `el.style.setProperty(...)`/`el.style.transform = ...` — there's no way to express "fill up to the live slider value" in static CSS. Never used for anything a stylesheet could express.
- Design tokens are a single SCSS map per category in `abstracts/_variables.scss` (colors, spacing, font sizes) — `base/_global.scss` emits them once as CSS custom properties (`--color-brand`, `--space-4`, …) so runtime JS and future theming read the same values SCSS uses at compile time. Never duplicate a literal color/spacing value — pull from `color()`/`space()`.
- `abstracts/_index.scss` is a barrel (`@forward`) — every other partial does `@use '../abstracts' as *;` once instead of hand-picking variables/functions/mixins/breakpoints.

## JS conventions

- No framework, no jQuery. Every interactive piece is a small ES module in `src/assets/js/components/`, exporting one `initX()` that's a no-op if its root element isn't on the current page — `main.js` unconditionally calls all of them once, per-page cost is just a handful of failed `querySelector`s.
- `main.js` → page → module map:
  - every page: `header.js`, `footer.js`, `contact-form.js` (only pages that include the contact section), `filter-bar.js`, `scroll-reveal.js`
  - `index.html`: `hero-slider.js` (autorotating 3-slide hero — GSAP crossfade + entrance animation, pause on hover/focus, `prefers-reduced-motion` skips both)
  - `products.html`: `filter-bar.js` (see below) — `projects.html` and `equipment.html` have no filter UI, `initFilterBars()` no-ops there
  - `product-detail.html`: `product-gallery.js`, `product-detail.js` (`?slug=` client-side routing — see below), `product-viewer.js` (3D tab, see below), `range-slider.js`, `gauge.js`, `economy-calculator.js`
  - `calculator.html`: `quote-wizard.js`
  - `finance.html`: `finance-tabs.js`, `leasing-calculator.js`, `range-slider.js`
- `filter-bar.js` wires every `[data-filter-scope]` on the page by finding its own `[data-filter]` pills + `[data-filter-grid]` + `[data-category]` items — currently only `products.html` uses it (the projects grid's filter UI was removed; the underlying `data-category` markup and this module were kept generic in case another page needs filtering later).
- `prefers-reduced-motion` is checked explicitly in every GSAP-touching module (`utils/motion.js`) — the global CSS reset only kills CSS transitions/animations, not JS-driven GSAP tweens.

## Content is data-driven

`src/templates/data/*.json` holds every product, project, testimonial,
partner, download, nav item, and per-page SEO title/description. Adding a
product means editing `products.json`, not touching a template. This also
means the eventual Bitrix migration has an obvious target: these JSON files
become Bitrix infoblock/component data sources (see `BITRIX-INTEGRATION.md`).

## Known placeholders / deliberate deviations

Each was a decision made explicitly during planning, not an oversight:

- **No real photography, except product catalog images, the team section, and the projects grid** — `data/products.json` items, `pages/about.njk`'s `team` array, and `data/projects.json` items all link real `<img>`s hotlinked from dikan.kz's live site (`product-card.njk`/`product-gallery.njk`, `about.njk`'s team grid, `project-card.njk`), with a CSS gradient behind as a loading/fallback backdrop. Everywhere else (hero backgrounds) is still a CSS gradient placeholder — swap by replacing the relevant `background:` rule with a real `<picture>`/`<img>` (with `loading="lazy"` and WebP + fallback) once real assets exist. The hotlinked product, staff, and project images should be downloaded and self-hosted before launch — don't ship on a live dependency to a third party's CDN. Several `projects.json` entries share the same photo — that mirrors dikan.kz itself, which reuses a handful of generic site photos across many project listings rather than having a unique photo per project.
- **Fonts** — Manrope (body) + Unbounded (display) load from Google Fonts via `<link>` in `base.njk`, not self-hosted (no real brand font files exist in this project). `src/assets/scss/base/_fonts.scss` has a ready `@font-face` scaffold for when they're supplied.
- **3D model (Three.js)** — wired into `product-detail.html` as a "3D Модель" tab next to the photo gallery, driven by `product-viewer.js`'s slug → `.glb` `MODEL_MAP`; hidden entirely for slugs with no mapped model. Three.js itself (`three/viewer.js`, GLTFLoader + OrbitControls) is dynamically `import()`-ed only when the tab is clicked — it's ~150 KB gzipped, too heavy to eagerly bundle into every page's `main.js`. No Figma screen shows a 3D viewer — this is a build-out beyond the original brief. See `src/assets/models/README.md` (including a size warning: the current `.glb` files are 10-15x the folder's own recommended budget).
- **Bank partner logos** (`finance.html`) — text-only placeholder badges, not the real Baiterek/Halyk Bank/КазАгроФинанс artwork, to avoid using trademarked logos without the real files.
- **`product-detail.html` is server-rendered for one default product** (VibroMax JCM 10223, matching the Figma — see `pageContext()` in `plugins/nunjucks-pages.js`), then re-rendered client-side by `product-detail.js` when the URL has `?slug=...`: it fetches `public/data/products.json` (a build-time mirror of `data/products.json`, published by the same plugin) and swaps gallery/specs/JSON-LD/similar-products in place. No `?slug=` (or an unknown one) just keeps showing the default product — there's no 404 state. `product-detail.js`'s `productCardHTML()` hand-mirrors `product-card.njk`/`ui/button.njk`'s markup and has to be kept in sync with them by hand if either changes. The real per-product routing (with an actual 404/redirect) is a natural fit for a Bitrix catalog component later.
- **`equipment.html` ("Оборудование")** is a distinct page from `products.html` ("Наши Продукты") — accessories/consumables (нории, зернопровод, сита, аспирация, транспортеры, бункеры) via `data/equipment.json`'s two groups (`komplektuyushchie`, `soputstvuyushchee`), not the main JCM/JCR/JCC/JGC/JGD/JGT catalog. Several entries have no dedicated dikan.kz product photo (`image: ""`); `equipment-card.njk` falls back to the decorative gradient for those rather than fabricating a photo URL.
- **Calculators are illustrative**, not financially binding — the economy calculator (product-detail) and leasing calculator (finance) use simple, documented formulas (see the `// comments` at the top of `economy-calculator.js` / `leasing-calculator.js`), not real underwriting logic.
