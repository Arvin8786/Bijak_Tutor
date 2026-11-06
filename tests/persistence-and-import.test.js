import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadDemo,saveDemo,clearDemo,sanitizeDemo,DEMO_STORAGE_KEY} from '../src/demoStore.js';
import {LESSONS} from '../src/lessons.js';
class MemoryStore {constructor(){this.map=new Map()}getItem(k){return this.map.get(k)||null}setItem(k,v){this.map.set(k,v)}removeItem(k){this.map.delete(k)}}
test('Device demo saving is opt-in from UI and persists fictional practice without raw answers',()=>{
 const s=new MemoryStore(),children=[{id:'demo-1',name:'Test Fox',year:3,school:'SK',language:'ms'}];
 const attempts={'demo-1/jr-math-3-1':{attempts:[{questionId:'p1',correct:true,mode:'text',hints:0,transfer:true,answer:'DO NOT STORE RAW ANSWER'}]}};
 assert.equal(saveDemo(children,attempts,s),true);
 assert.ok(s.getItem(DEMO_STORAGE_KEY));
 assert.ok(!s.getItem(DEMO_STORAGE_KEY).includes('DO NOT STORE RAW ANSWER'));
 const loaded=loadDemo(s);
 assert.equal(loaded.children[0].name,'Test Fox');
 assert.equal(loaded.attempts['demo-1/jr-math-3-1'].attempts.length,1);
 assert.equal(clearDemo(s),true);
 assert.equal(loadDemo(s).children.length,0);
});
test('Demo storage drops expired state, extra profiles and invalid cross-family progress',()=>{
 const s=new MemoryStore();
 let children=Array.from({length:8},(_,i)=>({id:'demo-'+i,name:'Student '+i,year:4,school:'SK'}));
 const result=sanitizeDemo({children,attempts:{'stranger/something':{attempts:[{correct:true}]}}});
 assert.equal(result.children.length,5);
 assert.equal(Object.keys(result.attempts).length,0);
 s.setItem(DEMO_STORAGE_KEY,JSON.stringify({...result,savedAt:Date.now()-32*86400000}));
 assert.equal(loadDemo(s).children.length,0);
});
test('Generated Apps Script import is not publicly callable without parent identity',()=>{
 const core=fs.readFileSync('apps-script/Code.gs','utf8');
 const importer=fs.readFileSync('apps-script/CurriculumImport.gs','utf8');
 assert.match(core,/function initializeDatabase_\(/);
 assert.match(core,/function importCurriculumV6_\(/);
 assert.match(importer,/function importFullJuniorCurriculum_\(/);
 assert.ok(!core.includes('function initializeDatabase(){'));
 assert.ok(!importer.includes('function importFullJuniorCurriculum(){'));
});
test('Curriculum import build includes new teaching material and remains explicitly draft',()=>{
 const pkg=fs.readFileSync('scripts/package-gas.mjs','utf8');
 assert.ok(pkg.includes('release/CurriculumData.gs'));
 assert.ok(pkg.includes('release/CurriculumImport.gs'));
 assert.ok(LESSONS.length>=170);
 assert.ok(fs.readFileSync('apps-script/CurriculumImport.gs','utf8').includes('DRAFT_TEACHER_REVIEW'));
});
test('Backend mastery does not count multiple-choice reasoning as independent',()=>{
 const code=fs.readFileSync('apps-script/Code.gs','utf8');
 assert.ok(code.includes("['number','text','written'].includes(a.mode)"));
 assert.ok(code.includes('verified:false'));
});
