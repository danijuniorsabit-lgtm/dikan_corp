import { qs, qsa } from '../utils/dom.js';

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 8;

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);

function matchesQuery(item, query) {
  const haystack = [item.name, item.shortName, item.description, item.category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function resultItemHTML(item, categoryLabel, index) {
  return `
    <li
      class="search-results__item"
      role="option"
      id="search-result-${index}"
      data-search-result
      data-slug="${escapeHTML(item.slug)}"
    >
      <img class="search-results__thumb" src="${escapeHTML(item.image)}" alt="" loading="lazy" />
      <span class="search-results__body">
        <span class="search-results__name">${escapeHTML(item.shortName || item.name)}</span>
        <span class="search-results__category">${escapeHTML(categoryLabel)}</span>
      </span>
    </li>
  `;
}

// Full-catalog search overlay for the header search icon — fetches the same
// public/data/products.json used by product-detail.js (mirrored there so
// client-side code can fetch it at runtime), so results always match the
// server-rendered catalog without a separate search index to keep in sync.
export function initSearch() {
  const toggle = qs('[data-search-toggle]');
  const overlay = qs('[data-search-overlay]');
  if (!toggle || !overlay) return;

  const backdrop = qs('[data-search-backdrop]', overlay);
  const input = qs('[data-search-input]', overlay);
  const closeBtn = qs('[data-search-close]', overlay);
  const resultsList = qs('[data-search-results]', overlay);

  let products = null;
  const categoryLabels = new Map();
  let loadPromise = null;
  let activeIndex = -1;
  let currentResults = [];

  const loadData = () => {
    if (loadPromise) return loadPromise;
    loadPromise = fetch(`${import.meta.env.BASE_URL}data/products.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`products.json responded with ${res.status}`);
        return res.json();
      })
      .then((data) => {
        products = data.items || [];
        (data.categories || []).forEach((c) => categoryLabels.set(c.key, c.label));
      })
      .catch((err) => {
        console.error('[search] failed to load product data', err);
        products = [];
      });
    return loadPromise;
  };

  const renderResults = (items) => {
    currentResults = items;
    activeIndex = -1;
    input.removeAttribute('aria-activedescendant');
    input.setAttribute('aria-expanded', String(items.length > 0));

    if (items.length > 0) {
      resultsList.innerHTML = items
        .map((item, index) =>
          resultItemHTML(item, categoryLabels.get(item.category) || item.category, index)
        )
        .join('');
    } else if (input.value.trim().length >= MIN_QUERY_LENGTH) {
      resultsList.innerHTML = '<li class="search-results__empty">Ничего не найдено</li>';
    } else {
      resultsList.innerHTML = '';
    }
  };

  const setActive = (index) => {
    const options = qsa('[data-search-result]', resultsList);
    options.forEach((el) => el.classList.remove('is-active'));
    activeIndex = index;
    if (index >= 0 && options[index]) {
      options[index].classList.add('is-active');
      input.setAttribute('aria-activedescendant', options[index].id);
      options[index].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const goToProduct = (slug) => {
    window.location.href = `${import.meta.env.BASE_URL}product-detail.html?slug=${encodeURIComponent(slug)}`;
  };

  const setOpen = (open) => {
    overlay.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      loadData();
      input.value = '';
      renderResults([]);
      requestAnimationFrame(() => input.focus());
    }
  };

  const runSearch = async () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < MIN_QUERY_LENGTH) {
      renderResults([]);
      return;
    }
    await loadData();
    renderResults((products || []).filter((item) => matchesQuery(item, query)).slice(0, MAX_RESULTS));
  };

  toggle.addEventListener('click', () => setOpen(overlay.hidden));
  closeBtn?.addEventListener('click', () => setOpen(false));
  backdrop?.addEventListener('click', () => setOpen(false));

  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      toggle.focus();
    }
  });

  input?.addEventListener('input', runSearch);

  input?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      if (!currentResults.length) return;
      event.preventDefault();
      setActive((activeIndex + 1) % currentResults.length);
    } else if (event.key === 'ArrowUp') {
      if (!currentResults.length) return;
      event.preventDefault();
      setActive((activeIndex - 1 + currentResults.length) % currentResults.length);
    } else if (event.key === 'Enter' && activeIndex >= 0 && currentResults[activeIndex]) {
      event.preventDefault();
      goToProduct(currentResults[activeIndex].slug);
    }
  });

  resultsList?.addEventListener('click', (event) => {
    const item = event.target.closest('[data-search-result]');
    if (item) goToProduct(item.dataset.slug);
  });

  resultsList?.addEventListener('mousemove', (event) => {
    const item = event.target.closest('[data-search-result]');
    if (!item) return;
    const index = qsa('[data-search-result]', resultsList).indexOf(item);
    if (index !== activeIndex) setActive(index);
  });
}
