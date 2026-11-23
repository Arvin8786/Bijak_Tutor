import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {WORDS_BY_YEAR} from '../src/pictureDictionary.js';
export async function checkRolePortalsBrowser(browser,base){
 for(const [role,year] of [['ADMIN',2],['PARENT',2],['STUDENT',2],['STUDENT',6]]){
  const page=await browser.newPage({viewport:{width:role==='PARENT'?375:1280,height:900}}),errors=[];
  await page.emulateMedia({reducedMotion:'reduce'});
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://accounts.google.com/gsi/client',route=>route.fulfill({status:200,contentType:'application/javascript',body:'// Google identity is mocked in this test.'}));
  await page.route('https://script.google.com/macros/s/**/exec',route=>route.fulfill({
   headers:{'Access-Control-Allow-Origin':'*'},json:{ok:true,value:{parent:null,children:[]}}
  }));
  await page.addInitScript(({role,year})=>{
   localStorage.setItem('bijaklearn:ui-language:v1','en');window.BIJAKLEARN_PORTAL_VERSION=2;window.BIJAKLEARN_GOOGLE_CLIENT_ID='test';let signIn;
   window.playedWords=[];
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel(){},speak(word){window.playedWords.push([word.text,word.lang]);}}});
   const child={id:'fictional-child',name:'Fictional learner',year,school:'SK',language:'en'};
   const posted=[];
   function invoke(method,...args){
    if(method==='listParentNoticesAdmin')return posted;
    if(method==='publishParentNotice'){posted.push({...args[1],id:'test-notice',published:true});return {id:'test-notice'}}
    if(method==='getParentNotices')return [{id:'test-notice',kind:'Announcement',title:'Holiday schedule',message:'Classes resume on Monday.'}];
    if(method==='updateChildDetails'){Object.assign(child,args[2]);return {ok:true}}
    if(method==='getPortalBootstrap')return {role,user:{name:'Test account'},parent:{name:'Test parent',email:'parent@test.invalid'},canManageAccounts:role==='ADMIN',children:role==='STUDENT'?[child]:[],lessons:[],access:{active:false,plan:'FREE'},modules:[]};
    if(method==='getCommerceAdministration')return {settings:{commissionBps:0,paymentInstructions:'Scan our administrator QR',qrUploadId:''},orders:[],discounts:[],commissions:[],payouts:[],uploadsConfigured:false};
    if(method==='getEducationalVideos')return [];
    if(method==='setEducationalVideos')return args[1];
    if(method==='getAdministrationOverview')return {settings:{clientIdConfigured:true},children:1,reportedSeconds7Days:300,activityEvents:3,parents:[],modules:[],payments:[]};
    if(method==='getParentDashboard')return {parent:{name:'Test parent',email:'parent@test.invalid'},access:{plan:'FREE'},children:[{...child,attempts:4,correct:3,accuracy:75,mastered:1,reportedSeconds:120,dailyUsage:[{date:'2026-11-17',seconds:120}],recent:[]}],enrolments:[],feedback:[]};
    if(['listAccountAccess','listStudentProfiles','listStudentAccounts','listEnrolments','listKasihApplications','listParentFeedback'].includes(method))return [];
    if(method==='authorizeModule'){
     if(role==='STUDENT'&&year===2&&args[1]==='creative-projects')return {allowed:false,plan:'FREE',title:'Creative Projects',reason:'learner'};
     if(role==='STUDENT'&&year===6&&args[1]==='picture-dictionary')return {allowed:false,plan:'FREE',title:'Picture Dictionary',reason:'learner'};
     return {allowed:true,plan:'FREE',title:'Test module'};
    }
    if(method==='getGrowthModule')return {id:'junior-ai',title:'Fictional AI studio',lessons:[1,2].map(n=>({
     id:'topic-'+n,title:'Fictional topic '+n,summary:'A short topic.',steps:['Try one example.'],challenge:'Practise a skill.',
     quiz:{question:'Which option fits?',options:['One','Two'],why:'Use the example.'}
    }))};
    if(method==='checkGrowthAnswer')return {correct:true,why:'Fictional feedback for the earlier topic.'};
    if(method==='recordStudentUsage')return {recorded:true,seconds:0};
    if(method==='submitParentFeedback')return {id:'test-feedback'};
    throw Error('Unexpected mocked request: '+method);
   }
   window.google={accounts:{id:{initialize(options){signIn=options.callback},renderButton(container){const button=document.createElement('button');button.textContent='Test Google account';button.onclick=()=>signIn({credential:'fictional-token'});container.append(button)}}},script:{run:{withSuccessHandler(success){return {withFailureHandler:failure=>new Proxy({},{get:(_,method)=>(...args)=>{const respond=()=>{try{success(invoke(method,...args))}catch(error){failure(error)}};if(method==='getPortalBootstrap')setTimeout(respond,400);else if(method==='checkGrowthAnswer')window.releaseGrowthResult=respond;else respond()}})}}}}};
  },{role,year});
  await page.goto(base,{waitUntil:'networkidle'});

  await page.getByRole('button',{name:'Test Google account',exact:true}).click();
  await page.getByRole('status').filter({hasText:'Signing in…'}).waitFor();
  if(role==='ADMIN')await page.getByRole('heading',{name:'Service settings',exact:true}).waitFor();
  if(role==='PARENT')await page.getByText('75%',{exact:true}).waitFor();
  await page.locator('.bl-brand-icon').waitFor();
  if(role==='PARENT'){const signout=await page.getByRole('button',{name:'Sign out',exact:true}).boundingBox();assert.ok(signout.width>=75&&signout.height<=60,'Parent sign-out must stay readable beside the language selector on phones')}

  assert.ok(await page.locator('.bl-brand-icon').evaluate(img=>img.complete&&img.naturalWidth>0),'Shared app icon must load');
  assert.equal(await page.locator('.bl-brand-icon').count(),1,'Every console must use the shared brand component');
  assert.match(await page.locator(role==='STUDENT'?'.proease-footer':'.portal-footer .brand-credit').innerText(),/ProEase Studio/,'Every console must display ProEase Studio attribution');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Console must fit its viewport');
  if(process.env.BIJAK_SCREENSHOT_DIR){
   await fs.mkdir(process.env.BIJAK_SCREENSHOT_DIR,{recursive:true});
   await page.screenshot({path:process.env.BIJAK_SCREENSHOT_DIR+'/'+role.toLowerCase()+'-'+(role==='PARENT'?'mobile':'desktop')+'.png',fullPage:true});
   if(role==='PARENT'){await page.setViewportSize({width:1280,height:900});await page.screenshot({path:process.env.BIJAK_SCREENSHOT_DIR+'/parent-desktop.png',fullPage:true});await page.setViewportSize({width:375,height:900})}
   if(role==='ADMIN'){await page.setViewportSize({width:375,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:process.env.BIJAK_SCREENSHOT_DIR+'/admin-mobile.png',fullPage:true});await page.setViewportSize({width:1280,height:900})}
  }
  if(role==='ADMIN'){
   await page.getByRole('heading',{name:'Overview & usage',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Science Lab',exact:true}).count(),0);assert.equal(await page.locator('.portal-nav button').count(),10);
   await page.getByRole('button',{name:'Parent feedback',exact:true}).click();await page.getByText('No parent feedback yet.',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Parent notices',exact:true}).click();
   await page.getByLabel('Title',{exact:true}).fill('Holiday schedule');
   await page.getByLabel('Message',{exact:true}).fill('Classes resume on Monday.');
   await page.getByLabel('First display date').fill('2026-11-23');
   await page.getByLabel('Last display date').fill('2026-11-30');
   await page.getByRole('button',{name:'Save and publish'}).click();
   await page.getByText('2026-11-23 to 2026-11-30',{exact:false}).waitFor();
   await page.getByRole('button',{name:'Payment controls',exact:true}).click();await page.getByRole('heading',{name:'Payment controls',exact:true}).waitFor();
  }else if(role==='PARENT'){
   await page.getByRole('heading',{name:'Child reports',exact:true}).waitFor();await page.getByText('75%',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Science Lab',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Access & family links',exact:true}).count(),0);
   const announcement=page.getByRole('complementary',{name:'Parent notices'});
   await announcement.getByRole('heading',{name:'Holiday schedule'}).waitFor();
   await announcement.getByRole('button',{name:'Close'}).click();
   assert.equal(await announcement.count(),0);
   await page.evaluate(()=>window.dispatchEvent(new Event('online')));
   await announcement.getByRole('heading',{name:'Holiday schedule'}).waitFor();
   await announcement.getByRole('button',{name:'Close'}).click();
   const directory=page.getByRole('region',{name:'Linked children'});
   await directory.getByText('Fictional learner',{exact:true}).waitFor();
   await directory.getByText('BijakLearn Junior',{exact:true}).waitFor();
   await directory.getByRole('button',{name:'View progress · Fictional learner',exact:true}).click();
   await page.locator('#child-report-fictional-child').waitFor();
   await directory.getByRole('button',{name:'Edit profile · Fictional learner',exact:true}).click();
   await page.getByLabel('Child nickname',{exact:true}).fill('Updated learner');
   await page.getByRole('button',{name:'Save profile',exact:true}).click();
   await directory.getByText('Updated learner',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Enrol a child',exact:true}).click();await page.getByLabel('Student Google email (optional)',{exact:true}).waitFor();await page.getByText('parent@test.invalid',{exact:true}).waitFor();
   assert.equal(await directory.count(),0,'Only Child reports displays the child directory');
   assert.equal(await page.getByRole('button',{name:'Refresh records',exact:true}).count(),1);
   await page.getByRole('button',{name:'Comments & suggestions',exact:true}).click();await page.getByLabel('Your message',{exact:true}).fill('Fictional suggestion for testing');await page.getByRole('button',{name:'Send to BijakLearn Team',exact:true}).click();await page.getByText('Saved successfully.',{exact:true}).waitFor();
   await page.locator('.portal-language select').selectOption('ta');await page.getByRole('button',{name:'வெளியேறு',exact:true}).waitFor();await page.locator('.portal-language select').selectOption('en');await page.getByRole('button',{name:'Sign out',exact:true}).waitFor();
  }else if(year===2){
   await page.getByRole('heading',{name:/Learn, explore and grow/}).waitFor();
   await page.locator('nav.nav').getByRole('button',{name:'Picture Dictionary',exact:true}).click();
   await page.getByRole('heading',{name:'Picture Dictionary',exact:true}).waitFor();
   await page.setViewportSize({width:375,height:900});
   await page.getByLabel('Learning level',{exact:true}).selectOption('0');
   await page.getByRole('button',{name:'Hear apple',exact:true}).click();
   assert.deepEqual(await page.evaluate(()=>window.playedWords),[['apple','en-GB']]);
   await page.getByLabel('Word language',{exact:true}).selectOption('1');
   await page.getByRole('button',{name:'Hear epal',exact:true}).waitFor();
   await page.getByRole('button',{name:'Word detective',exact:true}).click();
   const clue=await page.locator('.dictionary-clue').innerText();
   const word=WORDS_BY_YEAR[0].find(entry=>entry[5]===clue);
   await page.getByRole('button',{name:word[1],exact:true}).click();
   await page.getByRole('status').filter({hasText:'Correct!'}).waitFor();
   await page.getByLabel('Challenge',{exact:true}).selectOption('audio');
   await page.getByRole('button',{name:'Play the mystery word',exact:false}).waitFor();
   assert.deepEqual(await page.getByLabel('Learning level',{exact:true}).locator('option').evaluateAll(options=>options.map(option=>option.value)),['0','1','2','3']);
   assert.ok(await page.locator('.picture-dictionary').evaluate(root=>root.scrollWidth<=root.clientWidth),'Dictionary stays within a phone viewport');
   await page.getByRole('button',{name:'Open Creative Projects',exact:true}).click();
   await page.getByText('Creative Projects is restricted for this learner profile.',{exact:true}).waitFor();
   assert.equal(await page.locator('.dictionary-project').count(),0);
   await page.setViewportSize({width:1280,height:900});
   await page.locator('nav.nav').getByRole('button',{name:'Learn AI',exact:true}).click();
   await page.getByRole('heading',{name:'Fictional topic 1',exact:true}).waitFor();
   await page.getByRole('button',{name:'One',exact:true}).click();
   await page.getByRole('button',{name:'Check answer',exact:true}).click();
   await page.waitForFunction(()=>typeof window.releaseGrowthResult==='function');
   await page.getByRole('button',{name:/Fictional topic 2/}).click();
   await page.evaluate(()=>window.releaseGrowthResult());
   await page.getByRole('heading',{name:'Fictional topic 2',exact:true}).waitFor();
   assert.equal(await page.getByText('Fictional feedback for the earlier topic.',{exact:true}).count(),0);
   assert.ok(await page.getByRole('button',{name:'One',exact:true}).isEnabled());
   assert.equal(await page.locator('.portal-shell').count(),0);
  }else{
   await page.getByRole('heading',{name:'BijakLearn Junior Plus',exact:true}).waitFor();
   assert.equal(await page.locator('nav.nav').getByRole('button',{name:/Preschool/}).count(),0);
   assert.deepEqual(await page.locator('.library-filters select').nth(1).locator('option').evaluateAll(options=>options.map(option=>option.value)),['4','5','6']);
   await page.locator('nav.nav').getByRole('button',{name:'Creative Projects',exact:true}).click();
   await page.getByRole('heading',{name:'Pitch a cleaner school',exact:true}).waitFor();
   assert.deepEqual(await page.getByLabel('Learning level',{exact:true}).locator('option').evaluateAll(options=>options.map(option=>option.value)),['4','5','6']);
   for(const item of await page.locator('.dictionary-project input[type="checkbox"]').all())await item.check();
   await page.getByRole('status').filter({hasText:'Project complete'}).waitFor();
   await page.getByLabel('Choose a project',{exact:true}).selectOption('bonus');
   await page.getByRole('heading',{name:'Design a message from space',exact:true}).waitFor();
   assert.equal(await page.locator('.dictionary-project input:checked').count(),0);
   assert.equal(await page.getByLabel('Word language',{exact:true}).count(),0);
   await page.getByRole('button',{name:'Open Picture Dictionary',exact:true}).click();
   await page.getByText('Picture Dictionary is restricted for this learner profile.',{exact:true}).waitFor();
   assert.equal(await page.locator('.dictionary-grid').count(),0);
   await page.locator('nav.nav').getByRole('button',{name:'Activity Playground',exact:true}).click();
   await page.locator('.arcade-hero').getByText('BijakLearn Junior Plus · Activity Playground',{exact:true}).waitFor();
   assert.equal(await page.locator('.portal-shell').count(),0);assert.equal(await page.getByRole('button',{name:'Manage account access',exact:true}).count(),0);
  }
  assert.equal(new URL(page.url()).pathname,'/Bijak_Tutor/','Role changes must not navigate away from the app URL');assert.deepEqual(errors,[]);await page.close();
 }
 if(process.env.BIJAK_SCREENSHOT_DIR){
  const iconPage=await browser.newPage({viewport:{width:600,height:600}});
  await iconPage.goto(new URL('icons/app-icon.svg',base).href);
  const svg=iconPage.locator('svg');await svg.waitFor();
  for(const size of [512,192]){await svg.evaluate((node,size)=>{node.setAttribute('width',String(size));node.setAttribute('height',String(size))},size);await svg.screenshot({path:process.env.BIJAK_SCREENSHOT_DIR+'/app-icon-'+size+'.png'})}
  await iconPage.close();
 }

}
