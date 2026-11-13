/** Shared by public practice and Apps Script. Never evaluate submitted code. */
export function normalizedAnswer(value) {
 return String(value??'').normalize('NFKC').toLowerCase().trim().replace(/\s+/g,' ').replace(/[.,!?。！?]+$/,'');
}
function numericValue(value) {
 const text=String(value??'').normalize('NFKC').trim().replaceAll('−','-');
 if (/^[+-]?\d+(?:\.\d+)?$/.test(text)) return Number(text);
 const fraction=text.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
 if (!fraction || Number(fraction[2])===0) return null;
 return Number(fraction[1])/Number(fraction[2]);
}
export function markPractice(question,response) {
 if (question.options?.length) return String(response)===String(question.answer);
 // Representation exercises still require their specified form; equivalence is opt-in.
 if (question.mode==='number'||question.answerFormat==='equivalent-number') {
  const expected=numericValue(question.answer),actual=numericValue(response);
  return expected!==null&&actual!==null&&Number.isFinite(expected)&&Number.isFinite(actual)&&
   Math.abs(expected-actual)<=Number.EPSILON*8*Math.max(1,Math.abs(expected));
 }
 const actual=normalizedAnswer(response);
 return actual!==''&&actual===normalizedAnswer(question.answer);
}
