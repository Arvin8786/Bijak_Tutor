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
  await page.getByRole('heading',{name:/Welcome to BijakLearn Junior/i}).waitFor({timeout:10000}).catch(()=>{});
  const welcome=page.locator('.welcome-gate');
  if(await welcome.isVisible()){
   await welcome.getByRole('button',{name:/English/i}).click();
   await welcome.getByRole('button',{name:/Continue/i}).click();
  }

  await page.getByRole('heading',{name:/Choose your learning adventure/i}).waitFor();
  assert.equal(await page.getByRole('button',{name:/Explore local demo/i}).count(),0,'Public showcase must not show demo gate');
  const pair=page.locator('.home-mascot-band');
  await pair.locator('.mascot-boy').click();
  assert.ok(await pair.locator('.mascot-speech').isVisible(),'The schoolboy should greet when tapped');
  await pair.locator('.mascot-girl').click();
  assert.ok((await pair.locator('.mascot-speech').textContent()).includes('Hello'),'The schoolgirl should greet when tapped');

  await page.getByRole('heading',{name:/Choose your learning adventure/i}).waitFor();
  const badgeOverflow=await page.locator('.playful-subjects .subject-picker').evaluateAll(cards=>cards.some(card=>{const badge=card.querySelector('.ready-dot,.catalog-dot');if(!badge)return false;const r=badge.getBoundingClientRect(),p=card.getBoundingClientRect();return r.right>p.right+2||r.left<p.left-2||badge.scrollWidth>badge.clientWidth+2||getComputedStyle(badge).fontSize.replace('px','')>13}));
  assert.equal(badgeOverflow,false,'Subject badges clip or use giant text at '+width+'px');
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
  if(width===1280){
    await page.getByRole('button',{name:/Home/i}).click();
    await page.getByRole('checkbox',{name:/Remember practice on this device/i}).check();
    await page.locator('details summary').first().click();
    await page.getByLabel('Fictional nickname').fill('Test Fox');
    await page.locator('form.form select').first().selectOption('3');
    await page.getByRole('button',{name:'Add practice profile'}).click();
    await page.getByRole('button',{name:/Test Fox/}).waitFor();
    await page.reload({waitUntil:'networkidle'});
    await page.getByRole('heading',{name:/Choose your learning adventure/i}).waitFor();
    await page.getByRole('button',{name:/Test Fox/}).waitFor();
    await page.getByRole('button',{name:/Clear saved practice/i}).click();
    assert.equal(await page.getByRole('button',{name:/Test Fox/}).count(),0,'Clear saved practice failed');
  }
  if(width===1280){
    await page.locator('nav.nav').getByRole('button',{name:/Learning Packs/i}).click();
    await page.getByRole('heading',{name:/Choose your superpower/i}).waitFor();
    const packCards=page.locator('.adventure-card');
    assert.ok(await packCards.count()>=3,'Adventure pack catalogue missing');
    await packCards.first().getByRole('button',{name:/See learning pack/i}).click();
    assert.ok(await packCards.first().locator('.pack-lesson-list button').count()>0);
    await packCards.first().locator('.pack-lesson-list button').first().click();
    await page.locator('.lesson-reader').waitFor();
    await page.getByRole('button',{name:/Membership/i}).click();
    assert.equal(await page.locator('.tier-card').count(),3,'Family access package comparison missing');
    await page.locator('.tier-card').first().getByRole('button',{name:/Explore learning packs/i}).click();
    await page.locator('.adventure-quest .quest-go').click();
    await page.locator('.lesson-reader').waitFor();
  }
  await page.locator('nav.nav').getByRole('button',{name:/Practice Arena/i}).click();
  await page.locator('.practice-arena').waitFor();
  await page.getByRole('button',{name:/Flip Flashcards/i}).click();
  await page.locator('.flip-card').click();
  assert.ok(await page.locator('.flip-card.revealed').isVisible());
  await page.getByRole('button',{name:/Quick Quiz/i}).click();
  assert.ok(await page.locator('.practice-stage h2').isVisible());
  await page.locator('nav.nav').getByRole('button',{name:/Study Buddy/i}).click();
  await page.getByLabel('What would you like to learn?').fill('28 + 15');
  await page.getByRole('button',{name:/Explain to me/i}).click();
  await page.getByRole('heading',{name:/28 \+ 15 = 43/}).waitFor();
  assert.ok(await page.getByRole('button',{name:/Read answer/i}).isVisible());
  await page.getByRole('button',{name:/Home/i}).click();
  assert.equal(exceptions.length,0,'JS runtime error: '+exceptions.join('; '));
  const over=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
  assert.equal(over,false,'Horizontal overflow at '+width+'px');
  await page.close();
 }
 console.log('Browser smoke tests passed: lesson cards, map, quiz, years 1 & 3 and mobile widths.');
}finally{if(browser)await browser.close();server.kill('SIGTERM')}
