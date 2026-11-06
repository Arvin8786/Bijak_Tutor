/**
 * OWNER-ONLY spreadsheet operations.
 * The trailing underscore prevents google.script.run from invoking these.
 * Run manually in the Apps Script editor, after verifying identity and payment.
 * Never expose these as web-app functions without separate strong admin auth.
 */
function approveScholarship_(requestId,months){
 if(!requestId)throw Error('Enter an application ID');
 const duration=Math.max(1,Math.min(12,Math.floor(Number(months)||12)));
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const req=rows_('Scholarships').find(x=>String(x.requestId)===String(requestId));
  if(!req)throw Error('Scholarship application not found');
  if(String(req.status)==='APPROVED')return {ok:true,alreadyApproved:true};
  if(!rows_('Parents').some(p=>String(p.googleSub)===String(req.googleSub)))throw Error('Unknown parent');
  update_('Scholarships','requestId',requestId,{status:'APPROVED',reviewedAt:new Date().toISOString(),adminNote:'Verified manually by administrator'});
  const expires=new Date();expires.setMonth(expires.getMonth()+duration);
  append_('Subscriptions',{googleSub:req.googleSub,plan:'PREMIUM_KASIH',status:'ACTIVE',expiresAt:expires.toISOString(),updatedAt:new Date().toISOString(),adminNote:'Approved scholarship '+requestId});
  append_('Audit',{timestamp:new Date().toISOString(),actor:'OWNER',action:'SCHOLARSHIP_APPROVED',reference:String(requestId)});
  return {ok:true,plan:'PREMIUM_KASIH',expiresAt:expires.toISOString()};
 }finally{lock.releaseLock()}
}
function declineScholarship_(requestId,reason){
 if(!requestId||!String(reason||'').trim())throw Error('Application ID and review reason required');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const req=rows_('Scholarships').find(x=>String(x.requestId)===String(requestId));
  if(!req)throw Error('Application not found');
  if(req.status==='APPROVED')throw Error('Approved scholarship must be handled separately');
  update_('Scholarships','requestId',requestId,{status:'DECLINED',reviewedAt:new Date().toISOString(),adminNote:String(reason).slice(0,250)});
  append_('Audit',{timestamp:new Date().toISOString(),actor:'OWNER',action:'SCHOLARSHIP_DECLINED',reference:String(requestId)});
  return {ok:true};
 }finally{lock.releaseLock()}
}
function verifyManualPayment_(parentGoogleSub,reference,amountRM,months){
 // Only use after checking the payment independently in a bank statement.
 const ref=String(reference||'').trim().slice(0,80),amount=Number(amountRM);
 if(!ref||!parentGoogleSub||!Number.isFinite(amount)||amount<=0)throw Error('Valid parent, bank reference, and amount required');
 if(!rows_('Parents').some(p=>String(p.googleSub)===String(parentGoogleSub)))throw Error('Unknown parent');
 const duration=Math.max(1,Math.min(12,Math.floor(Number(months)||1)));
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  if(rows_('Payments').some(x=>String(x.reference)===ref&&String(x.status)==='VERIFIED'))throw Error('Payment reference already verified');
  const paymentId=Utilities.getUuid(),now=new Date(),expiry=new Date(now);
  expiry.setMonth(expiry.getMonth()+duration);
  append_('Payments',{paymentId,googleSub:parentGoogleSub,reference:ref,amountRM:amount,status:'VERIFIED',verifiedAt:now.toISOString(),adminNote:'Bank statement checked by owner'});
  append_('Subscriptions',{googleSub:parentGoogleSub,plan:'PREMIUM',status:'ACTIVE',expiresAt:expiry.toISOString(),updatedAt:now.toISOString(),adminNote:'Payment '+paymentId});
  append_('Audit',{timestamp:now.toISOString(),actor:'OWNER',action:'PAYMENT_VERIFIED',reference:paymentId});
  return {ok:true,paymentId,expiresAt:expiry.toISOString()};
 }finally{lock.releaseLock()}
}
function revokeMembership_(parentGoogleSub,reason){
 if(!parentGoogleSub||!String(reason||'').trim())throw Error('Parent ID and reason required');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const sheet=sheet_('Subscriptions'),values=sheet.getDataRange().getValues(),keys=TABLES.Subscriptions;
  let revoked=0;for(let i=1;i<values.length;i++)if(String(values[i][0])===String(parentGoogleSub)&&String(values[i][2])==='ACTIVE'){
   sheet.getRange(i+1,keys.indexOf('status')+1).setValue('REVOKED');revoked++;
  }
  append_('Audit',{timestamp:new Date().toISOString(),actor:'OWNER',action:'MEMBERSHIP_REVOKED',reference:String(parentGoogleSub).slice(0,80)});
  return {revoked};
 }finally{lock.releaseLock()}
}
