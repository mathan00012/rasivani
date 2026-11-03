// Generates the daily rasi palan pages in all languages, then refreshes the sitemap.
// Run: node tools/daily.mjs                 (today + the next 2 days, India time)
//      node tools/daily.mjs 2026-11-15      (a specific start date)
// The GitHub Action in .github/workflows/daily.yml runs this every night and publishes the site.
import { writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, layout, STATIC_PAGES } from './build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
await import('../js/astro.js'); await import('../js/i18n.js'); await import('../js/palan-i18n.js');
const { Astro: A, I18N, PALAN } = globalThis;
const LANGS = I18N.LANGS.map((l) => l.code);

const REF_CITY = { en: 'newdelhi', hi: 'newdelhi', mr: 'mumbai', ta: 'chennai', te: 'hyderabad', kn: 'bengaluru', ml: 'kochi', bn: 'kolkata', gu: 'ahmedabad', or: 'bhubaneswar' };
const CITIES = {
  chennai: ['Chennai', 13.0827, 80.2707], bengaluru: ['Bengaluru', 12.9716, 77.5946], hyderabad: ['Hyderabad', 17.385, 78.4867],
  kochi: ['Kochi', 9.9312, 76.2673], mumbai: ['Mumbai', 19.076, 72.8777], newdelhi: ['New Delhi', 28.6139, 77.209],
  kolkata: ['Kolkata', 22.5726, 88.3639], ahmedabad: ['Ahmedabad', 23.0225, 72.5714], bhubaneswar: ['Bhubaneswar', 20.2961, 85.8245]
};
const GLYPH = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((g) => g + '︎');
const SLUG = ['mesha', 'vrishabha', 'mithuna', 'karka', 'simha', 'kanya', 'tula', 'vrischika', 'dhanu', 'makara', 'kumbha', 'meena'];
// [work, money, health, family] out of 5 for the Moon in house 1..12 from the rasi
const SCORES = [[3, 3, 4, 4], [3, 2, 3, 3], [5, 4, 4, 3], [2, 3, 2, 2], [2, 2, 3, 2], [4, 4, 5, 3], [4, 4, 4, 5], [1, 2, 1, 2], [3, 3, 3, 3], [5, 4, 4, 4], [5, 5, 4, 5], [2, 1, 2, 3]];
const LORD_NUM = [9, 6, 5, 2, 1, 5, 6, 9, 3, 8, 8, 3]; // numerology number of each rasi lord
const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] ?? ''));
const hhmm = (h) => { if (h == null) return '–'; h = ((h % 24) + 24) % 24; let H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H = (H + 1) % 24; M = 0; } return `${pad(H)}:${pad(M)}`; };
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function moonRasiAt(y, m, d, hourIST) {
  const hh = Math.floor(hourIST), mm = Math.round((hourIST - hh) * 60);
  const c = A.panchang({ y, m, d, hh, mm, tz: 5.5, lat: 20, lon: 78 });
  return c.moonRasi;
}
function moonChange(y, m, d, fromHour) {
  const start = moonRasiAt(y, m, d, fromHour);
  for (let h = fromHour; h < fromHour + 24; h += 1 / 6) {
    const dt = new Date(Date.UTC(y, m - 1, d) + h * 3600000);
    if (moonRasiAt(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(), dt.getUTCHours() + dt.getUTCMinutes() / 60) !== start) {
      let lo = h - 1 / 6, hi = h; // refine to the minute
      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2, t = new Date(Date.UTC(y, m - 1, d) + mid * 3600000);
        if (moonRasiAt(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), t.getUTCHours() + t.getUTCMinutes() / 60) !== start) hi = mid; else lo = mid;
      }
      const t = new Date(Date.UTC(y, m - 1, d) + hi * 3600000);
      const sameDay = t.getUTCDate() === d;
      return { rasi: (start + 1) % 12, time: `${hhmm(t.getUTCHours() + t.getUTCMinutes() / 60)}${sameDay ? '' : ' (+1)'}` };
    }
  }
  return null;
}

function page(lang, y, m, d, prevIso, nextIso, archive) {
  const P = PALAN[lang], T = I18N.TERMS[lang], U = I18N.UI[lang];
  const dateIso = iso(y, m, d);
  const dateText = new Intl.DateTimeFormat(lang === 'en' ? 'en-IN' : `${lang}-IN`, { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
  const ref = CITIES[REF_CITY[lang]];
  const pc0 = A.panchang({ y, m, d, hh: 6, mm: 0, tz: 5.5, lat: ref[1], lon: ref[2] });
  const sr = pc0.sunrise ?? 6;
  const pc = A.panchang({ y, m, d, hh: Math.floor(sr), mm: Math.round((sr % 1) * 60), tz: 5.5, lat: ref[1], lon: ref[2] });
  const change = moonChange(y, m, d, sr);
  const doy = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
  const tithiName = pc.tithi === 14 ? T.tithi[14] : pc.tithi === 29 ? T.tithi[15] : T.tithi[pc.tithi % 15];
  const cards = SLUG.map((slug, r) => {
    const h = ((pc.moonRasi - r + 12) % 12) + 1;
    const [w, mo, he, fa] = SCORES[h - 1];
    const color = P.colors[(r + doy) % 9];
    const num = ((LORD_NUM[r] + d) % 9) + 1;
    const adv = P.advice[(r * 3 + doy) % P.advice.length];
    return `<article class="rasi-card el-${['fire', 'earth', 'air', 'water'][r % 4]}" id="${slug}">
  <header><span class="rasi-glyph" aria-hidden="true">${GLYPH[r]}</span><h2>${esc(T.rasi[r])}</h2>${h === 8 ? `<span class="chandra-tag">${esc(P.chandra)}</span>` : ''}</header>
  <div class="body">
    <p>${esc(P.house[h - 1])}</p>
    <dl class="meters"><div><dt>${esc(P.work)}</dt><dd aria-label="${w}/5">${stars(w)}</dd></div><div><dt>${esc(P.money)}</dt><dd aria-label="${mo}/5">${stars(mo)}</dd></div><div><dt>${esc(P.health)}</dt><dd aria-label="${he}/5">${stars(he)}</dd></div><div><dt>${esc(P.family)}</dt><dd aria-label="${fa}/5">${stars(fa)}</dd></div></dl>
    <p class="advice">${esc(adv)}</p>
    <div class="lucky"><span>${esc(P.lucky_color)}: <strong>${esc(color)}</strong></span><span>${esc(P.lucky_number)}: <strong>${num}</strong></span></div>
  </div>
</article>`;
  }).join('\n');
  const rahuRows = Object.values(CITIES).map(([name, lat, lon]) => {
    const p = A.panchang({ y, m, d, hh: 12, mm: 0, tz: 5.5, lat, lon });
    const k = p.kalam;
    return `<tr><th scope="row">${name}</th><td class="num">${hhmm(p.sunrise)}</td><td class="num">${k ? `${hhmm(k.rahu[0])} – ${hhmm(k.rahu[1])}` : '–'}</td><td class="num">${k ? `${hhmm(k.yama[0])} – ${hhmm(k.yama[1])}` : '–'}</td><td class="num">${k ? `${hhmm(k.gulika[0])} – ${hhmm(k.gulika[1])}` : '–'}</td></tr>`;
  }).join('');
  const file = `rasi-palan/${lang}/${dateIso}.html`;
  const alternates = LANGS.map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/rasi-palan/${l}/${dateIso}.html">`).join('')
    + `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/rasi-palan/en/${dateIso}.html">`;
  const title = `${fill(P.title, { date: dateText })} | ${SITE.name}`;
  const description = fill(P.desc, { date: dateText });
  const ld = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline: fill(P.title, { date: dateText }), inLanguage: lang,
    datePublished: `${dateIso}T00:00:00+05:30`, dateModified: `${dateIso}T00:00:00+05:30`, author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/icons/icon-512.png` } },
    mainEntityOfPage: `${SITE.url}/${file}`, image: `${SITE.url}/icons/og.png`
  })}</script>`;
  const body = `<section class="hero" style="grid-template-columns:1fr">
  <div>
    <h1>${esc(P.h1)}</h1>
    <p class="lede"><strong>${esc(dateText)}</strong></p>
    <p class="lede">${esc(fill(P.intro, { rasi: T.rasi[pc.moonRasi], nak: T.nak[pc.nakshatra.index] }))}${change ? ' ' + esc(fill(P.moon_enters, { rasi: T.rasi[change.rasi], time: change.time })) : ''}</p>
    <p class="palan-meta"><span>${esc(fill(P.ref, { city: ref[0] }))}:</span>
      <span>${esc(U.tithi)}: <strong>${esc(tithiName)}</strong></span><span>${esc(U.nakshatra)}: <strong>${esc(T.nak[pc.nakshatra.index])}</strong></span>
      <span>${esc(U.yoga)}: <strong>${esc(T.yoga[pc.yoga])}</strong></span><span>${esc(U.chandrashtamam)}: <strong>${esc(T.rasi[pc.chandrashtamaRasi])}</strong></span></p>
  </div>
</section>
<div class="palan-grid">
${cards}
</div>
<div class="ad-slot" data-ad="palan-mid"></div>
<nav class="palan-nav" aria-label="${esc(P.archive)}">${prevIso ? `<a href="rasi-palan/${lang}/${prevIso}.html">← ${esc(P.prev)}</a>` : '<span></span>'}${nextIso ? `<a href="rasi-palan/${lang}/${nextIso}.html">${esc(P.next)} →</a>` : ''}</nav>
<section class="block"><h3>${esc(P.rahu_cities)}</h3>
  <div class="table-wrap"><table><thead><tr><th scope="col">${esc(P.city)}</th><th scope="col">${esc(U.sunrise)}</th><th scope="col">${esc(U.rahukalam)}</th><th scope="col">${esc(U.yamagandam)}</th><th scope="col">${esc(U.gulikai)}</th></tr></thead><tbody>${rahuRows}</tbody></table></div>
  <p class="note">IST · Lahiri ayanamsa</p></section>
${archive.length ? `<section class="block"><h3>${esc(P.archive)}</h3><ul class="archive">${archive.map((a) => `<li><a href="rasi-palan/${lang}/${a}.html">${a}</a></li>`).join('')}</ul></section>` : ''}`;
  return layout({ page: 'palan', file, title, description, body, base: '../../', lang, alternates, head: ld })
    .replace('<main id="main" class="wrap">', '<main id="main" class="wrap">');
}

// ---------- Which days ----------
const arg = process.argv[2];
let start;
if (arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) start = new Date(`${arg}T00:00:00Z`);
else { const now = new Date(Date.now() + 5.5 * 3600000); start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); }
const days = [0, 1, 2].map((i) => new Date(start.getTime() + i * 86400000));
const todayIso = days[0].toISOString().slice(0, 10);

for (const lang of LANGS) {
  const dir = join(root, 'rasi-palan', lang);
  mkdirSync(dir, { recursive: true });
  for (const [i, dt] of days.entries()) {
    const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
    const prev = new Date(dt.getTime() - 86400000).toISOString().slice(0, 10);
    const next = i < days.length - 1 ? days[i + 1].toISOString().slice(0, 10) : null;
    const existing = readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f)).map((f) => f.slice(0, 10));
    const hasPrev = existing.includes(prev) || i > 0;
    const archive = existing.filter((x) => x < iso(y, m, d)).sort().reverse().slice(0, 14);
    const html = page(lang, y, m, d, hasPrev ? prev : null, next, archive);
    writeFileSync(join(dir, `${iso(y, m, d)}.html`), html);
    if (i === 0) writeFileSync(join(dir, 'index.html'), html.replace(`<link rel="canonical" href="${SITE.url}/rasi-palan/${lang}/${todayIso}.html">`, `<link rel="canonical" href="${SITE.url}/rasi-palan/${lang}/">`));
  }
}

// Language chooser at /rasi-palan/
writeFileSync(join(root, 'rasi-palan', 'index.html'), layout({
  page: 'palan', file: 'rasi-palan/index.html', title: `Daily Rasi Palan in 10 languages | ${SITE.name}`, base: '../',
  description: 'Daily rasi palan (rashifal) for all 12 rasis in Tamil, Telugu, Kannada, Malayalam, Hindi, Marathi, Bengali, Gujarati, Odia and English.',
  body: `<section class="hero" style="grid-template-columns:1fr"><div><h1>Rasi Palan</h1><p class="lede">${I18N.LANGS.map((l) => `<a style="color:var(--gold);margin-right:14px" href="rasi-palan/${l.code}/">${l.name}</a>`).join('')}</p></div></section>`
}));

// Sitemap: static pages + every language's latest page + the last 30 days
const urls = STATIC_PAGES.map((p) => [`${SITE.url}/${p}`, todayIso]);
urls.push([`${SITE.url}/rasi-palan/`, todayIso]);
for (const lang of LANGS) {
  urls.push([`${SITE.url}/rasi-palan/${lang}/`, todayIso]);
  const dir = join(root, 'rasi-palan', lang);
  if (!existsSync(dir)) continue;
  readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f)).sort().reverse().slice(0, 33)
    .forEach((f) => urls.push([`${SITE.url}/rasi-palan/${lang}/${f}`, f.slice(0, 10) > todayIso ? todayIso : f.slice(0, 10)]));
}
writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d]) => `  <url><loc>${u}</loc><lastmod>${d}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log(`Rasi palan ready for ${days.map((d) => d.toISOString().slice(0, 10)).join(', ')} in ${LANGS.length} languages`);
