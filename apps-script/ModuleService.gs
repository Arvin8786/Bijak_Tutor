/**
 * Authenticated Module Library (server-side). Backed by owner-only Google Sheets tabs.
 * Public pages show starter material; any paid/private lesson must be delivered
 * only after identity and entitlement checks. Never publish raw sheet URLs or tokens.
 */
function getGrowthModule(token,moduleId){
 return withAuth_(token,user=>{
  const id=String(moduleId||'').trim().slice(0,70);
  if(!/^(junior|adult)-(ai|hobby)$/.test(id))throw Error('Unknown learning module');
  const module=rows_('ModuleCatalog').find(row=>String(row.moduleId)===id);
  if(!module)throw Error('This learning module is not available yet');
  if(String(module.visibility)==='HIDDEN')throw Error('Module is not published');
  const tier=String(module.accessTier||'FREE').toUpperCase();
  if(tier!=='FREE'&&!access_(user).active)throw Error('An active membership is required for this module');
  const approvedOnly=tier!=='FREE'||String(module.visibility)==='PRIVATE';
  const lessons=rows_('ModuleLessons')
   .filter(row=>String(row.moduleId)===id)
   .filter(row=>String(row.visibility)==='PUBLIC_PREVIEW'||(tier!=='FREE'&&access_(user).active))
   .filter(row=>!approvedOnly||(String(row.contentStatus)==='TEACHER_APPROVED'&&String(row.reviewStatus)==='APPROVED'))
   .sort((a,b)=>Number(a.sequence)-Number(b.sequence))
   .slice(0,120).map(row=>{
    let steps=[],quiz=null;
    try{steps=JSON.parse(String(row.stepsJson||'[]'))}catch{}
    try{quiz=JSON.parse(String(row.questionJson||'null'))}catch{}
    return {id:String(row.lessonId),title:String(row.title),summary:String(row.summary),
      steps:Array.isArray(steps)?steps.slice(0,12):[],
      quiz:quiz&&typeof quiz==='object'?{question:String(quiz.question||''),options:Array.isArray(quiz.options)?quiz.options.slice(0,8).map(String):[]}:null,
      challenge:String(row.project||'')};
   });
  return {id,audience:String(module.audience),kind:id.endsWith('-ai')?'ai':'hobby',
   title:String(module.title),icon:String(module.icon||'📚'),tagline:String(module.tagline||''),
   accessTier:tier,lessons,source:'owner-managed curriculum'};
 });
}

/** Assess privately; never expose stored correct answers in getGrowthModule. */
function checkGrowthAnswer(token,lessonId,answerIndex){
 return withAuth_(token,user=>{
  const id=String(lessonId||'').trim().slice(0,80);
  if(!/^(junior|adult)-(ai|hobby)-\d{1,3}$/.test(id))throw Error('Unknown activity');
  const answer=Number(answerIndex);
  if(!Number.isInteger(answer)||answer<0||answer>7)throw Error('Select a valid answer');
  const lesson=rows_('ModuleLessons').find(row=>String(row.lessonId)===id);
  if(!lesson||String(lesson.visibility)==='HIDDEN')throw Error('Activity unavailable');
  const module=rows_('ModuleCatalog').find(row=>String(row.moduleId)===String(lesson.moduleId));
  if(!module||String(module.visibility)==='HIDDEN')throw Error('Module unavailable');
  const tier=String(module.accessTier||'FREE').toUpperCase();
  if(tier!=='FREE'&&!access_(user).active)throw Error('Membership required');
  if((tier!=='FREE'||String(lesson.visibility)==='PRIVATE')&&
     (String(lesson.contentStatus)!=='TEACHER_APPROVED'||String(lesson.reviewStatus)!=='APPROVED'))throw Error('Activity is awaiting educational review');
  const quiz=JSON.parse(String(lesson.questionJson||'null'));
  if(!quiz||!Array.isArray(quiz.options)||answer>=quiz.options.length)throw Error('Invalid activity');
  const cache=CacheService.getScriptCache();
  const prefix='growth-'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,user.sub)).slice(0,20);
  const rateKey=prefix+'-'+Math.floor(Date.now()/60000);
  const count=Number(cache.get(rateKey)||0);
  if(count>=30)throw Error('Please slow down and try again');
  cache.put(rateKey,String(count+1),90);
  return {correct:answer===Number(quiz.answer),why:String(quiz.why||'Review the lesson for the method.').slice(0,500)};
 });
}
