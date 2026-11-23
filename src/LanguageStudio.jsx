import React,{useEffect,useRef,useState} from 'react';
import {languages} from './languageCourses.js';
import {phraseUnits,greetingPronunciation} from './languagePhrases.js';
import './language-studio.css';

const stages=['Identify symbols','Practise writing','Learn basic words','Everyday phrases'];
function WritingPad({model,language}){
 const [paths,setPaths]=useState([]);
 const active=useRef(null);
 function point(event){
  const rect=event.currentTarget.getBoundingClientRect();
  const bound=value=>Math.max(0,Math.min(200,value));
  return [bound((event.clientX-rect.left)*200/rect.width),bound((event.clientY-rect.top)*200/rect.height)];
 }
 function start(event){
  if(active.current!==null||event.button!==0)return;
  active.current=event.pointerId;
  event.currentTarget.setPointerCapture(event.pointerId);
  const initial=point(event);
  setPaths(previous=>[...previous,[initial]]);
 }
 function draw(event){
  if(active.current!==event.pointerId)return;
  const next=point(event);
  setPaths(previous=>[...previous.slice(0,-1),[...previous.at(-1),next]]);
 }
 function stop(event){if(active.current===event.pointerId)active.current=null}
 return <>
  <p>Trace the model with your finger or mouse. You can also copy it on paper or type it below.</p>
  <div className="language-pad" role="img" aria-label={'Tracing model '+model} onPointerDown={start} onPointerMove={draw} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
  <svg viewBox="0 0 200 200" aria-hidden="true">
   <path d="M100 0v200 M0 100h200" stroke="#b7c7d4" strokeDasharray="4 5"/>
   <text x="100" y="143" textAnchor="middle" lang={language.locale} fontSize={model.length>3?72:108} fill="#94a8b4">{model}</text>
   {paths.map((path,index)=>path.length===1?<circle key={index} cx={path[0][0]} cy={path[0][1]} r="3" fill="#173e5d"/>:
    <polyline key={index} points={path.map(pair=>pair.join(',')).join(' ')} fill="none" stroke="#173e5d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>)}
  </svg>
  </div>
  <div className="language-controls"><button type="button" onClick={()=>setPaths([])} disabled={!paths.length}>Clear drawing</button>
   <label>Type a copy <input dir={language.direction} lang={language.locale} autoComplete="off" spellCheck="false"/></label></div>
 </>;
}

function Course({language,index}){
 const [step,setStep]=useState(0),[symbol,setSymbol]=useState(0),[topic,setTopic]=useState(0),[notice,setNotice]=useState('');
 const [practice,setPractice]=useState(null),[feedback,setFeedback]=useState('');
 const audioRequest=useRef(0);
 function stopAudio(){audioRequest.current++;window.speechSynthesis?.cancel()}
 useEffect(()=>()=>stopAudio(),[]);
 function say(text,slow){
  stopAudio();
  const request=audioRequest.current;
  const speech=window.speechSynthesis;
  if(!speech||!window.SpeechSynthesisUtterance){setNotice('Audio is unavailable in this browser. Try a browser or device with read-aloud support.');return}
  const voices=speech.getVoices();
  const family=language.locale.split('-')[0];
  const voice=voices.find(item=>item.lang.replace('_','-').toLowerCase()===language.locale.toLowerCase())||
   voices.find(item=>item.lang.split(/[-_]/)[0].toLowerCase()===family);
  if(!voice){setNotice('Add a '+language.name+' speech voice in your device settings to hear this lesson.');return}
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang=language.locale;
  if(voice)utterance.voice=voice;
  utterance.rate=slow ? 0.62 : 0.9;
  utterance.onend=()=>{if(request===audioRequest.current)setNotice('')};
  utterance.onerror=()=>{if(request===audioRequest.current)setNotice('This device could not play '+language.name+' audio. Check that its speech voice is installed.')};
  setNotice('Playing '+language.name+' audio…');
  speech.speak(utterance);
 }
 function changeStep(next){stopAudio();setNotice('');setPractice(null);setFeedback('');setStep(next)}
 function nextPractice(){
  const items=language.wordList;
  const offset=Math.floor(Math.random()*items.length);
  const choices=[items[offset],items[(offset+3)%items.length],items[(offset+7)%items.length]];
  const shift=Math.floor(Math.random()*choices.length);
  setPractice({answer:choices[0],choices:[...choices.slice(shift),...choices.slice(0,shift)]});setFeedback('');
 }
 const native=text=><span lang={language.locale} dir={language.direction}>{text}</span>;
 const listen=(text,label)=> <div className="language-controls"><button type="button" aria-label={'Hear '+label} onClick={()=>say(text,false)}>Hear sound</button><button type="button" aria-label={'Hear '+label+' slowly'} onClick={()=>say(text,true)}>Slow audio</button></div>;
 const [character,reading,sample]=language.symbols[symbol];
 const unit=phraseUnits[topic];
 return <section className="language-course" aria-label={language.name+' course'}>
 <p>{language.overview}</p>
 <nav className="language-controls" aria-label="Language learning steps">{stages.map((name,i)=><button key={name} aria-current={step===i?'step':undefined} onClick={()=>changeStep(i)}>{i+1}. {name}</button>)}</nav>
 <p role="status" className="language-status">{notice}</p>
 {step===0&&<section><h2>{language.script}</h2><p>Choose a symbol, read its sound guide and listen.</p>
  <div className="language-symbols">{language.symbols.map(([item,hint],i)=><button key={item} aria-pressed={symbol===i} onClick={()=>{stopAudio();setNotice('');setSymbol(i)}}>{native(item)}<small>{hint}</small></button>)}</div>
  <div className="language-model"><strong>{native(character)}</strong><span>{reading}</span>{sample&&sample!==character&&<small>Audio example {native(sample)}</small>}{listen(sample||character,'the selected symbol')}</div>
 </section>}
 {step===1&&<section><h2>Practise writing</h2><p>{language.writing}</p><label>Writing model <select value={symbol} onChange={e=>setSymbol(Number(e.target.value))}>{language.symbols.map(([item,hint],i)=><option value={i} key={item}>{item} · {hint}</option>)}</select></label>
  <WritingPad key={character} model={character} language={language}/>{listen(sample||character,'the writing model')}
 </section>}
 {step===2&&<section><h2>12 basic words</h2><p>Listen, say the word aloud, then try recognising it without its translation.</p>
  <div className="language-cards">{language.wordList.map(([text,guide,meaning])=><article key={meaning}><h3>{native(text)}</h3><p>{guide} · {meaning}</p>{listen(text,meaning)}</article>)}</div>
  <h3>Meaning match</h3><button type="button" onClick={nextPractice}>{practice?'New word':'Start practice'}</button>
  {practice&&<><p>What does <strong>{native(practice.answer[0])}</strong> mean?</p><div className="language-controls">{practice.choices.map(word=><button key={word[2]} onClick={()=>setFeedback(word===practice.answer?'Correct!':'Try another meaning.')}>{word[2]}</button>)}</div><p role="status">{feedback}</p></>}
 </section>}
 {step===3&&<section><h2>100 everyday phrases</h2><p>Listen once, play it slowly, then say it aloud. Practise a short conversation using two phrases from the same topic.</p>
  <label>Conversation topic <select value={topic} onChange={e=>{stopAudio();setNotice('');setTopic(Number(e.target.value))}}>{phraseUnits.map(({title},i)=><option key={title} value={i}>{title}</option>)}</select></label>
  <ol className="language-cards" start={topic*10+1}>{unit.rows.map((row,i)=><li key={row[0]}><h3>{native(row[index+1])}</h3><p>{row[0]}</p>{topic===0&&<p>{greetingPronunciation[i][index]}</p>}{listen(row[index+1],row[0])}</li>)}</ol>
 </section>}
 <div className="language-controls">{step>0&&<button onClick={()=>changeStep(step-1)}>Previous step</button>}{step<3&&<button className="primary" onClick={()=>changeStep(step+1)}>Next · {stages[step+1]}</button>}</div>
 </section>;
}
export default function LanguageStudio({openSkill}){
 const [index,setIndex]=useState(0);
 return <section className="language-studio"><div className="language-heading"><h1>Learn a Language and Skill</h1><p>Start with sounds and writing, then build up to everyday conversations.</p></div>
 <div className="language-controls" aria-label="Choose a language">{languages.map((language,i)=><button key={language.locale} aria-pressed={index===i} onClick={()=>setIndex(i)}>{language.name} <span lang={language.locale}>{language.native}</span></button>)}</div>
 <Course key={index} language={languages[index]} index={index}/>
 <section className="language-skill"><h2>Try a creative skill</h2><p>Explore drawing and other hands-on projects in Creative Projects.</p><button type="button" onClick={openSkill}>Open Creative Projects</button></section>
 </section>;
}
