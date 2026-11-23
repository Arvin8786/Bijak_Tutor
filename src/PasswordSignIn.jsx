import React,{useState} from 'react';

export const USERNAME_PATTERN='[a-zA-Z][a-zA-Z0-9._\\-]{2,31}';

export function NewPassword({value,onChange,label='Password'}){
 return <label>{label}<input type="password" value={value} onChange={onChange} minLength={15} maxLength={256} autoComplete="new-password" required aria-description="Use at least 15 characters."/></label>;
}

export function PasswordSignIn({onSubmit,disabled,role}){
 const [visible,setVisible]=useState(false);
 function submit(event){
  event.preventDefault();
  const form=event.currentTarget,data=new FormData(form);
  const identifier=String(data.get('identifier')||'').trim();
  const password=String(data.get('password')||'');
  form.elements.password.value='';
  setVisible(false);
  onSubmit({role,identifier,password});
 }
 return <form className="signin-password" onSubmit={submit}>
  <label>Email, username or user ID<input name="identifier" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="username" maxLength={254} required disabled={disabled}/></label>
  <div className="signin-password-field">
   <label htmlFor="signin-password">Password</label>
   <div className="signin-password-input">
    <input id="signin-password" name="password" type={visible?'text':'password'} autoComplete="current-password" maxLength={256} required disabled={disabled}/>
    <button type="button" onClick={()=>setVisible(state=>!state)} disabled={disabled} aria-label={visible?'Hide password':'Show password'}>{visible?'Hide':'Show'}</button>
   </div>
  </div>
  <button className="primary" type="submit" disabled={disabled}>Sign in with password</button>
  {role==='student'&&<p className="signin-note">Ask your parent for your sign-in details or a new password.</p>}
 </form>;
}
