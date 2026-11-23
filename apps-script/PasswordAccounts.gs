const PASSWORD_TABLE_ = 'User Authentication';
const PASSWORD_COLUMNS_ = ['userId','username','email','phoneNumber','role','parentSub','childId','passwordSalt','passwordHash','credentialVersion','updatedAt'];
const PASSWORD_ROUNDS_ = 600000;
const PASSWORD_SESSION_SECONDS_ = 7200;
const PASSWORD_ERROR_ = 'The username, email, user ID or password was incorrect for this sign-in type.';
const PASSWORD_SESSION_FORMAT_ = /^bja1\.[a-f0-9]{64}$/;

function registerPasswordTable_(){
 TABLES[PASSWORD_TABLE_]=PASSWORD_COLUMNS_;
 TEXT_COLUMNS_[PASSWORD_TABLE_]=PASSWORD_COLUMNS_;
}

function setupPasswordAuthentication_(){
 const lock=LockService.getScriptLock();
 lock.waitLock(10000);
 try{
  registerPasswordTable_();
  const database=database_();
  let sheet=database.getSheetByName(PASSWORD_TABLE_);
  if(!sheet)sheet=database.insertSheet(PASSWORD_TABLE_);
  if(sheet.getLastRow()===0){
   sheet.getRange(1,1,1,PASSWORD_COLUMNS_.length).setValues([PASSWORD_COLUMNS_]);
   sheet.setFrozenRows(1);
  }
  if(sheet.getLastColumn()!==PASSWORD_COLUMNS_.length||sheet.getRange(1,1,1,PASSWORD_COLUMNS_.length).getValues()[0].some((key,i)=>key!==PASSWORD_COLUMNS_[i]))throw Error('Unexpected user authentication table headers.');
  applyTextColumns_(PASSWORD_TABLE_,sheet);
  return {ready:true};
 }finally{SpreadsheetApp.flush();lock.releaseLock()}
}

function passwordRows_(){
 registerPasswordTable_();
 return rows_(PASSWORD_TABLE_);
}

function newPasswordAccountId_(){return 'bju-'+Utilities.getUuid().toLowerCase()}
function passwordUsername_(input){
 const username=typeof input==='string'?input.trim().toLowerCase():'';
 if(!/^[a-z][a-z0-9._-]{2,31}$/.test(username)||username.startsWith('bju-'))throw Error('Choose a username of 3–32 letters, numbers, dots, underscores or hyphens, starting with a letter.');
 return username;
}
function passwordPhone_(input,required){
 const phone=typeof input==='string'?input.trim().replace(/[ ().-]/g,''):'';
 if((phone||required)&&!/^\+?\d{7,15}$/.test(phone))throw Error('Enter a valid phone number, including its country code if needed.');
 return phone;
}
function passwordHash_(password,salt){
 return BijakPasswordKdf.derive(password,salt,PASSWORD_ROUNDS_);
}
function preparePassword_(password){
 if(typeof password!=='string'||password.length>256||[...password].length<15||!password.trim()||/[\uD800-\uDFFF]/u.test(password))throw Error('Choose a password of at least 15 characters. A few memorable words work well.');
 const passwordSalt=Utilities.getUuid().replace(/-/g,'');
 return {passwordSalt,passwordHash:passwordHash_(password,passwordSalt),credentialVersion:Utilities.getUuid(),updatedAt:new Date().toISOString()};
}
function equalPasswordHash_(left,right){
 if(left.length!==right.length)return false;
 let difference=0;
 for(let i=0;i<left.length;i++)difference|=left.charCodeAt(i)^right.charCodeAt(i);
 return difference===0;
}
function passwordDigest_(value){
 return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,value));
}
function passwordRateLimit_(identifier){
 const lock=LockService.getScriptLock();
 lock.waitLock(10000);
 try{
  const cache=CacheService.getScriptCache(),now=Date.now();
  const global='pw-global:'+Math.floor(now/60000);
  const key='pw-login:'+passwordDigest_(identifier);
  const total=Number(cache.get(global)||0);
  const count=Number(cache.get(key)||0);
  if(total>=45||count>=8)throw Error('Too many sign-in attempts. Please wait before trying again.');
  cache.put(global,String(total+1),120);
  cache.put(key,String(count+1),900);
  return key;
 }finally{lock.releaseLock()}
}
function passwordSummary_(row){
 return row?{userId:String(row.userId),username:String(row.username),email:String(row.email||''),phoneNumber:String(row.phoneNumber||'')}:null;
}
function passwordAccountFor_(rows,user,childId=''){
 return rows.find(row=>String(row.parentSub)===user.sub&&String(row.childId||'')===childId&&row.role===(childId?'STUDENT':'PARENT'));
}
function assertPasswordUsernameAvailable_(rows,username,existing){
 if(rows.some(row=>row.username===username&&row.userId!==existing?.userId))throw Error('That username is already in use. Choose another.');
}
function assertPasswordEmailAvailable_(rows,email,existing){
 if(email&&rows.some(row=>String(row.email).toLowerCase()===email&&row.userId!==existing?.userId))throw Error('That email is already linked to a sign-in account.');
}
function savePasswordRow_(existing,row){
 if(existing){
  const sheet=sheet_(PASSWORD_TABLE_);
  const match=sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(String(existing.userId)).matchEntireCell(true).findNext();
  if(!match)throw Error('The sign-in record changed. Reload and try again.');
  const record={...existing,...row};
  sheet.getRange(match.getRow(),1,1,PASSWORD_COLUMNS_.length).setValues([PASSWORD_COLUMNS_.map(key=>cell_(record[key]))]);
 }else append_(PASSWORD_TABLE_,row);
 SpreadsheetApp.flush();
 RPC_ROWS_?.clear();
}
function getPasswordSettings(token){
 const parent=requirePortalParent_(token),accounts=passwordRows_();
 return {parent:passwordSummary_(passwordAccountFor_(accounts,parent)),children:familyChildren_(parent).map(child=>({id:child.id,...passwordSummary_(passwordAccountFor_(accounts,parent,child.id))}))};
}
function saveParentPassword(token,details){
 const parent=requirePortalParent_(token);
 if(parent.passwordAccess)throw Error('Use Google sign-in to set or change your parent password.');
 const username=passwordUsername_(details?.username),phoneNumber=passwordPhone_(details?.phoneNumber,true);
 const email=String(parent.email||'').trim().toLowerCase(),credentials=preparePassword_(details?.password);
 if(!email)throw Error('A verified Google email is required to set a parent password.');
 const lock=LockService.getScriptLock();
 lock.waitLock(10000);
 try{
  const accounts=passwordRows_(),existing=passwordAccountFor_(accounts,parent);
  assertPasswordUsernameAvailable_(accounts,username,existing);
  assertPasswordEmailAvailable_(accounts,email,existing);
  const row={userId:existing?.userId||newPasswordAccountId_(),username,email,phoneNumber,role:'PARENT',parentSub:parent.sub,childId:'',...credentials};
  savePasswordRow_(existing,row);
  return passwordSummary_(row);
 }finally{lock.releaseLock()}
}
function saveChildPassword(token,childId,details){
 const parent=requirePortalParent_(token);
 if(typeof childId!=='string'||childId.length>140)throw Error('Choose one of your linked children.');
 const credentials=preparePassword_(details?.password);
 const lock=LockService.getScriptLock();
 lock.waitLock(10000);
 try{
  RPC_ROWS_?.clear();
  requireChild_(parent,childId);
  const accounts=passwordRows_(),existing=passwordAccountFor_(accounts,parent,childId);
  if(!existing&&details?.consent!==true)throw Error('Confirm guardian consent to set up student sign-in.');
  const username=existing?String(existing.username):passwordUsername_(details?.username);
  const links=latestStudentLinks_().filter(link=>String(link.childId)===childId&&String(link.parentSub)===parent.sub);
  const activeLink=links.find(link=>link.status==='ACTIVE');
  if(links.length&&!activeLink)throw Error('Ask the BijakLearn Team to restore the learner profile before resetting sign-in.');
  const email=activeLink?.email||'';
  assertPasswordUsernameAvailable_(accounts,username,existing);
  assertPasswordEmailAvailable_(accounts,email,existing);
  const row={userId:existing?.userId||newPasswordAccountId_(),username,email,phoneNumber:existing?.phoneNumber||'',role:'STUDENT',parentSub:parent.sub,childId,...credentials};
  savePasswordRow_(existing,row);
  append_('Audit',{timestamp:row.updatedAt,actor:accountKey_(parent.sub),action:existing?'STUDENT_PASSWORD_RESET':'STUDENT_PASSWORD_SET',reference:childId});
  return passwordSummary_(row);
 }finally{lock.releaseLock()}
}
function passwordIdentity_(account){
 const sub=String(account.parentSub);
 const parent=rows_('Parents').find(row=>String(row.googleSub)===sub);
 if(!parent)throw Error('[ACCOUNT_REVOKED] Family access is unavailable.');
 const parentIdentity={sub,email:String(parent.email||''),name:String(parent.displayName||'')};
 requireActiveAccount_(parentIdentity,false);
 if(account.role==='PARENT'){
  return {...parentIdentity,role:'PARENT',passwordAccess:true};
 }
 if(account.role!=='STUDENT')throw Error('[PASSWORD_SESSION] Sign in again to continue.');
 const childId=String(account.childId);
 const child=requireChild_(parentIdentity,childId);
 const links=latestStudentLinks_().filter(link=>String(link.childId)===childId&&String(link.parentSub)===sub);
 if(links.length&&!links.some(link=>link.status==='ACTIVE'&&(!link.googleSub||[undefined,'ACTIVE','PENDING'].includes(latestAccountEvents_().get(accountKey_(String(link.googleSub)))?.status))))throw Error('[STUDENT_REVOKED] Student access has been disabled.');
 return {sub:String(account.userId),email:'',name:String(child.nickname),role:'STUDENT',familySub:sub,studentChildId:childId,passwordAccess:true};
}
function passwordSessionIdentity_(token){
 const key='pw-session:'+passwordDigest_(token);
 let session;
 try{session=JSON.parse(CacheService.getScriptCache().get(key)||'null')}catch{}
 if(!session||session.expiresAt<=Date.now())throw Error('[PASSWORD_SESSION] Sign in again to continue.');
 const account=passwordRows_().find(row=>row.userId===session.userId);
 if(!account||account.credentialVersion!==session.credentialVersion)throw Error('[PASSWORD_SESSION] Sign in again to continue.');
 return passwordIdentity_(account);
}
function passwordSignIn(details){
 const identifier=typeof details?.identifier==='string'?details.identifier.trim().toLowerCase():'';
 const password=details?.password,role=details?.role==='parent'?'PARENT':details?.role==='student'?'STUDENT':'';
 if(!identifier||identifier.length>254||!role||typeof password!=='string'||password.length>256||[...password].length<15||/[\uD800-\uDFFF]/u.test(password))throw Error(PASSWORD_ERROR_);
 const account=passwordRows_().find(row=>row.role===role&&[row.userId,row.username,String(row.email).toLowerCase()].includes(identifier));
 const rateKey=passwordRateLimit_(account?.userId||identifier);
 const attempt=passwordHash_(password,account?.passwordSalt||'00000000000000000000000000000000');
 if(!equalPasswordHash_(attempt,String(account?.passwordHash||'0'.repeat(64)))||!account)throw Error(PASSWORD_ERROR_);
 passwordIdentity_(account);
 CacheService.getScriptCache().remove(rateKey);
 const token='bja1.'+(Utilities.getUuid()+Utilities.getUuid()).replace(/-/g,'').toLowerCase();
 const session={userId:account.userId,credentialVersion:account.credentialVersion,expiresAt:Date.now()+1000*PASSWORD_SESSION_SECONDS_};
 CacheService.getScriptCache().put('pw-session:'+passwordDigest_(token),JSON.stringify(session),PASSWORD_SESSION_SECONDS_);
 return {token};
}
function passwordSignOut(token){
 if(typeof token==='string'&&PASSWORD_SESSION_FORMAT_.test(token))CacheService.getScriptCache().remove('pw-session:'+passwordDigest_(token));
 return {ok:true};
}
