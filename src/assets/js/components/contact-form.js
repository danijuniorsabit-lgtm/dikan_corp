import { qs, qsa } from '../utils/dom.js';
import { isRequired, isValidEmail, isValidPhone } from '../utils/validators.js';

export function initContactForm() {
  const form = qs('[data-contact-form]');
  if (!form) return;

  const status = qs('[data-contact-status]', form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = qs('#contact-name', form);
    const phone = qs('#contact-phone', form);
    const email = qs('#contact-email', form);
    const fields = [name, phone, email];

    fields.forEach((field) => field.removeAttribute('aria-invalid'));

    let firstInvalid = null;
    if (!isRequired(name.value)) firstInvalid = firstInvalid || name;
    if (!isValidPhone(phone.value)) firstInvalid = firstInvalid || phone;
    if (!isValidEmail(email.value)) firstInvalid = firstInvalid || email;

    if (firstInvalid) {
      qsa('input', form).forEach((field) => {
        const valid =
          field === name
            ? isRequired(field.value)
            : field === phone
              ? isValidPhone(field.value)
              : field === email
                ? isValidEmail(field.value)
                : true;
        if (!valid) field.setAttribute('aria-invalid', 'true');
      });
      status.textContent = 'Проверьте, пожалуйста, поля формы.';
      firstInvalid.focus();
      return;
    }

    // No backend endpoint yet (frontend-only phase) — confirm locally.
    status.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
    form.reset();
  });
}
