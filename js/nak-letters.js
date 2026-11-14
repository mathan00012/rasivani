/* RasiVani: first letters for naming by nakshatra pada (the traditional Avakahada table).
   Stored once in Devanagari; other scripts are derived. Tamil has its own mapping because it has
   no separate letters for voiced or aspirated consonants. */
(function (root) {
  'use strict';
  // 27 nakshatras x 4 padas, in order from Ashwini
  const DEV = [
    ['चू', 'चे', 'चो', 'ला'], ['ली', 'लू', 'ले', 'लो'], ['अ', 'ई', 'उ', 'ए'], ['ओ', 'वा', 'वी', 'वू'],
    ['वे', 'वो', 'का', 'की'], ['कु', 'घ', 'ङ', 'छ'], ['के', 'को', 'हा', 'ही'], ['हु', 'हे', 'हो', 'डा'],
    ['डी', 'डू', 'डे', 'डो'], ['मा', 'मी', 'मू', 'मे'], ['मो', 'टा', 'टी', 'टू'], ['टे', 'टो', 'पा', 'पी'],
    ['पू', 'ष', 'ण', 'ठ'], ['पे', 'पो', 'रा', 'री'], ['रू', 'रे', 'रो', 'ता'], ['ती', 'तू', 'ते', 'तो'],
    ['ना', 'नी', 'नू', 'ने'], ['नो', 'या', 'यी', 'यू'], ['ये', 'यो', 'भा', 'भी'], ['भू', 'धा', 'फा', 'ढा'],
    ['भे', 'भो', 'जा', 'जी'], ['खी', 'खू', 'खे', 'खो'], ['गा', 'गी', 'गु', 'गे'], ['गो', 'सा', 'सी', 'सू'],
    ['से', 'सो', 'दा', 'दी'], ['दू', 'थ', 'झ', 'ञ'], ['दे', 'दो', 'चा', 'ची']
  ];
  // Unicode offset from the Devanagari block for scripts whose letters line up with it
  const OFFSET = { hi: 0, mr: 0, bn: 0x80, gu: 0x180, or: 0x200, te: 0x300, kn: 0x380, ml: 0x400 };
  // Latin for English pages
  const LAT_C = { क: 'k', ख: 'kh', ग: 'g', घ: 'gh', ङ: 'ng', च: 'ch', छ: 'chh', ज: 'j', झ: 'jh', ञ: 'ny', ट: 't', ठ: 'th', ड: 'd', ढ: 'dh', ण: 'n',
    त: 't', थ: 'th', द: 'd', ध: 'dh', न: 'n', प: 'p', फ: 'ph', ब: 'b', भ: 'bh', म: 'm', य: 'y', र: 'r', ल: 'l', व: 'v', ष: 'sh', स: 's', ह: 'h' };
  const LAT_V = { '': 'a', 'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au' };
  const LAT_IV = { अ: 'A', आ: 'Aa', इ: 'I', ई: 'Ee', उ: 'U', ऊ: 'Oo', ए: 'E', ओ: 'O' };
  // Tamil: nearest Tamil letter for each Devanagari consonant (as used in Tamil naming lists)
  const TA_C = { क: 'க', ख: 'க', ग: 'க', घ: 'க', ङ: 'ங', च: 'ச', छ: 'ச', ज: 'ஜ', झ: 'ஜ', ञ: 'ஞ', ट: 'ட', ठ: 'ட', ड: 'ட', ढ: 'ட', ण: 'ண',
    त: 'த', थ: 'த', द: 'த', ध: 'த', न: 'ந', प: 'ப', फ: 'ப', ब: 'ப', भ: 'ப', म: 'ம', य: 'ய', र: 'ர', ल: 'ல', व: 'வ', ष: 'ஷ', स: 'ஸ', ह: 'ஹ' };
  const TA_V = { '': '', 'ा': 'ா', 'ि': 'ி', 'ी': 'ீ', 'ु': 'ு', 'ू': 'ூ', 'े': 'ே', 'ै': 'ை', 'ो': 'ோ', 'ौ': 'ௌ' };
  const TA_IV = { अ: 'அ', आ: 'ஆ', इ: 'இ', ई: 'ஈ', उ: 'உ', ऊ: 'ஊ', ए: 'ஏ', ओ: 'ஓ' };

  function convert(syl, lang) {
    if (lang in OFFSET) return [...syl].map((ch) => String.fromCharCode(ch.charCodeAt(0) + OFFSET[lang])).join('');
    const c = syl[0], v = syl.slice(1);
    if (lang === 'ta') return TA_IV[c] || (TA_C[c] + TA_V[v]);
    return LAT_IV[c] || (LAT_C[c] + LAT_V[v]); // en and anything else
  }
  // letters(star 0-26, pada 1-4, lang) -> one syllable; all(star, lang) -> the four
  const letters = (star, pada, lang) => convert(DEV[star][pada - 1], lang);
  const all = (star, lang) => DEV[star].map((s) => convert(s, lang));
  root.NakLetters = { DEV, letters, all, convert };
})(typeof window !== 'undefined' ? window : globalThis);
