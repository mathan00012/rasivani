// Builds "baby names by nakshatra" pages: a hub per language (/<lang>/baby-names/) with the letters chart and a finder,
// and one page per star (/<lang>/baby-names/<star>/) with boy and girl names for each pada. English lives at the root.
// Data: content/babynames/names.mjs (names) + meanings.mjs (translations); page text: content/babynames/<lang>.mjs.
// Also writes js/babynames-data.js so the paid Baby Naming Guide can use the same names in the browser.
// Check the data: node tools/babynames.mjs --check
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
await import('../js/i18n.js'); await import('../js/astro.js'); await import('../js/nak-letters.js'); await import('../js/babynames-core.js');
const { I18N, Astro: A, BabyNames } = globalThis;
const NAMES = (await import('../content/babynames/names.mjs')).default;
const MEANINGS = (await import('../content/babynames/meanings.mjs')).default;
export const BN = BabyNames.make(NAMES, MEANINGS);

export const LANGS = BabyNames.LANGS.filter((l) => existsSync(join(root, 'content', 'babynames', `${l}.mjs`)));
const TXT = {};
for (const l of LANGS) TXT[l] = (await import(`../content/babynames/${l}.mjs`)).default;
const T = (l) => TXT[LANGS.includes(l) ? l : 'en'];
const NAK_SLUG = ['ashwini', 'bharani', 'krittika', 'rohini', 'mrigashira', 'ardra', 'punarvasu', 'pushya', 'ashlesha', 'magha', 'purva-phalguni', 'uttara-phalguni', 'hasta', 'chitra', 'swati', 'vishakha', 'anuradha', 'jyeshtha', 'mula', 'purva-ashadha', 'uttara-ashadha', 'shravana', 'dhanishta', 'shatabhisha', 'purva-bhadrapada', 'uttara-bhadrapada', 'revati'];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = (h) => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
const pre = (l) => (l === 'en' ? '' : `${l}/`);
const asset = (f) => `${f}?v=${createHash('sha1').update(readFileSync(join(root, f))).digest('hex').slice(0, 10)}`;
const jsonld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const nakName = (lang, i) => I18N.TERMS[lang].nak[i];

export const hubHref = (lang) => `${pre(LANGS.includes(lang) ? lang : 'en')}baby-names/`;
export const starHref = (lang, i) => `${hubHref(lang)}${NAK_SLUG[i]}/`;
const letter = (lang, s) => (lang === 'en' ? cap(s) : s);
// "Chu, Che, Cho, La" for a star
const starLetters = (lang, i) => [1, 2, 3, 4].map((p) => letter(lang, BN.letters(i, p, lang)[0])).join(', ');

// ---------- Hooks used by tools/build.mjs ----------
export const footLinks = (lang) => `<a href="${hubHref(lang)}">${esc(T(lang).nav)}</a>`;
export const exploreLinks = (lang) => [[hubHref(lang), T(lang).nav]];

function namesTable(lang, list, t) {
  if (!list.length) return '';
  const showLatin = lang !== 'en';
  return `<div class="table-wrap"><table class="bn-table"><thead><tr><th scope="col">${esc(t.name)}</th><th scope="col">${esc(t.meaning)}</th></tr></thead><tbody>${list.map((n) => `<tr><td><strong>${esc(n.name)}</strong>${showLatin ? `<span class="bn-lat" lang="en">${esc(n.latin)}</span>` : ''}</td><td>${esc(n.meaning)}</td></tr>`).join('')}</tbody></table></div>`;
}

function hubPage({ SITE, layout, write }, lang) {
  const t = T(lang), h = t.hub, f = t.form, path = hubHref(lang), file = `${path}index.html`, depth = file.split('/').length - 1;
  const nak = I18N.TERMS[lang].nak;
  const clientText = { f, nak, href: NAK_SLUG.map((s, i) => starHref(lang, i)), letters: nak.map((_, i) => [1, 2, 3, 4].map((p) => letter(lang, BN.letters(i, p, lang)[0]))) };
  const ld = jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebApplication', '@id': `${SITE.url}/${path}#app`, name: h.h1, url: `${SITE.url}/${path}`, description: h.desc, inLanguage: lang, applicationCategory: 'LifestyleApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, isPartOf: { '@id': `${SITE.url}/#website` } },
    { '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) },
    { '@type': 'BreadcrumbList', itemListElement: [[SITE.name, `${SITE.url}/${pre(lang)}`], [h.h1, `${SITE.url}/${path}`]].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) }
  ] });
  const body = `<section class="hero fun-hero">
  <div>
    <nav class="crumbs" aria-label="Breadcrumb"><a href="${pre(lang) || './'}">${esc(SITE.name)}</a> › ${esc(h.h1)}</nav>
    <h1>${esc(h.h1)}</h1>
    <p class="lede">${esc(h.lede)}</p>
  </div>
  <form id="bn-form" class="panel" novalidate>
    <p class="error" id="bn-error" role="alert" hidden></p>
    <div class="seg fun-seg" role="group" aria-label="${esc(f.how)}"><button type="button" data-mode="star" aria-pressed="true">${esc(f.mode_star)}</button><button type="button" data-mode="dob" aria-pressed="false">${esc(f.mode_dob)}</button></div>
    <div id="bn-star-box" class="row2">
      <div class="field"><label for="bn-star">${esc(f.star)}</label><select id="bn-star"><option value="">${esc(f.star_opt)}</option>${nak.map((n, i) => `<option value="${i}">${esc(n)}</option>`).join('')}</select></div>
      <div class="field"><label for="bn-pada">${esc(f.pada)}</label><select id="bn-pada"><option value="">${esc(f.pada_any)}</option>${[1, 2, 3, 4].map((p) => `<option value="${p}">${p}</option>`).join('')}</select></div>
    </div>
    <div id="bn-dob-box" hidden><div class="row2"><div class="field"><label for="bn-dob">${esc(f.dob)}</label><input id="bn-dob" type="date"></div><div class="field"><label for="bn-tob">${esc(f.tob)}</label><input id="bn-tob" type="time"></div></div><p class="cs-hint">${esc(f.tob_hint)}</p></div>
    <button class="btn" type="submit">${esc(f.btn)}</button>
  </form>
</section>
<section id="bn-result" class="result fun-result" aria-live="polite" hidden></section>
<section class="block prose-block"><h2>${esc(t.table_h)}</h2>
<div class="table-wrap"><table class="bn-letters"><caption>${esc(t.table_cap)}</caption><thead><tr><th scope="col">${esc(t.star)}</th>${[1, 2, 3, 4].map((p) => `<th scope="col">${esc(fill(t.pada, { n: p }))}</th>`).join('')}</tr></thead><tbody>
${nak.map((n, i) => `<tr><th scope="row"><a href="${starHref(lang, i)}">${esc(n)}</a></th>${[1, 2, 3, 4].map((p) => { const L = BN.letters(i, p, lang); return `<td><a href="${starHref(lang, i)}#pada-${p}">${esc(letter(lang, L[0]))}</a>${L.length > 1 ? ` <small>(${esc(L.slice(1).map((x) => letter(lang, x)).join(', '))})</small>` : ''}</td>`; }).join('')}</tr>`).join('\n')}
</tbody></table></div></section>
<div class="ad-slot" data-ad="bn-mid"></div>
<section class="block prose-block bn-find"><h2>${esc(t.find_h)}</h2><p>${esc(t.find_p)}</p><p><a class="btn bn-btn" href="${pre(lang) || './'}">${esc(t.find_btn)}</a></p></section>
${t.sections.map((s) => `<section class="block prose-block"><h2>${esc(s.h)}</h2>${s.html}</section>`).join('\n')}
<section class="block prose-block faq"><h2>${esc(t.faq_h)}</h2>${t.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
<p class="cs-hint bn-note">${esc(t.note)}</p>
<script id="bn-text" type="application/json">${JSON.stringify(clientText).replace(/</g, '\\u003c')}</script>`;
  write(file, layout({
    page: 'babynames', file: path, lang, base: '../'.repeat(depth), fixed: true, title: esc(h.title), description: h.desc, keywords: h.keywords,
    alternates: LANGS.map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/${hubHref(l)}">`).join('') + `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/${hubHref('en')}">`,
    langMap: Object.fromEntries(I18N.LANGS.map((l) => [l.code, hubHref(l.code)])),
    head: `${ld}<script defer src="${asset('js/babynames.js')}"></script>`, body
  }));
  return path;
}

function starPage({ SITE, layout, write }, lang, i) {
  const t = T(lang), s = t.starp, star = nakName(lang, i), path = starHref(lang, i), file = `${path}index.html`, depth = file.split('/').length - 1;
  const rasiName = (p) => I18N.TERMS[lang].rasi[A.rasiFromStarPada(i, p)];
  const padas = [1, 2, 3, 4].map((p) => ({ p, ...BN.forPada(lang, i, p) }));
  const count = padas.reduce((n, x) => n + x.boys.length + x.girls.length, 0);
  const letters = starLetters(lang, i);
  const v = { star, letters, count, slug: NAK_SLUG[i] };
  const faq = t.faq_star.map(([q, a]) => [fill(q, v), fill(a, { ...v, l1: letter(lang, padas[0].letter), l2: letter(lang, padas[1].letter), l3: letter(lang, padas[2].letter), l4: letter(lang, padas[3].letter), rasis: [1, 2, 3, 4].map((p) => fill(t.rasi_line, { p, rasi: rasiName(p) })).join(', ') })]);
  const ld = jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${SITE.url}/${path}#page`, name: fill(s.h1, v), url: `${SITE.url}/${path}`, description: fill(s.desc, v), inLanguage: lang, isPartOf: { '@id': `${SITE.url}/#website` } },
    { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) },
    { '@type': 'BreadcrumbList', itemListElement: [[SITE.name, `${SITE.url}/${pre(lang)}`], [t.hub.h1, `${SITE.url}/${hubHref(lang)}`], [fill(s.h1, v), `${SITE.url}/${path}`]].map(([name, item], k) => ({ '@type': 'ListItem', position: k + 1, name, item })) }
  ] });
  const padaHtml = padas.map((x) => {
    const L = letter(lang, x.letter), also = x.also.map((a) => letter(lang, a)).join(', ');
    const rare = x.boys.length + x.girls.length < 3;
    return `<section class="block prose-block bn-pada" id="pada-${x.p}">
<h2><span class="bn-chip">${esc(L)}</span> ${esc(fill(t.pada, { n: x.p }))}: ${esc(fill(t.starts, { letter: L }))}</h2>
<p class="bn-meta">${esc(t.rasi)}: ${esc(rasiName(x.p))}${also ? ` · ${esc(fill(t.also, { alts: also }))}` : ''}</p>
${rare ? `<p class="fun-tip">${esc(t.rare)}</p>` : ''}
<div class="bn-cols">${x.boys.length ? `<div><h3>${esc(t.boys)}</h3>${namesTable(lang, x.boys, t)}</div>` : ''}${x.girls.length ? `<div><h3>${esc(t.girls)}</h3>${namesTable(lang, x.girls, t)}</div>` : ''}</div>
</section>`;
  }).join('\n');
  const body = `<section class="hero fun-hero">
  <div>
    <nav class="crumbs" aria-label="Breadcrumb"><a href="${pre(lang) || './'}">${esc(SITE.name)}</a> › <a href="${hubHref(lang)}">${esc(t.hub.h1)}</a> › ${esc(star)}</nav>
    <h1>${esc(fill(s.h1, v))}</h1>
    <p class="lede">${esc(fill(s.lede, v))}</p>
  </div>
  <nav class="panel bn-quick" aria-label="${esc(star)}"><ul>${padas.map((x) => `<li><a href="#pada-${x.p}"><span class="bn-chip">${esc(letter(lang, x.letter))}</span><span>${esc(fill(t.pada, { n: x.p }))}<small>${esc(rasiName(x.p))}</small></span></a></li>`).join('')}</ul></nav>
</section>
${padaHtml}
<div class="ad-slot" data-ad="bn-mid"></div>
<section class="block prose-block bn-find"><h2>${esc(t.find_h)}</h2><p>${esc(t.find_p)}</p><p><a class="btn bn-btn" href="${pre(lang) || './'}">${esc(t.find_btn)}</a></p></section>
<nav class="panel sign-list" aria-label="${esc(t.all_h)}"><h2>${esc(t.all_h)}</h2><ul>${NAK_SLUG.map((_, k) => `<li><a href="${starHref(lang, k)}"${k === i ? ' aria-current="page"' : ''}>${esc(nakName(lang, k))}</a></li>`).join('')}</ul></nav>
<section class="block prose-block faq"><h2>${esc(t.faq_h)}</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
<p class="cs-hint bn-note">${esc(t.note)}</p>`;
  write(file, layout({
    page: 'babynames-star', file: path, lang, base: '../'.repeat(depth), fixed: true, title: esc(fill(s.title, v)), description: fill(s.desc, v), keywords: fill(s.keywords, v),
    alternates: LANGS.map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/${starHref(l, i)}">`).join('') + `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/${starHref('en', i)}">`,
    langMap: Object.fromEntries(I18N.LANGS.map((l) => [l.code, starHref(l.code, i)])),
    head: ld, body
  }));
  return path;
}

// Browser copy of the data for the paid Baby Naming Guide (load js/nak-letters.js and js/babynames-core.js first)
function writeData() {
  const out = `/* Generated by tools/babynames.mjs from content/babynames/. Do not edit by hand. */\n(function (root) { root.BabyNamesData = ${JSON.stringify({ names: NAMES, meanings: MEANINGS })}; })(typeof window !== 'undefined' ? window : globalThis);\n`;
  const f = join(root, 'js', 'babynames-data.js');
  if (!existsSync(f) || readFileSync(f, 'utf8') !== out) writeFileSync(f, out);
}

// Returns the new URLs (for the sitemap) and the lines to add to llms.txt.
export function buildBabyNames(ctx) {
  const errs = BN.check();
  if (errs.length) throw new Error(`Baby names data has problems:\n${errs.join('\n')}`);
  writeData();
  const urls = [];
  for (const lang of LANGS) { urls.push(hubPage(ctx, lang)); for (let i = 0; i < 27; i++) urls.push(starPage(ctx, lang, i)); }
  const name = (l) => I18N.LANGS.find((x) => x.code === l).name;
  const llms = `## Baby names by nakshatra (birth star)
${LANGS.map((l) => `- ${name(l)}: [Name letters for all 27 stars](${ctx.SITE.url}/${hubHref(l)}) with boy and girl names and meanings for every pada`).join('\n')}

`;
  return { urls, llms };
}

if (process.argv.includes('--check')) {
  const errs = BN.check();
  console.log(errs.length ? errs.join('\n') : `OK: ${NAMES.flat(3).join(';').split(';').filter(Boolean).length} names, no problems`);
  process.exit(errs.length ? 1 : 0);
}
