import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Used by product-viewer.js (product-detail.html) and project-showcase.js
// (homepage "3D-визуализации наших проектов") — createModelViewer(containerEl,
// { modelUrl }).

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// Creates a self-contained rotatable 3D viewer inside `container`.
// Returns null (and calls opts.onError) if WebGL or the model fail to load —
// callers should fall back to fallback.js's static poster in that case.
export function createModelViewer(container, opts = {}) {
  const { modelUrl, onError, onLoad } = opts;
  if (!container || !modelUrl) return null;

  if (!isWebGLAvailable()) {
    onError?.(new Error('WebGL is not available in this browser'));
    return null;
  }

  const width = container.clientWidth;
  const height = container.clientHeight || Math.round(width * 0.6);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(2.5, 1.5, 2.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 1;
  controls.maxDistance = 10;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1);
  keyLight.position.set(3, 5, 2);
  scene.add(keyLight);

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    modelUrl,
    (gltf) => {
      scene.add(gltf.scene);
      onLoad?.(gltf);
    },
    undefined,
    (error) => onError?.(error)
  );

  let frameId;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  const handleResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight || Math.round(w * 0.6);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  const destroy = () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', handleResize);
    controls.dispose();
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };

  return { scene, camera, renderer, controls, destroy };
}

// Defers viewer creation (and the three.js/model download) until the
// container scrolls near the viewport. opts.onCreate(viewer), if given, runs
// right after createModelViewer() returns (synchronous — the model itself
// still loads async) — the only way callers can reach `controls`/`camera`
// to e.g. turn on autoRotate, since the viewer instance itself isn't
// returned from here (creation happens later, inside the observer).
export function initLazyModelViewer(container, opts = {}) {
  if (!container) return;

  if (!('IntersectionObserver' in window)) {
    const viewer = createModelViewer(container, opts);
    if (viewer) opts.onCreate?.(viewer);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const viewer = createModelViewer(container, opts);
        if (viewer) opts.onCreate?.(viewer);
        observer.disconnect();
      });
    },
    { rootMargin: '200px' }
  );
  observer.observe(container);
}
