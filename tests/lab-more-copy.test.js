import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {say} from '../src/localization.js';
import {LAB_COPY_MORE} from '../src/labCopyMore.js';
import {MORE_DISCOVERY_GOALS,MORE_TABS} from '../src/labModelsMore.js';

test('extra lab text exists in all four languages with the same keys and placeholders', () => {
  const keys=Object.keys(LAB_COPY_MORE.en);
  for(const code of ['ms','zh','ta']){
    assert.deepEqual(Object.keys(LAB_COPY_MORE[code]),keys,code);
    for(const k of keys){
      assert.ok(LAB_COPY_MORE[code][k].trim(),code+' '+k);
      const ph=s=>(s.match(/\{\w+\}/g)||[]).sort().join();
      assert.equal(ph(LAB_COPY_MORE[code][k]),ph(LAB_COPY_MORE.en[k]),code+' '+k);
    }
  }
});

test('every tab, discovery and observation the screens ask for has a label', () => {
  for(const code of ['en','ms','zh','ta']){
    for(const [,,label] of MORE_TABS)assert.notEqual(say(code,label),label,code+label);
    for(const goal of MORE_DISCOVERY_GOALS)assert.notEqual(say(code,'dn_'+goal),'dn_'+goal,code+goal);
  }
  const dynamic={ice_:['start','frozen','solid','slushy','melted','wrapped'],dis_:['start','fast','slow','settles','cloudy'],see_:['balanced','left','right','unequal','light'],pitch_:['high','mid','low'],col_:['black','red','green','blue','yellow','magenta','cyan','white'],sol_:['sugar','salt','sand','flour']};
  for(const code of ['en','ms','zh','ta'])for(const [prefix,names] of Object.entries(dynamic))for(const n of names)assert.notEqual(say(code,prefix+n),prefix+n,code+prefix+n);
  const src=fs.readFileSync(new URL('../src/LabMore.jsx',import.meta.url),'utf8');
  const used=new Set([...src.matchAll(/t\('([A-Za-z_]+)'/g)].map(m=>m[1]));
  for(const k of [...used].filter(k=>!k.endsWith('_')))assert.ok(k in LAB_COPY_MORE.en||say('en',k)!==k,'missing copy for '+k);
});

test('the original lab experiments and their texts are untouched', () => {
  assert.equal(say('en','expPlant'),'Plant growth');
  assert.ok(say('ms','expRamp')!=='expRamp');
});
