/* RasiVani translations.
   UI strings are written per language. Sanskrit astrology terms are written once in Devanagari and
   transliterated to Telugu, Kannada, Malayalam, Odia, Bengali and Gujarati scripts; Tamil and
   common regional names (Malayalam stars, weekdays) are written by hand. */
(function (root) {
  'use strict';

  const LANGS = [
    { code: 'en', name: 'English', font: null },
    { code: 'hi', name: 'हिन्दी', font: 'Noto Sans Devanagari' },
    { code: 'ta', name: 'தமிழ்', font: 'Noto Sans Tamil' },
    { code: 'te', name: 'తెలుగు', font: 'Noto Sans Telugu' },
    { code: 'kn', name: 'ಕನ್ನಡ', font: 'Noto Sans Kannada' },
    { code: 'ml', name: 'മലയാളം', font: 'Noto Sans Malayalam' },
    { code: 'mr', name: 'मराठी', font: 'Noto Sans Devanagari' },
    { code: 'bn', name: 'বাংলা', font: 'Noto Sans Bengali' },
    { code: 'gu', name: 'ગુજરાતી', font: 'Noto Sans Gujarati' },
    { code: 'or', name: 'ଓଡ଼ିଆ', font: 'Noto Sans Oriya' }
  ];

  // ---------- UI strings ----------
  const UI = {
    en: {
      nav_palan: 'Rasi palan', birth_details: 'Birth details', bhukti: 'Bhukti (sub-period)', star_lord: 'Star lord',
      local_time: 'local time', tz_hint: 'For S and W use a minus sign or the letter (12.5 S, 74 W). Pick the offset that was in force on the birth date: add 1 hour if summer time (DST) applied.',
      place_hint: 'Type area name or pincode', no_place: 'No match. Try the nearest town or a pincode, or enter coordinates.', use_coords: 'Enter latitude and longitude instead',
      download_img: 'Download image',
      tagline: 'Free Vedic astrology in your language',
      nav_chart: 'Birth chart', nav_match: 'Marriage matching', nav_panchang: 'Panchangam', nav_lang: 'Language',
      chart_title: 'Your birth chart, in your own language.',
      chart_sub: 'Free jathagam with rasi and navamsa charts, birth star and Vimshottari dasha. Calculated in your browser with the Lahiri ayanamsa.',
      match_title: 'Marriage matching, the traditional way.',
      match_sub: 'Check the ten poruthams for a bride and groom from their birth details or their birth stars.',
      panchang_title: 'Today’s panchangam.',
      panchang_sub: 'Tithi, nakshatra, yoga, karana, sunrise and Rahu kalam for your city.',
      name: 'Name', dob: 'Date of birth', tob: 'Time of birth', place: 'Place of birth', city: 'City', date: 'Date', time: 'Time',
      other_place: 'Other place (enter coordinates)', lat: 'Latitude', lon: 'Longitude', tz: 'UTC offset (hours)',
      btn_chart: 'Generate birth chart', btn_match: 'Check compatibility', btn_panchang: 'Show panchangam',
      bride: 'Bride', groom: 'Groom', use_birth: 'Birth details', know_star: 'I know the star', star: 'Birth star', pada: 'Pada', rasi: 'Rasi',
      lagna: 'Lagna', moon_sign: 'Moon sign (rasi)', birth_star: 'Birth star',
      planet: 'Planet', sign: 'Sign', degree: 'Degree', retro: 'R = retrograde',
      rasi_chart: 'Rasi chart', navamsa_chart: 'Navamsa chart', chart_style: 'Chart style', south: 'South Indian', north: 'North Indian',
      dasha: 'Vimshottari dasha', dasha_balance: 'Dasha balance at birth', years: 'years', from: 'From', to: 'To', current: 'Now running',
      score: 'Porutham score', verdict_good: 'Good match. The key poruthams agree.', verdict_ok: 'Average match. Consult an astrologer before deciding.', verdict_bad: 'Weak match. Rajju or vedha does not agree, or too few poruthams match.',
      v_good: 'Matches', v_mid: 'Partial', v_bad: 'Does not match',
      tithi: 'Tithi', nakshatra: 'Nakshatra', yoga: 'Yoga', karana: 'Karana', weekday: 'Weekday', sunrise: 'Sunrise', sunset: 'Sunset',
      rahukalam: 'Rahu kalam', yamagandam: 'Yamagandam', gulikai: 'Gulika kalam', chandrashtamam: 'Chandrashtamam for', paksha: 'Paksha',
      print: 'Print / Save PDF', error_fill: 'Please fill in the date, time and place.',
      disclaimer: 'Astrology is a traditional belief system, not science. Use these results as cultural guidance only, never for medical, financial or legal decisions.',
      about: 'About', privacy: 'Privacy', contact: 'Contact', private_note: 'Your birth details never leave your device.'
    },
    hi: {
      nav_palan: 'राशिफल', birth_details: 'जन्म विवरण', bhukti: 'अंतर्दशा', star_lord: 'नक्षत्र स्वामी',
      local_time: 'स्थानीय समय', tz_hint: 'दक्षिण/पश्चिम के लिए माइनस या अक्षर लिखें (12.5 S, 74 W)। जन्म-तिथि पर लागू अंतर चुनें: ग्रीष्मकालीन समय (DST) हो तो 1 घंटा जोड़ें।',
      place_hint: 'क्षेत्र का नाम या पिनकोड लिखें', no_place: 'कोई स्थान नहीं मिला। पास का शहर या पिनकोड लिखें, या निर्देशांक भरें।', use_coords: 'अक्षांश-देशांतर स्वयं भरें',
      download_img: 'छवि के रूप में डाउनलोड करें',
      tagline: 'आपकी भाषा में मुफ़्त वैदिक ज्योतिष',
      nav_chart: 'जन्म कुंडली', nav_match: 'कुंडली मिलान', nav_panchang: 'पंचांग', nav_lang: 'भाषा',
      chart_title: 'आपकी जन्म कुंडली, आपकी अपनी भाषा में।',
      chart_sub: 'राशि और नवांश चक्र, जन्म नक्षत्र और विंशोत्तरी दशा के साथ मुफ़्त कुंडली। लाहिड़ी अयनांश से आपके ब्राउज़र में गणना।',
      match_title: 'पारंपरिक तरीके से कुंडली मिलान।',
      match_sub: 'वर और वधू के जन्म विवरण या जन्म नक्षत्र से दस गुण (कूट) जाँचें।',
      panchang_title: 'आज का पंचांग।',
      panchang_sub: 'आपके शहर के लिए तिथि, नक्षत्र, योग, करण, सूर्योदय और राहु काल।',
      name: 'नाम', dob: 'जन्म तिथि', tob: 'जन्म समय', place: 'जन्म स्थान', city: 'शहर', date: 'तारीख', time: 'समय',
      other_place: 'अन्य स्थान (निर्देशांक भरें)', lat: 'अक्षांश', lon: 'देशांतर', tz: 'UTC अंतर (घंटे)',
      btn_chart: 'कुंडली बनाएँ', btn_match: 'मिलान जाँचें', btn_panchang: 'पंचांग देखें',
      bride: 'वधू', groom: 'वर', use_birth: 'जन्म विवरण', know_star: 'मुझे नक्षत्र पता है', star: 'जन्म नक्षत्र', pada: 'चरण', rasi: 'राशि',
      lagna: 'लग्न', moon_sign: 'चंद्र राशि', birth_star: 'जन्म नक्षत्र',
      planet: 'ग्रह', sign: 'राशि', degree: 'अंश', retro: 'R = वक्री',
      rasi_chart: 'राशि कुंडली', navamsa_chart: 'नवांश कुंडली', chart_style: 'चक्र शैली', south: 'दक्षिण भारतीय', north: 'उत्तर भारतीय',
      dasha: 'विंशोत्तरी दशा', dasha_balance: 'जन्म के समय शेष दशा', years: 'वर्ष', from: 'से', to: 'तक', current: 'अभी चल रही',
      score: 'मिलान अंक', verdict_good: 'अच्छा मिलान। मुख्य गुण मेल खाते हैं।', verdict_ok: 'सामान्य मिलान। निर्णय से पहले ज्योतिषी से सलाह लें।', verdict_bad: 'कमज़ोर मिलान। रज्जु या वेध मेल नहीं खाता, या बहुत कम गुण मिलते हैं।',
      v_good: 'मेल', v_mid: 'आंशिक', v_bad: 'मेल नहीं',
      tithi: 'तिथि', nakshatra: 'नक्षत्र', yoga: 'योग', karana: 'करण', weekday: 'वार', sunrise: 'सूर्योदय', sunset: 'सूर्यास्त',
      rahukalam: 'राहु काल', yamagandam: 'यमगंड', gulikai: 'गुलिक काल', chandrashtamam: 'चंद्राष्टम', paksha: 'पक्ष',
      print: 'प्रिंट करें या PDF सहेजें', error_fill: 'कृपया तारीख, समय और स्थान भरें।',
      disclaimer: 'ज्योतिष एक पारंपरिक मान्यता है, विज्ञान नहीं। इन परिणामों को केवल सांस्कृतिक मार्गदर्शन मानें, चिकित्सा, वित्तीय या कानूनी निर्णयों के लिए नहीं।',
      about: 'परिचय', privacy: 'गोपनीयता', contact: 'संपर्क', private_note: 'आपका जन्म विवरण आपके डिवाइस से बाहर नहीं जाता।'
    },
    ta: {
      nav_palan: 'ராசி பலன்', birth_details: 'பிறப்பு விவரம்', bhukti: 'புக்தி', star_lord: 'நட்சத்திர அதிபதி',
      local_time: 'உள்ளூர் நேரம்', tz_hint: 'தெற்கு/மேற்குக்கு மைனஸ் அல்லது எழுத்தை இடுக (12.5 S, 74 W). பிறந்த தேதியில் இருந்த வித்தியாசத்தைத் தேர்ந்தெடுக்கவும்: கோடை நேரம் (DST) இருந்தால் 1 மணி சேர்க்கவும்.',
      place_hint: 'ஊர் பெயர் அல்லது பின்கோடு உள்ளீடு செய்யவும்', no_place: 'இடம் கிடைக்கவில்லை. அருகிலுள்ள ஊர் அல்லது பின்கோடு முயலவும், அல்லது அட்சரேகை உள்ளிடவும்.', use_coords: 'அட்சரேகை, தீர்க்கரேகையை நேரடியாக உள்ளிடு',
      download_img: 'படமாக பதிவிறக்கு',
      tagline: 'உங்கள் மொழியில் இலவச ஜோதிடம்',
      nav_chart: 'ஜாதகம்', nav_match: 'திருமண பொருத்தம்', nav_panchang: 'பஞ்சாங்கம்', nav_lang: 'மொழி',
      chart_title: 'உங்கள் ஜாதகம், உங்கள் சொந்த மொழியில்.',
      chart_sub: 'ராசி, நவாம்ச கட்டங்கள், ஜன்ம நட்சத்திரம், விம்சோத்தரி தசையுடன் இலவச ஜாதகம். லஹிரி அயனாம்சத்தில் உங்கள் உலாவியிலேயே கணிக்கப்படுகிறது.',
      match_title: 'பாரம்பரிய முறையில் திருமண பொருத்தம்.',
      match_sub: 'மணமகள், மணமகன் இருவரின் பிறப்பு விவரம் அல்லது நட்சத்திரம் கொண்டு பத்து பொருத்தங்களைப் பாருங்கள்.',
      panchang_title: 'இன்றைய பஞ்சாங்கம்.',
      panchang_sub: 'உங்கள் ஊருக்கான திதி, நட்சத்திரம், யோகம், கரணம், சூரிய உதயம், ராகு காலம்.',
      name: 'பெயர்', dob: 'பிறந்த தேதி', tob: 'பிறந்த நேரம்', place: 'பிறந்த இடம்', city: 'ஊர்', date: 'தேதி', time: 'நேரம்',
      other_place: 'வேறு இடம் (அட்சரேகை உள்ளிடவும்)', lat: 'அட்சரேகை', lon: 'தீர்க்கரேகை', tz: 'UTC வித்தியாசம் (மணி)',
      btn_chart: 'ஜாதகம் கணி', btn_match: 'பொருத்தம் பார்', btn_panchang: 'பஞ்சாங்கம் காட்டு',
      bride: 'மணமகள்', groom: 'மணமகன்', use_birth: 'பிறப்பு விவரம்', know_star: 'நட்சத்திரம் தெரியும்', star: 'நட்சத்திரம்', pada: 'பாதம்', rasi: 'ராசி',
      lagna: 'லக்னம்', moon_sign: 'ராசி', birth_star: 'ஜன்ம நட்சத்திரம்',
      planet: 'கிரகம்', sign: 'ராசி', degree: 'பாகை', retro: 'R = வக்கிரம்',
      rasi_chart: 'ராசி கட்டம்', navamsa_chart: 'நவாம்சம்', chart_style: 'கட்ட முறை', south: 'தென்னிந்திய', north: 'வட இந்திய',
      dasha: 'விம்சோத்தரி தசை', dasha_balance: 'பிறப்பில் தசா இருப்பு', years: 'ஆண்டுகள்', from: 'முதல்', to: 'வரை', current: 'நடப்பு',
      score: 'பொருத்த மதிப்பெண்', verdict_good: 'நல்ல பொருத்தம். முக்கிய பொருத்தங்கள் அமைந்துள்ளன.', verdict_ok: 'சுமாரான பொருத்தம். முடிவெடுக்கும் முன் ஜோதிடரை அணுகவும்.', verdict_bad: 'பொருத்தம் குறைவு. ரஜ்ஜு அல்லது வேதை பொருந்தவில்லை, அல்லது மிகக் குறைவான பொருத்தங்கள்.',
      v_good: 'உண்டு', v_mid: 'மத்திமம்', v_bad: 'இல்லை',
      tithi: 'திதி', nakshatra: 'நட்சத்திரம்', yoga: 'யோகம்', karana: 'கரணம்', weekday: 'கிழமை', sunrise: 'சூரிய உதயம்', sunset: 'சூரிய அஸ்தமனம்',
      rahukalam: 'ராகு காலம்', yamagandam: 'எமகண்டம்', gulikai: 'குளிகை', chandrashtamam: 'சந்திராஷ்டமம்', paksha: 'பட்சம்',
      print: 'அச்சிடு அல்லது PDF ஆக சேமி', error_fill: 'தேதி, நேரம், இடம் ஆகியவற்றை நிரப்பவும்.',
      disclaimer: 'ஜோதிடம் ஒரு பாரம்பரிய நம்பிக்கை, அறிவியல் அல்ல. இந்த முடிவுகளை கலாச்சார வழிகாட்டலாக மட்டும் பயன்படுத்துங்கள்; மருத்துவ, நிதி, சட்ட முடிவுகளுக்கு அல்ல.',
      about: 'எங்களைப் பற்றி', privacy: 'தனியுரிமை', contact: 'தொடர்பு', private_note: 'உங்கள் பிறப்பு விவரங்கள் உங்கள் சாதனத்தை விட்டு வெளியே செல்லாது.'
    },
    te: {
      nav_palan: 'రాశి ఫలాలు', birth_details: 'జనన వివరాలు', bhukti: 'అంతర్దశ (భుక్తి)', star_lord: 'నక్షత్ర అధిపతి',
      local_time: 'స్థానిక సమయం', tz_hint: 'దక్షిణ/పశ్చిమానికి మైనస్ లేదా అక్షరం వాడండి (12.5 S, 74 W). పుట్టిన తేదీన ఉన్న వ్యత్యాసాన్ని ఎంచుకోండి: వేసవి సమయం (DST) ఉంటే 1 గంట కలపండి.',
      place_hint: 'ప్రాంతం పేరు లేదా పిన్‌కోడ్ టైప్ చేయండి', no_place: 'స్థలం దొరకలేదు. దగ్గరి పట్టణం లేదా పిన్‌కోడ్ ప్రయత్నించండి, లేదా అక్షాంశాలు నమోదు చేయండి.', use_coords: 'అక్షాంశ, రేఖాంశాలు నేరుగా నమోదు చేయండి',
      download_img: 'చిత్రంగా డౌన్‌లోడ్ చేయండి',
      tagline: 'మీ భాషలో ఉచిత జ్యోతిషం',
      nav_chart: 'జాతకం', nav_match: 'వివాహ పొంతన', nav_panchang: 'పంచాంగం', nav_lang: 'భాష',
      chart_title: 'మీ జాతకం, మీ సొంత భాషలో.',
      chart_sub: 'రాశి, నవాంశ చక్రాలు, జన్మ నక్షత్రం, వింశోత్తరి దశతో ఉచిత జాతకం. లాహిరి అయనాంశతో మీ బ్రౌజర్‌లోనే లెక్కిస్తుంది.',
      match_title: 'సంప్రదాయ పద్ధతిలో వివాహ పొంతన.',
      match_sub: 'వధూవరుల జనన వివరాలు లేదా జన్మ నక్షత్రాలతో పది పొంతనలు చూడండి.',
      panchang_title: 'ఈరోజు పంచాంగం.',
      panchang_sub: 'మీ నగరానికి తిథి, నక్షత్రం, యోగం, కరణం, సూర్యోదయం, రాహు కాలం.',
      name: 'పేరు', dob: 'పుట్టిన తేదీ', tob: 'పుట్టిన సమయం', place: 'పుట్టిన స్థలం', city: 'నగరం', date: 'తేదీ', time: 'సమయం',
      other_place: 'ఇతర స్థలం (అక్షాంశాలు నమోదు చేయండి)', lat: 'అక్షాంశం', lon: 'రేఖాంశం', tz: 'UTC వ్యత్యాసం (గంటలు)',
      btn_chart: 'జాతకం రూపొందించండి', btn_match: 'పొంతన చూడండి', btn_panchang: 'పంచాంగం చూపించు',
      bride: 'వధువు', groom: 'వరుడు', use_birth: 'జనన వివరాలు', know_star: 'నక్షత్రం తెలుసు', star: 'జన్మ నక్షత్రం', pada: 'పాదం', rasi: 'రాశి',
      lagna: 'లగ్నం', moon_sign: 'చంద్ర రాశి', birth_star: 'జన్మ నక్షత్రం',
      planet: 'గ్రహం', sign: 'రాశి', degree: 'అంశ', retro: 'R = వక్రి',
      rasi_chart: 'రాశి చక్రం', navamsa_chart: 'నవాంశ చక్రం', chart_style: 'చక్ర శైలి', south: 'దక్షిణ భారత', north: 'ఉత్తర భారత',
      dasha: 'వింశోత్తరి దశ', dasha_balance: 'జననంలో దశ శేషం', years: 'సంవత్సరాలు', from: 'నుండి', to: 'వరకు', current: 'ప్రస్తుతం',
      score: 'పొంతన స్కోరు', verdict_good: 'మంచి పొంతన. ముఖ్యమైన పొంతనలు కుదిరాయి.', verdict_ok: 'సాధారణ పొంతన. నిర్ణయానికి ముందు జ్యోతిష్యుడిని సంప్రదించండి.', verdict_bad: 'బలహీన పొంతన. రజ్జు లేదా వేధ కుదరలేదు, లేదా చాలా తక్కువ పొంతనలు.',
      v_good: 'కుదిరింది', v_mid: 'మధ్యమం', v_bad: 'కుదరలేదు',
      tithi: 'తిథి', nakshatra: 'నక్షత్రం', yoga: 'యోగం', karana: 'కరణం', weekday: 'వారం', sunrise: 'సూర్యోదయం', sunset: 'సూర్యాస్తమయం',
      rahukalam: 'రాహు కాలం', yamagandam: 'యమగండం', gulikai: 'గుళిక కాలం', chandrashtamam: 'చంద్రాష్టమం', paksha: 'పక్షం',
      print: 'ప్రింట్ లేదా PDF గా సేవ్ చేయండి', error_fill: 'దయచేసి తేదీ, సమయం, స్థలం నింపండి.',
      disclaimer: 'జ్యోతిషం ఒక సంప్రదాయ విశ్వాసం, శాస్త్రం కాదు. ఈ ఫలితాలను సాంస్కృతిక మార్గదర్శనంగా మాత్రమే వాడండి; వైద్య, ఆర్థిక, న్యాయ నిర్ణయాలకు కాదు.',
      about: 'మా గురించి', privacy: 'గోప్యత', contact: 'సంప్రదించండి', private_note: 'మీ జనన వివరాలు మీ పరికరం దాటి వెళ్లవు.'
    },
    kn: {
      nav_palan: 'ರಾಶಿ ಭವಿಷ್ಯ', birth_details: 'ಜನ್ಮ ವಿವರ', bhukti: 'ಭುಕ್ತಿ (ಅಂತರ್ದಶೆ)', star_lord: 'ನಕ್ಷತ್ರ ಅಧಿಪತಿ',
      local_time: 'ಸ್ಥಳೀಯ ಸಮಯ', tz_hint: 'ದಕ್ಷಿಣ/ಪಶ್ಚಿಮಕ್ಕೆ ಮೈನಸ್ ಅಥವಾ ಅಕ್ಷರ ಬಳಸಿ (12.5 S, 74 W). ಜನ್ಮ ದಿನಾಂಕದಂದು ಇದ್ದ ವ್ಯತ್ಯಾಸ ಆರಿಸಿ: ಬೇಸಿಗೆ ಸಮಯ (DST) ಇದ್ದರೆ 1 ಗಂಟೆ ಸೇರಿಸಿ.',
      place_hint: 'ಪ್ರದೇಶದ ಹೆಸರು ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ಟೈಪ್ ಮಾಡಿ', no_place: 'ಸ್ಥಳ ಸಿಗಲಿಲ್ಲ. ಹತ್ತಿರದ ಊರು ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ಪ್ರಯತ್ನಿಸಿ, ಅಥವಾ ಅಕ್ಷಾಂಶ ನಮೂದಿಸಿ.', use_coords: 'ಅಕ್ಷಾಂಶ, ರೇಖಾಂಶ ನೇರವಾಗಿ ನಮೂದಿಸಿ',
      download_img: 'ಚಿತ್ರವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
      tagline: 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಉಚಿತ ಜ್ಯೋತಿಷ್ಯ',
      nav_chart: 'ಜಾತಕ', nav_match: 'ಜಾತಕ ಹೊಂದಾಣಿಕೆ', nav_panchang: 'ಪಂಚಾಂಗ', nav_lang: 'ಭಾಷೆ',
      chart_title: 'ನಿಮ್ಮ ಜಾತಕ, ನಿಮ್ಮದೇ ಭಾಷೆಯಲ್ಲಿ.',
      chart_sub: 'ರಾಶಿ ಮತ್ತು ನವಾಂಶ ಕುಂಡಲಿ, ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ವಿಂಶೋತ್ತರಿ ದಶೆಯೊಂದಿಗೆ ಉಚಿತ ಜಾತಕ. ಲಾಹಿರಿ ಅಯನಾಂಶದಲ್ಲಿ ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಲೆಕ್ಕ.',
      match_title: 'ಸಾಂಪ್ರದಾಯಿಕ ರೀತಿಯಲ್ಲಿ ಜಾತಕ ಹೊಂದಾಣಿಕೆ.',
      match_sub: 'ವಧು-ವರರ ಜನ್ಮ ವಿವರ ಅಥವಾ ನಕ್ಷತ್ರದಿಂದ ಹತ್ತು ಕೂಟಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
      panchang_title: 'ಇಂದಿನ ಪಂಚಾಂಗ.',
      panchang_sub: 'ನಿಮ್ಮ ನಗರಕ್ಕೆ ತಿಥಿ, ನಕ್ಷತ್ರ, ಯೋಗ, ಕರಣ, ಸೂರ್ಯೋದಯ ಮತ್ತು ರಾಹು ಕಾಲ.',
      name: 'ಹೆಸರು', dob: 'ಜನ್ಮ ದಿನಾಂಕ', tob: 'ಜನ್ಮ ಸಮಯ', place: 'ಜನ್ಮ ಸ್ಥಳ', city: 'ನಗರ', date: 'ದಿನಾಂಕ', time: 'ಸಮಯ',
      other_place: 'ಬೇರೆ ಸ್ಥಳ (ಅಕ್ಷಾಂಶ ನಮೂದಿಸಿ)', lat: 'ಅಕ್ಷಾಂಶ', lon: 'ರೇಖಾಂಶ', tz: 'UTC ವ್ಯತ್ಯಾಸ (ಗಂಟೆ)',
      btn_chart: 'ಜಾತಕ ರಚಿಸಿ', btn_match: 'ಹೊಂದಾಣಿಕೆ ನೋಡಿ', btn_panchang: 'ಪಂಚಾಂಗ ತೋರಿಸಿ',
      bride: 'ವಧು', groom: 'ವರ', use_birth: 'ಜನ್ಮ ವಿವರ', know_star: 'ನಕ್ಷತ್ರ ಗೊತ್ತಿದೆ', star: 'ಜನ್ಮ ನಕ್ಷತ್ರ', pada: 'ಪಾದ', rasi: 'ರಾಶಿ',
      lagna: 'ಲಗ್ನ', moon_sign: 'ಚಂದ್ರ ರಾಶಿ', birth_star: 'ಜನ್ಮ ನಕ್ಷತ್ರ',
      planet: 'ಗ್ರಹ', sign: 'ರಾಶಿ', degree: 'ಅಂಶ', retro: 'R = ವಕ್ರಿ',
      rasi_chart: 'ರಾಶಿ ಚಕ್ರ', navamsa_chart: 'ನವಾಂಶ ಚಕ್ರ', chart_style: 'ಕುಂಡಲಿ ಶೈಲಿ', south: 'ದಕ್ಷಿಣ ಭಾರತ', north: 'ಉತ್ತರ ಭಾರತ',
      dasha: 'ವಿಂಶೋತ್ತರಿ ದಶೆ', dasha_balance: 'ಜನನದಲ್ಲಿ ದಶಾ ಶೇಷ', years: 'ವರ್ಷ', from: 'ಇಂದ', to: 'ವರೆಗೆ', current: 'ಈಗ ನಡೆಯುತ್ತಿದೆ',
      score: 'ಹೊಂದಾಣಿಕೆ ಅಂಕ', verdict_good: 'ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ. ಮುಖ್ಯ ಕೂಟಗಳು ಹೊಂದುತ್ತವೆ.', verdict_ok: 'ಸಾಧಾರಣ ಹೊಂದಾಣಿಕೆ. ನಿರ್ಧಾರಕ್ಕೆ ಮುನ್ನ ಜ್ಯೋತಿಷಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.', verdict_bad: 'ದುರ್ಬಲ ಹೊಂದಾಣಿಕೆ. ರಜ್ಜು ಅಥವಾ ವೇಧ ಹೊಂದುವುದಿಲ್ಲ, ಅಥವಾ ಕಡಿಮೆ ಕೂಟಗಳು.',
      v_good: 'ಹೊಂದುತ್ತದೆ', v_mid: 'ಮಧ್ಯಮ', v_bad: 'ಹೊಂದುವುದಿಲ್ಲ',
      tithi: 'ತಿಥಿ', nakshatra: 'ನಕ್ಷತ್ರ', yoga: 'ಯೋಗ', karana: 'ಕರಣ', weekday: 'ವಾರ', sunrise: 'ಸೂರ್ಯೋದಯ', sunset: 'ಸೂರ್ಯಾಸ್ತ',
      rahukalam: 'ರಾಹು ಕಾಲ', yamagandam: 'ಯಮಗಂಡ', gulikai: 'ಗುಳಿಕ ಕಾಲ', chandrashtamam: 'ಚಂದ್ರಾಷ್ಟಮ', paksha: 'ಪಕ್ಷ',
      print: 'ಮುದ್ರಿಸಿ ಅಥವಾ PDF ಆಗಿ ಉಳಿಸಿ', error_fill: 'ದಯವಿಟ್ಟು ದಿನಾಂಕ, ಸಮಯ ಮತ್ತು ಸ್ಥಳ ತುಂಬಿ.',
      disclaimer: 'ಜ್ಯೋತಿಷ್ಯ ಒಂದು ಸಾಂಪ್ರದಾಯಿಕ ನಂಬಿಕೆ, ವಿಜ್ಞಾನವಲ್ಲ. ಈ ಫಲಿತಾಂಶಗಳನ್ನು ಸಾಂಸ್ಕೃತಿಕ ಮಾರ್ಗದರ್ಶನವಾಗಿ ಮಾತ್ರ ಬಳಸಿ; ವೈದ್ಯಕೀಯ, ಹಣಕಾಸು ಅಥವಾ ಕಾನೂನು ನಿರ್ಧಾರಗಳಿಗೆ ಅಲ್ಲ.',
      about: 'ನಮ್ಮ ಬಗ್ಗೆ', privacy: 'ಗೌಪ್ಯತೆ', contact: 'ಸಂಪರ್ಕ', private_note: 'ನಿಮ್ಮ ಜನ್ಮ ವಿವರಗಳು ನಿಮ್ಮ ಸಾಧನದಿಂದ ಹೊರಗೆ ಹೋಗುವುದಿಲ್ಲ.'
    },
    ml: {
      nav_palan: 'രാശിഫലം', birth_details: 'ജനന വിവരങ്ങൾ', bhukti: 'അപഹാരം (ഭുക്തി)', star_lord: 'നക്ഷത്രാധിപൻ',
      local_time: 'പ്രാദേശിക സമയം', tz_hint: 'തെക്ക്/പടിഞ്ഞാറിന് മൈനസ് അല്ലെങ്കിൽ അക്ഷരം നൽകുക (12.5 S, 74 W). ജനനത്തീയതിയിലെ വ്യത്യാസം തിരഞ്ഞെടുക്കുക: വേനൽ സമയം (DST) ഉണ്ടെങ്കിൽ 1 മണിക്കൂർ കൂട്ടുക.',
      place_hint: 'സ്ഥലപ്പേര് അല്ലെങ്കിൽ പിൻകോഡ് ടൈപ്പ് ചെയ്യുക', no_place: 'സ്ഥലം കണ്ടെത്തിയില്ല. അടുത്തുള്ള പട്ടണമോ പിൻകോഡോ നോക്കുക, അല്ലെങ്കിൽ അക്ഷാംശം നൽകുക.', use_coords: 'അക്ഷാംശവും രേഖാംശവും നേരിട്ട് നൽകുക',
      download_img: 'ചിത്രമായി ഡൗൺലോഡ് ചെയ്യുക',
      tagline: 'നിങ്ങളുടെ ഭാഷയിൽ സൗജന്യ ജ്യോതിഷം',
      nav_chart: 'ജാതകം', nav_match: 'വിവാഹ പൊരുത്തം', nav_panchang: 'പഞ്ചാംഗം', nav_lang: 'ഭാഷ',
      chart_title: 'നിങ്ങളുടെ ജാതകം, നിങ്ങളുടെ സ്വന്തം ഭാഷയിൽ.',
      chart_sub: 'രാശി, നവാംശ ചക്രങ്ങൾ, ജന്മനക്ഷത്രം, വിംശോത്തരി ദശ എന്നിവയോടെ സൗജന്യ ജാതകം. ലാഹിരി അയനാംശത്തിൽ നിങ്ങളുടെ ബ്രൗസറിൽ തന്നെ ഗണിക്കുന്നു.',
      match_title: 'പരമ്പരാഗത രീതിയിൽ വിവാഹ പൊരുത്തം.',
      match_sub: 'വധൂവരന്മാരുടെ ജനന വിവരങ്ങളോ നക്ഷത്രങ്ങളോ ഉപയോഗിച്ച് പത്ത് പൊരുത്തങ്ങൾ നോക്കുക.',
      panchang_title: 'ഇന്നത്തെ പഞ്ചാംഗം.',
      panchang_sub: 'നിങ്ങളുടെ നഗരത്തിലെ തിഥി, നക്ഷത്രം, യോഗം, കരണം, സൂര്യോദയം, രാഹുകാലം.',
      name: 'പേര്', dob: 'ജനന തീയതി', tob: 'ജനന സമയം', place: 'ജനന സ്ഥലം', city: 'നഗരം', date: 'തീയതി', time: 'സമയം',
      other_place: 'മറ്റൊരു സ്ഥലം (അക്ഷാംശം നൽകുക)', lat: 'അക്ഷാംശം', lon: 'രേഖാംശം', tz: 'UTC വ്യത്യാസം (മണിക്കൂർ)',
      btn_chart: 'ജാതകം തയ്യാറാക്കുക', btn_match: 'പൊരുത്തം നോക്കുക', btn_panchang: 'പഞ്ചാംഗം കാണിക്കുക',
      bride: 'വധു', groom: 'വരൻ', use_birth: 'ജനന വിവരങ്ങൾ', know_star: 'നക്ഷത്രം അറിയാം', star: 'ജന്മനക്ഷത്രം', pada: 'പാദം', rasi: 'രാശി',
      lagna: 'ലഗ്നം', moon_sign: 'ചന്ദ്രരാശി', birth_star: 'ജന്മനക്ഷത്രം',
      planet: 'ഗ്രഹം', sign: 'രാശി', degree: 'ഡിഗ്രി', retro: 'R = വക്രം',
      rasi_chart: 'രാശി ചക്രം', navamsa_chart: 'നവാംശം', chart_style: 'ചക്ര രീതി', south: 'ദക്ഷിണേന്ത്യൻ', north: 'ഉത്തരേന്ത്യൻ',
      dasha: 'വിംശോത്തരി ദശ', dasha_balance: 'ജനനസമയത്തെ ദശാശിഷ്ടം', years: 'വർഷം', from: 'മുതൽ', to: 'വരെ', current: 'ഇപ്പോൾ',
      score: 'പൊരുത്തം സ്കോർ', verdict_good: 'നല്ല പൊരുത്തം. പ്രധാന പൊരുത്തങ്ങൾ ചേരുന്നു.', verdict_ok: 'ശരാശരി പൊരുത്തം. തീരുമാനിക്കും മുമ്പ് ജ്യോതിഷിയെ കാണുക.', verdict_bad: 'പൊരുത്തം കുറവ്. രജ്ജുവോ വേധമോ ചേരുന്നില്ല, അല്ലെങ്കിൽ വളരെ കുറച്ച് പൊരുത്തങ്ങൾ.',
      v_good: 'ഉണ്ട്', v_mid: 'മധ്യമം', v_bad: 'ഇല്ല',
      tithi: 'തിഥി', nakshatra: 'നക്ഷത്രം', yoga: 'യോഗം', karana: 'കരണം', weekday: 'ആഴ്ച', sunrise: 'സൂര്യോദയം', sunset: 'സൂര്യാസ്തമയം',
      rahukalam: 'രാഹുകാലം', yamagandam: 'യമഗണ്ഡം', gulikai: 'ഗുളികകാലം', chandrashtamam: 'ചന്ദ്രാഷ്ടമം', paksha: 'പക്ഷം',
      print: 'പ്രിന്റ് ചെയ്യുക അല്ലെങ്കിൽ PDF ആയി സേവ് ചെയ്യുക', error_fill: 'തീയതി, സമയം, സ്ഥലം എന്നിവ നൽകുക.',
      disclaimer: 'ജ്യോതിഷം ഒരു പരമ്പരാഗത വിശ്വാസമാണ്, ശാസ്ത്രമല്ല. ഈ ഫലങ്ങൾ സാംസ്കാരിക മാർഗനിർദേശമായി മാത്രം ഉപയോഗിക്കുക; ചികിത്സ, സാമ്പത്തിക, നിയമ തീരുമാനങ്ങൾക്കല്ല.',
      about: 'ഞങ്ങളെക്കുറിച്ച്', privacy: 'സ്വകാര്യത', contact: 'ബന്ധപ്പെടുക', private_note: 'നിങ്ങളുടെ ജനന വിവരങ്ങൾ നിങ്ങളുടെ ഉപകരണം വിട്ടുപോകുന്നില്ല.'
    },
    mr: {
      nav_palan: 'राशीभविष्य', birth_details: 'जन्म तपशील', bhukti: 'अंतर्दशा', star_lord: 'नक्षत्र स्वामी',
      local_time: 'स्थानिक वेळ', tz_hint: 'दक्षिण/पश्चिमसाठी मायनस किंवा अक्षर लिहा (12.5 S, 74 W). जन्मतारखेला लागू असलेला फरक निवडा: उन्हाळी वेळ (DST) असल्यास 1 तास जोडा.',
      place_hint: 'परिसराचे नाव किंवा पिनकोड लिहा', no_place: 'ठिकाण सापडले नाही. जवळचे शहर किंवा पिनकोड वापरा, किंवा निर्देशांक भरा.', use_coords: 'अक्षांश-रेखांश स्वतः भरा',
      download_img: 'प्रतिमा म्हणून डाउनलोड करा',
      tagline: 'तुमच्या भाषेत मोफत वैदिक ज्योतिष',
      nav_chart: 'जन्मकुंडली', nav_match: 'विवाह गुणमिलन', nav_panchang: 'पंचांग', nav_lang: 'भाषा',
      chart_title: 'तुमची जन्मकुंडली, तुमच्याच भाषेत.',
      chart_sub: 'राशी व नवांश कुंडली, जन्म नक्षत्र आणि विंशोत्तरी दशेसह मोफत कुंडली. लाहिरी अयनांशाने तुमच्या ब्राउझरमध्येच गणना.',
      match_title: 'पारंपरिक पद्धतीने विवाह गुणमिलन.',
      match_sub: 'वधू-वरांच्या जन्म तपशिलावरून किंवा नक्षत्रावरून दहा गुण (कूट) तपासा.',
      panchang_title: 'आजचे पंचांग.',
      panchang_sub: 'तुमच्या शहरासाठी तिथी, नक्षत्र, योग, करण, सूर्योदय आणि राहुकाळ.',
      name: 'नाव', dob: 'जन्म तारीख', tob: 'जन्म वेळ', place: 'जन्म ठिकाण', city: 'शहर', date: 'तारीख', time: 'वेळ',
      other_place: 'इतर ठिकाण (निर्देशांक भरा)', lat: 'अक्षांश', lon: 'रेखांश', tz: 'UTC फरक (तास)',
      btn_chart: 'कुंडली तयार करा', btn_match: 'गुणमिलन तपासा', btn_panchang: 'पंचांग पाहा',
      bride: 'वधू', groom: 'वर', use_birth: 'जन्म तपशील', know_star: 'नक्षत्र माहीत आहे', star: 'जन्म नक्षत्र', pada: 'चरण', rasi: 'राशी',
      lagna: 'लग्न', moon_sign: 'चंद्र राशी', birth_star: 'जन्म नक्षत्र',
      planet: 'ग्रह', sign: 'राशी', degree: 'अंश', retro: 'R = वक्री',
      rasi_chart: 'राशी कुंडली', navamsa_chart: 'नवांश कुंडली', chart_style: 'कुंडली शैली', south: 'दक्षिण भारतीय', north: 'उत्तर भारतीय',
      dasha: 'विंशोत्तरी दशा', dasha_balance: 'जन्मवेळी उर्वरित दशा', years: 'वर्षे', from: 'पासून', to: 'पर्यंत', current: 'सध्या चालू',
      score: 'गुणमिलन अंक', verdict_good: 'चांगले जुळते. मुख्य गुण जुळतात.', verdict_ok: 'साधारण जुळते. निर्णयापूर्वी ज्योतिषांचा सल्ला घ्या.', verdict_bad: 'कमकुवत जुळणी. रज्जू किंवा वेध जुळत नाही, किंवा फार कमी गुण जुळतात.',
      v_good: 'जुळते', v_mid: 'अंशतः', v_bad: 'जुळत नाही',
      tithi: 'तिथी', nakshatra: 'नक्षत्र', yoga: 'योग', karana: 'करण', weekday: 'वार', sunrise: 'सूर्योदय', sunset: 'सूर्यास्त',
      rahukalam: 'राहुकाळ', yamagandam: 'यमगंड', gulikai: 'गुलिक काळ', chandrashtamam: 'चंद्राष्टम', paksha: 'पक्ष',
      print: 'प्रिंट करा किंवा PDF जतन करा', error_fill: 'कृपया तारीख, वेळ आणि ठिकाण भरा.',
      disclaimer: 'ज्योतिष ही पारंपरिक श्रद्धा आहे, विज्ञान नाही. हे निकाल केवळ सांस्कृतिक मार्गदर्शन म्हणून वापरा; वैद्यकीय, आर्थिक किंवा कायदेशीर निर्णयांसाठी नाही.',
      about: 'आमच्याबद्दल', privacy: 'गोपनीयता', contact: 'संपर्क', private_note: 'तुमचा जन्म तपशील तुमच्या डिव्हाइसबाहेर जात नाही.'
    },
    bn: {
      nav_palan: 'রাশিফল', birth_details: 'জন্ম বিবরণ', bhukti: 'অন্তর্দশা', star_lord: 'নক্ষত্র অধিপতি',
      local_time: 'স্থানীয় সময়', tz_hint: 'দক্ষিণ/পশ্চিমের জন্য মাইনাস বা অক্ষর দিন (12.5 S, 74 W)। জন্মতারিখে প্রচলিত পার্থক্য বেছে নিন: গ্রীষ্মকালীন সময় (DST) থাকলে 1 ঘণ্টা যোগ করুন।',
      place_hint: 'এলাকার নাম বা পিনকোড লিখুন', no_place: 'কোনো স্থান পাওয়া যায়নি। কাছের শহর বা পিনকোড দিন, অথবা স্থানাঙ্ক দিন।', use_coords: 'অক্ষাংশ ও দ্রাঘিমাংশ নিজে দিন',
      download_img: 'ছবি হিসেবে ডাউনলোড করুন',
      tagline: 'আপনার ভাষায় বিনামূল্যে বৈদিক জ্যোতিষ',
      nav_chart: 'জন্মকুণ্ডলী', nav_match: 'কোষ্ঠী মিলন', nav_panchang: 'পঞ্জিকা', nav_lang: 'ভাষা',
      chart_title: 'আপনার জন্মকুণ্ডলী, আপনার নিজের ভাষায়।',
      chart_sub: 'রাশি ও নবাংশ চক্র, জন্ম নক্ষত্র এবং বিংশোত্তরী দশাসহ বিনামূল্যে কুণ্ডলী। লাহিড়ী অয়নাংশে আপনার ব্রাউজারেই গণনা।',
      match_title: 'প্রথাগত পদ্ধতিতে বিয়ের কোষ্ঠী মিলন।',
      match_sub: 'পাত্র-পাত্রীর জন্ম বিবরণ বা জন্ম নক্ষত্র থেকে দশটি মিলনের দিক (কূট) যাচাই করুন।',
      panchang_title: 'আজকের পঞ্জিকা।',
      panchang_sub: 'আপনার শহরের তিথি, নক্ষত্র, যোগ, করণ, সূর্যোদয় ও রাহুকাল।',
      name: 'নাম', dob: 'জন্ম তারিখ', tob: 'জন্ম সময়', place: 'জন্মস্থান', city: 'শহর', date: 'তারিখ', time: 'সময়',
      other_place: 'অন্য স্থান (স্থানাঙ্ক দিন)', lat: 'অক্ষাংশ', lon: 'দ্রাঘিমাংশ', tz: 'UTC পার্থক্য (ঘণ্টা)',
      btn_chart: 'কুণ্ডলী তৈরি করুন', btn_match: 'মিলন দেখুন', btn_panchang: 'পঞ্জিকা দেখুন',
      bride: 'পাত্রী', groom: 'পাত্র', use_birth: 'জন্ম বিবরণ', know_star: 'নক্ষত্র জানি', star: 'জন্ম নক্ষত্র', pada: 'পাদ', rasi: 'রাশি',
      lagna: 'লগ্ন', moon_sign: 'চন্দ্র রাশি', birth_star: 'জন্ম নক্ষত্র',
      planet: 'গ্রহ', sign: 'রাশি', degree: 'অংশ', retro: 'R = বক্রী',
      rasi_chart: 'রাশি চক্র', navamsa_chart: 'নবাংশ চক্র', chart_style: 'চক্রের ধরন', south: 'দক্ষিণ ভারতীয়', north: 'উত্তর ভারতীয়',
      dasha: 'বিংশোত্তরী দশা', dasha_balance: 'জন্মকালে অবশিষ্ট দশা', years: 'বছর', from: 'থেকে', to: 'পর্যন্ত', current: 'এখন চলছে',
      score: 'মিলন নম্বর', verdict_good: 'ভালো মিল। প্রধান দিকগুলো মিলেছে।', verdict_ok: 'মাঝারি মিল। সিদ্ধান্তের আগে জ্যোতিষীর পরামর্শ নিন।', verdict_bad: 'দুর্বল মিল। রজ্জু বা বেধ মেলেনি, অথবা খুব কম দিক মিলেছে।',
      v_good: 'মিলেছে', v_mid: 'আংশিক', v_bad: 'মেলেনি',
      tithi: 'তিথি', nakshatra: 'নক্ষত্র', yoga: 'যোগ', karana: 'করণ', weekday: 'বার', sunrise: 'সূর্যোদয়', sunset: 'সূর্যাস্ত',
      rahukalam: 'রাহুকাল', yamagandam: 'যমগণ্ড', gulikai: 'গুলিক কাল', chandrashtamam: 'চন্দ্রাষ্টম', paksha: 'পক্ষ',
      print: 'প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন', error_fill: 'অনুগ্রহ করে তারিখ, সময় ও স্থান দিন।',
      disclaimer: 'জ্যোতিষ একটি প্রথাগত বিশ্বাস, বিজ্ঞান নয়। এই ফলাফল শুধু সাংস্কৃতিক নির্দেশনা হিসেবে ব্যবহার করুন; চিকিৎসা, আর্থিক বা আইনি সিদ্ধান্তে নয়।',
      about: 'আমাদের সম্পর্কে', privacy: 'গোপনীয়তা', contact: 'যোগাযোগ', private_note: 'আপনার জন্ম বিবরণ আপনার ডিভাইসের বাইরে যায় না।'
    },
    gu: {
      nav_palan: 'રાશિફળ', birth_details: 'જન્મ વિગતો', bhukti: 'અંતર્દશા', star_lord: 'નક્ષત્ર સ્વામી',
      local_time: 'સ્થાનિક સમય', tz_hint: 'દક્ષિણ/પશ્ચિમ માટે માઇનસ અથવા અક્ષર લખો (12.5 S, 74 W). જન્મતારીખે લાગુ તફાવત પસંદ કરો: ઉનાળુ સમય (DST) હોય તો 1 કલાક ઉમેરો.',
      place_hint: 'વિસ્તારનું નામ અથવા પિનકોડ લખો', no_place: 'સ્થળ મળ્યું નહીં. નજીકનું શહેર કે પિનકોડ અજમાવો, અથવા અક્ષાંશ-રેખાંશ લખો.', use_coords: 'અક્ષાંશ-રેખાંશ જાતે લખો',
      download_img: 'છબી તરીકે ડાઉનલોડ કરો',
      tagline: 'તમારી ભાષામાં મફત વૈદિક જ્યોતિષ',
      nav_chart: 'જન્મકુંડળી', nav_match: 'કુંડળી મેળાપ', nav_panchang: 'પંચાંગ', nav_lang: 'ભાષા',
      chart_title: 'તમારી જન્મકુંડળી, તમારી પોતાની ભાષામાં.',
      chart_sub: 'રાશિ અને નવાંશ કુંડળી, જન્મ નક્ષત્ર અને વિંશોત્તરી દશા સાથે મફત કુંડળી. લાહિરી અયનાંશથી તમારા બ્રાઉઝરમાં જ ગણતરી.',
      match_title: 'પરંપરાગત રીતે લગ્ન માટે કુંડળી મેળાપ.',
      match_sub: 'વર-કન્યાની જન્મ વિગતો અથવા નક્ષત્ર પરથી દસ ગુણ (કૂટ) તપાસો.',
      panchang_title: 'આજનું પંચાંગ.',
      panchang_sub: 'તમારા શહેર માટે તિથિ, નક્ષત્ર, યોગ, કરણ, સૂર્યોદય અને રાહુકાળ.',
      name: 'નામ', dob: 'જન્મ તારીખ', tob: 'જન્મ સમય', place: 'જન્મ સ્થળ', city: 'શહેર', date: 'તારીખ', time: 'સમય',
      other_place: 'અન્ય સ્થળ (અક્ષાંશ-રેખાંશ લખો)', lat: 'અક્ષાંશ', lon: 'રેખાંશ', tz: 'UTC તફાવત (કલાક)',
      btn_chart: 'કુંડળી બનાવો', btn_match: 'મેળાપક તપાસો', btn_panchang: 'પંચાંગ જુઓ',
      bride: 'કન્યા', groom: 'વર', use_birth: 'જન્મ વિગતો', know_star: 'નક્ષત્ર ખબર છે', star: 'જન્મ નક્ષત્ર', pada: 'ચરણ', rasi: 'રાશિ',
      lagna: 'લગ્ન', moon_sign: 'ચંદ્ર રાશિ', birth_star: 'જન્મ નક્ષત્ર',
      planet: 'ગ્રહ', sign: 'રાશિ', degree: 'અંશ', retro: 'R = વક્રી',
      rasi_chart: 'રાશિ કુંડળી', navamsa_chart: 'નવાંશ કુંડળી', chart_style: 'કુંડળી શૈલી', south: 'દક્ષિણ ભારતીય', north: 'ઉત્તર ભારતીય',
      dasha: 'વિંશોત્તરી દશા', dasha_balance: 'જન્મ સમયે બાકી દશા', years: 'વર્ષ', from: 'થી', to: 'સુધી', current: 'હાલ ચાલુ',
      score: 'મેળાપક ગુણ', verdict_good: 'સારો મેળ. મુખ્ય ગુણ મળે છે.', verdict_ok: 'સામાન્ય મેળ. નિર્ણય પહેલાં જ્યોતિષીની સલાહ લો.', verdict_bad: 'નબળો મેળ. રજ્જુ અથવા વેધ મળતો નથી, અથવા બહુ ઓછા ગુણ મળે છે.',
      v_good: 'મળે છે', v_mid: 'આંશિક', v_bad: 'મળતું નથી',
      tithi: 'તિથિ', nakshatra: 'નક્ષત્ર', yoga: 'યોગ', karana: 'કરણ', weekday: 'વાર', sunrise: 'સૂર્યોદય', sunset: 'સૂર્યાસ્ત',
      rahukalam: 'રાહુકાળ', yamagandam: 'યમગંડ', gulikai: 'ગુલિક કાળ', chandrashtamam: 'ચંદ્રાષ્ટમ', paksha: 'પક્ષ',
      print: 'પ્રિન્ટ કરો અથવા PDF સાચવો', error_fill: 'કૃપા કરીને તારીખ, સમય અને સ્થળ ભરો.',
      disclaimer: 'જ્યોતિષ એક પરંપરાગત માન્યતા છે, વિજ્ઞાન નથી. આ પરિણામોને ફક્ત સાંસ્કૃતિક માર્ગદર્શન તરીકે વાપરો; તબીબી, નાણાકીય કે કાનૂની નિર્ણયો માટે નહીં.',
      about: 'અમારા વિશે', privacy: 'ગોપનીયતા', contact: 'સંપર્ક', private_note: 'તમારી જન્મ વિગતો તમારા ઉપકરણની બહાર જતી નથી.'
    },
    or: {
      nav_palan: 'ରାଶିଫଳ', birth_details: 'ଜନ୍ମ ବିବରଣୀ', bhukti: 'ଅନ୍ତର୍ଦଶା', star_lord: 'ନକ୍ଷତ୍ର ଅଧିପତି',
      local_time: 'ସ୍ଥାନୀୟ ସମୟ', tz_hint: 'ଦକ୍ଷିଣ/ପଶ୍ଚିମ ପାଇଁ ମାଇନସ୍ ବା ଅକ୍ଷର ଦିଅନ୍ତୁ (12.5 S, 74 W)। ଜନ୍ମ ତାରିଖରେ ଥିବା ପାର୍ଥକ୍ୟ ବାଛନ୍ତୁ: ଗ୍ରୀଷ୍ମ ସମୟ (DST) ଥିଲେ 1 ଘଣ୍ଟା ଯୋଡନ୍ତୁ।',
      place_hint: 'ଅଞ୍ଚଳର ନାମ କିମ୍ବା ପିନକୋଡ୍ ଲେଖନ୍ତୁ', no_place: 'ସ୍ଥାନ ମିଳିଲା ନାହିଁ। ପାଖ ସହର କିମ୍ବା ପିନକୋଡ୍ ଚେଷ୍ଟା କରନ୍ତୁ, କିମ୍ବା ଅକ୍ଷାଂଶ ଦିଅନ୍ତୁ।', use_coords: 'ଅକ୍ଷାଂଶ ଓ ଦ୍ରାଘିମା ନିଜେ ଦିଅନ୍ତୁ',
      download_img: 'ଛବି ଭାବେ ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
      tagline: 'ଆପଣଙ୍କ ଭାଷାରେ ମାଗଣା ବୈଦିକ ଜ୍ୟୋତିଷ',
      nav_chart: 'ଜନ୍ମ କୁଣ୍ଡଳୀ', nav_match: 'କୋଷ୍ଠୀ ମେଳ', nav_panchang: 'ପଞ୍ଜିକା', nav_lang: 'ଭାଷା',
      chart_title: 'ଆପଣଙ୍କ ଜନ୍ମ କୁଣ୍ଡଳୀ, ଆପଣଙ୍କ ନିଜ ଭାଷାରେ।',
      chart_sub: 'ରାଶି ଓ ନବାଂଶ ଚକ୍ର, ଜନ୍ମ ନକ୍ଷତ୍ର ଏବଂ ବିଂଶୋତ୍ତରୀ ଦଶା ସହ ମାଗଣା କୁଣ୍ଡଳୀ। ଲାହିରୀ ଅୟନାଂଶରେ ଆପଣଙ୍କ ବ୍ରାଉଜରରେ ହିଁ ଗଣନା।',
      match_title: 'ପାରମ୍ପରିକ ଢଙ୍ଗରେ ବିବାହ ପାଇଁ କୋଷ୍ଠୀ ମେଳ।',
      match_sub: 'ବର ଓ କନ୍ୟାଙ୍କ ଜନ୍ମ ବିବରଣୀ କିମ୍ବା ନକ୍ଷତ୍ରରୁ ଦଶଟି ଗୁଣ (କୂଟ) ଯାଞ୍ଚ କରନ୍ତୁ।',
      panchang_title: 'ଆଜିର ପଞ୍ଜିକା।',
      panchang_sub: 'ଆପଣଙ୍କ ସହର ପାଇଁ ତିଥି, ନକ୍ଷତ୍ର, ଯୋଗ, କରଣ, ସୂର୍ଯ୍ୟୋଦୟ ଓ ରାହୁକାଳ।',
      name: 'ନାମ', dob: 'ଜନ୍ମ ତାରିଖ', tob: 'ଜନ୍ମ ସମୟ', place: 'ଜନ୍ମ ସ୍ଥାନ', city: 'ସହର', date: 'ତାରିଖ', time: 'ସମୟ',
      other_place: 'ଅନ୍ୟ ସ୍ଥାନ (ଅକ୍ଷାଂଶ ଦିଅନ୍ତୁ)', lat: 'ଅକ୍ଷାଂଶ', lon: 'ଦ୍ରାଘିମା', tz: 'UTC ପାର୍ଥକ୍ୟ (ଘଣ୍ଟା)',
      btn_chart: 'କୁଣ୍ଡଳୀ ପ୍ରସ୍ତୁତ କରନ୍ତୁ', btn_match: 'ମେଳକ ଦେଖନ୍ତୁ', btn_panchang: 'ପଞ୍ଜିକା ଦେଖନ୍ତୁ',
      bride: 'କନ୍ୟା', groom: 'ବର', use_birth: 'ଜନ୍ମ ବିବରଣୀ', know_star: 'ନକ୍ଷତ୍ର ଜଣା ଅଛି', star: 'ଜନ୍ମ ନକ୍ଷତ୍ର', pada: 'ପାଦ', rasi: 'ରାଶି',
      lagna: 'ଲଗ୍ନ', moon_sign: 'ଚନ୍ଦ୍ର ରାଶି', birth_star: 'ଜନ୍ମ ନକ୍ଷତ୍ର',
      planet: 'ଗ୍ରହ', sign: 'ରାଶି', degree: 'ଅଂଶ', retro: 'R = ବକ୍ରୀ',
      rasi_chart: 'ରାଶି ଚକ୍ର', navamsa_chart: 'ନବାଂଶ ଚକ୍ର', chart_style: 'ଚକ୍ର ଶୈଳୀ', south: 'ଦକ୍ଷିଣ ଭାରତୀୟ', north: 'ଉତ୍ତର ଭାରତୀୟ',
      dasha: 'ବିଂଶୋତ୍ତରୀ ଦଶା', dasha_balance: 'ଜନ୍ମ ସମୟରେ ବାକି ଦଶା', years: 'ବର୍ଷ', from: 'ରୁ', to: 'ପର୍ଯ୍ୟନ୍ତ', current: 'ଏବେ ଚାଲିଛି',
      score: 'ମେଳକ ଅଙ୍କ', verdict_good: 'ଭଲ ମେଳ। ମୁଖ୍ୟ ଗୁଣ ମିଳୁଛି।', verdict_ok: 'ସାଧାରଣ ମେଳ। ନିଷ୍ପତ୍ତି ପୂର୍ବରୁ ଜ୍ୟୋତିଷଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।', verdict_bad: 'ଦୁର୍ବଳ ମେଳ। ରଜ୍ଜୁ କିମ୍ବା ବେଧ ମିଳୁନାହିଁ, କିମ୍ବା ବହୁତ କମ୍ ଗୁଣ ମିଳୁଛି।',
      v_good: 'ମିଳୁଛି', v_mid: 'ଆଂଶିକ', v_bad: 'ମିଳୁନାହିଁ',
      tithi: 'ତିଥି', nakshatra: 'ନକ୍ଷତ୍ର', yoga: 'ଯୋଗ', karana: 'କରଣ', weekday: 'ବାର', sunrise: 'ସୂର୍ଯ୍ୟୋଦୟ', sunset: 'ସୂର୍ଯ୍ୟାସ୍ତ',
      rahukalam: 'ରାହୁକାଳ', yamagandam: 'ଯମଗଣ୍ଡ', gulikai: 'ଗୁଳିକ କାଳ', chandrashtamam: 'ଚନ୍ଦ୍ରାଷ୍ଟମ', paksha: 'ପକ୍ଷ',
      print: 'ପ୍ରିଣ୍ଟ କରନ୍ତୁ କିମ୍ବା PDF ସେଭ୍ କରନ୍ତୁ', error_fill: 'ଦୟାକରି ତାରିଖ, ସମୟ ଓ ସ୍ଥାନ ଦିଅନ୍ତୁ।',
      disclaimer: 'ଜ୍ୟୋତିଷ ଏକ ପାରମ୍ପରିକ ବିଶ୍ୱାସ, ବିଜ୍ଞାନ ନୁହେଁ। ଏହି ଫଳାଫଳକୁ କେବଳ ସାଂସ୍କୃତିକ ମାର୍ଗଦର୍ଶନ ଭାବେ ବ୍ୟବହାର କରନ୍ତୁ; ଚିକିତ୍ସା, ଆର୍ଥିକ କିମ୍ବା ଆଇନଗତ ନିଷ୍ପତ୍ତି ପାଇଁ ନୁହେଁ।',
      about: 'ଆମ ବିଷୟରେ', privacy: 'ଗୋପନୀୟତା', contact: 'ଯୋଗାଯୋଗ', private_note: 'ଆପଣଙ୍କ ଜନ୍ମ ବିବରଣୀ ଆପଣଙ୍କ ଡିଭାଇସ୍ ବାହାରକୁ ଯାଏ ନାହିଁ।'
    }
  };

  // ---------- Astrology terms ----------
  const EN = {
    rasi: ['Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)', 'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'],
    rasiShort: ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'],
    nak: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'],
    planet: { sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn', rahu: 'Rahu', ketu: 'Ketu', lagna: 'Lagna' },
    abbr: { sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke', lagna: 'Asc' },
    weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    tithi: ['Prathama', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Amavasya'],
    paksha: { shukla: 'Shukla', krishna: 'Krishna' },
    yoga: ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'],
    karana: ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'],
    porutham: { dina: 'Dina', gana: 'Gana', mahendra: 'Mahendra', stree: 'Stree Deergha', yoni: 'Yoni', rasi: 'Rasi', adhipati: 'Rasi Adhipati', vasya: 'Vasya', rajju: 'Rajju', vedha: 'Vedha' }
  };

  const DEV = {
    rasi: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'],
    nak: ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वफाल्गुनी', 'उत्तरफाल्गुनी', 'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढा', 'उत्तराषाढा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वभाद्रपदा', 'उत्तरभाद्रपदा', 'रेवती'],
    planet: { sun: 'सूर्य', moon: 'चन्द्र', mars: 'मंगल', mercury: 'बुध', jupiter: 'गुरु', venus: 'शुक्र', saturn: 'शनि', rahu: 'राहु', ketu: 'केतु', lagna: 'लग्न' },
    abbr: { sun: 'सू', moon: 'चं', mars: 'मं', mercury: 'बु', jupiter: 'गु', venus: 'शु', saturn: 'श', rahu: 'रा', ketu: 'के', lagna: 'ल' },
    weekday: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
    tithi: ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा', 'अमावस्या'],
    paksha: { shukla: 'शुक्ल', krishna: 'कृष्ण' },
    yoga: ['विष्कम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति'],
    karana: ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि', 'शकुनि', 'चतुष्पद', 'नाग', 'किंस्तुघ्न'],
    porutham: { dina: 'दिन', gana: 'गण', mahendra: 'माहेन्द्र', stree: 'स्त्री दीर्घ', yoni: 'योनि', rasi: 'राशि', adhipati: 'राशि अधिपति', vasya: 'वश्य', rajju: 'रज्जु', vedha: 'वेध' }
  };

  const TA = {
    rasi: ['மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'],
    nak: ['அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்', 'திருவாதிரை', 'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்', 'அஸ்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்', 'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'],
    planet: { sun: 'சூரியன்', moon: 'சந்திரன்', mars: 'செவ்வாய்', mercury: 'புதன்', jupiter: 'குரு', venus: 'சுக்கிரன்', saturn: 'சனி', rahu: 'ராகு', ketu: 'கேது', lagna: 'லக்னம்' },
    abbr: { sun: 'சூ', moon: 'சந்', mars: 'செ', mercury: 'பு', jupiter: 'கு', venus: 'சுக்', saturn: 'சனி', rahu: 'ரா', ketu: 'கே', lagna: 'ல' },
    weekday: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
    tithi: ['பிரதமை', 'துவிதியை', 'திருதியை', 'சதுர்த்தி', 'பஞ்சமி', 'சஷ்டி', 'சப்தமி', 'அஷ்டமி', 'நவமி', 'தசமி', 'ஏகாதசி', 'துவாதசி', 'திரயோதசி', 'சதுர்த்தசி', 'பௌர்ணமி', 'அமாவாசை'],
    paksha: { shukla: 'வளர்பிறை', krishna: 'தேய்பிறை' },
    yoga: ['விஷ்கம்பம்', 'ப்ரீதி', 'ஆயுஷ்மான்', 'சௌபாக்கியம்', 'சோபனம்', 'அதிகண்டம்', 'சுகர்மம்', 'திருதி', 'சூலம்', 'கண்டம்', 'விருத்தி', 'துருவம்', 'வியாகாதம்', 'ஹர்ஷணம்', 'வஜ்ரம்', 'சித்தி', 'வியதீபாதம்', 'வரீயான்', 'பரிகம்', 'சிவம்', 'சித்தம்', 'சாத்தியம்', 'சுபம்', 'சுப்பிரம்', 'பிராம்யம்', 'ஐந்திரம்', 'வைதிருதி'],
    karana: ['பவம்', 'பாலவம்', 'கௌலவம்', 'தைதுலம்', 'கரசை', 'வணிசை', 'பத்திரை', 'சகுனி', 'சதுஷ்பாதம்', 'நாகவம்', 'கிம்ஸ்துக்னம்'],
    porutham: { dina: 'தினப் பொருத்தம்', gana: 'கணப் பொருத்தம்', mahendra: 'மகேந்திரப் பொருத்தம்', stree: 'ஸ்திரீ தீர்க்கம்', yoni: 'யோனிப் பொருத்தம்', rasi: 'ராசிப் பொருத்தம்', adhipati: 'ராசி அதிபதி', vasya: 'வசியப் பொருத்தம்', rajju: 'ரஜ்ஜுப் பொருத்தம்', vedha: 'வேதைப் பொருத்தம்' }
  };

  // Devanagari -> other Brahmic scripts (Unicode blocks share layout)
  const OFFSETS = { te: 0x0300, kn: 0x0380, ml: 0x0400, or: 0x0200, bn: 0x0080, gu: 0x0180 };
  const FIX = {
    bn: { 0x0935: 0x09AC },              // va -> ba
    or: { 0x0935: 0x0B2C }               // va -> ba (ya handled in translit)
  };
  function translit(str, lang) {
    const off = OFFSETS[lang]; if (!off) return str;
    let out = '';
    for (const ch of str) {
      const c = ch.codePointAt(0);
      if (c >= 0x0900 && c <= 0x097F && c !== 0x0964 && c !== 0x0965) {
        let fixed = FIX[lang] && FIX[lang][c];
        if (c === 0x092F && (lang === 'bn' || lang === 'or')) {
          // ya: plain at word start or in a conjunct; the dotted form (য় / ୟ) after a vowel
          const prev = out.slice(-1), afterHalant = /[\u09CD\u0B4D]/.test(prev);
          fixed = (!prev || /\s/.test(prev)) ? (lang === 'bn' ? 0x09AF : 0x0B2F) : afterHalant ? (lang === 'bn' ? 0x09AF : 0x0B5F) : (lang === 'bn' ? 0x09DF : 0x0B5F);
        }
        out += String.fromCodePoint(fixed || c + off);
      } else out += ch;
    }
    return out;
  }
  function mapDeep(obj, fn) {
    if (Array.isArray(obj)) return obj.map((x) => mapDeep(x, fn));
    if (typeof obj === 'object') { const o = {}; for (const k in obj) o[k] = mapDeep(obj[k], fn); return o; }
    return fn(obj);
  }

  const TERMS = { en: EN, hi: DEV, mr: Object.assign({}, DEV), ta: TA };
  for (const l of Object.keys(OFFSETS)) TERMS[l] = mapDeep(DEV, (s) => translit(s, l));

  // Hand-written regional names that differ from plain transliteration
  TERMS.mr.weekday = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  TERMS.te.weekday = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'];
  TERMS.te.rasi = ['మేషం', 'వృషభం', 'మిథునం', 'కర్కాటకం', 'సింహం', 'కన్య', 'తుల', 'వృశ్చికం', 'ధనుస్సు', 'మకరం', 'కుంభం', 'మీనం'];
  TERMS.kn.weekday = ['ಭಾನುವಾರ', 'ಸೋಮವಾರ', 'ಮಂಗಳವಾರ', 'ಬುಧವಾರ', 'ಗುರುವಾರ', 'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ'];
  TERMS.ml.weekday = ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി'];
  TERMS.ml.rasi = ['മേടം', 'ഇടവം', 'മിഥുനം', 'കർക്കടകം', 'ചിങ്ങം', 'കന്നി', 'തുലാം', 'വൃശ്ചികം', 'ധനു', 'മകരം', 'കുംഭം', 'മീനം'];
  TERMS.ml.nak = ['അശ്വതി', 'ഭരണി', 'കാർത്തിക', 'രോഹിണി', 'മകയിരം', 'തിരുവാതിര', 'പുണർതം', 'പൂയം', 'ആയില്യം', 'മകം', 'പൂരം', 'ഉത്രം', 'അത്തം', 'ചിത്തിര', 'ചോതി', 'വിശാഖം', 'അനിഴം', 'തൃക്കേട്ട', 'മൂലം', 'പൂരാടം', 'ഉത്രാടം', 'തിരുവോണം', 'അവിട്ടം', 'ചതയം', 'പൂരുരുട്ടാതി', 'ഉത്രട്ടാതി', 'രേവതി'];
  TERMS.ml.planet = { sun: 'സൂര്യൻ', moon: 'ചന്ദ്രൻ', mars: 'ചൊവ്വ', mercury: 'ബുധൻ', jupiter: 'വ്യാഴം', venus: 'ശുക്രൻ', saturn: 'ശനി', rahu: 'രാഹു', ketu: 'കേതു', lagna: 'ലഗ്നം' };
  TERMS.ml.abbr = { sun: 'സൂ', moon: 'ച', mars: 'ചൊ', mercury: 'ബു', jupiter: 'വ്യാ', venus: 'ശു', saturn: 'ശ', rahu: 'രാ', ketu: 'കേ', lagna: 'ല' };
  TERMS.ml.paksha = { shukla: 'വെളുത്ത പക്ഷം', krishna: 'കറുത്ത പക്ഷം' };
  TERMS.ml.porutham = { dina: 'ദിനപ്പൊരുത്തം', gana: 'ഗണപ്പൊരുത്തം', mahendra: 'മാഹേന്ദ്രം', stree: 'സ്ത്രീദീർഘം', yoni: 'യോനിപ്പൊരുത്തം', rasi: 'രാശിപ്പൊരുത്തം', adhipati: 'രാശ്യാധിപത്യം', vasya: 'വശ്യപ്പൊരുത്തം', rajju: 'രജ്ജുപ്പൊരുത്തം', vedha: 'വേധപ്പൊരുത്തം' };
  TERMS.bn.weekday = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  TERMS.gu.weekday = ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર'];
  TERMS.or.weekday = ['ରବିବାର', 'ସୋମବାର', 'ମଙ୍ଗଳବାର', 'ବୁଧବାର', 'ଗୁରୁବାର', 'ଶୁକ୍ରବାର', 'ଶନିବାର'];
  // Everyday regional spellings (checked against how each language's astrology sites and newspapers write them).
  Object.assign(TERMS.hi, {
    rasi: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'],
    nak: ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वा भाद्रपद', 'उत्तरा भाद्रपद', 'रेवती'],
    planet: { sun: 'सूर्य', moon: 'चंद्र', mars: 'मंगल', mercury: 'बुध', jupiter: 'गुरु', venus: 'शुक्र', saturn: 'शनि', rahu: 'राहु', ketu: 'केतु', lagna: 'लग्न' },
    porutham: { dina: 'दिन', gana: 'गण', mahendra: 'माहेंद्र', stree: 'स्त्री दीर्घ', yoni: 'योनि', rasi: 'राशि', adhipati: 'राशि स्वामी', vasya: 'वश्य', rajju: 'रज्जु', vedha: 'वेध' },
    yoga: ['विष्कुंभ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगंड', 'सुकर्मा', 'धृति', 'शूल', 'गंड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इंद्र', 'वैधृति']
  });
  Object.assign(TERMS.mr, {
    rasi: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तूळ', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'],
    nak: TERMS.hi.nak.slice(),
    planet: { sun: 'रवी', moon: 'चंद्र', mars: 'मंगळ', mercury: 'बुध', jupiter: 'गुरू', venus: 'शुक्र', saturn: 'शनी', rahu: 'राहू', ketu: 'केतू', lagna: 'लग्न' },
    porutham: { dina: 'दिन', gana: 'गण', mahendra: 'माहेंद्र', stree: 'स्त्री दीर्घ', yoni: 'योनी', rasi: 'राशी', adhipati: 'राशी स्वामी', vasya: 'वश्य', rajju: 'रज्जू', vedha: 'वेध' },
    yoga: TERMS.hi.yoga.slice()
  });
  TERMS.mr.abbr = Object.assign({}, TERMS.mr.abbr, { sun: 'र' });
  Object.assign(TERMS.te, {
    nak: ['అశ్విని', 'భరణి', 'కృత్తిక', 'రోహిణి', 'మృగశిర', 'ఆరుద్ర', 'పునర్వసు', 'పుష్యమి', 'ఆశ్లేష', 'మఖ', 'పుబ్బ', 'ఉత్తర', 'హస్త', 'చిత్త', 'స్వాతి', 'విశాఖ', 'అనూరాధ', 'జ్యేష్ఠ', 'మూల', 'పూర్వాషాఢ', 'ఉత్తరాషాఢ', 'శ్రవణం', 'ధనిష్ఠ', 'శతభిషం', 'పూర్వాభాద్ర', 'ఉత్తరాభాద్ర', 'రేవతి'],
    planet: { sun: 'సూర్యుడు', moon: 'చంద్రుడు', mars: 'కుజుడు', mercury: 'బుధుడు', jupiter: 'గురువు', venus: 'శుక్రుడు', saturn: 'శని', rahu: 'రాహువు', ketu: 'కేతువు', lagna: 'లగ్నం' },
    abbr: { sun: 'ర', moon: 'చం', mars: 'కు', mercury: 'బు', jupiter: 'గు', venus: 'శు', saturn: 'శ', rahu: 'రా', ketu: 'కే', lagna: 'ల' },
    tithi: ['పాడ్యమి', 'విదియ', 'తదియ', 'చవితి', 'పంచమి', 'షష్ఠి', 'సప్తమి', 'అష్టమి', 'నవమి', 'దశమి', 'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'పౌర్ణమి', 'అమావాస్య'],
    paksha: { shukla: 'శుక్ల పక్షం', krishna: 'కృష్ణ పక్షం' },
    yoga: ['విష్కంభం', 'ప్రీతి', 'ఆయుష్మాన్', 'సౌభాగ్యం', 'శోభనం', 'అతిగండం', 'సుకర్మ', 'ధృతి', 'శూలం', 'గండం', 'వృద్ధి', 'ధ్రువం', 'వ్యాఘాతం', 'హర్షణం', 'వజ్రం', 'సిద్ధి', 'వ్యతీపాతం', 'వరీయాన్', 'పరిఘం', 'శివం', 'సిద్ధం', 'సాధ్యం', 'శుభం', 'శుక్లం', 'బ్రహ్మం', 'ఐంద్రం', 'వైధృతి'],
    karana: ['బవ', 'బాలవ', 'కౌలవ', 'తైతుల', 'గరజి', 'వణిజ', 'భద్ర (విష్టి)', 'శకుని', 'చతుష్పాద', 'నాగవ', 'కింస్తుఘ్న'],
    porutham: { dina: 'దిన పొంతన', gana: 'గణ పొంతన', mahendra: 'మాహేంద్రం', stree: 'స్త్రీ దీర్ఘం', yoni: 'యోని పొంతన', rasi: 'రాశి పొంతన', adhipati: 'రాశ్యాధిపతి', vasya: 'వశ్య పొంతన', rajju: 'రజ్జు', vedha: 'వేధ' }
  });
  Object.assign(TERMS.kn, {
    rasi: ['ಮೇಷ', 'ವೃಷಭ', 'ಮಿಥುನ', 'ಕಟಕ', 'ಸಿಂಹ', 'ಕನ್ಯಾ', 'ತುಲಾ', 'ವೃಶ್ಚಿಕ', 'ಧನು', 'ಮಕರ', 'ಕುಂಭ', 'ಮೀನ'],
    nak: ['ಅಶ್ವಿನಿ', 'ಭರಣಿ', 'ಕೃತ್ತಿಕಾ', 'ರೋಹಿಣಿ', 'ಮೃಗಶಿರ', 'ಆರ್ದ್ರಾ', 'ಪುನರ್ವಸು', 'ಪುಷ್ಯ', 'ಆಶ್ಲೇಷ', 'ಮಘಾ', 'ಪುಬ್ಬ', 'ಉತ್ತರ', 'ಹಸ್ತ', 'ಚಿತ್ತಾ', 'ಸ್ವಾತಿ', 'ವಿಶಾಖ', 'ಅನುರಾಧ', 'ಜ್ಯೇಷ್ಠ', 'ಮೂಲ', 'ಪೂರ್ವಾಷಾಢ', 'ಉತ್ತರಾಷಾಢ', 'ಶ್ರವಣ', 'ಧನಿಷ್ಠ', 'ಶತಭಿಷ', 'ಪೂರ್ವಾಭಾದ್ರ', 'ಉತ್ತರಾಭಾದ್ರ', 'ರೇವತಿ'],
    planet: { sun: 'ರವಿ', moon: 'ಚಂದ್ರ', mars: 'ಕುಜ', mercury: 'ಬುಧ', jupiter: 'ಗುರು', venus: 'ಶುಕ್ರ', saturn: 'ಶನಿ', rahu: 'ರಾಹು', ketu: 'ಕೇತು', lagna: 'ಲಗ್ನ' },
    abbr: { sun: 'ರ', moon: 'ಚಂ', mars: 'ಕು', mercury: 'ಬು', jupiter: 'ಗು', venus: 'ಶು', saturn: 'ಶ', rahu: 'ರಾ', ketu: 'ಕೇ', lagna: 'ಲ' },
    tithi: ['ಪಾಡ್ಯ', 'ಬಿದಿಗೆ', 'ತದಿಗೆ', 'ಚೌತಿ', 'ಪಂಚಮಿ', 'ಷಷ್ಠಿ', 'ಸಪ್ತಮಿ', 'ಅಷ್ಟಮಿ', 'ನವಮಿ', 'ದಶಮಿ', 'ಏಕಾದಶಿ', 'ದ್ವಾದಶಿ', 'ತ್ರಯೋದಶಿ', 'ಚತುರ್ದಶಿ', 'ಹುಣ್ಣಿಮೆ', 'ಅಮಾವಾಸ್ಯೆ'],
    paksha: { shukla: 'ಶುಕ್ಲ ಪಕ್ಷ', krishna: 'ಕೃಷ್ಣ ಪಕ್ಷ' },
    yoga: ['ವಿಷ್ಕಂಭ', 'ಪ್ರೀತಿ', 'ಆಯುಷ್ಮಾನ್', 'ಸೌಭಾಗ್ಯ', 'ಶೋಭನ', 'ಅತಿಗಂಡ', 'ಸುಕರ್ಮ', 'ಧೃತಿ', 'ಶೂಲ', 'ಗಂಡ', 'ವೃದ್ಧಿ', 'ಧ್ರುವ', 'ವ್ಯಾಘಾತ', 'ಹರ್ಷಣ', 'ವಜ್ರ', 'ಸಿದ್ಧಿ', 'ವ್ಯತೀಪಾತ', 'ವರೀಯಾನ್', 'ಪರಿಘ', 'ಶಿವ', 'ಸಿದ್ಧ', 'ಸಾಧ್ಯ', 'ಶುಭ', 'ಶುಕ್ಲ', 'ಬ್ರಹ್ಮ', 'ಐಂದ್ರ', 'ವೈಧೃತಿ'],
    karana: ['ಬವ', 'ಬಾಲವ', 'ಕೌಲವ', 'ತೈತಿಲ', 'ಗರಜ', 'ವಣಿಜ', 'ಭದ್ರ (ವಿಷ್ಟಿ)', 'ಶಕುನಿ', 'ಚತುಷ್ಪಾದ', 'ನಾಗ', 'ಕಿಂಸ್ತುಘ್ನ'],
    porutham: { dina: 'ದಿನ ಕೂಟ', gana: 'ಗಣ ಕೂಟ', mahendra: 'ಮಾಹೇಂದ್ರ', stree: 'ಸ್ತ್ರೀ ದೀರ್ಘ', yoni: 'ಯೋನಿ ಕೂಟ', rasi: 'ರಾಶಿ ಕೂಟ', adhipati: 'ರಾಶ್ಯಧಿಪತಿ', vasya: 'ವಶ್ಯ ಕೂಟ', rajju: 'ರಜ್ಜು', vedha: 'ವೇಧ' }
  });
  Object.assign(TERMS.ml, {
    tithi: ['പ്രഥമ', 'ദ്വിതീയ', 'തൃതീയ', 'ചതുർഥി', 'പഞ്ചമി', 'ഷഷ്ഠി', 'സപ്തമി', 'അഷ്ടമി', 'നവമി', 'ദശമി', 'ഏകാദശി', 'ദ്വാദശി', 'ത്രയോദശി', 'ചതുർദശി', 'പൗർണമി', 'അമാവാസി'],
    yoga: ['വിഷ്കംഭം', 'പ്രീതി', 'ആയുഷ്മാൻ', 'സൗഭാഗ്യം', 'ശോഭനം', 'അതിഗണ്ഡം', 'സുകർമം', 'ധൃതി', 'ശൂലം', 'ഗണ്ഡം', 'വൃദ്ധി', 'ധ്രുവം', 'വ്യാഘാതം', 'ഹർഷണം', 'വജ്രം', 'സിദ്ധി', 'വ്യതീപാതം', 'വരീയാൻ', 'പരിഘം', 'ശിവം', 'സിദ്ധം', 'സാധ്യം', 'ശുഭം', 'ശുക്ലം', 'ബ്രഹ്മം', 'ഐന്ദ്രം', 'വൈധൃതി'],
    karana: ['ബവം', 'ബാലവം', 'കൗലവം', 'തൈതിലം', 'ഗരജം', 'വണിജം', 'ഭദ്ര (വിഷ്ടി)', 'ശകുനി', 'ചതുഷ്പാദം', 'നാഗവം', 'കിംസ്തുഘ്നം']
  });
  Object.assign(TERMS.or, {
    rasi: ['ମେଷ', 'ବୃଷ', 'ମିଥୁନ', 'କର୍କଟ', 'ସିଂହ', 'କନ୍ୟା', 'ତୁଳା', 'ବିଛା', 'ଧନୁ', 'ମକର', 'କୁମ୍ଭ', 'ମୀନ'],
    nak: ['ଅଶ୍ୱିନୀ', 'ଭରଣୀ', 'କୃତ୍ତିକା', 'ରୋହିଣୀ', 'ମୃଗଶିରା', 'ଆର୍ଦ୍ରା', 'ପୁନର୍ବସୁ', 'ପୁଷ୍ୟା', 'ଅଶ୍ଳେଷା', 'ମଘା', 'ପୂର୍ବ ଫାଲ୍ଗୁନୀ', 'ଉତ୍ତର ଫାଲ୍ଗୁନୀ', 'ହସ୍ତା', 'ଚିତ୍ରା', 'ସ୍ୱାତୀ', 'ବିଶାଖା', 'ଅନୁରାଧା', 'ଜ୍ୟେଷ୍ଠା', 'ମୂଳା', 'ପୂର୍ବାଷାଢ଼ା', 'ଉତ୍ତରାଷାଢ଼ା', 'ଶ୍ରବଣା', 'ଧନିଷ୍ଠା', 'ଶତଭିଷା', 'ପୂର୍ବଭାଦ୍ରପଦ', 'ଉତ୍ତରଭାଦ୍ରପଦ', 'ରେବତୀ'],
    planet: { sun: 'ସୂର୍ଯ୍ୟ', moon: 'ଚନ୍ଦ୍ର', mars: 'ମଙ୍ଗଳ', mercury: 'ବୁଧ', jupiter: 'ଗୁରୁ', venus: 'ଶୁକ୍ର', saturn: 'ଶନି', rahu: 'ରାହୁ', ketu: 'କେତୁ', lagna: 'ଲଗ୍ନ' },
    tithi: ['ପ୍ରତିପଦା', 'ଦ୍ୱିତୀୟା', 'ତୃତୀୟା', 'ଚତୁର୍ଥୀ', 'ପଞ୍ଚମୀ', 'ଷଷ୍ଠୀ', 'ସପ୍ତମୀ', 'ଅଷ୍ଟମୀ', 'ନବମୀ', 'ଦଶମୀ', 'ଏକାଦଶୀ', 'ଦ୍ୱାଦଶୀ', 'ତ୍ରୟୋଦଶୀ', 'ଚତୁର୍ଦ୍ଦଶୀ', 'ପୂର୍ଣ୍ଣିମା', 'ଅମାବାସ୍ୟା'],
    porutham: { dina: 'ଦିନ', gana: 'ଗଣ', mahendra: 'ମାହେନ୍ଦ୍ର', stree: 'ସ୍ତ୍ରୀ ଦୀର୍ଘ', yoni: 'ଯୋନି', rasi: 'ରାଶି', adhipati: 'ରାଶି ଅଧିପତି', vasya: 'ବଶ୍ୟ', rajju: 'ରଜ୍ଜୁ', vedha: 'ବେଧ' }
  });
  Object.assign(TERMS.bn, {
    rasi: ['মেষ', 'বৃষ', 'মিথুন', 'কর্কট', 'সিংহ', 'কন্যা', 'তুলা', 'বৃশ্চিক', 'ধনু', 'মকর', 'কুম্ভ', 'মীন'],
    nak: ['অশ্বিনী', 'ভরণী', 'কৃত্তিকা', 'রোহিণী', 'মৃগশিরা', 'আর্দ্রা', 'পুনর্বসু', 'পুষ্যা', 'অশ্লেষা', 'মঘা', 'পূর্বফাল্গুনী', 'উত্তরফাল্গুনী', 'হস্তা', 'চিত্রা', 'স্বাতী', 'বিশাখা', 'অনুরাধা', 'জ্যেষ্ঠা', 'মূলা', 'পূর্বাষাঢ়া', 'উত্তরাষাঢ়া', 'শ্রবণা', 'ধনিষ্ঠা', 'শতভিষা', 'পূর্বভাদ্রপদ', 'উত্তরভাদ্রপদ', 'রেবতী'],
    planet: { sun: 'রবি', moon: 'চন্দ্র', mars: 'মঙ্গল', mercury: 'বুধ', jupiter: 'বৃহস্পতি', venus: 'শুক্র', saturn: 'শনি', rahu: 'রাহু', ketu: 'কেতু', lagna: 'লগ্ন' },
    abbr: { sun: 'র', moon: 'চ', mars: 'ম', mercury: 'বু', jupiter: 'বৃ', venus: 'শু', saturn: 'শ', rahu: 'রা', ketu: 'কে', lagna: 'ল' },
    tithi: ['প্রতিপদ', 'দ্বিতীয়া', 'তৃতীয়া', 'চতুর্থী', 'পঞ্চমী', 'ষষ্ঠী', 'সপ্তমী', 'অষ্টমী', 'নবমী', 'দশমী', 'একাদশী', 'দ্বাদশী', 'ত্রয়োদশী', 'চতুর্দশী', 'পূর্ণিমা', 'অমাবস্যা'],
    porutham: { dina: 'দিন', gana: 'গণ', mahendra: 'মাহেন্দ্র', stree: 'স্ত্রী দীর্ঘ', yoni: 'যোনি', rasi: 'রাশি', adhipati: 'রাশির অধিপতি', vasya: 'বশ্য', rajju: 'রজ্জু', vedha: 'বেধ' }
  });
  Object.assign(TERMS.gu, {
    rasi: ['મેષ', 'વૃષભ', 'મિથુન', 'કર્ક', 'સિંહ', 'કન્યા', 'તુલા', 'વૃશ્ચિક', 'ધન', 'મકર', 'કુંભ', 'મીન'],
    nak: ['અશ્વિની', 'ભરણી', 'કૃત્તિકા', 'રોહિણી', 'મૃગશીર્ષ', 'આર્દ્રા', 'પુનર્વસુ', 'પુષ્ય', 'આશ્લેષા', 'મઘા', 'પૂર્વા ફાલ્ગુની', 'ઉત્તરા ફાલ્ગુની', 'હસ્ત', 'ચિત્રા', 'સ્વાતિ', 'વિશાખા', 'અનુરાધા', 'જ્યેષ્ઠા', 'મૂળ', 'પૂર્વાષાઢા', 'ઉત્તરાષાઢા', 'શ્રવણ', 'ધનિષ્ઠા', 'શતભિષા', 'પૂર્વા ભાદ્રપદ', 'ઉત્તરા ભાદ્રપદ', 'રેવતી'],
    planet: { sun: 'સૂર્ય', moon: 'ચંદ્ર', mars: 'મંગળ', mercury: 'બુધ', jupiter: 'ગુરુ', venus: 'શુક્ર', saturn: 'શનિ', rahu: 'રાહુ', ketu: 'કેતુ', lagna: 'લગ્ન' },
    tithi: ['એકમ', 'બીજ', 'ત્રીજ', 'ચોથ', 'પાંચમ', 'છઠ', 'સાતમ', 'આઠમ', 'નોમ', 'દશમ', 'અગિયારસ', 'બારસ', 'તેરસ', 'ચૌદસ', 'પૂનમ', 'અમાસ'],
    paksha: { shukla: 'સુદ', krishna: 'વદ' },
    porutham: { dina: 'દિન', gana: 'ગણ', mahendra: 'માહેન્દ્ર', stree: 'સ્ત્રી દીર્ઘ', yoni: 'યોનિ', rasi: 'રાશિ', adhipati: 'રાશિ સ્વામી', vasya: 'વશ્ય', rajju: 'રજ્જુ', vedha: 'વેધ' }
  });
  for (const l of ['bn', 'or', 'gu', 'kn', 'te', 'hi', 'mr']) TERMS[l].rasiShort = TERMS[l].rasi;
  for (const l of Object.keys(TERMS)) if (!TERMS[l].rasiShort) TERMS[l].rasiShort = TERMS[l].rasi;

  root.I18N = { LANGS, UI, TERMS, translit };
})(typeof window !== 'undefined' ? window : globalThis);
