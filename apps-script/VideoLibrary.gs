/**
 * Admin-curated video library. Only videos an administrator adds in the Videos sheet (or the admin console)
 * are ever shown; the app never asks YouTube for suggestions. Learners read through getVideoLibrary, which
 * checks sign-in, account approval and module access first.
 */
function youtubeId_(input){
 const text=String(input||'').trim().slice(0,300);
 if(/^[A-Za-z0-9_-]{11}$/.test(text))return text;
 const match=text.match(/^https:\/\/(?:www\.|m\.)?(?:youtube\.com|youtube-nocookie\.com)\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})(?:[?&#\/].*)?$/i)||text.match(/^https:\/\/youtu\.be\/([A-Za-z0-9_-]{11})(?:[?&#\/].*)?$/i);
 return match?match[1]:'';
}
function videoView_(row,admin){
 const view={id:String(row.videoId),youtubeId:String(row.youtubeId),title:String(row.title),description:String(row.description||''),subject:String(row.subject||''),year:Number(row.year)||0,sequence:Number(row.sequence)||0};
 if(admin){view.status=String(row.status);view.addedAt=String(row.addedAt||'');view.updatedAt=String(row.updatedAt||'')}
 return view;
}
const byVideoOrder_=(a,b)=>(Number(a.sequence)||0)-(Number(b.sequence)||0)||String(a.title).localeCompare(String(b.title));
function getVideoLibrary(token){
 return withAuth_(token,user=>{
  requireModule_(user,'video-library');
  return rows_('Videos').filter(row=>String(row.status)==='ACTIVE'&&youtubeId_(row.youtubeId)).sort(byVideoOrder_).slice(0,300).map(row=>videoView_(row,false));
 });
}
function listVideosAdmin(token){
 requireAccountAdmin_(token);
 return rows_('Videos').filter(row=>String(row.status)!=='REMOVED').sort(byVideoOrder_).slice(0,500).map(row=>videoView_(row,true));
}
function saveVideo(token,input){
 const admin=requireAccountAdmin_(token);
 const data=input&&typeof input==='object'?input:{};
 const youtubeId=youtubeId_(data.url||data.youtubeId);
 if(!youtubeId)throw Error('Paste a YouTube link or the 11-character video ID.');
 const title=String(data.title||'').trim(),description=String(data.description||'').trim(),subject=String(data.subject||'').trim();
 if(title.length<1||title.length>120)throw Error('Enter a title of 1–120 characters.');
 if(description.length>400)throw Error('Keep the description under 400 characters.');
 if(subject.length>75)throw Error('Keep the subject under 75 characters.');
 const year=data.year===''||data.year===undefined||data.year===null?0:Number(data.year);
 if(!Number.isInteger(year)||year<0||year>6)throw Error('Choose All years or a school year from 1 to 6.');
 const status=data.status==='HIDDEN'?'HIDDEN':'ACTIVE';
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const all=rows_('Videos'),now=new Date().toISOString();
  const existing=data.videoId?all.find(row=>String(row.videoId)===String(data.videoId)&&String(row.status)!=='REMOVED'):null;
  if(data.videoId&&!existing)throw Error('Video not found.');
  const live=all.filter(row=>String(row.status)!=='REMOVED');
  if(!existing&&live.length>=500)throw Error('The video library is full (500). Remove an old video first.');
  if(live.some(row=>String(row.youtubeId)===youtubeId&&(!existing||String(row.videoId)!==String(existing.videoId))))throw Error('That video is already in the library.');
  const given=Number(data.sequence);
  const sequence=Number.isInteger(given)&&given>=0&&given<=9999?given:(live.reduce((max,row)=>Math.max(max,Number(row.sequence)||0),0)+10);
  const videoId=existing?String(existing.videoId):Utilities.getUuid();
  if(existing)update_('Videos','videoId',videoId,{youtubeId,title,description,subject,year,sequence,status,updatedAt:now});
  else append_('Videos',{videoId,youtubeId,title,description,subject,year,sequence,status,addedAt:now,addedBy:accountKey_(admin.sub),updatedAt:now});
  append_('Audit',{timestamp:now,actor:accountKey_(admin.sub),action:existing?'VIDEO_UPDATED':'VIDEO_ADDED',reference:videoId});
  return {id:videoId,status};
 }finally{lock.releaseLock()}
}
/** Removing keeps an audit trail; the row is marked REMOVED and disappears from every list. */
function removeVideo(token,videoId){
 const admin=requireAccountAdmin_(token);
 const id=String(videoId||'');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const row=rows_('Videos').find(item=>String(item.videoId)===id&&String(item.status)!=='REMOVED');
  if(!row)throw Error('Video not found.');
  const now=new Date().toISOString();
  update_('Videos','videoId',id,{status:'REMOVED',updatedAt:now});
  append_('Audit',{timestamp:now,actor:accountKey_(admin.sub),action:'VIDEO_REMOVED',reference:id});
  return {id,status:'REMOVED'};
 }finally{lock.releaseLock()}
}
