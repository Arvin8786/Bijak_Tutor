import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {runInNewContext} from 'node:vm';

test('the offline worker handles only explicitly published assets and never stores private responses',async()=>{
 const handlers={};
 const origin='https://arvin8786.github.io',scope=origin+'/Bijak_Tutor/';
 const stored=[];
 let cacheControl='';
 const cache={put:async(request)=>stored.push(request.url)};
 const response={ok:true,type:'basic',headers:{get:()=>cacheControl},clone(){return this}};
 const source=readFileSync('public/sw.js','utf8')
  .replace('const BUNDLED_ASSETS = [];','const BUNDLED_ASSETS = ["assets/index-123456789.js"];');
 runInNewContext(source,{
  self:{registration:{scope},location:{origin},addEventListener:(name,fn)=>{handlers[name]=fn}},
  URL,fetch:async()=>response,caches:{match:async()=>null,open:async()=>cache}
 });
 async function visit(path,method='GET'){
  let task;
  const wait=[];
  handlers.fetch({
   request:{url:path.startsWith('https:')?path:scope+path,method,mode:'same-origin'},
   respondWith(value){task=value;},waitUntil(value){wait.push(value);}
  });
  await task;
  await Promise.all(wait);
  return Boolean(task);
 }
 assert.equal(await visit('private/statement.js'),false);
 assert.equal(await visit('payment-proof.png'),false);
 assert.equal(await visit('icons/app-icon.svg?student=1'),false);
 assert.equal(await visit('assets/index-123456789.js','POST'),false);
 assert.equal(await visit('https://example.invalid/icon.svg'),false);
 assert.equal(await visit('oauth-bridge.js'),false);
 assert.equal(await visit('assets/index-123456789.js'),true);
 cacheControl='private, max-age=120';
 assert.equal(await visit('icons/app-icon.svg'),true);
 cacheControl='no-store';
 assert.equal(await visit('manifest.webmanifest'),true);
 assert.deepEqual(stored,[scope+'assets/index-123456789.js']);
});
