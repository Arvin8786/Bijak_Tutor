import React, {useEffect, useState} from 'react';

const statusLabels = {PENDING: 'Awaiting approval', ACTIVE: 'Active', REVOKED: 'Blocked'};

export default function AccountAccessPanel({request,revision=0}) {
 const [accounts, setAccounts] = useState(null);
 const [query, setQuery] = useState('');
 const [filter, setFilter] = useState('ALL');
 const [selected, setSelected] = useState(null);
 const [reason, setReason] = useState('');
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState('');
 const [notice, setNotice] = useState('');
 const [refresh, setRefresh] = useState(0);
 const [membershipAccount,setMembershipAccount]=useState('');
 const [membershipPlan,setMembershipPlan]=useState('FREE');
 const [membershipMonths,setMembershipMonths]=useState('12');
 const [membershipReason,setMembershipReason]=useState('');

 async function saveMembership(event){
  event.preventDefault();setSaving(true);setError('');setNotice('');
  try{
   const result=await request('setMembership',membershipAccount,membershipPlan,membershipMonths==='LIFETIME'?'LIFETIME':Number(membershipMonths),membershipReason);
   setNotice('Membership updated: '+result.plan.replaceAll('_',' '));setMembershipReason('');
  }catch(failure){setError(failure.message)}finally{setSaving(false)}
 }

 useEffect(() => {
  let current = true;
  request('listAccountAccess').then(result => {
   if (current) setAccounts(result);
  }).catch(failure => {
   if (current) setError(failure.message);
  });
  return () => { current = false; };
 }, [request, refresh, revision]);

 const visible = (accounts || []).filter(account =>
  (filter === 'ALL' || account.status === filter) &&
  [account.email, account.name, account.id].some(value => value.toLowerCase().includes(query.trim().toLowerCase()))
 );
 const status = selected?.block ? 'REVOKED' : 'ACTIVE';

 async function save(event) {
  event.preventDefault();
  if (saving || !selected || (status === 'REVOKED' && !reason.trim())) return;
  setSaving(true);
  setError('');
  setNotice('');
  try {
   const result = await request('setAccountAccess', selected.id, status, reason);
   setAccounts(await request('listAccountAccess'));
   setNotice(statusLabels[result.status] + ': ' + (selected.email || selected.id));
   setSelected(null);
   setReason('');
  } catch (failure) {
   setError(failure.message);
  } finally {
   setSaving(false);
  }
 }

 function select(account, block = false) {
  setSelected({...account, block});
  setReason('');
  setNotice('');
  setError('');
 }

 return <section className="panel account-console">
  <span className="mini-label">Administration</span>
  <h1>Manage account access</h1>
  <p>Approve new accounts, block access, or restore a blocked account. Account access is separate from membership.</p>
  {accounts?.length>0&&<details><summary>Assign Free or Premium membership</summary><form className="kasih-form panel" onSubmit={saveMembership}>
   <label>Account<select aria-label="Membership account" required value={membershipAccount} disabled={saving} onChange={event=>setMembershipAccount(event.target.value)}><option value="">Choose an account</option>{accounts.map(account=><option key={account.id} value={account.id}>{account.email||account.id}</option>)}</select></label>
   <label>Membership plan<select aria-label="Membership plan" value={membershipPlan} disabled={saving} onChange={event=>setMembershipPlan(event.target.value)}><option value="FREE">Free (limited)</option><option value="PREMIUM">Premium</option></select></label>
   {membershipPlan==='PREMIUM'&&<label>Membership duration<select value={membershipMonths} disabled={saving} onChange={event=>setMembershipMonths(event.target.value)}><option value="LIFETIME">Lifetime</option>{[1,3,6,12].map(n=><option key={n} value={n}>{n} months</option>)}</select></label>}
   <label>Membership reason<textarea required maxLength={250} value={membershipReason} disabled={saving} onChange={event=>setMembershipReason(event.target.value)}/></label>
   <p>Verify payment independently before assigning Premium. Premium Kasih requires a reviewed application below. Changing membership does not approve or unblock an account.</p>
   <button className="primary" disabled={saving||!membershipAccount}>Save membership</button>
  </form></details>}
  {accounts && <div className="statgrid" aria-label="Account summary">
   {Object.entries(statusLabels).map(([value,label]) => <div className="stat" key={value}><strong>{accounts.filter(account => account.status === value).length}</strong><span>{label}</span></div>)}
  </div>}
  <div className="actions">
   <label>Search accounts <input type="search" value={query} onChange={event => setQuery(event.target.value)}/></label>
   <label>Access status <select aria-label="Access status" value={filter} onChange={event => setFilter(event.target.value)}><option value="ALL">All accounts</option>{Object.entries(statusLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
   <button type="button" disabled={saving || !!selected} onClick={() => {
    setError('');
    setAccounts(null);
    setRefresh(value => value + 1);
   }}>Refresh accounts</button>
  </div>
  {error && <p role="alert" className="error">{error}</p>}
  {notice && <p role="status">{notice}</p>}
  {selected && <form className="panel form" onSubmit={save}>
   <h2>{status === 'REVOKED' ? 'Confirm account block' : 'Confirm account activation'}</h2>
   <p>{selected.email || selected.id}</p>
   <label>{status === 'REVOKED' ? 'Reason for blocking' : 'Reason (optional)'}
    <textarea rows={2} required={status === 'REVOKED'} maxLength={250} value={reason}
     disabled={saving} onChange={event => setReason(event.target.value)}/>
   </label>
   <div className="actions">
    <button className="primary" type="submit" disabled={saving || (status === 'REVOKED' && !reason.trim())}>
     {status === 'REVOKED' ? 'Block access' : 'Grant access'}
    </button>
    <button type="button" disabled={saving} onClick={() => { setSelected(null); setError(''); }}>Cancel</button>
   </div>
  </form>}
  {accounts === null && !error && <p role="status">Loading accounts…</p>}
  {accounts !== null && !visible.length && <p>No matching accounts.</p>}
  {visible.length > 0 && <ul className="cards">
   {visible.map(account => <li className="panel" key={account.id}>
    <strong>{account.name || account.email || account.id}</strong>
    <p style={{overflowWrap: 'anywhere'}}>{account.email}</p>
    <ParentDetails account={account} request={request} onSaved={()=>setRefresh(n=>n+1)}/>
    <p>{statusLabels[account.status] || 'Access unavailable'}</p>
    <div className="actions">
     {account.status !== 'ACTIVE' && <button type="button" disabled={!!selected} onClick={() => select(account)}>
      {account.status === 'REVOKED' ? 'Restore access' : 'Approve'}
     </button>}
     {account.status !== 'REVOKED' && <button type="button" disabled={!!selected} onClick={() => select(account, true)}>Block</button>}
    </div>
   </li>)}
  </ul>}
 </section>;
}


function ParentDetails({account,request,onSaved}){const [editing,setEditing]=useState(false),[name,setName]=useState(account.name),[email,setEmail]=useState(account.email),[error,setError]=useState(''),[busy,setBusy]=useState(false);return <>{!editing?<button type="button" onClick={()=>{setName(account.name);setEmail(account.email);setEditing(true)}}>Edit parent details</button>:<form className="portal-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{await request('updateParentDetails',account.id,{name,email});setEditing(false);onSaved()}catch(e){setError(e.message)}finally{setBusy(false)}}}><label>Parent display name<input required maxLength={80} value={name} onChange={e=>setName(e.target.value)}/></label><label>Parent contact email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><p>Google sign-in remains tied to the verified Google account. This changes contact details, not Google credentials.</p>{error&&<p role="alert">{error}</p>}<button disabled={busy}>Save parent details</button><button type="button" disabled={busy} onClick={()=>setEditing(false)}>Cancel editing parent</button></form>}</>}
