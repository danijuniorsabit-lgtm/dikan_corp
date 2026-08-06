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
  - `index.html`: `hero-animation.js`
  - `products.html` / `projects.html`: `filter-bar.js` (generic — see below)
  - `product-detail.html`: `product-gallery.js`, `range-slider.js`, `gauge.js`, `economy-calculator.js`
  - `calculator.html`: `quote-wizard.js`
  - `finance.html`: `finance-tabs.js`, `leasing-calculator.js`, `range-slider.js`
- `filter-bar.js` is generic on purpose: it wires every `[data-filter-scope]` on the page by finding its own `[data-filter]` pills + `[data-filter-grid]` + `[data-category]` items — reused as-is by both the product catalog and the projects grid instead of two near-identical filter implementations.
- `prefers-reduced-motion` is checked explicitly in every GSAP-touching module (`utils/motion.js`) — the global CSS reset only kills CSS transitions/animations, not JS-driven GSAP tweens.

## Content is data-driven

`src/templates/data/*.json` holds every product, project, testimonial,
partner, download, nav item, and per-page SEO title/description. Adding a
product means editing `products.json`, not touching a template. This also
means the eventual Bitrix migration has an obvious target: these JSON files
become Bitrix infoblock/component data sources (see `BITRIX-INTEGRATION.md`).

## Known placeholders / deliberate deviations

Each was a decision made explicitly during planning, not an oversight:

- **No real photography** — every "image" is a CSS gradient placeholder (product photos, hero backgrounds, project thumbnails, team avatars). Swap by replacing the relevant `background:` rule with a real `<picture>`/`<img>` (with `loading="lazy"` and WebP + fallback) once real assets exist.
- **Fonts** — Manrope (body) + Unbounded (display) load from Google Fonts via `<link>` in `base.njk`, not self-hosted (no real brand font files exist in this project). `src/assets/scss/base/_fonts.scss` has a ready `@font-face` scaffold for when they're supplied.
- **3D model (Three.js)** — `src/assets/js/three/viewer.js` + `fallback.js` are built (GLTFLoader + OrbitControls, WebGL check, lazy `IntersectionObserver` init) but not wired into any page — no Figma screen shows a 3D viewer. See `src/assets/models/README.md`.
- **Bank partner logos** (`finance.html`) — text-only placeholder badges, not the real Baiterek/Halyk Bank/КазАгроФинанс artwork, to avoid using trademarked logos without the real files.
- **`product-detail.html` is one static template** for a single example product (VibroMax JCM 10223, matching the Figma) — it isn't dynamically routed per-product yet. That routing is a natural fit for a Bitrix catalog component later.
- **"Наши Продукты" and "Оборудование"** nav items intentionally point to the same `/products.html` — there's no separate "equipment" dataset, so both nav links legitimately lead to the identical catalog (both get highlighted `.is-active` when you're on that page — accurate, not a bug).
- **Calculators are illustrative**, not financially binding — the economy calculator (product-detail) and leasing calculator (finance) use simple, documented formulas (see the `// comments` at the top of `economy-calculator.js` / `leasing-calculator.js`), not real underwriting logic.
