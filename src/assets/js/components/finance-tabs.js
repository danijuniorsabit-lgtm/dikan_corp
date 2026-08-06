import { gsap } from 'gsap';
import { qsa } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

export function initFinanceTabs() {
  const tabs = qsa('[data-finance-tab]');
  const panels = qsa('[data-finance-panel]');
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.financeTab;

      tabs.forEach((t) => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.financePanel !== target;
      });

      const activePanel = panels.find((panel) => panel.dataset.financePanel === target);
      if (activePanel && !prefersReducedMotion()) {
        gsap.from(activePanel, { opacity: 0, y: 12, duration: 0.35 });
      }
    });
  });
}
