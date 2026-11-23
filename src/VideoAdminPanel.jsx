import React,{useEffect,useState} from 'react';
import EducationalVideos from './EducationalVideos.jsx';

const blank={url:'',title:'',description:'',subject:'',year:'0',sequence:'',status:'ACTIVE'};

/** Administrator tool: add, reorder, hide and remove the videos learners can watch. English only. */
export default function VideoAdminPanel({request}){
 const [videos,setVideos]=useState(null),[form,setForm]=useState(blank),[editing,setEditing]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[refresh,setRefresh]=useState(0);
 useEffect(()=>{let live=true;request('listVideosAdmin').then(list=>{if(live)setVideos(list)}).catch(failure=>{if(live){setVideos([]);setError(failure.message)}});return()=>{live=false}},[request,refresh]);
 const field=name=>event=>setForm(old=>({...old,[name]:event.target.value}));
 async function save(event){
  event.preventDefault();setBusy(true);setError('');setNotice('');
  try{
   await request('saveVideo',{...form,videoId:editing||undefined,year:Number(form.year),sequence:form.sequence===''?undefined:Number(form.sequence)});
   setNotice(editing?'Video updated.':'Video added. Learners can watch it now.');setForm(blank);setEditing('');setRefresh(n=>n+1);
  }catch(failure){setError(failure.message)}finally{setBusy(false)}
 }
 async function remove(video){
  if(!window.confirm('Remove "'+video.title+'" from the library?'))return;
  setBusy(true);setError('');setNotice('');
  try{await request('removeVideo',video.id);setNotice('Video removed.');setRefresh(n=>n+1)}catch(failure){setError(failure.message)}finally{setBusy(false)}
 }
 async function toggle(video){
  setBusy(true);setError('');setNotice('');
  try{await request('saveVideo',{videoId:video.id,url:video.youtubeId,title:video.title,description:video.description,subject:video.subject,year:video.year,sequence:video.sequence,status:video.status==='ACTIVE'?'HIDDEN':'ACTIVE'});setRefresh(n=>n+1)}catch(failure){setError(failure.message)}finally{setBusy(false)}
 }
 const edit=video=>{setEditing(video.id);setForm({url:video.youtubeId,title:video.title,description:video.description,subject:video.subject,year:String(video.year),sequence:String(video.sequence),status:video.status});window.scrollTo?.({top:0,behavior:'smooth'})};
 if(/Unsupported account request/i.test(error))return <EducationalVideos request={request} canManage/>;
 return <section className="video-admin">
  <p>Learners only see the videos listed here, and only while they are Active. Paste any YouTube link (watch, youtu.be, shorts) or the 11-character ID.</p>
  <form className="video-form" onSubmit={save}>
   <label>YouTube link or ID<input required value={form.url} onChange={field('url')} placeholder="https://www.youtube.com/watch?v=…" autoComplete="off"/></label>
   <label>Title<input required maxLength={120} value={form.title} onChange={field('title')}/></label>
   <label>Short description (optional)<textarea maxLength={400} rows={2} value={form.description} onChange={field('description')}/></label>
   <div className="video-form-row">
    <label>Category<input list="video-categories" maxLength={75} value={form.subject} onChange={field('subject')} placeholder="e.g. Self development"/></label>
    <datalist id="video-categories">{[...new Set(["Self development","Science","Languages","Mathematics",...(videos||[]).map(v=>v.subject).filter(Boolean)])].map(c=><option key={c} value={c}/>)}</datalist>
    <label>Year<select value={form.year} onChange={field('year')}><option value="0">All years</option>{[1,2,3,4,5,6].map(y=><option key={y} value={y}>Year {y}</option>)}</select></label>
    <label>Order<input type="number" min="0" max="9999" value={form.sequence} onChange={field('sequence')} placeholder="auto"/></label>
    <label>Status<select value={form.status} onChange={field('status')}><option value="ACTIVE">Active (visible)</option><option value="HIDDEN">Hidden</option></select></label>
   </div>
   <div className="video-form-actions"><button className="primary" disabled={busy}>{editing?'Save changes':'Add video'}</button>{editing&&<button type="button" onClick={()=>{setEditing('');setForm(blank)}}>Cancel edit</button>}</div>
  </form>
  {error&&<p role="alert" className="video-error">{error}</p>}{notice&&<p role="status" className="video-notice">{notice}</p>}
  {videos===null&&<p role="status">Loading…</p>}
  {videos&&!videos.length&&<p>No videos yet. Add your first one above.</p>}
  {videos&&videos.length>0&&<div className="video-table-wrap"><table className="video-table"><thead><tr><th>Order</th><th>Title</th><th>Category</th><th>Year</th><th>Status</th><th>Actions</th></tr></thead><tbody>{videos.map(video=><tr key={video.id}>
   <td>{video.sequence}</td><td><strong>{video.title}</strong><br/><small>{video.youtubeId}</small></td><td>{video.subject||'—'}</td><td>{video.year||'All'}</td><td>{video.status==='ACTIVE'?'Active':'Hidden'}</td>
   <td><button type="button" disabled={busy} onClick={()=>edit(video)}>Edit</button> <button type="button" disabled={busy} onClick={()=>toggle(video)}>{video.status==='ACTIVE'?'Hide':'Show'}</button> <button type="button" disabled={busy} onClick={()=>remove(video)}>Remove</button></td></tr>)}</tbody></table></div>}
 </section>;
}
