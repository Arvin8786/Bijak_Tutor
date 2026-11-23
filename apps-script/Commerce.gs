/** Family purchases are operator-verified ledger records, never a payment gateway. */
function commerceSettings_(){
 const out={baseCents:10000,includedChildren:2,extraChildCents:3000,commissionBps:0,whatsapp:'601154443154',paymentInstructions:'Scan the administrator’s Touch ’n Go QR, pay the exact quoted amount and upload a redacted receipt.',qrUploadId:''};
 rows_('CommerceSettings').forEach(r=>{if(Object.prototype.hasOwnProperty.call(out,r.key))out[r.key]=['commissionBps'].includes(r.key)?Number(r.value):['baseCents','includedChildren','extraChildCents'].includes(r.key)?out[r.key]:String(r.value)});
 if(!Number.isInteger(out.commissionBps)||out.commissionBps<0||out.commissionBps>10000)out.commissionBps=0;
 return out;
}
/** Deployment-specific values come from Script Properties; the defaults keep the current setup working. */
function adminEmail_(){let owner='';try{owner=Session.getEffectiveUser().getEmail()}catch(error){}return String(props_().getProperty('ACCOUNT_ADMIN_EMAIL')||owner||'arvin8786@gmail.com').trim().toLowerCase()}
function publicAppUrl_(){return String(props_().getProperty('PUBLIC_APP_URL')||'https://arvin8786.github.io/Bijak_Tutor/').trim().replace(/\?.*$/,'')}
const MAX_FAMILY_CHILDREN_ = 10;
function activeFamilyChildren_(sub){return rows_('Children').filter(c=>String(c.parentSub)===sub&&c.status!=='REMOVED')}
function paidFamilyOrders_(sub){return rows_('Orders').filter(o=>String(o.parentSub)===sub&&o.status==='PAID')}
function premiumSlots_(sub){const orders=paidFamilyOrders_(sub);return 2+orders.filter(o=>o.kind==='EXTRA_CHILD').reduce((n,o)=>n+Number(o.slots),0)}
function commerceAccess_(user,subscription,legacy){
 const sub=user.role==='STUDENT'?user.familySub:user.sub,orders=paidFamilyOrders_(sub),base=orders.filter(o=>o.kind==='LIFETIME_PREMIUM').slice(-1)[0];
 const override=subscription&&(!base||Date.parse(subscription.updatedAt)>=Date.parse(base.reviewedAt));
 let access=legacy;
 if(override&&trueCell_(subscription.lifetime)&&subscription.plan==='PREMIUM'&&subscription.status==='ACTIVE')access={active:true,plan:'PREMIUM',expiresAt:null,lifetime:true};
 else if(base&&!override)access={active:true,plan:'PREMIUM',expiresAt:null,lifetime:true};
 if(user.role==='STUDENT'&&access.plan==='PREMIUM'){
  const index=activeFamilyChildren_(sub).findIndex(c=>String(c.childId)===String(user.studentChildId));
  if(index<0||index>=premiumSlots_(sub))return {active:false,plan:'FREE',expiresAt:null,extraChildPaymentRequired:true};
 }
 return access;
}
function affiliateFor_(user){
 const lock=LockService.getScriptLock();lock.waitLock(10000);try{
 let row=rows_('Affiliates').find(r=>String(r.parentSub)===user.sub);
 if(!row){row={parentSub:user.sub,code:Utilities.getUuid().replace(/-/g,''),name:user.name,email:user.email,createdAt:new Date().toISOString()};append_('Affiliates',row)}
 return row;
 }finally{lock.releaseLock()}
}
/** First onboarding fixes attribution, including a direct visit. Email never appears in share links. */
function registerReferralOnboarding_(user,code){
 if(isAccountAdmin_(user)||studentLink_(user))return;
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  if(rows_('Referrals').some(r=>String(r.referredSub)===user.sub))return;
  if(rows_('Parents').some(p=>String(p.googleSub)===user.sub)||latestAccountEvents_().has(accountKey_(user.sub)))return;
  const affiliate=typeof code==='string'&&/^[a-f0-9]{32}$/.test(code)?rows_('Affiliates').find(a=>String(a.code)===code&&String(a.parentSub)!==user.sub&&String(a.email).toLowerCase()!==user.email.toLowerCase()):null;
  append_('Referrals',{referredSub:user.sub,referrerSub:affiliate?String(affiliate.parentSub):'',referrerName:affiliate?affiliate.name:'',referrerEmail:affiliate?affiliate.email:'',code:affiliate?affiliate.code:'',createdAt:new Date().toISOString()});
 }finally{lock.releaseLock()}
}
function orderSummary_(o,own){return {id:o.orderId,kind:o.kind,slots:Number(o.slots),listCents:Number(o.listCents),discountCents:Number(o.discountCents),totalCents:Number(o.totalCents),status:o.status,createdAt:o.createdAt,expiresAt:o.expiresAt,reference:o.reference||'',proofId:o.proofId||'',note:o.note||'',...(own?{parentSub:o.parentSub,referrerSub:o.referrerSub,commissionBps:Number(o.commissionBps),commissionCents:Number(o.commissionCents),reviewedAt:o.reviewedAt}:{} )}}
function getFamilyCommerce(token){
 const user=requirePortalParent_(token),affiliate=affiliateFor_(user),settings=commerceSettings_(),access=access_(user),children=activeFamilyChildren_(user.sub),slots=premiumSlots_(user.sub);
 const orders=rows_('Orders'),payoutItems=paidOutOrderIds_(),payouts=rows_('CommissionPayouts').filter(p=>String(p.referrerSub)===user.sub),links=latestStudentLinks_(),allParents=rows_('Parents');
 const referrals=rows_('Referrals').filter(r=>String(r.referrerSub)===user.sub).map(r=>{
  const buyer=allParents.find(p=>String(p.googleSub)===String(r.referredSub));
  const order=orders.find(o=>String(o.parentSub)===String(r.referredSub)&&String(o.referrerSub)===user.sub&&o.kind==='LIFETIME_PREMIUM'&&o.status==='PAID');
  return {name:String(buyer?.displayName||'New parent'),joinedAt:r.createdAt,status:order?'PAID':'ONBOARDED',commissionCents:order?Number(order.commissionCents):0,paidOut:!!order&&payoutItems.has(String(order.orderId)),month:order?malaysiaMonth_(order.reviewedAt):null};
 });
 return {settings,access,children:children.map((c,index)=>({id:String(c.childId),name:c.nickname,email:links.find(l=>String(l.childId)===String(c.childId))?.email||'',status:links.find(l=>String(l.childId)===String(c.childId))?.status||'UNLINKED',plan:access.plan==='PREMIUM'&&index>=slots?'FREE':access.plan})),premiumSlots:slots,affiliateUrl:publicAppUrl_()+'?ref='+affiliate.code,referrals,payouts:payouts.map(p=>({month:p.throughMonth,amountCents:Number(p.amountCents),reference:p.reference})),orders:orders.filter(o=>String(o.parentSub)===user.sub).slice(-100).reverse().map(o=>orderSummary_(o,false)),referredBy:rows_('Referrals').find(r=>String(r.referredSub)===user.sub)?.referrerName||null,uploadsConfigured:!!props_().getProperty('KASIH_DOCUMENTS_FOLDER_ID')};
}
function linkParentChild(token,details){
 const user=requirePortalParent_(token);details=details||{};
 const email=String(details.studentEmail||'').trim().toLowerCase(),name=String(details.name||'').trim(),year=Number(details.year);
 const wantsPassword=details.username!==undefined||details.password!==undefined;
 const username=wantsPassword?passwordUsername_(details.username):'';
 const phoneNumber=wantsPassword?passwordPhone_(details.phoneNumber,false):'';
 const credentials=wantsPassword?preparePassword_(details.password):null;
 const school=['SK','SJKC','SJKT'].includes(details.school)?details.school:'SK';
 const language=['ms','en','zh','ta'].includes(details.language)?details.language:'ms';
 if((email?!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||email===user.email.toLowerCase():!wantsPassword)||!name||name.length>40||!Number.isInteger(year)||details.year==null||details.year===''||year<0||year>6||details.consent!==true)throw Error('Provide the student sign-in details, nickname, school year and guardian consent');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const requestId=String(details.requestId||Utilities.getUuid());if(!/^[a-f0-9-]{36}$/.test(requestId))throw Error('Invalid child-link request');
  const existing=rows_('Enrolments').find(r=>String(r.requestId)===requestId);
  if(existing&&(String(existing.parentSub)!==user.sub||String(existing.studentEmail).toLowerCase()!==email||String(existing.nickname)!==name))throw Error('Child-link request conflict');
  const linked=email?latestStudentLinks_().find(l=>String(l.email).trim().toLowerCase()===email):null;
  const accounts=wantsPassword?passwordRows_():[];
  const existingPassword=wantsPassword&&existing?passwordAccountFor_(accounts,user,String(existing.childId)):null;
  if(existingPassword&&existingPassword.username!==username)throw Error('Child-link request conflict');
  if(wantsPassword){
   assertPasswordUsernameAvailable_(accounts,username,existingPassword);
   assertPasswordEmailAvailable_(accounts,email,existingPassword);
  }
  if(existing?.status==='APPROVED'&&(!email||(linked?.status==='ACTIVE'&&String(linked.childId)===String(existing.childId)&&String(linked.parentSub)===user.sub))&&(!wantsPassword||existingPassword)&&activeFamilyChildren_(user.sub).some(child=>String(child.childId)===String(existing.childId))){
   return {id:requestId,childId:String(existing.childId),status:'APPROVED',signIn:existingPassword?passwordSummary_(existingPassword):null};
  }
  if(existing&&existing.status!=='LINKING')throw Error('Only an administrator can change this link');
  const hasParentAccess=Array.from(latestAccountEvents_().values()).some(event=>event.status==='ACTIVE'&&String(event.email).trim().toLowerCase()===email);
  const hasReservedEnrolment=rows_('Enrolments').some(r=>String(r.requestId)!==requestId&&String(r.studentEmail).toLowerCase()===email&&['PENDING','LINKING','APPROVED'].includes(r.status));
  if(email&&(rows_('Parents').some(p=>String(p.email).toLowerCase()===email)||adminEmail_()===email||linked&&(linked.status!=='ACTIVE'||!existing||String(linked.childId)!==String(existing.childId)||String(linked.parentSub)!==user.sub)||hasParentAccess||hasReservedEnrolment))throw Error('This account already has a role or link. Only the administrator can change it.');
  if(!existing&&activeFamilyChildren_(user.sub).length>=MAX_FAMILY_CHILDREN_)throw Error('This family has reached the learner limit. Contact the administrator.');
  const childId=existing?String(existing.childId):Utilities.getUuid(),now=new Date().toISOString();
  if(!existing)append_('Enrolments',{requestId,parentSub:user.sub,parentEmail:user.email,studentEmail:email,nickname:name,year,school,language,consentAt:now,status:'LINKING',childId,createdAt:now,reviewedBy:user.passwordAccess?'AUTHENTICATED_PARENT':'VERIFIED_PARENT_GOOGLE_ACCOUNT'});
  const child=rows_('Children').find(c=>String(c.childId)===childId);if(child&&String(child.parentSub)!==user.sub)throw Error('Child profile ownership conflict');
  if(!child)append_('Children',{childId,parentSub:user.sub,nickname:name,year:existing?.year??year,school:existing?.school||school,language:existing?.language||language,createdAt:now,status:'ACTIVE'});
  if(email&&!linked)append_('StudentAccounts',{studentKey:'email:'+email,email,googleSub:'',childId,parentSub:user.sub,status:'ACTIVE',linkedAt:now,linkedBy:accountKey_(user.sub)});
  const passwordAccount=existingPassword||(wantsPassword?{userId:newPasswordAccountId_(),username,email,phoneNumber,role:'STUDENT',parentSub:user.sub,childId,...credentials}:null);
  if(passwordAccount&&!existingPassword)savePasswordRow_(null,passwordAccount);
  update_('Enrolments','requestId',requestId,{school:existing?.school||school,language:existing?.language||language,reviewedAt:now,status:'APPROVED'});
  append_('Audit',{timestamp:now,actor:accountKey_(user.sub),action:'PARENT_LINKED_CHILD',reference:childId});
  return {id:requestId,childId,status:'APPROVED',signIn:passwordAccount?passwordSummary_(passwordAccount):null};
 }finally{lock.releaseLock()}
}
function setCommerceSettings(token,input){
 const admin=requireAccountAdmin_(token),rate=Number(input?.commissionPercent),instructions=String(input?.paymentInstructions||'').trim();
 if(!Number.isFinite(rate)||rate<0||rate>100||Math.abs(rate*100-Math.round(rate*100))>0.00001||instructions.length<10||instructions.length>2000)throw Error('Commission must be 0–100% with at most two decimals. Add payment instructions.');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{for(const [key,value] of Object.entries({commissionBps:Math.round(rate*100),paymentInstructions:instructions}))saveCommerceSetting_(key,value,admin);return {ok:true}}finally{lock.releaseLock()}
}
function saveCommerceSetting_(key,value,admin){const row={key,value,updatedAt:new Date().toISOString(),updatedBy:accountKey_(admin.sub)};if(!update_('CommerceSettings','key',key,row))append_('CommerceSettings',row)}
function saveDiscountCampaign(token,input){
 const admin=requireAccountAdmin_(token),code=String(input?.code||'').trim().toUpperCase(),percent=Number(input?.percent),start=Date.parse(input?.startsAt),end=Date.parse(input?.endsAt),max=Number(input?.maxUses);
 if(!/^[A-Z0-9-]{3,24}$/.test(code)||!Number.isInteger(percent)||percent<1||percent>100||!Number.isFinite(start)||!Number.isFinite(end)||end<=start||end<=Date.now()||!Number.isInteger(max)||max<1||max>100000)throw Error('Provide a unique code, discount 1–100%, valid start/end and usage limit.');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{if(rows_('DiscountCampaigns').some(c=>String(c.code)===code))throw Error('Discount code already exists');const campaignId=Utilities.getUuid();append_('DiscountCampaigns',{campaignId,code,percent,startsAt:new Date(start).toISOString(),endsAt:new Date(end).toISOString(),maxUses:max,enabled:'TRUE',createdAt:new Date().toISOString(),createdBy:accountKey_(admin.sub)});return {id:campaignId}}finally{lock.releaseLock()}
}
function createFamilyOrder(token,input){
 const user=requirePortalParent_(token),kind=input?.kind,slots=Number(input?.slots||1),code=String(input?.discountCode||'').trim().toUpperCase();
 if(!['LIFETIME_PREMIUM','EXTRA_CHILD'].includes(kind)||!Number.isInteger(slots)||slots<1||slots>100||(kind==='LIFETIME_PREMIUM'&&slots!==1))throw Error('Choose a membership or 1–100 additional child slots');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const history=rows_('Orders'),paid=paidFamilyOrders_(user.sub),now=Date.now();
  if(kind==='LIFETIME_PREMIUM'&&paid.some(o=>o.kind==='LIFETIME_PREMIUM'))throw Error('Lifetime Premium is already purchased');
  if(kind==='EXTRA_CHILD'&&!paid.some(o=>o.kind==='LIFETIME_PREMIUM')&&access_(user).plan!=='PREMIUM')throw Error('Activate Premium before purchasing extra child slots');
  // A submitted receipt stays pending until an administrator reviews it, however long that takes.
  if(history.some(o=>String(o.parentSub)===user.sub&&(o.status==='SUBMITTED'||o.status==='QUOTED'&&Date.parse(o.expiresAt)>now)))throw Error('Finish your current order or wait for it to be reviewed or to expire before creating another');
  let discount=null;const prices=commerceSettings_(),listCents=kind==='LIFETIME_PREMIUM'?prices.baseCents:slots*prices.extraChildCents;
  if(code){discount=rows_('DiscountCampaigns').find(c=>String(c.code)===code&&trueCell_(c.enabled)&&Date.parse(c.startsAt)<=now&&Date.parse(c.endsAt)>now);if(!discount)throw Error('Discount is inactive or expired');const reserved=history.filter(o=>String(o.discountId)===String(discount.campaignId)&&(o.status==='PAID'||o.status==='SUBMITTED'||o.status==='QUOTED'&&Date.parse(o.expiresAt)>now)).length;if(reserved>=Number(discount.maxUses))throw Error('Discount usage limit reached')}
  const discountCents=discount?Math.round(listCents*Number(discount.percent)/100):0,referral=rows_('Referrals').find(r=>String(r.referredSub)===user.sub),referrer=referral?.referrerSub&&String(referral.referrerSub)!==user.sub?String(referral.referrerSub):'';
  const settings=commerceSettings_(),commissionBps=kind==='LIFETIME_PREMIUM'&&referrer?settings.commissionBps:0,orderId=Utilities.getUuid();
  const order={orderId,parentSub:user.sub,kind,slots,listCents,discountCents,totalCents:listCents-discountCents,discountId:discount?.campaignId||'',referrerSub:referrer,commissionBps,commissionCents:Math.round((listCents-discountCents)*commissionBps/10000),status:'QUOTED',createdAt:new Date(now).toISOString(),expiresAt:new Date(Math.min(now+30*60000,discount?Date.parse(discount.endsAt):Infinity)).toISOString()};
  append_('Orders',order);return orderSummary_(order,false);
 }finally{lock.releaseLock()}
}
function storePrivateUpload_(user,purpose,recordId,document){
 const upload=kasihDocument_(document),folder=privateKasihFolder_(),uploadId=Utilities.getUuid();
 const file=folder.createFile(Utilities.newBlob(upload.bytes,upload.mimeType,uploadId+'.'+upload.ext));
 try{if(file.getSharingAccess()!==DriveApp.Access.PRIVATE||file.getEditors().length||file.getViewers().length)throw Error('Upload storage is not private');append_('Uploads',{uploadId,parentSub:user.sub,purpose,recordId,fileId:file.getId(),mimeType:upload.mimeType,createdAt:new Date().toISOString()});return uploadId}catch(error){file.setTrashed(true);throw error}
}
function submitOrderProof(token,orderId,reference,document){
 const user=requirePortalParent_(token),ref=String(reference||'').trim();if(ref.length<3||ref.length>100)throw Error('Enter the receipt reference (3–100 characters)');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const order=rows_('Orders').find(o=>String(o.orderId)===orderId&&String(o.parentSub)===user.sub);
  if(!order||order.status!=='QUOTED'||Date.parse(order.expiresAt)<=Date.now())throw Error('Order is unavailable or expired. Request a new quote.');
  if(rows_('Orders').some(o=>String(o.reference)===ref&&['SUBMITTED','PAID'].includes(o.status))||rows_('Payments').some(p=>String(p.reference)===ref))throw Error('Payment reference already submitted');
  const proofId=Number(order.totalCents)===0&&!document?'':storePrivateUpload_(user,'PAYMENT',orderId,document);
  update_('Orders','orderId',orderId,{reference:ref,proofId,submittedAt:new Date().toISOString()});update_('Orders','orderId',orderId,{status:'SUBMITTED'});return {ok:true};
 }finally{lock.releaseLock()}
}
function uploadPaymentQr(token,document){const admin=requireAccountAdmin_(token);if(!['image/png','image/jpeg'].includes(document?.mimeType))throw Error('Upload a PNG or JPEG QR image');const lock=LockService.getScriptLock();lock.waitLock(30000);try{const id=storePrivateUpload_(admin,'PAYMENT_QR','CURRENT',document);saveCommerceSetting_('qrUploadId',id,admin);return {ok:true}}finally{lock.releaseLock()}}
function getPrivateUpload(token,id){
 const user=portalIdentity_(token),row=rows_('Uploads').find(u=>String(u.uploadId)===id&&!u.removedAt);
 if(!row||!(user.role==='ADMIN'||user.role==='PARENT'&&(String(row.parentSub)===user.sub||row.purpose==='PAYMENT_QR'&&commerceSettings_().qrUploadId===id)))throw Error('Upload unavailable');
 const folder=privateKasihFolder_(),file=DriveApp.getFileById(String(row.fileId)),parents=file.getParents();let belongs=false;while(parents.hasNext())if(parents.next().getId()===folder.getId())belongs=true;
 if(!belongs||file.isTrashed())throw Error('Upload unavailable');const blob=file.getBlob(),bytes=blob.getBytes();if(bytes.length>1024*1024||!['image/png','image/jpeg','application/pdf'].includes(blob.getContentType()))throw Error('Unsupported upload');return {mimeType:blob.getContentType(),data:Utilities.base64Encode(bytes)};
}
function listFamilyOrders(token){return getFamilyCommerce(token).orders}
function reviewFamilyOrder(token,id,decision,note){
 const admin=requireAccountAdmin_(token),message=String(note||'').trim();if(!['PAID','REJECTED','REFUNDED'].includes(decision)||!message||message.length>250)throw Error('Choose a review decision and a note');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const order=rows_('Orders').find(o=>String(o.orderId)===id);if(!order)throw Error('Order not found');if(order.status===decision)return {status:decision};
  if(decision==='REFUNDED'){if(order.status!=='PAID'||paidOutOrderIds_().has(id))throw Error('Only paid orders without recorded commission payouts can be reversed. Reconcile paid commissions first.');}
  else if(order.status!=='SUBMITTED')throw Error('Only submitted orders can be reviewed');
  if(decision==='PAID'){
   if(Number(order.totalCents)>0&&!order.proofId)throw Error('Payment proof is required');
   if(order.kind==='LIFETIME_PREMIUM'&&paidFamilyOrders_(String(order.parentSub)).some(o=>o.kind==='LIFETIME_PREMIUM'))throw Error('This family already has a paid lifetime membership');
   if(order.kind==='EXTRA_CHILD'&&!paidFamilyOrders_(String(order.parentSub)).some(o=>o.kind==='LIFETIME_PREMIUM')&&access_({sub:String(order.parentSub)}).plan!=='PREMIUM')throw Error('Family Premium is not active');
  }
  update_('Orders','orderId',id,{note:message,reviewedAt:new Date().toISOString(),reviewedBy:accountKey_(admin.sub)});update_('Orders','orderId',id,{status:decision});
  append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(admin.sub),action:'ORDER_'+decision,reference:id});return {status:decision};
 }finally{lock.releaseLock()}
}
function malaysiaMonth_(date){return Utilities.formatDate(new Date(date),'Asia/Kuala_Lumpur','yyyy-MM')}
function paidOutOrderIds_(){const ids=new Set(rows_('PayoutItems').map(i=>String(i.orderId)));rows_('CommissionPayouts').forEach(p=>{const values=JSON.parse(String(p.orderIdsJson||'[]'));if(!Array.isArray(values))throw Error('Payout ledger needs administrator repair');values.forEach(id=>ids.add(String(id)))});return ids}
function eligibleCommissions_(){const month=malaysiaMonth_(new Date()),items=paidOutOrderIds_();return rows_('Orders').filter(o=>o.status==='PAID'&&o.kind==='LIFETIME_PREMIUM'&&o.referrerSub&&Number(o.commissionCents)>0&&malaysiaMonth_(o.reviewedAt)<month&&!items.has(String(o.orderId)))}
function getCommerceAdministration(token){
 requireAccountAdmin_(token);const parents=rows_('Parents'),settings=commerceSettings_();return {settings,discounts:rows_('DiscountCampaigns'),orders:rows_('Orders').slice(-200).reverse().map(o=>({...orderSummary_(o,true),parentEmail:parents.find(p=>String(p.googleSub)===String(o.parentSub))?.email||'',referrerEmail:parents.find(p=>String(p.googleSub)===String(o.referrerSub))?.email||''})),commissions:eligibleCommissions_().map(o=>({orderId:o.orderId,referrerSub:o.referrerSub,email:parents.find(p=>String(p.googleSub)===String(o.referrerSub))?.email||'',month:malaysiaMonth_(o.reviewedAt),amountCents:Number(o.commissionCents)})),payouts:rows_('CommissionPayouts'),uploadsConfigured:!!props_().getProperty('KASIH_DOCUMENTS_FOLDER_ID')};
}
function recordCommissionPayout(token,referrerSub,reference){
 const admin=requireAccountAdmin_(token),ref=String(reference||'').trim();if(ref.length<3||ref.length>100)throw Error('Enter the actual transfer reference');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  if(rows_('CommissionPayouts').some(p=>String(p.reference)===ref))throw Error('Transfer reference already recorded');
  const orders=eligibleCommissions_().filter(o=>String(o.referrerSub)===referrerSub);if(!orders.length)throw Error('No unpaid commission from completed months');
  const payoutId=Utilities.getUuid(),amountCents=orders.reduce((n,o)=>n+Number(o.commissionCents),0),throughMonth=orders.map(o=>malaysiaMonth_(o.reviewedAt)).sort().slice(-1)[0];
  append_('CommissionPayouts',{payoutId,referrerSub,throughMonth,amountCents,reference:ref,recordedAt:new Date().toISOString(),recordedBy:accountKey_(admin.sub),orderIdsJson:JSON.stringify(orders.map(o=>String(o.orderId)))});
  orders.forEach(o=>append_('PayoutItems',{orderId:o.orderId,payoutId}));return {amountCents};
 }finally{lock.releaseLock()}
}
/** Editor-only: additive schema + private owner folder + daily evidence retention. */
function setupBijakFamilyCommerce(){
 const active=String(Session.getActiveUser().getEmail()||'').toLowerCase(),owner=String(Session.getEffectiveUser().getEmail()||'').toLowerCase();if(!active||active!==owner)throw Error('Owner only');
 initializeDatabase_();setupKasihFolder_();setupKasihRetention_();
 console.log('Family commerce tables and private upload storage configured. No files or sheets were made public.');return {configured:true};
}

function setDiscountEnabled(token,id,enabled){const admin=requireAccountAdmin_(token);if(typeof enabled!=='boolean')throw Error('Choose enabled or disabled');if(!update_('DiscountCampaigns','campaignId',id,{enabled:enabled?'TRUE':'FALSE'}))throw Error('Campaign not found');append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(admin.sub),action:'DISCOUNT_'+(enabled?'ENABLED':'DISABLED'),reference:id});return {ok:true}}
function removeChildLink(token,childId,reason){
 const admin=requireAccountAdmin_(token),note=String(reason||'').trim();if(!note||note.length>250)throw Error('Give a removal reason');const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{const child=rows_('Children').find(c=>String(c.childId)===childId),links=latestStudentLinks_().filter(l=>String(l.childId)===childId);if(!child&&!links.length)throw Error('Child profile not found');links.forEach(l=>append_('StudentAccounts',{...l,status:'REVOKED',linkedAt:new Date().toISOString(),linkedBy:accountKey_(admin.sub)}));if(child)update_('Children','childId',childId,{status:'REMOVED'});rows_('Enrolments').filter(e=>String(e.childId)===childId).forEach(e=>update_('Enrolments','requestId',e.requestId,{status:'REMOVED'}));append_('Audit',{timestamp:new Date().toISOString(),actor:accountKey_(admin.sub),action:'CHILD_LINK_REMOVED',reference:childId+': '+note});return {ok:true}}finally{if(typeof SpreadsheetApp!=='undefined')SpreadsheetApp.flush();lock.releaseLock()}
}
