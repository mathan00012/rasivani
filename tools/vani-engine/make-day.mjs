// VANI daily engine: 25 Flow clips in, finished videos out.
//   node make-day.mjs 2026-11-15              (all 4 languages)
//   node make-day.mjs 2026-11-15 ta,hi        (only some languages)
// Reads   ..\flow-inbox\<date>\01.mp4 ... 20.mp4, R1.mp4 ... R5.mp4
// Writes  ..\ready\<date>\<lang>\  story video, rasi palan intro/outro/background, thumbnails A/B, UPLOAD.txt
// Voices: Sarvam (key in D:\MADDY\rasivani\KEYS\sarvam\ or sarvam-key.txt here). English keeps Flow's own voices.
// Your own voice wins: put flow-inbox\<date>\voice-ta\07.wav (or .mp3/.m4a) and clip 07 uses it.
// Translations are saved in flow-inbox\<date>\text-<lang>.json. Fix a line there and run again; only changed lines get new voices.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ENGINE = path.dirname(fileURLToPath(import.meta.url));
const VANI = process.env.VANI_DIR || path.resolve(ENGINE, '..');
const require = createRequire(import.meta.url);
const FFMPEG = (() => { try { return require('ffmpeg-static'); } catch { return 'ffmpeg'; } })();
const FFPROBE = (() => { try { return require('ffprobe-static').path; } catch { return 'ffprobe'; } })();
const DRY = !!process.env.DRY; // test mode: silent voices, no Sarvam calls

const planFile = [path.join(ENGINE, 'plan.json'), path.join(VANI, 'flow-plan', 'plan.json'), path.join(VANI, 'plan.json')].find((f) => fs.existsSync(f));
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
const inboxRoot = path.join(VANI, 'flow-inbox');
let [date, langArg] = process.argv.slice(2);
if (!date) date = fs.readdirSync(inboxRoot).filter((d) => /^\d{4}-\d\d-\d\d$/.test(d)).sort().pop();
const day = plan.find((d) => d.date === date);
if (!day) { console.log('No story planned for ' + date); process.exit(1); }
const LANGS = (langArg || 'ta,te,hi,en').split(',').map((s) => s.trim()).filter(Boolean);
const inbox = path.join(inboxRoot, date);
const readyRoot = path.join(VANI, 'ready', date);
const log = (...a) => console.log(...a);

// ---------- tools ----------
const run = (args, opts = {}) => execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'pipe'], maxBuffer: 1 << 26, ...opts });
function probe(f) {
  const j = JSON.parse(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', f]).toString());
  return { dur: parseFloat(j.format.duration) || 0, audio: (j.streams || []).some((s) => s.codec_type === 'audio') };
}
function findKey() {
  if (process.env.SARVAM_API_KEY) return process.env.SARVAM_API_KEY.trim();
  const spots = [path.join(ENGINE, 'sarvam-key.txt'), path.join(VANI, 'vani-studio', 'sarvam-key.txt')];
  for (const dir of ['D:\\MADDY\\rasivani\\KEYS\\sarvam', 'D:\\MADDY\\rasivani\\KEYS\\Sarvam', 'D:\\MADDY\\rasivani\\KEYS\\SARVAM']) {
    try { for (const f of fs.readdirSync(dir)) if (/\.txt$/i.test(f)) spots.push(path.join(dir, f)); } catch {}
  }
  for (const s of spots) { try { const k = fs.readFileSync(s, 'utf8').trim(); if (k) return k; } catch {} }
  return null;
}
const KEY = DRY ? null : findKey();

// ---------- fonts (Windows: Nirmala UI covers Tamil, Telugu, Hindi) ----------
const FONTDIR = path.join(ENGINE, 'fonts');
fs.mkdirSync(FONTDIR, { recursive: true });
if (process.platform === 'win32') {
  for (const f of fs.readdirSync('C:\\Windows\\Fonts')) {
    if (/^(nirmala.*|impact|arialbd)\.(ttf|ttc)$/i.test(f) && !fs.existsSync(path.join(FONTDIR, f))) {
      try { fs.copyFileSync(path.join('C:\\Windows\\Fonts', f), path.join(FONTDIR, f)); } catch {}
    }
  }
}
const haveNirmala = fs.readdirSync(FONTDIR).some((f) => /^nirmala/i.test(f));
const FONT = {
  en: haveNirmala ? 'Arial' : 'Noto Sans', big: haveNirmala ? 'Impact' : 'Noto Sans',
  ta: haveNirmala ? 'Nirmala UI' : 'Noto Sans Tamil', te: haveNirmala ? 'Nirmala UI' : 'Noto Sans Telugu', hi: haveNirmala ? 'Nirmala UI' : 'Noto Sans Devanagari',
};

// ---------- language settings ----------
const L = {
  en: { code: 'en-IN', vani: 'ritu_en_reels', male: 'shubh_en_audiobook', female: 'roopa_en_conversational', words: 3, site: 'https://rasivani.com/', rahu: 'https://rasivani.com/rahu-kalam/' },
  ta: { code: 'ta-IN', vani: 'chaitra_kn_conversation', male: 'vijay_ta_narration', female: 'suchitra_kn_narration', words: 2, site: 'https://rasivani.com/ta/', rahu: 'https://rasivani.com/ta/rahu-kalam/' },
  te: { code: 'te-IN', vani: 'kavitha_te_conversation', male: 'tarun_te_narration', female: 'pooja_te_conversation', words: 2, site: 'https://rasivani.com/te/', rahu: 'https://rasivani.com/te/rahu-kalam/' },
  hi: { code: 'hi-IN', vani: 'chaitra_kn_narration', male: 'vijay_ta_narration', female: 'suchitra_kn_narration', words: 3, site: 'https://rasivani.com/hi/', rahu: 'https://rasivani.com/hi/rahu-kalam/' },
};
const FIXED = {
  en: ['🔮 Free jathagam, marriage porutham & daily rasi palan: https://rasivani.com/', '⏰ Today\u2019s Rahu kalam: https://rasivani.com/rahu-kalam/', 'VANI is an AI-made time-travel reporter. Places and facts are real history; legends are told as legends.'],
  ta: ['🔮 இலவச ஜாதகம், திருமண பொருத்தம், தினசரி ராசி பலன்: https://rasivani.com/ta/', '⏰ இன்றைய ராகு காலம்: https://rasivani.com/ta/rahu-kalam/', 'VANI ஒரு AI உருவாக்கிய கால-பயண நிருபர். இடங்களும் தகவல்களும் உண்மையான வரலாறு; புராணக் கதைகள் கதைகளாகவே சொல்லப்படுகின்றன.'],
  te: ['🔮 ఉచిత జాతకం, వివాహ పొంతన, రోజువారీ రాశి ఫలాలు: https://rasivani.com/te/', '⏰ నేటి రాహు కాలం: https://rasivani.com/te/rahu-kalam/', 'VANI ఒక AI సృష్టించిన టైమ్-ట్రావెల్ రిపోర్టర్. ప్రదేశాలు, వాస్తవాలు నిజమైన చరిత్ర; పురాణాలను పురాణాలుగానే చెబుతాము.'],
  hi: ['🔮 मुफ़्त कुंडली, विवाह मिलान और दैनिक राशिफल: https://rasivani.com/hi/', '⏰ आज का राहु काल: https://rasivani.com/hi/rahu-kalam/', 'VANI एक AI से बनी टाइम-ट्रैवल रिपोर्टर है। जगहें और तथ्य असली इतिहास हैं; किंवदंतियों को किंवदंती ही कहा गया है।'],
};
const TAGS = { en: '#RasiVani #VANI #TimeTravel #IndianHistory #History', ta: '#RasiVani #VANI #தமிழ் #வரலாறு #TamilHistory', te: '#RasiVani #VANI #తెలుగు #చరిత్ర #TeluguHistory', hi: '#RasiVani #VANI #हिंदी #इतिहास #HindiHistory' };
const FEMALE = /(woman|women|wife|mother|grandmother|paati|aunty|girl|daughter|bride|lady|seller woman|volunteer|lamp-keeper|apprentice|ponnamma|selvi|kamakshi|gowramma|kamala|nila|ponni|valli|fish seller)/i;

// ---------- clips ----------
const allIds = day.clips.map((c) => c.id).concat(day.rclips.map((c) => c.id));
function findClips() {
  const files = fs.readdirSync(inbox).filter((f) => /\.(mp4|mov|webm)$/i.test(f));
  const map = {};
  for (const id of allIds) {
    const f = files.find((x) => x.replace(/\.[^.]+$/, '').toUpperCase() === id.toUpperCase());
    if (f) map[id] = path.join(inbox, f);
  }
  const used = new Set(Object.values(map));
  const loose = files.map((f) => path.join(inbox, f)).filter((f) => !used.has(f)).sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs);
  const missing = allIds.filter((id) => !map[id]);
  if (loose.length) {
    log(`  ${loose.length} clips are not named 01..20 / R1..R5. Using them in download-time order for: ${missing.slice(0, loose.length).join(', ')}`);
    missing.slice(0, loose.length).forEach((id, i) => { map[id] = loose[i]; });
  }
  return map;
}

// ---------- Sarvam ----------
async function sarvam(url, body) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch('https://api.sarvam.ai/' + url, { method: 'POST', headers: { 'api-subscription-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.ok) return r.json();
    const t = await r.text();
    if (r.status === 429 || r.status >= 500) { await new Promise((res) => setTimeout(res, 2000 * (i + 1))); continue; }
    throw new Error(url + ' ' + r.status + ' ' + t.slice(0, 200));
  }
  throw new Error(url + ' kept failing');
}
async function translate(text, lang, female) {
  if (lang === 'en' || !text) return text;
  if (!KEY) return text;
  const t = text.replace(/\u2019/g, "'");
  try {
    const j = await sarvam('translate', { input: t, source_language_code: 'en-IN', target_language_code: L[lang].code, model: 'mayura:v1', mode: 'modern-colloquial', speaker_gender: female ? 'Female' : 'Male' });
    return j.translated_text || text;
  } catch (e) {
    const j = await sarvam('translate', { input: t, source_language_code: 'en-IN', target_language_code: L[lang].code, model: 'sarvam-translate:v1' });
    return j.translated_text || text;
  }
}
async function tts(text, lang, speaker, out) {
  if (!KEY) { // test mode: silence as long as the line would take
    run(['-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(Math.max(1, text.length * 0.065)), out]);
    return;
  }
  let j;
  try { j = await sarvam('text-to-speech', { text, target_language_code: L[lang].code, speaker, model: 'bulbul:v4-flash', pace: 1.08, speech_sample_rate: 24000 }); }
  catch (e) { log('    voice ' + speaker + ' refused, using default voice: ' + e.message.slice(0, 80)); j = await sarvam('text-to-speech', { text, target_language_code: L[lang].code, model: 'bulbul:v4-flash', speech_sample_rate: 24000 }); }
  fs.writeFileSync(out, Buffer.concat(j.audios.map((a) => Buffer.from(a, 'base64'))));
}

// ---------- text pack per language (cached, editable) ----------
const year = (day.era.match(/\d{3,4}/) || [''])[0];
async function textPack(lang) {
  const file = path.join(inbox, `text-${lang}.json`);
  let pack = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  if (pack && pack._lang === lang) return pack;
  log(`  translating to ${lang}...`);
  const tr = (t, f = true) => translate(t, lang, f); // VANI (a woman) speaks titles and hooks
  pack = { _lang: lang, _note: 'Edit any line and run again. Delete voice-' + lang + ' files for that clip to remake its voice.', lines: {} };
  pack.title = await tr(day.title);
  pack.hook = await tr(day.hook);
  pack.titleC = await tr(`Would YOU survive ${SHORTPLACE()}${year ? ' in ' + year : ''}?`);
  pack.goal = await tr(`My mission: ${day.goal.charAt(0).toLowerCase() + day.goal.slice(1)}, ${day.deadline}.`);
  pack.thumbA = await tr('I was there!');
  pack.thumbB = await tr('Would YOU survive?');
  pack.end = await tr('Your free jathagam and daily rasi palan');
  for (const c of day.clips.concat(day.rclips)) {
    pack.lines[c.id] = [];
    for (const s of c.speech || []) {
      const female = s.who === 'VANI' || FEMALE.test(s.name + ' ' + c.scene.split(';')[0]);
      pack.lines[c.id].push({ who: s.who, name: s.name, female, text: await tr(s.text, female) });
    }
  }
  fs.writeFileSync(file, JSON.stringify(pack, null, 1));
  return pack;
}
function SHORTPLACE() { return day.place.replace(/^(a |an |the )/i, '').replace(/^.*? of /, ''); }

// ---------- ASS captions ----------
const assEsc = (s) => String(s).replace(/[{}]/g, '').replace(/\\/g, '').replace(/\n/g, '\\N');
const t2 = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = (s % 60).toFixed(2).padStart(5, '0'); return `${h}:${String(m).padStart(2, '0')}:${x}`; };
function assHeader(lang, w = 720, h = 1280) {
  const f = FONT[lang] || FONT.en;
  return `[Script Info]\nScriptType: v4.00+\nPlayResX: ${w}\nPlayResY: ${h}\nWrapStyle: 0\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n` +
    `Style: Cap,${f},${lang === 'en' ? 62 : 56},&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,5,2,2,40,40,330,1\n` +
    `Style: Hook,${f},44,&H00FFFFFF,&H00FFFFFF,&H003C1EFF,&H003C1EFF,-1,0,0,0,100,100,0,0,3,14,0,8,50,50,150,1\n` +
    `Style: End,${f},50,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,-1,0,0,0,100,100,0,0,3,18,0,5,40,40,0,1\n` +
    `Style: Url,${FONT.en},58,&H0000E5FF,&H0000E5FF,&H00000000,&H96000000,-1,0,0,0,100,100,0,0,1,5,0,5,40,40,0,1\n` +
    `Style: Big,${lang === 'en' ? FONT.big : f},${lang === 'en' ? 210 : 150},&H0000E5FF,&H0000E5FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,10,4,2,40,40,640,1\n` +
    `Style: Sub,${f},${lang === 'en' ? 92 : 80},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,8,3,2,40,40,440,1\n` +
    `Style: Red,${lang === 'en' ? FONT.big : f},${lang === 'en' ? 130 : 104},&H00FFFFFF,&H00FFFFFF,&H003C1EFF,&H003C1EFF,-1,0,0,0,100,100,0,0,3,22,0,2,50,50,560,1\n\n` +
    `[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
}
function chunks(text, n) { const w = text.split(/\s+/).filter(Boolean); const out = []; for (let i = 0; i < w.length; i += n) out.push(w.slice(i, i + n).join(' ')); return out; }
function capEvents(parts, lang) { // parts: [{text,start,end}]
  let ev = '';
  for (const p of parts) {
    const cs = chunks(p.text, L[lang].words); const total = cs.reduce((a, c) => a + c.length + 2, 0) || 1;
    let t = p.start;
    for (const c of cs) { const d = ((c.length + 2) / total) * (p.end - p.start); ev += `Dialogue: 0,${t2(t)},${t2(t + d)},Cap,,0,0,0,,${assEsc(c.toUpperCase())}\n`; t += d; }
  }
  return ev;
}

// ---------- one segment ----------
const SHORT_TYPES = { w: 4.5, x: 4.5, p: 5.5 };
async function segment(c, src, lang, pack, work, opts = {}) {
  const info = probe(src);
  const lines = pack.lines[c.id] || [];
  const out = path.join(work, c.id + '.mp4');
  const ass = path.join(work, c.id + '.ass');
  let T = Math.min(info.dur, SHORT_TYPES[c.type] || info.dur);
  if (opts.maxLen) T = Math.min(T, opts.maxLen);
  let audioArgs; let caps = [];
  const own = ['wav', 'mp3', 'm4a'].map((e) => path.join(inbox, 'voice-' + lang, c.id + '.' + e)).find((f) => fs.existsSync(f));
  if (lines.length && (lang !== 'en' || own)) {
    // build the voice track: own recording, or Sarvam lines with short gaps
    const vdir = path.join(inbox, 'voice-' + lang); fs.mkdirSync(vdir, { recursive: true });
    let voice = own;
    if (!voice) {
      const parts = [];
      for (let k = 0; k < lines.length; k++) {
        const ln = lines[k]; const f = path.join(vdir, `${c.id}-${k + 1}.wav`); const meta = f + '.txt';
        if (!fs.existsSync(f) || (fs.existsSync(meta) && fs.readFileSync(meta, 'utf8') !== ln.text)) {
          await tts(ln.text, lang, ln.who === 'VANI' ? L[lang].vani : ln.female ? L[lang].female : L[lang].male, f);
          fs.writeFileSync(meta, ln.text);
        }
        parts.push(f);
      }
      voice = path.join(work, c.id + '-voice.wav');
      const inputs = parts.flatMap((p) => ['-i', p]);
      const fl = parts.map((_, i) => `[${i}:a]aresample=48000,aformat=channel_layouts=mono,apad=pad_dur=0.25[a${i}]`).join(';') + ';' + parts.map((_, i) => `[a${i}]`).join('') + `concat=n=${parts.length}:v=0:a=1[v]`;
      run([...inputs, '-filter_complex', fl, '-map', '[v]', voice]);
      // caption timing per line, proportional to each line's audio
      let t = 0.2;
      for (let k = 0; k < parts.length; k++) { const d = probe(parts[k]).dur; caps.push({ text: lines[k].text, start: t, end: t + d }); t += d + 0.25; }
    } else caps = [{ text: lines.map((l) => l.text).join(' '), start: 0.2, end: 0.2 + probe(own).dur }];
    let V = probe(voice).dur; let tempo = 1;
    const avail = Math.max(1, info.dur - 0.4);
    if (V > avail) { tempo = Math.min(1.25, V / avail); V = V / tempo; caps = caps.map((p) => ({ ...p, start: 0.2 + (p.start - 0.2) / tempo, end: 0.2 + (p.end - 0.2) / tempo })); }
    T = Math.max(Math.min(info.dur, T), V + 0.5);
    const bed = info.audio ? `[0:a]volume=0.07,aresample=48000,apad[bed];` : '';
    const vfx = `[1:a]atempo=${tempo.toFixed(3)},aresample=48000,adelay=200|200,apad[vo]`;
    audioArgs = { inputs: ['-i', voice], filter: bed + vfx + (info.audio ? ';[bed][vo]amix=inputs=2:duration=longest:normalize=0[aout]' : ';[vo]anull[aout]') };
  } else {
    audioArgs = { inputs: info.audio ? [] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo'], filter: info.audio ? '[0:a]aresample=48000,apad[aout]' : '[1:a]anull[aout]' };
    if (lines.length) caps = [{ text: lines.map((l) => l.text).join(' '), start: 0.3, end: Math.max(1, T - 0.4) }];
  }
  let ev = capEvents(caps, lang);
  if (opts.hook) ev += `Dialogue: 1,${t2(0)},${t2(Math.min(3.8, T))},Hook,,0,0,0,,${assEsc(opts.hook)}\n`;
  if (opts.end) { const s = Math.max(0, T - 3); ev += `Dialogue: 2,${t2(s)},${t2(T)},End,,0,0,0,,{\\pos(360,600)}${assEsc(opts.end)}\nDialogue: 3,${t2(s)},${t2(T)},Url,,0,0,0,,{\\pos(360,720)}rasivani.com\n`; }
  fs.writeFileSync(ass, assHeader(lang) + ev);
  const pad = T > info.dur ? `,tpad=stop_mode=clone:stop_duration=${(T - info.dur + 0.1).toFixed(2)}` : '';
  const vf = `[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30,setsar=1${pad},ass=${path.relative(ENGINE, ass).replace(/\\/g, '/')}:fontsdir=fonts:shaping=complex[vout]`;
  run(['-i', src, ...audioArgs.inputs, '-filter_complex', vf + ';' + audioArgs.filter, '-map', '[vout]', '-map', '[aout]', '-t', T.toFixed(2),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2', out], { cwd: ENGINE });
  return out;
}
function join(files, out) {
  const list = out + '.txt';
  fs.writeFileSync(list, files.map((f) => `file '${f.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
  run(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out]);
  fs.unlinkSync(list);
}

// ---------- thumbnails ----------
function thumbs(lang, pack, clipMap, outDir, work) {
  const pick = day.clips.find((c) => c.type === 'c' && c.face && clipMap[c.id]) || day.clips.find((c) => c.face && clipMap[c.id]);
  const pick2 = day.clips.filter((c) => c.face && clipMap[c.id]).slice(-2)[0] || pick;
  const made = [];
  const mk = (clip, at, events, name, w, h) => {
    const frame = path.join(work, name + '-frame.png'); const ass = path.join(work, name + '.ass');
    run(['-ss', String(at), '-i', clipMap[clip.id], '-frames:v', '1', frame]);
    fs.writeFileSync(ass, assHeader(lang, 1080, 1920) + events);
    const fit = w > h ? `[0:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},boxblur=20[bg];[0:v]scale=-2:${h}[fg];[bg][fg]overlay=(W-w)/2:0,` : `[0:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},`;
    const subW = w > h ? `,scale=${w}:${h}` : '';
    run(['-i', frame, '-filter_complex', `${fit}eq=contrast=1.08:saturation=1.15,ass=${path.relative(ENGINE, ass).replace(/\\/g, '/')}:fontsdir=fonts:shaping=complex:original_size=1080x1920${subW}`, '-frames:v', '1', '-q:v', '2', path.join(outDir, name + '.jpg')], { cwd: ENGINE });
    made.push(name + '.jpg');
  };
  const A = `Dialogue: 0,0:00:00.00,0:00:05.00,Big,,0,0,0,,${assEsc(year || '')}\nDialogue: 0,0:00:00.00,0:00:05.00,Sub,,0,0,0,,${assEsc(pack.thumbA.toUpperCase())}\n`;
  const B = `Dialogue: 0,0:00:00.00,0:00:05.00,Red,,0,0,0,,${assEsc(pack.thumbB.toUpperCase())}\n`;
  if (pick) mk(pick, 2.0, A, 'thumb-A', 1080, 1920);
  if (pick2) mk(pick2, 3.0, B, 'thumb-B', 1080, 1920);
  if (pick) mk(pick, 2.0, A, 'thumb-16x9', 1280, 720);
  return made;
}

// ---------- main ----------
const clipMap = findClips();
const have = allIds.filter((id) => clipMap[id]);
log(`\n${date}: ${day.title}\n  clips found: ${have.length} of 25${have.length < 25 ? ' (missing: ' + allIds.filter((id) => !clipMap[id]).join(', ') + ' - skipped)' : ''}`);
if (!KEY) log(DRY ? '  TEST MODE: silent voices, English text everywhere.' : '  No Sarvam key found: Tamil/Telugu/Hindi will have no new voices. Put the key in engine\\sarvam-key.txt');
const nextDate = new Date(Date.parse(date + 'T12:00:00Z') + 864e5).toISOString().slice(0, 10);

for (const lang of LANGS) {
  const t0 = Date.now();
  log(`\n[${lang}]`);
  const outDir = path.join(readyRoot, lang); fs.mkdirSync(outDir, { recursive: true });
  const work = path.join(inbox, '_work', lang); fs.mkdirSync(work, { recursive: true });
  const pack = await textPack(lang);
  // story
  const story = day.clips.filter((c) => clipMap[c.id]);
  const segs = [];
  for (let i = 0; i < story.length; i++) {
    const c = story[i];
    segs.push(await segment(c, clipMap[c.id], lang, pack, work, { hook: i === 0 ? pack.hook : null, end: i === story.length - 1 ? pack.end : null }));
    process.stdout.write(`  ${c.id} `);
  }
  const storyOut = path.join(outDir, `VANI-${date}-${lang}.mp4`);
  if (segs.length) { join(segs, storyOut); log(`\n  story: ${path.basename(storyOut)} (${Math.round(probe(storyOut).dur)} s)`); }
  // rasi palan wrappers (for tomorrow morning)
  const r = (id) => day.rclips.find((c) => c.id === id);
  const rasiDir = path.join(outDir, 'rasi-palan-' + nextDate); fs.mkdirSync(rasiDir, { recursive: true });
  if (clipMap.R1) fs.copyFileSync(await segment(r('R1'), clipMap.R1, lang, pack, work), path.join(rasiDir, '1-intro.mp4'));
  const bg = ['R2', 'R3', 'R4'].filter((id) => clipMap[id]).map((id) => segment(r(id), clipMap[id], lang, { lines: {} }, work, { maxLen: 8 }));
  const bgSegs = []; for (const p of bg) bgSegs.push(await p);
  if (bgSegs.length) join(bgSegs, path.join(rasiDir, '2-background.mp4'));
  if (clipMap.R5) fs.copyFileSync(await segment(r('R5'), clipMap.R5, lang, pack, work), path.join(rasiDir, '3-outro.mp4'));
  // join with the rasi palan video from make-week-shorts if it exists
  const rpRoot = ['D:\\MADDY\\rasivani\\social\\rasipalan', path.join(VANI, '..', '..', 'social', 'rasipalan')].map((d) => path.join(d, lang, nextDate)).find((d) => fs.existsSync(d));
  const rpVid = rpRoot && fs.readdirSync(rpRoot).find((f) => /\.mp4$/i.test(f));
  if (rpVid && fs.existsSync(path.join(rasiDir, '1-intro.mp4'))) {
    const mid = path.join(work, 'rp-mid.mp4');
    run(['-i', path.join(rpRoot, rpVid), '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-filter_complex', '[0:v]scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1[v]', '-map', '[v]', '-map', '0:a?', '-map', '1:a', '-shortest', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-ac', '2', mid]);
    try { join([path.join(rasiDir, '1-intro.mp4'), mid, ...(fs.existsSync(path.join(rasiDir, '3-outro.mp4')) ? [path.join(rasiDir, '3-outro.mp4')] : [])], path.join(rasiDir, `RASI-PALAN-${nextDate}-${lang}.mp4`)); log('  rasi palan: joined with ' + rpVid); }
    catch (e) { log('  rasi palan join failed: ' + e.message.slice(0, 120)); }
  } else log(`  rasi palan: intro/background/outro ready in rasi-palan-${nextDate}\\ (no make-week-shorts video found for ${nextDate} to join)`);
  // thumbnails + upload text
  const th = thumbs(lang, pack, clipMap, outDir, work);
  const titles = [pack.title, pack.hook, pack.titleC].map((t) => (t.length > 95 ? t.slice(0, 95) : t));
  const up = [
    `UPLOAD - ${date} - ${lang.toUpperCase()}`,
    `Video: ${path.basename(storyOut)}  |  Post at 7:00 PM IST  |  Thumbnails: ${th.join(', ')}`,
    '',
    'TITLES (A/B test - use "Test & compare" in YouTube Studio):',
    ...titles.map((t, i) => `  ${'ABC'[i]}: ${t} #shorts`),
    '',
    'DESCRIPTION (the fixed part goes in YouTube Studio > Settings > Upload defaults, once):',
    '----- per-video part -----',
    pack.hook,
    pack.goal,
    '',
    TAGS[lang],
    '----- fixed part (Upload defaults) -----',
    ...FIXED[lang],
    '',
    'TAGS: ' + ['RasiVani', 'VANI', 'time travel', 'Indian history', SHORTPLACE(), year, day.theme].filter(Boolean).join(', '),
    '',
    'SETTINGS: Altered or synthetic content = YES. Made for kids = NO. Category: Education.',
    'FACEBOOK: same video as a Reel, AI info ON, first caption line = language name.',
  ].join('\r\n');
  fs.writeFileSync(path.join(outDir, 'UPLOAD.txt'), up);
  fs.rmSync(work, { recursive: true, force: true });
  log(`  done in ${Math.round((Date.now() - t0) / 1000)} s -> ${outDir}`);
}
log('\nAll done. Open: ' + readyRoot);
