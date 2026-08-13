import { qs } from '../utils/dom.js';

export function initHeader() {
  const header = qs('[data-header]');
  if (!header) return;

  const menuToggle = qs('[data-menu-toggle]', header);
  const nav = qs('[data-header-nav]', header);
  const iconOpen = qs('[data-icon-open]', header);
  const iconClose = qs('[data-icon-close]', header);

  const setMenuOpen = (open) => {
    nav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    iconOpen.hidden = open;
    iconClose.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };

  menuToggle?.addEventListener('click', () => {
    setMenuOpen(!nav.classList.contains('is-open'));
  });

  nav?.addEventListener('click', (event) => {
    if (event.target.closest('.header__nav-link')) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setMenuOpen(false);
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
