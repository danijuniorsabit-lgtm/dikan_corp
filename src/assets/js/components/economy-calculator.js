import { qs } from '../utils/dom.js';
import { createGauge } from './gauge.js';

// Illustrative estimate, not a financial guarantee — recovers a share of the
// grower's current losses, then estimates payback against a representative
// equipment price (the VibroMax JCM 10223 starting price from products.json).
const RECOVERED_LOSS_SHARE = 0.6;
const EQUIPMENT_COST = 18_500_000;
const MAX_PAYBACK_MONTHS = 24;

export function initEconomyCalculator() {
  const root = qs('[data-economy-calculator]');
  if (!root) return;

  const volumeInput = qs('#economy-volume', root);
  const lossInput = qs('#economy-loss', root);
  const priceInput = qs('#economy-price', root);

  const savingsGaugeEl = qs('[data-gauge="savings"]', root);
  const paybackGaugeEl = qs('[data-gauge="payback"]', root);
  const savingsGauge = savingsGaugeEl && createGauge(savingsGaugeEl);
  const paybackGauge = paybackGaugeEl && createGauge(paybackGaugeEl);

  const recalculate = () => {
    const volume = Number(volumeInput.value);
    const lossPercent = Number(lossInput.value);
    const price = Number(priceInput.value);

    const savingsPercent = Math.min(100, lossPercent * RECOVERED_LOSS_SHARE);
    const annualSavings = volume * price * (savingsPercent / 100);
    const monthlySavings = annualSavings / 12;
    const paybackMonths =
      monthlySavings > 0
        ? Math.min(MAX_PAYBACK_MONTHS, Math.ceil(EQUIPMENT_COST / monthlySavings))
        : MAX_PAYBACK_MONTHS;

    savingsGauge?.setValue(savingsPercent);
    paybackGauge?.setValue(paybackMonths);
  };

  [volumeInput, lossInput, priceInput].forEach((input) => {
    input?.addEventListener('input', recalculate);
  });

  recalculate();
}
