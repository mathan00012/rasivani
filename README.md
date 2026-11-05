# RasiVani — free jathagam, porutham and panchangam

A static website (no server, no database) in 10 languages: English, Hindi, Tamil, Telugu,
Kannada, Malayalam, Marathi, Bengali, Gujarati and Odia. All calculations run in the visitor's
browser, so hosting is free and birth details never leave the device.

## What's inside
| File | What it does |
|---|---|
| `index.html` | Birth chart (jathagam / kundli): lagna, rasi, nakshatra, rasi + navamsa charts (South and North Indian style), planet table, Vimshottari dasha |
| `porutham.html` | Marriage matching: all 10 poruthams, from birth details or from birth star + pada |
| `panchangam.html` | Tithi, nakshatra, yoga, karana, sunrise/sunset, Rahu kalam, Yamagandam, Gulikai, Chandrashtamam |
| `about.html`, `privacy.html`, `contact.html` | Pages AdSense and Play Store reviewers look for |
| `js/astro.js` | Astronomy engine (Meeus Moon, JPL planets, Lahiri ayanamsa) |
| `js/i18n.js` | All translations |
| `rasi-palan/<lang>/` | Daily rasi palan pages, made by `tools/daily.mjs` from `js/palan-i18n.js` |
| `places/` | Offline place + pincode search (140k India Post areas, data.gov.in OGD licence). Rebuild with `tools/build-places.py` |
| `tools/build.mjs` | Regenerates the pages. **Edit the SITE block at the top first** (domain, email, AdSense id) |
| `share.html` | Post maker for social media (rasivani.com/share): today's rasi palan as 13 images + a Shorts/Reels video + caption, in any language. Reads `social/<lang>.json`, which `tools/daily.mjs` writes every night. Not indexed |
| `manifest.webmanifest`, `sw.js`, `icons/` | Makes it installable and offline-capable (needed for the Android app) |

## 1. Domain
`rasivani.com` is bought (active until 3 Nov 2027). **Turn auto-renew on** so the name never lapses.
`tools/build.mjs` → `SITE.url` is already `https://rasivani.com`. Put your real inbox in `SITE.email`, then run `node tools/build.mjs`.

## 2. Host it free and publish daily (Cloudflare Pages)
Full click-by-click steps are in `CLOUDFLARE-SETUP.md`. In short:
1. New GitHub repository `rasivani` → upload everything from this folder.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo.
   Framework preset **None**, build command `node tools/daily.mjs`, build output directory `/`.
3. Pages project → Custom domains → add `rasivani.com` and `www.rasivani.com`.
4. GitHub → Actions → "Publish site" → **Run workflow** (the one button). It also runs itself every
   night at 00:05 IST, writes the rasi palan for today + 2 days in all 10 languages, updates the sitemap
   and commits them. Cloudflare sees the commit and puts it live in about a minute.
To generate locally instead: `node tools/daily.mjs` (or `node tools/daily.mjs 2026-12-01`).

## 3. Google Search
1. search.google.com/search-console → add your domain → verify via DNS.
2. Submit `https://YOURDOMAIN/sitemap.xml`.

## 4. AdSense
1. Apply at adsense.google.com once the site is live on your own domain (they reject `pages.dev` addresses).
2. After approval put your `ca-pub-…` id in `SITE.adsenseClient`, rebuild, re-upload. That adds the
   AdSense script and fills `ads.txt`. Turn on **Auto ads** in AdSense, or paste ad units into the
   empty `<div class="ad-slot">` spots (they stay invisible until filled).
3. In AdSense → Privacy & messaging, enable the Google consent message for EEA/UK visitors.
Policy notes: keep the disclaimer, don't promise guaranteed outcomes, don't place ads right next to
the submit buttons, and don't ask people to click ads.

## 5. Android app on Play Store
1. Site must be live on HTTPS on your domain first.
2. Go to pwabuilder.com → enter your URL → Package for stores → Android. Package id: `com.rasivani.app`.
3. It gives you an `.aab` file, a signing key (keep it safe forever) and an `assetlinks.json`.
   Replace `.well-known/assetlinks.json` here with theirs and re-upload the site.
4. Google Play Console (one-time US$25 fee) → create app → upload the `.aab`.
   Privacy policy URL: `https://YOURDOMAIN/privacy.html`. Data safety: no personal data collected;
   declare "Advertising ID / ads" if ads are on. Category: Lifestyle.
New personal developer accounts must run a closed test with at least 12 testers for 14 days before
production release.

## Accuracy
Moon within about 1 arc-minute, Sun within seconds, planets within about 1° (fine for signs).
Births within a few minutes of a nakshatra or lagna boundary can differ from Swiss Ephemeris software.
Translations were written carefully but should be reviewed by a native speaker of each language.

See **LAUNCH-CHECKLIST.md** for the full step-by-step before going live.
