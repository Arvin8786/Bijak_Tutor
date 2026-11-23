import assert from 'node:assert/strict';
export async function checkOwnerRolesBrowser(browser,base){
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('https://accounts.google.com/gsi/client',r=>r.fulfill({status:200,contentType:'application/javascript',body:''}));
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
    if(method==='authorizeModule'&&role==='student')return {allowed:true,plan:'PREMIUM',title:args[0]};
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
  assert.equal(await background('.signin-form'),'rgb(255, 253, 247)','paper sign-in form');
  assert.equal(await page.locator('.book-abacus span').count(),3);
  for(const [choice,role,heading] of [['BijakLearn Team','admin','Overview & usage'],['Parent sign-in','parent','Child reports'],['Student sign-in','student','Your learning profile']]){
   await page.getByRole('button',{name:choice,exact:true}).click();await page.getByRole('button',{name:'Use my Google account',exact:true}).click();
   await page.getByRole('heading',{name:heading,exact:true}).waitFor();
   if(role==='parent')await page.getByText('No tests yet',{exact:true}).waitFor();
   if(role==='student'){
    assert.equal(await page.locator('.portal-shell').count(),0);
    assert.equal(await background('.app .hero'),'rgb(22, 78, 70)','learner book cover');
    assert.equal(await page.locator('.app').evaluate(el=>getComputedStyle(el).display),'grid','learner desktop sidebar theme');
    await page.locator('nav.nav').getByRole('button',{name:'Science Lab',exact:true}).click();await page.locator('.science-lab').waitFor();
    await page.locator('nav.nav').getByRole('button',{name:'Learning Videos',exact:true}).click();await page.getByText('No videos have been added yet. Please check again soon!',{exact:true}).waitFor();
    assert.equal(await page.locator('.video-page').evaluate(el=>getComputedStyle(el).display),'grid','video styles must be loaded');
    assert.equal(await page.getByRole('button',{name:'Publish video',exact:true}).count(),0);
   }else {
    assert.equal(await page.locator('nav.nav').count(),0);
    assert.equal(await background('.portal-welcome'),role==='admin'?'rgb(89, 66, 105)':'rgb(24, 87, 78)','role-specific cover');
    assert.match(await page.locator('.portal-header').evaluate(el=>getComputedStyle(el).backgroundImage),/gradient/,'family and team header theme');
   }
   await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('heading',{name:'Welcome back',exact:true}).waitFor();
  }
  const requests=await page.evaluate(()=>window.ownerRequests);
  for(const method of ['getAdministrationOverview','getParentDashboard','authorizeModule','getVideoLibrary','getEducationalVideos'])assert.ok(requests.some(r=>r.method===method&&r.scoped),method+' must retain the selected server role');
  assert.deepEqual(errors,[]);
 }finally{await page.close()}
 console.log('Passed one-owner Google identity across real team, parent and student interfaces.');
}
