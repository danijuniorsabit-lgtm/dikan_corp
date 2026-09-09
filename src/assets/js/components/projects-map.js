import { qs } from '../utils/dom.js';

// Approximate oblast centers for projects.json's free-text `location`
// strings (there's no lat/lng in the data) — matched by the first regex
// that hits, in this order. Falls back to the Kazakhstan-wide center for
// any location that doesn't match (logged, not silently dropped).
const REGION_COORDS = [
  { match: /Акмолинск|Астана/i, coords: [51.8, 71.0] },
  { match: /Костанайск/i, coords: [52.2, 63.6] },
  { match: /Северо-Казахстанск|Петропавловск/i, coords: [54.8, 69.1] },
  { match: /Павлодарск/i, coords: [52.3, 76.9] },
  { match: /Восточно-Казахстанск/i, coords: [49.9, 82.6] },
  { match: /Карагандинск/i, coords: [48.0, 73.1] },
  { match: /Кызылординск/i, coords: [44.8, 65.5] },
  { match: /Западно-Казахстанск/i, coords: [51.2, 51.4] },
];
const KAZAKHSTAN_CENTER = [48.0, 66.0];

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);

function regionCoordsFor(location) {
  const region = REGION_COORDS.find((r) => r.match.test(location));
  return region ? region.coords : KAZAKHSTAN_CENTER;
}

// Deterministic pseudo-random in [0, 1) — same (seed) always scatters the
// same way, so markers don't jump around between page loads or rebuilds.
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ±1–2° offset so projects sharing an oblast center don't stack on top of
// each other. `axis` (0 for lat, 1 for lng) keeps the two offsets
// independent instead of always moving diagonally.
function scatterOffset(index, axis) {
  const magnitude = 1 + seededRandom(index * 12.9898 + axis * 78.233 + 1);
  const sign = seededRandom(index * 37.719 + axis * 4.618 + 2) < 0.5 ? -1 : 1;
  return magnitude * sign;
}

function markerCoordsFor(item, index) {
  const [lat, lng] = regionCoordsFor(item.location);
  return [lat + scatterOffset(index, 0), lng + scatterOffset(index, 1)];
}

function popupHTML(item) {
  return `
    <p class="projects-map__popup-title">${escapeHTML(item.title)}</p>
    <dl class="projects-map__popup-meta">
      <div><dt>Заказчик</dt><dd>${escapeHTML(item.client)}</dd></div>
      <div><dt>Год</dt><dd>${escapeHTML(item.year)}</dd></div>
      <div><dt>Локация</dt><dd>${escapeHTML(item.location)}</dd></div>
    </dl>
  `;
}

export async function initProjectsMap() {
  const container = qs('[data-projects-map]');
  if (!container) return;

  try {
    const [{ default: L }, response] = await Promise.all([
      import('leaflet'),
      fetch(`${import.meta.env.BASE_URL}data/projects.json`),
    ]);
    await import('leaflet/dist/leaflet.css');

    if (!response.ok) throw new Error(`projects.json responded with ${response.status}`);
    const data = await response.json();
    const items = data.items || [];

    const map = L.map(container, { scrollWheelZoom: false }).setView(KAZAKHSTAN_CENTER, 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const markerIcon = L.divIcon({
      className: 'projects-map__marker',
      iconSize: [16, 16],
    });

    items.forEach((item, index) => {
      if (!item.location) return;
      L.marker(markerCoordsFor(item, index), { icon: markerIcon })
        .addTo(map)
        .bindPopup(popupHTML(item));
    });
  } catch (err) {
    console.error('[projects-map] failed to load the projects map', err);
  }
}
