export function createCatalogModule({
  getTasks,
  TYPES,
  FORMS,
  FREQS,
  PRIO_LABEL,
  PRIO_TAG,
  ANCHOR_LBL,
  PURPOSES_UNIQUE,
  editTask,
  deleteTask
}) {
  let filterOpen = false;
  const fState = { freq: '', type: '', purpose: '', prio: '' };

  function renderCatalogFilters() {
    document.getElementById('freq-chips').innerHTML = [{ v: '', l: 'Все' }, ...Object.entries(FREQS).map(([v, l]) => ({ v, l }))]
      .map((f) => `<button class="chip freq-chip ${fState.freq === f.v ? 'active' : ''}" data-action="set-filter" data-key="freq" data-value="${f.v}">${f.l}</button>`)
      .join('');
    document.getElementById('type-chips').innerHTML = [{ v: '', icon: '', label: 'Все' }, ...Object.entries(TYPES).map(([v, t]) => ({ v, ...t }))]
      .map((t) => `<button class="chip type-chip ${fState.type === t.v ? 'active' : ''}" data-action="set-filter" data-key="type" data-value="${t.v}">${t.icon ? `${t.icon} ` : ''}${t.label}</button>`)
      .join('');
    document.getElementById('purpose-chips').innerHTML = [{ k: '', icon: '', label: 'Все' }, ...PURPOSES_UNIQUE]
      .map((p) => `<button class="chip purpose-chip ${fState.purpose === p.k ? 'active' : ''}" data-action="set-filter" data-key="purpose" data-value="${p.k}">${p.icon ? `${p.icon} ` : ''}${p.label}</button>`)
      .join('');
    document.getElementById('prio-chips').innerHTML = [{ v: '', l: 'Все' }, ...Object.entries(PRIO_LABEL).map(([v, l]) => ({ v, l }))]
      .map((p) => `<button class="chip prio-chip ${fState.prio === p.v ? 'active' : ''}" data-action="set-filter" data-key="prio" data-value="${p.v}">${p.l}</button>`)
      .join('');
    const cnt = Object.values(fState).filter((v) => v).length;
    const countEl = document.getElementById('filter-count');
    countEl.textContent = cnt;
    countEl.style.display = cnt ? 'inline' : 'none';
    document.getElementById('filter-toggle-btn').classList.toggle('has-filters', cnt > 0);
  }

  function setFilter(key, val) {
    fState[key] = val;
    renderCatalog();
  }
  function clearAllFilters() {
    Object.keys(fState).forEach((k) => {
      fState[k] = '';
    });
    document.getElementById('search-inp').value = '';
    renderCatalog();
  }
  function toggleFilterPanel() {
    filterOpen = !filterOpen;
    document.getElementById('filter-panel').classList.toggle('hidden', !filterOpen);
  }
  function onSearch() {
    const v = document.getElementById('search-inp').value;
    document.getElementById('search-clear').classList.toggle('visible', v.length > 0);
    renderCatalog();
  }
  function clearSearch() {
    document.getElementById('search-inp').value = '';
    document.getElementById('search-clear').classList.remove('visible');
    renderCatalog();
  }

  function renderCatalog() {
    renderCatalogFilters();
    const tasks = getTasks();
    const q = (document.getElementById('search-inp').value || '').toLowerCase();
    const filtered = tasks
      .filter((t) => {
        if (fState.freq && t.freq !== fState.freq) return false;
        if (fState.type && t.type !== fState.type) return false;
        if (fState.purpose && !(t.purposes || []).includes(fState.purpose)) return false;
        if (fState.prio && t.priority !== fState.prio) return false;
        if (q) {
          const match =
            t.name.toLowerCase().includes(q) ||
            (t.arabic || '').includes(q) ||
            (t.short || '').toLowerCase().includes(q) ||
            (t.purposes || []).some((pk) => PURPOSES_UNIQUE.find((p) => p.k === pk)?.label.toLowerCase().includes(q)) ||
            (TYPES[t.type]?.label || '').toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => ({ fard: 0, sunnah: 1, mustahabb: 2 }[a.priority] || 3) - ({ fard: 0, sunnah: 1, mustahabb: 2 }[b.priority] || 3));

    document.getElementById('results-info').innerHTML = `<span class="results-count">${filtered.length} ритуалов</span>`;
    const el = document.getElementById('catalog-content');
    if (!filtered.length) {
      el.innerHTML = '<div class="empty"><span class="ei">🔍</span><p>Ничего не найдено.<br><button class="clear-all" data-action="clear-filters">Сбросить фильтры</button></p></div>';
      return;
    }
    el.innerHTML = filtered
      .map((t) => {
        const tp = TYPES[t.type];
        const fm = FORMS[t.form];
        const purposeTags = (t.purposes || [])
          .map((pk) => {
            const p = PURPOSES_UNIQUE.find((x) => x.k === pk);
            return p ? `<span class="tag tg-purpose">${p.icon} ${p.label}</span>` : '';
          })
          .join('');
        return `<div class="tcard pr-${t.priority}" style="cursor:default">
      <div class="tc-body">
        <div class="tc-name">${t.name}${t.arabic ? `<span class="tc-ar">${t.arabic}</span>` : ''}</div>
        <div class="tc-tags">
          <span class="tag ${PRIO_TAG[t.priority] || ''}">${PRIO_LABEL[t.priority] || ''}</span>
          ${tp ? `<span class="tag tg-type">${tp.icon} ${tp.label}</span>` : ''}
          ${fm ? `<span class="tag tg-form">${fm.icon} ${fm.label}</span>` : ''}
          <span class="tag tg-freq">${FREQS[t.freq] || t.freq}</span>
          ${t.anchor ? `<span class="tag tg-anchor">${ANCHOR_LBL[t.anchor] || t.anchor}</span>` : ''}
          ${t.streak ? `<span class="tag tg-streak">🔥 ${t.streak.total} дн.</span>` : ''}
        </div>
        ${purposeTags ? `<div class="tc-tags" style="margin-top:4px">${purposeTags}</div>` : ''}
        ${t.short ? `<div style="font-size:12px;color:var(--text3);margin-top:4px;line-height:1.5">${t.short}</div>` : ''}
      </div>
      <div class="tc-actions" style="opacity:1">
        <button class="tc-btn" data-action="edit-task" data-id="${t.id}">✏️</button>
        <button class="tc-btn del" data-action="delete-task" data-id="${t.id}">🗑</button>
      </div>
    </div>`;
      })
      .join('');
  }

  return { renderCatalog, setFilter, clearAllFilters, toggleFilterPanel, onSearch, clearSearch };
}
