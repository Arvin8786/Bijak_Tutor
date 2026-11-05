import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('manifest is installable and has 192/512 icons',()=>{
const m=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));
assert.equal(m.display,'standalone');assert.equal(m.start_url,'/?source=pwa');
for(const n of [192,512])assert.ok(m.icons.some(i=>i.sizes===`${n}x${n}`));
});
test('service worker avoids caching private network requests',()=>{
const sw=fs.readFileSync('public/sw.js','utf8');
assert.match(sw,/url.origin !== self.location.origin/);
assert.match(sw,/url.pathname.startsWith\('\/api\/\'/);
assert.match(sw,/req.method !== 'GET'/);
});
test('Apps Script bundle remains independently deployable',()=>{assert.ok(fs.existsSync('scripts/package-gas.mjs'));assert.ok(fs.existsSync('apps-script/Code.gs'));});