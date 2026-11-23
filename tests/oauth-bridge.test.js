import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {acceptGoogleMessage} from '../src/oauthMessage.js';
test('credential messages require the exact origin, popup, nonce and bounded payload',()=>{
 const popup={},nonce='a'.repeat(64),origin='https://arvin8786.github.io';
 const valid={origin,source:popup,data:{type:'bijak-google-credential',nonce,credential:'x'.repeat(100)}};
 assert.equal(acceptGoogleMessage(valid,popup,nonce,origin),true);
 for(const change of [{origin:'https://evil.example'},{source:{}},{data:{...valid.data,nonce:'wrong'}},{data:{...valid.data,credential:'short'}},{data:{...valid.data,credential:'x'.repeat(5001)}},{data:{...valid.data,type:'other'}}]) assert.equal(acceptGoogleMessage({...valid,...change},popup,nonce,origin),false);
});
test('bridge sends the credential only to its fixed Apps Script origin and never stores it',()=>{
 const html=fs.readFileSync('public/oauth-bridge.html','utf8');const script=fs.readFileSync('public/oauth-bridge.js','utf8');
 const sent=[];let options;const message={textContent:''};const context=vm.createContext({location:{hash:'#'+'a'.repeat(64),pathname:'/Bijak_Tutor/oauth-bridge.html'},history:{replaceState(){}},document:{getElementById:()=>message,createElement:()=>({addEventListener(){}}),head:{append(){}}},window:{opener:{postMessage:(...args)=>sent.push(args)}},google:{accounts:{id:{initialize:o=>options=o,renderButton(){}}}}});
 vm.runInContext(script,context);context.initializeGoogle();options.callback({credential:'token'});
 assert.equal(sent[0][1],'https://n-vldjkpsrhfo7nws4qz55tdcwo4iumiztih5n5cq-0lu-script.googleusercontent.com');
 assert.equal(sent[0][0].nonce,'a'.repeat(64));assert.equal(sent[0][0].credential,'token');
 assert.match(html,/Content-Security-Policy/);
 assert.doesNotMatch(html,/onload=|onerror=|<script>/);
 assert.doesNotMatch(script,/localStorage|sessionStorage|document\.cookie/);
});
