export function doneOnDate(tasks, completions, iso) {
  return tasks.reduce((acc, t) => acc + ((completions[t.id] || []).includes(iso) ? 1 : 0), 0);
}

export function analytics(tasks, completions, ds, days) {
  const out = { done: 0, total: 0 };
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = ds(d);
    out.done += doneOnDate(tasks, completions, iso);
    out.total += Math.max(1, tasks.length);
  }
  out.rate = out.total ? Math.round((out.done / out.total) * 100) : 0;
  return out;
}

export function renderInsights({ tasks, completions, ds }) {
  const el = document.getElementById('insights-content');
  if (!el) return;
  const w7 = analytics(tasks, completions, ds, 7);
  const w30 = analytics(tasks, completions, ds, 30);
  const totalDoneToday = doneOnDate(tasks, completions, ds());
  el.innerHTML = `<div class="ins-grid">
    <div class="ins-card"><div class="ins-k">Сегодня</div><div class="ins-v">${totalDoneToday}</div><div class="ins-sub">выполнено задач</div></div>
    <div class="ins-card"><div class="ins-k">7 дней</div><div class="ins-v">${w7.rate}%</div><div class="ins-sub">доля выполнения</div></div>
    <div class="ins-card"><div class="ins-k">30 дней</div><div class="ins-v">${w30.rate}%</div><div class="ins-sub">доля выполнения</div></div>
  </div>`;
}

export function renderCalendar({ tasks, completions, ds }) {
  const root = document.getElementById('calendar-content');
  if (!root) return;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1);
  const days = new Date(y, m + 1, 0).getDate();
  const startDow = (first.getDay() + 6) % 7;
  const names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const cells = [];
  let doneDays = 0;
  for (let i = 0; i < startDow; i++) cells.push('<div class="cal-day empty"></div>');
  for (let d = 1; d <= days; d++) {
    const dt = new Date(y, m, d);
    const iso = ds(dt);
    const done = doneOnDate(tasks, completions, iso) > 0;
    const today = iso === ds();
    if (done) doneDays += 1;
    const weekend = dt.getDay() === 0 || dt.getDay() === 6;
    cells.push(`<div class="cal-day ${done ? 'done' : ''} ${today ? 'today' : ''} ${weekend ? 'weekend' : ''}">${d}</div>`);
  }
  root.innerHTML = `<div class="cal-wrap">
  <div class="cal-head">
    <strong>${now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</strong>
    <span class="cal-meta">${doneDays}/${days} дней с выполнением</span>
  </div>
  <div class="cal-legend">
    <span class="cal-dot done"></span><span>Есть выполнение</span>
    <span class="cal-dot today"></span><span>Сегодня</span>
  </div>
  <div class="cal-grid cal-dow-row">${names.map((n) => `<div class="cal-dow">${n}</div>`).join('')}</div>
  <div class="cal-grid cal-days">${cells.join('')}</div>
  </div>`;
}
