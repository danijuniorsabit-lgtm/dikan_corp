const WHATSAPP_NUMBER = '77710200100';

// fields: ordered [{ emoji, label, value }] — a field is dropped from the
// message entirely when its value is empty, matching "[field if exists]".
export function buildWhatsAppMessage(fields) {
  const lines = fields.filter((f) => f.value).map((f) => `${f.emoji} ${f.label}: ${f.value}`);
  return ['🌾 Новая заявка с сайта DIKAN', '', ...lines].join('\n');
}

// No backend — the "submission" is just handing a pre-filled wa.me link to
// the browser. Must be called synchronously inside the form's submit/click
// handler (no awaits before it) or browsers treat it as a blocked popup.
export function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
}
