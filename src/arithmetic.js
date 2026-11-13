/** Bounded numeric parser. No eval, functions, implicit multiplication or code. */
export function arithmeticExpression(input) {
 return String(input||'').normalize('NFKC').trim()
  .replace(/^(?:please\s+)?(?:show|calculate|solve|kira|berapakah|what is)\s+(?:me\s+)?/i,'')
  .replace(/\s+step by step[.!?]*$/i,'').replace(/[?=。！!]+$/,'').trim()
  .replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-');
}
export function calculateExpression(expression) {
 if(!expression||expression.length>100||!/[+*/-]/.test(expression)||!/^[\d\s.+*/()-]+$/.test(expression))return null;
 const tokens=expression.match(/\d+(?:\.\d+)?|[()+*/-]/g)||[];
 if(tokens.join('')!==expression.replace(/\s/g,'')||tokens.length>60)return null;
 let position=0;const steps=[];
 const fmt=n=>String(Number(n.toPrecision(12)));
 const factor=()=>{
  const token=tokens[position++];
  if(token==='+'||token==='-'){const value=factor();return token==='-'?-value:value}
  if(token==='('){const value=sum();if(tokens[position++]!==')')throw Error('Unclosed bracket');return value}
  if(!/^\d+(?:\.\d+)?$/.test(token||''))throw Error('Expected number');
  const value=Number(token);if(!Number.isFinite(value)||Math.abs(value)>1e10)throw Error('Number too large');return value;
 };
 const operation=(left,op,right)=>{
  if(op==='/'&&right===0)throw Error('Division by zero');
  const value=op==='+'?left+right:op==='-'?left-right:op==='*'?left*right:left/right;
  if(!Number.isFinite(value)||Math.abs(value)>1e12)throw Error('Result too large');
  steps.push(`${fmt(left)} ${op==='*'?'×':op==='/'?'÷':op} ${fmt(right)} ${Number(fmt(value))===value?'=':'≈'} ${fmt(value)}`);
  return value;
 };
 const product=()=>{let value=factor();while(['*','/'].includes(tokens[position])){const op=tokens[position++];value=operation(value,op,factor())}return value};
 const sum=()=>{let value=product();while(['+','-'].includes(tokens[position])){const op=tokens[position++];value=operation(value,op,product())}return value};
 try{const value=sum();if(position!==tokens.length)return null;return {value,answer:fmt(value),steps,approximate:Number(fmt(value))!==value}}
 catch(error){return error.message==='Division by zero'?{error:error.message}:null}
}
