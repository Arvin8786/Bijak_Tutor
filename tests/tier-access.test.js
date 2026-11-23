import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {APP_MODULES,moduleForPage} from '../src/moduleRegistry.js';
import {GROWTH_TRACKS} from '../src/growthCurriculum.js';
const source=['Code','AccountAccess','TierAccess','PremiumKasih','StudentAccess','ModuleService','AdminOperations','TutorAI'].map(name=>fs.readFileSync(`apps-script/${name}.gs`,'utf8')).join('\n');
function backend(){
 const properties={GOOGLE_CLIENT_ID:'client',ACCOUNT_ADMIN_GOOGLE_SUB:'admin',KASIH_DOCUMENTS_FOLDER_ID:'folder'};
 const tables={Parents:[{googleSub:'family',email:'family@example.test'},{googleSub:'other',email:'other@example.test'}],AccountAccess:[],ModuleAccess:APP_MODULES.map(m=>({...m})),Subscriptions:[],Scholarships:[],Audit:[],Lessons:[],Children:[{childId:'child',parentSub:'family'}],ModuleCatalog:[],ModuleLessons:[]};
 const tokens=new Map(['family','other','admin'].map(sub=>[sub+'-'.repeat(60),{sub,aud:'client',iss:'accounts.google.com',exp:Date.now()/1000+3600,email_verified:true,email:sub+'@example.test'}]));
 let locked=false,id=0;const files=new Map();
 const folder={getId:()=> 'folder',getOwner:()=>({getEmail:()=> 'owner@example.test'}),getParents(){let done=false;return {hasNext:()=>!done,next:()=>{done=true;return {getId:()=> 'root'}}}},getSharingAccess:()=> 'PRIVATE',getEditors:()=>[],getViewers:()=>[],createFile(blob){const file={id:'file-'+(++id),trashed:false,getId(){return this.id},getSharingAccess:()=> 'PRIVATE',getEditors:()=>[],getViewers:()=>[],getBlob:()=>({getBytes:()=>blob.bytes,getContentType:()=>blob.mimeType}),getParents(){let done=false;return {hasNext:()=>!done,next:()=>{done=true;return folder}}},setTrashed(value){this.trashed=value},isTrashed(){return this.trashed}};files.set(file.id,file);return file}};
 const context=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties[key],setProperty:(key,value)=>properties[key]=value})},UrlFetchApp:{fetch:url=>{const payload=tokens.get(new URL(url).searchParams.get('id_token'));return {getResponseCode:()=>payload?200:400,getContentText:()=>JSON.stringify(payload)}}},LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true},releaseLock(){locked=false}})},SpreadsheetApp:{flush(){}},Utilities:{getUuid:()=> 'id-'+(++id),base64Decode:value=>[...Buffer.from(value,'base64')],base64Encode:value=>Buffer.from(value).toString('base64'),newBlob:(bytes,mimeType,name)=>({bytes,mimeType,name})},Session:{getEffectiveUser:()=>({getEmail:()=> 'owner@example.test'})},DriveApp:{getRootFolder:()=>({getId:()=> 'root'}),Access:{PRIVATE:'PRIVATE'},getFolderById:()=>folder,getFileById:id=>{if(!files.has(id))throw Error('No file');return files.get(id)}}});
 vm.runInContext(source,context);
 context.rows_=name=>tables[name]||[];
 context.append_=(name,row)=>(tables[name]||=[]).push({...row});
 context.update_=(name,key,value,patch)=>{const row=tables[name].find(row=>String(row[key])===String(value));if(!row)return false;Object.assign(row,patch);return true};
 vm.runInContext('const BIJAK_APP_MODULES='+JSON.stringify(APP_MODULES)+';const BIJAK_GROWTH_TRACKS='+JSON.stringify(GROWTH_TRACKS)+';',context);
 return {api:context,tables,properties,tokens,files,folder,token:sub=>sub+'-'.repeat(60)};
}
const application={guardianName:'Test Guardian',studentNickname:'Test Fox',schoolYear:2,reason:'Our family needs community support to keep access to learning opportunities.',guardianConsent:true};
const document={mimeType:'application/pdf',data:Buffer.from('%PDF-1.7\nFictional test evidence').toString('base64')};
const subscription=plan=>({googleSub:'family',plan,status:'ACTIVE',expiresAt:new Date(Date.now()+86400000).toISOString(),updatedAt:new Date().toISOString()});

test('all learning routes map to unique seeded sheet modules',()=>{
 assert.equal(APP_MODULES.length,21);assert.equal(new Set(APP_MODULES.map(m=>m.moduleId)).size,21);
 assert.equal(moduleForPage('growth','adult','hobby'),'adult-hobby');
 assert.equal(moduleForPage('lesson'),'study-library');assert.equal(moduleForPage('pin'),'parent-reports');
 assert.equal(moduleForPage('dictionary'),'picture-dictionary');
 assert.equal(moduleForPage('creative-projects'),'creative-projects');
 assert.equal(moduleForPage('premium-kasih'),null);
});
test('each tier reads its own permission column and malformed rules fail closed',()=>{
 const {api,tables,token}=backend();const rule=tables.ModuleAccess.find(m=>m.moduleId==='science-lab');
 assert.equal(api.authorizeModule(token('family'),'science-lab').allowed,false);
 rule.free='TRUE';assert.equal(api.authorizeModule(token('family'),'science-lab').allowed,true);
 tables.Subscriptions.push(subscription('PREMIUM'));rule.premium=false;
 assert.equal(api.authorizeModule(token('family'),'science-lab').allowed,false);
 tables.Subscriptions.push(subscription('PREMIUM_KASIH'));rule.premiumKasih=true;
 assert.equal(api.authorizeModule(token('family'),'science-lab').allowed,true);
 rule.enabled='no';assert.equal(api.authorizeModule(token('family'),'science-lab').allowed,false);
 rule.enabled=true;tables.ModuleAccess.push({...rule});assert.equal(api.authorizeModule(token('family'),'science-lab').allowed,false);
 assert.equal(api.authorizeModule(token('family'),'missing').allowed,false);
});
test('latest expiry, revocation, and downgrade never revive older paid subscriptions',()=>{
 const {api,tables}=backend();tables.Subscriptions.push(subscription('PREMIUM'));
 tables.Subscriptions.push({...subscription('PREMIUM_KASIH'),expiresAt:'2000-01-01'});
 assert.equal(api.access_({sub:'family'}).plan,'FREE');
 tables.Subscriptions.push({...subscription('PREMIUM'),status:'REVOKED'});
 assert.equal(api.access_({sub:'family'}).plan,'FREE');
 tables.Subscriptions.push({...subscription('FREE'),expiresAt:''});
 assert.equal(api.access_({sub:'family'}).plan,'FREE');
});
test('free lesson limit is enforced on server and legacy premium flags still apply',()=>{
 const {api,tables,token}=backend();const rule=tables.ModuleAccess.find(m=>m.moduleId==='study-library');rule.freeLessonLimit=1;
 tables.Lessons.push(...['a','b','c'].map(lessonId=>({lessonId,year:1,subject:'Matematik',school:'SK',premium:lessonId==='c',title:lessonId})));
 assert.equal(api.getLesson(token('family'),'child','a').id,'a');
 assert.throws(()=>api.getLesson(token('family'),'child','b'),/Free lesson limit/);
 assert.throws(()=>api.submitAttempt(token('family'),'child','b','q','answer',0),/Free lesson limit/);
 assert.throws(()=>api.getLesson(token('family'),'child','c'),/Membership required/);
 rule.freeLessonLimit=0;assert.throws(()=>api.getLesson(token('family'),'child','a'),/Free lesson limit/);
 tables.Subscriptions.push(subscription('PREMIUM'));assert.equal(api.getLesson(token('family'),'child','b').id,'b');
 rule.enabled=false;assert.throws(()=>api.getLesson(token('family'),'child','b'),/MODULE_DENIED/);
});
test('module checks run before parent report, tutor and growth operations',()=>{
 const {api,token}=backend();
 assert.throws(()=>api.getParentReport(token('family'),'child','123456'),/MODULE_DENIED/);
 assert.throws(()=>api.askTutor(token('family'),'maths',{}),/MODULE_DENIED/);
 assert.throws(()=>api.getGrowthModule(token('family'),'adult-ai'),/MODULE_DENIED/);
});
test('only verified administrator can grant Free or Premium; Kasih requires application review',()=>{
 const {api,tables,token}=backend();
 assert.throws(()=>api.setMembership(token('family'),'google:family','PREMIUM',12,'test'),/administrator/);
 assert.throws(()=>api.setMembership(token('admin'),'google:family','PREMIUM_KASIH',12,'test'),/reviewing an application/);
 api.setMembership(token('admin'),'google:family','PREMIUM',1,'Payment verified');
 assert.equal(api.access_({sub:'family'}).plan,'PREMIUM');
 api.setMembership(token('admin'),'google:family','FREE',0,'Free access granted');
 assert.equal(api.access_({sub:'family'}).plan,'FREE');assert.equal(tables.Audit.length,2);
});
test('Kasih consent, evidence type, privacy, duplicate requests and ownership are enforced',()=>{
 const {api,token,tables,files,folder}=backend();
 assert.throws(()=>api.submitKasihApplication(token('family'),{...application,guardianConsent:false},[document]),/consent/);
 assert.throws(()=>api.submitKasihApplication(token('family'),application,[]),/one or two/);
 assert.throws(()=>api.submitKasihApplication(token('family'),application,[{...document,data:Buffer.from('not a PDF').toString('base64')}]),/does not match/);
 folder.getSharingAccess=()=> 'ANYONE';assert.throws(()=>api.submitKasihApplication(token('family'),application,[document]),/must be private/);
 folder.getSharingAccess=()=> 'PRIVATE';const result=api.submitKasihApplication(token('family'),application,[document]);
 assert.equal(result.status,'PENDING');assert.equal(files.size,1);
 assert.throws(()=>api.submitKasihApplication(token('family'),application,[document]),/awaiting review/);assert.equal(files.size,1);
 assert.equal(api.getKasihApplication(token('other')),null);
 assert.ok(!Object.hasOwn(api.getKasihApplication(token('family')),'documentIdsJson'));
 assert.equal(tables.Scholarships[0].reason,application.reason);
});
test('evidence files are cleaned up if persistence fails',()=>{
 const {api,token,files}=backend();api.append_=()=>{throw Error('Sheet write failed')};
 assert.throws(()=>api.submitKasihApplication(token('family'),application,[document]),/Sheet write failed/);
 assert.ok([...files.values()].every(file=>file.trashed));
});
test('only admin reviews evidence, approval grants Kasih and remains subject to account blocking',()=>{
 const {api,token,tables}=backend();const {requestId}=api.submitKasihApplication(token('family'),application,[document]);
 const fileId=JSON.parse(tables.Scholarships[0].documentIdsJson)[0];
 assert.throws(()=>api.listKasihApplications(token('family')),/administrator/);
 assert.throws(()=>api.getKasihDocument(token('family'),requestId,fileId),/administrator/);
 assert.throws(()=>api.getKasihDocument(token('admin'),'wrong-request',fileId),/not found/);
 assert.equal(api.getKasihDocument(token('admin'),requestId,fileId).mimeType,'application/pdf');
 assert.throws(()=>api.reviewKasihApplication(token('family'),requestId,'APPROVED',12,'Test'),/administrator/);
 api.reviewKasihApplication(token('admin'),requestId,'APPROVED',12,'Evidence reviewed');
 assert.equal(api.access_({sub:'family'}).plan,'PREMIUM_KASIH');
 assert.throws(()=>api.reviewKasihApplication(token('admin'),requestId,'APPROVED',12,'Again'),/not awaiting review/);
 api.setAccountAccess(token('admin'),'google:family','REVOKED','Test block');
 assert.throws(()=>api.authorizeModule(token('family'),'science-lab'),/ACCOUNT_REVOKED/);
});
test('legacy evidence-free applications cannot grant sponsored access and declined requests grant nothing',()=>{
 const {api,tables,token}=backend();tables.Scholarships.push({requestId:'legacy',googleSub:'family',status:'PENDING'});
 assert.throws(()=>api.approveScholarship_('legacy',12),/complete application/);
 api.reviewKasihApplication(token('admin'),'legacy','DECLINED',0,'Evidence missing');
 assert.equal(api.access_({sub:'family'}).plan,'FREE');
});
test('partially persisted Kasih approval fails closed until application status is approved',()=>{
 const {api,tables}=backend();tables.Subscriptions.push({...subscription('PREMIUM_KASIH'),adminNote:'Kasih application pending'});
 tables.Scholarships.push({requestId:'pending',status:'PENDING'});assert.equal(api.access_({sub:'family'}).plan,'FREE');
 tables.Scholarships[0].status='APPROVED';assert.equal(api.access_({sub:'family'}).plan,'PREMIUM_KASIH');
});
test('module and growth imports are additive and preserve edited tier settings',()=>{
 const {api,tables}=backend();tables.ModuleAccess=[];
 assert.equal(api.seedModuleAccess_().added,21);tables.ModuleAccess[0].free=false;
 assert.equal(api.seedModuleAccess_().added,0);assert.equal(tables.ModuleAccess[0].free,false);
 assert.equal(api.importGrowthModules_().addedModules,4);assert.ok(tables.ModuleLessons.length>0);
 assert.equal(api.importGrowthModules_().addedLessons,0);
});
test('OAuth identity validation rejects audience, issuer, expiry and unverified email',()=>{
 for(const [field,value] of [['aud','wrong'],['iss','invalid'],['exp',0],['email_verified',false]]){
  const {api,tokens,token}=backend();tokens.get(token('family'))[field]=value;
  assert.throws(()=>api.authorizeModule(token('family'),'preschool'),/Invalid Google identity/);
 }
});


test('growth service never returns hidden activities or leaks stored answers',()=>{
 const {api,tables,token}=backend();
 tables.ModuleCatalog.push({moduleId:'junior-ai',title:'AI',visibility:'PUBLIC_PREVIEW',accessTier:'FREE'});
 const lesson=(id,visibility)=>({lessonId:id,moduleId:'junior-ai',sequence:1,title:id,visibility,stepsJson:'[]',questionJson:JSON.stringify({question:'Test?',options:['A','B'],answer:1,why:'Explanation'}),contentStatus:'TEACHER_APPROVED',reviewStatus:'APPROVED'});
 tables.ModuleLessons.push(lesson('junior-ai-1','PUBLIC_PREVIEW'),lesson('junior-ai-2','PRIVATE'),lesson('junior-ai-3','HIDDEN'));
 const free=api.getGrowthModule(token('family'),'junior-ai');assert.equal(free.lessons.length,1);
 assert.equal(Object.hasOwn(free.lessons[0].quiz,'answer'),false);
 tables.Subscriptions.push(subscription('PREMIUM'));
 assert.equal(api.getGrowthModule(token('family'),'junior-ai').lessons.length,2);
 assert.throws(()=>api.checkGrowthAnswer(token('family'),'junior-ai-3',1),/unavailable/);
});


test('oversized evidence and too many attachments are rejected before file creation',()=>{
 const {api,token,files}=backend();
 assert.throws(()=>api.submitKasihApplication(token('family'),application,[document,document,document]),/one or two/);
 const data=Buffer.alloc(1024*1024+1).toString('base64');
 assert.throws(()=>api.submitKasihApplication(token('family'),application,[{mimeType:'application/pdf',data}]),/at most 1 MB/);
 assert.equal(files.size,0);
});
test('retention trashes only reviewed evidence after the retention period',()=>{
 const {api,tables,token,files}=backend();api.submitKasihApplication(token('family'),application,[document]);
 assert.equal(api.purgeKasihEvidence_().removed,0);
 tables.Scholarships[0].status='DECLINED';tables.Scholarships[0].reviewedAt='2000-01-01T00:00:00Z';
 assert.equal(api.purgeKasihEvidence_().removed,1);assert.ok([...files.values()][0].trashed);
 assert.equal(tables.Scholarships[0].reason,'');assert.equal(tables.Scholarships[0].documentIdsJson,'[]');
 assert.equal(api.purgeKasihEvidence_().removed,0);
});


function studentFixture(){
 const state=backend();
 state.tables.Children[0]={...state.tables.Children[0],nickname:'Test Fox',year:2,school:'SK'};
 state.tables.Children.push({childId:'sibling',parentSub:'family',nickname:'Sibling'},{childId:'other-child',parentSub:'other',nickname:'Other family'});
 const credential='student'+'-'.repeat(60);
 state.tokens.set(credential,{sub:'student',aud:'client',iss:'accounts.google.com',exp:Date.now()/1000+3600,email_verified:true,email:'student@example.test'});
 return {...state,credential};
}
test('unlinked student sign-in does not create a parent account or enrol a learner',()=>{
 const {api,tables,credential}=studentFixture();
 assert.throws(()=>api.getStudentBootstrap(credential),/STUDENT_NOT_LINKED/);
 assert.equal(tables.Parents.length,2);assert.equal(tables.AccountAccess.length,0);
});
test('student identities bind only to administrator-linked emails and inherit the family tier',()=>{
 const {api,tables,credential,token}=studentFixture();
 assert.throws(()=>api.setStudentAccount(token('family'),'student@example.test','child','ACTIVE'),/administrator/);
 assert.throws(()=>api.setStudentAccount(token('admin'),'family@example.test','child','ACTIVE'),/separate student/);
 api.setStudentAccount(token('admin'),'student@example.test','child','ACTIVE');
 assert.throws(()=>api.getBootstrap(credential),/STUDENT_ONLY/);
 tables.Subscriptions.push(subscription('PREMIUM'));
 const boot=api.getStudentBootstrap(credential);
 assert.equal(boot.role,'STUDENT');assert.equal(boot.children.length,1);assert.equal(boot.children[0].id,'child');assert.equal(boot.parent,null);assert.equal(boot.canManageAccounts,false);assert.equal(boot.access.plan,'PREMIUM');
 assert.equal(tables.Parents.length,2);assert.equal(api.listStudentAccounts(token('admin'))[0].bound,true);
 assert.throws(()=>api.getBootstrap(credential),/STUDENT_ONLY/);
});
test('student Google tokens cannot perform parent operations or access sibling profiles',()=>{
 const {api,tables,credential,token}=studentFixture();api.setStudentAccount(token('admin'),'student@example.test','child','ACTIVE');api.getStudentBootstrap(credential);
 tables.Subscriptions.push(subscription('PREMIUM'));
 for(const method of ['addChild','getParentReport','setParentPin','submitKasihApplication','getKasihApplication'])assert.throws(()=>api[method](credential),/PARENT_ONLY/,method);
 for(const childId of ['sibling','other-child'])assert.throws(()=>api.getLesson(credential,childId,'a'),/Child not linked/);
 assert.equal(api.authorizeModule(credential,'parent-reports').allowed,false);
 assert.equal(api.authorizeModule(credential,'adult-ai').allowed,false);
 assert.equal(api.authorizeModule(credential,'science-lab').allowed,true);
 assert.throws(()=>api.listAccountAccess(credential),/administrator/);
 assert.throws(()=>api.setMembership(credential,'google:student','PREMIUM',12,'Test'),/administrator/);
});
test('revoking a student link or blocking its parent takes effect on the next protected request',()=>{
 const {api,credential,token}=studentFixture();api.setStudentAccount(token('admin'),'student@example.test','child','ACTIVE');api.getStudentBootstrap(credential);
 api.setStudentAccount(token('admin'),'student@example.test','child','REVOKED');
 assert.throws(()=>api.authorizeModule(credential,'maths-studio'),/STUDENT_REVOKED/);
 api.setStudentAccount(token('admin'),'student@example.test','child','ACTIVE');
 assert.equal(api.authorizeModule(credential,'maths-studio').allowed,true);
 api.setAccountAccess(token('admin'),'google:family','REVOKED','Test parent block');
 assert.throws(()=>api.authorizeModule(credential,'maths-studio'),/ACCOUNT_REVOKED/);
});
test('student identity cannot be taken over by a new Google subject reusing its email',()=>{
 const {api,credential,tokens,token}=studentFixture();api.setStudentAccount(token('admin'),'student@example.test','child','ACTIVE');api.getStudentBootstrap(credential);
 tokens.get(credential).sub='impostor';
 assert.throws(()=>api.getStudentBootstrap(credential),/does not match/);
});
test('moving an active student to another learner requires prior revocation',()=>{
 const {api,token}=studentFixture();api.setStudentAccount(token('admin'),'student@example.test','child','ACTIVE');
 assert.throws(()=>api.setStudentAccount(token('admin'),'student@example.test','other-child','ACTIVE'),/Revoke/);
 api.setStudentAccount(token('admin'),'student@example.test','child','REVOKED');
 api.setStudentAccount(token('admin'),'student@example.test','other-child','ACTIVE');
 assert.equal(api.listStudentAccounts(token('admin'))[0].childId,'other-child');
});
test('owner OAuth configuration accepts a Web client ID and rejects secrets or missing IDs',()=>{
 const {api,properties}=backend();
 assert.throws(()=>api.configureGoogleOAuth_('not-a-client'),/Web application OAuth client/);
 assert.equal(api.configureGoogleOAuth_('123456789-testclient.apps.googleusercontent.com').clientIdConfigured,true);
 assert.equal(properties.GOOGLE_CLIENT_ID,'123456789-testclient.apps.googleusercontent.com');
});


test('administrator student linking approves an accidental pending parent sign-in, but never overrides blocking',()=>{
 const {api,tables,credential,token}=studentFixture();
 tables.AccountAccess.push({accountKey:'google:student',status:'PENDING'});
 api.setStudentAccount(token('admin'),'student@example.test','child','ACTIVE');
 assert.equal(api.getStudentBootstrap(credential).role,'STUDENT');
 tables.AccountAccess.push({accountKey:'google:student',status:'REVOKED'});
 assert.throws(()=>api.getStudentBootstrap(credential),/STUDENT_REVOKED/);
});

test('learner and section rules apply to each student and to lesson reads and attempts',()=>{
 const {api,tables,credential,token}=studentFixture();
 api.setStudentAccount(token('admin'),'student@example.test','child','ACTIVE');
 tables.Children[0].year=4;
 tables.Lessons.push(
  {lessonId:'lower',year:3,school:'SK',subject:'Matematik',title:'Lower',premium:false},
  {lessonId:'upper',year:4,school:'SK',subject:'Matematik',title:'Upper',premium:false}
 );
 tables.Questions=[];
 tables.LearnerModuleAccess=[
  {childId:'sibling',moduleId:'science-lab',decision:'ALLOW'},
  {childId:'child',moduleId:'preschool',decision:'ALLOW'}
 ];
 const boot=api.getStudentBootstrap(credential);
 assert.deepEqual(Array.from(boot.lessons,l=>l.id),['upper']);
 assert.equal(api.authorizeModule(credential,'science-lab').reason,'membership');
 assert.equal(api.authorizeModule(credential,'preschool').reason,'section');
 assert.throws(()=>api.getLesson(credential,'child','lower'),/different learning section/);
 assert.throws(()=>api.submitAttempt(credential,'child','lower','q','1',0),/different learning section/);
 tables.LearnerModuleAccess.push({childId:'child',moduleId:'science-lab',decision:'ALLOW'});
 assert.equal(api.authorizeModule(credential,'science-lab').allowed,true);
 tables.ModuleAccess.find(row=>row.moduleId==='science-lab').juniorPlus=false;
 assert.equal(api.authorizeModule(credential,'science-lab').reason,'section');
 tables.LearnerModuleAccess.push({childId:'child',moduleId:'study-library',decision:'DENY'});
 assert.equal(api.getStudentBootstrap(credential).lessons.length,0);
 assert.throws(()=>api.getLesson(credential,'child','upper'),/MODULE_DENIED/);
});
