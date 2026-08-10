# DIKAN — corporate frontend

Standalone frontend for the DIKAN website (agricultural grain-cleaning
equipment: catalog, product detail, a 5-step quote wizard, financing/leasing),
built ahead of Bitrix template integration. See `docs/ARCHITECTURE.md` for
the full technical write-up and `docs/BITRIX-INTEGRATION.md` for the
not-yet-started Bitrix migration plan.

## Stack

HTML5 (Nunjucks-templated, built to static multi-page output) · SCSS ·
JavaScript ES6+ (no framework, no jQuery) · Bootstrap 5 (grid/utilities
only) · GSAP · Three.js (scaffolded, unwired) · Vite

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173 — templates/SCSS/JS all hot-reload
npm run build      # -> dist/
npm run preview    # serve the production build locally
npm run lint        # ESLint over src/assets/js
npm run lint:styles # Stylelint over src/assets/scss
npm run format       # Prettier, whole repo
```

Root-level `*.html` files (`index.html`, `products.html`, …) are
**generated** from `src/templates/pages/*.njk` on every `dev`/`build` run —
don't hand-edit them.

## Pages

| Route                  | Source                     | What's on it                                                                                   |
| ---------------------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| `/index.html`          | `pages/index.njk`          | Hero, about/stats, ROI banner, testimonials, trust badges, projects teaser, downloads, contact |
| `/products.html`       | `pages/products.njk`       | Filterable equipment catalog                                                                   |
| `/product-detail.html` | `pages/product-detail.njk` | Gallery, specs, similar products, economy calculator                                           |
| `/calculator.html`     | `pages/calculator.njk`     | 5-step "quote in 90 seconds" wizard                                                            |
| `/finance.html`        | `pages/finance.njk`        | Credit/leasing/trade-in, leasing calculator, bank partners                                     |
| `/services.html`       | `pages/services.njk`       | Service offering                                                                               |
| `/about.html`          | `pages/about.njk`          | Mission, history, team, certificates                                                           |
| `/projects.html`       | `pages/projects.njk`       | Filterable project portfolio                                                                   |

## Docs

- `docs/ARCHITECTURE.md` — build pipeline, conventions, known placeholders/deviations
- `docs/UI-KIT.md` — design tokens, component catalog, how to add a component
- `docs/BITRIX-INTEGRATION.md` — the Bitrix template migration plan (`bitrix/dikan_corp/` has the initial template files; infoblocks/menu/webform work is still open)
