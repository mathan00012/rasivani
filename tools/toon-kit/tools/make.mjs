// RasiVani Toons generator: story text -> voices -> video (Shorts and/or YouTube) -> 3 thumbnails -> titles, description, captions.
// Usage:  node tools/make.mjs stories/rahu-kalam.txt [--langs ta,te,en] [--format short|long|both]
// Output: out/<slug>/<lang>/  video-short.mp4, video-long.mp4, thumb-short-1..3.png, thumb-long-1..3.png, titles.txt, description.txt, captions.srt, story.json
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['ta', 'te', 'en', 'hi', 'kn', 'ml'];
const FPS = 30;
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const log = (...a) => console.log('[make]', ...a);

// ───────── 1. parse the story text ─────────
// Lines look like:  KEY: text   or   KEY: ta: ... | te: ... | en: ...
// Speaker lines:    VANI (happy, wave) [react: shock]: ta: ... | te: ... | en: ...
export function parseStory(src, fallbackLang = 'ta') {
  const st = {meta: {}, items: []};
  const multi = (s) => {
    const out = {};
    if (!/(^|\|)\s*(ta|te|en|hi|kn|ml)\s*:/.test(s)) { out._ = s.trim(); return out; }
    for (const part of s.split('|')) { const m = part.match(/^\s*(ta|te|en|hi|kn|ml)\s*:\s*([\s\S]*)$/); if (m) out[m[1]] = m[2].trim(); }
    return out;
  };
  let scene = 'studio';
  for (const raw of src.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Z]+)\s*(?:\(([^)]*)\))?\s*(?:\[([^\]]*)\])?\s*:\s*(.*)$/);
    if (!m) continue;
    const [, key, paren, brack, rest] = m;
    if (key === 'SCENE') { scene = rest.trim().toLowerCase(); st.items.push({type: 'scene', name: scene}); continue; }
    if (['SLUG', 'FORMAT', 'LOOK', 'LANGS', 'LINK', 'DATE'].includes(key)) { st.meta[key.toLowerCase()] = rest.trim(); continue; }
    if (['HOOK', 'CTA', 'DESC'].includes(key)) { st.meta[key.toLowerCase()] = multi(rest); continue; }
    if (['THUMB', 'TITLE'].includes(key)) { (st.meta[key.toLowerCase()] ||= []).push(multi(rest)); continue; }
    if (key === 'TAGS') { st.meta.tags = multi(rest); continue; }
    if (key === 'CARD') { st.items.push({type: 'card', text: multi(rest)}); continue; }
    const opts = (paren || '').split(',').map((s) => s.trim()).filter(Boolean);
    const react = (brack || '').match(/react\s*:\s*(\w+)/)?.[1];
    st.items.push({type: 'line', who: key, expr: opts[0] || 'neutral', pose: opts[1], react, text: multi(rest), scene});
  }
  st.meta.slug ||= 'story-' + Date.now();
  st.meta.fallbackLang = fallbackLang;
  return st;
}
const pickLang = (obj, lang, fb) => obj ? (obj[lang] ?? (lang === fb ? obj._ : undefined) ?? undefined) : undefined;

// ───────── 2. voices (Sarvam) ─────────
function sarvamKey() {
  const cands = [process.env.SARVAM_KEY_FILE, path.join(ROOT, 'sarvam-key.txt'), path.resolve(ROOT, '../../KEYS/sarvam/sarvam-key.txt.txt'),
    path.resolve(ROOT, '../KEYS/sarvam/sarvam-key.txt.txt'), 'D:/MADDY/rasivani/KEYS/sarvam/sarvam-key.txt.txt'].filter(Boolean);
  for (const c of cands) if (fs.existsSync(c)) return fs.readFileSync(c, 'utf8').trim();
  return process.env.SARVAM_API_KEY;
}
const VOICES = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/voices.json'), 'utf8'));

async function tts(text, lang, who, outFile) {
  if (fs.existsSync(outFile)) return;
  const v = VOICES[lang] || VOICES.en;
  const speaker = v.cast[who] || v.cast.DEFAULT;
  const key = sarvamKey();
  if (!key) throw new Error('No Sarvam key found. Put it in KEYS/sarvam/sarvam-key.txt.txt');
  const body = {text, target_language_code: v.language, speaker, model: v.model, pace: v.pace, speech_sample_rate: 24000};
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch('https://api.sarvam.ai/text-to-speech', {method: 'POST', headers: {'api-subscription-key': key, 'Content-Type': 'application/json'}, body: JSON.stringify(body)});
    if (r.ok) { const j = await r.json(); fs.writeFileSync(outFile, Buffer.concat(j.audios.map((a) => Buffer.from(a, 'base64')))); return; }
    const err = await r.text();
    if (r.status < 500 && r.status !== 429) throw new Error(`Sarvam ${r.status}: ${err.slice(0, 200)}`);
    await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)));
  }
  throw new Error('Sarvam failed 3 times');
}

// read a PCM16 WAV and return {dur, amp[] per frame}
function wavInfo(file) {
  const b = fs.readFileSync(file);
  let off = 12, sr = 24000, ch = 1, data = null;
  while (off < b.length - 8) {
    const id = b.toString('ascii', off, off + 4), size = b.readUInt32LE(off + 4);
    if (id === 'fmt ') { ch = b.readUInt16LE(off + 10); sr = b.readUInt32LE(off + 12); }
    if (id === 'data') { data = b.subarray(off + 8, off + 8 + Math.min(size, b.length - off - 8)); break; }
    off += 8 + size + (size % 2);
  }
  const n = Math.floor(data.length / 2 / ch), dur = n / sr, spf = sr / FPS, amps = [];
  for (let i = 0; i < Math.ceil(dur * FPS); i++) {
    let s = 0, c = 0;
    for (let k = Math.floor(i * spf); k < Math.min(n, Math.floor((i + 1) * spf)); k += 4) { const v = data.readInt16LE(k * 2 * ch) / 32768; s += v * v; c++; }
    amps.push(Math.sqrt(s / Math.max(1, c)));
  }
  const m = Math.max(...amps, 1e-6);
  return {dur, amp: amps.map((a) => Math.round(Math.min(1, (a / m) * 1.3) * 100) / 100)};
}

// ───────── 2b. auto-translate: lines written only in English get ta/te/hi from Sarvam (cached in stories/.tr-cache.json) ─────────
const SL = {ta: 'ta-IN', te: 'te-IN', hi: 'hi-IN', kn: 'kn-IN', ml: 'ml-IN'};
const FEMALE_WHO = new Set(['VANI', 'PAATI']);
async function translateStory(st, langs) {
  const need = langs.filter((l) => l !== 'en' && SL[l]);
  if (!need.length) return;
  const cacheFile = path.join(ROOT, 'stories', '.tr-cache.json');
  let cache = {}; try { cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } catch {}
  const key = sarvamKey();
  async function tr(text, lang, female) {
    if (!text || !/[A-Za-z]/.test(text)) return text;
    const ck = `${lang}|${female ? 'f' : 'm'}|${text}`;
    if (cache[ck]) return cache[ck];
    if (!key) throw new Error('No Sarvam key found for translation');
    const keep = []; const masked = text.replace(/rasivani dot com|RasiVani|VANI|#shorts/gi, (m) => { keep.push(m); return `{${keep.length - 1}}`; });
    for (const model of ['mayura:v1', 'sarvam-translate:v1']) {
      const body = {input: masked.replace(/\*/g, ''), source_language_code: 'en-IN', target_language_code: SL[lang], model, speaker_gender: female ? 'Female' : 'Male'};
      if (model === 'mayura:v1') body.mode = 'modern-colloquial';
      const r = await fetch('https://api.sarvam.ai/translate', {method: 'POST', headers: {'api-subscription-key': key, 'Content-Type': 'application/json'}, body: JSON.stringify(body)});
      if (!r.ok) { log('translate', model, r.status); continue; }
      let out = (await r.json()).translated_text || '';
      out = out.replace(/\{(\d+)\}/g, (m, i) => keep[+i] ?? m).replace(/rasivani dot com/gi, lang === 'ta' ? 'ராசிவாணி டாட் காம்' : lang === 'te' ? 'రాసివాణి డాట్ కామ్' : lang === 'hi' ? 'राशिवाणी डॉट कॉम' : 'rasivani dot com');
      if (out) { cache[ck] = out; fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 1)); return out; }
    }
    return text;
  }
  const fill = async (obj, female, joinSemi) => {
    if (!obj) return;
    const src = obj.en ?? obj._; if (!src) return;
    for (const l of need) if (!obj[l]) obj[l] = joinSemi ? (await Promise.all(src.split(';').map((x) => tr(x.trim(), l, female)))).join(' ; ') : await tr(src, l, female);
  };
  for (const k of ['hook', 'cta', 'desc']) await fill(st.meta[k], true);
  for (const k of ['thumb', 'title']) for (const o of st.meta[k] || []) await fill(o, true);
  const YOU = {ta: /(உங்க\S*|நீங்க\S*|உங்கள்\S*)/, te: /(మీ\S*|మీరు)/, hi: /(आप\S*|तुम\S*)/};
  for (const o of st.meta.thumb || []) for (const l of need) if (o[l] && !o[l].includes('*') && YOU[l]) o[l] = o[l].replace(YOU[l], '*$1*');
  if (st.meta.tags) for (const l of need) if (!st.meta.tags[l]) st.meta.tags[l] = (st.meta.tags.en || st.meta.tags._ || '') ;
  for (const it of st.items) {
    if (it.type === 'card') await fill(it.text, true, true);
    if (it.type === 'line') await fill(it.text, FEMALE_WHO.has(it.who));
  }
  log('translated to', need.join(','));
}

// ───────── 3. timeline ─────────
function placeCast(names) {
  const others = names.filter((n) => n !== 'VANI');
  const xs = others.length <= 1 ? [300] : others.length === 2 ? [200, 470] : [140, 360, 560];
  return [...others.map((w, i) => ({who: w, x: xs[i] ?? 300 + i * 120})), {who: 'VANI', x: others.length ? (others.length > 1 ? 820 : 780) : 540}];
}

async function buildStory(st, lang, format) {
  const fb = st.meta.fallbackLang;
  const dir = path.join(ROOT, 'public/gen', st.meta.slug, lang);
  fs.mkdirSync(dir, {recursive: true});
  const lines = [], scenes = [];
  let t = 0.35, pendingCard = null, lastSeg = -1;
  // split into scene segments; cast of a segment = VANI + everyone who speaks in it
  const segs = []; let curSeg = null;
  for (const it of st.items) {
    if (it.type === 'scene') { curSeg = {name: it.name, who: new Set(['VANI'])}; segs.push(curSeg); continue; }
    if (!curSeg) { curSeg = {name: 'studio', who: new Set(['VANI'])}; segs.push(curSeg); }
    if (it.type === 'line') curSeg.who.add(it.who);
    it.seg = segs.length - 1;
  }
  for (const it of st.items) {
    if (it.type === 'scene') continue;
    if (it.type === 'card') {
      const c = pickLang(it.text, lang, fb);
      if (c) { const [title, ...rows] = c.split(';').map((s) => s.trim()); pendingCard = {title, rows}; }
      continue;
    }
    const text = pickLang(it.text, lang, fb);
    if (!text) continue;
    if (it.seg !== lastSeg) {
      if (lines.length) t += 0.9;
      lastSeg = it.seg;
      scenes.push({name: segs[it.seg].name, from: Math.round(t * FPS) - (lines.length ? 14 : 0), cast: placeCast([...segs[it.seg].who])});
    }
    const sceneName = segs[it.seg].name;
    const h = crypto.createHash('md5').update(`${lang}|${it.who}|${text}|${JSON.stringify(VOICES[lang]?.cast?.[it.who] || '')}`).digest('hex').slice(0, 10);
    const file = path.join(dir, `${h}.wav`);
    await tts(text, lang, it.who, file);
    const {dur, amp} = wavInfo(file);
    lines.push({id: 'l' + lines.length, who: it.who, expr: it.expr, pose: it.pose, react: it.react, scene: sceneName, text,
      start: Math.round(t * FPS), frames: amp.length, amp, card: pendingCard || undefined, audio: `gen/${st.meta.slug}/${lang}/${h}.wav`});
    pendingCard = null;
    t += dur + 0.22;
    log(lang, `line ${lines.length}`, it.who, `${dur.toFixed(1)}s`);
  }
  const total = Math.round((t + 1.8) * FPS);
  return {slug: st.meta.slug, lang, format, fps: FPS, total, look: st.meta.look || 'classic',
    hook: pickLang(st.meta.hook, lang, fb), cta: pickLang(st.meta.cta, lang, fb), url: learnUrl(st.meta.slug, lang), lines, scenes, dir: `gen/${st.meta.slug}/${lang}`};
}

let LINK = null;
const linkUrl = (link, lang) => { const B = 'https://rasivani.com/';
  if (link.startsWith('learn:')) return `${B}learn/${lang}/${link.slice(6)}/`;
  if (link === 'rasi-palan') return `${B}rasi-palan/${lang}/`;
  if (link === 'home') return lang === 'en' ? B : `${B}${lang}/`;
  return lang === 'en' ? B + link : `${B}${lang}/${link}`; };
const learnUrl = (slug, lang) => LINK ? linkUrl(LINK, lang) : slug === 'rahu-kalam' ? (lang === 'en' ? 'https://rasivani.com/rahu-kalam/' : `https://rasivani.com/${lang}/rahu-kalam/`) : `https://rasivani.com/learn/${lang}/${slug}/`;

// ───────── 4. titles, description, captions ─────────
const T = {
  ta: {you: 'உங்க', know: 'உங்களுக்கு தெரியுமா?', full: 'முழு விளக்கம், உங்க ஊர் நேரத்துடன்', sub: 'இது போல தினமும் 👉 Subscribe', chapters: 'அத்தியாயங்கள்'},
  te: {you: 'మీ', know: 'మీకు తెలుసా?', full: 'పూర్తి వివరణ, మీ ఊరి సమయంతో', sub: 'ఇలాంటివి రోజూ 👉 Subscribe', chapters: 'అధ్యాయాలు'},
  en: {you: 'YOUR', know: 'Did YOU know?', full: 'Full explanation, for YOUR city', sub: 'New cartoon every day 👉 Subscribe', chapters: 'Chapters'},
  hi: {you: 'आपका', know: 'क्या आप जानते हैं?', full: 'पूरी जानकारी, आपके शहर के समय के साथ', sub: 'रोज़ नया कार्टून 👉 Subscribe', chapters: 'अध्याय'},
};
const ts = (sec) => { const m = Math.floor(sec / 60), s = Math.floor(sec % 60); return `${m}:${String(s).padStart(2, '0')}`; };
const srtTime = (sec) => { const ms = Math.round(sec * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };

function metaFiles(st, story, outDir) {
  const lang = story.lang, fb = st.meta.fallbackLang, t = T[lang] || T.en;
  const hook = story.hook || st.meta.slug;
  const titles = (st.meta.title || []).map((x) => pickLang(x, lang, fb)).filter(Boolean);
  if (titles.length < 3) titles.push(`${hook} ${t.know}`, `${t.you} ${hook.replace(/[?!]+$/, '')} 😲`, `${hook} | RasiVani cartoon`);
  const tags = (pickLang(st.meta.tags, lang, fb) || st.meta.tags?._ || st.meta.tags?.en || '').split(',').map((s) => s.trim()).filter(Boolean);
  const hashtags = [...(story.format === 'short' ? ['#shorts'] : []), ...tags.slice(0, 6).map((x) => '#' + x.replace(/\s+/g, '')), '#RasiVani'].join(' ');
  const desc = pickLang(st.meta.desc, lang, fb) || '';
  const chapters = story.scenes.map((s, i) => { const l = story.lines.find((x) => x.start >= s.from); return `${ts(i ? s.from / FPS : 0)} ${(l?.text || s.name).split(/[.!?]/)[0].slice(0, 40)}`; }).join('\n');
  const sfx = story.format;
  fs.writeFileSync(path.join(outDir, `titles-${sfx}.txt`), titles.slice(0, 3).map((x, i) => `${i + 1}. ${(sfx === 'long' ? x.replace(/\s*#shorts/g, '') : x).slice(0, 100)}`).join('\n') + '\n');
  fs.writeFileSync(path.join(outDir, `description-${sfx}.txt`),
    `${desc}\n\n👉 ${t.full}: ${story.url}\n\n${t.sub}\n\n${sfx === 'long' && story.scenes.length > 1 ? `${t.chapters}:\n${chapters}\n\n` : ''}${hashtags}\n\nTags: ${tags.join(', ')}\n`);
  const srt = story.lines.map((l, i) => `${i + 1}\n${srtTime(l.start / FPS)} --> ${srtTime((l.start + l.frames) / FPS)}\n${l.text}\n`).join('\n');
  fs.writeFileSync(path.join(outDir, `captions-${sfx}.srt`), srt);
}

// ───────── 5. render ─────────
async function render(stories, thumbsFor) {
  const {bundle} = await import('@remotion/bundler');
  const {renderMedia, renderStill, selectComposition} = await import('@remotion/renderer');
  log('bundling…');
  const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public')});
  const browserExecutable = process.env.REMOTION_BROWSER || null;
  for (const {story, outDir} of stories) {
    const comp = await selectComposition({serveUrl, id: 'Episode', inputProps: story, browserExecutable});
    const out = path.join(outDir, `video-${story.format}.mp4`);
    log('rendering', out, `${(story.total / FPS).toFixed(1)}s`);
    let last = -1;
    await renderMedia({serveUrl, composition: comp, codec: 'h264', crf: 20, outputLocation: out, inputProps: story, browserExecutable,
      concurrency: Number(process.env.CONCURRENCY || 2),
      onProgress: ({progress}) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; log(`  ${p * 10}%`); } }});
    for (let v = 0; v < 3; v++) {
      const tp = {...thumbsFor(story, v), format: story.format};
      const tc = await selectComposition({serveUrl, id: 'Thumb', inputProps: tp, browserExecutable});
      await renderStill({serveUrl, composition: tc, output: path.join(outDir, `thumb-${story.format}-${v + 1}.png`), inputProps: tp, browserExecutable});
    }
    log('done', outDir);
  }
}

// ───────── main ─────────
async function main() {
  const file = process.argv[2];
  if (!file) { console.log('Usage: node tools/make.mjs stories/<name>.txt [--langs ta,te,en] [--format short|long|both]'); process.exit(1); }
  const st = parseStory(fs.readFileSync(file, 'utf8'));
  const langs = (arg('langs', st.meta.langs) || 'ta').split(',').map((s) => s.trim()).filter((l) => LANGS.includes(l));
  LINK = st.meta.link || null;
  await translateStory(st, langs);
  const fmt = arg('format', st.meta.format || 'short');
  const formats = fmt === 'both' ? ['short', 'long'] : [fmt];
  const firstLocal = st.items.find((i) => i.type === 'line' && i.who !== 'VANI')?.who || 'THATHA';
  const mainScene = st.items.filter((i) => i.type === 'scene').map((i) => i.name)[1] || st.items.find((i) => i.type === 'scene')?.name || 'village';
  const jobs = [];
  for (const lang of langs) {
    const outDir = path.join(ROOT, 'out', st.meta.slug, lang);
    fs.mkdirSync(outDir, {recursive: true});
    for (const format of formats) {
      const story = await buildStory(st, lang, format);
      if (!story.lines.length) { log(lang, 'has no lines, skipped'); continue; }
      if (story.total / FPS > 180) log('WARNING: longer than 3 min');
      fs.writeFileSync(path.join(outDir, `story-${format}.json`), JSON.stringify(story));
      metaFiles(st, story, outDir);
      jobs.push({story, outDir});
    }
  }
  const thumbsFor = (story, v) => {
    const list = (st.meta.thumb || []).map((x) => pickLang(x, story.lang, st.meta.fallbackLang)).filter(Boolean);
    const t = T[story.lang] || T.en;
    const text = list[v] || list[0] || `*${t.you}* ${(story.hook || '').replace(/^\*?[^*]*\*\s*/, '')}`;
    return {variant: v, text, scene: mainScene, local: firstLocal, look: story.look};
  };
  if (process.argv.includes('--no-render')) return;
  await render(jobs, thumbsFor);
  log('ALL DONE →', path.join(ROOT, 'out', st.meta.slug));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error('[make] ERROR', e.message); process.exit(1); });
}
