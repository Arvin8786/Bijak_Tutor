import assert from 'node:assert/strict';
export async function checkTierAccessBrowser(browser,base){
 const page=await browser.newPage({viewport:{width:390,height:900}});
 try{
  await page.route('https://accounts.google.com/gsi/client',route=>route.fulfill({status:200,contentType:'application/javascript',body:'// Google identity is mocked in this test.'}));
await page.addInitScript(()=>{
   window.BIJAKLEARN_GOOGLE_CLIENT_ID='test-client';window.testKasih=null;window.testMembership='FREE';
   let signIn;
   function invoke(method,credential,...args){
    const admin=credential==='operator';
    if(method==='getBootstrap')return {parent:{name:admin?'Operator':'Family'},children:[],access:{active:window.testMembership!=='FREE',plan:window.testMembership},canManageAccounts:admin,lessons:[],scholarship:window.testKasih?.status||null};
    if(method==='authorizeModule')return {moduleId:args[0],title:'Science Lab',plan:'FREE',allowed:args[0]!=='science-lab'};
    if(method==='submitKasihApplication'){
     window.testSubmission=args;
     window.testKasih={requestId:'test-request',accountKey:'google:family',guardianName:args[0].guardianName,studentNickname:args[0].studentNickname,schoolYear:args[0].schoolYear,reason:args[0].reason,status:'PENDING',documents:[{id:'evidence',label:'Supporting document 1'}]};
     return {requestId:'test-request',status:'PENDING'};
    }
    if(method==='listAccountAccess'&&admin)return [{id:'google:family',email:'family@example.test',name:'Family',status:'ACTIVE'}];
    if(method==='listKasihApplications'&&admin)return window.testKasih?[window.testKasih]:[];
    if(method==='listStudentProfiles'||method==='listStudentAccounts')return [];
    if(method==='reviewKasihApplication'&&admin){window.testKasih.status=args[1];window.testMembership='PREMIUM_KASIH';return {requestId:args[0],status:args[1]}}
    if(method==='setMembership'&&admin){window.testMembership=args[1];return {plan:args[1]}}
    if(method==='getKasihDocument'&&admin)return {mimeType:'application/pdf',data:btoa('%PDF-1.7\nFictional test evidence')};
    throw Error('Unexpected request '+method);
   }
   window.google={accounts:{id:{initialize(options){signIn=options.callback},renderButton(container){for(const [label,credential] of [['Test family sign-in','family'],['Test operator sign-in','operator']]){const button=document.createElement('button');button.textContent=label;button.onclick=()=>signIn({credential});container.append(button)}}}},script:{run:{withSuccessHandler(success){return {withFailureHandler:failure=>new Proxy({},{get:(_,method)=>(...args)=>{try{success(invoke(method,...args))}catch(error){failure(error)}}})}}}}};
  });
  await page.addInitScript(()=>localStorage.setItem('bijaklearn:ui-language:v1','en'));
  await page.goto(base);
  await page.getByRole('button',{name:'Test family sign-in'}).click();
  await page.locator('nav.nav').getByRole('button',{name:'Science Lab',exact:true}).click();
  await page.getByText('Your FREE plan does not include Science Lab.',{exact:true}).waitFor();
  assert.equal(await page.locator('.science-lab').count(),0);
  await page.getByRole('button',{name:'View membership options'}).click();
  await page.getByRole('button',{name:'Apply for Premium Kasih',exact:true}).click();
  await page.getByLabel('Parent or guardian name',{exact:true}).fill('Test Guardian');
  await page.getByLabel('Student nickname',{exact:true}).fill('Test Fox');
  await page.getByLabel('School year',{exact:true}).selectOption('2');
  await page.getByLabel('Why would Premium Kasih help your family?',{exact:true}).fill('Our family would benefit from sponsored learning opportunities through this community programme.');
  await page.locator('input[type="file"]').setInputFiles({name:'fictional-evidence.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.7\nFictional test evidence')});
  await page.getByRole('checkbox',{name:/I am the parent or guardian/}).check();
  await page.getByRole('button',{name:'Submit application for review'}).click();
  await page.getByRole('heading',{name:'Application received'}).waitFor();
  assert.equal(await page.evaluate(()=>window.testSubmission[0].guardianConsent),true);
  assert.equal(await page.evaluate(()=>window.testSubmission[1][0].mimeType),'application/pdf');
  await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await page.getByRole('button',{name:'Test operator sign-in'}).click();
  await page.getByRole('button',{name:'Manage account access',exact:true}).click();
  await page.getByRole('button',{name:'Supporting document 1',exact:true}).waitFor();
  await page.getByRole('button',{name:'Supporting document 1',exact:true}).click();
  await page.getByRole('dialog',{name:'Private document viewer'}).waitFor();
  await page.getByRole('link',{name:'Download a private copy'}).waitFor();
  await page.getByRole('button',{name:'Close document',exact:true}).click();
  await page.getByRole('button',{name:'Approve Premium Kasih',exact:true}).click();
  await page.getByLabel('Review note',{exact:true}).fill('Fictional evidence reviewed for browser test.');
  await page.getByLabel('Duration in months',{exact:true}).fill('6');
  await page.getByRole('button',{name:'Confirm review',exact:true}).click();
  await page.getByRole('status').filter({hasText:'Application approved'}).waitFor();
  assert.equal(await page.evaluate(()=>window.testMembership),'PREMIUM_KASIH');
  await page.getByText('Assign Free or Premium membership',{exact:true}).click();
  await page.getByLabel('Membership account',{exact:true}).selectOption('google:family');
  await page.getByLabel('Membership plan',{exact:true}).selectOption('FREE');
  await page.getByLabel('Membership reason',{exact:true}).fill('Return to Free test');
  await page.getByRole('button',{name:'Save membership',exact:true}).click();
  await page.getByRole('status').filter({hasText:'Membership updated: FREE'}).waitFor();
  console.log('Passed tier denial, private application upload, in-app private evidence preview, approval and Free assignment browser flows.');
 }finally{await page.close()}
}

