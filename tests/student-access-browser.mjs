import assert from 'node:assert/strict';
export async function checkStudentAccessBrowser(browser,base){
 const page=await browser.newPage({viewport:{width:390,height:900}});
 try{
  await page.route('https://accounts.google.com/gsi/client',route=>route.fulfill({status:200,contentType:'application/javascript',body:'// Google identity is mocked in this test.'}));
await page.addInitScript(()=>{
   window.BIJAKLEARN_GOOGLE_CLIENT_ID='test-client';window.studentLink=null;
   let callback;
   function invoke(method,credential,...args){
    const admin=credential==='operator',student=credential==='learner';
    if(method==='getStudentBootstrap'){
     if(!student||window.studentLink?.status!=='ACTIVE')throw Error('[STUDENT_NOT_LINKED]');
     return {role:'STUDENT',user:{name:'Test Fox'},parent:null,children:[{id:'child-1',name:'Test Fox',year:2,school:'SK'}],canManageAccounts:false,access:{active:true,plan:'PREMIUM'},lessons:[],scholarship:null};
    }
    if(method==='getBootstrap'){
     if(student)throw Error('[STUDENT_ONLY]');
     return {role:'PARENT',parent:{name:'Operator'},children:[],canManageAccounts:admin,access:{active:false,plan:'FREE'},lessons:[]};
    }
    if(method==='listAccountAccess'&&admin)return [];
    if(method==='listKasihApplications'&&admin)return [];
    if(method==='listStudentProfiles'&&admin)return [{id:'child-1',name:'Test Fox',parentEmail:'parent@example.test'}];
    if(method==='listStudentAccounts'&&admin)return window.studentLink?[window.studentLink]:[];
    if(method==='setStudentAccount'&&admin){window.studentLink={id:'email:'+args[0],email:args[0],childId:args[1],status:args[2]};return window.studentLink}
    if(method==='authorizeModule')return {moduleId:args[0],allowed:true,plan:'PREMIUM'};
    throw Error('Unexpected request '+method);
   }
   window.google={accounts:{id:{initialize(options){callback=options.callback},renderButton(container){for(const [name,credential] of [['Test operator sign-in','operator'],['Test learner sign-in','learner']]){const button=document.createElement('button');button.textContent=name;button.onclick=()=>callback({credential});container.append(button)}}}},script:{run:{withSuccessHandler(success){return {withFailureHandler:failure=>new Proxy({},{get:(_,method)=>(...args)=>{try{success(invoke(method,...args))}catch(e){failure(e)}}})}}}}};
  });
  await page.addInitScript(()=>localStorage.setItem('bijaklearn:ui-language:v1','en'));
  await page.goto(base);
  await page.getByRole('button',{name:'Student sign-in',exact:true}).click();
  await page.getByRole('heading',{name:'Student sign-in',exact:true}).waitFor();
  await page.getByRole('button',{name:'Test learner sign-in'}).click();
  await page.getByRole('alert').filter({hasText:'not linked to a learner profile'}).waitFor();
  await page.getByRole('button',{name:'BijakLearn Team',exact:true}).click();
  await page.getByRole('button',{name:'Test operator sign-in'}).click();
  await page.getByRole('button',{name:'Manage account access',exact:true}).click();
  await page.getByLabel('Student Google email',{exact:true}).fill('student@example.test');
  await page.getByLabel('Learner profile',{exact:true}).selectOption('child-1');
  await page.getByRole('button',{name:'Enable student sign-in',exact:true}).click();
  await page.getByRole('status').filter({hasText:'Student sign-in enabled'}).waitFor();
  await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await page.getByRole('button',{name:'Student sign-in',exact:true}).click();
  await page.getByRole('button',{name:'Test learner sign-in'}).click();
  await page.getByRole('heading',{name:'Your learning profile',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Manage account access',exact:true}).count(),0);
  assert.equal(await page.getByRole('button',{name:'Parent insights',exact:true}).count(),0);
  assert.equal(await page.getByLabel('Fictional nickname',{exact:true}).count(),0);
  assert.equal(await page.locator('nav.nav').getByRole('button',{name:'Adults',exact:true}).count(),0);
  await page.locator('nav.nav').getByRole('button',{name:'Membership',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Apply for Premium Kasih',exact:true}).isEnabled(),false);
  console.log('Passed student role selection, unlinked-account gate, admin linking and student-only interface browser flows.');
 }finally{await page.close()}
}

