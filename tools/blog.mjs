// RasiVani guides (the blog). Original articles live in content/blog/<lang>.mjs.
// One new guide goes live every day: guide number i is published on START + i days.
// Called from tools/daily.mjs, which runs every night, so new guides appear by themselves.
import { writeFileSync, mkdirSync, existsSync, rmSync, readFileSync, readdirSync, copyFileSync } from 'node:fs';
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

// ---------- Video stories: one post per YouTube episode (content/videos/epNN.mjs) ----------
// YouTube links live in content/videos/youtube.txt ("ep01 ta https://youtu.be/...").
const VIDEO_UI = {
  ta: { video: 'வீடியோ', watch: 'YouTube-இல் பாருங்கள்', soon: 'இந்த வீடியோ விரைவில் எங்கள் YouTube சேனலில் வரும்.', story: 'முழுக் கதை', play: 'வீடியோவை இயக்கு' },
  te: { video: 'వీడియో', watch: 'YouTubeలో చూడండి', soon: 'ఈ వీడియో త్వరలో మా YouTube ఛానెల్‌లో వస్తుంది.', story: 'పూర్తి కథ', play: 'వీడియో ప్లే చేయండి' },
  en: { video: 'Video', watch: 'Watch on YouTube', soon: 'This video is coming soon to our YouTube channel.', story: 'The full story', play: 'Play video' }
};
const ytId = (u) => { const m = String(u || '').match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/) || String(u || '').match(/^([\w-]{11})$/); return m ? m[1] : ''; };
export async function loadVideos() {
  const dir = new URL('../content/videos/', import.meta.url);
  if (!existsSync(dir)) return [];
  const links = {};
  const txt = new URL('youtube.txt', dir);
  if (existsSync(txt)) for (const line of readFileSync(txt, 'utf8').split(/\r?\n/)) {
    const m = line.trim().match(/^(ep\d+)\s+([a-z]{2})\s+(\S+)/); if (m && ytId(m[3])) links[`${m[1]} ${m[2]}`] = ytId(m[3]);
  }
  const eps = [];
  for (const f of readdirSync(dir).filter((x) => /^ep\d+\.mjs$/.test(x)).sort()) {
    const e = (await import(new URL(f, dir).href)).default;
    for (const l of Object.keys(e.langs)) e.langs[l].youtube = links[`${e.id} ${l}`] || '';
    eps.push(e);
  }
  return eps;
}
const plainTitle = (t) => t.replace(/\s+\|\s+/g, ': ');

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

export function buildBlog(root, todayIso, BLOG, VIDEOS = []) {
  const langs = Object.keys(BLOG);
  const live = published(todayIso);
  const urls = [];
  const alt = (path) => langs.map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/blog/${l}/${path}">`).join('')
    + `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/blog/en/${path}">`;
  const card = (lang, p) => { const a = p.video ? { title: p.title, desc: p.desc } : BLOG[lang].posts[p.slug]; return `<li class="guide-card${p.video ? ' is-video' : ''}"><a href="blog/${lang}/${p.slug}/">${p.video ? `<img src="${p.thumb}" alt="" loading="lazy" width="1280" height="720"><em>▶ ${esc(VIDEO_UI[lang]?.video || 'Video')}</em>` : ''}<strong>${esc(a.title)}</strong><span>${esc(a.desc)}</span><small>${esc(fmt(lang, p.date))}</small></a></li>`; };
  const liveVideos = VIDEOS.filter((e) => e.date <= todayIso);

  for (const lang of langs) {
    const B = BLOG[lang], U = B.ui;
    const dir = join(root, 'blog', lang);
    // remove guides that are no longer in ORDER, keep the folder tidy
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const posts = live.filter((p) => B.posts[p.slug]);
    const vids = liveVideos.filter((e) => e.langs[lang]).map((e) => ({ video: e, slug: e.slug, date: e.date, title: plainTitle(e.langs[lang].title), desc: e.langs[lang].desc, thumb: `images/videos/${e.id}-${lang}.jpg` }));
    // Everything for the list, newest first (a video comes before a guide of the same day)
    const entries = [...vids, ...posts.map((p) => ({ ...p, title: B.posts[p.slug].title, desc: B.posts[p.slug].desc }))]
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.video ? -1 : 0) - (b.video ? -1 : 0)));

    // Index page for this language
    const idxUrl = `${SITE.url}/blog/${lang}/`;
    const idxLd = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'Blog', name: `${U.blog} | ${SITE.name}`, url: idxUrl, inLanguage: lang, description: U.intro, publisher: { '@id': `${SITE.url}/#org` },
        blogPost: entries.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${idxUrl}${p.slug}/`, datePublished: `${p.date}T06:00:00+05:30` })) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE.name, item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: U.blog, item: idxUrl }] }
    ] })}</script>`;
    writeFileSync(join(dir, 'index.html'), layout({
      page: 'blog', file: `blog/${lang}/index.html`, title: `${esc(U.blog)} | ${SITE.name}`, description: U.intro, base: '../../', lang, alternates: alt(''), head: idxLd + `\n<link rel="alternate" type="application/rss+xml" title="${esc(U.blog)}" href="${idxUrl}feed.xml">`,
      body: `<nav class="crumbs" aria-label="Breadcrumb"><a href="${toolHref(lang, 'index.html')}">${SITE.name}</a> › <span>${esc(U.blog)}</span></nav>
<section class="hero sign-hero" style="grid-template-columns:1fr"><div><h1>${esc(U.blog)}</h1><p class="lede">${esc(U.intro)}</p></div></section>
<ul class="guide-list">${entries.map((p) => card(lang, p)).join('')}</ul>
<nav class="palan-nav"><a href="rasi-palan/${lang}/">${esc(U.tools.palan)} →</a><a href="${toolLink(lang, 'match')}">${esc(U.tools.match)} →</a></nav>`
    }));
    urls.push([idxUrl, todayIso]);

    // RSS feed, so readers and aggregators pick up each new guide
    writeFileSync(join(dir, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>${esc(U.blog)} | ${SITE.name}</title><link>${idxUrl}</link><description>${esc(U.intro)}</description><language>${lang}-IN</language>
${entries.map((p) => `<item><title>${esc(p.title)}</title><link>${idxUrl}${p.slug}/</link><guid>${idxUrl}${p.slug}/</guid><pubDate>${new Date(`${p.date}T00:30:00Z`).toUTCString()}</pubDate><description>${esc(p.desc)}</description></item>`).join('\n')}
</channel></rss>
`);

    // One page per video story
    for (const v of vids) {
      const e = v.video, L = e.langs[lang], VU = VIDEO_UI[lang] || VIDEO_UI.en;
      const url = `${idxUrl}${v.slug}/`, thumbAbs = `${SITE.url}/${v.thumb}`;
      const vAlt = Object.keys(e.langs).map((l) => `\n<link rel="alternate" hreflang="${l}" href="${SITE.url}/blog/${l}/${e.slug}/">`).join('')
        + (e.langs.en ? `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/blog/en/${e.slug}/">` : '');
      const others = entries.filter((x) => x.slug !== v.slug).slice(0, 4);
      const graph = [
        { '@type': 'BlogPosting', headline: v.title, description: v.desc, inLanguage: lang, datePublished: `${e.date}T06:00:00+05:30`, dateModified: `${e.date}T06:00:00+05:30`,
          author: { '@type': 'Organization', name: SITE.name, url: SITE.url }, publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/icons/icon-512.png` } },
          mainEntityOfPage: url, image: thumbAbs, articleSection: U.blog },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE.name, item: `${SITE.url}/` },
          { '@type': 'ListItem', position: 2, name: U.blog, item: idxUrl },
          { '@type': 'ListItem', position: 3, name: v.title, item: url }] }];
      if (L.youtube) graph.push({ '@type': 'VideoObject', name: v.title, description: v.desc, inLanguage: lang, thumbnailUrl: thumbAbs, uploadDate: `${e.date}T06:00:00+05:30`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${L.youtube}`, url: `https://www.youtube.com/watch?v=${L.youtube}`, publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/icons/icon-512.png` } } });
      const player = L.youtube
        ? `<figure class="video-box"><a class="video-lite" href="https://www.youtube.com/watch?v=${L.youtube}" data-yt="${L.youtube}" aria-label="${esc(VU.play)}: ${esc(v.title)}"><img src="${v.thumb}" alt="${esc(L.video_title)}" width="1280" height="720"><span class="video-play" aria-hidden="true">▶</span></a><figcaption><a href="https://www.youtube.com/watch?v=${L.youtube}">${esc(VU.watch)} →</a></figcaption></figure>`
        : `<figure class="video-box"><img src="${v.thumb}" alt="${esc(L.video_title)}" width="1280" height="720"><figcaption>${esc(VU.soon)}</figcaption></figure>`;
      mkdirSync(join(dir, v.slug), { recursive: true });
      writeFileSync(join(dir, v.slug, 'index.html'), layout({
        page: 'blog', file: `blog/${lang}/${v.slug}/index.html`, title: `${esc(v.title)} | ${SITE.name}`, description: v.desc, base: '../../../', lang, alternates: vAlt,
        head: `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`,
        body: `<nav class="crumbs" aria-label="Breadcrumb"><a href="${toolHref(lang, 'index.html')}">${SITE.name}</a> › <a href="blog/${lang}/">${esc(U.blog)}</a> › <span>${esc(v.title)}</span></nav>
<article class="guide">
  <header class="hero sign-hero" style="grid-template-columns:1fr"><div><p class="lede"><small>▶ ${esc(L.series)}</small></p><h1>${esc(v.title)}</h1><p class="lede">${esc(v.desc)}</p><p class="lede"><small>${esc(U.published)}: <time datetime="${e.date}">${esc(fmt(lang, e.date))}</time> · ${SITE.name}</small></p></div></header>
  ${player}
  <div class="guide-body">
    <h2>${esc(VU.story)}</h2>
${L.sections.map(([h, lines], i) => `    <section>${h ? `<h2>${esc(h)}</h2>` : ''}<p>${esc(lines.join(' '))}</p></section>${i === 2 ? `\n    <aside class="guide-cta"><p>${esc(U.try)}</p><a class="btn" href="${toolLink(lang, 'chart')}">${esc(U.tools.chart)}</a></aside>` : ''}`).join('\n')}
    <aside class="guide-cta"><p>${esc(U.try)}</p><a class="btn" href="${toolLink(lang, 'chart')}">${esc(U.tools.chart)}</a></aside>
  </div>
</article>
${others.length ? `<section class="block"><h3>${esc(U.more)}</h3><ul class="guide-list">${others.map((x) => card(lang, x)).join('')}</ul></section>` : ''}
<nav class="palan-nav"><a href="blog/${lang}/">← ${esc(U.blog)}</a><a href="rasi-palan/${lang}/">${esc(U.tools.palan)} →</a></nav>
<script>document.querySelectorAll('.video-lite').forEach(function(a){a.addEventListener('click',function(ev){ev.preventDefault();var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+a.dataset.yt+'?autoplay=1&rel=0';f.title=a.getAttribute('aria-label');f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;a.replaceWith(f);});});</script>`
      }).replace('<body data-page="blog"', `<body data-slug="${v.slug}" data-alt="${esc(JSON.stringify(Object.fromEntries(langs.map((l) => [l, e.langs[l] ? `blog/${l}/${v.slug}/` : `blog/${l}/`]))))}" data-page="blog"`)
        .replace(new RegExp(`href="blog/([a-z]{2})/${v.slug}/"`, 'g'), (m, l) => (e.langs[l] ? m : `href="blog/${l}/"`)));
      urls.push([url, e.date]);
    }

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
