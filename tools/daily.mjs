// Generates the daily rasi palan pages in all languages, then refreshes the sitemap.
// Run: node tools/daily.mjs                 (today + the next 2 days, India time)
//      node tools/daily.mjs 2026-11-15      (a specific start date)
// The GitHub Action in .github/workflows/daily.yml runs this every night and publishes the site.
//
// What it writes, per language (10):
//   rasi-palan/<lang>/<date>.html      all 12 rasis for that day, served at /rasi-palan/<lang>/<date> (kept for a year, then removed)
//   rasi-palan/<lang>/index.html       today's overview (stable address)
//   rasi-palan/<lang>/<rasi>/index.html one page per rasi, rewritten every day at the same address
//                                       (that is how "mesha rasi palan today" style searches are won)
// All text is original RasiVani wording from js/palan-i18n.js and js/palan-more-i18n.js; the daily
// variation comes from real astronomy: Moon transit, tithi, vrat days, planet ingresses, Sade Sati.
import { writeFileSync, readFileSync, mkdirSync, readdirSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, layout, STATIC_PAGES, toolHref } from './build.mjs';
import { loadBlog, buildBlog, guideLinks, loadVideos } from './blog.mjs';
import { buildPages, rasiPageHref, rasiPageLabel } from './pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
await import('../js/astro.js'); await import('../js/i18n.js'); await import('../js/palan-i18n.js'); await import('../js/palan-more-i18n.js');
const { Astro: A, I18N, PALAN, PALAN_MORE } = globalThis;
const LANGS = I18N.LANGS.map((l) => l.code);
const BLOG = await loadBlog(LANGS);
let TODAY_ISO = '';
const KEEP_DAYS = 400; // dated pages older than this are removed so the site stays under Cloudflare's file limit

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
const TRANSIT_PLANETS = ['mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'];
const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] ?? ''));
const hhmm = (h) => { if (h == null) return '–'; h = ((h % 24) + 24) % 24; let H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H = (H + 1) % 24; M = 0; } return `${pad(H)}:${pad(M)}`; };
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const addDays = (dt, n) => new Date(dt.getTime() + n * 86400000);
const ymd = (dt) => [dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()];
const level = (s) => (s <= 2 ? 0 : s === 3 ? 1 : 2);
const fmtDate = (lang, dt, opts) => new Intl.DateTimeFormat(lang === 'en' ? 'en-IN' : `${lang}-IN`, { timeZone: 'UTC', ...opts }).format(dt);
const longDate = (lang, dt) => fmtDate(lang, dt, { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
const titleDate = (lang, dt) => fmtDate(lang, dt, { day: 'numeric', month: 'long', year: 'numeric' });
const shortDate = (lang, dt) => fmtDate(lang, dt, { day: 'numeric', month: 'short', weekday: 'short' });
const rasiName = (lang, r) => I18N.TERMS[lang].rasi[r]; // English names already read "Mesha (Aries)"

function moonRasiAt(y, m, d, hourIST) {
  const hh = Math.floor(hourIST), mm = Math.round((hourIST - hh) * 60);
  return A.panchang({ y, m, d, hh, mm, tz: 5.5, lat: 20, lon: 78 }).moonRasi;
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

// ---------- Facts for one day that do not depend on language ----------
const dayCache = new Map();
function dayFacts(dt) {
  const key = dt.toISOString().slice(0, 10);
  if (dayCache.has(key)) return dayCache.get(key);
  const [y, m, d] = ymd(dt), [y2, m2, d2] = ymd(addDays(dt, 1));
  const at6 = A.panchang({ y, m, d, hh: 6, mm: 0, tz: 5.5, lat: 20, lon: 78 });
  // vrat / special day from the tithi at sunrise (the traditional rule)
  const VRAT = { 3: 'chaturthi', 5: 'shashti', 10: 'ekadashi', 12: 'pradosham', 14: 'pournami', 18: 'sankashti', 22: 'ashtami', 25: 'ekadashi', 27: 'pradosham', 29: 'amavasya' };
  const vrat = VRAT[at6.tithi] || null;
  // planet movements between sunrise today and sunrise tomorrow
  const c1 = A.computeChart({ y, m, d, hh: 6, mm: 0, tz: 5.5, lat: 20, lon: 78 });
  const c2 = A.computeChart({ y: y2, m: m2, d: d2, hh: 6, mm: 0, tz: 5.5, lat: 20, lon: 78 });
  const P1 = Object.fromEntries(c1.planets.map((p) => [p.key, p])), P2 = Object.fromEntries(c2.planets.map((p) => [p.key, p]));
  const events = [];
  const sankranti = P1.sun.rasi !== P2.sun.rasi ? P2.sun.rasi : null;
  for (const k of TRANSIT_PLANETS) {
    if (P1[k].rasi !== P2[k].rasi) events.push({ type: 'ingress', planet: k, rasi: P2[k].rasi });
    if (k !== 'rahu' && P1[k].retro !== P2[k].retro) events.push({ type: P2[k].retro ? 'retro' : 'direct', planet: k });
  }
  const f = { at6, vrat, sankranti, events, pos: P1 };
  dayCache.set(key, f);
  return f;
}
const moonHouse = (dt, r) => ((dayFacts(dt).at6.moonRasi - r + 12) % 12) + 1;

function specialHtml(lang, f) {
  const M = PALAN_MORE[lang], T = I18N.TERMS[lang], items = [];
  if (f.sankranti != null) items.push(M.vrat.sankranti.map((s) => fill(s, { rasi: T.rasi[f.sankranti] })));
  if (f.vrat) items.push(M.vrat[f.vrat]);
  if (!items.length) return '';
  return `<aside class="special"><h2>${esc(M.special)}</h2>${items.map(([n, dsc]) => `<p><strong>${esc(n)}</strong> · ${esc(dsc)}</p>`).join('')}</aside>`;
}

// ---------- Overview page: all 12 rasis for one day ----------
function page(lang, dt, prevIso, nextIso, archive) {
  const P = PALAN[lang], M = PALAN_MORE[lang], T = I18N.TERMS[lang], U = I18N.UI[lang];
  const [y, m, d] = ymd(dt);
  const dateIso = iso(y, m, d);
  const dateText = longDate(lang, dt);
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
    <a class="more" href="rasi-palan/${lang}/${slug}/">${esc(fill(M.read_more, { rasi: T.rasi[r] }))} →</a>
  </div>
</article>`;
  }).join('\n');
  const rahuRows = Object.values(CITIES).map(([name, lat, lon]) => {
    const p = A.panchang({ y, m, d, hh: 12, mm: 0, tz: 5.5, lat, lon });
    const k = p.kalam;
    return `<tr><th scope="row">${name}</th><td class="num">${hhmm(p.sunrise)}</td><td class="num">${k ? `${hhmm(k.rahu[0])} – ${hhmm(k.rahu[1])}` : '–'}</td><td class="num">${k ? `${hhmm(k.yama[0])} – ${hhmm(k.yama[1])}` : '–'}</td><td class="num">${k ? `${hhmm(k.gulika[0])} – ${hhmm(k.gulika[1])}` : '–'}</td></tr>`;
  }).join('');
  const file = `rasi-palan/${lang}/${dateIso}.html`;
  const alternates = LANGS.map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/rasi-palan/${l}/${dateIso}">`).join('')
    + `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/rasi-palan/en/${dateIso}">`;
  const headline = fill(M.day_title, { date: titleDate(lang, dt) });
  const title = `${esc(headline)} | ${SITE.name}`;
  const description = fill(P.desc, { date: dateText });
  const ld = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline, inLanguage: lang, description,
    datePublished: `${dateIso}T00:00:00+05:30`, dateModified: new Date().toISOString(), author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/icons/icon-512.png` } },
    mainEntityOfPage: `${SITE.url}/${file}`, image: `${SITE.url}/icons/og.png`, about: T.rasi.map((n) => ({ '@type': 'Thing', name: n }))
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
${specialHtml(lang, dayFacts(dt))}
<p class="wa-follow"><a href="${SITE.social.whatsapp}" rel="noopener" target="_blank">WhatsApp · RasiVani →</a></p>
<div class="palan-grid">
${cards}
</div>
<div class="ad-slot" data-ad="palan-mid"></div>
<nav class="palan-nav" aria-label="${esc(P.archive)}">${prevIso ? `<a href="rasi-palan/${lang}/${prevIso}">← ${esc(P.prev)}</a>` : '<span></span>'}${nextIso ? `<a href="rasi-palan/${lang}/${nextIso}">${esc(P.next)} →</a>` : ''}</nav>
<section class="block"><h3>${esc(P.rahu_cities)}</h3>
  <div class="table-wrap"><table><thead><tr><th scope="col">${esc(P.city)}</th><th scope="col">${esc(U.sunrise)}</th><th scope="col">${esc(U.rahukalam)}</th><th scope="col">${esc(U.yamagandam)}</th><th scope="col">${esc(U.gulikai)}</th></tr></thead><tbody>${rahuRows}</tbody></table></div>
  <p class="note">IST · Lahiri ayanamsa</p></section>
${archive.length ? `<section class="block"><h3>${esc(P.archive)}</h3><ul class="archive">${archive.map((a) => `<li><a href="rasi-palan/${lang}/${a}">${a}</a></li>`).join('')}</ul></section>` : ''}
${guideLinks(BLOG, lang, TODAY_ISO, ['chandrashtamam', 'rahu-kalam', 'sade-sati', 'panchangam-basics'])}`;
  return layout({ page: 'palan', file, title, description, body, base: '../../', lang, alternates, head: ld, keywords: fill(M.keywords, { rasi: T.rasi[0] }) });
}

// ---------- One rasi, today (stable address, rewritten daily) ----------
function signPage(lang, r, dt) {
  const P = PALAN[lang], M = PALAN_MORE[lang], T = I18N.TERMS[lang], U = I18N.UI[lang];
  const [y, m, d] = ymd(dt);
  const dateText = longDate(lang, dt), dateIso = iso(y, m, d);
  const slug = SLUG[r], name = rasiName(lang, r), short = T.rasi[r];
  const ref = CITIES[REF_CITY[lang]];
  const pcRef = A.panchang({ y, m, d, hh: 12, mm: 0, tz: 5.5, lat: ref[1], lon: ref[2] });
  const f = dayFacts(dt);
  const h = moonHouse(dt, r);
  const [w, mo, he, fa] = SCORES[h - 1];
  const doy = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
  const v = (doy + r) % 2;
  const color = P.colors[(r + doy) % 9];
  const num = ((LORD_NUM[r] + d) % 9) + 1;
  const vars = { rasi: short };
  // Abhijit muhurtham: the 8th of 15 daytime muhurtas, centred on local noon
  let abhijit = '–';
  if (pcRef.sunrise != null && pcRef.sunset != null) { const noon = (pcRef.sunrise + pcRef.sunset) / 2, half = (pcRef.sunset - pcRef.sunrise) / 30; abhijit = `${hhmm(noon - half)} – ${hhmm(noon + half)}`; }
  const rahu = pcRef.kalam ? `${hhmm(pcRef.kalam.rahu[0])} – ${hhmm(pcRef.kalam.rahu[1])}` : '–';
  // week ahead
  const week = [0, 1, 2, 3, 4, 5, 6].map((i) => { const dd = addDays(dt, i), hh = moonHouse(dd, r); const sc = SCORES[hh - 1]; return { dd, hh, total: sc.reduce((a, b) => a + b, 0) }; });
  const best = week.filter((x) => x.hh !== 8).sort((a, b) => b.total - a.total || a.dd - b.dd).slice(0, 2).sort((a, b) => a.dd - b.dd);
  const careful = week.filter((x) => x.hh === 8 || x.total <= 8);
  let nextChandra = null;
  for (let i = 1; i <= 31 && !nextChandra; i++) if (moonHouse(addDays(dt, i), r) === 8) nextChandra = addDays(dt, i);
  // Saturn and Jupiter from this rasi
  const sh = ((f.pos.saturn.rasi - r + 12) % 12) + 1, jh = ((f.pos.jupiter.rasi - r + 12) % 12) + 1;
  const sani = [12, 1, 2].includes(sh) ? M.sani_sade : sh === 8 ? M.sani_ashtama : sh === 4 ? M.sani_ardha : [3, 6, 11].includes(sh) ? M.sani_good : M.sani_mid;
  const guru = [2, 5, 7, 9, 11].includes(jh) ? M.guru_good : M.guru_mid;
  const eventLines = f.events.map((e) => fill(M[e.type], { planet: T.planet[e.planet], rasi: T.rasi[e.rasi] }));
  const positions = ['sun', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'].map((k) => `${T.planet[k]} – ${T.rasi[f.pos[k].rasi]}${f.pos[k].retro && k !== 'rahu' && k !== 'ketu' ? ' (R)' : ''}`).join(' · ');
  const overview = P.house[h - 1];
  const faq = [
    [fill(M.q1, vars), `${overview} ${M.love_t[level(fa)][v]}`],
    [fill(M.q2, vars), fill(M.a2, { ...vars, color, num })],
    [fill(M.q3, vars), h === 8 ? fill(M.a3_yes, vars) : fill(M.a3_no, { ...vars, date: nextChandra ? longDate(lang, nextChandra) : '–' })]
  ];
  const area = (label, score, lines) => `<div class="area"><h3>${esc(label)} <span class="stars" aria-label="${score}/5">${stars(score)}</span></h3><p>${esc(lines[level(score)][v])}</p></div>`;
  const file = `rasi-palan/${lang}/${slug}/index.html`;
  const url = `${SITE.url}/rasi-palan/${lang}/${slug}/`;
  const alternates = LANGS.map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/rasi-palan/${l}/${slug}/">`).join('')
    + `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/rasi-palan/en/${slug}/">`;
  const headline = fill(M.sign_title, { rasi: name, date: titleDate(lang, dt) });
  const description = fill(M.sign_desc, { rasi: name, date: titleDate(lang, dt) });
  const ld = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline, description, inLanguage: lang, datePublished: `${dateIso}T00:00:00+05:30`, dateModified: new Date().toISOString(),
      author: { '@type': 'Organization', name: SITE.name, url: SITE.url }, publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/icons/icon-512.png` } },
      mainEntityOfPage: url, image: `${SITE.url}/icons/og.png`, about: { '@type': 'Thing', name } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE.name, item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: P.h1, item: `${SITE.url}/rasi-palan/${lang}/` },
      { '@type': 'ListItem', position: 3, name: fill(M.sign_h1, { rasi: short }), item: url }] },
    { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ] })}</script>`;
  const body = `<nav class="crumbs" aria-label="Breadcrumb"><a href="./">${SITE.name}</a> › <a href="rasi-palan/${lang}/">${esc(P.h1)}</a> › <span>${esc(short)}</span></nav>
<section class="hero sign-hero" style="grid-template-columns:1fr">
  <div>
    <p class="sign-glyph" aria-hidden="true">${GLYPH[r]}</p>
    <h1>${esc(fill(M.sign_h1, { rasi: name }))}</h1>
    <p class="lede"><strong>${esc(dateText)}</strong></p>
    <p class="lede">${esc(fill(P.intro, { rasi: T.rasi[f.at6.moonRasi], nak: T.nak[f.at6.nakshatra.index] }))}${h === 8 ? ` <span class="chandra-tag">${esc(P.chandra)}</span>` : ''}</p>
  </div>
</section>
${specialHtml(lang, f)}
<p class="wa-follow"><a href="${SITE.social.whatsapp}" rel="noopener" target="_blank">WhatsApp · RasiVani →</a></p>
<div class="sign-layout">
<article class="sign-main">
  <section class="block"><h3>${esc(M.overview)}</h3><p class="overview">${esc(overview)}</p></section>
  <section class="areas">
    ${area(M.love, fa, M.love_t)}
    ${area(M.career, w, M.career_t)}
    ${area(M.money, mo, M.money_t)}
    ${area(M.health, he, M.health_t)}
  </section>
  <div class="ad-slot" data-ad="sign-mid"></div>
  <section class="block"><h3>${esc(M.remedy)}</h3><p>${esc(M.remedy_t[f.at6.weekday])} ${esc(P.advice[(r * 3 + doy) % P.advice.length])}</p></section>
  <section class="block"><h3>${esc(fill(M.week_ahead, vars))}</h3>
    <ol class="week">${week.map((x) => `<li class="${x.hh === 8 ? 'bad' : best.includes(x) ? 'good' : ''}"><span>${esc(shortDate(lang, x.dd))}</span><strong aria-label="${Math.round(x.total / 4)}/5">${stars(Math.max(1, Math.round(x.total / 4)))}</strong>${x.hh === 8 ? `<em>${esc(P.chandra)}</em>` : ''}</li>`).join('')}</ol>
    <p>${esc(M.best_days)}: <strong>${best.map((x) => esc(shortDate(lang, x.dd))).join(', ')}</strong>${careful.length ? ` · ${esc(M.careful_days)}: <strong>${careful.map((x) => esc(shortDate(lang, x.dd))).join(', ')}</strong>` : ''}</p>
  </section>
  <section class="block"><h3>${esc(fill(M.transits, vars))}</h3>
    ${eventLines.map((t) => `<p><strong>${esc(t)}</strong></p>`).join('')}
    <p>${esc(fill(sani, vars))}</p><p>${esc(fill(guru, vars))}</p>
    <p class="note">${esc(M.positions)}: ${esc(positions)}</p>
  </section>
  <section class="block faq"><h3>${esc(M.faq)}</h3>${faq.map(([q, a]) => `<details open><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
  ${guideLinks(BLOG, lang, TODAY_ISO, [h === 8 ? 'chandrashtamam' : null, [12, 1, 2, 8, 4].includes(sh) ? 'sade-sati' : null, f.vrat ? 'vrat-days' : null, 'rahu-kalam', 'ten-poruthams', 'jathagam-guide'].filter(Boolean).slice(0, 4))}
</article>
<aside class="sign-side">
  <div class="panel lucky-box"><h2>${esc(M.lucky)}</h2>
    <dl><div><dt>${esc(P.lucky_color)}</dt><dd>${esc(color)}</dd></div><div><dt>${esc(P.lucky_number)}</dt><dd>${num}</dd></div>
    <div><dt>${esc(M.good_time)}</dt><dd>${abhijit}</dd></div><div><dt>${esc(M.avoid_time)}</dt><dd>${rahu}</dd></div></dl>
    <p class="note">${esc(ref[0])} · IST</p></div>
  <nav class="panel sign-list" aria-label="${esc(M.all_signs)}"><h2>${esc(M.all_signs)}</h2><ul>${SLUG.map((s, i) => `<li><a href="rasi-palan/${lang}/${s}/"${i === r ? ' aria-current="page"' : ''}>${GLYPH[i]} ${esc(T.rasi[i])}</a></li>`).join('')}</ul></nav>
</aside>
</div>
<nav class="palan-nav"><a href="rasi-palan/${lang}/">← ${esc(M.all_signs)}</a>${rasiPageHref(lang, r) ? `<a href="${rasiPageHref(lang, r)}">${esc(rasiPageLabel(lang, r))} →</a>` : ''}<a href="${toolHref(lang, 'panchangam.html')}">${esc(U.nav_panchang)} →</a></nav>`;
  return layout({ page: 'palan', file, title: `${esc(headline)} | ${SITE.name}`, description, body, base: '../../../', lang, alternates, head: ld, keywords: fill(M.keywords, { rasi: short }) })
    .replace('<body data-page="palan"', `<body data-slug="${slug}" data-page="palan"`);
}

// ---------- Data for the social media post maker (/share) ----------
// One small JSON per language with today + the next 2 days. share.html draws the post images from it.
function socialDay(lang, dt) {
  const P = PALAN[lang], M = PALAN_MORE[lang], T = I18N.TERMS[lang], U = I18N.UI[lang];
  const [y, m, d] = ymd(dt);
  const ref = CITIES[REF_CITY[lang]];
  const pc0 = A.panchang({ y, m, d, hh: 6, mm: 0, tz: 5.5, lat: ref[1], lon: ref[2] });
  const sr = pc0.sunrise ?? 6;
  const pc = A.panchang({ y, m, d, hh: Math.floor(sr), mm: Math.round((sr % 1) * 60), tz: 5.5, lat: ref[1], lon: ref[2] });
  const pcNoon = A.panchang({ y, m, d, hh: 12, mm: 0, tz: 5.5, lat: ref[1], lon: ref[2] });
  const doy = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
  const tithiName = pc.tithi === 14 ? T.tithi[14] : pc.tithi === 29 ? T.tithi[15] : T.tithi[pc.tithi % 15];
  const f = dayFacts(dt);
  const special = [];
  if (f.sankranti != null) special.push(M.vrat.sankranti[0].replace('{rasi}', T.rasi[f.sankranti]));
  if (f.vrat) special.push(M.vrat[f.vrat][0]);
  return {
    date: iso(y, m, d), dateText: longDate(lang, dt), title: fill(M.day_title, { date: titleDate(lang, dt) }),
    tithi: tithiName, nakshatra: T.nak[pc.nakshatra.index], chandrashtamam: T.rasi[pc.chandrashtamaRasi], special,
    rahu: pcNoon.kalam ? `${hhmm(pcNoon.kalam.rahu[0])} – ${hhmm(pcNoon.kalam.rahu[1])}` : '', city: ref[0],
    signs: SLUG.map((slug, r) => {
      const h = ((pc.moonRasi - r + 12) % 12) + 1;
      return { slug, glyph: GLYPH[r], name: T.rasi[r], text: P.house[h - 1], advice: P.advice[(r * 3 + doy) % P.advice.length],
        scores: SCORES[h - 1], color: P.colors[(r + doy) % 9], num: ((LORD_NUM[r] + d) % 9) + 1, chandra: h === 8 };
    })
  };
}
function socialJson(lang) {
  const P = PALAN[lang], U = I18N.UI[lang];
  return JSON.stringify({
    lang, h1: P.h1, labels: { work: P.work, money: P.money, health: P.health, family: P.family, lucky_color: P.lucky_color, lucky_number: P.lucky_number,
      chandra: P.chandra, tithi: U.tithi, nakshatra: U.nakshatra, chandrashtamam: U.chandrashtamam, rahukalam: U.rahukalam },
    days: days.map((dt) => socialDay(lang, dt))
  });
}

// ---------- Which days ----------
const arg = process.argv[2];
let start;
if (arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) start = new Date(`${arg}T00:00:00Z`);
else { const now = new Date(Date.now() + 5.5 * 3600000); start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); }
const days = [0, 1, 2].map((i) => addDays(start, i));
const todayIso = days[0].toISOString().slice(0, 10);
TODAY_ISO = todayIso;
const oldestKept = addDays(start, -KEEP_DAYS).toISOString().slice(0, 10);

for (const lang of LANGS) {
  const dir = join(root, 'rasi-palan', lang);
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(dir).filter((x) => /^\d{4}-\d{2}-\d{2}\.html$/.test(x) && x.slice(0, 10) < oldestKept)) unlinkSync(join(dir, f));
  // Older day pages were written with .html links; Cloudflare redirects those, so point them at the final addresses.
  for (const f of readdirSync(dir).filter((x) => /^\d{4}-\d{2}-\d{2}\.html$/.test(x))) {
    const before = readFileSync(join(dir, f), 'utf8');
    const after = before.replace(/(href="[^"]*?\/?(?!index)[\w-]+)\.html(?=["?#])/g, '$1');
    if (after !== before) writeFileSync(join(dir, f), after);
  }
  for (const [i, dt] of days.entries()) {
    const [y, m, d] = ymd(dt);
    const prev = addDays(dt, -1).toISOString().slice(0, 10);
    const next = i < days.length - 1 ? days[i + 1].toISOString().slice(0, 10) : null;
    const existing = readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f)).map((f) => f.slice(0, 10));
    const hasPrev = existing.includes(prev) || i > 0;
    const archive = existing.filter((x) => x < iso(y, m, d)).sort().reverse().slice(0, 14);
    const html = page(lang, dt, hasPrev ? prev : null, next, archive);
    writeFileSync(join(dir, `${iso(y, m, d)}.html`), html);
    if (i === 0) writeFileSync(join(dir, 'index.html'), html.replace(`<link rel="canonical" href="${SITE.url}/rasi-palan/${lang}/${todayIso}">`, `<link rel="canonical" href="${SITE.url}/rasi-palan/${lang}/">`));
  }
  SLUG.forEach((slug, r) => {
    mkdirSync(join(dir, slug), { recursive: true });
    writeFileSync(join(dir, slug, 'index.html'), signPage(lang, r, days[0]));
  });
}

// Post maker data: social/<lang>.json (read by share.html, not listed in the sitemap)
mkdirSync(join(root, 'social'), { recursive: true });
for (const lang of LANGS) writeFileSync(join(root, 'social', `${lang}.json`), socialJson(lang));

// Language chooser at /rasi-palan/
writeFileSync(join(root, 'rasi-palan', 'index.html'), layout({
  page: 'palan', file: 'rasi-palan/index.html', title: `Daily Rasi Palan & Rashifal in 10 Indian languages | ${SITE.name}`, base: '../',
  description: 'Daily rasi palan (rashifal, rasi phalalu, rashi bhavishya) for all 12 rasis in Tamil, Telugu, Kannada, Malayalam, Hindi, Marathi, Bengali, Gujarati, Odia and English, updated every morning.',
  keywords: 'rasi palan, rashifal, rasi phalalu, rashi bhavishya, today horoscope, daily horoscope in tamil, telugu, hindi',
  body: `<section class="hero" style="grid-template-columns:1fr"><div><h1>Rasi Palan · राशिफल · ராசி பலன் · రాశి ఫలాలు</h1><p class="lede">${I18N.LANGS.map((l) => `<a style="color:var(--gold);margin-right:14px" href="rasi-palan/${l.code}/" hreflang="${l.code}" lang="${l.code}">${PALAN[l.code].h1}</a>`).join('')}</p></div></section>
<section class="block">${I18N.LANGS.map((l) => `<h3 lang="${l.code}">${l.name}</h3><ul class="archive" lang="${l.code}">${SLUG.map((s, r) => `<li><a href="rasi-palan/${l.code}/${s}/">${I18N.TERMS[l.code].rasi[r]}</a></li>`).join('')}</ul>`).join('')}</section>`
}));

// Guides (blog): one new guide goes live each day
const blogUrls = buildBlog(root, todayIso, BLOG, await loadVideos());
// Rasi and nakshatra pages (Tamil) and festival, amavasya and pournami pages (Tamil, Telugu)
const pageUrls = buildPages(root, todayIso);

// Sitemap: tool pages in every language, each language's overview + 12 rasi pages, and the last 30 days
const urls = STATIC_PAGES.map((p) => [`${SITE.url}/${p}`, todayIso]);
urls.push([`${SITE.url}/rasi-palan/`, todayIso]);
urls.push(...blogUrls);
urls.push(...pageUrls);
for (const lang of LANGS) {
  urls.push([`${SITE.url}/rasi-palan/${lang}/`, todayIso]);
  SLUG.forEach((s) => urls.push([`${SITE.url}/rasi-palan/${lang}/${s}/`, todayIso]));
  const dir = join(root, 'rasi-palan', lang);
  if (!existsSync(dir)) continue;
  readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f)).sort().reverse().slice(0, 33)
    .forEach((f) => urls.push([`${SITE.url}/rasi-palan/${lang}/${f.replace(/\.html$/, '')}`, f.slice(0, 10) > todayIso ? todayIso : f.slice(0, 10)]));
}
writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d]) => `  <url><loc>${u}</loc><lastmod>${d}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log(`Rasi palan ready for ${days.map((d) => d.toISOString().slice(0, 10)).join(', ')} in ${LANGS.length} languages (${LANGS.length * 12} rasi pages, ${urls.length} sitemap URLs)`);
