import { qs } from '../utils/dom.js';
import { initProductGallery } from './product-gallery.js';

const ARROW_RIGHT_SVG =
  '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 8h11.5M9 3.5 13.5 8 9 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);

// Mirrors product-card.njk's markup — the price/CTA button markup this
// builds must stay in sync with that template and ui/button.njk by hand,
// since this is a client-side re-render of server-rendered content.
function productCardHTML(item, { cta } = {}) {
  const ctaText = cta === 'quote' ? 'Заказать КП' : 'Подробнее';
  const ctaHref =
    cta === 'quote' ? '/calculator.html' : `/product-detail.html?slug=${encodeURIComponent(item.slug)}`;

  return `
    <article class="product-card" data-category="${escapeHTML(item.category)}">
      <div class="product-card__media">
        <img class="product-card__img" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy" />
        ${item.isNew ? '<span class="badge badge--corner">New</span>' : ''}
      </div>
      <div class="product-card__body">
        <div class="product-card__row">
          <span class="product-card__name">${escapeHTML(item.shortName || item.name)}</span>
          <span class="product-card__spec">${escapeHTML(item.specLabel)}</span>
        </div>
        <p class="product-card__price">от ${escapeHTML(item.priceFrom)} млн ₸</p>
        <a class="btn btn--primary btn--block" href="${ctaHref}">
          <span>${escapeHTML(ctaText)}</span>
          <span class="btn__icon" aria-hidden="true">${ARROW_RIGHT_SVG}</span>
        </a>
      </div>
    </article>
  `;
}

function renderGallery(item) {
  const gallery = qs('[data-product-gallery]');
  if (!gallery) return;

  const mainImg = qs('[data-gallery-main]', gallery);
  if (mainImg) {
    mainImg.src = item.image;
    mainImg.alt = item.name;
  }

  const badge = qs('[data-gallery-badge]', gallery);
  if (badge) badge.hidden = !item.isNew;

  const thumbsWrap = qs('[data-gallery-thumbs]', gallery);
  if (!thumbsWrap) return;

  const extra = Array.isArray(item.images) ? item.images : [];
  thumbsWrap.hidden = extra.length === 0;
  thumbsWrap.innerHTML = '';

  [item.image, ...extra].forEach((src, index) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'product-gallery__thumb' + (index === 0 ? ' is-active' : '');
    thumb.dataset.galleryThumb = '';
    thumb.dataset.full = src;
    thumb.setAttribute('aria-label', `Изображение ${index + 1}`);

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    thumb.appendChild(img);
    thumbsWrap.appendChild(thumb);
  });

  // Thumb click handlers are bound to the DOM nodes we just replaced.
  initProductGallery();
}

function renderSpecs(item) {
  const specs = qs('[data-product-specs]');
  if (!specs) return;

  qs('[data-spec="title"]', specs).textContent = item.name;
  qs('[data-spec="description"]', specs).textContent = item.description;
  qs('[data-spec="productivity"]', specs).textContent = item.productivity;

  const powerRow = qs('[data-spec-row="power"]', specs);
  if (powerRow) {
    powerRow.hidden = !item.power;
    if (item.power) qs('[data-spec="power"]', powerRow).textContent = `${item.power} кВт`;
  }

  qs('[data-spec="cultures"]', specs).textContent = (item.cultures || []).join(', ');
  qs('[data-spec="condition"]', specs).textContent = item.condition;
  qs('[data-spec="price"]', specs).textContent = `от ${item.priceFrom} млн ₸`;
}

function renderJsonLd(item) {
  const script = qs('[data-product-jsonld]');
  if (!script) return;

  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description: item.description,
    brand: { '@type': 'Brand', name: 'DIKAN' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KZT',
      price: Math.round(item.priceFrom * 1_000_000),
      availability: 'https://schema.org/InStock',
      url: 'https://dikan.kz/product-detail.html',
    },
  });
}

function renderSimilarProducts(item, allItems) {
  const others = allItems.filter((p) => p.slug !== item.slug);
  const primary = qs('[data-similar-products-primary]');
  const secondary = qs('[data-similar-products-secondary]');

  if (primary) {
    primary.innerHTML = others
      .slice(0, 3)
      .map((p) => productCardHTML(p, { cta: 'quote' }))
      .join('');
  }
  if (secondary) {
    secondary.innerHTML = others
      .slice(3, 6)
      .map((p) => productCardHTML(p))
      .join('');
  }
}

function renderProduct(item, allItems) {
  document.title = `${item.name} — DIKAN`;
  const metaDescription = qs('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute('content', item.description);

  const heroTitle = qs('.page-hero__title');
  if (heroTitle) heroTitle.textContent = item.name;

  const grid = qs('[data-current-slug]');
  if (grid) grid.dataset.currentSlug = item.slug;

  renderGallery(item);
  renderSpecs(item);
  renderJsonLd(item);
  renderSimilarProducts(item, allItems);
}

// product-detail.html is otherwise a static, server-rendered page (always
// showing products.items[0] — see plugins/nunjucks-pages.js pageContext()).
// This makes it respond to ?slug=... by fetching the same product data at
// runtime and re-rendering the page in place, without a page reload.
export async function initProductDetail() {
  if (!qs('[data-product-gallery]')) return;

  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) return;

  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) throw new Error(`products.json responded with ${response.status}`);
    const data = await response.json();
    const items = data.items || [];
    const item = items.find((p) => p.slug === slug);

    if (!item) {
      console.warn(`[product-detail] no product found for slug "${slug}"`);
      return;
    }

    renderProduct(item, items);
  } catch (err) {
    console.error('[product-detail] failed to load product data', err);
  }
}
