/**
 * OWNER-ONLY spreadsheet operations.
 * The trailing underscore prevents google.script.run from invoking these.
 * Run manually in the Apps Script editor, after verifying identity and payment.
 * Never expose these as web-app functions without separate strong admin auth.
 */
function approveScholarship_(requestId,months){return reviewKasih_(String(requestId),'APPROVED',Number(months)||12,'Verified by spreadsheet owner','OWNER')}
function declineScholarship_(requestId,reason){return reviewKasih_(String(requestId),'DECLINED',0,String(reason||''),'OWNER')}
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
