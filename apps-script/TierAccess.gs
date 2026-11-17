/** Sheet-driven entitlements. Missing, duplicate or malformed rules deny access. */
const MEMBERSHIP_TIERS_ = ['FREE','PREMIUM','PREMIUM_KASIH'];
function trueCell_(value){return value===true||String(value).toUpperCase()==='TRUE'}
function moduleRule_(moduleId,rules){
 const matches=(rules||rows_('ModuleAccess')).filter(row=>String(row.moduleId)===moduleId);
 return matches.length===1?matches[0]:null;
}
function moduleDecision_(user,moduleId,rules,currentPlan){
 const rule=moduleRule_(moduleId,rules),plan=currentPlan||access_(user).plan;
 const column={FREE:'free',PREMIUM:'premium',PREMIUM_KASIH:'premiumKasih'}[plan];
 return {moduleId,plan,title:rule?String(rule.title):moduleId,
  allowed:!(user.role==='STUDENT'&&['parent-reports','adult-ai','adult-hobby'].includes(moduleId))&&!!rule&&trueCell_(rule.enabled)&&!!column&&trueCell_(rule[column]),
  freeLessonLimit:rule&&Number.isInteger(Number(rule.freeLessonLimit))&&Number(rule.freeLessonLimit)>=0?Number(rule.freeLessonLimit):0};
}
function requireModule_(user,moduleId){
 const decision=moduleDecision_(user,moduleId);
 if(!decision.allowed)throw Error('[MODULE_DENIED] Your plan does not include '+decision.title+'.');
 return decision;
}
function authorizeModule(token,moduleId){return withAuth_(token,user=>{
 if(typeof moduleId!=='string'||!/^[a-z][a-z0-9-]{1,60}$/.test(moduleId))throw Error('Invalid module');
 return moduleDecision_(user,moduleId);
})}
function moduleSummary_(user){const rules=rows_('ModuleAccess'),plan=access_(user).plan;return rules.map(row=>moduleDecision_(user,String(row.moduleId),rules,plan))}
function requireLessonAccess_(user,lesson){
 const decision=requireModule_(user,'study-library');
 if(decision.plan!=='FREE')return;
 // A legacy premium flag remains a per-lesson restriction for Free accounts.
 if(trueCell_(lesson.premium))throw Error('Membership required for this lesson');
 const candidates=rows_('Lessons').filter(row=>String(row.year)===String(lesson.year)&&String(row.subject)===String(lesson.subject)&&String(row.school||'ALL')===String(lesson.school||'ALL')&&!trueCell_(row.premium)).sort((a,b)=>String(a.lessonId).localeCompare(String(b.lessonId)));
 if(!candidates.slice(0,decision.freeLessonLimit).some(row=>String(row.lessonId)===String(lesson.lessonId)))throw Error('[MODULE_DENIED] Free lesson limit reached for this subject and year.');
}
function seedModuleAccess_(){
 if(typeof BIJAK_APP_MODULES==='undefined')throw Error('Add generated ModuleData.gs before setup');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const existing=new Set(rows_('ModuleAccess').map(row=>String(row.moduleId)));
  let added=0;
  BIJAK_APP_MODULES.forEach(module=>{if(!existing.has(module.moduleId)){
   append_('ModuleAccess',{...module,updatedAt:new Date().toISOString()});existing.add(module.moduleId);added++;
  }});
  return {added,total:existing.size};
 }finally{lock.releaseLock()}
}
/** Run in editor after setting Script Properties. No public setup endpoint. */
function setupBijakLearn_(){
 initializeDatabase_();
 const modules=seedModuleAccess_();
 configureModuleAccessSheet_();
 const curriculum=importFullJuniorCurriculum_();
 const growth=importGrowthModules_();
 const documents=setupKasihFolder_();
 const retention=setupKasihRetention_();
 return {modules,curriculum,growth,documents,retention,oauth:oauthSetupStatus_()};
}
function importGrowthModules_(){
 if(typeof BIJAK_GROWTH_TRACKS==='undefined')throw Error('Add generated ModuleData.gs');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const modules=new Set(rows_('ModuleCatalog').map(row=>String(row.moduleId)));
  const lessons=new Set(rows_('ModuleLessons').map(row=>String(row.lessonId)));
  let addedModules=0,addedLessons=0;
  BIJAK_GROWTH_TRACKS.forEach(track=>{
   const id=track.audience+'-'+track.kind;
   if(!modules.has(id)){append_('ModuleCatalog',{moduleId:id,audience:track.audience,title:track.title,tagline:track.tagline,icon:track.icon,visibility:'PUBLIC_PREVIEW',accessTier:'FREE',contentStatus:'DRAFT_TEACHER_REVIEW',reviewStatus:'DRAFT',updatedAt:new Date().toISOString()});modules.add(id);addedModules++;}
   track.lessons.forEach((lesson,index)=>{if(!lessons.has(lesson.id)){
    append_('ModuleLessons',{lessonId:lesson.id,moduleId:id,sequence:index+1,title:lesson.title,summary:lesson.summary,stepsJson:JSON.stringify(lesson.steps),questionJson:JSON.stringify(lesson.quiz),project:lesson.challenge,visibility:'PUBLIC_PREVIEW',contentStatus:'DRAFT_TEACHER_REVIEW',reviewStatus:'DRAFT',updatedAt:new Date().toISOString()});lessons.add(lesson.id);addedLessons++;
   }});
  });
  return {addedModules,addedLessons};
 }finally{lock.releaseLock()}
}
function setMembership(token,accountKey,plan,months,reason){
 const admin=requireAccountAdmin_(token);
 if(typeof accountKey!=='string'||!/^google:[A-Za-z0-9_-]{1,255}$/.test(accountKey))throw Error('Choose a valid account');
 if(!MEMBERSHIP_TIERS_.includes(plan)||plan==='PREMIUM_KASIH')throw Error('Premium Kasih must be granted by reviewing an application');
 const sub=accountKey.slice(7),note=String(reason||'').trim();
 if(!note||note.length>250)throw Error('Enter a reason of 1–250 characters');
 const lifetime=months==='LIFETIME',duration=Number(months);
 if(plan!=='FREE'&&!lifetime&&(!Number.isInteger(duration)||duration<1||duration>12))throw Error('Duration must be 1–12 months');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  if(!rows_('Parents').some(row=>String(row.googleSub)===sub)&&!rows_('AccountAccess').some(row=>row.accountKey===accountKey))throw Error('Account not found');
  const expiry=plan==='FREE'||lifetime?'':new Date(Date.now()+duration*30*86400000).toISOString();
  append_('Subscriptions',{googleSub:sub,plan,status:'ACTIVE',expiresAt:expiry,updatedAt:new Date().toISOString(),adminNote:note,lifetime:lifetime?'TRUE':'FALSE'});
  append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(admin.sub),action:'MEMBERSHIP_'+plan,reference:accountKey});
  return {plan,expiresAt:expiry||null};
 }finally{lock.releaseLock()}
}
function oauthSetupStatus_(){
 const settings=props_();
 return {clientIdConfigured:!!settings.getProperty('GOOGLE_CLIENT_ID'),spreadsheetConfigured:!!settings.getProperty('SPREADSHEET_ID'),adminConfigured:!!settings.getProperty('ACCOUNT_ADMIN_GOOGLE_SUB'),pinPepperConfigured:!!settings.getProperty('PIN_PEPPER'),documentsConfigured:!!settings.getProperty('KASIH_DOCUMENTS_FOLDER_ID')};
}

function setupKasihRetention_(){
 if(!ScriptApp.getProjectTriggers().some(trigger=>trigger.getHandlerFunction()==='purgeKasihEvidence_'))ScriptApp.newTrigger('purgeKasihEvidence_').timeBased().everyDays(1).create();
 return {dailyPurgeConfigured:true};
}
/** Checkbox validations do not overwrite existing operator choices. */
function configureModuleAccessSheet_(){
 const sheet=sheet_('ModuleAccess'),length=Math.max(1,sheet.getLastRow()-1);
 const booleanRule=SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();
 sheet.getRange(2,4,length,4).setDataValidation(booleanRule);
 sheet.getRange(2,8,length,1).setDataValidation(SpreadsheetApp.newDataValidation().requireNumberGreaterThanOrEqualTo(0).setAllowInvalid(false).build());
 sheet.setFrozenRows(1);
 sheet.getRange(1,1,1,TABLES.ModuleAccess.length).setFontWeight('bold');
}
function onOpen(){
 SpreadsheetApp.getUi().createMenu('BijakLearn').addItem('Initialize app and import modules','setupBijakFromSheet_').addToUi();
}
function setupBijakFromSheet_(){
 const result=setupBijakLearn_();
 SpreadsheetApp.getUi().alert('Setup finished. Added '+result.modules.added+' app modules. Open ModuleAccess to adjust tier checkboxes. Configure Google OAuth before testing live sign-in.');
}

