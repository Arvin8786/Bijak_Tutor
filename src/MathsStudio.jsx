import React,{useEffect,useMemo,useRef,useState} from 'react';
import {questionBank,selectPractice,markPractice} from './practiceBank.js';
import {say} from './localization.js';
import Whiteboard from './Whiteboard.jsx';
import {makeProblem,checkWorking,checkLines,workedSteps,starsFor,isBonusRound,bonusYear,blocksFor,canShowBlocks,factFor,makeRiddle,riddleStars} from './mathGuide.js';
import {recordActivity,readStreak} from './dailyStreak.js';

const TOPICS=[['all','tpAll',/.*/],['numbers','tpNumbers',/nombor|tambah|tolak|darab|bahagi|number|operasi/i],['fractions','tpFractions',/pecahan|perpuluhan|peratus|fraction/i],['money','tpMoney',/\b(wang|duit|ringgit|sen|belanja|syiling)\b/i],['time','tpTime',/masa|waktu|jam|hari|bulan|duration/i],['measure','tpMeasure',/ukuran|sukatan|panjang|berat|ruang|bentuk|perimeter|luas|isipadu|cecair/i]];

// Writes a guide message from a diagnosis code, in the chosen language.
function guideText(language,result){
 const t=(key,vars)=>say(language,key,vars);
 const parts=[];
 if(result.code==='correct')return t('g_correct',{stars:''}).trim();
 const params={...result.params};
 if(params.place)params.place=t('pl_'+params.place);
 parts.push(t('g_'+result.code,params));
 return parts.join(' ');
}


function Confetti(){
 const calm=typeof document!=='undefined'&&document.documentElement.dataset.motion==='off';
 let reduced=false;try{reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch{}
 if(calm||reduced)return null;
 const colours=['#ff6b6b','#ffd166','#06d6a0','#4cc9f0','#b388eb'];
 return <div className="confetti" aria-hidden="true">{Array.from({length:26},(_,i)=><i key={i} style={{left:(i*37%100)+'%',background:colours[i%5],animationDelay:(i%7)*0.07+'s','--dx':((i%9)-4)*14+'px'}}/>)}</div>;
}

function Group({n,kind}){return <span className={'blk-group blk-'+kind}>{Array.from({length:n},(_,i)=><i key={i}/>)}</span>}
function Blocks({language,problem}){
 const t=(k,v)=>say(language,k,v);
 const a=blocksFor(problem.a),b=blocksFor(problem.b),r=blocksFor(problem.answer);
 if(!a||!b||!r)return null;
 const row=(x)=><div className="blk-row"><Group n={x.hundreds} kind="h"/><Group n={x.tens} kind="t"/><Group n={x.ones} kind="o"/></div>;
 return <div className="blocks" role="group" aria-label={t('blocksBtn')}>
  <p>{t(problem.op==='+'?'blocksAdd':'blocksSub',{a:problem.a,b:problem.b})}</p>
  {row(a)}{row(b)}
  <p className="blk-count">= {problem.answer}</p>
  {row(r)}
  <p className="blk-count">{t('blocksCount',{h:r.hundreds,t:r.tens,o:r.ones})}</p>
 </div>;
}

function Detective({language,year}){
 const t=(k,v)=>say(language,k,v);
 const [seed,setSeed]=useState(1),[shown,setShown]=useState(1),[guess,setGuess]=useState(''),[state,setState]=useState('idle'),[earned,setEarned]=useState(0);
 const riddle=useMemo(()=>makeRiddle(year,seed),[year,seed]);
 const done=state==='right';
 const check=()=>{
  if(done||!guess.trim())return;
  if(Number(guess)===riddle.secret){const st=riddleStars(shown);setEarned(st);setState('right');recordActivity(st)}
  else setState('wrong');
 };
 const again=()=>{setSeed(n=>n+1);setShown(1);setGuess('');setState('idle')};
 return <div className="detective">
  <h2>🕵️ {t('puzTitle')}</h2><p>{t('puzIntro')}</p>
  <ol className="clue-list">{riddle.clues.slice(0,shown).map((c,i)=><li key={i}><span className="clue-n">{t('clueLabel',{n:i+1})}</span> {t('c_'+c.code,c.params)}</li>)}</ol>
  {!done&&<div className="actions">
   <label>{t('yourGuess')}<input inputMode="numeric" value={guess} onChange={e=>{setGuess(e.target.value);setState('idle')}} onKeyDown={e=>{if(e.key==='Enter')check()}} autoComplete="off"/></label>
   <button type="button" className="primary" onClick={check} disabled={!guess.trim()}>{t('puzCheck')}</button>
   <button type="button" onClick={()=>setShown(n=>Math.min(riddle.clues.length,n+1))} disabled={shown>=riddle.clues.length}>🔍 {shown>=riddle.clues.length?t('puzNoMore'):t('anotherClue')}</button>
  </div>}
  {state==='wrong'&&<p className="guide-bubble oops" role="status">{t('puzWrong')}</p>}
  {done&&<><p className="guide-bubble good" role="status">{t('puzRight',{n:riddle.secret,stars:'⭐'.repeat(earned)})}</p><Confetti/><div className="actions"><button type="button" className="primary" onClick={again}>{t('puzNext')}</button></div></>}
 </div>;
}

function Board({language,year,onStars}){
 const t=(key,vars)=>say(language,key,vars);
 const [seed,setSeed]=useState(1),[working,setWorking]=useState(''),[answer,setAnswer]=useState('');
 const [feedback,setFeedback]=useState(null),[hints,setHints]=useState(0),[attempts,setAttempts]=useState(0),[showSteps,setShowSteps]=useState(false),[stars,setStars]=useState(()=>readStreak().stars),[combo,setCombo]=useState(0),[blocks,setBlocks]=useState(false),[burst,setBurst]=useState(0),[boardLines,setBoardLines]=useState([]),[live,setLive]=useState(null);
 const bonus=isBonusRound(combo),problem=useMemo(()=>makeProblem(bonus?bonusYear(year):year,seed),[year,seed,bonus]);
 const solved=feedback?.status==='correct';
 // The guide reads what is typed on the board (Type tool) or in the boxes. A lone number on the last line counts as the answer.
 const typedLines=working.trim()?working.split('\n'):boardLines;
 const lastBoard=boardLines.length?boardLines[boardLines.length-1].trim():'';
 const boardAnswer=/^-?\d+(?:[.,]\d+)?$/.test(lastBoard)?lastBoard.replace(',','.'):'';
 const finalAnswer=answer.trim()?answer:boardAnswer;
 const readLines=boardAnswer&&!working.trim()?boardLines.slice(0,-1):typedLines;
 useEffect(()=>{
  if(solved)return;
  const id=setTimeout(()=>setLive(checkLines(readLines)),500);
  return()=>clearTimeout(id);
 },[working,boardLines,solved]); // eslint-disable-line

 const next=()=>{setSeed(n=>n+1);setWorking('');setAnswer('');setFeedback(null);setHints(0);setAttempts(0);setShowSteps(false);setBlocks(false)};
 const check=()=>{
  const result=checkWorking(problem,{answer:finalAnswer,lines:readLines});
  setFeedback(result);
  if(result.status==='empty'||result.status==='invalid')return;
  setAttempts(n=>n+1);
  if(result.status==='correct'&&!solved){
   const earned=starsFor(hints+Math.max(0,attempts))*(bonus?2:1);
   setCombo(c=>hints+attempts===0?c+1:0);setBurst(b=>b+1);
   const state=recordActivity(earned);
   setStars(state.stars);onStars?.(state);
   setFeedback({...result,earned});
  }
 };
 const hint=()=>{
  setHints(n=>n+1);
  if(feedback?.params?.place)setFeedback(f=>({...f,hintPlace:feedback.params.place}));
  else setShowSteps(true);
 };

 const steps=showSteps||solved?workedSteps(problem):[];
 const message=!feedback?t('guideWelcome'):feedback.status==='empty'?t('g_empty'):feedback.status==='invalid'?t('g_not_a_number'):solved?t('g_correct',{stars:'⭐'.repeat(feedback.earned||1)}):guideText(language,feedback);

 return <div className="math-board">
  <div className="math-problem" aria-live="polite">
   <span className="mini-label">{t('boardGoal')} · {t('yearLabel',{n:year})}</span>
   <strong className="math-expr">{problem.text} = ?</strong>
   <span className="math-stars" aria-label={t('starsLabel')}>⭐ {stars}</span>
   {combo>0&&<span className="combo-chip">🔥 {t('comboLabel',{n:combo})}</span>}
   {bonus&&<span className="bonus-tag">{t('bonusTag')}</span>}
   {burst>0&&solved&&<Confetti key={burst}/>}
  </div>
  <div className="math-layout">
   <Whiteboard language={language} onLines={setBoardLines}/>
   <aside className="math-guide" aria-label={t('guideTitle')}>
    <h3><span aria-hidden="true">🦉</span> {t('guideTitle')}</h3>
    <div className={'guide-bubble '+(solved?'good':feedback&&feedback.status==='incorrect'?'oops':'')} role="status">
     <p>{message}</p>
     {feedback?.hintPlace&&<p className="guide-hint">{t('hintPlace',{place:t('pl_'+feedback.hintPlace)})}</p>}
     {feedback?.lineIssues?.map(i=><p key={i.line} className="guide-line">{t('lineIssue',{line:i.line,text:i.text,expected:i.expected})}</p>)}
     {!feedback&&live?.issues?.map(i=><p key={i.line} className="guide-line">{t('lineIssue',{line:i.line,text:i.text,expected:i.expected})}</p>)}
     {!feedback&&live&&live.checked>0&&!live.issues.length&&<p className="guide-line ok">{t('lineOk')}</p>}
     {!feedback&&!live?.checked&&<p className="guide-note">{t('boardTip')}</p>}
     {feedback&&feedback.checkedLines>0&&!feedback.lineIssues.length&&<p className="guide-line ok">{t('lineOk')}</p>}
    </div>
    <label>{t('workingLabel')}
     <textarea rows={4} value={working} placeholder={t('workingHint')} onChange={e=>setWorking(e.target.value)} disabled={solved}/>
    </label>
    <label>{t('answerLabel')}
     <input inputMode="decimal" value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!solved)check()}} disabled={solved} autoComplete="off"/>
    </label>
    <div className="actions">
     {solved?<button type="button" className="primary" onClick={next}>{t('nextProblem')}</button>:<button type="button" className="primary" onClick={check}>{t('checkWork')}</button>}
     {!solved&&<button type="button" onClick={hint}>{t('hintBtn')}</button>}
     {!solved&&<button type="button" onClick={()=>{setShowSteps(true);setHints(h=>h+1)}}>{t('stepsBtn')}</button>}
     {!solved&&<button type="button" onClick={next}>{t('newProblem')}</button>}
    </div>
    {canShowBlocks(problem)&&<button type="button" className="blocks-toggle" aria-pressed={blocks} onClick={()=>setBlocks(v=>!v)}>🧱 {blocks?t('blocksHide'):t('blocksBtn')}</button>}
    {blocks&&canShowBlocks(problem)&&<Blocks language={language} problem={problem}/>}
    {solved&&<aside className="fact-card"><strong>💡 {t('factTitle')}</strong><p>{t(factFor(seed))}</p></aside>}
    {steps.length>0&&<ol className="guide-steps">
     {steps.map((s,i)=><li key={i}>{t('s_'+s.code,{...s.params,place:s.params.place?t('pl_'+s.params.place):''})}</li>)}
     <li className="guide-answer"><strong>{t('answerIs',{n:problem.answer})}</strong></li>
    </ol>}
    <p className="guide-note">{t('guideNote')}</p>
   </aside>
  </div>
 </div>;
}

function Practice({language,lessons,year,setYear,school,onOpenLesson}){
 const t=(key,vars)=>say(language,key,vars);
 const [topic,setTopic]=useState('all'),[count,setCount]=useState(5),[session,setSession]=useState(null),[index,setIndex]=useState(0),[choice,setChoice]=useState(''),[answers,setAnswers]=useState([]),[checked,setChecked]=useState(false),[history,setHistory]=useState([]),[showHistory,setShowHistory]=useState(false),[round,setRound]=useState(0);
 const answered=useRef(false);
 const bank=useMemo(()=>questionBank(lessons,year,school,'Matematik').filter(q=>TOPICS.find(x=>x[0]===topic)[2].test(q.lessonTitle+' '+q.text)),[lessons,year,school,topic]);
 const q=session?.[index],finished=session&&index>=session.length;
 const reset=()=>{answered.current=false;setSession(null);setIndex(0);setChoice('');setAnswers([]);setChecked(false)};
 const start=()=>{answered.current=false;if(!bank.length)return;setSession(selectPractice(bank,count,'maths-studio-'+year+'-'+topic+'-'+round));setRound(x=>x+1);setIndex(0);setChoice('');setAnswers([]);setChecked(false);setShowHistory(false)};
 const check=()=>{if(!q||answered.current||!choice.trim())return;answered.current=true;const correct=markPractice(q,choice);setAnswers(a=>[...a,{question:q,response:choice,correct}]);setChecked(true);if(correct)recordActivity(1)};
 const next=()=>{if(!q||!answered.current)return;answered.current=false;if(index===session.length-1)setHistory(h=>[{year,topic:t(TOPICS.find(x=>x[0]===topic)[1]),score:answers.filter(a=>a.correct).length,total:session.length,at:new Date().toLocaleString()},...h].slice(0,20));setIndex(x=>x+1);setChoice('');setChecked(false)};
 return <div className="math-practice">
  <p>{t('practiceIntro')} {t('teacherNote')}</p>
  {!session&&<><div className="library-filters">
   <label>{t('practiceYear')}<select value={year} onChange={e=>setYear(Number(e.target.value))}>{[1,2,3,4,5,6].map(y=><option key={y} value={y}>{t('yearLabel',{n:y})}</option>)}</select></label>
   <label>{t('mathsTopic')}<select value={topic} onChange={e=>setTopic(e.target.value)}>{TOPICS.map(([id,key])=><option key={id} value={id}>{t(key)}</option>)}</select></label>
   <label>{t('perSession')}<select value={count} onChange={e=>setCount(Number(e.target.value))}>{[5,10,15,20].map(n=><option key={n}>{n}</option>)}</select></label>
  </div>
  <p>{t('availableQ',{n:bank.length})}</p>
  <div className="actions"><button className="primary" disabled={!bank.length} onClick={start}>{t('startPractice')}</button><button onClick={()=>setShowHistory(v=>!v)}>{t('historyBtn',{n:history.length})}</button></div>
  {showHistory&&<><h2>{t('historyTitle')}</h2>{!history.length?<p>{t('historyEmpty')}</p>:<ul>{history.map((h,i)=><li key={i}>{t('historyLine',{year:h.year,topic:h.topic,score:h.score,total:h.total})} · {h.at}</li>)}</ul>}<p>{t('historyNote')}</p></>}</>}
  {q&&<><p>{t('questionOf',{i:index+1,n:session.length})} · {q.lessonTitle}</p><h2>{q.text}</h2>
   {q.options?.length?<div className="choices">{q.options.map(o=><button key={o} disabled={checked} aria-pressed={choice===o} onClick={()=>setChoice(o)}>{o}</button>)}</div>:<label>{t('yourMathsAnswer')}<input value={choice} disabled={checked} onChange={e=>setChoice(e.target.value)}/></label>}
   {checked&&<div role="status" className="feedback"><strong>{answers.at(-1)?.correct?t('rightWell'):t('goodTry')}</strong><p>{t('answerColon',{a:q.answer})}</p><p>{q.why}</p>{q.lessonId&&<button onClick={()=>onOpenLesson(q.lessonId)}>{t('readLesson')}</button>}</div>}
   <div className="actions">{checked?<button className="primary" onClick={next}>{index+1===session.length?t('finishSession'):t('nextQuestion')}</button>:<button className="primary" disabled={!choice.trim()} onClick={check}>{t('checkAnswer')}</button>}<button onClick={reset}>{t('leavePractice')}</button></div></>}
  {finished&&<><h2>{t('sessionDone')}</h2><p>{t('correctOf',{c:answers.filter(a=>a.correct).length,n:session.length})}</p><h3>{t('reviewTricky')}</h3>{answers.filter(a=>!a.correct).map((a,i)=><article className="panel" key={i}><strong>{a.question.text}</strong><p>{t('workedAnswer',{a:a.question.answer})}</p><p>{a.question.why}</p></article>)}<button className="primary" onClick={start}>{t('newSet')}</button><button onClick={reset}>{t('chooseTopic')}</button></>}
 </div>;
}

export default function MathsStudio({lessons,initialYear=1,school='SK',onOpenLesson,language='ms'}){
 const t=(key,vars)=>say(language,key,vars);
 const [tab,setTab]=useState('board'),[year,setYear]=useState(initialYear);
 return <section className="panel maths-studio" aria-label={t('maths')}>
  <div className="studio-head">
   <div><h1><span aria-hidden="true">🧮</span> {t('mathTitle')}</h1><p>{t('mathIntro')}</p></div>
   <label className="studio-year">{t('chooseYear')}<select value={year} onChange={e=>setYear(Number(e.target.value))}>{[1,2,3,4,5,6].map(y=><option key={y} value={y}>{t('yearLabel',{n:y})}</option>)}</select></label>
  </div>
  <div className="studio-tabs" role="group" aria-label={t('mathTitle')}>
   <button type="button" className={tab==='board'?'on':''} aria-pressed={tab==='board'} onClick={()=>setTab('board')}><span aria-hidden="true">📝</span> {t('tabBoard')}</button>
   <button type="button" className={tab==='puzzle'?'on':''} aria-pressed={tab==='puzzle'} onClick={()=>setTab('puzzle')}><span aria-hidden="true">🕵️</span> {t('tabPuzzle')}</button>
   <button type="button" className={tab==='practice'?'on':''} aria-pressed={tab==='practice'} onClick={()=>setTab('practice')}><span aria-hidden="true">🎯</span> {t('tabPractice')}</button>
  </div>
  {tab==='board'?<Board key={year} language={language} year={year}/>:tab==='puzzle'?<Detective key={year} language={language} year={year}/>:<Practice language={language} lessons={lessons} year={year} setYear={setYear} school={school} onOpenLesson={onOpenLesson}/>}
  <p className="studio-foot">{t('aiNote')}</p>
 </section>;
}
