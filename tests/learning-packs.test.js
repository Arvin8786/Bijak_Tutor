import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildLearningPacks,packProgress,featuredLesson} from '../src/learningPacks.js';
import {LESSONS} from '../src/lessons.js';
test('Adventure packages link only authored curriculum and never fabricate inaccessible lessons',()=>{
 for(let year=1;year<=6;year++)for(const stream of ['SK','SJKC','SJKT']){
  const packs=buildLearningPacks(LESSONS,year,stream);
  assert.ok(packs.length>=3,stream+' Year '+year+' missing packs');
  const ids=new Set(LESSONS.map(l=>l.id));
  for(const p of packs){
   assert.ok(p.lessons.length>0&&p.lessons.length<=4,p.id+' pack too large');
   assert.equal(new Set(p.lessons.map(l=>l.id)).size,p.lessons.length,'Duplicate mini lesson');
   for(const l of p.lessons){
    assert.ok(ids.has(l.id),'Lesson not in authored library');
    assert.equal(l.year,year);
    assert.ok(!l.school||l.school==='ALL'||l.school===stream);
   }
  }
 }
});
test('Pack progress counts attempts, not guesses or verified mastery',()=>{
 const pack={lessons:[{id:'one'},{id:'two'},{id:'three'}]};
 assert.deepEqual(packProgress(pack,{},'test'),{done:0,total:3,percent:0});
 assert.deepEqual(packProgress(pack,{'test/one':{attempts:[{correct:false}]},'other/two':{attempts:[{correct:true}] }},'test'),{done:1,total:3,percent:33});
 assert.equal(packProgress(pack,{'test/one':{attempts:[{correct:false}]}},'').done,0);
});
test('Mini mission prioritises unattempted lesson for a selected test learner',()=>{
 const packs=[{id:'p',title:'Demo',lessons:[{id:'one',title:'First'},{id:'two',title:'Second'}]}];
 assert.equal(featuredLesson(packs,{},'demo').lesson.id,'one');
 assert.equal(featuredLesson(packs,{'demo/one':{attempts:[{correct:false}]}},'demo').lesson.id,'two');
});
test('UI exposes accessible learning packages and real lesson navigation',()=>{
 const component=fs.readFileSync('src/AdventurePacks.jsx','utf8');
 const app=fs.readFileSync('src/main.jsx','utf8');
 const css=fs.readFileSync('src/adventure.css','utf8');
 assert.ok(component.includes('onOpen(l.id)'));
 assert.ok(component.includes('aria-expanded'));
 assert.ok(component.includes('aria-valuenow'));
 assert.ok(app.includes("page==='packs'"));
 assert.ok(app.includes("setPage('packs')"));
 assert.ok(css.includes('grid-auto-rows:1fr'));
 assert.ok(css.includes('overflow-wrap:anywhere')||css.includes('overflow-wrap:anywhere;'));
});
