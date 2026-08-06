import { qsa } from '../utils/dom.js';

const thousands = new Intl.NumberFormat('ru-RU');

function formatValue(value, format) {
  return format === 'thousands' ? thousands.format(value) : String(value);
}

function updateSlider(slider) {
  const min = Number(slider.min || 0);
  const max = Number(slider.max || 100);
  const value = Number(slider.value);
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  slider.style.setProperty('--range-progress', `${progress}%`);

  const outputId = slider.dataset.rangeOutput;
  if (outputId) {
    const output = document.getElementById(outputId);
    if (output) {
      const suffix = slider.dataset.rangeSuffix || '';
      output.textContent = `${formatValue(value, slider.dataset.rangeFormat)}${suffix}`;
    }
  }
}

export function initRangeSliders(root = document) {
  qsa('input[type="range"]', root).forEach((slider) => {
    updateSlider(slider);
    slider.addEventListener('input', () => updateSlider(slider));
  });
}
