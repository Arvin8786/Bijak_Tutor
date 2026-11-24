import React,{useEffect,useRef,useState} from 'react';
import Brand from './Brand.jsx';
import './membership-desk.css';

const label=plan=>({FREE:'Free',PREMIUM:'Premium',PREMIUM_KASIH:'Premium Kasih'}[plan]||'Membership unavailable');
export function FreeAccessForm({identity,onSubmit,onBack}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(event){
  event.preventDefault();
  const form=new FormData(event.currentTarget);
  setBusy(true);setError('');
  try{await onSubmit({name:form.get('name'),phone:form.get('phone'),children:Number(form.get('children'))})}catch(e){setError(e.message)}finally{setBusy(false)}
 }
 const complete=identity.submitted||identity.status==='ACTIVE';
 return <main className="access-landing"><Brand/><section className="access-card"><h1>{identity.status==='ACTIVE'?'Your account is ready':complete?'Free access requested':'Request Free access'}</h1>
 {complete?<p>{identity.status==='ACTIVE'?'Sign in as a parent to open your family console.':'The BijakLearn Team will review your request. Once approved, sign in with '+identity.email+'.'}</p>:
 <form className="portal-form" onSubmit={submit}><p>Tell us about your family so the BijakLearn Team can review your request.</p>
 <label>Parent or guardian name<input name="name" autoComplete="name" defaultValue={identity.name} required maxLength={80}/></label>
 <label>Verified Google email<input type="email" value={identity.email} readOnly/></label>
 <label>Phone number<input type="tel" name="phone" autoComplete="tel" required maxLength={24}/></label>
 <label>Number of children<input type="number" name="children" inputMode="numeric" min="1" max="99" step="1" required/></label>
 {error&&<p role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy?'Submitting…':'Submit access request'}</button></form>}
 <button type="button" disabled={busy} onClick={onBack}>Back to sign-in</button></section></main>;
}
function FamilyDetails({family}){
 return <div className="family-members"><p>Family membership <strong>{label(family.plan)}</strong></p>{family.lifetime?<p>Lifetime membership</p>:family.expiresAt&&<p>Subscription end date · {new Date(family.expiresAt).toLocaleDateString('en-MY',{timeZone:'Asia/Kuala_Lumpur'})}</p>}
 {family.children.length?<ul>{family.children.map(c=><li key={c.id}><span>{c.name}</span><strong>{label(c.plan)}</strong></li>)}</ul>:<p>No linked children yet.</p>}</div>;
}

export function AdminMembershipDetails({account,request,revision}){
 const [open,setOpen]=useState(false),[family,setFamily]=useState(null),[error,setError]=useState('');
 useEffect(()=>{if(!open)return;let current=true;setError('');
  request('membershipDesk','account',account.id).then(value=>{if(current)setFamily(value)}).catch(e=>{if(current)setError(e.message)});
  return()=>{current=false};
 },[open,request,account.id,revision]);
 return <details className="family-membership" onToggle={e=>setOpen(e.currentTarget.open)}><summary>Membership, linked accounts &amp; application</summary>
 {error?<p role="alert">{error}</p>:!family?<p>Loading account details…</p>:<><FamilyDetails family={family}/>{family.application&&<dl><dt>Applicant</dt><dd>{family.application.name}</dd><dt>Verified email</dt><dd>{family.application.email}</dd><dt>Phone</dt><dd>{family.application.phone}</dd><dt>Children declared</dt><dd>{family.application.children}</dd></dl>}</>}</details>;
}

const malaysiaDay=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function ParentMembership({request,onNavigate,expiryOpen}){
 const [family,setFamily]=useState(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const [message,setMessage]=useState(null),dialog=useRef(null),shown=useRef('');
 useEffect(()=>{
  let current=true,day='',sequence=0;
  function load(){
   if(document.visibilityState==='hidden'||day===malaysiaDay())return;
   day=malaysiaDay();const id=++sequence;
   request('membershipDesk','family',null).then(value=>{
    if(!current||id!==sequence)return;
    setFamily(value);setError('');
    setMessage(value.message?.key!==shown.current?value.message:null);
   }).catch(e=>{if(current&&id===sequence){day='';setError(e.message)}});
  }
  load();const timer=setInterval(load,60000);document.addEventListener('visibilitychange',load);
  return()=>{current=false;clearInterval(timer);document.removeEventListener('visibilitychange',load)};
 },[request,retry]);
 useEffect(()=>{
  if(!message||expiryOpen||!dialog.current)return;
  dialog.current.showModal();
  shown.current=message.key;
  request('membershipDesk','seen',message.key).catch(()=>{shown.current=''});
 },[message,expiryOpen,request]);
 function close(page){setMessage(null);if(page)onNavigate(page)}
 return <><details className="family-membership" onToggle={e=>{if(e.currentTarget.open)setRetry(n=>n+1)}}><summary>My membership &amp; linked accounts{family?' · '+label(family.plan):''}</summary>{family&&<FamilyDetails family={family}/>}
 {error?<><p role="alert">{error}</p><button onClick={()=>setRetry(n=>n+1)}>Retry membership details</button></>:!family&&<p>Loading membership…</p>}</details>
 {message&&!expiryOpen&&<dialog ref={dialog} className="membership-dialog" aria-labelledby="membership-heading" onCancel={()=>close()}><h2 id="membership-heading">{message.kind==='welcome'?'Welcome to '+label(family.plan):'More to explore with Premium'}</h2>
 <p>{message.kind==='welcome'?'Your family’s upgraded membership is active. You can now see which children are covered.':'Explore more learning activities with Premium. Families who need financial support can apply for Premium Kasih.'}</p>
 <div className="actions"><button className="primary" onClick={()=>close('membership')}>{message.kind==='welcome'?'View my membership':'Upgrade to Premium'}</button>{message.kind==='offer'&&<button onClick={()=>close('kasih')}>Apply for Premium Kasih</button>}<button onClick={()=>close()}>{message.kind==='welcome'?'Continue':'Maybe later'}</button></div></dialog>}</>;
}
