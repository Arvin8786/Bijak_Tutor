import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PORTAL_COPY,PORTAL_LANGUAGES,portalText,readPortalLanguage} from '../src/portalLocale.js';

test('console language defaults to English and only parents get a picker', () => {
  assert.equal(readPortalLanguage(),'en'); // no storage in Node => English
  const source=fs.readFileSync(new URL('../src/RolePortals.jsx',import.meta.url),'utf8');
  assert.match(source,/admin\?'en':readPortalLanguage\(\)/);
  assert.match(source,/\{!admin&&<label className="portal-language"/);
  assert.equal(portalText('en','Child reports'),'Child reports');
});

test('parent dashboard translations cover the same strings in every language', () => {
  const keys=Object.keys(PORTAL_COPY.ms).sort();
  assert.ok(keys.includes("Sign out") && keys.includes("Child reports"));
  for(const [code] of PORTAL_LANGUAGES.filter(l=>l[0]!=='en')){
    assert.deepEqual(Object.keys(PORTAL_COPY[code]).sort(),keys,code);
    for(const key of keys)assert.ok(PORTAL_COPY[code][key].trim(),code+': '+key);
  }
  assert.equal(portalText('ta','Sign out'),'வெளியேறு');
  assert.equal(portalText('ms','Not in dictionary'),'Not in dictionary');
});

test('every translated parent string is really used by the dashboard', () => {
  const source=fs.readFileSync(new URL('../src/RolePortals.jsx',import.meta.url),'utf8');
  const unused=Object.keys(PORTAL_COPY.ms).filter(key=>!source.includes(key.replace(/'/g,"\\'"))&&!source.includes(key));
  assert.deepEqual(unused,[]);
});
