import React,{useEffect,useState} from 'react';
export default function StudentAccessPanel({request}){
 const [profiles,setProfiles]=useState([]),[links,setLinks]=useState([]),[email,setEmail]=useState(''),[childId,setChildId]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[removal,setRemoval]=useState(null),[reason,setReason]=useState('');
 useEffect(()=>{let current=true;Promise.all([request('listStudentProfiles'),request('listStudentAccounts')]).then(([children,accounts])=>{if(current){setProfiles(children);setLinks(accounts)}}).catch(e=>{if(current)setError(e.message)});return()=>{current=false}},[request]);
 async function save(address,id,status){
  setBusy(true);setError('');setNotice('');
  try{const result=await request('setStudentAccount',address,id,status);setLinks(current=>[...current.filter(row=>row.id!==result.id),result]);setNotice(status==='ACTIVE'?'Student sign-in enabled':'Student sign-in disabled');setEmail('')}
  catch(e){setError(e.message)}finally{setBusy(false)}
 }
 return <section className="panel"><span className="mini-label">Administration</span><h1>Student sign-in access</h1><p>With parent or guardian consent, link a separate student Google account to an existing learner profile. The student inherits the family’s learning tier and cannot access parent reports, applications or administration.</p>
 <form className="kasih-form" onSubmit={event=>{event.preventDefault();save(email,childId,'ACTIVE')}}>
  <label>Student Google email<input type="email" required maxLength={254} value={email} disabled={busy} onChange={e=>setEmail(e.target.value)}/></label>
  <label>Learner profile<select aria-label="Learner profile" required value={childId} disabled={busy} onChange={e=>setChildId(e.target.value)}><option value="">Choose a learner</option>{profiles.map(profile=><option key={profile.id} value={profile.id}>{profile.name} · {profile.parentEmail}</option>)}</select></label>
  <button className="primary" disabled={busy||!childId}>Enable student sign-in</button>
 </form>
 {error&&<p className="error" role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 {removal&&<form className="panel portal-form" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await request('removeChildLink',removal.childId,reason);setLinks(current=>current.map(l=>l.childId===removal.childId?{...l,status:'REVOKED'}:l));setRemoval(null);setReason('');setNotice('Child link removed by administrator')}catch(e){setError(e.message)}finally{setBusy(false)}}}><h2>Remove child link</h2><p>{removal.email}. This revokes sign-in and removes the profile from active family reports. Records remain for audit. Only an administrator can restore it.</p><label>Removal reason<textarea required maxLength={250} value={reason} onChange={e=>setReason(e.target.value)}/></label><button disabled={busy}>Confirm removal</button><button type="button" onClick={()=>setRemoval(null)}>Cancel removal</button></form>}
 {links.length===0?<p>No student accounts linked yet.</p>:<ul className="cards">{links.map(link=><li className="panel" key={link.id}><strong>{link.email}</strong><p>{profiles.find(profile=>profile.id===link.childId)?.name||'Learner profile'} · {link.status}</p><button disabled={busy} onClick={()=>save(link.email,link.childId,link.status==='ACTIVE'?'REVOKED':'ACTIVE')}>{link.status==='ACTIVE'?'Disable student sign-in':'Restore student sign-in'}</button><button disabled={busy} onClick={()=>{setRemoval(link);setReason('')}}>Remove child link</button></li>)}</ul>}
 </section>;
}

