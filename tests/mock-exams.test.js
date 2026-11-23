import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';

function world(){
 const values=[];
 let time=1700000000000,seq=0,created=false,locked=false;
 const children=[{childId:'a',parentSub:'family1',year:4},{childId:'b',parentSub:'family2',year:6}];
 const users={student:{role:'STUDENT',studentChildId:'a',familySub:'family1'},other:{role:'STUDENT',studentChildId:'b',familySub:'family2'},
  parent:{role:'PARENT',sub:'family1'},stranger:{role:'PARENT',sub:'family2'},admin:{role:'ADMIN'}};
 const sheet={getLastRow:()=>values.length,appendRow:row=>values.push([...row]),setFrozenRows(){},getRange:(r,c,h=1,w=1)=>({
  getValues:()=>values.slice(r-1,r-1+h).map(row=>row.slice(c-1,c-1+w)),setValues:rows=>{values[r-1]=[...rows[0]]},
  setValue:value=>{values[r-1][c-1]=value;},setNumberFormat(){}
 })};
 const ctx=createContext({Date:{now:()=>time},portalIdentity_:token=>{if(!users[token])throw Error('Sign in required');return users[token]},
  requireChild_:(user,id)=>{const row=children.find(c=>c.childId===id&&c.parentSub===(user.sub||user.familySub));if(!row)throw Error('Child not linked');return row},
  database_:()=>({getSheetByName:()=>created?sheet:null,insertSheet:()=>{created=true;return sheet}}),
  LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true},releaseLock(){locked=false}})},
  SpreadsheetApp:{flush(){}},Utilities:{getUuid:()=>String(++seq)}});
 for(const file of ['MockExams.gs','MockExamPapers.gs'])runInContext(readFileSync(new URL('../apps-script/'+file,import.meta.url),'utf8'),ctx);
 return {api:ctx.mockExamRequest,paper:ctx.makeMockExamPaper_,advance:ms=>{time+=ms},values};
}
const clone=value=>JSON.parse(JSON.stringify(value));

test('all 18 original papers have valid and unique questions and answer keys',()=>{
 const {paper}=world();
 for(let year=1;year<=6;year++)for(const subject of ['maths','science','english']){
  const {questions}=paper(year,subject,'exam-test');
  assert.ok(questions.length>=16);
  assert.equal(new Set(questions.map(q=>q.prompt)).size,questions.length);
  for(const q of questions){
   assert.ok(q.prompt);
   if(q.options){assert.equal(new Set(q.options).size,4);assert.ok(q.options[q.key]);}
   else assert.ok(Number.isFinite(q.key));
  }
 }
});

test('deadline is enforced server side, attempts resume, and only the owning family can view results',()=>{
 const {api,advance,values}=world();
 assert.throws(()=>api('no-session','catalog',{}),/Sign in/);
 assert.throws(()=>api('student','start',{paperId:'5-maths'}),/linked school year/);
 assert.equal(api('student','catalog',{}).active,null);
 const started=api('student','start',{paperId:'4-maths'});
 assert.equal(started.endsAt-started.serverNow,3600000);
 assert.equal(api('student','start',{paperId:'4-science'}).id,started.id);
 assert.equal(started.review,undefined);assert.ok(!JSON.stringify(started).includes('"key":'));
 const attemptId=started.id;
 const privatePaper=JSON.parse(values[1][5]).questions;
 const answer=String(privatePaper[0].key);
 assert.equal(api('student','save',{attemptId,index:0,answer}).saved,true);
 assert.equal(api('student','state',{attemptId}).answers[0],answer);
 assert.throws(()=>api('other','state',{attemptId}),/unavailable/);
 assert.throws(()=>api('stranger','results',{childId:'a'}),/not linked/);
 assert.throws(()=>api('admin','results',{childId:'a'}),/Parent sign-in/);
 assert.deepEqual(clone(api('parent','results',{childId:'a'})),[]);
 advance(3600000);
 const blocked=api('student','save',{attemptId,index:1,answer:String(privatePaper[1].key)});
 assert.equal(blocked.score,1);assert.equal(blocked.answered,1);
 const result=api('student','state',{attemptId});assert.equal(result.review[0].correct,true);
 assert.equal(result.review[1].submitted,null);
 const parent=api('parent','results',{childId:'a'});
 assert.equal(parent[0].score,1);
 assert.equal(parent[0].review,undefined);
 assert.equal(api('student','catalog',{}).active,null);
});
