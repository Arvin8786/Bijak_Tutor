import React,{useMemo,useState} from 'react';
import {availablePracticeSubjects,questionBank,selectPractice,markPractice,flashCards} from './practiceBank.js';
import {say} from './localization.js';

const today=()=>new Date().toISOString().slice(0,10);
export default function PracticeArena({lessons,year,school,language='ms',onOpenLesson}){
 const [subject,setSubject]=useState('all'),[mode,setMode]=useState('quiz'),[index,setIndex]=useState(0),[chosen,setChosen]=useState(''),[checked,setChecked]=useState(false),[score,setScore]=useState(0),[revealed,setRevealed]=useState(false),[session,setSession]=useState(0);
 const options=availablePracticeSubjects(lessons,year,school);
 const selectedSubject=subject==='all'||options.some(x=>x.subject===subject)?subject:'all';
 const bank=useMemo(()=>questionBank(lessons,year,school,selectedSubject),[lessons,year,school,selectedSubject]);
 const questions=useMemo(()=>selectPractice(bank,10,year+'-'+school+'-'+selectedSubject+'-'+today()+'-'+session),[bank,year,school,selectedSubject,session]);
 const cards=useMemo(()=>flashCards(lessons,year,school,selectedSubject),[lessons,year,school,selectedSubject]);
 const q=questions[index],card=cards[index%Math.max(1,cards.length)];
 const reset=()=>{setIndex(0);setChosen('');setChecked(false);setScore(0);setRevealed(false)};
 const check=()=>{if(checked||!chosen.trim())return;setChecked(true);if(markPractice(q,chosen))setScore(n=>n+1)};
 const next=()=>{setIndex(n=>n+1);setChosen('');setChecked(false);setRevealed(false)};
 const startAgain=()=>{reset();setSession(s=>s+1)};
 const available=questions.length;
 const finished=mode==='quiz'&&index>=available;
 return <section className="practice-arena" aria-label="BijakLearn subject practice and flashcards">
  <div className="practice-hero"><div><span className="mini-label">🎯 LEARN • TRY • REVIEW</span><h1>{say(language,'practice')}</h1><p>Short practice sessions and flashcards from your available Tahun {year} lessons. Learn from every answer!</p></div><span aria-hidden="true">🏆</span></div>
  <div className="practice-controls">
   <label>{say(language,'school')}<strong>{school}</strong></label>
   <label>{say(language,'year')}<strong>{year}</strong></label>
   <label>Subject / Mata pelajaran<select value={selectedSubject} onChange={e=>{setSubject(e.target.value);reset()}}><option value="all">All subjects · Semua mata pelajaran</option>{options.map(o=><option key={o.subject} value={o.subject}>{o.subject} ({o.count})</option>)}</select></label>
  </div>
  <div className="practice-modes" role="group" aria-label="Choose activity">
   <button type="button" aria-pressed={mode==='quiz'} className={mode==='quiz'?'selected':''} onClick={()=>{setMode('quiz');reset()}}>📝 Quick Quiz</button>
   <button type="button" aria-pressed={mode==='cards'} className={mode==='cards'?'selected':''} onClick={()=>{setMode('cards');reset()}}>🧠 Flip Flashcards</button>
   <button type="button" aria-pressed={mode==='daily'} className={mode==='daily'?'selected':''} onClick={()=>{setMode('daily');reset()}}>🌟 Daily Challenge</button>
  </div>
  <div className="practice-stage">
  {mode==='cards'?(!cards.length?<div className="practice-empty">No flashcards for this subject yet. Try another subject.</div>:<>
    <p className="practice-progress">Card {index%cards.length+1} / {cards.length} · {card.subject}</p>
    <button type="button" className={'flip-card '+(revealed?'revealed':'')} aria-label={revealed?'Hide answer':'Reveal answer'} aria-pressed={revealed} onClick={()=>setRevealed(v=>!v)}>
      <span className="flip-icon">{revealed?'💡':'📚'}</span>
      <strong>{revealed?card.back:card.front}</strong>
      <small>{revealed?(card.example||'Tap to turn over'):'Tap to reveal the meaning and example'}</small>
    </button>
    <div className="practice-actions"><button type="button" onClick={()=>setRevealed(v=>!v)}>{revealed?'Hide answer':'Show answer'}</button><button type="button" className="primary" onClick={next}>Next card →</button><button type="button" onClick={()=>onOpenLesson(card.id)}>Read lesson</button></div>
   </>):finished?<div className="practice-finish"><div>🎉</div><h2>Well done for trying!</h2><p>You answered {score} out of {available} questions correctly. Review any tricky topics and try another set.</p><button type="button" className="primary" onClick={startAgain}>Try another practice set</button><button type="button" onClick={()=>{setMode('cards');reset()}}>Review flashcards</button></div>:!available?<div className="practice-empty">Practice activities for this selection are being prepared. Try another year or subject.</div>:<>
     <div className="practice-scorebar"><span>{mode==='daily'?'🌟 Daily Challenge':'📝 Quick Quiz'}</span><strong>{index+1} / {available}</strong><span>⭐ {score} correct</span></div>
     <div className="practice-progress-track"><span style={{width:Math.round(index/available*100)+'%'}}/></div>
     <p className="practice-topic">📚 {q.subject} · {q.lessonTitle}</p>
     <h2>{q.text}</h2>
     {['choice','reason'].includes(q.mode)&&Array.isArray(q.options)&&q.options.length?<div className="practice-options">{q.options.map((o,i)=><button type="button" key={i} disabled={checked} className={chosen===String(o)?'selected':''} onClick={()=>setChosen(String(o))}>{o}</button>)}</div>:<label className="practice-answer">Your answer / Jawapan anda<input value={chosen} onChange={e=>setChosen(e.target.value)} disabled={checked} placeholder="Type your answer" autoComplete="off" onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();check()}}}/></label>}
     {checked&&<div className={'practice-feedback '+(markPractice(q,chosen)?'correct':'retry')} role="status"><strong>{markPractice(q,chosen)?'🌟 Great work!':'💛 Good effort — review the method.'}</strong><p>Suggested answer: <b>{q.answer}</b></p><p>{q.why||'Review the relevant lesson for an explanation.'}</p>{q.lessonId&&<button type="button" onClick={()=>onOpenLesson(q.lessonId)}>📖 Open this lesson</button>}</div>}
     <div className="practice-actions">{!checked?<button type="button" className="primary" disabled={!chosen.trim()} onClick={check}>Check answer</button>:<button type="button" className="primary" onClick={next}>{index+1===available?'Finish practice →':'Next question →'}</button>}<button type="button" onClick={startAgain}>Start over</button></div>
    </>}
  </div>
  <p className="practice-notice">These are formative practice activities based on authored study materials, not official examinations or certified mastery scores. The daily challenge refreshes its question order each day and does not require an account.</p>
 </section>;
}
