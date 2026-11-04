// Evergreen pages with a daily and monthly part, rebuilt every night by tools/daily.mjs:
//   rasi/ta/<rasi>/            12 Tamil rasi pages (nature, nakshatras, today's palan, this month's palan)
//   nakshatra/ta/<star>/       27 Tamil nakshatra pages (facts, padas, matching stars, today's tara, this month's days)
//   festivals/<ta|te>/<slug>/  Karthigai Deepam / Karthika Pournami, Vaikunta Ekadasi, Pongal / Sankranti,
//                              and one page for every amavasya and pournami (Tamil and Telugu)
// All dates and times are worked out with the site's own astronomy engine (js/astro.js) via tools/calendar.mjs.
// Text lives in content/pages/<lang>.mjs.
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { SITE, layout, toolHref } from './build.mjs';
import * as C from './calendar.mjs';

await import('../js/astro.js'); await import('../js/i18n.js'); await import('../js/palan-i18n.js'); await import('../js/palan-more-i18n.js');
const { Astro: A, I18N, PALAN, PALAN_MORE } = globalThis;
const TXT = { ta: (await import('../content/pages/ta.mjs')).default.ui, te: (await import('../content/pages/te.mjs')).default.ui };

export const RASI_SLUG = ['mesha', 'vrishabha', 'mithuna', 'karka', 'simha', 'kanya', 'tula', 'vrischika', 'dhanu', 'makara', 'kumbha', 'meena'];
export const NAK_SLUG = ['ashwini', 'bharani', 'krittika', 'rohini', 'mrigashira', 'ardra', 'punarvasu', 'pushya', 'ashlesha', 'magha', 'purva-phalguni', 'uttara-phalguni', 'hasta', 'chitra', 'swati', 'vishakha', 'anuradha', 'jyeshtha', 'mula', 'purva-ashadha', 'uttara-ashadha', 'shravana', 'dhanishta', 'shatabhisha', 'purva-bhadrapada', 'uttara-bhadrapada', 'revati'];
export const RASI_LANGS = ['ta'];          // rasi + nakshatra pages (Tamil first, as in the growth plan)
export const FEST_LANGS = ['ta', 'te'];    // festival pages
const FEST_START = '2026-11-01';           // amavasya / pournami pages are kept from this date on, never removed
const GLYPH = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((g) => g + '︎');
const RASI_LORD = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
const DASHA_LORDS = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
const LORD_NUM = { sun: 1, moon: 2, jupiter: 3, mercury: 5, venus: 6, saturn: 8, mars: 9 };
const LORD_DAY = { sun: 0, moon: 1, mars: 2, mercury: 3, jupiter: 4, venus: 5, saturn: 6 };
const EXALT = { sun: 0, moon: 1, mars: 9, mercury: 5, jupiter: 3, venus: 11, saturn: 6 };
const DEBIL = { sun: 6, moon: 7, mars: 3, mercury: 11, jupiter: 9, venus: 5, saturn: 0 };
const GANA = 'DMRMDMDDRRMMDRDRDRRMMDRRMMD';
const YONI = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];
const RAJJU = [0, 1, 2, 3, 4, 3, 2, 1, 0];
// Gochara (transit) houses counted from the Moon sign that give good results
const GOOD_HOUSES = { sun: [3, 6, 10, 11], mars: [3, 6, 11], mercury: [2, 4, 6, 8, 10, 11], venus: [1, 2, 3, 4, 5, 8, 9, 11, 12], jupiter: [2, 5, 7, 9, 11], saturn: [3, 6, 11] };
// [work, money, health, family] for the Moon in house 1..12 (same table as the daily rasi palan)
const SCORES = [[3, 3, 4, 4], [3, 2, 3, 3], [5, 4, 4, 3], [2, 3, 2, 2], [2, 2, 3, 2], [4, 4, 5, 3], [4, 4, 4, 5], [1, 2, 1, 2], [3, 3, 3, 3], [5, 4, 4, 4], [5, 5, 4, 5], [2, 1, 2, 3]];
const CITY = { ta: [13.0827, 80.2707], te: [17.385, 78.4867] }; // Chennai, Hyderabad
const H = 3600000, DAY = 24 * H;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] ?? ''));
const pad = (n) => String(n).padStart(2, '0');
const addIso = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const dt = (iso) => new Date(`${iso}T00:00:00Z`);
const fmt = (lang, iso, o) => new Intl.DateTimeFormat(`${lang}-IN`, { timeZone: 'UTC', ...o }).format(dt(iso));
const longDate = (lang, iso) => fmt(lang, iso, { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
const dayMonth = (lang, iso) => fmt(lang, iso, { day: 'numeric', month: 'long' });
const shortDay = (lang, iso) => fmt(lang, iso, { day: 'numeric', month: 'short', weekday: 'short' });
const monthYear = (lang, iso) => fmt(lang, iso, { month: 'long', year: 'numeric' });
const monthName = (lang, iso) => fmt(lang, iso, { month: 'long' });
const MONTH_EN = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const hhmm = (h) => { if (h == null) return '–'; h = ((h % 24) + 24) % 24; let a = Math.floor(h), b = Math.round((h - a) * 60); if (b === 60) { a = (a + 1) % 24; b = 0; } return `${pad(a)}:${pad(b)}`; };
const moment = (lang, ms) => { const p = C.istParts(ms); return `${dayMonth(lang, p.iso)} ${p.hm}`; };
const range = (lang, s) => fill(TXT[lang].from_to, { from: moment(lang, s.start), to: moment(lang, s.end) });
const sunriseFacts = (iso, lang) => C.at(C.dayStart(iso) + 6 * H, ...CITY[lang]); // panchang at 06:00 IST (as the daily palan)
const monthBounds = (iso) => { const first = `${iso.slice(0, 7)}-01`; const next = addIso(first, 32).slice(0, 7) + '-01'; return { first, next, days: Math.round((Date.parse(next) - Date.parse(first)) / DAY) }; };
const ldScript = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const org = { '@type': 'Organization', name: SITE.name, url: SITE.url };
const crumbsLd = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) });
const faqLd = (faq) => ({ '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const crumbs = (items) => `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([name, href], i) => (i < items.length - 1 ? `<a href="${href}">${esc(name)}</a>` : `<span>${esc(name)}</span>`)).join(' › ')}</nav>`;
const tableRows = (rows) => `<div class="table-wrap"><table><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div>`;
const chips = (items) => `<ul class="archive">${items.map(([label, href]) => `<li>${href ? `<a href="${href}">${esc(label)}</a>` : `<span class="chip">${esc(label)}</span>`}</li>`).join('')}</ul>`;

function writePage(root, file, html) { mkdirSync(join(root, file, '..'), { recursive: true }); writeFileSync(join(root, file), html); }
function page(o) {
  // o: { lang, file, url, title, description, body, ld, keywords, alternates, langMap }
  return layout({ page: 'info', file: o.file, title: `${esc(o.title)} | ${SITE.name}`, description: o.description, body: o.body, base: '../'.repeat(o.file.split('/').length - 1),
    lang: o.lang, fixed: true, alternates: o.alternates || '', head: o.ld ? ldScript({ '@context': 'https://schema.org', '@graph': o.ld }) : '', keywords: o.keywords || '', langMap: o.langMap });
}
const langMapFor = (lang, own) => Object.fromEntries(I18N.LANGS.map((l) => [l.code, l.code === lang ? own : null]).filter(([, v]) => v));

// ---------------------------------------------------------------- rasi pages
function rasiNaks(r) {
  const out = []; // [{ star, padas: [] }]
  for (let p = 9 * r; p < 9 * r + 9; p++) { const star = Math.floor(p / 4), pada = (p % 4) + 1; const last = out[out.length - 1]; if (last && last.star === star) last.padas.push(pada); else out.push({ star, padas: [pada] }); }
  return out;
}
const padaText = (lang, padas) => (padas.length === 4 ? '(1–4 பாதங்கள்)' : `(${padas.join(', ')} பாதம்)`);

function rasiPage(lang, r, today) {
  const T = I18N.TERMS[lang], U = TXT[lang], P = PALAN[lang], M = PALAN_MORE[lang];
  const slug = RASI_SLUG[r], name = T.rasi[r], lord = RASI_LORD[r];
  const naks = rasiNaks(r);
  const nakList = naks.map((n) => `${T.nak[n.star]} ${padaText(lang, n.padas)}`).join(', ');
  const mb = monthBounds(today), month = monthYear(lang, today);
  const exalted = Object.keys(EXALT).filter((k) => EXALT[k] === r).map((k) => T.planet[k]).join(', ') || U.none;
  const debil = Object.keys(DEBIL).filter((k) => DEBIL[k] === r).map((k) => T.planet[k]).join(', ') || U.none;
  // today
  const f0 = sunriseFacts(today, lang);
  const hToday = ((f0.moonRasi - r + 12) % 12) + 1;
  // month: planets at mid-month, Sun's change of sign, chandrashtamam, best days
  const mid = C.dayStart(`${today.slice(0, 7)}-15`) + 6 * H, midP = C.istParts(mid);
  const chart = A.computeChart({ y: midP.y, m: midP.m, d: midP.d, hh: 6, mm: 0, tz: 5.5, lat: 20, lon: 78 });
  const pos = Object.fromEntries(chart.planets.map((p) => [p.key, p]));
  const lines = [];
  let good = 0;
  for (const k of ['sun', 'mars', 'mercury', 'venus', 'jupiter']) {
    const h = ((pos[k].rasi - r + 12) % 12) + 1, ok = GOOD_HOUSES[k].includes(h);
    if (ok) good++;
    lines.push(fill(U.transit[k][ok ? 1 : 0], { h }));
  }
  const sh = ((pos.saturn.rasi - r + 12) % 12) + 1;
  if (GOOD_HOUSES.saturn.includes(sh)) good++;
  const sani = [12, 1, 2].includes(sh) ? M.sani_sade : sh === 8 ? M.sani_ashtama : sh === 4 ? M.sani_ardha : [3, 6, 11].includes(sh) ? M.sani_good : M.sani_mid;
  lines.push(fill(U.transit.saturn[GOOD_HOUSES.saturn.includes(sh) ? 1 : 0], { h: sh }) + ' ' + fill(sani, { rasi: name }));
  const from = C.dayStart(mb.first), to = C.dayStart(mb.next);
  const sank = C.sankrantis(from, to).map((s) => fill(U.sun_moves, { date: dayMonth(lang, C.istParts(s.ms).iso), rasi: T.rasi[s.rasi], tmonth: U.tamil_months[s.rasi] }));
  const chandra = C.moonRasiSpans(from, to, [(r + 7) % 12]);
  const chandraText = chandra.length ? chandra.map((s) => range(lang, s)).join('; ') : U.chandrashtamam_none;
  const days = [];
  for (let i = 0; i < mb.days; i++) {
    const iso = addIso(mb.first, i), h = ((sunriseFacts(iso, lang).moonRasi - r + 12) % 12) + 1;
    if (h !== 8) days.push({ iso, total: SCORES[h - 1].reduce((a, b) => a + b, 0) });
  }
  const best = days.sort((a, b) => b.total - a.total || a.iso.localeCompare(b.iso)).slice(0, 6).sort((a, b) => a.iso.localeCompare(b.iso));
  const overall = fill(U.month_overall[good >= 4 ? 2 : good >= 2 ? 1 : 0], { rasi: name });

  const file = `rasi/${lang}/${slug}/index.html`, url = `${SITE.url}/rasi/${lang}/${slug}/`;
  const title = fill(U.rasi_title, { rasi: name, month: monthName(lang, today) });
  const description = fill(U.rasi_desc, { rasi: name, lord: T.planet[lord], month });
  const faqVars = { rasi: name, lord: T.planet[lord], day: T.weekday[LORD_DAY[lord]], naks: nakList, chandra: chandraText };
  const faq = U.rasi_faq.map(([q, a]) => [fill(q, faqVars), fill(a, faqVars)]);
  const facts = [
    [U.lord, T.planet[lord]], [U.element, U.elements[r % 4]], [U.quality, U.qualities[r % 3]], [U.naks, nakList],
    [U.exalted, exalted], [U.debilitated, debil], [U.lucky_day, T.weekday[LORD_DAY[lord]]], [U.lucky_color, U.colors[lord]],
    [U.lucky_number, String(LORD_NUM[lord])], [U.lucky_gem, U.gems[lord]], [U.deity, U.gods[lord]]
  ];
  const body = `${crumbs([[SITE.name, toolHref(lang, 'index.html')], [U.all_rasis, `rasi/${lang}/`], [name]])}
<section class="hero sign-hero" style="grid-template-columns:1fr"><div>
  <p class="sign-glyph" aria-hidden="true">${GLYPH[r]}</p>
  <h1>${esc(fill(U.rasi_h1, { rasi: name }))}</h1>
  <p class="lede">${esc(fill(U.rasi_lede, { rasi: name, lord: T.planet[lord], naks: naks.map((n) => T.nak[n.star]).join(', ') }))}</p>
</div></section>
<div class="sign-layout">
<article class="sign-main">
  <section class="block"><h2 class="h3">${esc(U.nature)}</h2><p class="overview">${esc(U.rasi_nature[r])}</p></section>
  <section class="block"><h2 class="h3">${esc(U.today)} · ${esc(longDate(lang, today))}</h2><p>${esc(P.house[hToday - 1])}${hToday === 8 ? ` <span class="chandra-tag">${esc(P.chandra)}</span>` : ''}</p>
    <p><a href="rasi-palan/${lang}/${slug}/">${esc(U.today_more)} →</a></p></section>
  <div class="ad-slot" data-ad="rasi-mid"></div>
  <section class="block"><h2 class="h3">${esc(fill(U.month_title, { month }))}</h2>
    <p class="overview">${esc(overall)}</p>
    <h3>${esc(U.month_planets)}</h3>
    ${lines.map((t) => `<p>${esc(t)}</p>`).join('\n    ')}
    ${sank.map((t) => `<p class="note">${esc(t)}</p>`).join('')}
    <h3>${esc(U.chandrashtamam_days)}</h3><p>${esc(chandraText)}</p>
    <h3>${esc(U.best_days)}</h3>${chips(best.map((b) => [shortDay(lang, b.iso)]))}
  </section>
  <section class="block faq"><h2 class="h3">${esc(M.faq)}</h2>${faq.map(([q, a]) => `<details open><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
  <aside class="guide-cta"><p>${esc(U.make_chart)}</p><a class="btn" href="${toolHref(lang, 'index.html')}">${esc(I18N.UI[lang].btn_chart)}</a></aside>
</article>
<aside class="sign-side">
  <div class="panel lucky-box"><h2>${esc(U.facts)}</h2><dl>${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
  <nav class="panel sign-list" aria-label="${esc(U.naks)}"><h2>${esc(U.naks)}</h2><ul>${naks.map((n) => `<li><a href="nakshatra/${lang}/${NAK_SLUG[n.star]}/">${esc(T.nak[n.star])}</a></li>`).join('')}</ul></nav>
  <nav class="panel sign-list" aria-label="${esc(U.all_rasis)}"><h2>${esc(U.all_rasis)}</h2><ul>${RASI_SLUG.map((s, i) => `<li><a href="rasi/${lang}/${s}/"${i === r ? ' aria-current="page"' : ''}>${GLYPH[i]} ${esc(T.rasi[i])}</a></li>`).join('')}</ul></nav>
</aside>
</div>`;
  const ld = [
    { '@type': 'Article', headline: title, description, inLanguage: lang, datePublished: '2026-11-05T00:00:00+05:30', dateModified: `${today}T00:05:00+05:30`, author: org, publisher: { ...org, logo: { '@type': 'ImageObject', url: `${SITE.url}/icons/icon-512.png` } }, mainEntityOfPage: url, image: `${SITE.url}/icons/og.png`, about: { '@type': 'Thing', name } },
    crumbsLd([[SITE.name, `${SITE.url}/`], [U.all_rasis, `${SITE.url}/rasi/${lang}/`], [name, url]]),
    faqLd(faq)
  ];
  return { file, url, html: page({ lang, file, title, description, body, ld, keywords: `${name} ராசி, ${name} ராசி பலன், ${name} ராசி குணங்கள், ${monthName(lang, today)} மாத ராசி பலன், ${name} rasi`, langMap: langMapFor(lang, `rasi/${lang}/${slug}/`) }) };
}

function rasiHub(lang, today) {
  const T = I18N.TERMS[lang], U = TXT[lang];
  const file = `rasi/${lang}/index.html`, url = `${SITE.url}/rasi/${lang}/`;
  const body = `${crumbs([[SITE.name, toolHref(lang, 'index.html')], [U.all_rasis]])}
<section class="hero sign-hero" style="grid-template-columns:1fr"><div><h1>${esc(U.rasi_hub_title)}</h1><p class="lede">${esc(U.rasi_hub_desc)}</p></div></section>
<ul class="guide-list">${RASI_SLUG.map((s, r) => `<li class="guide-card"><a href="rasi/${lang}/${s}/"><strong>${GLYPH[r]} ${esc(T.rasi[r])}</strong><span>${esc(U.lord)}: ${esc(T.planet[RASI_LORD[r]])} · ${esc(rasiNaks(r).map((n) => T.nak[n.star]).join(', '))}</span></a></li>`).join('')}</ul>
<nav class="palan-nav"><a href="nakshatra/${lang}/">${esc(U.all_naks)} →</a><a href="rasi-palan/${lang}/">${esc(PALAN[lang].h1)} →</a></nav>`;
  return { file, url, html: page({ lang, file, title: U.rasi_hub_title, description: U.rasi_hub_desc, body, ld: [crumbsLd([[SITE.name, `${SITE.url}/`], [U.all_rasis, url]])], langMap: langMapFor(lang, `rasi/${lang}/`) }) };
}

// ---------------------------------------------------------------- nakshatra pages
function nakRasiText(lang, n) {
  const T = I18N.TERMS[lang], parts = {};
  for (let pada = 1; pada <= 4; pada++) { const r = A.rasiFromStarPada(n, pada); (parts[r] = parts[r] || []).push(pada); }
  const keys = Object.keys(parts).map(Number);
  if (keys.length === 1) return `${T.nak[n]} நட்சத்திரம் முழுவதும் (4 பாதங்களும்) ${T.rasi[keys[0]]} ராசியில் உள்ளது.`;
  return `${T.nak[n]} நட்சத்திரத்தின் ` + keys.map((r) => `${parts[r].join(', ')} பாதம் ${T.rasi[r]} ராசியில்`).join('; ') + ' உள்ளது.';
}
function bestMatches(n) {
  // bride = star n; average score over every pada of both stars; rajju and vedha must agree
  const res = [];
  for (let m = 0; m < 27; m++) {
    if (m === n) continue;
    let sum = 0, cnt = 0, ok = true;
    for (let pg = 1; pg <= 4; pg++) for (let pb = 1; pb <= 4; pb++) {
      const r = A.porutham({ star: n, rasi: A.rasiFromStarPada(n, pg) }, { star: m, rasi: A.rasiFromStarPada(m, pb) });
      if (!r.rajjuOk || !r.vedhaOk) ok = false;
      sum += r.score; cnt++;
    }
    if (ok) res.push({ m, avg: sum / cnt });
  }
  return res.sort((a, b) => b.avg - a.avg || a.m - b.m).slice(0, 8);
}
const VEDHA = [[0, 17], [1, 16], [2, 15], [3, 14], [5, 21], [6, 20], [7, 19], [8, 18], [9, 26], [10, 25], [11, 24], [12, 23], [4, 22], [4, 13], [13, 22]];

function nakPage(lang, n, today) {
  const T = I18N.TERMS[lang], U = TXT[lang], M = PALAN_MORE[lang];
  const slug = NAK_SLUG[n], name = T.nak[n], lord = DASHA_LORDS[n % 9];
  const mb = monthBounds(today), month = monthYear(lang, today);
  const startDeg = n * 40 / 3, endDeg = startDeg + 40 / 3;
  const deg = (d) => { const r = Math.floor(d / 30 + 1e-9), w = d - r * 30; return `${T.rasi[r]} ${Math.floor(w + 1e-9)}°${pad(Math.round((w - Math.floor(w + 1e-9)) * 60))}′`; };
  const spanText = `${deg(startDeg)} – ${deg(endDeg - 1e-6).replace(/29°60′/, '30°00′')}`;
  const rasiText = nakRasiText(lang, n);
  const facts = [
    [U.nak_rasi, [...new Set([1, 2, 3, 4].map((p) => T.rasi[A.rasiFromStarPada(n, p)]))].join(', ')], [U.nak_lord, T.planet[lord]], [U.nak_deity, U.deities[n]], [U.nak_symbol, U.symbols[n]],
    [U.gana, U.ganas[GANA[n]]], [U.yoni, U.yonis[YONI[n]]], [U.rajju, U.rajjus[RAJJU[n % 9]]],
    [U.first_dasha, `${T.planet[lord]} · ${fill(U.years, { n: A.DASHA_YEARS[lord] })}`], [U.span, spanText]
  ];
  const padas = [1, 2, 3, 4].map((p) => { const g = n * 4 + p - 1; return [fill(U.pada_n, { n: p }), fill(U.pada_row, { rasi: T.rasi[Math.floor(g / 9)], nav: T.rasi[g % 12] })]; });
  // today's tara
  const f0 = sunriseFacts(today, lang), todayStar = f0.nakshatra.index;
  const tara = ((todayStar - n + 27) % 27) % 9;
  // month: good / careful days by tara at sunrise, janma nakshatra spans
  const good = [], careful = [];
  for (let i = 0; i < mb.days; i++) {
    const iso = addIso(mb.first, i), t = ((sunriseFacts(iso, lang).nakshatra.index - n + 27) % 27) % 9;
    if ([1, 3, 5, 7, 8].includes(t)) good.push(iso); else if ([2, 4, 6].includes(t)) careful.push(iso);
  }
  const janma = C.nakSpans(C.dayStart(mb.first), C.dayStart(mb.next), [n]);
  const matches = bestMatches(n);
  const sameRajju = Array.from({ length: 27 }, (_, m) => m).filter((m) => m !== n && RAJJU[m % 9] === RAJJU[n % 9]).map((m) => T.nak[m]);
  const vedha = VEDHA.filter(([p, q]) => p === n || q === n).map(([p, q]) => T.nak[p === n ? q : p]);
  const matchList = matches.map((x) => T.nak[x.m]).join(', ');
  const faqVars = { nak: name, lord: T.planet[lord], rasis: rasiText, list: matchList };
  const faq = U.nak_faq.map(([q, a]) => [fill(q, faqVars), fill(a, faqVars)]);
  const rasis = [...new Set([1, 2, 3, 4].map((p) => A.rasiFromStarPada(n, p)))];
  const file = `nakshatra/${lang}/${slug}/index.html`, url = `${SITE.url}/nakshatra/${lang}/${slug}/`;
  const title = fill(U.nak_title, { nak: name });
  const description = fill(U.nak_desc, { nak: name, lord: T.planet[lord], month: monthName(lang, today) });
  const body = `${crumbs([[SITE.name, toolHref(lang, 'index.html')], [U.all_naks, `nakshatra/${lang}/`], [name]])}
<section class="hero sign-hero" style="grid-template-columns:1fr"><div>
  <p class="sign-glyph" aria-hidden="true">✦︎</p>
  <h1>${esc(fill(U.nak_h1, { nak: name }))}</h1>
  <p class="lede">${esc(fill(U.nak_lede, { n: n + 1, nak: name, lord: T.planet[lord], deity: U.deities[n] }))} ${esc(rasiText)}</p>
</div></section>
<div class="sign-layout">
<article class="sign-main">
  <section class="block"><h2 class="h3">${esc(TXT[lang].nature)}</h2><p class="overview">${esc(U.nak_nature[n])}</p></section>
  <section class="block"><h2 class="h3">${esc(U.tara_today)} · ${esc(longDate(lang, today))}</h2>
    <p>${esc(fill(U.tara_line, { today: T.nak[todayStar], nak: name, tara: U.taras[tara] }))}</p>
    <p class="overview">${esc(U.tara_text[tara])}</p></section>
  <div class="ad-slot" data-ad="nak-mid"></div>
  <section class="block"><h2 class="h3">${esc(fill(U.month_title, { month }).replace(' ராசி பலன்', ' நட்சத்திர பலன்'))}</h2>
    <h3>${esc(fill(U.month_good, { month: monthName(lang, today) }))}</h3>${chips(good.map((iso) => [shortDay(lang, iso)]))}
    <h3>${esc(fill(U.month_careful, { month: monthName(lang, today) }))}</h3>${chips(careful.map((iso) => [shortDay(lang, iso)]))}
    <h3>${esc(fill(U.janma_days, { month: monthName(lang, today), nak: name }))}</h3><p>${esc(janma.map((s) => range(lang, s)).join('; ') || '–')}</p>
  </section>
  <section class="block"><h2 class="h3">${esc(U.match_title)}</h2><p>${esc(fill(U.match_intro, { nak: name }))}</p>
    ${chips(matches.map((x) => [`${T.nak[x.m]} · ${fill(U.match_score, { score: (Math.round(x.avg * 2) / 2).toString() })}`, `nakshatra/${lang}/${NAK_SLUG[x.m]}/`]))}
    <p class="note">${esc(fill(U.match_avoid, { list: sameRajju.join(', ') }))}${vedha.length ? ' ' + esc(fill(U.match_vedha, { list: vedha.join(', ') })) : ''}</p>
    <p><a class="btn" style="width:auto;text-decoration:none" href="${toolHref(lang, 'porutham.html')}">${esc(U.check_match)}</a></p></section>
  <section class="block"><h2 class="h3">${esc(U.padas)}</h2>${tableRows(padas)}</section>
  <section class="block faq"><h2 class="h3">${esc(M.faq)}</h2>${faq.map(([q, a]) => `<details open><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
</article>
<aside class="sign-side">
  <div class="panel lucky-box"><h2>${esc(U.facts)}</h2><dl>${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
  <nav class="panel sign-list" aria-label="${esc(U.nak_rasi)}"><h2>${esc(U.nak_rasi)}</h2><ul>${rasis.map((r) => `<li><a href="rasi/${lang}/${RASI_SLUG[r]}/">${GLYPH[r]} ${esc(fill(U.see_rasi, { rasi: T.rasi[r] }))}</a></li>`).join('')}</ul></nav>
  <nav class="panel sign-list" aria-label="${esc(U.all_naks)}"><h2>${esc(U.all_naks)}</h2><ul>${NAK_SLUG.map((s, i) => `<li><a href="nakshatra/${lang}/${s}/"${i === n ? ' aria-current="page"' : ''}>${esc(T.nak[i])}</a></li>`).join('')}</ul></nav>
</aside>
</div>`;
  const ld = [
    { '@type': 'Article', headline: title, description, inLanguage: lang, datePublished: '2026-11-05T00:00:00+05:30', dateModified: `${today}T00:05:00+05:30`, author: org, publisher: { ...org, logo: { '@type': 'ImageObject', url: `${SITE.url}/icons/icon-512.png` } }, mainEntityOfPage: url, image: `${SITE.url}/icons/og.png`, about: { '@type': 'Thing', name } },
    crumbsLd([[SITE.name, `${SITE.url}/`], [U.all_naks, `${SITE.url}/nakshatra/${lang}/`], [name, url]]),
    faqLd(faq)
  ];
  return { file, url, html: page({ lang, file, title, description, body, ld, keywords: `${name} நட்சத்திரம், ${name} நட்சத்திர பொருத்தம், ${name} நட்சத்திர குணங்கள், ${name} நட்சத்திர பலன், ${NAK_SLUG[n]} nakshatra`, langMap: langMapFor(lang, `nakshatra/${lang}/${slug}/`) }) };
}

function nakHub(lang) {
  const T = I18N.TERMS[lang], U = TXT[lang];
  const file = `nakshatra/${lang}/index.html`, url = `${SITE.url}/nakshatra/${lang}/`;
  const body = `${crumbs([[SITE.name, toolHref(lang, 'index.html')], [U.all_naks]])}
<section class="hero sign-hero" style="grid-template-columns:1fr"><div><h1>${esc(U.nak_hub_title)}</h1><p class="lede">${esc(U.nak_hub_desc)}</p></div></section>
<ul class="guide-list">${NAK_SLUG.map((s, n) => `<li class="guide-card"><a href="nakshatra/${lang}/${s}/"><strong>${n + 1}. ${esc(T.nak[n])}</strong><span>${esc(U.nak_lord)}: ${esc(T.planet[DASHA_LORDS[n % 9]])} · ${esc([...new Set([1, 2, 3, 4].map((p) => T.rasi[A.rasiFromStarPada(n, p)]))].join(', '))} · ${esc(U.ganas[GANA[n]])}</span></a></li>`).join('')}</ul>
<nav class="palan-nav"><a href="rasi/${lang}/">${esc(U.all_rasis)} →</a><a href="${toolHref(lang, 'porutham.html')}">${esc(U.check_match)} →</a></nav>`;
  return { file, url, html: page({ lang, file, title: U.nak_hub_title, description: U.nak_hub_desc, body, ld: [crumbsLd([[SITE.name, `${SITE.url}/`], [U.all_naks, url]])], langMap: langMapFor(lang, `nakshatra/${lang}/`) }) };
}

// ---------------------------------------------------------------- festivals
// Dates of the big festivals for the season that starts in November of year Y
function sunsetMs(iso, lang) { const s = C.sun(iso, ...CITY[lang]); return C.dayStart(iso) + (s.set ?? 18) * H; }
function karthigai(Y, lang) {
  // Tamil: the day in Karthigai (Sun in Vrischika) when the Krittika star holds at sunset
  const from = C.dayStart(`${Y}-11-01`), to = C.dayStart(`${Y}-12-31`);
  const k = C.nakSpans(from, to, [2]).find((s) => C.at((s.start + s.end) / 2).sunRasi === 7);
  if (!k) return null;
  let day = null;
  for (let ms = C.dayStart(C.istParts(k.start).iso); ms < k.end && !day; ms += DAY) { const iso = C.istParts(ms).iso, ss = sunsetMs(iso, lang); if (ss >= k.start && ss < k.end) day = iso; }
  day = day || C.istParts(k.start).iso;
  const pm = C.tithiSpans(C.dayStart(day) - 3 * DAY, C.dayStart(day) + 3 * DAY, [14])[0];
  return { day, rows: { krittika: k, pournami: pm } };
}
function karthikaPournami(Y, lang) {
  const pm = C.tithiSpans(C.dayStart(`${Y}-10-15`), C.dayStart(`${Y}-12-20`), [14]).find((s) => { const lm = C.lunarMonth((s.start + s.end) / 2); return lm.index === 7 && !lm.adhika; });
  if (!pm) return null;
  const day = C.observedDay(pm, ...CITY[lang]);
  const k = C.nakSpans(C.dayStart(day) - 3 * DAY, C.dayStart(day) + 3 * DAY, [2])[0];
  return { day, rows: { pournami: pm, krittika: k } };
}
function vaikunta(Y, lang) {
  const sp = C.tithiSpans(C.dayStart(`${Y}-12-01`), C.dayStart(`${Y + 1}-02-01`), [10]).find((s) => { const d = C.observedDay(s, ...CITY[lang]); return C.at(C.dayStart(d) + 6 * H).sunRasi === 8; });
  if (!sp) return null;
  const day = C.observedDay(sp, ...CITY[lang]);
  return { day, rows: { ekadasi: sp, parana: addIso(day, 1) } };
}
function makara(Y, lang) {
  const s = C.sankrantis(C.dayStart(`${Y + 1}-01-01`), C.dayStart(`${Y + 1}-02-01`)).find((x) => x.rasi === 9);
  if (!s) return null;
  const iso = C.istParts(s.ms).iso;
  const day = s.ms < sunsetMs(iso, lang) ? iso : addIso(iso, 1);
  return { day, rows: { sankranti: s.ms }, year: Y + 1 };
}
const FESTS = {
  ta: [['karthigai-deepam', karthigai], ['vaikunta-ekadasi', vaikunta], ['pongal', makara]],
  te: [['karthika-pournami', karthikaPournami], ['vaikunta-ekadasi', vaikunta], ['sankranti', makara]]
};
const FEST_PAIR = { 'karthigai-deepam': 'karthika-pournami', 'karthika-pournami': 'karthigai-deepam', pongal: 'sankranti', sankranti: 'pongal', 'vaikunta-ekadasi': 'vaikunta-ekadasi' };
// the next occurrence that is not more than 2 days in the past
function nextFest(fn, lang, today) {
  const y0 = Number(today.slice(0, 4));
  for (const Y of [y0 - 1, y0, y0 + 1]) { const f = fn(Y, lang); if (f && f.day >= addIso(today, -2)) return { ...f, year: f.year || Number(f.day.slice(0, 4)) }; }
  return null;
}

function monthLabel(lang, span, day) {
  if (lang === 'ta') return TXT.ta.tamil_months[C.at(C.dayStart(day) + 6 * H).sunRasi];
  const lm = C.lunarMonth((span.start + span.end) / 2);
  return (lm.adhika ? TXT.te.adhika + ' ' : '') + TXT.te.lunar_months[lm.index];
}
function specialFor(lang, kind, span, day) {
  const U = TXT[lang];
  if (lang === 'ta') return U.special[kind][C.at(C.dayStart(day) + 6 * H).sunRasi] || null;
  const lm = C.lunarMonth((span.start + span.end) / 2);
  return lm.adhika ? null : U.special[kind][lm.index] || null;
}
// every amavasya and pournami from FEST_START to about 13 months ahead
function lunarDays(lang, today) {
  const from = C.dayStart(FEST_START), to = C.dayStart(addIso(today, 400));
  const list = C.tithiSpans(from, to, [14, 29]).map((s) => ({ kind: s.tithi === 29 ? 'am' : 'pm', span: s, day: C.observedDay(s, ...CITY[lang]) }))
    .filter((x) => x.day >= FEST_START).sort((a, b) => a.day.localeCompare(b.day));
  const seen = {};
  for (const x of list) {
    const base = `${x.kind === 'am' ? 'amavasya' : 'pournami'}-${MONTH_EN[Number(x.day.slice(5, 7)) - 1]}-${x.day.slice(0, 4)}`;
    seen[base] = (seen[base] || 0) + 1;
    x.slug = seen[base] > 1 ? `${base}-${seen[base]}` : base;
    x.month = monthLabel(lang, x.span, x.day);
  }
  return list;
}
function dayRows(lang, iso) {
  const U = TXT[lang], s = C.sun(iso, ...CITY[lang]), T = I18N.TERMS[lang];
  const f = C.at(C.dayStart(iso) + (s.rise ?? 6) * H, ...CITY[lang]);
  return [[U.sunrise, hhmm(s.rise)], [U.sunset, hhmm(s.set)], [U.star_sunrise, T.nak[f.nakshatra.index]],
    [U.rahu, s.kalam ? `${hhmm(s.kalam.rahu[0])} – ${hhmm(s.kalam.rahu[1])}` : '–'], [U.yama, s.kalam ? `${hhmm(s.kalam.yama[0])} – ${hhmm(s.kalam.yama[1])}` : '–']];
}
const festAlt = (lang, slug, exists) => {
  const other = lang === 'ta' ? 'te' : 'ta', oslug = FEST_PAIR[slug] || slug;
  return `\n<link rel="alternate" hreflang="${lang}" href="${SITE.url}/festivals/${lang}/${slug}/">` + (exists(other, oslug) ? `\n<link rel="alternate" hreflang="${other}" href="${SITE.url}/festivals/${other}/${oslug}/">` : '');
};
const festLangMap = (lang, slug, exists) => { const other = lang === 'ta' ? 'te' : 'ta', oslug = FEST_PAIR[slug] || slug; return { [lang]: `festivals/${lang}/${slug}/`, [other]: exists(other, oslug) ? `festivals/${other}/${oslug}/` : `festivals/${other}/` }; };

function lunarPage(lang, x, prev, next, today, exists) {
  const U = TXT[lang], T = I18N.TERMS[lang], P = PALAN[lang];
  const pre = x.kind; // 'am' | 'pm'
  const year = x.day.slice(0, 4), date = longDate(lang, x.day);
  const vars = { month: monthName(lang, x.day), year, tmonth: x.month, date, start: moment(lang, x.span.start), end: moment(lang, x.span.end) };
  const title = fill(U[`${pre}_title`], vars), description = fill(U[`${pre}_desc`], vars);
  const special = specialFor(lang, pre, x.span, x.day);
  const isMonday = C.sun(x.day).weekday === 1;
  const rows = [[U.date, date], [U.tithi_start, moment(lang, x.span.start)], [U.tithi_end, moment(lang, x.span.end)], [U.tmonth, x.month], ...dayRows(lang, x.day)];
  const file = `festivals/${lang}/${x.slug}/index.html`, url = `${SITE.url}/festivals/${lang}/${x.slug}/`;
  const kindName = pre === 'am' ? U.amavasya : U.pournami;
  const body = `${crumbs([[SITE.name, toolHref(lang, 'index.html')], [U.fest_hub, `festivals/${lang}/`], [`${kindName} ${monthYear(lang, x.day)}`]])}
<section class="hero sign-hero" style="grid-template-columns:1fr"><div>
  <p class="sign-glyph" aria-hidden="true">${pre === 'am' ? '●︎' : '○︎'}</p>
  <h1>${esc(fill(U[`${pre}_h1`], vars))}</h1>
  <p class="lede"><strong>${esc(date)}</strong></p>
  <p class="lede">${esc(fill(U[`${pre}_lede`], vars))}</p>
</div></section>
${special ? `<aside class="special"><h2>${esc(special[0])}</h2><p>${esc(special[1])}</p></aside>` : ''}
${pre === 'am' && isMonday ? `<aside class="special"><p>${esc(U.monday_am)}</p></aside>` : ''}
<div class="sign-layout">
<article class="sign-main">
  <section class="block">${tableRows(rows)}<p class="note">${esc(U.city_note)}</p></section>
  ${pre === 'pm' && U.girivalam ? `<section class="block"><h2 class="h3">${esc(U.girivalam)}</h2><p class="overview">${esc(fill(U.girivalam_text, vars))}</p></section>` : ''}
  ${U[`${pre}_body`].map(([h, t]) => `<section class="block"><h2 class="h3">${esc(h)}</h2><p>${esc(t)}</p></section>`).join('\n  ')}
  <div class="ad-slot" data-ad="fest-mid"></div>
  <aside class="guide-cta"><p>${esc(I18N.UI[lang].panchang_sub)}</p><a class="btn" href="${toolHref(lang, 'panchangam.html')}">${esc(I18N.UI[lang].nav_panchang)}</a></aside>
</article>
<aside class="sign-side">
  <nav class="panel sign-list" aria-label="${esc(U.upcoming)}"><h2>${esc(kindName)}</h2><ul style="grid-template-columns:1fr">${[prev && [`← ${U.previous}: ${dayMonth(lang, prev.day)} ${prev.day.slice(0, 4)}`, prev.slug], next && [`${U.next}: ${dayMonth(lang, next.day)} ${next.day.slice(0, 4)} →`, next.slug]].filter(Boolean).map(([l, s]) => `<li><a href="festivals/${lang}/${s}/">${esc(l)}</a></li>`).join('')}<li><a href="festivals/${lang}/">${esc(U.fest_hub)}</a></li><li><a href="rasi-palan/${lang}/">${esc(P.h1)}</a></li></ul></nav>
</aside>
</div>`;
  const ld = [
    { '@type': 'Event', name: `${special ? special[0] : kindName} ${monthYear(lang, x.day)}`, startDate: new Date(x.span.start).toISOString(), endDate: new Date(x.span.end).toISOString(), eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled', location: { '@type': 'VirtualLocation', url }, description, inLanguage: lang, organizer: org, image: `${SITE.url}/icons/og.png` },
    crumbsLd([[SITE.name, `${SITE.url}/`], [U.fest_hub, `${SITE.url}/festivals/${lang}/`], [title, url]])
  ];
  return { file, url, lastmod: x.day < today ? x.day : today, html: page({ lang, file, title, description, body, ld, alternates: festAlt(lang, x.slug, exists), langMap: festLangMap(lang, x.slug, exists),
    keywords: `${kindName} ${monthName(lang, x.day)} ${year}, ${x.month} ${kindName}, ${kindName} ${year}, ${pre === 'am' ? 'amavasya' : 'pournami'} ${MONTH_EN[Number(x.day.slice(5, 7)) - 1]} ${year}` }) };
}

function festPage(lang, slug, f, today, exists) {
  const U = TXT[lang], F = U.fest[slug];
  const date = longDate(lang, f.day), vars = { year: f.year, date };
  const title = fill(F.title, vars), description = fill(F.desc, vars);
  const rows = [[TXT[lang].date, date]];
  for (const [k, label] of Object.entries(F.rows)) {
    const v = f.rows[k] ?? (k === 'thai1' || k === 'festday' ? f.day : null);
    if (v == null) continue;
    rows.push([label, typeof v === 'string' ? longDate(lang, v) : typeof v === 'number' ? moment(lang, v) : range(lang, v)]);
  }
  rows.push(...dayRows(lang, f.day));
  const days = F.days ? `<section class="block"><div class="table-wrap"><table><tbody>${F.days.map((d, i) => `<tr><th scope="row">${esc(d)}</th><td><strong>${esc(longDate(lang, addIso(f.day, i - 1)))}</strong><br>${esc(F.days_text[i])}</td></tr>`).join('')}</tbody></table></div></section>` : '';
  const file = `festivals/${lang}/${slug}/index.html`, url = `${SITE.url}/festivals/${lang}/${slug}/`;
  const body = `${crumbs([[SITE.name, toolHref(lang, 'index.html')], [U.fest_hub, `festivals/${lang}/`], [fill(F.h1, vars)]])}
<section class="hero sign-hero" style="grid-template-columns:1fr"><div>
  <p class="sign-glyph" aria-hidden="true">✹︎</p>
  <h1>${esc(fill(F.h1, vars))}</h1>
  <p class="lede"><strong>${esc(date)}</strong></p>
  <p class="lede">${esc(fill(F.lede, vars))}</p>
</div></section>
<div class="sign-layout">
<article class="sign-main">
  <section class="block">${tableRows(rows)}<p class="note">${esc(U.city_note)}</p></section>
  ${days}
  ${F.body.map(([h, t]) => `<section class="block"><h2 class="h3">${esc(h)}</h2><p>${esc(t)}</p></section>`).join('\n  ')}
  <div class="ad-slot" data-ad="fest-mid"></div>
  <aside class="guide-cta"><p>${esc(I18N.UI[lang].panchang_sub)}</p><a class="btn" href="${toolHref(lang, 'panchangam.html')}">${esc(I18N.UI[lang].nav_panchang)}</a></aside>
</article>
<aside class="sign-side">
  <nav class="panel sign-list" aria-label="${esc(U.festivals)}"><h2>${esc(U.festivals)}</h2><ul style="grid-template-columns:1fr">${FESTS[lang].map(([s]) => `<li><a href="festivals/${lang}/${s}/"${s === slug ? ' aria-current="page"' : ''}>${esc(fill(U.fest[s].h1, { year: '' }).trim())}</a></li>`).join('')}<li><a href="festivals/${lang}/">${esc(U.fest_hub)}</a></li></ul></nav>
</aside>
</div>`;
  const ld = [
    { '@type': 'Event', name: fill(F.h1, vars), startDate: f.day, endDate: f.day, eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled', location: { '@type': 'Place', name: lang === 'ta' ? 'Tamil Nadu, India' : 'Andhra Pradesh and Telangana, India', address: { '@type': 'PostalAddress', addressCountry: 'IN' } }, description, inLanguage: lang, organizer: org, image: `${SITE.url}/icons/og.png` },
    crumbsLd([[SITE.name, `${SITE.url}/`], [U.fest_hub, `${SITE.url}/festivals/${lang}/`], [fill(F.h1, vars), url]])
  ];
  return { file, url, html: page({ lang, file, title, description, body, ld, alternates: festAlt(lang, slug, exists), langMap: festLangMap(lang, slug, exists), keywords: `${fill(F.h1, vars)}, ${slug.replace(/-/g, ' ')} ${f.year}` }) };
}

function festHub(lang, fests, lunar, today) {
  const U = TXT[lang];
  const years = `${today.slice(0, 4)}–${Number(today.slice(0, 4)) + 1}`;
  const upcoming = lunar.filter((x) => x.day >= today);
  const list = (kind) => `<div class="table-wrap"><table><thead><tr><th scope="col">${esc(U.date)}</th><th scope="col">${esc(U.tmonth)}</th></tr></thead><tbody>${upcoming.filter((x) => x.kind === kind).map((x) => `<tr><th scope="row"><a href="festivals/${lang}/${x.slug}/">${esc(longDate(lang, x.day))}</a></th><td>${esc(x.month)}</td></tr>`).join('')}</tbody></table></div>`;
  const file = `festivals/${lang}/index.html`, url = `${SITE.url}/festivals/${lang}/`;
  const title = fill(U.fest_hub_title, { years });
  const body = `${crumbs([[SITE.name, toolHref(lang, 'index.html')], [U.fest_hub]])}
<section class="hero sign-hero" style="grid-template-columns:1fr"><div><h1>${esc(title)}</h1><p class="lede">${esc(U.fest_hub_desc)}</p></div></section>
<section class="block"><h2 class="h3">${esc(U.festivals)}</h2><ul class="guide-list">${fests.map(({ slug, f }) => `<li class="guide-card"><a href="festivals/${lang}/${slug}/"><strong>${esc(fill(U.fest[slug].h1, { year: f.year }))}</strong><span>${esc(longDate(lang, f.day))}</span></a></li>`).join('')}</ul></section>
<div class="tables">
<section class="block"><h2 class="h3">${esc(fill(U.amavasya_list, { years }))}</h2>${list('am')}</section>
<section class="block"><h2 class="h3">${esc(fill(U.pournami_list, { years }))}</h2>${list('pm')}</section>
</div>
<p class="note">${esc(U.city_note)}</p>`;
  const other = lang === 'ta' ? 'te' : 'ta';
  return { file, url, html: page({ lang, file, title, description: U.fest_hub_desc, body, ld: [crumbsLd([[SITE.name, `${SITE.url}/`], [U.fest_hub, url]])],
    alternates: `\n<link rel="alternate" hreflang="${lang}" href="${url}">\n<link rel="alternate" hreflang="${other}" href="${SITE.url}/festivals/${other}/">`, langMap: { [lang]: `festivals/${lang}/`, [other]: `festivals/${other}/` } }) };
}

// ---------------------------------------------------------------- build all
export function buildPages(root, today) {
  const urls = [];
  const out = (p, lastmod = today) => { writePage(root, p.file, p.html); urls.push([p.url, p.lastmod || lastmod]); };
  for (const lang of RASI_LANGS) {
    for (const d of ['rasi', 'nakshatra']) { const dir = join(root, d, lang); if (existsSync(dir)) rmSync(dir, { recursive: true, force: true }); }
    out(rasiHub(lang, today));
    RASI_SLUG.forEach((_, r) => out(rasiPage(lang, r, today)));
    out(nakHub(lang));
    NAK_SLUG.forEach((_, n) => out(nakPage(lang, n, today)));
  }
  // festivals: work out every page first, so the Tamil and Telugu versions can point at each other
  const plan = {};
  for (const lang of FEST_LANGS) {
    plan[lang] = { fests: FESTS[lang].map(([slug, fn]) => ({ slug, f: nextFest(fn, lang, today) })).filter((x) => x.f), lunar: lunarDays(lang, today) };
  }
  const exists = (lang, slug) => !!plan[lang] && (plan[lang].fests.some((x) => x.slug === slug) || plan[lang].lunar.some((x) => x.slug === slug));
  for (const lang of FEST_LANGS) {
    const { fests, lunar } = plan[lang];
    out(festHub(lang, fests, lunar, today));
    for (const { slug, f } of fests) out(festPage(lang, slug, f, today, exists));
    for (const kind of ['am', 'pm']) {
      const xs = lunar.filter((x) => x.kind === kind);
      xs.forEach((x, i) => out(lunarPage(lang, x, xs[i - 1], xs[i + 1], today, exists)));
    }
  }
  return urls;
}

// Links for other pages
export const extraFooter = {
  ta: [['rasi/ta/', TXT.ta.rasi_hub], ['nakshatra/ta/', TXT.ta.nak_hub], ['festivals/ta/', TXT.ta.fest_hub]],
  te: [['festivals/te/', TXT.te.fest_hub]]
};
export const rasiPageHref = (lang, r) => (RASI_LANGS.includes(lang) ? `rasi/${lang}/${RASI_SLUG[r]}/` : null);
export const rasiPageLabel = (lang, r) => (RASI_LANGS.includes(lang) ? fill(TXT[lang].see_rasi, { rasi: I18N.TERMS[lang].rasi[r] }) : null);
