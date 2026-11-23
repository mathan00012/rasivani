// Still pictures -> moving clips (slow zoom / pan, "Ken Burns"), so pictures and Flow clips mix in story order.
// Run:  node stills-to-clips.mjs <date>        (MAKE-VIDEOS.bat runs it first, by itself)
// Reads ..\flow-inbox\<date>\
//   For every story slot 01..20 and R1..R5 that has NO Flow clip (NN.mp4/.mov/.webm), it takes a picture:
//   NN.jpg / NN.png / NN.webp in the inbox, or else start\NN.jpg, and makes NN.mp4 from it.
//   Length: your Tamil recording voice-ta\NN.* + 0.5 s if it exists, else STILL_SECS (default 6 s).
//   The clip is silent. The slots it made are listed in stills.json, so MAKE-VIDEOS knows to give them
//   a voice (your recording, or the AI voice) in every language, Tamil too.
// Re-running is safe: a still clip is remade only if its picture or voice is newer than the clip.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ENGINE = path.dirname(fileURLToPath(import.meta.url));
const VANI = process.env.VANI_DIR || path.resolve(ENGINE, '..');
const require = createRequire(import.meta.url);
const FFMPEG = (() => { try { return require('ffmpeg-static'); } catch { return 'ffmpeg'; } })();
const FFPROBE = (() => { try { return require('ffprobe-static').path; } catch { return 'ffprobe'; } })();
const inboxRoot = path.join(VANI, 'flow-inbox');
let date = process.argv[2];
if (!date) date = fs.readdirSync(inboxRoot).filter((d) => /^\d{4}-\d\d-\d\d$/.test(d)).sort().pop();
const inbox = path.join(inboxRoot, date);
if (!fs.existsSync(inbox)) { console.log('No folder ' + inbox); process.exit(0); }
const DEF = parseFloat(process.env.STILL_SECS || '6');
const W = 720, H = 1280, FPS = 30;

const slots = [...Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0')), 'R1', 'R2', 'R3', 'R4', 'R5'];
const listFile = path.join(inbox, 'stills.json');
let made = {};
try { made = JSON.parse(fs.readFileSync(listFile, 'utf8')); } catch {}

const mtime = (f) => { try { return fs.statSync(f).mtimeMs; } catch { return 0; } };
const dur = (f) => parseFloat(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString()) || 0;
const first = (list) => list.find((f) => fs.existsSync(f));

// 6 gentle moves, picked by slot so neighbours differ
const moves = [
  (n) => [`1+0.12*on/${n}`, 'iw/2-(iw/zoom/2)', 'ih/2-(ih/zoom/2)'],          // zoom in, centre
  (n) => [`1.12-0.12*on/${n}`, 'iw/2-(iw/zoom/2)', 'ih/2-(ih/zoom/2)'],       // zoom out, centre
  (n) => ['1.12', `(iw-iw/zoom)*on/${n}`, 'ih/2-(ih/zoom/2)'],                 // pan left to right
  (n) => ['1.12', `(iw-iw/zoom)*(1-on/${n})`, 'ih/2-(ih/zoom/2)'],             // pan right to left
  (n) => [`1+0.10*on/${n}`, 'iw/2-(iw/zoom/2)', `(ih-ih/zoom)*0.35`],          // zoom in, upper (faces)
  (n) => ['1.10', 'iw/2-(iw/zoom/2)', `(ih-ih/zoom)*(1-on/${n})`],             // tilt up
];

let count = 0;
slots.forEach((id, i) => {
  const clip = first(['mp4', 'mov', 'webm'].map((e) => path.join(inbox, id + '.' + e)));
  if (clip && !made[id]) return; // a real Flow clip is here: leave it alone
  const pic = first([...['jpg', 'jpeg', 'png', 'webp'].map((e) => path.join(inbox, id + '.' + e)), path.join(inbox, 'start', id + '.jpg'), path.join(inbox, 'start', id + '.png')]);
  if (!pic) return;
  const voice = first(['wav', 'mp3', 'm4a'].map((e) => path.join(inbox, 'voice-ta', id + '.' + e)));
  const out = path.join(inbox, id + '.mp4');
  if (clip && mtime(out) > Math.max(mtime(pic), mtime(voice))) { count++; return; } // up to date
  const secs = voice ? Math.max(2, dur(voice) + 0.5) : DEF;
  const n = Math.round(secs * FPS);
  const [z, x, y] = moves[i % moves.length](n);
  const vf = `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},` +
    `zoompan=z='${z}':x='${x}':y='${y}':d=${n}:s=${W}x${H}:fps=${FPS},setsar=1,format=yuv420p`;
  execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-loop', '1', '-i', pic,
    '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-vf', vf, '-frames:v', String(n), '-t', secs.toFixed(2),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac', '-shortest', out], { stdio: ['ignore', 'ignore', 'pipe'] });
  made[id] = { from: path.relative(inbox, pic), secs: +secs.toFixed(2) };
  count++;
  console.log(`  still ${id}: ${path.relative(inbox, pic)} -> ${id}.mp4 (${secs.toFixed(1)} s, move ${(i % moves.length) + 1})`);
});
fs.writeFileSync(listFile, JSON.stringify(made, null, 1));
const flow = slots.filter((id) => !made[id] && first(['mp4', 'mov', 'webm'].map((e) => path.join(inbox, id + '.' + e)))).length;
console.log(`${date}: ${flow} Flow clips + ${count} picture clips.`);
