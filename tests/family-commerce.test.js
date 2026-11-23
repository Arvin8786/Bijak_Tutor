import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
function setup(){
 let id=0,locked=false;const fixed=Date.parse('2026-11-17T12:00:00Z');class Clock extends Date{constructor(...args){super(...(args.length?args:[fixed]))}static now(){return fixed}}
 const users={parent:{sub:'p',email:'parent@test.invalid',name:'Parent A'},other:{sub:'q',email:'other@test.invalid',name:'Parent B'},admin:{sub:'a',email:'admin@test.invalid',name:'Admin'},student:{sub:'s',email:'child@test.invalid',role:'STUDENT'}};
 const tables={Parents:[{googleSub:'p',email:users.parent.email,displayName:'Parent A'},{googleSub:'q',email:users.other.email,displayName:'Parent B'}]};const props=new Map([['KASIH_DOCUMENTS_FOLDER_ID','private']]),files=new Map();
 const api={SpreadsheetApp:{flush(){}},Date:Clock,Math,JSON,Map,Set,Utilities:{getUuid:()=> '00000000-0000-4000-8000-'+String(++id).padStart(12,'0'),formatDate:d=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit'}).format(d),newBlob:(bytes,type)=>({getBytes:()=>bytes,getContentType:()=>type}),base64Encode:bytes=>Buffer.from(bytes).toString('base64')},LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true},releaseLock(){locked=false}})},props_:()=>({getProperty:k=>props.get(k)}),rows_:name=>tables[name]||[],append_:(name,row)=>(tables[name]||=[]).push({...row}),update_:(name,key,value,patch)=>{const row=(tables[name]||[]).find(r=>String(r[key])===String(value));if(!row)return false;Object.assign(row,patch);return true},requireAccountAdmin_:token=>{if(token!=='admin')throw Error('Administrator required');return users.admin},requirePortalParent_:token=>{if(!['parent','other'].includes(token))throw Error('Verified active parent required');return users[token]},portalIdentity_:token=>({...users[token],role:token==='admin'?'ADMIN':token==='student'?'STUDENT':'PARENT'}),verify_:token=>users[token],isAccountAdmin_:u=>u.sub==='a',studentLink_:u=>u.role==='STUDENT'?{}:null,accountKey_:sub=>'google:'+sub,latestAccountEvents_:()=>new Map(),latestStudentLinks_:()=>{const map=new Map();(tables.StudentAccounts||[]).forEach(l=>map.set(l.studentKey,l));return [...map.values()]},trueCell_:v=>v===true||String(v).toUpperCase()==='TRUE',kasihDocument_:doc=>{if(!doc||!['application/pdf','image/png','image/jpeg'].includes(doc.mimeType))throw Error('Invalid upload');return {bytes:[37,80,68,70,45],mimeType:doc.mimeType,ext:'pdf'}},privateKasihFolder_:()=>({getId:()=> 'private',createFile:blob=>{const fid='file'+(++id),file={getId:()=>fid,getSharingAccess:()=> 'PRIVATE',getEditors:()=>[],getViewers:()=>[],setTrashed(){},isTrashed:()=>false,getBlob:()=>blob,getParents:()=>{let done=false;return {hasNext:()=>!done,next:()=>{done=true;return {getId:()=> 'private'}}}}};files.set(fid,file);return file}}),DriveApp:{Access:{PRIVATE:'PRIVATE'},getFileById:id=>files.get(id)}};
 vm.createContext(api);const code=fs.readFileSync('apps-script/Code.gs','utf8');vm.runInContext(code.slice(code.indexOf('function access_('),code.indexOf('\nfunction getBootstrap')),api);vm.runInContext(fs.readFileSync('apps-script/Commerce.gs','utf8'),api);
 vm.runInContext(fs.readFileSync('apps-script/SubscriptionBilling.gs','utf8'),api);
 return {api,tables,users,props};
}
const proof={mimeType:'application/pdf',data:'JVBERi0='};
function paid(api,kind='MONTHLY_PREMIUM',slots=1,code=''){const order=api.createFamilyOrder('parent',{kind,slots,discountCode:code});api.submitOrderProof('parent',order.id,'ref-'+order.id,proof);api.reviewFamilyOrder('admin',order.id,'PAID','Fictional cleared payment');return order}
test('parents self-link only their own children, with consent, and cannot remove or relink existing accounts',()=>{
 const {api,tables}=setup();assert.throws(()=>api.linkParentChild('student',{}),/parent/);assert.throws(()=>api.linkParentChild('parent',{studentEmail:'kid@test.invalid',name:'A',year:1}),/consent/);
 for(let i=0;i<8;i++)api.linkParentChild('parent',{studentEmail:'kid'+i+'@test.invalid',name:'Kid '+i,year:1,consent:true,parentSub:'q'});
 assert.equal(tables.Children.length,8);assert.equal(tables.Children[0].parentSub,'p');assert.equal(tables.StudentAccounts[0].status,'ACTIVE');assert.throws(()=>api.linkParentChild('other',{studentEmail:'kid0@test.invalid',name:'A',year:1,consent:true}),/already/);assert.throws(()=>api.removeChildLink('parent',tables.Children[0].childId,'remove'),/Administrator/);
 api.removeChildLink('admin',tables.Children[0].childId,'Owner requested');assert.equal(tables.Children[0].status,'REMOVED');assert.equal(api.latestStudentLinks_()[0].status,'REVOKED');
});
test('RM69.90 grants monthly Premium for two children; each RM30 add-on grants one more; others remain Free',()=>{
 const {api,tables}=setup();for(let i=0;i<4;i++)api.linkParentChild('parent',{studentEmail:'kid'+i+'@test.invalid',name:'Kid',year:1,consent:true});
 api.setSubscriptionPricing('admin',{monthlyPromotion:true,promotionCents:6990,annualDiscountPercent:0});const order=paid(api);assert.equal(order.totalCents,6990);assert.equal(api.access_({sub:'p'}).expiresAt,'2026-12-17T12:00:00.000Z');
 const learner=i=>api.access_({sub:'s',role:'STUDENT',familySub:'p',studentChildId:tables.Children[i].childId});assert.equal(learner(0).plan,'PREMIUM');assert.equal(learner(1).plan,'PREMIUM');assert.equal(learner(2).plan,'FREE');assert.equal(paid(api,'EXTRA_CHILD').totalCents,3000);assert.equal(learner(2).plan,'PREMIUM');assert.equal(learner(3).plan,'FREE');assert.throws(()=>api.createFamilyOrder('parent',{kind:'LIFETIME_PREMIUM'}),/Choose/);
});
test('discounts have server-side periods, usage limits, snapshot totals and rate bounds',()=>{
 const {api,tables}=setup();api.setSubscriptionPricing('admin',{monthlyPromotion:false,annualDiscountPercent:0});api.saveDiscountCampaign('admin',{code:'SAVE20',percent:20,startsAt:'2026-11-17T00:00:00Z',endsAt:'2026-11-18T00:00:00Z',maxUses:1});assert.throws(()=>api.saveDiscountCampaign('parent',{}),/Administrator/);
 const order=api.createFamilyOrder('parent',{kind:'MONTHLY_PREMIUM',discountCode:'SAVE20',totalCents:1});assert.equal(order.totalCents,8000);assert.equal(order.discountCents,2000);assert.throws(()=>api.createFamilyOrder('other',{kind:'MONTHLY_PREMIUM',discountCode:'SAVE20'}),/limit/);api.setDiscountEnabled('admin',tables.DiscountCampaigns[0].campaignId,false);assert.throws(()=>api.createFamilyOrder('other',{kind:'MONTHLY_PREMIUM',discountCode:'SAVE20'}),/inactive/);assert.throws(()=>api.setCommerceSettings('admin',{commissionPercent:101,paymentInstructions:'Valid instructions'}),/Commission/);
});
test('payment proof is private, rejects duplicate references and cannot grant access before admin verification',()=>{
 const {api}=setup(),order=api.createFamilyOrder('parent',{kind:'MONTHLY_PREMIUM'});assert.equal(api.access_({sub:'p'}).plan,'FREE');assert.throws(()=>api.submitOrderProof('other',order.id,'ref-123',proof),/unavailable/);api.submitOrderProof('parent',order.id,'ref-123',proof);assert.equal(api.access_({sub:'p'}).plan,'FREE');assert.throws(()=>api.reviewFamilyOrder('parent',order.id,'PAID','test'),/Administrator/);const own=api.getFamilyCommerce('parent').orders[0];assert.ok(api.getPrivateUpload('parent',own.proofId).data);assert.throws(()=>api.getPrivateUpload('other',own.proofId),/unavailable/);assert.throws(()=>api.getPrivateUpload('student',own.proofId),/unavailable/);api.reviewFamilyOrder('admin',order.id,'PAID','Verified test');api.reviewFamilyOrder('admin',order.id,'PAID','Repeated');assert.equal(api.paidFamilyOrders_('p').length,1);const other=api.createFamilyOrder('other',{kind:'MONTHLY_PREMIUM'});assert.throws(()=>api.submitOrderProof('other',other.id,'ref-123',proof),/already/);
});
test('referral attribution is immutable, excludes self/existing clients and does not expose Gmail in link',()=>{
 const {api,tables,users}=setup();const link=api.getFamilyCommerce('parent').affiliateUrl;assert.ok(!link.includes('@'));const code=new URL(link).searchParams.get('ref');const newcomer={sub:'new',email:'new@test.invalid',name:'New'};api.registerReferralOnboarding_(newcomer,code);assert.equal(tables.Referrals[0].referrerSub,'p');assert.equal(tables.Referrals[0].referrerEmail,users.parent.email);api.registerReferralOnboarding_(newcomer,'0'.repeat(32));assert.equal(tables.Referrals.length,1);api.registerReferralOnboarding_(users.parent,code);assert.equal(tables.Referrals.length,1);api.registerReferralOnboarding_({sub:'direct',email:'direct@test.invalid'},'');api.registerReferralOnboarding_({sub:'direct',email:'direct@test.invalid'},code);assert.equal(tables.Referrals[1].referrerSub,'');
});
test('commission uses net subscription amount and quoted rate, never extra-child payments',()=>{
 const {api,tables}=setup();api.setSubscriptionPricing('admin',{monthlyPromotion:false,annualDiscountPercent:0});tables.Referrals=[{referredSub:'p',referrerSub:'q'}];api.setCommerceSettings('admin',{commissionPercent:10,paymentInstructions:'Scan our verified QR'});api.saveDiscountCampaign('admin',{code:'SALE20',percent:20,startsAt:'2026-11-17T00:00:00Z',endsAt:'2026-11-18T00:00:00Z',maxUses:5});const order=api.createFamilyOrder('parent',{kind:'MONTHLY_PREMIUM',discountCode:'SALE20'});api.setCommerceSettings('admin',{commissionPercent:50,paymentInstructions:'Scan our verified QR'});api.submitOrderProof('parent',order.id,'paid-1',proof);api.reviewFamilyOrder('admin',order.id,'PAID','Verified');assert.equal(tables.Orders[0].commissionCents,800);assert.equal(api.getFamilyCommerce('other').referrals[0].commissionCents,800);paid(api,'EXTRA_CHILD',2);assert.equal(tables.Orders[1].commissionCents,0);
});
test('monthly payout excludes current month, prevents duplicates and refunds reverse unpaid entitlements',()=>{
 const {api,tables}=setup();api.setSubscriptionPricing('admin',{monthlyPromotion:false,annualDiscountPercent:0});tables.Referrals=[{referredSub:'p',referrerSub:'q'}];api.setCommerceSettings('admin',{commissionPercent:10,paymentInstructions:'Scan our verified QR'});const order=paid(api);assert.equal(api.eligibleCommissions_().length,0);tables.Orders[0].reviewedAt='2026-10-31T15:59:00Z';assert.equal(api.eligibleCommissions_().length,1);assert.throws(()=>api.recordCommissionPayout('parent','q','transfer'),/Administrator/);assert.equal(api.recordCommissionPayout('admin','q','transfer-1').amountCents,1000);assert.equal(api.eligibleCommissions_().length,0);assert.throws(()=>api.recordCommissionPayout('admin','q','transfer-2'),/No unpaid/);assert.throws(()=>api.reviewFamilyOrder('admin',order.id,'REFUNDED','Refund'),/reconcile/i);
 const other=setup();const base=paid(other.api);other.api.reviewFamilyOrder('admin',base.id,'REFUNDED','Actual refund completed');assert.equal(other.api.access_({sub:'p'}).plan,'FREE');
});
test('admin-only QR can be viewed by verified parents, not students; child and payment data remain family isolated',()=>{
 const {api,tables}=setup();assert.throws(()=>api.uploadPaymentQr('parent',{mimeType:'image/png'}),/Administrator/);api.uploadPaymentQr('admin',{mimeType:'image/png',data:'x'});const id=api.commerceSettings_().qrUploadId;assert.ok(api.getPrivateUpload('parent',id).data);assert.throws(()=>api.getPrivateUpload('student',id),/unavailable/);api.linkParentChild('parent',{studentEmail:'a@test.invalid',name:'Child A',year:1,consent:true});assert.equal(api.getFamilyCommerce('other').children.length,0);assert.equal(api.getFamilyCommerce('other').orders.length,0);assert.throws(()=>api.getCommerceAdministration('parent'),/Administrator/);assert.equal(tables.Uploads[0].purpose,'PAYMENT_QR');
});

test('retrying the same parent link request is idempotent and does not consume another child slot',()=>{
 const {api,tables}=setup(),details={requestId:'12345678-1234-4000-8000-123456789012',name:'Child',studentEmail:'unique@test.invalid',year:1,consent:true};
 const a=api.linkParentChild('parent',details),b=api.linkParentChild('parent',details);assert.equal(a.childId,b.childId);assert.equal(tables.Children.length,1);assert.equal(tables.StudentAccounts.length,1);assert.throws(()=>api.linkParentChild('other',details),/conflict/);
});


test('parent linking keeps enrolment details and rejects competing reservations or revoked links',()=>{
 const {api,tables}=setup();
 const details={requestId:'12345678-1234-4000-8000-123456789012',name:'Child',studentEmail:' Student@Test.Invalid ',year:2,school:'SJKT',language:'ta',consent:true};
 assert.throws(()=>api.linkParentChild('parent',{...details,studentEmail:'one@two@test.invalid'}),/consent/);
 tables.Enrolments=[{requestId:'earlier',studentEmail:'student@test.invalid',status:'LINKING',parentSub:'q'}];
 assert.throws(()=>api.linkParentChild('parent',details),/already/);
 tables.Enrolments=[];
 const linked=api.linkParentChild('parent',details);
 assert.equal(tables.Enrolments[0].parentEmail,'parent@test.invalid');
 assert.equal(tables.Enrolments[0].school,'SJKT');
 assert.equal(tables.Enrolments[0].language,'ta');
 assert.equal(tables.Children[0].childId,linked.childId);
 tables.StudentAccounts[0].status='REVOKED';
 assert.throws(()=>api.linkParentChild('parent',details),/administrator/);
});

test('annual pricing, private invoices, one-day grace and idempotent credits',()=>{
 const {api,tables}=setup();
 api.setSubscriptionPricing('admin',{monthlyPromotion:true,annualDiscountPercent:25});
 const order=api.createFamilyOrder('parent',{kind:'ANNUAL_PREMIUM'});
 assert.equal(order.totalCents,90000);
 assert.ok(order.invoice.number.startsWith('BL-INV-'));
 assert.equal(order.receipt,null);
 assert.equal(api.getFamilyCommerce('other').orders.length,0);
 api.submitOrderProof('parent',order.id,'annual-reference',proof);
 api.reviewFamilyOrder('admin',order.id,'PAID','Receipt verified');
 assert.ok(api.getFamilyCommerce('parent').orders[0].receipt.number.startsWith('BL-RCT-'));
 const end=Date.parse(api.access_({sub:'p'}).expiresAt);
 assert.equal(api.subscriptionAccess_(tables.Orders,null,end).inGrace,true);
 assert.equal(api.subscriptionAccess_(tables.Orders,null,end+86400000).plan,'FREE');
 const op='42f00000-0000-4000-8000-000000000001';
 assert.throws(()=>api.grantSubscriptionCredit('parent','google:p',2,'Outage',op),/Administrator/);
 api.grantSubscriptionCredit('admin','google:p',2,'Outage',op);
 api.grantSubscriptionCredit('admin','google:p',2,'Outage',op);
 assert.equal(tables.Orders.length,2);
 assert.equal(api.access_({sub:'p'}).expiresAt,'2028-01-17T12:00:00.000Z');
 assert.equal(new Date(api.addBillingMonths_(Date.parse('2026-01-31T08:00:00Z'),1)).toISOString(),'2026-02-28T08:00:00.000Z');
});

test('monthly points mature at cycle close, belong to one family and are reserved by live quotes',()=>{
 const {api,tables}=setup();
 api.setSubscriptionPricing('admin',{monthlyPromotion:true,promotionCents:4532,annualDiscountPercent:0});
 assert.throws(()=>api.setSubscriptionPricing('admin',{monthlyPromotion:true,promotionCents:10001,annualDiscountPercent:0}));
 tables.LearningRewards=[
  {childId:'c',parentSub:'p',points:5,availableAt:'2026-11-15T00:00:00Z'},
  {childId:'c',parentSub:'p',points:4,availableAt:'2026-12-15T00:00:00Z'},
  {childId:'other',parentSub:'q',points:3,availableAt:'2026-11-15T00:00:00Z'}
 ];
 const balance=api.getFamilyCommerce('parent').rewards;
 assert.deepEqual([balance.available,balance.pending],[5,4]);
 const quote=api.createFamilyOrder('parent',{kind:'MONTHLY_PREMIUM',redeemPoints:true,rewardPoints:99999});
 assert.equal(quote.rewardPoints,5);assert.equal(quote.totalCents,4527);
 assert.equal(api.getFamilyCommerce('parent').rewards.available,0);
 assert.equal(api.getFamilyCommerce('other').rewards.available,3);
 tables.Orders[0].expiresAt='2026-11-15T00:00:00Z';
 assert.equal(api.getFamilyCommerce('parent').rewards.available,5);
 const annual=api.createFamilyOrder('parent',{kind:'ANNUAL_PREMIUM',redeemPoints:true});
 assert.equal(annual.rewardPoints,0);
});
test('balloons bind awards to the signed-in learner, handle duplicate taps, and rate-limit new claims',()=>{
 const {api,tables}=setup();api.portalIdentity_=role=>({role,studentChildId:'c',familySub:'p'});
 api.requireChild_=()=>({childId:'c',parentSub:'p'});api.Math=Object.create(Math);api.Math.random=()=>0.9;
 const id='20000000-0000-4000-8000-000000000001';
 assert.throws(()=>api.claimLearningBalloon('PARENT',id),/student/);
 assert.equal(api.claimLearningBalloon('STUDENT',id).points,5);
 assert.equal(api.claimLearningBalloon('STUDENT',id).points,5);
 assert.equal(api.claimLearningBalloon('STUDENT',id.replace(/1$/,'2')).points,0);
 assert.equal(tables.LearningRewards.length,1);
});
