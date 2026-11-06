/**
 * Deterministic, on-device Study Buddy.
 * This is curriculum retrieval and a checked arithmetic explainer, not a generative AI model.
 * Unknown topics are NOT made up. It never sends personal data to third parties.
 */
const fmt=n=>Number.isInteger(n)?String(n):String(Number(n.toFixed(8)));
const regexMath=/(-?\d+(?:\.\d+)?)\s*([+×*÷/−-])\s*(-?\d+(?:\.\d+)?)/;
const words=text=>String(text||'').toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}]+/gu)||[];
const STOP=new Set(['what','is','how','the','a','an','can','you','please','explain','show','me','tell','about','why','does','do','of','and','to','it','in','a','berapa','apakah','cara','bagaimana','apa','ialah','yang','dan','untuk','dengan','saya','boleh','terangkan','tunjukkan','kira','mengapa','contoh','theory','concept','formula']);
export function solveWorkedCalculation(input){
 const text=String(input||'').trim();if(text.length>500)return null;
 let m=text.match(regexMath);
 if(!m)return null;
 const a=Number(m[1]),b=Number(m[3]),op=m[2];
 if(!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a)>1e10||Math.abs(b)>1e10)return null;
 let value,steps=[];
 if(op==='+' ){value=a+b;steps=[`Start with ${fmt(a)} and add ${fmt(b)}.`,`Combine the two amounts: ${fmt(a)} + ${fmt(b)} = ${fmt(value)}.`,Number.isInteger(a)&&Number.isInteger(b)&&a%10+b%10>=10?`The ones add to ${a%10+b%10}, so regroup 10 ones as 1 ten.`:'Check by counting forward or using place values.',`Check: ${fmt(value)} − ${fmt(b)} = ${fmt(a)}.`]}
 else if(op==='−'||op==='-'){value=a-b;steps=[`Start with ${fmt(a)}.`,`Take away ${fmt(b)}: ${fmt(a)} − ${fmt(b)} = ${fmt(value)}.`,`Check by adding back: ${fmt(value)} + ${fmt(b)} = ${fmt(a)}.`]}
 else if(op==='×'||op==='*'){value=a*b;steps=[`Multiply ${fmt(a)} by ${fmt(b)}.`,Number.isInteger(b)&&b>=1&&b<=10?`Think of ${fmt(b)} equal groups of ${fmt(a)}.`:`Use place-value multiplication or equal groups.`,`Calculate: ${fmt(a)} × ${fmt(b)} = ${fmt(value)}.`,b!==0?`Check: ${fmt(value)} ÷ ${fmt(b)} = ${fmt(a)}.`:'Multiplying any number by zero gives zero.']}
 else{if(b===0)return {title:'Division by zero',steps:['We cannot divide a number by zero.','Try dividing by a non-zero number instead.'],kind:'math'};value=a/b;steps=[`Share ${fmt(a)} into ${fmt(b)} equal groups (or find how many groups of ${fmt(b)} fit).`,`Compute: ${fmt(a)} ÷ ${fmt(b)} = ${fmt(value)}.`,`Check: ${fmt(value)} × ${fmt(b)} = ${fmt(a)}.`]}
 if(!Number.isFinite(value))return null;
 return {title:`${fmt(a)} ${op==='*'?'×':op==='/'?'÷':op} ${fmt(b)} = ${fmt(value)}`,steps,kind:'math',answer:fmt(value),source:'Checked arithmetic'};
}
function overlaps(needle,hay){return needle.length>1&&(hay.includes(needle)||needle.includes(hay))}
export function findLessonForQuestion(question,lessons=[],opts={}){
 const base=String(question||'').slice(0,500).toLowerCase();
 const glossary={fractions:'pecahan',fraction:'pecahan',plants:'tumbuhan',plant:'tumbuhan',photosynthesis:'cahaya tumbuhan',noun:'kata nama',nouns:'kata nama',verbs:'kata kerja',verb:'kata kerja',adjectives:'kata adjektif',adjective:'kata adjektif',perimeter:'perimeter',time:'masa',clock:'jam',money:'wang',decimal:'perpuluhan',decimals:'perpuluhan',multiplication:'darab',division:'bahagi',addition:'tambah',subtraction:'tolak',water:'air',number:'nombor',shapes:'bentuk',shape:'bentuk'};
 const query=base+' '+words(base).map(w=>glossary[w]||'').join(' ');
 const keywords=[...new Set(words(query).filter(w=>w.length>2&&!STOP.has(w)))];
 if(!keywords.length)return null;
 const candidates=lessons.filter(l=>!opts.subject||l.subject===opts.subject);
 const scored=candidates.map(l=>{
  const title=String(l.title||'').toLowerCase(),summary=String(l.summary||'').toLowerCase();
  const titleTokens=words(title),subjectTokens=words(l.subject||'');
  let score=0;
  for(const key of keywords){
   if(titleTokens.some(w=>overlaps(key,w)))score+=5;
   else if(subjectTokens.some(w=>overlaps(key,w)))score+=1;
   if(words(summary).some(w=>overlaps(key,w)))score+=1;
  }
  if(opts.year&&Number(l.year)===Number(opts.year))score+=2;
  return {lesson:l,score};
 }).sort((a,b)=>b.score-a.score);
 if(!scored.length||scored[0].score<4)return null;
 return scored[0].lesson;
}
export function tutorReply(question,lessons=[],opts={}){
 const q=String(question||'').trim().slice(0,500);
 if(!q)return {title:'Ask me a question',steps:['Type a question or choose one of the suggestions to begin.'],kind:'help'};
 const math=solveWorkedCalculation(q);
 if(math)return math;
 const matched=findLessonForQuestion(q,lessons,opts);
 if(matched)return {title:matched.title,kind:'lesson',lessonId:matched.id,subject:matched.subject,steps:[matched.summary,matched.visual||matched.steps?.[0]?.body||'',...(matched.steps||[]).map(s=>`${s.title}: ${s.body}`).slice(0,3)].filter(Boolean),source:`${matched.subject} · Tahun ${matched.year}`};
 return {title:'Let’s explore this together',kind:'unknown',steps:['I do not have a reliable explanation for this specific question in the available learning library yet.','Try asking about a lesson topic such as fractions, plant needs, suku kata, or a calculation such as 28 + 15.','You can also open a subject lesson and ask its Study Buddy to explain the current topic.'],source:'Available on-device lesson library'};
}
