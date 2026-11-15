// Makes the 25 Flow start images for one or more days, with VANI's locked face.
// Run from D:\MADDY\rasivani\youtube\vani\flow-plan :
//   node make-start-frames.mjs 2026-11-15            (one day)
//   node make-start-frames.mjs 2026-11-15 2026-11-16 (several days)
// Output: ..\flow-inbox\<date>\start\01.jpg ... 20.jpg, R1.jpg ... R5.jpg  +  ..\flow-inbox\<date>\PROMPTS.txt
// Already-made pictures are skipped, so delete a bad one and run again to remake only that one.
// Cost: Pollinations about $0.005 per picture (25 a day = about Rs 11).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const plan = JSON.parse(fs.readFileSync(path.join(here, 'plan.json'), 'utf8'));
const ref = path.join(here, 'VANI-official-face.jpg');
// Works whether this folder sits in vani\flow-plan\ or straight in vani\
const inbox = fs.existsSync(path.join(here, 'flow-inbox')) ? path.join(here, 'flow-inbox') : path.join(here, '..', 'flow-inbox');

function findKey() {
  if (process.env.POLLINATIONS_KEY) return process.env.POLLINATIONS_KEY.trim();
  const spots = [
    path.join(here, 'pollinations-key.txt'),
    path.join(here, '..', 'vani-studio', 'pollinations-key.txt'),
    'D:\\MADDY\\rasivani\\youtube\\vani\\vani-studio\\pollinations-key.txt',
  ];
  for (const dir of ['D:\\MADDY\\rasivani\\KEYS\\pollinations', 'D:\\MADDY\\rasivani\\KEYS\\Pollinations', 'D:\\MADDY\\rasivani\\KEYS']) {
    try { for (const f of fs.readdirSync(dir)) if (/pollinations.*\.txt/i.test(f) || (/\.txt/i.test(f) && /pollinations/i.test(dir))) spots.push(path.join(dir, f)); } catch {}
  }
  for (const s of spots) { try { const k = fs.readFileSync(s, 'utf8').trim(); if (k) return k; } catch {} }
  return null;
}
const KEY = findKey();
if (!KEY) { console.log('No Pollinations key found. Put it in pollinations-key.txt next to this script (never share it).'); process.exit(1); }
if (!fs.existsSync(ref)) { console.log('VANI-official-face.jpg is missing next to this script.'); process.exit(1); }

async function makeImage(clip) {
  const size = '768x1344';
  const model = process.env.POL_MODEL || 'black-forest-labs/flux-3-image-klein';
  if (clip.face) {
    const form = new FormData();
    form.append('model', model);
    form.append('prompt', ('The same woman from the reference image: same face, same short wavy hair with the copper streak and the gold star clip. ' + clip.image).slice(0, 2000));
    form.append('size', size);
    form.append('seed', String(Math.floor(Math.random() * 1e9)));
    form.append('image', new Blob([fs.readFileSync(ref)], { type: 'image/jpeg' }), 'vani.jpg');
    const r = await fetch('https://gen.pollinations.ai/v1/images/edits', { method: 'POST', headers: { Authorization: 'Bearer ' + KEY }, body: form });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.data?.[0]?.b64_json) throw new Error('pollinations ' + r.status + ' ' + JSON.stringify(j).slice(0, 200));
    return Buffer.from(j.data[0].b64_json, 'base64');
  }
  const r = await fetch('https://gen.pollinations.ai/v1/images/generations', { method: 'POST', headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, prompt: clip.image.slice(0, 2000), size, seed: Math.floor(Math.random() * 1e9), response_format: 'b64_json' }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.data?.[0]?.b64_json) throw new Error('pollinations ' + r.status + ' ' + JSON.stringify(j).slice(0, 200));
  return Buffer.from(j.data[0].b64_json, 'base64');
}

const dates = process.argv.slice(2);
if (!dates.length) { console.log('Give a date, for example: node make-start-frames.mjs 2026-11-15'); process.exit(1); }
for (const date of dates) {
  const day = plan.find((d) => d.date === date);
  if (!day) { console.log('No plan for ' + date + '. Dates run 2026-11-14 to 2026-11-30.'); continue; }
  const dir = path.join(inbox, date, 'start');
  fs.mkdirSync(dir, { recursive: true });
  const clips = day.clips.concat(day.rclips);
  const txt = [`${day.title}  (${day.place}, ${day.era})`, `Hook: ${day.hook}`, `Outfit: ${day.outfit}`, ''];
  for (const c of clips) txt.push(`=== ${c.id}  [${c.account}] ${c.typeName}`, `START IMAGE: start\\${c.id}.jpg`, `FLOW PROMPT:`, c.flow, '');
  fs.writeFileSync(path.join(inbox, date, 'PROMPTS.txt'), txt.join('\r\n'));
  console.log(`\n${date}: ${day.title}`);
  console.log('  Using plan file: ' + path.join(here, 'plan.json') + (JSON.stringify(day).includes('no children') ? '  (new, adults-only plan)' : '  (OLD plan! copy the new plan.json here)'));
  for (const c of clips) {
    const out = path.join(dir, c.id + '.jpg');
    if (fs.existsSync(out)) { console.log('  ' + c.id + ' already there'); continue; }
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { fs.writeFileSync(out, await makeImage(c)); console.log('  ' + c.id + ' done' + (c.face ? ' (VANI face)' : '')); break; }
      catch (e) { console.log('  ' + c.id + ' try ' + attempt + ' failed: ' + e.message); await new Promise((r) => setTimeout(r, 4000 * attempt)); }
    }
  }
}
console.log('\nFinished. Open the start folder, check the faces, delete any bad picture and run again to remake it.');
