// ═══════════════════════════════════════════════════
// TAXONOMY
// ═══════════════════════════════════════════════════
const TYPES = {
  salah:    {label:'Намаз',       icon:'🕌'},
  dua:      {label:'Ду\'а',       icon:'🤲'},
  dhikr:    {label:'Зикр',        icon:'📿'},
  tasbih:   {label:'Тасбих',      icon:'✨'},
  istigfar: {label:'Истигфар',    icon:'💧'},
  ziarat:   {label:'Зиярат',      icon:'🌹'},
  tilawah:  {label:'Коран',       icon:'📖'},
  sawm:     {label:'Пост',        icon:'🌙'},
  sadaqah:  {label:'Садака/Хумс', icon:'💚'},
  tawassul: {label:'Тавассуль',   icon:'🕯'},
  amal:     {label:'Амаль',       icon:'⚡'},
};

const PURPOSES = [
  {k:'forgiveness', icon:'💧', label:'Прощение грехов'},
  {k:'rizq',        icon:'🌿', label:'Увеличение удела'},
  {k:'hajat',       icon:'🌟', label:'Исполнение желаний'},
  {k:'health',      icon:'💚', label:'Здоровье (общее)'},
  {k:'health_head', icon:'🧠', label:'Головная боль'},
  {k:'health_eyes', icon:'👁', label:'Боли в глазах'},
  {k:'health_teeth',icon:'🦷', label:'Зубная боль'},
  {k:'health_heart',icon:'❤️', label:'Сердце'},
  {k:'shifa',       icon:'🌿', label:'Исцеление (шифа)'},
  {k:'protection',  icon:'🛡', label:'Защита'},
  {k:'fear',        icon:'🕊', label:'Избавление от страха'},
  {k:'anxiety',     icon:'🌊', label:'Тревога, уныние'},
  {k:'irfan',       icon:'🌙', label:'Ирфан / духовность'},
  {k:'iman',        icon:'⭐', label:'Укрепление имана'},
  {k:'parents',     icon:'👨‍👩‍👦', label:'За родителей'},
  {k:'children',    icon:'👶', label:'За детей'},
  {k:'marriage',    icon:'💍', label:'Брак / семья'},
  {k:'love',        icon:'💚', label:'Любовь / отношения'},
  {k:'knowledge',   icon:'📚', label:'Знание / мудрость'},
  {k:'rizq',        icon:'💰', label:'Избавление от долгов'},
  {k:'tawbah',      icon:'🌅', label:'Покаяние (тауба)'},
  {k:'barakah',     icon:'✨', label:'Бараках'},
  {k:'deceased',    icon:'🌹', label:'За усопших'},
  {k:'community',   icon:'🌍', label:'За умму / общину'},
  {k:'general',     icon:'🕌', label:'Общая практика'},
];
// dedupe purposes
const PURPOSES_UNIQUE = PURPOSES.filter((p,i,a) => a.findIndex(x=>x.k===p.k)===i);

const FORMS = {
  recitation: {label:'Чтение',    icon:'🗣'},
  physical:   {label:'Действие',  icon:'🙏'},
  combined:   {label:'Комбинир.', icon:'🔄'},
  silent:     {label:'Мысленно',  icon:'🤫'},
  written:    {label:'Письменно', icon:'✍️'},
};

const FREQS = {daily:'Ежедневно',weekly:'Еженедельно',monthly:'Ежемесячно',annual:'Ежегодно',once:'Однократно',streak:'Цепочка'};
const PRIO_LABEL = {fard:'Ваджиб',sunnah:'Мустахаб',mustahabb:'Нафиля'};
const PRIO_TAG   = {fard:'tg-fard',sunnah:'tg-sunnah',mustahabb:'tg-mustahabb'};
const ANCHOR_LBL = {before_fajr:'До Фаджра',after_fajr:'После Фаджра',after_sunrise:'После восхода',before_dhuhr:'До Зухра',after_dhuhr:'После Зухра',before_asr:'До Аср',after_asr:'После Аср',before_maghrib:'До заката',after_maghrib:'После Магриба',before_isha:'До Иша',after_isha:'После Иша',midnight_shia:'Полночь (шиит.)',tahajjud:'Тахаджуд'};

// ═══════════════════════════════════════════════════
// PRAYER CALC (Jafari)
// ═══════════════════════════════════════════════════
const DEG = Math.PI/180;
function jd(date){const Y=date.getFullYear(),M=date.getMonth()+1,D=date.getDate();let A=Math.floor(Y/100),B=0;if(Y>1582||(Y===1582&&M>10)||(Y===1582&&M===10&&D>=15))B=2-A+Math.floor(A/4);return Math.floor(365.25*(Y+4716))+Math.floor(30.6001*(M+1))+D+B-1524.5}
function sunPos(d){const g=(357.529+0.98560028*d)%360,q=(280.459+0.98564736*d)%360,L=(q+1.915*Math.sin(g*DEG)+0.020*Math.sin(2*g*DEG))%360,e=23.439-0.00000036*d,sL=Math.sin(L*DEG),RA=Math.atan2(Math.cos(e*DEG)*sL,Math.cos(L*DEG))/DEG,decl=Math.asin(Math.sin(e*DEG)*sL)/DEG,EqT=q/15-(RA<0?RA+360:RA)/15;return{decl,EqT}}
function ha(lat,decl,angle){const n=Math.cos(angle*DEG)-Math.sin(lat*DEG)*Math.sin(decl*DEG),d2=Math.cos(lat*DEG)*Math.cos(decl*DEG);if(Math.abs(d2)<1e-10||Math.abs(n/d2)>1)return null;return Math.acos(n/d2)/DEG}
function asrHA(lat,decl){const tAlt=Math.atan(1/(1+Math.tan(Math.abs(lat-decl)*DEG)))/DEG;return ha(lat,decl,90-tAlt)}
function toT(h,tz){let t=((h+tz)%24+24)%24;const hh=Math.floor(t),mm=Math.round((t-hh)*60),mf=mm===60?0:mm,hf=mm===60?hh+1:hh;return`${String(hf%24).padStart(2,'0')}:${String(mf).padStart(2,'0')}`}

function calcPrayers(lat,lng,date){
  const D=jd(date)-2451545.0,tz=date.getTimezoneOffset()/-60;
  const{decl,EqT}=sunPos(D);
  const noon=12-EqT-lng/15;
  const haFajr=ha(lat,decl,90+16),haRise=ha(lat,decl,90+0.833),haAsr=asrHA(lat,decl),haMag=ha(lat,decl,90+4),haIsha=ha(lat,decl,90+14);
  if(!haFajr||!haRise||!haAsr||!haMag||!haIsha)return null;
  const fajrU=noon-haFajr/15,sunriseU=noon-haRise/15,dhuhrU=noon,asrU=noon+haAsr/15,magU=noon+haMag/15,ishaU=noon+haIsha/15;
  const midU=magU+(fajrU+24-magU)/2,tahU=fajrU-(fajrU-(magU-24))/3;
  return{fajr:toT(fajrU,tz),sunrise:toT(sunriseU,tz),dhuhr:toT(dhuhrU,tz),asr:toT(asrU,tz),maghrib:toT(magU,tz),isha:toT(ishaU,tz),midnight:toT(midU,tz),tahajjud:toT(tahU,tz)};
}

// Qibla
const KAABA={lat:21.4225,lng:39.8262};
function qiblaB(lat,lng){const φ1=lat*DEG,φ2=KAABA.lat*DEG,Δλ=(KAABA.lng-lng)*DEG,y=Math.sin(Δλ)*Math.cos(φ2),x=Math.cos(φ1)*Math.sin(φ2)-Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);return((Math.atan2(y,x)/DEG)+360)%360}

// ═══════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════
// ═══════════════════════════════════════════════════
// SUPABASE CONFIG
// ═══════════════════════════════════════════════════
const SB_URL = 'https://vagivwibdvpqnvxrhhmw.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZ2l2d2liZHZwcW52eHJoaG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTEzNzQsImV4cCI6MjA5Mjg2NzM3NH0.HFUN0JvSP4zHvNZi8B7dG1__7Fd1Usg9l_D38zZrA1w';

// ═══════════════════════════════════════════════════
// SUPABASE AUTH
// ═══════════════════════════════════════════════════
let currentUser = null; // { id, email, access_token }

async function sbAuth(endpoint, body){
  const r = await fetch(`${SB_URL}/auth/v1/${endpoint}`, {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
}

async function authSignUp(email, password){
  return sbAuth('signup', { email, password });
}

async function authSignIn(email, password){
  return sbAuth('token?grant_type=password', { email, password });
}

async function authSignOut(){
  if(!currentUser) return;
  await fetch(`${SB_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + currentUser.access_token }
  });
  currentUser = null;
  storageRemove(STORAGE_KEYS.session);
  showAuthScreen();
}

async function authGetUser(token){
  const r = await fetch(`${SB_URL}/auth/v1/user`, {
    headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token }
  });
  return r.json();
}

async function authRefresh(refresh_token){
  return sbAuth('token?grant_type=refresh_token', { refresh_token });
}

function saveSession(data){
  const session = {
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    user_id:       data.user?.id || data.id,
    email:         data.user?.email || data.email,
    expires_at:    Date.now() + (data.expires_in || 3600) * 1000
  };
  storageSet(STORAGE_KEYS.session, session);
  currentUser = session;
  // Update sbGet/sbSet to use real token
  updateSbHeaders();
}

function updateSbHeaders(){
  // Headers updated dynamically via currentUser in sbGet/sbSet
}

// Override sbGet/sbSet to use currentUser token
async function sbGet(table){
  if(!currentUser) return null;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?user_id=eq.${encodeURIComponent(currentUser.user_id)}&select=data`, {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + currentUser.access_token }
    });
    const rows = await r.json();
    return rows?.[0]?.data ?? null;
  } catch(e){ return null; }
}

async function sbSet(table, data){
  if(!currentUser) return;
  try {
    await fetch(`${SB_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SB_KEY, 'Authorization': 'Bearer ' + currentUser.access_token,
        'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ user_id: currentUser.user_id, data, updated_at: new Date().toISOString() })
    });
  } catch(e){}
}

// Debounce cloud sync — don't spam on every tap
let syncTimers = {};
function syncToCloud(table, data){
  clearTimeout(syncTimers[table]);
  syncTimers[table] = setTimeout(() => sbSet(table, data), 1500);
}

const STORAGE_KEYS = {
  tasks: 'mz5b_tasks',
  completions: 'mz5b_comp',
  settings: 'mz5b_cfg',
  tasbih: 'mz5_tasbih',
  session: 'mz_session',
  dataVersion: 'mz_data_version'
};
const DATA_VERSION = 2;

function parse(k,def){try{return JSON.parse(localStorage.getItem(k))??def}catch{return def}}
function storageGet(k,def){return parse(k,def)}
function storageSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){console.warn('Storage write failed',k,e)}}
function storageRemove(k){try{localStorage.removeItem(k)}catch(e){}}

function ensureStateIntegrity(){
  if(!settings || typeof settings!=='object') settings = { notifAhead:10 };
  settings.notifAhead = Number.isFinite(+settings.notifAhead) ? +settings.notifAhead : 10;
  if(typeof settings.nightMode!=='boolean') settings.nightMode = true;
  if(!settings.quietHours || typeof settings.quietHours!=='object') settings.quietHours = { start:'23:00', end:'05:00' };
  if(!settings.reminderCooldownMin) settings.reminderCooldownMin = 30;
  if(!Array.isArray(tasks)) tasks = [];
  if(!completions || typeof completions!=='object') completions = {};
  tasks = tasks.filter(Boolean).map(t=>({ remind:0, purposes:[], ...t }));
}

function migrateData(){
  const version = Number(localStorage.getItem(STORAGE_KEYS.dataVersion) || 0);
  if(version < 1){
    if(settings && typeof settings==='object' && settings.notifAhead==null) settings.notifAhead = 10;
  }
  if(version < 2){
    settings = settings || {};
    settings.quietHours = settings.quietHours || { start:'23:00', end:'05:00' };
    settings.nightMode = typeof settings.nightMode==='boolean' ? settings.nightMode : true;
    settings.reminderCooldownMin = settings.reminderCooldownMin || 30;
  }
  localStorage.setItem(STORAGE_KEYS.dataVersion, String(DATA_VERSION));
}

let tasks       = storageGet(STORAGE_KEYS.tasks, []);
let completions = storageGet(STORAGE_KEYS.completions, {});
let settings    = storageGet(STORAGE_KEYS.settings, {notifAhead:10});
let prayers     = null;
let editingId=null, selPrioVal='sunnah', curPage='today', filterPanelOpen=false;
let selPurposes=new Set(), activeFilters={freq:'',type:'',purpose:'',prio:''};
let notifTimers=[];
let sentNotifTags = storageGet('mz5_notif_tags', {});

migrateData();
ensureStateIntegrity();

if(!tasks.length){
  const td=ds();
  tasks=[
    // ── Ежедневные ваджиб-намазы (шиитский фикх) ──
    {id:1,  name:'Намаз Фаджр',            arabic:'صلاة الفجر',              type:'salah',    form:'physical',   purposes:['general'],              priority:'fard',     freq:'daily',  anchor:'after_fajr',    ts:'',te:'06:40',ds:'',de:'',dayspec:'',short:'2 ракаата ваджиб. Время: от рассвета до восхода солнца',desc:'По шиитскому фикху Зухр и Аср, а также Магриб и Иша объединяются. Фаджр совершается отдельно.',remind:10,streak:null,showToday:false},
    {id:2,  name:'Нафиля Фаджра',           arabic:'نافلة الفجر',             type:'salah',    form:'physical',   purposes:['general','iman'],        priority:'mustahabb',freq:'daily',  anchor:'before_fajr',   ts:'',te:'',ds:'',de:'',dayspec:'',short:'2 ракаата — читается непосредственно до начала намаза Фаджр',desc:'Мустахаб по шиитскому фикху. Читается после истигфара на рассвете.',remind:5,streak:null,showToday:false},
    {id:3,  name:'Намаз Зухр и Аср',        arabic:'صلاة الظهر والعصر',       type:'salah',    form:'physical',   purposes:['general'],              priority:'fard',     freq:'daily',  anchor:'after_dhuhr',   ts:'',te:'15:30',ds:'',de:'',dayspec:'',short:'4+4 ракаата ваджиб. Зухр и Аср объединяются (джама) — отличие от суннитского фикха',desc:'По шиитскому фикху объединение Зухра и Аср без уважительной причины — допустимо и практикуется.',remind:10,streak:null,showToday:false},
    {id:4,  name:'Намаз Магриб и Иша',      arabic:'صلاة المغرب والعشاء',     type:'salah',    form:'physical',   purposes:['general'],              priority:'fard',     freq:'daily',  anchor:'after_maghrib', ts:'',te:'23:59',ds:'',de:'',dayspec:'',short:'3+4 ракаата ваджиб. Магриб и Иша объединяются (джама)',desc:'По шиитскому фикху объединение Магриба и Иша допустимо. Нафиля Магриба (4 р.) читается после Иша.',remind:10,streak:null,showToday:false},
    // ── Нафиля (мустахаб-намазы) ──
    {id:5,  name:'Нафиля Зухра и Аср',      arabic:'نافلة الظهر والعصر',      type:'salah',    form:'physical',   purposes:['general','iman'],        priority:'mustahabb',freq:'daily',  anchor:'before_dhuhr',  ts:'',te:'',ds:'',de:'',dayspec:'',short:'8 ракаатов до Зухра + 8 ракаатов до Аср',desc:'Итого 16 ракаатов нафили днём. Мустахаб по шиитскому фикху.',remind:5,streak:null,showToday:false},
    {id:6,  name:'Нафиля Магриба',           arabic:'نافلة المغرب',            type:'salah',    form:'physical',   purposes:['general','iman'],        priority:'mustahabb',freq:'daily',  anchor:'after_isha',    ts:'',te:'',ds:'',de:'',dayspec:'',short:'4 ракаата — читается после намаза Иша',desc:'По шиитскому фикху нафиля Магриба — 4 ракаата, читается после Иша, а не сразу после Магриба.',remind:0,streak:null,showToday:false},
    {id:7,  name:'Намаз аль-Лейл',          arabic:'صلاة الليل',              type:'salah',    form:'physical',   purposes:['irfan','forgiveness','iman'],priority:'mustahabb',freq:'daily',anchor:'tahajjud',    ts:'',te:'',ds:'',de:'',dayspec:'',short:'11 ракаатов: 8 (нафиля ночи) + 2 (Шафаа) + 1 (Витр)',desc:'Витр в шиитском фикхе — это последний 1 ракаат намаза аль-Лейл, а не отдельный 3-ракаатный намаз. Читается в последнюю треть ночи перед Фаджром.',remind:30,streak:null,showToday:false},
    // ── Зикр и ду'а ──
    {id:8,  name:'Тасбих Захры (с.а.)',      arabic:'تسبيح فاطمة الزهراء',    type:'tasbih',   form:'recitation', purposes:['forgiveness','barakah','iman'],priority:'sunnah',freq:'daily',anchor:'after_isha',   ts:'',te:'',ds:'',de:'',dayspec:'',short:'34× Аллаху Акбар → 33× Альхамдулиллах → 33× Субханаллах',desc:'Именно такой порядок передаётся от Имама Садыка (а): начинается с Аллаху Акбар. Читается после каждого намаза и перед сном.',remind:0,streak:null,showToday:false},
    {id:9,  name:'Утренний зикр',            arabic:'أذكار الصباح',            type:'dhikr',    form:'recitation', purposes:['protection','iman'],     priority:'sunnah',   freq:'daily',  anchor:'after_fajr',    ts:'',te:'',ds:'',de:'',dayspec:'',short:'Зикры и ду\'а после Фаджра по преданиям Ахль аль-Байт (а)',desc:'',remind:5,streak:null,showToday:false},
    {id:10, name:'Вечерний зикр',            arabic:'أذكار المساء',            type:'dhikr',    form:'recitation', purposes:['protection','anxiety'],  priority:'sunnah',   freq:'daily',  anchor:'before_maghrib',ts:'',te:'',ds:'',de:'',dayspec:'',short:'Зикры до захода солнца по преданиям Ахль аль-Байт (а)',desc:'',remind:10,streak:null,showToday:false},
    {id:11, name:'Чтение Корана',            arabic:'تلاوة القرآن الكريم',    type:'tilawah',  form:'recitation', purposes:['iman','knowledge','shifa'],priority:'sunnah',freq:'daily', anchor:'after_fajr',    ts:'',te:'',ds:'',de:'',dayspec:'',short:'Минимум 1 страница ежедневно',desc:'',remind:0,streak:null,showToday:false},
    // ── Еженедельные ──
    {id:12, name:'Намаз Джумуа',             arabic:'صلاة الجمعة',             type:'salah',    form:'physical',   purposes:['general','community'],   priority:'fard',     freq:'weekly', anchor:'after_dhuhr',   ts:'',te:'',ds:'',de:'',dayspec:'5',short:'Ваджиб в период Гайбата: либо Джумуа (2 р.), либо Зухр (4 р.) — на выбор',desc:'По шиитскому фикху в период Большого Гайбата Имама Махди (а.ф.) Джумуа-намаз является ваджиб тахйири — верующий выбирает между Джумуа и Зухром. Большинство марджа считают Джумуа предпочтительным.',remind:30,streak:null,showToday:false},
    {id:13, name:'Дуа Кумейль',              arabic:'دعاء كميل',               type:'dua',      form:'recitation', purposes:['forgiveness','tawbah','irfan'],priority:'sunnah',freq:'weekly',anchor:'before_maghrib',ts:'',te:'',ds:'',de:'',dayspec:'5',short:'Ночь пятницы — передано от Повелителя Верующих Али ибн Аби Талиба (а)',desc:'Дуа Кумейль передаётся от Имама Али (а) через Кумейля ибн Зияда. Читается в ночь пятницы.',remind:30,streak:null,showToday:false},
    {id:14, name:'Дуа Нудба',                arabic:'دعاء الندبة',             type:'dua',      form:'recitation', purposes:['irfan','iman','hajat'],  priority:'sunnah',   freq:'weekly', anchor:'after_fajr',    ts:'',te:'',ds:'',de:'',dayspec:'5',short:'Утро пятницы — плач по Имаму Махди (а.ф.) и ожидание его зухура',desc:'Читается в утро пятницы. Передаётся от Имама Садыка (а).',remind:10,streak:null,showToday:false},
    // ── Цепочки ──
    {id:15, name:'Дуа Ахд',                  arabic:'دعاء العهد',              type:'dua',      form:'recitation', purposes:['iman','hajat'],          priority:'sunnah',   freq:'streak', anchor:'after_fajr',    ts:'',te:'',ds:td,de:'',dayspec:'',short:'40 утренних намазов подряд после Фаджра',desc:'Тот, кто читает это ду\'а 40 утренних намазов, будет включён в число помощников Имама Махди (а.ф.) — Имам Садык (а)',remind:5,streak:{total:40,start:td,doneDates:[]},showToday:false},
    // ── Зиярат ──
    {id:16, name:'Зиярат Ашура',             arabic:'زيارة عاشوراء',          type:'ziarat',   form:'recitation', purposes:['forgiveness','parents','deceased','irfan'],priority:'sunnah',freq:'daily',anchor:'after_fajr',ts:'',te:'',ds:'',de:'',dayspec:'',short:'С 100 саляватами и 100 ла\'натами. Передан от Имама Бакира (а)',desc:'',remind:0,streak:null,showToday:false},
    {id:17, name:'Зиярат аль-Варис',         arabic:'زيارة الوارث',           type:'ziarat',   form:'recitation', purposes:['irfan','iman'],          priority:'sunnah',   freq:'weekly', anchor:'after_fajr',    ts:'',te:'',ds:'',de:'',dayspec:'1',short:'Зиярат Имама Хусейна (а) в понедельник',desc:'',remind:0,streak:null,showToday:false},
    // ── Прочие обязанности ──
    {id:18, name:'Хумс',                     arabic:'الخمس',                  type:'sadaqah',  form:'physical',   purposes:['barakah','rizq'],        priority:'fard',     freq:'annual', anchor:'',              ts:'',te:'',ds:'',de:'',dayspec:'',short:'1/5 прибыли сверх годовых расходов — ваджиб по шиитскому фикху',desc:'Хумс обязателен по шиитскому фикху. Уплачивается марджа или его представителю.',remind:0,streak:null,showToday:false},
    // ── Ду'а ──
    {id:19, name:'Дуа Тавассуль',            arabic:'دعاء التوسل',             type:'tawassul', form:'recitation', purposes:['hajat','forgiveness'],   priority:'sunnah',   freq:'weekly', anchor:'',              ts:'',te:'',ds:'',de:'',dayspec:'',short:'Обращение через 14 Непорочных (а)',desc:'',remind:0,streak:null,showToday:false},
    {id:20, name:'Дуа за родителей',          arabic:'دعاء للوالدين',           type:'dua',      form:'recitation', purposes:['parents','forgiveness'], priority:'sunnah',   freq:'daily',  anchor:'after_fajr',    ts:'',te:'',ds:'',de:'',dayspec:'',short:'Ежедневное ду\'а за отца и мать',desc:'',remind:0,streak:null,showToday:false},
    {id:21, name:'Дуа за детей',              arabic:'دعاء للأولاد',            type:'dua',      form:'recitation', purposes:['children','protection'], priority:'sunnah',   freq:'daily',  anchor:'after_fajr',    ts:'',te:'',ds:'',de:'',dayspec:'',short:'Защита и благополучие детей',desc:'',remind:0,streak:null,showToday:false},
    {id:22, name:'Истигфар 100 раз',          arabic:'أَسْتَغْفِرُ اللَّهَ',  type:'istigfar', form:'recitation', purposes:['forgiveness','tawbah','rizq'],priority:'sunnah',freq:'daily',anchor:'after_isha',ts:'',te:'',ds:'',de:'',dayspec:'',short:'Астагфируллах × 100 перед сном',desc:'',remind:0,streak:null,showToday:false},
    {id:23, name:'Салят аль-Хаджат',          arabic:'صلاة الحاجة',            type:'salah',    form:'physical',   purposes:['hajat','rizq'],          priority:'sunnah',   freq:'once',   anchor:'',              ts:'',te:'',ds:'',de:'',dayspec:'',short:'Намаз для исполнения нужды — 2 ракаата с особым ду\'а',desc:'',remind:0,streak:null,showToday:false},
    {id:24, name:'Садака в пятницу',          arabic:'الصدقة يوم الجمعة',      type:'sadaqah',  form:'physical',   purposes:['rizq','barakah','deceased'],priority:'sunnah',freq:'weekly',anchor:'',         ts:'',te:'',ds:'',de:'',dayspec:'5',short:'Рекомендуемая садака в день Джумы',desc:'',remind:0,streak:null,showToday:false},
    // ── Траур и памятные дни ──
    {id:25, name:'Траур Ашура (10 Мухаррама)',arabic:'إحياء عاشوراء',          type:'amal',     form:'combined',   purposes:['irfan','community','deceased'],priority:'sunnah',freq:'annual',anchor:'',            ts:'',te:'',ds:'',de:'',dayspec:'',short:'День траура по Имаму Хусейну (а) — зиярат, плач, собрания',desc:'10 Мухаррама — день мученической гибели Имама Хусейна (а) в Кербеле. Для шиитов это день скорби и траура, а не поста. Пост в этот день является порицаемым (макрух) или запрещённым (харам) по мнению ряда марджа.',remind:0,streak:null,showToday:false},
  ];
  saveAll();
}

// ═══════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════
function ds(d=new Date()){return d.toISOString().slice(0,10)}
function t2m(t){if(!t)return null;const[h,m]=t.split(':').map(Number);return h*60+m}
function nowM(){const n=new Date();return n.getHours()*60+n.getMinutes()}
function addM(t,m){if(!t)return'';const[h,mm]=t.split(':').map(Number);const tot=((h*60+mm+m)%1440+1440)%1440;return`${String(Math.floor(tot/60)).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`}

function getP(){return prayers||settings.prayers||null}

function anchorT(a){
  const p=getP();if(!p)return null;
  return{before_fajr:addM(p.fajr,-15),after_fajr:addM(p.fajr,10),after_sunrise:addM(p.sunrise,10),before_dhuhr:addM(p.dhuhr,-15),after_dhuhr:addM(p.dhuhr,10),before_asr:addM(p.asr,-15),after_asr:addM(p.asr,10),before_maghrib:addM(p.maghrib,-15),after_maghrib:addM(p.maghrib,10),before_isha:addM(p.isha,-15),after_isha:addM(p.isha,10),midnight_shia:p.midnight||'00:00',tahajjud:p.tahajjud||addM(p.fajr,-45)}[a]||null;
}
function tTime(t){return t.anchor?anchorT(t.anchor):t.ts||null}
function isDone(t){return(completions[t.id]||[]).includes(ds())}

function isToday(t){
  const dow=new Date().getDay();
  if(t.freq==='daily')return true;
  if(t.freq==='streak'){const s=t.streak;if(!s)return false;const diff=Math.floor((Date.now()-new Date(s.start).getTime())/86400000);return diff>=0&&diff<s.total}
  if(t.freq==='weekly'){if(!t.dayspec)return false;return t.dayspec.split(',').map(x=>+x.trim()).includes(dow)}
  if(t.freq==='monthly'){if(!t.dayspec)return false;return t.dayspec.split(',').map(x=>+x.trim()).includes(new Date().getDate())}
  if(t.freq==='once')return!t.ds||t.ds===ds();
  return false;
}

function taskStatus(t){
  if(isDone(t))return'done';
  const tm=tTime(t),en=t.te,now=nowM();
  if(!tm)return'upcoming';
  const sm=t2m(tm),em=t2m(en);
  if(em&&now>em)return'overdue';
  if(now>=sm&&(!em||now<=em))return'active';
  if(sm-now<=30&&sm>now)return'imminent';
  return'upcoming';
}

function saveAll(){
  storageSet(STORAGE_KEYS.tasks, tasks);
  storageSet(STORAGE_KEYS.completions, completions);
  storageSet(STORAGE_KEYS.settings, settings);
  syncToCloud('mz_tasks',       tasks);
  syncToCloud('mz_completions', completions);
  syncToCloud('mz_settings',    settings);
}

function toggle(id){
  const t=tasks.find(x=>x.id===id);if(!t)return;
  const d=ds();
  if(!completions[id])completions[id]=[];
  const i=completions[id].indexOf(d);
  if(i>=0){completions[id].splice(i,1);if(t.streak)t.streak.doneDates=t.streak.doneDates.filter(x=>x!==d)}
  else{completions[id].push(d);if(t.streak&&!t.streak.doneDates.includes(d))t.streak.doneDates.push(d)}
  saveAll();renderAll();
}

// ═══════════════════════════════════════════════════
// PRAYER TIMES UI
// ═══════════════════════════════════════════════════
const PR_NAMES=[{k:'fajr',n:'Фаджр'},{k:'sunrise',n:'Шурук'},{k:'dhuhr',n:'Зухр'},{k:'asr',n:'Аср'},{k:'maghrib',n:'Магриб'},{k:'isha',n:'Иша'}];

function refreshPrayers(){
  document.getElementById('prayers-grid-wrap').innerHTML='<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">📍 Определяем…</div>';
  if(!navigator.geolocation){loadDefaultPrayers();return}
  navigator.geolocation.getCurrentPosition(pos=>{
    const{latitude:lat,longitude:lng}=pos.coords;
    settings.location={lat,lng};
    const p=calcPrayers(lat,lng,new Date());
    prayers=p;settings.prayers=p;saveAll();
    reverseGeo(lat,lng).then(n=>{const el=document.getElementById('loc-name');if(el)el.textContent=n});
    renderPrayerUI(p);renderAll();scheduleNotifs();
  },()=>loadDefaultPrayers());
}

async function reverseGeo(lat,lng){
  try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);const d=await r.json();return d.address?.city||d.address?.town||`${lat.toFixed(1)}, ${lng.toFixed(1)}`}
  catch{return`${lat.toFixed(1)}, ${lng.toFixed(1)}`}
}

function loadDefaultPrayers(){
  const p=settings.prayers||(()=>{const p=calcPrayers(40.4093,49.8671,new Date());settings.prayers=p;prayers=p;saveAll();document.getElementById('loc-name').textContent='Баку (по умолчанию)';return p})();
  prayers=p;renderPrayerUI(p);
}

let prayerExpanded = false;

function tglPrayers(){
  prayerExpanded = !prayerExpanded;
  const exp = document.getElementById('pc-expanded');
  const chv = document.getElementById('pc-chevron');
  if(exp) exp.style.display = prayerExpanded ? 'block' : 'none';
  if(chv) chv.style.transform = prayerExpanded ? 'rotate(90deg)' : '';
}

function renderPrayerUI(p){
  const nm = nowM();
  let ci = -1;
  PR_NAMES.forEach((pr,i)=>{
    const m=t2m(p[pr.k]), nxt=i<PR_NAMES.length-1?t2m(p[PR_NAMES[i+1].k]):1440;
    if(nm>=m && nm<nxt) ci=i;
  });

  // ── Compact row ──
  const compactText = document.getElementById('pc-compact-text');
  const compactSub  = document.getElementById('pc-compact-sub');
  const nextPill    = document.getElementById('pc-next-pill');
  const nextName    = document.getElementById('pc-next-name');
  const nextTime    = document.getElementById('pc-next-time');

  if(compactText && nextPill){
    // Find next prayer
    const nextIdx = ci >= 0 ? ci + 1 : PR_NAMES.findIndex(pr => t2m(p[pr.k]) > nm);
    const curPr   = ci >= 0 ? PR_NAMES[ci] : null;
    const nxtPr   = nextIdx >= 0 && nextIdx < PR_NAMES.length ? PR_NAMES[nextIdx] : null;

    if(curPr && nxtPr){
      const minLeft = t2m(p[nxtPr.k]) - nm;
      const h = Math.floor(minLeft/60), m2 = minLeft%60;
      const timeLeft = h > 0 ? `${h} ч ${m2} мин` : `${minLeft} мин`;
      compactText.textContent = `Сейчас — ${curPr.n}`;
      compactSub.textContent  = `До ${nxtPr.n} осталось ${timeLeft}`;
      nextName.textContent = nxtPr.n;
      nextTime.textContent = p[nxtPr.k];
      nextPill.style.display = 'block';
    } else if(nxtPr){
      // Before fajr
      const minLeft = t2m(p[nxtPr.k]) - nm;
      const h = Math.floor(minLeft/60), m2 = minLeft%60;
      compactText.textContent = `До Фаджра`;
      compactSub.textContent  = h > 0 ? `${h} ч ${m2} мин` : `${minLeft} мин`;
      nextName.textContent = 'Фаджр';
      nextTime.textContent = p.fajr;
      nextPill.style.display = 'block';
    } else {
      // After isha
      compactText.textContent = `Намаз Иша`;
      compactSub.textContent  = 'Ночное время';
      nextPill.style.display  = 'none';
    }
  }

  // ── Expanded grid ──
  document.getElementById('prayers-grid-wrap').innerHTML =
    `<div class="prayers-grid">${PR_NAMES.map((pr,i)=>{
      const cls = i===ci?'current': nm>t2m(p[pr.k])?'passed': i===ci+1?'next-p':'';
      return `<div class="prayer-cell ${cls}"><div class="pce-name">${pr.n}</div><div class="pce-time">${p[pr.k]||'--:--'}</div></div>`;
    }).join('')}</div>`;
}

// ── QIBLA ──
function calcQibla(){
  document.querySelector('.qi-btn').textContent='📍 Определяем…';
  if(!navigator.geolocation){
    document.getElementById('qibla-desc').textContent='Геолокация недоступна в браузере';
    document.querySelector('.qi-btn').textContent='📍 Определить Киблу';return;
  }
  navigator.geolocation.getCurrentPosition(pos=>{
    const{latitude:lat,longitude:lng}=pos.coords;
    const b=qiblaB(lat,lng);
    const dirs=['С','СВ','В','ЮВ','Ю','ЮЗ','З','СЗ'];
    const dirLabel=dirs[Math.round(b/45)%8];
    const R=6371,φ1=lat*DEG,φ2=KAABA.lat*DEG,Δφ=(KAABA.lat-lat)*DEG,Δλ=(KAABA.lng-lng)*DEG;
    const a=Math.sin(Δφ/2)**2+Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    const dist=Math.round(R*2*Math.asin(Math.sqrt(a)));

    document.getElementById('qibla-needle').style.transform=`rotate(${b}deg)`;
    document.getElementById('qibla-deg').textContent=b.toFixed(1)+'°';
    document.getElementById('qibla-dir').textContent=`Направление: ${dirLabel} от севера`;
    document.getElementById('qibla-desc').textContent=`Зелёная стрелка указывает на Каабу. Повернитесь лицом в это направление.`;
    document.getElementById('qibla-dist').textContent=dist.toLocaleString();
    document.querySelector('.qi-btn').textContent='🔄 Обновить';
  },()=>{
    document.getElementById('qibla-desc').textContent='Не удалось получить геолокацию. Разрешите доступ в настройках браузера.';
    document.querySelector('.qi-btn').textContent='📍 Попробовать снова';
  });
}

// ═══════════════════════════════════════════════════
// RENDER TODAY
// ═══════════════════════════════════════════════════
let todayShowAll = false;

function isVisibleToday(t){
  // Tasks without any time anchor show only if flag is set
  const hasTime = t.anchor || t.ts;
  if(!hasTime) return !!t.showToday;
  return true;
}

function renderToday(){
  const now=new Date();
  document.getElementById('today-date').textContent=now.toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'});
  document.getElementById('today-sub').textContent=hijri(now)+' · Джафари';
  const p=getP();if(p)renderPrayerUI(p);else loadDefaultPrayers();

  const td=tasks.filter(t=>isToday(t)&&isVisibleToday(t));
  const trackable=td.filter(t=>!isObligatory(t));
  const doneCount=trackable.filter(isDone).length,total=trackable.length;
  const pct=total?Math.round(doneCount/total*100):0;
  const c=163.4;
  document.getElementById('pring-fill').style.strokeDashoffset=c-c*pct/100;
  document.getElementById('pring-pct').textContent=pct+'%';

  if(!td.length){
    document.getElementById('today-content').innerHTML='<div class="empty"><span class="ei">🕌</span><p>Нет ритуалов на сегодня.<br>Нажмите <b>+</b> чтобы добавить</p></div>';
    return;
  }

  const byTime=arr=>[...arr].sort((a,b)=>(t2m(tTime(a))??9999)-(t2m(tTime(b))??9999));
  const getSK=t=>{
    if(isObligatory(t)){const s=taskStatus(t);return s==='active'?'active':s==='imminent'?'imminent':'upcoming';}
    return isDone(t)?'done':taskStatus(t);
  };

  // Split: not-done (active feed) vs done
  const notDone=byTime(td.filter(t=>isObligatory(t)||!isDone(t)));
  const doneList=byTime(td.filter(t=>!isObligatory(t)&&isDone(t)));

  const PREVIEW=4;
  const preview=notDone.slice(0,PREVIEW);
  const rest=notDone.slice(PREVIEW);
  const hiddenCount=rest.length+doneList.length;

  let html='';

  // Always show 4 preview cards — no section headers, clean chronological list
  preview.forEach(t=>{ html+=cardHTML(t,getSK(t)); });

  if(!todayShowAll && hiddenCount>0){
    html+=`<button onclick="todayShowAll=true;renderToday()" style="width:100%;margin-top:4px;padding:12px;background:var(--n50);border:1.5px solid var(--border);border-radius:var(--r);font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:var(--text3);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent-d)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text3)'">
      Показать все <span style="background:var(--n200);border-radius:20px;padding:1px 9px;font-size:12px">${hiddenCount}</span>
    </button>`;
  }

  if(todayShowAll){
    // Group remaining by status with section headers
    const G={overdue:[],active:[],imminent:[],upcoming:[]};
    rest.forEach(t=>{
      const s=isObligatory(t)?(()=>{const st=taskStatus(t);return st==='active'?'active':st==='imminent'?'imminent':'upcoming';})():taskStatus(t);
      (G[s]||G.upcoming).push(t);
    });
    const secs=[{k:'overdue',lbl:'Просрочено',cls:'sl-overdue'},{k:'active',lbl:'Сейчас',cls:'sl-active'},{k:'imminent',lbl:'Скоро',cls:'sl-imminent'},{k:'upcoming',lbl:'Предстоит',cls:'sl-upcoming'}];
    secs.forEach(({k,lbl,cls})=>{
      if(!G[k].length)return;
      html+=`<div class="sec-lbl ${cls}" style="margin-top:16px"><div class="sec-dot"></div>${lbl} <span style="font-weight:400">${G[k].length}</span></div>`;
      G[k].forEach(t=>{html+=cardHTML(t,k);});
    });
    if(doneList.length){
      html+=`<div class="sec-lbl sl-done" style="margin-top:16px"><div class="sec-dot"></div>Выполнено <span style="font-weight:400">${doneList.length}</span></div>`;
      doneList.forEach(t=>{html+=cardHTML(t,'done');});
    }
    html+=`<button onclick="todayShowAll=false;renderToday()" style="width:100%;margin-top:12px;padding:10px;background:transparent;border:1.5px solid var(--border);border-radius:var(--r);font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;color:var(--text3);cursor:pointer;transition:all .2s" onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text3)'">Свернуть ↑</button>`;
  }

  document.getElementById('today-content').innerHTML=html;
}

function isObligatory(t){
  // Обязательные намазы — never mark as done, just show time
  return t.priority==='fard'&&t.type==='salah';
}

function cardHTML(t,sk){
  const obligatory=isObligatory(t);
  const done=!obligatory&&isDone(t),tm=tTime(t),now=nowM();
  let cd='';
  if(tm){const sm=t2m(tm),em=t2m(t.te),diff=sm-now;
    if(!obligatory&&sk==='overdue')cd=`<div class="tc-cd c-over">просрочен</div>`;
    else if(sk==='active'){const l=em?em-now:0;cd=`<div class="tc-cd c-active">▶ ${l} мин</div>`}
    else if(diff>0&&diff<=60)cd=`<div class="tc-cd c-soon">через ${diff} мин</div>`;
    else if(diff>60)cd=`<div class="tc-cd">через ${Math.floor(diff/60)}ч ${diff%60}м</div>`}

  const tp=TYPES[t.type];const fm=FORMS[t.form];
  const purposeTags=(t.purposes||[]).slice(0,2).map(pk=>{const p=PURPOSES_UNIQUE.find(x=>x.k===pk);return p?`<span class="tag tg-purpose">${p.icon} ${p.label}</span>`:''}).join('');
  const timeBadge=t.anchor?`<span class="tag tg-anchor">${ANCHOR_LBL[t.anchor]||t.anchor}</span>`:tm?`<span class="tag tg-time">⏰ ${tm}${t.te?' – '+t.te:''}</span>`:'';

  // Obligatory salah: no check, no done state, special left indicator
  if(obligatory){
    const cardCls=['tcard pr-fard',sk==='active'?'s-active':'',sk==='imminent'?'s-imminent':''].filter(Boolean).join(' ');
    // Left side: crescent/mosque icon instead of checkbox
    return`<div class="${cardCls}" style="cursor:default">
      <div style="width:24px;height:24px;border-radius:50%;background:rgba(192,57,43,.12);border:2px solid rgba(192,57,43,.3);flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;font-size:13px">🕌</div>
      <div class="tc-body">
        <div class="tc-name">${t.name}${t.arabic?`<span class="tc-ar">${t.arabic}</span>`:''}</div>
        <div class="tc-tags">
          <span class="tag tg-fard" style="background:rgba(192,57,43,.15)">Ваджиб</span>
          ${timeBadge}
          ${tp?`<span class="tag tg-type">${tp.icon} ${tp.label}</span>`:''}
        </div>
        ${t.short?`<div style="font-size:12px;color:var(--text3);margin-top:4px">${t.short}</div>`:''}
      </div>
      <div class="tc-right">${cd}
        <div class="tc-actions" onclick="event.stopPropagation()">
          <button class="tc-btn" onclick="editTask(${t.id})">✏️</button>
        </div>
      </div>
    </div>`;
  }

  const cardCls=['tcard',done?'done':`pr-${t.priority}`,!done&&sk==='active'?'s-active':'',!done&&sk==='imminent'?'s-imminent':''].filter(Boolean).join(' ');
  return`<div class="${cardCls}" onclick="toggle(${t.id})">
    <div class="tc-check">${done?'✓':''}</div>
    <div class="tc-body">
      <div class="tc-name">${t.name}${t.arabic?`<span class="tc-ar">${t.arabic}</span>`:''}</div>
      <div class="tc-tags">
        <span class="tag ${PRIO_TAG[t.priority]||''}">${PRIO_LABEL[t.priority]||''}</span>
        ${tp?`<span class="tag tg-type">${tp.icon} ${tp.label}</span>`:''}
        ${fm?`<span class="tag tg-form">${fm.icon} ${fm.label}</span>`:''}
        ${timeBadge}
        ${purposeTags}
        ${t.streak?`<span class="tag tg-streak">🔥 ${t.streak.doneDates.length}/${t.streak.total}</span>`:''}
      </div>
      ${t.short?`<div style="font-size:12px;color:var(--text3);margin-top:4px">${t.short}</div>`:''}
      ${t.streak?miniBar(t):''}
    </div>
    <div class="tc-right">${cd}
      <div class="tc-actions" onclick="event.stopPropagation()">
        <button class="tc-btn" onclick="editTask(${t.id})">✏️</button>
        <button class="tc-btn del" onclick="deleteTask(${t.id})">🗑</button>
      </div>
    </div>
  </div>`;
}

function miniBar(t){
  const s=t.streak,done=s.doneDates.length,total=s.total,pct=Math.round(done/total*100),td=ds();
  const dots=Array.from({length:Math.min(total,30)},(_,i)=>{const d=new Date(s.start);d.setDate(d.getDate()+i);const dss=ds(d);return`<div class="sd ${s.doneDates.includes(dss)?'done':''} ${dss===td?'today':''}" title="${dss}"></div>`}).join('');
  return`<div class="sbar" onclick="event.stopPropagation()"><div class="sb-head"><span class="sb-lbl">Цепочка · ${pct}%</span><span class="sb-cnt">${done}/${total} · ост. ${total-done} дн.</span></div><div class="sb-track"><div class="sb-fill" style="width:${pct}%"></div></div><div class="sb-dots">${dots}</div></div>`;
}

// ── STREAKS ──
function renderStreaks(){
  const st=tasks.filter(t=>t.freq==='streak'&&t.streak);
  const el=document.getElementById('streaks-content');
  if(!st.length){el.innerHTML='<div class="empty"><span class="ei">🔥</span><p>Нет цепочек.<br>Добавьте ритуал с типом <b>Цепочка N дней</b></p></div>';return}
  const td=ds();
  el.innerHTML=st.map(t=>{
    const s=t.streak,done=s.doneDates.length,total=s.total,pct=Math.round(done/total*100);
    const sorted=[...s.doneDates].sort();let consec=0;
    for(let i=sorted.length-1;i>=0;i--){const e=new Date(s.start);e.setDate(e.getDate()+i);if(sorted[i]===ds(e))consec++;else break}
    const doneTd=isDone(t);
    const dots=Array.from({length:Math.min(total,42)},(_,i)=>{const d=new Date(s.start);d.setDate(d.getDate()+i);const dss=ds(d);return`<div class="sd ${s.doneDates.includes(dss)?'done':''} ${dss===td?'today':''}" title="${dss}"></div>`}).join('');
    const tp=TYPES[t.type];
    return`<div class="streak-hero" onclick="toggle(${t.id})">
      <div class="sh-top">
        <div>
          <div class="sh-name">${t.name}${tp?` <span class="tag tg-type" style="font-size:11px">${tp.icon} ${tp.label}</span>`:''}</div>
          <div class="sh-ar">${t.arabic||''}</div>
          ${t.short?`<div style="font-size:12px;color:var(--text3);margin-top:4px">${t.short}</div>`:''}
        </div>
        <div class="sh-check ${doneTd?'done':''}">${doneTd?'✓':''}</div>
      </div>
      <div class="sh-stats">
        <div class="sh-stat hl"><div class="sh-num">${done}</div><div class="sh-slbl">Выполнено</div></div>
        <div class="sh-stat"><div class="sh-num" style="color:var(--text3)">${total-done}</div><div class="sh-slbl">Осталось</div></div>
        <div class="sh-stat hl2"><div class="sh-num">${consec}</div><div class="sh-slbl">Подряд</div></div>
        <div class="sh-stat"><div class="sh-num">${total}</div><div class="sh-slbl">Всего</div></div>
      </div>
      <div class="sh-track"><div class="sh-fill" style="width:${pct}%"></div></div>
      <div class="sh-dots">${dots}</div>
      ${t.desc?`<div class="sh-desc">${t.desc}</div>`:''}
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════
// CATALOG WITH SMART FILTERS
// ═══════════════════════════════════════════════════
let filterOpen=false;
const fState={freq:'',type:'',purpose:'',prio:''};

function renderCatalogFilters(){
  // Freq chips
  document.getElementById('freq-chips').innerHTML=[{v:'',l:'Все'},...Object.entries(FREQS).map(([v,l])=>({v,l}))].map(f=>`<button class="chip freq-chip ${fState.freq===f.v?'active':''}" onclick="setFilter('freq','${f.v}')">${f.l}</button>`).join('');
  // Type chips
  document.getElementById('type-chips').innerHTML=[{v:'',icon:'',label:'Все'},...Object.entries(TYPES).map(([v,t])=>({v,...t}))].map(t=>`<button class="chip type-chip ${fState.type===t.v?'active':''}" onclick="setFilter('type','${t.v}')">${t.icon?t.icon+' ':''}${t.label}</button>`).join('');
  // Purpose chips
  document.getElementById('purpose-chips').innerHTML=[{k:'',icon:'',label:'Все'},...PURPOSES_UNIQUE].map(p=>`<button class="chip purpose-chip ${fState.purpose===p.k?'active':''}" onclick="setFilter('purpose','${p.k}')">${p.icon?p.icon+' ':''}${p.label}</button>`).join('');
  // Prio chips
  document.getElementById('prio-chips').innerHTML=[{v:'',l:'Все'},...Object.entries(PRIO_LABEL).map(([v,l])=>({v,l}))].map(p=>`<button class="chip prio-chip ${fState.prio===p.v?'active':''}" onclick="setFilter('prio','${p.v}')">${p.l}</button>`).join('');

  // Active count
  const cnt=Object.values(fState).filter(v=>v).length;
  const countEl=document.getElementById('filter-count');
  countEl.textContent=cnt;countEl.style.display=cnt?'inline':'none';
  document.getElementById('filter-toggle-btn').classList.toggle('has-filters',cnt>0);
}

function setFilter(key,val){fState[key]=val;renderCatalog()}
function clearAllFilters(){Object.keys(fState).forEach(k=>fState[k]='');document.getElementById('search-inp').value='';renderCatalog()}
function toggleFilterPanel(){filterOpen=!filterOpen;document.getElementById('filter-panel').classList.toggle('hidden',!filterOpen)}

function onSearch(){
  const v=document.getElementById('search-inp').value;
  document.getElementById('search-clear').classList.toggle('visible',v.length>0);
  renderCatalog();
}
function clearSearch(){document.getElementById('search-inp').value='';document.getElementById('search-clear').classList.remove('visible');renderCatalog()}

function renderCatalog(){
  renderCatalogFilters();
  const q=(document.getElementById('search-inp').value||'').toLowerCase();
  let filtered=tasks.filter(t=>{
    if(fState.freq&&t.freq!==fState.freq)return false;
    if(fState.type&&t.type!==fState.type)return false;
    if(fState.purpose&&!(t.purposes||[]).includes(fState.purpose))return false;
    if(fState.prio&&t.priority!==fState.prio)return false;
    if(q){const match=t.name.toLowerCase().includes(q)||(t.arabic||'').includes(q)||(t.short||'').toLowerCase().includes(q)||(t.purposes||[]).some(pk=>PURPOSES_UNIQUE.find(p=>p.k===pk)?.label.toLowerCase().includes(q))||(TYPES[t.type]?.label||'').toLowerCase().includes(q);if(!match)return false}
    return true;
  }).sort((a,b)=>({fard:0,sunnah:1,mustahabb:2}[a.priority]||3)-({fard:0,sunnah:1,mustahabb:2}[b.priority]||3));

  document.getElementById('results-info').innerHTML=`<span class="results-count">${filtered.length} ритуалов</span>`;
  const el=document.getElementById('catalog-content');
  if(!filtered.length){el.innerHTML='<div class="empty"><span class="ei">🔍</span><p>Ничего не найдено.<br><button class="clear-all" onclick="clearAllFilters()">Сбросить фильтры</button></p></div>';return}

  el.innerHTML=filtered.map(t=>{
    const tp=TYPES[t.type],fm=FORMS[t.form];
    const purposeTags=(t.purposes||[]).map(pk=>{const p=PURPOSES_UNIQUE.find(x=>x.k===pk);return p?`<span class="tag tg-purpose">${p.icon} ${p.label}</span>`:''}).join('');
    return`<div class="tcard pr-${t.priority}" style="cursor:default">
      <div class="tc-body">
        <div class="tc-name">${t.name}${t.arabic?`<span class="tc-ar">${t.arabic}</span>`:''}</div>
        <div class="tc-tags">
          <span class="tag ${PRIO_TAG[t.priority]||''}">${PRIO_LABEL[t.priority]||''}</span>
          ${tp?`<span class="tag tg-type">${tp.icon} ${tp.label}</span>`:''}
          ${fm?`<span class="tag tg-form">${fm.icon} ${fm.label}</span>`:''}
          <span class="tag tg-freq">${FREQS[t.freq]||t.freq}</span>
          ${t.anchor?`<span class="tag tg-anchor">${ANCHOR_LBL[t.anchor]||t.anchor}</span>`:''}
          ${t.streak?`<span class="tag tg-streak">🔥 ${t.streak.total} дн.</span>`:''}
        </div>
        ${purposeTags?`<div class="tc-tags" style="margin-top:4px">${purposeTags}</div>`:''}
        ${t.short?`<div style="font-size:12px;color:var(--text3);margin-top:4px;line-height:1.5">${t.short}</div>`:''}
      </div>
      <div class="tc-actions" style="opacity:1" onclick="event.stopPropagation()">
        <button class="tc-btn" onclick="editTask(${t.id})">✏️</button>
        <button class="tc-btn del" onclick="deleteTask(${t.id})">🗑</button>
      </div>
    </div>`;
  }).join('');
}

function doneOnDate(iso){
  return tasks.reduce((acc,t)=> acc + ((completions[t.id]||[]).includes(iso) ? 1 : 0), 0);
}
function analytics(days){
  const out = { done:0, total:0 };
  for(let i=0;i<days;i++){
    const d = new Date();
    d.setDate(d.getDate()-i);
    const iso = ds(d);
    out.done += doneOnDate(iso);
    out.total += Math.max(1, tasks.length);
  }
  out.rate = out.total ? Math.round((out.done/out.total)*100) : 0;
  return out;
}
function renderInsights(){
  const el = document.getElementById('insights-content');
  if(!el) return;
  const w7 = analytics(7);
  const w30 = analytics(30);
  const totalDoneToday = doneOnDate(ds());
  el.innerHTML = `<div class="ins-grid">
    <div class="ins-card"><div class="ins-k">Сегодня</div><div class="ins-v">${totalDoneToday}</div><div class="ins-sub">выполнено задач</div></div>
    <div class="ins-card"><div class="ins-k">7 дней</div><div class="ins-v">${w7.rate}%</div><div class="ins-sub">доля выполнения</div></div>
    <div class="ins-card"><div class="ins-k">30 дней</div><div class="ins-v">${w30.rate}%</div><div class="ins-sub">доля выполнения</div></div>
  </div>`;
}
function renderCalendar(){
  const root = document.getElementById('calendar-content');
  if(!root) return;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y,m,1);
  const days = new Date(y,m+1,0).getDate();
  const startDow = (first.getDay()+6)%7;
  const names = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  const cells = [];
  for(let i=0;i<startDow;i++) cells.push('<div class="cal-day empty"></div>');
  for(let d=1; d<=days; d++){
    const dt = new Date(y,m,d);
    const iso = ds(dt);
    const done = doneOnDate(iso) > 0;
    const today = iso===ds();
    cells.push(`<div class="cal-day ${done?'done':''} ${today?'today':''}">${d}</div>`);
  }
  root.innerHTML = `<div class="cal-head"><strong>${now.toLocaleDateString('ru-RU',{month:'long',year:'numeric'})}</strong><span style="font-size:12px;color:var(--text3)">Зеленый = есть выполнение</span></div>
  <div class="cal-grid">${names.map(n=>`<div class="cal-dow">${n}</div>`).join('')}</div>
  <div class="cal-grid" style="margin-top:6px">${cells.join('')}</div>`;
}

// ─── Settings ─────────────────────────────────────
function renderSettings(){
  const p=getP()||{};
  const prs=[{k:'fajr',n:'Фаджр'},{k:'sunrise',n:'Шурук'},{k:'dhuhr',n:'Зухр'},{k:'asr',n:'Аср'},{k:'maghrib',n:'Магриб'},{k:'isha',n:'Иша'}];
  document.getElementById('prayer-grid').innerHTML=prs.map(pr=>`<div class="pg-cell"><div class="pg-lbl">${pr.n}</div><input class="pg-inp" type="time" value="${p[pr.k]||''}" onchange="setPrayer('${pr.k}',this.value)"></div>`).join('');
  if(settings.notifAhead)document.getElementById('notif-ahead').value=settings.notifAhead;
  document.getElementById('notif-cooldown').value=String(settings.reminderCooldownMin || 30);
  document.getElementById('toggle-night').classList.toggle('on', !!settings.nightMode);
  renderInsights();
  renderCalendar();
}
function setPrayer(k,v){if(!settings.prayers)settings.prayers={};settings.prayers[k]=v;if(prayers)prayers[k]=v;saveAll();scheduleNotifs();const p=getP();if(p)renderPrayerUI(p)}
function saveSettings(){settings.notifAhead=+document.getElementById('notif-ahead').value;settings.nightMode=document.getElementById('toggle-night').classList.contains('on');settings.reminderCooldownMin=+document.getElementById('notif-cooldown').value||30;saveAll();scheduleNotifs()}

// ─── Modal ─────────────────────────────────────────
function buildPurposeGrid(){
  document.getElementById('purpose-grid').innerHTML=PURPOSES_UNIQUE.map(p=>`<div class="purpose-opt" data-k="${p.k}" onclick="togglePurpose(this)"><span class="po-icon">${p.icon}</span>${p.label}</div>`).join('');
}

function togglePurpose(el){el.classList.toggle('sel')}

function getSelPurposes(){return[...document.querySelectorAll('.purpose-opt.sel')].map(el=>el.dataset.k)}

function openModal(){
  editingId=null;selPrioVal='sunnah';
  document.getElementById('modal-title').textContent='Новый ритуал';
  buildPurposeGrid();resetForm();
  document.getElementById('modal').classList.add('open');
}
function closeModal(){document.getElementById('modal').classList.remove('open')}
function closeOut(e){if(e.target===document.getElementById('modal'))closeModal()}

function resetForm(){
  ['f-name','f-arabic','f-short','f-dayspec','f-ts','f-te','f-ds','f-de','f-desc'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});
  document.getElementById('f-type').value='dua';
  document.getElementById('f-form').value='recitation';
  document.getElementById('f-freq').value='daily';
  document.getElementById('f-anchor').value='';
  document.getElementById('f-remind').value='10';
  document.getElementById('f-sn').value='40';
  document.getElementById('f-ss').value=ds();
  document.getElementById('f-show-today').checked=false;
  selPrioVal='sunnah';
  document.querySelectorAll('.po').forEach(el=>el.classList.toggle('sel',el.dataset.v==='sunnah'));
  document.querySelectorAll('.purpose-opt').forEach(el=>el.classList.remove('sel'));
  onFreqChange();onAnchorChange();
}

function onFreqChange(){const v=document.getElementById('f-freq').value;document.getElementById('streak-wrap').style.display=v==='streak'?'block':'none';document.getElementById('dayspec-wrap').style.display=['weekly','monthly'].includes(v)?'':'none'}
function onAnchorChange(){
  const hasAnchor=document.getElementById('f-anchor').value;
  const hasManualTime=document.getElementById('f-ts').value;
  document.getElementById('manual-time-wrap').style.display=hasAnchor?'none':'';
  // Show "show today" only when no time anchor and no manual time
  document.getElementById('show-today-wrap').style.display=(hasAnchor||hasManualTime)?'none':'';
}
function selPrio(el){document.querySelectorAll('.po').forEach(e=>e.classList.remove('sel'));el.classList.add('sel');selPrioVal=el.dataset.v}

function editTask(id){
  const t=tasks.find(x=>x.id===id);if(!t)return;
  editingId=id;
  document.getElementById('modal-title').textContent='Редактировать';
  buildPurposeGrid();resetForm();
  const set=(i,v)=>{const e=document.getElementById(i);if(e)e.value=v||''};
  set('f-name',t.name);set('f-arabic',t.arabic);set('f-short',t.short);
  set('f-type',t.type);set('f-form',t.form);
  set('f-freq',t.freq);set('f-anchor',t.anchor);set('f-dayspec',t.dayspec);
  set('f-ts',t.ts);set('f-te',t.te);set('f-ds',t.ds);set('f-de',t.de);
  set('f-desc',t.desc);set('f-remind',t.remind||0);
  document.getElementById('f-show-today').checked=!!t.showToday;
  if(t.streak){set('f-sn',t.streak.total);set('f-ss',t.streak.start)}
  selPrioVal=t.priority;
  document.querySelectorAll('.po').forEach(el=>el.classList.toggle('sel',el.dataset.v===selPrioVal));
  (t.purposes||[]).forEach(pk=>{const el=document.querySelector(`.purpose-opt[data-k="${pk}"]`);if(el)el.classList.add('sel')});
  onFreqChange();onAnchorChange();
  document.getElementById('modal').classList.add('open');
}

function saveTask(){
  const name=document.getElementById('f-name').value.trim();
  if(!name){document.getElementById('f-name').focus();return}
  const freq=document.getElementById('f-freq').value;
  const prev=editingId?tasks.find(t=>t.id===editingId)?.streak:null;
  const streak=freq==='streak'?{total:+document.getElementById('f-sn').value||40,start:document.getElementById('f-ss').value||ds(),doneDates:prev?.doneDates||[]}:null;
  const task={id:editingId||Date.now(),name,arabic:document.getElementById('f-arabic').value.trim(),short:document.getElementById('f-short').value.trim(),type:document.getElementById('f-type').value,form:document.getElementById('f-form').value,purposes:getSelPurposes(),priority:selPrioVal,freq,anchor:document.getElementById('f-anchor').value,dayspec:document.getElementById('f-dayspec').value.trim(),ts:document.getElementById('f-ts').value,te:document.getElementById('f-te').value,ds:document.getElementById('f-ds').value,de:document.getElementById('f-de').value,desc:document.getElementById('f-desc').value.trim(),remind:+document.getElementById('f-remind').value||0,streak,showToday:document.getElementById('f-show-today').checked};
  if(editingId){const i=tasks.findIndex(t=>t.id===editingId);if(i>=0)tasks[i]=task}else tasks.push(task);
  saveAll();renderAll();closeModal();
}

function deleteTask(id){if(!confirm('Удалить?'))return;tasks=tasks.filter(x=>x.id!==id);saveAll();renderAll()}

// ─── Notifications ─────────────────────────────────
async function requestNotifs(){
  if(!('Notification'in window))return;
  const p=await Notification.requestPermission();
  document.getElementById('notif-bar').style.display=p==='granted'?'none':'';
  if(p==='granted')scheduleNotifs();
}
function isInQuietHours(){
  if(!settings.nightMode) return false;
  const q = settings.quietHours || { start:'23:00', end:'05:00' };
  const now = nowM();
  const s = t2m(q.start || '23:00');
  const e = t2m(q.end || '05:00');
  if(s == null || e == null) return false;
  return s <= e ? (now >= s && now < e) : (now >= s || now < e);
}
function canSendTag(tag){
  const cooldown = Math.max(5, settings.reminderCooldownMin || 30);
  const ts = sentNotifTags[tag] || 0;
  return Date.now() - ts > cooldown * 60000;
}
function markTag(tag){
  sentNotifTags[tag] = Date.now();
  storageSet('mz5_notif_tags', sentNotifTags);
}

function scheduleNotifs(){
  notifTimers.forEach(clearTimeout);notifTimers=[];
  if(typeof Notification==='undefined'||Notification.permission!=='granted')return;
  const now=nowM(),ahead=settings.notifAhead||10,p=getP();
  const maybeNotify = (title, body, tag) => {
    if(isInQuietHours() || !canSendTag(tag)) return;
    markTag(tag);
    new Notification(title,{ body, tag });
  };
  if(p)[{n:'Фаджр',k:'fajr'},{n:'Зухр',k:'dhuhr'},{n:'Аср',k:'asr'},{n:'Магриб',k:'maghrib'},{n:'Иша',k:'isha'}].forEach(pr=>{
    const m=t2m(p[pr.k]);if(!m)return;const at=m-ahead;if(at<=now)return;
    notifTimers.push(setTimeout(()=>maybeNotify(`🕌 ${pr.n}`,`Через ${ahead} мин · ${p[pr.k]}`,'p'+pr.k),(at-now)*60000));
  });
  tasks.filter(isToday).forEach(t=>{
    if(!t.remind||isDone(t))return;const tm=tTime(t);if(!tm)return;
    const at=t2m(tm)-t.remind;if(at<=now)return;
    notifTimers.push(setTimeout(()=>maybeNotify(`⏰ ${t.name}`,`Через ${t.remind} мин · ${tm}`,'t'+t.id),(at-now)*60000));
  });
}

// ═══════════════════════════════════════════════════
// ── TASBIH ──
// ═══════════════════════════════════════════════════
const TSB_PRESETS = [
  {id:'subhanallah',   ar:'سُبْحَانَ اللَّهِ',                                        name:'Субханаллах',        meaning:'Пречист Аллах',                                              target:33,  preset:true},
  {id:'alhamdulillah', ar:'الْحَمْدُ لِلَّهِ',                                        name:'Альхамдулиллах',     meaning:'Хвала Аллаху',                                               target:33,  preset:true},
  {id:'allahuakbar',   ar:'اللَّهُ أَكْبَرُ',                                          name:'Аллаху Акбар',       meaning:'Аллах Велик',                                                target:34,  preset:true},
  {id:'tasbih_zahra',  ar:'اللَّهُ أَكْبَرُ ← الْحَمْدُ لِلَّهِ ← سُبْحَانَ اللَّهِ', name:'Тасбих Захры (с.а.)',meaning:'34× Аллаху Акбар → 33× Альхамдулиллах → 33× Субханаллах — шиитский порядок от Имама Садыка (а)', target:100, preset:true},
  {id:'salawat',       ar:'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ',        name:'Салават',            meaning:'Господи, благослови Мухаммада ﷺ и род его',                  target:100, preset:true},
  {id:'astaghfirullah',ar:'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',                  name:'Астагфируллах',      meaning:'Прошу прощения у Аллаха и каюсь Ему',                       target:100, preset:true},
  {id:'hawqala',       ar:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',                name:'Хавкала',            meaning:'Нет силы и мощи, кроме как у Аллаха',                       target:100, preset:true},
  {id:'la_ilaha',      ar:'لَا إِلَٰهَ إِلَّا اللَّهُ',                               name:'ЛяилляхаИллаллах',   meaning:'Нет бога, кроме Аллаха',                                    target:100, preset:true},
  {id:'salawat_ibrahim',ar:'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَآلِ إِبْرَاهِيمَ', name:'Салават Ибрагима',meaning:'Полный салават на Мухаммада и род его как на Ибрагима и род его', target:100, preset:true},
  {id:'ya_ali',        ar:'يَا عَلِيُّ يَا عَظِيمُ',                                  name:'Я Али Я Азым',       meaning:'О Али, о Великий — обращение к Имаму Али (а)',               target:40,  preset:true},
  {id:'ya_fatima',     ar:'يَا فَاطِمَةُ الزَّهْرَاء',                                name:'Я Фатима Захра (с.а.)',meaning:'О Фатима Захра — обращение к госпоже Захре',               target:14,  preset:true},
  {id:'bismillah',     ar:'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',                   name:'Бисмиллях',          meaning:'Во имя Аллаха Милостивого Милосердного',                    target:21,  preset:true},
  {id:'ya_husayn',     ar:'يَا حُسَيْنُ يَا مَظْلُومُ',                               name:'Я Хусейн Я Мазлум',  meaning:'О Хусейн, о угнетённый — зикр скорби и тавассуля',          target:100, preset:true},
  {id:'labayk_ya_husayn',ar:'لَبَّيْكَ يَا حُسَيْنُ',                                name:'Ляббейк Я Хусейн',   meaning:'Я здесь, о Хусейн — ответ на призыв Имама Хусейна (а)',     target:313, preset:true},
];

let tsbState = storageGet(STORAGE_KEYS.tasbih, {
  activeId: 'subhanallah',
  count: 0,
  cycles: 0,
  history: [],         // [{id, ar, name, count, cycles, ts}]
  customZikrs: [],
  todayTotal: 0,
  todayDate: '',
});
let tsbVibrating = false;

function tsbAllZikrs(){ return [...TSB_PRESETS, ...(tsbState.customZikrs||[])]; }
function tsbActive(){ return tsbAllZikrs().find(z=>z.id===tsbState.activeId)||TSB_PRESETS[0]; }

function tsbSave(){
  storageSet(STORAGE_KEYS.tasbih, tsbState);
  syncToCloud('mz_tasbih', tsbState);
}

function tsbTap(){
  const z = tsbActive();
  tsbState.count++;

  // Today total
  if(tsbState.todayDate !== ds()){ tsbState.todayDate = ds(); tsbState.todayTotal = 0; }
  tsbState.todayTotal++;

  // Completed one cycle?
  if(tsbState.count >= z.target){
    tsbState.cycles++;
    tsbState.count = 0;
    tsbCompleteCycle(z);
  }

  tsbSave();
  tsbRenderCounter();
  tsbBump();
  tsbVibrateOnce();
}

function tsbBump(){
  const el = document.getElementById('tsb-count');
  if(!el) return;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
  setTimeout(()=>el.classList.remove('bump'), 120);
}

function tsbVibrateOnce(){
  if(navigator.vibrate) navigator.vibrate(18);
}

function tsbCompleteCycle(z){
  // Flash button
  const btn = document.getElementById('tsb-tap-btn');
  if(btn){ btn.classList.add('complete'); setTimeout(()=>btn.classList.remove('complete'), 600); }
  if(navigator.vibrate) navigator.vibrate([40, 30, 40]);
  // Save to history
  tsbState.history.unshift({ id:z.id, ar:z.ar, name:z.name, cycles:tsbState.cycles, ts: new Date().toISOString() });
  if(tsbState.history.length > 50) tsbState.history = tsbState.history.slice(0, 50);
}

function tsbReset(){
  if(tsbState.count === 0 && tsbState.cycles === 0) return;
  // Save current session to history before reset
  const z = tsbActive();
  if(tsbState.count > 0 || tsbState.cycles > 0){
    tsbState.history.unshift({ id:z.id, ar:z.ar, name:z.name, count:tsbState.count, cycles:tsbState.cycles, ts: new Date().toISOString() });
    if(tsbState.history.length > 50) tsbState.history = tsbState.history.slice(0, 50);
  }
  tsbState.count = 0;
  tsbState.cycles = 0;
  tsbSave();
  tsbRenderCounter();
  tsbRenderHistory();
}

function tsbUndo(){
  if(tsbState.count > 0){ tsbState.count--; }
  else if(tsbState.cycles > 0){ tsbState.cycles--; tsbState.count = tsbActive().target - 1; }
  tsbSave(); tsbRenderCounter();
}

function tsbSelect(id){
  // Save current to history
  const z = tsbActive();
  if(tsbState.count > 0 || tsbState.cycles > 0){
    tsbState.history.unshift({ id:z.id, ar:z.ar, name:z.name, count:tsbState.count, cycles:tsbState.cycles, ts: new Date().toISOString() });
  }
  tsbState.activeId = id;
  tsbState.count = 0;
  tsbState.cycles = 0;
  tsbSave();
  tsbRenderAll();
}

function tsbRenderCounter(){
  const z = tsbActive();
  const el_count = document.getElementById('tsb-count');
  const el_ci = document.getElementById('tsb-count-inline');
  const el_ti = document.getElementById('tsb-target-inline');
  const el_cycles = document.getElementById('tsb-cycles');
  const el_ar = document.getElementById('tsb-current-ar');
  const el_name = document.getElementById('tsb-current-name');
  if(!el_count) return;

  el_count.textContent = tsbState.count;
  if(el_ci) el_ci.textContent = tsbState.count;
  if(el_ti) el_ti.textContent = z.target;
  if(el_cycles) el_cycles.textContent = tsbState.cycles;
  if(el_ar) el_ar.textContent = z.ar;
  if(el_name) el_name.textContent = z.name + (z.meaning ? ' — ' + z.meaning : '');

  // Ring progress
  const ring = document.getElementById('tsb-ring-fill');
  if(ring){
    const circ = 534; // 2π × 85
    const pct = z.target > 0 ? tsbState.count / z.target : 0;
    ring.style.strokeDashoffset = circ - circ * Math.min(pct, 1);
    ring.style.stroke = pct >= 1 ? 'var(--g600)' : 'var(--accent)';
  }

  // Today total
  const todayEl = document.getElementById('tsb-today-total');
  const todayWrap = document.getElementById('tsb-today-total-wrap');
  if(todayEl){ todayEl.textContent = tsbState.todayTotal || 0; }
  if(todayWrap){ todayWrap.style.display = (tsbState.todayTotal>0)?'block':'none'; }
}

function tsbRenderZikrList(){
  const el = document.getElementById('tsb-zikr-list');
  if(!el) return;
  const all = tsbAllZikrs();
  el.innerHTML = all.map(z => `
    <div class="tsb-zikr-item ${z.id===tsbState.activeId?'active-zikr':''}" onclick="tsbSelect('${z.id}')">
      <div class="tzi-ar">${z.ar}</div>
      <div class="tzi-body">
        <div class="tzi-name">${z.name}</div>
        <div class="tzi-meaning">${z.meaning||''}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
        <div class="tzi-target">×${z.target}</div>
        ${!z.preset ? `<button class="tsb-ctrl-btn danger" style="width:26px;height:26px;font-size:12px" onclick="event.stopPropagation();tsbDeleteCustom('${z.id}')">🗑</button>` : ''}
      </div>
    </div>`).join('');
}

function tsbRenderHistory(){
  const el = document.getElementById('tsb-history-list');
  if(!el) return;
  const hist = tsbState.history || [];
  if(!hist.length){ el.innerHTML = '<div class="tsb-empty-hist">История пуста — начните считать зикр</div>'; return; }
  el.innerHTML = hist.slice(0, 20).map(h => {
    const d = new Date(h.ts);
    const timeStr = d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
    const dateStr = d.toLocaleDateString('ru-RU',{day:'numeric',month:'short'});
    const totalCount = (h.cycles||0) * (tsbAllZikrs().find(z=>z.id===h.id)?.target||33) + (h.count||0);
    return `<div class="tsb-session-row">
      <div style="flex:1;min-width:0">
        <div class="tsr-zikr">${h.name}</div>
        <div class="tsr-zikr-ar">${h.ar}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div class="tsr-count">${totalCount > 0 ? totalCount : (h.cycles||0)+'×'}</div>
        <div class="tsr-time">${dateStr} ${timeStr}</div>
      </div>
    </div>`;
  }).join('');
}

function tsbRenderAll(){
  tsbRenderCounter();
  tsbRenderZikrList();
  tsbRenderHistory();
}

function tsbOpenAddModal(){ document.getElementById('tsb-modal').classList.add('open'); }
function tsbCloseModal(){ document.getElementById('tsb-modal').classList.remove('open'); }

function tsbSaveCustom(){
  const name = document.getElementById('tsb-f-name').value.trim();
  const ar = document.getElementById('tsb-f-ar').value.trim();
  const meaning = document.getElementById('tsb-f-meaning').value.trim();
  const target = parseInt(document.getElementById('tsb-f-target').value) || 33;
  if(!name){ document.getElementById('tsb-f-name').focus(); return; }
  const id = 'custom_' + Date.now();
  if(!tsbState.customZikrs) tsbState.customZikrs = [];
  tsbState.customZikrs.push({id, ar, name, meaning, target, preset:false});
  tsbSave();
  tsbCloseModal();
  ['tsb-f-name','tsb-f-ar','tsb-f-meaning'].forEach(i=>document.getElementById(i).value='');
  tsbRenderZikrList();
}

function tsbDeleteCustom(id){
  if(!confirm('Удалить этот зикр?')) return;
  tsbState.customZikrs = (tsbState.customZikrs||[]).filter(z=>z.id!==id);
  if(tsbState.activeId === id){ tsbState.activeId = 'subhanallah'; tsbState.count=0; tsbState.cycles=0; }
  tsbSave(); tsbRenderAll();
}

function tsbClearHistory(){
  if(!confirm('Очистить историю сессий?')) return;
  tsbState.history = []; tsbSave(); tsbRenderHistory();
}

// ── Pages ─────────────────────────────────────────
function showPage(name,tabEl){
  curPage=name;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.mnb').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  if(tabEl)tabEl.classList.add('active');
  const mob=document.getElementById('mnb-'+name);if(mob)mob.classList.add('active');
  renderAll();
}
function renderAll(){
  try{
    if(curPage==='today')renderToday();
    if(curPage==='streaks')renderStreaks();
    if(curPage==='tasbih')tsbRenderAll();
    if(curPage==='catalog')renderCatalog();
    if(curPage==='settings')renderSettings();
  }catch(e){
    console.error('Render failure', e);
  }
}

// ─── Misc ───────────────────────────────────────────
function resetToday(){if(!confirm('Сбросить все отметки за сегодня?'))return;const d=ds();Object.keys(completions).forEach(id=>{completions[id]=completions[id].filter(x=>x!==d)});tasks.forEach(t=>{if(t.streak)t.streak.doneDates=t.streak.doneDates.filter(x=>x!==d)});saveAll();renderAll()}
function exportData(){const a=document.createElement('a');a.href='data:application/json,'+encodeURIComponent(JSON.stringify({tasks,completions,settings},null,2));a.download='mizan.json';a.click()}
function hijri(date){const months=['Мухаррам','Сафар','Раби I','Раби II','Джумада I','Джумада II','Раджаб','Шаабан','Рамадан','Шавваль','Зуль-Каада','Зуль-Хиджжа'];const diff=(date-new Date('0622-07-16'))/(29.53058*86400000);const tm=Math.floor(diff);return`${months[tm%12]} ${Math.floor(tm/12)+1} г.х.`}

// ═══════════════════════════════════════════════════
// AUTH UI
// ═══════════════════════════════════════════════════
let authMode = 'signin'; // 'signin' | 'signup'

function switchAuthTab(mode){
  authMode = mode;
  document.getElementById('tab-signin').classList.toggle('active', mode==='signin');
  document.getElementById('tab-signup').classList.toggle('active', mode==='signup');
  document.getElementById('auth-submit-btn').textContent = mode==='signin' ? 'Войти' : 'Создать аккаунт';
  document.getElementById('auth-forgot').style.display = mode==='signin' ? '' : 'none';
  document.getElementById('auth-error').classList.remove('show');
  document.getElementById('auth-success').classList.remove('show');
  // Update autocomplete
  document.getElementById('auth-password').autocomplete = mode==='signin' ? 'current-password' : 'new-password';
}

function setAuthError(msg){ const el=document.getElementById('auth-error'); el.textContent=msg; el.classList.add('show'); document.getElementById('auth-success').classList.remove('show'); }
function setAuthSuccess(msg){ const el=document.getElementById('auth-success'); el.textContent=msg; el.classList.add('show'); document.getElementById('auth-error').classList.remove('show'); }
function clearAuthMessages(){ document.getElementById('auth-error').classList.remove('show'); document.getElementById('auth-success').classList.remove('show'); }

async function authSubmit(){
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const btn      = document.getElementById('auth-submit-btn');

  if(!email){ setAuthError('Введите email'); return; }
  if(!password || password.length < 6){ setAuthError('Пароль — минимум 6 символов'); return; }

  btn.disabled = true;
  btn.textContent = '⏳ Подождите…';
  clearAuthMessages();

  try {
    let data;
    if(authMode === 'signup'){
      data = await authSignUp(email, password);
      if(data.error || data.msg){ setAuthError(data.error || data.msg); btn.disabled=false; btn.textContent='Создать аккаунт'; return; }
      setAuthSuccess('✓ Аккаунт создан! Проверьте email для подтверждения, затем войдите.');
      switchAuthTab('signin');
      btn.disabled=false;
      return;
    } else {
      data = await authSignIn(email, password);
      if(data.error || data.error_description){ setAuthError(data.error_description || data.error); btn.disabled=false; btn.textContent='Войти'; return; }
    }
    saveSession(data);
    await onSignedIn();
  } catch(e){
    setAuthError('Ошибка соединения. Проверьте интернет.');
    btn.disabled=false;
    btn.textContent = authMode==='signin' ? 'Войти' : 'Создать аккаунт';
  }
}

async function authForgotPassword(){
  const email = document.getElementById('auth-email').value.trim();
  if(!email){ setAuthError('Введите email выше'); return; }
  try {
    await fetch(`${SB_URL}/auth/v1/recover`, {
      method:'POST',
      headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
      body: JSON.stringify({email})
    });
    setAuthSuccess('✓ Письмо для сброса пароля отправлено на ' + email);
  } catch(e){ setAuthError('Ошибка. Попробуйте позже.'); }
}

function showAuthScreen(){
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('main-nav').style.display    = 'none';
  document.getElementById('app-body').style.display    = 'none';
  document.getElementById('nav-user').style.display    = 'none';
}

function showApp(){
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('main-nav').style.display    = 'flex';
  document.getElementById('app-body').style.display    = 'block';
  // Update nav user info
  if(currentUser){
    const initial = (currentUser.email||'?')[0].toUpperCase();
    document.getElementById('nav-avatar').textContent = initial;
    document.getElementById('nav-email').textContent  = currentUser.email||'';
    document.getElementById('nav-user').style.display = 'flex';
  }
}

async function onSignedIn(){
  showApp();
  buildPurposeGrid();
  if(typeof Notification!=='undefined'&&Notification.permission==='default') document.getElementById('notif-bar').style.display='';
  loadDefaultPrayers();
  renderAll();
  await cloudSync();
  if(navigator.geolocation) navigator.geolocation.getCurrentPosition(pos=>{
    const{latitude:lat,longitude:lng}=pos.coords;
    settings.location={lat,lng};
    const p=calcPrayers(lat,lng,new Date());
    prayers=p;settings.prayers=p;saveAll();
    reverseGeo(lat,lng).then(n=>{const el=document.getElementById('loc-name');if(el)el.textContent=n});
    renderAll();scheduleNotifs();
  },()=>{});
  scheduleNotifs();
}

async function cloudSync(){
  const banner = showSyncBanner('☁️ Синхронизация…', 'var(--accent)');
  try {
    const [cloudTasks, cloudComp, cloudCfg, cloudTsb] = await Promise.all([
      sbGet('mz_tasks'), sbGet('mz_completions'), sbGet('mz_settings'), sbGet('mz_tasbih')
    ]);
    let changed = false;
    if(cloudTasks && JSON.stringify(cloudTasks)!==JSON.stringify(tasks)){ tasks=cloudTasks; storageSet(STORAGE_KEYS.tasks, tasks); changed=true; }
    if(cloudComp  && JSON.stringify(cloudComp) !==JSON.stringify(completions)){ completions=cloudComp; storageSet(STORAGE_KEYS.completions, completions); changed=true; }
    if(cloudCfg   && JSON.stringify(cloudCfg)  !==JSON.stringify(settings)){ settings=cloudCfg; storageSet(STORAGE_KEYS.settings, settings); changed=true; }
    if(cloudTsb   && JSON.stringify(cloudTsb)  !==JSON.stringify(tsbState)){ tsbState=cloudTsb; storageSet(STORAGE_KEYS.tasbih, tsbState); changed=true; }
    if(changed){ renderAll(); scheduleNotifs(); }
    if(!cloudTasks){ syncToCloud('mz_tasks',tasks); }
    if(!cloudComp) { syncToCloud('mz_completions',completions); }
    if(!cloudCfg)  { syncToCloud('mz_settings',settings); }
    if(!cloudTsb)  { syncToCloud('mz_tasbih',tsbState); }
    hideSyncBanner(banner, '✓ Синхронизировано', 'var(--accent-d)');
  } catch(e){
    hideSyncBanner(banner, '⚠ Нет связи — локальный режим', 'var(--orange)');
  }
}

function showSyncBanner(msg, color){
  const wrap = document.createElement('div');
  wrap.innerHTML=`<div style="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:${color};color:#fff;font-size:12px;font-weight:600;padding:8px 18px;border-radius:20px;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,.2);opacity:0;transition:opacity .3s;white-space:nowrap">${msg}</div>`;
  document.body.appendChild(wrap);
  setTimeout(()=>wrap.firstChild.style.opacity='1', 10);
  return wrap;
}
function hideSyncBanner(wrap, msg, color){
  if(!wrap?.firstChild) return;
  wrap.firstChild.textContent=msg;
  wrap.firstChild.style.background=color;
  setTimeout(()=>{ wrap.firstChild.style.opacity='0'; setTimeout(()=>wrap.remove(),400); }, 2000);
}

// ── Init ───────────────────────────────────────────
(async()=>{
  // Try restore session from localStorage
  const savedObj = storageGet(STORAGE_KEYS.session, null);
  if(savedObj){
    try {
      const session = savedObj;
      // Check if token still valid (with 60s buffer)
      if(session.expires_at > Date.now() + 60000){
        currentUser = session;
        await onSignedIn();
        return;
      }
      // Try refresh
      if(session.refresh_token){
        const data = await authRefresh(session.refresh_token);
        if(data.access_token){
          saveSession(data);
          await onSignedIn();
          return;
        }
      }
    } catch(e){}
  }
  // No valid session — show auth
  showAuthScreen();
})();

setInterval(()=>{if(curPage==='today')renderToday()},60000);
