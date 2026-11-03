import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs, qsa } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

gsap.registerPlugin(ScrollTrigger);

// About page "Собственная инженерная экспертиза": a single SVG path is drawn
// through the centres of the 10 numbered nodes (measured from the DOM, so it
// follows whatever layout CSS picked — two rows of 5 on desktop, a vertical
// timeline on mobile). On scroll the path draws progressively and each node
// lights up once the line reaches it. With prefers-reduced-motion the route is
// shown complete and static.
export function initExpertise() {
  const root = qs('[data-expertise-route]');
  if (!root) return;

  const svg = qs('[data-route-svg]', root);
  const track = qs('[data-route-track]', root);
  const progress = qs('[data-route-progress]', root);
  const nodes = qsa('[data-route-node]', root);
  const steps = qsa('[data-route-step]', root);
  if (!svg || !track || !progress || nodes.length < 2) return;

  let length = 0;
  let fractions = [];

  // Node centres relative to the route container.
  const centres = () => {
    const box = root.getBoundingClientRect();
    return nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
    });
  };

  const build = () => {
    const box = root.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);

    const pts = centres();
    const stepBoxes = steps.map((s) => s.getBoundingClientRect());
    const d = [`M ${pts[0].x} ${pts[0].y}`];
    const cumulative = [0];
    let total = 0;

    for (let i = 1; i < pts.length; i += 1) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const wrapped = Math.abs(cur.x - prev.x) > 2 && cur.y - prev.y > 2; // next row
      if (wrapped) {
        // Leave the row on the right, run through the gap between the rows,
        // re-enter at the start of the next row.
        const rightEdge = stepBoxes[i - 1].right - box.left - 6;
        const leftEdge = Math.min(stepBoxes[i].left - box.left + 6, cur.x);
        const midY = (stepBoxes[i - 1].bottom + stepBoxes[i].top) / 2 - box.top;
        const route = [
          [rightEdge, prev.y],
          [rightEdge, midY],
          [leftEdge, midY],
          [leftEdge, cur.y],
          [cur.x, cur.y],
        ];
        let from = prev;
        route.forEach(([x, y]) => {
          d.push(`L ${x} ${y}`);
          total += Math.hypot(x - from.x, y - from.y);
          from = { x, y };
        });
      } else {
        d.push(`L ${cur.x} ${cur.y}`);
        total += Math.hypot(cur.x - prev.x, cur.y - prev.y);
      }
      cumulative.push(total);
    }

    length = total;
    fractions = cumulative.map((c) => (total ? c / total : 0));
    const path = d.join(' ');
    track.setAttribute('d', path);
    progress.setAttribute('d', path);
    progress.style.strokeDasharray = String(length);
  };

  const render = (p) => {
    progress.style.strokeDashoffset = String(length * (1 - p));
    nodes.forEach((node, i) => node.classList.toggle('is-lit', p >= fractions[i] - 0.001));
  };

  build();
  root.classList.add('is-enhanced');

  if (prefersReducedMotion()) {
    render(1);
    window.addEventListener('resize', () => {
      build();
      render(1);
    });
    return;
  }

  let current = 0;
  render(0);

  ScrollTrigger.create({
    trigger: root,
    start: 'top 65%',
    end: 'bottom 70%',
    scrub: 0.4,
    onUpdate: (self) => {
      current = self.progress;
      render(current);
    },
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      build();
      render(current);
      ScrollTrigger.refresh();
    }, 150);
  });
}
