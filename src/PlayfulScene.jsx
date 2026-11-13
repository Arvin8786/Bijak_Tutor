import React,{useEffect,useState} from 'react';

export default function PlayfulScene(){
 const [paused,setPaused]=useState(()=>{try{return localStorage.getItem('bijaklearn:calm-mode')==='yes'}catch{return false}});
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{
  const query=window.matchMedia('(prefers-reduced-motion: reduce)');
  const change=()=>setReduced(query.matches);
  query.addEventListener('change',change);return()=>query.removeEventListener('change',change);
 },[]);
 useEffect(()=>{
  document.documentElement.dataset.motion=paused||reduced?'off':'on';
  return()=>{delete document.documentElement.dataset.motion};
 },[paused,reduced]);
 const toggle=()=>setPaused(previous=>{const next=!previous;try{localStorage.setItem('bijaklearn:calm-mode',next?'yes':'no')}catch{}return next});
 return <>
  <div className="playful-scene" aria-hidden="true">
   <span className="scene-cloud cloud-one"/><span className="scene-cloud cloud-two"/><span className="scene-cloud cloud-three"/>
   <span className="scene-orbit orbit-one"/><span className="scene-orbit orbit-two"/>
   <span className="scene-spark spark-one">✦</span><span className="scene-spark spark-two">✧</span>
   <span className="scene-spark spark-three">✦</span><span className="scene-spark spark-four">✧</span>
   <span className="scene-hill hill-one"/><span className="scene-hill hill-two"/>
  </div>
  <div className="scene-tools"><button type="button" aria-label="Background animation" aria-pressed={!paused&&!reduced}
   disabled={reduced} onClick={toggle} title={reduced?'Your device prefers reduced motion':'Pause or play the decorative animations'}>
   <span aria-hidden="true">{paused||reduced?'🌙':'✨'}</span> {reduced?'Calm mode':paused?'Play animations':'Pause animations'}
  </button></div>
 </>;
}
