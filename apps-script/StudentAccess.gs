/** Parents link their own learners; only an administrator changes or revokes existing links. */
function latestStudentLinks_(){
 const latest=new Map();
 rows_('StudentAccounts').forEach(row=>latest.set(String(row.studentKey),row));
 return Array.from(latest.values());
}
function studentLink_(user){
 const email=String(user.email||'').toLowerCase();
 const matches=latestStudentLinks_().filter(row=>(row.googleSub&&String(row.googleSub)===user.sub)||String(row.email).toLowerCase()===email);
 if(matches.length>1)throw Error('[STUDENT_REVOKED] Student identity has conflicting profile links. Contact the administrator.');
 const link=matches[0];
 if(link&&link.googleSub&&String(link.googleSub)!==user.sub)throw Error('[STUDENT_REVOKED] This Google account does not match the linked student identity.');
 return link||null;
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
 requireAccountAdmin_(token);
 const parents=rows_('Parents');
 return rows_('Children').map(child=>({id:String(child.childId),name:String(child.nickname),parentEmail:String(parents.find(parent=>String(parent.googleSub)===String(child.parentSub))?.email||'')}));
}
function listStudentAccounts(token){
 requireAccountAdmin_(token);
 return latestStudentLinks_().map(link=>({id:String(link.studentKey),email:String(link.email),childId:String(link.childId),status:String(link.status),bound:!!link.googleSub}));
}
function setStudentAccount(token,email,childId,status){
 const admin=requireAccountAdmin_(token);
 const address=typeof email==='string'?email.trim().toLowerCase():'';
 if(address.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(address)||!['ACTIVE','REVOKED'].includes(status))throw Error('Enter a valid student email and access status');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const child=rows_('Children').find(row=>String(row.childId)===childId);
  if(!child||child.status==='REMOVED')throw Error('Choose an existing learner profile');
  if(rows_('Parents').some(parent=>String(parent.email).toLowerCase()===address)||String(admin.email).toLowerCase()===address)throw Error('Use a separate student Google account, not a parent or administrator account');
  const studentKey='email:'+address,previous=latestStudentLinks_().find(row=>String(row.studentKey)===studentKey);
  if(previous&&String(previous.childId)!==childId&&previous.status==='ACTIVE')throw Error('Revoke the existing student link before changing the learner profile');
  if(status==='REVOKED'&&!previous)throw Error('Student link not found');
  const row={studentKey,email:address,googleSub:previous?.googleSub||'',childId:status==='REVOKED'?previous.childId:childId,parentSub:status==='REVOKED'?previous.parentSub:child.parentSub,status,linkedAt:new Date().toISOString(),linkedBy:accountKey_(admin.sub)};
  append_('StudentAccounts',row);
  if(status==='ACTIVE'&&!child.status)update_('Children','childId',childId,{status:'ACTIVE'});
  append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(admin.sub),action:'STUDENT_'+status,reference:studentKey});
  return {id:studentKey,email:address,childId:String(row.childId),status};
 }finally{lock.releaseLock()}
}
/** Owner-side helper: stores only a public GIS client ID. Google Console origins still require owner setup. */
function configureGoogleOAuth_(clientId){
 const id=String(clientId||props_().getProperty('GOOGLE_CLIENT_ID')||'').trim();
 if(!/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(id))throw Error('Create a Web application OAuth client in Google Cloud and supply its client ID');
 props_().setProperty('GOOGLE_CLIENT_ID',id);
 return {clientIdConfigured:true,roles:['PARENT','STUDENT','ADMIN'],googleConsoleSetupRequired:true};
}

