import React,{useEffect,useRef,useState} from 'react';
import {say} from './localization.js';
import {embedUrl,listeningMessage,playerState,STATE_ENDED} from './videoPlayer.js';

/** Plays one admin-approved video. When it ends the player is removed, so no end-screen suggestions can appear. */
function Player({video,language,onBack}){
 const frame=useRef(null);
 const [ended,setEnded]=useState(false),[round,setRound]=useState(0);
 useEffect(()=>{
  setEnded(false);
  const listen=event=>{if(playerState(event,frame.current?.contentWindow)===STATE_ENDED)setEnded(true)};
  window.addEventListener('message',listen);
  return()=>window.removeEventListener('message',listen);
 },[video.id,round]);
 const tell=()=>{try{frame.current?.contentWindow?.postMessage(listeningMessage(),'https://www.youtube-nocookie.com')}catch{}};
 return <section className="video-player-card" aria-label={video.title}>
  <button type="button" className="video-back" onClick={onBack}>{say(language,'videoBack')}</button>
  <h2>{video.title}</h2>
  <div className="video-frame">
   {ended
    ?<div className="video-ended" role="status"><span aria-hidden="true">🌟</span><p>{say(language,'videoEnded')}</p><div><button type="button" className="primary" onClick={()=>{setEnded(false);setRound(n=>n+1)}}>{say(language,'videoAgain')}</button><button type="button" onClick={onBack}>{say(language,'videoBack')}</button></div></div>
    :<iframe key={video.id+':'+round} ref={frame} title={video.title} src={embedUrl(video.youtubeId,window.location.origin)} onLoad={tell}
      allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" loading="lazy"/>}
  </div>
  {video.description&&<p className="video-description">{video.description}</p>}
 </section>;
}

export default function VideoLibrary({request,language='en',years}){
 const [videos,setVideos]=useState(null),[error,setError]=useState(''),[current,setCurrent]=useState(null),[subject,setSubject]=useState('');
 useEffect(()=>{
  let live=true;
  if(!request){setVideos([]);setError('signin');return}
  request('getVideoLibrary').catch(async failure=>{
   if(!/Unsupported account request/i.test(failure.message))throw failure;
   const legacy=await request('getEducationalVideos');
   return legacy.map(video=>({id:video.videoId,youtubeId:video.videoId,title:video.title}));
  }).then(list=>{if(live)setVideos(Array.isArray(list)?list:[])}).catch(failure=>{if(live){setVideos([]);setError(failure?.message||'error')}});
  return()=>{live=false};
 },[request]);
 const catalogue=(videos||[]).filter(video=>!video.year||!years||years.includes(Number(video.year)));
 const subjects=[...new Set(catalogue.map(v=>v.subject).filter(Boolean))];
 const shown=catalogue.filter(v=>!subject||v.subject===subject);
 const playing=catalogue.find(v=>v.id===current);
 return <section className="video-page" aria-label={say(language,'videosTitle')}>
  <div className="video-hero"><span className="mini-label">🎬 {say(language,'videos').toUpperCase()}</span><h1>{say(language,'videosTitle')}</h1><p>{say(language,'videosIntro')}</p></div>
  {playing?<Player video={playing} language={language} onBack={()=>setCurrent(null)}/>:<>
   {videos===null&&<p role="status">{say(language,'videoLoading')}</p>}
   {videos&&subjects.length>1&&<div className="video-filters" role="group" aria-label={say(language,'videosTitle')}><button type="button" className={!subject?'active':''} aria-pressed={!subject} onClick={()=>setSubject('')}>{say(language,'videoAll')}</button>{subjects.map(name=><button type="button" key={name} className={subject===name?'active':''} aria-pressed={subject===name} onClick={()=>setSubject(name)}>{name}</button>)}</div>}
   {videos&&!shown.length&&<p className="video-empty" role="status">{error==='signin'?say(language,'videosSignIn'):error||say(language,'videosEmpty')}</p>}
   <div className="video-grid">{shown.map(video=><button type="button" className="video-card" key={video.id} onClick={()=>setCurrent(video.id)}>
    <span className="video-thumb" aria-hidden="true">▶</span>
    <strong>{video.title}</strong>
    <span className="video-meta">{video.subject&&<em>{video.subject}</em>}<em>{video.year?say(language,'videoYear')+' '+video.year:say(language,'videoAllYears')}</em></span>
    {video.description&&<span className="video-note">{video.description}</span>}
   </button>)}</div>
  </>}
 </section>;
}
