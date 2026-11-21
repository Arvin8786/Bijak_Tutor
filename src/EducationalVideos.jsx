import React,{useEffect,useState} from 'react';
export function youtubeId(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return null;
 const host=u.hostname.toLowerCase();let id;
 if(host==='youtu.be')id=u.pathname.slice(1);
 else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(host))id=u.pathname==='/watch'?u.searchParams.get('v'):u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1];
 return /^[A-Za-z0-9_-]{11}$/.test(id||'')?id:null;
 }catch{return null}
}
export default function EducationalVideos({request,canManage=false}){
 const [videos,setVideos]=useState([]),[selected,setSelected]=useState(null),[error,setError]=useState(''),[title,setTitle]=useState(''),[url,setUrl]=useState(''),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false);
 useEffect(()=>{let active=true;if(request)request('getEducationalVideos').then(v=>{if(active){setVideos(v);setLoaded(true)}}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[request]);
 async function save(next){setBusy(true);setError('');try{const result=await request('setEducationalVideos',next);setVideos(result);setSelected(null);setTitle('');setUrl('')}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <section className="panel"><h1>📺 Learning Videos</h1><p>Videos selected by the BijakLearn Team. Choose a video to watch inside BijakLearn.</p>{error&&<p role="alert">{error}</p>}
 {!request?<p>The shared video library requires the authenticated backend. It is not connected to this public preview yet.</p>:!loaded&&!error?<p role="status">Loading videos…</p>:null}
 {selected&&<><h2>{selected.title}</h2><iframe key={selected.videoId} title={selected.title} src={'https://www.youtube-nocookie.com/embed/'+selected.videoId+'?playsinline=1&rel=0'} style={{width:'100%',aspectRatio:'16 / 9',minHeight:200,border:0}} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/><button onClick={()=>setSelected(null)}>Close video</button><p>If playback is unavailable, the owner may have disabled embedding or restricted the video. YouTube controls its player, ads and related content.</p></>}
 <div className="cards">{videos.map(v=><article className="panel" key={v.videoId}><h2>{v.title}</h2><button onClick={()=>setSelected(v)}>Play video</button>{canManage&&<button disabled={busy} onClick={()=>save(videos.filter(item=>item.videoId!==v.videoId))}>Remove video</button>}</article>)}</div>{loaded&&!videos.length&&<p>No videos have been published yet.</p>}
 {canManage&&loaded&&<form className="form" onSubmit={e=>{e.preventDefault();const videoId=youtubeId(url);if(!videoId){setError('Enter a valid HTTPS YouTube video link.');return}save([...videos,{title:title.trim(),videoId}])}}><h2>BijakLearn Team: publish a video</h2><label>Video title<input required maxLength={120} value={title} onChange={e=>setTitle(e.target.value)}/></label><label>YouTube link<input required type="url" value={url} onChange={e=>setUrl(e.target.value)}/></label><p>Review age suitability, captions and embedding permission before publishing. Changes apply to everyone using this backend.</p><button disabled={busy||videos.length>=30}>Publish video</button></form>}</section>;
}
