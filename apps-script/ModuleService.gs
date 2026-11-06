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
      quiz:quiz&&typeof quiz==='object'?quiz:null,
      challenge:String(row.project||'')};
   });
  return {id,audience:String(module.audience),kind:id.endsWith('-ai')?'ai':'hobby',
   title:String(module.title),icon:String(module.icon||'📚'),tagline:String(module.tagline||''),
   accessTier:tier,lessons,source:'owner-managed curriculum'};
 });
}
