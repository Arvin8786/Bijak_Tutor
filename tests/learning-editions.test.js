import test from 'node:test';
import assert from 'node:assert/strict';
import {JUNIOR,JUNIOR_PLUS,learningEditionForYear,inLearningEdition} from '../src/learningEditions.js';

test('Preschool and Years 1–3 open Junior, and Years 4–6 open Junior Plus',()=>{
 for(const year of [0,1,2,3])assert.equal(learningEditionForYear(year),JUNIOR);
 for(const year of [4,5,6])assert.equal(learningEditionForYear(String(year)),JUNIOR_PLUS);
 for(const value of [null,undefined,'',false,-1,3.5,7])assert.equal(learningEditionForYear(value),null);
 assert.equal(inLearningEdition(JUNIOR,'4'),false);
 assert.equal(inLearningEdition(JUNIOR_PLUS,3),false);
});
