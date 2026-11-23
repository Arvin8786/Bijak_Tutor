/**
 * Deterministic worked solutions beyond plain arithmetic: percentages, fractions, simple equations,
 * averages, HCF and LCM. Pure code, no eval, no network, no AI. Anything it does not recognise returns
 * null so the caller can fall back to the online helper.
 */
const MAX=1e9;
const fmt=n=>Number.isInteger(n)?String(n):String(Number(n.toPrecision(10)));
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a};
const lcm=(a,b)=>a/gcd(a,b)*b;
const clean=input=>String(input||'').normalize('NFKC').toLowerCase().trim()
 .replace(/^(?:please\s+)?(?:show|calculate|solve|find|work out|simplify|kira|cari|berapakah|what is|what's)\s+(?:me\s+)?(?=\S)/,(m)=>/simplify/.test(m)?'simplify ':'')
 .replace(/\s+step by step[.!?]*$/,'').replace(/[?!。！]+$/,'').replace(/\s*=\s*\?*$/,'').replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/').trim();
const ok=(...values)=>values.every(v=>Number.isFinite(v)&&Math.abs(v)<=MAX);
const result=(title,steps,answer,source)=>({title,steps,kind:'math',answer:typeof answer==='number'?fmt(answer):String(answer),source:source||'Checked by code, not guessed'});

function percentOf(text){
 let m=text.match(/^(\d+(?:\.\d+)?)\s*%\s*(?:of|daripada)\s*(\d+(?:\.\d+)?)$/);
 if(m){
  const p=Number(m[1]),n=Number(m[2]);if(!ok(p,n))return null;
  const value=p*n/100;
  return result(`${fmt(p)}% of ${fmt(n)} = ${fmt(value)}`,[
   `Percent means "out of 100", so ${fmt(p)}% = ${fmt(p)} ÷ 100 = ${fmt(p/100)}.`,
   `Multiply by the whole amount: ${fmt(p/100)} × ${fmt(n)} = ${fmt(value)}.`,
   `Answer: ${fmt(value)}.`,
   `Check: ${fmt(value)} is ${fmt(p)} out of every 100 in ${fmt(n)}; ${fmt(value)} ÷ ${fmt(n)} × 100 = ${n?fmt(value/n*100):'0'}%.`],value);
 }
 m=text.match(/^(\d+(?:\.\d+)?)\s*(?:is what (?:percent|percentage|%)(?: of)?|ialah berapa peratus (?:daripada)?)\s*(\d+(?:\.\d+)?)$/);
 if(m){
  const a=Number(m[1]),b=Number(m[2]);if(!ok(a,b)||b===0)return null;
  const value=a/b*100;
  return result(`${fmt(a)} is ${fmt(value)}% of ${fmt(b)}`,[
   `Write the part over the whole: ${fmt(a)} ÷ ${fmt(b)} = ${fmt(a/b)}.`,
   `Multiply by 100 to turn it into a percent: ${fmt(a/b)} × 100 = ${fmt(value)}%.`,
   `Answer: ${fmt(value)}%.`],value);
 }
 return null;
}

const mixed=(n,d)=>{const sign=n<0?-1:1,abs=Math.abs(n),whole=Math.floor(abs/d),rest=abs%d;
 if(rest===0)return String(sign*whole);if(whole===0)return `${sign<0?'-':''}${rest}/${d}`;return `${sign<0?'-':''}${whole} ${rest}/${d}`};
function parseFraction(token){
 let m=token.match(/^(\d+)\s+(\d+)\/(\d+)$/);
 if(m){const w=Number(m[1]),n=Number(m[2]),d=Number(m[3]);if(d===0)return null;return {n:w*d+n,d,mixedForm:true,text:`${w} ${n}/${d}`}}
 m=token.match(/^(\d+)\/(\d+)$/);
 if(m){const n=Number(m[1]),d=Number(m[2]);if(d===0)return null;return {n,d,text:`${n}/${d}`}}
 m=token.match(/^(\d+)$/);
 if(m)return {n:Number(m[1]),d:1,whole:true,text:m[1]};
 return null;
}
const show=f=>f.d===1?String(f.n):`${f.n}/${f.d}`;
function simplifySteps(n,d,label){
 const g=gcd(n,d),steps=[];
 if(g>1){steps.push(`Simplify: the biggest number that divides ${n} and ${d} is ${g}, so ${n} ÷ ${g} = ${n/g} and ${d} ÷ ${g} = ${d/g}.`);n/=g;d/=g}
 else if(label!==false)steps.push(`${n}/${d} cannot be simplified because 1 is the only common factor.`);
 return {n,d,steps};
}
function fractions(text){
 const simple=text.match(/^simplify\s+(\d+)\/(\d+)$/);
 if(simple){
  const n=Number(simple[1]),d=Number(simple[2]);if(!d||!ok(n,d))return null;
  const s=simplifySteps(n,d);
  return result(`${n}/${d} = ${show({n:s.n,d:s.d})}`,[...s.steps,`Answer: ${show({n:s.n,d:s.d})}.`],show({n:s.n,d:s.d}));
 }
 if(!/\d\/\d/.test(text))return null;
 const m=text.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+)\s*([+*/-]|plus|minus|times|divided by)\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+)$/);
 if(!m)return null;
 // A slash with spaces between two plain numbers is ordinary division, handled elsewhere.
 const a=parseFraction(m[1].trim()),b=parseFraction(m[3].trim());
 if(!a||!b||!ok(a.n,a.d,b.n,b.d))return null;
 const raw=m[2],op={plus:'+',minus:'-',times:'*','divided by':'/'}[raw]||raw;
 if(op==='/'&&!(/\s\/\s/.test(text)||raw==='divided by'))return null;
 const steps=[];
 if(a.mixedForm)steps.push(`Turn ${a.text} into an improper fraction: ${a.text.split(' ')[0]} × ${a.d} + ${a.text.split(' ')[1].split('/')[0]} = ${a.n}, so it is ${a.n}/${a.d}.`);
 if(b.mixedForm)steps.push(`Turn ${b.text} into an improper fraction: ${b.text.split(' ')[0]} × ${b.d} + ${b.text.split(' ')[1].split('/')[0]} = ${b.n}, so it is ${b.n}/${b.d}.`);
 let n,d;
 if(op==='+'||op==='-'){
  const common=lcm(a.d,b.d),an=a.n*(common/a.d),bn=b.n*(common/b.d);
  if(a.d!==b.d)steps.push(`Make the bottom numbers (denominators) the same. The smallest common one is ${common}: ${show(a)} = ${an}/${common} and ${show(b)} = ${bn}/${common}.`);
  else steps.push(`The denominators are already the same (${common}).`);
  n=op==='+'?an+bn:an-bn;d=common;
  steps.push(`${op==='+'?'Add':'Subtract'} the top numbers and keep the denominator: ${an} ${op==='+'?'+':'−'} ${bn} = ${n}, so the answer is ${n}/${d}.`);
 }else if(op==='*'){
  n=a.n*b.n;d=a.d*b.d;
  steps.push(`Multiply the top numbers and the bottom numbers: ${a.n} × ${b.n} = ${n} and ${a.d} × ${b.d} = ${d}, giving ${n}/${d}.`);
 }else{
  if(b.n===0)return null;
  steps.push(`To divide by a fraction, flip the second fraction and multiply: ${show(a)} ÷ ${show(b)} = ${show(a)} × ${b.d}/${b.n}.`);
  n=a.n*b.d;d=a.d*b.n;
  steps.push(`Multiply the top numbers and the bottom numbers: ${a.n} × ${b.d} = ${n} and ${a.d} × ${b.n} = ${d}, giving ${n}/${d}.`);
 }
 if(!ok(n,d)||d===0)return null;
 const negative=n<0;if(negative){n=-n}
 const s=simplifySteps(n,d,false);steps.push(...s.steps);
 const answer=(negative?'-':'')+show({n:s.n,d:s.d}),asMixed=(negative&&s.n!==0?'-':'')+mixed(s.n,s.d);
 if(s.n>=s.d&&s.d!==1)steps.push(`As a mixed number, ${show({n:s.n,d:s.d})} = ${asMixed}.`);
 steps.push(`Answer: ${answer}${s.n>=s.d&&s.d!==1?` (${asMixed})`:''}.`);
 return result(`${a.text} ${op==='*'?'×':op==='/'?'÷':op==='-'?'−':'+'} ${b.text} = ${answer}`,steps,answer);
}

function equation(text){
 const t=text.replace(/\s+/g,'');
 let m=t.match(/^([+-]?\d*(?:\.\d+)?)([a-z])([+-]\d+(?:\.\d+)?)?=([+-]?\d+(?:\.\d+)?)$/);
 let coef,constant,right,variable;
 if(m){
  variable=m[2];
  coef=m[1]===''||m[1]==='+'?1:m[1]==='-'?-1:Number(m[1]);
  constant=m[3]?Number(m[3]):0;right=Number(m[4]);
 }else{
  m=t.match(/^(\d+(?:\.\d+)?)([+-])([a-z])=([+-]?\d+(?:\.\d+)?)$/);
  if(!m)return null;
  variable=m[3];constant=Number(m[1]);coef=m[2]==='-'?-1:1;right=Number(m[4]);
  // c ± x = d  is the same as  ±x + c = d
 }
 if(!ok(coef,constant,right))return null;
 if(coef===0)return null;
 const steps=[`We want to find ${variable}. Do the same thing to both sides so the equation stays balanced.`];
 let side=right;
 if(constant!==0){
  side=right-constant;
  steps.push(`${constant>0?'Subtract':'Add'} ${fmt(Math.abs(constant))} ${constant>0?'from':'to'} both sides: ${fmt(right)} ${constant>0?'−':'+'} ${fmt(Math.abs(constant))} = ${fmt(side)}.`);
 }
 const value=side/coef;
 if(coef!==1)steps.push(`${coef===-1?'Multiply':'Divide'} both sides by ${fmt(coef)}: ${fmt(side)} ÷ ${fmt(coef)} = ${fmt(value)}.`);
 if(!ok(value))return null;
 const left=coef*value+constant;
 steps.push(`Answer: ${variable} = ${fmt(value)}.`,`Check: put ${fmt(value)} back in. ${coef===1?'':coef===-1?'-':fmt(coef)+' × '}${fmt(value)}${constant?` ${constant>0?'+':'−'} ${fmt(Math.abs(constant))}`:''} = ${fmt(left)}, which matches ${fmt(right)}.`);
 return Math.abs(left-right)>1e-9?null:result(`${variable} = ${fmt(value)}`,steps,fmt(value));
}

function average(text){
 const m=text.match(/^(?:the\s+)?(average|mean|purata|min)\s*(?:of|for|bagi)?\s*[:\-]?\s*(.+)$/);
 if(!m)return null;
 const list=m[2].replace(/\band\b|\bdan\b/g,',').split(/[\s,]+/).filter(Boolean);
 if(list.length<2||list.length>12||!list.every(x=>/^\d+(?:\.\d+)?$/.test(x)))return null;
 const numbers=list.map(Number);if(!ok(...numbers))return null;
 const sum=numbers.reduce((a,b)=>a+b,0),value=sum/numbers.length;
 return result(`Average of ${numbers.map(fmt).join(', ')} = ${fmt(value)}`,[
  `Add all the numbers: ${numbers.map(fmt).join(' + ')} = ${fmt(sum)}.`,
  `Count how many numbers there are: ${numbers.length}.`,
  `Divide the total by the count: ${fmt(sum)} ÷ ${numbers.length} = ${fmt(value)}.`,
  `Answer: ${fmt(value)}.`],value);
}

const factorsOf=n=>{const out=[];for(let i=1;i<=n;i++)if(n%i===0)out.push(i);return out};
function hcfLcm(text){
 const m=text.match(/^(?:the\s+)?(hcf|gcd|gcf|fpb|lcm|lcd|gsk)\s*(?:of|for|bagi)?\s*[:\-]?\s*(\d+)\s*(?:,|and|dan|&)\s*(\d+)$/);
 if(!m)return null;
 const kind=['lcm','lcd','gsk'].includes(m[1])?'lcm':'hcf',a=Number(m[2]),b=Number(m[3]);
 if(!ok(a,b)||a<1||b<1||a>1e6||b>1e6)return null;
 const g=gcd(a,b),l=lcm(a,b);
 if(kind==='hcf'){
  const steps=[];
  if(a<=200&&b<=200){
   const fa=factorsOf(a),fb=factorsOf(b),common=fa.filter(x=>fb.includes(x));
   steps.push(`Factors of ${a}: ${fa.join(', ')}.`,`Factors of ${b}: ${fb.join(', ')}.`,`Common factors: ${common.join(', ')}.`,`The highest common factor is the biggest one: ${g}.`);
  }else{
   let x=a,y=b;steps.push('Use repeated division (Euclid): divide the bigger number by the smaller and keep the remainder.');
   while(y){steps.push(`${x} ÷ ${y} leaves remainder ${x%y}.`);[x,y]=[y,x%y]}
   steps.push(`The last non-zero remainder is the HCF: ${g}.`);
  }
  steps.push(`Answer: HCF of ${a} and ${b} = ${g}.`);
  return result(`HCF of ${a} and ${b} = ${g}`,steps,g);
 }
 const steps=[];
 if(l<=2000){
  const ma=[],mb=[];for(let i=1;ma.length<12&&a*i<=l;i++)ma.push(a*i);for(let i=1;mb.length<12&&b*i<=l;i++)mb.push(b*i);
  steps.push(`Multiples of ${a}: ${ma.join(', ')}.`,`Multiples of ${b}: ${mb.join(', ')}.`,`The smallest multiple in both lists is ${l}.`);
 }else steps.push(`LCM = (${a} × ${b}) ÷ HCF. The HCF is ${g}, so ${a} × ${b} = ${a*b} and ${a*b} ÷ ${g} = ${l}.`);
 steps.push(`Answer: LCM of ${a} and ${b} = ${l}.`);
 return result(`LCM of ${a} and ${b} = ${l}`,steps,l);
}

/** Returns {title,steps,kind:'math',answer,source} or null when this helper does not recognise the question. */
export function solveExtendedMath(input){
 const raw=String(input||'');if(raw.length>200)return null;
 const text=clean(raw);if(!text)return null;
 return percentOf(text)||fractions(text)||equation(text)||average(text)||hcfLcm(text)||null;
}
