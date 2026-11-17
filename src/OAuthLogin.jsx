import React,{useEffect,useRef,useState} from 'react';
import {acceptGoogleMessage} from './oauthMessage.js';
const BRIDGE='https://arvin8786.github.io/Bijak_Tutor/oauth-bridge.html';
export default function OAuthLogin({onToken,notice,live}){
 const [issue,setIssue]=useState(''),[busy,setBusy]=useState(false);
 const active=useRef(null),callback=useRef(onToken);callback.current=onToken;
 useEffect(()=>()=>{active.current?.cancel()},[]);
 function signIn(){
  if(active.current)return;
  setIssue('');setBusy(true);
  const nonce=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
  const popup=window.open(BRIDGE+'#'+nonce,'_blank','popup,width=500,height=650');
  if(!popup){setBusy(false);setIssue('Allow the sign-in popup, then try again.');return;}
  let timer,poll;
  const cancel=()=>{window.removeEventListener('message',receive);clearTimeout(timer);clearInterval(poll);active.current=null;setBusy(false);};
  const receive=event=>{
   if(!acceptGoogleMessage(event,popup,nonce,new URL(BRIDGE).origin))return;
   cancel();popup.close();callback.current(event.data.credential);
  };
  active.current={cancel};window.addEventListener('message',receive);
  timer=setTimeout(()=>{cancel();popup.close();setIssue('Sign-in expired. Please try again.');},180000);
  poll=setInterval(()=>{if(popup.closed){cancel();}},500);
 }
 return <><button className="primary" disabled={busy} onClick={signIn}>{busy?'Waiting for Google sign-in…':'Sign in with Google'}</button>{issue&&<p className="error" role="alert">{issue}</p>}</>;
}
