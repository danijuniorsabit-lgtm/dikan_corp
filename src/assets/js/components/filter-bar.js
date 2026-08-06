import { qs, qsa } from '../utils/dom.js';

// Generic pill-filter: wire every [data-filter-scope] on the page (products
// catalog, projects grid, …) — each scope finds its own pills/grid/empty
// state so multiple independent filter groups can coexist on one page.
export function initFilterBars() {
  qsa('[data-filter-scope]').forEach((scope) => {
    const filter = qs('[data-filter]', scope);
    const grid = qs('[data-filter-grid]', scope);
    if (!filter || !grid) return;

    const pills = qsa('[data-filter-value]', filter);
    const items = qsa('[data-category]', grid);
    const empty = qs('[data-filter-empty]', scope);

    const applyFilter = (value) => {
      let visibleCount = 0;
      items.forEach((item) => {
        const matches = value === 'all' || item.dataset.category === value;
        item.hidden = !matches;
        if (matches) visibleCount += 1;
      });
      if (empty) empty.hidden = visibleCount > 0;
    };

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => {
          p.classList.toggle('is-active', p === pill);
          p.setAttribute('aria-selected', String(p === pill));
        });
        applyFilter(pill.dataset.filterValue);
      });
    });

    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const initialPill = category && qs(`[data-filter-value="${category}"]`, filter);
    if (initialPill) initialPill.click();
  });
}
