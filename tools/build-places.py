"""Builds the offline place search index (places/n/<3 letters>.json and places/p/<3 digits>.json)
from the All India Pincode Directory (data.gov.in, Open Government Data License - India),
as packaged in the npm module `india-pincode` (data/pincodes.json.gz).
Usage: python3 tools/build-places.py path/to/pincodes.json.gz"""
import gzip, json, math, os, re, sys, statistics
from collections import defaultdict

src, out = sys.argv[1], os.path.join(os.path.dirname(__file__), '..', 'places')
rows = json.load(gzip.open(src))
SUFFIX = re.compile(r'\s*\b(B\.?O|S\.?O|H\.?O|G\.?P\.?O|B\.O\.|S\.O\.|H\.O\.)\.?\s*$', re.I)
def clean(name):
    name = SUFFIX.sub('', name.strip()).strip(' .-')
    return ' '.join(w if w.isupper() and len(w) <= 3 else w.capitalize() for w in re.split(r'\s+', name.lower()))
def title(s): return ' '.join(w.capitalize() for w in s.lower().split())

by_pin = defaultdict(list)
for r in rows:
    try: lat, lon = float(r['a']), float(r['n'])
    except (TypeError, ValueError, KeyError): continue
    if not (6 <= lat <= 37.5 and 68 <= lon <= 97.5): continue
    by_pin[r['p']].append((r, lat, lon))

def km(a, b, c, d): return math.hypot((a - c) * 111, (b - d) * 111 * math.cos(math.radians(a)))
entries, seen = [], set()
for pin, lst in by_pin.items():
    mlat = statistics.median(x[1] for x in lst); mlon = statistics.median(x[2] for x in lst)
    for r, lat, lon in lst:
        if km(lat, lon, mlat, mlon) > 60: continue  # drop obviously misplaced coordinates
        name = clean(r['o'])
        key = (name.lower(), pin)
        if not name or key in seen: continue
        seen.add(key)
        rank = {'HO': 0, 'SO': 1, 'BO': 2}.get(r.get('t'), 2)
        entries.append([name, title(r.get('i', '')), title(r.get('s', '')), pin, round(lat, 4), round(lon, 4), rank])

names, pins = defaultdict(list), defaultdict(list)
for e in entries:
    k = re.sub(r'[^a-z]', '', e[0].lower())[:3]
    if len(k) == 3: names[k].append(e)
    pins[e[3][:3]].append(e)
for d in ('n', 'p'): os.makedirs(os.path.join(out, d), exist_ok=True)
for k, v in names.items():
    v.sort(key=lambda e: (e[6], e[0]))
    json.dump(v, open(os.path.join(out, 'n', k + '.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
for k, v in pins.items():
    v.sort(key=lambda e: (e[3], e[6]))
    json.dump(v, open(os.path.join(out, 'p', k + '.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
print(len(entries), 'places;', len(names), 'name shards;', len(pins), 'pincode shards')
