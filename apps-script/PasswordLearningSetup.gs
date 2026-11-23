/** Run twice from the backing project's Apps Script editor to check additive setup. */
function setupPasswordSignInAndLearning(){
 const email=Session.getActiveUser().getEmail();
 if(!email||email!==Session.getEffectiveUser().getEmail())throw Error('Run setup as the Apps Script owner.');
 const authentication=setupPasswordAuthentication_();
 const lock=LockService.getScriptLock();
 lock.waitLock(10000);
 let modulesAdded=0;
 try{
  const existing=new Set(rows_('ModuleAccess').map(row=>String(row.moduleId)));
  for(const module of BIJAK_LEARNING_ADDITIONS_.modules){
   if(existing.has(module.moduleId))continue;
   append_('ModuleAccess',{...module,updatedAt:new Date().toISOString()});
   existing.add(module.moduleId);
   modulesAdded++;
  }
 }finally{SpreadsheetApp.flush();lock.releaseLock()}
 const curriculum=importJuniorCurriculumBundle_(BIJAK_LEARNING_ADDITIONS_.lessons);
 console.log(JSON.stringify({authentication,modulesAdded,lessonsAdded:curriculum.addedLessons,questionsAdded:curriculum.addedQuestions}));
 return {authentication,modulesAdded,lessonsAdded:curriculum.addedLessons,questionsAdded:curriculum.addedQuestions};
}
