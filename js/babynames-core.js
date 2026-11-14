/* RasiVani: baby names by nakshatra pada. Shared by the site builder (tools/babynames.mjs) and, later, the paid
   Baby Naming Guide in the browser. Needs js/nak-letters.js (NakLetters) loaded first.
   Data: content/babynames/names.mjs + meanings.mjs; the builder also writes them to js/babynames-data.js.
   Usage: const B = BabyNames.make(names, meanings);  B.forPada('ta', 0, 1) -> { letter, also, boys: [...], girls: [...] } */
(function (root) {
  'use strict';
  const LANGS = ['en', 'hi', 'ta', 'te', 'kn', 'ml'];
  const MEAN_IDX = { hi: 0, ta: 1, te: 2, kn: 3, ml: 4 };
  const OFFSET = { hi: 0, te: 0x300, kn: 0x380, ml: 0x400 };

  // Rare sounds: the substitute letters families use (Devanagari). Key "star:pada" (pada 1-4).
  const ALT = {
    '5:3': ['न'],            // Ardra 3: ङ → na
    '12:2': ['श'],           // Hasta 2: ष → sha
    '12:3': ['न'],           // Hasta 3: ण → na
    '12:4': ['थ', 'त'],      // Hasta 4: ठ → tha / ta
    '13:4': ['ऋ'],           // Chitra 4: री, also written ऋ (Rishi, Ritu)
    '19:4': ['डा', 'दा'],    // Purva Ashadha 4: ढा → da
    '25:2': ['त'],           // Uttara Bhadrapada 2: थ → ta
    '25:4': ['ज्ञ']          // Uttara Bhadrapada 4: ञ → gya / gnana (ज्ञ)
  };
  // ट and ड: names are usually written with the soft त and द
  const SOFT = { 'ट': 'त', 'ड': 'द' };
  // Tamil substitutes: no Tamil name starts with ட, ங or ண; ஸ and ஷ are also written ச
  const TA_ALT = { 'ட': 'த', 'ங': 'ந', 'ண': 'ந', 'ஸ': 'ச', 'ஷ': 'ச' };

  // ---- first sound of a name: consonant + vowel class ----
  const DEV_V = { '': 'a', 'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'r', 'े': 'e', 'ै': 'e', 'ो': 'o', 'ौ': 'o' };
  const DEV_IV = { 'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ऋ': 'r', 'ए': 'e', 'ऐ': 'e', 'ओ': 'o', 'औ': 'o' };
  const TA_V = { '': 'a', 'ா': 'a', 'ி': 'i', 'ீ': 'i', 'ு': 'u', 'ூ': 'u', 'ெ': 'e', 'ே': 'e', 'ை': 'e', 'ொ': 'o', 'ோ': 'o', 'ௌ': 'o' };
  const TA_IV = { 'அ': 'a', 'ஆ': 'a', 'இ': 'i', 'ஈ': 'i', 'உ': 'u', 'ஊ': 'u', 'எ': 'e', 'ஏ': 'e', 'ஐ': 'e', 'ஒ': 'o', 'ஓ': 'o', 'ஔ': 'o' };
  function head(word, V, IV, virama) {
    const ch = [...word];
    if (IV[ch[0]]) return ['V', IV[ch[0]]];
    let i = 1;
    while (ch[i] === virama && ch[i + 1]) i += 2; // skip conjuncts: प्रि → p + i
    return [ch[0], V[ch[i]] || 'a'];
  }
  const devHead = (w) => head(w, DEV_V, DEV_IV, '्');
  const taHead = (w) => head(w, TA_V, TA_IV, '்');

  // Nasal before a stop of the same group: Telugu/Kannada write the dot (ఆనంద్), Malayalam the letter (ആനന്ദ്)
  const GROUPS = [[0x915, 0x919], [0x91A, 0x91E], [0x91F, 0x923], [0x924, 0x928], [0x92A, 0x92E]];
  const groupOf = (c) => GROUPS.find(([a, b]) => c >= a && c < b);
  function nasals(dev, mode) {
    if (!mode) return dev;
    const ch = [...dev], out = [];
    for (let i = 0; i < ch.length; i++) {
      const c = ch[i].charCodeAt(0), nx = ch[i + 1] && ch[i + 1].charCodeAt(0), nx2 = ch[i + 2] && ch[i + 2].charCodeAt(0);
      if (mode === 'letter' && ch[i] === 'ं' && nx && groupOf(nx)) { out.push(String.fromCharCode(groupOf(nx)[1]), '्'); continue; }
      if (mode === 'dot' && ch[i + 1] === '्' && nx2 && groupOf(nx2) && groupOf(nx2)[1] === c) { out.push('ं'); i++; continue; }
      out.push(ch[i]);
    }
    return out.join('');
  }

  function make(N, M) {
    const NL = root.NakLetters;
    const parse = (s) => (s ? s.split(';').map((e) => { const [lat, dev, ta, mean] = e.split('='); return { lat, dev, ta, mean }; }) : []);
    const DATA = N.map((star) => star.map(([b, g]) => ({ boys: parse(b), girls: parse(g) })));
    const syl = (star, pada) => NL.DEV[star][pada - 1];

    // Devanagari first sounds accepted for a pada: its own syllable, then substitutes
    function devAlts(star, pada) {
      const s = syl(star, pada), out = [s];
      if (SOFT[s[0]]) out.push(SOFT[s[0]] + s.slice(1));
      for (const a of ALT[`${star}:${pada}`] || []) out.push(a + (a.length === 1 && !DEV_IV[a] ? s.slice(1) : ''));
      return [...new Set(out)];
    }
    function devOk(star, pada, dev) {
      return devAlts(star, pada).some((a) => {
        if ([...a].length > 2 || DEV_IV[a[0]] === 'r' || a.includes('्')) return dev.startsWith(a);
        const [c, v] = devHead(a), [c2, v2] = devHead(dev);
        return c === c2 && v === v2;
      });
    }
    const taLetter = (star, pada) => NL.convert(syl(star, pada), 'ta');
    function taAlts(star, pada) {
      const t = taLetter(star, pada), out = [t];
      if (TA_ALT[t[0]]) out.push(TA_ALT[t[0]] + t.slice(1));
      // substitutes from the Devanagari table (e.g. ण → ந, ञ → ஞா)
      for (const a of ALT[`${star}:${pada}`] || []) { if (a === 'ज्ञ') out.push('ஞா'); else if (!DEV_IV[a]) { const t = NL.convert(a + syl(star, pada).slice(1), 'ta'); if (!t.includes('undefined')) out.push(t); } }
      return [...new Set(out)];
    }
    function taOk(star, pada, ta) {
      const [c2, v2] = taHead(ta);
      return taAlts(star, pada).some((a) => { const [c, v] = taHead(a); return c === c2 && (v === v2 || a.length === 1 && c === 'ஞ'); });
    }

    // Name shown in a language's own script
    function script(n, lang) {
      if (lang === 'ta') return n.ta;
      if (lang === 'en') return n.lat;
      if (lang in OFFSET) {
        let w = [...nasals(n.dev, lang === 'ml' ? 'letter' : lang === 'hi' ? '' : 'dot')].map((c) => String.fromCharCode(c.charCodeAt(0) + OFFSET[lang])).join('');
        if (lang === 'hi') return w;
        const V = String.fromCharCode(0x094D + OFFSET[lang]), AA = String.fromCharCode(0x093E + OFFSET[lang]);
        const last = w.charCodeAt(w.length - 1) - OFFSET[lang];
        // Written as spoken in the South: Vijay → విజయ్, Priya → ప్రియ (Kannada keeps ಪ್ರಿಯಾ)
        if (/[^aeiou]$/i.test(n.lat) && last >= 0x0915 && last <= 0x0939) w += V;
        if (/a$/i.test(n.lat) && lang !== 'kn' && w.endsWith(AA)) w = w.slice(0, -1);
        if (/i$/i.test(n.lat) && w.endsWith(String.fromCharCode(0x0940 + OFFSET[lang]))) w = w.slice(0, -1) + String.fromCharCode(0x093F + OFFSET[lang]);
        if (lang === 'ml') w = w.replace(/മ്$/, 'ം').replace(/മ്ബ/g, 'ംബ').replace(/ര്(?=[ക-ഹ])(?!യ)/g, 'ർ').replace(/ന്$/, 'ൻ').replace(/ര്$/, 'ർ').replace(/ല്$/, 'ൽ').replace(/ള്$/, 'ൾ').replace(/ണ്$/, 'ൺ');
        return w;
      }
      return n.lat;
    }
    function meaning(n, lang) {
      if (lang === 'en' || !(lang in MEAN_IDX)) return n.mean;
      const row = M[n.mean]; const v = row && row.split('|')[MEAN_IDX[lang]];
      return v || n.mean;
    }
    const shows = (n, lang) => (lang === 'ta' ? !!n.ta : !!n.dev);
    // Letters for a pada in a language: the main letter, then the substitutes
    function letters(star, pada, lang) {
      if (lang === 'ta') return taAlts(star, pada);
      const conv = (s) => (lang === 'en' ? NL.convert(s, 'en').replace(/aa$/, 'a').replace(/ee$/, 'i').replace(/oo$/, 'u').replace(/^Ee$/, 'I').replace(/^Oo$/, 'U') : NL.convert(s, lang));
      return devAlts(star, pada).map((s) => (DEV_IV[s[0]] === 'r' && lang === 'en' ? 'Ri' : s === 'ज्ञ' ? (lang === 'en' ? 'Gya' : [...s].map((c) => String.fromCharCode(c.charCodeAt(0) + (OFFSET[lang] || 0))).join('')) : conv(s)))
        .filter((v, i, a) => a.indexOf(v) === i);
    }
    function forPada(lang, star, pada) {
      const d = DATA[star][pada - 1];
      const pick = (list) => list.filter((n) => shows(n, lang)).map((n) => ({ name: script(n, lang), latin: n.lat, meaning: meaning(n, lang), en: n.mean }));
      const L = letters(star, pada, lang);
      return { letter: L[0], also: L.slice(1), boys: pick(d.boys), girls: pick(d.girls) };
    }
    // Problems in the data (names that do not start with their pada letter, missing meanings)
    function check() {
      const errs = [];
      DATA.forEach((st, s) => st.forEach((d, p) => [...d.boys, ...d.girls].forEach((n) => {
        const where = `${s}:${p + 1} ${n.lat}`;
        if (n.dev && !devOk(s, p + 1, n.dev)) errs.push(`${where}: ${n.dev} does not start with ${devAlts(s, p + 1).join('/')}`);
        if (n.ta && !taOk(s, p + 1, n.ta)) errs.push(`${where}: ${n.ta} does not start with ${taAlts(s, p + 1).join('/')}`);
        const row = M[n.mean];
        if (!row) errs.push(`${where}: no translations for meaning "${n.mean}"`);
        else {
          const r = row.split('|');
          if (n.dev && ['hi', 'te', 'kn', 'ml'].some((l) => !r[MEAN_IDX[l]])) errs.push(`${where}: meaning "${n.mean}" missing a translation`);
          if (n.ta && !r[MEAN_IDX.ta]) errs.push(`${where}: meaning "${n.mean}" missing Tamil`);
        }
      })));
      return errs;
    }
    return { LANGS, DATA, forPada, letters, check, script, meaning };
  }
  root.BabyNames = { make, LANGS };
})(typeof window !== 'undefined' ? window : globalThis);
