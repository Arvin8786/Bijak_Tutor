import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {LESSONS} from '../src/lessons.js';
import {questionBank, selectPractice} from '../src/practiceBank.js';
import {buildWordSearch, LIFE_CYCLES} from '../src/extendedPracticeData.js';
import {checkAccountAccessBrowser} from './account-access-browser.mjs';

// Serve the unchanged production bundle at a project URL, as GitHub Pages does.
const projectPath='/Bijak_Tutor/';
const base='http://127.0.0.1:4173'+projectPath;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--base',projectPath,'--host','127.0.0.1','--port','4173','--strictPort'],{stdio:['ignore','ignore','inherit']});
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
  const response=await page.goto(base,{waitUntil:'networkidle'});
  assert.ok(response?.ok(),`Production page did not load at ${base}`);
  assert.equal(new URL(page.url()).pathname,projectPath,'Expected the GitHub Pages project path');
  const welcome=page.locator('.welcome-gate');
  await welcome.getByRole('button',{name:/English/i}).click();
  await welcome.getByRole('button',{name:/Continue/i}).click();
  if(width===375){
    const motion=page.getByRole('button',{name:'Background animation',exact:true});
    await motion.click();
    assert.equal(await motion.getAttribute('aria-pressed'),'false');
    assert.equal(await page.locator('.scene-cloud').first().evaluate(node=>getComputedStyle(node).animationName),'none');
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await motion.getAttribute('aria-pressed'),'false','Calm mode should persist across reopening');
    await motion.click();
    assert.equal(await motion.getAttribute('aria-pressed'),'true');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>document.documentElement.dataset.motion==='off');
    assert.equal(await motion.isEnabled(),false,'Device reduced-motion setting must be respected');
    assert.equal(await page.locator('.scene-cloud').first().evaluate(node=>getComputedStyle(node).animationName),'none');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.waitForFunction(()=>document.documentElement.dataset.motion==='on');
    assert.equal(await page.locator('.playful-scene').getAttribute('aria-hidden'),'true');
  }

  if(width===375){
   await page.getByRole('button',{name:'🧮 Open Maths Studio',exact:true}).click();
   const studio=page.locator('.maths-studio');
   const set=selectPractice(questionBank(LESSONS,1,'SK','Matematik'),5,'maths-studio-1-all-0');
   await studio.getByRole('button',{name:'Start maths practice',exact:true}).click();
   for(let i=0;i<set.length;i++){
    const question=set[i];
    await studio.getByRole('heading',{name:question.text,exact:true}).waitFor();
    if(question.options?.length)await studio.getByRole('button',{name:String(question.answer),exact:true}).click();
    else await studio.getByLabel('Your maths answer').fill(String(question.answer));
    await studio.getByRole('button',{name:'Check maths answer',exact:true}).click();
    await studio.getByRole('status').filter({hasText:'Correct'}).waitFor();
    await studio.getByRole('button',{name:i===set.length-1?'Finish maths session':'Next maths question',exact:true}).click();
   }
   await studio.getByRole('heading',{name:'Session complete 🎉',exact:true}).waitFor();
   await studio.getByRole('button',{name:'Choose another topic',exact:true}).click();
   await studio.getByRole('button',{name:'Session history (1)',exact:true}).click();
   await studio.getByText(/5\/5/).waitFor();
   await page.locator('nav.nav').getByRole('button',{name:'Home',exact:true}).click();
  }
  await page.getByRole('heading',{name:/Choose a subject/i}).waitFor();
  assert.equal(await page.getByRole('button',{name:/Explore local demo/i}).count(),0,'Public showcase must not show demo gate');
  const pair=page.locator('.home-mascot-band');
  await pair.locator('.mascot-boy').click();
  assert.ok(await pair.locator('.mascot-speech').isVisible(),'The schoolboy should greet when tapped');
  await pair.locator('.mascot-girl').click();
  assert.ok((await pair.locator('.mascot-speech').textContent()).includes('Hello'),'The schoolgirl should greet when tapped');

  await page.getByRole('heading',{name:/Choose a subject/i}).waitFor();
  const badgeOverflow=await page.locator('.playful-subjects .subject-picker').evaluateAll(cards=>cards.some(card=>{const badge=card.querySelector('.ready-dot,.catalog-dot');if(!badge)return false;const r=badge.getBoundingClientRect(),p=card.getBoundingClientRect();return r.right>p.right+2||r.left<p.left-2||badge.scrollWidth>badge.clientWidth+2||getComputedStyle(badge).fontSize.replace('px','')>13}));
  assert.equal(badgeOverflow,false,'Subject badges clip or use giant text at '+width+'px');
  const subjectCard=page.getByRole('button',{name:/Matematik.*Open book/i});
  const pageControls=page.getByRole('navigation',{name:'Page navigation'});
  await subjectCard.click();
  const subjectPage=page.locator('.subject-page');
  await subjectPage.getByRole('heading',{name:'Matematik',exact:true}).waitFor();
  await subjectPage.getByLabel('Find a lesson').fill('pasangan rahsia');
  await subjectPage.getByRole('button',{name:/Pasangan rahsia/}).click();
  await page.locator('.lesson-reader').waitFor();
  assert.ok((await page.locator('.study-steps .study-step').count())>=1,'Study steps not displayed');
  await page.getByRole('tab',{name:/Try the quiz/}).click();
  assert.ok(await page.locator('.colour-quiz').isVisible());
  await pageControls.getByRole('button',{name:'Back',exact:true}).click();
  await subjectPage.getByRole('heading',{name:'Matematik',exact:true}).waitFor();
  assert.equal(await subjectPage.getByLabel('Find a lesson').inputValue(),'pasangan rahsia');
  await pageControls.getByRole('button',{name:'Back',exact:true}).click();
  await subjectCard.waitFor();
  await page.waitForFunction(()=>document.activeElement?.id==='subject-math');
  await subjectCard.click();
  await pageControls.getByRole('button',{name:'Go to Home',exact:true}).click();
  await page.getByRole('heading',{name:/Choose a subject/i}).waitFor();
  await page.getByRole('button',{name:/Learning map/i}).click();
  await page.locator('.curriculum-map').waitFor();
  const year=page.locator('.curriculum-map select').nth(1);
  await year.selectOption('3');
  const lessonCount=await page.locator('.curriculum-map .illustrated-lesson').count();
  assert.ok(lessonCount>=8,'Year 3 Maths has fewer than eight genuine study topics');
  await page.locator('.curriculum-map .illustrated-lesson').first().click();
  await page.locator('.lesson-reader').waitFor();
  assert.ok((await page.locator('.lesson-reader h1').textContent()).length>2);
  if(width===1280){await pageControls.getByRole('button',{name:'Back',exact:true}).click();for(const stream of ['SK','SJKC','SJKT']){await page.locator('.curriculum-map select').first().selectOption(stream);for(let y=1;y<=6;y++){await page.locator('.curriculum-map select').nth(1).selectOption(String(y));await page.locator('.curriculum-map select').nth(2).selectOption('Matematik');const cards=page.locator('.curriculum-map .illustrated-lesson');assert.ok(await cards.count()>0,stream+' year '+y+' has no lessons');await cards.first().click();await page.locator('.lesson-reader').waitFor();await pageControls.getByRole('button',{name:'Back',exact:true}).click()}}}
  if(width===1280){
    // Audit real selected subject/year lesson cards rather than only checking source data.
    await page.locator('nav.nav').getByRole('button',{name:/Learning map/i}).click();
    await page.locator('.curriculum-map select').first().selectOption('SK');
    await page.locator('.curriculum-map select').nth(1).selectOption('1');
    for(const subject of ['Bahasa Melayu','Bahasa Inggeris','Sains','Pendidikan Islam','Pendidikan Moral','Pendidikan Seni Visual','Pendidikan Muzik']){
      await page.locator('.curriculum-map select').nth(2).selectOption(subject);
      assert.ok(await page.locator('.curriculum-map .illustrated-lesson').count()>=8,subject+' Year 1 still displays one or two lessons');
    }
    await page.locator('.curriculum-map select').nth(2).selectOption('Sains');
    await page.locator('.curriculum-map .illustrated-lesson').filter({hasText:'Deria manusia'}).last().click();
    await page.locator('.discovery-mission').waitFor();
    await page.locator('.discovery-mission textarea').fill('I learned that I can use my nose to notice different smells.');
    await page.locator('.discovery-mission').getByRole('button',{name:/Get reflection tips/i}).click();
    assert.match(await page.locator('.discovery-feedback').textContent(),/compare your idea/i);
    await page.locator('nav.nav').getByRole('button',{name:/Preschool/i}).click();
    await page.locator('.early-mode-grid').getByRole('button',{name:/Trace & draw/i}).click();
    const draw=page.locator('.trace-studio .trace-canvas');
    const bounds=await draw.boundingBox();
    assert.ok(bounds,'Finger tracing canvas missing');
    await page.mouse.move(bounds.x+bounds.width*.35,bounds.y+bounds.height*.2);
    await page.mouse.down();
    for(let i=0;i<=15;i++)await page.mouse.move(bounds.x+bounds.width*(.35+.3*i/15),bounds.y+bounds.height*(.2+.65*i/15));
    await page.mouse.up();
    await page.getByRole('button',{name:/Check my drawing/i}).click();
    assert.ok(await page.locator('.trace-feedback').isVisible(),'Drawing review does not appear');
    assert.match(await page.locator('.trace-feedback').textContent(),/stroke|movement/i);
    await page.getByRole('button',{name:/Try again/i}).first().click();
  }
  if(width===1280){
    await page.locator('nav.nav').getByRole('button',{name:'Home'}).click();
    await page.getByRole('checkbox',{name:/Remember practice on this device/i}).check();
    await page.locator('details summary').first().click();
    await page.getByLabel('Fictional nickname').fill('Test Fox');
    await page.locator('form.form select').first().selectOption('3');
    await page.getByRole('button',{name:'Add practice profile'}).click();
    await page.getByRole('button',{name:/Test Fox/}).waitFor();
    await page.reload({waitUntil:'networkidle'});
    await page.getByRole('heading',{name:/Choose a subject/i}).waitFor();
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
  if(width===1280){
    await page.getByRole('button',{name:'Learning map'}).click();
    await page.locator('.curriculum-map select').nth(1).selectOption('1');
    await page.locator('nav.nav').getByRole('button',{name:'Practice Arena'}).click();
    const arena=page.locator('.practice-arena');
    const bank=questionBank(LESSONS,1,'SK','Matematik');
    const testDay='2026-11-10';
    await page.clock.setFixedTime(new Date(testDay+'T12:00:00Z'));
    const dailyQuestions=selectPractice(bank,10,'1-SK-Matematik-'+testDay);
    await arena.getByRole('combobox').selectOption('Matematik');
    await arena.getByRole('button',{name:'Daily Challenge'}).click();
    const firstPrompt=await arena.locator('.practice-stage h2').textContent();
    for(let i=0;i<10;i++){
      const prompt=await arena.locator('.practice-stage h2').textContent();
      const question=dailyQuestions[i];
      assert.equal(prompt,question.text,'Daily challenge shows the expected question');
      const options=arena.locator('.practice-options');
      if(await options.count()) await options.getByRole('button',{name:String(question.answer),exact:true}).click();
      else await arena.locator('input').fill(String(question.answer));
      await arena.getByRole('button',{name:'Check answer',exact:true}).click();
      await arena.locator('.practice-feedback.correct').waitFor();
      await arena.getByRole('button',{name:/Next question|Finish practice/}).click();
    }
    await arena.locator('.practice-finish').filter({hasText:'10 out of 10'}).waitFor();
    await arena.getByRole('button',{name:'Retry today’s challenge'}).click();
    assert.equal(await arena.locator('.practice-stage h2').textContent(),firstPrompt);
    const missedQuestion=dailyQuestions[0];
    assert.ok(missedQuestion.lessonId,'Review regression needs a lesson-linked question');
    await arena.getByRole('button',{name:String(missedQuestion.options.find(value=>value!==missedQuestion.answer)),exact:true}).click();
    await arena.getByRole('button',{name:'Check answer',exact:true}).click();
    await arena.locator('.practice-feedback.retry').waitFor();
    await page.locator('nav.nav').getByRole('button',{name:'Home',exact:true}).click();
    await page.locator('.continue-learning').getByRole('button',{name:'Review missed questions'}).click();
    const review=page.locator('.review-questions li').filter({hasText:missedQuestion.text});
    await review.getByRole('button',{name:'Retry this question'}).click();
    await page.locator('.colour-quiz').getByRole('button',{name:String(missedQuestion.answer),exact:true}).click();
    await page.getByRole('button',{name:'Check my answer'}).click();
    await page.locator('.colour-quiz .feedback.good').waitFor();
    await pageControls.getByRole('button',{name:'Back',exact:true}).click();
    assert.equal(await review.count(),0,'Corrected Arena answer must leave the missed-question queue');

    await page.getByRole('button',{name:'Learning map'}).click();
    const library=page.locator('.curriculum-map');
    await library.getByLabel('Find a lesson').fill('no matching lesson');
    await library.getByText('No matching lessons.').waitFor();
    await library.getByRole('button',{name:'Clear filters'}).click();
    await library.getByLabel('Find a lesson').fill('melengkapkan sepuluh');
    assert.equal(await library.locator('.illustrated-lesson').count(),1);
    await library.locator('.illustrated-lesson').click();
    await page.getByRole('heading',{name:'Tambah dengan melengkapkan sepuluh'}).waitFor();
    await page.getByRole('tab',{name:/Try the quiz/}).click();
    await page.locator('.colour-quiz').getByRole('button',{name:'12',exact:true}).click();
    await page.getByRole('button',{name:'Check my answer'}).click();
    await page.locator('.feedback.gentle').waitFor();
    await page.getByRole('button',{name:'Try with guidance'}).click();
    await page.locator('.colour-quiz').getByRole('button',{name:'13',exact:true}).click();
    await page.getByRole('button',{name:'Check my answer'}).click();
    await page.locator('.feedback.good').waitFor();
    await page.getByRole('button',{name:/Next question/}).click();
    await page.getByRole('textbox',{name:'Your answer'}).fill('１４');
    await page.getByRole('button',{name:'Check my answer'}).click();
    await page.locator('.feedback.good').waitFor();
  }
  if(width===1280){
    await page.getByRole('button',{name:'Learning map'}).click();
    const library=page.locator('.curriculum-map');
    await library.locator('.subject-mind-map summary').click();
    const subjectMap=library.getByRole('region',{name:'Mind map for Matematik'});
    const numbers=subjectMap.getByRole('button',{name:'Nombor'});
    await numbers.click();
    assert.equal(await numbers.getAttribute('aria-expanded'),'true');
    await subjectMap.getByText(/Tunjukkan dua cara membuat 10/).waitFor();
    await subjectMap.getByRole('button',{name:'Ukuran'}).click();
    assert.equal(await numbers.getAttribute('aria-expanded'),'false');

    await library.getByLabel('Find a lesson').fill('pasangan rahsia');
    await library.locator('.illustrated-lesson').click();
    const lesson=page.locator('.lesson-reader');
    await lesson.getByRole('heading',{name:'Pasangan rahsia untuk membuat 10'}).waitFor();
    const quick=lesson.getByRole('region',{name:'Quick lesson challenge'});
    await quick.getByRole('button',{name:'2',exact:true}).click();
    await quick.getByRole('status').filter({hasText:'Good try'}).waitFor();
    await quick.getByRole('button',{name:'3',exact:true}).click();
    await quick.getByRole('status').filter({hasText:'7 + 3 = 10'}).waitFor();
    await quick.getByRole('button',{name:'Try again'}).click();
    await quick.getByRole('status').waitFor({state:'hidden'});

    const notes=lesson.getByRole('tab',{name:/Study content/});
    await notes.focus();
    await notes.press('ArrowRight');
    assert.equal(await lesson.getByRole('tab',{name:/Mind map/}).getAttribute('aria-selected'),'true');
    await lesson.getByRole('button',{name:'Contoh',exact:true}).click();
    await lesson.getByText(/Jika 6 petak sudah diisi/).waitFor();
  }
  if(width===375){
    await page.locator('nav.nav').getByRole('button',{name:'Home'}).click();
    await page.getByRole('button',{name:'Interactive Modules'}).click();
    const modules=page.locator('.discovery-library');
    await modules.getByRole('heading',{name:/Interactive Modules/}).waitFor();
    assert.equal(await modules.getByRole('button').count(),20);
    await modules.getByRole('button',{name:/Pasar mini/}).click();
    const activity=page.getByRole('region',{name:'Interactive lesson activity'});
    await activity.getByRole('button',{name:'20 sen',exact:true}).click();
    await activity.getByRole('status').filter({hasText:'Try again'}).waitFor();
    for(const value of ['10 sen','20 sen','30 sen']) {
      await activity.getByRole('button',{name:value,exact:true}).click();
    }
    await activity.getByRole('status').filter({hasText:'Finished!'}).waitFor();
    await activity.getByRole('button',{name:'Start again'}).click();
    await activity.getByRole('status').filter({hasText:'0 / 3'}).waitFor();
    await page.getByRole('tab',{name:/Try the quiz/}).click();
    await page.locator('.colour-quiz').getByRole('textbox').fill('25');
    await page.getByRole('button',{name:'Check my answer'}).click();
    await page.locator('.colour-quiz .feedback.good').waitFor();

    await pageControls.getByRole('button',{name:'Back',exact:true}).click();
    await modules.getByRole('button',{name:/Diari percambahan kacang/}).click();
    await activity.getByRole('button',{name:'Pucuk dapat dilihat'}).click();
    await activity.getByRole('status').filter({hasText:'Try again'}).waitFor();
    for(const step of ['Biji belum bercambah','Akar mula kelihatan','Pucuk dapat dilihat']) {
      await activity.getByRole('button',{name:step,exact:true}).click();
    }
    await activity.getByRole('status').filter({hasText:'Finished!'}).waitFor();
  }
  if(width===375){
    await pageControls.getByRole('button',{name:'Go to Home',exact:true}).click();
    const continueLearning=page.locator('.continue-learning');
    await continueLearning.getByRole('button',{name:/Resume Diari percambahan/}).click();
    await page.locator('.lesson-reader').getByRole('heading',{name:'Diari percambahan kacang'}).waitFor();
    await pageControls.getByRole('button',{name:'Go to Home',exact:true}).click();
    await continueLearning.getByRole('button',{name:'Explore learning paths'}).click();
    const paths=page.locator('.learning-paths');
    const addition=paths.locator('.journey-path').filter({hasText:'Addition Lab'});
    await addition.getByRole('button',{name:'Open Addition Lab'}).click();
    const lab=page.locator('.practice-lab');
    const first=lab.getByRole('slider',{name:'First group size'});
    const second=lab.getByRole('slider',{name:'Second group size'});
    for(let i=0;i<3;i++)await first.press('ArrowRight');
    for(let i=0;i<2;i++)await second.press('ArrowRight');
    await lab.getByRole('spinbutton',{name:'How many altogether?'}).fill('7');
    await lab.getByRole('button',{name:'Check my work'}).click();
    await lab.getByRole('status').filter({hasText:'4 counters plus 3 counters make 7'}).waitFor();
    await pageControls.getByRole('button',{name:'Back',exact:true}).click();
    await addition.getByRole('button',{name:'Take the path quiz'}).click();
    await page.locator('.colour-quiz').getByRole('button',{name:'11',exact:true}).click();
    await page.getByRole('button',{name:'Check my answer'}).click();
    await page.locator('.colour-quiz .feedback.gentle').waitFor();
    await pageControls.getByRole('button',{name:'Go to Home',exact:true}).click();
    await continueLearning.getByRole('button',{name:'Review missed questions'}).click();
    const wrong=page.locator('.review-questions li').filter({hasText:'7 + 6 = ?'});
    await wrong.getByRole('button',{name:'Retry this question'}).click();
    await page.locator('.colour-quiz').getByRole('button',{name:'13',exact:true}).click();
    await page.getByRole('button',{name:'Check my answer'}).click();
    await page.locator('.colour-quiz .feedback.good').waitFor();
    await pageControls.getByRole('button',{name:'Back',exact:true}).click();
    assert.equal(await wrong.count(),0);

    await pageControls.getByRole('button',{name:'Go to Home',exact:true}).click();
    await continueLearning.getByRole('button',{name:'Explore learning paths'}).click();
    await paths.getByRole('button',{name:'Open Clock Lab'}).click();
    for(let i=0;i<7;i++)await lab.getByRole('button',{name:'+5 minutes',exact:true}).click();
    await lab.getByRole('button',{name:'Check my work'}).click();
    await lab.getByRole('status').filter({hasText:'20 minutes past 9'}).waitFor();
    await pageControls.getByRole('button',{name:'Back',exact:true}).click();
    await paths.getByRole('button',{name:'Open Fraction Lab'}).click();
    await lab.getByRole('combobox',{name:'Equal parts'}).selectOption('8');
    for(let i=0;i<6;i++)await lab.getByRole('slider').press('ArrowRight');
    await lab.getByRole('button',{name:'Check my work'}).click();
    await lab.getByRole('status').filter({hasText:'three quarters'}).waitFor();
    await pageControls.getByRole('button',{name:'Back',exact:true}).click();
    await paths.getByRole('button',{name:'Open Shadow Lab'}).click();
    await lab.getByRole('button',{name:'Larger',exact:true}).click();
    await lab.getByRole('button',{name:'Run the model'}).click();
    await lab.getByRole('status').filter({hasText:'Your prediction matched'}).waitFor();
  }
  await page.locator('nav.nav').getByRole('button',{name:/Study Buddy/i}).click();
  await page.getByLabel('What would you like to learn?').fill('28 + 15');
  await page.getByRole('button',{name:/Explain to me/i}).click();
  await page.getByRole('heading',{name:/28 \+ 15 = 43/}).waitFor();
  assert.ok(await page.getByRole('button',{name:/Read answer/i}).isVisible());
  if(width===375){
    await page.getByLabel('What would you like to learn?').fill('(2 + 3) × 4');
    await page.getByRole('button',{name:/Explain to me/i}).click();
    await page.getByRole('heading',{name:'(2 + 3) × 4 = 20'}).waitFor();
    await page.getByLabel('What would you like to learn?').fill('1 ÷ 3');
    await page.getByRole('button',{name:/Explain to me/i}).click();
    await page.locator('.tutor-answer h2').filter({hasText:'≈'}).waitFor();
  }
  if(width===1280){
    await page.locator('nav.nav').getByRole('button',{name:'Activity Playground'}).click();
    await page.locator('.activity-arcade').waitFor();
    await page.locator('.arcade-modes').getByRole('button',{name:/Picture subtraction/i}).click();
    assert.ok(await page.locator('.arcade-counter span').count()>0);
    await page.locator('.arcade-answers').getByRole('button',{name:'5',exact:true}).click();
    await page.getByRole('button',{name:/Next activity/i}).click();
    await page.locator('.arcade-modes').getByRole('button',{name:/Read & Match/i}).click();
    assert.ok(await page.locator('.arcade-answers button').count()===3);
    await page.locator('.arcade-modes').getByRole('button',{name:/Picture dictionary/i}).click();
    assert.ok(await page.locator('.arcade-vocab button').count()===2);
    await page.locator('.arcade-modes').getByRole('button',{name:/Huruf Hijaiyah/i}).click();
    assert.equal(await page.locator('.arcade-answers button').count(),4);
    await page.getByRole('button',{name:/Trace letter/i}).click();
    assert.ok(await page.locator('.arcade-arabic-pad canvas').isVisible());
    // Every additional activity must be a real, openable game, not an inert menu card.
    const extraActivities=[
      ['Picture addition','.extra-expression'],['Count & Compare','.extra-counting'],
      ['Alphabet Sounds','.extra-pictured'],['Suku Kata','.extra-answer-grid'],
      ['Spelling Builder','.extra-spell-tiles'],['Word Search','.extra-word-grid'],
      ['Life Cycles','.extra-life-steps'],['Body Parts','.extra-pictured'],
      ['People at Work','.extra-pictured'],['Weather Lab','.extra-pictured'],
      ['Shape Explorer','.extra-pictured'],['Patterns & Logic','.extra-pattern'],
      ['Picture Puzzle','.extra-jigsaw'],['Make & Create','.extra-craft-steps'],
      ['Creative Sketchbook','.sketch-studio canvas']
    ];
    for(const [name,selector] of extraActivities){
      await page.locator('.arcade-modes').getByRole('button',{name:new RegExp(name,'i')}).click();
      assert.ok(await page.locator(selector).isVisible(),'Activity unavailable: '+name);
      await page.getByRole('button',{name:/Next activity/i}).click();
      assert.match(await page.locator('.arcade-meta').textContent(),/Activity 2/);
    }
    await page.locator('.arcade-modes').getByRole('button',{name:/Picture addition/}).click();
    await page.getByLabel('Practice difficulty').selectOption('3');
    assert.ok(await page.locator('.extra-expression').textContent(),'Level 3 addition is missing');
    await page.locator('.extra-answer-grid button').first().click();
    assert.ok(await page.locator('.extra-feedback').isVisible(),'Math activity did not give feedback');
    const arcade=page.locator('.activity-arcade');
    const game=name=>arcade.locator('.arcade-modes').getByRole('button',{name});
    await game(/Count & Compare/).click();
    await arcade.getByLabel('Practice difficulty').selectOption('1');
    await arcade.getByRole('button',{name:/Next activity/}).click();
    await arcade.locator('.extra-answer-grid').getByRole('button',{name:'Stars',exact:true}).click();
    await arcade.locator('.extra-feedback.success').waitFor();

    await game(/Spelling Builder/).click();
    const tiles=arcade.locator('.extra-spell-tiles');
    for(const letter of 'PAPLE') await tiles.getByRole('button',{name:letter,exact:true}).first().click();
    await arcade.locator('.extra-note').filter({hasText:'not quite right'}).waitFor();
    await arcade.getByRole('button',{name:/Reset/}).click();
    await arcade.locator('.extra-note').filter({hasText:'not quite right'}).waitFor({state:'hidden'});
    for(const letter of 'APPLE') await tiles.getByRole('button',{name:letter,exact:true}).first().click();
    await arcade.locator('.extra-note').filter({hasText:'Correct spelling'}).waitFor();

    await game(/Word Search/).click();
    const {terms,grid}=buildWordSearch(0);
    for(const term of terms){
      const row=grid.findIndex(letters=>letters.join('').includes(term));
      const start=grid[row].join('').indexOf(term);
      for(let offset=0;offset<term.length;offset++) await arcade.getByRole('button',{name:`Row ${row+1} column ${start+offset+1} letter ${term[offset]}`,exact:true}).click();
    }
    await arcade.locator('.extra-note').filter({hasText:'5 of 5 words found'}).waitFor();

    await game(/Life Cycles/).click();
    const stages=arcade.locator('.extra-answer-grid');
    await stages.getByRole('button',{name:/Adult chicken/}).click();
    await arcade.locator('.extra-note').filter({hasText:'stage that comes next'}).waitFor();
    for(const [name,emoji] of LIFE_CYCLES[0].steps) await stages.getByRole('button',{name:`${emoji} ${name}`,exact:true}).click();
    await arcade.locator('.extra-fact').filter({hasText:'starting the life cycle again'}).waitFor();

    await game(/Picture Puzzle/).click();
    for(const piece of [1,2,2,4,3,4]) await arcade.getByRole('button',{name:`Piece ${piece}`,exact:true}).click();
    await arcade.locator('.extra-note').filter({hasText:'Picture complete'}).waitFor();
    assert.match(await arcade.locator('.arcade-meta').textContent(),/stars earned/);
    await page.locator('nav.nav').getByRole('button',{name:'Word Tiles versus Bot'}).click();
    await page.locator('.word-bot-game').waitFor();
    const rack=page.locator('.word-bot-rack button');
    assert.equal(await rack.count(),6,'Word tile rack missing');
    for(const tile of ['S','T','O','N','E']){
      await rack.filter({hasText:tile}).first().click();
    }
    await page.getByRole('button',{name:/Play word/i}).click();
    await page.locator('.word-bot-plays').waitFor();
    assert.ok(await page.locator('.word-bot-plays>div').count()>=1);
    await page.locator('nav.nav').getByRole('button',{name:'Adults Page'}).click();
    await page.getByRole('heading',{name:'Adult Learning Studio'}).waitFor();
    assert.equal(await page.locator('.growth-lessons button').count(),6,'Adult Learn AI topics missing');
    await page.locator('.growth-answers button').first().click();
    await page.locator('.growth-actions').getByRole('button',{name:/Check answer/i}).click();
    await page.locator('.growth-feedback.correct').waitFor();
    await page.locator('nav.nav').getByRole('button',{name:'Creative Hobbies'}).click();
    await page.getByRole('heading',{name:'Adult Learning Studio'}).waitFor();
    const days=page.locator('.growth-week button');
    assert.equal(await days.count(),7,'Seven-day adult hobby planner missing');
    await days.first().click();
    assert.equal(await days.first().getAttribute('aria-pressed'),'true');
    await page.locator('nav.nav').getByRole('button',{name:'Learn AI'}).click();
    await page.locator('.growth-prompt-form input').first().fill('Write a friendly welcome message');
    assert.match(await page.locator('.growth-prompt-output').textContent(),/friendly welcome message/);
    await page.locator('nav.nav').getByRole('button',{name:'Junior Lab'}).click();
    await page.getByRole('heading',{name:'Junior Discovery Lab'}).waitFor();
    await page.locator('.growth-module.growth-hobby').click();
    assert.equal(await page.locator('.growth-week button').count(),7,'Junior hobby track missing');
    assert.match(await page.locator('.proease-footer').textContent(),/ProEase Studio/);
  }
  await page.locator('nav.nav').getByRole('button',{name:'Home'}).click();
  assert.equal(exceptions.length,0,'JS runtime error: '+exceptions.join('; '));
  const over=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
  assert.equal(over,false,'Horizontal overflow at '+width+'px');
  await page.close();
  console.log('Passed browser flows at '+width+'px');
 }
 // A fresh install must open the compiled app offline without a second online navigation.
 const offlineContext=await browser.newContext();
 const offlinePage=await offlineContext.newPage();
 await offlinePage.goto(base);
 await offlinePage.locator('.welcome-gate').getByRole('button',{name:'Teruskan'}).click();
 await offlinePage.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
 await offlineContext.setOffline(true);
 await offlinePage.reload();
 await offlinePage.getByRole('button',{name:/Matematik.*Buka buku/i}).click();
 await offlinePage.locator('.subject-page').getByRole('heading',{name:'Matematik',exact:true}).waitFor();
 await offlinePage.getByRole('button',{name:'Kembali',exact:true}).click();
 await offlinePage.getByRole('heading',{name:/Pilih mata pelajaran/i}).waitFor();
 await offlineContext.close();
 await checkAccountAccessBrowser(browser, base);
 console.log('Passed pending, approval, blocking, restoration and revoked-session browser flows.');
 console.log('Browser smoke tests passed: existing Junior features, Adult Learn AI, Junior/Adult Creative Hobbies, ProEase attribution and mobile widths.');
}finally{if(browser)await browser.close();server.kill('SIGTERM')}
