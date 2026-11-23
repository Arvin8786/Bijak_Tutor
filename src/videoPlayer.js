/** Helpers for the in-app video player. Pure functions so they can be tested without a browser. */
export const YOUTUBE_ORIGIN='https://www.youtube-nocookie.com';
export const STATE_ENDED=0;
export const isYouTubeId=value=>/^[A-Za-z0-9_-]{11}$/.test(String(value||''));
/** Privacy-enhanced embed. rel=0 limits any related videos to the same channel; the app also hides the player when the video ends. */
export function embedUrl(id,origin=''){
 if(!isYouTubeId(id))return '';
 const params=new URLSearchParams({rel:'0',modestbranding:'1',playsinline:'1',iv_load_policy:'3',enablejsapi:'1',cc_lang_pref:'en'});
 if(/^https?:\/\//.test(origin))params.set('origin',origin);
 return `${YOUTUBE_ORIGIN}/embed/${id}?${params}`;
}
/** Reads a message from the player. Returns the numeric state (0 = ended) or null for anything else. */
export function playerState(event,frameWindow){
 if(!event||event.origin!==YOUTUBE_ORIGIN||(frameWindow&&event.source!==frameWindow))return null;
 let data=event.data;
 if(typeof data==='string'){try{data=JSON.parse(data)}catch{return null}}
 if(!data||typeof data!=='object')return null;
 if(data.event==='onStateChange'&&Number.isInteger(data.info))return data.info;
 if(data.event==='infoDelivery'&&data.info&&Number.isInteger(data.info.playerState))return data.info.playerState;
 return null;
}
/** Message that asks the player to start sending state changes. */
export const listeningMessage=()=>JSON.stringify({event:'listening',id:1,channel:'widget'});
