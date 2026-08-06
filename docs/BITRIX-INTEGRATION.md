# Bitrix integration plan (not started)

This is the plan for porting the finished frontend into
`/local/templates/dikan_corp/` — step 13 of the brief, deliberately done
**after** the frontend is complete and approved, per `PROMPT.md.txt`'s own
"Порядок работы". Nothing in this document has been executed yet.

## Target deliverables (per the brief)

```
/local/templates/dikan_corp/
  header.php
  footer.php
  description.php
  template_styles.css
```

## Mapping: this project → Bitrix template

| Here                                                                            | Becomes                                                                                                       | Notes                                                                                                                                |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `src/templates/layouts/base.njk` `<head>` + `{% include "header/header.njk" %}` | `header.php`                                                                                                  | SEO/OG/schema.org block becomes Bitrix's `SetPageProperty`/`bitrix:breadcrumb` calls; nav becomes a `bitrix:menu` component instance |
| `{% include "contacts/cta-banner.njk" %}` + `{% include "footer/footer.njk" %}` | `footer.php`                                                                                                  | Newsletter form action points at a real Bitrix handler or CRM webform                                                                |
| N/A (new)                                                                       | `description.php`                                                                                             | Template metadata (name, preview, sort) — Bitrix boilerplate, no equivalent here                                                     |
| `dist/assets/main-*.css` (built output)                                         | `template_styles.css`                                                                                         | Built CSS is copied in as-is; the SCSS source stays in this repo as the source of truth, not in the Bitrix template                  |
| `dist/assets/main-*.js`                                                         | a `template.js` alongside `template_styles.css`                                                               | Same — built, not hand-edited in Bitrix                                                                                              |
| `src/templates/pages/*.njk` bodies                                              | Bitrix component templates (`.default`/custom) per section, or static includes for pages with no dynamic data | See per-page notes below                                                                                                             |
| `src/templates/data/*.json`                                                     | Bitrix infoblocks / component params                                                                          | See per-page notes below                                                                                                             |
| `public/robots.txt`, `public/sitemap.xml`                                       | Bitrix's own robots/sitemap tooling                                                                           | Bitrix has native sitemap generation (`bitrix:sitemap`) — the static ones here are a placeholder until that's wired up               |

## Per-page notes

- **`products.json` → Bitrix catalog infoblock.** `product-card.njk`'s markup becomes the catalog component's item template; `filter-bar.js`'s category filter becomes `bitrix:catalog.section`'s SKU/property filter, or a `bitrix:catalog.smart.filter` if faceted filtering is wanted.
- **`product-detail.html` → catalog element component.** Currently one static template for one hardcoded product (`currentProduct` in the Nunjucks context, see `ARCHITECTURE.md`) — becomes `bitrix:catalog.element`, with `product-gallery.njk`/`product-specs.njk`/`similar-products.njk` as its item/related-items templates.
- **`projects.json` → infoblock** (or reuse the catalog infoblock with a "project" type) — `project-card.njk` becomes its list/detail component templates.
- **`testimonials.json`, `partners.json`, `downloads.json`** → either infoblocks or, if they never need editing outside a developer, left as static includes rendered from the same JSON (Bitrix can `include` arbitrary PHP that reads a JSON file — lowest-effort path if a CMS-editable list isn't actually needed).
- **`calculator.html` (quote wizard) and `finance.html` (leasing calculator)** → these are pure client-side JS (no server round-trip needed for the calculation itself); the only Bitrix-side work is wiring the final submit (`quote-wizard.js`'s success-panel branch, `contact-form.js`) to a real CRM webform/lead handler instead of the current "no backend yet" local confirmation message.
- **`nav.json`** → `bitrix:menu` + a `.php` menu file, generated once from this JSON and then Bitrix-managed.
- **`seo.json`** → per-page `SetPageProperty("title"/"description")` calls, or if pages become infoblock elements, their own SEO fields.

## Things to decide when this step starts

- Whether product/project data becomes real Bitrix infoblocks (CMS-editable) or stays static JSON rendered via PHP include — depends on whether the client needs to edit the catalog without a developer.
- Whether the multi-language stub (`RU` button in the header, currently non-functional per the "Russian only" decision) becomes a real Bitrix language switcher at this point, or stays deferred.
- Contact/newsletter form backends — Bitrix CRM webforms vs. a custom handler.
- Whether `filter-bar.js`'s client-side filtering is kept (fine for the current catalog size) or replaced with server-side filtering once the real catalog size is known.
