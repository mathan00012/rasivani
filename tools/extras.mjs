// Builds the Rahu kalam finder (+ one page per city), the Indian calendars page and the Learn explainers.
// Called from tools/build.mjs (which runs on every deploy and every night through tools/daily.mjs), so the
// times and dates written into the pages are always today's. Every page carries its key facts as plain text,
// FAQPage + BreadcrumbList structured data, and is listed in the sitemap and llms.txt.
// Text: content/extras/<lang>.mjs. Explainers: content/learn/<slug>.mjs (see content/learn/README.md).
import { readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
await import('../js/astro.js'); await import('../js/i18n.js');
await import('../js/chartstyles.js'); await import('../js/kalam.js'); await import('../js/calendars.js');
const { I18N, Kalam: K, Calendars: C, ChartStyles: CS } = globalThis;

// Languages with full text (content/extras/<lang>.mjs); the others link to the English pages.
export const LANGS = ['en', 'ta', 'te', 'hi', 'kn', 'ml'].filter((l) => existsSync(join(root, 'content', 'extras', `${l}.mjs`)));
const TXT = {};
for (const l of LANGS) TXT[l] = (await import(`../content/extras/${l}.mjs`)).default;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : `{${k}}`));
const strip = (h) => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const pre = (l) => (l === 'en' ? '' : `${l}/`);
export const kalamHref = (l) => `${pre(LANGS.includes(l) ? l : 'en')}rahu-kalam/`;
export const calHref = (l) => `${pre(LANGS.includes(l) ? l : 'en')}calendar/`;
export const learnHref = (l) => `learn/${LANGS.includes(l) ? l : 'en'}/`;
const T = (l) => TXT[LANGS.includes(l) ? l : 'en'];

// ---------- Cities ----------
// [slug, lat, lon, zone ('' = India), {lang: local name}]
const CITY = {
  chennai: [13.0827, 80.2707, '', { en: 'Chennai', ta: 'சென்னை', te: 'చెన్నై', kn: 'ಚೆನ್ನೈ', ml: 'ചെന്നൈ', hi: 'चेन्नई' }],
  madurai: [9.9252, 78.1198, '', { en: 'Madurai', ta: 'மதுரை' }],
  coimbatore: [11.0168, 76.9558, '', { en: 'Coimbatore', ta: 'கோயம்புத்தூர்' }],
  tiruchirappalli: [10.7905, 78.7047, '', { en: 'Tiruchirappalli', ta: 'திருச்சிராப்பள்ளி' }],
  salem: [11.6643, 78.146, '', { en: 'Salem', ta: 'சேலம்' }],
  tirunelveli: [8.7139, 77.7567, '', { en: 'Tirunelveli', ta: 'திருநெல்வேலி' }],
  puducherry: [11.9416, 79.8083, '', { en: 'Puducherry', ta: 'புதுச்சேரி' }],
  vellore: [12.9165, 79.1325, '', { en: 'Vellore', ta: 'வேலூர்' }],
  jaffna: [9.6615, 80.0255, 'Asia/Colombo', { en: 'Jaffna', ta: 'யாழ்ப்பாணம்' }],
  colombo: [6.9271, 79.8612, 'Asia/Colombo', { en: 'Colombo', ta: 'கொழும்பு' }],
  singapore: [1.3521, 103.8198, 'Asia/Singapore', { en: 'Singapore', ta: 'சிங்கப்பூர்' }],
  'kuala-lumpur': [3.139, 101.6869, 'Asia/Kuala_Lumpur', { en: 'Kuala Lumpur', ta: 'கோலாலம்பூர்' }],
  hyderabad: [17.385, 78.4867, '', { en: 'Hyderabad', te: 'హైదరాబాద్', hi: 'हैदराबाद', kn: 'ಹೈದರಾಬಾದ್' }],
  visakhapatnam: [17.6868, 83.2185, '', { en: 'Visakhapatnam', te: 'విశాఖపట్నం' }],
  vijayawada: [16.5062, 80.648, '', { en: 'Vijayawada', te: 'విజయవాడ' }],
  tirupati: [13.6288, 79.4192, '', { en: 'Tirupati', te: 'తిరుపతి' }],
  warangal: [17.9689, 79.5941, '', { en: 'Warangal', te: 'వరంగల్' }],
  guntur: [16.3067, 80.4365, '', { en: 'Guntur', te: 'గుంటూరు' }],
  nellore: [14.4426, 79.9865, '', { en: 'Nellore', te: 'నెల్లూరు' }],
  kurnool: [15.8281, 78.0373, '', { en: 'Kurnool', te: 'కర్నూలు' }],
  bengaluru: [12.9716, 77.5946, '', { en: 'Bengaluru', kn: 'ಬೆಂಗಳೂರು', ta: 'பெங்களூரு', te: 'బెంగళూరు', hi: 'बेंगलुरु' }],
  mysuru: [12.2958, 76.6394, '', { en: 'Mysuru', kn: 'ಮೈಸೂರು' }],
  mangaluru: [12.9141, 74.856, '', { en: 'Mangaluru', kn: 'ಮಂಗಳೂರು' }],
  hubballi: [15.3647, 75.124, '', { en: 'Hubballi', kn: 'ಹುಬ್ಬಳ್ಳಿ' }],
  belagavi: [15.8497, 74.4977, '', { en: 'Belagavi', kn: 'ಬೆಳಗಾವಿ' }],
  udupi: [13.3409, 74.7421, '', { en: 'Udupi', kn: 'ಉಡುಪಿ' }],
  thiruvananthapuram: [8.5241, 76.9366, '', { en: 'Thiruvananthapuram', ml: 'തിരുവനന്തപുരം' }],
  kochi: [9.9312, 76.2673, '', { en: 'Kochi', ml: 'കൊച്ചി' }],
  kozhikode: [11.2588, 75.7804, '', { en: 'Kozhikode', ml: 'കോഴിക്കോട്' }],
  thrissur: [10.5276, 76.2144, '', { en: 'Thrissur', ml: 'തൃശൂർ' }],
  kannur: [11.8745, 75.3704, '', { en: 'Kannur', ml: 'കണ്ണൂർ' }],
  kottayam: [9.5916, 76.5222, '', { en: 'Kottayam', ml: 'കോട്ടയം' }],
  dubai: [25.2048, 55.2708, 'Asia/Dubai', { en: 'Dubai', ml: 'ദുബായ്', ta: 'துபாய்', hi: 'दुबई' }],
  'new-delhi': [28.6139, 77.209, '', { en: 'New Delhi', hi: 'नई दिल्ली', ta: 'புது தில்லி', te: 'న్యూఢిల్లీ' }],
  mumbai: [19.076, 72.8777, '', { en: 'Mumbai', hi: 'मुंबई', te: 'ముంబై' }],
  kolkata: [22.5726, 88.3639, '', { en: 'Kolkata', hi: 'कोलकाता' }],
  lucknow: [26.8467, 80.9462, '', { en: 'Lucknow', hi: 'लखनऊ' }],
  varanasi: [25.3176, 82.9739, '', { en: 'Varanasi', hi: 'वाराणसी' }],
  jaipur: [26.9124, 75.7873, '', { en: 'Jaipur', hi: 'जयपुर' }],
  patna: [25.5941, 85.1376, '', { en: 'Patna', hi: 'पटना' }],
  bhopal: [23.2599, 77.4126, '', { en: 'Bhopal', hi: 'भोपाल' }],
  london: [51.5074, -0.1278, 'Europe/London', { en: 'London' }],
  'new-york': [40.7128, -74.006, 'America/New_York', { en: 'New York' }],
  toronto: [43.6532, -79.3832, 'America/Toronto', { en: 'Toronto' }],
  sydney: [-33.8688, 151.2093, 'Australia/Sydney', { en: 'Sydney' }]
};
const CITIES_BY_LANG = {
  en: ['chennai', 'bengaluru', 'hyderabad', 'mumbai', 'new-delhi', 'kolkata', 'kochi', 'singapore', 'kuala-lumpur', 'dubai', 'colombo', 'london', 'new-york', 'toronto', 'sydney'],
  ta: ['chennai', 'madurai', 'coimbatore', 'tiruchirappalli', 'salem', 'tirunelveli', 'puducherry', 'vellore', 'bengaluru', 'jaffna', 'colombo', 'singapore', 'kuala-lumpur', 'dubai'],
  te: ['hyderabad', 'visakhapatnam', 'vijayawada', 'tirupati', 'warangal', 'guntur', 'nellore', 'kurnool', 'chennai', 'bengaluru'],
  kn: ['bengaluru', 'mysuru', 'mangaluru', 'hubballi', 'belagavi', 'udupi', 'chennai', 'hyderabad'],
  ml: ['thiruvananthapuram', 'kochi', 'kozhikode', 'thrissur', 'kannur', 'kottayam', 'chennai', 'dubai'],
  hi: ['new-delhi', 'lucknow', 'varanasi', 'jaipur', 'patna', 'bhopal', 'mumbai', 'hyderabad', 'bengaluru', 'chennai', 'dubai']
};
const REF = { en: 'chennai', ta: 'chennai', te: 'hyderabad', kn: 'bengaluru', ml: 'kochi', hi: 'new-delhi' };
const cityName = (slug, l) => CITY[slug][3][l] || CITY[slug][3].en;

// ---------- Today (India time) ----------
const nowIst = new Date(Date.now() + 5.5 * 3600000);
const TODAY = { y: nowIst.getUTCFullYear(), m: nowIst.getUTCMonth() + 1, d: nowIst.getUTCDate() };
const TODAY_ISO = C.iso(TODAY);
function cityWeek(slug) {
  const [lat, lon, zone] = CITY[slug];
  const tz = zone ? K.zoneOffset(zone, TODAY.y, TODAY.m, TODAY.d) : 5.5;
  return K.week(TODAY.y, TODAY.m, TODAY.d, lat, lon, tz, zone || null, 7);
}

// ---------- Shared bits ----------
function jsonld(obj) { return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`; }
function faqLd(faq) {
  return { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) };
}
function crumbs(SITE, items) {
  return { '@type': 'BreadcrumbList', itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url })) };
}
function sectionsHtml(sections, vars) {
  return sections.map((s) => `<section class="block prose-block"><h2>${esc(fill(s.h, vars))}</h2>${fill(s.html, vars)}</section>`).join('\n');
}
function faqHtml(lang, faq, vars) {
  return `<section class="block prose-block faq"><h2>${esc(T(lang).faq_h)}</h2>${faq.map(([q, a]) => `<details><summary>${esc(fill(q, vars))}</summary><p>${esc(fill(a, vars))}</p></details>`).join('')}</section>`;
}
function sourcesHtml(lang, list) {
  return `<section class="block prose-block sources"><h2>${esc(T(lang).sources_h)}</h2><ol>${list.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></section>`;
}
const langMapFor = (fn) => Object.fromEntries(I18N.LANGS.map((l) => [l.code, fn(LANGS.includes(l.code) ? l.code : 'en')]));
const alternatesFor = (SITE, fn) => LANGS.map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/${fn(l)}">`).join('') + `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/${fn('en')}">`;
const fmtDate = (lang, k) => new Intl.DateTimeFormat(lang === 'en' ? 'en-IN' : `${lang}-IN`, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(Date.UTC(k.y, k.m - 1, k.d)));

// ---------- Hooks used by tools/build.mjs ----------
// Header link (every page), footer links, home-page cards, and the chart-style picker for the birth chart form.
export function navLink(lang, page) {
  const label = (I18N.UI[lang] && I18N.UI[lang].rahukalam) || 'Rahu kalam';
  return `<a href="${kalamHref(lang)}"${page === 'kalam' ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
}
export function footLinks(lang) {
  const t = T(lang).nav;
  return `<a href="${calHref(lang)}">${esc(t.cal)}</a><a href="${learnHref(lang)}">${esc(t.learn)}</a>`;
}
export function serviceCards(lang) {
  const t = T(lang);
  return `<a href="${kalamHref(lang)}"><h3>${esc(t.kalam.h1)}</h3><p>${esc(t.kalam.lede)}</p></a>
  <a href="${calHref(lang)}"><h3>${esc(t.cal.h1)}</h3><p>${esc(t.cal.lede)}</p></a>`;
}
export function exploreLinks(lang) { return [[kalamHref(lang), (I18N.UI[lang] && I18N.UI[lang].rahukalam) || 'Rahu kalam'], [calHref(lang), T(lang).nav.cal]]; }
export function chartPicker(lang) {
  return `${CS.picker(lang, 'south')}<script defer src="js/chartstyles.js"></script>`;
}

// ---------- Rahu kalam pages ----------
function kalamPage({ SITE, layout, write }, lang, slug, isCity) {
  const t = T(lang).kalam;
  const days = cityWeek(slug);
  const k = days[0];
  const ap = K.ampm(lang);
  const city = cityName(slug, lang);
  const ch = cityWeek('chennai')[0], dl = cityWeek('new-delhi')[0];
  const vars = {
    city, range: K.range(k.rahu, ap), yama: K.range(k.yama, ap), gulika: K.range(k.gulika, ap), rise: K.hhmm(k.sunrise, ap), set: K.hhmm(k.sunset, ap),
    date: fmtDate(lang, TODAY), rise_chennai: K.hhmm(ch.sunrise, ap), rise_delhi: K.hhmm(dl.sunrise, ap), rahu_chennai: K.range(ch.rahu, ap), rahu_delhi: K.range(dl.rahu, ap)
  };
  const path = isCity ? `${kalamHref(lang)}${slug}` : kalamHref(lang);
  const file = isCity ? `${pre(lang)}rahu-kalam/${slug}.html` : `${pre(lang)}rahu-kalam/index.html`;
  const depth = file.split('/').length - 1;
  const title = isCity ? fill(t.city_title, vars) : t.title;
  const desc = isCity ? fill(t.city_desc, vars) : t.desc;
  const [lat, lon, zone] = CITY[slug];
  const cityJson = JSON.stringify({ name: city, sub: '', lat, lon, tz: k.tz, ...(zone ? { zone } : {}) });
  const others = CITIES_BY_LANG[lang].filter((c) => c !== slug);
  const W = I18N.TERMS[lang].weekday;
  const ld = jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${SITE.url}/${path}#page`, url: `${SITE.url}/${path}`, name: strip(title), description: desc, inLanguage: lang, dateModified: TODAY_ISO, isPartOf: { '@id': `${SITE.url}/#website` },
      about: [{ '@type': 'Thing', name: 'Rahu kalam' }, { '@type': 'Place', name: city, geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lon } }] },
    faqLd(t.faq.map(([q, a]) => [fill(q, vars), fill(a, vars)])),
    crumbs(SITE, [[SITE.name, `${SITE.url}/`], [t.h1, `${SITE.url}/${kalamHref(lang)}`], ...(isCity ? [[city, `${SITE.url}/${path}`]] : [])])
  ] });
  const body = `<section class="hero kl-hero">
  <div>
    <nav class="crumbs" aria-label="Breadcrumb"><a href="${pre(lang) || './'}">${esc(SITE.name)}</a> › ${isCity ? `<a href="${kalamHref(lang)}">${esc(t.h1)}</a> › ${esc(city)}` : esc(t.h1)}</nav>
    <h1>${esc(isCity ? fill(t.city_h1, vars) : t.h1)}</h1>
    <p class="lede">${esc(isCity ? fill(t.city_lede, vars) : t.lede)}</p>
    <p class="kl-summary"><strong>${esc(fill(t.summary, { ...vars, city: `${city} (${W[k.weekday]}, ${vars.date})` }))}</strong></p>
  </div>
  <form id="kalam-form" class="panel" novalidate${isCity ? ` data-city="${esc(cityJson)}"` : ` data-default="${esc(cityJson)}"`}>
    <p class="error" id="kalam-error" role="alert" hidden></p>
    <div class="field"><label for="k-date">${esc(K.text(lang, 'date'))}</label><input id="k-date" type="date" value="${TODAY_ISO}"></div>
    <div id="kalam-place"></div>
    <button class="btn" type="submit">${esc(K.text(lang, 'show'))}</button>
  </form>
</section>
<section id="kalam-result" class="result kl-result" aria-live="polite">${K.resultHtml(lang, city, days, null)}</section>
<div class="ad-slot" data-ad="kalam-mid"></div>
<nav class="block city-links" aria-label="${esc(t.cities_h)}"><h2>${esc(t.cities_h)}</h2><p>${others.map((c) => `<a href="${kalamHref(lang)}${c}">${esc(cityName(c, lang))}</a>`).join('')}</p></nav>
${sectionsHtml(t.sections, vars)}
${faqHtml(lang, t.faq, vars)}
${sourcesHtml(lang, t.sources)}
<p class="note">${esc(fill(T(lang).updated, { date: vars.date }))}</p>`;
  write(file, layout({
    page: 'kalam', file: file.replace(/index\.html$/, ''), lang, base: '../'.repeat(depth), fixed: true, title: esc(title), description: desc, keywords: t.keywords,
    alternates: alternatesFor(SITE, (l) => (isCity ? `${kalamHref(l)}${slug}` : kalamHref(l))),
    langMap: langMapFor((l) => (isCity && CITIES_BY_LANG[l].includes(slug) ? `${kalamHref(l)}${slug}` : kalamHref(l))),
    head: `${ld}<script defer src="js/kalam.js"></script>`, body
  }));
  return path;
}

// ---------- Calendars page ----------
const CAL_PLACE = { en: 'chennai', ta: 'chennai', te: 'hyderabad', kn: 'bengaluru', ml: 'kochi', hi: 'new-delhi' };
let FEST = null;
function calPage({ SITE, layout, write }, lang) {
  const t = T(lang).cal, F = T(lang).fest;
  const [lat, lon] = CITY[CAL_PLACE[lang]]; const place = { lat, lon, tz: 5.5 };
  const info = C.dayInfo(TODAY, place);
  const N = C.names(lang);
  const rasi = I18N.TERMS[lang].rasi;
  const W = I18N.TERMS[lang].weekday;
  FEST = FEST || C.festivals(TODAY, 366);
  const festName = (f) => {
    if (f.key.startsWith('sankranti_')) {
      const r = +f.key.split('_')[1];
      const extra = F.extra && F.extra[r];
      return `${fill(F.sankranti, { rasi: rasi[r] })} · ${fill(F.month_starts, { month: N.tamil[r] })}${extra ? ` · ${extra}` : ''}`;
    }
    return F[f.key] || f.key;
  };
  const festRows = FEST.map((f) => `<tr><th scope="row">${esc(fmtDate(lang, f.date))}<small>${esc(W[new Date(Date.UTC(f.date.y, f.date.m - 1, f.date.d)).getUTCDay()])}</small></th><td>${esc(festName(f))}</td></tr>`).join('');
  // Months: the next 12 sankrantis (Tamil-rule dates at the page's city)
  const rows = []; let ms = Date.UTC(TODAY.y, TODAY.m - 1, TODAY.d) - 5.5 * 3600000;
  for (let i = 0; i < 12; i++) {
    const s = C.sankrantiAfter(ms); ms = s.ms + 3600000;
    const k = C.solarDate(C.addDays({ y: new Date(s.ms + 5.5 * 3600000).getUTCFullYear(), m: new Date(s.ms + 5.5 * 3600000).getUTCMonth() + 1, d: new Date(s.ms + 5.5 * 3600000).getUTCDate() }, 1), place, 1).start;
    rows.push({ r: s.rasi, k });
  }
  rows.sort((a, b) => a.r - b.r);
  const cols = t.months_cols;
  const monthTable = `<div class="table-wrap"><table class="cal-months"><thead><tr>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(({ r, k }) => `<tr><th scope="row">${esc(rasi[r])}</th><td class="num">${esc(fmtDate(lang, k))}</td><td>${esc(N.tamil[r])}</td><td>${esc(N.mal[r])}</td><td>${esc(N.lunar[(r + 1) % 12])}</td></tr>`).join('')}</tbody></table></div>`;
  const path = calHref(lang), file = `${pre(lang)}calendar/index.html`, depth = file.split('/').length - 1;
  const ld = jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${SITE.url}/${path}#page`, url: `${SITE.url}/${path}`, name: strip(t.title), description: t.desc, inLanguage: lang, dateModified: TODAY_ISO, isPartOf: { '@id': `${SITE.url}/#website` } },
    { '@type': 'ItemList', name: t.fest_h || C.text(lang, 'fest_h'), itemListElement: FEST.filter((f) => !f.key.startsWith('sankranti_')).map((f, i) => ({ '@type': 'ListItem', position: i + 1, name: `${festName(f)}: ${f.iso}` })) },
    faqLd(t.faq),
    crumbs(SITE, [[SITE.name, `${SITE.url}/`], [t.h1, `${SITE.url}/${path}`]])
  ] });
  const body = `<section class="hero cal-hero">
  <div>
    <nav class="crumbs" aria-label="Breadcrumb"><a href="${pre(lang) || './'}">${esc(SITE.name)}</a> › ${esc(t.h1)}</nav>
    <h1>${esc(t.h1)}</h1>
    <p class="lede">${esc(t.lede)}</p>
  </div>
  <form id="cal-form" class="panel" novalidate data-place="${esc(JSON.stringify(place))}" data-built="${TODAY_ISO}">
    <div class="field"><label for="cal-date">${esc(C.text(lang, 'date'))}</label><input id="cal-date" type="date" value="${TODAY_ISO}"></div>
    <button class="btn" type="submit">${esc(C.text(lang, 'show'))}</button>
  </form>
</section>
<section class="block"><h2>${esc(t.today_h)}</h2><div id="cal-result">${C.tableHtml(lang, info)}</div></section>
<section class="block"><h2>${esc(C.text(lang, 'fest_h'))}</h2><div class="table-wrap"><table class="cal-fest"><tbody>${festRows}</tbody></table></div><p class="note">${esc(C.text(lang, 'fest_note'))}</p></section>
<div class="ad-slot" data-ad="cal-mid"></div>
${sectionsHtml(t.sections.slice(0, 1), {})}
<section class="block"><h2>${esc(t.months_h)}</h2>${monthTable}</section>
${sectionsHtml(t.sections.slice(1), {})}
${faqHtml(lang, t.faq, {})}
${sourcesHtml(lang, t.sources)}
<p class="note">${esc(fill(T(lang).updated, { date: fmtDate(lang, TODAY) }))}</p>`;
  write(file, layout({
    page: 'calendar', file: file.replace(/index\.html$/, ''), lang, base: '../'.repeat(depth), fixed: true, title: esc(t.title), description: t.desc, keywords: t.keywords,
    alternates: alternatesFor(SITE, calHref), langMap: langMapFor(calHref), head: `${ld}<script defer src="js/calendars.js"></script>`, body
  }));
  return path;
}

// ---------- Learn (explainers that go with the cartoon videos) ----------
async function loadLearn() {
  const dir = join(root, 'content', 'learn');
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.mjs')).sort()) {
    const a = (await import(pathToFileURL(join(dir, f)).href)).default;
    if (a && a.slug && (!a.publish || a.publish <= (process.env.LEARN_PREVIEW_UNTIL || TODAY_ISO))) out.push(a);
  }
  return out.sort((x, y) => (x.publish < y.publish ? 1 : -1));
}
const ytId = (u) => { const m = String(u || '').match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})/); return m ? m[1] : ''; };
function learnPage({ SITE, layout, write }, a, lang) {
  const L = a.text[lang], t = T(lang);
  const path = `learn/${lang}/${a.slug}/`, file = `${path}index.html`;
  const vid = ytId(a.video && (a.video[lang] || a.video.en));
  const tool = a.tool === 'kalam' ? kalamHref(lang) : a.tool === 'calendar' ? calHref(lang) : a.tool === 'match' ? `${pre(lang)}porutham` : a.tool === 'panch' ? `${pre(lang)}panchangam` : (pre(lang) || './');
  const langs = LANGS.filter((l) => a.text[l]);
  const ld = jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', '@id': `${SITE.url}/${path}#article`, headline: L.h1, description: L.desc, inLanguage: lang, datePublished: a.publish, dateModified: a.updated || a.publish,
      author: { '@id': `${SITE.url}/#org` }, publisher: { '@id': `${SITE.url}/#org` }, mainEntityOfPage: `${SITE.url}/${path}`, image: `${SITE.url}/icons/og.png`,
      citation: (L.sources || []).map((s) => ({ '@type': 'CreativeWork', name: s })) },
    ...(vid ? [{ '@type': 'VideoObject', name: L.h1, description: L.desc, thumbnailUrl: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`, uploadDate: a.publish, embedUrl: `https://www.youtube.com/embed/${vid}`, contentUrl: `https://www.youtube.com/watch?v=${vid}` }] : []),
    ...(L.faq && L.faq.length ? [faqLd(L.faq)] : []),
    crumbs(SITE, [[SITE.name, `${SITE.url}/`], [t.learn.hub_h1, `${SITE.url}/${learnHref(lang)}`], [L.h1, `${SITE.url}/${path}`]])
  ] });
  const body = `<article class="prose learn">
<nav class="crumbs" aria-label="Breadcrumb"><a href="${pre(lang) || './'}">${esc(SITE.name)}</a> › <a href="${learnHref(lang)}">${esc(t.learn.hub_h1)}</a></nav>
<h1>${esc(L.h1)}</h1>
<p class="lede">${esc(L.lede)}</p>
${L.key ? `<div class="key-facts"><ul>${L.key.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
${vid ? `<figure class="video"><iframe src="https://www.youtube-nocookie.com/embed/${vid}" title="${esc(L.h1)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><figcaption>${esc(t.learn.watch)}</figcaption></figure>` : ''}
${(L.sections || []).map((s) => `<h2>${esc(s.h)}</h2>${s.html}`).join('\n')}
<p><a class="btn" style="width:auto;display:inline-flex;text-decoration:none" href="${tool}">${esc(t.learn.related)}: ${esc(L.cta || L.h1)}</a></p>
</article>
${L.faq && L.faq.length ? faqHtml(lang, L.faq, {}) : ''}
${L.sources ? sourcesHtml(lang, L.sources) : ''}`;
  write(file, layout({
    page: 'learn', file: path, lang, base: '../../../', fixed: true, title: esc(`${L.title || L.h1} | ${SITE.name}`), description: L.desc, keywords: L.keywords || '',
    alternates: langs.map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/learn/${l}/${a.slug}/">`).join('') + `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/learn/${langs.includes('en') ? 'en' : langs[0]}/${a.slug}/">`,
    langMap: Object.fromEntries(I18N.LANGS.map((l) => [l.code, a.text[l.code] ? `learn/${l.code}/${a.slug}/` : learnHref(l.code)])),
    head: ld, body
  }));
  return path;
}
function learnHub({ SITE, layout, write }, lang, list) {
  const t = T(lang);
  const items = list.filter((a) => a.text[lang]);
  const tools = [[kalamHref(lang), t.kalam.h1, t.kalam.lede], [calHref(lang), t.cal.h1, t.cal.lede]];
  const path = learnHref(lang), file = `${path}index.html`;
  const ld = jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': `${SITE.url}/${path}#page`, url: `${SITE.url}/${path}`, name: strip(t.learn.hub_title), description: t.learn.hub_desc, inLanguage: lang, isPartOf: { '@id': `${SITE.url}/#website` } },
    { '@type': 'ItemList', itemListElement: [...items.map((a) => [`learn/${lang}/${a.slug}/`, a.text[lang].h1]), ...tools.map(([h, n]) => [h, n])].map(([h, n], i) => ({ '@type': 'ListItem', position: i + 1, name: n, url: `${SITE.url}/${h}` })) }
  ] });
  const body = `<section class="hero" style="grid-template-columns:1fr;padding-bottom:16px"><div><h1>${esc(t.learn.hub_h1)}</h1><p class="lede">${esc(t.learn.hub_lede)}</p></div></section>
<section class="services learn-list">${items.map((a) => `<a href="learn/${lang}/${a.slug}/"><h3>${esc(a.text[lang].h1)}</h3><p>${esc(a.text[lang].lede)}</p></a>`).join('')}${tools.map(([h, n, d]) => `<a href="${h}"><h3>${esc(n)}</h3><p>${esc(d)}</p></a>`).join('')}</section>`;
  write(file, layout({
    page: 'learn', file: path, lang, base: '../../', fixed: true, title: esc(t.learn.hub_title), description: t.learn.hub_desc,
    alternates: alternatesFor(SITE, learnHref), langMap: langMapFor(learnHref), head: ld, body
  }));
  return path;
}

// ---------- Entry point ----------
// Returns the new URLs (for the sitemap) and the lines to add to llms.txt.
export async function buildExtras(ctx) {
  const { SITE } = ctx;
  const urls = [];
  for (const lang of LANGS) {
    urls.push(kalamPage(ctx, lang, REF[lang], false));
    for (const c of CITIES_BY_LANG[lang]) urls.push(kalamPage(ctx, lang, c, true));
    urls.push(calPage(ctx, lang));
  }
  const learn = await loadLearn();
  for (const a of learn) for (const lang of LANGS.filter((l) => a.text[l])) urls.push(learnPage(ctx, a, lang));
  for (const lang of LANGS) urls.push(learnHub(ctx, lang, learn));
  const name = (l) => I18N.LANGS.find((x) => x.code === l).name;
  const llms = `## Rahu kalam finder (updated every day)
${LANGS.map((l) => `- [Rahu kalam today, ${name(l)}](${SITE.url}/${kalamHref(l)}): Rahu kalam, Yamagandam, Gulika kalam and Abhijit muhurtam for any place, from that place's sunrise and sunset; city pages at ${SITE.url}/${kalamHref(l)}<city> (${CITIES_BY_LANG[l].join(', ')})`).join('\n')}

## Indian calendars (updated every day)
${LANGS.map((l) => `- [Indian calendars today, ${name(l)}](${SITE.url}/${calHref(l)}): today's date in the Tamil, Malayalam, Telugu-Kannada (amanta), North Indian (purnimanta) and Indian National (Saka) calendars, festivals for the next 12 months, and how solar and lunar calendars relate`).join('\n')}

## Learn (explainers for the RasiVani cartoon videos)
${LANGS.map((l) => `- [Learn, ${name(l)}](${SITE.url}/${learnHref(l)})`).join('\n')}
${learn.map((a) => `- ${a.text.en ? a.text.en.h1 : a.slug}: ${LANGS.filter((l) => a.text[l]).map((l) => `${SITE.url}/learn/${l}/${a.slug}/`).join(' · ')}`).join('\n')}

`;
  return { urls, llms };
}
