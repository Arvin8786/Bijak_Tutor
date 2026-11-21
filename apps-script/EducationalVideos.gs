/** Shared video catalogue. Only the configured administrator can mutate it. */
function validateVideo_(value){
 if(!value||typeof value!=='object'||typeof value.title!=='string'||!value.title.trim()||value.title.length>120||!/^[A-Za-z0-9_-]{11}$/.test(value.videoId||''))throw Error('Provide a title and valid YouTube video ID.');
 return {title:value.title.trim(),videoId:value.videoId};
}
function getEducationalVideos(token){return withAuth_(token,()=>JSON.parse(props_().getProperty('EDUCATIONAL_VIDEOS')||'[]').map(validateVideo_));}
function setEducationalVideos(token,entries){
 requireAccountAdmin_(token);
 if(!Array.isArray(entries)||entries.length>30)throw Error('The library supports up to 30 videos.');
 const videos=entries.map(validateVideo_);
 if(new Set(videos.map(v=>v.videoId)).size!==videos.length)throw Error('Remove duplicate videos.');
 const json=JSON.stringify(videos);if(Utilities.newBlob(json).getBytes().length>8000)throw Error('Video library is too large.');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{props_().setProperty('EDUCATIONAL_VIDEOS',json);return videos}finally{lock.releaseLock()}
}
