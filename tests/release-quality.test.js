import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {LESSONS} from '../src/lessons.js';
import {auditContent} from '../src/contentAudit.js';
import {markPractice} from '../src/answerMarking.js';
import {solveWorkedCalculation} from '../src/tutorEngine.js';
import {calculateExpression} from '../src/arithmetic.js';

test('all authored lessons pass content integrity and direct arithmetic checks',()=>{
 const report=auditContent(LESSONS);
 assert.deepEqual(report.errors,[]);
 assert.ok(report.arithmeticChecked>=100);
 assert.ok(report.missingMaterials.every(x=>['Bahasa Iban','Bahasa Kadazandusun','Bahasa Semai'].includes(x.subject)));
 const damaged=structuredClone(LESSONS.find(l=>l.id==='y1-math-add'));
 damaged.check[1].answer='999';damaged.check.push({...damaged.check[0],id:'different-id'});
 const bad=auditContent([damaged]);
 assert.ok(bad.errors.some(x=>/Arithmetic/.test(x.message)));
 assert.ok(bad.errors.some(x=>/repeated question/.test(x.message)));
});
test('Study Buddy evaluates whole expressions, precedence and brackets without partial answers',()=>{
 for(const [input,answer] of [['2 + 3 × 4','14'],['(2 + 3) × 4','20'],['12 ÷ 3 ÷ 2','2'],['3/4 + 1/4','1'],['2 - -3','5']]){
  assert.equal(solveWorkedCalculation(input).answer,answer,input);
 }
 for(const text of ['2+3foo','2+3;alert(1)','2**3','2(3+4)','10 apples + 2 oranges','2+3 4','1e5+1','10%+2'])assert.equal(solveWorkedCalculation(text),null,text);
 assert.match(solveWorkedCalculation('1 ÷ 3').title,/≈/);
 assert.ok(solveWorkedCalculation('1 ÷ 3').steps.some(x=>/approximately/.test(x)));
 assert.match(solveWorkedCalculation('2/(3-3)').title,/Division by zero/);
 assert.equal(calculateExpression('('.repeat(1000)+'1'),null);
});
test('public and packaged backend marking agree on numeric equivalence and strict representations',()=>{
 const context=vm.createContext({});
 vm.runInContext(fs.readFileSync('src/answerMarking.js','utf8').replaceAll('export ','').replace(/\b(markPractice|normalizedAnswer|numericValue)\b/g,'$1_'),context);
 const cases=[
  [{mode:'number',answer:'14'},'１４.０',true],
  [{mode:'number',answer:'0.5'},'1/2',true],
  [{mode:'number',answer:'0.5'},'0/0',false],
  [{mode:'number',answer:'7'},'7 apples',false],
  [{mode:'number',answer:'7'},'7+0',false],
  [{mode:'text',answer:'6/8',answerFormat:'equivalent-number'},'3/4',true],
  [{mode:'text',answer:'4/6'},'2/3',false],
  [{mode:'choice',answer:'.',options:['.','?','!']},'?',false],
 ];
 for(const [question,response,expected] of cases){assert.equal(markPractice(question,response),expected);assert.equal(context.markPractice_(question,response),expected)}
 const fraction=LESSONS.find(l=>l.id==='jr-math-4-1').check.find(q=>q.id.endsWith('-math-1'));
 assert.equal(markPractice(fraction,'3/9'),true);
});
