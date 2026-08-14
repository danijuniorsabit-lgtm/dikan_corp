import { qs, qsa } from '../utils/dom.js';

export function initHeader() {
  const header = qs('[data-header]');
  if (!header) return;

  const menuToggle = qs('[data-menu-toggle]', header);
  const nav = qs('[data-header-nav]', header);
  const backdrop = qs('[data-nav-backdrop]', header);
  const navClose = qs('[data-nav-close]', header);
  const iconOpen = qs('[data-icon-open]', header);
  const iconClose = qs('[data-icon-close]', header);

  const setMenuOpen = (open) => {
    nav.classList.toggle('is-open', open);
    backdrop?.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    iconOpen.hidden = open;
    iconClose.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };

  menuToggle?.addEventListener('click', () => {
    setMenuOpen(!nav.classList.contains('is-open'));
  });

  navClose?.addEventListener('click', () => setMenuOpen(false));
  backdrop?.addEventListener('click', () => setMenuOpen(false));

  nav?.addEventListener('click', (event) => {
    if (event.target.closest('.header__nav-link')) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setMenuOpen(false);
  });

  // Decorative for now — no i18n backend to actually switch content into
  // yet, same as the desktop "RU" button this mirrors (see header.njk).
  const langButtons = qsa('[data-lang-option]', header);
  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      langButtons.forEach((other) => {
        const active = other === btn;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', String(active));
      });
    });
  });

  let lastScrolled = false;
  const onScroll = () => {
    const scrolled = window.scrollY > 8;
    if (scrolled !== lastScrolled) {
      header.classList.toggle('is-scrolled', scrolled);
      lastScrolled = scrolled;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
