import { qsa } from '../utils/dom.js';

// Panels stay in the DOM and are collapsed via CSS grid-template-rows (see
// _faq.scss) rather than the `hidden` attribute, so the open/close can
// transition smoothly — aria-hidden keeps the collapsed content out of the
// accessibility tree without fighting that CSS transition.
export function initFaqAccordion() {
  qsa('[data-faq-item]').forEach((item) => {
    const trigger = item.querySelector('.faq-item__trigger');
    const panel = item.querySelector('.faq-item__panel');
    if (!trigger || !panel) return;

    panel.setAttribute('aria-hidden', 'true');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
      panel.setAttribute('aria-hidden', String(!isOpen));
    });
  });
}
