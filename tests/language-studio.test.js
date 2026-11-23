import assert from 'node:assert/strict';
import {test} from 'node:test';
import {languages} from '../src/languageCourses.js';
import {greetingPronunciation,phraseUnits} from '../src/languagePhrases.js';

test('all four language courses contain 100 translated daily phrases',()=>{
 assert.equal(phraseUnits.length,10);
 assert.equal(greetingPronunciation.length,10);
 for(const {rows} of phraseUnits){
  assert.equal(rows.length,10);
  for(const row of rows){
   assert.equal(row.length,languages.length+1);
   assert.ok(row.every(value=>value.trim()));
  }
 }
 assert.equal(new Set(phraseUnits.flatMap(({rows})=>rows.map(row=>row[0]))).size,100);
});
test('writing models and beginner words have distinct prompts and sound guides',()=>{
 assert.deepEqual(languages.map(language=>language.symbols.length),[24,37,92,31]);
 for(const language of languages){
  assert.equal(new Set(language.symbols.map(([symbol])=>symbol)).size,language.symbols.length);
  assert.ok(language.symbols.every(([symbol,hint])=>symbol&&hint));
  assert.equal(language.wordList.length,12);
  assert.ok(language.wordList.every(([word,guide,meaning])=>word&&guide&&meaning));
 }
});
