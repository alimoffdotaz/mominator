export function createNotificationService({
  getSettings,
  getTasks,
  getPrayers,
  getSentTags,
  setSentTags,
  storageSet,
  nowM,
  t2m,
  isToday,
  isDone,
  tTime
}) {
  let timers = [];

  function requestNotifs() {
    if (!('Notification' in window)) return Promise.resolve();
    return Notification.requestPermission().then((p) => {
      const bar = document.getElementById('notif-bar');
      if (bar) bar.style.display = p === 'granted' ? 'none' : '';
      if (p === 'granted') scheduleNotifs();
    });
  }

  function isInQuietHours() {
    const settings = getSettings();
    if (!settings.nightMode) return false;
    const q = settings.quietHours || { start: '23:00', end: '05:00' };
    const now = nowM();
    const s = t2m(q.start || '23:00');
    const e = t2m(q.end || '05:00');
    if (s == null || e == null) return false;
    return s <= e ? now >= s && now < e : now >= s || now < e;
  }

  function canSendTag(tag) {
    const settings = getSettings();
    const cooldown = Math.max(5, settings.reminderCooldownMin || 30);
    const sent = getSentTags();
    const ts = sent[tag] || 0;
    return Date.now() - ts > cooldown * 60000;
  }

  function markTag(tag) {
    const sent = getSentTags();
    sent[tag] = Date.now();
    setSentTags(sent);
    storageSet('mz5_notif_tags', sent);
  }

  function scheduleNotifs() {
    timers.forEach(clearTimeout);
    timers = [];
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const settings = getSettings();
    const now = nowM();
    const ahead = settings.notifAhead || 10;
    const p = getPrayers();
    const maybeNotify = (title, body, tag) => {
      if (isInQuietHours() || !canSendTag(tag)) return;
      markTag(tag);
      new Notification(title, { body, tag });
    };

    if (p)
      [{ n: 'Фаджр', k: 'fajr' }, { n: 'Зухр', k: 'dhuhr' }, { n: 'Аср', k: 'asr' }, { n: 'Магриб', k: 'maghrib' }, { n: 'Иша', k: 'isha' }].forEach((pr) => {
        const m = t2m(p[pr.k]);
        if (!m) return;
        const at = m - ahead;
        if (at <= now) return;
        timers.push(setTimeout(() => maybeNotify(`🕌 ${pr.n}`, `Через ${ahead} мин · ${p[pr.k]}`, `p${pr.k}`), (at - now) * 60000));
      });

    getTasks()
      .filter(isToday)
      .forEach((t) => {
        if (!t.remind || isDone(t)) return;
        const tm = tTime(t);
        if (!tm) return;
        const at = t2m(tm) - t.remind;
        if (at <= now) return;
        timers.push(setTimeout(() => maybeNotify(`⏰ ${t.name}`, `Через ${t.remind} мин · ${tm}`, `t${t.id}`), (at - now) * 60000));
      });
  }

  return { requestNotifs, scheduleNotifs };
}
