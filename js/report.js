/* RasiVani in-depth report engine.
   Reads a chart from Astro.computeChart and applies classical Parashari rules to produce
   language-independent facts (keys and numbers). report-text.js turns the facts into text in
   any of the 10 languages, so every language uses the same analysis. */
(function (root) {
  'use strict';
  const A = root.Astro;
  const PL7 = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const RASI_LORD = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
  const EXALT = { sun: 0, moon: 1, mars: 9, mercury: 5, jupiter: 3, venus: 11, saturn: 6 };
  const OWN = { sun: [4], moon: [3], mars: [0, 7], mercury: [2, 5], jupiter: [8, 11], venus: [1, 6], saturn: [9, 10] };
  const FRIENDS = {
    sun: { f: ['moon', 'mars', 'jupiter'], e: ['venus', 'saturn'] },
    moon: { f: ['sun', 'mercury'], e: [] },
    mars: { f: ['sun', 'moon', 'jupiter'], e: ['mercury'] },
    mercury: { f: ['sun', 'venus'], e: ['moon'] },
    jupiter: { f: ['sun', 'moon', 'mars'], e: ['mercury', 'venus'] },
    venus: { f: ['mercury', 'saturn'], e: ['sun', 'moon'] },
    saturn: { f: ['mercury', 'venus'], e: ['sun', 'moon', 'mars'] }
  };
  const COMBUST = { moon: 12, mars: 17, mercury: 14, jupiter: 11, venus: 10, saturn: 15 };
  const KENDRA = [1, 4, 7, 10], TRIKONA = [1, 5, 9], DUSTHANA = [6, 8, 12];
  const DASHA_ORDER = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
  const YEAR = 365.2425 * 86400000, DAY = 86400000;

  const hFrom = (fromRasi, rasi) => ((rasi - fromRasi + 12) % 12) + 1;
  const sepDeg = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

  function dignity(key, rasi) {
    if (!EXALT.hasOwnProperty(key)) return 'neutral';
    if (EXALT[key] === rasi) return 'exalted';
    if ((EXALT[key] + 6) % 12 === rasi) return 'debilitated';
    if (OWN[key].includes(rasi)) return 'own';
    const lord = RASI_LORD[rasi];
    if (FRIENDS[key].f.includes(lord)) return 'friend';
    if (FRIENDS[key].e.includes(lord)) return 'enemy';
    return 'neutral';
  }
  const DIG_SCORE = { exalted: 5, own: 4, friend: 3, neutral: 2, enemy: 1, debilitated: 0 };

  // Vedic aspects: every planet sees the 7th; Mars also 4th, 8th; Jupiter 5th, 9th; Saturn 3rd, 10th.
  const ASPECTS = { mars: [4, 7, 8], jupiter: [5, 7, 9], saturn: [3, 7, 10] };
  const aspectsOf = (key) => ASPECTS[key] || [7];
  function aspects(p, targetRasi) { return aspectsOf(p.key).includes(hFrom(p.rasi, targetRasi)); }

  function bhuktis(md) {
    const Y = A.DASHA_YEARS[md.lord];
    let t0 = md.end.getTime() - Y * YEAR;
    const start = DASHA_ORDER.indexOf(md.lord), out = [];
    for (let i = 0; i < 9; i++) {
      const lord = DASHA_ORDER[(start + i) % 9], len = Y * A.DASHA_YEARS[lord] / 120 * YEAR;
      if (t0 + len > md.start.getTime()) out.push({ md: md.lord, ad: lord, start: new Date(Math.max(t0, md.start.getTime())), end: new Date(t0 + len) });
      t0 += len;
    }
    return out;
  }

  // Sidereal rasi of a slow planet on a date (location does not matter for planets)
  function transitAt(date) {
    const c = A.computeChart({ y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate(), hh: 12, mm: 0, tz: 0, lat: 0, lon: 0 });
    const by = {}; c.planets.forEach((p) => { by[p.key] = p; });
    return by;
  }

  function analyse(c, opts = {}) {
    const now = opts.now || new Date();
    const birth = c.dasha.periods[0].start;
    const L = c.lagna.rasi;
    const P = {}; c.planets.forEach((p) => { P[p.key] = p; });
    const house = (key) => hFrom(L, P[key].rasi);
    const lordOf = (h) => RASI_LORD[(L + h - 1) % 12];
    const rules = (key) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((h) => lordOf(h) === key);
    const inHouse = (h) => c.planets.filter((p) => house(p.key) === h).map((p) => p.key);

    // Strength of each planet: sign dignity, house placement, combustion
    const S = {};
    PL7.forEach((k) => {
      const p = P[k], dig = dignity(k, p.rasi), h = house(k);
      const combust = k !== 'sun' && sepDeg(p.lon, P.sun.lon) < COMBUST[k] * (p.retro && (k === 'mercury' || k === 'venus') ? 0.85 : 1);
      let score = DIG_SCORE[dig];
      if (KENDRA.includes(h) || TRIKONA.includes(h)) score += 1;
      if (DUSTHANA.includes(h)) score -= 1;
      if (combust) score -= 1;
      if (h === 10 || h === 11) score += 0.5;
      S[k] = { key: k, dignity: dig, house: h, combust, retro: p.retro, score, rules: rules(k) };
    });
    ['rahu', 'ketu'].forEach((k) => { S[k] = { key: k, dignity: 'neutral', house: house(k), combust: false, retro: true, score: DUSTHANA.includes(house(k)) ? 2.5 : 2, rules: [] }; });
    const level = (k) => { const s = S[k].score; return s >= 4.5 ? 'strong' : s >= 2.5 ? 'medium' : 'weak'; };

    // ---------- Yogas ----------
    const yogas = [];
    const moonH = (key) => hFrom(P.moon.rasi, P[key].rasi);
    if (KENDRA.includes(moonH('jupiter'))) yogas.push({ key: 'gajakesari', planets: ['jupiter', 'moon'] });
    if (P.sun.rasi === P.mercury.rasi && !S.mercury.combust) yogas.push({ key: 'budhaditya', planets: ['sun', 'mercury'] });
    if (P.moon.rasi === P.mars.rasi) yogas.push({ key: 'chandramangala', planets: ['moon', 'mars'] });
    const MP = { mars: 'ruchaka', mercury: 'bhadra', jupiter: 'hamsa', venus: 'malavya', saturn: 'sasa' };
    Object.keys(MP).forEach((k) => { if (['exalted', 'own'].includes(S[k].dignity) && KENDRA.includes(S[k].house)) yogas.push({ key: MP[k], planets: [k] }); });
    const together = (a, b) => a !== b && ((P[a].rasi === P[b].rasi && !DUSTHANA.includes(S[a].house)) || (OWN[a] && OWN[b] && OWN[a].includes(P[b].rasi) && OWN[b].includes(P[a].rasi)));
    // Raja yoga: a kendra lord joins a trikona lord
    const rajaPairs = [];
    [4, 7, 10].forEach((k) => [5, 9].forEach((t) => {
      const a = lordOf(k), b = lordOf(t);
      if (together(a, b) && !rajaPairs.some((x) => x.includes(a) && x.includes(b))) rajaPairs.push([a, b]);
    }));
    // A single planet ruling both a kendra and a trikona (yogakaraka)
    const ykPlanet = PL7.find((k) => rules(k).some((h) => [4, 7, 10].includes(h)) && rules(k).some((h) => [5, 9].includes(h)));
    if (ykPlanet && level(ykPlanet) !== 'weak') yogas.push({ key: 'yogakaraka', planets: [ykPlanet] });
    rajaPairs.forEach((pr) => yogas.push({ key: 'raja', planets: pr }));
    const dhanaPairs = [];
    [2, 11].forEach((w) => [1, 5, 9].forEach((t) => {
      const a = lordOf(w), b = lordOf(t);
      if (together(a, b) && !dhanaPairs.some((x) => x.includes(a) && x.includes(b))) dhanaPairs.push([a, b]);
    }));
    dhanaPairs.forEach((pr) => yogas.push({ key: 'dhana', planets: pr }));
    const vip = [6, 8, 12].filter((h) => [6, 8, 12].includes(S[lordOf(h)].house) && !rules(lordOf(h)).includes(1)).map(lordOf);
    if (vip.length) yogas.push({ key: 'vipareeta', planets: Array.from(new Set(vip)) });
    const amala = ['jupiter', 'venus', 'mercury'].filter((k) => S[k].house === 10 || moonH(k) === 10);
    if (amala.length) yogas.push({ key: 'amala', planets: amala });
    PL7.forEach((k) => {
      if (S[k].dignity !== 'debilitated') return;
      const disp = RASI_LORD[P[k].rasi], exLord = RASI_LORD[EXALT[k]];
      if ([disp, exLord].some((d) => d !== k && (KENDRA.includes(S[d].house) || KENDRA.includes(moonH(d))))) yogas.push({ key: 'neechabhanga', planets: [k] });
    });
    // Kemadruma: Moon alone, nothing in 2nd/12th from it (Sun, Rahu, Ketu excluded)
    const near = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'].some((k) => [1, 2, 12].includes(moonH(k)));
    const kemaCancel = KENDRA.includes(S.moon.house) || ['mars', 'mercury', 'jupiter', 'venus', 'saturn'].some((k) => KENDRA.includes(moonH(k)));
    const kemadruma = !near ? (kemaCancel ? 'cancelled' : 'present') : 'none';

    // ---------- Mangal (Kuja / Chevvai) dosha ----------
    const DOSHA_H = [2, 4, 7, 8, 12];
    const refs = { lagna: L, moon: P.moon.rasi, venus: P.venus.rasi };
    const from = {}; Object.keys(refs).forEach((r) => { const h = hFrom(refs[r], P.mars.rasi); from[r] = { house: h, dosha: DOSHA_H.includes(h) }; });
    const mr = P.mars.rasi, mh = from.lagna.house;
    const cancel = [];
    if (['own', 'exalted'].includes(S.mars.dignity)) cancel.push('own_sign');
    if (P.jupiter.rasi === mr || aspects(P.jupiter, mr)) cancel.push('jupiter');
    if (P.moon.rasi === mr) cancel.push('moon');
    const HOUSE_EX = { 2: [2, 5], 4: [0, 7], 7: [3, 9], 8: [8, 11], 12: [1, 6] };
    if (HOUSE_EX[mh] && HOUSE_EX[mh].includes(mr)) cancel.push('house_sign');
    const doshaCount = Object.values(from).filter((x) => x.dosha).length;
    let mangal = 'none';
    if (doshaCount) mangal = cancel.length ? 'cancelled' : doshaCount >= 2 ? 'present' : 'mild';
    // Rahu-Ketu (sarpa / naga) dosha used in Tamil and Kerala matching
    const rk = ['rahu', 'ketu'].filter((k) => [1, 2, 7, 8].includes(S[k].house)).map((k) => ({ key: k, house: S[k].house }));
    const rahuLon = P.rahu.lon;
    const side = c.planets.filter((p) => PL7.includes(p.key)).map((p) => ((p.lon - rahuLon + 360) % 360) < 180);
    const kalasarpa = side.every((x) => x) || side.every((x) => !x);

    // ---------- Houses for each life area ----------
    const houseInfo = (h) => {
      const lord = lordOf(h);
      return { h, sign: (L + h - 1) % 12, lord, lordHouse: S[lord].house, lordDignity: S[lord].dignity, lordLevel: level(lord), occupants: inHouse(h),
        aspectedBy: c.planets.filter((p) => PL7.includes(p.key) && aspects(p, (L + h - 1) % 12)).map((p) => p.key) };
    };
    const benefic = (k) => ['jupiter', 'venus', 'mercury', 'moon'].includes(k);

    // Dasha-bhukti list from birth to 100 years
    const allB = []; c.dasha.periods.forEach((md) => allB.push(...bhuktis(md)));
    const currentB = allB.find((b) => b.start <= now && now < b.end) || allB[0];
    const currentMd = c.dasha.periods.find((d) => d.start <= now && now < d.end) || c.dasha.periods[0];

    // Pick the best bhuktis inside a window, by significator weights. Jupiter's transit adds support.
    function bestPeriods(weights, fromDate, toDate, max, jupHouses) {
      const scored = allB.filter((b) => b.end > fromDate && b.start < toDate && (b.end - b.start) > 45 * DAY).map((b) => {
        let s = (weights[b.md] || 0) + 2 * (weights[b.ad] || 0);
        let jup = false;
        if (jupHouses) {
          const mid = new Date((Math.max(b.start, fromDate) + Math.min(b.end, toDate)) / 2);
          const jh = hFrom(P.moon.rasi, transitAt(mid).jupiter.rasi);
          if (jupHouses.includes(jh)) { s += 1.5; jup = true; }
        }
        return Object.assign({}, b, { score: s, jup, start: new Date(Math.max(b.start, fromDate)), end: new Date(Math.min(b.end, toDate)) });
      }).filter((b) => b.score >= 4 && b.end - b.start > 60 * DAY);
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, max).sort((a, b) => a.start - b.start);
    }
    const addW = (w, k, v) => { w[k] = (w[k] || 0) + v; };
    const ageAt = (yrs) => new Date(birth.getTime() + yrs * YEAR);
    const later = (a, b) => (a > b ? a : b);

    // ---------- Career ----------
    const tenth = houseInfo(10);
    const cw = {}; addW(cw, tenth.lord, 3); tenth.occupants.forEach((k) => addW(cw, k, 2)); addW(cw, lordOf(11), 2);
    addW(cw, 'sun', 1); addW(cw, 'saturn', 1); addW(cw, lordOf(1), 1); addW(cw, lordOf(9), 1);
    // Career planets: 10th lord, 10th occupants, planets aspecting 10th, ranked by strength
    const careerCand = {};
    const bump = (k, v) => { if (k) careerCand[k] = (careerCand[k] || 0) + v; };
    bump(tenth.lord, 3); tenth.occupants.forEach((k) => bump(k, 3)); tenth.aspectedBy.forEach((k) => bump(k, 1));
    bump(RASI_LORD[(P.moon.rasi + 9) % 12], 1);
    const tenthNav = RASI_LORD[(c.lagna.navamsa + 9) % 12]; bump(tenthNav, 1);
    Object.keys(careerCand).forEach((k) => { careerCand[k] += (S[k] ? S[k].score : 2) / 2; });
    const careerPlanets = Object.keys(careerCand).sort((a, b) => careerCand[b] - careerCand[a]).slice(0, 3);
    const seventhLord = lordOf(7), sixthLord = lordOf(6);
    let biz = 0, job = 0;
    if ([7, 11].includes(tenth.lordHouse)) biz += 2;
    if (tenth.lordHouse === 6) job += 2;
    if (level('mercury') === 'strong') biz += 1;
    if (level(seventhLord) === 'strong') biz += 1;
    if (level(sixthLord) === 'strong') job += 1;
    if (tenth.occupants.includes('saturn') || tenth.lord === 'saturn') job += 1;
    if (tenth.occupants.includes('mercury') || tenth.occupants.includes('rahu')) biz += 1;
    if (S.mars.house === 10 || S.mars.house === 3) biz += 1;
    const workMode = biz - job >= 2 ? 'business' : job - biz >= 2 ? 'job' : 'both';
    const govt = (S.sun.house === 10 || tenth.lord === 'sun' || P.sun.rasi === P[tenth.lord].rasi || aspects(P.sun, tenth.sign)) && level('sun') !== 'weak';
    const twelfth = lordOf(12);
    const foreign = [10, 12, 9].includes(S.rahu.house) || S[twelfth].house === 10 || S[tenth.lord].house === 12 || tenth.lordHouse === 9 && S[lordOf(9)].house === 12;
    const careerPeriods = bestPeriods(cw, now, new Date(now.getTime() + 20 * YEAR), 5, [2, 5, 9, 10, 11]);

    // ---------- Money ----------
    const second = houseInfo(2), eleventh = houseInfo(11);
    const mw = {}; addW(mw, second.lord, 3); addW(mw, eleventh.lord, 3); addW(mw, lordOf(9), 1.5); addW(mw, lordOf(5), 1); addW(mw, 'jupiter', 1);
    second.occupants.forEach((k) => benefic(k) && addW(mw, k, 1)); eleventh.occupants.forEach((k) => addW(mw, k, 1.5));
    const moneyLevel = (S[second.lord].score + S[eleventh.lord].score + S.jupiter.score) / 3;
    const moneyPeriods = bestPeriods(mw, now, new Date(now.getTime() + 20 * YEAR), 4, [2, 5, 9, 11]);

    // ---------- Marriage ----------
    const seventh = houseInfo(7);
    const d9Seventh = RASI_LORD[(c.lagna.navamsa + 6) % 12];
    const ww = {}; addW(ww, 'venus', 2); addW(ww, seventh.lord, 3); seventh.occupants.forEach((k) => addW(ww, k, 2)); addW(ww, d9Seventh, 1); addW(ww, lordOf(2), 1); addW(ww, lordOf(11), 1);
    if (opts.gender === 'f') addW(ww, 'jupiter', 1.5); else addW(ww, 'venus', 0.5);
    const marriageFrom = later(now, ageAt(21)), marriageTo = later(ageAt(38), new Date(now.getTime() + 8 * YEAR));
    const marriagePeriods = bestPeriods(ww, marriageFrom, marriageTo, 4, [1, 2, 5, 7, 9, 11]);
    const sevenAfflict = seventh.occupants.filter((k) => ['saturn', 'mars', 'rahu', 'ketu', 'sun'].includes(k));
    const sevenBenefic = seventh.occupants.filter(benefic).concat(seventh.aspectedBy.filter((k) => k === 'jupiter'));
    // Best matching stars: run the 10 poruthams against every star (first pada's rasi)
    let matchStars = [];
    if (opts.gender === 'm' || opts.gender === 'f') {
      const me = { star: c.nakshatra.index, rasi: c.moonRasi };
      for (let s = 0; s < 27; s++) {
        let best = null;
        for (let pd = 1; pd <= 4; pd++) {
          const other = { star: s, rasi: A.rasiFromStarPada(s, pd) };
          const r = opts.gender === 'f' ? A.porutham(me, other) : A.porutham(other, me);
          if (!best || r.score > best.score) best = Object.assign({ star: s }, r);
        }
        if (best.rajjuOk && best.vedhaOk && best.score >= 7) matchStars.push({ star: s, score: best.score });
      }
      matchStars.sort((a, b) => b.score - a.score || a.star - b.star);
      matchStars = matchStars.slice(0, 8);
    }

    // ---------- Education, health ----------
    const fourth = houseInfo(4), fifth = houseInfo(5), sixth = houseInfo(6), first = houseInfo(1);
    const studyPlanets = ['mercury', 'jupiter', fifth.lord, fourth.lord].filter((k, i, a) => a.indexOf(k) === i).sort((a, b) => S[b].score - S[a].score);
    const eduLevel = (S.mercury.score + S.jupiter.score + S[fifth.lord].score + S[fourth.lord].score) / 4;
    const lagnaLord = lordOf(1);
    const healthLevel = (S[lagnaLord].score + S.sun.score + S.moon.score) / 3 - (first.occupants.filter((k) => ['saturn', 'rahu', 'ketu', 'mars'].includes(k)).length * 0.5);

    // ---------- Saturn & Jupiter transits (gochara) from the Moon ----------
    function saturnHouseAt(d) { return hFrom(P.moon.rasi, transitAt(d).saturn.rasi); }
    const sadePhase = (h) => (h === 12 ? 1 : h === 1 ? 2 : h === 2 ? 3 : 0);
    const satNowH = saturnHouseAt(now);
    // walk month by month to find the edges of the current and next Sade Sati
    function findEdge(startDate, test, dir, limitYears) {
      let t = startDate.getTime(); const step = 30 * DAY * dir, lim = t + dir * limitYears * YEAR;
      let prev = test(new Date(t));
      while ((dir > 0 ? t < lim : t > lim)) {
        const nt = t + step, cur = test(new Date(nt));
        if (cur !== prev) { // bisect to the day
          let a = t, b = nt;
          while (Math.abs(b - a) > DAY) { const m = (a + b) / 2; if (test(new Date(m)) === prev) a = m; else b = m; }
          return new Date(dir > 0 ? b : a);
        }
        t = nt;
      }
      return null;
    }
    // Sade Sati spans: sample every 15 days, join runs split by Saturn's retrograde, refine edges to the day
    const inSade = (d) => sadePhase(saturnHouseAt(d)) > 0;
    const spans = [];
    { const step = 15 * DAY, t0 = now.getTime() - 9 * YEAR, t1 = now.getTime() + 32 * YEAR;
      let run = null;
      for (let t = t0; t <= t1; t += step) {
        if (inSade(new Date(t))) { if (run && t - run.e <= 2 * YEAR) run.e = t; else { run = { s: t, e: t }; spans.push(run); } }
      }
      const edge = (a, b, want) => { while (b - a > DAY) { const m = (a + b) / 2; if (inSade(new Date(m)) === want) b = m; else a = m; } return new Date(b); };
      spans.forEach((r) => { r.start = r.s - step < t0 ? null : edge(r.s - step, r.s, true); r.end = r.e + step > t1 ? null : edge(r.e, r.e + step, false); });
    }
    const curSpan = spans.find((r) => r.s <= now.getTime() + 15 * DAY && now.getTime() <= r.e + 15 * DAY && sadePhase(satNowH));
    const nextSpan = spans.find((r) => r.s > now.getTime());
    const sade = { phase: sadePhase(satNowH), satHouse: satNowH };
    if (curSpan) { sade.start = curSpan.start; sade.end = curSpan.end; }
    else if (nextSpan) { sade.nextStart = nextSpan.start; sade.nextEnd = nextSpan.end; }
    const tr = transitAt(now);
    const jupNowH = hFrom(P.moon.rasi, tr.jupiter.rasi);
    const jupNext = findEdge(now, (d) => transitAt(d).jupiter.rasi, 1, 2);

    // ---------- Remedy planets: weakest planets that rule or sit in key houses, plus current dasha lord if weak ----------
    const remedy = PL7.filter((k) => level(k) === 'weak').sort((a, b) => S[a].score - S[b].score).slice(0, 2);
    if (!remedy.includes(currentMd.lord) && (currentMd.lord === 'rahu' || currentMd.lord === 'ketu' || level(currentMd.lord) === 'weak')) remedy.push(currentMd.lord);
    if (sade.phase && !remedy.includes('saturn')) remedy.push('saturn');
    if (mangal === 'present' && !remedy.includes('mars')) remedy.push('mars');

    // Timeline: maha dashas that run during the next 25 years with the bhukti lords
    const timeline = c.dasha.periods.filter((d) => d.end > now && d.start < new Date(now.getTime() + 25 * YEAR)).map((d) => ({
      lord: d.lord, start: d.start, end: d.end, current: d === currentMd, house: S[d.lord].house, rules: S[d.lord].rules, level: level(d.lord)
    }));

    return {
      lagna: L, lagnaLord, moonRasi: P.moon.rasi, star: c.nakshatra.index, pada: c.nakshatra.pada, element: L % 4,
      S, level: (k) => level(k), yogas, kemadruma,
      mangal: { level: mangal, from, cancel, marsHouse: mh, marsRasi: mr }, rk, kalasarpa,
      career: { tenth, careerPlanets, workMode, govt, foreign, periods: careerPeriods },
      money: { second, eleventh, level: moneyLevel >= 4 ? 'strong' : moneyLevel >= 2.5 ? 'medium' : 'weak', periods: moneyPeriods },
      marriage: { seventh, venus: S.venus, d9Seventh, afflict: sevenAfflict, benefic: sevenBenefic, periods: marriagePeriods, matchStars },
      education: { fourth, fifth, studyPlanets, level: eduLevel >= 3.8 ? 'strong' : eduLevel >= 2.5 ? 'medium' : 'weak' },
      health: { first, sixth, level: healthLevel >= 3.8 ? 'strong' : healthLevel >= 2.4 ? 'medium' : 'weak' },
      transit: { sade, jupHouse: jupNowH, jupRasi: tr.jupiter.rasi, satRasi: tr.saturn.rasi, jupNext },
      dasha: { currentMd, currentB, timeline },
      remedy, gender: opts.gender || ''
    };
  }

  // Free preview teaser counts (shown before payment)
  function teaser(f) {
    return { yogas: f.yogas.length, periods: f.career.periods.length + f.marriage.periods.length, mangalChecked: true };
  }

  root.Report = { analyse, teaser, dignity, RASI_LORD, bhuktis, transitAt, hFrom };
})(typeof window !== 'undefined' ? window : globalThis);
