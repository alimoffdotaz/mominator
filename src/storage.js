export const STORAGE_KEYS = {
  tasks: 'mz5b_tasks',
  completions: 'mz5b_comp',
  settings: 'mz5b_cfg',
  tasbih: 'mz5_tasbih',
  session: 'mz_session',
  dataVersion: 'mz_data_version'
};

export const DATA_VERSION = 2;

export function parse(k, def) {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? def;
  } catch {
    return def;
  }
}

export function storageGet(k, def) {
  return parse(k, def);
}

export function storageSet(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    console.warn('Storage write failed', k, e);
  }
}

export function storageRemove(k) {
  try {
    localStorage.removeItem(k);
  } catch {}
}
