export function createTaskModalModule({
  ds,
  getTasks,
  setTasks,
  getEditingId,
  setEditingId,
  getSelPrioVal,
  setSelPrioVal,
  PURPOSES_UNIQUE,
  saveAll,
  renderAll
}) {
  function buildPurposeGrid() {
    document.getElementById('purpose-grid').innerHTML = PURPOSES_UNIQUE.map(
      (p) => `<div class="purpose-opt" data-k="${p.k}" data-action="toggle-purpose"><span class="po-icon">${p.icon}</span>${p.label}</div>`
    ).join('');
  }

  function togglePurpose(el) {
    el.classList.toggle('sel');
  }

  function getSelPurposes() {
    return [...document.querySelectorAll('.purpose-opt.sel')].map((el) => el.dataset.k);
  }

  function openModal() {
    setEditingId(null);
    setSelPrioVal('sunnah');
    document.getElementById('modal-title').textContent = 'Новый ритуал';
    buildPurposeGrid();
    resetForm();
    document.getElementById('modal').classList.add('open');
  }

  function closeModal() {
    document.getElementById('modal').classList.remove('open');
  }

  function closeOut(e) {
    if (e.target === document.getElementById('modal')) closeModal();
  }

  function resetForm() {
    ['f-name', 'f-arabic', 'f-short', 'f-dayspec', 'f-ts', 'f-te', 'f-ds', 'f-de', 'f-desc'].forEach((id) => {
      const e = document.getElementById(id);
      if (e) e.value = '';
    });
    document.getElementById('f-type').value = 'dua';
    document.getElementById('f-form').value = 'recitation';
    document.getElementById('f-freq').value = 'daily';
    document.getElementById('f-anchor').value = '';
    document.getElementById('f-remind').value = '10';
    document.getElementById('f-sn').value = '40';
    document.getElementById('f-ss').value = ds();
    document.getElementById('f-show-today').checked = false;
    setSelPrioVal('sunnah');
    document.querySelectorAll('.po').forEach((el) => el.classList.toggle('sel', el.dataset.v === 'sunnah'));
    document.querySelectorAll('.purpose-opt').forEach((el) => el.classList.remove('sel'));
    onFreqChange();
    onAnchorChange();
  }

  function onFreqChange() {
    const v = document.getElementById('f-freq').value;
    document.getElementById('streak-wrap').style.display = v === 'streak' ? 'block' : 'none';
    document.getElementById('dayspec-wrap').style.display = ['weekly', 'monthly'].includes(v) ? '' : 'none';
  }

  function onAnchorChange() {
    const hasAnchor = document.getElementById('f-anchor').value;
    const hasManualTime = document.getElementById('f-ts').value;
    document.getElementById('manual-time-wrap').style.display = hasAnchor ? 'none' : '';
    document.getElementById('show-today-wrap').style.display = hasAnchor || hasManualTime ? 'none' : '';
  }

  function selPrio(el) {
    document.querySelectorAll('.po').forEach((e) => e.classList.remove('sel'));
    el.classList.add('sel');
    setSelPrioVal(el.dataset.v);
  }

  function editTask(id) {
    const tasks = getTasks();
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setEditingId(id);
    document.getElementById('modal-title').textContent = 'Редактировать';
    buildPurposeGrid();
    resetForm();
    const set = (i, v) => {
      const e = document.getElementById(i);
      if (e) e.value = v || '';
    };
    set('f-name', t.name);
    set('f-arabic', t.arabic);
    set('f-short', t.short);
    set('f-type', t.type);
    set('f-form', t.form);
    set('f-freq', t.freq);
    set('f-anchor', t.anchor);
    set('f-dayspec', t.dayspec);
    set('f-ts', t.ts);
    set('f-te', t.te);
    set('f-ds', t.ds);
    set('f-de', t.de);
    set('f-desc', t.desc);
    set('f-remind', t.remind || 0);
    document.getElementById('f-show-today').checked = !!t.showToday;
    if (t.streak) {
      set('f-sn', t.streak.total);
      set('f-ss', t.streak.start);
    }
    setSelPrioVal(t.priority);
    document.querySelectorAll('.po').forEach((el) => el.classList.toggle('sel', el.dataset.v === getSelPrioVal()));
    (t.purposes || []).forEach((pk) => {
      const el = document.querySelector(`.purpose-opt[data-k="${pk}"]`);
      if (el) el.classList.add('sel');
    });
    onFreqChange();
    onAnchorChange();
    document.getElementById('modal').classList.add('open');
  }

  function saveTask() {
    const tasks = getTasks();
    const editingId = getEditingId();
    const name = document.getElementById('f-name').value.trim();
    if (!name) {
      document.getElementById('f-name').focus();
      return;
    }
    const freq = document.getElementById('f-freq').value;
    const prev = editingId ? tasks.find((t) => t.id === editingId)?.streak : null;
    const streak =
      freq === 'streak'
        ? { total: +document.getElementById('f-sn').value || 40, start: document.getElementById('f-ss').value || ds(), doneDates: prev?.doneDates || [] }
        : null;
    const task = {
      id: editingId || Date.now(),
      name,
      arabic: document.getElementById('f-arabic').value.trim(),
      short: document.getElementById('f-short').value.trim(),
      type: document.getElementById('f-type').value,
      form: document.getElementById('f-form').value,
      purposes: getSelPurposes(),
      priority: getSelPrioVal(),
      freq,
      anchor: document.getElementById('f-anchor').value,
      dayspec: document.getElementById('f-dayspec').value.trim(),
      ts: document.getElementById('f-ts').value,
      te: document.getElementById('f-te').value,
      ds: document.getElementById('f-ds').value,
      de: document.getElementById('f-de').value,
      desc: document.getElementById('f-desc').value.trim(),
      remind: +document.getElementById('f-remind').value || 0,
      streak,
      showToday: document.getElementById('f-show-today').checked
    };
    if (editingId) {
      const i = tasks.findIndex((t) => t.id === editingId);
      if (i >= 0) tasks[i] = task;
    } else tasks.push(task);
    setTasks(tasks);
    saveAll();
    renderAll();
    closeModal();
  }

  function deleteTask(id) {
    if (!confirm('Удалить?')) return;
    const tasks = getTasks().filter((x) => x.id !== id);
    setTasks(tasks);
    saveAll();
    renderAll();
  }

  return { buildPurposeGrid, togglePurpose, openModal, closeModal, closeOut, onFreqChange, onAnchorChange, selPrio, editTask, saveTask, deleteTask };
}
