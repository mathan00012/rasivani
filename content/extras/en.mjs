// English text for the Rahu kalam, Indian calendars and Learn pages (tools/extras.mjs).
// Placeholders in {braces} are filled at build time with real numbers.
export default {
  nav: { kalam: 'Rahu kalam', cal: 'Indian calendars', learn: 'Learn' },
  updated: 'Updated {date}',
  sources_h: 'Sources',
  faq_h: 'Questions people ask',
  kalam: {
    title: 'Rahu Kalam Today: exact time for your city, Yamagandam, Gulika | RasiVani',
    desc: 'Today\'s Rahu kalam, Yamagandam, Gulika kalam and Abhijit muhurtam for any town in India or abroad, worked out from your own sunrise and sunset. Free, with the next 7 days.',
    keywords: 'rahu kalam today, rahu kaal today, rahu kalam timings, yamagandam today, gulika kalam today, rahu kalam chennai, rahu kaal delhi',
    h1: 'Rahu Kalam Today',
    lede: 'Exact Rahu kalam, Yamagandam and Gulika kalam for your own town, from today\'s sunrise and sunset there. Not the 6 AM table.',
    city_title: 'Rahu Kalam Today in {city}: {range} | RasiVani',
    city_desc: 'Rahu kalam in {city} today ({date}) is {range}. Yamagandam {yama}, Gulika {gulika}. Sunrise {rise}, sunset {set}. Next 7 days included.',
    city_h1: 'Rahu Kalam Today in {city}',
    city_lede: 'Today\'s Rahu kalam, Yamagandam and Gulika kalam in {city}, from {city}\'s own sunrise ({rise}) and sunset ({set}).',
    cities_h: 'Rahu kalam in other cities',
    summary: 'Today in {city}: Rahu kalam {range}, Yamagandam {yama}, Gulika kalam {gulika}.',
    sections: [
      { h: 'What is Rahu kalam?', html: '<p>Rahu kalam (also written Rahu kaal or Raahu kaalam) is a stretch of roughly 90 minutes every day that South Indian tradition treats as a poor time to <strong>start</strong> something new: a journey, a purchase, a business deal, an interview, a ceremony. Work that is already going on simply carries on. The custom is only about beginnings.</p><p>It is one eighth of the daytime, so it is shorter in winter and longer in summer, and it moves with your sunrise.</p>' },
      { h: 'How is it calculated?', html: '<p>Take the time from sunrise to sunset at your place and split it into eight equal parts. Each weekday gives one of those parts to Rahu:</p><ul><li>Monday: 2nd part</li><li>Saturday: 3rd part</li><li>Friday: 4th part</li><li>Wednesday: 5th part</li><li>Thursday: 6th part</li><li>Tuesday: 7th part</li><li>Sunday: 8th (last) part</li></ul><p>The first part of the day is never Rahu kalam. An easy way to remember the order is "Mother Saw Father Wearing The Turban Suddenly" (Mon, Sat, Fri, Wed, Thu, Tue, Sun).</p><p>Printed tables that say "Monday 7:30 to 9:00" assume the Sun rises at exactly 6:00 and sets at 18:00. That is rarely true. Today sunrise is {rise_chennai} in Chennai and {rise_delhi} in New Delhi, so Rahu kalam there is {rahu_chennai} and {rahu_delhi}. RasiVani always works it out from your own town\'s sunrise and sunset for the exact date.</p>' },
      { h: 'Yamagandam, Gulika kalam and Abhijit muhurtam', html: '<p><strong>Yamagandam</strong> (Yamakandam) and <strong>Gulika kalam</strong> (Kuligai) use the same eight-part day. Yamagandam is avoided for new starts just like Rahu kalam.</p><p>Gulika is the part of the day that belongs to Saturn. The classical text <em>Brihat Parashara Hora Shastra</em> describes this rule: divide the daytime into eight parts, give the first seven to the seven planets starting with the lord of the weekday, leave the eighth without a lord, and the part that falls to Saturn is Gulika\'s. Many families believe that whatever is done in Gulika kalam repeats, so they avoid it for funerals or taking a loan, and some prefer it for buying gold or property.</p><p><strong>Abhijit muhurtam</strong> is the 8th of the 15 daytime muhurtas, the one around local noon. It is considered good for any start, except on Wednesdays.</p>' },
      { h: 'What science says', html: '<p>Sunrise, sunset and the length of the day are astronomy. RasiVani computes them with the standard formulas in Jean Meeus\' <em>Astronomical Algorithms</em> (the same method behind the NOAA solar calculator), good to about a minute for most places.</p><p>Whether a time of day is lucky is a matter of belief. No scientific study has shown that things started in Rahu kalam go wrong more often. We publish it because millions of families plan their day around it, and they deserve the correct time for their own town rather than a table made for 6 AM sunrise.</p>' },
      { h: 'Where the custom comes from', html: '<p>Rahu kalam is a regional custom, strongest in Tamil Nadu, Kerala, Karnataka, Andhra Pradesh and Telangana, and it is printed in every South Indian panchangam. It is not found in the oldest Sanskrit texts, which speak of the eight-part day and of Gulika. In North India, people more often check Choghadiya and Rahu kaal together. On Tuesdays and Fridays many temples in Tamil Nadu hold a <em>Rahu kala pooja</em> for Goddess Durga during this very time, so for some devotees it is a time to pray, not only a time to avoid.</p>' }
    ],
    faq: [
      ['Is Rahu kalam the same all over India?', 'No. It depends on sunrise and sunset, which change from place to place and day to day. Today Rahu kalam is {rahu_chennai} in Chennai and {rahu_delhi} in New Delhi.'],
      ['Why is RasiVani\'s time different from my printed calendar?', 'Most printed tables assume sunrise at 6:00 AM, or use one city for the whole state. RasiVani uses your own town\'s sunrise and sunset for that exact date.'],
      ['Is there Rahu kalam at night?', 'South Indian practice uses only the daytime Rahu kalam shown here. Some almanacs also divide the night into eight parts, but that is rarely followed.'],
      ['Can I travel during Rahu kalam?', 'Tradition only says not to start a journey in Rahu kalam. If you are already travelling, nothing changes. It is a belief, so follow your family\'s custom.'],
      ['What is the difference between Rahu kalam, Yamagandam and Gulika?', 'All three are one eighth of the daytime, each in a different part for each weekday. Rahu kalam and Yamagandam are avoided for new starts. Gulika is believed to make things repeat.']
    ],
    sources: [
      'Brihat Parashara Hora Shastra, chapter on the upagrahas (Gulika and Mandi), translated by R. Santhanam',
      'Jean Meeus, Astronomical Algorithms, 2nd edition, Willmann-Bell, 1998 (sunrise and sunset)',
      'NOAA Global Monitoring Laboratory, Solar Calculator, gml.noaa.gov/grad/solcalc',
      'Positional Astronomy Centre, India Meteorological Department, Kolkata: Rashtriya Panchang'
    ]
  },
  cal: {
    title: 'Indian Calendars Today: Tamil, Malayalam, Telugu, Kannada, Hindi dates and festivals | RasiVani',
    desc: 'Today\'s date in the Tamil, Malayalam, Telugu-Kannada, North Indian and Indian National calendars, the next 12 months of festivals, and how the solar and lunar calendars of India fit together.',
    keywords: 'tamil calendar today, malayalam calendar today, telugu calendar today, kannada panchanga, hindu calendar today, vikram samvat, shaka samvat, adhika masa, indian national calendar',
    h1: 'Indian Calendars Today',
    lede: 'One date, five Indian calendars, and why Pongal stays put while Diwali moves.',
    today_h: 'Today in every calendar',
    months_h: 'How the months line up',
    months_cols: ['Sun enters', 'This year', 'Tamil month', 'Malayalam month', 'Lunar month that starts in it'],
    sections: [
      { h: 'One sky, two clocks', html: '<p>Every Indian calendar watches the same two things: the Sun moving through the 12 rasis, and the Moon growing from new to full and back.</p><p><strong>Solar calendars</strong> (Tamil, Malayalam, Bengali, Odia, Assamese, Punjabi) start a month when the Sun enters a new rasi. That moment is the <em>sankranti</em>.</p><p><strong>Lunar calendars</strong> (Telugu, Kannada, Marathi, Gujarati and the Hindi-speaking states) run a month from one new moon to the next (<em>amanta</em>, used in the South and West) or from one full moon to the next (<em>purnimanta</em>, used in the North). A lunar month is named after the sankranti that happens inside it: the month in which the Sun enters Mesha is Chaitra.</p>' },
      { h: 'Why Pongal stays put and Diwali moves', html: '<p>Festivals tied to the Sun, like Pongal, Makara Sankranti, Puthandu, Vishu and Baisakhi, fall on almost the same Gregorian date every year (14 or 15 January, 14 or 15 April). Festivals tied to the Moon, like Ugadi, Ganesh Chaturthi and Diwali, move about 11 days earlier each year.</p><p>The reason is arithmetic. A lunar month (new moon to new moon) is 29.53 days, so 12 of them make about 354 days. The solar year measured against the stars is 365.26 days. The gap of about 11 days adds up to a whole month roughly every 32 months, and the lunar calendar then adds an extra month, the <strong>adhika masa</strong>, which has no sankranti in it. In 2026 that was Adhika Jyeshtha (17 May to 15 June). The <em>Surya Siddhanta</em> already gives these month lengths and the rule for the extra month.</p>' },
      { h: 'Same festival, many names', html: '<ul><li><strong>Sun enters Makara:</strong> Pongal (Tamil Nadu), Sankranti (Andhra Pradesh, Telangana, Karnataka), Uttarayan (Gujarat), Maghi (Punjab), Magh Bihu (Assam), Makaravilakku (Sabarimala).</li><li><strong>Solar new year, Sun enters Mesha:</strong> Puthandu (Tamil Nadu), Vishu (Kerala), Baisakhi (Punjab), Pana Sankranti (Odisha), Pohela Boishakh (Bengal), Bohag Bihu (Assam).</li><li><strong>Lunar new year, Chaitra Shukla Pratipada:</strong> Ugadi (Telugu and Kannada), Gudi Padwa (Maharashtra), Cheti Chand (Sindhi), Navreh (Kashmir), and the start of Chaitra Navratri and of the Vikram Samvat year in the North.</li><li><strong>Other new years:</strong> the Malayalam year begins on Chingam 1, and the Gujarati new year the day after Diwali.</li></ul>' },
      { h: 'Amanta and purnimanta: same day, different month name', html: '<p>Both systems agree on every tithi. They only label the dark half (Krishna paksha) differently. Krishna Janmashtami is "Shravana Krishna Ashtami" in Telugu, Kannada and Marathi calendars but "Bhadrapada Krishna Ashtami" in Hindi calendars, and it is the same day. Festivals in the bright half carry the same month name everywhere.</p>' },
      { h: 'Years and eras', html: '<ul><li><strong>Shalivahana Shaka</strong> (Telugu, Kannada, Marathi, and the national calendar): Gregorian year minus 78.</li><li><strong>Vikram Samvat</strong> (North India, Gujarat, Nepal): Gregorian year plus 57.</li><li><strong>Kollam era</strong> (Kerala): Gregorian year minus 824 from Chingam.</li><li><strong>Kali Yuga year:</strong> Gregorian year plus 3101.</li><li><strong>60-year cycle</strong> (Prabhava to Akshaya): shared by the Tamil and Telugu-Kannada calendars. The Tamil year starts at Puthandu and the Telugu-Kannada year at Ugadi, but they carry the same name. 2026-27 is Parabhava in both.</li></ul>' },
      { h: 'The Indian National Calendar', html: '<p>India\'s official calendar was adopted on 22 March 1957 on the advice of the Calendar Reform Committee chaired by the physicist Meghnad Saha. Its year begins on 22 March (21 March in a leap year) as Chaitra 1, it counts the Saka era, and it is used in the Gazette of India and by All India Radio alongside the Gregorian date.</p>' }
    ],
    faq: [
      ['Why does Tamil New Year fall on 14 April every year but Ugadi moves?', 'Tamil Puthandu follows the Sun (the day it enters Mesha), so it stays near 14 April. Ugadi follows the Moon (the day after the Chaitra new moon), so it moves between March and April.'],
      ['Are the Telugu and Kannada calendars the same?', 'Yes. Both use the amanta lunar calendar (Chandramana) with Ugadi as new year, the same month names and the same 60 year names. Only some regional festivals differ.'],
      ['Which calendar does Kerala use?', 'The Malayalam calendar, which is solar and counts the Kollam era. A month starts on the day of sankranti if it happens before about three fifths of the daytime is over, otherwise the next day.'],
      ['What is adhika masa?', 'An extra lunar month with no sankranti in it, added about once every 32 months so that lunar festivals stay in their seasons. The next one after Adhika Jyeshtha 2026 comes in 2029.'],
      ['What is the official calendar of India?', 'The Indian National Calendar (Saka calendar), used alongside the Gregorian calendar since 1957.']
    ],
    sources: [
      'Surya Siddhanta, translated by Ebenezer Burgess (1860), chapters 1 and 14 on the measures of time',
      'Report of the Calendar Reform Committee, Government of India, CSIR, 1955 (chair: Meghnad Saha)',
      'Robert Sewell and Sankara Balakrishna Dikshit, The Indian Calendar, 1896',
      'Positional Astronomy Centre, India Meteorological Department, Kolkata: Rashtriya Panchang',
      'Jean Meeus, Astronomical Algorithms, 2nd edition, 1998 (positions of the Sun and Moon)'
    ]
  },
  fest: {
    pongal: 'Thai Pongal / Makara Sankranti / Uttarayan', puthandu: 'Tamil Puthandu / Baisakhi / Pana Sankranti (solar new year)', vishu: 'Vishu (Kerala)',
    chingam1: 'Chingam 1, Malayalam New Year', ugadi: 'Ugadi / Gudi Padwa (lunar new year)', ramanavami: 'Sri Rama Navami', ganesh: 'Vinayaka Chaturthi / Ganesh Chaturthi',
    onam: 'Thiruvonam (Onam)', navaratri: 'Navaratri begins', dussehra: 'Vijayadashami / Dussehra', diwali: 'Deepavali / Diwali (Lakshmi Puja)', deepam: 'Karthigai Deepam',
    shivaratri: 'Maha Shivaratri', sankranti: '{rasi} Sankranti', month_starts: '{month} begins (Tamil)',
    extra: { 3: 'Dakshinayana begins', 5: 'Vishwakarma Puja', 6: 'Tula Sankramana (Kaveri, Kodagu)', 8: 'Margazhi begins', 10: '' },
    cal_tag: { solar: 'solar', lunar: 'lunar' }
  },
  learn: {
    hub_title: 'Learn: Indian astrology and calendar explained simply | RasiVani',
    hub_desc: 'Short, sourced explainers on Rahu kalam, chart styles, nakshatras, calendars and more, with the RasiVani cartoon videos.',
    hub_h1: 'Learn',
    hub_lede: 'Short explainers that go with our cartoon videos. Every page says where the idea comes from: an old text, a regional custom, or science.',
    watch: 'Watch the video', related: 'Try it yourself', read_more: 'Read'
  }
};
