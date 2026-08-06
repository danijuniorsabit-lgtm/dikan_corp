import { qs } from '../utils/dom.js';

const thousands = new Intl.NumberFormat('ru-RU');

// Illustrative estimate, not a binding offer — assumes a representative
// annual leasing rate and a flat "leasing vs. cash" tax/accounting benefit.
const ANNUAL_RATE = 0.14;
const SAVINGS_SHARE = 0.08;

export function initLeasingCalculator() {
  const costInput = qs('#leasing-cost');
  const termInput = qs('#leasing-term');
  const downInput = qs('#leasing-down');
  const monthlyOutput = qs('[data-leasing-monthly]');
  const savingsOutput = qs('[data-leasing-savings]');

  if (!costInput || !termInput || !downInput || !monthlyOutput || !savingsOutput) return;

  const recalculate = () => {
    const costMillions = Number(costInput.value);
    const termYears = Number(termInput.value);
    const downPercent = Number(downInput.value);

    const cost = costMillions * 1_000_000;
    const principal = cost * (1 - downPercent / 100);
    const monthlyRate = ANNUAL_RATE / 12;
    const months = termYears * 12;

    const monthlyPayment =
      monthlyRate > 0 && months > 0
        ? (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months)
        : principal / Math.max(months, 1);

    const savingsMillions = costMillions * SAVINGS_SHARE;

    monthlyOutput.textContent = thousands.format(Math.round(monthlyPayment));
    savingsOutput.textContent = savingsMillions.toFixed(1);
  };

  [costInput, termInput, downInput].forEach((input) => {
    input.addEventListener('input', recalculate);
  });

  recalculate();
}
