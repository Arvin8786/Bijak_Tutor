const SUBSCRIPTION_MONTHS_={MONTHLY_PREMIUM:1,ANNUAL_PREMIUM:12};
const SUBSCRIPTION_STANDARD_CENTS_=10000;
const SUBSCRIPTION_PROMO_CENTS_=6990;
const PAYMENT_GRACE_MS_=86400000;

function subscriptionQuote_(kind,settings){
 if(kind==='MONTHLY_PREMIUM')return {listCents:SUBSCRIPTION_STANDARD_CENTS_,discountCents:settings.monthlyPromotion?3010:0};
 if(kind==='ANNUAL_PREMIUM'){
  const listCents=12*SUBSCRIPTION_STANDARD_CENTS_;
  return {listCents,discountCents:Math.round(listCents*settings.annualDiscountPercent/100)};
 }
 return null;
}

// Calendar months in the Malaysian billing timezone, with month-end clamping.
function addBillingMonths_(from,months){
 const offset=8*3600000,date=new Date(from+offset),day=date.getUTCDate();
 date.setUTCDate(1);
 date.setUTCMonth(date.getUTCMonth()+months);
 const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();
 date.setUTCDate(Math.min(day,last));
 return date.getTime()-offset;
}
function paidSubscriptionEnd_(orders,baseline=0,after=0){
 return orders.filter(order=>order.status==='PAID'&&
  (SUBSCRIPTION_MONTHS_[order.kind]||order.kind==='TECHNICAL_CREDIT')&&Date.parse(order.reviewedAt)>after)
  .sort((a,b)=>Date.parse(a.reviewedAt)-Date.parse(b.reviewedAt))
  .reduce((end,order)=>addBillingMonths_(Math.max(end,Date.parse(order.reviewedAt)),SUBSCRIPTION_MONTHS_[order.kind]||Number(order.slots)),baseline);
}
function subscriptionAccess_(orders,manual,now){
 const changed=Date.parse(manual?.updatedAt)||0;
 const previous=manual?.plan==='PREMIUM'&&manual?.status==='ACTIVE'?Date.parse(manual.expiresAt)||0:0;
 const end=paidSubscriptionEnd_(orders,previous,changed);
 if(!end)return null;
 return {active:end+PAYMENT_GRACE_MS_>now,plan:end+PAYMENT_GRACE_MS_>now?'PREMIUM':'FREE',
  expiresAt:new Date(end).toISOString(),graceEndsAt:new Date(end+PAYMENT_GRACE_MS_).toISOString(),
  inGrace:now>=end&&now<end+PAYMENT_GRACE_MS_};
}
function setSubscriptionPricing(token,input){
 const admin=requireAccountAdmin_(token),percent=Number(input?.annualDiscountPercent);
 if(typeof input?.monthlyPromotion!=='boolean'||!Number.isInteger(percent)||percent<0||percent>90)throw Error('Choose the promotion setting and a 0–90% annual discount.');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  saveCommerceSetting_('monthlyPromotion',input.monthlyPromotion?'TRUE':'FALSE',admin);
  saveCommerceSetting_('annualDiscountPercent',percent,admin);
  return {ok:true};
 }finally{lock.releaseLock()}
}
function grantSubscriptionCredit(token,accountKey,months,reason,operationId){
 const admin=requireAccountAdmin_(token),sub=String(accountKey||'').replace(/^google:/,'');
 const duration=Number(months),note=String(reason||'').trim();
 if(!/^google:[A-Za-z0-9_-]{1,255}$/.test(accountKey)||!/^[a-f0-9-]{36}$/.test(operationId)||!Number.isInteger(duration)||duration<1||duration>12||!note||note.length>250)throw Error('Select a family and enter 1–12 months and a reason.');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  if(!rows_('Parents').some(parent=>String(parent.googleSub)===sub))throw Error('Parent account not found.');
  const id='credit-'+operationId,orders=rows_('Orders');
  const recorded=orders.find(o=>o.orderId===id);
  if(recorded){
   if(String(recorded.parentSub)!==sub||Number(recorded.slots)!==duration)throw Error('Credit request has already been used.');
   return {id};
  }
  if(access_({sub}).lifetime)throw Error('This family already has lifetime access.');
  const now=new Date().toISOString();
  append_('Orders',{orderId:id,parentSub:sub,kind:'TECHNICAL_CREDIT',slots:duration,listCents:0,discountCents:0,totalCents:0,status:'PAID',createdAt:now,reviewedAt:now,reviewedBy:accountKey_(admin.sub),note});
  append_('Audit',{timestamp:now,actor:accountKey_(admin.sub),action:'SUBSCRIPTION_CREDIT',reference:id});
  return {id};
 }finally{lock.releaseLock()}
}
function billingDocument_(order,type){
 if(!SUBSCRIPTION_MONTHS_[order.kind]||type==='receipt'&&!['PAID','REFUNDED'].includes(order.status))return null;
 return {number:(type==='invoice'?'BL-INV-':'BL-RCT-')+order.orderId.toUpperCase(),
  description:order.kind==='MONTHLY_PREMIUM'?'Monthly Premium subscription':'12-month Premium subscription',
  issuedAt:type==='invoice'?order.createdAt:order.reviewedAt,
  listCents:Number(order.listCents),discountCents:Number(order.discountCents),totalCents:Number(order.totalCents),
  status:order.status,reference:type==='receipt'?order.reference:''};
}

function sendSubscriptionEmail_(to,subject,body){
 if(!to||typeof MailApp==='undefined')return false;
 try{MailApp.sendEmail(to,subject,body);return true}catch(error){console.warn('Subscription email could not be delivered.');return false}
}
function emailBillingDocument(token,orderId,type){
 const user=requirePortalParent_(token);
 if(!['invoice','receipt'].includes(type))throw Error('Choose an invoice or receipt.');
 const order=rows_('Orders').find(row=>String(row.orderId)===orderId&&String(row.parentSub)===user.sub);
 const document=order&&billingDocument_(order,type);
 if(!document)throw Error('This billing document is unavailable.');
 const key='billing-email:'+orderId+':'+type,cache=CacheService.getScriptCache();
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  if(cache.get(key))throw Error('Please wait a minute before requesting another copy.');
  cache.put(key,'1',60);
 }finally{lock.releaseLock()}
 if(!sendSubscriptionEmail_(user.email,'BijakLearn '+type+' '+document.number,billingEmailBody_(document)))throw Error('Email delivery is unavailable. Your document is still available in the parent console.');
 return {ok:true};
}
function billingEmailBody_(document){
 return [document.description,'Issued: '+document.issuedAt,'Total: RM '+(document.totalCents/100).toFixed(2),'Order status: '+document.status,document.reference?'Payment reference: '+document.reference:'',
  'Sign in at '+publicAppUrl_()+' and open Membership & payments to view your document.'].filter(Boolean).join('\n');
}
