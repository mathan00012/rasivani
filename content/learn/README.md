# Learn pages (rasivani.com/learn/<lang>/<slug>/)

One file per topic: `content/learn/<slug>.mjs`. tools/extras.mjs builds every topic whose `publish` date
(India time) is today or earlier, so you can add topics in advance and they go live by themselves on the
nightly build. Put the publish date one day before the video's upload date.

```js
export default {
  slug: 'birth-star',             // must match the video description link
  publish: '2026-11-13',          // goes live on this date
  tool: 'chart',                  // button at the end: chart | match | panch | kalam | calendar
  video: { ta: '', te: '', en: '' }, // YouTube links; when filled the page embeds the video (VideoObject schema)
  text: {
    en: { title, h1, desc, lede, keywords, key: [facts], sections: [{ h, html }], faq: [[q, a]], sources: [..], cta },
    ta: { ... }, te: { ... }      // any of en, ta, te, hi, kn, ml
  }
};
```
Honesty rule: say "tradition says" for beliefs; give numbers only for maths and astronomy; every page lists sources.
