# 3D models

Wired in on `product-detail.html` as a "3D Модель" tab next to the photo
gallery (`src/assets/js/components/product-viewer.js`). `viewer.js`
(`GLTFLoader` + `OrbitControls`, WebGL capability check) is code-split via a
dynamic `import()` and only downloaded the first time someone actually
clicks the tab — it's a heavy dependency (three.js + loaders), not worth
adding to every page's bundle. `fallback.js` (static poster/text notice) is
shown if WebGL is unavailable or the model fails to load.

`product-viewer.js`'s `MODEL_MAP` maps a product **slug** to a `.glb`
**filename** in this folder. Only slugs present in that map — and only when
they also match a real product's `slug` in `data/products.json` — get a
visible 3D tab; everything else just shows the photo gallery, no error
state. `jcr-05`/`jcc-05`/`jdg-08` (transposed letters) were provided for a
slightly different SKU numbering than the current catalog — `MODEL_MAP` now
keys those files to the catalog's actual `jcr-08`/`jcc-08`/`jgd-08` slugs.
`jcm_10222.glb`, `jgt_12.glb`, `jhc_03.glb`, and `маленькая установка.glb`
have no counterpart in the current catalog at all, so they stay unmapped.

**These files are not served directly from here.** `plugins/nunjucks-pages.js`
mirrors every `*.glb` in this folder into `public/models/` on each build/dev
render (same reasoning as `data/products.json` → `public/data/products.json`:
`src/` isn't servable as-is, only `public/` is) — that's what `product-viewer.js`
actually fetches (`/models/<file>.glb`).

**Size warning:** these are large — most of the current files are 50–85 MB
each, well over the ~5 MB this doc originally recommended (gltf-transform or
Blender's glTF export with Draco compression gets most machine models well
under that). At this size they meaningfully bloat `public/`/`dist/` and are
slow to fetch even lazily-loaded; compress before shipping this for real.
