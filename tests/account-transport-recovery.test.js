import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function fixture(){
 const src=fs.readFileSync('src/accountTransport.js','utf8')
  .replace('import.meta.env.VITE_ACCOUNT_APP_URL', "''")
  .replace(/^export /gm,'');
 let serial=0;
 const origin='https://n-vldjkpsrhfo7nws4qz55tdcwo4iumiztih5n5cq-0lu-script.googleusercontent.com';
 const listeners=new Set(),timers=new Map(),frames=[],messages=[];
 const context=vm.createContext({
  URL,crypto:{randomUUID:()=>String(++serial)},
  setTimeout(callback){const id=++serial;timers.set(id,callback);return id},
  clearTimeout:id=>timers.delete(id),
  window:{addEventListener:(_,callback)=>listeners.add(callback),removeEventListener:(_,callback)=>listeners.delete(callback)},
  document:{createElement(){return {style:{},setAttribute(){},remove(){this.removed=true}}},body:{append:frame=>frames.push(frame)}}
 });
 vm.runInContext(src+'\nglobalThis.rpc=remoteAccountCall;',context);
 function deliver(event){for(const listener of [...listeners])listener({origin,...event})}
 function ready(frame){
  const channel=new URL(frame.src).searchParams.get('channel');
  const peer={postMessage:(data,target)=>{assert.equal(target,origin);messages.push({peer,data})}};
  deliver({source:peer,data:{channel,type:'bijak-rpc-ready'}});
 }
 function respond(result){
  const {peer,data}=messages.at(-1);
  deliver({source:peer,data:{channel:data.channel,id:data.id,type:'bijak-rpc-result',...result}});
 }
 function expire(){
  const [id,callback]=[...timers][0];
  timers.delete(id);
  callback();
 }
 return {call:context.rpc,frames,messages,ready,respond,expire};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('a timed-out account bootstrap reconnects once with a fresh channel',async()=>{
 const bridge=fixture();
 const login=bridge.call('getPortalBootstrap','token','admin','','owner-roles-v1');
 bridge.ready(bridge.frames[0]);
 await tick();
 bridge.expire();
 await tick();
 assert.equal(bridge.frames[0].removed,true);
 assert.equal(bridge.frames.length,2);
 bridge.ready(bridge.frames[1]);
 await tick();
 assert.notEqual(bridge.messages[0].data.channel,bridge.messages[1].data.channel);
 bridge.respond({ok:true,value:'signed in'});
 assert.equal(await login,'signed in');
});

test('authorization rejections and timed-out writes are never retried',async()=>{
 const bridge=fixture();
 const login=bridge.call('getPortalBootstrap','token','admin');
 bridge.ready(bridge.frames[0]);
 await tick();
 bridge.respond({ok:false,error:'Administrator access required'});
 await assert.rejects(login,/Administrator access required/);
 assert.equal(bridge.frames.length,1);
 const write=bridge.call('publishParentNotice','token',{});
 await tick();
 bridge.expire();
 await assert.rejects(write,/did not respond/);
 assert.equal(bridge.frames.length,1);
});
