// Public service coordinates are not credentials. Every server method verifies Google identity.
export const ACCOUNT_URL=import.meta.env.VITE_ACCOUNT_APP_URL||'https://script.google.com/macros/s/AKfycbyPJHxkj9PSkvs1-KYLZoTaF7DXCjt_vKzFJwyWwwBBNcrtjEkYQg5rhzlwrqqDyC1u/exec';
export const GOOGLE_CLIENT_ID='92044632567-40m43hcb263872ausujuc1b4ij99e1u7.apps.googleusercontent.com';
const SERVICE_ORIGIN='https://n-vldjkpsrhfo7nws4qz55tdcwo4iumiztih5n5cq-0lu-script.googleusercontent.com';
let connection;
export class AccountConnectionError extends Error {}
export function makeResponseHandler({channel,origin,source,pending}){
 return event=>{
  const data=event.data;
  if(event.origin!==origin||event.source!==source||data?.channel!==channel||data.type!=='bijak-rpc-result')return;
  const task=pending.get(data.id);if(!task)return;pending.delete(data.id);clearTimeout(task.timer);
  if(data.ok)task.resolve(data.value);else task.reject(new Error(typeof data.error==='string'?data.error:'Account request failed'));
 };
}
function connect(){
 const channel=crypto.randomUUID(),pending=new Map();
 const frame=document.createElement('iframe');
 frame.title='Secure BijakLearn account service';
 frame.setAttribute('aria-hidden','true');
 frame.tabIndex=-1;
 frame.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0';
 frame.referrerPolicy='no-referrer';
 const endpoint=new URL(ACCOUNT_URL);
 endpoint.searchParams.set('transport','1');
 endpoint.searchParams.set('channel',channel);
 let receive,readyTimer,rejectConnection;
 const session={ready:null,disconnect};
 function disconnect(){
  if(connection===session)connection=null;
  const error=new AccountConnectionError('The account service connection was interrupted.');
  clearTimeout(readyTimer);
  window.removeEventListener('message',handshake);
  if(receive)window.removeEventListener('message',receive);
  frame.remove();
  rejectConnection(error);
  for(const task of pending.values()){
   clearTimeout(task.timer);
   task.reject(error);
  }
  pending.clear();
 }
 let acceptConnection;
 function handshake(event){
  if(event.origin!==SERVICE_ORIGIN||event.data?.type!=='bijak-rpc-ready'||event.data?.channel!==channel||!event.source)return;
  const source=event.source;
  clearTimeout(readyTimer);
  window.removeEventListener('message',handshake);
  receive=makeResponseHandler({channel,origin:SERVICE_ORIGIN,source,pending});
  window.addEventListener('message',receive);
  acceptConnection((method,args,timeout)=>new Promise((resolve,reject)=>{
   const id=crypto.randomUUID();
   const timer=setTimeout(()=>{
    pending.delete(id);
    reject(new AccountConnectionError('The account service did not respond.'));
   },timeout);
   pending.set(id,{resolve,reject,timer});
   source.postMessage({type:'bijak-rpc',channel,id,method,args},SERVICE_ORIGIN);
  }));
 }
 session.ready=new Promise((resolve,reject)=>{
  acceptConnection=resolve;
  rejectConnection=reject;
  readyTimer=setTimeout(disconnect,15000);
  window.addEventListener('message',handshake);
  frame.src=endpoint.href;
  document.body.append(frame);
 });
 return session;
}
export async function remoteAccountCall(method,...args){
 const signIn=['getBootstrap','getStudentBootstrap','getPortalBootstrap'].includes(method);
 // A restored app can retain a window handle after the underlying iframe has stopped responding.
 if(signIn&&args[3]==='owner-roles-v1')connection?.disconnect();
 async function send(){
  const session=connection??=connect();
  try{
   const call=await session.ready;
   return await call(method,args,signIn?24000:45000);
  }catch(error){
   if(error instanceof AccountConnectionError)session.disconnect();
   throw error;
  }
 }
 try{return await send()}catch(error){
  // Only retry account bootstrap. A timed-out write may already have taken effect.
  if(!signIn||!(error instanceof AccountConnectionError))throw error;
  return send();
 }
}
