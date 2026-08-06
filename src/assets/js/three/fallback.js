// Static fallback shown in place of the 3D viewer when WebGL is unavailable
// or the model fails to load — pairs with three/viewer.js's onError.
export function renderModelFallback(container, opts = {}) {
  if (!container) return;

  const { posterUrl, alt = '3D-модель недоступна в вашем браузере' } = opts;
  container.innerHTML = '';

  if (posterUrl) {
    const img = document.createElement('img');
    img.src = posterUrl;
    img.alt = alt;
    img.loading = 'lazy';
    container.appendChild(img);
    return;
  }

  const notice = document.createElement('p');
  notice.className = 'text-secondary text-small';
  notice.textContent = alt;
  container.appendChild(notice);
}
