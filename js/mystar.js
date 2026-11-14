/* RasiVani "YOUR star today" card (home page). Built by tools/mystar.mjs.
   Saves the chosen star (and rasi) in localStorage 'rv-mystar'. Today's palan comes from social/<lang>.json,
   Rahu kalam is worked out here with Astro.panchang, festivals are listed in the page by the nightly build. */
(function () {
  const box = document.getElementById('my-star'); if (!box) return;
  const D = JSON.parse(box.querySelector('.mystar-data').textContent);
  const t = D.t, lang = box.dataset.lang;
  const $ = (s) => box.querySelector(s);
  const form = $('.mystar-pick'), out = $('.mystar-out'), sel = $('#ms-star'), two = $('.mystar-two'), change = $('.mystar-change');
  const I = window.I18N && window.I18N.TERMS && (window.I18N.TERMS[lang] || window.I18N.TERMS.en);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const KEY = 'rv-mystar';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode: works for this visit only */ } };
  // A star covers 4 padas of 3°20'; 9 padas make a rasi. Stars 2,4,6,... can sit across two rasis.
  const rasisOf = (n) => { const a = Math.floor((n * 4) / 9), b = Math.floor((n * 4 + 3) / 9); return a === b ? [a] : [a, b]; };
  const istToday = () => { const d = new Date(Date.now() + 5.5 * 3600000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), iso: d.toISOString().slice(0, 10), hrs: d.getUTCHours() + d.getUTCMinutes() / 60 }; };
  const hm = (h) => { const m = Math.round(h * 60); return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
  let chosenRasi = null;

  sel.addEventListener('change', () => {
    const n = +sel.value; chosenRasi = null; two.hidden = true;
    if (sel.value === '') return;
    const r = rasisOf(n);
    if (r.length === 1) { chosenRasi = r[0]; return; }
    const seg = two.querySelector('.seg'); seg.textContent = '';
    r.forEach((ri) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = I.rasi[ri]; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => { chosenRasi = ri; seg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }); seg.append(b); });
    two.hidden = false;
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (sel.value === '') { sel.focus(); return; }
    if (chosenRasi == null) { two.querySelector('button') && two.querySelector('button').focus(); return; }
    save({ star: +sel.value, rasi: chosenRasi }); show();
  });
  change.addEventListener('click', () => { out.hidden = true; form.hidden = false; change.hidden = true; sel.focus(); });

  async function show() {
    const me = load(); if (!me || me.star == null || me.rasi == null) return;
    form.hidden = true; change.hidden = false; out.hidden = false;
    const today = istToday();
    // Rahu kalam for the language's main city
    let rahuHtml = '';
    try {
      const p = window.Astro.panchang({ y: today.y, m: today.m, d: today.d, hh: 12, mm: 0, tz: 5.5, lat: D.lat, lon: D.lon });
      if (p.kalam) {
        const [a, b] = p.kalam.rahu; const live = today.hrs >= a && today.hrs < b ? ' ⚠' : '';
        rahuHtml = `<div class="ms-tile"><span>${esc(fill(t.rahu, { city: D.city }))}</span><b>${hm(a)} – ${hm(b)}${live}</b>${D.kalam ? `<a href="${esc(D.kalam)}">${esc(t.other_city)}</a>` : ''}</div>`;
      }
    } catch (e) { /* astro not loaded */ }
    // Next festival
    const next = D.fest.find(([iso]) => iso >= today.iso);
    let festHtml = '';
    if (next) {
      const n = Math.round((Date.UTC(...next[0].split('-').map((x, i) => (i === 1 ? x - 1 : +x))) - Date.UTC(today.y, today.m - 1, today.d)) / 86400000);
      festHtml = `<div class="ms-tile"><span>${esc(t.next)}</span><b>${esc(next[1])}</b><em>${esc(n === 0 ? t.today : n === 1 ? t.tomorrow : fill(t.in_days, { n }))}</em></div>`;
    }
    const head = `<p class="ms-who"><strong>${esc(I.nak[me.star])}</strong> · ${esc(I.rasi[me.rasi])}</p>`;
    out.innerHTML = `${head}<div class="ms-palan"><p>${esc(t.loading)}</p></div><div class="ms-tiles">${rahuHtml}${festHtml}</div>`;
    let s = null, labels = {};
    try {
      const j = await (await fetch(`/social/${lang}.json`, { cache: 'no-cache' })).json();
      const day = j.days.find((d) => d.date === today.iso) || j.days[0];
      s = day && day.signs[me.rasi]; labels = j.labels || {};
    } catch (e) { s = null; }
    const palanUrl = s ? `/rasi-palan/${lang}/${s.slug}/` : `/rasi-palan/${lang}/`;
    const palan = $('.ms-palan');
    if (!s) { palan.innerHTML = `<p>${esc(t.failed)}</p><a class="btn-secondary" href="${palanUrl}">${esc(t.full)}</a>`; return; }
    const parts = ['work', 'money', 'health', 'family'];
    palan.innerHTML = `${s.chandra ? `<p class="ms-warn">${esc(t.chandra)}</p>` : ''}<p>${esc(s.text)}</p><p class="ms-advice">${esc(s.advice)}</p>
      <ul class="ms-scores">${parts.map((k, i) => `<li><span>${esc(labels[k] || k)}</span><b aria-label="${s.scores[i]}/5">${stars(s.scores[i])}</b></li>`).join('')}</ul>
      <p class="ms-lucky">${esc(labels.lucky_color || 'Lucky colour')}: <b>${esc(s.color)}</b> · ${esc(labels.lucky_number || 'Lucky number')}: <b>${esc(s.num)}</b></p>
      <div class="ms-actions"><a class="btn" href="${palanUrl}">${esc(t.full)}</a><a class="btn-secondary ms-wa" target="_blank" rel="noopener">${esc(t.share)}</a></div>`;
    const msg = `${t.share_line} ${I.nak[me.star]} (${I.rasi[me.rasi]}): ${s.text}\n${location.origin}/${lang === 'en' ? '' : lang + '/'}#my-star`;
    $('.ms-wa').href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }

  const me = load();
  if (me && me.star != null) { sel.value = String(me.star); chosenRasi = me.rasi; show(); }
})();
