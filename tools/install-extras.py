"""Wires chart styles, the Rahu kalam finder, Indian calendars, Learn pages and /tamil-style addresses into RasiVani.
Run once from the repo root:  python tools/install-extras.py
Safe to run again: each change is skipped if it is already there. Required anchors stop the script with a message;
optional ones only warn."""
import io, os, re, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def path(p): return os.path.join(ROOT, p)
def read(p): return io.open(path(p), encoding='utf-8').read()
def write(p, s): io.open(path(p), 'w', encoding='utf-8', newline='\n').write(s)
problems = []

def patch(s, name, anchor, new, mode='after', required=True, marker=None):
    marker = marker or new.strip()[:60]
    if marker in s: print('  already done:', name); return s
    n = s.count(anchor)
    if n != 1:
        msg = '%s: anchor found %d times: %r' % (name, n, anchor[:90])
        if required: problems.append(msg)
        else: print('  WARN (skipped)', msg)
        return s
    print('  ok:', name)
    return s.replace(anchor, anchor + new if mode == 'after' else new + anchor)

# ---------- js/app.js ----------
print('js/app.js')
s = read('js/app.js')
s = patch(s, 'expose place box + page hooks', '  function boot() {',
          "  // Hooks for the extra pages (js/kalam.js, js/calendars.js) and the East Indian chart (js/chartstyles.js)\n"
          "  window.RV = { placeField, wirePlace, readPlace, setPlace, t: (k) => t(k) };\n", mode='before', marker='window.RV = {')
s = patch(s, 'run extra page', "    if (page === 'panchang') initPanch();",
          "\n    if (window.RVExtra && window.RVExtra[page]) window.RVExtra[page]();", marker='window.RVExtra[page]()')
old_draw = "const draw = (items, title, lr, ctr) => style === 'south' ? southChart(items, title, ctr) : northChart(items, title, lr);"
new_draw = ("const draw = (items, title, lr, ctr) => style === 'south' ? southChart(items, title, ctr)\n"
            "      : style === 'east' && window.ChartStyles ? window.ChartStyles.east(items, title, { label: (p) => T().abbr[p.key] + (p.retro && p.key !== 'rahu' && p.key !== 'ketu' ? '(R)' : ''), centre: ctr ? [title, name || '', dateStr] : [title] })\n"
            "      : northChart(items, title, lr);")
if 'window.ChartStyles.east(' in s: print('  already done: east chart')
elif s.count(old_draw) == 1: s = s.replace(old_draw, new_draw); print('  ok: east chart')
else: problems.append('js/app.js: chart draw line not found (search "const draw = (items, title, lr, ctr)")')
s = patch(s, 'east button above chart', """<button type="button" data-style="north" aria-pressed="${style === 'north'}">${esc(t('north'))}</button>""",
          """\n          ${window.ChartStyles ? `<button type="button" data-style="east" aria-pressed="${style === 'east'}">${esc(window.ChartStyles.text(lang, 'east'))}</button>` : ''}""",
          marker='data-style="east"')
write('js/app.js', s)

# ---------- tools/build.mjs ----------
print('tools/build.mjs')
s = read('tools/build.mjs')
s = patch(s, 'import extras', "const { SEO } = await import('./seo.mjs');", "\nconst EXTRAS = await import('./extras.mjs');", marker="import('./extras.mjs')")
s = patch(s, 'header link', "${escText(navText(lang, 'nav_palan'))}</a>`", "\n    + EXTRAS.navLink(lang, page)", marker='EXTRAS.navLink(')
s = patch(s, 'footer links', '<a href="about" data-keep-lang data-i18n="about"></a>', '${EXTRAS.footLinks(lang)}', mode='before', marker='EXTRAS.footLinks(')
s = patch(s, 'chart style picker', '<div id="chart-place"></div>', '\n    ${EXTRAS.chartPicker(lang)}', marker='EXTRAS.chartPicker(')
s = patch(s, 'home cards', """<a href="${toolHref(lang, 'panchangam.html')}" data-keep-lang="panchangam.html"><h3 data-i18n="nav_panchang"></h3><p data-i18n="panchang_sub"></p></a>""",
          '\n  ${EXTRAS.serviceCards(lang)}', required=False, marker='EXTRAS.serviceCards(')
s = patch(s, 'explore row', "[toolHref(lang, 'panchangam.html'), navText(lang, 'nav_panchang')],", ' ...EXTRAS.exploreLinks(lang),', required=False, marker='EXTRAS.exploreLinks(')
if 'EXTRA_BUILT' in s: print('  already done: build pages + sitemap')
else:
    m = re.search(r"^export const STATIC_PAGES = \[(.*)\];$", s, re.M)
    if not m: problems.append('tools/build.mjs: "export const STATIC_PAGES = [...];" line not found')
    else:
        line = m.group(0)
        s = s.replace(line, "const EXTRA_BUILT = await EXTRAS.buildExtras({ SITE, layout, write });\n" + line[:-2] + ", ...EXTRA_BUILT.urls];")
        print('  ok: build pages + sitemap')
s = patch(s, 'llms.txt', '## About\n- [About ${SITE.name}]', '${EXTRA_BUILT.llms}', mode='before', marker='${EXTRA_BUILT.llms}')
today = datetime.date.today().isoformat()
s2 = re.sub(r"(  updated: ')\d{4}-\d{2}-\d{2}(')", r"\g<1>%s\g<2>" % today, s, count=1)
if s2 != s: print('  ok: SITE.updated ->', today, '(phones pick up the new code)'); s = s2
write('tools/build.mjs', s)

# ---------- css/style.css ----------
print('css/style.css')
s = read('css/style.css')
if '===== Chart styles, Rahu kalam finder' in s: print('  already done')
else: write('css/style.css', s.rstrip('\n') + '\n' + read('css/extras.css')); print('  ok: appended css/extras.css')

# ---------- _redirects: rasivani.com/tamil, /telugu ... ----------
print('_redirects')
NAMES = [('tamil', 'ta'), ('telugu', 'te'), ('kannada', 'kn'), ('malayalam', 'ml'), ('hindi', 'hi'), ('marathi', 'mr'), ('bengali', 'bn'), ('bangla', 'bn'), ('gujarati', 'gu'), ('odia', 'or'), ('oriya', 'or')]
lines = ['# Easy language addresses: rasivani.com/tamil -> /ta/ (the short codes stay the main, indexed addresses)']
for name, code in NAMES:
    lines += ['/%s/rasi-palan/* /rasi-palan/%s/:splat 301' % (name, code), '/%s/blog/* /blog/%s/:splat 301' % (name, code), '/%s/learn/* /learn/%s/:splat 301' % (name, code),
              '/%s /%s/ 301' % (name, code), '/%s/* /%s/:splat 301' % (name, code)]
lines += ['/english /  301', '/english/rasi-palan/* /rasi-palan/en/:splat 301', '/english/blog/* /blog/en/:splat 301', '/english/learn/* /learn/en/:splat 301', '/english/* /:splat 301', '/en /  301', '/en/* /:splat 301']
block = '\n'.join(lines) + '\n'
old = read('_redirects') if os.path.exists(path('_redirects')) else ''
if 'Easy language addresses' in old: print('  already done')
else: write('_redirects', block + ('\n' + old if old else '')); print('  ok: %d rules' % len(lines[1:]))

if problems:
    print('\nSTOPPED: these anchors did not match (apply by hand, see the script):')
    for p in problems: print(' -', p)
    sys.exit(1)
print('\nDone. Now run: node tools/build.mjs  and  node tools/daily.mjs')
