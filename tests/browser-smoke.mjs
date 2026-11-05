import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';

const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4173','--strictPort'],{stdio:'pipe'});
const base='http://127.0.0.1:4173/';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let browser;
try{
 let up=false;
 for(let i=0;i<65;i++){if(server.exitCode!==null)throw Error('Vite exited');try{const r=await fetch(base);if(r.ok){up=true;break}}catch{}await wait(300)}
 if(!up)throw Error('Vite failed to start');
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of [375,768,1280]){
  const page=await browser.newPage({viewport:{width,height:850}});
  const exceptions=[];
  page.on('pageerror',e=>exceptions.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:/Explore local demo/i}).click();
  await page.getByRole('heading',{name:/Choose your learning adventure/i}).waitFor();
  let cards=page.locator('.illustrated-lesson');
  assert.ok(await cards.count()>0,'Default year has no lessons');
  await cards.first().click();
  await page.locator('.lesson-reader').waitFor();
  assert.ok((await page.locator('.study-steps .study-step').count())>=1,'Study steps not displayed');
  await page.getByRole('tab',{name:/Try the quiz/}).click();
  assert.ok(await page.locator('.colour-quiz').isVisible());
  await page.getByRole('button',{name:/Back to subjects/i}).click();
  await page.getByRole('button',{name:/Learning map/i}).click();
  await page.locator('.curriculum-map').waitFor();
  const year=page.locator('.curriculum-map select').nth(1);
  await year.selectOption('3');
  const lessonCount=await page.locator('.curriculum-map .illustrated-lesson').count();
  assert.ok(lessonCount>=1,'Year 3 lesson cards missing');
  await page.locator('.curriculum-map .illustrated-lesson').first().click();
  await page.locator('.lesson-reader').waitFor();
  assert.ok((await page.locator('.lesson-reader h1').textContent()).length>2);
  if(width===1280){await page.getByRole('button',{name:/Learning map/i}).click();for(const stream of ['SK','SJKC','SJKT']){await page.locator('.curriculum-map select').first().selectOption(stream);for(let y=1;y<=6;y++){await page.locator('.curriculum-map select').nth(1).selectOption(String(y));await page.locator('.curriculum-map select').nth(2).selectOption('Matematik');const cards=page.locator('.curriculum-map .illustrated-lesson');assert.ok(await cards.count()>0,stream+' year '+y+' has no lessons');await cards.first().click();await page.locator('.lesson-reader').waitFor();await page.getByRole('button',{name:/Back to subjects/i}).click();await page.getByRole('button',{name:/Learning map/i}).click()}}}
  assert.equal(exceptions.length,0,'JS runtime error: '+exceptions.join('; '));
  const over=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
  assert.equal(over,false,'Horizontal overflow at '+width+'px');
  await page.close();
 }
 console.log('Browser smoke tests passed: lesson cards, map, quiz, years 1 & 3 and mobile widths.');
}finally{if(browser)await browser.close();server.kill('SIGTERM')}
