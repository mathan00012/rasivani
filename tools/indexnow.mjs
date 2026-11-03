// Tells Bing (and Yandex, Seznam, Naver through the shared IndexNow network) which pages changed today,
// so the new rasi palan is crawled within minutes instead of days. Google does not use IndexNow; it reads
// the sitemap, which daily.mjs refreshes.
// Run after the site is live: node tools/indexnow.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, INDEXNOW_KEY } from './build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const xml = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const entries = [...xml.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map((m) => ({ loc: m[1], lastmod: m[2] }));
const newest = entries.reduce((a, e) => (e.lastmod > a ? e.lastmod : a), '');
const urlList = entries.filter((e) => e.lastmod === newest).map((e) => e.loc).slice(0, 10000);
const host = new URL(SITE.url).host;
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${SITE.url}/${INDEXNOW_KEY}.txt`, urlList })
});
console.log(`IndexNow: sent ${urlList.length} URLs, answer ${res.status} ${res.statusText}`);
// 200/202 = accepted. 403 = key file not live yet. 422 = URLs not on this host. Never fail the publish over it.
