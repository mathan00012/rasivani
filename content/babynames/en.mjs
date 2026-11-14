// English: baby names by nakshatra (tools/babynames.mjs). {braces} are filled by the builder or the browser.
export default {
  faq_h: 'Questions people ask',
  nav: 'Baby names by star',
  boys: 'Boy names', girls: 'Girl names', name: 'Name', meaning: 'Meaning',
  pada: 'Pada {n}', starts: 'Names starting with {letter}', also: 'Also used: {alts}', rasi: 'Rasi', star: 'Star',
  rare: 'Very few traditional names start with this sound. Many families pick a name from another letter of the same star, or keep the star letter as a pet name.',
  hub: {
    title: 'Baby Names by Nakshatra: Name Letters for All 27 Stars with Meanings | RasiVani',
    desc: 'Free baby names by birth star (nakshatra) and pada. Find the lucky first letter for your baby from the date and time of birth, then pick from boy and girl names with meanings.',
    keywords: 'baby names by nakshatra, nakshatra names, baby name by birth star, nakshatra letters, name letters for nakshatra pada, hindu baby names with meaning',
    h1: 'Baby names by nakshatra',
    lede: 'Each birth star has four padas, and each pada has its own first letter for the name. Find your baby’s letter, then pick from boy and girl names with meanings.',
    card: 'Name letters for all 27 stars, with boy and girl names'
  },
  starp: {
    title: '{star} Nakshatra Baby Names: Letters {letters} | RasiVani',
    desc: 'Baby names for {star} nakshatra: name letters {letters} for padas 1 to 4. {count} boy and girl names with meanings.',
    keywords: '{star} nakshatra baby names, {star} nakshatra letters, {star} nakshatra boy names, {star} nakshatra girl names, names for {star} star',
    h1: '{star} nakshatra baby names',
    lede: 'The four padas of {star} give the name letters {letters}. Boy and girl names with meanings for each pada.'
  },
  form: {
    how: 'How do you want to find it?', mode_star: 'I know the star', mode_dob: 'From birth date',
    star: 'Birth star (nakshatra)', star_opt: 'Choose the star', pada: 'Pada', pada_any: 'Not sure',
    dob: 'Date of birth', tob: 'Time of birth', tob_hint: 'The time decides the pada. Without it we show all four letters of the star.',
    btn: 'Show name letters', need_star: 'Please choose the birth star.', need_dob: 'Please enter the date of birth.',
    result: '{star}, pada {pada}: the name letter is {letter}', result_all: '{star}: name letters {letters}',
    result_note: 'Without the birth time, the pada is not known. Add the time for the exact letter.',
    changed: 'The star changed on this day at {time} (India time): {before} before, {after} after. Add the birth time to be sure.',
    see: 'See the names'
  },
  table_h: 'Nakshatra name letters for all 27 stars',
  table_cap: 'First letter of the name for each pada (quarter) of the 27 stars.',
  all_h: 'Baby names for every star',
  find_h: 'Don’t know the baby’s star?',
  find_p: 'Make the free birth chart (jathagam) with the date, time and place of birth. It shows the nakshatra and pada, and the name letter.',
  find_btn: 'Make the free birth chart',
  note: 'Choosing the first letter from the birth star is a tradition, not a rule. A name the family loves, that is easy to say and carries a good meaning, matters most.',
  sections: [
    { h: 'How naming by nakshatra works', html: '<p>The Moon’s position at birth gives the birth star (nakshatra). Each of the 27 stars is split into four quarters called <strong>padas</strong>, and the old <em>Avakahada</em> table gives each pada a sound. Families use that sound as the first letter of the baby’s name. For example, Ashwini pada 1 is <strong>Chu</strong>, so names like Chudamani fit.</p><p>The naming ceremony (<em>namakarana</em>, <em>peyar sootum vizha</em>) is usually held on the 11th, 12th or 16th day after birth, or later on a good day.</p>' },
    { h: 'Rare sounds and substitutes', html: '<p>A few padas have sounds that almost no names start with, such as ङ (nga), ञ (nya), ण (na), ठ (tha) and ढ (dha). Families use the nearest sound: na for ङ and ण, tha or ta for ठ, da for ढ, and gya or gnana (ज्ञ) for ञ. Tamil has no separate letters for these sounds, so Tamil lists use த for ட, and ந for ங and ண. We show these substitutes next to each letter.</p>' }
  ],
  faq: [
    ['How do I find my baby’s nakshatra and pada?', 'You need the date, time and place of birth. Use the form above or make the free jathagam. The pada depends on the exact time, so a guess of the time can give the wrong letter.'],
    ['Must the name start with the nakshatra letter?', 'No. It is a family tradition. Many families give the star-letter name at the ceremony and use another name in school, or use the letter only for the first syllable of a longer name.'],
    ['Can I use a name from another pada of the same star?', 'Yes. When the pada sound is rare, picking a name from another pada of the same star, or from the letters of the baby’s rasi, is common practice.'],
    ['Are these names only for Hindus?', 'The letters come from Indian astrology, but the names are Indian names used by many families. Every name here has a simple meaning so you can decide for yourself.']
  ],
  faq_star: [
    ['What are the name letters for {star} nakshatra?', 'Pada 1: {l1}, pada 2: {l2}, pada 3: {l3}, pada 4: {l4}.'],
    ['Which rasi does {star} belong to?', '{rasis}'],
    ['Which letter should I use for my baby born in {star}?', 'Use the letter of the pada the Moon was in at the time of birth. The free birth chart on RasiVani shows the pada.']
  ],
  rasi_line: 'Pada {p}: {rasi}'
};
