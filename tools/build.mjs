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
  updated: '2026-11-11',
  // YouTube channel per language: paste each new channel's address here; a language left empty uses the main channel.
  youtubeByLang: { ta: 'https://www.youtube.com/@rasivani.official', te: '', en: '' },
  social: { whatsapp: 'https://whatsapp.com/channel/0029Vb9Q7Cw65yD8xqFxLT1h', youtube: 'https://www.youtube.com/@rasivani.official', facebook: 'https://www.facebook.com/rasivani.official', x: 'https://x.com/rasivani_off', sharechat: 'https://sharechat.com/profile/rasivani' }
};
// ========================================

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const write = (f, s) => { mkdirSync(dirname(join(root, f)), { recursive: true }); writeFileSync(join(root, f), s); };
await import('../js/i18n.js');
const { I18N } = globalThis;
const { SEO } = await import('./seo.mjs');
// Footer label for the guides (blog); the articles themselves are built by tools/blog.mjs
const BLOG_LABEL = {};
for (const l of I18N.LANGS.map((x) => x.code)) { try { BLOG_LABEL[l] = (await import(`../content/blog/${l}.mjs`)).default.ui.blog; } catch { /* language not written yet */ } }
// Footer and home-page links to the rasi, nakshatra and festival pages (built by tools/pages.mjs; text in content/pages/<lang>.mjs)
const EXTRA = {};
for (const l of ['ta', 'te']) {
  const U = (await import(`../content/pages/${l}.mjs`)).default.ui;
  EXTRA[l] = [U.rasi_hub && ['rasi/ta/', U.rasi_hub, U.rasi_hub_desc], U.nak_hub && ['nakshatra/ta/', U.nak_hub, U.nak_hub_desc], [`festivals/${l}/`, U.fest_hub, U.fest_hub_desc]].filter(Boolean);
}
export const LANG_CODES = I18N.LANGS.map((l) => l.code);
// IndexNow lets Bing, Yandex, Seznam and Naver know the moment a page changes. The key is public by design.
export const INDEXNOW_KEY = 'a7c3e91f5b2d4086b1e4f9c27d8a6e35';
// The three tool pages get their own URL per language: /ta/, /ta/porutham, /ta/panchangam ...
// Cloudflare Pages serves x.html at /x and redirects /x.html there, so every link, canonical and sitemap entry leaves .html off.
export const TOOL_FILES = ['index.html', 'porutham.html', 'panchangam.html'];
export const pretty = (path) => path.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
export const toolHref = (lang, file) => `${lang === 'en' ? '' : `${lang}/`}${pretty(file)}` || './';
const OG_LOCALE = { en: 'en_IN', hi: 'hi_IN', ta: 'ta_IN', te: 'te_IN', kn: 'kn_IN', ml: 'ml_IN', mr: 'mr_IN', bn: 'bn_IN', gu: 'gu_IN', or: 'or_IN' };
const escAttr = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".35"/><circle cx="16" cy="16" r="6" fill="#f2a516"/><circle cx="27.3" cy="9.5" r="2.4" fill="currentColor"/></svg>`;
const ICON = {
  lang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>`
};

const navText = (lang, key) => (I18N.UI[lang] && I18N.UI[lang][key]) || I18N.UI.en[key] || '';
// A row of links to every part of the site, in the page's language. Posts and the guide list show it, so a visitor
// who arrives from a video can reach the chart, porutham, panchangam, rasi palan and the rest in one tap.
export function exploreNav(lang, heading = '') {
  const links = [[toolHref(lang, 'index.html'), navText(lang, 'nav_chart')], [toolHref(lang, 'porutham.html'), navText(lang, 'nav_match')],
    [toolHref(lang, 'panchangam.html'), navText(lang, 'nav_panchang')], [`rasi-palan/${lang}/`, navText(lang, 'nav_palan')],
    ...(EXTRA[lang] || []).map(([href, label]) => [href, label])];
  return `<nav class="explore" aria-label="${escAttr(heading || SITE.name)}">${heading ? `<p>${escText(heading)}</p>` : ''}${links.map(([h, t]) => `<a href="${h}">${escText(t)}</a>`).join('')}</nav>`;
}

export function layout({ page, file, title, description, body, scripts = true, base = '', lang = 'en', alternates = '', head = '', keywords = '', fixed = false, langMap = null }) {
  const nav = [['index.html', 'nav_chart', 'chart'], ['porutham.html', 'nav_match', 'match'], ['panchangam.html', 'nav_panchang', 'panchang']]
    .map(([href, key, id]) => `<a href="${toolHref(lang, href)}" data-keep-lang="${href}" data-i18n="${key}"${id === page ? ' aria-current="page"' : ''}>${escText(navText(lang, key))}</a>`).join('')
    + `<a href="rasi-palan/${lang}/" data-palan data-i18n="nav_palan"${page === 'palan' ? ' aria-current="page"' : ''}>${escText(navText(lang, 'nav_palan'))}</a>`
    + (BLOG_LABEL[lang] ? `<a href="blog/${lang}/" data-blog data-i18n="nav_blog"${page === 'blog' ? ' aria-current="page"' : ''}>${escText(navText(lang, 'nav_blog'))}</a>` : '');
  const adsense = SITE.adsenseClient
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}" crossorigin="anonymous"></script>` : '';
  const canonical = `${SITE.url}/${pretty(file)}`;
  const jsonld = page === 'chart' ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WebApplication', name: SITE.name, url: SITE.url,
    applicationCategory: 'LifestyleApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    inLanguage: lang, description, image: `${SITE.url}/icons/og.png`
  })}</script>` : '';
  const siteLd = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': `${SITE.url}/#website`, name: SITE.name, alternateName: 'RasiVani Jathagam & Rasi Palan', url: `${SITE.url}/`, inLanguage: LANG_CODES, publisher: { '@id': `${SITE.url}/#org` } },
    { '@type': 'Organization', '@id': `${SITE.url}/#org`, name: SITE.name, url: `${SITE.url}/`, email: SITE.email, logo: `${SITE.url}/icons/icon-512.png`, sameAs: [...new Set([...Object.values(SITE.social), ...Object.values(SITE.youtubeByLang)].filter(Boolean))] }
  ] })}</script>`;
  const langLinks = I18N.LANGS.map((l) => `<a href="${langMap ? (langMap[l.code] || `rasi-palan/${l.code}/`) : page === 'blog' && BLOG_LABEL[l.code] ? `blog/${l.code}/${/^blog\/[a-z]{2}\/[^/]+\//.test(file) ? file.split('/')[2] + '/' : ''}` : page === 'palan' ? `rasi-palan/${l.code}/` : toolHref(l.code, TOOL_FILES.includes(file.replace(/^[a-z]{2}\//, '')) ? file.replace(/^[a-z]{2}\//, '') : 'index.html')}" hreflang="${l.code}" lang="${l.code}">${l.name}</a>`).join('');
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
<body data-page="${page}" data-lang="${lang}"${fixed ? ' data-fixed="1"' : ''}${langMap ? ` data-alt="${escAttr(JSON.stringify(langMap))}"` : ''}>
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
  <nav class="foot-social" aria-label="RasiVani on social media">${Object.entries({ WhatsApp: SITE.social.whatsapp, YouTube: SITE.youtubeByLang[lang] || SITE.social.youtube, Instagram: SITE.social.instagram, Facebook: SITE.social.facebook, X: SITE.social.x, ShareChat: SITE.social.sharechat }).filter(([, u]) => u).map(([n, u]) => `<a href="${u}" rel="me noopener" target="_blank">${n}</a>`).join('')}</nav>
  <nav class="foot-langs" aria-label="Languages">${langLinks}</nav>
  <div class="foot-links">${BLOG_LABEL[lang] ? `<a href="blog/${lang}/">${escText(BLOG_LABEL[lang])}</a>` : ''}${(EXTRA[lang] || []).map(([href, label]) => `<a href="${href}">${escText(label)}</a>`).join('')}<a href="about" data-keep-lang data-i18n="about"></a><a href="privacy" data-keep-lang data-i18n="privacy"></a><a href="contact" data-keep-lang data-i18n="contact"></a><span>© ${SITE.updated.slice(0, 4)} ${SITE.name}</span></div>
</div></footer>
${scripts ? '<script src="js/i18n.js"></script><script src="js/astro.js"></script><script src="js/places.js"></script><script src="js/app.js"></script>' : ''}
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
  ${(EXTRA[lang] || []).map(([href, label, desc]) => `<a href="${href}"><h3>${escText(label)}</h3><p>${escText(desc)}</p></a>`).join('\n  ')}
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
<p>Towns and cities worldwide: <a href="https://www.geonames.org/" rel="noopener">GeoNames</a> (CC BY 4.0). US ZIP codes and Canadian postal areas: the open <code>zipcodes</code> dataset. UK postcodes: Office for National Statistics Postcode Directory and OS Open Names (Open Government Licence v3; contains OS data © Crown copyright and database right). Time zones: <a href="https://github.com/photostructure/tz-lookup" rel="noopener">tz-lookup</a> (CC0). Places the offline list does not have, the map and “Use my location” names: © <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> contributors (ODbL), searched with Photon (komoot) and Nominatim; map drawn with <a href="https://leafletjs.com" rel="noopener">Leaflet</a>.</p>
<h2>A note on belief</h2>
<p>Astrology is a cultural and traditional practice. It is not a science, and nothing on this site is medical, financial, legal or relationship advice. For important decisions, talk to the people involved and to a qualified professional.</p>`);

prose('privacy.html', 'Privacy policy', `<h1>Privacy policy</h1>
<p>Last updated: ${SITE.updated}</p>
<h2>Your birth details stay on your device</h2>
<p>Names, dates, times and places you type are processed only in your browser. They are not sent to our servers or stored by us. Your language, city and chart-style choices are saved in your browser’s local storage so the site remembers them; you can clear them at any time in your browser settings.</p>
<p>Place search runs on our own offline list first. Only when it has few matches, when you tap “Search more places”, “Pick on map” or “Use my location” does your browser send the place name you typed, or the map point / your location’s coordinates, to OpenStreetMap services (Photon by komoot, Nominatim, and the OpenStreetMap map tiles) to find the place. Your location is asked for only when you tap “Use my location”, and is used only to fill the birth place box.</p>
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

// ---- 404 page ----
// Cloudflare Pages serves 404.html (with status 404) for any unknown address, at that address, so every
// link and file here must start from the site root: <base href="/"> does that for css/, icons/, js/ and links.
write('404.html', layout({ page: 'info', file: '404.html', base: '/', title: `Page not found · பக்கம் இல்லை | ${SITE.name}`, description: 'This page does not exist.',
  body: `<article class="prose" style="text-align:center;padding:48px 0">
<p class="sign-glyph" aria-hidden="true" style="font-size:56px">✦︎</p>
<h1>Page not found</h1>
<p lang="ta">இந்தப் பக்கம் இல்லை · <span lang="te">ఈ పేజీ లేదు</span> · <span lang="hi">यह पेज नहीं मिला</span></p>
<p><a class="btn" style="width:auto;text-decoration:none;display:inline-flex" href="./">RasiVani home</a></p>
<p><a href="ta/">தமிழ் ஜாதகம்</a> · <a href="te/">తెలుగు జాతకం</a> · <a href="rasi-palan/">Rasi palan</a>${(EXTRA.ta || []).map(([href, label]) => ` · <a href="${href}">${escText(label)}</a>`).join('')}</p>
</article>` }).replace('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">', '<meta name="robots" content="noindex">').replace(/\n<link rel="canonical"[^>]*>/, ''));

// ---- SEO + PWA files ----
export const STATIC_PAGES = [...LANG_CODES.flatMap((l) => TOOL_FILES.map((f) => toolHref(l, f).replace(/^\.\/$/, ''))), 'about', 'privacy', 'contact'];
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

## Rasi, nakshatra and festival pages (updated every day)
- [12 rasis in Tamil](${SITE.url}/rasi/ta/): one page per rasi at ${SITE.url}/rasi/ta/<rasi>/ (mesha ... meena) with nature, nakshatra padas, lucky day, colour and number, today's palan and this month's palan with chandrashtamam dates
- [27 nakshatras in Tamil](${SITE.url}/nakshatra/ta/): one page per star at ${SITE.url}/nakshatra/ta/<star>/ (ashwini ... revati) with rasi, lord, deity, gana, yoni, rajju, best matching stars, today's tara balam and this month's good days
- [Festivals and vrat days in Tamil](${SITE.url}/festivals/ta/) and [in Telugu](${SITE.url}/festivals/te/): Karthigai Deepam / Karthika Pournami, Vaikunta (Mukkoti) Ekadasi, Pongal / Makara Sankranti, and one page for every amavasya and pournami (for example ${SITE.url}/festivals/ta/amavasya-november-2026/) with exact tithi start and end times in IST

## Astrology guides (a new guide every day)
${L.filter((l) => BLOG_LABEL[l.code]).map((l) => `- [${BLOG_LABEL[l.code]} (${l.name})](${SITE.url}/blog/${l.code}/): plain-language guides to Chandrashtamam, the 10 poruthams, Rajju and Vedha, reading a jathagam, Rahu kalam, Sade Sati, the 27 nakshatras, dasha and bhukti, panchangam basics and monthly vrat days. RSS: ${SITE.url}/blog/${l.code}/feed.xml`).join('\n')}

## About
- [About ${SITE.name}](${SITE.url}/about)
- [Privacy](${SITE.url}/privacy)
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
const cacheFiles = ['./', 'porutham', 'panchangam', 'about', 'privacy', 'contact', 'css/style.css', 'js/i18n.js', 'js/astro.js', 'js/places.js', 'js/app.js', 'js/vendor/html2canvas.min.js', 'icons/icon.svg', 'rasi-palan/en/', 'manifest.webmanifest'];
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
// Cloudflare Pages redirects. Until 2026-11-11, switching language on an English tool page rewrote the
// address to /ta/ (history.replaceState) while the page had no <base>, so its relative links pointed under
// /ta/ (/ta/rasi-palan/ta/, /ta/blog/ta/, /ta/te/, /ta/about ...). Those addresses may be bookmarked or
// indexed: send them to the real page. Language folders hold only index, porutham and panchangam pages,
// so anything nested under them is one of these.
write('_redirects', `# Generated by tools/build.mjs\n${LANG_CODES.filter((l) => l !== 'en').map((l) =>
  ['about', 'privacy', 'contact'].map((f) => `/${l}/${f} /${f} 301`).join('\n') + `\n/${l}/:seg/* /:seg/:splat 301`).join('\n')}\n`);
console.log('Built pages for', SITE.url);
