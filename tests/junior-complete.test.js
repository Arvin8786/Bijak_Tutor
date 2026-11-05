import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LESSONS} from '../src/lessons.js';
import {JUNIOR_FOUNDATION_LESSONS} from '../src/juniorFoundation.js';
import {JUNIOR_ENRICHMENT_LESSONS} from '../src/juniorEnrichment.js';
import {JUNIOR_STREAM_LESSONS} from '../src/juniorStreams.js';
import {availableSubjects} from '../src/primarySubjects.js';
import {ALPHABET,EARLY_WORDS,BM_SYLLABLES,getLetterTask} from '../src/preschoolData.js';

const NEW=[...JUNIOR_FOUNDATION_LESSONS,...JUNIOR_ENRICHMENT_LESSONS,...JUNIOR_STREAM_LESSONS];

test('New Junior lessons have unique IDs and remain within Tahun 1–6',()=>{
 const ids=LESSONS.map(l=>l.id);
 assert.equal(new Set(ids).size,ids.length,'duplicate lesson IDs');
 assert.ok(NEW.length>=140,'expanded library missing');
 for(const l of NEW){
  assert.ok(Number.isInteger(l.year)&&l.year>=1&&l.year<=6,l.id+' invalid year');
  assert.ok(l.title&&l.subject&&l.summary&&l.visual,l.id+' incomplete study content');
  assert.ok(Array.isArray(l.steps)&&l.steps.length>=3,l.id+' missing learning steps');
  assert.ok(Array.isArray(l.mind)&&l.mind.length>=3,l.id+' missing mind map');
 }
});

test('All authored Junior lessons have multiple practice items with explanations',()=>{
 for(const l of NEW){
  const integrated=LESSONS.find(x=>x.id===l.id);
  assert.ok(integrated,l.id+' not registered');
  assert.ok(integrated.check.length>=5,l.id+' needs additional practices');
  const qIds=integrated.check.map(q=>q.id);
  assert.equal(new Set(qIds).size,qIds.length,l.id+' duplicate practice IDs');
  for(const q of integrated.check)assert.ok(q.text&&q.answer!==undefined&&q.why,l.id+' missing response or feedback');
 }
});

test('Every primary year has maths, BM, English and science study content',()=>{
 for(let y=1;y<=6;y++)for(const s of ['Matematik','Bahasa Melayu','Bahasa Inggeris','Sains'])
  assert.ok(LESSONS.some(l=>l.year===y&&l.subject===s),s+' absent in Tahun '+y);
});

test('Maths practice increases in content and level across Years 2–6',()=>{
 for(let y=2;y<=6;y++){
  const math=LESSONS.filter(l=>l.year===y&&l.subject==='Matematik');
  assert.ok(math.length>=2);
  assert.ok(math.every(l=>l.check.length>=5));
  assert.ok(math.some(l=>l.check.some(q=>q.mode==='text')));
 }
});

test('All three school streams and primary year combinations have a subject catalogue',()=>{
 for(const s of ['SK','SJKC','SJKT'])for(let y=1;y<=6;y++)assert.ok(availableSubjects(s,y).length>=7);
 assert.equal(availableSubjects('SK',7).length,0);
});

test('Preschool ABC, picture words and syllable library are complete',()=>{
 assert.equal(ALPHABET.length,26);assert.equal(new Set(ALPHABET).size,26);
 assert.equal(EARLY_WORDS.length,26);assert.ok(BM_SYLLABLES.length>=12);
 for(let i=0;i<26;i++){
  const task=getLetterTask(i);
  assert.equal(task.letter,ALPHABET[i]);
  assert.equal(task.lower,ALPHABET[i].toLowerCase());
  assert.ok(task.word.startsWith(task.letter));
 }
});

test('Preschool tracing and spelling interactions are present, and UI hides technical storage',()=>{
 const app=fs.readFileSync('src/main.jsx','utf8');
 const preschool=fs.readFileSync('src/PreschoolStudio.jsx','utf8');
 assert.ok(app.includes('<PreschoolStudio/>'));
 assert.ok(app.includes("setPage('preschool')"));
 assert.ok(!app.includes('Google Sheets'),'avoid database implementation details in student-facing app');
 assert.ok(preschool.includes('DrawingPad'));
 for(const name of ['letters','trace','match','spell','bm','numbers','colors'])assert.ok(preschool.includes(`mode==='${name}'`));
});

test('Cards are equal-height and long headings wrap on mobile',()=>{
 const css=fs.readFileSync('src/layout-fixes.css','utf8');
 assert.ok(css.includes('grid-auto-rows:1fr'));
 assert.ok(css.includes('overflow-wrap:anywhere'));
 assert.ok(css.includes('.subject-picker'));
 assert.ok(css.includes('.illustrated-lesson'));
});
