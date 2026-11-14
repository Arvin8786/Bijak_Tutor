import test from 'node:test';
import assert from 'node:assert/strict';
import {makeProblem,diagnoseAnswer,checkWorking,checkLines,workedSteps,firstWrongPlace,starsFor} from '../src/mathGuide.js';

test('problems are deterministic, valid and suit the year',()=>{
 for(let year=1;year<=6;year++)for(let seed=1;seed<=60;seed++){
  const p=makeProblem(year,seed);
  assert.deepEqual(p,makeProblem(year,seed));
  const expected=p.op==='+'?p.a+p.b:p.op==='-'?p.a-p.b:p.op==='×'?p.a*p.b:p.a/p.b;
  assert.equal(p.answer,expected,JSON.stringify(p));
  assert.ok(Number.isInteger(p.answer)&&p.answer>0);
  if(year===1)assert.ok(p.a<=20&&p.answer<=20);
  if(year<=2)assert.ok(['+','-'].includes(p.op));
 }
});
test('different seeds give a variety of problems',()=>{
 assert.ok(new Set(Array.from({length:30},(_,i)=>makeProblem(3,i+1).text)).size>=20);
});
test('diagnoses a forgotten carry',()=>{
 const p={a:47,b:38,op:'+',answer:85};
 assert.equal(diagnoseAnswer(p,'75').code,'forgot_carry');
 assert.equal(diagnoseAnswer(p,'85').code,'correct');
});
test('diagnoses taking the smaller digit from the larger when subtracting',()=>{
 const p={a:52,b:27,op:'-',answer:25};
 assert.equal(diagnoseAnswer(p,'35').code,'smaller_from_larger');
});
test('diagnoses wrong operation, swapped numbers, place value and shifted partial products',()=>{
 assert.deepEqual(diagnoseAnswer({a:9,b:4,op:'-',answer:5},'13'),{code:'wrong_operation',params:{did:'+'}});
 assert.equal(diagnoseAnswer({a:25,b:7,op:'-',answer:18},'-3').code,'try_again');
 assert.equal(diagnoseAnswer({a:12,b:30,op:'-',answer:-18},'18').code,'swapped');
 assert.equal(diagnoseAnswer({a:25,b:12,op:'×',answer:300},'30').code,'place_value');
 assert.equal(diagnoseAnswer({a:25,b:12,op:'×',answer:300},'75').code,'forgot_shift');
 assert.equal(diagnoseAnswer({a:84,b:4,op:'÷',answer:21},'336').params.did,'×');
});
test('close and off-by-one answers are recognised; junk is invalid',()=>{
 const p={a:40,b:20,op:'+',answer:60};
 assert.equal(diagnoseAnswer(p,'61').code,'off_by_one');
 assert.equal(diagnoseAnswer(p,'abc').code,'not_a_number');
 assert.equal(checkWorking(p,{answer:'',lines:[]}).status,'empty');
 assert.equal(checkWorking(p,{answer:'abc',lines:[]}).status,'invalid');
});
test('finds the first wrong column',()=>{
 assert.equal(firstWrongPlace(75,85),'tens');
 assert.equal(firstWrongPlace(84,85),'ones');
 assert.equal(firstWrongPlace(985,85),'hundreds');
});
test('checks typed working lines and reports the wrong one with the right value',()=>{
 const {checked,issues}=checkLines(['7 + 8 = 15','4 + 3 + 1 = 8','40 + 30 = 80','note: carry 1']);
 assert.equal(checked,2);
 assert.deepEqual(issues,[{line:3,text:'40 + 30 = 80',expected:70}]);
 const r=checkWorking({a:47,b:38,op:'+',answer:85},{answer:'85',lines:['7 + 8 = 14']});
 assert.equal(r.status,'correct');assert.equal(r.lineIssues[0].expected,15);
});
test('worked steps agree with the answer',()=>{
 const add=workedSteps({a:47,b:38,op:'+',answer:85});
 assert.equal(add[0].params.write,5);assert.equal(add[0].params.carry,1);assert.equal(add[1].params.write,8);
 const sub=workedSteps({a:52,b:27,op:'-',answer:25});
 assert.equal(sub[0].code,'stepSubBorrow');assert.equal(sub[0].params.expr,'12 − 7 = 5');
 assert.ok(workedSteps({a:25,b:12,op:'×',answer:300}).some(s=>s.code==='stepSumParts'));
 assert.equal(workedSteps({a:84,b:4,op:'÷',answer:21}).length,2);
});
test('fewer hints earn more stars',()=>{assert.deepEqual([0,1,2,3].map(starsFor),[3,2,1,1])});
