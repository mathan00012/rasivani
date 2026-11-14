/* RasiVani fun tools: Friendship score, FLAMES and Nakshatra animal (pages built by tools/fun.mjs).
   Everything runs in the visitor's browser; names never leave the device unless the visitor shares a link.
   The page carries its own text in <script id="fun-text" type="application/json">.
   The scoring functions also run in Node (tools/fun.mjs uses them for the sample results on each page). */
(function (root) {
  'use strict';

  // ---------- Shared star data (same tables as the marriage porutham in js/astro.js) ----------
  const GANA = 'DMRMDMDDRRMMDRDRDRRMMDRRMMD'; // Deva / Manushya / Rakshasa by nakshatra
  const YONI = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];
  // animals: 0 horse 1 elephant 2 sheep 3 serpent 4 dog 5 cat 6 rat 7 cow 8 buffalo 9 tiger 10 deer 11 monkey 12 mongoose 13 lion
  const YONI_ENEMY = [[0, 8], [1, 13], [2, 11], [3, 12], [4, 10], [5, 6], [7, 9]];
  const EMOJI = ['🐎', '🐘', '🐑', '🐍', '🐕', '🐈', '🐀', '🐄', '🐃', '🐅', '🦌', '🐒', '🦡', '🦁'];
  const rival = (a) => { const p = YONI_ENEMY.find(([x, y]) => x === a || y === a); return p[0] === a ? p[1] : p[0]; };

  // ---------- Names ----------
  // Lower case, letters and vowel signs only (works for every Indian script)
  const clean = (s) => String(s || '').normalize('NFC').toLowerCase().replace(/[^\p{L}\p{M}]/gu, '');
  // One "letter" = one grapheme, so க + ா counts as one letter, like people count by hand
  function letters(s) {
    const c = clean(s);
    if (typeof Intl !== 'undefined' && Intl.Segmenter) return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(c), (x) => x.segment);
    return Array.from(c);
  }
  // FNV-1a hash: the same two names always give the same number, in either order
  function pairHash(a, b) {
    const [x, y] = [clean(a), clean(b)].sort();
    let h = 0x811c9dc5;
    for (const ch of `${x}|${y}`) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    // final mix so every digit of the result changes with the names
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return h >>> 0;
  }

  // ---------- Friendship score ----------
  // With both birth stars: tara (counting stars both ways) 30 + gana (temperament) 30 + yoni (animal) 25 + name vibe 15 = 100.
  // Names only: a fixed number from the two names, 50 to 99.
  function tara(from, to) { const c = ((to - from + 27) % 27) + 1; return ((c - 1) % 9) + 1; } // 1..9
  const TARA_PTS = (t) => (t === 1 ? 10 : [3, 5, 7].includes(t) ? 4 : 15);
  function ganaPts(a, b) {
    const g = [GANA[a], GANA[b]].sort().join('');
    return { DD: 30, MM: 30, RR: 30, DM: 22, MR: 14, DR: 8 }[g];
  }
  function yoniPts(a, b) {
    const ya = YONI[a], yb = YONI[b];
    if (ya === yb) return 25;
    return YONI_ENEMY.some(([p, q]) => (p === ya && q === yb) || (p === yb && q === ya)) ? 6 : 17;
  }
  function friendScore(nameA, nameB, starA, starB) {
    const h = pairHash(nameA, nameB);
    const stars = Number.isInteger(starA) && Number.isInteger(starB) && starA >= 0 && starB >= 0;
    if (!stars) return { score: 50 + (h % 50), stars: false, h };
    const parts = { tara: TARA_PTS(tara(starA, starB)) + TARA_PTS(tara(starB, starA)), gana: ganaPts(starA, starB), yoni: yoniPts(starA, starB), names: h % 16 };
    const max = { tara: 30, gana: 30, yoni: 25, names: 15 };
    // Friends like a generous number: 20..100 points become 56..100%
    const score = Math.min(100, Math.round(45 + (parts.tara + parts.gana + parts.yoni + parts.names) * 0.55));
    return { score, stars: true, parts, max, h };
  }
  const tier = (score) => (score >= 90 ? 0 : score >= 75 ? 1 : score >= 60 ? 2 : score >= 45 ? 3 : 4);

  // ---------- FLAMES ----------
  // Strike out the letters the two names share (one for one), count what is left, then go round F-L-A-M-E-S
  // removing every n-th letter until one is left.
  function flames(nameA, nameB) {
    const a = letters(nameA).map((ch) => ({ ch, cut: false }));
    const b = letters(nameB).map((ch) => ({ ch, cut: false }));
    for (const x of a) { const y = b.find((z) => !z.cut && z.ch === x.ch); if (y) { x.cut = true; y.cut = true; } }
    const n = a.filter((x) => !x.cut).length + b.filter((x) => !x.cut).length;
    let list = ['F', 'L', 'A', 'M', 'E', 'S'];
    const order = [];
    if (n > 0) {
      let i = 0;
      while (list.length > 1) { i = (i + n - 1) % list.length; order.push(list[i]); list.splice(i, 1); if (i === list.length) i = 0; }
    }
    return { a, b, n, result: n > 0 ? list[0] : 'F', order };
  }

  // ---------- Nakshatra animal ----------
  function animal(star) {
    const y = YONI[star];
    return { star, yoni: y, emoji: EMOJI[y], rival: rival(y), twins: YONI.map((v, i) => (v === y && i !== star ? i : -1)).filter((i) => i >= 0) };
  }
  // Moon's star from a birth date (and time, India time). Without a time, also says whether the star changed that day.
  function starFromDate(y, m, d, hh, mm) {
    const A = root.Astro;
    const at = (H, M) => A.computeChart({ y, m, d, hh: H, mm: M, tz: 5.5, lat: 13.08, lon: 80.27 }).nakshatra.index;
    if (hh != null) return { star: at(hh, mm || 0), sure: true };
    const s0 = at(0, 0), s1 = at(23, 59);
    if (s0 === s1) return { star: s0, sure: true };
    // find the change time (to the minute) so the visitor can pick
    let lo = 0, hi = 24 * 60 - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (at(Math.floor(mid / 60), mid % 60) === s0) lo = mid; else hi = mid; }
    return { star: at(12, 0), sure: false, before: s0, after: s1, change: hi };
  }

  const Fun = { friendScore, tier, flames, animal, starFromDate, pairHash, letters, clean, YONI, EMOJI };
  root.Fun = Fun;
  if (typeof document === 'undefined') return;

  // ---------- Browser pages ----------
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : `{${k}}`));
  const WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.2c0-.1-.2-.2-.4-.3z"/></svg>';
  let T = null, C = null, NAK = [];
  function readText() {
    const el = $('#fun-text'); if (!el) return false;
    const j = JSON.parse(el.textContent); T = j.t; C = j.c; NAK = j.nak; return true;
  }
  // Link that opens this page with the same result, so whoever gets it on WhatsApp sees it at once and tries their own
  function pageLink(params) {
    const u = new URL(location.href.split('#')[0]); u.search = '';
    for (const [k, v] of Object.entries(params)) if (v !== '' && v != null) u.searchParams.set(k, v);
    return u.href;
  }
  function actions(shareText, link) {
    return `<div class="actions fun-actions">
  <a class="btn-wa" href="https://wa.me/?text=${encodeURIComponent(`${shareText}\n${link}`)}" target="_blank" rel="noopener">${WA}<span>${esc(C.share_wa)}</span></a>
  <button type="button" class="btn-secondary" data-act="png">${esc(C.download)}</button>
  <button type="button" class="btn-secondary" data-fun-copy="${esc(link)}">${esc(C.copy)}</button>
</div>`;
  }
  function show(html) {
    const out = $('#fun-result');
    out.innerHTML = html; out.hidden = false;
    out.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  function error(msg) { const e = $('#fun-error'); if (e) { e.textContent = msg; e.hidden = !msg; } }
  const starVal = (el) => (el && el.value !== '' ? +el.value : null);
  const query = () => new URLSearchParams(location.search);

  // Friendship score
  // ---------- Friendship cartoon scenes ----------
  // Two cartoon friends (boy or girl) with their names on tags, in one of 10 short looping scenes.
  // Drawn as SVG and animated with CSS (css/style.css, .fs-*), so it is free, light and works offline.
  const SKIN = ['#c68642', '#8d5524', '#e0ac69', '#a0672f'];
  const SHIRT = ['#e8590c', '#5f3dc4', '#0f7c7c', '#c2185b', '#1c4e9e', '#2b8a3e'];
  const first = (n) => { const w = String(n).trim().split(/\s+/)[0] || ''; const g = letters(w); return g.length > 10 ? g.slice(0, 9).join('') + '…' : w; };
  function person(x, girl, skin, shirt, name, cls, face, tagY = 60) {
    const hair = '#2b1a10';
    const body = girl
      ? `<path d="M-15 124 Q0 118 15 124 L22 172 L-22 172 Z" fill="${shirt}"/>`
      : `<rect x="-15" y="122" width="30" height="46" rx="8" fill="${shirt}"/>`;
    const hairBack = girl ? `<path d="M-18 104 Q-20 140 -12 146 L12 146 Q20 140 18 104 Z" fill="${hair}"/>` : '';
    const hairTop = girl ? `<path d="M-17 104 Q0 80 17 104 Q8 94 -2 96 Q-10 97 -17 104 Z" fill="${hair}"/><circle cx="0" cy="102" r="1.8" fill="#c2185b"/>`
      : `<path d="M-16 104 Q-14 84 2 86 Q16 86 16 102 Q8 94 -16 104 Z" fill="${hair}"/>`;
    const mouth = face === 'sad' ? '<path d="M-5 117 Q0 113 5 117" stroke="#3b1a10" stroke-width="1.8" fill="none" class="fs-mouth"/>'
      : '<path d="M-6 113 Q0 119 6 113" stroke="#3b1a10" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    const tagW = Math.max(46, Array.from(name).length * 9 + 18);
    return `<g class="fs-who ${cls}w"><g transform="translate(${x} 0)"><g class="fs-p ${cls}">
  <path d="M-7 200 L-6 168 M7 200 L6 168" stroke="#3b2a1a" stroke-width="7" stroke-linecap="round"/>
  ${hairBack}${body}
  <g class="fs-arm fs-arm-l"><path d="M-13 128 L-26 158" stroke="${skin}" stroke-width="6" stroke-linecap="round"/></g>
  <g class="fs-arm fs-arm-r"><path d="M13 128 L26 158" stroke="${skin}" stroke-width="6" stroke-linecap="round"/></g>
  <circle cx="0" cy="106" r="16" fill="${skin}"/>${hairTop}
  <circle cx="-6" cy="106" r="2" fill="#1d0b16"/><circle cx="6" cy="106" r="2" fill="#1d0b16"/>${mouth}
  <circle cx="-10" cy="112" r="3" fill="#ff8fab" opacity=".55"/><circle cx="10" cy="112" r="3" fill="#ff8fab" opacity=".55"/>
</g><g class="fs-tag"><rect x="${-tagW / 2}" y="${tagY}" width="${tagW}" height="22" rx="11" fill="#2a1a5e"/><text x="0" y="${tagY + 15}" text-anchor="middle" fill="#fff4df" font-size="13" font-weight="700">${esc(name)}</text></g></g></g>`;
  }
  // Props for each scene, drawn between and around the two friends (A at x=110, B at x=250)
  const PROPS = [
    /* 0 biryani */ '<rect x="140" y="160" width="80" height="8" rx="3" fill="#8a5300"/><ellipse cx="180" cy="157" rx="26" ry="6" fill="#fff" stroke="#ecdcc8"/><circle class="fs-mv" cx="168" cy="152" r="7" fill="#f2a516"/><text x="180" y="140" font-size="18" text-anchor="middle">🍗</text>',
    /* 1 umbrella */ '<g class="fs-rain">' + Array.from({ length: 14 }, (_, i) => `<path d="M${20 + i * 24} ${10 + (i % 3) * 14} l-4 12" stroke="#4dabf7" stroke-width="2" stroke-linecap="round"/>`).join('') + '</g><g class="fs-umb fs-under"><path d="M196 86 Q240 36 284 86 Z" fill="#c2185b"/><path d="M240 86 L240 92 Q238 100 212 104" stroke="#3b2a1a" stroke-width="3" fill="none" stroke-linecap="round"/></g>',
    /* 2 selfie */ '<rect x="160" y="70" width="18" height="30" rx="4" fill="#23163f"/><circle class="fs-flash" cx="169" cy="78" r="4" fill="#fff"/><text class="fs-float" x="180" y="60" font-size="18">💖</text><text class="fs-float fs-d2" x="210" y="70" font-size="14">✨</text>',
    /* 3 high five */ '<text class="fs-burst" x="180" y="96" font-size="34" text-anchor="middle">💥</text>',
    /* 4 chai */ '<g class="fs-cup-a"><rect x="148" y="132" width="16" height="18" rx="3" fill="#fff" stroke="#8a5300"/><path class="fs-steam" d="M152 126 q3 -6 0 -12 M160 126 q3 -6 0 -12" stroke="#b3a6cc" stroke-width="2" fill="none"/></g><g class="fs-cup-b"><rect x="196" y="132" width="16" height="18" rx="3" fill="#fff" stroke="#8a5300"/><path class="fs-steam" d="M200 126 q3 -6 0 -12 M208 126 q3 -6 0 -12" stroke="#b3a6cc" stroke-width="2" fill="none"/></g><text x="180" y="120" font-size="16" text-anchor="middle">☕</text>',
    /* 5 dance */ '<text class="fs-float" x="170" y="80" font-size="22">🎵</text><text class="fs-float fs-d2" x="196" y="64" font-size="18">🎶</text><rect x="0" y="200" width="360" height="40" fill="url(#fs-floor)"/>',
    /* 6 notes */ '<g class="fs-mv"><rect x="134" y="134" width="24" height="18" rx="2" fill="#1c4e9e"/><path d="M146 134 L146 152" stroke="#fff" stroke-width="1.5"/></g><text class="fs-float fs-d2" x="270" y="62" font-size="16">🙏</text>',
    /* 7 ice cream */ '<g class="fs-cloud"><ellipse cx="250" cy="52" rx="30" ry="14" fill="#868e96"/><path d="M234 66 l-3 10 M250 66 l-3 10 M266 66 l-3 10" stroke="#4dabf7" stroke-width="2"/></g><g class="fs-mv"><path d="M140 140 L148 160 L156 140 Z" fill="#e0ac69"/><circle cx="148" cy="136" r="8" fill="#ff8fab"/></g><text class="fs-sun" x="250" y="60" font-size="24" text-anchor="middle">☀️</text>',
    /* 8 victory */ '<g class="fs-confetti">' + Array.from({ length: 16 }, (_, i) => `<rect x="${10 + i * 22}" y="${-10 - (i % 4) * 12}" width="6" height="10" fill="${SHIRT[i % 6]}"/>`).join('') + '</g><text x="180" y="110" font-size="28" text-anchor="middle">🏆</text>',
    /* 9 hug */ '<text class="fs-float" x="172" y="70" font-size="22">❤️</text><text class="fs-float fs-d2" x="196" y="84" font-size="16">💛</text>'
  ];
  function sceneSvg(i, a, b) {
    const h = a.h;
    const pa = person(110, a.girl, SKIN[h % 4], SHIRT[h % 6], first(a.name), 'fs-a', 'happy', [2, 3, 9].includes(i) ? 204 : 60);
    const pb = person(250, b.girl, SKIN[(h >>> 3) % 4], SHIRT[((h >>> 5) % 5 + 1 + h) % 6], first(b.name), 'fs-b', i === 7 ? 'sad' : 'happy', i === 1 ? 204 : 60);
    // Umbrella goes behind the friends so the name tags stay readable
    const under = i === 1 ? PROPS[1].slice(PROPS[1].indexOf('<g class="fs-umb')) : '';
    const over = i === 1 ? PROPS[1].slice(0, PROPS[1].indexOf('<g class="fs-umb')) : PROPS[i];
    return `<svg class="fs-scene fs-s${i}" viewBox="0 0 360 230" role="img" aria-label="${esc(first(a.name))} &amp; ${esc(first(b.name))}">
<defs><linearGradient id="fs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf1e2"/><stop offset="1" stop-color="#fff"/></linearGradient>
<linearGradient id="fs-floor" x1="0" x2="1"><stop offset="0" stop-color="#ffd8a8"/><stop offset=".5" stop-color="#fcc2d7"/><stop offset="1" stop-color="#d0bfff"/></linearGradient></defs>
<rect width="360" height="230" rx="14" fill="url(#fs-sky)"/><rect y="198" width="360" height="32" fill="#e9d8c4"/>
${under}${pa}${pb}${over}</svg>`;
  }

  // Friendship score
  function initFriend() {
    const form = $('#fun-form'); if (!form) return;
    const gender = { a: false, b: false };
    form.querySelectorAll('[data-g]').forEach((btn) => btn.addEventListener('click', () => {
      const [who, g] = btn.dataset.g.split(':'); gender[who] = g === 'girl';
      form.querySelectorAll(`[data-g^="${who}:"]`).forEach((x) => x.setAttribute('aria-pressed', String(x === btn)));
    }));
    const setG = (who, girl) => { gender[who] = girl; form.querySelectorAll(`[data-g^="${who}:"]`).forEach((x) => x.setAttribute('aria-pressed', String((x.dataset.g.endsWith('girl')) === girl))); };
    const dateStar = (v) => { if (!v) return null; const [y, m, d] = v.split('-').map(Number); return starFromDate(y, m, d, 12, 0).star; };
    const run = (given) => {
      const a = $('#f-a').value.trim(), b = $('#f-b').value.trim();
      if (!clean(a) || !clean(b)) { error(C.need_names); return; }
      const sa = given ? given.sa : dateStar($('#f-da').value), sb = given ? given.sb : dateStar($('#f-db').value);
      if (!given && (sa == null || sb == null)) { error(T.need_dob); return; }
      error('');
      const r = friendScore(a, b, sa, sb);
      const [title, line] = T.tiers[tier(r.score)];
      const deg = Math.round(r.score * 3.6);
      const sc = r.h % 10;
      const pA = r.h % 10, pB = (pA + 3 + ((r.h >>> 4) % 6)) % 10;
      const bars = r.stars ? `<ul class="fun-bars">${['tara', 'gana', 'yoni', 'names'].map((k) => `<li><span>${esc(T.parts[k])}</span><span class="fun-bar" aria-hidden="true"><i style="width:${Math.round((r.parts[k] / r.max[k]) * 100)}%"></i></span><b>${r.parts[k]}/${r.max[k]}</b></li>`).join('')}</ul>` : '';
      const link = pageLink({ a, b, sa: sa ?? '', sb: sb ?? '', g: `${gender.a ? 'g' : 'b'}${gender.b ? 'g' : 'b'}` });
      show(`<div class="fun-card">
  <div class="fs-wrap">${sceneSvg(sc, { name: a, girl: gender.a, h: r.h }, { name: b, girl: gender.b })}</div>
  <p class="fs-cap">${esc(fill(T.scenes[sc], { a: first(a), b: first(b) }))}</p>
  <div class="fun-ring" style="--deg:${deg}deg" role="img" aria-label="${r.score}%"><span>${r.score}<small>%</small></span></div>
  <h2 class="fun-title">${esc(title)}</h2>
  <p class="fun-line">${esc(line)}</p>
  <ul class="fs-praise"><li>${esc(fill(T.praise[pA], { n: first(a) }))}</li><li>${esc(fill(T.praise[pB], { n: first(b) }))}</li></ul>
  ${r.stars ? `<p class="fun-count">${esc(NAK[sa])} · ${esc(NAK[sb])}</p>` : ''}
  ${bars}
  <p class="fun-note">${esc(C.fun_note)}</p>
</div>
${actions(fill(T.share, { a: first(a), b: first(b), score: r.score }), link)}
<p class="fs-replay"><button type="button" class="btn-secondary" data-fs-replay>${esc(T.replay)}</button></p>`);
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); run(null); });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-fs-replay]')) return;
      const svg = $('.fs-scene'); if (!svg) return;
      const copy = svg.cloneNode(true); svg.replaceWith(copy); // restarts the CSS animations
    });
    const q = query();
    if (q.get('a') && q.get('b')) {
      $('#f-a').value = q.get('a'); $('#f-b').value = q.get('b');
      const g = q.get('g') || 'bb'; setG('a', g[0] === 'g'); setG('b', g[1] === 'g');
      const n = (k) => (/^\d+$/.test(q.get(k) || '') && +q.get(k) < 27 ? +q.get(k) : null);
      run({ sa: n('sa'), sb: n('sb') });
    }
  }

  // FLAMES
  function initFlames() {
    const form = $('#fun-form'); if (!form) return;
    const run = () => {
      const a = $('#f-a').value.trim(), b = $('#f-b').value.trim();
      if (!clean(a) || !clean(b)) { error(C.need_names); return; }
      error('');
      const r = flames(a, b);
      const [word, line] = T.res[r.result];
      const row = (arr) => `<span class="fl-row">${arr.map((x) => `<span class="${x.cut ? 'cut' : ''}">${esc(x.ch)}</span>`).join('')}</span>`;
      const link = pageLink({ a, b });
      show(`<div class="fun-card">
  <div class="fl-letters" aria-hidden="true">${row(r.a)}${row(r.b)}</div>
  <p class="fun-count">${esc(fill(T.count, { n: r.n }))}</p>
  <p class="fl-word" aria-hidden="true">${['F', 'L', 'A', 'M', 'E', 'S'].map((x) => `<span class="${x === r.result ? 'win' : 'out'}">${x}</span>`).join('')}</p>
  <p class="fun-names">${esc(a)} + ${esc(b)} =</p>
  <h2 class="fun-title fun-big">${esc(T.emoji[r.result])} ${esc(word)}</h2>
  <p class="fun-line">${esc(line)}</p>
  ${r.n === 0 ? `<p class="fun-tip">${esc(T.same)}</p>` : ''}
  <p class="fun-note">${esc(C.fun_note)}</p>
</div>
${actions(fill(T.share, { a, b, word: `${word} ${T.emoji[r.result]}` }), link)}`);
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
    const q = query();
    if (q.get('a') && q.get('b')) { $('#f-a').value = q.get('a'); $('#f-b').value = q.get('b'); run(); }
  }

  // Nakshatra animal
  function initAnimal() {
    const form = $('#fun-form'); if (!form) return;
    const modeBtns = form.querySelectorAll('[data-mode]');
    let mode = 'star';
    const setMode = (m) => {
      mode = m;
      modeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
      $('#an-star-box').hidden = m !== 'star'; $('#an-dob-box').hidden = m !== 'dob';
    };
    modeBtns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
    const run = (starGiven) => {
      let star = starGiven, note = '';
      if (star == null) {
        if (mode === 'star') { star = starVal($('#an-star')); if (star == null) { error(T.need_star); return; } }
        else {
          const dv = $('#an-dob').value; if (!dv) { error(T.need_dob); return; }
          const [y, m, d] = dv.split('-').map(Number);
          const tv = $('#an-tob').value; const [hh, mm] = tv ? tv.split(':').map(Number) : [null, null];
          const s = starFromDate(y, m, d, hh, mm);
          star = s.star;
          if (!s.sure) {
            const t = `${String(Math.floor(s.change / 60)).padStart(2, '0')}:${String(s.change % 60).padStart(2, '0')}`;
            note = fill(T.changed, { time: t, before: NAK[s.before], after: NAK[s.after] });
          }
        }
      }
      error('');
      const r = animal(star);
      const [name, trait] = T.animals[r.yoni];
      const link = pageLink({ s: star });
      show(`<div class="fun-card">
  <p class="fun-names">${esc(fill(T.your_star, { star: NAK[star] }))}</p>
  <p class="an-emoji" aria-hidden="true">${r.emoji}</p>
  <p class="fun-count">${esc(T.result)}</p>
  <h2 class="fun-title fun-big">${esc(name)}</h2>
  <p class="fun-line">${esc(trait)}</p>
  ${note ? `<p class="fun-tip">${esc(note)}</p>` : ''}
  <dl class="an-facts">
    <div><dt>${esc(T.twins)}</dt><dd>${r.twins.length ? r.twins.map((i) => esc(NAK[i])).join(', ') : esc(T.only)}</dd></div>
    <div><dt>${esc(T.rival)}</dt><dd>${EMOJI[r.rival]} ${esc(T.animals[r.rival][0])}</dd></div>
  </dl>
  <p class="fun-note">${esc(C.fun_note)}</p>
</div>
${actions(fill(T.share, { animal: name, emoji: r.emoji, star: NAK[star] }), link)}`);
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); run(null); });
    const s = query().get('s');
    if (s != null && /^\d+$/.test(s) && +s < 27) { $('#an-star').value = s; run(+s); }
  }

  function init(kind) {
    return () => {
      if (!readText()) return;
      document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-fun-copy]'); if (!b) return;
        const done = () => { const old = b.textContent; b.textContent = C.copied; setTimeout(() => { b.textContent = old; }, 1800); };
        if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.funCopy).then(done, () => prompt('', b.dataset.funCopy));
        else prompt('', b.dataset.funCopy);
      });
      ({ friend: initFriend, flames: initFlames, animal: initAnimal })[kind]();
    };
  }
  root.RVExtra = root.RVExtra || {};
  root.RVExtra.friend = init('friend');
  root.RVExtra.flames = init('flames');
  root.RVExtra.animal = init('animal');
})(typeof window !== 'undefined' ? window : globalThis);
