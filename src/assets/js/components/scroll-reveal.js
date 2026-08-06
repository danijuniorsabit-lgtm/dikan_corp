import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qsa } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

gsap.registerPlugin(ScrollTrigger);

// Curated structural selectors rather than a data-reveal attribute sprinkled
// through every template — any page that has one of these renders it with a
// scroll-triggered fade/rise; pages without a match are unaffected.
const REVEAL_GROUPS = [
  '.section-header',
  '.testimonial-card',
  '.product-card',
  '.service-card',
  '.team-member',
  '.certificate-card',
  '.download-card',
  '.project-card',
  '.trust-badge',
  '.about-stats__item',
  '.partner-card',
  '.gauge',
];

export function initScrollReveal(root = document) {
  if (prefersReducedMotion()) return;

  REVEAL_GROUPS.forEach((selector) => {
    const group = qsa(selector, root);
    if (!group.length) return;

    gsap.from(group, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: group[0].closest('.section') || group[0].parentElement || group[0],
        start: 'top 85%',
        once: true,
      },
    });
  });
}
