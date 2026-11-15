// On-device maths practice and mistake guide for the Maths Studio whiteboard.
// It checks typed answers and typed working with plain arithmetic. It does not read handwriting
// and it does not call an AI service: the interface turns the codes below into text in the chosen language.

export const PLACES=['ones','tens','hundreds','thousands','tenThousands','hundredThousands','millions'];

function seededRandom(seed){
 let a=seed>>>0;
 return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};
}
const between=(random,low,high)=>low+Math.floor(random()*(high-low+1));
const digitsOf=n=>String(Math.abs(n)).split('').reverse().map(Number);

function operationsFor(year){
 if(year<=2)return ['+','-'];
 if(year===3)return ['+','-','×'];
 return ['+','-','×','÷'];
}
const needsCarry=(a,b)=>digitsOf(a).some((d,i)=>d+(digitsOf(b)[i]||0)>=10);
const needsBorrow=(a,b)=>digitsOf(a).some((d,i)=>d<(digitsOf(b)[i]||0));

export function makeProblem(year,seed){
 const y=Math.min(6,Math.max(1,Math.round(year)||1));
 const random=seededRandom(Math.imul(seed|0,7919)+y*104729);
 const ops=operationsFor(y),op=ops[between(random,0,ops.length-1)];
 const span=[null,[1,10],[10,99],[100,999],[1000,9999],[10000,99999],[100000,999999]][y];
 let a,b,answer;
 if(op==='+'){
  for(let tries=0;tries<12;tries++){
   a=between(random,...span);b=between(random,...span);
   if(y===1){a=between(random,1,10);b=between(random,1,10)}
   if(y===1||needsCarry(a,b)||tries>8)break;
  }
  answer=a+b;
 }else if(op==='-'){
  for(let tries=0;tries<12;tries++){
   a=between(random,...(y===1?[5,20]:span));b=between(random,1,a-1);
   if(y===1||needsBorrow(a,b)||tries>8)break;
  }
  answer=a-b;
 }else if(op==='×'){
  a=y===3?between(random,12,99):y===4?between(random,11,99):between(random,100,999);
  b=y<=4?between(random,2,9):y===5?between(random,2,9):between(random,11,99);
  answer=a*b;
 }else{
  b=y===4?between(random,2,9):y===5?between(random,2,12):between(random,11,99);
  const q=y===4?between(random,11,99):y===5?between(random,100,999):between(random,10,99);
  a=b*q;answer=q;
 }
 return {id:y+'-'+seed,year:y,a,b,op,answer,text:a+' '+op+' '+b};
}

function parseNumber(value){
 const cleaned=String(value??'').normalize('NFKC').replace(/[,\s]/g,'').replace('−','-');
 if(!/^-?\d+(?:\.\d+)?$/.test(cleaned))return NaN;
 return Number(cleaned);
}

// Which column is the first one (from the right) where the answer differs?
export function firstWrongPlace(given,correct){
 const g=digitsOf(given),c=digitsOf(correct),length=Math.max(g.length,c.length);
 for(let i=0;i<length;i++)if(g[i]!==c[i])return PLACES[Math.min(i,PLACES.length-1)];
 return PLACES[0];
}

const noCarrySum=(a,b)=>{const da=digitsOf(a),db=digitsOf(b);return Number(da.map((d,i)=>(d+(db[i]||0))%10).reverse().join(''))};
const smallerFromLarger=(a,b)=>{const da=digitsOf(a),db=digitsOf(b);return Number(da.map((d,i)=>Math.abs(d-(db[i]||0))).reverse().join(''))};
const isPowerOfTen=n=>n>=10&&/^10*$/.test(String(n));

// What kind of slip does this wrong answer look like? Returns {code, params}.
export function diagnoseAnswer(problem,givenValue){
 const g=parseNumber(givenValue),{a,b,op,answer}=problem;
 if(Number.isNaN(g))return {code:'not_a_number',params:{}};
 if(g===answer)return {code:'correct',params:{}};
 const wrongPlace=firstWrongPlace(g,answer);
 const result=code=>({code,params:{place:wrongPlace}});
 if(op==='+'){
  if(g===noCarrySum(a,b))return result('forgot_carry');
  if(g===a-b)return {code:'wrong_operation',params:{did:'−'}};
  if(g===a*b)return {code:'wrong_operation',params:{did:'×'}};
 }
 if(op==='-'){
  if(g===a+b)return {code:'wrong_operation',params:{did:'+'}};
  if(g===b-a)return {code:'swapped',params:{}};
  if(g===smallerFromLarger(a,b))return result('smaller_from_larger');
  if(isPowerOfTen(Math.abs(g-answer)))return result('forgot_borrow');
 }
 if(op==='×'){
  if(g===a+b)return {code:'wrong_operation',params:{did:'+'}};
  if(g===answer*10||g*10===answer)return result('place_value');
  const parts=digitsOf(b);
  if(parts.length>1&&g===parts.reduce((sum,d)=>sum+a*d,0))return result('forgot_shift');
 }
 if(op==='÷'){
  if(g===a*b)return {code:'wrong_operation',params:{did:'×'}};
  if(g===a-b)return {code:'wrong_operation',params:{did:'−'}};
  if(g===answer*10||g*10===answer)return result('place_value');
 }
 if(Math.abs(g-answer)===1)return result('off_by_one');
 if(Math.abs(g-answer)<=Math.abs(answer)*0.1)return result('close');
 return result('try_again');
}

// Typed working lines like "47 + 38 = 85": find the first line whose arithmetic is wrong.
const LINE=/^\s*(-?\d+(?:\.\d+)?)\s*([+\-−×x*÷/])\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)\s*$/;
export function checkLines(lines){
 const issues=[];let checked=0;
 (lines||[]).forEach((raw,index)=>{
  const m=String(raw).normalize('NFKC').match(LINE);
  if(!m)return;
  checked++;
  const left=Number(m[1]),right=Number(m[3]),op=m[2],given=Number(m[4]);
  const value=op==='+'?left+right:/[-−]/.test(op)?left-right:/[×x*]/.test(op)?left*right:right===0?NaN:left/right;
  if(Number.isFinite(value)&&Math.abs(value-given)>1e-9)issues.push({line:index+1,text:String(raw).trim(),expected:Number(value.toPrecision(12))});
 });
 return {checked,issues};
}

export function checkWorking(problem,{answer,lines}){
 if(String(answer??'').trim()==='')return {status:'empty',code:'empty',params:{},lineIssues:[],checkedLines:0};
 const diagnosis=diagnoseAnswer(problem,answer);
 const {checked,issues}=checkLines(lines);
 return {status:diagnosis.code==='correct'?'correct':diagnosis.code==='not_a_number'?'invalid':'incorrect',...diagnosis,lineIssues:issues,checkedLines:checked};
}

// Step-by-step worked solution as codes: [{code, params}] so the interface can write them in any language.
export function workedSteps(problem){
 const {a,b,op,answer}=problem,steps=[];
 if(op==='+'){
  const da=digitsOf(a),db=digitsOf(b),length=Math.max(da.length,db.length);
  let carry=0;
  for(let i=0;i<length;i++){
   const x=da[i]||0,y=db[i]||0,sum=x+y+carry;
   steps.push({code:'stepAdd',params:{place:PLACES[i],expr:x+' + '+y+(carry?' + '+carry:'')+' = '+sum,write:sum%10,carry:Math.floor(sum/10)}});
   carry=Math.floor(sum/10);
  }
  if(carry)steps.push({code:'stepCarryDown',params:{carry}});
 }else if(op==='-'){
  const da=digitsOf(a),db=digitsOf(b);
  let borrow=0;
  for(let i=0;i<da.length;i++){
   let top=da[i]-borrow;const bottom=db[i]||0,lend=top<bottom;
   if(lend)top+=10;
   steps.push({code:lend?'stepSubBorrow':'stepSub',params:{place:PLACES[i],expr:top+' − '+bottom+' = '+(top-bottom),write:top-bottom}});
   borrow=lend?1:0;
  }
 }else if(op==='×'){
  const parts=[];
  digitsOf(b).forEach((d,i)=>{if(d){const unit=d*10**i,partial=a*unit;parts.push(partial);steps.push({code:'stepMulPart',params:{expr:a+' × '+unit+' = '+partial}})}});
  if(parts.length>1)steps.push({code:'stepSumParts',params:{expr:parts.join(' + ')+' = '+answer}});
 }else{
  steps.push({code:'stepDivGroups',params:{expr:a+' ÷ '+b+' = '+answer}});
  steps.push({code:'stepDivCheck',params:{expr:answer+' × '+b+' = '+a}});
 }
 return steps;
}

export function starsFor(hintsUsed){return hintsUsed<=0?3:hintsUsed===1?2:1}

/* ---------- Challenge rounds, blocks and facts ---------- */
// Every third right answer in a row (earned with few hints) unlocks a one-year-harder bonus problem.
export const isBonusRound=combo=>combo>0&&combo%3===0;
export const bonusYear=year=>Math.min(6,year+1);
export function blocksFor(n){
 const v=Math.max(0,Math.floor(n));
 if(v>999)return null;
 return {hundreds:Math.floor(v/100),tens:Math.floor(v/10)%10,ones:v%10};
}
export const canShowBlocks=problem=>(problem.op==='+'||problem.op==='-')&&problem.a<=999&&problem.b<=999&&(problem.op==='+'?problem.a+problem.b<=999:true);
export const FACT_KEYS=['fact1','fact2','fact3','fact4','fact5','fact6','fact7','fact8'];
export const factFor=seed=>FACT_KEYS[Math.abs(Math.floor(seed))%FACT_KEYS.length];

/* ---------- Number detective: riddles with exactly one answer ---------- */
const digitSum=n=>String(n).split('').reduce((t,d)=>t+Number(d),0);
export function clueHolds(clue,n){
 const {code,params:p}=clue;
 switch(code){
  case 'even':return n%2===0;
  case 'odd':return n%2===1;
  case 'digitSum':return digitSum(n)===p.n;
  case 'hundredsDigit':return Math.floor(n/100)%10===p.n;
  case 'tensDigit':return Math.floor(n/10)%10===p.n;
  case 'onesDigit':return n%10===p.n;
  case 'multipleOf':return n%p.n===0;
  case 'greaterThan':return n>p.n;
  case 'lessThan':return n<p.n;
  default:return false;
 }
}
export const riddleRange=year=>year<=1?[1,20]:year<=3?[10,99]:[100,999];
export function makeRiddle(year,seed){
 const y=Math.min(6,Math.max(1,Math.round(year)||1)),[lo,hi]=riddleRange(y);
 const random=seededRandom(Math.imul(seed|0,2654435761)+y*7919);
 const secret=between(random,lo,hi);
 const all=[];for(let n=lo;n<=hi;n++)all.push(n);
 const pool=[
  {code:secret%2===0?'even':'odd',params:{}},
  ...(secret>=10?[{code:'digitSum',params:{n:digitSum(secret)}}]:[]),
  ...[2,3,5,7,9].filter(k=>secret%k===0&&k<secret).map(k=>({code:'multipleOf',params:{n:k}})),
  {code:'greaterThan',params:{n:Math.max(lo-1,secret-between(random,2,Math.max(3,Math.floor((hi-lo)/4))))}},
  {code:'lessThan',params:{n:secret+between(random,2,Math.max(3,Math.floor((hi-lo)/4)))}},
 ];
 // shuffle, then keep each clue that narrows the field
 for(let i=pool.length-1;i>0;i--){const j=between(random,0,i);[pool[i],pool[j]]=[pool[j],pool[i]]}
 let left=all,clues=[];
 for(const clue of pool){
  const next=left.filter(n=>clueHolds(clue,n));
  if(next.length<left.length){clues.push(clue);left=next}
  if(left.length===1)break;
 }
 // Finish with exact digits if the field is still open, so there is always exactly one answer.
 const exact=[
  ...(hi>=100?[{code:'hundredsDigit',params:{n:Math.floor(secret/100)%10}}]:[]),
  ...(hi>=10?[{code:'tensDigit',params:{n:Math.floor(secret/10)%10}}]:[]),
  {code:'onesDigit',params:{n:secret%10}}
 ];
 for(const clue of exact){
  if(left.length===1)break;
  const next=left.filter(n=>clueHolds(clue,n));
  if(next.length<left.length){clues.push(clue);left=next}
 }
 // Drop any clue that is not needed, so the puzzle stays short.
 for(let i=clues.length-1;i>=0;i--){
  const rest=clues.filter((_,k)=>k!==i);
  if(rest.length&&all.filter(n=>rest.every(c=>clueHolds(c,n))).length===1)clues=rest;
 }
 return {id:y+'-'+seed,year:y,secret,clues};
}
export const riddleStars=cluesShown=>cluesShown<=2?3:cluesShown<=3?2:1;
