/* RasiVani Indian calendars: one date in the Tamil, Malayalam, Telugu-Kannada (amanta), North Indian (purnimanta)
   and Indian National (Saka) calendars, plus the year's main festivals worked out from the Sun and Moon.
   Same code runs in the browser (date picker) and in Node (tools/extras.mjs prerenders it for crawlers).
   Rules: solar month = Sun's sidereal rasi (Lahiri); Tamil month starts on the day of sankranti if it falls
   before sunset, Malayalam if before 3/5 of the daytime, else the next day. Lunar month = new moon to new moon,
   named by the rasi the Sun enters during it (no entry = adhika masa). Tithi at the local moments named below. */
(function (root) {
  'use strict';
  const DAY = 86400000, MIN = 60000;
  const BASE = Date.UTC(2000, 0, 1);
  const norm = (x) => ((x % 360) + 360) % 360;
  const cache = new Map();
  function lonSM(ms) {
    const k = Math.round(ms / MIN);
    if (cache.has(k)) return cache.get(k);
    const c = root.Astro.computeChart({ y: 2000, m: 1, d: 1, hh: 0, mm: (k * MIN - BASE) / MIN, tz: 0, lat: 0, lon: 0 });
    const v = { sun: c.planets[0].lon, moon: c.planets[1].lon };
    if (cache.size > 20000) cache.clear();
    cache.set(k, v); return v;
  }
  const sunRasi = (ms) => Math.floor(lonSM(ms).sun / 30);
  const elong = (ms) => { const p = lonSM(ms); return norm(p.moon - p.sun); };
  const tithiAt = (ms) => Math.floor(elong(ms) / 12); // 0..29
  const nakAt = (ms) => Math.floor(lonSM(ms).moon / (360 / 27));
  // Sankranti (Sun entering its present rasi) at or before ms
  function sankrantiBefore(ms) {
    const r = sunRasi(ms);
    let hi = ms, lo = ms - DAY;
    while (sunRasi(lo) === r) { hi = lo; lo -= DAY; }
    while (hi - lo > MIN) { const mid = (lo + hi) / 2; if (sunRasi(mid) === r) hi = mid; else lo = mid; }
    return { ms: hi, rasi: r };
  }
  function sankrantiAfter(ms) {
    const r = sunRasi(ms);
    let lo = ms, hi = ms + DAY;
    while (sunRasi(hi) === r) { lo = hi; hi += DAY; }
    while (hi - lo > MIN) { const mid = (lo + hi) / 2; if (sunRasi(mid) === r) lo = mid; else hi = mid; }
    return { ms: hi, rasi: (r + 1) % 12 };
  }
  // New moon nearest to a guess
  function newMoonNear(g) {
    for (let i = 0; i < 8; i++) { let e = elong(g); if (e > 180) e -= 360; g -= e / 12.19 * DAY; }
    return g;
  }
  function newMoonBefore(ms) { let n = newMoonNear(ms - elong(ms) / 12.19 * DAY); if (n > ms) n = newMoonNear(n - 29.5 * DAY); return n; }
  // Amanta lunar month of an instant: index 0 = Chaitra ... 11 = Phalguna
  function lunarMonth(ms) {
    const n1 = newMoonBefore(ms), n2 = newMoonNear(n1 + 29.53 * DAY);
    const r1 = sunRasi(n1), r2 = sunRasi(n2);
    return { idx: (r1 + 1) % 12, adhika: r1 === r2, start: n1, end: n2 };
  }

  // Local day helpers. A "day" is {y,m,d}; place {lat,lon,tz}.
  const utcOf = (k, hours, tz) => Date.UTC(k.y, k.m - 1, k.d) + (hours - tz) * 3600000;
  const dayOfMs = (ms, tz) => { const t = new Date(ms + tz * 3600000); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; };
  const addDays = (k, n) => { const t = new Date(Date.UTC(k.y, k.m - 1, k.d + n)); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; };
  const dayNum = (k) => Math.round(Date.UTC(k.y, k.m - 1, k.d) / DAY);
  const iso = (k) => `${k.y}-${String(k.m).padStart(2, '0')}-${String(k.d).padStart(2, '0')}`;
  function sun(k, p) {
    const r = root.Astro.panchang({ y: k.y, m: k.m, d: k.d, hh: 12, mm: 0, tz: p.tz, lat: p.lat, lon: p.lon });
    const rise = r.sunrise != null ? r.sunrise : 6, set = r.sunset != null ? r.sunset : 18;
    return { rise, set, riseMs: utcOf(k, rise, p.tz), setMs: utcOf(k, set, p.tz) };
  }
  // Solar month and day by a regional cut-off: frac of daytime after sunrise (Tamil 1 = sunset, Kerala 0.6)
  function solarDate(k, p, frac) {
    const cut = (kk) => { const s = sun(kk, p); return s.riseMs + frac * (s.setMs - s.riseMs); };
    const s = sankrantiBefore(cut(k));
    let start = dayOfMs(s.ms, p.tz);
    if (s.ms > cut(start)) start = addDays(start, 1);
    return { rasi: s.rasi, day: dayNum(k) - dayNum(start) + 1, start, sankranti: s.ms };
  }
  // Indian National Calendar (Saka), as fixed by the Calendar Reform Committee (1957)
  function national(k) {
    const leap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    let y = k.y; let start = Date.UTC(y, 2, leap(y) ? 21 : 22);
    const t = Date.UTC(k.y, k.m - 1, k.d);
    if (t < start) { y -= 1; start = Date.UTC(y, 2, leap(y) ? 21 : 22); }
    let n = Math.round((t - start) / DAY);
    const lens = [leap(y) ? 31 : 30, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];
    let mo = 0; while (n >= lens[mo]) { n -= lens[mo]; mo++; }
    return { month: mo, day: n + 1, year: y - 78 };
  }
  // Everything for one civil day at one place
  function dayInfo(k, p) {
    const s = sun(k, p);
    const ta = solarDate(k, p, 1), ml = solarDate(k, p, 0.6);
    const lm = lunarMonth(s.riseMs);
    const tithi = tithiAt(s.riseMs);
    const krishna = tithi >= 15;
    // Year counts
    const shaka = k.m >= 6 ? k.y - 78 : k.m <= 2 ? k.y - 79 : (lm.idx <= 2 ? k.y - 78 : k.y - 79);
    const tamilYear = k.m >= 5 ? k.y : k.m <= 3 ? k.y - 1 : (ta.rasi === 0 || ta.rasi === 1 ? k.y : k.y - 1);
    const kollam = k.m >= 9 ? k.y - 824 : k.m <= 7 ? k.y - 825 : (ml.rasi >= 4 && ml.rasi <= 5 ? k.y - 824 : k.y - 825);
    return {
      date: k, weekday: new Date(Date.UTC(k.y, k.m - 1, k.d)).getUTCDay(),
      tamil: { month: ta.rasi, day: ta.day, samvatsara: ((tamilYear - 1987) % 60 + 60) % 60, kali: tamilYear + 3101 },
      malayalam: { month: ml.rasi, day: ml.day, kollam },
      amanta: { month: lm.idx, adhika: lm.adhika, tithi, krishna, samvatsara: ((shaka + 11) % 60 + 60) % 60, shaka },
      purnimanta: { month: krishna ? (lm.idx + 1) % 12 : lm.idx, adhika: lm.adhika, tithi, krishna, vikram: shaka + 135 },
      national: national(k),
      nakshatra: nakAt(s.riseMs)
    };
  }

  // ---------- Festivals over a span of days ----------
  // Each rule names the regional calendar it follows and the place whose sunrise/sunset is used.
  function festivals(from, days, places) {
    const P = Object.assign({ ta: { lat: 13.0827, lon: 80.2707, tz: 5.5 }, ml: { lat: 9.9312, lon: 76.2673, tz: 5.5 }, north: { lat: 28.6139, lon: 77.209, tz: 5.5 }, south: { lat: 17.385, lon: 78.4867, tz: 5.5 } }, places || {});
    const out = [];
    const add = (k, key) => { if (!out.some((f) => f.key === key && f.iso === iso(k))) out.push({ iso: iso(k), date: k, key }); };
    const seen = {};
    const once = (key, k) => { const tag = key + ':' + (dayNum(k) / 300 | 0); if (seen[key] && dayNum(k) - seen[key] < 300) return; seen[key] = dayNum(k); add(k, key); };
    for (let i = 0; i < days; i++) {
      const k = addDays(from, i);
      // Tamil and Malayalam month starts (Chennai / Kochi)
      const ta = solarDate(k, P.ta, 1), ml = solarDate(k, P.ml, 0.6);
      if (ta.day === 1) {
        if (ta.rasi === 9) add(k, 'pongal');
        else if (ta.rasi === 0) add(k, 'puthandu');
        else add(k, 'sankranti_' + ta.rasi);
      }
      if (ml.day === 1 && ml.rasi === 0) add(k, 'vishu');
      if (ml.day === 1 && ml.rasi === 4) add(k, 'chingam1');
      // Lunar festivals at the North reference (Delhi) and South reference (Hyderabad)
      const sN = sun(k, P.north), sS = sun(k, P.south);
      const lmS = lunarMonth(sS.riseMs), lmN = lunarMonth(sN.riseMs);
      // Ugadi / Gudi Padwa and Navaratri: the day Shukla Pratipada holds at sunrise, or the day it begins if it ends before the next sunrise
      const firstDay = (sx, nextRise, target) => {
        const lm = lunarMonth(sx.riseMs), t = tithiAt(sx.riseMs);
        if (t === 0 && !lm.adhika && lm.idx === target) return true;
        if (t === 29) { const ln = lunarMonth(nextRise); return !ln.adhika && ln.idx === target && tithiAt(nextRise) >= 1 && tithiAt(nextRise) < 15; }
        return false;
      };
      const k1 = addDays(k, 1);
      if (firstDay(sS, sun(k1, P.south).riseMs, 0)) once('ugadi', k);
      if (firstDay(sN, sun(k1, P.north).riseMs, 6)) once('navaratri', k);
      const noonN = (sN.riseMs + sN.setMs) / 2, noonS = (sS.riseMs + sS.setMs) / 2;
      if (!lmN.adhika && lmN.idx === 0 && tithiAt(noonN) === 8) once('ramanavami', k);
      if (!lmS.adhika && lmS.idx === 5 && tithiAt(noonS) === 3) once('ganesh', k);
      if (!lmN.adhika && lmN.idx === 6 && tithiAt(sN.riseMs + 0.6 * (sN.setMs - sN.riseMs)) === 9) once('dussehra', k);
      const lmNs = lunarMonth(sN.setMs + 3600000);
      if (!lmNs.adhika && lmNs.idx === 6 && tithiAt(sN.setMs + 3600000) === 29) once('diwali', k);
      // Maha Shivaratri: Magha (amanta) Krishna Chaturdashi at midnight
      const mid = utcOf(k, 24, P.north.tz); const lmM = lunarMonth(mid);
      if (!lmM.adhika && lmM.idx === 10 && tithiAt(mid) === 28) once('shivaratri', k);
      // Onam (Thiruvonam star in Chingam, Kochi) and Karthigai Deepam (Krittika star in Karthigai, Chennai, during the evening)
      const sK = sun(k, P.ml); if (ml.rasi === 4 && nakAt(sK.riseMs + 3600000) === 21) once('onam', k);
      const sC = sun(k, P.ta); if (ta.rasi === 7 && [0, 1.5, 3].some((h) => nakAt(sC.setMs + h * 3600000) === 2)) once('deepam', k);
    }
    return out.sort((a, b) => (a.iso < b.iso ? -1 : a.iso > b.iso ? 1 : 0));
  }

  // ---------- Names ----------
  const SAMVAT_DEV = ['प्रभव', 'विभव', 'शुक्ल', 'प्रमोद', 'प्रजापति', 'आंगिरस', 'श्रीमुख', 'भाव', 'युव', 'धातृ', 'ईश्वर', 'बहुधान्य', 'प्रमाथी', 'विक्रम', 'वृष', 'चित्रभानु', 'स्वभानु', 'तारण', 'पार्थिव', 'व्यय', 'सर्वजित', 'सर्वधारी', 'विरोधी', 'विकृति', 'खर', 'नंदन', 'विजय', 'जय', 'मन्मथ', 'दुर्मुखी', 'हेविलंबी', 'विलंबी', 'विकारी', 'शार्वरी', 'प्लव', 'शुभकृत', 'शोभकृत', 'क्रोधी', 'विश्वावसु', 'पराभव', 'प्लवंग', 'कीलक', 'सौम्य', 'साधारण', 'विरोधकृत', 'परिधावी', 'प्रमादी', 'आनंद', 'राक्षस', 'नल', 'पिंगल', 'कालयुक्त', 'सिद्धार्थी', 'रौद्र', 'दुर्मति', 'दुंदुभि', 'रुधिरोद्गारी', 'रक्ताक्षी', 'क्रोधन', 'अक्षय'];
  const SAMVAT_EN = ['Prabhava', 'Vibhava', 'Shukla', 'Pramoda', 'Prajapati', 'Angirasa', 'Shrimukha', 'Bhava', 'Yuva', 'Dhatu', 'Ishvara', 'Bahudhanya', 'Pramathi', 'Vikrama', 'Vrisha', 'Chitrabhanu', 'Svabhanu', 'Tarana', 'Parthiva', 'Vyaya', 'Sarvajit', 'Sarvadhari', 'Virodhi', 'Vikriti', 'Khara', 'Nandana', 'Vijaya', 'Jaya', 'Manmatha', 'Durmukhi', 'Hevilambi', 'Vilambi', 'Vikari', 'Sharvari', 'Plava', 'Shubhakrit', 'Shobhakrit', 'Krodhi', 'Vishvavasu', 'Parabhava', 'Plavanga', 'Kilaka', 'Saumya', 'Sadharana', 'Virodhikrit', 'Paridhavi', 'Pramadi', 'Ananda', 'Rakshasa', 'Nala', 'Pingala', 'Kalayukta', 'Siddharthi', 'Raudra', 'Durmati', 'Dundubhi', 'Rudhirodgari', 'Raktakshi', 'Krodhana', 'Akshaya'];
  const SAMVAT_TA = ['பிரபவ', 'விபவ', 'சுக்ல', 'பிரமோதூத', 'பிரசோற்பத்தி', 'ஆங்கீரச', 'ஸ்ரீமுக', 'பவ', 'யுவ', 'தாது', 'ஈஸ்வர', 'வெகுதானிய', 'பிரமாதி', 'விக்கிரம', 'விஷு', 'சித்திரபானு', 'சுபானு', 'தாரண', 'பார்த்திப', 'விய', 'சர்வசித்து', 'சர்வதாரி', 'விரோதி', 'விக்ருதி', 'கர', 'நந்தன', 'விஜய', 'ஜய', 'மன்மத', 'துன்முகி', 'ஹேவிளம்பி', 'விளம்பி', 'விகாரி', 'சார்வரி', 'பிலவ', 'சுபகிருது', 'சோபகிருது', 'குரோதி', 'விசுவாவசு', 'பராபவ', 'பிலவங்க', 'கீலக', 'சௌமிய', 'சாதாரண', 'விரோதிகிருது', 'பரிதாபி', 'பிரமாதீச', 'ஆனந்த', 'ராட்சச', 'நள', 'பிங்கள', 'காளயுக்தி', 'சித்தார்த்தி', 'ரௌத்திரி', 'துன்மதி', 'துந்துபி', 'ருத்ரோத்காரி', 'ரக்தாட்சி', 'குரோதன', 'அட்சய'];
  const LUNAR_DEV = ['चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ', 'श्रावण', 'भाद्रपद', 'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'];
  const LUNAR = {
    en: ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashvin', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'],
    ta: ['சைத்ர', 'வைசாக', 'ஜ்யேஷ்ட', 'ஆஷாட', 'ஸ்ராவண', 'பாத்ரபத', 'ஆஸ்வின', 'கார்த்திக', 'மார்கசீர்ஷ', 'புஷ்ய', 'மாக', 'பால்குன']
  };
  const NATIONAL = { en: ['Chaitra', 'Vaishakha', 'Jyaishtha', 'Ashadha', 'Shravana', 'Bhadra', 'Ashvina', 'Kartika', 'Agrahayana', 'Pausha', 'Magha', 'Phalguna'],
    hi: ['चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन', 'कार्तिक', 'अग्रहायण', 'पौष', 'माघ', 'फाल्गुन'] };
  const TAMIL_M = {
    en: ['Chithirai', 'Vaikasi', 'Aani', 'Aadi', 'Aavani', 'Purattasi', 'Aippasi', 'Karthigai', 'Margazhi', 'Thai', 'Maasi', 'Panguni'],
    ta: ['சித்திரை', 'வைகாசி', 'ஆனி', 'ஆடி', 'ஆவணி', 'புரட்டாசி', 'ஐப்பசி', 'கார்த்திகை', 'மார்கழி', 'தை', 'மாசி', 'பங்குனி'],
    te: ['చిత్తిరై', 'వైకాసి', 'ఆని', 'ఆడి', 'ఆవణి', 'పురట్టాసి', 'ఐప్పసి', 'కార్తిగై', 'మార్గళి', 'తై', 'మాసి', 'పంగుని'],
    kn: ['ಚಿತ್ತಿರೈ', 'ವೈಕಾಸಿ', 'ಆನಿ', 'ಆಡಿ', 'ಆವಣಿ', 'ಪುರಟ್ಟಾಸಿ', 'ಐಪ್ಪಸಿ', 'ಕಾರ್ತಿಗೈ', 'ಮಾರ್ಗಳಿ', 'ತೈ', 'ಮಾಸಿ', 'ಪಂಗುನಿ'],
    ml: ['ചിത്തിര', 'വൈകാസി', 'ആനി', 'ആടി', 'ആവണി', 'പുരട്ടാസി', 'ഐപ്പസി', 'കാർത്തിക', 'മാർകഴി', 'തൈ', 'മാസി', 'പങ്കുനി'],
    hi: ['चित्तिरै', 'वैकासि', 'आनि', 'आडि', 'आवणि', 'पुरट्टासि', 'ऐप्पसि', 'कार्तिगै', 'मार्गळि', 'तै', 'मासि', 'पंगुनि']
  };
  const MAL_M = {
    en: ['Medam', 'Edavam', 'Mithunam', 'Karkidakam', 'Chingam', 'Kanni', 'Thulam', 'Vrischikam', 'Dhanu', 'Makaram', 'Kumbham', 'Meenam'],
    ml: ['മേടം', 'ഇടവം', 'മിഥുനം', 'കർക്കടകം', 'ചിങ്ങം', 'കന്നി', 'തുലാം', 'വൃശ്ചികം', 'ധനു', 'മകരം', 'കുംഭം', 'മീനം'],
    ta: ['மேடம்', 'இடவம்', 'மிதுனம்', 'கர்க்கடகம்', 'சிங்ஙம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்', 'தனு', 'மகரம்', 'கும்பம்', 'மீனம்'],
    te: ['మేడం', 'ఇడవం', 'మిథునం', 'కర్కిడకం', 'చింగం', 'కన్ని', 'తులాం', 'వృశ్చికం', 'ధను', 'మకరం', 'కుంభం', 'మీనం'],
    kn: ['ಮೇಡಂ', 'ಇಡವಂ', 'ಮಿಥುನಂ', 'ಕರ್ಕಿಡಕಂ', 'ಚಿಂಗಂ', 'ಕನ್ನಿ', 'ತುಲಾಂ', 'ವೃಶ್ಚಿಕಂ', 'ಧನು', 'ಮಕರಂ', 'ಕುಂಭಂ', 'ಮೀನಂ'],
    hi: ['मेडम', 'इडवम', 'मिथुनम', 'कर्किडकम', 'चिंगम', 'कन्नि', 'तुलाम', 'वृश्चिकम', 'धनु', 'मकरम', 'कुंभम', 'मीनम']
  };
  const tr = (s, l) => (root.I18N && root.I18N.translit ? root.I18N.translit(s, l) : s);
  function names(lang) {
    const I = root.I18N; const T = (I && I.TERMS && (I.TERMS[lang] || I.TERMS.en)) || {};
    const dev = lang === 'hi' || lang === 'mr';
    return {
      samvat: lang === 'en' ? SAMVAT_EN : lang === 'ta' ? SAMVAT_TA : dev ? SAMVAT_DEV : SAMVAT_DEV.map((s) => tr(s, lang)),
      lunar: LUNAR[lang] || (dev ? LUNAR_DEV : LUNAR_DEV.map((s) => tr(s, lang))),
      national: lang === 'en' ? NATIONAL.en : dev ? NATIONAL.hi : lang === 'ta' ? LUNAR.ta.map((s, i) => (i === 8 ? 'அக்ரஹாயண' : i === 5 ? 'பாத்ர' : s)) : NATIONAL.hi.map((s) => tr(s, lang)),
      tamil: TAMIL_M[lang] || TAMIL_M.en,
      mal: MAL_M[lang] || MAL_M.en,
      tithi: (i) => (i === 14 ? T.tithi[14] : i === 29 ? T.tithi[15] : T.tithi[i % 15]),
      paksha: T.paksha || { shukla: 'Shukla', krishna: 'Krishna' },
      weekday: T.weekday || [],
      nak: T.nak || []
    };
  }

  // ---------- Words (tool) ----------
  const TEXT = {
    en: { date: 'Pick a date', show: 'Show this date', greg: 'Gregorian', tamil: 'Tamil calendar', tamil_k: 'solar', mal: 'Malayalam calendar', mal_k: 'solar, Kollam era', telugu: 'Telugu and Kannada calendar', telugu_k: 'lunar, month ends at new moon', north: 'North Indian / Hindi calendar', north_k: 'lunar, month ends at full moon', nat: 'Indian National Calendar', nat_k: 'official, Saka era',
      year: 'year', masam: '', adhika: 'Adhika', kali: 'Kali', kollam: 'Kollam', shaka: 'Shaka', vikram: 'Vikram Samvat', saka: 'Saka', star: 'Star at sunrise', fest_h: 'Festivals in the next 12 months', fest_note: 'Dates follow each region\'s own rule, worked out for Chennai (Tamil), Kochi (Kerala), Hyderabad (Telugu, Kannada) and New Delhi (North India). A local temple calendar can differ by a day.' },
    ta: { date: 'தேதியைத் தேர்ந்தெடுங்கள்', show: 'இந்தத் தேதியைக் காட்டு', greg: 'ஆங்கிலத் தேதி', tamil: 'தமிழ் நாட்காட்டி', tamil_k: 'சூரிய மானம்', mal: 'மலையாள நாட்காட்டி', mal_k: 'சூரிய மானம், கொல்லம் ஆண்டு', telugu: 'தெலுங்கு, கன்னட நாட்காட்டி', telugu_k: 'சந்திர மானம், அமாவாசையில் மாதம் முடியும்', north: 'வட இந்திய / இந்தி நாட்காட்டி', north_k: 'சந்திர மானம், பௌர்ணமியில் மாதம் முடியும்', nat: 'இந்திய தேசிய நாட்காட்டி', nat_k: 'அரசு, சக ஆண்டு',
      year: 'ஆண்டு', masam: 'மாதம்', adhika: 'அதிக', kali: 'கலி', kollam: 'கொல்லம்', shaka: 'சாலிவாகன சகம்', vikram: 'விக்கிரம சம்வத்', saka: 'சகம்', star: 'உதயத்தில் நட்சத்திரம்', fest_h: 'அடுத்த 12 மாத பண்டிகைகள்', fest_note: 'ஒவ்வொரு பகுதியின் சொந்த விதிப்படி கணக்கிட்டது: சென்னை (தமிழ்), கொச்சி (கேரளா), ஹைதராபாத் (தெலுங்கு, கன்னடம்), புது தில்லி (வட இந்தியா). உங்கள் ஊர் கோயில் பஞ்சாங்கம் ஒரு நாள் மாறலாம்.' },
    te: { date: 'తేదీ ఎంచుకోండి', show: 'ఈ తేదీ చూపించు', greg: 'ఇంగ్లీష్ తేదీ', tamil: 'తమిళ క్యాలెండర్', tamil_k: 'సౌరమానం', mal: 'మలయాళ క్యాలెండర్', mal_k: 'సౌరమానం, కొల్లం శకం', telugu: 'తెలుగు, కన్నడ పంచాంగం', telugu_k: 'చాంద్రమానం, అమావాస్యతో నెల ముగుస్తుంది', north: 'ఉత్తర భారత / హిందీ పంచాంగం', north_k: 'చాంద్రమానం, పౌర్ణమితో నెల ముగుస్తుంది', nat: 'భారత జాతీయ క్యాలెండర్', nat_k: 'అధికారిక, శక శకం',
      year: 'సంవత్సరం', masam: 'మాసం', adhika: 'అధిక', kali: 'కలి', kollam: 'కొల్లం', shaka: 'శాలివాహన శకం', vikram: 'విక్రమ సంవత్', saka: 'శక', star: 'సూర్యోదయ నక్షత్రం', fest_h: 'రాబోయే 12 నెలల పండుగలు', fest_note: 'ప్రతి ప్రాంతం తన నియమం ప్రకారం: చెన్నై (తమిళం), కొచ్చి (కేరళ), హైదరాబాద్ (తెలుగు, కన్నడ), న్యూఢిల్లీ (ఉత్తర భారతం). మీ ఊరి ఆలయ పంచాంగం ఒక రోజు తేడా ఉండవచ్చు.' },
    kn: { date: 'ದಿನಾಂಕ ಆರಿಸಿ', show: 'ಈ ದಿನಾಂಕ ತೋರಿಸಿ', greg: 'ಇಂಗ್ಲಿಷ್ ದಿನಾಂಕ', tamil: 'ತಮಿಳು ಕ್ಯಾಲೆಂಡರ್', tamil_k: 'ಸೌರಮಾನ', mal: 'ಮಲಯಾಳಂ ಕ್ಯಾಲೆಂಡರ್', mal_k: 'ಸೌರಮಾನ, ಕೊಲ್ಲಂ ಶಕ', telugu: 'ಕನ್ನಡ, ತೆಲುಗು ಪಂಚಾಂಗ', telugu_k: 'ಚಾಂದ್ರಮಾನ, ಅಮಾವಾಸ್ಯೆಗೆ ತಿಂಗಳು ಮುಗಿಯುತ್ತದೆ', north: 'ಉತ್ತರ ಭಾರತ / ಹಿಂದಿ ಪಂಚಾಂಗ', north_k: 'ಚಾಂದ್ರಮಾನ, ಹುಣ್ಣಿಮೆಗೆ ತಿಂಗಳು ಮುಗಿಯುತ್ತದೆ', nat: 'ಭಾರತ ರಾಷ್ಟ್ರೀಯ ಕ್ಯಾಲೆಂಡರ್', nat_k: 'ಅಧಿಕೃತ, ಶಕ ವರ್ಷ',
      year: 'ಸಂವತ್ಸರ', masam: 'ಮಾಸ', adhika: 'ಅಧಿಕ', kali: 'ಕಲಿ', kollam: 'ಕೊಲ್ಲಂ', shaka: 'ಶಾಲಿವಾಹನ ಶಕ', vikram: 'ವಿಕ್ರಮ ಸಂವತ್', saka: 'ಶಕ', star: 'ಸೂರ್ಯೋದಯ ನಕ್ಷತ್ರ', fest_h: 'ಮುಂದಿನ 12 ತಿಂಗಳ ಹಬ್ಬಗಳು', fest_note: 'ಪ್ರತಿ ಪ್ರದೇಶದ ತನ್ನದೇ ನಿಯಮದಂತೆ: ಚೆನ್ನೈ (ತಮಿಳು), ಕೊಚ್ಚಿ (ಕೇರಳ), ಹೈದರಾಬಾದ್ (ತೆಲುಗು, ಕನ್ನಡ), ನವದೆಹಲಿ (ಉತ್ತರ ಭಾರತ). ನಿಮ್ಮ ಊರಿನ ದೇವಾಲಯ ಪಂಚಾಂಗ ಒಂದು ದಿನ ವ್ಯತ್ಯಾಸವಾಗಬಹುದು.' },
    ml: { date: 'തീയതി തിരഞ്ഞെടുക്കുക', show: 'ഈ തീയതി കാണിക്കുക', greg: 'ഇംഗ്ലീഷ് തീയതി', tamil: 'തമിഴ് കലണ്ടർ', tamil_k: 'സൗരമാനം', mal: 'മലയാളം കലണ്ടർ', mal_k: 'സൗരമാനം, കൊല്ലവർഷം', telugu: 'തെലുങ്ക്, കന്നഡ പഞ്ചാംഗം', telugu_k: 'ചാന്ദ്രമാനം, അമാവാസിയിൽ മാസം തീരും', north: 'ഉത്തരേന്ത്യൻ / ഹിന്ദി പഞ്ചാംഗം', north_k: 'ചാന്ദ്രമാനം, പൗർണമിയിൽ മാസം തീരും', nat: 'ഇന്ത്യൻ ദേശീയ കലണ്ടർ', nat_k: 'ഔദ്യോഗികം, ശകവർഷം',
      year: 'വർഷം', masam: 'മാസം', adhika: 'അധിക', kali: 'കലി', kollam: 'കൊല്ലവർഷം', shaka: 'ശാലിവാഹന ശകം', vikram: 'വിക്രമ സംവത്', saka: 'ശകം', star: 'ഉദയ നക്ഷത്രം', fest_h: 'അടുത്ത 12 മാസത്തെ ഉത്സവങ്ങൾ', fest_note: 'ഓരോ പ്രദേശത്തിന്റെയും നിയമപ്രകാരം: ചെന്നൈ (തമിഴ്), കൊച്ചി (കേരളം), ഹൈദരാബാദ് (തെലുങ്ക്, കന്നഡ), ന്യൂഡൽഹി (ഉത്തരേന്ത്യ). നിങ്ങളുടെ ക്ഷേത്ര പഞ്ചാംഗം ഒരു ദിവസം മാറാം.' },
    hi: { date: 'तारीख चुनें', show: 'यह तारीख देखें', greg: 'अंग्रेज़ी तारीख', tamil: 'तमिल कैलेंडर', tamil_k: 'सौर', mal: 'मलयालम कैलेंडर', mal_k: 'सौर, कोल्लम संवत', telugu: 'तेलुगु व कन्नड़ पंचांग', telugu_k: 'चांद्र, अमावस्या पर महीना पूरा', north: 'उत्तर भारतीय / हिंदी पंचांग', north_k: 'चांद्र, पूर्णिमा पर महीना पूरा', nat: 'भारतीय राष्ट्रीय पंचांग', nat_k: 'सरकारी, शक संवत',
      year: 'संवत्सर', masam: 'मास', adhika: 'अधिक', kali: 'कलि', kollam: 'कोल्लम', shaka: 'शालिवाहन शक', vikram: 'विक्रम संवत', saka: 'शक', star: 'सूर्योदय पर नक्षत्र', fest_h: 'अगले 12 महीनों के त्योहार', fest_note: 'हर क्षेत्र के अपने नियम से गणना: चेन्नई (तमिल), कोच्चि (केरल), हैदराबाद (तेलुगु, कन्नड़), नई दिल्ली (उत्तर भारत)। आपके स्थानीय मंदिर का पंचांग एक दिन अलग हो सकता है।' }
  };
  const tx = (lang, k) => (TEXT[lang] && TEXT[lang][k] != null ? TEXT[lang][k] : TEXT.en[k]);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const glong = (lang, k) => new Intl.DateTimeFormat(lang === 'en' ? 'en-IN' : `${lang}-IN`, { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(Date.UTC(k.y, k.m - 1, k.d)));

  // The "one date, five calendars" table
  function tableHtml(lang, info) {
    const N = names(lang);
    const pk = (a) => `${a.krishna ? N.paksha.krishna : N.paksha.shukla} ${N.tithi(a.tithi)}`;
    const ad = (a) => (a.adhika ? `${tx(lang, 'adhika')} ` : '');
    const rows = [
      ['greg', '', glong(lang, info.date)],
      ['tamil', tx(lang, 'tamil_k'), `${N.tamil[info.tamil.month]} ${info.tamil.day} · ${N.samvat[info.tamil.samvatsara]} ${tx(lang, 'year')} · ${tx(lang, 'kali')} ${info.tamil.kali}`],
      ['mal', tx(lang, 'mal_k'), `${N.mal[info.malayalam.month]} ${info.malayalam.day} · ${tx(lang, 'kollam')} ${info.malayalam.kollam}`],
      ['telugu', tx(lang, 'telugu_k'), `${ad(info.amanta)}${N.lunar[info.amanta.month]} ${tx(lang, 'masam')} · ${pk(info.amanta)} · ${N.samvat[info.amanta.samvatsara]} · ${tx(lang, 'shaka')} ${info.amanta.shaka}`.replace(/  +/g, ' ')],
      ['north', tx(lang, 'north_k'), `${ad(info.purnimanta)}${N.lunar[info.purnimanta.month]} · ${pk(info.purnimanta)} · ${tx(lang, 'vikram')} ${info.purnimanta.vikram}`],
      ['nat', tx(lang, 'nat_k'), `${N.national[info.national.month]} ${info.national.day} · ${tx(lang, 'saka')} ${info.national.year}`]
    ];
    return `<div class="table-wrap"><table class="cal-today"><tbody>${rows.map(([k, kind, v]) => `<tr class="cal-${k}"><th scope="row">${esc(tx(lang, k))}${kind ? `<small>${esc(kind)}</small>` : ''}</th><td>${esc(v)}</td></tr>`).join('')}
      <tr class="cal-star"><th scope="row">${esc(tx(lang, 'star'))}</th><td>${esc(N.nak[info.nakshatra] || '')}</td></tr></tbody></table></div>`;
  }

  // ---------- Browser page ----------
  function initPage() {
    const $ = (s) => document.querySelector(s);
    const form = $('#cal-form'); if (!form) return;
    const lang = document.body.dataset.lang;
    const place = JSON.parse(form.dataset.place || '{"lat":13.0827,"lon":80.2707,"tz":5.5}');
    const di = $('#cal-date');
    const now = new Date(Date.now() + 5.5 * 3600000);
    if (!di.value) di.value = now.toISOString().slice(0, 10);
    const run = () => {
      const [y, m, d] = di.value.split('-').map(Number); if (!y) return;
      $('#cal-result').innerHTML = tableHtml(lang, dayInfo({ y, m, d }, place));
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
    di.addEventListener('change', run);
    // the page was prerendered for the build date: refresh it to today's date in India
    if (form.dataset.built !== di.value) run();
  }
  if (typeof document !== 'undefined') { root.RVExtra = root.RVExtra || {}; root.RVExtra.calendar = initPage; }

  root.Calendars = { dayInfo, festivals, names, lunarMonth, solarDate, sankrantiAfter, sankrantiBefore, national, TEXT, text: tx, tableHtml, glong, iso, addDays };
})(typeof window !== 'undefined' ? window : globalThis);
