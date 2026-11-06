import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {GROWTH_TRACKS,findGrowthTrack,trackQuiz} from '../src/growthCurriculum.js';

test('Learn AI and Creative Hobbies have functional, age-appropriate lesson tracks for Junior and Adults',()=>{
 assert.equal(GROWTH_TRACKS.length,4);
 for(const audience of ['junior','adult'])for(const kind of ['ai','hobby']){
  const t=findGrowthTrack(audience,kind);
  assert.ok(t, audience+' '+kind+' missing');
  assert.equal(t.lessons.length,6);
  assert.equal(new Set(t.lessons.map(l=>l.id)).size,t.lessons.length);
  for(const lesson of t.lessons){
   assert.ok(lesson.title.length>5&&lesson.summary.length>25);
   assert.equal(lesson.steps.length,3);
   assert.ok(lesson.challenge.length>10);
   assert.equal(lesson.quiz.options.length,3);
   assert.ok(lesson.quiz.answer>=0&&lesson.quiz.answer<3);
   assert.equal(trackQuiz(lesson,lesson.quiz.answer),true);
   assert.equal(trackQuiz(lesson,(lesson.quiz.answer+1)%3),false);
  }
 }
});
test('Adult AI content includes privacy, verification, automation and copyright',()=>{
 const texts=findGrowthTrack('adult','ai').lessons.map(l=>l.title+' '+l.summary+' '+l.steps.join(' ')).join(' ').toLowerCase();
 for(const term of ['confidential','verify','automation','copyright'])assert.ok(texts.includes(term),term);
});
test('Junior hobby lessons include adult-supervised physical safety',()=>{
 const texts=findGrowthTrack('junior','hobby').lessons.map(l=>l.steps.join(' ')+' '+l.challenge).join(' ').toLowerCase();
 assert.match(texts,/adult/);assert.match(texts,/safe/);
});
test('ProEase Studio trademark and both hubs are displayed, without registered-mark claim',()=>{
 const app=fs.readFileSync('src/main.jsx','utf8'),hub=fs.readFileSync('src/GrowthHub.jsx','utf8');
 assert.match(app,/ProEase Studio™/);
 assert.match(hub,/Junior Discovery Lab/);
 assert.match(hub,/Adult Learning Studio/);
 assert.match(app,/aria-label="Adults Page"/);
 assert.match(app,/aria-label="Learn AI"/);
 assert.match(app,/aria-label="Creative Hobbies"/);
 assert.ok(!app.includes('ProEase Studio®'));
});
test('PWA publishes immutable release metadata and checks foreground updates',()=>{
 const pack=fs.readFileSync('package.json','utf8'),client=fs.readFileSync('src/main.jsx','utf8');
 const sw=fs.readFileSync('public/sw.js','utf8'),build=fs.readFileSync('scripts/stamp-release.mjs','utf8');
 assert.match(pack,/stamp-release\.mjs/);
 assert.match(client,/release\.json\?check=/);
 assert.match(client,/visibilitychange/);
 assert.match(client,/serviceWorker\.register/);
 assert.match(sw,/fetch\(req,\{cache:'no-store'\}\)/);
 assert.match(sw,/startsWith\('\/private\/'\)/);
 assert.match(build,/dist\/release\.json/);
});
test('Private module service validates entitlement and redacts correct answers',()=>{
 const code=fs.readFileSync('apps-script/ModuleService.gs','utf8');
 assert.match(code,/withAuth_\(token/);
 assert.match(code,/access_\(user\)/);
 assert.match(code,/function checkGrowthAnswer/);
 assert.match(code,/question:String\(quiz\.question/);
 assert.ok(!code.includes("quiz:quiz&&typeof quiz==='object'?quiz:null"));
});
