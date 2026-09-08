import { qsa } from '../utils/dom.js';

// Homepage "3D-визуализации наших проектов" section — each card lazy-loads
// its own model only once scrolled near the viewport (see
// three/viewer.js's initLazyModelViewer), so four ~40-140MB .glb files
// never all download on page load.
export function initProjectShowcase() {
  const canvases = qsa('[data-project-viewer]');
  if (!canvases.length) return;

  // three.js + GLTFLoader/OrbitControls is only fetched once a card is
  // actually about to be visible, same reasoning as product-viewer.js.
  Promise.all([import('../three/viewer.js'), import('../three/fallback.js')]).then(
    ([{ initLazyModelViewer }, { renderModelFallback }]) => {
      canvases.forEach((canvas) => {
        const modelUrl = canvas.dataset.modelUrl;
        const spinner = canvas.querySelector('[data-model-spinner]');
        if (!modelUrl) return;

        initLazyModelViewer(canvas, {
          modelUrl,
          onCreate: (viewer) => {
            viewer.controls.autoRotate = true;
            viewer.controls.autoRotateSpeed = 1.2;
          },
          onLoad: () => spinner?.remove(),
          onError: () => renderModelFallback(canvas, { alt: '3D-модель временно недоступна' }),
        });
      });
    }
  );
}
