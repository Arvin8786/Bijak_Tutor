import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PICTURE_SUBTRACTION,VOCAB_CARDS,HIJAIYAH,makeMathOptions,matchOptions,makeHijaiyahOptions} from '../src/miniActivities.js';
test('All visual subtraction stories contain logical results and answer choices',()=>{
 assert.ok(PICTURE_SUBTRACTION.length>=8);
 for(const q of PICTURE_SUBTRACTION){assert.ok(q.start>=q.removed&&q.removed>0&&q.start<=20);assert.equal(makeMathOptions(q).length,3);assert.ok(makeMathOptions(q).includes(q.start-q.removed))}
});
test('Picture matching activities have unique correct vocabulary in both languages',()=>{
 assert.ok(VOCAB_CARDS.length>=12);
 for(const key of ['ms','en'])for(let i=0;i<VOCAB_CARDS.length;i++){
  const o=matchOptions(VOCAB_CARDS,i,key);
  assert.ok(o.includes(VOCAB_CARDS[i][key]));
  assert.equal(new Set(o).size,o.length);
  assert.ok(o.length===3);
 }
});
test('28 Arabic Hijaiyah letters each have unambiguous recognition options',()=>{
 assert.equal(HIJAIYAH.length,28);
 const chars=HIJAIYAH.map(x=>x[0]);
 assert.equal(new Set(chars).size,28);
 for(let i=0;i<28;i++){
  const o=makeHijaiyahOptions(i);
  assert.ok(o.includes(HIJAIYAH[i][0]));
  assert.equal(new Set(o).size,o.length);
  assert.equal(o.length,4);
 }
});
test('activity playground is directly navigable and uses touch-tracing module',()=>{
 const app=fs.readFileSync('src/main.jsx','utf8');
 const arcade=fs.readFileSync('src/ActivityArcade.jsx','utf8');
 assert.match(app,/aria-label="Activity Playground"/);
 assert.match(app,/page==='arcade'&&<ActivityArcade/);
 assert.match(arcade,/DrawingPad/);
 assert.match(arcade,/aria-live="polite"/);
 assert.match(arcade,/aria-label="Picture clue"/);
});
