// Public service coordinates are not credentials. Every server method verifies Google identity.
export const ACCOUNT_URL=import.meta.env.VITE_ACCOUNT_APP_URL||'https://script.google.com/macros/s/AKfycbyPJHxkj9PSkvs1-KYLZoTaF7DXCjt_vKzFJwyWwwBBNcrtjEkYQg5rhzlwrqqDyC1u/exec';
export const GOOGLE_CLIENT_ID='92044632567-40m43hcb263872ausujuc1b4ij99e1u7.apps.googleusercontent.com';
const SERVICE_ORIGIN='https://n-vldjkpsrhfo7nws4qz55tdcwo4iumiztih5n5cq-0lu-script.googleusercontent.com';
let ready;
export function makeResponseHandler({channel,origin,source,pending}){
 return event=>{
  const data=event.data;
  if(event.origin!==origin||event.source!==source||data?.channel!==channel||data.type!=='bijak-rpc-result')return;
  const task=pending.get(data.id);if(!task)return;pending.delete(data.id);clearTimeout(task.timer);
  if(data.ok)task.resolve(data.value);else task.reject(new Error(typeof data.error==='string'?data.error:'Account request failed'));
 };
}
function connect(){
 if(ready)return ready;
 ready=new Promise((resolve,reject)=>{
  const channel=crypto.randomUUID(),pending=new Map();let source;
  const frame=document.createElement('iframe');frame.hidden=true;frame.title='Secure BijakLearn account service';frame.referrerPolicy='no-referrer';
  const endpoint=new URL(ACCOUNT_URL);endpoint.searchParams.set('transport','1');endpoint.searchParams.set('channel',channel);
  let receive;
  const timer=setTimeout(()=>{window.removeEventListener('message',handshake);frame.remove();ready=null;reject(new Error('Account service could not connect. Please try again.'));},30000);
  function handshake(event){
   if(event.origin!==SERVICE_ORIGIN||event.data?.type!=='bijak-rpc-ready'||event.data?.channel!==channel||!event.source)return;
   source=event.source;clearTimeout(timer);window.removeEventListener('message',handshake);
   receive=makeResponseHandler({channel,origin:SERVICE_ORIGIN,source,pending});window.addEventListener('message',receive);
   resolve((method,args)=>new Promise((resolve,reject)=>{
    const id=crypto.randomUUID();const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Account request timed out. Refresh before retrying a change.'));},45000);
    pending.set(id,{resolve,reject,timer});source.postMessage({type:'bijak-rpc',channel,id,method,args},SERVICE_ORIGIN);
   }));
  }
  window.addEventListener('message',handshake);frame.src=endpoint.href;document.body.append(frame);
 });
 return ready;
}
export async function remoteAccountCall(method,...args){const call=await connect();return call(method,args);}
