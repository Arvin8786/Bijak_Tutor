import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash,pbkdf2Sync} from 'node:crypto';
import {derive} from '../scripts/password-kdf.js';

function backend(){
 const owner='123456789012345678901',other='223456789012345678901';
 const tokens={owner:'owner-token-'.padEnd(80,'x'),other:'other-token-'.padEnd(80,'x')};
 const payloads=new Map([[tokens.owner,{sub:owner,email:'owner@example.test',name:'Owner'}],[tokens.other,{sub:other,email:'other@example.test',name:'Other'}]]);
 const tables={Parents:[],Children:[],StudentAccounts:[],Enrolments:[],Audit:[],AccountAccess:[],Subscriptions:[],Lessons:[{lessonId:'lesson',year:1,subject:'Matematik',title:'Addition',premium:'TRUE'}],Questions:[{lessonId:'lesson',questionId:'question',mode:'number',text:'2 + 3',correctAnswer:'5',why:'Count five',optionsJson:'[]'}],ModuleAccess:[{moduleId:'study-library',title:'Study library',enabled:true,free:true,premium:true,premiumKasih:true,freeLessonLimit:1}]};
 let locked=false,sequence=0;
 const api=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:key=>({ACCOUNT_ADMIN_GOOGLE_SUB:owner,GOOGLE_CLIENT_ID:'client'})[key]||''})},UrlFetchApp:{fetch:url=>{const p=payloads.get(new URL(url).searchParams.get('id_token'));return {getResponseCode:()=>p?200:400,getContentText:()=>JSON.stringify({...p,aud:'client',iss:'accounts.google.com',exp:Date.now()/1000+3600,email_verified:true})}}},SpreadsheetApp:{flush(){}},LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true},releaseLock(){locked=false}})},Utilities:{getUuid:()=> '00000000-0000-4000-8000-'+String(++sequence).padStart(12,'0')}});
 for(const file of ['Code','AccountAccess','StudentAccess','RolePortals','TierAccess','Commerce'])vm.runInContext(fs.readFileSync('apps-script/'+file+'.gs','utf8'),api);
 vm.runInContext(fs.readFileSync('src/answerMarking.js','utf8').replaceAll('export ','').replace(/\b(markPractice|normalizedAnswer|numericValue)\b/g,'$1_'),api);
 api.rows_=name=>tables[name]||[];
 api.sheet_=()=>({getDataRange:()=>({getValues:()=>[[]]})});
 api.append_=(name,row)=>(tables[name]||=[]).push({...row});
 api.update_=(name,key,value,patch)=>{const row=(tables[name]||[]).find(r=>String(r[key])===String(value));if(!row)return false;Object.assign(row,patch);return true};
 const cache=new Map();
 api.CacheService={getScriptCache:()=>({get:key=>cache.get(key),put:(key,value)=>cache.set(key,value),remove:key=>cache.delete(key)})};
 api.Utilities.base64EncodeWebSafe=bytes=>Buffer.from(bytes).toString('base64url');
 api.Utilities.DigestAlgorithm={SHA_256:'sha256'};
 api.Utilities.computeDigest=(algorithm,value)=>createHash(algorithm).update(value).digest();
 api.BijakPasswordKdf={derive:(...args)=>derive(...args)};
 vm.runInContext(fs.readFileSync('apps-script/PasswordAccounts.gs','utf8'),api);
 const session=(role,childId='')=>({idToken:tokens.owner,role,childId});
 return {api,tables,tokens,owner,other,session};
}

test('owner sign-in choices open real, separate roles and create one persistent learner',()=>{
 const {api,tables,tokens,session}=backend();
 assert.equal(api.getPortalBootstrap(tokens.owner,'admin','','owner-roles-v1').role,'ADMIN');
 assert.equal(tables.Children.length,0);
 assert.equal(api.getPortalBootstrap(tokens.owner,'parent','','owner-roles-v1').role,'PARENT');
 const student=api.getPortalBootstrap(tokens.owner,'student','','owner-roles-v1'),id=student.children[0].id;
 assert.equal(student.role,'STUDENT');assert.equal(student.canManageAccounts,false);assert.equal(student.access.plan,'PREMIUM');
 assert.equal(api.getPortalBootstrap(tokens.owner,'student','','owner-roles-v1').children[0].id,id);
 assert.equal(tables.Children.length,1);assert.equal(tables.StudentAccounts.length,1);assert.equal(tables.Enrolments.length,1);
 assert.equal(api.getParentDashboard(session('parent')).children[0].id,id);
 assert.equal(api.getLesson(session('student',id),id,'lesson').questions[0].text,'2 + 3');
 api.submitAttempt(session('student',id),id,'lesson','question','5',0);
 assert.equal(api.getParentDashboard(session('parent')).children[0].correct,1);
 assert.throws(()=>api.listAccountAccess(session('parent')),/administrator/);
 assert.throws(()=>api.listAccountAccess(session('student',id)),/administrator/);
 assert.throws(()=>api.getParentDashboard(session('student',id)),/Parent/);
 assert.throws(()=>api.getPortalBootstrap(session('parent'),'admin'),/Sign out/);
});

test('owner child corrections propagate and disabling access never recreates or reactivates it',()=>{
 const {api,tables,tokens,session}=backend();const id=api.getPortalBootstrap(tokens.owner,'student','','owner-roles-v1').children[0].id;
 const admin=session('admin'),student=session('student',id),profile=api.listStudentProfiles(admin)[0];
 api.updateChildAccount(admin,id,{...profile,name:'Updated learner',year:3,school:'SJKT',language:'ta',status:'ACTIVE',reason:'Update details',revision:profile.revision});
 assert.equal(api.getPortalBootstrap(student,'student').children[0].name,'Updated learner');
 assert.equal(api.getParentDashboard(session('parent')).children[0].year,3);
 assert.equal(tables.Enrolments[0].nickname,'Updated learner');
 api.setStudentAccount(admin,'owner@example.test',id,'REVOKED');
 assert.throws(()=>api.getLesson(student,id,'lesson'),/STUDENT_REVOKED/);
 assert.throws(()=>api.getPortalBootstrap(tokens.owner,'student','','owner-roles-v1'),/STUDENT_REVOKED/);
 assert.equal(tables.Children.length,1);
 assert.equal(api.getPortalBootstrap(tokens.owner,'admin','','owner-roles-v1').role,'ADMIN');
 api.setStudentAccount(admin,'owner@example.test',id,'ACTIVE');
 assert.equal(api.getPortalBootstrap(tokens.owner,'student','','owner-roles-v1').children[0].id,id);
});

test('role envelopes never grant other Google accounts owner powers or cross-family access',()=>{
 const {api,tables,tokens,other,session}=backend();const id=api.getPortalBootstrap(tokens.owner,'student','','owner-roles-v1').children[0].id;
 for(const role of ['admin','parent','student'])assert.throws(()=>api.verify_({idToken:tokens.other,role,childId:id}),/configured owner/);
 assert.throws(()=>api.getPortalBootstrap(tokens.other,'admin'),/ACCOUNT_PENDING/);
 assert.equal(tables.AccountAccess[0].status,'PENDING');
 tables.Parents.push({googleSub:other,email:'other@example.test'});tables.Children.push({childId:'other-child',parentSub:other,nickname:'Private'});
 assert.throws(()=>api.getLesson(session('student',id),'other-child','lesson'),/not linked/);
 assert.equal(api.getParentDashboard(session('parent')).children.length,1);
 assert.throws(()=>api.verify_({idToken:tokens.owner,role:'root',childId:''}),/Choose Parent/);
 assert.throws(()=>api.verify_({idToken:'invalid',role:'admin',childId:''}),/Google account/);
});

test('PBKDF2 verifier matches Node for UTF-8 passwords',()=>{
 const pass='Long test phrase 🔬',salt='74657374207465737420746573742031';
 const expected=pbkdf2Sync(pass,Buffer.from(salt,'hex'),600000,32,'sha256').toString('hex');
 assert.equal(derive(pass,salt,600000),expected);
});

test('a password-only learner stays linked to one profile and a reset invalidates their session',()=>{
 const {api,tables,session,tokens,other}=backend();
 api.getPortalBootstrap(tokens.owner,'parent','','owner-roles-v1');
 tables.Parents.push({googleSub:other,email:'other@example.test'});
 tables.Children.push({childId:'other-child',parentSub:other,nickname:'Other child'});
 const input={requestId:'11111111-2222-4222-8222-111111111111',name:'Learner',year:1,username:'little-reader',password:'fictional reading password',consent:true};
 assert.throws(()=>api.linkParentChild(session('parent'),{...input,consent:false}),/consent/);
 const linked=api.linkParentChild(session('parent'),input);
 assert.equal(api.linkParentChild(session('parent'),input).childId,linked.childId);
 assert.equal(tables.StudentAccounts.length,0);
 assert.equal(tables['User Authentication'].length,1);
 assert.notEqual(tables['User Authentication'][0].passwordHash,input.password);
 assert.equal(linked.signIn.passwordHash,undefined);
 const {token}=api.passwordSignIn({identifier:linked.signIn.userId,password:input.password,role:'student'});
 const boot=api.getPortalBootstrap(token,'student');
 assert.deepEqual(Array.from(boot.children,c=>c.id),[linked.childId]);
 assert.equal(boot.access.plan,'FREE');
 assert.throws(()=>api.getParentDashboard(token),/Parent account required/);
 assert.throws(()=>api.requireAccountAdmin_(token),/administrator access required/);
 assert.throws(()=>api.getLesson(token,'other-child','lesson'),/not linked/);
 assert.throws(()=>api.getPortalBootstrap(token,'admin'),/sign-in type/);
 assert.throws(()=>api.saveChildPassword(tokens.other,linked.childId,{password:'unauthorized test word'}),/not linked/);
 api.sheet_=()=>({
  getLastRow:()=>2,
  getRange:(row,column)=>row===2&&column===1?{
   createTextFinder:()=>({matchEntireCell:()=>({findNext:()=>({getRow:()=>2})})}),
   setValues([values]){const old=tables['User Authentication'][0];tables['User Authentication'][0]=Object.fromEntries(Object.keys(old).map((key,i)=>[key,values[i]]));}
  }:null
 });
 const next='changed fictional password';
 api.saveChildPassword(session('parent'),linked.childId,{password:next});
 assert.throws(()=>api.getPortalBootstrap(token,'student'),/PASSWORD_SESSION/);
 assert.throws(()=>api.passwordSignIn({identifier:linked.signIn.username,password:input.password,role:'student'}),/incorrect/);
 const renewed=api.passwordSignIn({identifier:linked.signIn.username,password:next,role:'student'});
 assert.equal(api.getPortalBootstrap(renewed.token,'student').children[0].id,linked.childId);
 api.passwordSignOut(renewed.token);
 assert.throws(()=>api.getPortalBootstrap(renewed.token,'student'),/PASSWORD_SESSION/);
});
