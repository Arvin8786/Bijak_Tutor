import assert from 'node:assert/strict';
export async function checkOwnerRolesBrowser(browser,base){
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('https://accounts.google.com/gsi/client',r=>r.fulfill({status:200,contentType:'application/javascript',body:''}));
  let savedExamAnswer=false;
  await page.route('https://script.google.com/macros/s/**/exec',async route=>{
   const post=route.request().postDataJSON();
   assert.equal(post.method,'mockExamRequest');
   const [credential,action,input]=post.args;
   const completed={id:'exam-browser',title:'Mathematics · Year 1',year:1,total:1,finished:true,score:1,answered:1,endsAt:1700003600000};
   let value;
   if(action==='results'){
    assert.equal(credential.role,'parent');
    assert.equal(input.childId,'owner-child');
    value=[completed];
   }else{
    assert.equal(credential.role,'student');
    if(action==='catalog')value={papers:[{id:'1-maths',title:'Mathematics',year:1}],active:null,completed:[]};
    if(action==='start')value={...completed,finished:false,serverNow:completed.endsAt-5000,questions:[{prompt:'What is 3 + 2?',options:['5','7']}],answers:{}};
    if(action==='save'){assert.equal(input.answer,'0');savedExamAnswer=true;value={saved:true};}
    if(action==='state'){
     assert.equal(savedExamAnswer,true);
     value={...completed,review:[{prompt:'What is 3 + 2?',answer:'5',submitted:'5',correct:true}]};
    }
   }
   await route.fulfill({status:200,headers:{'access-control-allow-origin':'*'},json:{ok:true,value}});
  });
  await page.addInitScript(()=>{
   window.BIJAKLEARN_PORTAL_VERSION=2;window.BIJAKLEARN_GOOGLE_CLIENT_ID='test';localStorage.setItem('bijaklearn:ui-language:v1','en');let callback;
   const child={id:'owner-child',name:'My learner',year:1,school:'SK',language:'en'};window.ownerRequests=[];
   function invoke(method,credential,...args){
    const role=method==='getPortalBootstrap'?args[0]:credential.role;
    if(method!=='getPortalBootstrap'&&(credential.idToken!=='same-owner-google-token'||!['admin','parent','student'].includes(role)))throw Error('Missing owner role session');
    window.ownerRequests.push({method,role,scoped:typeof credential==='object'});
    if(method==='getPortalBootstrap')return {role:role.toUpperCase(),ownerRoleAccess:true,user:{name:'Owner'},parent:role==='parent'?{name:'Owner',email:'owner@test.invalid'}:null,children:role==='student'?[child]:[],lessons:[],modules:[],canManageAccounts:role==='admin',access:{active:true,plan:'PREMIUM'}};
    if(method==='getAdministrationOverview'&&role==='admin')return {settings:{clientIdConfigured:true},children:1,reportedSeconds7Days:0,parents:[],modules:[],payments:[]};
    if(method==='getParentDashboard'&&role==='parent')return {parent:{name:'Owner',email:'owner@test.invalid'},access:{plan:'FREE'},children:[{...child,attempts:0,correct:0,mastered:0,reportedSeconds:0,dailyUsage:[],recent:[]}],enrolments:[],feedback:[]};
    if(method==='authorizeModule'&&role==='student'){
     if(args[0]==='maths-studio')return {allowed:false,plan:'PREMIUM',reason:'learner',title:'Maths Studio'};
     return {allowed:true,plan:'PREMIUM',title:args[0]};
    }
    if(method==='recordStudentUsage'&&role==='student')return {recorded:true,seconds:0};
    if(method==='getVideoLibrary'&&role==='student')throw Error('Unsupported account request');
    if(method==='getEducationalVideos'&&role==='student')return [];
    throw Error('Unexpected request '+method+' in '+role+' role');
   }
   window.google={accounts:{id:{initialize(o){callback=o.callback},renderButton(el){const b=document.createElement('button');b.textContent='Use my Google account';b.onclick=()=>callback({credential:'same-owner-google-token'});el.append(b)}}},script:{run:{withSuccessHandler(ok){return {withFailureHandler:fail=>new Proxy({},{get:(_,method)=>(...args)=>{try{ok(invoke(method,...args))}catch(e){fail(e)}}})}}}}};
  });
  await page.goto(base);await page.getByRole('heading',{name:'Welcome back',exact:true}).waitFor();
  const signInLayout=await page.locator('.signin-tabs').evaluate(el=>getComputedStyle(el).display);
  assert.equal(signInLayout,'grid','the published sign-in theme must load');
  const background=selector=>page.locator(selector).evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.equal(await background('.signin-form'),'rgb(255, 253, 248)','sign-in form surface');
  await page.waitForFunction(()=>document.querySelector('.signin-brandbar img')?.naturalWidth>0);
  assert.equal(await background('.signin-programmes'),'rgb(34, 42, 80)','programme panel surface');
  for(const [choice,role,heading] of [['BijakLearn Team','admin','Overview & usage'],['Parent sign-in','parent','Child reports'],['Student sign-in','student','Your learning profile']]){
   await page.getByRole('button',{name:choice,exact:true}).click();await page.getByRole('button',{name:'Use my Google account',exact:true}).click();
   await page.getByRole('heading',{name:heading,exact:true}).waitFor();
   if(role==='parent'){
    await page.getByText('No tests yet',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Mock exam results',exact:true}).click();
    await page.getByText('Mathematics · Year 1 · 1/1',{exact:true}).waitFor();
   }
   if(role==='student'){
    assert.equal(await page.locator('.portal-shell').count(),0);
    assert.equal(await background('.app .hero'),'rgb(34, 42, 80)','learner header surface');
    assert.equal(await page.locator('.app').evaluate(el=>getComputedStyle(el).display),'grid','learner desktop sidebar theme');
    await page.locator('nav.nav').getByRole('button',{name:'Maths Studio',exact:true}).click();
    await page.getByText('Maths Studio is restricted for this learner profile.',{exact:true}).waitFor();
    assert.equal(await page.getByRole('button',{name:'View membership options',exact:true}).count(),0);
    await page.locator('nav.nav').getByRole('button',{name:'Science Lab',exact:true}).click();await page.locator('.science-lab').waitFor();
    await page.locator('nav.nav').getByRole('button',{name:'Learning Videos',exact:true}).click();await page.getByText('No videos have been added yet. Please check again soon!',{exact:true}).waitFor();
    assert.equal(await page.locator('.video-page').evaluate(el=>getComputedStyle(el).display),'grid','video styles must be loaded');
    assert.equal(await page.getByRole('button',{name:'Publish video',exact:true}).count(),0);
    await page.getByRole('button',{name:'Year-end mock exams',exact:true}).click();
    await page.getByLabel('Subject',{exact:true}).selectOption('1-maths');
    await page.getByRole('button',{name:'Start one-hour exam',exact:true}).click();
    await page.getByRole('radio',{name:'5',exact:true}).check();
    await page.getByRole('button',{name:'Save answer',exact:true}).click();
    await page.getByText('Answer saved',{exact:true}).waitFor();
    await page.getByText('1 / 1',{exact:true}).waitFor();
    await page.getByRole('heading',{name:'What is 3 + 2?',exact:true}).waitFor();
   }else {
    assert.equal(await page.locator('nav.nav').count(),0);
    assert.match(await page.locator('.portal-welcome').evaluate(el=>getComputedStyle(el).backgroundImage),role==='admin'?/rgb\(53, 71, 128\)/:/rgb\(36, 95, 87\)/,'role-specific header colors');
    if(role==='admin'){
     assert.match(await page.locator('.portal-header').evaluate(el=>getComputedStyle(el).backgroundImage),/rgb\(32, 46, 88\)/,'classic team header');
     await page.setViewportSize({width:390,height:850});
     const nav=page.getByRole('navigation',{name:'BijakLearn Team navigation'});
     const layout=await nav.evaluate(el=>({display:getComputedStyle(el).display,columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,overflow:el.scrollWidth>el.clientWidth}));
     assert.deepEqual(layout,{display:'grid',columns:3,overflow:false},'all administrator sections fit the classic mobile menu');
     if(process.env.BIJAK_SCREENSHOT_DIR)await page.screenshot({path:process.env.BIJAK_SCREENSHOT_DIR+'/classic-admin-mobile.png',fullPage:true,animations:'disabled'});
     await page.setViewportSize({width:1280,height:900});
    }else assert.equal(await background('.portal-header'),'rgb(22, 66, 61)','parent header theme');
   }
   if(role==='student'){
    await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
    await page.getByText('Sign in again to reopen your account.',{exact:true}).waitFor();
   }else await page.getByRole('button',{name:'Sign out',exact:true}).click();
   await page.getByRole('heading',{name:'Welcome back',exact:true}).waitFor();
  }
  const requests=await page.evaluate(()=>window.ownerRequests);
  for(const method of ['getAdministrationOverview','getParentDashboard','authorizeModule','getVideoLibrary','getEducationalVideos'])assert.ok(requests.some(r=>r.method===method&&r.scoped),method+' must retain the selected server role');
  assert.deepEqual(errors,[]);
 }finally{await page.close()}
 console.log('Passed one-owner Google identity across real team, parent and student interfaces.');
}
