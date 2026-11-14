import React,{useEffect,useState} from 'react';
import {say} from './localization.js';

export default function PlayfulScene(){
 const [paused,setPaused]=useState(()=>{try{return localStorage.getItem('bijaklearn:calm-mode')==='yes'}catch{return false}});
 // Follows the page language, which the app sets on <html lang>.
 const [lang,setLang]=useState(()=>document.documentElement.lang||'ms');
 useEffect(()=>{
  const watch=new MutationObserver(()=>setLang(document.documentElement.lang||'ms'));
  watch.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  return()=>watch.disconnect();
 },[]);
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
  <div className="scene-tools"><button type="button" aria-label={say(lang,'calmMode')} aria-pressed={!paused&&!reduced}
   disabled={reduced} onClick={toggle} title={say(lang,'calmMode')}>
   <span aria-hidden="true">{paused||reduced?'🌙':'✨'}</span> {reduced?say(lang,'calmMode'):paused?say(lang,'calmOff'):say(lang,'calmOn')}
  </button></div>
 </>;
}
