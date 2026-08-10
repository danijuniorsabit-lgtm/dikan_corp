import { gsap } from 'gsap';
import { qs, qsa } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

const AUTOPLAY_INTERVAL = 5000;
const FADE_DURATION = 0.6;

function animateIn(slide) {
  const eyebrow = qs('.hero-slider__eyebrow', slide);
  const heading = qs('.hero-slider__heading', slide);
  const subheading = qs('.hero-slider__subheading', slide);
  const cta = qs('.hero-slider__cta', slide);

  gsap
    .timeline({ defaults: { ease: 'power3.out', duration: 0.7 } })
    .from(eyebrow, { y: 16, opacity: 0 })
    .from(heading, { y: 24, opacity: 0 }, '-=0.45')
    .from(subheading, { y: 20, opacity: 0 }, '-=0.45')
    .from(cta, { y: 16, opacity: 0 }, '-=0.4');
}

export function initHeroSlider() {
  const root = qs('[data-hero-slider]');
  if (!root) return;

  const slides = qsa('[data-hero-slide]', root);
  const dots = qsa('[data-hero-dot]', root);
  const prevBtn = qs('[data-hero-prev]', root);
  const nextBtn = qs('[data-hero-next]', root);
  if (slides.length < 2) return;

  const reduced = prefersReducedMotion();
  let current = 0;
  let timer = null;

  const setActiveDot = (index) => {
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-selected', String(i === index));
    });
  };

  const goTo = (index) => {
    const next = (index + slides.length) % slides.length;
    if (next === current) return;

    const outgoing = slides[current];
    const incoming = slides[next];

    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.setAttribute('inert', '');
    incoming.removeAttribute('aria-hidden');
    incoming.removeAttribute('inert');
    incoming.classList.add('is-active');

    if (reduced) {
      outgoing.classList.remove('is-active');
    } else {
      gsap.set(incoming, { opacity: 0 });
      gsap.to(incoming, { opacity: 1, duration: FADE_DURATION, ease: 'power1.inOut' });
      gsap.to(outgoing, {
        opacity: 0,
        duration: FADE_DURATION,
        ease: 'power1.inOut',
        onComplete: () => outgoing.classList.remove('is-active'),
      });
    }

    setActiveDot(next);
    current = next;
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };
  const start = () => {
    stop();
    timer = window.setInterval(() => goTo(current + 1), AUTOPLAY_INTERVAL);
  };

  prevBtn?.addEventListener('click', () => {
    goTo(current - 1);
    start();
  });
  nextBtn?.addEventListener('click', () => {
    goTo(current + 1);
    start();
  });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.index));
      start();
    });
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  if (!reduced) animateIn(slides[0]);
  start();
}
