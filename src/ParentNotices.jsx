import React,{useEffect,useState} from 'react';
import './parent-notices.css';

const blank={kind:'Announcement',title:'',message:'',starts:'',ends:'',imageAlt:''};
async function readImage(file){
 if(!file)return null;
 if(!['image/png','image/jpeg'].includes(file.type)||file.size>350000)throw Error('Choose a PNG or JPEG up to 350 KB.');
 const encoded=await new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(reader.result);
  reader.onerror=()=>reject(Error('The image could not be read.'));
  reader.readAsDataURL(file);
 });
 return {mimeType:file.type,data:encoded.split(',')[1]};
}

export function NoticePublisher({request}){
 const [form,setForm]=useState(blank),[notices,setNotices]=useState([]),[error,setError]=useState(''),[status,setStatus]=useState('');
 const [busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false);
 async function load(){setNotices(await request('listParentNoticesAdmin'));setLoaded(true)}
 useEffect(()=>{load().catch(failure=>setError(failure.message));},[request]);
 function field(event){const {name,value}=event.target;setForm(previous=>({...previous,[name]:value}));}
 async function submit(event){
  event.preventDefault();
  const target=event.currentTarget;
  const file=target.elements.noticeImage.files[0];
  setBusy(true);setError('');setStatus('');
  try{
   const image=await readImage(file);
   await request('publishParentNotice',{...form,image});
   target.reset();
   setForm(blank);
   setStatus('Saved. Parents will see this notice during its display dates.');
   await load();
  }catch(failure){setError(failure.message)}finally{setBusy(false)}
 }
 async function unpublish(notice){
  setBusy(true);setError('');setStatus('');
  try{await request('unpublishParentNotice',notice.id);setStatus('Notice unpublished.');await load()}
  catch(failure){setError(failure.message)}finally{setBusy(false)}
 }
 return <section className="panel notice-publisher">
  {error&&<p role="alert">{error}</p>}
  {status&&<p role="status">{status}</p>}
  {!loaded&&!error&&<p role="status">Loading parent notices…</p>}
  {loaded&&<><form className="portal-form" onSubmit={submit}>
   <label>Notice type<select name="kind" value={form.kind} onChange={field}><option>Announcement</option><option>Release notes</option></select></label>
   <label>Title<input name="title" required maxLength={120} value={form.title} onChange={field}/></label>
   <label>Message<textarea name="message" rows={4} maxLength={2500} value={form.message} onChange={field}/></label>
   <label>Image (optional, PNG or JPEG up to 350 KB)<input type="file" name="noticeImage" accept="image/png,image/jpeg"/></label>
   <label>Image description<input name="imageAlt" maxLength={200} value={form.imageAlt} onChange={field}/></label>
   <div className="notice-dates">
    <label>First display date<input name="starts" type="date" required value={form.starts} onChange={field}/></label>
    <label>Last display date<input name="ends" type="date" required min={form.starts||undefined} value={form.ends} onChange={field}/></label>
   </div>
   <p>Both dates are included, using Malaysia time (UTC+8).</p>
   <button className="primary" disabled={busy}>Save and publish</button>
  </form>
  <h2>Saved notices</h2>
  {notices.length===0&&<p>No notices yet.</p>}
  <ul>{notices.map(notice=><li key={notice.id}><strong>{notice.title}</strong><p>{notice.kind} · {notice.starts} to {notice.ends}{!notice.published&&' · Unpublished'}</p>{notice.published&&<button type="button" disabled={busy} onClick={()=>unpublish(notice)}>Unpublish</button>}</li>)}</ul>
  </>}
 </section>;
}

function NoticeImage({notice,request}){
 const [source,setSource]=useState(''),[error,setError]=useState(false);
 useEffect(()=>{
  let active=true;
  request('getParentNoticeImage',notice.id).then(({mimeType,data})=>{
   if(active&&['image/png','image/jpeg'].includes(mimeType))setSource('data:'+mimeType+';base64,'+data);
  }).catch(()=>{if(active)setError(true)});
  return()=>{active=false};
 },[notice.id,request]);
 return source?<img src={source} alt={notice.imageAlt}/>:<p role="status">{error?'Image unavailable.':'Loading image…'}</p>;
}

export function ParentNoticePopup({request}){
 const [notices,setNotices]=useState([]),[position,setPosition]=useState(0);
 useEffect(()=>{
  let active=true,sequence=0;
  async function show(){
   if(document.visibilityState==='hidden')return;
   const current=++sequence;
   try{
    const list=await request('getParentNotices');
    if(active&&current===sequence&&Array.isArray(list)){setPosition(0);setNotices(list)}
   }catch{}
  }
  const onRestore=event=>{if(event.persisted)show()};
  show();
  document.addEventListener('visibilitychange',show);
  window.addEventListener('pageshow',onRestore);
  window.addEventListener('online',show);
  return()=>{
   active=false;
   document.removeEventListener('visibilitychange',show);
   window.removeEventListener('pageshow',onRestore);
   window.removeEventListener('online',show);
  };
 },[request]);
 const notice=notices[position];
 if(!notice)return null;
 return <aside className="release-popup parent-notice-popup" aria-label="Parent notices">
  <div className="release-popup-content" role="status">
   <p>{notice.kind}{notices.length>1?' · '+(position+1)+' of '+notices.length:''}</p>
   <h2>{notice.title}</h2>
   {notice.message&&<p className="parent-notice-message">{notice.message}</p>}
   {notice.hasImage&&<NoticeImage key={notice.id} notice={notice} request={request}/>}
  </div>
  <div className="notice-actions">
   {position>0&&<button type="button" onClick={()=>setPosition(position-1)}>Previous</button>}
   {position<notices.length-1&&<button type="button" onClick={()=>setPosition(position+1)}>Next</button>}
   <button type="button" onClick={()=>setNotices([])}>Close</button>
  </div>
 </aside>;
}
