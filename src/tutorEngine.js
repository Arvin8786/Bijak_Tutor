import {arithmeticExpression,calculateExpression} from './arithmetic.js';
/**
 * Deterministic, on-device Study Buddy.
 * This is curriculum retrieval and a checked arithmetic explainer, not a generative AI model.
 * Unknown topics are NOT made up. It never sends personal data to third parties.
 */
const fmt=n=>Number.isInteger(n)?String(n):String(Number(n.toPrecision(12)));
const words=text=>String(text||'').toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}]+/gu)||[];
const STOP=new Set(['what','is','how','the','a','an','can','you','please','explain','show','me','tell','about','why','does','do','of','and','to','it','in','a','berapa','apakah','cara','bagaimana','apa','ialah','yang','dan','untuk','dengan','saya','boleh','terangkan','tunjukkan','kira','mengapa','contoh','theory','concept','formula']);
export function solveWorkedCalculation(input){
 const text=String(input||'').trim();if(text.length>500)return null;
 const expression=arithmeticExpression(text);
 const calculated=calculateExpression(expression);if(!calculated)return null;
 if(calculated.error)return {title:'Division by zero',steps:['We cannot divide a number by zero.','Try a non-zero divisor instead.'],kind:'math'};
 const m=expression.match(/^(-?\d+(?:\.\d+)?)\s*([+*\/-])\s*(-?\d+(?:\.\d+)?)$/);
 if(!m)return {title:expression.replaceAll('*','×').replaceAll('/','÷')+' '+(calculated.approximate?'≈':'=')+' '+calculated.answer,
  steps:['Work inside brackets first, then multiply and divide from left to right, then add and subtract from left to right.',...calculated.steps],
  kind:'math',answer:calculated.answer,source:'Checked arithmetic; ≈ means rounded'};
 const a=Number(m[1]),b=Number(m[3]),op=m[2];
 if(!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a)>1e10||Math.abs(b)>1e10)return null;
 let value,steps=[];
 const posInts=Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0;
 if(op==='+'){
  value=a+b;
  steps=[`Align the numbers by place value: ones under ones, tens under tens.`];
  if(posInts&&a<1000&&b<1000){
   const ones=a%10+b%10,carry=Math.floor(ones/10);
   steps.push(`Ones: ${a%10} + ${b%10} = ${ones}. Write ${ones%10} in the ones column${carry?' and regroup (carry) 1 ten':''}.`);
   const tens=Math.floor(a/10)%10+Math.floor(b/10)%10+carry;
   steps.push(`Tens: ${Math.floor(a/10)%10} + ${Math.floor(b/10)%10}${carry?' + 1 carried ten':''} = ${tens}.`);
   if(a>=100||b>=100)steps.push(`Include the hundreds column and any regrouping from the tens column.`);
  }else steps.push(`Combine the amounts: ${fmt(a)} + ${fmt(b)}.`);
  steps.push(`Answer: ${fmt(a)} + ${fmt(b)} = ${fmt(value)}.`,`Check: ${fmt(value)} − ${fmt(b)} = ${fmt(a)}.`);
 }else if(op==='−'||op==='-'){
  value=a-b;
  steps=[`Align place values and start at the ones column.`];
  if(posInts&&a>=b&&a<100&&b<100){
   const x=a%10,y=b%10;
   if(x<y)steps.push(`Regroup: exchange 1 ten for 10 ones. Now ${x+10} − ${y} = ${x+10-y} in the ones column.`);
   else steps.push(`Ones: ${x} − ${y} = ${x-y}.`);
   steps.push(`Tens: ${Math.floor(a/10)-(x<y?1:0)} − ${Math.floor(b/10)} = ${Math.floor(a/10)-(x<y?1:0)-Math.floor(b/10)}.`);
  }else steps.push(`Subtract ${fmt(b)} from ${fmt(a)}.`);
  steps.push(`Answer: ${fmt(a)} − ${fmt(b)} = ${fmt(value)}.`,`Check: ${fmt(value)} + ${fmt(b)} = ${fmt(a)}.`);
 }else if(op==='×'||op==='*'){
  value=a*b;steps=[`Multiplication makes equal groups: ${fmt(b)} groups of ${fmt(a)}.`];
  if(posInts&&b<100&&a<1000){
   const ones=b%10,tens=Math.floor(b/10);
   steps.push(`Multiply by the ones digit: ${fmt(a)} × ${ones} = ${fmt(a*ones)}.`);
   if(tens)steps.push(`Multiply by the tens: ${fmt(a)} × ${tens*10} = ${fmt(a*tens*10)}.`,`Add partial products: ${fmt(a*ones)} + ${fmt(a*tens*10)} = ${fmt(value)}.`);
  }else steps.push(`Multiply: ${fmt(a)} × ${fmt(b)}.`);
  steps.push(`Answer: ${fmt(value)}.`,b!==0?`Check by division: ${fmt(value)} ÷ ${fmt(b)} = ${fmt(a)}.`:'Multiplying by zero gives zero.');
 }else{
  if(b===0)return {title:'Division by zero',steps:['We cannot divide a number by zero.','Try dividing by a non-zero number instead.'],kind:'math'};
  value=a/b;steps=[`Division asks how many groups of ${fmt(b)} fit into ${fmt(a)}.`];
  if(posInts&&a<=9999&&b>=1&&b<=99){
   let remainder=0;const digits=String(a).split('');
   for(const digit of digits){const chunk=remainder*10+Number(digit),quotientDigit=Math.floor(chunk/b);
    steps.push(`Bring down ${digit}. ${fmt(b)} fits into ${fmt(chunk)} exactly ${quotientDigit} time${quotientDigit===1?'':'s'}; subtract ${fmt(quotientDigit*b)}, remainder ${fmt(chunk-quotientDigit*b)}.`);
    remainder=chunk-quotientDigit*b;
   }
   if(remainder)steps.push(`Remainder ${remainder}; the decimal answer is approximately ${fmt(value)}.`);
  }else steps.push(`Calculate ${fmt(a)} ÷ ${fmt(b)}.`);
  steps.push(`Answer: ${calculated.approximate?'approximately ':''}${fmt(value)}.`,`Check: ${fmt(value)} × ${fmt(b)} ${Number(fmt(value))===value?'=':'≈'} ${fmt(a)}.`);
 }
 if(!Number.isFinite(value))return null;
 return {title:`${fmt(a)} ${op==='*'?'×':op==='/'?'÷':op} ${fmt(b)} ${calculated.approximate?'≈':'='} ${fmt(value)}`,steps,kind:'math',answer:fmt(value),source:'Checked arithmetic'};
}
function overlaps(needle,hay){return needle===hay||(needle.length>=5&&hay.length>=5&&(hay.startsWith(needle)||needle.startsWith(hay)))}
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
