import React,{useState} from 'react';
import {NewPassword,USERNAME_PATTERN} from './PasswordSignIn.jsx';

export function ChildPasswordFields({form,change}){
 return <>
  <label>Student username<input required maxLength={32} pattern={USERNAME_PATTERN} autoComplete="off" autoCapitalize="none" value={form.username} onChange={e=>change('username',e.target.value)}/></label>
  <NewPassword value={form.password} onChange={e=>change('password',e.target.value)}/>
  <label>Phone number (optional)<input type="tel" maxLength={26} autoComplete="off" value={form.phoneNumber} onChange={e=>change('phoneNumber',e.target.value)}/></label>
  <p className="portal-subtitle">Use at least 15 characters for the password.</p>
 </>;
}

export function FamilyPasswordSettings({child,record,mutate,busy,passwordAccess,email}){
 const [username,setUsername]=useState(record?.username||'');
 const [phoneNumber,setPhoneNumber]=useState(record?.phoneNumber||'');
 const [password,setPassword]=useState('');
 const [consent,setConsent]=useState(false);
 const [saved,setSaved]=useState(null);
 const account=saved||record;
 const needsConsent=child&&!account?.username;
 async function submit(event){
  event.preventDefault();
  if(!child&&passwordAccess)return;
  try{
   const value=await (child?mutate('saveChildPassword',child.id,{username,password,consent}):mutate('saveParentPassword',{username,phoneNumber,password}));
   setSaved(value);
   setPassword('');
  }catch{}
 }
 return <section className="panel">
  <h2>{child?'Student password sign-in':'Parent password sign-in'}</h2>
  {child&&<p>{child.name}</p>}
  {account?.userId&&<dl><dt>Username</dt><dd>{account.username}</dd><dt>User ID</dt><dd style={{overflowWrap:'anywhere'}}>{account.userId}</dd>{account.email&&<><dt>Sign-in email</dt><dd>{account.email}</dd></>}</dl>}
  {!child&&passwordAccess?<p>Sign in with Google to change your parent password or sign-in details.</p>:
   <form className="portal-form" onSubmit={submit}>
    {!child&&<label>Verified Google email<input type="email" readOnly value={email||''}/></label>}
    {(!child||needsConsent)&&<label>Username<input required maxLength={32} pattern={USERNAME_PATTERN} autoComplete="off" autoCapitalize="none" value={username} onChange={e=>setUsername(e.target.value)}/></label>}
    {!child&&<label>Phone number<input type="tel" required maxLength={26} autoComplete="tel" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)}/></label>}
    <NewPassword label={account?.username?'New password':'Password'} value={password} onChange={e=>setPassword(e.target.value)}/>
    <p className="portal-subtitle">Use at least 15 characters. Changing the password ends active password sessions.</p>
    {needsConsent&&<label className="portal-check"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/>I am the parent or guardian and consent to setting up password sign-in for this learner.</label>}
    <button className="primary" disabled={busy}>{child&&account?.username?'Reset child password':'Save password sign-in'}</button>
   </form>}
 </section>;
}
