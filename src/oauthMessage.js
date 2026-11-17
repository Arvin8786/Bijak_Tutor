export function acceptGoogleMessage(event,popup,nonce,origin){
 return event.origin===origin&&event.source===popup&&event.data?.type==='bijak-google-credential'&&event.data?.nonce===nonce&&typeof event.data.credential==='string'&&event.data.credential.length>=50&&event.data.credential.length<=5000;
}
