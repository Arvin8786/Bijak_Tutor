const list=source=>source.trim().split(/\s+/).map(entry=>entry.split('|'));
const words=source=>source.trim().split('\n').map(entry=>entry.trim().split('|'));
export const languages=[
 {
  name:'Mandarin',native:'普通话',locale:'zh-CN',script:'Pinyin, tones and first characters',
  overview:'Mandarin uses characters. Pinyin uses Latin letters and tone marks to show how a syllable sounds.',
  writing:'Practise the character from top to bottom or left to right where applicable. Start with 一, 二 and 三 and write their horizontal lines from left to right.',
  symbols:list(`mā|high-level|妈 má|rising|麻 mǎ|low/dipping|马 mà|falling|骂 ma|light/neutral|吗
   bā|b+a|八 dā|d+a|搭 gā|g+a|嘎 nǐ|n+i|你 hǎo|h+ao|好 shuǐ|sh+ui|水 zhōng|zh+ong|中
   一|yī|一 二|èr|二 三|sān|三 人|rén|人 口|kǒu|口 大|dà|大 小|xiǎo|小 山|shān|山 水|shuǐ|水 日|rì|日 月|yuè|月 木|mù|木`),
  wordList:words(`你好|nǐ hǎo|Hello
   谢谢|xièxie|Thank you
   是|shì|Yes / to be
   不|bù|No / not
   水|shuǐ|Water
   米饭|mǐfàn|Cooked rice
   书|shū|Book
   学校|xuéxiào|School
   朋友|péngyou|Friend
   家|jiā|Home
   今天|jīntiān|Today
   明天|míngtiān|Tomorrow`)
 },
 {
  name:'Tamil',native:'தமிழ்',locale:'ta-IN',script:'Tamil vowels and consonants',
  overview:'Learn 12 vowels, 18 consonants and the special letter āytam. The dot above a consonant, called pulli, removes its default vowel.',
  writing:'Start with a vowel and copy its curves. For consonants such as க், copy the shape and include the pulli dot. Compare க் with க, pronounced ka.',
  symbols:list(`அ|a ஆ|ā இ|i ஈ|ī உ|u ஊ|ū எ|e ஏ|ē ஐ|ai ஒ|o ஓ|ō ஔ|au
   க்|k|க ங்|ṅ|ங ச்|c|ச ஞ்|ñ|ஞ ட்|ṭ|ட ண்|ṇ|ண த்|t|த ந்|n|ந ப்|p|ப ம்|m|ம
   ய்|y|ய ர்|r|ர ல்|l|ல வ்|v|வ ழ்|ḻ|ழ ள்|ḷ|ள ற்|ṟ|ற ன்|ṉ|ன ஃ|āytam|ஆய்தம்
   க|ka கா|kā கி|ki கீ|kī கு|ku கூ|kū`),
  wordList:words(`வணக்கம்|vaṇakkam|Hello
   நன்றி|naṉṟi|Thank you
   ஆம்|ām|Yes
   இல்லை|illai|No
   தண்ணீர்|taṇṇīr|Water
   சாதம்|cātam|Cooked rice
   புத்தகம்|puttakam|Book
   பள்ளி|paḷḷi|School
   நண்பர்|naṇpar|Friend
   வீடு|vīṭu|Home
   இன்று|iṉṟu|Today
   நாளை|nāḷai|Tomorrow`)
 },
 {
  name:'Japanese',native:'日本語',locale:'ja-JP',script:'Hiragana and katakana',
  overview:'Kana represent beats of sound. Learn the basic hiragana first, then compare them with katakana, commonly used for loanwords and foreign names.',
  writing:'Start with a kana such as し. Follow the curve downwards, then sweep to the right. Compare hiragana し with katakana シ.',
  symbols:list(`あ|a い|i う|u え|e お|o か|ka き|ki く|ku け|ke こ|ko さ|sa し|shi す|su せ|se そ|so
   た|ta ち|chi つ|tsu て|te と|to な|na に|ni ぬ|nu ね|ne の|no は|ha ひ|hi ふ|fu へ|he ほ|ho
   ま|ma み|mi む|mu め|me も|mo や|ya ゆ|yu よ|yo ら|ra り|ri る|ru れ|re ろ|ro わ|wa を|o ん|n
   ア|a イ|i ウ|u エ|e オ|o カ|ka キ|ki ク|ku ケ|ke コ|ko サ|sa シ|shi ス|su セ|se ソ|so
   タ|ta チ|chi ツ|tsu テ|te ト|to ナ|na ニ|ni ヌ|nu ネ|ne ノ|no ハ|ha ヒ|hi フ|fu ヘ|he ホ|ho
   マ|ma ミ|mi ム|mu メ|me モ|mo ヤ|ya ユ|yu ヨ|yo ラ|ra リ|ri ル|ru レ|re ロ|ro ワ|wa ヲ|o ン|n`),
  wordList:words(`こんにちは|konnichiwa|Hello
   ありがとう|arigatō|Thank you
   はい|hai|Yes
   いいえ|iie|No
   水|mizu|Water
   ご飯|gohan|Cooked rice
   本|hon|Book
   学校|gakkō|School
   友達|tomodachi|Friend
   家|ie|Home
   今日|kyō|Today
   明日|ashita|Tomorrow`)
 },
 {
  name:'Arabic',native:'العربية',locale:'ar-SA',direction:'rtl',script:'Arabic letters and short vowels',
  overview:'Arabic is read from right to left. Letters can change shape as they join. The course uses Modern Standard Arabic. Some phrases change with the speaker or listener’s gender.',
  writing:'Copy the isolated form first. Try ب, ت and ث: compare the base shape, then add the right dots. The short-vowel marks in بَ, بِ and بُ represent different sounds.',
  symbols:list(`ا|alif|ألف ب|bāʾ|باء ت|tāʾ|تاء ث|thāʾ|ثاء ج|jīm|جيم ح|ḥāʾ|حاء خ|khāʾ|خاء د|dāl|دال ذ|dhāl|ذال ر|rāʾ|راء ز|zāy|زاي س|sīn|سين ش|shīn|شين ص|ṣād|صاد ض|ḍād|ضاد ط|ṭāʾ|طاء ظ|ẓāʾ|ظاء ع|ʿayn|عين غ|ghayn|غين ف|fāʾ|فاء ق|qāf|قاف ك|kāf|كاف ل|lām|لام م|mīm|ميم ن|nūn|نون ه|hāʾ|هاء و|wāw|واو ي|yāʾ|ياء بَ|ba بُ|bu بِ|bi`),
  wordList:words(`مرحبًا|marḥaban|Hello
   شكرًا|shukran|Thank you
   نعم|naʿam|Yes
   لا|lā|No
   ماء|māʾ|Water
   أرز|aruzz|Rice
   كتاب|kitāb|Book
   مدرسة|madrasa|School
   صديق|ṣadīq|Friend
   بيت|bayt|Home
   اليوم|al-yawm|Today
   غدًا|ghadan|Tomorrow`)
 }
];
