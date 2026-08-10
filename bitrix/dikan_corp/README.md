# DIKAN Bitrix template — `dikan_corp`

Step 13 of `PROMPT.md.txt` (see `docs/BITRIX-INTEGRATION.md` for the full
frontend → Bitrix mapping this was built from). Deploy this folder's
contents to `/local/templates/dikan_corp/` on the real Bitrix site.

## Files

| File | What it is |
| --- | --- |
| `description.php` | Template metadata for the admin "Site templates" list |
| `.parameters.php` | Template-level admin parameters (currently one boilerplate toggle — extend as real needs come up) |
| `header.php` | `<head>` + header, ported from `src/templates/layouts/base.njk` + `header.njk`. Ends with `<main id="main-content">` open (Bitrix convention: page content renders between header.php and footer.php) |
| `footer.php` | Closes `</main>`, then the CTA banner + footer + `template.js` + `ShowPanel()`, ported from `base.njk` + `cta-banner.njk` + `footer.njk` |
| `template_styles.css` | Exact copy of the built `dist/assets/main-*.css` — regenerate per "Updating the build" below |
| `template.js` | The built `dist/assets/main-*.js`, renamed to a stable filename |
| `viewer-*.js` | The lazily `import()`-ed 3D-viewer chunk (see `src/assets/js/components/product-viewer.js`) — **must stay a sibling of `template.js`** with this exact filename, since `template.js`'s dynamic import resolves it by relative path |

## Updating the build

These are frozen copies, not symlinks — they don't update themselves when
the frontend changes. After any frontend change:

```bash
npm run build
cp dist/assets/main-*.css bitrix/dikan_corp/template_styles.css
cp dist/assets/main-*.js  bitrix/dikan_corp/template.js
cp dist/assets/viewer-*.js bitrix/dikan_corp/
```

If a rebuild ever produces a *second* lazy chunk (not just `viewer-*.js`),
copy that too and keep it alongside `template.js` — check
`grep -o "[a-zA-Z-]*-[A-Za-z0-9_]*\.js" template.js` for what it actually
references before assuming there's still exactly one.

## Deployment gotcha — three folders belong at the site root, not here

`fetch('/data/products.json')` (product-detail routing), `<img
src="/images/logo.jpg">` (header logo), and `/models/*.glb` (3D viewer) are
all absolute, site-root-relative URLs baked into `template.js` at build
time — `SITE_TEMPLATE_PATH` doesn't cover them. Copy the source repo's
`public/data/`, `public/images/`, and `public/models/` folders to the
Bitrix site's actual document root (sibling of `/bitrix/`, `/local/`), not
into this template folder. Skip this and the template still loads, but
product routing, the logo, and the 3D viewer all silently 404.

## What's still genuinely unresolved

Everything in `docs/BITRIX-INTEGRATION.md`'s "Things to decide when this
step starts" is still open — this pass only produced the five template
files themselves. In particular: nav is a hardcoded PHP array here (not yet
a `bitrix:menu` instance), and the contact/quote-wizard forms still open
WhatsApp client-side rather than posting to a CRM webform.

## How this was verified

No live Bitrix install to test against, so verified by rendering
`header.php` + `footer.php` through a stub of the `$APPLICATION` API (PHP
CLI, not a browser) and checking the output: valid single `<head>`/`<body>`/
`<main>` structure, correct active-nav-link detection, title/meta rendered
from stubbed `SetTitle()`/`SetPageProperty()` calls, and asset paths
resolving through `SITE_TEMPLATE_PATH`. That test caught a real bug — this
environment's PHP has `short_open_tag = Off` (the modern default), which
silently no-ops every bare `<?...?>` block (only `<?=...?>` survives it).
All files here use `<?php` throughout for exactly that reason — don't
introduce bare `<?` tags back in, even though they're shorter and Bitrix's
own docs/examples often use them.
