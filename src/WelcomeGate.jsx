import React,{useEffect,useState} from 'react';
import {LANGUAGES,say,speechLocale} from './localization.js';

export function speakMascot(language,who){
 const msg=say(language,who);
 if(typeof window!=='undefined'&&'speechSynthesis' in window){
   window.speechSynthesis.cancel();
   const utterance=new SpeechSynthesisUtterance(msg);
   utterance.lang=speechLocale[language]||'ms-MY';
   utterance.rate=.9;
   try{window.speechSynthesis.speak(utterance)}catch{}
 }
 return msg;
}
export function MascotFriends({language='ms',compact=false}){
 const [active,setActive]=useState('');
 const [message,setMessage]=useState('');
 useEffect(()=>()=>{try{window.speechSynthesis?.cancel()}catch{}},[]);
 const greet=who=>{setActive(who);setMessage(speakMascot(language,who));};
 return <div className={'mascot-friends '+(compact?'compact':'')} aria-label="Two school friends in Malaysian primary school uniforms">
  <div className={'mascot-picture '+(active?'mascot-reacting':'')}>
    <img src="./icons/icon.svg" alt="Smiling primary school boy and girl in white school uniforms" draggable="false"/>
    <button type="button" className={'mascot-touch mascot-boy '+(active==='boy'?'waving':'')} onClick={()=>greet('boy')} aria-label="Tap the schoolboy to hear him greet you"><span className="visually-hidden">Boy says hello</span></button>
    <button type="button" className={'mascot-touch mascot-girl '+(active==='girl'?'waving':'')} onClick={()=>greet('girl')} aria-label="Tap the schoolgirl to hear her greet you"><span className="visually-hidden">Girl says hello</span></button>
  </div>
  {!compact&&<p className="mascot-hint">{say(language,'touch')}</p>}
  {message&&<div className="mascot-speech" role="status" aria-live="polite">{message} <span aria-hidden="true">💬</span></div>}
 </div>;
}
export default function WelcomeGate({language,onLanguage,onContinue}){
 return <main className="welcome-gate">
  <section className="welcome-main">
   <div className="welcome-brand"><span className="welcome-star">🌟</span><strong>BijakLearn <em>Junior</em></strong></div>
   <h1>{say(language,'welcome')}</h1>
   <p className="welcome-sub">{say(language,'choose')}</p>
   <MascotFriends language={language}/>
   <div className="welcome-choices" role="group" aria-label="Choose display language">
    {LANGUAGES.map(l=><button type="button" key={l.code} lang={l.code==='zh'?'zh-CN':l.code==='ta'?'ta':'en'} onClick={()=>onLanguage(l.code)} aria-pressed={language===l.code} className={'welcome-choice '+(language===l.code?'chosen':'')}><span aria-hidden="true">{l.flag}</span><strong>{l.name}</strong>{language===l.code&&<span className="language-check" aria-hidden="true">✓</span>}</button>)}
   </div>
   <button type="button" className="welcome-continue" onClick={onContinue}>{say(language,'continue')} <span aria-hidden="true">→</span></button>
   <p className="welcome-small">SK · SJKC · SJKT · Prasekolah · Tahun 1–6</p><p className="welcome-small">A ProEase Studio™ learning experience · © 2026 ProEase Studio</p>
  </section>
 </main>;
}
