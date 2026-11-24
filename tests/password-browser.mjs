import assert from 'node:assert/strict';

export async function checkPasswordBrowser(browser,base){
 const page=await browser.newPage({viewport:{width:375,height:900}});
 const calls=[];
 let releaseProfile;
 const pendingProfile=new Promise(resolve=>{releaseProfile=resolve});
 page.setDefaultTimeout(10000);
 try{
  await page.route('https://accounts.google.com/gsi/client',route=>route.fulfill({contentType:'application/javascript',body:''}));
  await page.route('https://script.google.com/macros/s/**/exec',async route=>{
   const request=route.request();
   assert.equal(request.method(),'POST');
   assert.match(request.headers()['content-type'],/^text\/plain/);
   const {service,method,args}=JSON.parse(request.postData());
   assert.equal(service,'bijak-account-v1');
   calls.push(method);
   if(method==='getPortalBootstrap')await pendingProfile;
   const values={
    passwordSignIn:{token:'bja1.'+'a'.repeat(64)},
    getPortalBootstrap:{role:'STUDENT',user:{name:'Test Learner'},children:[{id:'test-learner',name:'Test Learner',year:1,school:'SK',language:'en'}],access:{plan:'FREE'},modules:[],lessons:[]},
    recordStudentUsage:{recorded:true},
    passwordSignOut:{ok:true}
   };
   const result=method==='passwordSignIn'&&args[0].password==='Wrong test password'?
    {ok:false,error:'Incorrect sign-in details'}:{ok:true,value:values[method]};
   await route.fulfill({headers:{'Access-Control-Allow-Origin':'*'},json:result});
  });
  await page.addInitScript(()=>localStorage.setItem('bijaklearn:ui-language:v1','en'));
  await page.goto(base);
  if(!await page.getByRole('button',{name:'Sign in with password',exact:true}).count())return;
  await page.getByRole('button',{name:'BijakLearn Team',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Sign in with password',exact:true}).count(),0);
  await page.getByRole('button',{name:'Student sign-in',exact:true}).click();
  await page.getByLabel('Email, username or user ID',{exact:true}).fill('test-student');
  await page.getByLabel('Password',{exact:true}).fill('Wrong test password');
  await page.getByRole('button',{name:'Sign in with password',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'Incorrect sign-in details'}).waitFor();
  await page.clock.install();
  await page.getByLabel('Password',{exact:true}).fill('Long fictional password');
  const profileRequested=page.waitForRequest(req=>req.method()==='POST'&&req.postData()?.includes('getPortalBootstrap'));
  await page.getByRole('button',{name:'Sign in with password',exact:true}).click();
  await profileRequested;
  await page.clock.fastForward(55000);
  await page.getByRole('status').filter({hasText:'Still signing in'}).waitFor();
  releaseProfile();
  await page.getByRole('heading',{name:'Your learning profile',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Manage account access'}).count(),0);
  assert.equal(await page.locator('iframe[title="Secure BijakLearn account service"]').count(),0);
  await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await page.getByRole('heading',{name:'Welcome back',exact:true}).waitFor();
  assert.deepEqual(calls.slice(0,3),['passwordSignIn','passwordSignIn','getPortalBootstrap']);
  console.log('Passed mocked direct password sign-in, rejected credentials and student-only browser flows.');
 }finally{releaseProfile();await page.close()}
}
