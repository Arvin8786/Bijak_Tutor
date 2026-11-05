import {evaluate,format} from 'mathjs';
// Restrict to numeric arithmetic; no arbitrary function/property access.
export function solveArithmetic(question) {
 const input=String(question||'').trim().replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-');
 const expr=input.replace(/^(?:calculate|solve|kira|berapakah|what is)\s*/i,'').replace(/[?=。！!]+$/,'').trim();
 if(!expr || expr.length>100 || !/^[\d\s.+\-*/()%^]+$/.test(expr) || !/[+*/%^\-]/.test(expr)) return null;
 try {const result=evaluate(expr);if(typeof result!=='number'||!Number.isFinite(result))return null;
 return {answer:format(result,{precision:12}),explanation:`${expr.replaceAll('*',' × ').replaceAll('/',' ÷ ')} = ${format(result,{precision:12})}`,engine:'deterministic'};
 }catch{return null;}
}