import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Used by product-viewer.js (product-detail.html) and project-3d-fullscreen.js
// (project-3d-*.html) — createModelViewer(containerEl, { modelUrl }).

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
  const { modelUrl, onError, onLoad, onProgress, ambientLight } = opts;
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

  // opts.ambientLight is opt-in (defaults off) so existing callers — the
  // homepage showcase cards and the product-detail tab — keep their current
  // look; the full-page project viewers turn it on to get the
  // ambient+directional+hemisphere three-point setup they need on a much
  // bigger canvas.
  if (ambientLight) scene.add(new THREE.AmbientLight(0xffffff, 0.4));
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
    onProgress,
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
