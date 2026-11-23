import React,{useEffect,useState} from 'react';
import {BONUS_PROJECTS,CREATIVE_PROJECTS,DICTIONARY_LANGUAGES,WORDS_BY_YEAR} from './pictureDictionary.js';

function shuffled(items){
 const choices=[...items];
 for(let i=choices.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [choices[i],choices[j]]=[choices[j],choices[i]];
 }
 return choices;
}

export default function PictureDictionary({initialYear,initialLanguage,initialView='words',onOpenModule,years=WORDS_BY_YEAR.map((_,year)=>year)}){
 const projects=initialView==='projects';
 const [year,setYear]=useState(()=>years.includes(Number(initialYear))?Number(initialYear):years[0]);
 const [language,setLanguage]=useState(()=>Math.max(0,DICTIONARY_LANGUAGES.findIndex(([code])=>code===initialLanguage)));
 const [view,setView]=useState(initialView),[audioStatus,setAudioStatus]=useState('');
 const [round,setRound]=useState(0),[result,setResult]=useState(null),[mode,setMode]=useState('clue');
 const [complete,setComplete]=useState([]),[bonus,setBonus]=useState(false);
 const words=WORDS_BY_YEAR[year],project=(bonus?BONUS_PROJECTS:CREATIVE_PROJECTS)[year];
 const [order,setOrder]=useState(()=>shuffled(words.map((_,index)=>index)));
 const [options,setOptions]=useState(()=>shuffled(words.map((_,index)=>index)));
 const [code,,voice]=DICTIONARY_LANGUAGES[language];
 const answer=words[order[round]];
 const picked=options.filter(index=>index!==order[round]).slice(0,3);
 const choices=[...picked,order[round]].sort((a,b)=>options.indexOf(a)-options.indexOf(b));

 useEffect(()=>()=>window.speechSynthesis?.cancel(),[]);
 function speak(word){
  const text=word[language+1];
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){
   setAudioStatus('Read aloud is unavailable in this browser.');
   return;
  }
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang=voice;
  const voices=window.speechSynthesis.getVoices();
  const matched=voices.find(item=>item.lang.toLowerCase()===voice.toLowerCase())||voices.find(item=>item.lang.toLowerCase().split('-')[0]===code);
  if(voices.length&&!matched){
   setAudioStatus('No '+DICTIONARY_LANGUAGES[language][1]+' voice is installed on this device.');
   return;
  }
  if(matched)utterance.voice=matched;
  utterance.rate=.84;
  utterance.onerror=event=>{
   if(event.error!=='interrupted'&&event.error!=='canceled')setAudioStatus('Read aloud could not play. Check the voice settings on this device.');
  };
  setAudioStatus('');
  window.speechSynthesis.speak(utterance);
 }

 function restart(vocabulary=words){
  setOrder(shuffled(vocabulary.map((_,index)=>index)));
  setOptions(shuffled(vocabulary.map((_,index)=>index)));
  setRound(0);setResult(null);
 }

 function chooseYear(value){
  setYear(value);restart(WORDS_BY_YEAR[value]);setComplete([]);setBonus(false);setAudioStatus('');
  window.speechSynthesis?.cancel();
 }

 return <section className="picture-dictionary">
  <header className="panel dictionary-intro">
   <h1>{projects?'Creative Projects':'Picture Dictionary'}</h1>
   <p>{projects?'Choose a project for your learning level and follow the checklist.':'Tap a picture to hear its word, or find the picture that matches a clue.'}</p>
   <div className="dictionary-filters">
    <label>Learning level<select aria-label="Learning level" value={year} onChange={event=>chooseYear(Number(event.target.value))}>{years.map(index=><option key={index} value={index}>{index===0?'Preschool':'Year '+index}</option>)}</select></label>
    {!projects&&<label>Word language<select aria-label="Word language" value={language} onChange={event=>{setLanguage(Number(event.target.value));setAudioStatus('');restart();window.speechSynthesis?.cancel()}}>{DICTIONARY_LANGUAGES.map(([value,label],index)=><option key={value} value={index}>{label}</option>)}</select></label>}
   </div>
  </header>
  <div className="chapter-chips dictionary-tabs" role="group" aria-label={projects?'Project tools':'Dictionary activities'}>
   {!projects&&[['words','Picture words'],['quiz','Word detective']].map(([id,label])=><button key={id} type="button" aria-pressed={view===id} className={view===id?'selected':''} onClick={()=>setView(id)}>{label}</button>)}
   {onOpenModule&&<button type="button" onClick={()=>onOpenModule(projects?'dictionary':'creative-projects')}>{projects?'Open Picture Dictionary':'Open Creative Projects'}</button>}
  </div>
  {audioStatus&&<p role="status" className="dictionary-audio-status">{audioStatus}</p>}
  {view==='words'&&<div className="dictionary-grid">
   {words.map(word=><button className="dictionary-card" type="button" key={word[1]} onClick={()=>speak(word)} aria-label={'Hear '+word[language+1]}>
    <span className="dictionary-picture" aria-hidden="true">{word[0]}</span>
    <strong lang={code}>{word[language+1]}</strong><span className="dictionary-listen" aria-hidden="true">🔊 Listen</span>
   </button>)}
  </div>}
  {view==='quiz'&&<article className="panel dictionary-quiz">
   <h2>Word detective</h2>
   <label>Challenge<select aria-label="Challenge" value={mode} onChange={event=>{setMode(event.target.value);restart()}}><option value="clue">Read a clue</option><option value="audio">Listen and find</option></select></label>
   {answer?<><p>Word {round+1} of {words.length}</p>
    {mode==='clue'?<p className="dictionary-clue">{answer[5]}</p>:<button type="button" onClick={()=>speak(answer)}>🔊 Play the mystery word</button>}
    <div className="dictionary-grid">
     {choices.map(index=><button className="dictionary-card" type="button" key={index} aria-label={words[index][1]} disabled={result===true} onClick={()=>setResult(index===order[round])}><span className="dictionary-picture" aria-hidden="true">{words[index][0]}</span></button>)}
    </div>
    {result!==null&&<p role="status">{result?'Correct! It’s '+answer[language+1]+'.':'Try another picture.'}</p>}
    {result&&<button className="primary" type="button" onClick={()=>{setRound(round+1);setResult(null);setOptions(shuffled(words.map((_,index)=>index)))}}>{round===words.length-1?'Finish':'Next word'}</button>}
   </>:<><p role="status">You found all {words.length} words!</p><button type="button" onClick={()=>restart()}>Play again</button></>}
  </article>}
  {view==='projects'&&<article className="panel dictionary-project">
   <label>Choose a project<select aria-label="Choose a project" value={bonus?'bonus':'main'} onChange={event=>{setBonus(event.target.value==='bonus');setComplete([])}}>
    <option value="main">{CREATIVE_PROJECTS[year][0]}</option><option value="bonus">{BONUS_PROJECTS[year][0]}</option>
   </select></label>
   <h2>{project[0]}</h2><p>{project[1]}</p>
   <fieldset><legend>Check your work</legend>{project[2].map((step,index)=><label key={step}><input type="checkbox" checked={complete.includes(index)} onChange={event=>setComplete(event.target.checked?[...complete,index]:complete.filter(item=>item!==index))}/>{step}</label>)}</fieldset>
   {complete.length===project[2].length&&<p role="status">Project complete. Share what you made with someone at home!</p>}
  </article>}
 </section>;
}
