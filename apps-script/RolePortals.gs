/** Role-specific data contracts. Roles and family ownership come from verified Google identity. */
function portalIdentity_(token){
 const verified=verify_(token);
 if(verified.ownerRoleAccess)return verified;
 if(isAccountAdmin_(verified))return {...verified,role:'ADMIN'};
 const link=studentLink_(verified);
 if(link)return bindStudentIdentity_(verified);
 requireActiveAccount_(verified,true);upsertParent_(verified);return {...verified,role:'PARENT'};
}
function getPortalBootstrap(token,requestedRole,referralCode,roleSelection){
 const verified=verify_(token);
 if(typeof isOwnerAccount_==='function'&&isOwnerAccount_(verified)&&(roleSelection==='owner-roles-v1'||verified.ownerRoleAccess))return ownerPortalBootstrap_(verified,requestedRole);
 if(typeof registerReferralOnboarding_==='function')registerReferralOnboarding_(verify_(token),referralCode);
 const user=portalIdentity_(token);
 if(requestedRole==='admin'&&user.role!=='ADMIN')throw Error('Administrator access required');
 if(user.role==='ADMIN')return {role:'ADMIN',user:{name:user.name,email:user.email},canManageAccounts:true,children:[],lessons:[],modules:[],access:{plan:'ADMIN',active:true}};
 if(user.role==='STUDENT')return getStudentBootstrap(token);
 if(requestedRole==='student')throw Error('[STUDENT_NOT_LINKED] Ask your parent to enrol your separate student account.');
 return {role:'PARENT',parent:parentDetails_(user),canManageAccounts:false,children:familyChildren_(user),lessons:[],modules:[],access:access_(user)};
}
/** The configured Google owner may use each real role; the role is verified on every request. */
function ownerRoleIdentity_(verified,role,childId,createLearner){
 if(!isOwnerAccount_(verified))throw Error('Only the configured owner can choose multiple roles.');
 if(!['parent','student','admin'].includes(role))throw Error('Choose Parent, Student or BijakLearn Team sign-in.');
 const user={...verified,role:role.toUpperCase(),ownerRoleAccess:true};
 if(role==='admin')return user;
 if(role==='parent'){upsertParent_(user);return user}
 if(createLearner)ensureOwnerLearner_(verified);
 const links=latestStudentLinks_().filter(l=>String(l.parentSub)===verified.sub&&l.email===verified.email.toLowerCase()&&(!childId||String(l.childId)===childId));
 const link=links.slice(-1)[0];
 if(!link||link.status!=='ACTIVE'||String(link.googleSub)!==verified.sub)throw Error('[STUDENT_REVOKED] Your learner access is disabled. Use BijakLearn Team sign-in to manage it.');
 const child=rows_('Children').find(c=>String(c.childId)===String(link.childId)&&String(c.parentSub)===verified.sub&&c.status!=='REMOVED');
 if(!child)throw Error('[STUDENT_REVOKED] Your learner profile is unavailable. Restore it from the BijakLearn Team console.');
 return {...user,familySub:verified.sub,studentChildId:String(child.childId)};
}
function ensureOwnerLearner_(user){
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  upsertParent_(user);
  const links=latestStudentLinks_().filter(l=>l.email===user.email.toLowerCase());
  if(links.some(l=>String(l.parentSub)!==user.sub||(l.googleSub&&String(l.googleSub)!==user.sub)))throw Error('[STUDENT_REVOKED] Resolve the conflicting owner learner link in the BijakLearn Team console.');
  if(links.length)return;
  const childId='owner-'+user.sub;
  if(rows_('Children').some(c=>String(c.childId)===childId)||rows_('Enrolments').some(e=>String(e.childId)===childId))throw Error('[STUDENT_REVOKED] Restore the existing owner learner from the BijakLearn Team console.');
  const now=new Date().toISOString();
  append_('Children',{childId,parentSub:user.sub,nickname:user.name||'My learner profile',year:1,school:'SK',language:'en',status:'ACTIVE',createdAt:now});
  append_('StudentAccounts',{studentKey:'email:'+user.email.toLowerCase(),email:user.email.toLowerCase(),googleSub:user.sub,childId,parentSub:user.sub,status:'ACTIVE',linkedAt:now,linkedBy:accountKey_(user.sub)});
  append_('Enrolments',{requestId:Utilities.getUuid(),parentSub:user.sub,parentEmail:user.email,studentEmail:user.email.toLowerCase(),nickname:user.name||'My learner profile',year:1,school:'SK',language:'en',consentAt:now,status:'APPROVED',childId,createdAt:now,reviewedAt:now,reviewedBy:accountKey_(user.sub)});
  append_('Audit',{timestamp:now,actor:accountKey_(user.sub),action:'OWNER_LEARNER_LINKED',reference:childId});
 }finally{SpreadsheetApp.flush();lock.releaseLock()}
}
function ownerPortalBootstrap_(verified,requestedRole){
 const role=requestedRole||'parent';
 if(verified.ownerRoleAccess&&verified.role.toLowerCase()!==role)throw Error('Sign out before changing your account role.');
 const user=ownerRoleIdentity_(verified,role,verified.studentChildId,true);
 if(role==='admin')return {role:'ADMIN',ownerRoleAccess:true,user:{name:user.name,email:user.email},canManageAccounts:true,children:[],lessons:[],modules:[],access:{plan:'ADMIN',active:true}};
 if(role==='parent')return {role:'PARENT',ownerRoleAccess:true,parent:parentDetails_(user),canManageAccounts:false,children:familyChildren_(user),lessons:[],modules:[],access:access_(user)};
 const child=requireChild_(user,user.studentChildId);
 return {role:'STUDENT',ownerRoleAccess:true,user:{name:String(child.nickname),email:user.email},parent:null,canManageAccounts:false,children:[{id:String(child.childId),name:String(child.nickname),year:Number(child.year),school:String(child.school),language:String(child.language||'en')}],access:access_(user),modules:moduleSummary_(user),lessons:lessonCatalogue_(),scholarship:null};
}
function familyChildren_(user){return rows_('Children').filter(c=>String(c.parentSub)===user.sub&&c.status!=='REMOVED').map(c=>({id:String(c.childId),name:String(c.nickname),year:Number(c.year),school:String(c.school),language:String(c.language)}))}
function requirePortalParent_(token){const user=portalIdentity_(token);if(user.role!=='PARENT')throw Error('Parent account required');return user}
function getParentDashboard(token){
 const user=requirePortalParent_(token),attempts=rows_('Attempts'),mastery=rows_('Mastery'),usage=rows_('UsageEvents');
 return {syncedAt:new Date().toISOString(),parent:parentDetails_(user),access:access_(user),children:familyChildren_(user).map(child=>{
  const checks=attempts.filter(a=>String(a.childId)===child.id),progress=mastery.filter(m=>String(m.childId)===child.id),time=usage.filter(e=>String(e.childId)===child.id),correct=checks.filter(a=>String(a.correct)==='true').length;
  const dates=Array.from(new Set(time.map(e=>String(e.createdAt).slice(0,10)))).sort().slice(-14);
  return {...child,attempts:checks.length,correct,accuracy:checks.length?Math.round(100*correct/checks.length):null,mastered:progress.filter(m=>String(m.mastered)==='true').length,reportedSeconds:time.reduce((n,e)=>n+(Number(e.seconds)||0),0),dailyUsage:dates.map(date=>({date,seconds:time.filter(e=>String(e.createdAt).startsWith(date)).reduce((n,e)=>n+(Number(e.seconds)||0),0)})),recent:checks.slice(-20).reverse().map(a=>({lessonId:String(a.lessonId),correct:String(a.correct)==='true',hints:Number(a.hints),createdAt:String(a.createdAt)}))};
 }),enrolments:familyEnrolments_(user.sub),feedback:rows_('ParentFeedback').filter(r=>String(r.parentSub)===user.sub).slice(-50).reverse().map(r=>({id:r.feedbackId,category:r.category,message:r.message,status:r.status,reply:r.reply,createdAt:r.createdAt}))};
}
function submitParentEnrolment(token,details){if(typeof linkParentChild==='function')return linkParentChild(token,details);
 const user=requirePortalParent_(token);details=details||{};
 const email=String(details.studentEmail||'').trim().toLowerCase(),name=String(details.name||'').trim(),year=Number(details.year);
 if(!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||email===user.email.toLowerCase()||!name||name.length>40||!Number.isInteger(year)||year<1||year>6||details.consent!==true)throw Error('Provide a separate student email, nickname, school year and guardian consent');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  if(rows_('Parents').some(p=>String(p.email).toLowerCase()===email))throw Error('Use a separate student Google account');
  if(rows_('Enrolments').some(r=>String(r.studentEmail).toLowerCase()===email&&['PENDING','APPROVED'].includes(String(r.status))))throw Error('This student already has an enrolment request');
  if(rows_('Enrolments').filter(r=>String(r.parentSub)===user.sub&&r.status==='PENDING').length>=5)throw Error('Maximum five pending enrolments');
  const now=new Date().toISOString(),requestId=Utilities.getUuid();
  append_('Enrolments',{requestId,parentSub:user.sub,parentEmail:user.email,studentEmail:email,nickname:name,year,school:['SK','SJKC','SJKT'].includes(details.school)?details.school:'SK',language:['ms','en','zh','ta'].includes(details.language)?details.language:'ms',consentAt:now,status:'PENDING',childId:Utilities.getUuid(),createdAt:now});
  append_('Audit',{timestamp:now,actor:accountKey_(user.sub),action:'ENROLMENT_REQUESTED',reference:requestId});return {id:requestId,status:'PENDING'};
 }finally{lock.releaseLock()}
}
function listEnrolments(token){requireAccountAdmin_(token);return rows_('Enrolments').slice(-200).reverse()}
function reviewEnrolment(token,requestId,approve){
 const admin=requireAccountAdmin_(token);if(typeof approve!=='boolean')throw Error('Choose approve or decline');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const request=rows_('Enrolments').find(r=>String(r.requestId)===requestId);if(!request)throw Error('Enrolment not found');
  if(request.status!=='PENDING')return {status:request.status};
  if(approve){
   const parent=rows_('Parents').find(p=>String(p.googleSub)===String(request.parentSub));if(!parent)throw Error('Verified parent account unavailable');
   requireActiveAccount_({sub:String(parent.googleSub),email:String(parent.email)},false);
   const email=String(request.studentEmail).toLowerCase();
   if(rows_('Parents').some(p=>String(p.email).toLowerCase()===email)||email===admin.email.toLowerCase())throw Error('Student account must be separate from parent and administrator');
   const prior=latestStudentLinks_().find(r=>String(r.email).toLowerCase()===email);
   if(prior&&prior.status==='ACTIVE'&&String(prior.childId)!==String(request.childId))throw Error('Student is already linked to a different profile');
   const existing=rows_('Children').find(c=>String(c.childId)===String(request.childId));
   if(existing&&String(existing.parentSub)!==String(parent.googleSub))throw Error('Profile ownership conflict');
   if(!existing&&rows_('Children').filter(c=>String(c.parentSub)===String(parent.googleSub)).length>=5)throw Error('Maximum five children per parent');
   if(!existing)append_('Children',{childId:request.childId,parentSub:String(parent.googleSub),nickname:request.nickname,year:request.year,school:request.school,language:request.language,createdAt:new Date().toISOString()});
   append_('StudentAccounts',{studentKey:'email:'+email,email,googleSub:prior?.googleSub||'',childId:request.childId,parentSub:String(parent.googleSub),status:'ACTIVE',linkedAt:new Date().toISOString(),linkedBy:accountKey_(admin.sub)});
  }
  const status=approve?'APPROVED':'DECLINED';update_('Enrolments','requestId',requestId,{status,reviewedAt:new Date().toISOString(),reviewedBy:accountKey_(admin.sub)});
  append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(admin.sub),action:'ENROLMENT_'+status,reference:requestId});return {status};
 }finally{lock.releaseLock()}
}
function submitParentFeedback(token,category,message){
 const parent=requirePortalParent_(token),text=String(message||'').trim();
 if(!['SUGGESTION','COMMENT','ISSUE'].includes(category)||text.length<5||text.length>2000)throw Error('Choose a category and write 5–2000 characters');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{const last=rows_('ParentFeedback').filter(r=>String(r.parentSub)===parent.sub).slice(-1)[0];if(last&&Date.now()-Date.parse(String(last.createdAt))<30000)throw Error('Please wait 30 seconds before sending another message');
 const feedbackId=Utilities.getUuid();append_('ParentFeedback',{feedbackId,parentSub:parent.sub,parentEmail:parent.email,category,message:text,createdAt:new Date().toISOString(),status:'NEW'});return {id:feedbackId};
 }finally{lock.releaseLock()}
}
function listParentFeedback(token){requireAccountAdmin_(token);return rows_('ParentFeedback').slice(-200).reverse()}
function replyParentFeedback(token,id,reply){const admin=requireAccountAdmin_(token),text=String(reply||'').trim();if(!text||text.length>1500)throw Error('Write a reply of up to 1500 characters');if(!update_('ParentFeedback','feedbackId',id,{reply:text,status:'ANSWERED',repliedAt:new Date().toISOString()}))throw Error('Feedback not found');append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(admin.sub),action:'PARENT_FEEDBACK_REPLIED',reference:id});return {ok:true}}
function recordStudentUsage(token,eventId,moduleId,seconds){
 return withAuth_(token,user=>{
  if(user.role!=='STUDENT')throw Error('Student account required');requireChild_(user,user.studentChildId);
  if(!/^[a-f0-9-]{36}$/.test(String(eventId))||!/^[-a-z0-9]{1,50}$/.test(String(moduleId))||!Number.isFinite(seconds)||seconds<0||seconds>60)throw Error('Invalid usage event');
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
   const events=rows_('UsageEvents');if(events.some(e=>String(e.eventId)===eventId))return {recorded:false};
   const last=events.filter(e=>String(e.childId)===user.studentChildId).slice(-1)[0],now=Date.now();
   // The first event establishes a baseline; duplicate tabs cannot report more than elapsed wall time.
   const elapsed=last?Math.max(0,Math.floor((now-Date.parse(String(last.createdAt)))/1000)):0;
   const accepted=Math.min(60,Math.floor(seconds),elapsed);
   append_('UsageEvents',{eventId,childId:user.studentChildId,googleSub:user.sub,moduleId,seconds:accepted,createdAt:new Date(now).toISOString()});return {recorded:true,seconds:accepted};
  }finally{lock.releaseLock()}
 });
}
function getAdministrationOverview(token){
 requireAccountAdmin_(token);const events=rows_('UsageEvents'),since=Date.now()-7*86400000;
 return {syncedAt:new Date().toISOString(),databaseUrl:'https://docs.google.com/spreadsheets/d/'+database_().getId()+'/edit',settings:oauthSetupStatus_(),modules:rows_('ModuleAccess'),parents:rows_('Parents').map(p=>({id:accountKey_(String(p.googleSub)),email:p.email})),children:rows_('Children').length,payments:rows_('Payments').slice(-100).reverse(),reportedSeconds7Days:events.filter(e=>Date.parse(String(e.createdAt))>=since).reduce((n,e)=>n+(Number(e.seconds)||0),0),activityEvents:events.length};
}
function setModulePolicy(token,moduleId,policy){
 const admin=requireAccountAdmin_(token),current=rows_('ModuleAccess').find(m=>String(m.moduleId)===moduleId);if(!current)throw Error('Unknown module');
 const patch={};for(const key of ['enabled','free','premium','premiumKasih']){if(typeof policy?.[key]!=='boolean')throw Error('Choose a valid tier policy');patch[key]=policy[key]?'TRUE':'FALSE';}
 const limit=Number(policy.freeLessonLimit);if(!Number.isInteger(limit)||limit<0||limit>1000)throw Error('Free lesson limit must be 0–1000');
 patch.freeLessonLimit=limit;patch.updatedAt=new Date().toISOString();if(!update_('ModuleAccess','moduleId',moduleId,patch))throw Error('Module was removed. Refresh and try again.');
 append_('Audit',{timestamp:patch.updatedAt,actor:accountKey_(admin.sub),action:'MODULE_POLICY_UPDATED',reference:moduleId});return {ok:true};
}
function recordPaymentReview(token,details){
 const admin=requireAccountAdmin_(token),accountKey=String(details?.accountKey||''),reference=String(details?.reference||'').trim(),amount=Number(details?.amountRM),note=String(details?.note||'').trim(),status=details?.status;
 if(!accountKey.startsWith('google:')||!rows_('Parents').some(p=>accountKey_(String(p.googleSub))===accountKey)||reference.length<3||reference.length>100||!Number.isFinite(amount)||amount<=0||amount>100000||Math.abs(amount*100-Math.round(amount*100))>0.00001||!['VERIFIED','REJECTED'].includes(status)||!note||note.length>250)throw Error('Provide a verified family, payment reference, positive RM amount and review note');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{if(rows_('Payments').some(p=>String(p.reference)===reference))throw Error('Payment reference already recorded');
 const paymentId=Utilities.getUuid();append_('Payments',{paymentId,googleSub:accountKey.slice(7),reference,amountRM:amount,status,verifiedAt:new Date().toISOString(),adminNote:note});append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(admin.sub),action:'PAYMENT_REVIEW_'+status,reference:paymentId});return {ok:true};
 }finally{lock.releaseLock()}
}
/** Explicit RPC allowlist: never dispatch a client-supplied global function name. */
function portalRequest(method,args){
 if(typeof method!=='string'||!Array.isArray(args)||args.length>8||JSON.stringify(args).length>3000000)throw Error('Invalid account request');
 const operations={getEducationalVideos,setEducationalVideos,updateChildAccount,updateChildDetails,updateParentDetails,requestChildEmailCorrection,removeChildLink,setDiscountEnabled,uploadPaymentQr,getFamilyCommerce,linkParentChild,getCommerceAdministration,setCommerceSettings,saveDiscountCampaign,createFamilyOrder,submitOrderProof,listFamilyOrders,reviewFamilyOrder,getPrivateUpload,recordCommissionPayout,getPortalBootstrap,getParentDashboard,submitParentEnrolment,listEnrolments,reviewEnrolment,submitParentFeedback,listParentFeedback,replyParentFeedback,recordStudentUsage,getAdministrationOverview,setModulePolicy,recordPaymentReview,listAccountAccess,setAccountAccess,listStudentAccounts,listStudentProfiles,setStudentAccount,setMembership,listKasihApplications,getKasihDocument,reviewKasihApplication,submitKasihApplication,getKasihApplication,addChild,getLesson,submitAttempt,getParentReport,setParentPin,getGrowthModule,checkGrowthAnswer,authorizeModule,askTutor};
 if(!Object.prototype.hasOwnProperty.call(operations,method))throw Error('Unsupported account request');
 RPC_ROWS_=new Map();RPC_DATABASE_=null;
 try{return operations[method].apply(null,args)}finally{SpreadsheetApp.flush();RPC_ROWS_=null;RPC_DATABASE_=null}

}

function parentDetails_(user){const row=rows_('Parents').find(p=>String(p.googleSub)===user.sub);return {name:String(row?.displayName||user.name||''),email:String(row?.email||user.email||''),signInEmail:String(user.email||'')}}
function familyEnrolments_(parentSub){const children=rows_('Children'),links=latestStudentLinks_();return rows_('Enrolments').filter(r=>String(r.parentSub)===parentSub).map(r=>{const child=children.find(c=>String(c.childId)===String(r.childId)&&String(c.parentSub)===parentSub),related=links.filter(l=>String(l.childId)===String(r.childId)&&String(l.parentSub)===parentSub),link=related.find(l=>l.status==='ACTIVE')||related.slice(-1)[0];let status=r.status;if(['REMOVED','DECLINED'].includes(r.status)||child?.status==='REMOVED')status='REMOVED';else if(!child&&link)status='PROFILE_MISSING';else if(child)status=link?.status==='ACTIVE'?'ACTIVE':link?'DISABLED':'UNLINKED';return {id:r.requestId,childId:String(r.childId),studentEmail:link?.email||r.studentEmail,name:child?.nickname||r.nickname,year:Number(child?.year??r.year??1),school:child?.school||r.school||'SK',language:child?.language||r.language||'ms',status}})}
