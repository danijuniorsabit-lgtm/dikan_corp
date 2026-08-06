export function createGauge(el) {
  const min = Number(el.dataset.gaugeMin ?? 0);
  const max = Number(el.dataset.gaugeMax ?? 100);
  const valueEl = el.querySelector('[data-gauge-value]');
  const needle = el.querySelector('[data-gauge-needle]');
  const arc = el.querySelector('.gauge__arc');
  const arcLength = arc ? arc.getTotalLength() : 0;

  if (arc) {
    arc.style.strokeDasharray = `${arcLength}`;
    arc.style.strokeDashoffset = `${arcLength}`;
  }

  const setValue = (rawValue) => {
    const value = Math.min(max, Math.max(min, rawValue));
    const ratio = max > min ? (value - min) / (max - min) : 0;
    const angle = ratio * 180 - 90;

    if (needle) needle.style.transform = `rotate(${angle}deg)`;
    if (arc) arc.style.strokeDashoffset = `${arcLength * (1 - ratio)}`;
    if (valueEl) {
      valueEl.textContent =
        el.dataset.gaugeFormat === 'round' ? String(Math.round(value)) : value.toFixed(1);
    }
  };

  setValue(min);
  return { setValue, min, max };
}
