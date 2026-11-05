// Tells Bing (and Yandex, Seznam, Naver through the shared IndexNow network) which pages changed today,
// so the new rasi palan is crawled within minutes instead of days. Google does not use IndexNow; it reads
// the sitemap, which daily.mjs refreshes.
// Run after the site is live: node tools/indexnow.mjs        (pages changed today)
//                             node tools/indexnow.mjs all    (every page in the sitemap, e.g. after a big new batch)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// build.mjs is not imported on purpose: importing it rebuilds the pages and overwrites sitemap.xml before it is read.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = { url: 'https://rasivani.com' }, INDEXNOW_KEY = 'a7c3e91f5b2d4086b1e4f9c27d8a6e35'; // keep in step with SITE.url and INDEXNOW_KEY in build.mjs
const xml = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const entries = [...xml.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map((m) => ({ loc: m[1], lastmod: m[2] }));
const newest = entries.reduce((a, e) => (e.lastmod > a ? e.lastmod : a), '');
const urlList = entries.filter((e) => process.argv[2] === 'all' || e.lastmod === newest).map((e) => e.loc).slice(0, 10000);
const host = new URL(SITE.url).host;
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${SITE.url}/${INDEXNOW_KEY}.txt`, urlList })
});
console.log(`IndexNow: sent ${urlList.length} URLs, answer ${res.status} ${res.statusText}`);
// 200/202 = accepted. 403 = key file not live yet. 422 = URLs not on this host. Never fail the publish over it.
