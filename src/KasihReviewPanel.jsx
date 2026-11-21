import PrivateDocument from './PrivateDocument.jsx';
import React,{useEffect,useState} from 'react';
export default function KasihReviewPanel({request,revision=0}){
 const [items,setItems]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[selected,setSelected]=useState(null),[note,setNote]=useState(''),[months,setMonths]=useState('12');
 const load=()=>request('listKasihApplications').then(setItems).catch(e=>setError(e.message));
 useEffect(()=>{let active=true;request('listKasihApplications').then(data=>{if(active)setItems(data)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[request,revision]);
 async function review(event){event.preventDefault();setBusy(true);setError('');setNotice('');try{const result=await request('reviewKasihApplication',selected.id,selected.decision,Number(months),note);setSelected(null);setNotice('Application '+result.status.toLowerCase());await load()}catch(e){setError(e.message)}finally{setBusy(false)}}
 const [preview,setPreview]=useState(null);
 function document(requestId,id){setPreview([requestId,id])}
 return <section className="panel"><span className="mini-label">Administration</span><h1>Premium Kasih applications</h1><p>Review circumstances and evidence privately before granting sponsored membership. Approval leaves account blocking controls in force.</p>
 <button disabled={busy} onClick={load}>Refresh applications</button>
 {error&&<p className="error" role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 {selected&&<form className="panel kasih-form" onSubmit={review}><h2>{selected.decision==='APPROVED'?'Approve sponsored membership':'Decline application'}</h2><label>Review note<textarea required maxLength={250} value={note} disabled={busy} onChange={e=>setNote(e.target.value)}/></label>{selected.decision==='APPROVED'&&<label>Duration in months<input type="number" min="1" max="12" required value={months} disabled={busy} onChange={e=>setMonths(e.target.value)}/></label>}<div className="actions"><button className="primary" disabled={busy}>Confirm review</button><button type="button" disabled={busy} onClick={()=>setSelected(null)}>Cancel</button></div></form>}
 {items===null?<p role="status">Loading applications…</p>:!items.length?<p>No applications yet.</p>:items.map(item=><article className="panel" key={item.requestId}><h2>{item.guardianName||'Legacy request'}</h2><p>{item.studentNickname} · Year {item.schoolYear} · {item.status}</p><p className="application-reason">{item.reason}</p><p>Reference: {item.requestId}</p><div className="actions">{item.documents.map(file=><button key={file.id} disabled={busy} onClick={()=>document(item.requestId,file.id)}>{file.label}</button>)}</div>{item.status==='PENDING'&&<div className="actions"><button disabled={busy||!!selected} onClick={()=>{setSelected({id:item.requestId,decision:'APPROVED'});setNote('')}}>Approve Premium Kasih</button><button disabled={busy||!!selected} onClick={()=>{setSelected({id:item.requestId,decision:'DECLINED'});setNote('')}}>Decline</button></div>}</article>)}
 {preview&&<PrivateDocument request={request} method="getKasihDocument" args={preview} onClose={()=>setPreview(null)}/>}
 </section>;
}

