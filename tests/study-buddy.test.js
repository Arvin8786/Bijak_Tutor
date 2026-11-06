import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {solveWorkedCalculation,tutorReply,findLessonForQuestion} from '../src/tutorEngine.js';
import {LESSONS} from '../src/lessons.js';

test('Study Buddy shows worked addition and regrouping',()=>{
 const answer=solveWorkedCalculation('Show 28 + 15 step by step');
 assert.equal(answer.answer,'43');
 assert.match(answer.steps.join(' '),/regroup/i);
 assert.match(answer.steps.join(' '),/28/);
});
test('Study Buddy verifies arithmetic inverse and blocks invalid division',()=>{
 assert.equal(solveWorkedCalculation('84 ÷ 4').answer,'21');
 assert.equal(solveWorkedCalculation('9 × 6').answer,'54');
 assert.equal(solveWorkedCalculation('12 − 17').answer,'-5');
 assert.match(solveWorkedCalculation('18 / 0').title,/Division by zero/);
 assert.equal(solveWorkedCalculation('alert(1)'),null);
});
test('Study Buddy retrieves authored concepts, not made-up statements',()=>{
 const example=tutorReply('Please explain kata nama',LESSONS,{year:2});
 assert.equal(example.kind,'lesson');
 assert.ok(example.steps.length>=2);
 assert.ok(LESSONS.some(l=>l.id===example.lessonId));
});
test('Unknown subject yields a transparent fallback',()=>{
 const reply=tutorReply('quantum chromodynamics quark confinement',LESSONS);
 assert.equal(reply.kind,'unknown');
 assert.ok(reply.steps.some(s=>/do not have/i.test(s)));
});
test('Mobile subject cards enforce readable small action badges',()=>{
 const css=fs.readFileSync('src/mobile-tutor.css','utf8');
 assert.match(css,/\.subject\.subject-picker \.ready-dot/);
 assert.match(css,/font-size:10px!important/);
 assert.match(css,/\.nav\{display:grid/);
});
test('Tutor UI supports read-aloud and optional microphone',()=>{
 const component=fs.readFileSync('src/StudyBuddy.jsx','utf8');
 assert.match(component,/SpeechSynthesisUtterance/);
 assert.match(component,/webkitSpeechRecognition/);
 assert.match(component,/onClick=\{listen\}/);
 assert.match(component,/tutorReply/);
});
test('Optional server AI key cannot appear in public frontend bundle',()=>{
 const ai=fs.readFileSync('apps-script/TutorAI.gs','utf8');
 const pkg=fs.readFileSync('scripts/package-gas.mjs','utf8');
 assert.match(ai,/withAuth_\(token/);
 assert.match(ai,/getProperty\('GEMINI_API_KEY'\)/);
 assert.match(ai,/CacheService/);
 assert.match(pkg,/release\/TutorAI\.gs/);
});
