import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('manifest has a real bundled scalable icon or complete raster sizes',()=>{
 const m=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));
 assert.equal(m.display,'standalone');
 assert.equal(m.start_url,'/?source=pwa');
 const isPresent=i=>i.src.startsWith('/')&&fs.existsSync('public'+i.src);
 const hasRaster=[192,512].every(n=>m.icons.some(i=>i.sizes===n+'x'+n&&isPresent(i)));
 const hasVector=m.icons.some(i=>i.sizes==='any'&&i.type==='image/svg+xml'&&isPresent(i));
 assert.ok(hasRaster||hasVector,'Manifest needs valid bundled icons');
});
test('service worker avoids caching private network requests',()=>{
 const sw=fs.readFileSync('public/sw.js','utf8');
 assert.match(sw,/url.origin !== self.location.origin/);
 assert.ok(sw.includes("url.pathname.startsWith('/api/')"));
 assert.match(sw,/req.method !== 'GET'/);
});
test('Apps Script bundle remains independently deployable',()=>{
 assert.ok(fs.existsSync('scripts/package-gas.mjs'));
 assert.ok(fs.existsSync('apps-script/Code.gs'));
});
