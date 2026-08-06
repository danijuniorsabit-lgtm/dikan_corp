import { gsap } from 'gsap';
import { qs } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

export function initHeroAnimation() {
  const hero = qs('.hero');
  if (!hero || prefersReducedMotion()) return;

  const title = qs('.hero__title', hero);
  const lede = qs('.hero__lede', hero);
  const cta = qs('.hero__cta', hero);

  gsap
    .timeline({ defaults: { ease: 'power3.out', duration: 0.7 } })
    .from(hero, { opacity: 0, duration: 0.4 })
    .from(title, { y: 30, opacity: 0 }, '-=0.2')
    .from(lede, { y: 20, opacity: 0 }, '-=0.4')
    .from(cta, { y: 16, opacity: 0 }, '-=0.4');
}
