# UI Kit

Design tokens were sampled directly from `design/*.png` via a pixel-color
histogram (not eyeballed) — see the plan/decision log for the extraction
method.

## Colors

| Token           | Hex       | CSS var                  | Usage                                                          |
| --------------- | --------- | ------------------------ | -------------------------------------------------------------- |
| Brand (lime)    | `#CFF248` | `--color-brand`          | Primary CTA buttons, active filter pills, accents, badge fills |
| Brand, pressed  | `#B8D93E` | `--color-brand-dark`     | Hover/active state on brand buttons                            |
| Ink             | `#14130E` | `--color-ink`            | Headings, dark sections/banners, buttons-on-light              |
| Background      | `#FFFFFF` | `--color-bg`             | Page background                                                |
| Surface         | `#F0F0F0` | `--color-surface`        | Card backgrounds, form fields                                  |
| Surface, alt    | `#E0E0E0` | `--color-surface-alt`    | Secondary surfaces, dividers, slider track                     |
| Text, secondary | `#6B6B66` | `--color-text-secondary` | Supporting copy                                                |
| Border          | `#D9D9D4` | `--color-border`         | Hairlines, input borders                                       |

All defined once in `src/assets/scss/abstracts/_variables.scss` as the
`$colors` map — read via `color('brand')` (SCSS) or `var(--color-brand)`
(anywhere that needs the runtime value, e.g. inline SVG `stroke="currentColor"`
contexts). Never hardcode a hex value in a component partial.

## Typography

- **Display / headings**: Unbounded, 800/700 weight
- **Body**: Manrope, 400–700 weight
- Loaded via Google Fonts `<link>` in `layouts/base.njk` (not self-hosted — see `ARCHITECTURE.md`)
- Scale (`$font-sizes` map): `h1` 3.5rem → `h4` 1.25rem → `body` 1rem → `small` 0.875rem → `tiny` 0.75rem, with responsive step-downs at the `sm`/`xxs` breakpoints for `h1`/`h2` (see `base/_typography.scss`)

## Spacing

8px grid, steps `0–12` (0 / 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 128px) — read via `space(4)` etc. Never a raw `px` margin/padding in a component partial.

## Breakpoints

Desktop-first, matching the brief's 7 target viewports exactly:

| Name  | Width  |
| ----- | ------ |
| `xxl` | 1920px |
| `xl`  | 1440px |
| `lg`  | 1280px |
| `md`  | 1024px |
| `sm`  | 768px  |
| `xs`  | 480px  |
| `xxs` | 375px  |

Use `@include respond-max('sm') { … }` (or `respond-min`) — never a raw
`@media` query in a component partial.

## Radii & misc

`$radius-pill` (999px, buttons/pills/badges), `$radius-md` (16px, cards),
`$radius-sm` (8px, inputs/thumbnails). Container: 1320px max-width, 24px
inline padding (`container--narrow` 920px, `container--wide` 1560px).

## Core UI primitives (`src/templates/components/ui/`)

| Macro                           | File              | Notes                                                                                                                                                                                |
| ------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `button(text, opts)`            | `button.njk`      | `variant`: primary\|dark\|outline · `size`: sm · `icon`: true\|'right'\|false · `block`, `tag`('a'\|'button'), `class`, `attrs`                                                      |
| `badge(text, opts)`             | `badge.njk`       | `variant`: brand\|dark\|outline                                                                                                                                                      |
| `section_tag(text)`             | `section-tag.njk` | The pill eyebrow label above section headings ("О нас", "Проекты", …) — thin wrapper around `badge()`                                                                                |
| `breadcrumbs(items, opts)`      | `breadcrumbs.njk` | `items`: `[{label, href}]`, last = current page. `opts.dark` for the light-on-photo variant. Also emits matching `BreadcrumbList` JSON-LD                                            |
| `filter_bar(categories, label)` | `filter-bar.njk`  | Pill filter group; categories come from `data/products.json.categories`. Reused by both the product catalog and the projects grid                                                    |
| `range_field(opts)`             | `range-field.njk` | Labeled `<input type="range">` with live output + min/max scale labels; wired by `js/components/range-slider.js`                                                                     |
| icon macros                     | `icons.njk`       | `arrow_right`, `arrow_up_right`, `phone`, `search`, `menu`, `close`, `play`, `download`, `check`, `chevron_down`, `tractor`, `emblem`, `facebook`, `twitter`, `youtube`, `instagram` |

## Component families (`src/templates/components/`)

- `header/` — nav + phone + search toggle + RU language stub + mobile menu
- `footer/` — brand/socials, useful links, newsletter form
- `contacts/` — `cta-banner.njk` (the "Мы являемся лидером…" band on every page), `contact-form.njk`
- `hero/` — `hero.njk` (home), `page-hero.njk` (breadcrumb + title band, interior pages), `finance-hero.njk` (with credit/leasing/trade-in tabs)
- `about/` — `about-section.njk`, `roi-banner.njk`, `testimonials.njk`, `trust-badges.njk`
- `projects/` — `project-card.njk` (macro, `layout: 'row'|'grid'`), `project-list.njk` (home teaser)
- `product/` — `product-card.njk`, `product-gallery.njk`, `product-specs.njk`, `similar-products.njk`
- `calculator/` — `quote-wizard.njk` (5-step), `economy-calculator.njk` (sliders + gauges)
- `finance/` — `leasing-calculator.njk`, `partners.njk`, `trade-in.njk`
- `downloads/` — lead-magnet PDF cards

## Adding a new component

1. `src/templates/components/<family>/<name>.njk` — markup, as a macro if reused, plain markup + `{% include %}` if page-unique.
2. `src/assets/scss/components/_<name>.scss` — `@use '../abstracts' as *;` at the top, BEM classes matching the template.
3. Add `@use 'components/<name>';` to `src/assets/scss/main.scss` (keep the running list at the bottom in sync).
4. If interactive: `src/assets/js/components/<name>.js`, exporting `initX()` that no-ops if its root isn't in the DOM; import + call it in `src/assets/js/main.js`.
5. If it needs content: add to the relevant `src/templates/data/*.json` rather than hardcoding values in the template.
