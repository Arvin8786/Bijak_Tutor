import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('public showcase opens learning dashboard without a sign-in gate',()=>{
 const src=fs.readFileSync('src/main.jsx','utf8');
 assert.match(src,/api\('getBootstrap','PUBLIC_SHOWCASE'\)/);
 assert.match(src,/if\(!token\)return isLive\?/);
 assert.match(src,/Opening your learning adventure/);
 assert.match(src,/Personalise your learning space/);
 assert.ok(!src.includes('Explore local demo'));
 assert.ok(!src.includes('Testing mode</strong>'));
});

test('guest visitors are not represented as authenticated parents or premium members',()=>{
 const src=fs.readFileSync('src/main.jsx','utf8');
 assert.match(src,/name:'Guest',email:''/);
 assert.match(src,/access:\{active:false,plan:'FREE'\}/);
 assert.match(src,/isLive&&<button onClick=\{\(\)=>setPage\('pin'\)/);
 assert.match(src,/Family account enrolment and paid memberships are not active/);
});

test('showcase clearly identifies supplementary learning and does not claim certified assessment',()=>{
 const src=fs.readFileSync('src/main.jsx','utf8');
 assert.match(src,/supplementary learning/i);
 assert.match(src,/not a certified school assessment/i);
 assert.match(src,/Please do not enter a real child’s name or private details/);
});
