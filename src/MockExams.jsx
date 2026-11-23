import React,{useEffect,useRef,useState} from 'react';
import './mock-exams.css';

const timeText=milliseconds=>{
 const seconds=Math.max(0,Math.ceil(milliseconds/1000));
 return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
};
const resultTitle=attempt=>attempt.title+' · '+attempt.score+'/'+attempt.total;
function ExamResults({attempt}){
 return <section className="panel mock-result">
  <h2>{attempt.title}</h2>
  <p><strong>{attempt.score} / {attempt.total}</strong> correct ({Math.round(100*attempt.score/attempt.total)}%). Answered {attempt.answered} of {attempt.total}.</p>
  <ol>{attempt.review.map((item,index)=><li key={index}>
   {item.passage&&<details><summary>Reading passage</summary><p>{item.passage}</p></details>}
   <h3>{item.prompt}</h3>
   <p><strong>{item.correct?'Correct':'Correct answer'}</strong> · {item.answer}</p>
   {!item.correct&&<p>Your answer: {item.submitted??'Unanswered'}</p>}
   {item.explanation&&<p>{item.explanation}</p>}
  </li>)}</ol>
 </section>;
}

function ExamSession({attempt,request,onUpdate}){
 const [index,setIndex]=useState(0),[draft,setDraft]=useState(attempt.answers[0]??''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [remaining,setRemaining]=useState(()=>attempt.endsAt-attempt.serverNow);
 const clocksStarted=useRef({monotonic:performance.now(),wall:Date.now()});
 const deadlineChecked=useRef(false);
 const current=attempt.questions[index];
 const saved=attempt.answers[index]??'';
 const dirty=draft!==saved;
 const questionHeading=useRef(null);
 useEffect(()=>{
  const tick=()=>{
   const start=clocksStarted.current,elapsed=Math.max(performance.now()-start.monotonic,Date.now()-start.wall);
   setRemaining(Math.max(0,attempt.endsAt-attempt.serverNow-elapsed));
  };
  const timer=window.setInterval(tick,250);
  document.addEventListener('visibilitychange',tick);
  return ()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',tick)};
 },[attempt.endsAt,attempt.serverNow]);
 async function results(){
  setBusy(true);setError('');
  try{
   const state=await request('mockExamRequest','state',{attemptId:attempt.id});
   if(!state.finished){
    clocksStarted.current={monotonic:performance.now(),wall:Date.now()};
    deadlineChecked.current=false;
    setRemaining(state.endsAt-state.serverNow);
   }
   onUpdate(state);
  }
  catch(e){setError(e.message)}
  finally{setBusy(false)}
 }
 useEffect(()=>{
  if(remaining<=0&&!busy&&!deadlineChecked.current){
   deadlineChecked.current=true;
   results();
  }
 },[remaining,busy]);
 async function move(next){
  if(busy||remaining<=0)return;
  setBusy(true);setError('');
  try{
   if(dirty){
    const response=await request('mockExamRequest','save',{attemptId:attempt.id,index,answer:draft.trim()});
    if(response.finished){onUpdate(response);return}
    onUpdate({...attempt,answers:{...attempt.answers,[index]:draft.trim()}});
   }
   if(index!==next){setIndex(next);setDraft(attempt.answers[next]??'');requestAnimationFrame(()=>questionHeading.current?.focus());}
   else setDraft(draft.trim());
  }catch(e){setError(e.message)}
  finally{setBusy(false)}
 }
 return <section className="panel mock-session" aria-label="Timed mock exam">
  <div className="mock-status"><h2>{attempt.title}</h2><span role="timer" aria-label="Time remaining">{timeText(remaining)}</span></div>
  <p>{remaining>0?'Save your answers as you go. Only saved answers count when time expires.':'Time is up. Your saved answers are being marked.'}</p>
  {error&&<p role="alert">{error}</p>}
  {remaining<=0?<button disabled={busy} type="button" onClick={results}>Check result</button>:<>
   <form onSubmit={event=>{event.preventDefault();move(Math.min(index+1,attempt.total-1))}}>
    <div className="mock-question">
     <h3 ref={questionHeading} tabIndex={-1}>Question {index+1} of {attempt.total}</h3>
     {current.passage&&<blockquote className="mock-passage">{current.passage}</blockquote>}
     <fieldset disabled={busy}><legend>{current.prompt}</legend>
      {current.options?<div className="mock-options">{current.options.map((option,i)=><label key={option}><input name="exam-answer" type="radio" value={String(i)} checked={draft===String(i)} onChange={e=>setDraft(e.target.value)}/>{option}</label>)}</div>:
       <label className="mock-number">Answer <input type="text" inputMode="decimal" maxLength={26} value={draft} onChange={e=>setDraft(e.target.value)}/></label>}
     </fieldset>
    </div>
    <div className="actions mock-controls">
     <button type="button" disabled={busy||!index} onClick={()=>move(index-1)}>Previous</button>
     <button type="button" disabled={busy||!dirty} onClick={()=>move(index)}>Save answer</button>
     <button className="primary" disabled={busy||index===attempt.total-1} type="submit">{dirty?'Save & next':'Next question'}</button>
    </div>
    {busy?<p role="status">Saving your answer…</p>:dirty?<p role="status">Answer changed · save before leaving</p>:saved&&<p role="status">Answer saved</p>}
   </form>
   <nav aria-label="Exam questions" className="mock-jump">
    {attempt.questions.map((_,i)=><button key={i} type="button" aria-current={i===index?'step':undefined}
     aria-label={'Question '+(i+1)+(attempt.answers[i]?' · answered':' · unanswered')} disabled={busy} onClick={()=>move(i)}>{i+1}{attempt.answers[i]?' ✓':''}</button>)}
   </nav>
  </>}
 </section>;
}

export default function MockExams({request}){
 const [catalog,setCatalog]=useState(null),[attempt,setAttempt]=useState(null),[paper,setPaper]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [revision,reload]=useState(0);
 useEffect(()=>{
  let mounted=true;
  request('mockExamRequest','catalog',{}).then(value=>{if(mounted){setCatalog(value);setError('')}}).catch(e=>{if(mounted)setError(e.message)});
  return ()=>{mounted=false};
 },[request,revision]);
 async function open(action,input){
  setBusy(true);setError('');
  try{setAttempt(await request('mockExamRequest',action,input))}
  catch(e){setError(e.message)}
  finally{setBusy(false)}
 }
 function back(){setAttempt(null);setPaper('');reload(n=>n+1)}
 return <section className="mock-exams">
  <div className="section-heading"><div><h1>Year-end mock exams</h1><p>Timed practice for your school year. Results and the answer key unlock when the hour ends.</p></div></div>
  {error&&<p role="alert">{error} <button type="button" onClick={()=>reload(n=>n+1)}>Refresh papers</button></p>}
  {attempt?(attempt.finished?<><button type="button" onClick={back}>Back to mock exams</button><ExamResults attempt={attempt}/></>:
   <ExamSession key={attempt.id} request={request} attempt={attempt} onUpdate={setAttempt}/>):catalog?<section className="panel">
    <h2>{catalog.active?'Continue your exam':'Choose a paper'}</h2>
    {catalog.active?<button className="primary" disabled={busy} onClick={()=>open('state',{attemptId:catalog.active})}>Resume timed exam</button>:
     <form onSubmit={e=>{e.preventDefault();open('start',{paperId:paper})}}>
      <label>Subject <select aria-label="Subject" required value={paper} onChange={e=>setPaper(e.target.value)}><option value="">Choose a subject</option>{catalog.papers.map(p=><option key={p.id} value={p.id}>{p.title} · Year {p.year}</option>)}</select></label>
      <p>The 60-minute timer starts when you open the paper and continues if you leave the screen.</p>
      <button className="primary" disabled={busy||!paper}>Start one-hour exam</button>
     </form>}
    {busy&&<p role="status">Opening exam…</p>}
    {catalog.completed.length>0&&<><h3>Past results</h3><ul>{catalog.completed.map(item=><li key={item.id}><button disabled={busy} onClick={()=>open('state',{attemptId:item.id})}>{resultTitle(item)}</button></li>)}</ul></>}
   </section>:!error&&<p role="status">Loading papers…</p>}
 </section>;
}

export function ParentMockResults({request,children}){
 const [child,setChild]=useState(''),[record,setRecord]=useState(null),[revision,reload]=useState(0);
 const selection=children.some(item=>item.id===child)?child:children[0]?.id;
 useEffect(()=>{
  if(!selection)return;
  let active=true;
  request('mockExamRequest','results',{childId:selection}).then(results=>{if(active)setRecord({id:selection,results})})
   .catch(error=>{if(active)setRecord({id:selection,error:error.message})});
  return ()=>{active=false};
 },[request,selection,revision]);
 if(!children.length)return <section className="panel"><p>Add a linked learner to view their mock exam results.</p></section>;
 const view=record?.id===selection?record:null;
 return <section className="panel mock-parent">
  <h2>Completed year-end mock exams</h2>
  <label>Learner <select value={selection} onChange={e=>setChild(e.target.value)}>{children.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label> <button type="button" onClick={()=>reload(n=>n+1)}>Refresh results</button>
  {!view?<p role="status">Loading exam results…</p>:view.error?<p role="alert">{view.error}</p>:view.results.length?
   <ul>{view.results.map(item=><li key={item.id}><strong>{resultTitle(item)}</strong> · {Math.round(100*item.score/item.total)}% · {new Date(item.endsAt).toLocaleString('en-MY',{timeZone:'Asia/Kuala_Lumpur'})} (Malaysia time)</li>)}</ul>:
   <p>No completed exams yet. Scores appear after each one-hour session ends.</p>}
 </section>;
}
