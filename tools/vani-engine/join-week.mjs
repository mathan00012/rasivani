// Joins several finished VANI story videos into one long video (for watch hours).
//   node join-week.mjs 2026-11-15 2026-11-17            (all 4 languages)
//   node join-week.mjs 2026-11-18 2026-11-21 ta         (Tamil only)
// Reads   ..\ready\<date>\<lang>\VANI-<date>-<lang>.mp4 for every date in the range that exists
// Writes  ..\ready\long\<lang>\VANI-LONG-<from>-to-<to>-<lang>.mp4 (vertical, 1080x1920)
//         + a 16:9 copy with blurred sides (-16x9.mp4) and LONG-UPLOAD.txt (title, chapters, description)
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
const [from, to = from, langArg = 'ta,te,hi,en'] = process.argv.slice(2);
if (!from) { console.log('Usage: node join-week.mjs <fromDate> <toDate> [ta,te,hi,en]'); process.exit(1); }
const plan = JSON.parse(fs.readFileSync([path.join(ENGINE, 'plan.json'), path.join(VANI, 'flow-plan', 'plan.json')].find((f) => fs.existsSync(f)), 'utf8'));
const dur = (f) => Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const NAME = { ta: 'VANI-யின் வாரம்', te: 'VANI వారం', hi: 'VANI का हफ़्ता', en: "VANI's week" };
const DESC = {
  ta: 'VANI காலப்பயணம் செய்து பார்த்த கதைகள், ஒரே வீடியோவில். உங்க ஜாதகம், ராசி பலன் இலவசமா: https://rasivani.com/ta/',
  te: 'VANI టైమ్ ట్రావెల్ కథలు, ఒకే వీడియోలో. మీ జాతకం, రాశి ఫలాలు ఉచితంగా: https://rasivani.com/te/',
  hi: 'VANI की टाइम-ट्रैवल कहानियाँ, एक ही वीडियो में। आपकी कुंडली और राशिफल मुफ़्त: https://rasivani.com/hi/',
  en: "VANI's time-travel stories, all in one video. YOUR free jathagam and daily rasi palan: https://rasivani.com/",
};
for (const lang of langArg.split(',')) {
  const items = plan.filter((d) => d.date >= from && d.date <= to)
    .map((d) => ({ d, f: path.join(VANI, 'ready', d.date, lang, `VANI-${d.date}-${lang}.mp4`) }))
    .filter((x) => fs.existsSync(x.f));
  if (items.length < 2) { console.log(`[${lang}] only ${items.length} finished video(s) in ${from}..${to}, need 2 or more. Skipped.`); continue; }
  const outDir = path.join(VANI, 'ready', 'long', lang);
  fs.mkdirSync(outDir, { recursive: true });
  const base = `VANI-LONG-${from}-to-${to}-${lang}`;
  const out = path.join(outDir, base + '.mp4');
  const args = ['-y'];
  items.forEach((x) => args.push('-i', x.f));
  const n = items.length;
  const norm = items.map((_, i) => `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}];[${i}:a]aresample=48000,aformat=channel_layouts=stereo[a${i}]`).join(';');
  const cat = items.map((_, i) => `[v${i}][a${i}]`).join('') + `concat=n=${n}:v=1:a=1[v][a]`;
  console.log(`[${lang}] joining ${n} videos...`);
  execFileSync(FFMPEG, [...args, '-filter_complex', `${norm};${cat}`, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log(`[${lang}] making 16:9 copy...`);
  execFileSync(FFMPEG, ['-y', '-i', out, '-filter_complex', '[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=30:2,eq=brightness=-0.15[bg];[0:v]scale=-2:1080[fg];[bg][fg]overlay=(W-w)/2:0', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-c:a', 'copy', '-movflags', '+faststart', path.join(outDir, base + '-16x9.mp4')], { stdio: 'inherit' });
  let t = 0; const ch = [];
  for (const x of items) {
    const txt = path.join(VANI, 'ready', x.d.date, lang, 'UPLOAD.txt');
    let title = x.d.title;
    if (fs.existsSync(txt)) { const m = fs.readFileSync(txt, 'utf8').match(/^\s*A:\s*(.+)$/m); if (m) title = m[1].replace(/#shorts/gi, '').trim(); }
    ch.push(`${mmss(t)} ${title}`); t += dur(x.f);
  }
  const days = items.map((x) => x.d.place || x.d.theme).slice(0, 4).join(', ');
  fs.writeFileSync(path.join(outDir, base + '-UPLOAD.txt'),
`TITLE: ${NAME[lang]}: ${days} (${n} stories, ${mmss(t)})

DESCRIPTION:
${DESC[lang]}

${ch.join('\n')}

#RasiVani #VANI #history #timetravel

SETTINGS: Upload the -16x9.mp4 file as a normal long video (not a Short). Altered or synthetic content = Yes. Thumbnail: use thumb-16x9.png from the first day's folder.
`);
  console.log(`[${lang}] DONE ${out} (${mmss(t)})`);
}
