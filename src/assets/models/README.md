# 3D models

No `.glb` model exists in this project yet. `src/assets/js/three/viewer.js`
(`GLTFLoader` + `OrbitControls`, WebGL capability check, lazy
`IntersectionObserver` init) and `fallback.js` (static poster shown when
WebGL is unavailable or the model fails to load) are built and ready, but
not wired into any page — the brief's hero design is a static photo, not a
3D viewer, and no other screen in `design/` shows one either.

To wire it in once a model is available:

1. Drop the file here, e.g. `vibromax-jcm-10223.glb` (keep it under ~5 MB;
   [gltf-transform](https://gltf-transform.dev/) or Blender's glTF export
   with Draco compression gets most machine models well under that).
2. Decide the placement (agreed candidate: an extra tab/section on
   `product-detail.html`, alongside the existing image gallery).
3. Call `initLazyModelViewer(containerEl, { modelUrl: '/src/assets/models/vibromax-jcm-10223.glb', onError })`
   from a new `src/assets/js/components/product-viewer.js`, falling back to
   `renderModelFallback()` in `onError`.
