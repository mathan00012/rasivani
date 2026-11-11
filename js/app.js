/* RasiVani page logic: language, places, chart drawing, and the three tools. */
(function () {
  'use strict';
  const { LANGS, UI, TERMS } = window.I18N;
  const A = window.Astro;
  const SCRIPT_BASE = (document.currentScript && document.currentScript.src) || location.href;
  // Pin the page's base to an absolute address. Changing language rewrites the address bar
  // (/ -> /ta/, history.replaceState); without this, relative links on a page with no <base>
  // would then resolve under /ta/ (rasi-palan/ta/ -> /ta/rasi-palan/ta/, a 404).
  {
    const abs = document.baseURI, b = document.querySelector('base[href]');
    if (b) b.setAttribute('href', abs);
    else { const nb = document.createElement('base'); nb.href = abs; document.head.prepend(nb); }
  }
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  // ---------- Places ----------
  const CITIES = [
    ['Chennai', 13.0827, 80.2707], ['Madurai', 9.9252, 78.1198], ['Coimbatore', 11.0168, 76.9558], ['Tiruchirappalli', 10.7905, 78.7047],
    ['Tirunelveli', 8.7139, 77.7567], ['Salem', 11.6643, 78.146], ['Puducherry', 11.9416, 79.8083], ['Bengaluru', 12.9716, 77.5946],
    ['Mysuru', 12.2958, 76.6394], ['Mangaluru', 12.9141, 74.856], ['Hubballi', 15.3647, 75.124], ['Hyderabad', 17.385, 78.4867],
    ['Visakhapatnam', 17.6868, 83.2185], ['Vijayawada', 16.5062, 80.648], ['Tirupati', 13.6288, 79.4192], ['Warangal', 17.9689, 79.5941],
    ['Thiruvananthapuram', 8.5241, 76.9366], ['Kochi', 9.9312, 76.2673], ['Kozhikode', 11.2588, 75.7804], ['Thrissur', 10.5276, 76.2144],
    ['Bhubaneswar', 20.2961, 85.8245], ['Cuttack', 20.4625, 85.8828], ['Puri', 19.8135, 85.8312], ['Kolkata', 22.5726, 88.3639],
    ['Mumbai', 19.076, 72.8777], ['Pune', 18.5204, 73.8567], ['Nagpur', 21.1458, 79.0882], ['Ahmedabad', 23.0225, 72.5714],
    ['Surat', 21.1702, 72.8311], ['Vadodara', 22.3072, 73.1812], ['New Delhi', 28.6139, 77.209], ['Jaipur', 26.9124, 75.7873],
    ['Lucknow', 26.8467, 80.9462], ['Varanasi', 25.3176, 82.9739], ['Patna', 25.5941, 85.1376], ['Bhopal', 23.2599, 77.4126],
    ['Chandigarh', 30.7333, 76.7794], ['Guwahati', 26.1445, 91.7362], ['Ranchi', 23.3441, 85.3096], ['Raipur', 21.2514, 81.6296],
    ['Colombo', 6.9271, 79.8612, 5.5], ['Jaffna', 9.6615, 80.0255, 5.5], ['Singapore', 1.3521, 103.8198, 8], ['Kuala Lumpur', 3.139, 101.6869, 8],
    ['Dubai', 25.2048, 55.2708, 4], ['Kathmandu', 27.7172, 85.324, 5.75], ['Abu Dhabi', 24.4539, 54.3773, 4],
    ['Sharjah', 25.3463, 55.4209, 4], ['Muscat', 23.588, 58.3829, 4], ['Doha', 25.2854, 51.531, 3], ['Kuwait City', 29.3759, 47.9774, 3],
    ['Riyadh', 24.7136, 46.6753, 3], ['Jeddah', 21.4858, 39.1925, 3], ['Bahrain (Manama)', 26.2285, 50.586, 3], ['Dhaka', 23.8103, 90.4125, 6],
    ['Port Louis (Mauritius)', -20.1609, 57.5012, 4], ['Nairobi', -1.2921, 36.8219, 3], ['Johannesburg', -26.2041, 28.0473, 2], ['Durban', -29.8587, 31.0218, 2],
    // Places with summer time carry an IANA zone: the offset is worked out for the birth date itself.
    ['London', 51.5074, -0.1278, 'Europe/London'], ['Leicester', 52.6369, -1.1398, 'Europe/London'], ['Birmingham (UK)', 52.4862, -1.8904, 'Europe/London'],
    ['New York', 40.7128, -74.006, 'America/New_York'], ['New Jersey (Edison)', 40.5187, -74.4121, 'America/New_York'], ['Washington DC', 38.9072, -77.0369, 'America/New_York'],
    ['Atlanta', 33.749, -84.388, 'America/New_York'], ['Chicago', 41.8781, -87.6298, 'America/Chicago'], ['Houston', 29.7604, -95.3698, 'America/Chicago'],
    ['Dallas', 32.7767, -96.797, 'America/Chicago'], ['San Francisco', 37.7749, -122.4194, 'America/Los_Angeles'], ['San Jose (USA)', 37.3382, -121.8863, 'America/Los_Angeles'],
    ['Los Angeles', 34.0522, -118.2437, 'America/Los_Angeles'], ['Seattle', 47.6062, -122.3321, 'America/Los_Angeles'], ['Toronto', 43.6532, -79.3832, 'America/Toronto'],
    ['Vancouver', 49.2827, -123.1207, 'America/Vancouver'], ['Sydney', -33.8688, 151.2093, 'Australia/Sydney'], ['Melbourne', -37.8136, 144.9631, 'Australia/Melbourne'],
    ['Perth', -31.9505, 115.8605, 8], ['Auckland', -36.8485, 174.7633, 'Pacific/Auckland'], ['Frankfurt', 50.1109, 8.6821, 'Europe/Berlin'],
    ['Paris', 48.8566, 2.3522, 'Europe/Paris'], ['Amsterdam', 52.3676, 4.9041, 'Europe/Amsterdam'], ['Dublin', 53.3498, -6.2603, 'Europe/Dublin']
  ];
  // UTC offset (hours) of an IANA zone at a local civil date/time, using the browser's time-zone data.
  function zoneOffset(zone, y, m, d, hh, mm) {
    try {
      const f = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
      const want = Date.UTC(y, m - 1, d, hh, mm);
      let off = 0;
      for (let i = 0; i < 3; i++) {
        const parts = {}; f.formatToParts(new Date(want - off * 3600000)).forEach((x) => { parts[x.type] = +x.value; });
        const seen = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour % 24, parts.minute);
        off = (seen - (want - off * 3600000)) / 3600000;
      }
      return off;
    } catch (e) { return null; }
  }
  const fmtTz = (tz) => { const a = Math.abs(tz), h = Math.floor(a), mi = Math.round((a - h) * 60); return `UTC${tz < 0 ? '−' : '+'}${h}${mi ? ':' + String(mi).padStart(2, '0') : ''}`; };
  // Accepts 40.71, -74.01, 40.71N, 74.01 W, 74.01°W
  function parseCoord(v, pos, neg) {
    const s = String(v).trim().toUpperCase().replace(/[°º]/g, '').replace('−', '-');
    const m = s.match(/^(-?\d+(?:\.\d+)?)\s*([NSEW])?$/); if (!m) return NaN;
    let x = parseFloat(m[1]); if (m[2] === neg) x = -Math.abs(x); else if (m[2] === pos) x = Math.abs(x);
    return x;
  }

  // Place search lives in js/places.js (offline world index + OpenStreetMap + live location + map).
  const norm = (x) => window.Places.fold(x);
  const placeLabel = (p) => (p.sub ? `${p.name}, ${p.sub}` : p.name);
  const coordText = (p) => `${Math.abs(p.lat).toFixed(2)}°${p.lat >= 0 ? 'N' : 'S'} ${Math.abs(p.lon).toFixed(2)}°${p.lon >= 0 ? 'E' : 'W'} · ${p.zone ? p.zone.split('/').pop().replace(/_/g, ' ') + ' ' + t('local_time') : fmtTz(p.tz)}`;
  const chosen = {};

  const TZ_OPTIONS = [-12, -11, -10, -9.5, -9, -8, -7, -6, -5, -4, -3.5, -3, -2, -1, 0, 1, 2, 3, 3.5, 4, 4.5, 5, 5.5, 5.75, 6, 6.5, 7, 8, 8.75, 9, 9.5, 10, 10.5, 11, 12, 12.75, 13, 14]
    .map((o) => `<option value="${o}"${o === 5.5 ? ' selected' : ''}>${fmtTz(o)}</option>`).join('');
  function placeField(prefix, labelKey = 'place') {
    return `
      <div class="field place-field">
        <label for="${prefix}-place" data-i18n="${labelKey}"></label>
        <div class="combo">
          <svg class="combo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>
          <input id="${prefix}-place" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${prefix}-list" autocomplete="off" spellcheck="false">
          <ul id="${prefix}-list" class="combo-list" role="listbox" hidden></ul>
        </div>
        <p class="place-meta" id="${prefix}-meta" aria-live="polite"></p>
        <div class="place-tools">
          <button type="button" class="chip-btn" id="${prefix}-here"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7.5"/></svg><span data-ptext="here"></span></button>
          <button type="button" class="chip-btn" id="${prefix}-map"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg><span data-ptext="map"></span></button>
        </div>
        <button type="button" class="link-btn" id="${prefix}-manual" data-i18n="use_coords"></button>
      </div>
      <div class="coords" id="${prefix}-coords" hidden>
        <div class="field"><label for="${prefix}-lat" data-i18n="lat"></label><input id="${prefix}-lat" autocomplete="off" spellcheck="false" placeholder="40.71 N"></div>
        <div class="field"><label for="${prefix}-lon" data-i18n="lon"></label><input id="${prefix}-lon" autocomplete="off" spellcheck="false" placeholder="74.01 W"></div>
        <div class="field"><label for="${prefix}-tz" data-i18n="tz"></label><select id="${prefix}-tz">${TZ_OPTIONS}</select></div>
        <p class="coord-hint" data-i18n="tz_hint"></p>
      </div>`;
  }
  function setPlace(prefix, p, remember = true) {
    chosen[prefix] = p;
    $(`#${prefix}-place`).value = placeLabel(p);
    const meta = $(`#${prefix}-meta`); meta.classList.remove('error'); meta.textContent = coordText(p);
    if (remember) store.set('gv-place', JSON.stringify(p));
  }
  const P = (k) => window.Places.text(lang, k);
  const INDIC_RE = /[ऀ-෿]/;
  function wirePlace(prefix) {
    const input = $(`#${prefix}-place`), list = $(`#${prefix}-list`), meta = $(`#${prefix}-meta`);
    input.placeholder = P('hint');
    $$('[data-ptext]', input.closest('.place-field')).forEach((el) => { el.textContent = P(el.dataset.ptext); });
    let saved = null; try { saved = JSON.parse(store.get('gv-place') || 'null'); } catch (e) { /* ignore */ }
    setPlace(prefix, saved && saved.lat != null ? saved : { name: CITIES[0][0], sub: 'Tamil Nadu, India', lat: CITIES[0][1], lon: CITIES[0][2], tz: 5.5 }, false);
    let results = [], active = -1, seq = 0, timer, webTimer, query = '', busy = false, deepDone = false;
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); };
    const moreRow = () => ((norm(query).length >= 3 || INDIC_RE.test(query)) && !deepDone ? 1 : 0);
    const paint = () => {
      const rows = results.map((p, i) => `<li role="option" id="${prefix}-opt-${i}" aria-selected="${i === active}" data-i="${i}"><strong>${esc(p.name)}${p.web ? ` <em class="tag">${esc(P('web'))}</em>` : ''}</strong><span>${esc(p.sub || coordText(p))}${p.aka ? ` · ${esc(P('aka'))} ${esc(p.aka)}` : ''}</span></li>`);
      if (busy) rows.push(`<li class="empty">${esc(P('searching'))}</li>`);
      else {
        if (!results.length) rows.push(`<li class="empty">${esc(P('none'))}</li>`);
        if (moreRow()) rows.push(`<li role="option" class="more" id="${prefix}-opt-${results.length}" aria-selected="${active === results.length}" data-more="1">${esc(P('more'))} “${esc(query.trim())}”</li>`);
      }
      list.innerHTML = rows.join('');
      list.hidden = false; input.setAttribute('aria-expanded', 'true');
      if (active >= 0) input.setAttribute('aria-activedescendant', `${prefix}-opt-${active}`);
    };
    const merge = (more) => {
      const seen = new Set(results.map((p) => norm(p.name + ' ' + p.sub)));
      more.forEach((p) => { const k = norm(p.name + ' ' + p.sub); if (!seen.has(k)) { seen.add(k); results.push(p); } });
    };
    const searchMore = async () => {
      const my = seq; busy = true; paint();
      const r = await window.Places.deep(query);
      if (my !== seq) return;
      busy = false; deepDone = true; merge(r); if (active < 0 && results.length) active = 0; paint(); input.focus();
    };
    const pick = (i) => {
      if (i === results.length && moreRow()) { searchMore(); return; }
      if (results[i]) { setPlace(prefix, results[i]); $(`#${prefix}-coords`).hidden = true; }
      close();
    };
    input.addEventListener('input', () => {
      clearTimeout(timer); clearTimeout(webTimer);
      query = input.value; const my = ++seq; busy = false; deepDone = false;
      if (norm(query).length < 2 && !INDIC_RE.test(query)) { close(); return; }
      timer = setTimeout(async () => {
        const r = await window.Places.search(query); if (my !== seq) return;
        results = r; active = r.length ? 0 : -1; paint();
        // Few offline matches: ask OpenStreetMap too (streets, villages, places abroad) once typing pauses.
        if (r.length < 5 && norm(query).length >= 3) {
          webTimer = setTimeout(async () => {
            const w = await window.Places.online(query); if (my !== seq || !w.length) return;
            merge(w); if (active < 0) active = 0; paint();
          }, 450);
        }
      }, 120);
    });
    input.addEventListener('focus', () => input.select());
    input.addEventListener('keydown', (e) => {
      if (list.hidden) return;
      const last = results.length - 1 + moreRow();
      if (e.key === 'ArrowDown') { active = Math.min(last, active + 1); paint(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { active = Math.max(0, active - 1); paint(); e.preventDefault(); }
      else if (e.key === 'Enter') { pick(active < 0 ? results.length : active); e.preventDefault(); }
      else if (e.key === 'Escape') { close(); }
    });
    list.addEventListener('mousedown', (e) => {
      const li = e.target.closest('[data-i],[data-more]'); if (!li) return;
      e.preventDefault(); pick(li.dataset.more ? results.length : +li.dataset.i);
    });
    input.addEventListener('blur', () => setTimeout(() => {
      if (busy || document.activeElement === input) return;
      close(); if (chosen[prefix] && $(`#${prefix}-coords`).hidden) input.value = placeLabel(chosen[prefix]);
    }, 150));
    $(`#${prefix}-manual`).addEventListener('click', () => { const c = $(`#${prefix}-coords`); c.hidden = !c.hidden; if (!c.hidden) $(`#${prefix}-lat`).focus(); });
    const hereBtn = $(`#${prefix}-here`), mapBtn = $(`#${prefix}-map`);
    hereBtn.addEventListener('click', async () => {
      hereBtn.disabled = true; meta.classList.remove('error'); meta.textContent = P('locating');
      try { const p = await window.Places.here(); setPlace(prefix, p); $(`#${prefix}-coords`).hidden = true; }
      catch (err) { meta.classList.add('error'); meta.textContent = P(err && err.code === 1 ? 'denied' : 'failed'); }
      hereBtn.disabled = false;
    });
    mapBtn.addEventListener('click', async () => {
      mapBtn.disabled = true;
      try {
        const p = await window.Places.pickOnMap(chosen[prefix], { title: P('title'), hint: P('mhint'), searchHint: P('hint'), find: P('find'), use: P('use'), cancel: P('cancel'), none: P('none') });
        if (p) { setPlace(prefix, p); $(`#${prefix}-coords`).hidden = true; }
      } catch (e) { meta.classList.add('error'); meta.textContent = P('failed'); }
      mapBtn.disabled = false;
    });
  }
  function readPlace(prefix) {
    if (!$(`#${prefix}-coords`).hidden) {
      const lat = parseCoord($(`#${prefix}-lat`).value, 'N', 'S'), lon = parseCoord($(`#${prefix}-lon`).value, 'E', 'W'), tz = parseFloat($(`#${prefix}-tz`).value);
      if ([lat, lon, tz].some(Number.isNaN) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
      return { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, lat, lon, tz };
    }
    const p = chosen[prefix]; if (!p) return null;
    return { name: placeLabel(p), lat: p.lat, lon: p.lon, tz: p.tz, zone: p.zone };
  }

  // ---------- Language ----------
  let lang = 'en';
  const TOOL_FILES = ['index.html', 'porutham.html', 'panchangam.html'];
  const toolHref = (l, f) => `${l === 'en' ? '' : `${l}/`}${f === 'index.html' ? '' : f.replace(/\.html$/, '')}` || './'; // Cloudflare serves pages without .html
  const t = (k) => (UI[lang] && UI[lang][k]) || UI.en[k] || k;
  const T = () => TERMS[lang] || TERMS.en;
  const loadedFonts = new Set();
  function loadFont(l) {
    const meta = LANGS.find((x) => x.code === l);
    if (!meta || !meta.font || loadedFonts.has(meta.font)) return;
    loadedFonts.add(meta.font);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${meta.font.replace(/ /g, '+')}:wght@400;500;600&display=swap`;
    document.head.appendChild(link);
  }
  function detectLang() {
    if (document.body.dataset.fixed || document.body.dataset.page === 'palan' || document.body.dataset.page === 'blog') return document.body.dataset.lang;
    const q = new URLSearchParams(location.search).get('lang');
    if (q && UI[q]) return q;
    const s = store.get('gv-lang'); if (s && UI[s]) return s;
    const nav = (navigator.languages || [navigator.language || 'en']).map((x) => x.slice(0, 2));
    return nav.find((x) => UI[x]) || 'en';
  }
  let rerender = null;
  function applyLang(l) {
    lang = l; store.set('gv-lang', l);
    document.documentElement.lang = l;
    document.documentElement.dataset.script = l;
    loadFont(l);
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('.combo input').forEach((el) => { el.placeholder = window.Places.text(l, 'hint'); });
    $$('[data-ptext]').forEach((el) => { el.textContent = window.Places.text(l, el.dataset.ptext); });
    const sel = $('#lang'); if (sel) sel.value = l;
    $$('a[data-palan]').forEach((a) => { a.setAttribute('href', `rasi-palan/${l}/`); });
    $$('a[data-blog]').forEach((a) => { a.setAttribute('href', `blog/${l}/`); });
    $$('a[data-keep-lang]').forEach((a) => {
      const f = a.dataset.keepLang || a.getAttribute('href').split('?')[0].split('/').pop();
      a.dataset.keepLang = f;
      a.setAttribute('href', TOOL_FILES.includes(f) ? toolHref(l, f) : `${f}?lang=${l}`);
    });
    // Each language has its own address (/ta/, /te/porutham ...): keep the address bar in step without reloading.
    const toolFile = { chart: 'index.html', match: 'porutham.html', panchang: 'panchangam.html' }[document.body.dataset.page];
    if (toolFile && history.replaceState) { try { history.replaceState(null, '', new URL(toolHref(l, toolFile), document.baseURI).href); } catch (e) { /* file:// previews */ } }
    fillTermSelects();
    if (rerender) rerender();
  }

  // ---------- Formatting ----------
  const pad = (n) => String(n).padStart(2, '0');
  function fmtHour(h) {
    if (h == null) return '–';
    h = ((h % 24) + 24) % 24;
    let hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    if (mm === 60) { hh = (hh + 1) % 24; mm = 0; }
    return `${pad(hh)}:${pad(mm)}`;
  }
  const fmtDeg = (d) => `${Math.floor(d)}° ${pad(Math.floor((d % 1) * 60))}′`;
  const fmtDate = (dt) => dt.toLocaleDateString(lang === 'en' ? 'en-IN' : `${lang}-IN`, { day: 'numeric', month: 'short', year: 'numeric' });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- Chart drawing ----------
  const SOUTH_CELLS = [[0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [3, 0], [2, 0], [1, 0], [0, 0]]; // [row,col] for rasi 0..11
  const ELEMENT = ['fire', 'earth', 'air', 'water'];
  const KALASHA = `<svg class="kalasha" viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 9c-4 0-7 3-7 6.5 0 2 1 3.5 2.4 4.5h9.2c1.4-1 2.4-2.5 2.4-4.5C39 12 36 9 32 9z" fill="#8a5a2b"/>
    <path d="M18 22c4-3 9-1 14-3 5 2 10 0 14 3-3 1-5 3-6 5H24c-1-2-3-4-6-5z" fill="#2f9e44"/>
    <path d="M22 27h20l-2 3c6 3 9 8 9 14 0 9-7 13-17 13S15 53 15 44c0-6 3-11 9-14z" fill="var(--gold)"/>
    <path d="M17 41h30M18 46h28" stroke="var(--kumkum)" stroke-width="2.4" fill="none"/>
    <circle cx="32" cy="36" r="2.6" fill="var(--kumkum)"/></svg>`;
  function cellItems(items, rasi) {
    return items.filter((p) => p.rasi === rasi).map((p) => `<span class="pl pl-${p.key}">${esc(T().abbr[p.key])}${p.retro && p.key !== 'rahu' && p.key !== 'ketu' ? '<sup>R</sup>' : ''}</span>`).join('');
  }
  function southChart(items, title, centre) {
    let cells = '';
    for (let r = 0; r < 12; r++) {
      const [row, col] = SOUTH_CELLS[r];
      cells += `<div class="sc-cell el-${ELEMENT[r % 4]}" style="grid-row:${row + 1};grid-column:${col + 1}"><small>${esc(T().rasiShort[r])}</small><div class="sc-items">${cellItems(items, r)}</div></div>`;
    }
    return `<div class="south-chart" role="img" aria-label="${esc(title)}">${cells}<div class="sc-center">${centre || ''}<strong>${esc(title)}</strong></div></div>`;
  }
  const NORTH_POS = [[200, 105], [100, 50], [50, 105], [105, 200], [50, 300], [100, 352], [200, 300], [300, 352], [350, 300], [295, 200], [350, 105], [300, 50]];
  function northChart(items, title, lagnaRasi) {
    let txt = '';
    for (let h = 0; h < 12; h++) {
      const rasi = (lagnaRasi + h) % 12;
      const [x, y] = NORTH_POS[h];
      const ps = items.filter((p) => p.rasi === rasi);
      const numY = h === 0 ? y - 40 : (h === 6 ? y + 42 : y - 22);
      txt += `<text x="${x}" y="${numY}" class="nc-num">${rasi + 1}</text>`;
      ps.forEach((p, i) => {
        const n = T().abbr[p.key] + (p.retro && p.key !== 'rahu' && p.key !== 'ketu' ? '(R)' : '');
        const cols = ps.length > 3 ? 2 : 1;
        const dx = cols === 2 ? (i % 2 ? 22 : -22) : 0, dy = cols === 2 ? Math.floor(i / 2) * 18 : i * 18;
        txt += `<text x="${x + dx}" y="${y + dy - (ps.length > 1 ? 6 : 0)}" class="nc-p pl-${p.key}">${esc(n)}</text>`;
      });
    }
    return `<svg class="north-chart" viewBox="0 0 400 400" role="img" aria-label="${esc(title)}">
      <rect class="nc-bg" x="1" y="1" width="398" height="398"/>
      <polygon class="nc-l" points="200,1 300,100 200,200 100,100"/>
      <rect x="1" y="1" width="398" height="398"/><line x1="1" y1="1" x2="399" y2="399"/><line x1="399" y1="1" x2="1" y2="399"/>
      <polygon points="200,1 399,200 200,399 1,200"/>${txt}</svg>`;
  }

  function styleDefault() { return 'south'; } // South Indian square chart for every language (Maddy's choice)

  // Antardasha (bhukti) periods inside one maha dasha
  const DASHA_ORDER = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
  function bhuktis(md) {
    const Y = A.DASHA_YEARS[md.lord], YEAR = 365.2425 * 86400000;
    let t0 = md.end.getTime() - Y * YEAR;
    const start = DASHA_ORDER.indexOf(md.lord), out = [];
    for (let i = 0; i < 9; i++) {
      const lord = DASHA_ORDER[(start + i) % 9], len = Y * A.DASHA_YEARS[lord] / 120 * YEAR;
      if (t0 + len > md.start.getTime()) out.push({ lord, start: new Date(Math.max(t0, md.start.getTime())), end: new Date(t0 + len) });
      t0 += len;
    }
    return out;
  }

  // ---------- Birth chart page ----------
  let lastChart = null;
  function renderChart() {
    const out = $('#chart-result'); if (!lastChart) return;
    const { c, pc, name, place, dateStr } = lastChart;
    const style = store.get('gv-style2') || styleDefault();
    const all = [c.lagna, ...c.planets];
    const nav = all.map((p) => Object.assign({}, p, { rasi: p.navamsa }));
    const centre = `${KALASHA}<span class="sc-name">${esc(name || '')}</span><span class="sc-date">${esc(dateStr)}</span>`;
    const draw = (items, title, lr, ctr) => style === 'south' ? southChart(items, title, ctr) : northChart(items, title, lr);
    const now = Date.now();
    const R = (p) => p.retro && p.key !== 'rahu' && p.key !== 'ketu';
    const rows = all.map((p) => `<tr><th scope="row"><span class="dot pl-${p.key}"></span>${esc(T().planet[p.key])}${R(p) ? ' <span class="tag">R</span>' : ''}</th><td>${esc(T().rasiShort[p.rasi])}</td><td class="num">${fmtDeg(p.deg)}</td><td>${esc(T().nak[p.nak.index])} · ${p.nak.pada}</td><td>${esc(T().planet[DASHA_ORDER[p.nak.index % 9]])}</td><td>${esc(T().rasiShort[p.navamsa])}</td></tr>`).join('');
    let currentMd = null;
    const dasha = c.dasha.periods.map((d) => {
      const cur = d.start.getTime() <= now && now < d.end.getTime();
      if (cur) currentMd = d;
      return `<tr class="${cur ? 'is-current' : ''}"><th scope="row"><span class="dot pl-${d.lord}"></span>${esc(T().planet[d.lord])}${cur ? ` <span class="tag">${esc(t('current'))}</span>` : ''}</th><td>${fmtDate(d.start)}</td><td>${fmtDate(d.end)}</td></tr>`;
    }).join('');
    const md = currentMd || c.dasha.periods[0];
    const bh = bhuktis(md).map((b) => {
      const cur = b.start.getTime() <= now && now < b.end.getTime();
      return `<tr class="${cur ? 'is-current' : ''}"><th scope="row"><span class="dot pl-${b.lord}"></span>${esc(T().planet[md.lord])} / ${esc(T().planet[b.lord])}</th><td>${fmtDate(b.start)}</td><td>${fmtDate(b.end)}</td></tr>`;
    }).join('');
    const bal = c.dasha.balanceYears, by = Math.floor(bal), bm = Math.floor((bal - by) * 12), bd = Math.round(((bal - by) * 12 - bm) * 30.44);
    const tithiName = pc.tithi === 14 ? T().tithi[14] : pc.tithi === 29 ? T().tithi[15] : T().tithi[pc.tithi % 15];
    const details = [
      ['name', name || '–'], ['dob', dateStr], ['place', place.name], ['weekday', T().weekday[pc.weekday]],
      ['tithi', `${tithiName} (${T().paksha[pc.paksha]})`], ['nakshatra', `${T().nak[c.nakshatra.index]} · ${c.nakshatra.pada}`],
      ['yoga', T().yoga[pc.yoga]], ['karana', T().karana[pc.karana]], ['lagna', T().rasiShort[c.lagna.rasi]],
      ['moon_sign', T().rasiShort[c.moonRasi]], ['sunrise', fmtHour(pc.sunrise)], ['dasha_balance', `${T().planet[c.dasha.balanceLord]} ${by}y ${bm}m ${bd}d`]
    ];
    out.innerHTML = `
      <div class="jathagam">
      <div class="result-head">
        <div class="jh-title"><span class="om">ॐ</span><div><h2>${esc(t('nav_chart'))}${name ? ` · ${esc(name)}` : ''}</h2><p class="muted">${esc(dateStr)} · ${esc(place.name)}</p></div></div>
        <div class="seg" role="group" aria-label="${esc(t('chart_style'))}">
          <button type="button" data-style="south" aria-pressed="${style === 'south'}">${esc(t('south'))}</button>
          <button type="button" data-style="north" aria-pressed="${style === 'north'}">${esc(t('north'))}</button>
        </div>
      </div>
      <dl class="facts">
        <div class="f-lagna"><dt>${esc(t('lagna'))}</dt><dd>${esc(T().rasiShort[c.lagna.rasi])}</dd></div>
        <div class="f-rasi"><dt>${esc(t('moon_sign'))}</dt><dd>${esc(T().rasiShort[c.moonRasi])}</dd></div>
        <div class="f-star"><dt>${esc(t('birth_star'))}</dt><dd>${esc(T().nak[c.nakshatra.index])} <span class="muted">· ${esc(t('pada'))} ${c.nakshatra.pada}</span></dd></div>
      </dl>
      <div class="charts">
        <figure>${draw(all, t('rasi_chart'), c.lagna.rasi, centre)}<figcaption>${esc(t('rasi_chart'))}</figcaption></figure>
        <figure>${draw(nav, t('navamsa_chart'), c.lagna.navamsa, '')}<figcaption>${esc(t('navamsa_chart'))}</figcaption></figure>
      </div>
      <section class="block"><h3>${esc(t('birth_details'))}</h3>
        <dl class="detail-grid">${details.map(([k, v]) => `<div><dt>${esc(t(k))}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>
      <div class="ad-slot" data-ad="chart-mid"></div>
      <section class="block"><h3>${esc(t('planet'))}</h3>
        <div class="table-wrap"><table><thead><tr><th scope="col">${esc(t('planet'))}</th><th scope="col">${esc(t('sign'))}</th><th scope="col">${esc(t('degree'))}</th><th scope="col">${esc(t('nakshatra'))}</th><th scope="col">${esc(t('star_lord'))}</th><th scope="col">${esc(t('navamsa_chart'))}</th></tr></thead><tbody>${rows}</tbody></table></div>
        <p class="note">${esc(t('retro'))} · Lahiri ${fmtDeg(c.ayanamsa)} · ${place.lat.toFixed(2)}, ${place.lon.toFixed(2)} · ${fmtTz(place.tz)}</p></section>
      <div class="tables">
        <section class="block"><h3>${esc(t('dasha'))}</h3>
          <div class="table-wrap"><table><thead><tr><th scope="col">${esc(t('dasha'))}</th><th scope="col">${esc(t('from'))}</th><th scope="col">${esc(t('to'))}</th></tr></thead><tbody>${dasha}</tbody></table></div></section>
        <section class="block"><h3>${esc(t('bhukti'))}</h3>
          <div class="table-wrap"><table><thead><tr><th scope="col">${esc(t('bhukti'))}</th><th scope="col">${esc(t('from'))}</th><th scope="col">${esc(t('to'))}</th></tr></thead><tbody>${bh}</tbody></table></div></section>
      </div>
      </div>
      <div class="actions"><button type="button" class="btn-wa" data-act="wa">${WA_ICON}<span>${esc(t('share_wa'))}</span></button><button type="button" class="btn" data-act="png">${esc(UI.en.download_img)}</button><button type="button" class="btn-secondary" data-act="pdf">${esc(UI.en.print)}</button></div>`;
    shareText = [`🪔 ${name ? `${name} · ` : ''}${t('nav_chart')}`, `${t('lagna')}: ${T().rasiShort[c.lagna.rasi]}`, `${t('moon_sign')}: ${T().rasiShort[c.moonRasi]}`,
      `${t('birth_star')}: ${T().nak[c.nakshatra.index]} (${t('pada')} ${c.nakshatra.pada})`, '', `${t('share_chart')}: ${siteLink('index.html')}`].join('\n');
    $$('.seg button', out).forEach((b) => b.addEventListener('click', () => { store.set('gv-style2', b.dataset.style); renderChart(); }));
    out.hidden = false;
  }
  function readBirth(prefix) {
    const d = $(`#${prefix}-date`).value, tm = $(`#${prefix}-time`).value, place = readPlace(prefix);
    if (!d || !tm || !place) return null;
    const [y, m, dd] = d.split('-').map(Number), [hh, mm] = tm.split(':').map(Number);
    let tz = place.tz;
    if (place.zone) { const z = zoneOffset(place.zone, y, m, dd, hh, mm); if (z != null) tz = z; }
    place.tz = tz;
    return { y, m, d: dd, hh, mm, tz, lat: place.lat, lon: place.lon, place, dateStr: `${d} ${tm}` };
  }
  function initChart() {
    const form = $('#chart-form');
    $('#chart-place').innerHTML = placeField('b');
    wirePlace('b');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = readBirth('b');
      const err = $('#chart-error');
      if (!inp) { err.textContent = t('error_fill'); err.hidden = false; return; }
      err.hidden = true;
      lastChart = { c: A.computeChart(inp), pc: A.panchang(inp), name: $('#b-name').value.trim(), place: inp.place, dateStr: inp.dateStr };
      renderChart();
      $('#chart-result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
    rerender = renderChart;
  }

  // ---------- Matching page ----------
  function personBlock(p, labelKey) {
    return `<fieldset class="person"><legend data-i18n="${labelKey}"></legend>
      <div class="seg mode" role="group">
        <button type="button" data-mode="birth" aria-pressed="true" data-i18n="use_birth"></button>
        <button type="button" data-mode="star" aria-pressed="false" data-i18n="know_star"></button>
      </div>
      <div class="mode-birth">
        <div class="field"><label for="${p}-name" data-i18n="name"></label><input id="${p}-name" autocomplete="off"></div>
        <div class="row2">
          <div class="field"><label for="${p}-date" data-i18n="dob"></label><input id="${p}-date" type="date"></div>
          <div class="field"><label for="${p}-time" data-i18n="tob"></label><input id="${p}-time" type="time"></div>
        </div>
        ${placeField(p)}
      </div>
      <div class="mode-star" hidden>
        <div class="row2">
          <div class="field"><label for="${p}-star" data-i18n="star"></label><select id="${p}-star" class="star-select"></select></div>
          <div class="field"><label for="${p}-pada" data-i18n="pada"></label><select id="${p}-pada"><option>1</option><option>2</option><option>3</option><option>4</option></select></div>
        </div>
        <p class="note" id="${p}-rasi-note"></p>
      </div></fieldset>`;
  }
  let lastMatch = null;
  function renderMatch() {
    const out = $('#match-result'); if (!lastMatch) return;
    const { r, girl, boy } = lastMatch;
    const label = (v) => v === 2 ? t('v_good') : v === 1 ? t('v_mid') : t('v_bad');
    const items = r.items.map((it) => `<li class="pm pm-${it.v}"><span>${esc(T().porutham[it.key])}</span><span class="pm-state">${esc(label(it.v))}</span></li>`).join('');
    const who = (p) => `${esc(T().nak[p.star])} · ${esc(T().rasiShort[p.rasi])}`;
    out.innerHTML = `
      <div class="score-row verdict-${r.verdict}">
        <div class="score"><span class="score-num">${r.score}</span><span class="score-den">/ 10</span></div>
        <div><h2>${esc(t('score'))}</h2><p>${esc(t('verdict_' + r.verdict))}</p></div>
      </div>
      <dl class="facts">
        <div><dt>${esc(t('bride'))}</dt><dd>${who(girl)}</dd></div>
        <div><dt>${esc(t('groom'))}</dt><dd>${who(boy)}</dd></div>
      </dl>
      <ul class="pm-list">${items}</ul>
      ${whyHtml(r)}
      <div class="ad-slot" data-ad="match-mid"></div>
      <div class="actions"><button type="button" class="btn-wa" data-act="wa">${WA_ICON}<span>${esc(t('share_wa'))}</span></button><button type="button" class="btn" data-act="png">${esc(UI.en.download_img)}</button><button type="button" class="btn-secondary" data-act="pdf">${esc(UI.en.print)}</button></div>`;
    shareText = [`💍 ${t('score')}: ${r.score} / 10 · ${t('verdict_' + r.verdict)}`, `${t('bride')}: ${T().nak[girl.star]} · ${T().rasiShort[girl.rasi]}`,
      `${t('groom')}: ${T().nak[boy.star]} · ${T().rasiShort[boy.rasi]}`, '', `${t('share_match')}: ${siteLink('porutham.html')}`].join('\n');
    out.hidden = false;
  }
  // "Why this score": strengths first, then the gentle notes. Text lives in js/match-why.js, loaded on first use.
  let whyState = 'idle';
  function loadWhy() {
    if (window.MatchWhy || whyState !== 'idle') return;
    whyState = 'loading';
    const s = document.createElement('script');
    s.src = new URL('match-why.js', SCRIPT_BASE).href;
    s.onload = () => { whyState = 'done'; renderMatch(); };
    s.onerror = () => { whyState = 'idle'; };
    document.head.appendChild(s);
  }
  function whyHtml(r) {
    const all = window.MatchWhy; if (!all) { loadWhy(); return ''; }
    const W = all[lang] || all.en, E = all.en;
    const w = (k) => W[k] != null ? W[k] : E[k];
    const text = (it) => { const a = (W.items[it.key] || E.items[it.key]); return a[it.v] || a[0]; };
    const li = (it) => `<li class="why-${it.v}"><b>${esc(T().porutham[it.key])}</b> <span class="why-tag">${esc(it.v === 2 ? t('v_good') : it.v === 1 ? t('v_mid') : t('v_bad'))}</span><br>${esc(text(it))}</li>`;
    const good = r.items.filter((it) => it.v === 2), soft = r.items.filter((it) => it.v < 2);
    const full = good.length, part = r.items.filter((it) => it.v === 1).length;
    const intro = w('intro').replace('{full}', full).replace('{part}', part).replace('{score}', r.score);
    const keyNote = (!r.rajjuOk || !r.vedhaOk) && r.score >= 4.5 ? `<p class="why-key">${esc(w('key_note'))}</p>` : '';
    return `<section class="why" aria-labelledby="why-h">
      <h3 id="why-h">${esc(w('h'))}</h3>
      <p>${esc(intro)}</p>${keyNote}
      <div class="why-cols">
        <div class="why-box why-pos"><h4>${esc(w('pos'))}</h4>${good.length ? `<ul>${good.map(li).join('')}</ul>` : `<p>${esc(w('none_pos'))}</p>`}</div>
        <div class="why-box why-soft"><h4>${esc(w('neg'))}</h4>${soft.length ? `<ul>${soft.map(li).join('')}</ul>` : `<p>${esc(w('none_neg'))}</p>`}</div>
      </div>
      <p class="why-note">${esc(w('note'))}</p>
    </section>`;
  }
  function updateRasiNote(p) {
    const s = +$(`#${p}-star`).value, pd = +$(`#${p}-pada`).value;
    $(`#${p}-rasi-note`).textContent = `${t('rasi')}: ${T().rasiShort[A.rasiFromStarPada(s, pd)]}`;
  }
  function initMatch() {
    $('#match-people').innerHTML = personBlock('g', 'bride') + personBlock('m', 'groom');
    loadWhy();
    ['g', 'm'].forEach((p) => {
      wirePlace(p);
      const fs = $(`#${p}-name`).closest('fieldset');
      $$('.mode button', fs).forEach((b) => b.addEventListener('click', () => {
        $$('.mode button', fs).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        $('.mode-birth', fs).hidden = b.dataset.mode !== 'birth';
        $('.mode-star', fs).hidden = b.dataset.mode !== 'star';
      }));
      $(`#${p}-star`).addEventListener('change', () => updateRasiNote(p));
      $(`#${p}-pada`).addEventListener('change', () => updateRasiNote(p));
    });
    $('#match-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const err = $('#match-error');
      const read = (p) => {
        const fs = $(`#${p}-name`).closest('fieldset');
        if (!$('.mode-star', fs).hidden) {
          const s = +$(`#${p}-star`).value, pd = +$(`#${p}-pada`).value;
          return { star: s, rasi: A.rasiFromStarPada(s, pd) };
        }
        const inp = readBirth(p); if (!inp) return null;
        const c = A.computeChart(inp);
        return { star: c.nakshatra.index, rasi: c.moonRasi };
      };
      const girl = read('g'), boy = read('m');
      if (!girl || !boy) { err.textContent = t('error_fill'); err.hidden = false; return; }
      err.hidden = true;
      lastMatch = { r: A.porutham(girl, boy), girl, boy };
      renderMatch();
      $('#match-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    rerender = () => { ['g', 'm'].forEach(updateRasiNote); renderMatch(); };
  }

  function fillTermSelects() {
    $$('.star-select').forEach((sel) => {
      const v = sel.value;
      sel.innerHTML = T().nak.map((n, i) => `<option value="${i}">${esc(n)}</option>`).join('');
      if (v) sel.value = v;
    });
  }

  // ---------- Panchangam page ----------
  let lastPanch = null;
  function renderPanch() {
    const out = $('#panch-result'); if (!lastPanch) return;
    const { p, place, dateStr } = lastPanch;
    const tithiIdx = p.tithi % 15, tithiName = p.tithi === 14 ? T().tithi[14] : p.tithi === 29 ? T().tithi[15] : T().tithi[tithiIdx];
    const rng = (r) => r ? `${fmtHour(r[0])} – ${fmtHour(r[1])}` : '–';
    const cells = [
      ['weekday', T().weekday[p.weekday]], ['tithi', `${tithiName}`], ['paksha', T().paksha[p.paksha]],
      ['nakshatra', `${T().nak[p.nakshatra.index]} · ${p.nakshatra.pada}`], ['yoga', T().yoga[p.yoga]], ['karana', T().karana[p.karana]],
      ['sunrise', fmtHour(p.sunrise)], ['sunset', fmtHour(p.sunset)]
    ];
    const warn = [['rahukalam', rng(p.kalam && p.kalam.rahu)], ['yamagandam', rng(p.kalam && p.kalam.yama)], ['gulikai', rng(p.kalam && p.kalam.gulika)]];
    out.innerHTML = `
      <div class="result-head"><div><h2>${esc(dateStr)}</h2><p class="muted">${esc(place.name)}</p></div></div>
      <dl class="grid-facts">${cells.map(([k, v]) => `<div><dt>${esc(t(k))}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <h3 class="sub">${esc(t('rahukalam'))} · ${esc(t('yamagandam'))} · ${esc(t('gulikai'))}</h3>
      <dl class="grid-facts warn">${warn.map(([k, v]) => `<div><dt>${esc(t(k))}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <p class="chandra"><strong>${esc(t('chandrashtamam'))}:</strong> ${esc(T().rasiShort[p.chandrashtamaRasi])}</p>
      <div class="ad-slot" data-ad="panch-mid"></div>`;
    out.hidden = false;
  }
  function initPanch() {
    $('#panch-place').innerHTML = placeField('p', 'city');
    wirePlace('p');
    const now = new Date();
    $('#p-date').value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    $('#p-time').value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const run = () => {
      const inp = readBirth('p');
      const err = $('#panch-error');
      if (!inp) { err.textContent = t('error_fill'); err.hidden = false; return; }
      err.hidden = true;
      lastPanch = { p: A.panchang(inp), place: inp.place, dateStr: inp.dateStr };
      renderPanch();
    };
    $('#panch-form').addEventListener('submit', (e) => { e.preventDefault(); run(); });
    rerender = renderPanch;
    run();
  }

  // ---------- Share on WhatsApp ----------
  // A short summary (no birth date, time or place) plus a link back to the free tool in the same language.
  let shareText = '';
  const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.2c0-.1-.2-.2-.4-.3z"/></svg>';
  const siteLink = (file) => {
    const live = /^https?:$/.test(location.protocol) && /rasivani\.com$/.test(location.hostname);
    return `${live ? location.origin : 'https://rasivani.com'}/${toolHref(lang, file).replace(/^\.\/$/, '')}`;
  };
  function shareWhatsApp() {
    if (!shareText) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener');
  }

  // ---------- Download as image ----------
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  async function downloadImage(el, btn) {
    const label = btn.textContent; btn.disabled = true; btn.textContent = '…';
    try {
      if (!window.html2canvas) await loadScript('js/vendor/html2canvas.min.js');
      const bg = getComputedStyle(document.body).backgroundColor;
      const canvas = await window.html2canvas(el, { backgroundColor: bg, scale: 2, useCORS: true,
        ignoreElements: (n) => n.classList && (n.classList.contains('actions') || n.classList.contains('ad-slot') || n.classList.contains('seg')) });
      const out = document.createElement('canvas');
      out.width = canvas.width + 64; out.height = canvas.height + 128;
      const ctx = out.getContext('2d');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(canvas, 32, 32);
      ctx.fillStyle = getComputedStyle(document.body).color; ctx.font = '600 26px system-ui, sans-serif';
      ctx.fillText('RasiVani · rasivani.com', 32, out.height - 36);
      const blob = await new Promise((r) => out.toBlob(r, 'image/png'));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `rasivani-${document.body.dataset.page}-${Date.now()}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (e) { window.print(); } finally { btn.disabled = false; btn.textContent = label; }
  }
  async function downloadPdf(el, btn) {
    const label = btn.textContent; btn.disabled = true; btn.textContent = '…';
    try {
      if (!window.RVPdf) await loadScript('js/pdf.js');
      await window.RVPdf.save(el, `rasivani-${document.body.dataset.page}-${Date.now()}.pdf`, 'RasiVani · rasivani.com');
    } catch (e) { window.print(); } finally { btn.disabled = false; btn.textContent = label; }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    if (b.dataset.act === 'wa') { shareWhatsApp(); return; }
    if (b.dataset.act === 'print') window.print();
    if (b.dataset.act === 'pdf') downloadPdf(b.closest('.result').querySelector('.jathagam, .match-card, .panch-card') || b.closest('.result'), b);
    if (b.dataset.act === 'png') downloadImage(b.closest('.result').querySelector('.jathagam, .match-card, .panch-card') || b.closest('.result'), b);
  });

  // ---------- Boot ----------
  function boot() {
    const sel = $('#lang');
    if (sel) {
      sel.innerHTML = LANGS.map((l) => `<option value="${l.code}">${l.name}</option>`).join('');
      sel.addEventListener('change', () => {
        if (document.body.dataset.alt) { store.set('gv-lang', sel.value); let m = {}; try { m = JSON.parse(document.body.dataset.alt); } catch (e) { /* ignore */ } location.href = m[sel.value] || `rasi-palan/${sel.value}/`; return; }
        if (document.body.dataset.page === 'blog') { store.set('gv-lang', sel.value); location.href = `blog/${sel.value}/${document.body.dataset.slug ? document.body.dataset.slug + '/' : ''}`; return; }
        if (document.body.dataset.page === 'palan') { store.set('gv-lang', sel.value); location.href = `rasi-palan/${sel.value}/${document.body.dataset.slug ? document.body.dataset.slug + '/' : ''}`; return; }
        applyLang(sel.value);
      });
    }
    const page = document.body.dataset.page;
    // On phones the menu scrolls sideways: bring the current section into view
    { const nv = $('.nav'), cur = nv && $('.nav a[aria-current]'); const show = () => { if (cur && nv.scrollWidth > nv.clientWidth) nv.scrollLeft += cur.getBoundingClientRect().left - nv.getBoundingClientRect().left - 16; }; show(); if (document.fonts) document.fonts.ready.then(show); }
    // The English tool pages (/, /porutham, /panchangam) open in the visitor's own language:
    // their earlier choice on this site if they made one (kept in localStorage, no cookies), else the browser's language.
    // Search engines read pages in English, so they stay here and still index every language's own address.
    const toolFile = { chart: 'index.html', match: 'porutham.html', panchang: 'panchangam.html' }[page];
    if (toolFile && !document.body.dataset.fixed) {
      const want = detectLang();
      if (want !== 'en' && UI[want]) { location.replace(new URL(toolHref(want, toolFile), document.baseURI).href + location.hash); return; }
    }
    // Picking a language from the footer counts as the visitor's choice too
    $$('.foot-langs a[hreflang]').forEach((a) => a.addEventListener('click', () => store.set('gv-lang', a.getAttribute('hreflang'))));
    if (page === 'chart') initChart();
    if (page === 'match') initMatch();
    if (page === 'panchang') initPanch();
    applyLang(detectLang());
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  document.addEventListener('DOMContentLoaded', boot);
})();
