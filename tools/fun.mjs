// Builds the fun, shareable tools in every language: Friendship score, FLAMES and Nakshatra animal.
// Called from tools/build.mjs. Text: content/fun/<lang>.mjs (a language without its own file uses English text).
// The tools run in the browser (js/fun.js). Each result has a WhatsApp button whose link opens the same result,
// so the person who receives it sees it at once and tries their own pair.
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
await import('../js/i18n.js'); await import('../js/astro.js'); await import('../js/fun.js');
const { I18N, Fun } = globalThis;

export const LANGS = I18N.LANGS.map((l) => l.code).filter((l) => existsSync(join(root, 'content', 'fun', `${l}.mjs`)));
const TXT = {};
for (const l of LANGS) TXT[l] = (await import(`../content/fun/${l}.mjs`)).default;
const T = (l) => TXT[LANGS.includes(l) ? l : 'en'];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = (h) => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const ui = (l, k) => (I18N.UI[l] && I18N.UI[l][k]) || I18N.UI.en[k];
const pre = (l) => (l === 'en' ? '' : `${l}/`);
const asset = (f) => `${f}?v=${createHash('sha1').update(readFileSync(join(root, f))).digest('hex').slice(0, 10)}`;
const jsonld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

// slug, page id (js/fun.js picks the tool by it), emoji for the cards
export const TOOLS = [['friendship-score', 'friend', '🤝'], ['flames', 'flames', '🔥'], ['nakshatra-animal', 'animal', '🐘']];
const KEY = { friend: 'friend', flames: 'flames', animal: 'animal' };
export const funHref = (lang, slug) => `${pre(LANGS.includes(lang) ? lang : 'en')}${slug}/`;

// ---------- Hooks used by tools/build.mjs ----------
export function footLinks(lang) { return `<a href="${funHref(lang, 'friendship-score')}">${esc(T(lang).c.nav)}</a>`; }
export function exploreLinks(lang) { return [[funHref(lang, 'friendship-score'), T(lang).friend.h1]]; }
// A row of three bright cards on the home page
export function homeCards(lang) {
  const t = T(lang);
  return `<section class="fun-home" aria-labelledby="fun-home-h"><h2 id="fun-home-h">${esc(t.c.home_h)}</h2><div class="fun-cards">${TOOLS.map(([slug, id, emo]) => `<a href="${funHref(lang, slug)}"><span class="fun-emo" aria-hidden="true">${emo}</span><h3>${esc(t[KEY[id]].h1)}</h3><p>${esc(t[KEY[id]].card)}</p></a>`).join('')}</div></section>`;
}

function starSelect(lang, id, label, t) {
  const nak = I18N.TERMS[lang].nak;
  return `<div class="field"><label for="${id}">${esc(label)}</label><select id="${id}"><option value="">${esc(t.c.star_opt)}</option>${nak.map((n, i) => `<option value="${i}">${esc(n)}</option>`).join('')}</select></div>`;
}
function formHtml(lang, id, t) {
  const c = t.c;
  const names = `<div class="field"><label for="f-a">${esc(c.your_name)}</label><input id="f-a" autocomplete="given-name" maxlength="40" required></div>
    <div class="field"><label for="f-b">${esc(c.friend_name)}</label><input id="f-b" maxlength="40" required></div>`;
  if (id === 'friend') {
    const f = t.friend;
    const who = (k, label, nameLabel) => `<fieldset class="fun-who"><legend>${esc(label)}</legend>
      <div class="field"><label for="f-${k}">${esc(nameLabel)}</label><input id="f-${k}" maxlength="60" required${k === 'a' ? ' autocomplete="name"' : ''}></div>
      <div class="fun-dobrow"><div class="field"><label for="f-d${k}">${esc(f.dob)}</label><input id="f-d${k}" type="date" required></div>
      <div class="field"><span class="fun-glabel">${esc(f.look)}</span><div class="seg fun-seg" role="group" aria-label="${esc(f.look)}"><button type="button" data-g="${k}:boy" aria-pressed="true">${esc(f.boy)}</button><button type="button" data-g="${k}:girl" aria-pressed="false">${esc(f.girl)}</button></div></div></div>
    </fieldset>`;
    return `${who('a', f.p1, c.your_name)}${who('b', f.p2, c.friend_name)}<p class="cs-hint">${esc(f.dob_hint)}</p>`;
  }
  if (id === 'flames') return names;
  const a = t.animal;
  return `<div class="seg fun-seg" role="group" aria-label="${esc(a.how)}"><button type="button" data-mode="star" aria-pressed="true">${esc(a.mode_star)}</button><button type="button" data-mode="dob" aria-pressed="false">${esc(a.mode_dob)}</button></div>
    <div id="an-star-box">${starSelect(lang, 'an-star', c.your_star, t)}</div>
    <div id="an-dob-box" hidden><div class="row2"><div class="field"><label for="an-dob">${esc(a.dob)}</label><input id="an-dob" type="date"></div><div class="field"><label for="an-tob">${esc(a.tob)}</label><input id="an-tob" type="time"></div></div><p class="cs-hint">${esc(a.tob_hint)}</p></div>`;
}

function page({ SITE, layout, write }, lang, [slug, id]) {
  const t = T(lang), p = t[KEY[id]], c = t.c;
  const path = funHref(lang, slug), file = `${path}index.html`, depth = file.split('/').length - 1;
  const others = TOOLS.filter(([s]) => s !== slug);
  // Text the browser needs, in this language only
  const clientText = { c: { fun_note: c.fun_note, share_wa: c.share_wa, download: c.download, copy: c.copy, copied: c.copied, need_names: c.need_names },
    t: id === 'friend' ? { tiers: p.tiers, parts: p.parts, share: p.share, scenes: p.scenes, praise: p.praise, need_dob: p.need_dob, replay: p.replay }
      : id === 'flames' ? { res: p.res, emoji: { F: '🤝', L: '❤️', A: '🤗', M: '💍', E: '😤', S: '👫' }, count: p.count, same: p.same, share: p.share }
        : { animals: p.animals, result: p.result, your_star: p.your_star, twins: p.twins, only: p.only, rival: p.rival, need_star: p.need_star, need_dob: p.need_dob, changed: p.changed, share: p.share },
    nak: I18N.TERMS[lang].nak };
  const ld = jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebApplication', '@id': `${SITE.url}/${path}#app`, name: strip(p.h1), url: `${SITE.url}/${path}`, description: p.desc, inLanguage: lang,
      applicationCategory: 'EntertainmentApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, isPartOf: { '@id': `${SITE.url}/#website` } },
    { '@type': 'FAQPage', mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) },
    { '@type': 'BreadcrumbList', itemListElement: [[SITE.name, `${SITE.url}/${pre(lang)}`], [p.h1, `${SITE.url}/${path}`]].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) }
  ] });
  const body = `<section class="hero fun-hero">
  <div>
    <nav class="crumbs" aria-label="Breadcrumb"><a href="${pre(lang) || './'}">${esc(SITE.name)}</a> › ${esc(p.h1)}</nav>
    <h1>${esc(p.h1)}</h1>
    <p class="lede">${esc(p.lede)}</p>
    <p class="fun-badges"><span>${esc(c.badge_free)}</span><span>${esc(c.badge_private)}</span><span>${esc(c.badge_share)}</span></p>
  </div>
  <form id="fun-form" class="panel" novalidate>
    <p class="error" id="fun-error" role="alert" hidden></p>
    ${formHtml(lang, id, t)}
    <button class="btn" type="submit">${esc(p.btn)}</button>
  </form>
</section>
<section id="fun-result" class="result fun-result" aria-live="polite" hidden></section>
<div class="ad-slot" data-ad="fun-mid"></div>
<section class="fun-home fun-more"><h2>${esc(c.more_h)}</h2><div class="fun-cards">${others.map(([s, i, emo]) => `<a href="${funHref(lang, s)}"><span class="fun-emo" aria-hidden="true">${emo}</span><h3>${esc(t[KEY[i]].h1)}</h3><p>${esc(t[KEY[i]].card)}</p></a>`).join('')}<a href="${pre(lang)}porutham"><span class="fun-emo" aria-hidden="true">💍</span><h3>${esc(ui(lang, 'nav_match'))}</h3><p>${esc(ui(lang, 'match_sub'))}</p></a></div></section>
${p.sections.map((s) => `<section class="block prose-block"><h2>${esc(s.h)}</h2>${s.html}</section>`).join('\n')}
<section class="block prose-block faq"><h2>${esc(c.faq_h)}</h2>${p.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
<script id="fun-text" type="application/json">${JSON.stringify(clientText).replace(/</g, '\\u003c')}</script>`;
  write(file, layout({
    page: id, file: path, lang, base: '../'.repeat(depth), fixed: true, title: esc(p.title), description: p.desc, keywords: p.keywords,
    alternates: LANGS.map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/${funHref(l, slug)}">`).join('') + `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/${funHref('en', slug)}">`,
    langMap: Object.fromEntries(I18N.LANGS.map((l) => [l.code, funHref(l.code, slug)])),
    head: `${ld}<script defer src="${asset('js/fun.js')}"></script>`, body
  }));
  return path;
}

// Returns the new URLs (for the sitemap) and the lines to add to llms.txt.
export function buildFun(ctx) {
  const { SITE } = ctx;
  const urls = [];
  for (const lang of LANGS) for (const tool of TOOLS) urls.push(page(ctx, lang, tool));
  const name = (l) => I18N.LANGS.find((x) => x.code === l).name;
  const llms = `## Fun tools (free, shareable on WhatsApp)
${LANGS.map((l) => `- ${name(l)}: [Friendship score](${SITE.url}/${funHref(l, 'friendship-score')}) (two names, optional birth stars: tara, gana and yoni) · [FLAMES](${SITE.url}/${funHref(l, 'flames')}) (the name game) · [Nakshatra animal](${SITE.url}/${funHref(l, 'nakshatra-animal')}) (yoni animal of each of the 27 stars)`).join('\n')}

`;
  return { urls, llms };
}
export { Fun };
