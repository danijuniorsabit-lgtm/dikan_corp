const numberFormatter = new Intl.NumberFormat('ru-RU');

export function formatNumber(value) {
  return numberFormatter.format(Math.round(value));
}

// e.g. formatMillionTenge(18.5) -> "18.5 млн ₸"
export function formatMillionTenge(millions) {
  const value = Number.isInteger(millions) ? millions : millions.toFixed(1);
  return `${value} млн ₸`;
}

export function formatTonsPerHour(value) {
  return `${formatNumber(value)} т/ч`;
}

export function formatTenge(value) {
  return `${formatNumber(value)} ₸`;
}
