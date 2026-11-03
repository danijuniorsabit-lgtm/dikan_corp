import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs, qsa } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

gsap.registerPlugin(ScrollTrigger);

// Homepage "Чем мы занимаемся" — tiles rise in with a stagger when the
// section scrolls into view. Without motion (prefers-reduced-motion) the
// tiles simply stay in their final state.
export function initServicesOverview() {
  const root = qs('[data-services-overview]');
  if (!root || prefersReducedMotion()) return;

  const tiles = qsa('[data-service-tile]', root);
  if (!tiles.length) return;

  gsap.from(tiles, {
    opacity: 0,
    y: 32,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.12,
    clearProps: 'transform,opacity',
    scrollTrigger: { trigger: root, start: 'top 75%', once: true },
  });
}
