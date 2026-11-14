/* RasiVani: baby-names finder on /<lang>/baby-names/. Star + pada, or birth date (+ time) → the name letter and a link
   to that star's page. Text comes from the page (#bn-text). Uses Astro (js/astro.js) for the date mode. */
(function (root) {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));

  function init() {
    const form = $('#bn-form'), node = $('#bn-text'); if (!form || !node) return;
    const D = JSON.parse(node.textContent), F = D.f;
    let mode = 'star';
    const btns = form.querySelectorAll('[data-mode]');
    const setMode = (m) => {
      mode = m;
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
      $('#bn-star-box').hidden = m !== 'star'; $('#bn-dob-box').hidden = m !== 'dob';
    };
    btns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
    const error = (m) => { const e = $('#bn-error'); e.textContent = m; e.hidden = !m; };
    const at = (y, mo, d, hh, mm) => root.Astro.computeChart({ y, m: mo, d, hh, mm, tz: 5.5, lat: 13.08, lon: 80.27 }).nakshatra;

    function show(star, pada, note) {
      const res = $('#bn-result');
      const head = pada ? fill(F.result, { star: D.nak[star], pada, letter: D.letters[star][pada - 1] }) : fill(F.result_all, { star: D.nak[star], letters: D.letters[star].join(', ') });
      res.innerHTML = `<div class="fun-card bn-card">
  <p class="an-emoji" aria-hidden="true">👶</p>
  <h2 class="fun-title">${esc(head)}</h2>
  ${pada ? `<p class="bn-big">${esc(D.letters[star][pada - 1])}</p>` : ''}
  ${note ? `<p class="fun-tip">${esc(note)}</p>` : ''}
  <p><a class="btn bn-btn" href="${D.href[star]}${pada ? `#pada-${pada}` : ''}">${esc(F.see)} →</a></p>
</div>`;
      res.hidden = false;
      res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (mode === 'star') {
        const s = $('#bn-star').value; if (s === '') { error(F.need_star); return; }
        const p = $('#bn-pada').value;
        error(''); show(+s, p ? +p : 0, '');
        return;
      }
      const dv = $('#bn-dob').value; if (!dv) { error(F.need_dob); return; }
      error('');
      const [y, mo, d] = dv.split('-').map(Number);
      const tv = $('#bn-tob').value;
      if (tv) { const [hh, mm] = tv.split(':').map(Number); const n = at(y, mo, d, hh, mm); show(n.index, n.pada, ''); return; }
      const a = at(y, mo, d, 0, 0), b = at(y, mo, d, 23, 59);
      if (a.index === b.index) { show(a.index, 0, F.result_note); return; }
      let lo = 0, hi = 24 * 60 - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (at(y, mo, d, Math.floor(mid / 60), mid % 60).index === a.index) lo = mid; else hi = mid; }
      const time = `${String(Math.floor(hi / 60)).padStart(2, '0')}:${String(hi % 60).padStart(2, '0')}`;
      show(at(y, mo, d, 12, 0).index, 0, fill(F.changed, { time, before: D.nak[a.index], after: D.nak[b.index] }));
    });
  }
  root.RVExtra = root.RVExtra || {};
  root.RVExtra.babynames = init;
})(typeof window !== 'undefined' ? window : globalThis);
