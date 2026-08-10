import { gsap } from 'gsap';
import { qs, qsa } from '../utils/dom.js';
import { isRequired, isValidPhone } from '../utils/validators.js';
import { prefersReducedMotion } from '../utils/motion.js';
import { buildWhatsAppMessage, openWhatsApp } from '../utils/whatsapp.js';

export function initQuoteWizard() {
  const root = qs('[data-quote-wizard]');
  if (!root) return;

  const form = qs('[data-wizard-form]', root);
  const steps = qsa('[data-wizard-step]', form);
  const segments = qsa('[data-wizard-segment]', root);
  const stepLabel = qs('[data-wizard-step-label]', root);
  const nextBtn = qs('[data-wizard-next]', root);
  const backBtn = qs('[data-wizard-back]', root);
  const meta = qs('[data-wizard-meta]', root);
  const successPanel = qs('[data-wizard-success]', root);

  let current = 0;

  const getSelectedLabel = (name) => {
    const checked = qs(`input[name="${name}"]:checked`, form);
    return checked ? qs('.option-card__label', checked.closest('.option-card'))?.textContent || '' : '';
  };

  const submitToWhatsApp = () => {
    openWhatsApp(
      buildWhatsAppMessage([
        { emoji: '📋', label: 'Имя', value: qs('input[name="name"]', form)?.value.trim() },
        { emoji: '📞', label: 'Телефон', value: qs('input[name="phone"]', form)?.value.trim() },
        { emoji: '🌱', label: 'Культура', value: getSelectedLabel('crop') },
        { emoji: '📐', label: 'Площадь посева', value: getSelectedLabel('area') },
        { emoji: '🔧', label: 'Текущая очистка', value: getSelectedLabel('method') },
        { emoji: '💳', label: 'Формат покупки', value: getSelectedLabel('purchase') },
      ])
    );
  };

  const isStepValid = (index) => {
    const step = steps[index];
    const radios = qsa('input[type="radio"]', step);
    if (radios.length) return radios.some((radio) => radio.checked);

    const name = qs('input[name="name"]', step);
    const phone = qs('input[name="phone"]', step);
    if (name && phone) return isRequired(name.value) && isValidPhone(phone.value);

    return true;
  };

  const render = () => {
    steps.forEach((step, index) => {
      step.hidden = index !== current;
    });
    segments.forEach((segment, index) => segment.classList.toggle('is-active', index <= current));
    stepLabel.textContent = `Шаг ${current + 1} из ${steps.length}`;
    backBtn.hidden = current === 0;
    nextBtn.textContent = current === steps.length - 1 ? 'Получить КП' : 'Далее';
    nextBtn.disabled = !isStepValid(current);

    if (!prefersReducedMotion()) {
      gsap.fromTo(steps[current], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 });
    }
  };

  const revalidate = () => {
    nextBtn.disabled = !isStepValid(current);
  };

  form.addEventListener('change', revalidate);
  form.addEventListener('input', revalidate);

  nextBtn.addEventListener('click', () => {
    if (!isStepValid(current)) return;

    if (current === steps.length - 1) {
      submitToWhatsApp();
      form.hidden = true;
      meta.hidden = true;
      successPanel.hidden = false;
      if (!prefersReducedMotion()) {
        gsap.from(successPanel, { opacity: 0, y: 12, duration: 0.4 });
      }
      return;
    }

    current += 1;
    render();
  });

  backBtn.addEventListener('click', () => {
    if (current === 0) return;
    current -= 1;
    render();
  });

  render();
}
