import {arithmeticExpression,calculateExpression} from './arithmetic.js';
export function solveArithmetic(question){
 const expression=arithmeticExpression(question), result=calculateExpression(expression);
 if(!result||result.error)return null;
 return {answer:result.answer,explanation:expression+' '+(result.approximate?'≈':'=')+' '+result.answer,engine:'deterministic'};
}
