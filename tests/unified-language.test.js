import test from 'node:test';
import assert from 'node:assert/strict';
import {LANGUAGES,UI_COPY,say} from '../src/localization.js';
import {LAB_COPY} from '../src/labCopy.js';
import {SHELL_COPY} from '../src/shellCopy.js';
import {OBJECTS,LIQUIDS,DISCOVERY_GOALS} from '../src/labModels.js';
import {PLACES} from '../src/mathGuide.js';

const placeholders=text=>[...String(text).matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join(',');

for(const [name,copy] of [['lab',LAB_COPY],['shell',SHELL_COPY]]){
 test(name+' text exists in every language with the same keys and placeholders',()=>{
  const base=copy.en;
  for(const {code} of LANGUAGES){
   assert.deepEqual(Object.keys(copy[code]).sort(),Object.keys(base).sort(),code+' keys differ from English');
   for(const [key,value] of Object.entries(copy[code])){
    assert.ok(String(value).trim().length>0,code+':'+key+' is empty');
    assert.equal(placeholders(value),placeholders(base[key]),code+':'+key+' placeholders differ');
   }
  }
 });
}
test('Malay, Chinese and Tamil are really translated, not copied from English',()=>{
 for(const code of ['ms','zh','ta'])for(const key of ['sciTitle','mathTitle','checkWork','g_forgot_carry','heroTitle','science','maths']){
  assert.notEqual(say(code,key),say('en',key),code+':'+key);
 }
});
test('every object, liquid, discovery, place and diagnosis the interface can show has text',()=>{
 const needed=[...Object.keys(OBJECTS).map(k=>'o_'+k),...Object.keys(LIQUIDS).map(k=>'l_'+k),...DISCOVERY_GOALS.map(k=>'dn_'+k),...PLACES.map(k=>'pl_'+k),
  ...['start','thriving','growing','pale_leggy','wilting','rotting','scorched','struggling','dead'].map(k=>'obs_'+k),
  ...['thriving','growing','pale_leggy','wilting','rotting','scorched','struggling','dead'].map(k=>'why_'+k),
  ...['forgot_carry','smaller_from_larger','forgot_borrow','wrong_operation','swapped','place_value','forgot_shift','off_by_one','close','try_again','empty','not_a_number','correct'].map(k=>'g_'+k),
  ...['stepAdd','stepCarryDown','stepSub','stepSubBorrow','stepMulPart','stepSumParts','stepDivGroups','stepDivCheck'].map(k=>'s_'+k),
  ...['ok','no_battery','broken_wire','switch_open'].map(k=>'circuit_'+k)];
 for(const {code} of LANGUAGES)for(const key of needed)assert.ok(UI_COPY[code][key],code+' is missing '+key);
});
test('say fills placeholders and falls back safely',()=>{
 assert.equal(say('en','dayLabel',{n:5}),'Day 5');
 assert.equal(say('zh','dayLabel',{n:5}),'第 5 天');
 assert.equal(say('xx','home'),UI_COPY.ms.home);
 assert.equal(say('en','no-such-key'),'no-such-key');
 assert.equal(say('en','dayLabel'),'Day {n}');
});
