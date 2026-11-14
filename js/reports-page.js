/* RasiVani paid reports page: free preview, Razorpay payment, unlock, PDF and email.
   The analysis runs in the browser (js/report.js). The server (Cloudflare Pages Functions in
   /functions/api) only creates the Razorpay order, verifies payment and sends the email. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  const SUPPORT = document.body.dataset.support || 'hello@rasivani.com';
  let RV, product = 'complete', current = null; // current = { inp, f, meta, key, unlocked, pid, token, email }

  const lang = () => RV.lang();
  const loaded = {};
  function loadScript(src) {
    if (!loaded[src]) loaded[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete loaded[src]; rej(new Error('load ' + src)); }; document.head.appendChild(s); });
    return loaded[src];
  }
  async function ensureText(l) { await loadScript('js/rt/en.js'); if (l !== 'en') { try { await loadScript(`js/rt/${l}.js`); } catch (e) { /* falls back to English */ } } }
  const r = (k, vars) => {
    const S = (window.RT && (window.RT[lang()] || window.RT.en)) || {}, E = (window.RT && window.RT.en) || {};
    let v = S[k] != null ? S[k] : E[k] != null ? E[k] : '';
    if (vars) v = v.replace(/\{(\w+)\}/g, (_, n) => (vars[n] != null ? vars[n] : ''));
    return v;
  };
  function paintStatic() {
    $$('[data-rt]').forEach((el) => { el.textContent = r(el.dataset.rt, el.dataset.price ? { price: el.dataset.price } : null); });
    const buy = $('#rep-buy'); if (buy) buy.textContent = r('btn_buy', { price: ReportText.PRODUCTS[product].price });
    // Products that need the v2 report text are hidden in languages that don't have it yet
    const avail = ReportText.productsFor(lang());
    $$('.prod').forEach((el) => { el.hidden = !avail.includes(el.dataset.product); });
    if (!avail.includes(product)) pickProduct('complete');
  }

  // A stable key for one person's birth data: payment unlocks only this chart
  const chartKey = (i) => [i.y, i.m, i.d, i.hh, i.mm, i.lat.toFixed(2), i.lon.toFixed(2)].join('-');

  function readForm() {
    const inp = RV.readBirth('r');
    const err = $('#rep-error');
    if (!inp) { err.textContent = RV.t('error_fill'); err.hidden = false; return null; }
    err.hidden = true;
    return inp;
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function compute(inp, gender, name) {
    const c = Astro.computeChart(inp);
    const f = Report.analyse(c, { now: new Date(), gender });
    return { inp, f, key: chartKey(inp), meta: { name, dateStr: inp.dateStr, place: inp.place.name, now: new Date() } };
  }

  async function paint() {
    if (!current) return;
    await ensureText(lang());
    const out = $('#rep-result');
    const unlocked = current.unlocked;
    const html = ReportText.render(current.f, current.meta, lang(), current.product, !unlocked);
    const payBox = unlocked ? '' : `<div class="pay-box">
        <p class="pay-head"><strong>${esc(r('preview_head'))}</strong> · ${esc(r('preview_note'))}</p>
        <button type="button" class="btn" id="rep-buy">${esc(r('btn_buy', { price: ReportText.PRODUCTS[current.product].price }))}</button>
        <p class="note">${esc(r('pay_note'))}</p><p class="note">${esc(r('delivery_note'))} <a href="refund.html" data-keep-lang>${esc(r('refund_link'))}</a></p>
        <p class="status" id="rep-status" role="status"></p>
      </div>`;
    const actions = unlocked ? `<div class="actions"><button type="button" class="btn" id="rep-pdf">${esc(r('btn_pdf'))}</button><button type="button" class="btn-secondary" id="rep-mail">${esc(r('btn_email'))}</button></div>
      <p class="status" id="rep-status" role="status">${current.statusMsg ? esc(current.statusMsg) : ''}</p>
      <p class="note">${esc(r('payment_id'))}: <code>${esc(current.pid)}</code></p>` : '';
    out.innerHTML = (unlocked ? actions : payBox) + html + (unlocked ? '' : payBox.replace(/id="rep-(buy|status)"/g, 'data-dup="$1"'));
    out.hidden = false;
    const buy = $('#rep-buy'); if (buy) buy.addEventListener('click', startPay);
    $$('[data-dup="buy"]', out).forEach((b) => b.addEventListener('click', startPay));
    const pdf = $('#rep-pdf'); if (pdf) pdf.addEventListener('click', () => makePdf().then(download).catch(() => window.print()));
    const mail = $('#rep-mail'); if (mail) mail.addEventListener('click', () => sendEmail(true));
  }
  const status = (msg, bad) => { $$('#rep-status, [data-dup="status"]').forEach((el) => { el.textContent = msg; el.classList.toggle('is-bad', !!bad); }); if (current) current.statusMsg = msg; };

  async function preview(e) {
    if (e) e.preventDefault();
    const inp = readForm(); if (!inp) return;
    const email = $('#r-email').value.trim();
    const gender = $('#r-gender').value;
    current = Object.assign(compute(inp, gender, $('#r-name').value.trim()), { product, email, gender, unlocked: false });
    // Already bought this one on this device? Open it straight away.
    const prev = (store.get('rv-reports') || []).find((x) => x.key === current.key && (x.product === product || x.product === 'complete'));
    if (prev) Object.assign(current, { unlocked: true, pid: prev.pid, token: prev.token, product: prev.product, email: prev.email || email });
    await paint();
    $('#rep-result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  // ---------- Payment ----------
  async function api(path, body) {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    let data = null; try { data = await res.json(); } catch (e) { /* not json */ }
    if (!res.ok) { const err = new Error((data && data.error) || res.status); err.code = data && data.error; throw err; }
    return data;
  }
  async function startPay() {
    if (!current) return;
    const email = $('#r-email').value.trim();
    if (!validEmail(email)) { status(r('err_email'), true); $('#r-email').focus(); return; }
    current.email = email;
    status(r('paying'));
    let order;
    try {
      order = await api('/api/order', { product: current.product, key: current.key, lang: lang(), email, name: current.meta.name });
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    } catch (e) { status(r('pay_unavailable'), true); return; }
    const rzp = new window.Razorpay({
      key: order.key_id, order_id: order.order_id, amount: order.amount, currency: 'INR',
      name: 'RasiVani', description: r('title_' + current.product), image: new URL('icons/icon-192.png', location.href).href,
      prefill: { email, name: current.meta.name || '' }, theme: { color: '#2a1a5e' },
      handler: (resp) => confirm({ order_id: resp.razorpay_order_id, payment_id: resp.razorpay_payment_id, signature: resp.razorpay_signature }),
      modal: { ondismiss: () => status('') }
    });
    rzp.on('payment.failed', () => status(r('pay_fail'), true));
    rzp.open();
  }
  async function confirm(p) {
    status('…');
    try {
      const v = await api('/api/verify', Object.assign({ product: current.product, key: current.key }, p));
      unlock(v);
      status(r('paid_ok', { email: current.email }));
      sendEmail(false);
    } catch (e) { status(r('recover_fail') + ' ' + r('payment_id') + ': ' + p.payment_id, true); }
  }
  function unlock(v) {
    Object.assign(current, { unlocked: true, pid: v.payment_id, token: v.token, product: v.product, email: v.email || current.email });
    const list = (store.get('rv-reports') || []).filter((x) => x.pid !== v.payment_id);
    list.unshift({ pid: v.payment_id, token: v.token, product: v.product, key: current.key, email: current.email, name: current.meta.name, date: current.inp.dateStr, place: current.meta.place, gender: current.gender, inp: current.inp });
    store.set('rv-reports', list.slice(0, 20));
    paint(); paintSaved();
  }
  async function recover(e) {
    e.preventDefault();
    const pid = $('#rec-id').value.trim();
    const inp = readForm(); if (!inp || !/^pay_[A-Za-z0-9]{6,}$/.test(pid)) { $('#rec-msg').textContent = r('recover_fail'); return; }
    current = Object.assign(compute(inp, $('#r-gender').value, $('#r-name').value.trim()), { product, email: $('#r-email').value.trim(), gender: $('#r-gender').value, unlocked: false });
    try {
      const v = await api('/api/verify', { payment_id: pid, key: current.key });
      $('#rec-msg').textContent = '';
      unlock(v);
      $('#rep-result').scrollIntoView({ block: 'start' });
    } catch (err) { $('#rec-msg').textContent = r('recover_fail'); }
  }

  // ---------- PDF: render the report on white A4 pages, then write a small image PDF ----------
  async function makePdf() {
    status(r('making_pdf'));
    if (!window.html2canvas) await loadScript('js/vendor/html2canvas.min.js');
    const W = 794, H = Math.round(W * 841.89 / 595.28), SCALE = 2, MARGIN = 56;
    const sheet = document.createElement('div');
    sheet.className = 'pdf-sheet';
    sheet.setAttribute('lang', lang());
    sheet.style.width = W + 'px';
    sheet.innerHTML = $('#rep-result .report').outerHTML;
    document.body.appendChild(sheet);
    try {
      await (document.fonts && document.fonts.ready);
      const canvas = await window.html2canvas(sheet, { backgroundColor: '#ffffff', scale: SCALE, width: W, windowWidth: W });
      const pageH = (H - MARGIN * 2) * SCALE, ctx = canvas.getContext('2d');
      // Cut between lines: move each cut up to the nearest all-white pixel row
      const cuts = [0];
      while (canvas.height - cuts[cuts.length - 1] > pageH) {
        let y = cuts[cuts.length - 1] + pageH;
        const row = ctx.getImageData(0, y - 240, canvas.width, 240).data;
        for (let k = 239; k >= 0; k--) {
          let blank = true;
          for (let x = 0; x < canvas.width * 4; x += 16) { if (row[k * canvas.width * 4 + x] < 245) { blank = false; break; } }
          if (blank) { y = y - 240 + k; break; }
        }
        cuts.push(y);
      }
      cuts.push(canvas.height);
      const pages = [];
      for (let i = 0; i < cuts.length - 1; i++) {
        const pg = document.createElement('canvas'); pg.width = W * SCALE; pg.height = H * SCALE;
        const g = pg.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, pg.width, pg.height);
        g.drawImage(canvas, 0, cuts[i], canvas.width, cuts[i + 1] - cuts[i], 0, MARGIN * SCALE, canvas.width, cuts[i + 1] - cuts[i]);
        g.fillStyle = '#8a7f99'; g.font = `${11 * SCALE}px system-ui, sans-serif`;
        g.fillText(`RasiVani · rasivani.com · ${current.pid || ''}`, MARGIN * SCALE, (H - 24) * SCALE);
        const pn = `${i + 1} / ${cuts.length - 1}`; g.fillText(pn, (W - MARGIN) * SCALE - g.measureText(pn).width, (H - 24) * SCALE);
        const blob = await new Promise((res) => pg.toBlob(res, 'image/jpeg', 0.82));
        pages.push({ data: new Uint8Array(await blob.arrayBuffer()), w: pg.width, h: pg.height });
      }
      status(current.statusMsg === r('making_pdf') ? '' : current.statusMsg || '');
      return imagePdf(pages);
    } finally { sheet.remove(); }
  }
  function imagePdf(pages) {
    const enc = new TextEncoder(), parts = [], offsets = [];
    let len = 0;
    const push = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
    const obj = (n, body) => { offsets[n] = len; push(`${n} 0 obj\n`); body(); push('\nendobj\n'); };
    const PW = 595.28, PH = 841.89, n = pages.length;
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
    obj(2, () => push(`<< /Type /Pages /Count ${n} /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] >>`));
    pages.forEach((p, i) => {
      const pg = 3 + i * 3, ct = pg + 1, im = pg + 2;
      obj(pg, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im${i} ${im} 0 R >> >> /Contents ${ct} 0 R >>`));
      const draw = `q ${PW} 0 0 ${PH} 0 0 cm /Im${i} Do Q`;
      obj(ct, () => push(`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`));
      obj(im, () => { push(`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.data.length} >>\nstream\n`); push(p.data); push('\nendstream'); });
    });
    const total = 3 + n * 3, xref = len;
    let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
    for (let i = 1; i < total; i++) x += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    push(x + `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(parts, { type: 'application/pdf' });
  }
  const fileName = () => `RasiVani-${current.product}-${(current.meta.name || 'report').replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 30)}.pdf`;
  function download(blob) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileName();
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  async function sendEmail(manual) {
    if (!current || !current.unlocked) return;
    const email = current.email || $('#r-email').value.trim();
    if (!validEmail(email)) { status(r('err_email'), true); return; }
    let blob;
    try { blob = await makePdf(); } catch (e) { status(r('email_fail', { support: SUPPORT, id: current.pid }), true); return; }
    if (!manual) download(blob);
    status(r('email_sending'));
    try {
      const buf = new Uint8Array(await blob.arrayBuffer());
      let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
      await api('/api/email', { payment_id: current.pid, product: current.product, key: current.key, token: current.token, email, lang: lang(),
        name: current.meta.name, title: r('title_' + current.product), filename: fileName(), pdf: btoa(bin) });
      status(r('email_sent', { email }));
    } catch (e) { status(r('email_fail', { support: SUPPORT, id: current.pid }), true); }
  }

  // ---------- Saved reports on this device ----------
  function paintSaved() {
    const box = $('#rep-saved'), list = store.get('rv-reports') || [];
    if (!box) return;
    box.hidden = !list.length;
    box.querySelector('ul').innerHTML = list.map((x, i) => `<li><button type="button" class="link-btn" data-open="${i}">${esc(r('title_' + x.product))} · ${esc(x.name || '–')} · ${esc(x.date)}</button></li>`).join('');
  }
  function openSaved(i) {
    const x = (store.get('rv-reports') || [])[i]; if (!x) return;
    current = Object.assign(compute(Object.assign({}, x.inp, { place: { name: x.place } }), x.gender, x.name), { product: x.product, unlocked: true, pid: x.pid, token: x.token, email: x.email, gender: x.gender });
    paint().then(() => $('#rep-result').scrollIntoView({ block: 'start' }));
  }

  function pickProduct(p) {
    product = p;
    $$('.prod').forEach((el) => el.setAttribute('aria-checked', String(el.dataset.product === p)));
    if (current && !current.unlocked) { current.product = p; paint(); }
  }

  window.initReports = function (api) {
    RV = api;
    // Play Store app: digital goods must use Play billing, so the paid section is hidden in the app
    if (document.documentElement.classList.contains('in-app')) { $('#rep-app').hidden = false; $('#rep-main').hidden = true; return; }
    $('#rep-place').innerHTML = RV.placeField('r');
    RV.wirePlace('r');
    const qp = new URLSearchParams(location.search).get('report');
    $$('.prod').forEach((el) => el.addEventListener('click', () => pickProduct(el.dataset.product)));
    pickProduct(ReportText.PRODUCTS[qp] ? qp : 'complete');
    ensureText(lang()).then(paintStatic);
    $('#rep-form').addEventListener('submit', preview);
    $('#rec-form').addEventListener('submit', recover);
    $('#rep-saved').addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (b) openSaved(+b.dataset.open); });
    const lastEmail = store.get('rv-email'); if (lastEmail) $('#r-email').value = lastEmail;
    $('#r-email').addEventListener('change', (e) => store.set('rv-email', e.target.value.trim()));
    RV.onLang(async () => { await ensureText(lang()); paintStatic(); paintSaved(); if (current) paint(); });
  };
})();
