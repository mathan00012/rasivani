// RasiVani guides (the blog). Original articles live in content/blog/<lang>.mjs.
// One new guide goes live every day: guide number i is published on START + i days.
// Called from tools/daily.mjs, which runs every night, so new guides appear by themselves.
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { SITE, layout, toolHref } from './build.mjs';

export const BLOG_START = '2026-11-04';
// Release order. Add new slugs at the end (and the same slug to every language file).
export const ORDER = ['chandrashtamam', 'ten-poruthams', 'jathagam-guide', 'rahu-kalam', 'rajju-vedha', 'sade-sati', 'nakshatras', 'dasha-bhukti', 'panchangam-basics', 'vrat-days'];
const TOOL = { chandrashtamam: 'palan', 'ten-poruthams': 'match', 'jathagam-guide': 'chart', 'rahu-kalam': 'panch', 'rajju-vedha': 'match', 'sade-sati': 'palan', nakshatras: 'chart', 'dasha-bhukti': 'chart', 'panchangam-basics': 'panch', 'vrat-days': 'panch' };
const RELATED = { chandrashtamam: ['nakshatras', 'sade-sati'], 'ten-poruthams': ['rajju-vedha', 'jathagam-guide'], 'jathagam-guide': ['dasha-bhukti', 'nakshatras'], 'rahu-kalam': ['panchangam-basics', 'vrat-days'], 'rajju-vedha': ['ten-poruthams', 'nakshatras'], 'sade-sati': ['dasha-bhukti', 'chandrashtamam'], nakshatras: ['ten-poruthams', 'jathagam-guide'], 'dasha-bhukti': ['jathagam-guide', 'sade-sati'], 'panchangam-basics': ['rahu-kalam', 'vrat-days'], 'vrat-days': ['panchangam-basics', 'rahu-kalam'] };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const addDays = (isoDay, n) => new Date(Date.parse(`${isoDay}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const fmt = (lang, isoDay) => new Intl.DateTimeFormat(lang === 'en' ? 'en-IN' : `${lang}-IN`, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${isoDay}T00:00:00Z`));
const toolLink = (lang, k) => (k === 'chart' ? toolHref(lang, 'index.html') : k === 'match' ? toolHref(lang, 'porutham.html') : k === 'panch' ? toolHref(lang, 'panchangam.html') : `rasi-palan/${lang}/`);

export async function loadBlog(langs) {
  const out = {};
  for (const l of langs) {
    const f = new URL(`../content/blog/${l}.mjs`, import.meta.url);
    if (existsSync(f)) out[l] = (await import(f.href)).default;
  }
  return out;
}

// Which guides are live today, newest first: [{ slug, date }]
export function published(todayIso) {
  return ORDER.map((slug, i) => ({ slug, date: addDays(BLOG_START, i) })).filter((p) => p.date <= todayIso).reverse();
}

export function buildBlog(root, todayIso, BLOG) {
  const langs = Object.keys(BLOG);
  const live = published(todayIso);
  const urls = [];
  const alt = (path) => langs.map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/blog/${l}/${path}">`).join('')
    + `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/blog/en/${path}">`;
  const card = (lang, p) => { const a = BLOG[lang].posts[p.slug]; return `<li class="guide-card"><a href="blog/${lang}/${p.slug}/"><strong>${esc(a.title)}</strong><span>${esc(a.desc)}</span><small>${esc(fmt(lang, p.date))}</small></a></li>`; };

  for (const lang of langs) {
    const B = BLOG[lang], U = B.ui;
    const dir = join(root, 'blog', lang);
    // remove guides that are no longer in ORDER, keep the folder tidy
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const posts = live.filter((p) => B.posts[p.slug]);

    // Index page for this language
    const idxUrl = `${SITE.url}/blog/${lang}/`;
    const idxLd = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'Blog', name: `${U.blog} | ${SITE.name}`, url: idxUrl, inLanguage: lang, description: U.intro, publisher: { '@id': `${SITE.url}/#org` },
        blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: B.posts[p.slug].title, url: `${idxUrl}${p.slug}/`, datePublished: `${p.date}T06:00:00+05:30` })) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE.name, item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: U.blog, item: idxUrl }] }
    ] })}</script>`;
    writeFileSync(join(dir, 'index.html'), layout({
      page: 'blog', file: `blog/${lang}/index.html`, title: `${esc(U.blog)} | ${SITE.name}`, description: U.intro, base: '../../', lang, alternates: alt(''), head: idxLd + `\n<link rel="alternate" type="application/rss+xml" title="${esc(U.blog)}" href="${idxUrl}feed.xml">`,
      body: `<nav class="crumbs" aria-label="Breadcrumb"><a href="${toolHref(lang, 'index.html')}">${SITE.name}</a> › <span>${esc(U.blog)}</span></nav>
<section class="hero sign-hero" style="grid-template-columns:1fr"><div><h1>${esc(U.blog)}</h1><p class="lede">${esc(U.intro)}</p></div></section>
<ul class="guide-list">${posts.map((p) => card(lang, p)).join('')}</ul>
<nav class="palan-nav"><a href="rasi-palan/${lang}/">${esc(U.tools.palan)} →</a><a href="${toolLink(lang, 'match')}">${esc(U.tools.match)} →</a></nav>`
    }));
    urls.push([idxUrl, todayIso]);

    // RSS feed, so readers and aggregators pick up each new guide
    writeFileSync(join(dir, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>${esc(U.blog)} | ${SITE.name}</title><link>${idxUrl}</link><description>${esc(U.intro)}</description><language>${lang}-IN</language>
${posts.map((p) => `<item><title>${esc(B.posts[p.slug].title)}</title><link>${idxUrl}${p.slug}/</link><guid>${idxUrl}${p.slug}/</guid><pubDate>${new Date(`${p.date}T00:30:00Z`).toUTCString()}</pubDate><description>${esc(B.posts[p.slug].desc)}</description></item>`).join('\n')}
</channel></rss>
`);

    // One page per guide
    for (const p of posts) {
      const a = B.posts[p.slug];
      const url = `${idxUrl}${p.slug}/`;
      const k = TOOL[p.slug];
      const others = (RELATED[p.slug] || []).map((s) => posts.find((x) => x.slug === s)).filter(Boolean);
      const more = [...others, ...posts.filter((x) => x.slug !== p.slug && !others.includes(x))].slice(0, 4);
      const ld = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [
        { '@type': 'BlogPosting', headline: a.title, description: a.desc, inLanguage: lang, datePublished: `${p.date}T06:00:00+05:30`, dateModified: `${p.date}T06:00:00+05:30`,
          author: { '@type': 'Organization', name: SITE.name, url: SITE.url }, publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/icons/icon-512.png` } },
          mainEntityOfPage: url, image: `${SITE.url}/icons/og.png`, articleSection: U.blog, wordCount: a.sections.map((s) => s.join(' ')).join(' ').split(/\s+/).length },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE.name, item: `${SITE.url}/` },
          { '@type': 'ListItem', position: 2, name: U.blog, item: idxUrl },
          { '@type': 'ListItem', position: 3, name: a.title, item: url }] }
      ] })}</script>`;
      mkdirSync(join(dir, p.slug), { recursive: true });
      writeFileSync(join(dir, p.slug, 'index.html'), layout({
        page: 'blog', file: `blog/${lang}/${p.slug}/index.html`, title: `${esc(a.title)} | ${SITE.name}`, description: a.desc, base: '../../../', lang, alternates: alt(`${p.slug}/`), head: ld,
        body: `<nav class="crumbs" aria-label="Breadcrumb"><a href="${toolHref(lang, 'index.html')}">${SITE.name}</a> › <a href="blog/${lang}/">${esc(U.blog)}</a> › <span>${esc(a.title)}</span></nav>
<article class="guide">
  <header class="hero sign-hero" style="grid-template-columns:1fr"><div><h1>${esc(a.title)}</h1><p class="lede">${esc(a.desc)}</p><p class="lede"><small>${esc(U.published)}: <time datetime="${p.date}">${esc(fmt(lang, p.date))}</time> · ${SITE.name}</small></p></div></header>
  <div class="guide-body">
${a.sections.map(([h, t], i) => `    <section><h2>${esc(h)}</h2><p>${esc(t)}</p></section>${i === 1 ? `\n    <aside class="guide-cta"><p>${esc(U.try)}</p><a class="btn" href="${toolLink(lang, k)}">${esc(U.tools[k])}</a></aside>` : ''}`).join('\n')}
    <aside class="guide-cta"><p>${esc(U.try)}</p><a class="btn" href="${toolLink(lang, k)}">${esc(U.tools[k])}</a></aside>
  </div>
</article>
${more.length ? `<section class="block"><h3>${esc(U.more)}</h3><ul class="guide-list">${more.map((x) => card(lang, x)).join('')}</ul></section>` : ''}
<nav class="palan-nav"><a href="blog/${lang}/">← ${esc(U.blog)}</a><a href="rasi-palan/${lang}/">${esc(U.tools.palan)} →</a></nav>`
      }).replace('<body data-page="blog"', `<body data-slug="${p.slug}" data-page="blog"`));
      urls.push([url, p.date]);
    }
  }

  // Language chooser at /blog/
  writeFileSync(join(root, 'blog', 'index.html'), layout({
    page: 'blog', file: 'blog/index.html', title: `Astrology guides in 10 Indian languages | ${SITE.name}`, base: '../',
    description: 'Free, simple guides to jathagam, marriage porutham, panchangam, Rahu Kalam, Chandrashtamam and Sade Sati in Tamil, Telugu, Kannada, Malayalam, Hindi, Marathi, Bengali, Gujarati, Odia and English.',
    alternates: alt(''),
    body: `<section class="hero" style="grid-template-columns:1fr"><div><h1>${langs.map((l) => esc(BLOG[l].ui.blog)).slice(0, 3).join(' · ')}</h1><p class="lede">${langs.map((l) => `<a style="color:var(--gold);margin-right:14px" href="blog/${l}/" hreflang="${l}" lang="${l}">${esc(BLOG[l].ui.blog)}</a>`).join('')}</p></div></section>`
  }));
  urls.push([`${SITE.url}/blog/`, todayIso]);
  return urls;
}

// Small "guides" box for other pages (rasi palan pages link the guides that matter to them)
export function guideLinks(BLOG, lang, todayIso, slugs) {
  const B = BLOG[lang]; if (!B) return '';
  const live = new Set(published(todayIso).map((p) => p.slug));
  const list = slugs.filter((s) => live.has(s) && B.posts[s]);
  if (!list.length) return '';
  return `<section class="block"><h3>${esc(B.ui.blog)}</h3><ul class="guide-links">${list.map((s) => `<li><a href="blog/${lang}/${s}/">${esc(B.posts[s].title)}</a></li>`).join('')}</ul><p><a href="blog/${lang}/">${esc(B.ui.more)} →</a></p></section>`;
}
