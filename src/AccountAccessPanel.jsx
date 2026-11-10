import React, {useEffect, useState} from 'react';

const statusLabels = {PENDING: 'Awaiting approval', ACTIVE: 'Active', REVOKED: 'Blocked'};

export default function AccountAccessPanel({request}) {
 const [accounts, setAccounts] = useState(null);
 const [query, setQuery] = useState('');
 const [selected, setSelected] = useState(null);
 const [reason, setReason] = useState('');
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState('');
 const [notice, setNotice] = useState('');
 const [refresh, setRefresh] = useState(0);

 useEffect(() => {
  let current = true;
  request('listAccountAccess').then(result => {
   if (current) setAccounts(result);
  }).catch(failure => {
   if (current) setError(failure.message);
  });
  return () => { current = false; };
 }, [request, refresh]);

 const visible = (accounts || []).filter(account =>
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
   setAccounts(current => current.map(account => account.id === result.id ? {...account, status: result.status} : account));
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

 return <section className="panel">
  <h1>Manage account access</h1>
  <p>Approve new accounts, block access, or restore a blocked account. Account access is separate from membership.</p>
  <div className="actions">
   <label>Search accounts <input type="search" value={query} onChange={event => setQuery(event.target.value)}/></label>
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
