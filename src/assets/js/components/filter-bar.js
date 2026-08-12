import { qs, qsa } from '../utils/dom.js';

// Generic pill-filter: wire every [data-filter-scope] on the page (products
// catalog, projects grid, …) — each scope finds its own pills/grid/empty
// state so multiple independent filter groups can coexist on one page.
export function initFilterBars() {
  qsa('[data-filter-scope]').forEach((scope) => {
    const filter = qs('[data-filter]', scope);
    const select = qs('[data-filter-select]', scope);
    const grid = qs('[data-filter-grid]', scope);
    if ((!filter && !select) || !grid) return;

    const pills = filter ? qsa('[data-filter-value]', filter) : [];
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

    // Desktop pills and the mobile <select> are two views of the same
    // state — keep them in sync regardless of which one the user drives.
    const setActive = (value) => {
      pills.forEach((p) => {
        const isActive = p.dataset.filterValue === value;
        p.classList.toggle('is-active', isActive);
        p.setAttribute('aria-selected', String(isActive));
      });
      if (select) select.value = value;
      applyFilter(value);
    };

    pills.forEach((pill) => {
      pill.addEventListener('click', () => setActive(pill.dataset.filterValue));
    });

    if (select) {
      select.addEventListener('change', () => setActive(select.value));
    }

    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const hasCategory =
      category &&
      ((filter && qs(`[data-filter-value="${category}"]`, filter)) ||
        (select && qs(`option[value="${category}"]`, select)));

    setActive(hasCategory ? category : pills[0]?.dataset.filterValue || select?.value || 'all');
  });
}
