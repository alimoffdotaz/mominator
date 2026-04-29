export function ds(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function t2m(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function nowM() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

export function addM(t, m) {
  if (!t) return '';
  const [h, mm] = t.split(':').map(Number);
  const tot = ((h * 60 + mm + m) % 1440 + 1440) % 1440;
  return `${String(Math.floor(tot / 60)).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`;
}

export function hijri(date) {
  const months = ['Мухаррам', 'Сафар', 'Раби I', 'Раби II', 'Джумада I', 'Джумада II', 'Раджаб', 'Шаабан', 'Рамадан', 'Шавваль', 'Зуль-Каада', 'Зуль-Хиджжа'];
  const diff = (date - new Date('0622-07-16')) / (29.53058 * 86400000);
  const tm = Math.floor(diff);
  return `${months[tm % 12]} ${Math.floor(tm / 12) + 1} г.х.`;
}
