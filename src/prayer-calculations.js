const DEG = Math.PI / 180;

function jd(date) {
  const Y = date.getFullYear();
  const M = date.getMonth() + 1;
  const D = date.getDate();
  const A = Math.floor(Y / 100);
  let B = 0;
  if (Y > 1582 || (Y === 1582 && M > 10) || (Y === 1582 && M === 10 && D >= 15)) B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

function sunPos(d) {
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * Math.sin(g * DEG) + 0.02 * Math.sin(2 * g * DEG)) % 360;
  const e = 23.439 - 0.00000036 * d;
  const sL = Math.sin(L * DEG);
  const RA = Math.atan2(Math.cos(e * DEG) * sL, Math.cos(L * DEG)) / DEG;
  const decl = Math.asin(Math.sin(e * DEG) * sL) / DEG;
  const EqT = q / 15 - (RA < 0 ? RA + 360 : RA) / 15;
  return { decl, EqT };
}

function ha(lat, decl, angle) {
  const n = Math.cos(angle * DEG) - Math.sin(lat * DEG) * Math.sin(decl * DEG);
  const d2 = Math.cos(lat * DEG) * Math.cos(decl * DEG);
  if (Math.abs(d2) < 1e-10 || Math.abs(n / d2) > 1) return null;
  return Math.acos(n / d2) / DEG;
}

function asrHA(lat, decl) {
  const tAlt = Math.atan(1 / (1 + Math.tan(Math.abs(lat - decl) * DEG))) / DEG;
  return ha(lat, decl, 90 - tAlt);
}

function toT(h, tz) {
  const t = ((h + tz) % 24 + 24) % 24;
  const hh = Math.floor(t);
  const mm = Math.round((t - hh) * 60);
  const mf = mm === 60 ? 0 : mm;
  const hf = mm === 60 ? hh + 1 : hh;
  return `${String(hf % 24).padStart(2, '0')}:${String(mf).padStart(2, '0')}`;
}

export function calcPrayers(lat, lng, date) {
  const D = jd(date) - 2451545.0;
  const tz = date.getTimezoneOffset() / -60;
  const { decl, EqT } = sunPos(D);
  const noon = 12 - EqT - lng / 15;
  const haFajr = ha(lat, decl, 90 + 16);
  const haRise = ha(lat, decl, 90 + 0.833);
  const haAsr = asrHA(lat, decl);
  const haMag = ha(lat, decl, 90 + 4);
  const haIsha = ha(lat, decl, 90 + 14);
  if (!haFajr || !haRise || !haAsr || !haMag || !haIsha) return null;
  const fajrU = noon - haFajr / 15;
  const sunriseU = noon - haRise / 15;
  const dhuhrU = noon;
  const asrU = noon + haAsr / 15;
  const magU = noon + haMag / 15;
  const ishaU = noon + haIsha / 15;
  const midU = magU + (fajrU + 24 - magU) / 2;
  const tahU = fajrU - (fajrU - (magU - 24)) / 3;
  return {
    fajr: toT(fajrU, tz),
    sunrise: toT(sunriseU, tz),
    dhuhr: toT(dhuhrU, tz),
    asr: toT(asrU, tz),
    maghrib: toT(magU, tz),
    isha: toT(ishaU, tz),
    midnight: toT(midU, tz),
    tahajjud: toT(tahU, tz)
  };
}

const KAABA = { lat: 21.4225, lng: 39.8262 };

export function qiblaB(lat, lng) {
  const f1 = lat * DEG;
  const f2 = KAABA.lat * DEG;
  const dl = (KAABA.lng - lng) * DEG;
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return (Math.atan2(y, x) / DEG + 360) % 360;
}

/** Great-circle distance to Kaaba in km (for UI). */
export function distanceToKaabaKm(lat, lng) {
  const R = 6371;
  const φ1 = lat * DEG;
  const φ2 = KAABA.lat * DEG;
  const Δφ = (KAABA.lat - lat) * DEG;
  const Δλ = (KAABA.lng - lng) * DEG;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)));
}
