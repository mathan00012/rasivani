/* RasiVani astronomy + Vedic astrology engine.
   Pure functions, no dependencies. Sidereal positions use the Lahiri (Chitrapaksha) ayanamsa.
   Accuracy: Sun/Moon within a few arc-minutes, planets within a few arc-minutes (JPL approximate
   Keplerian elements plus fitted Jupiter-Saturn terms, valid 1850-2050). Good enough for rasi/nakshatra/lagna in nearly all cases. */
(function (root) {
  'use strict';
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const norm = (x) => ((x % 360) + 360) % 360;
  const sin = (d) => Math.sin(d * D2R), cos = (d) => Math.cos(d * D2R);

  // Julian Day from local civil date/time and UTC offset in hours
  function julianDay(y, m, d, hour, minute, tz) {
    const ut = hour + minute / 60 - tz;
    let Y = y, M = m;
    if (M <= 2) { Y -= 1; M += 12; }
    const A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5 + ut / 24;
  }
  const centuries = (jd) => (jd - 2451545.0) / 36525;

  function ayanamsa(jd) {
    const T = centuries(jd);
    return 23.85306 + 1.396971 * T + 0.0003086 * T * T;
  }

  function sunTropical(jd) {
    const T = centuries(jd);
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
    const omega = 125.04 - 1934.136 * T;
    return norm(L0 + C - 0.00569 - 0.00478 * sin(omega));
  }

  // Meeus ch. 47, principal longitude terms: [D, M, M', F, coefficient * 1e-6 deg]
  const MOON_TERMS = [
    [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],
    [0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],
    [0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],
    [0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
    [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],
    [4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],
    [1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],
    [2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
    [2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],
    [2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487]
  ];
  function moonTropical(jd) {
    const T = centuries(jd);
    const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
    const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
    const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;
    const E = 1 - 0.002516 * T - 0.0000074 * T * T;
    const A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T;
    let s = 0;
    for (const [d, m, mp, f, c] of MOON_TERMS) {
      let term = c * sin(d * D + m * M + mp * Mp + f * F);
      if (Math.abs(m) === 1) term *= E; else if (Math.abs(m) === 2) term *= E * E;
      s += term;
    }
    s += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
    const nutation = -0.00478 * sin(125.04452 - 1934.136261 * T);
    return norm(Lp + s / 1e6 + nutation);
  }

  function meanNode(jd) {
    const T = centuries(jd);
    return norm(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
  }

  // JPL approximate elements (J2000 ecliptic): a, e, I, L, longPeri, longNode and their rates per century
  const ELEMENTS = {
    mercury: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593,
              0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
    venus:   [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255,
              0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
    earth:   [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0,
              0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
    mars:    [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891,
              0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
    jupiter: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909,
              -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
    saturn:  [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448,
              -0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]
  };
  function helio(name, T) {
    const el = ELEMENTS[name];
    const a = el[0] + el[6] * T, e = el[1] + el[7] * T, I = el[2] + el[8] * T;
    const L = el[3] + el[9] * T, wbar = el[4] + el[10] * T, node = el[5] + el[11] * T;
    const w = wbar - node;
    let M = norm(L - wbar); if (M > 180) M -= 360;
    let E = M + R2D * e * sin(M);
    for (let i = 0; i < 8; i++) {
      const dM = M - (E - R2D * e * sin(E));
      E += dM / (1 - e * cos(E));
    }
    const xp = a * (cos(E) - e), yp = a * Math.sqrt(1 - e * e) * sin(E);
    const cw = cos(w), sw = sin(w), cO = cos(node), sO = sin(node), cI = cos(I), sI = sin(I);
    return {
      x: (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
      y: (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
      z: (sw * sI) * xp + (cw * sI) * yp
    };
  }
  // Jupiter and Saturn pull on each other (the "great inequality"), which plain Keplerian orbits miss by up to
  // ~15'. These terms were fitted to a full ephemeris (VSOP87 via astronomy-engine, 1850-2060) and bring
  // both planets to within 1' of it. Arguments are multiples of the two mean anomalies.
  const GI_ARGS = [[2, -5], [1, -2], [2, -4], [1, 0], [0, 1], [2, -6], [3, -5], [1, -1], [2, -2], [2, -3], [1, -3], [0, 2], [2, 0], [1, -5], [3, -6], [4, -10]];
  const GI_COEF = {"jupiter": [-0.29947, -0.4592, -0.16225, -0.78122, -0.03604, -0.00046, -0.00162, 0.00422, -0.00359, 0.02252, -0.00168, -0.00158, -0.00224, 0.00037, 0.01075, 0.00737, -0.00392, 0.02314, -0.05152, -0.02082, 0.01257, 0.01662, -0.00238, -0.00096, 0.00264, 0.00016, 0.00079, -8e-05, 0.01587, 0.00107, 0.00128, -6e-05, -0.13245, 0.01916], "saturn": [0.56539, 0.19369, 0.64924, 0.29732, 0.10826, -0.00471, -0.0128, -0.08042, 0.00317, 0.008, 0.13276, 0.02821, 0.03249, 0.04894, 0.00329, -0.00148, 0.00958, 0.00198, 0.00824, 0.00357, 0.00402, 0.00569, 0.00906, -0.00313, 0.00277, -0.00035, -9e-05, -0.00015, 0.00268, 0.00141, 0.00345, -0.00095, 0.11456, -0.12392]};
  function greatInequality(name, T) {
    const k = GI_COEF[name]; if (!k) return 0;
    const Mj = ELEMENTS.jupiter[3] + ELEMENTS.jupiter[9] * T - ELEMENTS.jupiter[4] - ELEMENTS.jupiter[10] * T;
    const Ms = ELEMENTS.saturn[3] + ELEMENTS.saturn[9] * T - ELEMENTS.saturn[4] - ELEMENTS.saturn[10] * T;
    let d = k[0] + k[1] * T;
    GI_ARGS.forEach(([a, b], i) => { const x = a * Mj + b * Ms; d += k[2 + 2 * i] * sin(x) + k[3 + 2 * i] * cos(x); });
    return d;
  }
  function planetTropical(name, jd) {
    const T = centuries(jd);
    const p = helio(name, T), e = helio('earth', T);
    const dl = greatInequality(name, T);
    if (dl) { const r = Math.hypot(p.x, p.y), l = Math.atan2(p.y, p.x) + dl * D2R; p.x = r * Math.cos(l); p.y = r * Math.sin(l); }
    const lonJ2000 = norm(Math.atan2(p.y - e.y, p.x - e.x) * R2D);
    return norm(lonJ2000 + 1.3969713 * T); // precess J2000 -> equinox of date
  }

  function obliquity(jd) { return 23.4392911 - 0.0130042 * centuries(jd); }
  function siderealTimeDeg(jd, lonEast) {
    const T = centuries(jd);
    return norm(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T + lonEast);
  }
  function ascendantTropical(jd, lat, lonEast) {
    const th = siderealTimeDeg(jd, lonEast), eps = obliquity(jd);
    return norm(Math.atan2(cos(th), -(sin(th) * cos(eps) + Math.tan(lat * D2R) * sin(eps))) * R2D);
  }

  const PLANET_KEYS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
  function tropicalOf(key, jd) {
    switch (key) {
      case 'sun': return sunTropical(jd);
      case 'moon': return moonTropical(jd);
      case 'rahu': return meanNode(jd);
      case 'ketu': return norm(meanNode(jd) + 180);
      default: return planetTropical(key, jd);
    }
  }

  const NAK_SPAN = 360 / 27;
  function nakshatraOf(sidLon) {
    const idx = Math.floor(sidLon / NAK_SPAN);
    const within = sidLon - idx * NAK_SPAN;
    return { index: idx, pada: Math.floor(within / (NAK_SPAN / 4)) + 1, fraction: within / NAK_SPAN };
  }

  // Vimshottari dasha
  const DASHA_LORDS = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
  const DASHA_YEARS = { ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 };
  const YEAR_MS = 365.2425 * 86400000;
  function vimshottari(moonSid, birthDate) {
    const nk = nakshatraOf(moonSid);
    const start = nk.index % 9;
    const firstLord = DASHA_LORDS[start];
    const balanceYears = DASHA_YEARS[firstLord] * (1 - nk.fraction);
    const periods = [];
    let t = birthDate.getTime();
    for (let i = 0; i < 9; i++) {
      const lord = DASHA_LORDS[(start + i) % 9];
      const yrs = i === 0 ? balanceYears : DASHA_YEARS[lord];
      const end = t + yrs * YEAR_MS;
      periods.push({ lord, start: new Date(t), end: new Date(end), years: yrs });
      t = end;
    }
    return { balanceLord: firstLord, balanceYears, periods };
  }

  // Full chart. input: {y,m,d,hh,mm,tz,lat,lon}
  function computeChart(inp) {
    const jd = julianDay(inp.y, inp.m, inp.d, inp.hh, inp.mm, inp.tz);
    const ayan = ayanamsa(jd);
    const sid = (x) => norm(x - ayan);
    const planets = PLANET_KEYS.map((key) => {
      const lon = sid(tropicalOf(key, jd));
      let retro = false;
      if (key === 'rahu' || key === 'ketu') retro = true;
      else if (key !== 'sun' && key !== 'moon') {
        let diff = tropicalOf(key, jd + 0.5) - tropicalOf(key, jd - 0.5);
        if (diff > 180) diff -= 360; if (diff < -180) diff += 360;
        retro = diff < 0;
      }
      return { key, lon, rasi: Math.floor(lon / 30), deg: lon % 30, nak: nakshatraOf(lon), navamsa: Math.floor(lon / (30 / 9)) % 12, retro };
    });
    const lagnaLon = sid(ascendantTropical(jd, inp.lat, inp.lon));
    const lagna = { key: 'lagna', lon: lagnaLon, rasi: Math.floor(lagnaLon / 30), deg: lagnaLon % 30, nak: nakshatraOf(lagnaLon), navamsa: Math.floor(lagnaLon / (30 / 9)) % 12 };
    const moon = planets[1];
    const birthUtc = new Date(Date.UTC(inp.y, inp.m - 1, inp.d, inp.hh, inp.mm) - inp.tz * 3600000);
    return { jd, ayanamsa: ayan, planets, lagna, moonRasi: moon.rasi, nakshatra: moon.nak, dasha: vimshottari(moon.lon, birthUtc) };
  }

  // ---------- Panchangam ----------
  function sunRiseSet(y, m, d, lat, lon, tz) {
    // Iterative: compute declination/EoT at local noon, then refine once at each event
    function eventAt(approxHourLocal, rising) {
      const jd = julianDay(y, m, d, Math.floor(approxHourLocal), (approxHourLocal % 1) * 60, tz);
      const T = centuries(jd);
      const lam = sunTropical(jd), eps = obliquity(jd);
      const decl = Math.asin(sin(eps) * sin(lam)) * R2D;
      const L0 = norm(280.46646 + 36000.76983 * T);
      const ra = norm(Math.atan2(cos(eps) * sin(lam), cos(lam)) * R2D);
      let eot = L0 - 0.0057183 - ra; if (eot > 180) eot -= 360; if (eot < -180) eot += 360; // degrees
      const cosH = (sin(-0.833) - sin(lat) * sin(decl)) / (cos(lat) * cos(decl));
      if (cosH > 1 || cosH < -1) return null;
      const H = Math.acos(cosH) * R2D;
      const noon = 12 - lon / 15 - eot / 15 + tz;
      return rising ? noon - H / 15 : noon + H / 15;
    }
    let rise = eventAt(6, true), set = eventAt(18, false);
    if (rise != null) rise = eventAt(rise, true);
    if (set != null) set = eventAt(set, false);
    return { rise, set };
  }

  const KALAM = { rahu: [7, 1, 6, 4, 5, 3, 2], yama: [4, 3, 2, 1, 0, 6, 5], gulika: [6, 5, 4, 3, 2, 1, 0] };

  function panchang(inp) {
    const jd = julianDay(inp.y, inp.m, inp.d, inp.hh, inp.mm, inp.tz);
    const ayan = ayanamsa(jd);
    const sunS = norm(sunTropical(jd) - ayan), moonS = norm(moonTropical(jd) - ayan);
    const elong = norm(moonS - sunS);
    const tithi = Math.floor(elong / 12); // 0..29
    const yoga = Math.floor(norm(sunS + moonS) / NAK_SPAN);
    const half = Math.floor(elong / 6); // 0..59
    let karana;
    if (half === 0) karana = 10; else if (half >= 57) karana = 7 + (half - 57); else karana = (half - 1) % 7;
    const weekday = new Date(Date.UTC(inp.y, inp.m - 1, inp.d)).getUTCDay();
    const rs = sunRiseSet(inp.y, inp.m, inp.d, inp.lat, inp.lon, inp.tz);
    let kalam = null;
    if (rs.rise != null && rs.set != null) {
      const part = (rs.set - rs.rise) / 8;
      const seg = (i) => [rs.rise + i * part, rs.rise + (i + 1) * part];
      kalam = { rahu: seg(KALAM.rahu[weekday]), yama: seg(KALAM.yama[weekday]), gulika: seg(KALAM.gulika[weekday]) };
    }
    const moonRasi = Math.floor(moonS / 30);
    return {
      tithi, paksha: tithi < 15 ? 'shukla' : 'krishna', nakshatra: nakshatraOf(moonS), yoga, karana, weekday,
      sunrise: rs.rise, sunset: rs.set, kalam, moonRasi, sunRasi: Math.floor(sunS / 30),
      chandrashtamaRasi: (moonRasi + 12 - 7) % 12
    };
  }

  // ---------- Marriage matching: 10 poruthams (South Indian) ----------
  const GANA = 'DMRMDMDDRRMMDRDRDRRMMDRRMMD'; // Deva / Manushya / Rakshasa by nakshatra
  const YONI = [0,1,2,3,3,4,5,2,5,6,6,7,8,9,8,9,10,10,4,11,12,11,13,0,13,7,1];
  // animals: 0 horse 1 elephant 2 sheep 3 serpent 4 dog 5 cat 6 rat 7 cow 8 buffalo 9 tiger 10 deer 11 monkey 12 mongoose 13 lion
  const YONI_ENEMY = [[0,8],[1,13],[2,11],[3,12],[4,10],[5,6],[7,9]];
  const RASI_LORD = ['mars','venus','mercury','moon','sun','mercury','venus','mars','jupiter','saturn','saturn','jupiter'];
  const FRIENDS = {
    sun:     { f: ['moon','mars','jupiter'], e: ['venus','saturn'] },
    moon:    { f: ['sun','mercury'], e: [] },
    mars:    { f: ['sun','moon','jupiter'], e: ['mercury'] },
    mercury: { f: ['sun','venus'], e: ['moon'] },
    jupiter: { f: ['sun','moon','mars'], e: ['mercury','venus'] },
    venus:   { f: ['mercury','saturn'], e: ['sun','moon'] },
    saturn:  { f: ['mercury','venus'], e: ['sun','moon','mars'] }
  };
  const VASYA = [[4,7],[3,6],[5],[7,8],[6],[11,2],[9,5],[3],[11],[0,10],[0],[9]];
  const RAJJU = [0,1,2,3,4,3,2,1,0]; // pada, kati, nabhi, kantha, siro
  const VEDHA = [[0,17],[1,16],[2,15],[3,14],[5,21],[6,20],[7,19],[8,18],[9,26],[10,25],[11,24],[12,23],[4,22],[4,13],[13,22]];

  function relation(a, b) {
    if (a === b) return 'f';
    if (FRIENDS[a].f.includes(b)) return 'f';
    if (FRIENDS[a].e.includes(b)) return 'e';
    return 'n';
  }

  // girl/boy: {star: 0..26, rasi: 0..11}. Each result: 2 good, 1 partial, 0 no.
  function porutham(girl, boy) {
    const n = ((boy.star - girl.star + 27) % 27) + 1; // count from girl's star to boy's star
    const res = [];
    const r9 = n % 9;
    res.push({ key: 'dina', v: [2, 4, 6, 8, 0].includes(r9) ? 2 : 0 });
    const g = GANA[girl.star], b = GANA[boy.star];
    let gv;
    if (g === b) gv = 2; else if (g !== 'R' && b !== 'R') gv = (g === 'D' && b === 'M') ? 2 : 1; else gv = 0;
    res.push({ key: 'gana', v: gv });
    res.push({ key: 'mahendra', v: [4, 7, 10, 13, 16, 19, 22, 25].includes(n) ? 2 : 0 });
    res.push({ key: 'stree', v: n >= 13 ? 2 : n >= 7 ? 1 : 0 });
    const yg = YONI[girl.star], yb = YONI[boy.star];
    const enemy = YONI_ENEMY.some(([p, q]) => (p === yg && q === yb) || (p === yb && q === yg));
    res.push({ key: 'yoni', v: yg === yb ? 2 : enemy ? 0 : 1 });
    const c = ((boy.rasi - girl.rasi + 12) % 12) + 1;
    res.push({ key: 'rasi', v: (c === 6 || c === 8) ? 0 : (c === 2 || c === 12) ? 1 : 2 });
    const lg = RASI_LORD[girl.rasi], lb = RASI_LORD[boy.rasi];
    const r1 = relation(lg, lb), r2 = relation(lb, lg);
    res.push({ key: 'adhipati', v: (r1 === 'e' || r2 === 'e') ? 0 : (r1 === 'f' || r2 === 'f') ? 2 : 1 });
    res.push({ key: 'vasya', v: (VASYA[girl.rasi].includes(boy.rasi) || VASYA[boy.rasi].includes(girl.rasi)) ? 2 : 0 });
    res.push({ key: 'rajju', v: RAJJU[girl.star % 9] === RAJJU[boy.star % 9] ? 0 : 2 });
    const vedha = VEDHA.some(([p, q]) => (p === girl.star && q === boy.star) || (p === boy.star && q === girl.star));
    res.push({ key: 'vedha', v: vedha ? 0 : 2 });
    const score = res.reduce((s, r) => s + r.v, 0) / 2;
    const rajjuOk = res[8].v === 2, vedhaOk = res[9].v === 2;
    let verdict;
    if (!rajjuOk || !vedhaOk) verdict = 'bad';
    else if (score >= 6) verdict = 'good';
    else if (score >= 4.5) verdict = 'ok';
    else verdict = 'bad';
    return { items: res, score, verdict, rajjuOk, vedhaOk };
  }

  // A nakshatra pada maps to exactly one rasi
  const rasiFromStarPada = (star, pada) => Math.floor((star * 4 + (pada - 1)) / 9);

  root.Astro = { computeChart, panchang, porutham, rasiFromStarPada, nakshatraOf, julianDay, PLANET_KEYS, DASHA_YEARS };
})(typeof window !== 'undefined' ? window : globalThis);
