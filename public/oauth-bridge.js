'use strict';

const RETURN_ORIGIN='https://n-vldjkpsrhfo7nws4qz55tdcwo4iumiztih5n5cq-0lu-script.googleusercontent.com';
const CLIENT_ID='92044632567-40m43hcb263872ausujuc1b4ij99e1u7.apps.googleusercontent.com';
const nonce=location.hash.slice(1),message=document.getElementById('message');
history.replaceState(null,'',location.pathname);
function initializeGoogle(){
 if(!window.opener||!/^[a-f0-9]{64}$/.test(nonce)){message.textContent='Open sign-in from the BijakLearn account page.';return;}
 google.accounts.id.initialize({client_id:CLIENT_ID,nonce,ux_mode:'popup',callback:result=>{
  if(!result.credential)return;
  window.opener.postMessage({type:'bijak-google-credential',nonce,credential:result.credential},RETURN_ORIGIN);
  message.textContent='Sign-in sent securely. Return to BijakLearn.';
 }});
 google.accounts.id.renderButton(document.getElementById('google-signin'),{theme:'outline',size:'medium',shape:'pill',width:280});
 message.textContent='Choose your Google account. Access is checked by the BijakLearn administrator.';
}

const googleClient=document.createElement('script');
googleClient.src='https://accounts.google.com/gsi/client';
googleClient.async=true;
googleClient.addEventListener('load',initializeGoogle);
googleClient.addEventListener('error',()=>{message.textContent='Google sign-in could not load. Please close this window and try again.'});
if(window.opener&&/^[a-f0-9]{64}$/.test(nonce))document.head.append(googleClient);
else message.textContent='Open sign-in from the BijakLearn account page.';
