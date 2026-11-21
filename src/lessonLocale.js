// Makes every lesson speak ONE language.
// Many lessons were generated from English templates around Malay, Tamil or Chinese content, so a child saw
// "Which explanation belongs to this lesson: ..." inside a Tamil lesson. This module rewrites that wording
// into the language of the lesson and, for SJKT, into Tamil.

/** Language each subject is taught in by default. */
export const SUBJECT_LANGUAGE={
 'Bahasa Melayu':'ms','Bahasa Inggeris':'en','English':'en','Matematik':'ms','Sains':'ms',
 'Bahasa Tamil':'ta','Bahasa Tamil SK':'ta','Bahasa Cina':'zh','Bahasa Cina SK':'zh','Bahasa Arab':'ms'
};
export const lessonLanguage=subject=>SUBJECT_LANGUAGE[subject]||'ms';

/** In an SJKT, every subject is shown in Tamil except these (they keep their own language). */
export const TAMIL_EXEMPT=new Set(['Bahasa Melayu','Bahasa Inggeris','English','Matematik','Sains','Bahasa Tamil','Bahasa Tamil SK','Bahasa Cina','Bahasa Cina SK','Bahasa Arab']);
export const shownInTamil=(school,subject)=>school==='SJKT'&&!TAMIL_EXEMPT.has(subject);

const L=(en,ms,ta,zh)=>({en,ms,ta,zh});

// Whole-string labels (also the bilingual labels such as "Pelajari / Learn").
const LABELS=[
 L('Learn the idea','Fahami idea','கருத்தைப் புரிந்துகொள்வோம்','理解想法'),
 L('Look at an example','Lihat contoh','எடுத்துக்காட்டைப் பார்ப்போம்','看一个例子'),
 L('Try with support','Cuba dengan bantuan','உதவியுடன் முயல்வோம்','在帮助下尝试'),
 L('Think further','Fikir dengan lebih mendalam','மேலும் சிந்திப்போம்','进一步思考'),
 L('Discover','Terokai','கண்டறிவோம்','探索'),
 L('Example','Contoh','எடுத்துக்காட்டு','例子'),
 L('Mission','Misi','பணி','任务'),
 L('Pelajari / Learn','Pelajari','கற்போம்','学习'),
 L('Perhatikan / Observe','Perhatikan','கவனிப்போம்','观察'),
 L('Latih pemahaman / Practice','Latih kefahaman','பயிற்சி செய்வோம்','练习'),
 L('Topik / Topic','Topik','தலைப்பு','主题'),
 L('Fakta / Fact','Fakta','உண்மை','事实'),
 L('Contoh / Example','Contoh','எடுத்துக்காட்டு','例子'),
 L('Starter','Permulaan','தொடக்கம்','起步'),
 L('Explorer','Peneroka','ஆராய்ச்சியாளர்','探索者'),
 L('Think deeper','Fikir lebih mendalam','ஆழ்ந்து சிந்திப்போம்','深入思考'),
 L('Supplementary discovery · Getting started','Penerokaan tambahan · Permulaan','கூடுதல் கண்டறிதல் · தொடக்கம்','拓展探索 · 起步'),
 L('Supplementary discovery · Apply and explore','Penerokaan tambahan · Gunakan dan terokai','கூடுதல் கண்டறிதல் · பயன்படுத்தி ஆராய்வோம்','拓展探索 · 应用与探索'),
 L('Supplementary discovery · Think deeper','Penerokaan tambahan · Fikir lebih mendalam','கூடுதல் கண்டறிதல் · ஆழ்ந்து சிந்திப்போம்','拓展探索 · 深入思考'),
 L('Year-level challenge','Cabaran tahap tahun','வகுப்பு நிலை சவால்','年级挑战'),
 L('Foundational skills','Kemahiran asas','அடிப்படைத் திறன்கள்','基础技能')
];

const STAGES=[
 L('Start with a simple example and say the idea aloud before answering.','Mulakan dengan contoh mudah dan sebut idea itu dengan kuat sebelum menjawab.','எளிய எடுத்துக்காட்டுடன் தொடங்கி, பதில் சொல்லும் முன் கருத்தை உரக்கச் சொல்லுங்கள்.','先从一个简单的例子开始，回答前先大声说出这个想法。'),
 L('Practise with two new examples and explain your choice.','Berlatih dengan dua contoh baharu dan terangkan pilihan anda.','இரண்டு புதிய எடுத்துக்காட்டுகளுடன் பயிற்சி செய்து, உங்கள் தேர்வை விளக்குங்கள்.','用两个新例子练习，并说明你的选择。'),
 L('Look for the reason behind the answer, not just the final word.','Cari sebab di sebalik jawapan, bukan sekadar perkataan akhir.','இறுதிச் சொல்லை மட்டுமல்ல, பதிலுக்குப் பின்னுள்ள காரணத்தையும் தேடுங்கள்.','不只看最后的答案，也要找出答案背后的原因。'),
 L('Compare an example and a non-example; explain the difference.','Bandingkan satu contoh dengan bukan contoh dan terangkan perbezaannya.','ஒரு எடுத்துக்காட்டையும் அது அல்லாததையும் ஒப்பிட்டு வேறுபாட்டை விளக்குங்கள்.','比较一个例子和一个反例，并说明它们的区别。'),
 L('Connect the idea to a real-life situation and identify evidence.','Kaitkan idea itu dengan situasi sebenar dan kenal pasti bukti.','கருத்தை நிஜ வாழ்க்கைச் சூழலுடன் இணைத்து ஆதாரத்தைக் கண்டறியுங்கள்.','把这个想法和现实生活联系起来，并找出证据。'),
 L('Explain the idea to another learner, check the evidence, and consider when it may not apply.','Terangkan idea itu kepada rakan, semak bukti dan fikirkan bila ia mungkin tidak terpakai.','கருத்தை மற்றொரு மாணவருக்கு விளக்கி, ஆதாரத்தைச் சரிபார்த்து, அது எப்போது பொருந்தாது என்பதையும் சிந்தியுங்கள்.','向另一位同学解释这个想法，检查证据，并想想什么时候它可能不适用。')
];
const ACTIVITIES=[
 L('First try this slowly with objects, pictures or a family member.','Cuba dahulu perlahan-lahan dengan benda, gambar atau ahli keluarga.','முதலில் பொருட்கள், படங்கள் அல்லது குடும்ப உறுப்பினருடன் மெதுவாக முயலுங்கள்.','先用实物、图片或家人慢慢试一试。'),
 L('Give a second example and explain how it is similar.','Beri contoh kedua dan terangkan bagaimana ia serupa.','இரண்டாவது எடுத்துக்காட்டைத் தந்து அது எப்படி ஒத்திருக்கிறது என்று விளக்குங்கள்.','再举一个例子，并说明它们哪里相似。'),
 L('Compare two possible answers and say how you checked your evidence.','Bandingkan dua jawapan yang mungkin dan nyatakan bagaimana anda menyemak bukti.','இரு சாத்தியமான பதில்களை ஒப்பிட்டு ஆதாரத்தை எப்படிச் சரிபார்த்தீர்கள் என்று சொல்லுங்கள்.','比较两个可能的答案，并说说你是怎样检查证据的。')
];
const HIGHER=[
 L('Say the idea in your own words.','Sebut idea itu dengan perkataan sendiri.','கருத்தை உங்கள் சொந்த வார்த்தைகளில் சொல்லுங்கள்.','用自己的话说出这个想法。'),
 L('Explain what could change the answer in a different situation.','Terangkan apa yang boleh mengubah jawapan dalam situasi yang lain.','வேறு சூழலில் பதிலை எது மாற்றக்கூடும் என்று விளக்குங்கள்.','说明在不同情况下，什么会改变答案。')
];
const WHY_SENSE=L('Why does this answer make sense?','Mengapakah jawapan ini masuk akal?','இந்தப் பதில் ஏன் பொருத்தமாக இருக்கிறது?','为什么这个答案说得通？');

// Templates around an inner piece of text X (which is itself translated).
const TEMPLATES=[
 [/^Which explanation belongs to this lesson: (.+)\?$/s,L('Which explanation belongs to this lesson: {x}?','Penerangan manakah yang sesuai dengan pelajaran ini: {x}?','இந்தப் பாடத்துக்குப் பொருந்தும் விளக்கம் எது: {x}?','哪一个解释属于这一课：{x}？')],
 [/^Choose an example of: (.+)$/s,L('Choose an example of: {x}','Pilih contoh bagi: {x}','இதற்கான எடுத்துக்காட்டைத் தேர்ந்தெடுங்கள்: {x}','选出一个例子：{x}')],
 [/^Which lesson title matches this explanation\? (.+)$/s,L('Which lesson title matches this explanation? {x}','Tajuk pelajaran manakah yang sepadan dengan penerangan ini? {x}','இந்த விளக்கத்துக்குப் பொருந்தும் பாடத் தலைப்பு எது? {x}','哪个课题和这个解释相符？{x}')],
 [/^Recall the key answer from the first activity: (.+)$/s,L('Recall the key answer from the first activity: {x}','Ingat semula jawapan utama daripada aktiviti pertama: {x}','முதல் செயல்பாட்டின் முக்கியப் பதிலை நினைவுபடுத்துங்கள்: {x}','回想第一个活动的关键答案：{x}')],
 [/^Compare your response with the worked example\. (.+)$/s,L('Compare your response with the worked example. {x}','Bandingkan jawapan anda dengan contoh penyelesaian. {x}','உங்கள் பதிலை விடையுடன் கூடிய எடுத்துக்காட்டுடன் ஒப்பிடுங்கள். {x}','把你的回答和示范答案比一比。{x}')],
 [/^Which statement helps explain (.+)\?$/s,L('Which statement helps explain {x}?','Pernyataan manakah yang membantu menerangkan {x}?','{x} என்பதை விளக்க உதவும் கூற்று எது?','哪一句话有助于解释{x}？')],
 [/^Review: (.+)$/s,L('Review: {x}','Ulang kaji: {x}','மீள்பார்வை: {x}','复习：{x}')]
];

const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const find=(table,s)=>table.find(entry=>entry.en===s);
const STAGE_RE=new RegExp('^(.+?) ('+STAGES.map(x=>esc(x.en)).join('|')+')$','s');
const ACTIVITY_RE=new RegExp('^('+ACTIVITIES.map(x=>esc(x.en)).join('|')+') (.+)$','s');
const WHY_RE=new RegExp('^'+esc(WHY_SENSE.en)+' (.+?) ('+HIGHER.map(x=>esc(x.en)).join('|')+')$','s');
const exactLabel=new Map([...LABELS,...STAGES,...ACTIVITIES,...HIGHER,WHY_SENSE].map(x=>[x.en,x]));

/**
 * Translate one string. `dict` is an optional exact-match dictionary (used for Tamil content in an SJKT).
 */
export function localizeText(text,lang,dict){
 if(typeof text!=='string'||!text)return text;
 const walk=(s,depth=0)=>{
  if(depth>4)return s;
  const label=exactLabel.get(s);if(label)return label[lang]||s;
  let m=s.match(WHY_RE);
  if(m){const h=find(HIGHER,m[2]);return WHY_SENSE[lang]+' '+walk(m[1],depth+1)+' '+(h?h[lang]:m[2])}
  m=s.match(STAGE_RE);
  if(m){const st=find(STAGES,m[2]);return walk(m[1],depth+1)+' '+(st?st[lang]:m[2])}
  m=s.match(ACTIVITY_RE);
  if(m){const a=find(ACTIVITIES,m[1]);return (a?a[lang]:m[1])+' '+walk(m[2],depth+1)}
  for(const [re,t] of TEMPLATES){
   m=s.match(re);
   if(m)return t[lang].replace('{x}',()=>walk(m[1],depth+1));
  }
  if(typeof dict==='function')return dict(s);
  if(dict&&Object.prototype.hasOwnProperty.call(dict,s))return dict[s];
  return s;
 };
 return walk(text);
}

const mapDeep=(value,fn)=>{
 if(typeof value==='string')return fn(value);
 if(Array.isArray(value))return value.map(v=>mapDeep(v,fn));
 return value;
};
const TEXT_KEYS=['title','summary','visual','chapter'];

/** Return a copy of the lesson with all wording in `lang` (and Tamil content from `dict` when given). */
export function localizeLesson(lesson,lang,dict){
 const t=s=>localizeText(s,lang,dict);
 const out={...lesson};
 for(const key of TEXT_KEYS)if(typeof out[key]==='string')out[key]=t(out[key]);
 if(out.steps)out.steps=out.steps.map(s=>({...s,title:t(s.title),body:t(s.body)}));
 if(out.mind)out.mind=out.mind.map(row=>mapDeep(row,t));
 if(out.check)out.check=out.check.map(q=>({...q,text:t(q.text),answer:typeof q.answer==='string'?t(q.answer):q.answer,why:t(q.why),...(q.options?{options:q.options.map(t)}:{})}));
 if(out.activity){
  const a=out.activity;
  out.activity={...a,...(a.prompt?{prompt:t(a.prompt)}:{}),...(a.title?{title:t(a.title)}:{}),...(a.why?{why:t(a.why)}:{}),...(typeof a.answer==='string'?{answer:t(a.answer)}:{}),...(a.options?{options:a.options.map(t)}:{})};
 }
 if(out.enrichment)out.enrichment={...out.enrichment,mission:t(out.enrichment.mission),stage:t(out.enrichment.stage),prompt:t(out.enrichment.prompt)};
 if(out.misconceptions&&typeof out.misconceptions==='object')out.misconceptions=Object.fromEntries(Object.entries(out.misconceptions).map(([k,v])=>[t(k),t(v)]));
 return out;
}

/** Make a whole list of lessons single-language (each in its own subject language). */
export const unifyLessonLanguage=lessons=>lessons.map(l=>localizeLesson(l,lessonLanguage(l.subject)));

/** What to show for a given school, from the RAW lessons: Tamil wording and content for the SJKT subjects that are not exempt. */
export function lessonsForSchool(rawLessons,school,dict){
 return rawLessons.map(l=>shownInTamil(school,l.subject)?localizeLesson(l,'ta',dict):localizeLesson(l,lessonLanguage(l.subject)));
}

/** Collect the content strings that still need a Tamil translation (used by scripts/extract-tamil-atoms.mjs). */
export function collectAtoms(lessons){
 const atoms=new Set();
 const leaf=s=>{if(s.trim()&&/[A-Za-z]/.test(s))atoms.add(s);return s};
 for(const lesson of lessons)localizeLesson(lesson,'ta',leaf);
 return atoms;
}
