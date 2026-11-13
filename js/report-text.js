/* RasiVani report writer: turns Report.analyse() facts into HTML in any language.
   Strings live in js/rt/<lang>.js (window.RT[lang]); planet, sign and star names come from js/i18n.js. */
(function (root) {
  'use strict';
  // Prices are fixed on the server in lib/rv-pay.js. `v2` products and sections need the v2 text in js/rt/<lang>.js (RT[lang].v2).
  const PRODUCTS = {
    career: { price: 49, sections: ['summary', 'career', 'pcareer', 'money', 'pmoney', 'yogas', 'transit', 'dashanow', 'remedies', 'method'] },
    marriage: { price: 49, sections: ['summary', 'marriage', 'mangal', 'rk', 'match', 'pmarriage', 'transit', 'dashanow', 'remedies', 'method'] },
    birth: { price: 49, v2: true, sections: ['summary', 'basics', 'planets', 'personality', 'education', 'health', 'dashanow', 'transit', 'lucky', 'method'] },
    complete: { price: 99, sections: ['summary', 'basics', 'planets', 'personality', 'education', 'career', 'pcareer', 'money', 'pmoney', 'marriage', 'mangal', 'rk', 'match', 'pmarriage', 'health', 'yogas', 'transit', 'year12', 'dasha', 'remedies', 'lucky', 'method'] }
  };
  const V2_SECTIONS = ['basics', 'planets', 'year12'];
  // Sections that share one "source / today / science" box
  const NOTE_KEY = { pcareer: 'dasha', pmoney: 'dasha', pmarriage: 'dasha', dashanow: 'dasha' };
  const hasV2 = (lang) => !!(root.RT && root.RT[lang] && root.RT[lang].v2);
  const productsFor = (lang) => Object.keys(PRODUCTS).filter((k) => !PRODUCTS[k].v2 || hasV2(lang));
  const sectionsFor = (product, lang) => PRODUCTS[product].sections.filter((k) => hasV2(lang) || !V2_SECTIONS.includes(k));
  const SEC_TITLE = { summary: 'sec_summary', personality: 'sec_personality', education: 'sec_education', career: 'sec_career', pcareer: 'sec_pcareer', money: 'sec_money', pmoney: 'sec_pmoney',
    marriage: 'sec_marriage', mangal: 'sec_mangal', rk: 'sec_rk', match: 'sec_match', pmarriage: 'sec_pmarriage', health: 'sec_health', yogas: 'sec_yogas', transit: 'sec_transit',
    dasha: 'sec_dasha', dashanow: 'sec_dashanow', remedies: 'sec_remedies', lucky: 'sec_lucky', method: 'sec_method',
    basics: 'sec_basics', planets: 'sec_planets', year12: 'sec_year12' };
  const WEEKDAY = { sun: 0, moon: 1, mars: 2, mercury: 3, jupiter: 4, venus: 5, saturn: 6 };
  const NUMBER = { sun: 1, moon: 2, jupiter: 3, rahu: 4, mercury: 5, venus: 6, ketu: 7, saturn: 8, mars: 9 };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function make(lang) {
    const S = (root.RT && root.RT[lang]) || root.RT.en, E = root.RT.en;
    const TT = root.I18N.TERMS[lang] || root.I18N.TERMS.en;
    const UI = root.I18N.UI[lang] || root.I18N.UI.en;
    // {name} plain value; house values are {h: n} or {hs: [n, ...]} and may carry a grammatical case: {house@in}, {house@of}
    const hfmt = (n, mod) => { const f = (mod && (S['hn_' + mod] || E['hn_' + mod])) || S.hn || E.hn; return f(n); };
    const s = (k, vars) => {
      let v = S[k] != null ? S[k] : E[k];
      if (v == null) return k;
      if (vars) v = v.replace(/\{(\w+)(?:@(\w+))?\}/g, (_, n, mod) => {
        const x = vars[n];
        if (x == null) return '';
        if (x.h) return hfmt(x.h, mod);
        if (x.hs) return list(x.hs.map((h) => hfmt(h, mod)));
        return x;
      });
      return v;
    };
    const pl = (k) => TT.planet[k];
    const list = (arr) => { arr = arr.filter(Boolean); if (arr.length < 2) return arr.join(''); return arr.slice(0, -1).join(S.comma || ', ') + (S.and || E.and) + arr[arr.length - 1]; };
    const hn = (n) => ({ h: n });
    const listP = (arr) => arr.filter(Boolean).join(S.semi || E.semi || '; ');
    const hm = (n) => (S.HM || E.HM)[n - 1];
    const dg = (d) => s('dig_' + d);
    const lv = (l) => s('lv_' + l);
    const date = (d) => (d ? d.toLocaleDateString(lang === 'en' ? 'en-IN' : `${lang}-IN`, { day: 'numeric', month: 'short', year: 'numeric' }) : '–');
    const locale = lang === 'en' ? 'en-IN' : `${lang}-IN`;
    return { S, s, pl, list, listP, hn, hm, dg, lv, date, TT, UI, locale };
  }

  function houseBlock(x, H, f) {
    const { s, pl, list, hn, hm, dg, lv } = x;
    const out = [s('lord_line', { house: hn(H.h), planet: pl(H.lord), house2: hn(H.lordHouse), meaning2: hm(H.lordHouse), dignity: dg(H.lordDignity), level: lv(H.lordLevel) })];
    out.push(H.occupants.length ? s('occ_line', { list: list(H.occupants.map(pl)) }) : s('occ_none'));
    const asp = H.aspectedBy.filter((k) => !H.occupants.includes(k));
    if (asp.length) out.push(s('asp_line', { list: list(asp.map(pl)) }));
    return out;
  }

  function periodTable(x, rows, introKey) {
    const { s, pl, date } = x;
    if (!rows.length) return `<p>${esc(s('per_none'))}</p>`;
    return `<p>${esc(s(introKey))}</p><div class="table-wrap"><table><thead><tr><th scope="col">${esc(s('th_period'))}</th><th scope="col">${esc(s('th_from'))}</th><th scope="col">${esc(s('th_to'))}</th><th scope="col">${esc(s('th_note'))}</th></tr></thead><tbody>${
      rows.map((r) => `<tr><th scope="row">${esc(pl(r.md))} – ${esc(pl(r.ad))}</th><td>${esc(date(r.start))}</td><td>${esc(date(r.end))}</td><td>${r.jup ? esc(s('per_jup')) : ''}</td></tr>`).join('')}</tbody></table></div>`;
  }

  const P = (arr) => arr.filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join('');

  function section(key, f, meta, x) {
    const { s, pl, list, listP, hn, hm, dg, lv, date, TT, UI } = x;
    switch (key) {
      case 'summary': {
        const cb = f.dasha.currentB;
        const rows = [[UI.lagna, TT.rasi[f.lagna]], [UI.moon_sign, TT.rasi[f.moonRasi]], [UI.birth_star, `${TT.nak[f.star]} · ${UI.pada} ${f.pada}`],
          [s('sum_dasha'), s('sum_dasha_v', { md: pl(cb.md), ad: pl(cb.ad), end: date(cb.end) })],
          [s('sec_career'), lv(f.career.tenth.lordLevel)], [s('sec_money'), lv(f.money.level)],
          [s('sec_mangal'), s('mg_short_' + f.mangal.level)], [s('sec_yogas'), String(f.yogas.length)]];
        return `<dl class="detail-grid">${rows.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`;
      }
      case 'personality': {
        const lagnaLordH = f.S[f.lagnaLord].house;
        return P([(x.S.LAGNA || root.RT.en.LAGNA)[f.lagna], (x.S.MOON || root.RT.en.MOON)[f.moonRasi],
          s('pers_lord', { planet: pl(f.lagnaLord), house: hn(lagnaLordH), meaning: hm(lagnaLordH) }),
          s('pers_star', { star: TT.nak[f.star], pada: f.pada, planet: pl(['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'][f.star % 9]) })]);
      }
      case 'education': {
        const E = f.education, ED = x.S.ED || root.RT.en.ED;
        return P([s('ed_' + E.level), ...houseBlock(x, E.fifth, f), ...houseBlock(x, E.fourth, f).slice(0, 1),
          s('ed_subjects', { list: listP(E.studyPlanets.slice(0, 2).map((k) => ED[k])) })]);
      }
      case 'career': {
        const C = f.career, PF = x.S.PF || root.RT.en.PF;
        const out = [s('car_intro', { sign: TT.rasi[C.tenth.sign] }), ...houseBlock(x, C.tenth, f),
          s('car_fields', { list: list(C.careerPlanets.map(pl)) })];
        let html = P(out) + `<ul>${C.careerPlanets.map((k) => `<li><strong>${esc(pl(k))}</strong>: ${esc(PF[k])}</li>`).join('')}</ul>`;
        html += P([s('car_' + C.workMode), C.govt ? s('car_govt') : null, C.foreign ? s('car_foreign') : null]);
        return html;
      }
      case 'pcareer': return periodTable(x, f.career.periods, 'per_intro_career');
      case 'pmoney': return periodTable(x, f.money.periods, 'per_intro_money');
      case 'pmarriage': return periodTable(x, f.marriage.periods, 'per_intro_marriage');
      case 'money': {
        const M = f.money;
        const dh = f.yogas.filter((y) => y.key === 'dhana' || y.key === 'raja' || y.key === 'yogakaraka');
        return P([s('mon_lords', { p1: pl(M.second.lord), h1: hn(M.second.lordHouse), l1: lv(M.second.lordLevel), p2: pl(M.eleventh.lord), h2: hn(M.eleventh.lordHouse), l2: lv(M.eleventh.lordLevel) }),
          M.eleventh.occupants.length ? s('mon_11occ', { list: list(M.eleventh.occupants.map(pl)) }) : null,
          s('mon_' + M.level), dh.length ? s('mon_yogas', { list: list(dh.map((y) => s('y_' + y.key))) }) : null]);
      }
      case 'marriage': {
        const W = f.marriage;
        const overall = (f.S[W.seventh.lord].score + W.venus.score) / 2 - W.afflict.length * 0.5;
        return P([s('mar_intro', { sign: TT.rasi[W.seventh.sign] }), ...houseBlock(x, W.seventh, f),
          s('mar_venus', { house: hn(W.venus.house), meaning: hm(W.venus.house), dignity: dg(W.venus.dignity) }),
          W.benefic.length ? s('mar_ben', { list: list(W.benefic.map(pl)) }) : null,
          W.afflict.length ? s('mar_aff', { list: list(W.afflict.map(pl)) }) : null,
          s('mar_d9', { planet: pl(W.d9Seventh) }),
          s('mar_overall', { level: lv(overall >= 3.8 ? 'strong' : overall >= 2.3 ? 'medium' : 'weak') })]);
      }
      case 'mangal': {
        const M = f.mangal;
        const out = [s('mg_from', { h1: M.from.lagna.house, h2: M.from.moon.house, h3: M.from.venus.house })];
        if (M.level === 'none') out.push(s('mg_none'));
        else {
          const n = Object.values(M.from).filter((v) => v.dosha).length;
          out.push(M.level === 'mild' ? s('mg_mild') : s('mg_present', { n }));
          if (M.level === 'cancelled') { out.push(s('mg_cancelled')); M.cancel.forEach((c) => out.push('• ' + s('mg_c_' + c))); }
          out.push(s(M.level === 'cancelled' ? 'mg_advice_c' : 'mg_advice'));
        }
        return P(out);
      }
      case 'rk': return P([f.rk.length ? f.rk.map((r) => s('rk_yes', { planet: pl(r.key), house: hn(r.house) })).join(' ') : s('rk_none'), s(f.kalasarpa ? 'ks_yes' : 'ks_no')]);
      case 'match': {
        const st = f.marriage.matchStars;
        if (!f.gender) return P([s('ms_nogender')]);
        if (!st.length) return P([s('ms_none')]);
        return P([s('ms_intro')]) + `<ul class="cols">${st.map((m) => `<li>${esc(TT.nak[m.star])} <span class="muted">(${m.score}/10)</span></li>`).join('')}</ul>`;
      }
      case 'health': return P([s('he_' + f.health.level), (x.S.HE || root.RT.en.HE)[f.element], s('he_note')]);
      case 'yogas': {
        const items = f.yogas.map((y) => `<li><strong>${esc(s('y_' + y.key))}</strong> · ${esc(s('yf', { list: list(y.planets.map(pl)) }))}<br>${esc(s('yd_' + y.key))}</li>`);
        if (f.kemadruma !== 'none') items.push(`<li><strong>${esc(s('y_kemadruma'))}</strong><br>${esc(s('yd_kemadruma_' + f.kemadruma))}</li>`);
        return items.length ? `<ul class="yogas">${items.join('')}</ul>` : P([s('yoga_none')]);
      }
      case 'transit': {
        const T = f.transit, sd = T.sade, out = [s('tr_sat', { sign: TT.rasi[T.satRasi], house: hn(sd.satHouse) })];
        if (sd.phase) out.push(s('tr_sade', { phase: sd.phase, start: date(sd.start), end: date(sd.end) }));
        else if (sd.satHouse === 8) out.push(s('tr_ashtama'));
        else if (sd.satHouse === 4) out.push(s('tr_ardha'));
        else if ([3, 6, 11].includes(sd.satHouse)) out.push(s('tr_sat_good'));
        if (!sd.phase && sd.nextStart) out.push(s('tr_sade_next', { start: date(sd.nextStart), end: date(sd.nextEnd) }));
        out.push(s('tr_jup', { sign: TT.rasi[T.jupRasi], house: hn(T.jupHouse) }));
        out.push(s([2, 5, 7, 9, 11].includes(T.jupHouse) ? 'tr_jup_good' : 'tr_jup_mid'));
        if (T.jupNext) out.push(s('tr_jup_next', { date: date(T.jupNext) }));
        return P(out);
      }
      case 'dashanow':
      case 'dasha': {
        const rows = key === 'dasha' ? f.dasha.timeline : f.dasha.timeline.filter((d) => d.current).concat(f.dasha.timeline.filter((d) => !d.current).slice(0, 1));
        const out = [key === 'dasha' ? s('da_intro') : null];
        rows.forEach((d) => {
          const base = { planet: pl(d.lord), from: date(d.start), to: date(d.end), house: hn(d.house), meaning: x.hm(d.house), level: lv(d.level) };
          let line = d.rules.length
            ? s('da_line', Object.assign(base, { houses: { hs: d.rules }, themes: listP(d.rules.map((h) => x.hm(h))) }))
            : s('da_node', Object.assign(base, { lord: pl(root.Report.RASI_LORD[(f.lagna + d.house - 1) % 12]) }));
          if (d.current) line += ' ' + s('da_now');
          out.push(line);
        });
        return P(out);
      }
      case 'remedies': {
        const R = x.S.REM || root.RT.en.REM;
        if (!f.remedy.length) return P([s('rem_none')]);
        return P([s('rem_intro')]) + `<ul>${f.remedy.map((k) => `<li>${esc(R[k])}</li>`).join('')}</ul>`;
      }
      case 'lucky': {
        const k = f.lagnaLord, C = x.S.COL || root.RT.en.COL;
        return P([s('lk_line', { day: TT.weekday[WEEKDAY[k]], colour: C[k], num: NUMBER[k], planet: pl(k) })]);
      }
      case 'basics': {
        const starLord = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'][f.star % 9];
        const rows = [[UI.lagna, TT.rasi[f.lagna]], [UI.moon_sign, TT.rasi[f.moonRasi]], [UI.birth_star, `${TT.nak[f.star]} · ${UI.pada} ${f.pada}`],
          [s('bas_starlord'), pl(starLord)], [s('bas_lagnalord'), pl(f.lagnaLord)], [s('bas_element'), s('el_' + f.element)]];
        return `<dl class="detail-grid">${rows.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>` +
          P([s('bas_lagna', { sign: TT.rasi[f.lagna] }), s('bas_rasi', { sign: TT.rasi[f.moonRasi] }), s('bas_star', { star: TT.nak[f.star], pada: f.pada, planet: pl(starLord) })]);
      }
      case 'planets': {
        const order = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'saturn', 'venus', 'rahu', 'ketu'];
        const PM = x.S.PM || {};
        return `<ul class="planets">${order.map((k) => {
          const p = f.S[k], sign = TT.rasi[(f.lagna + p.house - 1) % 12];
          const tags = [k === 'rahu' || k === 'ketu' ? null : dg(p.dignity), p.combust ? s('pl_combust') : null, p.retro && k !== 'rahu' && k !== 'ketu' ? s('pl_retro') : null].filter(Boolean).join(', ');
          const line = s('pl_line', { planet: pl(k), sign, house: hn(p.house), meaning: hm(p.house) }) + (tags ? ` (${tags})` : '');
          return `<li><strong>${esc(pl(k))}</strong>: ${esc(line)}${PM[k] ? `<br><span class="muted">${esc(PM[k])}</span>` : ''}</li>`;
        }).join('')}</ul>`;
      }
      case 'year12': {
        const R = root.Report, now = meta.now || new Date();
        const months = [];
        let prev = null;
        for (let i = 0; i < 12; i++) {
          const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 15));
          const md = f.dasha.timeline.find((t) => t.start <= d && t.end > d); if (!md) continue;
          const ad = R.bhuktis(md).find((b) => b.start <= d && b.end > d); if (!ad) continue;
          const tr = R.transitAt(d), jh = R.hFrom(f.moonRasi, tr.jupiter.rasi), sh = R.hFrom(f.moonRasi, tr.saturn.rasi);
          const lvl = f.level(ad.ad);
          let score = lvl === 'strong' ? 2 : lvl === 'medium' ? 1 : 0;
          score += [2, 5, 7, 9, 11].includes(jh) ? 1 : 0;
          score += [3, 6, 11].includes(sh) ? 1 : [1, 8, 12].includes(sh) ? -1 : 0;
          const rules = f.S[ad.ad].rules.length ? f.S[ad.ad].rules : [f.S[ad.ad].house];
          const out = score >= 3 ? 'good' : score >= 1 ? 'mixed' : 'slow';
          const notes = [];
          if (prev && prev.ad !== ad.ad) notes.push(s('yr_newad', { planet: pl(ad.ad) }));
          if (prev && prev.jup !== tr.jupiter.rasi) notes.push(s('yr_jup', { sign: TT.rasi[tr.jupiter.rasi], house: hn(jh) }));
          if (prev && prev.sat !== tr.saturn.rasi) notes.push(s('yr_sat', { sign: TT.rasi[tr.saturn.rasi], house: hn(sh) }));
          if (!prev) notes.push(s('yr_start', { jhouse: hn(jh), shouse: hn(sh) }));
          prev = { ad: ad.ad, jup: tr.jupiter.rasi, sat: tr.saturn.rasi };
          months.push({ d, md: md.lord, ad: ad.ad, focus: hm(rules[0]), note: notes.join(' '), out });
        }
        const mfmt = (d) => d.toLocaleDateString(x.locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
        return P([s('yr_intro')]) + `<div class="table-wrap"><table class="year12"><thead><tr><th scope="col">${esc(s('yr_month'))}</th><th scope="col">${esc(s('th_period'))}</th><th scope="col">${esc(s('yr_outlook'))}</th><th scope="col">${esc(s('yr_focus'))}</th></tr></thead><tbody>${
          months.map((m) => `<tr><th scope="row">${esc(mfmt(m.d))}</th><td>${esc(pl(m.md))} – ${esc(pl(m.ad))}</td><td class="out-${m.out}">${esc(s('yr_' + m.out))}</td><td class="wrap">${esc(m.focus)}${m.note ? `<br><span class="muted">${esc(m.note)}</span>` : ''}</td></tr>`).join('')}</tbody></table></div>` + P([s('yr_key')]);
      }
      case 'method': return P([s('method'), UI.disclaimer]);
    }
    return '';
  }

  // "Where this comes from" box: classical source, what it means today, and an honest science note.
  // Only shown in languages that carry the v2 text; never mixed with English.
  function notes(k, x) {
    const S = x.S; if (!S.v2) return '';
    const n = NOTE_KEY[k] || k, rows = [['src', S['src_' + n]], ['now', S['now_' + n]], ['sci', S['sci_' + n]]].filter((r) => r[1]);
    if (!rows.length) return '';
    return `<aside class="rep-notes">${rows.map(([t, v]) => `<p class="rn rn-${t}"><strong>${esc(S['lbl_' + t])}</strong> ${esc(v)}</p>`).join('')}</aside>`;
  }

  // product: career | marriage | birth | complete. locked: show only titles + teasers (free preview)
  function render(f, meta, lang, product, locked) {
    const x = make(lang), { s, date, UI } = x;
    const prod = PRODUCTS[product];
    const head = `<header class="rep-head"><p class="rep-kicker">RasiVani · rasivani.com</p><h2>${esc(s('title_' + product))}</h2>
      <p>${esc(s('r_for', { name: meta.name || '–' }))}</p>
      <p class="muted">${esc(meta.dateStr)} · ${esc(meta.place)} · ${esc(s('r_basis'))}</p>
      <p class="muted">${esc(s('r_generated', { date: date(meta.now || new Date()) }))}</p></header>`;
    const secs = sectionsFor(product, lang);
    const body = secs.map((k, i) => {
      const open = !locked || k === 'summary' || (locked && k === 'basics');
      const title = `<h3><span class="rep-n">${i + 1}</span>${esc(s(SEC_TITLE[k]))}</h3>`;
      if (open) return `<section class="rep-sec" data-sec="${k}">${title}${section(k, f, meta, x)}${k === 'summary' || k === 'method' ? '' : notes(k, x)}</section>`;
      return `<section class="rep-sec is-locked" data-sec="${k}">${title}<p class="lock-line">${esc(teaserLine(k, f, x))}</p></section>`;
    }).join('');
    return `<article class="report" lang="${lang}">${head}${body}</article>`;
  }

  function teaserLine(k, f, x) {
    const { s } = x;
    if (k === 'yogas') return s('teaser_yogas', { n: f.yogas.length + (f.kemadruma !== 'none' ? 1 : 0) });
    if (k === 'pcareer') return s('teaser_periods', { n: f.career.periods.length });
    if (k === 'pmoney') return s('teaser_periods', { n: f.money.periods.length });
    if (k === 'pmarriage') return s('teaser_periods', { n: f.marriage.periods.length });
    if (k === 'match' && f.gender) return s('teaser_match', { n: f.marriage.matchStars.length });
    if (k === 'mangal') return s('teaser_mangal');
    if (k === 'year12' || k === 'planets') return s('teaser_' + k);
    return s('locked');
  }

  root.ReportText = { PRODUCTS, render, make, productsFor, sectionsFor, hasV2 };
})(typeof window !== 'undefined' ? window : globalThis);
