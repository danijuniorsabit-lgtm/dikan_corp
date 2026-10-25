import { qs } from '../utils/dom.js';
import { renderModelFallback } from '../three/fallback.js';

// Full-page 3D project viewer (project-3d-*.html, see
// src/templates/components/projects/project-3d-viewer.njk) — unlike the
// homepage showcase cards (project-showcase.js) this canvas is the whole
// point of the page, so the model loads immediately rather than lazily,
// and the loading state shows a numeric percentage rather than just a
// spinner.
export function initProject3dFullscreen() {
  const canvas = qs('[data-project-viewer-full]');
  if (!canvas) return;

  const modelUrl = canvas.dataset.modelUrl;
  const loading = qs('[data-model-loading]', canvas);
  const percent = qs('[data-model-percent]', canvas);
  if (!modelUrl) return;

  import('../three/viewer.js').then(({ createModelViewer }) => {
    const viewer = createModelViewer(canvas, {
      modelUrl,
      ambientLight: true,
      onProgress: (event) => {
        if (!percent || !event.total) return;
        percent.textContent = `${Math.round((event.loaded / event.total) * 100)}%`;
      },
      onLoad: () => loading?.remove(),
      onError: () => renderModelFallback(canvas, { alt: '3D-модель временно недоступна' }),
    });

    if (!viewer) {
      loading?.remove();
      return;
    }

    // Auto-rotates on arrival, then stops for good the moment the viewer is
    // touched — 'start' fires on the first pointer-down of any OrbitControls
    // interaction (rotate, zoom or pan).
    viewer.controls.autoRotate = true;
    viewer.controls.autoRotateSpeed = 1;
    viewer.controls.addEventListener('start', () => {
      viewer.controls.autoRotate = false;
    });
  });
}
