export const TYPES = {
  salah: { label: 'Намаз', icon: '🕌' },
  dua: { label: "Ду'а", icon: '🤲' },
  dhikr: { label: 'Зикр', icon: '📿' },
  tasbih: { label: 'Тасбих', icon: '✨' },
  istigfar: { label: 'Истигфар', icon: '💧' },
  ziarat: { label: 'Зиярат', icon: '🌹' },
  tilawah: { label: 'Коран', icon: '📖' },
  sawm: { label: 'Пост', icon: '🌙' },
  sadaqah: { label: 'Садака/Хумс', icon: '💚' },
  tawassul: { label: 'Тавассуль', icon: '🕯' },
  amal: { label: 'Амаль', icon: '⚡' }
};

export const PURPOSES = [
  { k: 'forgiveness', icon: '💧', label: 'Прощение грехов' },
  { k: 'rizq', icon: '🌿', label: 'Увеличение удела' },
  { k: 'hajat', icon: '🌟', label: 'Исполнение желаний' },
  { k: 'health', icon: '💚', label: 'Здоровье (общее)' },
  { k: 'health_head', icon: '🧠', label: 'Головная боль' },
  { k: 'health_eyes', icon: '👁', label: 'Боли в глазах' },
  { k: 'health_teeth', icon: '🦷', label: 'Зубная боль' },
  { k: 'health_heart', icon: '❤️', label: 'Сердце' },
  { k: 'shifa', icon: '🌿', label: 'Исцеление (шифа)' },
  { k: 'protection', icon: '🛡', label: 'Защита' },
  { k: 'fear', icon: '🕊', label: 'Избавление от страха' },
  { k: 'anxiety', icon: '🌊', label: 'Тревога, уныние' },
  { k: 'irfan', icon: '🌙', label: 'Ирфан / духовность' },
  { k: 'iman', icon: '⭐', label: 'Укрепление имана' },
  { k: 'parents', icon: '👨‍👩‍👦', label: 'За родителей' },
  { k: 'children', icon: '👶', label: 'За детей' },
  { k: 'marriage', icon: '💍', label: 'Брак / семья' },
  { k: 'love', icon: '💚', label: 'Любовь / отношения' },
  { k: 'knowledge', icon: '📚', label: 'Знание / мудрость' },
  { k: 'rizq', icon: '💰', label: 'Избавление от долгов' },
  { k: 'tawbah', icon: '🌅', label: 'Покаяние (тауба)' },
  { k: 'barakah', icon: '✨', label: 'Бараках' },
  { k: 'deceased', icon: '🌹', label: 'За усопших' },
  { k: 'community', icon: '🌍', label: 'За умму / общину' },
  { k: 'general', icon: '🕌', label: 'Общая практика' }
];

export const PURPOSES_UNIQUE = PURPOSES.filter((p, i, a) => a.findIndex((x) => x.k === p.k) === i);

export const FORMS = {
  recitation: { label: 'Чтение', icon: '🗣' },
  physical: { label: 'Действие', icon: '🙏' },
  combined: { label: 'Комбинир.', icon: '🔄' },
  silent: { label: 'Мысленно', icon: '🤫' },
  written: { label: 'Письменно', icon: '✍️' }
};

export const FREQS = {
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
  annual: 'Ежегодно',
  once: 'Однократно',
  streak: 'Цепочка'
};

export const PRIO_LABEL = { fard: 'Ваджиб', sunnah: 'Мустахаб', mustahabb: 'Нафиля' };
export const PRIO_TAG = { fard: 'tg-fard', sunnah: 'tg-sunnah', mustahabb: 'tg-mustahabb' };
export const ANCHOR_LBL = {
  before_fajr: 'До Фаджра',
  after_fajr: 'После Фаджра',
  after_sunrise: 'После восхода',
  before_dhuhr: 'До Зухра',
  after_dhuhr: 'После Зухра',
  before_asr: 'До Аср',
  after_asr: 'После Аср',
  before_maghrib: 'До заката',
  after_maghrib: 'После Магриба',
  before_isha: 'До Иша',
  after_isha: 'После Иша',
  midnight_shia: 'Полночь (шиит.)',
  tahajjud: 'Тахаджуд'
};

export const PR_NAMES = [
  { k: 'fajr', n: 'Фаджр' },
  { k: 'sunrise', n: 'Шурук' },
  { k: 'dhuhr', n: 'Зухр' },
  { k: 'asr', n: 'Аср' },
  { k: 'maghrib', n: 'Магриб' },
  { k: 'isha', n: 'Иша' }
];
