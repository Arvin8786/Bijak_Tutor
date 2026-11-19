/** Parents link their own learners; only an administrator changes or revokes existing links. */
function latestStudentLinks_(){
 const latest=new Map();rows_('StudentAccounts').forEach(row=>{const key=String(row.studentKey||'').trim().toLowerCase();if(key)latest.set(key,{...row,studentKey:key,email:String(row.email||'').trim().toLowerCase(),status:String(row.status||'').trim().toUpperCase()})});return Array.from(latest.values());
}
function studentLink_(user){
 const email=String(user.email||'').trim().toLowerCase(),links=latestStudentLinks_();
 const emailMatches=links.filter(row=>row.email===email),active=emailMatches.filter(row=>row.status==='ACTIVE');
 // A newly verified corrected email can replace a revoked identity. The old identity remains blocked.
 const matches=active.length?active:emailMatches.length?emailMatches:links.filter(row=>row.googleSub&&String(row.googleSub)===user.sub);
 if(matches.length>1&&new Set(matches.map(row=>String(row.childId)+'/'+String(row.parentSub))).size>1)throw Error('[STUDENT_REVOKED] Student identity has conflicting profile links. Contact the administrator.');
 const link=matches.slice(-1)[0];
 if(link&&link.googleSub&&String(link.googleSub)!==user.sub)throw Error('[STUDENT_REVOKED] This Google account does not match the linked student identity.');return link||null;
}
function studentIdentity_(user,link){
 if(link.status!=='ACTIVE')throw Error('[STUDENT_REVOKED] Student access has been disabled. Contact your parent or administrator.');
 const event=latestAccountEvents_().get(accountKey_(user.sub));
 if(event&&!['ACTIVE','PENDING'].includes(event.status))throw Error('[STUDENT_REVOKED] Student account access is not active.');
 const child=rows_('Children').find(row=>String(row.childId)===String(link.childId)&&String(row.parentSub)===String(link.parentSub));
 if(!child||child.status==='REMOVED')throw Error('[STUDENT_REVOKED] The linked learner profile is unavailable.');
 const parent=rows_('Parents').find(row=>String(row.googleSub)===String(link.parentSub));
 if(!parent)throw Error('[STUDENT_REVOKED] The linked family account is unavailable.');
 requireActiveAccount_({sub:String(link.parentSub),email:String(parent.email||''),name:String(parent.displayName||'')},false);
 return {...user,role:'STUDENT',familySub:String(link.parentSub),studentChildId:String(link.childId)};
}
function bindStudentIdentity_(user){
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const link=studentLink_(user);
  if(!link)throw Error('[STUDENT_NOT_LINKED] Ask your parent or administrator to link your Google account to your learner profile.');
  const identity=studentIdentity_(user,link);
  if(!link.googleSub)append_('StudentAccounts',{...link,googleSub:user.sub,linkedAt:new Date().toISOString(),linkedBy:'VERIFIED_GOOGLE_SIGN_IN'});
  return identity;
 }finally{lock.releaseLock()}
}
function requireParent_(user){if(user.role==='STUDENT')throw Error('[PARENT_ONLY] Sign in with a parent account for this action.')}
function getStudentBootstrap(token){
 const user=bindStudentIdentity_(verify_(token));
 const child=requireChild_(user,user.studentChildId);
 return {role:'STUDENT',user:{name:String(child.nickname)},parent:null,canManageAccounts:false,
  children:[{id:String(child.childId),name:String(child.nickname),year:Number(child.year),school:String(child.school),language:String(child.language||'ms')}],
  access:access_(user),modules:moduleSummary_(user),lessons:lessonCatalogue_(),scholarship:null};
}
function lessonCatalogue_(){return rows_('Lessons').map(l=>({id:l.lessonId,title:l.title,year:Number(l.year),subject:l.subject,icon:l.icon,chapter:l.chapter||'',school:l.school||'ALL',status:l.contentStatus||'DRAFT_TEACHER_REVIEW',premium:String(l.premium).toUpperCase()==='TRUE'}))}
function listStudentProfiles(token){
 requireAccountAdmin_(token);const parents=rows_('Parents'),children=rows_('Children'),links=latestStudentLinks_(),enrolments=rows_('Enrolments');
 const ids=new Set([...children.map(c=>String(c.childId)),...links.map(l=>String(l.childId))]);
 return Array.from(ids).filter(Boolean).map(id=>{const child=children.find(c=>String(c.childId)===id),related=links.filter(l=>String(l.childId)===id),link=related.find(l=>l.status==='ACTIVE')||related.slice(-1)[0],history=enrolments.filter(e=>String(e.childId)===id).slice(-1)[0],sub=String(child?.parentSub||link?.parentSub||history?.parentSub||''),parent=parents.find(p=>String(p.googleSub)===sub);return {id,name:String(child?.nickname||history?.nickname||'Missing learner profile'),parentEmail:String(parent?.email||history?.parentEmail||''),parentId:accountKey_(sub),year:Number(child?.year??history?.year??1),school:String(child?.school||history?.school||'SK'),language:String(child?.language||history?.language||'ms'),email:link?.email||'',status:child?String(child.status||'ACTIVE'):'PROFILE_MISSING',linkStatus:link?.status||'UNLINKED',bound:!!link?.googleSub,missing:!child,parentAvailable:!!parent,revision:childAccountRevision_(id)}});
}
function listStudentAccounts(token){requireAccountAdmin_(token);return latestStudentLinks_().map(link=>({id:String(link.studentKey),email:link.email,childId:String(link.childId),status:link.status,bound:!!link.googleSub}))}
function childAccountRevision_(childId){return JSON.stringify({child:rows_('Children').find(c=>String(c.childId)===childId)||null,links:latestStudentLinks_().filter(l=>String(l.childId)===childId)})}
function childFields_(input){const name=String(input?.name||'').trim(),year=Number(input?.year),school=String(input?.school||''),language=String(input?.language||'');if(!name||name.length>40||!Number.isInteger(year)||year<0||year>6||!['SK','SJKC','SJKT'].includes(school)||!['ms','en','zh','ta'].includes(language))throw Error('Provide a nickname, valid school year, stream and learning language');return {nickname:name,year,school,language}}
function studentEmail_(email){const address=String(email||'').trim().toLowerCase();if(address.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(address))throw Error('Enter a valid student Google email');return address}
function assertStudentEmail_(address,parentSub,childId,admin){
 if(rows_('Parents').some(p=>String(p.email).trim().toLowerCase()===address)||String(admin?.email||props_().getProperty('ACCOUNT_ADMIN_EMAIL')||'arvin8786@gmail.com').toLowerCase()===address)throw Error('Use a separate student Google account, not a parent or administrator account');
 if(latestStudentLinks_().some(l=>l.email===address&&l.status==='ACTIVE'&&(String(l.childId)!==childId||String(l.parentSub)!==parentSub)))throw Error('Revoke and resolve the existing student link before changing the learner profile.');
}
function syncChildEnrolments_(childId,patch){rows_('Enrolments').filter(e=>String(e.childId)===childId).forEach(e=>{if(!update_('Enrolments','requestId',e.requestId,patch))throw Error('Enrolment changed. Refresh and retry.')})}
function writeStudentLink_(childId,parentSub,email,status,actor){
 const now=new Date().toISOString(),links=latestStudentLinks_(),same=links.find(l=>l.email===email&&String(l.childId)===childId),key='email:'+email;
 links.filter(l=>String(l.childId)===childId&&(l.studentKey!==key||l.email!==email)).forEach(l=>append_('StudentAccounts',{...l,status:'REVOKED',linkedAt:now,linkedBy:actor}));
 const row={studentKey:key,email,googleSub:same?.googleSub||'',childId,parentSub,status,linkedAt:now,linkedBy:actor};append_('StudentAccounts',row);return {id:key,email,childId,status,bound:!!row.googleSub};
}
function setStudentAccount(token,email,childId,status){
 const admin=requireAccountAdmin_(token),address=studentEmail_(email);if(!['ACTIVE','REVOKED'].includes(status))throw Error('Choose an access status');
 const lock=LockService.getScriptLock();lock.waitLock(10000);try{
  const child=rows_('Children').find(c=>String(c.childId)===childId),prior=latestStudentLinks_().find(l=>l.email===address&&String(l.childId)===childId);
  if(status==='ACTIVE'&&(!child||child.status==='REMOVED'))throw Error('Edit or restore the learner profile before enabling sign-in');
  if(status==='REVOKED'&&!prior)throw Error('Student link not found. Refresh and retry.');
  const parentSub=String(child?.parentSub||prior?.parentSub||'');assertStudentEmail_(address,parentSub,childId,admin);
  if(status==='ACTIVE'){const parent=rows_('Parents').find(p=>String(p.googleSub)===parentSub);if(!parent)throw Error('Parent profile is missing. Restore it first.');requireActiveAccount_({sub:parentSub,email:String(parent.email)},false)}
  const result=writeStudentLink_(childId,parentSub,address,status,accountKey_(admin.sub));syncChildEnrolments_(childId,{studentEmail:address,status:status==='ACTIVE'?'APPROVED':'DISABLED'});
  append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(admin.sub),action:'STUDENT_'+status,reference:childId});return result;
 }finally{SpreadsheetApp.flush();lock.releaseLock()}
}
function updateChildAccount(token,childId,input){
 const admin=requireAccountAdmin_(token),fields=childFields_(input),email=studentEmail_(input?.email),status=input?.status,reason=String(input?.reason||'').trim();if(!['ACTIVE','REVOKED'].includes(status)||!reason||reason.length>250)throw Error('Choose access and give a correction reason');
 const lock=LockService.getScriptLock();lock.waitLock(10000);try{
  if(input.revision!==childAccountRevision_(childId))throw Error('This record changed in Sheets or another window. Refresh before saving.');
  const child=rows_('Children').find(c=>String(c.childId)===childId),links=latestStudentLinks_().filter(l=>String(l.childId)===childId),events=rows_('Enrolments').filter(e=>String(e.childId)===childId),owners=new Set([child?.parentSub,...links.map(l=>l.parentSub),...events.map(e=>e.parentSub)].filter(Boolean).map(String));
  if(owners.size!==1)throw Error('Family ownership is missing or inconsistent. Correct parentSub in the linked Sheet first.');const parentSub=Array.from(owners)[0],parent=rows_('Parents').find(p=>String(p.googleSub)===parentSub);if(!parent)throw Error('Parent profile is missing. Restore it in the linked Sheet first.');
  if((!child||child.status==='REMOVED')&&input.restore!==true)throw Error('Confirm restoration of this learner profile before saving');
  assertStudentEmail_(email,parentSub,childId,admin);if(status==='ACTIVE')requireActiveAccount_({sub:parentSub,email:String(parent.email)},false);
  if(child){if(!update_('Children','childId',childId,{...fields,status:'ACTIVE'}))throw Error('Profile changed. Refresh and retry.')}else append_('Children',{childId,parentSub,...fields,createdAt:new Date().toISOString(),status:'ACTIVE'});
  const result=writeStudentLink_(childId,parentSub,email,status,accountKey_(admin.sub));syncChildEnrolments_(childId,{...fields,studentEmail:email,parentEmail:parent.email,status:status==='ACTIVE'?'APPROVED':'DISABLED',reviewedAt:new Date().toISOString(),reviewedBy:accountKey_(admin.sub)});
  append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(admin.sub),action:'CHILD_ACCOUNT_UPDATED',reference:childId+': '+reason});return result;
 }finally{SpreadsheetApp.flush();lock.releaseLock()}
}
function updateChildDetails(token,childId,input){
 const user=requirePortalParent_(token),fields=childFields_(input),lock=LockService.getScriptLock();lock.waitLock(10000);try{requireChild_(user,childId);if(!update_('Children','childId',childId,fields))throw Error('Learner profile no longer exists');syncChildEnrolments_(childId,fields);append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(user.sub),action:'CHILD_DETAILS_UPDATED',reference:childId});return {ok:true}}finally{SpreadsheetApp.flush();lock.releaseLock()}
}
function requestChildEmailCorrection(token,childId,email){const user=requirePortalParent_(token);requireChild_(user,childId);return submitParentFeedback(token,'ISSUE','Child email correction requested. Learner '+childId+'; requested student Google email: '+studentEmail_(email)+'. Please verify before changing access.')}
function updateParentDetails(token,id,input){
 const admin=requireAccountAdmin_(token),sub=String(id||'').replace(/^google:/,''),name=String(input?.name||'').trim(),email=String(input?.email||'').trim().toLowerCase();if(!/^google:[A-Za-z0-9_-]{1,255}$/.test(id)||!name||name.length>80||email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Enter a valid parent name and contact email');
 const lock=LockService.getScriptLock();lock.waitLock(10000);try{if(!update_('Parents','googleSub',sub,{displayName:name,email}))throw Error('Parent profile not found. The parent must sign in first.');rows_('Enrolments').filter(e=>String(e.parentSub)===sub).forEach(e=>update_('Enrolments','requestId',e.requestId,{parentEmail:email}));append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(admin.sub),action:'PARENT_DETAILS_UPDATED',reference:id});return {ok:true}}finally{SpreadsheetApp.flush();lock.releaseLock()}
}
/** Owner-side helper: stores only a public GIS client ID. Google Console origins still require owner setup. */
function configureGoogleOAuth_(clientId){
 const id=String(clientId||props_().getProperty('GOOGLE_CLIENT_ID')||'').trim();
 if(!/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(id))throw Error('Create a Web application OAuth client in Google Cloud and supply its client ID');
 props_().setProperty('GOOGLE_CLIENT_ID',id);
 return {clientIdConfigured:true,roles:['PARENT','STUDENT','ADMIN'],googleConsoleSetupRequired:true};
}

/** Called only by the linked spreadsheet's simple onEdit trigger; never exposed through RPC. */
function syncFamilyAccountEdit_(event){
 if(!event?.range)return;const range=event.range,sheet=range.getSheet(),name=sheet.getName();if(!['Children','Parents','StudentAccounts','Enrolments'].includes(name)||range.getRow()<2)return;
 const lock=LockService.getScriptLock();lock.waitLock(10000);try{
  const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(String),key=headers[range.getColumn()-1];
  for(let i=range.getRow();i<=range.getLastRow();i++){
   const values=sheet.getRange(i,1,1,headers.length).getValues()[0],row=Object.fromEntries(headers.map((h,j)=>[h,values[j]]));
   if(name==='Children'&&row.childId){const patch=Object.fromEntries(['nickname','year','school','language'].map(k=>[k,row[k]]));if(row.status==='REMOVED'){patch.status='REMOVED';latestStudentLinks_().filter(l=>String(l.childId)===String(row.childId)).forEach(l=>append_('StudentAccounts',{...l,status:'REVOKED',linkedAt:new Date().toISOString(),linkedBy:'SHEET_EDITOR'}))}syncChildEnrolments_(String(row.childId),patch)}
   if(name==='Parents'&&row.googleSub){rows_('Enrolments').filter(e=>String(e.parentSub)===String(row.googleSub)).forEach(e=>update_('Enrolments','requestId',e.requestId,{parentEmail:row.email}))}
   if(name==='StudentAccounts'&&row.childId){
    const email=studentEmail_(row.email),oldKey=String(row.studentKey),newKey='email:'+email;
    if(oldKey!==newKey){append_('StudentAccounts',{...row,studentKey:oldKey,email:oldKey.replace(/^email:/,''),status:'REVOKED',linkedAt:new Date().toISOString(),linkedBy:'SHEET_EDITOR'});sheet.getRange(i,headers.indexOf('studentKey')+1).setValue(newKey);sheet.getRange(i,headers.indexOf('googleSub')+1).setValue('');append_('StudentAccounts',{...row,studentKey:newKey,email,googleSub:'',linkedAt:new Date().toISOString(),linkedBy:'SHEET_EDITOR'})}
    const child=rows_('Children').find(c=>String(c.childId)===String(row.childId));syncChildEnrolments_(String(row.childId),{studentEmail:email,status:child&&child.status!=='REMOVED'&&String(row.status).toUpperCase()==='ACTIVE'?'APPROVED':'DISABLED'});
   }
   if(name==='Enrolments'&&row.childId&&['nickname','year','school','language'].includes(key)){const patch={[key]:row[key]};update_('Children','childId',String(row.childId),patch);syncChildEnrolments_(String(row.childId),patch)}
   if(name==='Enrolments'&&row.childId&&key==='studentEmail'){const email=studentEmail_(row.studentEmail),child=rows_('Children').find(c=>String(c.childId)===String(row.childId));assertStudentEmail_(email,String(row.parentSub),String(row.childId));const current=latestStudentLinks_().filter(l=>String(l.childId)===String(row.childId)).slice(-1)[0];writeStudentLink_(String(row.childId),String(row.parentSub),email,child&&child.status!=='REMOVED'&&current?.status==='ACTIVE'?'ACTIVE':'REVOKED','SHEET_EDITOR')}
  }
 }catch(error){range.setNote('Account synchronization failed: '+error.message);throw error}finally{SpreadsheetApp.flush();lock.releaseLock()}
}
