import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('public site requires the login gate and limits demo access to explicit builds',()=>{
 const src=fs.readFileSync('src/main.jsx','utf8');
 assert.ok(!src.includes("api('getBootstrap','PUBLIC_SHOWCASE')"));
 assert.match(src,/if\(!token\)return <>/);
 assert.match(src,/VITE_ENABLE_DEMO==='true'/);
 assert.match(src,/!isLive&&demoEnabled/);
 assert.match(fs.readFileSync('src/accountTransport.js','utf8'),/VITE_ACCOUNT_APP_URL/);
 assert.match(src,/say\(uiLanguage,'personaliseTitle'\)/);
 assert.match(fs.readFileSync('src/shellCopy.js','utf8'),/personaliseTitle:'Personalise your learning space'/);
 assert.ok(!src.includes('Explore local demo'));
 assert.ok(!src.includes('Testing mode</strong>'));
});

test('guest visitors are not represented as authenticated parents or premium members',()=>{
 const src=fs.readFileSync('src/main.jsx','utf8');
 assert.match(src,/name:'Guest',email:''/);
 assert.match(src,/access:\{active:false,plan:'FREE'\}/);
 assert.match(src,/isLive&&boot\?\.role!=='STUDENT'&&<NavButton[^>]*onClick=\{\(\)=>setPage\('pin'\)\}/);
 assert.match(fs.readFileSync('src/MembershipPage.jsx','utf8'),/Family account enrolment and paid memberships are not active/);
});

test('showcase clearly identifies supplementary learning and does not claim certified assessment',()=>{
 const src=fs.readFileSync('src/main.jsx','utf8')+fs.readFileSync('src/shellCopy.js','utf8');
 assert.match(src,/supplementary learning/i);
 assert.match(src,/not a certified school assessment/i);
 assert.match(src,/Please do not enter a real child’s name or private details/);
});
