import { qs } from '../utils/dom.js';
import { isValidEmail } from '../utils/validators.js';

export function initFooter() {
  const form = qs('[data-newsletter-form]');
  if (!form) return;

  const status = qs('[data-newsletter-status]', form.parentElement);
  const input = qs('input[type="email"]', form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!isValidEmail(input.value)) {
      status.textContent = 'Введите корректный email.';
      input.setAttribute('aria-invalid', 'true');
      return;
    }

    input.removeAttribute('aria-invalid');
    // No backend endpoint yet (frontend-only phase) — confirm locally.
    status.textContent = 'Спасибо! Мы подписали вас на рассылку.';
    form.reset();
  });
}
