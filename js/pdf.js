/* RasiVani A4 PDF export.
   Lays the result out on a fixed A4-width sheet (always light colours), captures it with html2canvas and
   places it on 1 A4 page, or at most 2, splitting only between sections. If it would need more, everything
   is scaled down to fit 2 pages. */
(function (root) {
  'use strict';
  const PAGE_W = 210, PAGE_H = 297, M = 10, FOOT = 7;            // mm
  const CW = PAGE_W - 2 * M, CH = PAGE_H - 2 * M - FOOT;           // usable content box
  const SHEET_PX = 760;                                            // layout width of the sheet

  function load(src) {
    return new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s); });
  }

  // Greedy split of section boxes [top, bottom] (px) into pages of `cap` px. Returns cut positions.
  function cuts(boxes, total, cap) {
    const out = []; let start = 0;
    while (total - start > cap) {
      let best = null;
      for (const b of boxes) if (b.top > start && b.top - start <= cap) best = b.top;
      if (best == null) best = start + cap;                         // a single section taller than a page
      out.push(best); start = best;
    }
    return out;
  }

  async function save(el, filename, footer) {
    if (!root.html2canvas) await load('js/vendor/html2canvas.min.js');
    if (!root.jspdf) await load('js/vendor/jspdf.umd.min.js');
    const html = document.documentElement, prevTheme = html.getAttribute('data-theme');
    html.setAttribute('data-theme', 'light');
    const sheet = document.createElement('div');
    sheet.className = 'pdf-sheet';
    sheet.style.width = SHEET_PX + 'px';
    sheet.appendChild(el.cloneNode(true));
    document.body.appendChild(sheet);
    try {
      await (document.fonts && document.fonts.ready);
      const body = sheet.firstElementChild;
      const sheetTop = sheet.getBoundingClientRect().top;
      const boxes = [...body.children].filter((n) => n.offsetHeight > 0).map((n) => {
        const r = n.getBoundingClientRect(); return { top: Math.round(r.top - sheetTop), bottom: Math.round(r.bottom - sheetTop) };
      });
      const canvas = await root.html2canvas(sheet, { backgroundColor: '#ffffff', scale: 2, useCORS: true, windowWidth: SHEET_PX + 40 });
      const totalPx = sheet.offsetHeight, k = canvas.width / sheet.offsetWidth;
      // mm per css px at full content width, and the page capacity in px
      let mmPerPx = CW / sheet.offsetWidth;
      let capPx = CH / mmPerPx;
      let cutList = cuts(boxes, totalPx, capPx);
      if (cutList.length && totalPx * mmPerPx * 0.8 <= CH) {         // a little over one page: shrink onto 1 page
        mmPerPx = CH / totalPx; cutList = [];
      } else if (cutList.length > 1) {                                      // would be 3+ pages: shrink to fit 2
        let s = 0.98;
        while (cutList.length > 1 && s > 0.4) { capPx = CH / (mmPerPx * s); cutList = cuts(boxes, totalPx, capPx); if (cutList.length > 1) s -= 0.03; }
        mmPerPx *= s;
      }
      const { jsPDF } = root.jspdf;
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
      const edges = [0, ...cutList, totalPx];
      for (let i = 0; i < edges.length - 1; i++) {
        const y0 = edges[i], y1 = edges[i + 1], hPx = y1 - y0;
        const part = document.createElement('canvas');
        part.width = canvas.width; part.height = Math.ceil(hPx * k);
        const ctx = part.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, part.width, part.height);
        ctx.drawImage(canvas, 0, Math.floor(y0 * k), canvas.width, part.height, 0, 0, part.width, part.height);
        if (i > 0) pdf.addPage('a4', 'portrait');
        const wMm = sheet.offsetWidth * mmPerPx, x = (PAGE_W - wMm) / 2;
        pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', x, M, wMm, hPx * mmPerPx, undefined, 'FAST');
        pdf.setFontSize(8); pdf.setTextColor(110);
        pdf.text(footer || 'RasiVani · rasivani.com', M, PAGE_H - M + 2);
        if (edges.length > 2) pdf.text(`${i + 1} / ${edges.length - 1}`, PAGE_W - M, PAGE_H - M + 2, { align: 'right' });
      }
      pdf.save(filename);
      return edges.length - 1;
    } finally {
      sheet.remove();
      if (prevTheme == null) html.removeAttribute('data-theme'); else html.setAttribute('data-theme', prevTheme);
    }
  }
  root.RVPdf = { save };
})(window);
