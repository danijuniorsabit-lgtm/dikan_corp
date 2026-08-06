import '../scss/main.scss';

import { onReady } from './core/dom-ready.js';
import { initLazyBackgrounds } from './core/lazy-load.js';
import { initHeader } from './components/header.js';
import { initFooter } from './components/footer.js';
import { initContactForm } from './components/contact-form.js';
import { initFilterBars } from './components/filter-bar.js';
import { initProductGallery } from './components/product-gallery.js';
import { initRangeSliders } from './components/range-slider.js';
import { initEconomyCalculator } from './components/economy-calculator.js';
import { initQuoteWizard } from './components/quote-wizard.js';
import { initFinanceTabs } from './components/finance-tabs.js';
import { initLeasingCalculator } from './components/leasing-calculator.js';
import { initHeroAnimation } from './components/hero-animation.js';
import { initScrollReveal } from './components/scroll-reveal.js';

onReady(() => {
  // Shared across every page.
  initHeader();
  initFooter();
  initContactForm();
  initLazyBackgrounds();

  // Page-specific — each init is a no-op if its root element isn't in the DOM.
  initFilterBars();
  initProductGallery();
  initRangeSliders();
  initEconomyCalculator();
  initQuoteWizard();
  initFinanceTabs();
  initLeasingCalculator();
  initHeroAnimation();
  initScrollReveal();

  // Page-specific modules are wired in as each page is built (see
  // docs/UI-KIT.md / docs/ARCHITECTURE.md for the page -> module map).
});
