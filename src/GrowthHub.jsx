import React,{useEffect,useMemo,useState} from 'react';
import {findGrowthTrack,trackQuiz} from './growthCurriculum.js';
const PROGRESS_KEY='bijaklearn:public-growth-checklist:v1';
const HOBBY_DAYS=7;
const prompts={
  junior:{task:'Explain how a plant grows',audience:'Tahun 3 learner',format:'three simple steps',check:'Include an example I can check in a science book'},
  adult:{task:'Draft a courteous meeting summary',audience:'a project team',format:'a short checklist with next steps',check:'Separate confirmed facts from assumptions'}
};
function initialProgress(){
 try{const parsed=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}');return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{}}catch{return {}}
}
function saveProgress(next){try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(next))}catch{}}
function SpeakButton({text,lang='en-US'}){
 const [status,setStatus]=useState('');
 const read=()=>{
  if(!('speechSynthesis' in window)){setStatus('Read-aloud is not supported here.');return}
  window.speechSynthesis.cancel();
  const voice=new SpeechSynthesisUtterance(String(text).slice(0,2800));voice.lang=lang;voice.rate=.92;
  voice.onerror=()=>setStatus('A compatible device voice is unavailable.');
  window.speechSynthesis.speak(voice);setStatus('Reading aloud…');
 };
 return <span className="growth-speech"><button type="button" onClick={read}>🔊 Listen</button>{status&&<span role="status">{status}</span>}</span>
}
export default function GrowthHub({audience='junior',onAudience,initialKind='ai',onKind,loadTrack=null}){
 const current=audience==='adult'?'adult':'junior';
 const kind=initialKind==='hobby'?'hobby':'ai';
 const [serverTrack,setServerTrack]=useState(null);
 const [sourceNote,setSourceNote]=useState('');
 const publicTrack=useMemo(()=>findGrowthTrack(current,kind),[current,kind]);
 const track=serverTrack?.id===current+'-'+kind?serverTrack:publicTrack;
 const [lessonIndex,setLessonIndex]=useState(0);
 const [selected,setSelected]=useState(null);
 const [checked,setChecked]=useState(false);
 const [progress,setProgress]=useState(initialProgress);
 const [promptParts,setPromptParts]=useState(()=>({...prompts[current]}));
 const [planDay,setPlanDay]=useState(0);
 useEffect(()=>{setLessonIndex(0);setSelected(null);setChecked(false);setPlanDay(0);setPromptParts({...prompts[current]})},[current,kind]);
 useEffect(()=>{
  let active=true;setServerTrack(null);setSourceNote('');
  if(!loadTrack)return()=>{active=false};
  loadTrack(current+'-'+kind).then(result=>{
   if(!active)return;
   if(result&&Array.isArray(result.lessons)&&result.lessons.length&&result.lessons.every(l=>l?.quiz&&Array.isArray(l.quiz.options))){
    setServerTrack(result);setSourceNote('Content loaded from the authorised learning library.');
   }
  }).catch(()=>{if(active)setSourceNote('Showing locally available starter lessons.')});
  return()=>{active=false};
 },[current,kind,loadTrack]);
 const lesson=track?.lessons?.[lessonIndex];
 const key=current+'-'+kind;
 const completed=Array.isArray(progress[key])?progress[key]:[];
 const lessonDone=lesson?completed.includes(lesson.id):false;
 const markDone=()=>{
  if(!lesson)return;
  setProgress(prev=>{const before=Array.isArray(prev[key])?prev[key]:[],next={...prev,[key]:[...new Set([...before,lesson.id])].slice(0,60)};saveProgress(next);return next})
 };
 const quizAnswer=()=>{if(selected===null)return;setChecked(true);if(trackQuiz(lesson,selected))markDone()};
 const next=()=>{setLessonIndex(i=>(i+1)%track.lessons.length);setSelected(null);setChecked(false)};
 const setPrompt=(field,value)=>setPromptParts(prev=>({...prev,[field]:String(value).slice(0,140)}));
 const prompt=`Please ${promptParts.task} for ${promptParts.audience}. Use ${promptParts.format}. ${promptParts.check}.`;
 const dayKey=key+'-day-'+(lesson?.id||'');
 const days=Array.isArray(progress[dayKey])?progress[dayKey]:[];
 const toggleDay=day=>setProgress(prev=>{const before=Array.isArray(prev[dayKey])?prev[dayKey]:[];const updated=before.includes(day)?before.filter(x=>x!==day):[...before,day];const next={...prev,[dayKey]:updated};saveProgress(next);return next});
 return <section className="growth-hub" aria-label="Learn AI and Creative Hobbies">
  <header className="growth-hero"><div><span className="growth-kicker">PROEASE STUDIO™ · BIJAKLEARN LEARNING LAB</span><h1>{current==='adult'?'Adult Learning Studio':'Junior Discovery Lab'}</h1><p>{current==='adult'?'Learn practical AI skills and build creative routines that fit adult life.':'Discover AI safely, explore new hobbies and complete playful challenges.'}</p></div><span className="growth-hero-emoji" aria-hidden="true">{current==='adult'?'🧑‍💻':'🎒'}</span></header>
  <div className="growth-audience" role="group" aria-label="Select learning audience">
   <button type="button" className={current==='junior'?'selected':''} aria-pressed={current==='junior'} onClick={()=>onAudience('junior')}>🎒 Junior (Tahun 1–6)</button>
   <button type="button" className={current==='adult'?'selected':''} aria-pressed={current==='adult'} onClick={()=>onAudience('adult')}>🧑‍🎓 Adults (18+)</button>
  </div>
  <div className="growth-modules">
   {['ai','hobby'].map(mode=>{const t=findGrowthTrack(current,mode);return <button type="button" key={mode} aria-pressed={kind===mode} className={'growth-module growth-'+mode+' '+(kind===mode?'selected':'')} onClick={()=>onKind(mode)}><span className="growth-module-icon" aria-hidden="true">{t.icon}</span><strong>{mode==='ai'?'Learn AI':'Creative Hobbies'}</strong><small>{t.tagline}</small><span className="growth-module-info">{t.lessons.length} starter lessons · Explore →</span></button>})}
  </div>
  {sourceNote&&<p className="growth-source-note" role="status">{sourceNote}</p>}<div className="growth-progress-label"><strong>{track.title}</strong><span>{completed.filter(id=>track.lessons.some(l=>l.id===id)).length} / {track.lessons.length} topics practised</span></div>
  <div className="growth-meter"><span style={{width:(100*completed.filter(id=>track.lessons.some(l=>l.id===id)).length/track.lessons.length)+'%'}}/></div>
  <div className="growth-layout">
   <nav className="growth-lessons" aria-label={track.title+' lessons'}><h2>Choose a topic</h2>{track.lessons.map((l,i)=><button type="button" key={l.id} className={lessonIndex===i?'active':''} onClick={()=>{setLessonIndex(i);setSelected(null);setChecked(false)}}><span className="growth-number">{completed.includes(l.id)?'✓':i+1}</span><span>{l.title}</span><span aria-hidden="true">→</span></button>)}</nav>
   <article className="growth-lesson">
     <div className="growth-lesson-head"><span className="growth-kicker">LESSON {lessonIndex+1} OF {track.lessons.length}</span><SpeakButton text={[lesson.title,lesson.summary,...lesson.steps].join('. ')}/></div>
     <h2>{lesson.title}</h2><p className="growth-summary">{lesson.summary}</p>
     <h3>How to learn it</h3><ol className="growth-steps">{lesson.steps.map((step,i)=><li key={i}>{step}</li>)}</ol>
     <div className="growth-challenge"><strong>🏅 Try this project</strong><p>{lesson.challenge}</p></div>
     <div className="growth-quiz"><h3>📝 Check your understanding</h3><p>{lesson.quiz.question}</p><div className="growth-answers">{lesson.quiz.options.map((option,i)=><button type="button" disabled={checked} aria-pressed={selected===i} className={selected===i?'picked':''} key={i} onClick={()=>setSelected(i)}>{option}</button>)}</div>{checked&&<div className={'growth-feedback '+(trackQuiz(lesson,selected)?'correct':'review')} role="status"><strong>{trackQuiz(lesson,selected)?'🌟 Correct — great thinking!':'💛 Try reviewing the explanation.'}</strong><p>{lesson.quiz.why}</p></div>}<div className="growth-actions">{!checked?<button type="button" className="primary" disabled={selected===null} onClick={quizAnswer}>Check answer</button>:<button type="button" className="primary" onClick={next}>Next topic →</button>}<button type="button" onClick={markDone}>{lessonDone?'✓ Practised':'Mark activity practised'}</button></div></div>
   </article>
  </div>
  {kind==='ai'&&<section className="growth-tool"><span className="growth-tool-icon" aria-hidden="true">✨</span><div className="growth-tool-content"><h2>Prompt Builder</h2><p>Construct a clear learning or work prompt. This creates text to copy; it does not automatically transmit information to an AI service.</p><div className="growth-prompt-form">{[['task','Task'],['audience','Who is it for?'],['format','Format'],['check','How should it be checked?']].map(([field,label])=><label key={field}>{label}<input maxLength={140} value={promptParts[field]} onChange={e=>setPrompt(field,e.target.value)}/></label>)}</div><div className="growth-prompt-output"><strong>Your prompt</strong><p>{prompt}</p><button type="button" onClick={()=>navigator.clipboard?.writeText(prompt).catch(()=>{})}>📋 Copy prompt</button></div></div></section>}
  {kind==='hobby'&&<section className="growth-tool"><span className="growth-tool-icon" aria-hidden="true">🌱</span><div className="growth-tool-content"><h2>7-day Hobby Starter</h2><p>Choose a tiny activity from today's lesson and track seven short attempts. No personal details are required.</p><div className="growth-week">{Array.from({length:HOBBY_DAYS},(_,i)=><button key={i} aria-pressed={days.includes(i)} className={days.includes(i)?'done':''} type="button" onClick={()=>toggleDay(i)}><span>{days.includes(i)?'✓':i+1}</span><small>Day {i+1}</small></button>)}</div><p className="growth-small">Choose a safe project and practise at your own pace. For children, ask an adult to help with sharp tools, heat or unfamiliar plants.</p></div></section>}
  <p className="growth-safety">These are introductory, original learning experiences, not teacher-certified courses or professional advice. Public example content and client-side quizzes can be viewed by anyone; private student records and paid lessons must use a separate authenticated backend.</p>
 </section>;
}