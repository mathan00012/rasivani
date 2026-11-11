/* RasiVani place finder: any city, town, village, pincode, ZIP or postcode in the world.
   1. Offline index (places/): India Post areas + pincodes, GeoNames towns worldwide, US ZIPs, UK postcodes,
      Canada FSAs. Instant, works without network, every row carries its time zone.
   2. Online, only when the offline index has little to offer: Photon (OpenStreetMap, komoot) as you type,
      and Nominatim (OpenStreetMap) only when the visitor taps "Search more places" (its usage policy
      forbids search-as-you-type).
   3. The visitor's own location (browser GPS) and a map to drop a pin (Leaflet + OpenStreetMap tiles).
   Time zone of any point: tz-lookup (CC0), loaded only when needed. India always uses IST (UTC+5:30). */
(function () {
  'use strict';
  const ROOT = new URL('../', (document.currentScript && document.currentScript.src) || location.href).href;
  const PHOTON = 'https://photon.komoot.io';
  const NOMINATIM = 'https://nominatim.openstreetmap.org';
  const COUNTRY = { US: 'USA', GB: 'UK', AE: 'UAE', IN: 'India' };
  const US_ABBR = { Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC',
    Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
    Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI',
    'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY' };
  const PREFER = { IN: 120, US: 90, GB: 90, CA: 50, AU: 50, AE: 40, SG: 40, MY: 30, LK: 30, NZ: 30 };

  // ---------- small helpers ----------
  const RESERVED = new Set(['con', 'aux', 'prn', 'nul']); // Windows can't store con.json etc.: the build writes con_.json
  const fold = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const compactCode = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const INDIC = /[ऀ-෿]/;
  const cache = new Map();
  function getJSON(url) {
    if (!cache.has(url)) cache.set(url, fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => { cache.delete(url); return null; }));
    return cache.get(url);
  }
  const DATA_V = '2'; // matches places/version.json; new address = no stale copy of the old index from the browser cache
  const shard = (p) => getJSON(ROOT + 'places/' + p + '?v=' + DATA_V).then((x) => x || []);
  let split = null;
  const splitSet = () => (split = split || getJSON(ROOT + 'places/n/_split.json?v=' + DATA_V).then((a) => new Set(a || [])));
  function loadScript(src) {
    return new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s); });
  }
  function loadCss(href) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); }

  // ---------- time zone of a point ----------
  let tzReady = null;
  async function zoneAt(lat, lon, cc) {
    if (cc === 'IN') return { tz: 5.5 };
    tzReady = tzReady || loadScript(ROOT + 'js/vendor/tz.js');
    try { await tzReady; } catch (e) { tzReady = null; }
    let zone = null;
    try { zone = window.tzlookup(lat, lon); } catch (e) { /* ocean or bad point */ }
    if (zone === 'Asia/Kolkata' || zone === 'Asia/Calcutta') return { tz: 5.5 };
    return zone ? { zone, tz: offsetNow(zone) } : { tz: Math.round(lon / 15 * 2) / 2 };
  }
  function offsetNow(zone) {
    try {
      const p = {}; new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        .formatToParts(new Date()).forEach((x) => { p[x.type] = +x.value; });
      const now = new Date(); now.setSeconds(0, 0);
      return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute) - now.getTime()) / 900000) / 4;
    } catch (e) { return 0; }
  }

  // ---------- offline rows -> places ----------
  // row: [name, region, cc, postal, lat, lon, zone ('' = India), score, other spelling?]
  function fromRow(r) {
    const p = { name: r[0], sub: r[3] ? `${r[1]} ${r[3]}` : r[1], lat: r[4], lon: r[5], cc: r[2] };
    if (r[6]) { p.zone = r[6]; p.tz = offsetNow(r[6]); } else p.tz = 5.5;
    if (r[8] && fold(r[8]) !== fold(r[0])) p.aka = r[8];
    return p;
  }
  const key = (p) => fold(p.name + '|' + p.sub);
  function uniq(list) { const s = new Set(); return list.filter((p) => { const k = key(p); if (s.has(k)) return false; s.add(k); return true; }); }

  // "12.97, 77.59" or "40.71 N 74.01 W"
  function coordsQuery(q) {
    const m = q.trim().toUpperCase().match(/^(-?\d{1,2}(?:\.\d+)?)\s*°?\s*([NS])?\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)\s*°?\s*([EW])?$/);
    if (!m) return null;
    let lat = +m[1], lon = +m[3];
    if (m[2] === 'S') lat = -Math.abs(lat); if (m[4] === 'W') lon = -Math.abs(lon);
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180 || (!m[2] && !m[4] && !/\./.test(q))) return null;
    return { lat, lon };
  }

  async function search(q) {
    const raw = String(q || '').trim(); if (!raw) return [];
    const c = coordsQuery(raw);
    if (c) { const z = await zoneAt(c.lat, c.lon); return [{ name: `${c.lat.toFixed(4)}, ${c.lon.toFixed(4)}`, sub: '', lat: c.lat, lon: c.lon, ...z }]; }
    const code = compactCode(raw);
    if (/\d/.test(raw) && /^[A-Z]{0,2}\d/.test(code) && (code.length >= 3 || /^[A-Z]{1,2}\d$/.test(code))) return postal(code, raw);
    if (INDIC.test(raw)) return indic(raw);
    return byName(raw);
  }

  async function postal(code, raw) {
    const rows = await shard(`p/${code.slice(0, 3)}.json`);
    const spaced = String(raw).trim().toUpperCase().replace(/\s+/g, ' ');
    const hits = [];
    for (const r of rows) {
      const k = compactCode(r[3]);
      let s;
      if (k.startsWith(code)) s = k === code ? 3 : 1;
      else if (code.startsWith(k) && k.length >= 3 && /[A-Z]/.test(k)) s = 2 + k.length / 10; // "LE1 6XX" -> UK sector "LE1 6", "M5V 3L9" -> Canada "M5V"
      else continue;
      // The visitor's own spacing tells UK "LE1 6" (Leicester) from "LE16" (Market Harborough).
      if (/\s/.test(spaced)) s += r[3].split(' ')[0] === spaced.split(' ')[0] ? 1 : -0.5;
      hits.push([r, s]);
    }
    const digits = /^\d+$/.test(code);
    const home = code.length === 6 ? 'IN' : 'US';
    hits.sort((a, b) => b[1] - a[1] || (digits ? (a[0][2] === home ? -1 : 0) - (b[0][2] === home ? -1 : 0) : 0) || b[0][7] - a[0][7]);
    return uniq(hits.slice(0, 40).map((h) => fromRow(h[0]))).slice(0, 10);
  }

  async function indic(raw) {
    // Compare letters only (vowel signs and virama dropped) so a Telugu spelling ending in -d finds one ending in -du.
    const bare = (x) => x.normalize('NFC').replace(/[\s\p{M}]/gu, '');
    const q = bare(raw);
    const rows = await shard(`n/u${raw.trim().normalize('NFC').codePointAt(0).toString(16).padStart(4, '0')}.json`);
    const hit = rows.filter((r) => { if (!r[8]) return false; const a = bare(r[8]); return a.startsWith(q) || (q.startsWith(a) && a.length >= 3); });
    hit.sort((a, b) => (bare(b[8]) === q) - (bare(a[8]) === q) || b[7] - a[7]);
    return uniq(hit.map(fromRow)).slice(0, 10);
  }

  async function byName(raw) {
    const f = fold(raw), flat = f.replace(/ /g, '');
    if (flat.length < 2) return [];
    const sp = await splitSet();
    const k2 = flat.slice(0, 2);
    if (sp.has(k2) && flat.length < 3) return [];
    const k = sp.has(k2) ? flat.slice(0, 3) : k2;
    const rows = await shard(`n/${RESERVED.has(k) ? k + '_' : k}.json`);
    const words = f.split(' ');
    const scored = [];
    for (const r of rows) {
      if (r[8] && fold(r[0]).startsWith(words[0])) continue; // the row under its own name matches anyway
      const nm = fold(r[8] || r[0]);
      let s;
      if (nm === f) s = 3000;
      else if (nm.startsWith(f)) s = 2000;
      else if (nm.startsWith(words[0]) && words.length > 1) {
        const hay = ' ' + fold(`${r[0]} ${r[1]} ${r[2]} ${COUNTRY[r[2]] || ''} ${r[3]} ${r[2] === 'US' ? US_ABBR[r[1].split(', ')[0]] || '' : ''}`) + ' ';
        if (!words.slice(1).every((w) => hay.includes(' ' + w))) continue;
        s = 2500;
      } else continue;
      scored.push([r, s + r[7] + (PREFER[r[2]] || 0)]);
    }
    scored.sort((a, b) => b[1] - a[1]);
    return uniq(scored.slice(0, 60).map((x) => fromRow(x[0]))).slice(0, 10);
  }

  // ---------- online (OpenStreetMap) ----------
  const onlineCache = new Map();
  // parts: smallest to largest, the country name last -> "Manhattan, New York, USA"
  function regionOf(parts, name, cc) {
    const country = parts[parts.length - 1], rest = [];
    for (const x of parts.slice(0, -1)) if (x && x !== name && x !== country && !rest.includes(x)) rest.push(x);
    const keep = rest.length > 2 ? [rest[0], rest[rest.length - 1]] : rest;
    const c = COUNTRY[cc] || country;
    return keep.concat(c ? [c] : []).join(', ');
  }
  async function online(q) {
    const raw = String(q || '').trim(); if (raw.length < 3) return [];
    if (onlineCache.has(raw)) return onlineCache.get(raw);
    let out = [];
    try {
      const r = await fetch(`${PHOTON}/api/?q=${encodeURIComponent(raw)}&limit=8&lang=en`);
      const j = r.ok ? await r.json() : null;
      for (const ft of (j && j.features) || []) {
        const p = ft.properties || {}, [lon, lat] = ft.geometry.coordinates, cc = (p.countrycode || '').toUpperCase();
        const name = p.name || [p.housenumber, p.street].filter(Boolean).join(' ') || p.postcode || p.city; if (!name) continue;
        const region = regionOf([p.street && p.name ? p.street : '', p.district || p.locality, p.city, p.county, p.state, p.country], name, cc);
        out.push({ name, sub: p.postcode && p.postcode !== name ? `${region} ${p.postcode}` : region, lat, lon, cc, web: true });
      }
    } catch (e) { /* offline or blocked: the offline list still works */ }
    out = await withZones(uniq(out));
    onlineCache.set(raw, out);
    return out;
  }
  // Nominatim: only on a tap ("Search more places"), never while typing.
  async function deep(q) {
    const raw = String(q || '').trim(); if (!raw) return [];
    const code = compactCode(raw);
    const lang = (document.documentElement.lang || 'en') + ',en';
    const url = /\d/.test(raw) && /^[A-Z]{0,2}\d[A-Z0-9]{1,8}$/.test(code) && !/\s\S+\s/.test(raw)
      ? `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=10&postalcode=${encodeURIComponent(raw)}&accept-language=${lang}`
      : `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=10&q=${encodeURIComponent(raw)}&accept-language=${lang}`;
    let out = [];
    try {
      let r = await fetch(url), j = r.ok ? await r.json() : [];
      if (!j.length && url.includes('postalcode=')) { r = await fetch(url.replace('postalcode=', 'q=')); j = r.ok ? await r.json() : []; }
      for (const x of j) {
        const a = x.address || {}, cc = (a.country_code || '').toUpperCase();
        const name = x.name || a.postcode || (x.display_name || '').split(',')[0];
        const region = regionOf([a.suburb, a.city || a.town || a.village, a.county || a.state_district, a.state, a.country], name, cc);
        out.push({ name, sub: a.postcode && a.postcode !== name ? `${region} ${a.postcode}` : region, lat: +x.lat, lon: +x.lon, cc, web: true });
      }
    } catch (e) { /* network */ }
    return withZones(uniq(out));
  }
  async function withZones(list) { for (const p of list) Object.assign(p, await zoneAt(p.lat, p.lon, p.cc)); return list; }

  async function nameFor(lat, lon) {
    try {
      const r = await fetch(`${PHOTON}/reverse?lat=${lat}&lon=${lon}&lang=en&limit=1`);
      const j = r.ok ? await r.json() : null, ft = j && j.features && j.features[0];
      if (ft) {
        const p = ft.properties, cc = (p.countrycode || '').toUpperCase();
        const name = p.city || p.town || p.village || p.district || p.locality || p.name || p.county || p.state;
        return { name: name || '', sub: regionOf([p.district || p.locality, p.county, p.state, p.country], name, cc) + (p.postcode ? ' ' + p.postcode : ''), cc };
      }
    } catch (e) { /* network */ }
    return null;
  }
  async function placeAt(lat, lon, fallbackName) {
    lat = Math.round(lat * 1e4) / 1e4; lon = Math.round(lon * 1e4) / 1e4;
    const n = await nameFor(lat, lon);
    const cc = n && n.cc;
    const z = await zoneAt(lat, lon, cc);
    return { name: (n && n.name) || fallbackName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`, sub: (n && n.sub) || '', lat, lon, cc, ...z };
  }

  // ---------- live location ----------
  function here() {
    return new Promise((ok, fail) => {
      if (!navigator.geolocation) { fail(new Error('unsupported')); return; }
      navigator.geolocation.getCurrentPosition((pos) => ok(placeAt(pos.coords.latitude, pos.coords.longitude)), fail,
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 });
    });
  }

  // ---------- map picker ----------
  let leaflet = null;
  function loadLeaflet() {
    if (!leaflet) { loadCss(ROOT + 'js/vendor/leaflet/leaflet.css'); leaflet = loadScript(ROOT + 'js/vendor/leaflet/leaflet.js').catch((e) => { leaflet = null; throw e; }); }
    return leaflet;
  }
  async function pickOnMap(start, text) {
    await loadLeaflet();
    const L = window.L;
    return new Promise((done) => {
      const dlg = document.createElement('dialog');
      dlg.className = 'map-dialog';
      dlg.innerHTML = `<form method="dialog" class="map-box">
        <h3>${text.title}</h3><p class="muted">${text.hint}</p>
        <div class="map-search"><input type="search" placeholder="${text.searchHint}" aria-label="${text.searchHint}"><button type="button" class="btn-secondary">${text.find}</button></div>
        <div class="map-canvas"></div>
        <p class="map-at" aria-live="polite"></p>
        <div class="map-actions"><button value="cancel" class="btn-secondary">${text.cancel}</button><button value="ok" class="btn">${text.use}</button></div>
      </form>`;
      document.body.appendChild(dlg);
      const at = dlg.querySelector('.map-at');
      const lat0 = start && start.lat != null ? start.lat : 22.5, lon0 = start && start.lon != null ? start.lon : 79;
      const map = L.map(dlg.querySelector('.map-canvas'), { worldCopyJump: true }).setView([lat0, lon0], start && start.lat != null ? 11 : 4);
      map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
      const pin = L.marker([lat0, lon0], { draggable: true, autoPan: true }).addTo(map);
      const show = () => { const p = pin.getLatLng().wrap(); at.textContent = `${Math.abs(p.lat).toFixed(4)}°${p.lat >= 0 ? 'N' : 'S'}, ${Math.abs(p.lng).toFixed(4)}°${p.lng >= 0 ? 'E' : 'W'}`; };
      map.on('click', (e) => { pin.setLatLng(e.latlng); show(); });
      pin.on('dragend', show); show();
      const input = dlg.querySelector('.map-search input');
      const find = async () => {
        const q = input.value.trim(); if (!q) return;
        let r = await search(q); if (!r.length) r = await online(q); if (!r.length) r = await deep(q);
        if (r[0]) { pin.setLatLng([r[0].lat, r[0].lon]); map.setView([r[0].lat, r[0].lon], 13); show(); }
        else at.textContent = text.none;
      };
      dlg.querySelector('.map-search button').addEventListener('click', find);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); find(); } });
      dlg.addEventListener('close', async () => {
        const p = pin.getLatLng().wrap();
        const ok = dlg.returnValue === 'ok';
        map.remove(); dlg.remove();
        done(ok ? await placeAt(p.lat, p.lng) : null);
      });
      dlg.showModal();
      setTimeout(() => map.invalidateSize(), 50);
    });
  }

  // ---------- words (kept here so the place box carries its own text) ----------
  const TEXT = {
    en: { hint: 'City, town, area, pincode, ZIP or postcode', here: 'Use my location', map: 'Pick on map', more: 'Search more places for', web: 'map', locating: 'Finding your location…', denied: 'Location is blocked. Allow it in the browser, or type the place.', failed: 'Could not get your location. Please type the place.', searching: 'Searching…', none: 'No match. Try the nearest town, a pincode or postcode, or pick on the map.', title: 'Pick the birth place', mhint: 'Tap the map or drag the pin to the exact spot. Zoom in for accuracy.', find: 'Find', use: 'Use this place', cancel: 'Cancel', aka: 'also called' },
    hi: { hint: 'शहर, कस्बा, इलाका, पिनकोड या ZIP/पोस्टकोड', here: 'मेरी लोकेशन लें', map: 'नक्शे पर चुनें', more: 'और जगहें खोजें:', web: 'नक्शा', locating: 'आपकी लोकेशन खोज रहे हैं…', denied: 'लोकेशन बंद है। ब्राउज़र में अनुमति दें या जगह का नाम लिखें।', failed: 'लोकेशन नहीं मिली। कृपया जगह का नाम लिखें।', searching: 'खोज रहे हैं…', none: 'कोई जगह नहीं मिली। पास का शहर, पिनकोड लिखें या नक्शे पर चुनें।', title: 'जन्म स्थान चुनें', mhint: 'नक्शे पर टैप करें या पिन खींचकर सही जगह रखें। सटीकता के लिए ज़ूम करें।', find: 'खोजें', use: 'यह जगह लें', cancel: 'रद्द करें', aka: 'दूसरा नाम' },
    ta: { hint: 'ஊர், பகுதி, பின்கோடு அல்லது ZIP/போஸ்ட்கோடு', here: 'என் இருப்பிடம்', map: 'வரைபடத்தில் தேர்வு', more: 'மேலும் இடங்களைத் தேடு:', web: 'வரைபடம்', locating: 'உங்கள் இருப்பிடத்தைக் கண்டறிகிறது…', denied: 'இருப்பிட அனுமதி இல்லை. உலாவியில் அனுமதிக்கவும், அல்லது ஊர் பெயரை உள்ளிடவும்.', failed: 'இருப்பிடம் கிடைக்கவில்லை. ஊர் பெயரை உள்ளிடவும்.', searching: 'தேடுகிறது…', none: 'இடம் கிடைக்கவில்லை. அருகிலுள்ள ஊர், பின்கோடு முயலவும், அல்லது வரைபடத்தில் தேர்வு செய்யவும்.', title: 'பிறந்த இடத்தைத் தேர்வு செய்யவும்', mhint: 'வரைபடத்தில் தொடவும் அல்லது முள்ளை இழுத்துச் சரியான இடத்தில் வைக்கவும். துல்லியத்துக்குப் பெரிதாக்கவும்.', find: 'தேடு', use: 'இந்த இடம் சரி', cancel: 'ரத்து', aka: 'மறுபெயர்' },
    te: { hint: 'ఊరు, ప్రాంతం, పిన్‌కోడ్ లేదా ZIP/పోస్ట్‌కోడ్', here: 'నా లొకేషన్', map: 'మ్యాప్‌లో ఎంచుకోండి', more: 'మరిన్ని స్థలాలు వెతకండి:', web: 'మ్యాప్', locating: 'మీ లొకేషన్ కనుగొంటోంది…', denied: 'లొకేషన్ అనుమతి లేదు. బ్రౌజర్‌లో అనుమతించండి, లేదా ఊరి పేరు టైప్ చేయండి.', failed: 'లొకేషన్ దొరకలేదు. ఊరి పేరు టైప్ చేయండి.', searching: 'వెతుకుతోంది…', none: 'స్థలం దొరకలేదు. దగ్గరి ఊరు, పిన్‌కోడ్ ప్రయత్నించండి, లేదా మ్యాప్‌లో ఎంచుకోండి.', title: 'జన్మ స్థలం ఎంచుకోండి', mhint: 'మ్యాప్‌పై తాకండి లేదా పిన్‌ను సరైన చోటుకి లాగండి. ఖచ్చితత్వానికి జూమ్ చేయండి.', find: 'వెతుకు', use: 'ఈ స్థలం', cancel: 'రద్దు', aka: 'మరో పేరు' },
    kn: { hint: 'ಊರು, ಪ್ರದೇಶ, ಪಿನ್‌ಕೋಡ್ ಅಥವಾ ZIP/ಪೋಸ್ಟ್‌ಕೋಡ್', here: 'ನನ್ನ ಸ್ಥಳ', map: 'ನಕ್ಷೆಯಲ್ಲಿ ಆರಿಸಿ', more: 'ಇನ್ನಷ್ಟು ಸ್ಥಳ ಹುಡುಕಿ:', web: 'ನಕ್ಷೆ', locating: 'ನಿಮ್ಮ ಸ್ಥಳ ಹುಡುಕುತ್ತಿದೆ…', denied: 'ಸ್ಥಳ ಅನುಮತಿ ಇಲ್ಲ. ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಅನುಮತಿಸಿ, ಅಥವಾ ಊರಿನ ಹೆಸರು ಟೈಪ್ ಮಾಡಿ.', failed: 'ಸ್ಥಳ ಸಿಗಲಿಲ್ಲ. ಊರಿನ ಹೆಸರು ಟೈಪ್ ಮಾಡಿ.', searching: 'ಹುಡುಕುತ್ತಿದೆ…', none: 'ಸ್ಥಳ ಸಿಗಲಿಲ್ಲ. ಹತ್ತಿರದ ಊರು, ಪಿನ್‌ಕೋಡ್ ಪ್ರಯತ್ನಿಸಿ, ಅಥವಾ ನಕ್ಷೆಯಲ್ಲಿ ಆರಿಸಿ.', title: 'ಜನ್ಮ ಸ್ಥಳ ಆರಿಸಿ', mhint: 'ನಕ್ಷೆಯನ್ನು ತಟ್ಟಿ ಅಥವಾ ಪಿನ್ ಅನ್ನು ಸರಿಯಾದ ಜಾಗಕ್ಕೆ ಎಳೆಯಿರಿ. ನಿಖರತೆಗೆ ಜೂಮ್ ಮಾಡಿ.', find: 'ಹುಡುಕಿ', use: 'ಈ ಸ್ಥಳ ಬಳಸಿ', cancel: 'ರದ್ದು', aka: 'ಇನ್ನೊಂದು ಹೆಸರು' },
    ml: { hint: 'സ്ഥലം, പ്രദേശം, പിൻകോഡ് അല്ലെങ്കിൽ ZIP/പോസ്റ്റ്‌കോഡ്', here: 'എന്റെ ലൊക്കേഷൻ', map: 'മാപ്പിൽ തിരഞ്ഞെടുക്കുക', more: 'കൂടുതൽ സ്ഥലങ്ങൾ തിരയുക:', web: 'മാപ്പ്', locating: 'നിങ്ങളുടെ ലൊക്കേഷൻ കണ്ടെത്തുന്നു…', denied: 'ലൊക്കേഷൻ അനുമതിയില്ല. ബ്രൗസറിൽ അനുവദിക്കുക, അല്ലെങ്കിൽ സ്ഥലപ്പേര് ടൈപ്പ് ചെയ്യുക.', failed: 'ലൊക്കേഷൻ കിട്ടിയില്ല. സ്ഥലപ്പേര് ടൈപ്പ് ചെയ്യുക.', searching: 'തിരയുന്നു…', none: 'സ്ഥലം കണ്ടെത്തിയില്ല. അടുത്തുള്ള പട്ടണം, പിൻകോഡ് നോക്കുക, അല്ലെങ്കിൽ മാപ്പിൽ തിരഞ്ഞെടുക്കുക.', title: 'ജനനസ്ഥലം തിരഞ്ഞെടുക്കുക', mhint: 'മാപ്പിൽ തൊടുക അല്ലെങ്കിൽ പിൻ ശരിയായ സ്ഥലത്തേക്ക് വലിക്കുക. കൃത്യതയ്ക്ക് സൂം ചെയ്യുക.', find: 'തിരയുക', use: 'ഈ സ്ഥലം', cancel: 'റദ്ദാക്കുക', aka: 'മറ്റൊരു പേര്' },
    mr: { hint: 'शहर, गाव, परिसर, पिनकोड किंवा ZIP/पोस्टकोड', here: 'माझे लोकेशन', map: 'नकाशावर निवडा', more: 'आणखी ठिकाणे शोधा:', web: 'नकाशा', locating: 'तुमचे लोकेशन शोधत आहे…', denied: 'लोकेशन बंद आहे. ब्राउझरमध्ये परवानगी द्या, किंवा ठिकाणाचे नाव लिहा.', failed: 'लोकेशन मिळाले नाही. ठिकाणाचे नाव लिहा.', searching: 'शोधत आहे…', none: 'ठिकाण सापडले नाही. जवळचे शहर, पिनकोड लिहा किंवा नकाशावर निवडा.', title: 'जन्मस्थान निवडा', mhint: 'नकाशावर टॅप करा किंवा पिन ओढून नेमक्या जागी ठेवा. अचूकतेसाठी झूम करा.', find: 'शोधा', use: 'हे ठिकाण घ्या', cancel: 'रद्द करा', aka: 'दुसरे नाव' },
    bn: { hint: 'শহর, এলাকা, পিনকোড বা ZIP/পোস্টকোড', here: 'আমার লোকেশন', map: 'ম্যাপে বেছে নিন', more: 'আরও জায়গা খুঁজুন:', web: 'ম্যাপ', locating: 'আপনার লোকেশন খোঁজা হচ্ছে…', denied: 'লোকেশন বন্ধ। ব্রাউজারে অনুমতি দিন, বা জায়গার নাম লিখুন।', failed: 'লোকেশন পাওয়া যায়নি। জায়গার নাম লিখুন।', searching: 'খোঁজা হচ্ছে…', none: 'জায়গা পাওয়া যায়নি। কাছের শহর, পিনকোড লিখুন বা ম্যাপে বেছে নিন।', title: 'জন্মস্থান বেছে নিন', mhint: 'ম্যাপে ট্যাপ করুন বা পিন টেনে সঠিক জায়গায় রাখুন। নিখুঁত করতে জুম করুন।', find: 'খুঁজুন', use: 'এই জায়গা নিন', cancel: 'বাতিল', aka: 'অন্য নাম' },
    gu: { hint: 'શહેર, ગામ, વિસ્તાર, પિનકોડ અથવા ZIP/પોસ્ટકોડ', here: 'મારું લોકેશન', map: 'નકશા પર પસંદ કરો', more: 'વધુ સ્થળો શોધો:', web: 'નકશો', locating: 'તમારું લોકેશન શોધી રહ્યા છીએ…', denied: 'લોકેશન બંધ છે. બ્રાઉઝરમાં મંજૂરી આપો, અથવા સ્થળનું નામ લખો.', failed: 'લોકેશન મળ્યું નહીં. સ્થળનું નામ લખો.', searching: 'શોધી રહ્યા છીએ…', none: 'સ્થળ મળ્યું નહીં. નજીકનું શહેર, પિનકોડ લખો અથવા નકશા પર પસંદ કરો.', title: 'જન્મસ્થળ પસંદ કરો', mhint: 'નકશા પર ટૅપ કરો અથવા પિન ખેંચીને ચોક્કસ જગ્યાએ મૂકો. ચોકસાઈ માટે ઝૂમ કરો.', find: 'શોધો', use: 'આ સ્થળ લો', cancel: 'રદ કરો', aka: 'બીજું નામ' },
    or: { hint: 'ସହର, ଗାଁ, ଅଞ୍ଚଳ, ପିନକୋଡ ବା ZIP/ପୋଷ୍ଟକୋଡ', here: 'ମୋ ଲୋକେସନ', map: 'ମାନଚିତ୍ରରେ ବାଛନ୍ତୁ', more: 'ଅଧିକ ସ୍ଥାନ ଖୋଜନ୍ତୁ:', web: 'ମାନଚିତ୍ର', locating: 'ଆପଣଙ୍କ ଲୋକେସନ ଖୋଜୁଛି…', denied: 'ଲୋକେସନ ବନ୍ଦ ଅଛି। ବ୍ରାଉଜରରେ ଅନୁମତି ଦିଅନ୍ତୁ, ବା ସ୍ଥାନର ନାମ ଲେଖନ୍ତୁ।', failed: 'ଲୋକେସନ ମିଳିଲା ନାହିଁ। ସ୍ଥାନର ନାମ ଲେଖନ୍ତୁ।', searching: 'ଖୋଜୁଛି…', none: 'ସ୍ଥାନ ମିଳିଲା ନାହିଁ। ପାଖ ସହର, ପିନକୋଡ ଲେଖନ୍ତୁ ବା ମାନଚିତ୍ରରେ ବାଛନ୍ତୁ।', title: 'ଜନ୍ମସ୍ଥାନ ବାଛନ୍ତୁ', mhint: 'ମାନଚିତ୍ରରେ ଟାପ୍ କରନ୍ତୁ ବା ପିନ୍ ଟାଣି ଠିକ୍ ସ୍ଥାନରେ ରଖନ୍ତୁ। ସଠିକତା ପାଇଁ ଜୁମ୍ କରନ୍ତୁ।', find: 'ଖୋଜନ୍ତୁ', use: 'ଏହି ସ୍ଥାନ', cancel: 'ବାତିଲ', aka: 'ଅନ୍ୟ ନାମ' }
  };
  const text = (lang, k) => (TEXT[lang] && TEXT[lang][k]) || TEXT.en[k];

  window.Places = { search, online, deep, here, pickOnMap, placeAt, zoneAt, text, fold };
})();
