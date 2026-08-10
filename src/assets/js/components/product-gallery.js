import { qs, qsa } from '../utils/dom.js';

export function initProductGallery() {
  const gallery = qs('[data-product-gallery]');
  if (!gallery) return;

  const mainImg = qs('[data-gallery-main]', gallery);
  const thumbs = qsa('[data-gallery-thumb]', gallery);
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach((t) => t.classList.toggle('is-active', t === thumb));
      if (mainImg && thumb.dataset.full) mainImg.src = thumb.dataset.full;
    });
  });
}
