import { PR_NAMES } from './constants.js';

export function createSettingsModule({ getSettings, setSettings, getPrayers, setPrayerTime, saveAll, scheduleNotifs, renderPrayerUI, renderInsights, renderCalendar }) {
  function renderSettings() {
    const settings = getSettings();
    const p = getPrayers() || {};
    document.getElementById('prayer-grid').innerHTML = PR_NAMES.map(
      (pr) => `<div class="pg-cell"><div class="pg-lbl">${pr.n}</div><input class="pg-inp" type="time" value="${p[pr.k] || ''}" onchange="setPrayer('${pr.k}',this.value)"></div>`
    ).join('');
    if (settings.notifAhead) document.getElementById('notif-ahead').value = settings.notifAhead;
    document.getElementById('notif-cooldown').value = String(settings.reminderCooldownMin || 30);
    document.getElementById('toggle-night').classList.toggle('on', !!settings.nightMode);
    renderInsights();
    renderCalendar();
  }

  function setPrayer(k, v) {
    setPrayerTime(k, v);
    saveAll();
    scheduleNotifs();
    const p = getPrayers();
    if (p) renderPrayerUI(p);
  }

  function saveSettings() {
    const settings = getSettings();
    settings.notifAhead = +document.getElementById('notif-ahead').value;
    settings.nightMode = document.getElementById('toggle-night').classList.contains('on');
    settings.reminderCooldownMin = +document.getElementById('notif-cooldown').value || 30;
    setSettings(settings);
    saveAll();
    scheduleNotifs();
  }

  return { renderSettings, setPrayer, saveSettings };
}
