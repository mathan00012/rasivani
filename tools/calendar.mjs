// Exact tithi, nakshatra and solar-month (sankranti) times, used by the festival, rasi and nakshatra pages.
// All times are India time (IST). Tithi and nakshatra moments do not depend on the place.
if (!globalThis.Astro) await import('../js/astro.js');
const A = globalThis.Astro;
const H = 3600000, IST = 5.5 * H;
const pad = (n) => String(n).padStart(2, '0');
// ms (UTC epoch) -> panchang at that moment (place only matters for sunrise; Chennai by default)
export function at(ms, lat = 13.0827, lon = 80.2707) {
  const d = new Date(ms + IST);
  return A.panchang({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), hh: d.getUTCHours(), mm: d.getUTCMinutes() + d.getUTCSeconds() / 60, tz: 5.5, lat, lon });
}
// IST date parts of a moment
export const istParts = (ms) => { const d = new Date(ms + IST); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), hh: d.getUTCHours(), mi: d.getUTCMinutes(), iso: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, hm: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` }; };
// midnight IST of an ISO day, as UTC ms
export const dayStart = (iso) => Date.parse(`${iso}T00:00:00Z`) - IST;

// Moments when f(ms) changes value between from and to (hourly scan, then bisection to the minute)
function changes(f, from, to, step = H) {
  const out = []; let prev = f(from), t = from;
  while (t < to) {
    const n = Math.min(t + step, to), v = f(n);
    if (v !== prev) {
      let lo = t, hi = n;
      while (hi - lo > 30000) { const mid = (lo + hi) / 2; if (f(mid) === prev) lo = mid; else hi = mid; }
      out.push({ ms: hi, from: prev, to: v });
      prev = v;
    }
    t = n;
  }
  return out;
}
const sunRasi = (ms) => at(ms).sunRasi;
const tithiOf = (ms) => at(ms).tithi;
const nakOf = (ms) => at(ms).nakshatra.index;

// Spans of a set of tithis: [{ tithi, start, end }]
export function tithiSpans(from, to, wanted) {
  const ch = changes(tithiOf, from - 2 * 24 * H, to + 2 * 24 * H);
  const spans = [];
  for (let i = 0; i < ch.length - 1; i++) if (wanted.includes(ch[i].to)) spans.push({ tithi: ch[i].to, start: ch[i].ms, end: ch[i + 1].ms });
  return spans.filter((s) => s.end > from && s.start < to);
}
export function nakSpans(from, to, wanted) {
  const ch = changes(nakOf, from - 2 * 24 * H, to + 2 * 24 * H);
  const spans = [];
  for (let i = 0; i < ch.length - 1; i++) if (wanted.includes(ch[i].to)) spans.push({ nak: ch[i].to, start: ch[i].ms, end: ch[i + 1].ms });
  return spans.filter((s) => s.end > from && s.start < to);
}
// Sun entering each rasi (sankranti): [{ rasi, ms }]
export function sankrantis(from, to) { return changes(sunRasi, from, to, 6 * H).map((c) => ({ rasi: c.to, ms: c.ms })); }

// Sunrise and sunset (hours, IST) at a place on an ISO day
export function sun(iso, lat = 13.0827, lon = 80.2707) {
  const [y, m, d] = iso.split('-').map(Number);
  const p = A.panchang({ y, m, d, hh: 12, mm: 0, tz: 5.5, lat, lon });
  return { rise: p.sunrise, set: p.sunset, kalam: p.kalam, weekday: p.weekday };
}
// The day a tithi span is observed: the day whose sunrise falls inside it; if no sunrise does (a "lost" tithi), the day it starts.
export function observedDay(span, lat = 13.0827, lon = 80.2707) {
  for (let ms = dayStart(istParts(span.start).iso); ms < span.end; ms += 24 * H) {
    const iso = istParts(ms).iso, s = sun(iso, lat, lon);
    const riseMs = dayStart(iso) + (s.rise ?? 6) * H;
    if (riseMs >= span.start && riseMs < span.end) return iso;
  }
  return istParts(span.start).iso;
}
// Amanta lunar month index (0 = Chaitra ... 11 = Phalguna) for a moment, and whether it is an adhika (extra) month.
// A lunar month runs new moon to new moon and takes the name of the solar month the Sun enters during it.
export function lunarMonth(ms) {
  const ch = changes(tithiOf, ms - 32 * 24 * H, ms + 32 * 24 * H, 2 * H).filter((c) => c.to === 0);
  const startNm = ch.filter((c) => c.ms <= ms).pop(), endNm = ch.find((c) => c.ms > ms);
  const r1 = sunRasi(startNm.ms), r2 = sunRasi(endNm.ms);
  return { index: (r1 + 1) % 12, adhika: r1 === r2 };
}
const moonRasiOf = (ms) => at(ms).moonRasi;
// Spans when the Moon is in given rasis: [{ rasi, start, end }]
export function moonRasiSpans(from, to, wanted) {
  const ch = changes(moonRasiOf, from - 3 * 24 * H, to + 3 * 24 * H);
  const spans = [];
  for (let i = 0; i < ch.length - 1; i++) if (wanted.includes(ch[i].to)) spans.push({ rasi: ch[i].to, start: ch[i].ms, end: ch[i + 1].ms });
  return spans.filter((s) => s.end > from && s.start < to);
}
