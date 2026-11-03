// Generates the static HTML pages, sitemap and PWA files.
// Run: node tools/build.mjs   (then upload the whole folder to any static host)
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ===== Edit these before going live =====
export const SITE = {
  name: 'RasiVani',
  url: 'https://rasivani.com',          // your domain, no trailing slash
  email: 'hello@rasivani.com',          // a real inbox you read (AdSense and Play Store require contact info)
  adsenseClient: '',                    // e.g. 'ca-pub-1234567890123456' once AdSense approves you
  updated: '2026-11-02'
};
// ========================================

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const write = (f, s) => { mkdirSync(dirname(join(root, f)), { recursive: true }); writeFileSync(join(root, f), s); };
await import('../js/i18n.js');
const { I18N } = globalThis;
const { SEO } = await import('./seo.mjs');
export const LANG_CODES = I18N.LANGS.map((l) => l.code);
// IndexNow lets Bing, Yandex, Seznam and Naver know the moment a page changes. The key is public by design.
export const INDEXNOW_KEY = 'a7c3e91f5b2d4086b1e4f9c27d8a6e35';
// The three tool pages get their own URL per language: /ta/, /ta/porutham.html, /ta/panchangam.html ...
export const TOOL_FILES = ['index.html', 'porutham.html', 'panchangam.html'];
export const toolHref = (lang, file) => `${lang === 'en' ? '' : `${lang}/`}${file === 'index.html' ? '' : file}` || './';
const OG_LOCALE = { en: 'en_IN', hi: 'hi_IN', ta: 'ta_IN', te: 'te_IN', kn: 'kn_IN', ml: 'ml_IN', mr: 'mr_IN', bn: 'bn_IN', gu: 'gu_IN', or: 'or_IN' };
const escAttr = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".35"/><circle cx="16" cy="16" r="6" fill="#f2a516"/><circle cx="27.3" cy="9.5" r="2.4" fill="currentColor"/></svg>`;
const ICON = {
  lang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>`
};

export function layout({ page, file, title, description, body, scripts = true, base = '', lang = 'en', alternates = '', head = '', keywords = '', fixed = false }) {
  const nav = [['index.html', 'nav_chart', 'chart'], ['porutham.html', 'nav_match', 'match'], ['panchangam.html', 'nav_panchang', 'panchang']]
    .map(([href, key, id]) => `<a href="${toolHref(lang, href)}" data-keep-lang="${href}" data-i18n="${key}"${id === page ? ' aria-current="page"' : ''}></a>`).join('')
    + `<a href="rasi-palan/${lang}/" data-palan data-i18n="nav_palan"${page === 'palan' ? ' aria-current="page"' : ''}></a>`;
  const adsense = SITE.adsenseClient
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}" crossorigin="anonymous"></script>` : '';
  const canonical = `${SITE.url}/${file === 'index.html' ? '' : file.replace(/index\.html$/, '')}`;
  const jsonld = page === 'chart' ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WebApplication', name: SITE.name, url: SITE.url,
    applicationCategory: 'LifestyleApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    inLanguage: lang, description, image: `${SITE.url}/icons/og.png`
  })}</script>` : '';
  const siteLd = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': `${SITE.url}/#website`, name: SITE.name, alternateName: 'RasiVani Jathagam & Rasi Palan', url: `${SITE.url}/`, inLanguage: LANG_CODES, publisher: { '@id': `${SITE.url}/#org` } },
    { '@type': 'Organization', '@id': `${SITE.url}/#org`, name: SITE.name, url: `${SITE.url}/`, email: SITE.email, logo: `${SITE.url}/icons/icon-512.png` }
  ] })}</script>`;
  const langLinks = I18N.LANGS.map((l) => `<a href="${page === 'palan' ? `rasi-palan/${l.code}/` : toolHref(l.code, TOOL_FILES.includes(file.replace(/^[a-z]{2}\//, '')) ? file.replace(/^[a-z]{2}\//, '') : 'index.html')}" hreflang="${l.code}" lang="${l.code}">${l.name}</a>`).join('');
  return `<!doctype html>
<html lang="${lang}" data-script="${lang}">
<head>
<meta charset="utf-8">${base ? `\n<base href="${base}">` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${escAttr(description)}">${keywords ? `\n<meta name="keywords" content="${escAttr(keywords)}">` : ''}
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonical}">${alternates}
<meta property="og:type" content="website"><meta property="og:site_name" content="${SITE.name}"><meta property="og:locale" content="${OG_LOCALE[lang] || 'en_IN'}"><meta property="og:title" content="${title}"><meta property="og:description" content="${escAttr(description)}">
<meta name="twitter:card" content="summary_large_image">
<meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE.url}/icons/og.png">
<meta name="theme-color" content="#2a1a5e">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Yatra+One&family=Mukta:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="css/style.css">
${siteLd}${jsonld}${head}${adsense}
</head>
<body data-page="${page}" data-lang="${lang}"${fixed ? ' data-fixed="1"' : ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="site-head"><div class="wrap head-row">
  <a class="brand" href="${toolHref(lang, 'index.html')}" data-keep-lang="index.html">${LOGO}<span>${SITE.name}</span></a>
  <nav class="nav" aria-label="Main">${nav}</nav>
  <div class="lang-pick">${ICON.lang}<label class="skip" for="lang" data-i18n="nav_lang"></label><select id="lang" aria-label="Language"></select></div>
</div></header>
<main id="main" class="wrap">
${body}
</main>
<footer class="site-foot"><div class="wrap">
  <p class="disclaimer" data-i18n="disclaimer"></p>
  <nav class="foot-langs" aria-label="Languages">${langLinks}</nav>
  <div class="foot-links"><a href="about.html" data-keep-lang data-i18n="about"></a><a href="privacy.html" data-keep-lang data-i18n="privacy"></a><a href="contact.html" data-keep-lang data-i18n="contact"></a><span>© ${SITE.updated.slice(0, 4)} ${SITE.name}</span></div>
</div></footer>
${scripts ? '<script src="js/i18n.js"></script><script src="js/astro.js"></script><script src="js/app.js"></script>' : ''}
</body>
</html>
`.replace(/(<[a-z0-9]+\b[^>]*\bdata-i18n="(\w+)"[^>]*>)(<\/)/g, (_, open, key, close) => `${open}${escText(I18N.UI[lang]?.[key] ?? I18N.UI.en[key] ?? '')}${close}`);
}
// Prerendering the text above means Google, Bing and AI crawlers that do not run JavaScript still read every heading.

const trust = `<ul class="trust">
  <li>${ICON.check}<span>Tamil · Telugu · Kannada · Malayalam · हिन्दी · मराठी · বাংলা · ગુજરાતી · ଓଡ଼ିଆ · English</span></li>
  <li>${ICON.check}<span>Lahiri ayanamsa · Vimshottari dasha · South &amp; North Indian charts</span></li>
</ul>`;
const privateNote = `<p class="private">${ICON.lock}<span data-i18n="private_note"></span></p>`;

for (const lang of LANG_CODES) {
const pre = lang === 'en' ? '' : `${lang}/`;
const S = SEO[lang];
const toolAlt = (f) => LANG_CODES.map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/${toolHref(l, f).replace(/^\.\/$/, '')}">`).join('')
  + `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/${toolHref('en', f).replace(/^\.\/$/, '')}">`;
const common = (f, key) => ({ lang, base: lang === 'en' ? '' : '../', fixed: lang !== 'en', alternates: toolAlt(f), title: escText(S[key][0]), description: S[key][1], keywords: S[key][2] });
// ---- Birth chart (home) ----
write(`${pre}index.html`, layout({
  ...common('index.html', 'home'), page: 'chart', file: `${pre}index.html`,
  body: `<section class="hero">
  <div>
    <h1 data-i18n="chart_title"></h1>
    <p class="lede" data-i18n="chart_sub"></p>
    ${trust}
  </div>
  <form id="chart-form" class="panel" novalidate>
    <p class="error" id="chart-error" role="alert" hidden></p>
    <div class="field"><label for="b-name" data-i18n="name"></label><input id="b-name" autocomplete="name"></div>
    <div class="row2">
      <div class="field"><label for="b-date" data-i18n="dob"></label><input id="b-date" type="date" required></div>
      <div class="field"><label for="b-time" data-i18n="tob"></label><input id="b-time" type="time" required></div>
    </div>
    <div id="chart-place"></div>
    <button class="btn" type="submit" data-i18n="btn_chart"></button>
    ${privateNote}
  </form>
</section>
<section id="chart-result" class="result" aria-live="polite" hidden></section>
<section class="services" aria-label="Services">
  <a href="${toolHref(lang, 'index.html')}" data-keep-lang="index.html"><h3 data-i18n="nav_chart"></h3><p data-i18n="chart_sub"></p></a>
  <a href="${toolHref(lang, 'porutham.html')}" data-keep-lang="porutham.html"><h3 data-i18n="nav_match"></h3><p data-i18n="match_sub"></p></a>
  <a href="${toolHref(lang, 'panchangam.html')}" data-keep-lang="panchangam.html"><h3 data-i18n="nav_panchang"></h3><p data-i18n="panchang_sub"></p></a>
  <a href="rasi-palan/${lang}/" data-palan><h3 data-i18n="nav_palan"></h3><p>${I18N.TERMS[lang].rasi.join(' · ')}</p></a>
</section>`
}));

// ---- Marriage matching ----
write(`${pre}porutham.html`, layout({
  ...common('porutham.html', 'match'), page: 'match', file: `${pre}porutham.html`,
  body: `<section class="hero" style="grid-template-columns:1fr;padding-bottom:16px">
  <div><h1 data-i18n="match_title"></h1><p class="lede" data-i18n="match_sub"></p></div>
</section>
<form id="match-form" class="match-form-wrap" novalidate>
  <p class="error" id="match-error" role="alert" hidden></p>
  <div class="match-grid" id="match-people"></div>
  <div class="match-submit"><button class="btn" type="submit" data-i18n="btn_match"></button>${privateNote}</div>
</form>
<section id="match-result" class="result" aria-live="polite" hidden></section>`
}));

// ---- Panchangam ----
write(`${pre}panchangam.html`, layout({
  ...common('panchangam.html', 'panch'), page: 'panchang', file: `${pre}panchangam.html`,
  body: `<section class="hero">
  <div><h1 data-i18n="panchang_title"></h1><p class="lede" data-i18n="panchang_sub"></p></div>
  <form id="panch-form" class="panel" novalidate>
    <p class="error" id="panch-error" role="alert" hidden></p>
    <div class="row2">
      <div class="field"><label for="p-date" data-i18n="date"></label><input id="p-date" type="date"></div>
      <div class="field"><label for="p-time" data-i18n="time"></label><input id="p-time" type="time"></div>
    </div>
    <div id="panch-place"></div>
    <button class="btn" type="submit" data-i18n="btn_panchang"></button>
  </form>
</section>
<section id="panch-result" class="result" aria-live="polite" hidden></section>`
}));
}

// ---- Static pages required by AdSense / Play Store ----
const prose = (file, title, html) => write(file, layout({ page: 'info', file, title: `${title} | ${SITE.name}`, description: `${title} - ${SITE.name}`, body: `<article class="prose">${html}</article>` }));

prose('about.html', 'About', `<h1>About ${SITE.name}</h1>
<p>${SITE.name} (“light of your horoscope”) is a free Vedic astrology site for families across India and the diaspora. It makes a jathagam (birth chart), checks marriage porutham, and shows the daily panchangam in ten Indian languages.</p>
<h2>How the calculations work</h2>
<p>All calculations run inside your browser. Planet positions come from standard astronomical formulas (Jean Meeus’ lunar theory and NASA JPL orbital elements), converted to the sidereal zodiac with the Lahiri (Chitrapaksha) ayanamsa used by the Indian government’s Rashtriya Panchang. Rahu and Ketu use the mean node. The Moon is accurate to about one arc-minute, which is enough to fix the rasi and nakshatra except in rare births right at a boundary.</p>
<p>Marriage matching uses the ten traditional South Indian poruthams (Dina, Gana, Mahendra, Stree Deergha, Yoni, Rasi, Rasi Adhipati, Vasya, Rajju, Vedha). Rajju and Vedha are treated as essential, as most astrologers do.</p>
<h2>Place data</h2>
<p>Area names, pincodes and coordinates come from the All India Pincode Directory published by the Department of Posts on data.gov.in under the Government Open Data License – India.</p>
<h2>A note on belief</h2>
<p>Astrology is a cultural and traditional practice. It is not a science, and nothing on this site is medical, financial, legal or relationship advice. For important decisions, talk to the people involved and to a qualified professional.</p>`);

prose('privacy.html', 'Privacy policy', `<h1>Privacy policy</h1>
<p>Last updated: ${SITE.updated}</p>
<h2>Your birth details stay on your device</h2>
<p>Names, dates, times and places you type are processed only in your browser. They are not sent to our servers or stored by us. Your language, city and chart-style choices are saved in your browser’s local storage so the site remembers them; you can clear them at any time in your browser settings.</p>
<h2>Advertising and cookies</h2>
<p>This site may show ads from Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. Google’s use of advertising cookies enables it and its partners to serve ads based on your visits to this site and/or other sites on the Internet. You can opt out of personalised advertising at <a href="https://www.google.com/settings/ads" rel="noopener">Google Ads Settings</a>, or opt out of some third-party vendors’ cookies at <a href="https://www.aboutads.info/choices/" rel="noopener">aboutads.info</a>. Learn more in <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">How Google uses information from sites that use its services</a>.</p>
<p>Visitors in the European Economic Area, the UK and Switzerland are shown a consent message (Google-certified CMP) before any personalised ads are served.</p>
<h2>Analytics</h2>
<p>We may use privacy-respecting, aggregate analytics to count visits. We do not sell personal data.</p>
<h2>Children</h2>
<p>This site is not directed to children under 13 and we do not knowingly collect their data.</p>
<h2>Contact</h2>
<p>Questions about privacy: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`);

prose('contact.html', 'Contact', `<h1>Contact us</h1>
<p>We would love to hear about mistakes in translations or calculations, and ideas for new services.</p>
<p>We answer by email only, usually within two working days.</p>
<p>Email: <strong>${SITE.email}</strong></p>
<p>When reporting a calculation issue, please include the date, time and place you entered (only if you are comfortable sharing them).</p>`);

// ---- SEO + PWA files ----
export const STATIC_PAGES = [...LANG_CODES.flatMap((l) => TOOL_FILES.map((f) => toolHref(l, f).replace(/^\.\/$/, ''))), 'about.html', 'privacy.html', 'contact.html'];
const pages = STATIC_PAGES;
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE.url}/${p}</loc><lastmod>${SITE.updated}</lastmod></url>`).join('\n')}
</urlset>
`);
// Search engines and AI answer engines are all welcome (they bring visitors). Ad and SEO scrapers are not needed.
const AI_BOTS = ['Googlebot', 'Bingbot', 'Google-Extended', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'Applebot', 'Applebot-Extended', 'DuckDuckBot', 'YandexBot', 'meta-externalagent', 'Amazonbot', 'CCBot'];
write('robots.txt', `# RasiVani: search engines and AI assistants may read and cite every page.
User-agent: *
Allow: /

${AI_BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE.url}/sitemap.xml
`);
write(`${INDEXNOW_KEY}.txt`, INDEXNOW_KEY);
// llms.txt: a plain summary that AI assistants (ChatGPT, Perplexity, Claude, Gemini) read to understand and cite the site.
const L = I18N.LANGS;
write('llms.txt', `# ${SITE.name}

> ${SITE.name} (${SITE.url}) is a free Vedic astrology website for Indian families, in ${L.length} languages: ${L.map((l) => `${l.name} (${l.code})`).join(', ')}. It makes a jathagam / janam kundli (birth chart), checks marriage porutham (10 poruthams), shows the daily panchangam with Rahu kalam, and publishes a fresh rasi palan (daily horoscope) for all 12 rasis every day at 00:05 IST.

Calculations use the sidereal zodiac with Lahiri (Chitrapaksha) ayanamsa, Vimshottari dasha and the ten South Indian poruthams. Birth details are processed in the visitor's browser and are never stored. Astrology is presented as cultural tradition, not as medical, financial or legal advice.

## Free tools
${L.map((l) => `- [Jathagam / birth chart in ${l.name}](${SITE.url}/${toolHref(l.code, 'index.html').replace(/^\.\/$/, '')}): rasi and navamsa charts, nakshatra, planets, dasha`).join('\n')}
${L.map((l) => `- [Marriage porutham in ${l.name}](${SITE.url}/${toolHref(l.code, 'porutham.html')}): 10 poruthams including rajju and vedha`).join('\n')}
${L.map((l) => `- [Panchangam in ${l.name}](${SITE.url}/${toolHref(l.code, 'panchangam.html')}): tithi, nakshatra, yoga, karana, Rahu kalam, Yamagandam, Gulikai`).join('\n')}

## Daily rasi palan (updated every day)
${L.map((l) => `- [Today's rasi palan in ${l.name}](${SITE.url}/rasi-palan/${l.code}/): all 12 rasis, plus one page per rasi at ${SITE.url}/rasi-palan/${l.code}/<rasi>/ (mesha, vrishabha, mithuna, karka, simha, kanya, tula, vrischika, dhanu, makara, kumbha, meena)`).join('\n')}

## About
- [About ${SITE.name}](${SITE.url}/about.html)
- [Privacy](${SITE.url}/privacy.html)
- Contact: ${SITE.email}
`);
write('ads.txt', SITE.adsenseClient
  ? `google.com, ${SITE.adsenseClient.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`
  : `# Replace with your AdSense line after approval, e.g.\n# google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n`);
write('manifest.webmanifest', JSON.stringify({
  name: `${SITE.name} – Jathagam, Porutham, Panchangam`, short_name: SITE.name, start_url: './index.html', scope: './',
  display: 'standalone', background_color: '#fffaf2', theme_color: '#2a1a5e', lang: 'en',
  description: 'Free birth chart, marriage matching and panchangam in 10 Indian languages.',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));
const cacheFiles = ['./', 'index.html', 'porutham.html', 'panchangam.html', 'about.html', 'privacy.html', 'contact.html', 'css/style.css', 'js/i18n.js', 'js/astro.js', 'js/app.js', 'js/vendor/html2canvas.min.js', 'icons/icon.svg', 'rasi-palan/en/', 'manifest.webmanifest'];
write('sw.js', `// Offline support so the Android app works without network.
const CACHE = 'rasivani-${SITE.updated}';
const FILES = ${JSON.stringify(cacheFiles)};
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // never cache ads or fonts
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
`);
console.log('Built pages for', SITE.url);
