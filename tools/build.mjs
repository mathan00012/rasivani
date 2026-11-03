// Generates the static HTML pages, sitemap and PWA files.
// Run: node tools/build.mjs   (then upload the whole folder to any static host)
import { writeFileSync } from 'node:fs';
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
const write = (f, s) => writeFileSync(join(root, f), s);

const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".35"/><circle cx="16" cy="16" r="6" fill="#f2a516"/><circle cx="27.3" cy="9.5" r="2.4" fill="currentColor"/></svg>`;
const ICON = {
  lang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>`
};

export function layout({ page, file, title, description, body, scripts = true, base = '', lang = 'en', alternates = '', head = '' }) {
  const nav = [['index.html', 'nav_chart', 'chart'], ['porutham.html', 'nav_match', 'match'], ['panchangam.html', 'nav_panchang', 'panchang']]
    .map(([href, key, id]) => `<a href="${href}" data-keep-lang data-i18n="${key}"${id === page ? ' aria-current="page"' : ''}></a>`).join('')
    + `<a href="rasi-palan/${lang}/" data-palan data-i18n="nav_palan"${page === 'palan' ? ' aria-current="page"' : ''}></a>`;
  const adsense = SITE.adsenseClient
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}" crossorigin="anonymous"></script>` : '';
  const canonical = `${SITE.url}/${file === 'index.html' ? '' : file.replace(/index\.html$/, '')}`;
  const jsonld = page === 'chart' ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WebApplication', name: SITE.name, url: SITE.url,
    applicationCategory: 'LifestyleApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    inLanguage: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'or']
  })}</script>` : '';
  return `<!doctype html>
<html lang="${lang}" data-script="${lang}">
<head>
<meta charset="utf-8">${base ? `\n<base href="${base}">` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">${alternates}
<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE.url}/icons/og.png">
<meta name="theme-color" content="#2a1a5e">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Yatra+One&family=Mukta:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="css/style.css">
${jsonld}${head}${adsense}
</head>
<body data-page="${page}" data-lang="${lang}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-head"><div class="wrap head-row">
  <a class="brand" href="index.html" data-keep-lang>${LOGO}<span>${SITE.name}</span></a>
  <nav class="nav" aria-label="Main">${nav}</nav>
  <div class="lang-pick">${ICON.lang}<label class="skip" for="lang" data-i18n="nav_lang"></label><select id="lang" aria-label="Language"></select></div>
</div></header>
<main id="main" class="wrap">
${body}
</main>
<footer class="site-foot"><div class="wrap">
  <p class="disclaimer" data-i18n="disclaimer"></p>
  <div class="foot-links"><a href="about.html" data-keep-lang data-i18n="about"></a><a href="privacy.html" data-keep-lang data-i18n="privacy"></a><a href="contact.html" data-keep-lang data-i18n="contact"></a><span>© ${SITE.updated.slice(0, 4)} ${SITE.name}</span></div>
</div></footer>
${scripts ? '<script src="js/i18n.js"></script><script src="js/astro.js"></script><script src="js/app.js"></script>' : ''}
</body>
</html>
`;
}

const trust = `<ul class="trust">
  <li>${ICON.check}<span>Tamil · Telugu · Kannada · Malayalam · हिन्दी · मराठी · বাংলা · ગુજરાતી · ଓଡ଼ିଆ · English</span></li>
  <li>${ICON.check}<span>Lahiri ayanamsa · Vimshottari dasha · South &amp; North Indian charts</span></li>
</ul>`;
const privateNote = `<p class="private">${ICON.lock}<span data-i18n="private_note"></span></p>`;

// ---- Birth chart (home) ----
write('index.html', layout({
  page: 'chart', file: 'index.html',
  title: 'Free Jathagam &amp; Kundli in Tamil, Telugu, Hindi and more | RasiVani',
  description: 'Free online jathagam, janam kundli and birth chart with rasi, navamsa, nakshatra and dasha in Tamil, Telugu, Kannada, Malayalam, Hindi, Marathi, Bengali, Gujarati and Odia.',
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
  <a href="index.html" data-keep-lang><h3 data-i18n="nav_chart"></h3><p data-i18n="chart_sub"></p></a>
  <a href="porutham.html" data-keep-lang><h3 data-i18n="nav_match"></h3><p data-i18n="match_sub"></p></a>
  <a href="panchangam.html" data-keep-lang><h3 data-i18n="nav_panchang"></h3><p data-i18n="panchang_sub"></p></a>
  <a href="rasi-palan/en/" data-palan><h3 data-i18n="nav_palan"></h3><p>Mesha · Vrishabha · Mithuna · Karka · Simha · Kanya · Tula · Vrischika · Dhanu · Makara · Kumbha · Meena</p></a>
</section>`
}));

// ---- Marriage matching ----
write('porutham.html', layout({
  page: 'match', file: 'porutham.html',
  title: 'Free Marriage Porutham &amp; Kundli Matching (10 Poruthams) | RasiVani',
  description: 'Free thirumana porutham and marriage matching: check all 10 poruthams including rajju and vedha from birth details or birth star, in your language.',
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
write('panchangam.html', layout({
  page: 'panchang', file: 'panchangam.html',
  title: 'Today’s Panchangam, Rahu Kalam &amp; Nalla Neram | RasiVani',
  description: 'Today’s panchangam for your city: tithi, nakshatra, yoga, karana, sunrise, sunset, Rahu kalam, Yamagandam, Gulikai and Chandrashtamam.',
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
export const STATIC_PAGES = ['', 'porutham.html', 'panchangam.html', 'about.html', 'privacy.html', 'contact.html'];
const pages = STATIC_PAGES;
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE.url}/${p}</loc><lastmod>${SITE.updated}</lastmod></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
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
