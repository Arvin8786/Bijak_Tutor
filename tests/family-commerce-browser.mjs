import assert from 'node:assert/strict';
export async function checkFamilyCommerceBrowser(browser,base){
 for(const admin of [false,true]){
 const page=await browser.newPage({viewport:{width:admin?1280:390,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.route('https://accounts.google.com/gsi/client',route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
 await page.addInitScript(admin=>{
  window.BIJAKLEARN_PORTAL_VERSION=2;window.BIJAKLEARN_GOOGLE_CLIENT_ID='test';localStorage.setItem('bijaklearn:ui-language:v1','en');let signIn;
  const settings={commissionBps:1000,paymentInstructions:'Scan our verified Touch n Go QR',qrUploadId:''},orders=[],children=[],calls=[];window.commerceCalls=calls;
  const parent={name:'Test Parent',email:'parent@test.invalid'};
  function invoke(method,...args){calls.push([method,...args]);
   if(method==='getPortalBootstrap')return {role:admin?'ADMIN':'PARENT',parent,user:{name:'Test Admin'},children:[],lessons:[],modules:[],access:{plan:'FREE'},canManageAccounts:admin};
   if(method==='getAdministrationOverview')return {settings:{},children:0,reportedSeconds7Days:0,modules:[],parents:[],payments:[]};
   if(method==='getParentDashboard')return {parent,access:{plan:'FREE'},children:[],enrolments:[],feedback:[]};
   if(method==='getFamilyCommerce')return {settings,access:{plan:'FREE'},premiumSlots:2,children,orders,affiliateUrl:'https://example.test/?ref='+'a'.repeat(32),referrals:[{name:'Test referral',status:'PAID',commissionCents:1000,month:'2026-10',paidOut:false}],payouts:[],uploadsConfigured:true};
   if(method==='getCommerceAdministration')return {settings,orders:[{id:'order-test',parentEmail:'parent@test.invalid',kind:'LIFETIME_PREMIUM',slots:1,totalCents:10000,status:'SUBMITTED',proofId:'proof-test'}],discounts:[],commissions:[],payouts:[],uploadsConfigured:true};
   if(method==='submitParentEnrolment')return {status:'APPROVED'};
   if(method==='createFamilyOrder'){orders.unshift({id:'new-order',kind:'LIFETIME_PREMIUM',slots:1,totalCents:10000,discountCents:0,status:'QUOTED',expiresAt:new Date(Date.now()+1800000).toISOString()});return orders[0]}
   if(method==='submitOrderProof'){orders[0].status='SUBMITTED';orders[0].proofId='proof-test';return {ok:true}}
   if(method==='getPrivateUpload')return {mimeType:'image/png',data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2ioAAAAASUVORK5CYII='};
   if(['setCommerceSettings','saveDiscountCampaign','uploadPaymentQr','reviewFamilyOrder'].includes(method))return {ok:true};
   throw Error('Unexpected commerce browser request '+method);
  }
  window.google={accounts:{id:{initialize(o){signIn=o.callback},renderButton(container){const b=document.createElement('button');b.textContent='Test commerce Google';b.onclick=()=>signIn({credential:'fictional'});container.append(b)}}},script:{run:{withSuccessHandler(success){return {withFailureHandler:failure=>new Proxy({},{get:(_,method)=>(...args)=>{try{success(invoke(method,...args))}catch(e){failure(e)}}})}}}}};
 },admin);
 await page.goto(base);
 await page.getByRole('button',{name:'Test commerce Google',exact:true}).click();
 if(!admin){
  await page.getByRole('button',{name:'Enrol a child',exact:true}).click();await page.getByLabel('Child nickname',{exact:true}).fill('Fictional child');await page.getByLabel('Student Google email',{exact:true}).fill('student@test.invalid');await page.getByRole('checkbox',{name:/I am the parent or guardian and consent/}).check();await page.getByRole('button',{name:'Add child account',exact:true}).click();await page.getByText('Saved successfully.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Remove child link',exact:true}).count(),0);
  await page.getByRole('button',{name:'Membership & payments',exact:true}).click();await page.getByRole('heading',{name:'Lifetime Premium',exact:true}).waitFor();await page.getByRole('button',{name:'Create secure quote',exact:true}).click();await page.getByLabel('Payment receipt reference',{exact:true}).fill('FICTIONAL-REFERENCE');await page.getByLabel(/Upload payment proof/).setInputFiles({name:'test.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.7\nFictional receipt')});await page.getByRole('button',{name:'Submit for verification',exact:true}).click();await page.getByRole('button',{name:'View payment proof',exact:true}).click();await page.getByRole('dialog',{name:'Private document viewer'}).waitFor();await page.getByAltText('Private uploaded document').waitFor();await page.getByRole('button',{name:'Close document',exact:true}).click();
  await page.getByRole('button',{name:'Referrals & earnings',exact:true}).click();await page.getByText('Successful paid referrals',{exact:true}).waitFor();await page.getByLabel('Affiliate link',{exact:true}).waitFor();assert.equal(await page.getByRole('link',{name:/WhatsApp BijakLearn Team/}).getAttribute('href'),'https://wa.me/601154443154');
 }else{
  await page.getByRole('button',{name:'Payment controls',exact:true}).click();await page.getByLabel(/Upload Touch ’n Go QR/).setInputFiles({name:'fictional-qr.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2ioAAAAASUVORK5CYII=','base64')});await page.getByRole('button',{name:'Save payment QR',exact:true}).click();await page.getByRole('button',{name:'View private receipt',exact:true}).click();await page.getByRole('dialog',{name:'Private document viewer'}).waitFor();await page.getByRole('button',{name:'Close document',exact:true}).click();
  await page.getByRole('button',{name:'Discounts & referrals',exact:true}).click();await page.getByLabel('Commission percentage',{exact:true}).fill('12.5');await page.getByRole('button',{name:'Save commerce settings',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved successfully.'}).waitFor();await page.getByRole('heading',{name:'Create a limited-time discount',exact:true}).waitFor();
 }
 assert.equal(new URL(page.url()).pathname,'/Bijak_Tutor/');assert.deepEqual(errors,[]);
 }finally{await page.close()}
 }
 console.log('Passed parent linking, private receipt viewer, referral dashboard, QR upload and admin commission settings.');
}
