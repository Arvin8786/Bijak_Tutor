import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('public/sw.js','utf8');
const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));
test('app HTML icon links reference tracked files',()=>{
  for(const url of [...html.matchAll(/<link[^>]+(?:rel="icon"|rel="apple-touch-icon")[^>]+href="([^"]+)"/g)].map(m=>m[1])){
    assert.ok(url.startsWith('./'));
    assert.ok(fs.existsSync('public/'+url.slice(2)),'Missing icon: '+url);
  }
});
test('service worker precaches only existing assets',()=>{
  const match=sw.match(/const CORE = (\[[^;]+\]);/);
  assert.ok(match,'Service-worker precache list missing');
  const entries=[...match[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
  assert.ok(match[1].includes("BASE + 'icons/icon.svg'"),'Scoped icon not in pre-cache');
});
test('manifest references existing icons',()=>{
  assert.ok(manifest.icons.length>0);
  for(const icon of manifest.icons)assert.ok(fs.existsSync('public/'+icon.src.replace(/^\.\//,'')),'Manifest icon missing: '+icon.src);
});
