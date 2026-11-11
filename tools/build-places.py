"""Builds the offline place search index used by the birth-place box.

Output (all JSON, one small file per shard so a search downloads only a few KB):
  places/n/<key>.json   places by name. <key> is the first 2 letters (a-z) of the name, or the first
                        3 letters for busy prefixes listed in places/n/_split.json. Indian-script names
                        (Tamil, Telugu, Hindi ...) go in places/n/u<hex of 1st letter>.json.
  places/p/<key>.json   postal codes: India pincodes, US ZIP codes, UK postcode sectors, Canada FSAs.
                        <key> is the first 3 characters of the code, upper case, no spaces.
  A key that is a Windows reserved device name (con, aux, prn, nul, com1..9, lpt1..9) gets '_' appended
  (con_.json) so the repo can be checked out on Windows; js/places.js asks for the same name.
Each row: [name, region, country code, postal code, lat, lon, time zone, score]
  time zone '' means India (fixed IST, UTC+5:30, as Indian almanacs use); otherwise an IANA zone,
  so the page works out summer time for the birth date itself.

Sources (all free and open, credited on the about page):
  India Post pincode directory, data.gov.in (OGD India)         -> npm `india-pincode` data/pincodes.json.gz
  GeoNames cities (CC BY 4.0, geonames.org)                       -> pip `geonamescache` data/cities500.json
  US ZIP codes and Canada FSAs                                    -> npm `zipcodes` lib/codes.js, lib/codesCanada.js
  UK postcodes: ONS Postcode Directory + OS Open Names (OGL v3)   -> npm `uk-address-lookup` data/uk-address.json.gz

Usage:
  npm pack india-pincode zipcodes uk-address-lookup   (then untar each)   and   pip download --no-deps geonamescache (unzip)
  python tools/build-places.py --india <pincodes.json.gz> --geonames <geonamescache/data> \
      --zipcodes <zipcodes/lib> --uk <uk-address.json.gz>
"""
import argparse, gzip, json, math, os, re, statistics, shutil, unicodedata
from collections import defaultdict, Counter

ap = argparse.ArgumentParser()
ap.add_argument('--india', required=True)
ap.add_argument('--geonames', required=True)
ap.add_argument('--zipcodes', required=True)
ap.add_argument('--uk', required=True)
ap.add_argument('--out', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'places'))
a = ap.parse_args()

def fold(s):
    """Lower-case ASCII key: 'São Paulo' -> 'sao paulo'."""
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', s.lower())).strip()
def title(s): return ' '.join(w.capitalize() for w in s.lower().split())
def km(a, b, c, d): return math.hypot((a - c) * 111, (b - d) * 111 * math.cos(math.radians(a)))
R = lambda x: round(x, 4)
RESERVED = {'con', 'prn', 'aux', 'nul'} | {f'com{i}' for i in range(10)} | {f'lpt{i}' for i in range(10)}
def safe(k): return k + '_' if k.lower() in RESERVED else k

rows = []  # [name, region, cc, postal, lat, lon, tz, score]

# ---------- India Post (every post office area + pincode) ----------
SUFFIX = re.compile(r'\s*\b(B\.?O|S\.?O|H\.?O|G\.?P\.?O|B\.O\.|S\.O\.|H\.O\.)\.?\s*$', re.I)
def clean(name):
    name = SUFFIX.sub('', name.strip()).strip(' .-')
    return ' '.join(w if w.isupper() and len(w) <= 3 else w.capitalize() for w in re.split(r'\s+', name.lower()))
by_pin = defaultdict(list)
for r in json.load(gzip.open(a.india)):
    try: lat, lon = float(r['a']), float(r['n'])
    except (TypeError, ValueError, KeyError): continue
    if not (6 <= lat <= 37.5 and 68 <= lon <= 97.5): continue
    by_pin[r['p']].append((r, lat, lon))
india, seen = [], set()
for pin, lst in by_pin.items():
    mlat = statistics.median(x[1] for x in lst); mlon = statistics.median(x[2] for x in lst)
    for r, lat, lon in lst:
        if km(lat, lon, mlat, mlon) > 60: continue  # drop obviously misplaced coordinates
        name = clean(r['o']); key = (name.lower(), pin)
        if not name or key in seen: continue
        seen.add(key)
        score = {'HO': 30, 'SO': 20, 'BO': 10}.get(r.get('t'), 10)
        india.append([name, f"{title(r.get('i', ''))}, {title(r.get('s', ''))}", 'IN', pin, R(lat), R(lon), '', score])
rows += india

# ---------- GeoNames cities, towns and villages worldwide ----------
gdir = a.geonames
countries = json.load(open(os.path.join(gdir, 'countries.json'), encoding='utf-8'))
CNAME = {k: v['name'] for k, v in countries.items()}
CNAME.update({'US': 'USA', 'GB': 'UK', 'AE': 'UAE'})
ADMIN = {
    'US': {k: v['name'] for k, v in json.load(open(os.path.join(gdir, 'us_states.json'), encoding='utf-8')).items()},
    'GB': {'ENG': 'England', 'SCT': 'Scotland', 'WLS': 'Wales', 'NIR': 'Northern Ireland'},
    'CA': {'01': 'Alberta', '02': 'British Columbia', '03': 'Manitoba', '04': 'New Brunswick', '05': 'Newfoundland and Labrador',
           '07': 'Nova Scotia', '08': 'Ontario', '09': 'Prince Edward Island', '10': 'Quebec', '11': 'Saskatchewan',
           '12': 'Yukon', '13': 'Northwest Territories', '14': 'Nunavut'},
    'AU': {'01': 'Australian Capital Territory', '02': 'New South Wales', '03': 'Northern Territory', '04': 'Queensland',
           '05': 'South Australia', '06': 'Tasmania', '07': 'Victoria', '08': 'Western Australia'},
}
small = json.load(open(os.path.join(gdir, 'cities500.json'), encoding='utf-8'))
cities = list(small.values())

# Indian states: GeoNames gives a numeric code; name it after the India Post state its towns fall in.
grid = defaultdict(list)
for e in india: grid[(int(e[4] * 2), int(e[5] * 2))].append(e)
def nearest_india(lat, lon):
    best, bd = None, 1e9
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            for e in grid.get((int(lat * 2) + dx, int(lon * 2) + dy), ()):
                d = km(lat, lon, e[4], e[5])
                if d < bd: best, bd = e, d
    return best, bd
votes = defaultdict(Counter)
near = {}
for c in cities:
    if c['countrycode'] != 'IN': continue
    e, d = nearest_india(c['latitude'], c['longitude'])
    if e and d < 25:
        near[c['geonameid']] = e
        votes[c['admin1code']][e[1].split(', ')[-1]] += 1
ADMIN['IN'] = {k: v.most_common(1)[0][0] for k, v in votes.items()}

# Old and everyday names people still type. Each maps to the GeoNames name it should find.
ALIASES = {
    ('Mumbai', 'IN'): ['Bombay'], ('Chennai', 'IN'): ['Madras'], ('Kolkata', 'IN'): ['Calcutta'],
    ('Bengaluru', 'IN'): ['Bangalore'], ('Pune', 'IN'): ['Poona'], ('Vadodara', 'IN'): ['Baroda'],
    ('Varanasi', 'IN'): ['Benares', 'Banaras', 'Kashi'], ('Thiruvananthapuram', 'IN'): ['Trivandrum'],
    ('Kochi', 'IN'): ['Cochin', 'Ernakulam'], ('Kozhikode', 'IN'): ['Calicut'], ('Mysuru', 'IN'): ['Mysore'],
    ('Mangaluru', 'IN'): ['Mangalore'], ('Belagavi', 'IN'): ['Belgaum'], ('Hubballi', 'IN'): ['Hubli'],
    ('Kalaburagi', 'IN'): ['Gulbarga'], ('Vijayapura', 'IN'): ['Bijapur'], ('Shivamogga', 'IN'): ['Shimoga'],
    ('Tumkur', 'IN'): ['Tumakuru'], ('Ballari', 'IN'): ['Bellary'], ('Gurugram', 'IN'): ['Gurgaon'],
    ('Puducherry', 'IN'): ['Pondicherry', 'Pondy'], ('Tiruchirappalli', 'IN'): ['Trichy', 'Tiruchi', 'Trichinopoly'],
    ('Thanjavur', 'IN'): ['Tanjore'], ('Thoothukudi', 'IN'): ['Tuticorin'], ('Tirunelveli', 'IN'): ['Nellai'],
    ('Ooty', 'IN'): ['Udhagamandalam', 'Ootacamund'], ('Shimla', 'IN'): ['Simla'], ('Kanpur', 'IN'): ['Cawnpore'],
    ('Prayagraj', 'IN'): ['Allahabad'], ('Visakhapatnam', 'IN'): ['Vizag', 'Vishakapatnam', 'Waltair'],
    ('Vijayawada', 'IN'): ['Bezawada'], ('Rajamahendravaram', 'IN'): ['Rajahmundry'], ('Delhi', 'IN'): ['Dilli', 'Old Delhi'],
    ('Kanchipuram', 'IN'): ['Kanchi', 'Conjeevaram'], ('Kumbakonam', 'IN'): ['Kudanthai'],
    ('Coimbatore', 'IN'): ['Kovai'], ('Madurai', 'IN'): ['Madura'], ('Nagercoil', 'IN'): ['Nagarkovil'],
    ('Thrissur', 'IN'): ['Trichur'], ('Alappuzha', 'IN'): ['Alleppey'], ('Kollam', 'IN'): ['Quilon'],
    ('Kannur', 'IN'): ['Cannanore'], ('Palakkad', 'IN'): ['Palghat'], ('Bhubaneswar', 'IN'): ['Bhubaneshwar'],
    ('Panjim', 'IN'): ['Panaji'], ('Vasco da Gama', 'IN'): ['Vasco'],
    ('Hyderabad', 'IN'): ['Secunderabad', 'Bhagyanagar'], ('Nashik', 'IN'): ['Nasik'], ('Ahmedabad', 'IN'): ['Amdavad'],
    ('New York City', 'US'): ['NYC', 'New York'], ('Los Angeles', 'US'): ['LA'], ('Washington', 'US'): ['Washington DC'],
    ('Ho Chi Minh City', 'VN'): ['Saigon'], ('Yangon', 'MM'): ['Rangoon'],
}
INDIC = re.compile(r'[ऀ-෿]')  # Devanagari .. Sinhala blocks: hi, bn, pa, gu, or, ta, te, kn, ml
alt_rows = []
for c in cities:
    cc, pop = c['countrycode'], c.get('population') or 0
    if cc == 'IN': c['name'] = ''.join(ch for ch in unicodedata.normalize('NFKD', c['name']) if not unicodedata.combining(ch))  # Tumkūr -> Tumkur
    if cc in ('IN', 'US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'LK', 'NP', 'SG', 'MY', 'AE'): pass
    elif pop < 1000: continue  # elsewhere keep towns of 1,000+ people
    admin = ADMIN.get(cc, {}).get(c['admin1code'], '')
    region = ', '.join(x for x in (admin, CNAME.get(cc, cc)) if x)
    if cc == 'IN' and not admin and c['geonameid'] in near: region = f"{near[c['geonameid']][1].split(', ')[-1]}, India"
    tz = '' if cc == 'IN' else c['timezone']
    score = 1000 + round(math.log10(pop + 1) * 100)  # cities rank above post offices of the same name
    row = [c['name'], region, cc, '', R(c['latitude']), R(c['longitude']), tz, score]
    rows.append(row)
    # Well-known other spellings (Bombay, Madras, Calcutta, Benares ...) and Indian-script names.
    if cc == 'IN' or (c['name'], cc) in ALIASES:
        alts = set()
        for n in c.get('alternatenames') or []:
            n = n.strip()
            if not n or n == c['name'] or len(n) > 40: continue
            if cc == 'IN' and INDIC.search(n): alts.add(n)
        alts.update(ALIASES.get((c['name'], cc), ()))
        for n in alts: alt_rows.append((n, row))

# ---------- US ZIP codes, Canada FSAs ----------
def load_js(path):
    s = open(path, encoding='utf-8').read()
    s = s[s.index('exports.codes'):]
    return json.JSONDecoder().raw_decode(s[s.index('{'):])[0]
post = []
US_STATES = ADMIN['US']
for z in load_js(os.path.join(a.zipcodes, 'codes.js')).values():
    if z.get('country') != 'US' or z.get('latitude') in (None, ''): continue
    post.append([title(z['city']), f"{US_STATES.get(z['state'], z['state'])}, USA", 'US', z['zip'], R(float(z['latitude'])), R(float(z['longitude'])), None, 0])
for z in load_js(os.path.join(a.zipcodes, 'codesCanada.js')).values():
    if z.get('latitude') in (None, ''): continue
    city = re.sub(r'\s*\(.*\)$', '', z['city']).strip()
    post.append([city, f"{z['state']}, Canada", 'CA', z['zip'], R(float(z['latitude'])), R(float(z['longitude'])), None, 0])

# ---------- UK postcode sectors ("SW1A 1", "LE1 6") and districts ("LE1") ----------
uk = json.load(gzip.open(a.uk))
towns, ukc = uk['towns'], uk['countries']
sec = defaultdict(list)
for pc, lat, lon, sids in uk['postcodes']:
    sec[pc[:-2]].append((lat, lon, sids))
dist = defaultdict(list)
for s, lst in sec.items():
    lat = statistics.median(x[0] for x in lst); lon = statistics.median(x[1] for x in lst)
    tc, cc_ = Counter(), Counter()
    for _, _, sids in lst:
        for sid in sids[:1]:
            st = uk['streets'][sid]
            if st[1] >= 0: tc[towns[st[1]]] += 1
            if st[4] >= 0: cc_[ukc[st[4]]] += 1
    town = tc.most_common(1)[0][0] if tc else s
    nation = cc_.most_common(1)[0][0] if cc_ else 'England'
    post.append([town, f'{nation}, UK', 'GB', s, R(lat), R(lon), 'Europe/London', len(lst)])
    dist[s.split(' ')[0]].append((lat, lon, town, nation, len(lst)))
for d, lst in dist.items():
    n = sum(x[4] for x in lst)
    lat = sum(x[0] * x[4] for x in lst) / n; lon = sum(x[1] * x[4] for x in lst) / n
    town = Counter({x[2]: 0 for x in lst}); [town.update({x[2]: x[4]}) for x in lst]
    post.append([town.most_common(1)[0][0], f'{lst[0][3]}, UK', 'GB', d, R(lat), R(lon), 'Europe/London', n * 10])

# Time zones for postal rows: borrow the zone of the nearest GeoNames place in the same country.
zgrid = defaultdict(list)
for c in cities:
    if c['countrycode'] in ('US', 'CA'): zgrid[(round(c['latitude']), round(c['longitude']))].append(c)
def zone_near(cc, lat, lon):
    best, bd = None, 1e9
    for r in (0, 1, 2, 3):
        for dx in range(-r, r + 1):
            for dy in range(-r, r + 1):
                if max(abs(dx), abs(dy)) != r: continue
                for c in zgrid.get((round(lat) + dx, round(lon) + dy), ()):
                    if c['countrycode'] != cc: continue
                    d = km(lat, lon, c['latitude'], c['longitude'])
                    if d < bd: best, bd = c, d
        if best and r >= 1: break
    return best['timezone'] if best else ('America/New_York' if cc == 'US' else 'America/Toronto')
for p in post:
    if p[6] is None: p[6] = zone_near(p[2], p[4], p[5])

# ---------- write shards ----------
for d in ('n', 'p'):
    shutil.rmtree(os.path.join(a.out, d), ignore_errors=True)
    os.makedirs(os.path.join(a.out, d), exist_ok=True)

names = defaultdict(list)
def name_key(n, L):
    k = fold(n).replace(' ', '')
    return k[:L] if len(k) >= L else None
first2 = Counter()
for r in rows:
    k = name_key(r[0], 2)
    if k: first2[k] += 1
SPLIT_AT = 2500
split = sorted(k for k, n in first2.items() if n > SPLIT_AT)
def shard_of(n):
    k2 = name_key(n, 2)
    if not k2: return None
    if k2 in split: return name_key(n, 3) or k2
    return k2
for r in rows:
    s = shard_of(r[0])
    if s: names[s].append(r)
for n, r in alt_rows:  # [alt name] + row, so the list shows "Mumbai" when someone types "Bombay" or an Indian-script name
    s = shard_of(n) if not INDIC.search(n) else 'u%04x' % ord(n[0])
    if s: names[s].append([r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], n])
for k, v in names.items():
    v.sort(key=lambda e: -e[7])
    json.dump(v, open(os.path.join(a.out, 'n', safe(k) + '.json'), 'w', encoding='utf-8'), separators=(',', ':'), ensure_ascii=False)
json.dump(split, open(os.path.join(a.out, 'n', '_split.json'), 'w'), separators=(',', ':'))

pins = defaultdict(list)
for r in india + post:
    k = re.sub(r'[^A-Z0-9]', '', r[3].upper())
    pins[k[:3]].append(r)
for k, v in pins.items():
    v.sort(key=lambda e: (e[3], -e[7]))
    json.dump(v, open(os.path.join(a.out, 'p', safe(k) + '.json'), 'w', encoding='utf-8'), separators=(',', ':'), ensure_ascii=False)

json.dump({'v': 2}, open(os.path.join(a.out, 'version.json'), 'w'))
print(f'{len(rows)} places by name ({len(india)} India Post areas), {len(alt_rows)} other spellings, '
      f'{len(india) + len(post)} postal codes; {len(names)} name shards, {len(pins)} postal shards; split: {len(split)}; '
      f'reserved renamed: {sorted(safe(k) for k in list(names) + list(pins) if safe(k) != k)}')
