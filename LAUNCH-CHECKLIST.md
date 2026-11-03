# RasiVani pre-launch checklist

Work through these in order. Each line says who does it.

## 1. Before the site goes live
- [x] **You:** buy `rasivani.com` (done, active until 3 Nov 2027).
- [x] hello@rasivani.com forwards to krishnawb2021@gmail.com (Cloudflare Email Routing, set up 3 Nov 2026).
- [x] Domain and email are set in `tools/build.mjs` (rasivani.com, hello@rasivani.com).
- [x] Language check (3 Nov 2026): Tamil reviewed by Maddy; the other 9 languages moved to everyday wording and correct local spellings.
- [x] Known horoscopes compared (3 Nov 2026): Pooja (Vaniyambadi 2008), John (London 1977), Sheela (Gurgaon 1989). Every planet, rasi, star, navamsa and lagna matches; degrees within 1′.
- [x] Births outside India checked (3 Nov 2026): 8 cities in 4 continents match an independent ephemeris within 0.15°, lagna exact. Overseas cities now pick summer time (DST) automatically; manual coordinates accept 74 W / 12.5 S and offer a UTC offset list.

## 2. Publish (free, Cloudflare Pages)
- [ ] Turn **auto-renew on** for rasivani.com.
- [ ] Create a GitHub account → new repository `rasivani` → upload all files from the zip.
- [ ] Follow `CLOUDFLARE-SETUP.md`: connect the repo to Cloudflare Pages and add `rasivani.com` + `www.rasivani.com`.
- [ ] GitHub Actions tab → "Publish site" → **Run workflow**. This is your one button; after that it also runs by itself at 00:05 IST every day, and Cloudflare publishes each new commit.
- [ ] Open https://rasivani.com and https://www.rasivani.com on your phone: both load, padlock shows.
- [ ] GitHub emails you if a daily run ever fails. Nothing else needs attention day to day.

## 3. Customer experience checks (on a real phone)
- [ ] Pages load in under 3 seconds on mobile data (test at pagespeed.web.dev; aim for 90+).
- [ ] Place search finds your own area by name and by pincode.
- [ ] "Download as image" saves the jathagam; "Print / save as PDF" works in Chrome on Android.
- [ ] Language choice is remembered on the next visit.
- [ ] Text is readable in dark mode and at large font size.
- [ ] Nothing asks for phone numbers, logins or payment. Birth details never leave the phone (say this proudly).

## 4. Google Search
- [ ] search.google.com/search-console → add domain → verify by DNS.
- [ ] Submit `https://rasivani.com/sitemap.xml`. The daily job keeps it updated.
- [ ] After a week, check Coverage for errors. Rasi palan pages in each language are linked to each other (hreflang), so Google shows the right language.

## 5. AdSense
- [ ] Wait until the site has about 2–4 weeks of daily rasi palan pages, then apply at adsense.google.com.
- [ ] After approval, put your `ca-pub-…` id in `SITE.adsenseClient`, push, and the next run adds the ad code and `ads.txt`.
- [ ] Turn on the Google consent message (Privacy & messaging) for EEA/UK visitors.
- [ ] Keep ads away from buttons; never ask people to click ads; keep the disclaimer.

## 6. Android app (Play Store)
- [ ] pwabuilder.com → enter `https://rasivani.com` → Package for Android → package id `com.rasivani.app`.
- [ ] Replace `.well-known/assetlinks.json` with the one PWABuilder gives you, push, wait for the run to finish.
- [ ] Play Console (one-time US$25) → create app → upload the `.aab`.
- [ ] Store listing: screenshots (use the downloaded jathagam images), short description in English, Tamil, Hindi etc.
- [ ] Privacy policy URL: `https://rasivani.com/privacy.html`. Data safety: "No data collected" (plus "Advertising ID" once ads are on).
- [ ] New personal developer accounts must run a closed test with at least 12 testers for 14 days before going public. Ask friends and family early.

## 7. After launch
- [ ] Share the downloaded jathagam images on WhatsApp and Facebook groups; every image carries the site name.
- [ ] Reply to emails within two days.
- [ ] Every month, look at Search Console queries and add short articles for the top searches (e.g. "Ashtama Shani", "Guru Peyarchi 2027").
