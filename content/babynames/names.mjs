// Baby names by nakshatra pada (first letter of the name), used by tools/babynames.mjs and the paid Baby Naming Guide.
// N[star 0-26][pada 0-3] = [boys, girls]. Each name: "Latin=देवनागरी=தமிழ்=meaning in English".
// - Devanagari empty  → a Tamil name, shown only on Tamil pages.
// - Tamil empty       → not shown on Tamil pages (its Tamil spelling does not start with the Tamil pada letter).
// Telugu, Kannada and Malayalam spellings are made from the Devanagari. Meanings are translated in meanings.mjs.
// Every name is checked against the pada letter by `node tools/babynames.mjs --check`.
export default [
  // 0 Ashwini: चू चे चो ला
  [
    ['Chudamani=चूडामणि=சூடாமணி=crest jewel;Chunilal=चुनीलाल==little precious gem;Sundar==சுந்தர்=beautiful;Subramanian==சுப்பிரமணியன்=Lord Murugan',
      'Sumathi==சுமதி=wise;Suganya==சுகன்யா=graceful girl;Sudarvizhi==சுடர்விழி=eyes bright as a flame'],
    ['Chetan=चेतन=சேதன்=consciousness;Chaitanya=चैतन्य=சைதன்யா=consciousness;Sekar==சேகர்=crown;Seran==சேரன்=Chera king',
      'Chetana=चेतना=சேதனா=awareness;Chaitali=चैताली==born in the month of Chaitra;Chaitra=चैत्रा=சைத்ரா=first month of spring;Selvi==செல்வி=prosperous girl'],
    ['Chokkanath=चोक्कनाथ=சொக்கநாதன்=Lord Shiva;Solaimalai==சோலைமலை=Lord Murugan;Cholan==சோழன்=Chola king',
      'Sobana==சோபனா=radiant;Solai==சோலை=green grove'],
    ['Lakshman=लक्ष्मण=லட்சுமணன்=brother of Lord Rama;Lalit=ललित=லலித்=graceful;Lav=लव=லவ்=son of Lord Rama;Lakshya=लक्ष्य==aim',
      'Lakshmi=लक्ष्मी=லட்சுமி=Goddess Lakshmi;Lata=लता=லதா=creeper;Lavanya=लावण्या=லாவண்யா=grace;Lalitha=ललिता=லலிதா=Goddess Lalitha']
  ],
  // 1 Bharani: ली लू ले लो
  [
    ['Leeladhar=लीलाधर==Lord Krishna;Lingesh=लिंगेश=லிங்கேஷ்=Lord Shiva;Lingaraj=लिंगराज=லிங்கராஜ்=Lord Shiva;Likhit=लिखित==written',
      'Leela=लीला=லீலா=divine play;Leelavati=लीलावती=லீலாவதி=playful;Lipi=लिपि=லிபி=script'],
    ['Lubdhak=लुब्धक==the star Sirius', ''],
    ['Lekhraj=लेखराज==lord of writing', 'Lekha=लेखा=லேகா=writing;Lekhana=लेखना=லேகனா=writing'],
    ['Lokesh=लोकेश=லோகேஷ்=lord of the world;Lokanath=लोकनाथ=லோகநாதன்=lord of the world;Lohit=लोहित=லோகித்=red;Lochan=लोचन=லோசன்=eye',
      'Lochana=लोचना=லோசனா=eyes;Lopamudra=लोपामुद्रा=லோபாமுத்ரா=wife of sage Agastya;Lokeshwari=लोकेश्वरी=லோகேஸ்வரி=queen of the world']
  ],
  // 2 Krittika: अ ई उ ए
  [
    ['Arjun=अर्जुन=அர்ஜுன்=bright;Aditya=आदित्य=ஆதித்யா=Sun God;Arun=अरुण=அருண்=dawn;Anand=आनंद=ஆனந்த்=joy;Anbu==அன்பு=love',
      'Ananya=अनन्या=அனன்யா=unique;Aarti=आरती=ஆரத்தி=worship with lamps;Anjali=अंजलि=அஞ்சலி=offering with folded hands;Aditi=अदिति=அதிதி=mother of the gods;Amudha==அமுதா=nectar'],
    ['Ishaan=ईशान=இஷான்=Lord Shiva;Indra=इन्द्र=இந்திரன்=king of the gods;Ishwar=ईश्वर=ஈஸ்வர்=god;Ilango==இளங்கோ=young prince',
      'Isha=ईशा=இஷா=goddess;Indu=इन्दु=இந்து=moon;Indira=इन्दिरा=இந்திரா=Goddess Lakshmi;Ira=इरा==earth;Iniya==இனியா=sweet'],
    ['Uday=उदय=உதய்=rise;Umesh=उमेश=உமேஷ்=Lord Shiva;Utkarsh=उत्कर्ष==excellence;Ujjwal=उज्ज्वल==bright;Uthaman==உத்தமன்=noble',
      'Uma=उमा=உமா=Goddess Parvati;Usha=उषा=உஷா=dawn;Urmila=उर्मिला=ஊர்மிளா=wife of Lakshmana;Urvi=उर्वी=உர்வி=earth'],
    ['Ekansh=एकांश==whole;Ekadant=एकदन्त=ஏகதந்தன்=Lord Ganesha;Eknath=एकनाथ=ஏக்நாத்=a saint;Ezhil==எழில்=beauty',
      'Ekta=एकता==unity;Esha=एषा=ஏஷா=wish;Aishwarya=ऐश्वर्या=ஐஸ்வர்யா=prosperity;Ezhilarasi==எழிலரசி=queen of beauty']
  ],
  // 3 Rohini: ओ वा वी वू
  [
    ['Om=ओम्=ஓம்=sacred syllable Om;Omkar=ओंकार=ஓம்கார்=sacred syllable Om;Ojas=ओजस्=ஓஜஸ்=vitality;Omprakash=ओमप्रकाश=ஓம்பிரகாஷ்=light of Om',
      'Ojasvi=ओजस्वी=ஓஜஸ்வி=radiant;Omana=ओमना==darling;Oviya==ஓவியா=beautiful as a painting'],
    ['Vasudev=वासुदेव=வாசுதேவன்=Lord Krishna;Varun=वरुण=வருண்=god of rain;Vamsi=वंशी=வம்சி=flute;Vasant=वसंत=வசந்த்=spring',
      'Vani=वाणी=வாணி=Goddess Saraswati;Varsha=वर्षा=வர்ஷா=rain;Vasanthi=वासंती=வாசந்தி=spring;Vandana=वंदना=வந்தனா=worship;Valli==வள்ளி=consort of Lord Murugan'],
    ['Vikram=विक्रम=விக்ரம்=valour;Vijay=विजय=விஜய்=victory;Vinay=विनय=வினய்=modesty;Vishnu=विष्णु=விஷ்ணு=Lord Vishnu',
      'Vidya=विद्या=வித்யா=knowledge;Vineeta=विनीता=வினிதா=humble;Vibha=विभा=விபா=radiance;Vijaya=विजया=விஜயா=victory'],
    ['', '']
  ],
  // 4 Mrigashira: वे वो का की
  [
    ['Venkatesh=वेंकटेश=வெங்கடேஷ்=Lord Venkateswara;Ved=वेद=வேத்=sacred knowledge;Venu=वेणु=வேணு=flute;Vedant=वेदान्त=வேதாந்த்=sacred knowledge;Vetrivel==வெற்றிவேல்=Lord Murugan;Vendhan==வேந்தன்=king',
      'Vedika=वेदिका=வேதிகா=altar;Vaishnavi=वैष्णवी=வைஷ்ணவி=Goddess Lakshmi;Vaidehi=वैदेही=வைதேகி=Goddess Sita;Veni=वेणी=வேணி=braid;Vennila==வெண்ணிலா=white moon'],
    ['', ''],
    ['Karthik=कार्तिक=கார்த்திக்=Lord Murugan;Kamal=कमल=கமல்=lotus;Kalyan=कल्याण=கல்யாண்=welfare;Kapil=कपिल=கபில்=a sage;Kathir==கதிர்=ray of the sun',
      'Kavya=काव्या=காவ்யா=poetry;Kamala=कमला=கமலா=Goddess Lakshmi;Kaveri=कावेरी=காவேரி=river Kaveri;Kalpana=कल्पना=கல்பனா=imagination;Kanmani==கண்மணி=apple of the eye'],
    ['Kiran=किरण=கிரண்=ray of light;Kishore=किशोर=கிஷோர்=youth;Kireet=किरीट==crown;Keerthivasan==கீர்த்திவாசன்=one who holds fame',
      'Keerthana=कीर्तना=கீர்த்தனா=song of praise;Kirti=कीर्ति=கீர்த்தி=fame;Kishori=किशोरी=கிஷோரி=Goddess Radha;Kiranmayi=किरणमयी==full of light']
  ],
  // 5 Ardra: कु घ ङ छ
  [
    ['Kunal=कुणाल=குணால்=lotus;Kumar=कुमार=குமார்=prince;Kuber=कुबेर=குபேரன்=god of wealth;Kush=कुश=குஷ்=son of Lord Rama;Kumaran==குமரன்=Lord Murugan',
      'Kumudini=कुमुदिनी=குமுதினி=water lily;Kusum=कुसुम==flower;Kumari=कुमारी=குமாரி=young girl;Kundavai==குந்தவை=Chola princess;Kuyil==குயில்=cuckoo bird'],
    ['Ghanshyam=घनश्याम=கனஷ்யாம்=Lord Krishna;Ganesan==கணேசன்=Lord Ganesha', 'Kavitha==கவிதா=poem;Kalaivani==கலைவாணி=Goddess Saraswati'],
    ['Naveen=नवीन=நவீன்=new;Nakul=नकुल=நகுல்=one of the Pandavas;Narendra=नरेन्द्र=நரேந்திரன்=king of men;Naresh=नरेश=நரேஷ்=king',
      'Navya=नव्या=நவ்யா=young;Nandini=नंदिनी=நந்தினி=daughter;Nayana=नयना=நயனா=eyes;Namrata=नम्रता==humility'],
    ['Chhatrasal=छत्रसाल==a brave king;Saravanan==சரவணன்=Lord Murugan;Sakthivel==சக்திவேல்=Lord Murugan',
      'Chhavi=छवि=சவி=radiance;Chhaya=छाया=சாயா=shade;Sandhya==சந்தியா=twilight']
  ],
  // 6 Punarvasu: के को हा ही
  [
    ['Keshav=केशव=கேசவன்=Lord Krishna;Ketan=केतन=கேதன்=banner;Kedar=केदार=கேதார்=Lord Shiva;Kailash=कैलाश=கைலாஷ்=abode of Lord Shiva',
      'Ketaki=केतकी=கேதகி=a fragrant flower;Kesar=केसर==saffron;Kairavi=कैरवी=கைரவி=moonlight'],
    ['Kaushik=कौशिक=கௌசிக்=sage Vishwamitra;Kaustubh=कौस्तुभ=கௌஸ்துப்=jewel of Lord Vishnu;Kovid=कोविद==scholar;Kovalan==கோவலன்=hero of Silappathikaram',
      'Komal=कोमल=கோமல்=soft;Kokila=कोकिला=கோகிலா=cuckoo bird;Kaumudi=कौमुदी=கௌமுதி=moonlight;Kothai==கோதை=Goddess Andal'],
    ['Hari=हरि=ஹரி=Lord Vishnu;Harsh=हर्ष=ஹர்ஷ்=joy;Harish=हरीश=ஹரீஷ்=Lord Vishnu;Hariharan=हरिहरन=ஹரிஹரன்=Lord Vishnu and Lord Shiva',
      'Harini=हरिणी=ஹரிணி=deer;Harshita=हर्षिता=ஹர்ஷிதா=joyful;Hamsa=हंसा=ஹம்சா=swan;Haritha=हरिता=ஹரிதா=green'],
    ['Hitesh=हितेश=ஹிதேஷ்=lord of goodness;Himanshu=हिमांशु=ஹிமான்ஷு=moon;Hiranya=हिरण्य==gold',
      'Himani=हिमानी=ஹிமானி=snow;Hira=हीरा=ஹீரா=diamond;Hiranmayi=हिरण्मयी==golden']
  ],
  // 7 Pushya: हु हे हो डा
  [
    ['', ''],
    ['Hemant=हेमन्त=ஹேமந்த்=winter season;Heramb=हेरम्ब==Lord Ganesha;Hemachandra=हेमचन्द्र=ஹேமச்சந்திரன்=golden moon',
      'Hema=हेमा=ஹேமா=gold;Hemalatha=हेमलता=ஹேமலதா=golden creeper;Haimavati=हैमवती=ஹைமவதி=Goddess Parvati'],
    ['', ''],
    ['Daksh=दक्ष==capable;Darshan=दर्शन=தர்ஷன்=vision;Damodar=दामोदर=தாமோதரன்=Lord Krishna;Dayanand=दयानंद=தயானந்த்=joy of kindness;Thamizharasan==தமிழரசன்=king of Tamil',
      'Daya=दया=தயா=kindness;Damini=दामिनी=தாமினி=lightning;Darshana=दर्शना=தர்ஷனா=vision;Dakshayani=दाक्षायणी=தாட்சாயணி=Goddess Parvati;Thamarai==தாமரை=lotus']
  ],
  // 8 Ashlesha: डी डू डे डो
  [
    ['Dinesh=दिनेश=தினேஷ்=Sun God;Dilip=दिलीप=திலீப்=a king;Dinakar=दिनकर=தினகரன்=Sun God;Deepak=दीपक=தீபக்=lamp',
      'Divya=दिव्या=திவ்யா=divine;Dipti=दीप्ति=தீப்தி=glow;Deepika=दीपिका=தீபிகா=little lamp;Disha=दिशा=திஷா=direction'],
    ['Dushyant=दुष्यन्त=துஷ்யந்த்=a king;Durjay=दुर्जय==hard to defeat', 'Dulari=दुलारी==dear one;Thulasi==துளசி=holy basil'],
    ['Dev=देव=தேவ்=god;Devesh=देवेश=தேவேஷ்=lord of the gods;Devendra=देवेन्द्र=தேவேந்திரன்=king of the gods',
      'Devi=देवी=தேவி=goddess;Devika=देविका=தேவிகா=little goddess;Devaki=देवकी=தேவகி=mother of Lord Krishna;Thenmozhi==தேன்மொழி=sweet as honey;Thendral==தென்றல்=gentle breeze'],
    ['', '']
  ],
  // 9 Magha: मा मी मू मे
  [
    ['Madhav=माधव=மாதவன்=Lord Krishna;Manoj=मनोज=மனோஜ்=born of the mind;Mahesh=महेश=மகேஷ்=Lord Shiva;Manish=मनीष=மனீஷ்=wise;Manickam==மாணிக்கம்=ruby',
      'Madhavi=माधवी=மாதவி=a spring creeper;Malini=मालिनी=மாலினி=garland maker;Manasi=मानसी=மானசி=of the mind;Malathi=मालती=மாலதி=jasmine;Malar==மலர்=flower'],
    ['Mihir=मिहिर==Sun God;Milind=मिलिंद=மிலிந்த்=bee;Mithun=मिथुन=மிதுன்=pair;Mithran=मित्रन=மித்ரன்=friend',
      'Meera=मीरा=மீரா=devotee of Lord Krishna;Meenakshi=मीनाक्षी=மீனாட்சி=Goddess Meenakshi;Mitali=मिताली=மிதாலி=friendship;Mihika=मिहिका==dew'],
    ['Mukund=मुकुन्द=முகுந்த்=Lord Krishna;Mukesh=मुकेश=முகேஷ்=Lord Shiva;Murali=मुरली=முரளி=flute;Murugan=मुरुगन=முருகன்=Lord Murugan',
      'Mukta=मुक्ता=முக்தா=pearl;Mudita=मुदिता==happy;Mullai==முல்லை=jasmine;Muthulakshmi==முத்துலட்சுமி=Goddess Lakshmi'],
    ['Megh=मेघ==cloud;Mehul=मेहुल==rain;Meiyappan==மெய்யப்பன்=lord of truth',
      'Megha=मेघा=மேகா=cloud;Meghana=मेघना=மேகனா=cloud;Menaka=मेनका=மேனகா=a celestial dancer;Mekhala=मेखला=மேகலா=girdle']
  ],
  // 10 Purva Phalguni: मो टा टी टू
  [
    ['Mohan=मोहन=மோகன்=charming;Mohit=मोहित=மோஹித்=charming;Moksh=मोक्ष==liberation;Mouli=मौलि=மௌலி=crown',
      'Mohini=मोहिनी=மோகினி=enchanting;Mohana=मोहना=மோகனா=charming;Mouna=मौना=மௌனா=silence'],
    ['Tarun=तरुण=தருண்=young;Tanmay=तन्मय=தன்மய்=absorbed;Tapan=तपन==sun;Tarak=तारक=தாரக்=protector',
      'Tara=तारा=தாரா=star;Tanvi=तन्वी=தன்வி=delicate;Tanuja=तनुजा=தனுஜா=daughter;Thangam==தங்கம்=gold'],
    ['Tilak=तिलक=திலக்=mark of honour;Thirumalai==திருமலை=holy hills of Tirupati',
      'Tithi=तिथि==lunar day;Titiksha=तितिक्षा==patience;Thilagavathi==திலகவதி=adorned with tilak'],
    ['Tukaram=तुकाराम=துக்காராம்=a saint;Tungesh=तुंगेश==moon', 'Tulsi=तुलसी=துளசி=holy basil']
  ],
  // 11 Uttara Phalguni: टे टो पा पी
  [
    ['Tej=तेज=தேஜ்=brilliance;Tejpal=तेजपाल==protector of brilliance', 'Tejal=तेजल==brilliance;Teja=तेजा=தேஜா=brilliance'],
    ['Toshit=तोषित==satisfied;Tholkappian==தொல்காப்பியன்=ancient Tamil grammarian', ''],
    ['Parth=पार्थ=பார்த்=Arjuna;Pavan=पवन=பவன்=wind;Prakash=प्रकाश==light;Pranav=प्रणव==sacred syllable Om;Pandian==பாண்டியன்=Pandya king;Parthiban==பார்த்திபன்=king',
      'Pallavi=पल्लवी=பல்லவி=new leaves;Padma=पद्मा=பத்மா=lotus;Parvati=पार्वती=பார்வதி=Goddess Parvati;Pavitra=पवित्रा=பவித்ரா=pure'],
    ['Pitambar=पीताम्बर=பீதாம்பரம்=Lord Krishna;Piyush=पीयूष=பியூஷ்=nectar;Pritam=प्रीतम=பிரீதம்=beloved',
      'Priya=प्रिया=பிரியா=beloved;Priyanka=प्रियंका=பிரியங்கா=beloved;Preeti=प्रीति=பிரீத்தி=love']
  ],
  // 12 Hasta: पू ष ण ठ
  [
    ['Pushkar=पुष्कर=புஷ்கர்=lotus;Puneet=पुनीत=புனீத்=pure;Purushottam=पुरुषोत्तम=புருஷோத்தமன்=Lord Vishnu;Pulkit=पुलकित==thrilled;Pugazhendhi==புகழேந்தி=one who holds fame',
      'Pooja=पूजा=பூஜா=worship;Poornima=पूर्णिमा=பூர்ணிமா=full moon;Pushpa=पुष्पा=புஷ்பா=flower;Poongodi==பூங்கொடி=flowering creeper;Poonguzhali==பூங்குழலி=one with flowers in her hair'],
    ['Shanmukh=षण्मुख=ஷண்முகம்=Lord Murugan;Shashank=शशांक==moon;Shankar=शंकर=சங்கர்=Lord Shiva;Shantanu=शंतनु=சாந்தனு=a king',
      'Shanti=शांति=சாந்தி=peace;Sharada=शारदा=சாரதா=Goddess Saraswati;Shalini=शालिनी=ஷாலினி=modest;Shakuntala=शकुंतला=சகுந்தலா=a queen;Shanmugapriya==ஷண்முகப்பிரியா=beloved of Lord Murugan'],
    ['Nandan=नंदन=நந்தன்=joy;Narayan=नारायण=நாராயணன்=Lord Vishnu;Navneet=नवनीत=நவநீத்=butter;Nachiket=नचिकेत==a seeker',
      'Nandita=नंदिता=நந்திதா=happy;Narmada=नर्मदा=நர்மதா=river Narmada;Nalini=नलिनी=நளினி=lotus;Nachiyar==நாச்சியார்=Goddess Andal'],
    ['Tapas=तपस्==penance;Thangaraj==தங்கராஜ்=golden king', 'Tapasya=तपस्या=தபஸ்யா=penance']
  ],
  // 13 Chitra: पे पो रा री
  [
    ['Perarasu==பேரரசு=emperor;Periyasamy==பெரியசாமி=great lord', 'Pechi==பேச்சி=village goddess'],
    ['Paurush=पौरुष==manliness;Ponvannan==பொன்வண்ணன்=golden hued', 'Paulomi=पौलोमी==wife of Indra;Ponni==பொன்னி=river Kaveri;Ponmani==பொன்மணி=golden gem'],
    ['Ram=राम=ராம்=Lord Rama;Rahul=राहुल=ராகுல்=efficient;Rajesh=राजेश=ராஜேஷ்=king;Raghav=राघव=ராகவன்=Lord Rama;Rajarajan==ராஜராஜன்=great Chola king',
      'Radha=राधा=ராதா=Goddess Radha;Rajeshwari=राजेश्वरी=ராஜேஸ்வரி=queen;Rachana=रचना=ரச்சனா=creation;Ramya=रम्या=ரம்யா=beautiful'],
    ['Rishi=ऋषि=ரிஷி=sage;Ritvik=ऋत्विक्=ரித்விக்=priest;Rishabh=ऋषभ=ரிஷப்=excellence',
      'Riddhi=ऋद्धि=ரித்தி=prosperity;Ritu=ऋतु=ரிது=season;Riya=रिया=ரியா=singer;Ritika=ऋतिका=ரித்திகா=truthful']
  ],
  // 14 Swati: रू रे रो ता
  [
    ['Rudra=रुद्र=ருத்ரன்=Lord Shiva;Rupesh=रूपेश=ரூபேஷ்=lord of beauty;Ruchir=रुचिर==beautiful',
      'Rupa=रूपा=ரூபா=form;Ruchi=रुचि=ருசி=interest;Rukmini=रुक्मिणी=ருக்மிணி=wife of Lord Krishna;Rupali=रूपाली=ரூபாலி=beautiful'],
    ['Revanth=रेवन्त=ரேவந்த்=son of the Sun God', 'Reva=रेवा=ரேவா=river Narmada;Renuka=रेणुका=ரேணுகா=mother of Parashurama;Rekha=रेखा=ரேகா=line;Revathi=रेवती=ரேவதி=a birth star'],
    ['Rohan=रोहन=ரோஹன்=rising;Rohit=रोहित=ரோஹித்=red;Roshan=रोशन=ரோஷன்=bright', 'Rohini=रोहिणी=ரோகிணி=a birth star;Roshni=रोशनी=ரோஷ்னி=light;Roja=रोजा=ரோஜா=rose'],
    ['Tanay=तनय=தனய்=son;Taran=तारण==saviour;Thanigaivel==தணிகைவேல்=Lord Murugan', 'Tarini=तारिणी=தாரிணி=saviour;Tanaya=तनया=தனயா=daughter;Thamizhselvi==தமிழ்செல்வி=daughter of Tamil']
  ],
  // 15 Vishakha: ती तू ते तो
  [
    ['Tirth=तीर्थ=தீர்த்=holy place;Trilok=त्रिलोक=திரிலோக்=three worlds;Trivikram=त्रिविक्रम=திரிவிக்ரம்=Lord Vishnu;Thirumal==திருமால்=Lord Vishnu',
      'Triveni=त्रिवेणी=திரிவேணி=meeting of three rivers;Trishala=त्रिशला=திரிஷாலா=mother of Mahavira'],
    ['Tushar=तुषार=துஷார்=snow;Tuhin=तुहिन==dew', 'Tulika=तूलिका=துலிகா=paintbrush;Tushti=तुष्टि==contentment'],
    ['Tejas=तेजस्=தேஜஸ்=brilliance;Tejendra=तेजेन्द्र==lord of brilliance', 'Tejaswini=तेजस्विनी=தேஜஸ்வினி=radiant;Tejashri=तेजश्री==radiant'],
    ['Toshan=तोषण==satisfied', 'Toshani=तोषणी==satisfied']
  ],
  // 16 Anuradha: ना नी नू ने
  [
    ['Nagendra=नागेन्द्र=நாகேந்திரன்=king of serpents;Nataraj=नटराज=நடராஜன்=Lord Shiva;Narasimha=नरसिंह=நரசிம்மன்=Lord Narasimha;Nagaraj=नागराज=நாகராஜ்=king of serpents',
      'Nayantara=नयनतारा=நயன்தாரா=star of the eyes;Narayani=नारायणी=நாராயணி=Goddess Lakshmi;Navaneeta=नवनीता=நவநீதா=butter;Nakshatra=नक्षत्रा=நட்சத்திரா=star'],
    ['Neeraj=नीरज=நீரஜ்=lotus;Nikhil=निखिल=நிகில்=complete;Nitin=नितिन=நிதின்=master of the right path;Nirmal=निर्मल=நிர்மல்=pure',
      'Nidhi=निधि=நிதி=treasure;Nisha=निशा=நிஷா=night;Nithya=नित्या=நித்யா=eternal;Nila==நிலா=moon'],
    ['Nutan=नूतन==new', 'Nupur=नूपुर==anklet'],
    ['Naitik=नैतिक=நைதிக்=moral;Nedumaran==நெடுமாறன்=Pandya king', 'Neha=नेहा=நேஹா=love;Netra=नेत्रा=நேத்ரா=eye;Naina=नैना=நைனா=eyes']
  ],
  // 17 Jyeshtha: नो या यी यू
  [
    ['', ''],
    ['Yash=यश=யஷ்=fame;Yashwant=यशवंत=யஷ்வந்த்=famous;Yatin=यतिन==ascetic;Yadunandan=यदुनंदन=யதுநந்தன்=Lord Krishna',
      'Yamini=यामिनी=யாமினி=night;Yashoda=यशोदा=யசோதா=mother of Lord Krishna;Yamuna=यमुना=யமுனா=river Yamuna;Yashika=यशिका==famous'],
    ['', ''],
    ['Yuvraj=युवराज=யுவராஜ்=prince;Yudhishthir=युधिष्ठिर=யுதிஷ்டிரன்=eldest Pandava;Yuvan=युवन=யுவன்=young', 'Yukta=युक्ता=யுக்தா=skilled']
  ],
  // 18 Mula: ये यो भा भी
  [
    ['', ''],
    ['Yogesh=योगेश=யோகேஷ்=Lord Shiva;Yogendra=योगेन्द्र=யோகேந்திரன்=lord of yoga', 'Yogita=योगिता=யோகிதா=one who practises yoga;Yojana=योजना==plan'],
    ['Bharat=भरत=பரத்=a great king;Bhaskar=भास्कर=பாஸ்கர்=Sun God;Bhargav=भार्गव=பார்கவ்=Lord Shiva;Bhavesh=भावेश=பவேஷ்=lord of the world',
      'Bhavana=भावना=பாவனா=feeling;Bharati=भारती=பாரதி=Goddess Saraswati;Bhagyashree=भाग्यश्री=பாக்யஸ்ரீ=fortunate'],
    ['Bhim=भीम=பீம்=strong;Bhishma=भीष्म=பீஷ்மர்=a great warrior', '']
  ],
  // 19 Purva Ashadha: भू धा फा ढा
  [
    ['Bhushan=भूषण==ornament;Bhuvan=भुवन=புவன்=world;Bhupathi=भूपति=பூபதி=king;Bhupendra=भूपेन्द्र==king',
      'Bhuvana=भुवना=புவனா=world;Bhumi=भूमि=பூமி=earth;Bhuvaneshwari=भुवनेश्वरी=புவனேஸ்வரி=queen of the world'],
    ['Dhanush=धनुष=தனுஷ்=bow;Dhananjay=धनंजय=தனஞ்ஜெயன்=Arjuna;Dharmendra=धर्मेन्द्र==lord of dharma',
      'Dhanya=धन्या=தன்யா=blessed;Dharini=धारिणी=தாரிணி=earth;Dhanalakshmi=धनलक्ष्मी=தனலட்சுமி=goddess of wealth;Dhara=धारा=தாரா=stream'],
    ['Phalgun=फाल्गुन==Arjuna;Phanindra=फणीन्द्र==king of serpents;Phani=फणि==serpent;Palani==பழனி=Lord Murugan', 'Phalguni=फाल्गुनी==born in Phalgun month;Pavai==பாவை=maiden'],
    ['Dakshesh=दक्षेश=தட்சேஷ்=Lord Shiva;Dayakar=दयाकर=தயாகர்=kind', 'Damayanti=दमयन्ती=தமயந்தி=wife of King Nala;Dakshina=दक्षिणा=தட்சிணா=offering']
  ],
  // 20 Uttara Ashadha: भे भो जा जी
  [
    ['Bhairav=भैरव=பைரவ்=Lord Shiva', 'Bhairavi=भैरवी=பைரவி=Goddess Durga'],
    ['Bhola=भोला=போலா=innocent;Bhoj=भोज=போஜ்=a wise king', ''],
    ['Jagdish=जगदीश=ஜகதீஷ்=lord of the world;Janak=जनक=ஜனகன்=father of Sita;Jayant=जयंत==victorious;Jay=जय==victory',
      'Janaki=जानकी=ஜானகி=Goddess Sita;Jahnavi=जाह्नवी=ஜாஹ்னவி=river Ganga;Jaya=जया==victory;Jayanti=जयंती==victorious'],
    ['Jitendra=जितेन्द्र=ஜிதேந்திரன்=master of the senses;Jishnu=जिष्णु=ஜிஷ்ணு=Lord Vishnu;Jeevan=जीवन=ஜீவன்=life;Jignesh=जिग्नेश==curious',
      'Jeevitha=जीविता=ஜீவிதா=life;Jigyasa=जिज्ञासा==curiosity;Jinal=जिनल==follower of truth']
  ],
  // 21 Shravana: खी खू खे खो
  [
    ['Kiruba==கிருபா=grace', 'Kiruthika==கிருத்திகா=the star Krittika'],
    ['Khushal=खुशाल==happy;Kumaravel==குமரவேல்=Lord Murugan', 'Khushi=खुशी==happiness;Kuzhali==குழலி=one with lovely hair'],
    ['Khemraj=खेमराज==king of welfare', ''],
    ['Govindan==கோவிந்தன்=Lord Krishna', 'Kokilavani==கோகிலவாணி=voice sweet as a cuckoo']
  ],
  // 22 Dhanishta: गा गी गु गे
  [
    ['Ganesh=गणेश=கணேஷ்=Lord Ganesha;Gagan=गगन=ககன்=sky;Gajendra=गजेन्द्र=கஜேந்திரன்=king of elephants;Gandharv=गन्धर्व==celestial musician',
      'Gayatri=गायत्री=காயத்ரி=a sacred hymn;Ganga=गंगा=கங்கா=river Ganga;Garima=गरिमा=கரிமா=dignity;Gargi=गार्गी=கார்கி=a woman sage'],
    ['Giri=गिरि=கிரி=mountain;Girish=गिरीश=கிரீஷ்=Lord Shiva;Girdhar=गिरिधर=கிரிதர்=Lord Krishna',
      'Gita=गीता=கீதா=song;Girija=गिरिजा=கிரிஜா=Goddess Parvati;Gitanjali=गीतांजलि=கீதாஞ்சலி=offering of songs'],
    ['Gunasekar=गुणशेखर=குணசேகரன்=crown of virtues;Guhan=गुहन=குகன்=Lord Murugan;Gurudev=गुरुदेव=குருதேவ்=divine teacher;Gunjan=गुंजन==humming',
      'Gunavati=गुणवती=குணவதி=virtuous;Gunjana=गुंजना==humming'],
    ['', '']
  ],
  // 23 Shatabhisha: गो सा सी सू
  [
    ['Gopal=गोपाल=கோபால்=Lord Krishna;Govind=गोविंद=கோவிந்த்=Lord Krishna;Gokul=गोकुल=கோகுல்=village of Lord Krishna;Gautam=गौतम=கௌதம்=a sage',
      'Gopika=गोपिका=கோபிகா=friend of Lord Krishna;Gauri=गौरी=கௌரி=Goddess Parvati;Godavari=गोदावरी=கோதாவரி=river Godavari'],
    ['Sagar=सागर=சாகர்=ocean;Sanjay=संजय=சஞ்சய்=victorious;Sachin=सचिन=சச்சின்=pure;Sathyan=सत्यन=சத்யன்=truthful',
      'Saraswati=सरस्वती=சரஸ்வதி=Goddess Saraswati;Sadhana=साधना=சாதனா=dedication;Sangeeta=संगीता=சங்கீதா=music;Sarita=सरिता=சரிதா=river'],
    ['Siddharth=सिद्धार्थ=சித்தார்த்=one who has achieved;Sitaram=सीताराम=சீதாராம்=Sita and Rama;Sivakumar==சிவகுமார்=son of Lord Shiva',
      'Sita=सीता=சீதா=Goddess Sita;Sindhu=सिंधु=சிந்து=river Indus;Siddhi=सिद्धि=சித்தி=achievement'],
    ['Suresh=सुरेश=சுரேஷ்=king of the gods;Sunil=सुनील=சுனில்=deep blue;Suraj=सूरज=சூரஜ்=sun;Subhash=सुभाष=சுபாஷ்=well spoken',
      'Sudha=सुधा=சுதா=nectar;Sunita=सुनीता=சுனிதா=well behaved;Suman=सुमन=சுமன்=flower;Supriya=सुप्रिया=சுப்ரியா=beloved']
  ],
  // 24 Purva Bhadrapada: से सो दा दी
  [
    ['Senthil==செந்தில்=Lord Murugan;Selvam==செல்வம்=wealth', 'Sevanti=सेवंती=செவ்வந்தி=chrysanthemum flower'],
    ['Som=सोम=சோம்=moon;Somnath=सोमनाथ=சோமநாதன்=Lord Shiva;Sohan=सोहन==handsome;Somasundaram=सोमसुन्दर=சோமசுந்தரம்=Lord Shiva',
      'Sonali=सोनाली=சோனாலி=golden;Saumya=सौम्या=சௌம்யா=gentle;Soundarya=सौन्दर्या=சௌந்தர்யா=beauty;Sonal=सोनल==golden'],
    ['Dasharath=दशरथ=தசரதன்=father of Lord Rama;Dayanidhi=दयानिधि=தயாநிதி=treasure of kindness;Dattatreya=दत्तात्रेय==a divine sage',
      'Darshini=दर्शिनी=தர்ஷினி=one who sees;Dayita=दयिता==beloved'],
    ['Divakar=दिवाकर=திவாகர்=Sun God;Digvijay=दिग्विजय=திக்விஜய்=conqueror of all directions;Dipesh=दीपेश=தீபேஷ்=lord of light;Dheeran==தீரன்=brave',
      'Diksha=दीक्षा=தீக்ஷா=initiation;Deepa=दीपा=தீபா=lamp;Divija=दिविजा==born in heaven']
  ],
  // 25 Uttara Bhadrapada: दू थ झ ञ
  [
    ['Durgesh=दुर्गेश==lord of forts;Duraisamy==துரைசாமி=lord', 'Durga=दुर्गा=துர்கா=Goddess Durga;Durva=दूर्वा==sacred grass'],
    ['Tathagat=तथागत==Lord Buddha;Thangavel==தங்கவேல்=Lord Murugan', 'Tanushree=तनुश्री=தனுஸ்ரீ=beautiful'],
    ['Jhankar=झंकार==tinkling sound', 'Jhanvi=झान्वी=ஜான்வி=river Ganga;Jhalak=झलक==glimpse'],
    ['Gyanesh=ज्ञानेश==lord of knowledge;Gyandev=ज्ञानदेव==god of knowledge;Gnanasekaran==ஞானசேகரன்=crown of wisdom;Gnanavel==ஞானவேல்=Lord Murugan',
      'Gyanada=ज्ञानदा==giver of knowledge;Gnanambigai==ஞானாம்பிகை=Goddess Parvati;Gnanasundari==ஞானசுந்தரி=wise and beautiful']
  ],
  // 26 Revati: दे दो चा ची
  [
    ['Devraj=देवराज=தேவராஜ்=king of the gods;Devansh=देवांश==part of God;Devdutt=देवदत्त=தேவதத்=gift of God',
      'Devyani=देवयानी=தேவயானி=daughter of sage Shukra;Devasena=देवसेना=தேவசேனா=consort of Lord Murugan;Deivanai==தெய்வானை=consort of Lord Murugan'],
    ['', ''],
    ['Chandan=चंदन=சந்தன்=sandalwood;Chandra=चंद्र=சந்திரன்=moon;Charan=चरण=சரண்=feet of the Lord;Chanakya=चाणक्य=சாணக்யா=a wise teacher',
      'Chandni=चांदनी=சாந்தினி=moonlight;Charu=चारु=சாரு=beautiful;Chandrika=चंद्रिका=சந்திரிகா=moonlight;Champa=चंपा=சம்பா=a fragrant flower'],
    ['Chirag=चिराग=சிராக்=lamp;Chintan=चिंतन=சிந்தன்=thought;Chiranjeevi=चिरंजीवी=சிரஞ்சீவி=immortal',
      'Chitra=चित्रा=சித்ரா=picture;Chinmayi=चिन्मयी=சின்மயி=full of bliss;Chitrangada=चित्रांगदा==wife of Arjuna']
  ]
];
