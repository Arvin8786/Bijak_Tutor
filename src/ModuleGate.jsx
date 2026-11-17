import React,{useEffect,useState} from 'react';
export default function ModuleGate({moduleId,request,onMembership,children}){
 const [state,setState]=useState(null);
 useEffect(()=>{
  if(!moduleId)return;
  let active=true;
  const check=()=>request('authorizeModule',moduleId).then(result=>{if(active)setState({moduleId,...result,error:''})}).catch(error=>{if(active)setState({moduleId,allowed:false,error:error.message})});
  check();const timer=setInterval(check,60000);
  window.addEventListener('focus',check);
  return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',check)};
 },[moduleId,request]);
 if(!moduleId)return children;
 if(state?.moduleId!==moduleId)return <section className="panel" role="status">Checking module access…</section>;
 if(!state.allowed)return <section className="panel"><h1>Learning access</h1><p role={state.error?'alert':'status'}>{state.error||`Your ${state.plan.replaceAll('_',' ')} plan does not include ${state.title}.`}</p><p>Your administrator controls access to each module.</p><button className="primary" onClick={onMembership}>View membership options</button></section>;
 return children;
}
