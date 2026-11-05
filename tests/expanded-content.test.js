import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPANDED_LESSONS} from '../src/expandedLessons.js';
import {LESSONS} from '../src/lessons.js';
const chapters=['1.0','2.0','3.0','4.0','5.0','6.0','7.0','8.0'];
test('all eight year-one mathematics chapters have original draft learning materials',()=>{
 for(const prefix of chapters)assert.ok(EXPANDED_LESSONS.some(l=>l.chapter.startsWith(prefix)),prefix);
 assert.ok(EXPANDED_LESSONS.length>=25);
 assert.ok(LESSONS.length>=35);
});
test('each expansion has multi-step teaching, mind map, independent and transfer assessments',()=>{
 const seen=new Set();
 for(const l of EXPANDED_LESSONS){
  assert.ok(!seen.has(l.id));seen.add(l.id);
  assert.equal(l.status,'DRAFT_TEACHER_REVIEW');
  assert.ok(l.summary.length>=25);assert.ok(l.visual.length>=12);
  assert.ok(l.mind.length>=3&&l.steps.length>=3);
  assert.equal(l.check.length,4);
  assert.ok(l.check.some(q=>q.mode==='number'));
  assert.ok(l.check.some(q=>q.transfer));
  assert.ok(l.check.some(q=>q.mode==='reason'));
  for(const q of l.check){assert.ok(q.text&&q.answer&&q.why);if(q.options?.length)assert.ok(q.options.includes(q.answer));}
 }
});