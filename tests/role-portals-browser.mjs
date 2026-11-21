import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
export async function checkRolePortalsBrowser(browser,base){
 for(const role of ['ADMIN','PARENT','STUDENT']){
  const page=await browser.newPage({viewport:{width:role==='PARENT'?375:1280,height:900}}),errors=[];
  await page.emulateMedia({reducedMotion:'reduce'});
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://accounts.google.com/gsi/client',route=>route.fulfill({status:200,contentType:'application/javascript',body:'// Google identity is mocked in this test.'}));
await page.addInitScript(role=>{
   localStorage.setItem('bijaklearn:locale','en');window.BIJAKLEARN_PORTAL_VERSION=2;window.BIJAKLEARN_GOOGLE_CLIENT_ID='test';let signIn;
   const child={id:'fictional-child',name:'Fictional learner',year:2,school:'SK',language:'en'};
   function invoke(method,...args){
    if(method==='getPortalBootstrap')return {role,user:{name:'Test account'},parent:{name:'Test parent',email:'parent@test.invalid'},canManageAccounts:role==='ADMIN',children:role==='STUDENT'?[child]:[],lessons:[],access:{active:false,plan:'FREE'},modules:[]};
    if(method==='getCommerceAdministration')return {settings:{commissionBps:0,paymentInstructions:'Scan our administrator QR',qrUploadId:''},orders:[],discounts:[],commissions:[],payouts:[],uploadsConfigured:false};
    if(method==='getAdministrationOverview')return {settings:{clientIdConfigured:true},children:1,reportedSeconds7Days:300,activityEvents:3,parents:[],modules:[],payments:[]};
    if(method==='getParentDashboard')return {parent:{name:'Test parent',email:'parent@test.invalid'},access:{plan:'FREE'},children:[{...child,attempts:4,correct:3,accuracy:75,mastered:1,reportedSeconds:120,dailyUsage:[{date:'2026-11-17',seconds:120}],recent:[]}],enrolments:[],feedback:[]};
    if(['listAccountAccess','listStudentProfiles','listStudentAccounts','listEnrolments','listKasihApplications','listParentFeedback'].includes(method))return [];
    if(method==='authorizeModule')return {allowed:true,plan:'FREE',title:'Test module'};
    if(method==='recordStudentUsage')return {recorded:true,seconds:0};
    if(method==='submitParentFeedback')return {id:'test-feedback'};
    throw Error('Unexpected mocked request: '+method);
   }
   window.google={accounts:{id:{initialize(options){signIn=options.callback},renderButton(container){const button=document.createElement('button');button.textContent='Test Google account';button.onclick=()=>signIn({credential:'fictional-token'});container.append(button)}}},script:{run:{withSuccessHandler(success){return {withFailureHandler:failure=>new Proxy({},{get:(_,method)=>(...args)=>{try{success(invoke(method,...args))}catch(error){failure(error)}}})}}}}};
  },role);
  await page.goto(base,{waitUntil:'networkidle'});
  const welcome=page.locator('.welcome-gate');if(await welcome.count()){await welcome.getByRole('button',{name:'English',exact:true}).click();await welcome.getByRole('button',{name:'Continue',exact:true}).click()}
  await page.getByRole('button',{name:'Test Google account',exact:true}).click();
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
   await page.getByRole('heading',{name:'Overview & usage',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Science Lab',exact:true}).count(),0);assert.equal(await page.locator('.portal-nav button').count(),8);
   await page.getByRole('button',{name:'Parent feedback',exact:true}).click();await page.getByText('No parent feedback yet.',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Payment controls',exact:true}).click();await page.getByRole('heading',{name:'Payment controls',exact:true}).waitFor();
  }else if(role==='PARENT'){
   await page.getByRole('heading',{name:'Child reports',exact:true}).waitFor();await page.getByText('75%',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Science Lab',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Access & family links',exact:true}).count(),0);
   await page.getByRole('button',{name:'Enrol a child',exact:true}).click();await page.getByLabel('Student Google email',{exact:true}).waitFor();await page.getByText('parent@test.invalid',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Comments & suggestions',exact:true}).click();await page.getByLabel('Your message',{exact:true}).fill('Fictional suggestion for testing');await page.getByRole('button',{name:'Send to administrator',exact:true}).click();await page.getByText('Saved successfully.',{exact:true}).waitFor();
   await page.locator('.portal-language select').selectOption('ta');await page.getByRole('button',{name:'வெளியேறு',exact:true}).waitFor();await page.locator('.portal-language select').selectOption('en');await page.getByRole('button',{name:'Sign out',exact:true}).waitFor();
  }else{
   await page.getByRole('heading',{name:/Learn, explore and grow/}).waitFor();assert.equal(await page.locator('.portal-shell').count(),0);assert.equal(await page.getByRole('button',{name:'Manage account access',exact:true}).count(),0);
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
