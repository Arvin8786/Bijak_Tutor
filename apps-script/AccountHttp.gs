/** Simple HTTPS POST for the GitHub Pages app. No browser cookies authenticate these requests. */
function doPost(event){
 const content=event?.postData?.contents;
 let result;
 try{
  if(typeof content!=='string'||content.length>3001000)throw Error('Invalid account request');
  let request;
  try{request=JSON.parse(content)}catch{throw Error('Invalid account request')}
  if(request?.service!=='bijak-account-v1'||typeof request.method!=='string'||!Array.isArray(request.args))throw Error('Invalid account request');
  const {method,args}=request;
  let value;
  if(method==='health'&&args.length===0)value={version:1,release:"membership-desk-1"};
  else if(method==='membershipDesk'&&args.length===3)value=membershipDesk(...args);
  else if(method==='passwordSignIn'&&args.length===1)value=passwordSignIn(args[0]);
  else if(method==='passwordSignOut'&&args.length===1)value=passwordSignOut(args[0]);
  else if(['getPasswordSettings','saveParentPassword','saveChildPassword'].includes(method)){
   value=accountPasswordSettingsRequest_(method,args);
  }else if(method==='parentNoticeRequest'&&args.length===2)value=parentNoticeRequest(...args);
  else if(method==='friendMatch'&&args.length===3)value=friendMatch(...args);
  else if(method==='mockExamRequest'&&args.length===3)value=mockExamRequest(...args);
  else value=portalRequest(method,args);
  result={ok:true,value};
 }catch(error){
  result={ok:false,error:typeof error?.message==='string'?error.message.slice(0,350):'Account request failed'};
 }
 return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function accountPasswordSettingsRequest_(method,args){
 if(method==='getPasswordSettings'&&args.length===1)return getPasswordSettings(args[0]);
 if(method==='saveParentPassword'&&args.length===2)return saveParentPassword(...args);
 if(method==='saveChildPassword'&&args.length===3)return saveChildPassword(...args);
 throw Error('Invalid password settings request');
}

// Records use the same verified Google subject key as AccountAccess.
function registerMembershipDesk_(){
 TABLES.FreeAccessRequests=['accountKey','parentName','phone','verifiedEmail','childCount','submittedAt'];
 TABLES.MembershipMessages=['accountKey','plan','noticeKey','shownAt'];
}
function setupMembershipDesk(){
 const actor=Session.getActiveUser().getEmail();
 if(!actor||actor!==Session.getEffectiveUser().getEmail()||actor.toLowerCase()!==adminEmail_())throw Error('Open the editor as the project owner.');
 registerMembershipDesk_();
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const db=database_();
  for(const name of ['FreeAccessRequests','MembershipMessages']){
   const sheet=db.getSheetByName(name)||db.insertSheet(name),keys=TABLES[name];
   if(!sheet.getLastRow()){sheet.appendRow(keys);sheet.setFrozenRows(1)}
   if(sheet.getLastColumn()!==keys.length||sheet.getRange(1,1,1,keys.length).getValues()[0].some((v,i)=>v!==keys[i]))throw Error('Unexpected headers in '+name);
  }
 }finally{SpreadsheetApp.flush();lock.releaseLock()}
}
function applicant_(token){
 if(typeof token!=='string'||token.startsWith('bja1.'))throw Error('Verify your parent Google account to apply.');
 const user=verifiedGoogleAccount_(token);
 if(isOwnerAccount_(user)||studentLink_(user))throw Error('Use the Google account of the parent requesting Free access.');
 return user;
}
function applicantState_(user){
 const status=accountStatus_(user);
 if(status==='REVOKED')throw Error('Account access is blocked. Contact the BijakLearn Team.');
 const request=rows_('FreeAccessRequests').find(r=>r.accountKey===accountKey_(user.sub));
 return {name:String(request?.parentName||user.name||''),email:user.email,status,submitted:!!request};
}
function requestFreeAccess_(user,input){
 const name=String(input?.name||'').trim(),phone=passwordPhone_(input?.phone,true),count=input?.children;
 if(!name||name.length>80||!Number.isSafeInteger(count)||count<1||count>99)throw Error('Enter a parent name, phone number and number of children from 1 to 99.');
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const state=applicantState_(user),key=accountKey_(user.sub);
  if(state.status==='ACTIVE')return state;
  if(!state.submitted)append_('FreeAccessRequests',{accountKey:key,parentName:name,phone:"'"+phone,verifiedEmail:user.email,childCount:count,submittedAt:new Date().toISOString()});
  if(!latestAccountEvents_().has(key))appendAccountEvent_({accountKey:key,email:user.email,displayName:name},'PENDING',user.sub,'Free access request');
  return {...state,submitted:true};
 }finally{SpreadsheetApp.flush();lock.releaseLock()}
}
function membershipFamily_(sub){
 const access=access_({sub}),children=activeFamilyChildren_(sub),slots=access.plan==='PREMIUM'?premiumSlots_(sub):0;
 return {plan:access.plan,expiresAt:access.expiresAt||null,lifetime:!!access.lifetime,children:children.map((c,i)=>({id:String(c.childId),name:String(c.nickname),plan:access.plan==='PREMIUM'&&i>=slots?'FREE':access.plan}))};
}
function membershipMessage_(family,previous,day){
 if(family.plan==='FREE'){
  const key='free:'+day;
  return previous?.noticeKey===key?null:{key,kind:'offer'};
 }
 return previous?.plan===family.plan?null:{key:'welcome:'+family.plan,kind:'welcome'};
}
function membershipDesk(token,action,input){
 registerMembershipDesk_();
 if(action==='identify')return applicantState_(applicant_(token));
 if(action==='apply')return requestFreeAccess_(applicant_(token),input);
 if(action==='account'){
  requireAccountAdmin_(token);
  const key=String(input||'');
  if(!/^google:[A-Za-z0-9_-]{1,255}$/.test(key))throw Error('Choose a family account.');
  const row=rows_('FreeAccessRequests').find(r=>r.accountKey===key);
  return {...membershipFamily_(key.slice(7)),application:row?{name:row.parentName,phone:String(row.phone),email:row.verifiedEmail,children:row.childCount}:null};
 }
 if(!['family','seen'].includes(action))throw Error('Unknown membership action.');
 const parent=requirePortalParent_(token),family=membershipFamily_(parent.sub),key=accountKey_(parent.sub);
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const previous=rows_('MembershipMessages').find(r=>r.accountKey===key);
  const day=Utilities.formatDate(new Date(),'Asia/Kuala_Lumpur','yyyy-MM-dd');
  const message=membershipMessage_(family,previous,day);
  if(action==='family')return {...family,message};
  if(message&&message.key===input){
   const record={accountKey:key,plan:family.plan,noticeKey:message.key,shownAt:new Date().toISOString()};
   if(previous)update_('MembershipMessages','accountKey',key,record);else append_('MembershipMessages',record);
  }
  return {ok:true};
 }finally{SpreadsheetApp.flush();lock.releaseLock()}
}
