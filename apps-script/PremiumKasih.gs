/** Private community-support applications. Never accept evidence through the static demo. */
const KASIH_MAX_DOCUMENT_BYTES_ = 1024 * 1024;
function privateKasihFolder_(){
 const id=props_().getProperty('KASIH_DOCUMENTS_FOLDER_ID');
 if(!id)throw Error('Private document storage is not configured. Contact the administrator.');
 const folder=DriveApp.getFolderById(id);
 const owner=folder.getOwner();
 if(!owner||String(owner.getEmail()).toLowerCase()!==String(Session.getEffectiveUser().getEmail()).toLowerCase())throw Error('Document folder must belong to the deploying owner');
 const parents=folder.getParents(),rootId=DriveApp.getRootFolder().getId();let atRoot=false;
 while(parents.hasNext()){if(parents.next().getId()!==rootId)throw Error('Use a private top-level Drive folder');atRoot=true}
 if(!atRoot)throw Error('Use a private top-level Drive folder');
 if(folder.getSharingAccess()!==DriveApp.Access.PRIVATE||folder.getEditors().length||folder.getViewers().length)throw Error('The document folder must be private to the deploying owner');
 return folder;
}
function setupKasihFolder_(){
 if(!props_().getProperty('KASIH_DOCUMENTS_FOLDER_ID')){
  const folder=DriveApp.createFolder('BijakLearn private Premium Kasih evidence');
  props_().setProperty('KASIH_DOCUMENTS_FOLDER_ID',folder.getId());
 }
 privateKasihFolder_();
 return {configured:true};
}
function kasihDetails_(details){
 if(!details||typeof details!=='object'||details.guardianConsent!==true)throw Error('A parent or guardian must consent to this application');
 const text=(key,min,max)=>{const value=typeof details[key]==='string'?details[key].trim():'';if(value.length<min||value.length>max)throw Error('Check '+key+' ('+min+'–'+max+' characters)');return value};
 const guardianName=text('guardianName',2,100),studentNickname=text('studentNickname',1,40),schoolYear=Number(details.schoolYear),reason=text('reason',40,2000);
 if(!Number.isInteger(schoolYear)||schoolYear<0||schoolYear>6)throw Error('Select preschool or a school year 1–6');
 return {guardianName,studentNickname,schoolYear,reason,guardianConsent:true};
}
function kasihDocument_(document){
 const types={'application/pdf':[37,80,68,70,45],'image/png':[137,80,78,71,13,10,26,10],'image/jpeg':[255,216,255]};
 if(!document||!types[document.mimeType]||typeof document.data!=='string'||document.data.length>Math.ceil(KASIH_MAX_DOCUMENT_BYTES_/3)*4||(document.data.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(document.data)))throw Error('Upload a PDF, PNG or JPEG of at most 1 MB');
 const bytes=Utilities.base64Decode(document.data),signature=types[document.mimeType];
 if(!bytes.length||bytes.length>KASIH_MAX_DOCUMENT_BYTES_)throw Error('Upload a PDF, PNG or JPEG of at most 1 MB');
 if(signature.some((value,index)=>(bytes[index]&255)!==value))throw Error('Document type does not match its content');
 const ext={'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg'}[document.mimeType];
 return {bytes,mimeType:document.mimeType,ext};
}
function requestScholarship(token,details,documents){return submitKasihApplication(token,details,documents)}
function submitKasihApplication(token,details,documents){return withAuth_(token,user=>{
 requireParent_(user);
 const values=kasihDetails_(details);
 if(!Array.isArray(documents)||documents.length<1||documents.length>2)throw Error('Attach one or two redacted supporting documents');
 const uploads=documents.map(kasihDocument_);
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 const created=[];
 try{
  const history=rows_('Scholarships').filter(row=>String(row.googleSub)===user.sub);
  if(history.filter(row=>Date.parse(row.submittedAt)>Date.now()-30*86400000).length>=3)throw Error('Application limit reached. Contact the administrator for help.');
  const last=history.slice(-1)[0];
  if(last&&last.status==='PENDING')throw Error('You already have an application awaiting review');
  if(access_(user).plan==='PREMIUM_KASIH')throw Error('Your Premium Kasih membership is already active');
  const folder=privateKasihFolder_(),requestId=Utilities.getUuid();
  uploads.forEach((upload,index)=>{
   const file=folder.createFile(Utilities.newBlob(upload.bytes,upload.mimeType,requestId+'-'+(index+1)+'.'+upload.ext));
   created.push(file);
   if(file.getSharingAccess()!==DriveApp.Access.PRIVATE||file.getEditors().length||file.getViewers().length)throw Error('Document storage is not private');
  });
  append_('Scholarships',{requestId,googleSub:user.sub,status:'PENDING',submittedAt:new Date().toISOString(),...values,documentIdsJson:JSON.stringify(created.map(file=>file.getId())),consentAt:new Date().toISOString()});
  return {requestId,status:'PENDING'};
 }catch(error){created.forEach(file=>{try{file.setTrashed(true)}catch{}});throw error}
 finally{lock.releaseLock()}
})}
function getKasihApplication(token){return withAuth_(token,user=>{
 requireParent_(user);
 const row=rows_('Scholarships').filter(item=>String(item.googleSub)===user.sub).slice(-1)[0];
 return row?{requestId:String(row.requestId),status:String(row.status),submittedAt:String(row.submittedAt),reviewedAt:String(row.reviewedAt||'')}:null;
})}
function listKasihApplications(token){
 requireAccountAdmin_(token);
 return rows_('Scholarships').slice(-200).reverse().map(row=>({requestId:String(row.requestId),accountKey:accountKey_(String(row.googleSub)),status:String(row.status),submittedAt:String(row.submittedAt),guardianName:String(row.guardianName||''),studentNickname:String(row.studentNickname||''),schoolYear:Number(row.schoolYear),reason:String(row.reason||''),documents:kasihFileIds_(row).map((id,index)=>({id,label:'Supporting document '+(index+1)}))}));
}
function kasihFileIds_(row){
 try{const ids=JSON.parse(String(row.documentIdsJson||'[]'));return Array.isArray(ids)?ids.filter(id=>typeof id==='string'&&/^[\w-]+$/.test(id)).slice(0,2):[]}catch{return []}
}
/** File contents are available only to the verified administrator, never by a public Drive URL. */
function getKasihDocument(token,requestId,fileId){
 requireAccountAdmin_(token);
 const row=rows_('Scholarships').find(item=>String(item.requestId)===requestId);
 if(!row||!kasihFileIds_(row).includes(fileId))throw Error('Document not found');
 const folder=privateKasihFolder_(),file=DriveApp.getFileById(fileId),parents=file.getParents();
 let belongs=false;while(parents.hasNext())if(parents.next().getId()===folder.getId())belongs=true;
 if(!belongs||file.isTrashed())throw Error('Document unavailable');
 const blob=file.getBlob();
 if(blob.getBytes().length>KASIH_MAX_DOCUMENT_BYTES_)throw Error('Document exceeds download limit');
 return {mimeType:blob.getContentType(),name:'supporting-document',data:Utilities.base64Encode(blob.getBytes())};
}
function reviewKasihApplication(token,requestId,decision,months,note){
 const admin=requireAccountAdmin_(token);
 return reviewKasih_(requestId,decision,months,note,accountKey_(admin.sub));
}
function reviewKasih_(requestId,decision,months,note,actor){
 if(!['APPROVED','DECLINED'].includes(decision))throw Error('Select approve or decline');
 const reason=typeof note==='string'?note.trim():'';
 if(!reason||reason.length>250)throw Error('Enter a review note of 1–250 characters');
 const duration=Number(months);
 if(decision==='APPROVED'&&(!Number.isInteger(duration)||duration<1||duration>12))throw Error('Approval duration must be 1–12 months');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const row=rows_('Scholarships').find(item=>String(item.requestId)===requestId);
  if(!row||row.status!=='PENDING')throw Error('Application is not awaiting review');
  if(decision==='APPROVED'){
   if(!row.guardianName||!row.reason||!trueCell_(row.guardianConsent)||!row.consentAt||!kasihFileIds_(row).length)throw Error('A complete application with evidence and consent is required');
   if(!rows_('Parents').some(parent=>String(parent.googleSub)===String(row.googleSub)))throw Error('Unknown parent');
   const marker='Kasih application '+requestId;
   if(!rows_('Subscriptions').some(item=>item.adminNote===marker))append_('Subscriptions',{googleSub:row.googleSub,plan:'PREMIUM_KASIH',status:'ACTIVE',expiresAt:new Date(Date.now()+duration*30*86400000).toISOString(),updatedAt:new Date().toISOString(),adminNote:marker});
  }
  update_('Scholarships','requestId',requestId,{status:decision,reviewedAt:new Date().toISOString(),adminNote:reason});
  append_('Audit',{timestamp:new Date().toISOString(),actor,action:'KASIH_'+decision,reference:requestId});
  return {requestId,status:decision};
 }finally{lock.releaseLock()}
}
/** Owner-only retention operation: trash evidence after 90 days from final review. */
function purgeKasihEvidence_(){
 const cutoff=Date.now()-90*86400000;let removed=0;
 const folder=privateKasihFolder_();
 rows_('Scholarships').filter(row=>['APPROVED','DECLINED'].includes(row.status)&&Date.parse(row.reviewedAt)<cutoff&&(kasihFileIds_(row).length||row.guardianName||row.studentNickname||row.reason)).forEach(row=>{
  kasihFileIds_(row).forEach(id=>{
   // A file already deleted by hand must not stop the retention job.
   try{
    const file=DriveApp.getFileById(id),parents=file.getParents();let belongs=false;
    while(parents.hasNext())if(parents.next().getId()===folder.getId())belongs=true;
    if(belongs){file.setTrashed(true);removed++}
   }catch(error){}
  });
  update_('Scholarships','requestId',row.requestId,{documentIdsJson:'[]',guardianName:'',studentNickname:'',reason:''});
 });
 return {removed};
}
