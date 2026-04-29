const TSB_PRESETS = [
  { id: 'subhanallah', ar: 'سُبْحَانَ اللَّهِ', name: 'Субханаллах', meaning: 'Пречист Аллах', target: 33, preset: true },
  { id: 'alhamdulillah', ar: 'الْحَمْدُ لِلَّهِ', name: 'Альхамдулиллах', meaning: 'Хвала Аллаху', target: 33, preset: true },
  { id: 'allahuakbar', ar: 'اللَّهُ أَكْبَرُ', name: 'Аллаху Акбар', meaning: 'Аллах Велик', target: 34, preset: true },
  { id: 'tasbih_zahra', ar: 'اللَّهُ أَكْبَرُ ← الْحَمْدُ لِلَّهِ ← سُبْحَانَ اللَّهِ', name: 'Тасбих Захры (с.а.)', meaning: '34× Аллаху Акбар → 33× Альхамдулиллах → 33× Субханаллах — шиитский порядок от Имама Садыка (а)', target: 100, preset: true },
  { id: 'salawat', ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ', name: 'Салават', meaning: 'Господи, благослови Мухаммада ﷺ и род его', target: 100, preset: true },
  { id: 'astaghfirullah', ar: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', name: 'Астагфируллах', meaning: 'Прошу прощения у Аллаха и каюсь Ему', target: 100, preset: true },
  { id: 'hawqala', ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', name: 'Хавкала', meaning: 'Нет силы и мощи, кроме как у Аллаха', target: 100, preset: true },
  { id: 'la_ilaha', ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ', name: 'ЛяилляхаИллаллах', meaning: 'Нет бога, кроме Аллаха', target: 100, preset: true },
  { id: 'salawat_ibrahim', ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَآلِ إِبْرَاهِيمَ', name: 'Салават Ибрагима', meaning: 'Полный салават на Мухаммада и род его как на Ибрагима и род его', target: 100, preset: true },
  { id: 'ya_ali', ar: 'يَا عَلِيُّ يَا عَظِيمُ', name: 'Я Али Я Азым', meaning: 'О Али, о Великий — обращение к Имаму Али (а)', target: 40, preset: true },
  { id: 'ya_fatima', ar: 'يَا فَاطِمَةُ الزَّهْرَاء', name: 'Я Фатима Захра (с.а.)', meaning: 'О Фатима Захра — обращение к госпоже Захре', target: 14, preset: true },
  { id: 'bismillah', ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', name: 'Бисмиллях', meaning: 'Во имя Аллаха Милостивого Милосердного', target: 21, preset: true },
  { id: 'ya_husayn', ar: 'يَا حُسَيْنُ يَا مَظْلُومُ', name: 'Я Хусейн Я Мазлум', meaning: 'О Хусейн, о угнетённый — зикр скорби и тавассуля', target: 100, preset: true },
  { id: 'labayk_ya_husayn', ar: 'لَبَّيْكَ يَا حُسَيْنُ', name: 'Ляббейк Я Хусейн', meaning: 'Я здесь, о Хусейн — ответ на призыв Имама Хусейна (а)', target: 313, preset: true }
];

export function createTasbihModule({ initialState, storageSet, storageKey, syncToCloud, ds }) {
  let tsbState = initialState;

  function setState(next) {
    tsbState = next;
  }
  function getState() {
    return tsbState;
  }
  function tsbAllZikrs() {
    return [...TSB_PRESETS, ...(tsbState.customZikrs || [])];
  }
  function tsbActive() {
    return tsbAllZikrs().find((z) => z.id === tsbState.activeId) || TSB_PRESETS[0];
  }
  function tsbSave() {
    storageSet(storageKey, tsbState);
    syncToCloud('mz_tasbih', tsbState);
  }
  function tsbBump() {
    const el = document.getElementById('tsb-count');
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 120);
  }
  function tsbVibrateOnce() {
    if (navigator.vibrate) navigator.vibrate(18);
  }
  function tsbCompleteCycle(z) {
    const btn = document.getElementById('tsb-tap-btn');
    if (btn) {
      btn.classList.add('complete');
      setTimeout(() => btn.classList.remove('complete'), 600);
    }
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    tsbState.history.unshift({ id: z.id, ar: z.ar, name: z.name, cycles: tsbState.cycles, ts: new Date().toISOString() });
    if (tsbState.history.length > 50) tsbState.history = tsbState.history.slice(0, 50);
  }
  function tsbTap() {
    const z = tsbActive();
    tsbState.count++;
    if (tsbState.todayDate !== ds()) {
      tsbState.todayDate = ds();
      tsbState.todayTotal = 0;
    }
    tsbState.todayTotal++;
    if (tsbState.count >= z.target) {
      tsbState.cycles++;
      tsbState.count = 0;
      tsbCompleteCycle(z);
    }
    tsbSave();
    tsbRenderCounter();
    tsbBump();
    tsbVibrateOnce();
  }
  function tsbReset() {
    if (tsbState.count === 0 && tsbState.cycles === 0) return;
    const z = tsbActive();
    if (tsbState.count > 0 || tsbState.cycles > 0) {
      tsbState.history.unshift({ id: z.id, ar: z.ar, name: z.name, count: tsbState.count, cycles: tsbState.cycles, ts: new Date().toISOString() });
      if (tsbState.history.length > 50) tsbState.history = tsbState.history.slice(0, 50);
    }
    tsbState.count = 0;
    tsbState.cycles = 0;
    tsbSave();
    tsbRenderCounter();
    tsbRenderHistory();
  }
  function tsbUndo() {
    if (tsbState.count > 0) tsbState.count--;
    else if (tsbState.cycles > 0) {
      tsbState.cycles--;
      tsbState.count = tsbActive().target - 1;
    }
    tsbSave();
    tsbRenderCounter();
  }
  function tsbSelect(id) {
    const z = tsbActive();
    if (tsbState.count > 0 || tsbState.cycles > 0) {
      tsbState.history.unshift({ id: z.id, ar: z.ar, name: z.name, count: tsbState.count, cycles: tsbState.cycles, ts: new Date().toISOString() });
    }
    tsbState.activeId = id;
    tsbState.count = 0;
    tsbState.cycles = 0;
    tsbSave();
    tsbRenderAll();
  }
  function tsbRenderCounter() {
    const z = tsbActive();
    const elCount = document.getElementById('tsb-count');
    const elCi = document.getElementById('tsb-count-inline');
    const elTi = document.getElementById('tsb-target-inline');
    const elCycles = document.getElementById('tsb-cycles');
    const elAr = document.getElementById('tsb-current-ar');
    const elName = document.getElementById('tsb-current-name');
    if (!elCount) return;
    elCount.textContent = tsbState.count;
    if (elCi) elCi.textContent = tsbState.count;
    if (elTi) elTi.textContent = z.target;
    if (elCycles) elCycles.textContent = tsbState.cycles;
    if (elAr) elAr.textContent = z.ar;
    if (elName) elName.textContent = z.name + (z.meaning ? ` — ${z.meaning}` : '');
    const ring = document.getElementById('tsb-ring-fill');
    if (ring) {
      const circ = 534;
      const pct = z.target > 0 ? tsbState.count / z.target : 0;
      ring.style.strokeDashoffset = circ - circ * Math.min(pct, 1);
      ring.style.stroke = pct >= 1 ? 'var(--g600)' : 'var(--accent)';
    }
    const todayEl = document.getElementById('tsb-today-total');
    const todayWrap = document.getElementById('tsb-today-total-wrap');
    if (todayEl) todayEl.textContent = tsbState.todayTotal || 0;
    if (todayWrap) todayWrap.style.display = tsbState.todayTotal > 0 ? 'block' : 'none';
  }
  function tsbRenderZikrList() {
    const el = document.getElementById('tsb-zikr-list');
    if (!el) return;
    const all = tsbAllZikrs();
    el.innerHTML = all
      .map(
        (z) => `<div class="tsb-zikr-item ${z.id === tsbState.activeId ? 'active-zikr' : ''}" data-action="tsb-select" data-id="${z.id}">
      <div class="tzi-ar">${z.ar}</div>
      <div class="tzi-body"><div class="tzi-name">${z.name}</div><div class="tzi-meaning">${z.meaning || ''}</div></div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
        <div class="tzi-target">×${z.target}</div>
        ${!z.preset ? `<button class="tsb-ctrl-btn danger" style="width:26px;height:26px;font-size:12px" data-action="tsb-delete-custom" data-id="${z.id}">🗑</button>` : ''}
      </div>
    </div>`
      )
      .join('');
  }
  function tsbRenderHistory() {
    const el = document.getElementById('tsb-history-list');
    if (!el) return;
    const hist = tsbState.history || [];
    if (!hist.length) {
      el.innerHTML = '<div class="tsb-empty-hist">История пуста — начните считать зикр</div>';
      return;
    }
    el.innerHTML = hist
      .slice(0, 20)
      .map((h) => {
        const d = new Date(h.ts);
        const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const dateStr = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        const totalCount = (h.cycles || 0) * (tsbAllZikrs().find((z) => z.id === h.id)?.target || 33) + (h.count || 0);
        return `<div class="tsb-session-row">
      <div style="flex:1;min-width:0"><div class="tsr-zikr">${h.name}</div><div class="tsr-zikr-ar">${h.ar}</div></div>
      <div style="text-align:right;flex-shrink:0"><div class="tsr-count">${totalCount > 0 ? totalCount : `${h.cycles || 0}×`}</div><div class="tsr-time">${dateStr} ${timeStr}</div></div>
    </div>`;
      })
      .join('');
  }
  function tsbRenderAll() {
    tsbRenderCounter();
    tsbRenderZikrList();
    tsbRenderHistory();
  }
  function tsbOpenAddModal() {
    document.getElementById('tsb-modal').classList.add('open');
  }
  function tsbCloseModal() {
    document.getElementById('tsb-modal').classList.remove('open');
  }
  function tsbSaveCustom() {
    const name = document.getElementById('tsb-f-name').value.trim();
    const ar = document.getElementById('tsb-f-ar').value.trim();
    const meaning = document.getElementById('tsb-f-meaning').value.trim();
    const target = parseInt(document.getElementById('tsb-f-target').value, 10) || 33;
    if (!name) {
      document.getElementById('tsb-f-name').focus();
      return;
    }
    const id = `custom_${Date.now()}`;
    if (!tsbState.customZikrs) tsbState.customZikrs = [];
    tsbState.customZikrs.push({ id, ar, name, meaning, target, preset: false });
    tsbSave();
    tsbCloseModal();
    ['tsb-f-name', 'tsb-f-ar', 'tsb-f-meaning'].forEach((i) => {
      document.getElementById(i).value = '';
    });
    tsbRenderZikrList();
  }
  function tsbDeleteCustom(id) {
    if (!confirm('Удалить этот зикр?')) return;
    tsbState.customZikrs = (tsbState.customZikrs || []).filter((z) => z.id !== id);
    if (tsbState.activeId === id) {
      tsbState.activeId = 'subhanallah';
      tsbState.count = 0;
      tsbState.cycles = 0;
    }
    tsbSave();
    tsbRenderAll();
  }
  function tsbClearHistory() {
    if (!confirm('Очистить историю сессий?')) return;
    tsbState.history = [];
    tsbSave();
    tsbRenderHistory();
  }

  return {
    setState,
    getState,
    tsbTap,
    tsbReset,
    tsbUndo,
    tsbSelect,
    tsbRenderAll,
    tsbOpenAddModal,
    tsbCloseModal,
    tsbSaveCustom,
    tsbDeleteCustom,
    tsbClearHistory
  };
}
