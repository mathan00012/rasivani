/* RasiVani chart styles: the three widely used ways of drawing a Vedic birth chart.
   South Indian (rasis fixed, clockwise), North Indian (lagna on top, houses anticlockwise),
   East Indian (rasis fixed, anticlockwise, Mesha top-centre).
   Used in the browser (picker + East chart drawing) and in Node (tools/extras.mjs prerenders the picker,
   so search engines and AI crawlers read the options too). No dependencies. */
(function (root) {
  'use strict';
  const STYLES = ['south', 'north', 'east'];
  const TEXT = {
    en: { h: 'Choose your chart style', hint: 'Same planets, three ways of drawing them. Pick the one your family uses. You can switch any time after the chart is made.',
      south: 'South Indian', north: 'North Indian', east: 'East Indian',
      r_south: 'Tamil Nadu, Kerala, Karnataka, Andhra, Telangana, Sri Lanka', r_north: 'North and West India, Nepal', r_east: 'Bengal, Odisha, Assam, Bangladesh',
      how_south: 'Rasis fixed, read clockwise', how_north: 'Lagna on top, houses anticlockwise', how_east: 'Rasis fixed, read anticlockwise', example: 'Example' },
    hi: { h: 'अपनी कुंडली शैली चुनें', hint: 'ग्रह वही, बनाने के तीन तरीके। जो आपका परिवार देखता है वह चुनें। कुंडली बनने के बाद भी बदल सकते हैं।',
      south: 'दक्षिण भारतीय', north: 'उत्तर भारतीय', east: 'पूर्व भारतीय',
      r_south: 'तमिलनाडु, केरल, कर्नाटक, आंध्र, तेलंगाना, श्रीलंका', r_north: 'उत्तर व पश्चिम भारत, नेपाल', r_east: 'बंगाल, ओडिशा, असम, बांग्लादेश',
      how_south: 'राशियाँ स्थिर, घड़ी की दिशा में', how_north: 'लग्न ऊपर, भाव वामावर्त', how_east: 'राशियाँ स्थिर, घड़ी की उलटी दिशा में', example: 'उदाहरण' },
    ta: { h: 'உங்கள் கட்ட முறையைத் தேர்ந்தெடுங்கள்', hint: 'கிரகங்கள் ஒன்றே, வரையும் முறைகள் மூன்று. உங்கள் குடும்பம் பார்க்கும் முறையைத் தேர்ந்தெடுங்கள். ஜாதகம் வந்த பிறகும் மாற்றலாம்.',
      south: 'தென்னிந்திய', north: 'வட இந்திய', east: 'கிழக்கு இந்திய',
      r_south: 'தமிழ்நாடு, கேரளா, கர்நாடகா, ஆந்திரா, தெலங்கானா, இலங்கை', r_north: 'வட மற்றும் மேற்கு இந்தியா, நேபாளம்', r_east: 'வங்காளம், ஒடிசா, அசாம், வங்கதேசம்',
      how_south: 'ராசிகள் நிலையானவை, கடிகார திசையில்', how_north: 'லக்னம் மேலே, பாவங்கள் எதிர் திசையில்', how_east: 'ராசிகள் நிலையானவை, கடிகார எதிர் திசையில்', example: 'மாதிரி' },
    te: { h: 'మీ చక్ర శైలిని ఎంచుకోండి', hint: 'గ్రహాలు అవే, గీసే విధానాలు మూడు. మీ కుటుంబం చూసే శైలిని ఎంచుకోండి. జాతకం వచ్చాక కూడా మార్చుకోవచ్చు.',
      south: 'దక్షిణ భారత', north: 'ఉత్తర భారత', east: 'తూర్పు భారత',
      r_south: 'తమిళనాడు, కేరళ, కర్ణాటక, ఆంధ్ర, తెలంగాణ, శ్రీలంక', r_north: 'ఉత్తర, పశ్చిమ భారతం, నేపాల్', r_east: 'బెంగాల్, ఒడిశా, అస్సాం, బంగ్లాదేశ్',
      how_south: 'రాశులు స్థిరం, సవ్య దిశలో', how_north: 'లగ్నం పైన, భావాలు అపసవ్యంగా', how_east: 'రాశులు స్థిరం, అపసవ్య దిశలో', example: 'ఉదాహరణ' },
    kn: { h: 'ನಿಮ್ಮ ಕುಂಡಲಿ ಶೈಲಿ ಆರಿಸಿ', hint: 'ಗ್ರಹಗಳು ಅವೇ, ಬರೆಯುವ ವಿಧಾನ ಮೂರು. ನಿಮ್ಮ ಕುಟುಂಬ ನೋಡುವ ಶೈಲಿ ಆರಿಸಿ. ಜಾತಕ ಬಂದ ನಂತರವೂ ಬದಲಾಯಿಸಬಹುದು.',
      south: 'ದಕ್ಷಿಣ ಭಾರತ', north: 'ಉತ್ತರ ಭಾರತ', east: 'ಪೂರ್ವ ಭಾರತ',
      r_south: 'ತಮಿಳುನಾಡು, ಕೇರಳ, ಕರ್ನಾಟಕ, ಆಂಧ್ರ, ತೆಲಂಗಾಣ, ಶ್ರೀಲಂಕಾ', r_north: 'ಉತ್ತರ ಮತ್ತು ಪಶ್ಚಿಮ ಭಾರತ, ನೇಪಾಳ', r_east: 'ಬಂಗಾಳ, ಒಡಿಶಾ, ಅಸ್ಸಾಂ, ಬಾಂಗ್ಲಾದೇಶ',
      how_south: 'ರಾಶಿಗಳು ಸ್ಥಿರ, ಪ್ರದಕ್ಷಿಣವಾಗಿ', how_north: 'ಲಗ್ನ ಮೇಲೆ, ಭಾವಗಳು ಅಪ್ರದಕ್ಷಿಣವಾಗಿ', how_east: 'ರಾಶಿಗಳು ಸ್ಥಿರ, ಅಪ್ರದಕ್ಷಿಣವಾಗಿ', example: 'ಉದಾಹರಣೆ' },
    ml: { h: 'നിങ്ങളുടെ ചക്ര ശൈലി തിരഞ്ഞെടുക്കുക', hint: 'ഗ്രഹങ്ങൾ ഒന്നുതന്നെ, വരയ്ക്കുന്ന രീതി മൂന്ന്. നിങ്ങളുടെ കുടുംബം നോക്കുന്ന രീതി തിരഞ്ഞെടുക്കുക. ജാതകം വന്നതിനുശേഷവും മാറ്റാം.',
      south: 'ദക്ഷിണേന്ത്യൻ', north: 'ഉത്തരേന്ത്യൻ', east: 'കിഴക്കേ ഇന്ത്യൻ',
      r_south: 'തമിഴ്നാട്, കേരളം, കർണാടകം, ആന്ധ്ര, തെലങ്കാന, ശ്രീലങ്ക', r_north: 'ഉത്തര-പശ്ചിമ ഇന്ത്യ, നേപ്പാൾ', r_east: 'ബംഗാൾ, ഒഡീഷ, അസം, ബംഗ്ലാദേശ്',
      how_south: 'രാശികൾ സ്ഥിരം, ഘടികാരദിശയിൽ', how_north: 'ലഗ്നം മുകളിൽ, ഭാവങ്ങൾ എതിർദിശയിൽ', how_east: 'രാശികൾ സ്ഥിരം, എതിർദിശയിൽ', example: 'ഉദാഹരണം' },
    mr: { h: 'तुमची कुंडली शैली निवडा', hint: 'ग्रह तेच, काढण्याच्या तीन पद्धती. तुमचे कुटुंब पाहते ती निवडा. कुंडली झाल्यावरही बदलता येईल.',
      south: 'दक्षिण भारतीय', north: 'उत्तर भारतीय', east: 'पूर्व भारतीय',
      r_south: 'तमिळनाडू, केरळ, कर्नाटक, आंध्र, तेलंगणा, श्रीलंका', r_north: 'उत्तर व पश्चिम भारत, नेपाळ', r_east: 'बंगाल, ओडिशा, आसाम, बांगलादेश',
      how_south: 'राशी स्थिर, घड्याळाच्या दिशेने', how_north: 'लग्न वर, भाव उलट दिशेने', how_east: 'राशी स्थिर, घड्याळाच्या उलट दिशेने', example: 'उदाहरण' },
    bn: { h: 'আপনার কুষ্ঠির ধরন বেছে নিন', hint: 'গ্রহ একই, আঁকার ধরন তিনটি। আপনার পরিবার যেটা দেখে সেটা বেছে নিন। কুষ্ঠি তৈরির পরেও বদলানো যায়।',
      south: 'দক্ষিণ ভারতীয়', north: 'উত্তর ভারতীয়', east: 'পূর্ব ভারতীয়',
      r_south: 'তামিলনাড়ু, কেরল, কর্ণাটক, অন্ধ্র, তেলেঙ্গানা, শ্রীলঙ্কা', r_north: 'উত্তর ও পশ্চিম ভারত, নেপাল', r_east: 'বাংলা, ওড়িশা, অসম, বাংলাদেশ',
      how_south: 'রাশি স্থির, ঘড়ির কাঁটার দিকে', how_north: 'লগ্ন উপরে, ভাব উল্টো দিকে', how_east: 'রাশি স্থির, ঘড়ির কাঁটার উল্টো দিকে', example: 'উদাহরণ' },
    gu: { h: 'તમારી કુંડળી શૈલી પસંદ કરો', hint: 'ગ્રહો એ જ, દોરવાની ત્રણ રીત. તમારો પરિવાર જુએ છે તે પસંદ કરો. કુંડળી બન્યા પછી પણ બદલી શકાય.',
      south: 'દક્ષિણ ભારતીય', north: 'ઉત્તર ભારતીય', east: 'પૂર્વ ભારતીય',
      r_south: 'તમિલનાડુ, કેરળ, કર્ણાટક, આંધ્ર, તેલંગાણા, શ્રીલંકા', r_north: 'ઉત્તર અને પશ્ચિમ ભારત, નેપાળ', r_east: 'બંગાળ, ઓડિશા, આસામ, બાંગ્લાદેશ',
      how_south: 'રાશિઓ સ્થિર, ઘડિયાળની દિશામાં', how_north: 'લગ્ન ઉપર, ભાવ ઊલટી દિશામાં', how_east: 'રાશિઓ સ્થિર, ઘડિયાળની ઊલટી દિશામાં', example: 'ઉદાહરણ' },
    or: { h: 'ଆପଣଙ୍କ କୁଣ୍ଡଳୀ ଶୈଳୀ ବାଛନ୍ତୁ', hint: 'ଗ୍ରହ ସମାନ, ଆଙ୍କିବାର ତିନି ଶୈଳୀ। ଆପଣଙ୍କ ପରିବାର ଯାହା ଦେଖେ ତାହା ବାଛନ୍ତୁ। କୁଣ୍ଡଳୀ ତିଆରି ପରେ ମଧ୍ୟ ବଦଳାଇ ପାରିବେ।',
      south: 'ଦକ୍ଷିଣ ଭାରତୀୟ', north: 'ଉତ୍ତର ଭାରତୀୟ', east: 'ପୂର୍ବ ଭାରତୀୟ',
      r_south: 'ତାମିଲନାଡୁ, କେରଳ, କର୍ଣ୍ଣାଟକ, ଆନ୍ଧ୍ର, ତେଲେଙ୍ଗାନା, ଶ୍ରୀଲଙ୍କା', r_north: 'ଉତ୍ତର ଓ ପଶ୍ଚିମ ଭାରତ, ନେପାଳ', r_east: 'ବଙ୍ଗ, ଓଡ଼ିଶା, ଆସାମ, ବାଂଲାଦେଶ',
      how_south: 'ରାଶି ସ୍ଥିର, ଘଣ୍ଟା କଣ୍ଟା ଦିଗରେ', how_north: 'ଲଗ୍ନ ଉପରେ, ଭାବ ଓଲଟା ଦିଗରେ', how_east: 'ରାଶି ସ୍ଥିର, ଘଣ୍ଟା କଣ୍ଟାର ଓଲଟା ଦିଗରେ', example: 'ଉଦାହରଣ' }
  };
  const tx = (lang, k) => (TEXT[lang] && TEXT[lang][k]) || TEXT.en[k];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- East Indian chart ----------
  // 3x3 square, centre empty. Mesha top-centre, then anticlockwise; each corner is split by its diagonal into two rasis.
  const T3 = 400 / 3, T6 = 800 / 3;
  const EAST_POS = [[200, 62], [92, 40], [40, 92], [62, 200], [40, 308], [92, 362], [200, 338], [308, 362], [360, 308], [338, 200], [360, 92], [308, 40]];
  const EAST_TRI = [false, true, true, false, true, true, false, true, true, false, true, true];
  function east(items, title, opts) {
    opts = opts || {};
    const label = opts.label || ((p) => p.key);
    const sign = opts.sign || ((r) => String(r + 1));
    let txt = '';
    for (let r = 0; r < 12; r++) {
      const [x, y] = EAST_POS[r];
      const ps = items.filter((p) => p.rasi === r);
      const tri = EAST_TRI[r];
      // rasi name in the outer edge of each cell
      const sx = r === 0 || r === 6 ? x : r === 3 ? 22 : r === 9 ? 378 : x;
      const sy = r === 0 ? 18 : r === 6 ? 390 : r === 3 || r === 9 ? 150 : tri ? (y < 200 ? (r === 1 || r === 11 ? 16 : 128) : (r === 5 || r === 7 ? 392 : 280)) : y;
      txt += `<text x="${r === 2 ? 14 : r === 4 ? 14 : r === 8 ? 386 : r === 10 ? 386 : sx}" y="${sy}" class="ec-num${r === 2 || r === 4 ? ' ec-l' : r === 8 || r === 10 ? ' ec-r' : ''}">${esc(sign(r))}</text>`;
      const lines = [];
      const per = tri ? 2 : 3;
      for (let i = 0; i < ps.length; i += per) lines.push(ps.slice(i, i + per).map(label).join(' '));
      const lh = tri ? 15 : 18;
      lines.forEach((ln, i) => {
        txt += `<text x="${x}" y="${y + (i - (lines.length - 1) / 2) * lh + 5}" class="ec-p${tri ? ' ec-small' : ''}">${esc(ln)}</text>`;
      });
    }
    const centre = (opts.centre || []).filter(Boolean);
    const cy0 = 200 - (centre.length - 1) * 11;
    const ctext = centre.map((c, i) => `<text x="200" y="${cy0 + i * 22 + 5}" class="${i === 0 ? 'ec-title' : 'ec-sub'}">${esc(c)}</text>`).join('');
    return `<svg class="east-chart" viewBox="0 0 400 400" role="img" aria-label="${esc(title)}">
      <rect class="ec-bg" x="1" y="1" width="398" height="398"/>
      <rect class="ec-mid" x="${T3}" y="${T3}" width="${T3}" height="${T3}"/>
      <rect class="ec-frame" x="1" y="1" width="398" height="398"/>
      <line x1="${T3}" y1="1" x2="${T3}" y2="399"/><line x1="${T6}" y1="1" x2="${T6}" y2="399"/>
      <line x1="1" y1="${T3}" x2="399" y2="${T3}"/><line x1="1" y1="${T6}" x2="399" y2="${T6}"/>
      <line x1="1" y1="1" x2="${T3}" y2="${T3}"/><line x1="399" y1="1" x2="${T6}" y2="${T3}"/>
      <line x1="1" y1="399" x2="${T3}" y2="${T6}"/><line x1="399" y1="399" x2="${T6}" y2="${T6}"/>${txt}${ctext}</svg>`;
  }

  // ---------- Small example charts for the picker ----------
  // One made-up chart (lagna Simha, Sun Vrischika, Moon Mesha, Jupiter Kataka, Saturn Meena) drawn three ways.
  const SAMPLE = [{ key: 'lagna', rasi: 4 }, { key: 'sun', rasi: 7 }, { key: 'moon', rasi: 0 }, { key: 'jupiter', rasi: 3 }, { key: 'saturn', rasi: 11 }];
  const SOUTH_CELLS = [[0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [3, 0], [2, 0], [1, 0], [0, 0]];
  const NORTH_POS = [[200, 105], [100, 50], [50, 105], [105, 200], [50, 300], [100, 352], [200, 300], [300, 352], [350, 300], [295, 200], [350, 105], [300, 50]];
  function abbrFor(lang) {
    const I = root.I18N; const T = I && I.TERMS && (I.TERMS[lang] || I.TERMS.en);
    return (k) => (T && T.abbr && T.abbr[k]) || k.slice(0, 2);
  }
  function miniSouth(ab) {
    let s = '';
    for (let r = 0; r < 12; r++) {
      const [row, col] = SOUTH_CELLS[r];
      const ps = SAMPLE.filter((p) => p.rasi === r).map((p) => ab(p.key)).join(' ');
      s += `<rect x="${col * 50}" y="${row * 50}" width="50" height="50"/>${ps ? `<text x="${col * 50 + 25}" y="${row * 50 + 31}">${esc(ps)}</text>` : ''}`;
    }
    return `<svg class="cs-mini" viewBox="0 0 200 200" aria-hidden="true"><g class="cs-grid">${s}<rect class="cs-c" x="50" y="50" width="100" height="100"/></g><text class="cs-arrow" x="100" y="106">→ ↻</text></svg>`;
  }
  function miniNorth(ab) {
    const L = 4; let s = '';
    for (let h = 0; h < 12; h++) {
      const rasi = (L + h) % 12; const [x, y] = NORTH_POS[h];
      const ps = SAMPLE.filter((p) => p.rasi === rasi).map((p) => ab(p.key)).join(' ');
      s += `<text class="cs-n" x="${x / 2}" y="${(h === 0 ? y - 40 : h === 6 ? y + 42 : y - 22) / 2 + 3}">${rasi + 1}</text>`;
      if (ps) s += `<text x="${x / 2}" y="${y / 2 + 5}">${esc(ps)}</text>`;
    }
    return `<svg class="cs-mini" viewBox="0 0 200 200" aria-hidden="true"><g class="cs-grid"><polygon class="cs-l" points="100,0 150,50 100,100 50,50"/><rect x="0" y="0" width="200" height="200"/><line x1="0" y1="0" x2="200" y2="200"/><line x1="200" y1="0" x2="0" y2="200"/><polygon points="100,0 200,100 100,200 0,100"/>${s}</g></svg>`;
  }
  function miniEast(ab) {
    const svg = east(SAMPLE, '', { label: (p) => ab(p.key), sign: () => '' });
    return svg.replace('class="east-chart"', 'class="cs-mini cs-east" aria-hidden="true"').replace(/ role="img" aria-label="[^"]*"/, '');
  }

  // Picker shown in the birth-chart form, before the chart is made. Prerendered by the build.
  function picker(lang, current) {
    current = STYLES.includes(current) ? current : 'south';
    const ab = abbrFor(lang);
    const mini = { south: miniSouth(ab), north: miniNorth(ab), east: miniEast(ab) };
    return `<fieldset class="cs-pick" id="chart-style-pick">
      <legend>${esc(tx(lang, 'h'))}</legend>
      <p class="cs-hint">${esc(tx(lang, 'hint'))}</p>
      <div class="cs-opts">${STYLES.map((s) => `
        <label class="cs-opt"><input type="radio" name="chart-style" value="${s}"${s === current ? ' checked' : ''}>
          ${mini[s]}
          <span class="cs-name">${esc(tx(lang, s))}</span>
          <span class="cs-where">(${esc(tx(lang, 'r_' + s))})</span>
          <span class="cs-how">${esc(tx(lang, 'how_' + s))}</span>
        </label>`).join('')}
      </div>
    </fieldset>`;
  }

  // Browser: remember the choice (app.js reads the same key when it draws the chart)
  const KEY = 'gv-style2';
  function getStyle() { try { const v = localStorage.getItem(KEY); return STYLES.includes(v) ? v : null; } catch (e) { return null; } }
  function setStyle(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ } syncPicker(v); }
  function syncPicker(v) {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('input[name="chart-style"]').forEach((i) => { i.checked = i.value === v; });
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      const saved = getStyle(); if (saved) syncPicker(saved);
      document.addEventListener('change', (e) => { if (e.target && e.target.name === 'chart-style') setStyle(e.target.value); });
      // the switch above a finished chart also updates the picker
      document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('.seg button[data-style]'); if (b) syncPicker(b.dataset.style); });
    });
  }

  root.ChartStyles = { STYLES, TEXT, text: tx, east, picker, getStyle, setStyle };
})(typeof window !== 'undefined' ? window : globalThis);
