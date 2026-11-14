// English text for the fun tools (tools/fun.mjs, js/fun.js). {braces} are filled in the browser.
export default {
  c: {
    nav: 'Fun tools',
    home_h: 'Fun tools to share with friends',
    more_h: 'More fun tools',
    faq_h: 'Questions people ask',
    your_name: 'Your name', friend_name: "Friend's name",
    your_star: 'Your birth star', friend_star: "Friend's birth star", star_opt: "Don't know",
    need_names: 'Please type both names.',
    fun_note: 'Just for fun. Astrology is a tradition and belief, not science. Real friendship is built by people, not scores.',
    share_wa: 'Share on WhatsApp', download: 'Save as image', copy: 'Copy link', copied: 'Link copied',
    badge_free: 'Free', badge_private: 'Nothing is saved', badge_share: 'Share on WhatsApp'
  },
  friend: {
    title: 'Friendship Score Calculator by Name and Birth Star | RasiVani',
    desc: 'Free friendship calculator: type two names and dates of birth, watch a funny cartoon of you two and get a friendship score from your birth stars (tara, gana, yoni). Share on WhatsApp.',
    keywords: 'friendship calculator, friendship score, friendship test by name, best friend calculator, nakshatra friendship compatibility, friendship match',
    h1: 'Friendship Score',
    card: 'How strong is your friendship? Two names, one score.',
    lede: 'Type both full names and dates of birth. Watch your own friendship cartoon, see your score from your birth stars, then send it to your friend on WhatsApp.',
    btn: 'Show our friendship score',
    p1: 'You', p2: 'Your friend',
    dob: 'Date of birth', look: 'Cartoon', boy: 'Boy', girl: 'Girl',
    dob_hint: 'The birth date gives each person\'s birth star (nakshatra). Nothing is saved: it all runs on your phone.',
    need_dob: 'Please enter both dates of birth.',
    replay: 'Play the cartoon again',
    scenes: [
      '{a} saves the last piece of biryani for {b}. Every single time.',
      'Rain or no rain, {a} keeps {b} dry. {a} gets wet, no complaints.',
      '{a} and {b}: 500 selfies, 1 approved by both.',
      'The famous {a} + {b} high five. The whole class still remembers it.',
      'Chai at 4 PM. {a} pays today, {b} pays "next time" (since 2019).',
      '{a} and {b} dance at every function like nobody is watching. Everybody is watching.',
      'Exam tomorrow. {a} hands over the notes, {b} hands over the snacks.',
      '{b} had a bad day. {a} arrived with ice cream. Problem solved.',
      'When {a} and {b} win something together, the whole street knows.',
      'Dosti hug. {a} and {b} would cross any distance for each other.'
    ],
    praise: [
      '{n}: gives up the window seat every time 🪟',
      '{n}: says "on the way" and actually comes 🏃',
      '{n}: remembers every birthday without a reminder 🎂',
      '{n}: shares the last chocolate without a fight 🍫',
      '{n}: picks up the call even at 2 AM 📞',
      '{n}: keeps every secret like a bank locker 🔐',
      '{n}: laughs at your jokes, even the bad ones 😂',
      '{n}: lends money and forgets to ask for it back 💸',
      '{n}: stands up for you when you are not in the room 🛡️',
      '{n}: brings food from home for everyone 🍱'
    ],
    parts: { tara: 'Star count (tara)', gana: 'Nature (gana)', yoni: 'Instinct (yoni)', names: 'Name vibe' },
    tiers: [
      ['Best friends forever', 'You two finish each other\'s sentences. Never let this one go.'],
      ['Strong bond', 'The friend you call first with good news, and the first one who calls back.'],
      ['Good friends', 'Easy, fun and real. A few more trips together and this goes to the top.'],
      ['Growing friendship', 'Different styles, good heart. Give it time and plenty of chai.'],
      ['Opposites attract', 'You see the world differently, which is exactly why you learn so much from each other.']
    ],
    share: '{a} 🤝 {b}: our friendship score is {score}% on RasiVani! Check yours:',
    sections: [
      { h: 'How the friendship score works', html: '<p>Each date of birth gives that person\'s birth star (the nakshatra the Moon was in, worked out for midday India time). Then three star rules from the marriage porutham are used, because they are really about how two people get along: <em>tara</em> (count from one star to the other, both ways; Sampat, Kshema, Sadhana, Mitra and Parama Mitra are the friendly counts, up to 30 points), <em>gana</em> (Deva, Manushya or Rakshasa nature, up to 30) and <em>yoni</em> (the animal of each star, up to 25). The names add up to 15 more, and they also pick which cartoon you get, so the same pair always gets the same score and cartoon, in either order.</p>' },
      { h: 'Belief and fact', html: '<p>Tara, gana and yoni come from traditional Indian astrology. No scientific study has shown that birth stars decide who becomes friends. Friendship grows from time, trust and kindness. Use the score to start a laugh, not to judge anyone.</p>' }
    ],
    faq: [
      ['Is the friendship score accurate?', 'It is for fun. It follows traditional star rules (tara, gana, yoni) from your birth dates, plus a fixed number from your names.'],
      ['Why does the same pair always get the same score?', 'The score is worked out from the names (and stars), not drawn at random, so you can check it again and show others.'],
      ['Do you store the names?', 'No. Everything runs on your phone. The names only leave it if you press Share and send the link yourself.'],
      ['Why do you need the date of birth?', 'To find each person\'s birth star. We use midday India time; for your exact star, make your free jathagam with your birth time and place.']
    ]
  },
  flames: {
    title: 'FLAMES Game Online: Friends, Love, Affection, Marriage, Enemies, Siblings | RasiVani',
    desc: 'Play the classic FLAMES name game online, free. Type two names, watch the common letters get struck out and see F, L, A, M, E or S. Works with Tamil, Telugu, Hindi and every Indian script.',
    keywords: 'flames game, flames calculator, flames test, flames love calculator, flames by name, flames tamil, flames telugu',
    h1: 'FLAMES Game',
    card: 'The school-days name game. F, L, A, M, E or S?',
    lede: 'The name game we all played in the back of a notebook. Type two names and see what FLAMES says, in English or your own script.',
    btn: 'Play FLAMES',
    count: '{n} letters left after striking out the common ones',
    same: 'The two names have exactly the same letters, so nothing is left to count. FLAMES calls that Friends.',
    res: {
      F: ['Friends', 'Chai, gossip and long phone calls. Solid.'],
      L: ['Love', 'Somebody is blushing. We saw that.'],
      A: ['Affection', 'Soft corner confirmed. Handle with care.'],
      M: ['Marriage', 'Start saving for the wedding biryani.'],
      E: ['Enemies', 'Frenemies at best. Share a snack to make peace.'],
      S: ['Siblings', 'Fight like brother and sister, defend like brother and sister.']
    },
    share: 'FLAMES says {a} + {b} = {word}! Try your names:',
    sections: [
      { h: 'How to play FLAMES', html: '<ol><li>Write both names.</li><li>Strike out every letter that appears in both names, one for one.</li><li>Count the letters that are left.</li><li>Write F L A M E S. Count round the word by that number and strike out the letter you land on.</li><li>Keep going from the next letter until one is left: Friends, Love, Affection, Marriage, Enemies or Siblings.</li></ol><p>RasiVani does exactly this, and shows which letters were struck out. For Tamil, Telugu, Hindi and other scripts, a letter with its vowel sign (like கா or కా) counts as one letter, the way people count by hand.</p>' },
      { h: 'Where FLAMES comes from', html: '<p>FLAMES is a playground game, not astrology. It spread through schools across India, Sri Lanka, the Philippines and beyond in the 1980s and 90s, on the last page of notebooks. It has no basis in any tradition, which is half the fun.</p>' }
    ],
    faq: [
      ['What does FLAMES stand for?', 'Friends, Love, Affection, Marriage, Enemies, Siblings.'],
      ['Should I use first names or full names?', 'Either. Most people use first names. Different spellings give different answers, which is part of the game.'],
      ['Can I play FLAMES in Tamil or Telugu?', 'Yes. Type both names in the same script so common letters can be struck out.'],
      ['Is FLAMES a real prediction?', 'No. It is a counting game for fun. For marriage matching, families use porutham from birth stars.']
    ]
  },
  animal: {
    title: 'Nakshatra Animal (Yoni): What Is Your Birth Star Animal? | RasiVani',
    desc: 'Find your nakshatra animal (yoni) free: pick your birth star or type your date of birth. See your animal, what it says about you, which stars share it and its natural rival.',
    keywords: 'nakshatra animal, yoni animal, birth star animal, nakshatra yoni, my nakshatra animal, spirit animal vedic astrology',
    h1: 'Your Nakshatra Animal',
    card: 'Each of the 27 stars has an animal. Which one is yours?',
    lede: 'In Vedic astrology every birth star has an animal, called its yoni. Find yours and share it with friends.',
    btn: 'Show my animal',
    how: 'How do you want to find it?',
    mode_star: 'I know my star', mode_dob: 'Use my birth date',
    dob: 'Date of birth', tob: 'Time of birth (optional)',
    tob_hint: 'India time. Without a time we use midday, and we tell you if the Moon changed star that day.',
    need_star: 'Please pick your birth star.', need_dob: 'Please enter your date of birth.',
    your_star: 'Birth star: {star}',
    result: 'Your nakshatra animal is the',
    twins: 'Stars with the same animal', only: 'None. Yours is the only star with this animal.', rival: 'Natural rival',
    changed: 'The Moon moved from {before} to {after} at about {time} that day. Born before then: {before}. After: {after}. Add your birth time to be sure.',
    animals: [
      ['Horse', 'Energetic, quick and independent. You love freedom and hate waiting.'],
      ['Elephant', 'Strong, dignified and loyal. You never forget a kindness.'],
      ['Sheep', 'Gentle, creative and caring. Your group feels like family.'],
      ['Serpent', 'Intuitive and deep. You notice what others miss and keep secrets well.'],
      ['Dog', 'Loyal, hardworking and protective. Your friends can always count on you.'],
      ['Cat', 'Clever, graceful and independent. You do things your own way.'],
      ['Rat', 'Smart and resourceful. You spot a chance and save for a rainy day.'],
      ['Cow', 'Kind, patient and generous. People feel calm around you.'],
      ['Buffalo', 'Steady and tireless. Give you a job and it gets done.'],
      ['Tiger', 'Brave and bold. You lead from the front.'],
      ['Deer', 'Gentle, sensitive and artistic. You love peace and beauty.'],
      ['Monkey', 'Playful, curious and quick. You make every room laugh.'],
      ['Mongoose', 'Fearless problem-solver. Small trouble never scares you.'],
      ['Lion', 'Confident and proud, a natural protector of the people you love.']
    ],
    share: 'My nakshatra animal is the {animal} {emoji} ({star}). Find yours:',
    sections: [
      { h: 'What is yoni?', html: '<p>Yoni is one of the ten poruthams (Yoni porutham, Yoni koota) used when matching horoscopes for marriage. Each of the 27 nakshatras is given one of 14 animals: horse, elephant, sheep, serpent, dog, cat, rat, cow, buffalo, tiger, deer, monkey, mongoose and lion. Two stars with the same animal are thought to get on naturally; seven pairs are natural rivals, such as cat and rat, or serpent and mongoose.</p><p>The personality lines here are a friendly reading of each animal, not a classical text. Astrology is a tradition and belief, not science.</p>' }
    ],
    faq: [
      ['How do I find my birth star?', 'Your birth star is the nakshatra the Moon was in when you were born. Pick "Use my birth date", or make your free jathagam on RasiVani.'],
      ['Which stars share my animal?', 'Most animals have two stars. The mongoose has only one, Uttara Ashadha. The result shows the others with your animal.'],
      ['What is a natural rival?', 'Yoni lists seven enemy pairs: horse and buffalo, elephant and lion, sheep and monkey, serpent and mongoose, dog and deer, cat and rat, cow and tiger. In porutham such a pair scores low on yoni.'],
      ['Is this used in marriage matching?', 'Yes, yoni is one of the ten poruthams. For a full match use the marriage porutham tool.']
    ]
  }
};
