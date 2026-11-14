// "YOUR star today" card on every language's home page.
// The person picks their birth star once (saved on the phone, no login). Each visit then shows:
// today's palan for their rasi (from social/<lang>.json, rebuilt every night), today's Rahu kalam
// for the language's main city (worked out in the browser) and a countdown to the next festival.
// Called from tools/build.mjs. Browser side: js/mystar.js.
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
await import('../js/astro.js'); await import('../js/i18n.js'); await import('../js/calendars.js');
const { I18N, Calendars: C } = globalThis;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const asset = (f) => `${f}?v=${createHash('sha1').update(readFileSync(join(root, f))).digest('hex').slice(0, 10)}`;

// Main city per language: [name in that language, lat, lon]
const CITY = {
  en: ['Chennai', 13.0827, 80.2707], ta: ['சென்னை', 13.0827, 80.2707], te: ['హైదరాబాద్', 17.385, 78.4867],
  kn: ['ಬೆಂಗಳೂರು', 12.9716, 77.5946], ml: ['കൊച്ചി', 9.9312, 76.2673], hi: ['नई दिल्ली', 28.6139, 77.209],
  mr: ['मुंबई', 19.076, 72.8777], bn: ['কলকাতা', 22.5726, 88.3639], gu: ['અમદાવાદ', 23.0225, 72.5714], or: ['ଭୁବନେଶ୍ୱର', 20.2961, 85.8245]
};

const TEXT = {
  en: { h: 'YOUR star today', sub: 'Pick your birth star once. This phone remembers it, no login.', star: 'Your birth star', pick: 'Choose your star', two: 'Your star is shared by two rasis. Which one is yours?', go: 'Show my day', change: 'Change star', rahu: 'Rahu kalam today, {city}', other_city: 'Other city', next: 'Next festival', in_days: 'in {n} days', tomorrow: 'tomorrow', today: 'today!', full: 'Read full palan', share: 'Share on WhatsApp', share_line: 'My star today on RasiVani. Check yours, free:', dont_know: 'Don\'t know your star? Make your free jathagam above.', chandra: 'Chandrashtamam today: go slow.', loading: 'Loading today\'s palan…', failed: 'Today\'s palan could not load. Open the full palan page.' },
  ta: { h: 'இன்று உங்கள் நட்சத்திரம்', sub: 'உங்கள் ஜென்ம நட்சத்திரத்தை ஒருமுறை தேர்வு செய்யுங்கள். இந்த போன் நினைவில் வைக்கும், லாகின் வேண்டாம்.', star: 'உங்கள் ஜென்ம நட்சத்திரம்', pick: 'நட்சத்திரத்தைத் தேர்வு செய்யுங்கள்', two: 'உங்கள் நட்சத்திரம் இரண்டு ராசிகளில் வரும். உங்கள் ராசி எது?', go: 'என் நாளைக் காட்டு', change: 'நட்சத்திரத்தை மாற்று', rahu: 'இன்றைய ராகு காலம், {city}', other_city: 'வேறு ஊர்', next: 'அடுத்த பண்டிகை', in_days: 'இன்னும் {n} நாட்களில்', tomorrow: 'நாளை', today: 'இன்று!', full: 'முழு பலன் படிக்க', share: 'வாட்ஸ்அப்பில் பகிர', share_line: 'RasiVani-ல் இன்று என் நட்சத்திர பலன். உங்களுடையதையும் இலவசமாகப் பாருங்கள்:', dont_know: 'நட்சத்திரம் தெரியாதா? மேலே இலவச ஜாதகம் கணியுங்கள்.', chandra: 'இன்று சந்திராஷ்டமம்: நிதானமாக இருங்கள்.', loading: 'இன்றைய பலன் வருகிறது…', failed: 'இன்றைய பலன் திறக்கவில்லை. முழு பலன் பக்கத்தைத் திறக்கவும்.' },
  te: { h: 'ఈరోజు మీ నక్షత్రం', sub: 'మీ జన్మ నక్షత్రాన్ని ఒక్కసారి ఎంచుకోండి. ఈ ఫోన్ గుర్తుంచుకుంటుంది, లాగిన్ అవసరం లేదు.', star: 'మీ జన్మ నక్షత్రం', pick: 'నక్షత్రం ఎంచుకోండి', two: 'మీ నక్షత్రం రెండు రాశుల్లో ఉంటుంది. మీ రాశి ఏది?', go: 'నా రోజు చూపించు', change: 'నక్షత్రం మార్చు', rahu: 'ఈరోజు రాహు కాలం, {city}', other_city: 'వేరే ఊరు', next: 'తదుపరి పండుగ', in_days: 'ఇంకా {n} రోజుల్లో', tomorrow: 'రేపు', today: 'ఈరోజే!', full: 'పూర్తి ఫలం చదవండి', share: 'వాట్సాప్‌లో షేర్ చేయండి', share_line: 'RasiVaniలో ఈరోజు నా నక్షత్ర ఫలం. మీదీ ఉచితంగా చూడండి:', dont_know: 'నక్షత్రం తెలియదా? పైన ఉచిత జాతకం చేయండి.', chandra: 'ఈరోజు చంద్రాష్టమం: నెమ్మదిగా ఉండండి.', loading: 'ఈరోజు ఫలం వస్తోంది…', failed: 'ఈరోజు ఫలం తెరవలేదు. పూర్తి ఫలం పేజీ తెరవండి.' },
  kn: { h: 'ಇಂದು ನಿಮ್ಮ ನಕ್ಷತ್ರ', sub: 'ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವನ್ನು ಒಮ್ಮೆ ಆರಿಸಿ. ಈ ಫೋನ್ ನೆನಪಿಡುತ್ತದೆ, ಲಾಗಿನ್ ಬೇಡ.', star: 'ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ', pick: 'ನಕ್ಷತ್ರ ಆರಿಸಿ', two: 'ನಿಮ್ಮ ನಕ್ಷತ್ರ ಎರಡು ರಾಶಿಗಳಲ್ಲಿ ಬರುತ್ತದೆ. ನಿಮ್ಮ ರಾಶಿ ಯಾವುದು?', go: 'ನನ್ನ ದಿನ ತೋರಿಸಿ', change: 'ನಕ್ಷತ್ರ ಬದಲಿಸಿ', rahu: 'ಇಂದಿನ ರಾಹು ಕಾಲ, {city}', other_city: 'ಬೇರೆ ಊರು', next: 'ಮುಂದಿನ ಹಬ್ಬ', in_days: 'ಇನ್ನು {n} ದಿನಗಳಲ್ಲಿ', tomorrow: 'ನಾಳೆ', today: 'ಇಂದೇ!', full: 'ಪೂರ್ಣ ಫಲ ಓದಿ', share: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿ', share_line: 'RasiVani ನಲ್ಲಿ ಇಂದು ನನ್ನ ನಕ್ಷತ್ರ ಫಲ. ನಿಮ್ಮದನ್ನೂ ಉಚಿತವಾಗಿ ನೋಡಿ:', dont_know: 'ನಕ್ಷತ್ರ ಗೊತ್ತಿಲ್ಲವೇ? ಮೇಲೆ ಉಚಿತ ಜಾತಕ ಮಾಡಿ.', chandra: 'ಇಂದು ಚಂದ್ರಾಷ್ಟಮ: ನಿಧಾನವಾಗಿರಿ.', loading: 'ಇಂದಿನ ಫಲ ಬರುತ್ತಿದೆ…', failed: 'ಇಂದಿನ ಫಲ ತೆರೆಯಲಿಲ್ಲ. ಪೂರ್ಣ ಫಲ ಪುಟ ತೆರೆಯಿರಿ.' },
  ml: { h: 'ഇന്ന് നിങ്ങളുടെ നക്ഷത്രം', sub: 'നിങ്ങളുടെ ജന്മനക്ഷത്രം ഒരിക്കൽ തിരഞ്ഞെടുക്കൂ. ഈ ഫോൺ ഓർത്തുവയ്ക്കും, ലോഗിൻ വേണ്ട.', star: 'നിങ്ങളുടെ ജന്മനക്ഷത്രം', pick: 'നക്ഷത്രം തിരഞ്ഞെടുക്കൂ', two: 'നിങ്ങളുടെ നക്ഷത്രം രണ്ട് രാശികളിൽ വരുന്നു. നിങ്ങളുടെ രാശി ഏത്?', go: 'എന്റെ ദിവസം കാണിക്കൂ', change: 'നക്ഷത്രം മാറ്റൂ', rahu: 'ഇന്നത്തെ രാഹുകാലം, {city}', other_city: 'മറ്റൊരു സ്ഥലം', next: 'അടുത്ത ഉത്സവം', in_days: 'ഇനി {n} ദിവസം', tomorrow: 'നാളെ', today: 'ഇന്ന്!', full: 'മുഴുവൻ ഫലം വായിക്കൂ', share: 'വാട്സാപ്പിൽ പങ്കിടൂ', share_line: 'RasiVani-യിൽ ഇന്ന് എന്റെ നക്ഷത്രഫലം. നിങ്ങളുടേതും സൗജന്യമായി നോക്കൂ:', dont_know: 'നക്ഷത്രം അറിയില്ലേ? മുകളിൽ സൗജന്യ ജാതകം ഉണ്ടാക്കൂ.', chandra: 'ഇന്ന് ചന്ദ്രാഷ്ടമം: പതുക്കെ മതി.', loading: 'ഇന്നത്തെ ഫലം വരുന്നു…', failed: 'ഇന്നത്തെ ഫലം തുറന്നില്ല. മുഴുവൻ ഫലം പേജ് തുറക്കൂ.' },
  hi: { h: 'आज आपका नक्षत्र', sub: 'अपना जन्म नक्षत्र एक बार चुनें। यह फ़ोन याद रखेगा, लॉगिन नहीं चाहिए।', star: 'आपका जन्म नक्षत्र', pick: 'नक्षत्र चुनें', two: 'आपका नक्षत्र दो राशियों में आता है। आपकी राशि कौन सी है?', go: 'मेरा दिन दिखाएँ', change: 'नक्षत्र बदलें', rahu: 'आज का राहु काल, {city}', other_city: 'दूसरा शहर', next: 'अगला त्योहार', in_days: '{n} दिन बाद', tomorrow: 'कल', today: 'आज!', full: 'पूरा राशिफल पढ़ें', share: 'व्हाट्सऐप पर शेयर करें', share_line: 'RasiVani पर आज मेरा नक्षत्र फल। आप भी मुफ़्त देखें:', dont_know: 'नक्षत्र नहीं पता? ऊपर मुफ़्त कुंडली बनाएँ।', chandra: 'आज चंद्राष्टम है: धीरे चलें।', loading: 'आज का फल आ रहा है…', failed: 'आज का फल नहीं खुला। पूरा राशिफल पेज खोलें।' },
  mr: { h: 'आज तुमचे नक्षत्र', sub: 'तुमचे जन्म नक्षत्र एकदा निवडा. हा फोन लक्षात ठेवेल, लॉगिन नको.', star: 'तुमचे जन्म नक्षत्र', pick: 'नक्षत्र निवडा', two: 'तुमचे नक्षत्र दोन राशींमध्ये येते. तुमची रास कोणती?', go: 'माझा दिवस दाखवा', change: 'नक्षत्र बदला', rahu: 'आजचा राहू काळ, {city}', other_city: 'दुसरे शहर', next: 'पुढचा सण', in_days: '{n} दिवसांनी', tomorrow: 'उद्या', today: 'आज!', full: 'संपूर्ण राशीभविष्य वाचा', share: 'व्हॉट्सॲपवर शेअर करा', share_line: 'RasiVani वर आज माझे नक्षत्र फल. तुमचेही मोफत पाहा:', dont_know: 'नक्षत्र माहीत नाही? वर मोफत कुंडली बनवा.', chandra: 'आज चंद्राष्टम: सावकाश राहा.', loading: 'आजचे फल येत आहे…', failed: 'आजचे फल उघडले नाही. संपूर्ण राशीभविष्य पान उघडा.' },
  bn: { h: 'আজ আপনার নক্ষত্র', sub: 'আপনার জন্ম নক্ষত্র একবার বেছে নিন। এই ফোন মনে রাখবে, লগইন লাগবে না।', star: 'আপনার জন্ম নক্ষত্র', pick: 'নক্ষত্র বেছে নিন', two: 'আপনার নক্ষত্র দুটি রাশিতে পড়ে। আপনার রাশি কোনটি?', go: 'আমার দিন দেখান', change: 'নক্ষত্র বদলান', rahu: 'আজকের রাহু কাল, {city}', other_city: 'অন্য শহর', next: 'পরের উৎসব', in_days: '{n} দিন পরে', tomorrow: 'আগামীকাল', today: 'আজ!', full: 'পুরো রাশিফল পড়ুন', share: 'হোয়াটসঅ্যাপে শেয়ার করুন', share_line: 'RasiVani-তে আজ আমার নক্ষত্র ফল। আপনারটাও বিনামূল্যে দেখুন:', dont_know: 'নক্ষত্র জানেন না? উপরে বিনামূল্যে কুষ্ঠি তৈরি করুন।', chandra: 'আজ চন্দ্রাষ্টম: ধীরে চলুন।', loading: 'আজকের ফল আসছে…', failed: 'আজকের ফল খোলেনি। পুরো রাশিফল পাতা খুলুন।' },
  gu: { h: 'આજે તમારું નક્ષત્ર', sub: 'તમારું જન્મ નક્ષત્ર એકવાર પસંદ કરો. આ ફોન યાદ રાખશે, લૉગિન નહીં.', star: 'તમારું જન્મ નક્ષત્ર', pick: 'નક્ષત્ર પસંદ કરો', two: 'તમારું નક્ષત્ર બે રાશિમાં આવે છે. તમારી રાશિ કઈ?', go: 'મારો દિવસ બતાવો', change: 'નક્ષત્ર બદલો', rahu: 'આજનો રાહુ કાળ, {city}', other_city: 'બીજું શહેર', next: 'આગલો તહેવાર', in_days: '{n} દિવસમાં', tomorrow: 'કાલે', today: 'આજે!', full: 'પૂરું રાશિફળ વાંચો', share: 'વૉટ્સએપ પર શેર કરો', share_line: 'RasiVani પર આજે મારું નક્ષત્ર ફળ. તમારું પણ મફત જુઓ:', dont_know: 'નક્ષત્ર ખબર નથી? ઉપર મફત કુંડળી બનાવો.', chandra: 'આજે ચંદ્રાષ્ટમ: ધીરે ચાલો.', loading: 'આજનું ફળ આવી રહ્યું છે…', failed: 'આજનું ફળ ખૂલ્યું નહીં. પૂરું રાશિફળ પાનું ખોલો.' },
  or: { h: 'ଆଜି ଆପଣଙ୍କ ନକ୍ଷତ୍ର', sub: 'ଆପଣଙ୍କ ଜନ୍ମ ନକ୍ଷତ୍ର ଥରେ ବାଛନ୍ତୁ। ଏହି ଫୋନ୍ ମନେ ରଖିବ, ଲଗଇନ୍ ଦରକାର ନାହିଁ।', star: 'ଆପଣଙ୍କ ଜନ୍ମ ନକ୍ଷତ୍ର', pick: 'ନକ୍ଷତ୍ର ବାଛନ୍ତୁ', two: 'ଆପଣଙ୍କ ନକ୍ଷତ୍ର ଦୁଇଟି ରାଶିରେ ପଡ଼େ। ଆପଣଙ୍କ ରାଶି କେଉଁଟି?', go: 'ମୋ ଦିନ ଦେଖାନ୍ତୁ', change: 'ନକ୍ଷତ୍ର ବଦଳାନ୍ତୁ', rahu: 'ଆଜିର ରାହୁ କାଳ, {city}', other_city: 'ଅନ୍ୟ ସହର', next: 'ପରବର୍ତ୍ତୀ ପର୍ବ', in_days: '{n} ଦିନ ପରେ', tomorrow: 'କାଲି', today: 'ଆଜି!', full: 'ପୂରା ରାଶିଫଳ ପଢ଼ନ୍ତୁ', share: 'ହ୍ୱାଟସଆପରେ ସେୟାର କରନ୍ତୁ', share_line: 'RasiVani ରେ ଆଜି ମୋ ନକ୍ଷତ୍ର ଫଳ। ଆପଣଙ୍କର ମଧ୍ୟ ମାଗଣାରେ ଦେଖନ୍ତୁ:', dont_know: 'ନକ୍ଷତ୍ର ଜଣା ନାହିଁ? ଉପରେ ମାଗଣା ଜାତକ ତିଆରି କରନ୍ତୁ।', chandra: 'ଆଜି ଚନ୍ଦ୍ରାଷ୍ଟମ: ଧୀରେ ଚାଲନ୍ତୁ।', loading: 'ଆଜିର ଫଳ ଆସୁଛି…', failed: 'ଆଜିର ଫଳ ଖୋଲିଲା ନାହିଁ। ପୂରା ରାଶିଫଳ ପୃଷ୍ଠା ଖୋଲନ୍ତୁ।' }
};

// Festival names: content/extras/<lang>.mjs where it exists, else English
const FEST_TXT = {};
async function festText(lang) {
  if (FEST_TXT[lang]) return FEST_TXT[lang];
  const f = join(root, 'content', 'extras', `${lang}.mjs`);
  FEST_TXT[lang] = (await import(existsSync(f) ? `../content/extras/${lang}.mjs` : '../content/extras/en.mjs')).default.fest;
  return FEST_TXT[lang];
}
let FEST = null;
function upcoming() {
  if (FEST) return FEST;
  const now = new Date(Date.now() + 5.5 * 3600000);
  FEST = C.festivals({ y: now.getUTCFullYear(), m: now.getUTCMonth() + 1, d: now.getUTCDate() }, 400).filter((f) => !f.key.startsWith('sankranti_'));
  return FEST;
}

export async function homeCard(lang, { kalamHref } = {}) {
  const t = TEXT[lang] || TEXT.en, F = await festText(lang);
  const nak = I18N.TERMS[lang].nak;
  const [city, lat, lon] = CITY[lang] || CITY.en;
  const fest = upcoming().map((f) => [f.iso, F[f.key] || f.key]);
  const data = { t, city, lat, lon, fest, kalam: kalamHref || '' };
  return `<section class="mystar" id="my-star" aria-labelledby="mystar-h" data-lang="${lang}">
  <div class="mystar-head"><h2 id="mystar-h">✦ ${esc(t.h)}</h2><button type="button" class="link-btn mystar-change" hidden>${esc(t.change)}</button></div>
  <form class="mystar-pick" novalidate>
    <p class="cs-hint">${esc(t.sub)}</p>
    <div class="field"><label for="ms-star">${esc(t.star)}</label><select id="ms-star" required><option value="">${esc(t.pick)}</option>${nak.map((n, i) => `<option value="${i}">${esc(n)}</option>`).join('')}</select></div>
    <div class="mystar-two" hidden><p>${esc(t.two)}</p><div class="seg" role="group"></div></div>
    <button class="btn" type="submit">${esc(t.go)}</button>
    <p class="cs-hint">${esc(t.dont_know)}</p>
  </form>
  <div class="mystar-out" aria-live="polite" hidden></div>
  <script type="application/json" class="mystar-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
  <script defer src="${asset('js/mystar.js')}"></script>
</section>`;
}
