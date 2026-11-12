import React, {useState} from 'react';
import {PATHS} from './learningPaths.js';

export function ContinueLearning({lastLesson, activities, quizzes, missed, onOpen, onReview, onPaths}) {
 return <section className="panel continue-learning">
  <h2>Continue Learning · Sambung Belajar</h2>
  <p>{activities} activities finished · {quizzes} quizzes finished · {missed} questions to review</p>
  <div className="visual-controls">
   {lastLesson && <button type="button" onClick={()=>onOpen(lastLesson.id)}>Resume {lastLesson.title}</button>}
   <button type="button" onClick={onPaths}>Explore learning paths</button>
   {missed>0 && <button type="button" onClick={onReview}>Review missed questions</button>}
  </div>
 </section>;
}

export function ReviewQuestions({items,onRetry}) {
 return <section className="panel">
  <h1>Review missed questions</h1>
  {items.length===0?<p>You’re all caught up. Questions to practise again appear here after a quiz.</p>:<ul className="review-questions">
   {items.map(({lesson,question})=><li key={lesson.id+':'+question.id}>
    <small>{lesson.title}</small><p dir="auto">{question.text}</p>
    <button type="button" onClick={()=>onRetry(lesson.id,question.id)}>Retry this question</button>
   </li>)}
  </ul>}
 </section>;
}

export function LearningPaths({lessons,onOpen,onLab,onReview,finished}) {
 const [year,setYear]=useState('all');
 const [subject,setSubject]=useState('all');
 const available=new Map(lessons.map(lesson=>[lesson.id,lesson]));
 const paths=PATHS.filter(path=>(year==='all'||String(path.year)===year)&&(subject==='all'||path.subject===subject));
 return <section className="learning-paths">
  <h1>Learning Paths · Laluan Pembelajaran</h1>
  <p>Follow four steps at your own pace. Learn the idea, play with it, try a quiz, and review.</p>
  <div className="library-filters">
   <label>Year <select value={year} onChange={event=>setYear(event.target.value)}><option value="all">All years</option>
    {[...new Set(PATHS.map(path=>path.year))].map(value=><option key={value} value={value}>Tahun {value}</option>)}</select></label>
   <label>Subject <select value={subject} onChange={event=>setSubject(event.target.value)}><option value="all">All subjects</option>
    {[...new Set(PATHS.map(path=>path.subject))].map(value=><option key={value}>{value}</option>)}</select></label>
  </div>
  {!paths.length&&<p role="status">No paths for this selection. Try another year or subject.</p>}
  {paths.map(path=>{
   const study=path.lessons.map(id=>available.get(id)).filter(Boolean);
   const quiz=study.at(-1);
   return <section className="panel journey-path" key={path.id}>
    <h2>{path.icon} {path.title}</h2><p>Tahun {path.year} · {path.subject}</p>
    <ol className="journey-steps">
     <li><strong>1 · Learn</strong>{study.map(lesson=><button type="button" key={lesson.id} onClick={()=>onOpen(lesson.id)}>{lesson.title}</button>)}</li>
     <li><strong>2 · Play {finished.includes(path.id)?'✓':''}</strong><button type="button" onClick={()=>onLab(path.id)}>Open {path.title.split(' · ')[0]}</button></li>
     <li><strong>3 · Quiz</strong>{quiz?<button type="button" onClick={()=>onOpen(quiz.id,{quiz:true})}>Take the path quiz</button>:<p>Quiz unavailable</p>}</li>
     <li><strong>4 · Review</strong>{onReview
      ?<button type="button" onClick={()=>onReview(path.id)}>Review path questions</button>
      :quiz&&<button type="button" onClick={()=>onOpen(quiz.id,{quiz:true})}>Practise the quiz again</button>}</li>
    </ol>
   </section>;
  })}
 </section>;
}

function ReadInstructions({text}) {
 const supported=typeof window!=='undefined'&&'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
 if(!supported)return null;
 return <button type="button" onClick={()=>{
  const voice=new SpeechSynthesisUtterance(text);
  voice.lang='en-GB';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(voice);
 }}>🔊 Read instructions</button>;
}

function CheckTask({correct, success, hint, onComplete}) {
 const [message,setMessage]=useState('');
 return <div className="lab-feedback">
  <button type="button" onClick={()=>{
   setMessage(correct?success:hint);
   if(correct)onComplete();
  }}>Check my work</button>
  <p role="status">{message}</p>
 </div>;
}

function AdditionLab({onComplete}) {
 const [a,setA]=useState(1),[b,setB]=useState(1),[total,setTotal]=useState('');
 return <>
  <h2>Build 4 + 3</h2>
  <div className="lab-groups">{[[a,setA,'First group'],[b,setB,'Second group']].map(([count,change,label])=>
   <div className="lab-counter" key={label}>
    <strong>{label}</strong>
    <div className="lab-dots" aria-label={count+' counters'}>{Array.from({length:count},(_,index)=><span aria-hidden="true" key={index}>●</span>)}</div>
    <label>{label} size <input type="range" min="0" max="10" value={count} onChange={event=>change(Number(event.target.value))}/></label>
    <output>{count}</output>
   </div>)}</div>
  <label>How many altogether? <input type="number" inputMode="numeric" min="0" max="20" value={total} onChange={event=>setTotal(event.target.value)}/></label>
  <CheckTask key={a+':'+b+':'+total} correct={a===4&&b===3&&total!==''&&Number(total)===7}
   success="4 counters plus 3 counters make 7." hint="Build a group of 4 and a group of 3, then count both groups." onComplete={onComplete}/>
 </>;
}

function ClockLab({onComplete}) {
 const [time,setTime]=useState(8*60+45);
 const hour=Math.floor(time/60), minute=time%60;
 const digital=String(hour||12)+':'+String(minute).padStart(2,'0');
 const move=delta=>setTime(previous=>(previous+delta+720)%720);
 return <>
  <h2>Set the clock to 9:20</h2>
  <svg className="lab-clock" viewBox="0 0 200 200" role="img" aria-label={'Analog clock showing '+digital}>
   <circle cx="100" cy="100" r="94" fill="#fffaf1" stroke="#41689a" strokeWidth="5"/>
   {Array.from({length:12},(_,index)=>{
    const angle=index*Math.PI/6;
    return <text key={index} x={100+74*Math.sin(angle)} y={100-74*Math.cos(angle)}
     textAnchor="middle" dominantBaseline="middle" fontSize="15" fill="#173c67">{index||12}</text>;
   })}
   <line x1="100" y1="100" x2="100" y2="61" stroke="#bd385f" strokeWidth="8" strokeLinecap="round" transform={'rotate('+time/2+' 100 100)'}/>
   <line x1="100" y1="100" x2="100" y2="42" stroke="#214f89" strokeWidth="5" strokeLinecap="round" transform={'rotate('+minute*6+' 100 100)'}/>
   <circle cx="100" cy="100" r="5" fill="#173c67"/>
  </svg>
  <p><output aria-label="Digital time">{digital}</output> · Short hand: hours · Long hand: minutes</p>
  <div className="visual-controls">{[[-60,'−1 hour'],[-5,'−5 minutes'],[5,'+5 minutes'],[60,'+1 hour']].map(([delta,label])=>
   <button type="button" key={delta} onClick={()=>move(delta)}>{label}</button>)}</div>
  <CheckTask key={time} correct={time===9*60+20} success="9:20 means 20 minutes past 9."
   hint="Move the long hand to 4 and the short hand just past 9." onComplete={onComplete}/>
 </>;
}

function FractionLab({onComplete}) {
 const [parts,setParts]=useState(2),[point,setPoint]=useState(0);
 return <>
  <h2>Find 3/4 on the number line</h2>
  <label>Equal parts <select value={parts} onChange={event=>{setParts(Number(event.target.value));setPoint(0)}}>
   {[2,3,4,6,8].map(value=><option key={value}>{value}</option>)}
  </select></label>
  <svg className="lab-number-line" viewBox="0 0 360 82" role="img" aria-label={'Number line from zero to one divided into '+parts+' equal parts'}>
   <line x1="25" x2="335" y1="43" y2="43" stroke="#294e7a" strokeWidth="4"/>
   {Array.from({length:parts+1},(_,index)=>{
    const x=25+310*index/parts;
    return <line key={index} x1={x} x2={x} y1="33" y2="53" stroke="#294e7a" strokeWidth="3"/>;
   })}
   <circle cx={25+310*point/parts} cy="43" r="10" fill="#bd385f"/>
   <text x="25" y="75" textAnchor="middle">0</text><text x="335" y="75" textAnchor="middle">1</text>
  </svg>
  <label>Move the fraction marker <input type="range" min="0" max={parts} value={point} onChange={event=>setPoint(Number(event.target.value))}/></label>
  <p><output>{point}/{parts}</output></p>
  <CheckTask key={parts+':'+point} correct={point*4===parts*3} success="The marker is three quarters of the way from 0 to 1."
   hint="Divide the line into four equal parts, then move three steps from zero." onComplete={onComplete}/>
 </>;
}

function ShadowLab({onComplete}) {
 const [guess,setGuess]=useState(''),[shown,setShown]=useState(false);
 return <>
  <h2>Predict the size of the shadow</h2>
  <p>The lamp and the wall stay in place. What happens to the shadow when the card moves closer to the lamp?</p>
  <div className="visual-controls">{['Larger','Same size','Smaller'].map(value=><button type="button" key={value}
   aria-pressed={guess===value} onClick={()=>{setGuess(value);setShown(false)}}>{value}</button>)}</div>
  <button type="button" disabled={!guess} onClick={()=>{setShown(true);onComplete()}}>Run the model</button>
  {shown&&<>
   <div className="shadow-comparison" role="img" aria-label="Card near the lamp has a larger shadow than card near the wall">
    <div><span className="shadow-small"/>Card near the wall</div><div><span className="shadow-large"/>Card near the lamp</div>
   </div>
   <p role="status">{guess==='Larger'?'Your prediction matched. ':'Compare the two shadows. '}The card blocks a wider spread of light when it is closer to the lamp, so its shadow is larger.</p>
  </>}
 </>;
}

const labs={addition:AdditionLab,time:ClockLab,fractions:FractionLab,science:ShadowLab};
export function PracticeLab({path,onComplete}) {
 const Lab=labs[path.tool];
 return <section className="panel practice-lab">
  <h1>{path.icon} {path.title}</h1>
  <p>{path.instructions}</p>
  <ReadInstructions text={path.instructions}/>
  <Lab onComplete={onComplete}/>
 </section>;
}
