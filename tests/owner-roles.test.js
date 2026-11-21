import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

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
