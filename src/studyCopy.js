// Study Buddy wording by language and subject, so a Tamil lesson never shows "calculate 28 + 15".
const MATHS=new Set(['Matematik']);
const SCIENCE=new Set(['Sains']);
const group=subject=>MATHS.has(subject)?'math':SCIENCE.has(subject)?'science':/Tamil/.test(subject)?'tamil':'other';

const TEXT={
 en:{
  title:'Ask a question, understand each step!',
  intro:{math:'Try a calculation, ask about a topic or listen to a short explanation. Learn at your own pace.',other:'Ask about a topic or listen to a short explanation. Learn at your own pace.'},
  placeholder:{math:'Example: Please show me how to calculate 28 + 15, step by step.',other:'Example: Please explain this lesson in simple words.'},
  examples:{math:['Show 28 + 15 step by step','How do fractions work?','84 ÷ 4'],science:['Explain why plants need water','Why do shadows change?'],tamil:['What is a noun?'],other:['What is a noun?','Explain why plants need water']}
 },
 ms:{
  title:'Tanya soalan, fahami setiap langkah!',
  intro:{math:'Cuba satu pengiraan, tanya tentang satu topik atau dengar penerangan ringkas. Belajar mengikut rentak anda.',other:'Tanya tentang satu topik atau dengar penerangan ringkas. Belajar mengikut rentak anda.'},
  placeholder:{math:'Contoh: Tunjukkan cara mengira 28 + 15, langkah demi langkah.',other:'Contoh: Terangkan pelajaran ini dengan perkataan mudah.'},
  examples:{math:['Tunjukkan 28 + 15 langkah demi langkah','Bagaimana pecahan berfungsi?','84 ÷ 4'],science:['Mengapa tumbuhan perlukan air?','Mengapa bayang-bayang berubah?'],tamil:['Apakah kata nama?'],other:['Apakah kata nama?','Mengapa tumbuhan perlukan air?']}
 },
 zh:{
  title:'提出问题，弄懂每一步！',
  intro:{math:'试试计算，询问一个主题，或者听一段简短的讲解。按自己的节奏学习。',other:'询问一个主题，或者听一段简短的讲解。按自己的节奏学习。'},
  placeholder:{math:'例如：请一步一步教我计算 28 + 15。',other:'例如：请用简单的话解释这一课。'},
  examples:{math:['一步一步计算 28 + 15','分数是怎么回事？','84 ÷ 4'],science:['植物为什么需要水？','影子为什么会变化？'],tamil:['什么是名词？'],other:['什么是名词？','植物为什么需要水？']}
 },
 ta:{
  title:'கேள்வி கேளுங்கள், ஒவ்வொரு படியையும் புரிந்துகொள்ளுங்கள்!',
  intro:{math:'ஒரு கணக்கை முயலுங்கள், ஒரு தலைப்பைப் பற்றிக் கேளுங்கள் அல்லது சிறு விளக்கத்தைக் கேளுங்கள். உங்கள் வேகத்தில் கற்றுக்கொள்ளுங்கள்.',other:'ஒரு தலைப்பைப் பற்றிக் கேளுங்கள் அல்லது சிறு விளக்கத்தைக் கேளுங்கள். உங்கள் வேகத்தில் கற்றுக்கொள்ளுங்கள்.'},
  placeholder:{math:'எடுத்துக்காட்டு: 28 + 15 ஐப் படிப்படியாகக் கணக்கிட்டுக் காட்டுங்கள்.',other:'எடுத்துக்காட்டு: இந்தப் பாடத்தை எளிய சொற்களில் விளக்குங்கள்.'},
  examples:{math:['28 + 15 ஐப் படிப்படியாகக் காட்டு','பின்னங்கள் எப்படிச் செயல்படுகின்றன?','84 ÷ 4'],science:['தாவரங்களுக்கு ஏன் நீர் தேவை?','நிழல்கள் ஏன் மாறுகின்றன?'],tamil:['பெயர்ச்சொல் என்றால் என்ன?','எழுவாய் என்றால் என்ன?','வல்லினம் என்றால் என்ன?'],other:['இந்தப் பாடத்தை விளக்கு','ஒரு எடுத்துக்காட்டு சொல்']}
 }
};
export function studyCopy(language,subject){
 const t=TEXT[language]||TEXT.en,g=group(subject);
 return {
  title:t.title,
  intro:g==='math'||!subject?t.intro.math:t.intro.other,
  placeholder:g==='math'||!subject?t.placeholder.math:t.placeholder.other,
  examples:t.examples[g==='math'||!subject?'math':g]||t.examples.other
 };
}
