import { qs } from '../utils/dom.js';
import { renderModelFallback } from '../three/fallback.js';

// Product slug -> .glb filename in src/assets/models/ (published to
// public/models/ at build time — see plugins/nunjucks-pages.js). Slugs not
// listed here, or not present in the current catalog, simply never show the
// 3D tab — see initProductViewer().
//
// jcr-08/jcc-08/jgd-08 are keyed to models originally provided for an older
// SKU numbering (jcr-05/jcc-05, and jdg-08 with transposed letters) — see
// src/assets/models/README.md. Reconciled here since it's the same product
// family; jcm-10222/jgt-12/jhc-03 have no counterpart anywhere in the
// current catalog, so those models stay unmapped.
const MODEL_MAP = {
  'jcm-10223': 'jcm_10223.glb',
  'jcm-10122': 'jcm_10122.glb',
  'jcr-08': 'jcr_05.glb',
  'jcc-08': 'jcc_05.glb',
  'jgd-08': 'jdg_08.glb',
  'jgt-23': 'jgt_23.glb',
};

function activateTab(refs, name) {
  const isModel = name === 'model';
  refs.modelTab.classList.toggle('is-active', isModel);
  refs.modelTab.setAttribute('aria-selected', String(isModel));
  refs.photoTab.classList.toggle('is-active', !isModel);
  refs.photoTab.setAttribute('aria-selected', String(!isModel));
  refs.photoPanel.hidden = isModel;
  refs.modelPanel.hidden = !isModel;
  return isModel;
}

// Called by initProductDetail() once it knows which product is actually on
// screen (the default server-rendered one, or whatever ?slug= resolved to) —
// must run after that, not on plain page load, or it would check the wrong slug.
export function initProductViewer() {
  const root = qs('[data-product-viewer]');
  const grid = qs('[data-current-slug]');
  if (!root || !grid) return;

  const slug = grid.dataset.currentSlug;
  const modelFile = MODEL_MAP[slug];
  console.warn(`[product-viewer] init, slug="${slug}", modelFile=${modelFile || '(none mapped)'}`);

  const modelTab = qs('[data-viewer-tab="model"]', root);
  if (!modelFile) {
    if (modelTab) modelTab.hidden = true;
    return;
  }

  const refs = {
    modelTab,
    photoTab: qs('[data-viewer-tab="photo"]', root),
    photoPanel: qs('[data-viewer-panel="photo"]', root),
    modelPanel: qs('[data-viewer-panel="model"]', root),
  };
  const canvas = qs('[data-model-canvas]', refs.modelPanel);
  refs.modelTab.hidden = false;

  let loaded = false;

  // three.js (+ GLTFLoader/OrbitControls) is a heavy dependency — code-split
  // via dynamic import so it's only ever downloaded once someone actually
  // clicks into the 3D tab, not bundled into every page's main.js.
  //
  // The .glb files themselves are also large (tens of MB — see
  // src/assets/models/README.md) and can take several seconds to fetch and
  // parse even on a fast connection. Without a loading state that looks
  // identical to the model being broken: a blank panel for that long reads
  // as "недоступна" even when nothing has actually failed.
  const showModel = () => {
    activateTab(refs, 'model');
    if (loaded) return;
    loaded = true;

    const status = document.createElement('p');
    status.className = 'product-viewer__status text-secondary text-small';
    status.setAttribute('role', 'status');
    status.textContent = 'Загрузка 3D-модели…';
    canvas.appendChild(status);

    import('../three/viewer.js')
      .then(({ createModelViewer }) => {
        const viewer = createModelViewer(canvas, {
          modelUrl: `/models/${modelFile}`,
          onLoad: () => status.remove(),
          onError: () => renderModelFallback(canvas, { alt: '3D-модель временно недоступна' }),
        });
        if (viewer) {
          viewer.controls.autoRotate = true;
          viewer.controls.autoRotateSpeed = 0.6;
        } else {
          status.remove();
        }
      })
      .catch(() => renderModelFallback(canvas, { alt: '3D-модель временно недоступна' }));
  };

  refs.modelTab.addEventListener('click', showModel);
  refs.photoTab.addEventListener('click', () => activateTab(refs, 'photo'));
}
