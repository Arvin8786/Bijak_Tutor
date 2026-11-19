import assert from 'node:assert/strict';
export async function checkAccountSyncBrowser(browser,base){
 for(const role of ['ADMIN','PARENT','STUDENT']){
  const page=await browser.newPage({viewport:{width:role==='ADMIN'?1280:390,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.route('https://accounts.google.com/gsi/client',r=>r.fulfill({status:200,contentType:'application/javascript',body:''}));
   await page.addInitScript(role=>{
    window.BIJAKLEARN_PORTAL_VERSION=2;window.BIJAKLEARN_GOOGLE_CLIENT_ID='test';localStorage.setItem('bijaklearn:locale','en');let callback;
    const child={id:'fixture-child',name:'Original learner',year:2,school:'SK',language:'en',parentEmail:'parent@test.invalid',email:'wrong@test.invalid',status:'PROFILE_MISSING',missing:true,linkStatus:'REVOKED',revision:'one'};
    const account={id:'google:fixture-parent',name:'Test parent',email:'parent@test.invalid',status:'PENDING'},link={id:'email:wrong@test.invalid',email:child.email,childId:child.id,status:'REVOKED'};
    window.accountFixture={child,account,link};
    function invoke(method,...args){
     const parent={name:account.name,email:account.email};
     if(method==='getPortalBootstrap')return {role,user:{name:role==='STUDENT'?child.name:'Test admin'},parent,children:role==='STUDENT'?[child]:[],lessons:[],modules:[],access:{plan:'FREE'},canManageAccounts:role==='ADMIN'};
     if(method==='getAdministrationOverview')return {settings:{},children:1,reportedSeconds7Days:0,modules:[],parents:[],payments:[]};
     if(method==='getParentDashboard')return {parent,children:[],access:{plan:'FREE'},feedback:[],enrolments:[{...child,studentEmail:child.email,status:child.missing?'PROFILE_MISSING':'ACTIVE'}]};
     if(method==='listAccountAccess')return [account];
     if(method==='listStudentProfiles')return [child];
     if(method==='listStudentAccounts')return [link];
     if(method==='setAccountAccess'){account.status=args[1];return {id:account.id,status:account.status}}
     if(method==='updateParentDetails'){Object.assign(account,{name:args[1].name,email:args[1].email});return {ok:true}}
     if(method==='updateChildAccount'){const f=args[1];Object.assign(child,{name:f.name,email:f.email,year:f.year,missing:false,status:'ACTIVE',linkStatus:f.status,revision:'two'});Object.assign(link,{email:f.email,status:f.status});return link}
     if(method==='setStudentAccount'){link.status=args[2];return link}
     if(method==='removeChildLink'){child.status='REMOVED';link.status='REVOKED';return {ok:true}}
     if(method==='authorizeModule')return {allowed:true,plan:'FREE'};
     if(method==='recordStudentUsage')return {recorded:true,seconds:0};
     throw Error('Unexpected fixture request '+method);
    }
    window.google={accounts:{id:{initialize(o){callback=o.callback},renderButton(el){const b=document.createElement('button');b.textContent='Sync test Google';b.onclick=()=>callback({credential:'fictional'});el.append(b)}}},script:{run:{withSuccessHandler(ok){return {withFailureHandler:fail=>new Proxy({},{get:(_,method)=>(...args)=>{try{ok(invoke(method,...args))}catch(e){fail(e)}}})}}}}};
   },role);
   await page.goto(base);const welcome=page.locator('.welcome-gate');if(await welcome.count()){await welcome.getByRole('button',{name:'English',exact:true}).click();await welcome.getByRole('button',{name:'Continue',exact:true}).click()}
   await page.getByRole('button',{name:'Sync test Google',exact:true}).click();
   if(role==='ADMIN'){
    await page.getByRole('button',{name:'Access & family links',exact:true}).click();await page.getByRole('button',{name:'Approve',exact:true}).click();await page.getByRole('button',{name:'Grant access',exact:true}).click();await page.getByRole('status').filter({hasText:'Active:'}).waitFor();
    await page.getByRole('button',{name:'Edit parent details',exact:true}).click();await page.getByLabel('Parent display name',{exact:true}).fill('Updated parent');await page.getByRole('button',{name:'Save parent details',exact:true}).click();await page.getByText('Updated parent',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Edit child details & email',exact:true}).click();await page.getByLabel('Learner nickname',{exact:true}).fill('Corrected learner');await page.getByLabel('Correct student Google email',{exact:true}).fill('correct@test.invalid');await page.getByRole('checkbox',{name:/Restore this missing/}).check();await page.getByLabel('Correction reason',{exact:true}).fill('Fictional typo repair');await page.getByRole('button',{name:'Save connected child records',exact:true}).click();await page.getByRole('heading',{name:'Corrected learner',exact:true}).waitFor();
    await page.getByRole('button',{name:'Restore student sign-in',exact:true}).click();await page.getByRole('button',{name:'Disable student sign-in',exact:true}).click();await page.getByRole('button',{name:'Remove child link',exact:true}).click();await page.getByLabel('Removal reason',{exact:true}).fill('Fictional retirement');await page.getByRole('button',{name:'Confirm removal',exact:true}).click();await page.getByText('Removed',{exact:true}).waitFor();
   }else if(role==='PARENT'){
    await page.getByRole('button',{name:'Enrol a child',exact:true}).click();await page.getByText(/Disabled — profile missing/).waitFor();await page.evaluate(()=>{window.accountFixture.child.email='correct@test.invalid';window.accountFixture.child.name='Updated from Sheet'});await page.getByRole('button',{name:'Refresh records',exact:true}).click();await page.getByText(/Updated from Sheet.*correct@test.invalid/).waitFor();
   }else{
    await page.getByRole('heading',{name:'Your learning profile',exact:true}).waitFor();await page.evaluate(()=>{window.accountFixture.child.name='Updated learner details'});await page.getByRole('button',{name:'Refresh account details',exact:true}).click();await page.getByText(/Updated learner details ·/).waitFor();
   }
   assert.deepEqual(errors,[]);
  }finally{await page.close()}
 }
 console.log('Passed account activation, corrections, missing-profile restoration, disable/removal and cross-console refresh browser flows.');
}
