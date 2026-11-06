import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PICTURE_SUBTRACTION,VOCAB_CARDS,HIJAIYAH,makeMathOptions,matchOptions} from '../src/miniActivities.js';
import {BODY_PARTS,JOBS,WEATHER,LIFE_CYCLES,PHONICS,SYLLABLE_WORDS,SHAPES,CRAFTS,SEQUENCE_PATTERNS,WORDSEARCH_WORDS,arithmeticChallenge,getPattern,buildWordSearch} from '../src/extendedPracticeData.js';

test('practice bank is substantially expanded beyond the starter examples',()=>{
 assert.equal(PICTURE_SUBTRACTION.length,80);
 assert.ok(VOCAB_CARDS.length>=50);
 assert.equal(HIJAIYAH.length,28);
 assert.equal(PHONICS.length,26);
 assert.ok(SYLLABLE_WORDS.length>=24);
 assert.ok(BODY_PARTS.length>=12);
 assert.ok(JOBS.length>=15);
 assert.ok(WEATHER.length>=10);
 assert.ok(LIFE_CYCLES.length>=5);
 assert.ok(SHAPES.length>=8);
 assert.ok(CRAFTS.length>=10);
 assert.ok(SEQUENCE_PATTERNS.length>=12);
 assert.ok(WORDSEARCH_WORDS.length>=8);
});
test('all 80 picture-subtraction exercises have correct, selectable answers',()=>{
 for(const p of PICTURE_SUBTRACTION){
  assert.ok(p.start>p.removed&&p.start<=20);
  const options=makeMathOptions(p);
  assert.equal(options.length,3);
  assert.ok(options.includes(p.start-p.removed));
 }
});
test('picture dictionary has distinct choices for every Malay and English word',()=>{
 for(const lang of ['ms','en'])for(let i=0;i<VOCAB_CARDS.length;i++){
  const opts=matchOptions(VOCAB_CARDS,i,lang);
  assert.equal(opts.length,3);
  assert.ok(opts.includes(VOCAB_CARDS[i][lang]));
  assert.equal(new Set(opts).size,3);
 }
});
test('generated arithmetic is repeatable and always includes exact answer across levels',()=>{
 for(const level of [1,2,3])for(const i of Array.from({length:80},(_,i)=>i)){
  const q=arithmeticChallenge(i,level,'add');
  assert.equal(q.answer,q.first+q.second);
  assert.equal(q.options.length,3);
  assert.ok(q.options.includes(q.answer));
 }
});
test('word search puts every word as an actual consecutive horizontal sequence',()=>{
 for(let i=0;i<WORDSEARCH_WORDS.length;i++){
  const {terms,grid}=buildWordSearch(i);
  assert.equal(grid.length,9);
  for(const word of terms)assert.ok(grid.some(row=>row.join('').includes(word)),word+' missing from puzzle '+i);
 }
});
test('cycle stage sets and matching word levels have non-empty unique educational contents',()=>{
 for(const cycle of LIFE_CYCLES){
  assert.ok(cycle.steps.length>=4);
  assert.ok(new Set(cycle.steps.map(x=>x[0])).size>=cycle.steps.length);
 }
 for(const q of SYLLABLE_WORDS)assert.equal(q[1]+q[2],q[0]);
 for(const p of PHONICS)assert.equal(p[1][0].toUpperCase(),p[0]);
 for(let i=0;i<SEQUENCE_PATTERNS.length;i++)assert.ok(getPattern(i).shown.length>=2);
});
test('18 gameplay choices are integrated and use touch-friendly components',()=>{
 const arcade=fs.readFileSync('src/ActivityArcade.jsx','utf8'),extra=fs.readFileSync('src/ExtraPractice.jsx','utf8');
 const css=fs.readFileSync('src/extra-practice.css','utf8');
 assert.match(arcade,/\.\.\.EXTRA_MODES/);
 assert.match(arcade,/EXTRA_MODES\.some/);
 for(const mode of ['add','count','phonics','syllables','spell','wordsearch','life','body','jobs','weather','shapes','patterns','jigsaw','craft'])assert.match(extra,new RegExp("['\"]"+mode+"['\"]"));
 assert.match(extra,/aria-label="Word search letters"/);
 assert.match(extra,/role="group"/);
 assert.match(css,/@media\(max-width:440px\)/);
});
