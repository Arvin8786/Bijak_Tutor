import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LESSONS} from '../src/lessons.js';
import {SUPPLEMENTARY_LESSONS,SUPPLEMENTARY_TOPICS} from '../src/supplementaryExplorations.js';
import {availableSubjects} from '../src/primarySubjects.js';
import {assessTrace,traceMetrics} from '../src/drawingFeedback.js';
import {addUsageSlice,summariseUsage,IDLE_LIMIT_MS,MAX_TICK_MS} from '../src/learningTime.js';

test('core subjects have at least six real selectable supplementary topics per eligible year',()=>{
 assert.ok(SUPPLEMENTARY_LESSONS.length>=400);
 for(const [subject,entry] of Object.entries(SUPPLEMENTARY_TOPICS)){
  for(let year=entry.minYear||1;year<=6;year++){
   const matched=LESSONS.filter(l=>l.year===year&&l.subject===subject&&(!l.school||l.school==='ALL'));
   assert.ok(matched.length>=6,`${subject} Year ${year} only has ${matched.length} lessons`);
   assert.ok(new Set(matched.map(l=>l.title)).size>=6,subject+' repeated title cards');
   for(const l of matched)assert.ok(l.check?.length>=2 && l.steps?.length>=3,l.id+' cannot open with complete content');
  }
 }
});
test('supplementary content does not claim official school syllabus approval',()=>{
 for(const x of SUPPLEMENTARY_LESSONS){
  assert.equal(x.premium,false);
  assert.equal(x.status,'DRAFT_TEACHER_REVIEW');
  assert.ok(x.school==='ALL'||(x.optional===true&&x.school==='SK'),'Incorrect school scope: '+x.id);
  assert.ok(x.check.every(q=>q.answer!==undefined&&q.answer!==null&&(['number','text'].includes(q.mode)||Array.isArray(q.options)&&q.options.includes(q.answer))),x.id+' has an assessment without an answer');
  assert.ok(x.enrichment?.mission?.length>10);
 }
});
test('tracing review is actionable but never claims handwriting recognition',()=>{
 const empty=assessTrace([]);
 assert.equal(empty.level,'start');
 const short=assessTrace([[{x:250,y:150},{x:251,y:152}]]);
 assert.equal(short.level,'starting');assert.match(short.tips.join(' '),/longer line/);
 const offcenter=assessTrace([Array.from({length:15},(_,i)=>({x:15+i*3,y:18+i*3}))]);
 assert.match(offcenter.tips.join(' '),/middle/);
 const good=assessTrace([Array.from({length:18},(_,i)=>({x:160+i*10,y:120+i*4}))],{guideHits:16,guidePoints:18});
 assert.ok(good.approximateGuideProximity>=80);
 assert.ok(traceMetrics([[{x:0,y:0},{x:30,y:40}]]).path>=50);
 const studio=fs.readFileSync('src/PreschoolStudio.jsx','utf8');
 assert.match(studio,/Check my drawing/);
 assert.match(studio,/cannot reliably recognise the picture/);
});
test('learning time is opt-in, bounded and reports ambiguity fairly',()=>{
 const childId='test-learner';
 const now=Date.parse('2026-11-06T10:00:00Z');
 let data={};
 data=addUsageSlice(data,{childId,at:now,seconds:120,activity:'lesson'});
 data=addUsageSlice(data,{childId,at:now+10000,seconds:10,activity:'lesson',event:'background'});
 data=addUsageSlice(data,{childId,at:now+15000,seconds:0,activity:'lesson',event:'foreground'});
 const report=summariseUsage(childId,data,now+20000);
 assert.equal(report.seconds7,30);
 assert.equal(report.backgroundEvents7,1);
 assert.equal(report.activeDays,1);
 assert.ok(report.note.includes('not proof'));
 assert.equal(IDLE_LIMIT_MS,90000);
 assert.equal(MAX_TICK_MS,20000);
});
test('parent report requires PIN and student gets a transparent tracking notice',()=>{
 const src=fs.readFileSync('src/main.jsx','utf8');
 assert.match(src,/timeConsent&&<p className="time-child-notice"/);
 assert.match(src,/getParentReport/);
 assert.match(src,/Enable learning-time recording/);
 assert.match(src,/Stop recording/);
 assert.match(src,/Delete device usage history/);
 assert.match(src,/not proof of cheating/);
});
