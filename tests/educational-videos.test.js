import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('video catalogue writes require administrator verification and validate entries',()=>{
 let value='[]',writes=0;
 const context=vm.createContext({requireAccountAdmin_:token=>{if(token!=='admin')throw Error('Administrator required')},withAuth_:(token,fn)=>{if(!token)throw Error('Sign in');return fn()},props_:()=>({getProperty:()=>value,setProperty:(_,v)=>{value=v;writes++}}),Utilities:{newBlob:s=>({getBytes:()=>new TextEncoder().encode(s)})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})}});
 vm.runInContext(fs.readFileSync('apps-script/EducationalVideos.gs','utf8'),context);
 const list=[{title:'Reviewed lesson',videoId:'abcdefghijk'}];
 assert.throws(()=>context.setEducationalVideos('learner',list),/Administrator/);
 assert.equal(writes,0);
 context.setEducationalVideos('admin',list);
 assert.equal(context.getEducationalVideos('learner')[0].title,'Reviewed lesson');
 assert.throws(()=>context.setEducationalVideos('admin',[{title:'Bad',videoId:'javascript:alert(1)'}]),/valid/);
 assert.throws(()=>context.setEducationalVideos('admin',[...list,...list]),/duplicate/);
 assert.equal(writes,1);
});
