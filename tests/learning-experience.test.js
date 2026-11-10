import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LESSONS} from '../src/lessons.js';
import {availableSubjects} from '../src/primarySubjects.js';

test('available Year 1 Mathematics lessons have readable teaching materials',()=>{
 const lessons=LESSONS.filter(l=>l.year===1&&l.subject==='Matematik');
 assert.ok(lessons.length>=29);
 for(const lesson of lessons){
  assert.ok(lesson.title&&lesson.summary,`Missing text in ${lesson.id}`);
  assert.ok(Array.isArray(lesson.steps)&&lesson.steps.length>0,`Missing teaching steps in ${lesson.id}`);
  assert.ok(Array.isArray(lesson.mind)&&lesson.mind.length>0,`Missing mind map in ${lesson.id}`);
  assert.ok(Array.isArray(lesson.check)&&lesson.check.length>0,`Missing practice in ${lesson.id}`);
 }
});

test('all three school streams expose a subject catalogue',()=>{
 for(const school of ['SK','SJKC','SJKT'])for(let year=1;year<=6;year++){
  const names=availableSubjects(school,year).map(s=>s.name);
  assert.ok(names.includes('Matematik'));
  assert.ok(names.includes('Bahasa Melayu'));
 }
});

test('student dashboard can open reading materials without a child profile',()=>{
 const app=fs.readFileSync('src/main.jsx','utf8');
 assert.match(app,/onClick=\{\(\)=>openLesson\(l\.id\)\}/);
 assert.match(app,/studyTab==='notes'/);
 assert.match(app,/LearningVisuals/);
 assert.ok(!app.includes('disabled={!childId} onClick={()=>openLesson(l.id)}'),'Browsing must not require a learner profile');
});

test('original graphic playground supports several interactive visual concepts',()=>{
 const visuals=fs.readFileSync('src/LearningVisuals.jsx','utf8');
 for(const name of ['numbers','fractions','clock','shapes','money','data'])assert.ok(visuals.includes(`type==='${name}'`),name+' visual missing');
});
