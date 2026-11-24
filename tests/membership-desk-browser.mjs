import assert from 'node:assert/strict';
export async function checkMembershipDeskBrowser(browser,base){
 const page=await browser.newPage({viewport:{width:390,height:850}});
 try{
  await page.route('https://accounts.google.com/gsi/client',r=>r.fulfill({contentType:'application/javascript',body:''}));
  await page.addInitScript(()=>{
   window.BIJAKLEARN_PORTAL_VERSION=2;
   localStorage.setItem('bijaklearn:ui-language:v1','en');
   let callback,submitted=false,seen=false;
   const identity={name:'Test parent',email:'test@example.invalid',status:'PENDING'};
   function invoke(method,token,action,input){
    if(method==='membershipDesk'){
     if(action==='identify')return identity;
     if(action==='apply'){if(input.children!==2||input.phone!=='0123456789')throw Error('Incorrect request');submitted=true;return {...identity,submitted}}
     if(action==='family')return {plan:'FREE',children:[{id:'c',name:'Test learner',plan:'FREE'}],message:seen?null:{kind:'offer',key:'free:today'}};
     if(action==='seen'){seen=true;return {ok:true}}
    }
    if(method==='getPortalBootstrap'&&submitted)return {role:'PARENT',parent:identity,access:{plan:'FREE'},children:[],modules:[],lessons:[]};
    if(method==='getParentDashboard')return {parent:identity,access:{plan:'FREE'},children:[],enrolments:[],feedback:[]};
    if(method==='getParentNotices')return [];
    if(method==='getKasihApplication')return null;
    throw Error('Unavailable');
   }
   window.google={accounts:{id:{initialize(options){callback=options.callback},renderButton(el){const btn=document.createElement('button');btn.textContent='Verify test account';btn.onclick=()=>callback({credential:'fixture-token'});el.append(btn)}}},script:{run:{withSuccessHandler(ok){return {withFailureHandler:fail=>new Proxy({},{get:(_,method)=>(...args)=>{try{ok(invoke(method,...args))}catch(e){fail(e)}}})}}}}};
  });
  await page.goto(base);
  await page.getByRole('button',{name:'Request Free access'}).click();
  await page.getByRole('button',{name:'Verify test account'}).click();
  const email=page.getByLabel('Verified Google email');
  assert.equal(await email.inputValue(),'test@example.invalid');
  assert.equal(await email.getAttribute('readonly'),'');
  await page.getByLabel('Phone number').fill('0123456789');
  await page.getByLabel('Number of children').fill('2');
  await page.getByRole('button',{name:'Submit access request'}).click();
  await page.getByRole('heading',{name:'Free access requested'}).waitFor();
  await page.getByRole('button',{name:'Back to sign-in'}).click();
  await page.getByRole('button',{name:'Verify test account'}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Apply for Premium Kasih'}).click();
  await page.getByRole('heading',{name:'Premium Kasih',exact:true}).first().waitFor();
  await page.getByText('My membership & linked accounts',{exact:false}).click();
  await page.getByText('Test learner',{exact:true}).waitFor();
  console.log('Passed simulated mobile Free access request, membership dropdown and Premium Kasih navigation.');
 }finally{await page.close()}
}
