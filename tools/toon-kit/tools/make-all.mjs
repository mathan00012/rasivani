// Makes every cartoon in stories/nov (or a folder you give) that is not made yet.
// Usage: node tools/make-all.mjs [folder] [fromDate] [toDate] [langs]
// Output per story: out/<date>-<slot>-<slug>/<lang>/video-short.mp4, thumb-short-1..3.png, titles-short.txt, description-short.txt, captions-short.srt
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [folder = 'stories/nov', from = '0000', to = '9999', langs = 'ta,te,hi,en'] = process.argv.slice(2);
const dir = path.resolve(ROOT, folder);
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.txt')).sort().filter((f) => f.slice(0, 10) >= from && f.slice(0, 10) <= to);
let made = 0, skipped = 0, failed = [];
for (const f of files) {
  const slug = f.replace(/\.txt$/, '');
  const missing = langs.split(',').filter((l) => !fs.existsSync(path.join(ROOT, 'out', slug, l, 'video-short.mp4')));
  if (!missing.length) { skipped++; continue; }
  console.log(`\n===== ${slug}  (${missing.join(',')}) =====`);
  const r = spawnSync(process.execPath, ['tools/make.mjs', path.join(folder, f), '--langs', missing.join(','), '--format', 'short'], {cwd: ROOT, stdio: 'inherit'});
  if (r.status === 0) made++; else failed.push(slug);
}
console.log(`\nDONE. Made ${made}, already done ${skipped}, failed ${failed.length}${failed.length ? ': ' + failed.join(', ') : ''}`);
console.log('Videos are in', path.join(ROOT, 'out'));
