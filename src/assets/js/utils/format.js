const numberFormatter = new Intl.NumberFormat('ru-RU');

export function formatNumber(value) {
  return numberFormatter.format(Math.round(value));
}

export const PRICE_ON_REQUEST = 'Цена по запросу';
const PRICE_STEP = 5_000_000;

// Catalog prices are shown approximately, rounded DOWN to a 5 million step
// (15 893 893 -> "от 15 млн ₸", 63 769 932 -> "от 60 млн ₸",
// 98 306 862 -> "от 95 млн ₸"); prices under 5 million fall back to whole
// millions. The exact number stays in products.json. Shared by the Nunjucks
// `pricefrom` filter (plugins/nunjucks-pages.js) and the client-side
// renderers — this is the only place the rule lives.
export function formatPriceFrom(price) {
  const value = Number(price);
  if (!Number.isFinite(value) || value <= 0) return PRICE_ON_REQUEST;
  let millions = Math.floor(value / PRICE_STEP) * (PRICE_STEP / 1_000_000);
  if (millions === 0) millions = Math.floor(value / 1_000_000);
  return millions > 0 ? `от ${millions} млн ₸` : PRICE_ON_REQUEST;
}

// e.g. formatMillionTenge(18.5) -> "18.5 млн ₸"
export function formatMillionTenge(millions) {
  const value = Number.isInteger(millions) ? millions : millions.toFixed(1);
  return `${value} млн ₸`;
}

export function formatTonsPerHour(value) {
  return `${formatNumber(value)} т/ч`;
}

export function formatTenge(value) {
  return `${formatNumber(value)} ₸`;
}
