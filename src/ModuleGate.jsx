import React,{useEffect,useState} from 'react';
export default function ModuleGate({moduleId,request,onMembership,children}){
 const [state,setState]=useState(null);
 useEffect(()=>{
  if(!moduleId)return;
  let active=true,latest=0;
  const check=async()=>{
   const id=++latest;
   try{
    const result=await request('authorizeModule',moduleId);
    if(active&&id===latest)setState({...result,moduleId,allowed:result?.allowed===true,error:''});
   }catch(error){
    if(active&&id===latest)setState({moduleId,allowed:false,error:error.message});
   }
  };
  const checkVisible=()=>{if(document.visibilityState==='visible')check()};
  check();
  const timer=window.setInterval(checkVisible,60000);
  window.addEventListener('focus',checkVisible);
  return()=>{active=false;window.clearInterval(timer);window.removeEventListener('focus',checkVisible)};
 },[moduleId,request]);
 if(!moduleId)return children;
 if(state?.moduleId!==moduleId)return <section className="panel" role="status">Checking module access…</section>;
 if(!state.allowed){
  const title=state.title||'This module';
  const plan=typeof state.plan==='string'?state.plan:'';
  const membership=state.reason==='membership'||(!state.reason&&plan);
  const explanation=state.reason==='section'?`${title} is unavailable in your learning section.`:
   state.reason==='learner'?`${title} is restricted for this learner profile.`:
    membership&&plan?`Your ${plan.replaceAll('_',' ')} plan does not include ${title}.`:`${title} is currently unavailable.`;
  return <section className="panel"><h1>Learning access</h1><p role={state.error?'alert':'status'}>{state.error||explanation}</p>{membership&&<button className="primary" onClick={onMembership}>View membership options</button>}</section>;
 }
 return children;
}

