// Images/pictures should prefer the native loading="lazy" attribute (set in
// templates). This IntersectionObserver only covers elements that can't use
// the native attribute — CSS background images driven by [data-bg].
export function initLazyBackgrounds(root = document) {
  const targets = Array.from(root.querySelectorAll('[data-bg]'));
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => {
      el.style.backgroundImage = `url(${el.dataset.bg})`;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.style.backgroundImage = `url(${el.dataset.bg})`;
        el.removeAttribute('data-bg');
        obs.unobserve(el);
      });
    },
    { rootMargin: '200px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}
