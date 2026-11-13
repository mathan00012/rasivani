/* RasiVani Rahu kalam finder: Rahu kalam, Yamagandam, Gulika kalam and Abhijit muhurtam for any date and place,
   from that place's own sunrise and sunset (day split into 8 equal parts).
   Core works in Node too (tools/extras.mjs prerenders today's times into the page for search engines). */
(function (root) {
  'use strict';
  const pad = (n) => String(n).padStart(2, '0');
  function hhmm(h, ampm) {
    if (h == null) return '–';
    h = ((h % 24) + 24) % 24;
    let H = Math.floor(h), M = Math.round((h - H) * 60);
    if (M === 60) { H = (H + 1) % 24; M = 0; }
    if (!ampm) return `${pad(H)}:${pad(M)}`;
    return `${((H + 11) % 12) + 1}:${pad(M)} ${H < 12 ? 'AM' : 'PM'}`;
  }
  // UTC offset (hours) of an IANA zone at local noon of a date; India is always 5.5
  function zoneOffset(zone, y, m, d) {
    if (!zone) return null;
    try {
      const p = {};
      new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        .formatToParts(new Date(Date.UTC(y, m - 1, d, 12))).forEach((x) => { p[x.type] = +x.value; });
      return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute) - Date.UTC(y, m - 1, d, 12)) / 900000) / 4;
    } catch (e) { return null; }
  }
  // One day. Returns hours in local time of the place.
  function day(y, m, d, lat, lon, tz) {
    const A = root.Astro;
    const p = A.panchang({ y, m, d, hh: 12, mm: 0, tz, lat, lon });
    const out = { y, m, d, weekday: p.weekday, sunrise: p.sunrise, sunset: p.sunset, tz };
    if (!p.kalam) return out; // polar day or night: no sunrise or sunset
    const mu = (p.sunset - p.sunrise) / 15; // 15 muhurtas in the daytime
    Object.assign(out, { rahu: p.kalam.rahu, yama: p.kalam.yama, gulika: p.kalam.gulika, abhijit: [p.sunrise + 7 * mu, p.sunrise + 8 * mu] });
    return out;
  }
  function week(y, m, d, lat, lon, tz, zone, n) {
    const out = [];
    for (let i = 0; i < (n || 7); i++) {
      const dt = new Date(Date.UTC(y, m - 1, d + i));
      const Y = dt.getUTCFullYear(), M = dt.getUTCMonth() + 1, D = dt.getUTCDate();
      const z = zone ? zoneOffset(zone, Y, M, D) : null;
      out.push(day(Y, M, D, lat, lon, z != null ? z : tz));
    }
    return out;
  }

  // ---------- Words (tool) ----------
  const TEXT = {
    en: { date: 'Date', place: 'Town or city', show: 'Show Rahu kalam', rahu: 'Rahu kalam', yama: 'Yamagandam', gulika: 'Gulika kalam', abhijit: 'Abhijit muhurtam',
      sunrise: 'Sunrise', sunset: 'Sunset', on_now: 'On now, ends at {t}', starts_in: 'Starts in {n}', over: 'Over for today', week: 'Next 7 days', day: 'Day',
      for_place: '{place} · {date}', avoid: 'Avoid starting new work', good: 'Good for any start', no_wed: 'Not used on Wednesdays', polar: 'No sunrise or sunset at this place on this date.',
      h: 'h', min: 'min', local: 'local time', share: 'Share on WhatsApp', share_line: 'Today\'s Rahu kalam for any place, free' },
    ta: { date: 'தேதி', place: 'ஊர் அல்லது நகரம்', show: 'ராகு காலம் காட்டு', rahu: 'ராகு காலம்', yama: 'எமகண்டம்', gulika: 'குளிகை', abhijit: 'அபிஜித் முகூர்த்தம்',
      sunrise: 'சூரிய உதயம்', sunset: 'சூரிய அஸ்தமனம்', on_now: 'இப்போது நடக்கிறது, {t} வரை', starts_in: 'இன்னும் {n}-ல் தொடங்கும்', over: 'இன்று முடிந்தது', week: 'அடுத்த 7 நாட்கள்', day: 'நாள்',
      for_place: '{place} · {date}', avoid: 'புதிய செயல் தொடங்க வேண்டாம்', good: 'எந்தத் தொடக்கத்துக்கும் நல்லது', no_wed: 'புதன்கிழமை கணக்கில் இல்லை', polar: 'இந்த இடத்தில் இந்த நாளில் சூரிய உதயம் அல்லது அஸ்தமனம் இல்லை.',
      h: 'மணி', min: 'நிமிடம்', local: 'உள்ளூர் நேரம்', share: 'WhatsApp-ல் பகிர்', share_line: 'எந்த ஊருக்கும் இன்றைய ராகு காலம், இலவசம்' },
    te: { date: 'తేదీ', place: 'ఊరు లేదా నగరం', show: 'రాహు కాలం చూపించు', rahu: 'రాహు కాలం', yama: 'యమగండం', gulika: 'గుళిక కాలం', abhijit: 'అభిజిత్ ముహూర్తం',
      sunrise: 'సూర్యోదయం', sunset: 'సూర్యాస్తమయం', on_now: 'ఇప్పుడు జరుగుతోంది, {t}కి ముగుస్తుంది', starts_in: 'ఇంకా {n}లో మొదలవుతుంది', over: 'ఈ రోజుకి ముగిసింది', week: 'తదుపరి 7 రోజులు', day: 'రోజు',
      for_place: '{place} · {date}', avoid: 'కొత్త పని మొదలుపెట్టకండి', good: 'ఏ ప్రారంభానికైనా మంచిది', no_wed: 'బుధవారం లెక్కలోకి తీసుకోరు', polar: 'ఈ ప్రదేశంలో ఈ తేదీన సూర్యోదయం లేదా అస్తమయం లేదు.',
      h: 'గం', min: 'ని', local: 'స్థానిక సమయం', share: 'WhatsAppలో పంచుకోండి', share_line: 'ఏ ఊరికైనా ఈరోజు రాహు కాలం, ఉచితం' },
    kn: { date: 'ದಿನಾಂಕ', place: 'ಊರು ಅಥವಾ ನಗರ', show: 'ರಾಹು ಕಾಲ ತೋರಿಸಿ', rahu: 'ರಾಹು ಕಾಲ', yama: 'ಯಮಗಂಡ', gulika: 'ಗುಳಿಕ ಕಾಲ', abhijit: 'ಅಭಿಜಿತ್ ಮುಹೂರ್ತ',
      sunrise: 'ಸೂರ್ಯೋದಯ', sunset: 'ಸೂರ್ಯಾಸ್ತ', on_now: 'ಈಗ ನಡೆಯುತ್ತಿದೆ, {t}ಕ್ಕೆ ಮುಗಿಯುತ್ತದೆ', starts_in: 'ಇನ್ನೂ {n}ದಲ್ಲಿ ಆರಂಭ', over: 'ಇಂದಿಗೆ ಮುಗಿದಿದೆ', week: 'ಮುಂದಿನ 7 ದಿನಗಳು', day: 'ದಿನ',
      for_place: '{place} · {date}', avoid: 'ಹೊಸ ಕೆಲಸ ಆರಂಭಿಸಬೇಡಿ', good: 'ಯಾವುದೇ ಆರಂಭಕ್ಕೆ ಒಳ್ಳೆಯದು', no_wed: 'ಬುಧವಾರ ಪರಿಗಣಿಸುವುದಿಲ್ಲ', polar: 'ಈ ಸ್ಥಳದಲ್ಲಿ ಈ ದಿನ ಸೂರ್ಯೋದಯ ಅಥವಾ ಸೂರ್ಯಾಸ್ತ ಇಲ್ಲ.',
      h: 'ಗಂ', min: 'ನಿ', local: 'ಸ್ಥಳೀಯ ಸಮಯ', share: 'WhatsApp ನಲ್ಲಿ ಹಂಚಿ', share_line: 'ಯಾವುದೇ ಊರಿನ ಇಂದಿನ ರಾಹು ಕಾಲ, ಉಚಿತ' },
    ml: { date: 'തീയതി', place: 'സ്ഥലം അല്ലെങ്കിൽ നഗരം', show: 'രാഹുകാലം കാണിക്കുക', rahu: 'രാഹുകാലം', yama: 'യമഗണ്ഡം', gulika: 'ഗുളികകാലം', abhijit: 'അഭിജിത് മുഹൂർത്തം',
      sunrise: 'സൂര്യോദയം', sunset: 'സൂര്യാസ്തമയം', on_now: 'ഇപ്പോൾ നടക്കുന്നു, {t}ന് തീരും', starts_in: 'ഇനി {n} കഴിഞ്ഞ് തുടങ്ങും', over: 'ഇന്നത്തേത് കഴിഞ്ഞു', week: 'അടുത്ത 7 ദിവസം', day: 'ദിവസം',
      for_place: '{place} · {date}', avoid: 'പുതിയ കാര്യം തുടങ്ങരുത്', good: 'ഏത് തുടക്കത്തിനും നല്ലത്', no_wed: 'ബുധനാഴ്ച കണക്കാക്കാറില്ല', polar: 'ഈ സ്ഥലത്ത് ഈ ദിവസം സൂര്യോദയമോ അസ്തമയമോ ഇല്ല.',
      h: 'മ', min: 'മി', local: 'പ്രാദേശിക സമയം', share: 'WhatsApp-ൽ പങ്കിടുക', share_line: 'ഏത് സ്ഥലത്തെയും ഇന്നത്തെ രാഹുകാലം, സൗജന്യം' },
    hi: { date: 'तारीख', place: 'शहर या कस्बा', show: 'राहु काल देखें', rahu: 'राहु काल', yama: 'यमगंड', gulika: 'गुलिक काल', abhijit: 'अभिजित मुहूर्त',
      sunrise: 'सूर्योदय', sunset: 'सूर्यास्त', on_now: 'अभी चल रहा है, {t} पर खत्म', starts_in: '{n} में शुरू', over: 'आज का खत्म', week: 'अगले 7 दिन', day: 'दिन',
      for_place: '{place} · {date}', avoid: 'नया काम शुरू न करें', good: 'हर शुभ शुरुआत के लिए अच्छा', no_wed: 'बुधवार को नहीं माना जाता', polar: 'इस जगह इस दिन सूर्योदय या सूर्यास्त नहीं होता।',
      h: 'घं', min: 'मि', local: 'स्थानीय समय', share: 'WhatsApp पर भेजें', share_line: 'किसी भी शहर का आज का राहु काल, मुफ़्त' }
  };
  const LANGS = Object.keys(TEXT);
  const tx = (lang, k) => (TEXT[lang] && TEXT[lang][k]) || TEXT.en[k];
  const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : ''));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const range = (r, ampm) => (r ? `${hhmm(r[0], ampm)} – ${hhmm(r[1], ampm)}` : '–');
  function dateLabel(lang, k, opts) {
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-IN' : `${lang}-IN`, Object.assign({ timeZone: 'UTC' }, opts || { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
      .format(new Date(Date.UTC(k.y, k.m - 1, k.d)));
  }
  const ampm = (lang) => lang === 'en' || lang === 'hi';

  // Today's card: big Rahu kalam, then Yamagandam, Gulika, Abhijit. `now` (hours, local) adds a live status line.
  function cardsHtml(lang, k, now) {
    if (!k.rahu) return `<p class="kl-polar">${esc(tx(lang, 'polar'))}</p>`;
    const ap = ampm(lang);
    const status = (r) => {
      if (now == null) return '';
      if (now >= r[0] && now < r[1]) return `<span class="kl-status on">${esc(fill(tx(lang, 'on_now'), { t: hhmm(r[1], ap) }))}</span>`;
      if (now < r[0]) { const mins = Math.round((r[0] - now) * 60); const n = mins >= 60 ? `${Math.floor(mins / 60)} ${tx(lang, 'h')} ${mins % 60} ${tx(lang, 'min')}` : `${mins} ${tx(lang, 'min')}`; return `<span class="kl-status soon">${esc(fill(tx(lang, 'starts_in'), { n }))}</span>`; }
      return `<span class="kl-status done">${esc(tx(lang, 'over'))}</span>`;
    };
    const card = (key, r, cls, note) => `<div class="kl-card ${cls}"><h3>${esc(tx(lang, key))}</h3><p class="kl-time">${esc(range(r, ap))}</p>${note ? `<p class="kl-note">${esc(note)}</p>` : ''}${status(r)}</div>`;
    return `<div class="kl-cards">
      ${card('rahu', k.rahu, 'kl-rahu', tx(lang, 'avoid'))}
      ${card('yama', k.yama, 'kl-yama', '')}
      ${card('gulika', k.gulika, 'kl-gulika', '')}
      ${card('abhijit', k.abhijit, 'kl-abhijit', k.weekday === 3 ? tx(lang, 'no_wed') : tx(lang, 'good'))}
    </div>
    <p class="kl-sun"><span>☀︎ ${esc(tx(lang, 'sunrise'))} <strong>${hhmm(k.sunrise, ap)}</strong></span><span>☾ ${esc(tx(lang, 'sunset'))} <strong>${hhmm(k.sunset, ap)}</strong></span></p>`;
  }
  function weekHtml(lang, days) {
    const ap = ampm(lang);
    const W = (root.I18N && root.I18N.TERMS && (root.I18N.TERMS[lang] || root.I18N.TERMS.en).weekday) || [];
    return `<h3 class="sub">${esc(tx(lang, 'week'))}</h3><div class="table-wrap"><table class="kl-week"><thead><tr><th scope="col">${esc(tx(lang, 'day'))}</th><th scope="col">${esc(tx(lang, 'rahu'))}</th><th scope="col">${esc(tx(lang, 'yama'))}</th><th scope="col">${esc(tx(lang, 'gulika'))}</th><th scope="col">${esc(tx(lang, 'sunrise'))}</th></tr></thead><tbody>${days.map((k) => `<tr><th scope="row">${esc(dateLabel(lang, k, { day: 'numeric', month: 'short' }))} · ${esc(W[k.weekday] || '')}</th><td class="num"><strong>${esc(range(k.rahu, ap))}</strong></td><td class="num">${esc(range(k.yama, ap))}</td><td class="num">${esc(range(k.gulika, ap))}</td><td class="num">${hhmm(k.sunrise, ap)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function resultHtml(lang, placeName, days, now) {
    const k = days[0];
    return `<p class="kl-for">${esc(fill(tx(lang, 'for_place'), { place: placeName, date: dateLabel(lang, k) }))}</p>${cardsHtml(lang, k, now)}${weekHtml(lang, days)}`;
  }

  // ---------- Browser page ----------
  function initPage() {
    const RV = root.RV; const $ = (s) => document.querySelector(s);
    const lang = document.body.dataset.lang;
    const form = $('#kalam-form'); if (!form || !RV) return;
    $('#kalam-place').innerHTML = RV.placeField('k', 'city');
    RV.wirePlace('k');
    // A city page starts on its own city, not on the visitor's last place
    const city = form.dataset.city ? JSON.parse(form.dataset.city) : null;
    if (city && RV.setPlace) RV.setPlace('k', city, false);
    // First visit with no saved place: start on this language's main city
    let saved = null; try { saved = localStorage.getItem('gv-place'); } catch (e) { /* private mode */ }
    if (!city && !saved && form.dataset.default && RV.setPlace) RV.setPlace('k', JSON.parse(form.dataset.default), false);
    const di = $('#k-date');
    const todayAt = (tz) => { const n = new Date(Date.now() + tz * 3600000); return { y: n.getUTCFullYear(), m: n.getUTCMonth() + 1, d: n.getUTCDate(), h: n.getUTCHours() + n.getUTCMinutes() / 60 }; };
    function run(useToday) {
      const p = RV.readPlace('k'); const err = $('#kalam-error');
      if (!p) { err.textContent = RV.t('error_fill'); err.hidden = false; return; }
      err.hidden = true;
      let tz = p.tz;
      const t0 = todayAt(p.zone ? (zoneOffset(p.zone, new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, new Date().getUTCDate()) ?? tz) : tz);
      if (useToday || !di.value) di.value = `${t0.y}-${pad(t0.m)}-${pad(t0.d)}`;
      const [y, m, d] = di.value.split('-').map(Number);
      if (p.zone) { const z = zoneOffset(p.zone, y, m, d); if (z != null) tz = z; }
      const days = week(y, m, d, p.lat, p.lon, tz, p.zone, 7);
      const isToday = y === t0.y && m === t0.m && d === t0.d;
      const out = $('#kalam-result');
      out.innerHTML = resultHtml(lang, p.name, days, isToday ? t0.h : null) + `<div class="actions"><a class="btn-wa" href="https://wa.me/?text=${encodeURIComponent(`${tx(lang, 'rahu')} · ${p.name} · ${dateLabel(lang, days[0])}: ${range(days[0].rahu, ampm(lang))}\n${tx(lang, 'yama')}: ${range(days[0].yama, ampm(lang))}\n${tx(lang, 'gulika')}: ${range(days[0].gulika, ampm(lang))}\n\n${tx(lang, 'share_line')}: ${location.href.split('#')[0]}`)}" target="_blank" rel="noopener">${esc(tx(lang, 'share'))}</a></div>`;
      out.hidden = false;
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); run(false); });
    run(true);
    // keep the live status fresh while the page is open
    setInterval(() => { if (document.visibilityState === 'visible' && document.querySelector('.kl-status')) run(false); }, 60000);
  }
  if (typeof document !== 'undefined') { root.RVExtra = root.RVExtra || {}; root.RVExtra.kalam = initPage; }

  root.Kalam = { day, week, zoneOffset, hhmm, TEXT, LANGS, text: tx, cardsHtml, weekHtml, resultHtml, dateLabel, range, ampm };
})(typeof window !== 'undefined' ? window : globalThis);
