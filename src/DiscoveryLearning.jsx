import React, {useState} from 'react';
import {DISCOVERY_MODULES} from './discoveryModules.js';

const copy = {
 en: {match: 'Match the cards', order: 'Put the steps in order', done: 'Finished!', progress: 'complete',
  retry: 'Try again. Look at the example and choose another answer.', reset: 'Start again'},
 ms: {match: 'Padankan kad', order: 'Susun langkah', done: 'Selesai!', progress: 'selesai',
  retry: 'Cuba lagi. Lihat contoh dan pilih jawapan lain.', reset: 'Mula semula'},
};

export function DiscoveryLibrary({availableLessons, onOpen}) {
 const [year,setYear]=useState('all'),[subject,setSubject]=useState('all'),[kind,setKind]=useState('all');
 const available = new Set(availableLessons.map(lesson => lesson.id));
 const catalogue=DISCOVERY_MODULES.flatMap(module=>module.lessons).filter(lesson=>available.has(lesson.id));
 const matches=lesson=>available.has(lesson.id)
  &&(year==='all'||String(lesson.year)===year)
  &&(subject==='all'||lesson.subject===subject)
  &&(kind==='all'||lesson.activity.kind===kind);
 return <section className="discovery-library">
  <div className="section-heading"><div>
   <span className="mini-label">🧩 BELAJAR SAMBIL BERMAIN</span>
   <h1>Interactive Modules · Modul Interaktif</h1>
   <p>Choose a lesson to match cards, put ideas in order, and try a short quiz.</p>
  </div></div>
  <div className="library-filters">
   <label>Year <select value={year} onChange={event=>setYear(event.target.value)}><option value="all">All years</option>
    {[...new Set(catalogue.map(lesson=>lesson.year))].sort().map(value=><option key={value} value={value}>Tahun {value}</option>)}</select></label>
   <label>Subject <select value={subject} onChange={event=>setSubject(event.target.value)}><option value="all">All subjects</option>
    {[...new Set(catalogue.map(lesson=>lesson.subject))].sort().map(value=><option key={value}>{value}</option>)}</select></label>
   <label>Activity type <select value={kind} onChange={event=>setKind(event.target.value)}>
    <option value="all">All activities</option><option value="match">Match cards</option><option value="order">Put in order</option>
   </select></label>
  </div>
  {!catalogue.some(matches)&&<p role="status">No lessons match these filters.</p>}
  {DISCOVERY_MODULES.map(module => {
   const lessons = module.lessons.filter(matches);
   if (!lessons.length) return null;
   return <section className="panel discovery-library-group" key={module.title}>
    <h2><span aria-hidden="true">{module.icon}</span> {module.title}</h2>
    <div className="cards">
     {lessons.map(lesson => <button type="button" className="lesson illustrated-lesson"
      key={lesson.id} onClick={() => onOpen(lesson.id)}>
      <span className="lesson-art" aria-hidden="true">{lesson.icon}</span>
      <strong dir="auto">{lesson.title}</strong>
      <small>{lesson.subject} · Tahun {lesson.year}{lesson.school!=='ALL'?' · '+lesson.school:''}</small>
      <span className="lesson-link">{lesson.activity.kind==='match'?'🧩 Match cards':'🔢 Put in order'} →</span>
     </button>)}
    </div>
   </section>;
  })}
  <p className="draft-note">Supplementary learning materials under educator review.</p>
 </section>;
}

export function DiscoveryActivity({activity, language, onComplete}) {
 const [position, setPosition] = useState(0);
 const [mistake, setMistake] = useState(false);
 const labels = copy[language] || copy.en;
 const matching = activity.kind === 'match';
 const heading = matching ? labels.match : labels.order;
 const answers = matching ? activity.pairs.map(pair => pair[1]) : activity.steps;
 const rotation = 1 + activity.id.length % (answers.length - 1);
 const choices = [...answers.slice(rotation), ...answers.slice(0, rotation)];
 const complete = position === answers.length;
 const completedAnswers = answers.slice(0, position);

 function select(choice) {
  if (complete || completedAnswers.includes(choice)) return;
  if (choice !== answers[position]) {
   setMistake(true);
   return;
  }
  setMistake(false);
  setPosition(position + 1);
  if(position+1===answers.length)onComplete?.();
 }

 return <section className="lesson-quick-check discovery-activity" aria-label="Interactive lesson activity">
  <span className="mini-label">🎮 MODUL INTERAKTIF</span>
  <h2>{heading}</h2>
  <p dir="auto">{activity.prompt}</p>
  {matching && !complete && <p className="discovery-activity-clue" dir="auto"><strong>{activity.pairs[position][0]}</strong></p>}
  <div className="quick-check-choices" role="group" aria-label={heading}>
   {choices.map(choice => <button type="button" key={choice} dir="auto"
    aria-disabled={complete || completedAnswers.includes(choice)} onClick={() => select(choice)}>{choice}</button>)}
  </div>
  {!!position && <ol className="discovery-activity-answers">
   {completedAnswers.map((answer, index) => <li key={answer} dir="auto">
    {matching?<><strong>{activity.pairs[index][0]}</strong> → {answer}</>:answer}
   </li>)}
  </ol>}
  <p role="status" className={complete?'quick-check-right':'quick-check-retry'}>
   {complete?<>⭐ {labels.done} <span dir="auto">{activity.feedback}</span></>
    :mistake?<span>🌱 {labels.retry}</span>
     :<span>{position} / {answers.length} {labels.progress}</span>}
  </p>
  {(position > 0 || mistake) && <button type="button" onClick={() => {
   setPosition(0);
   setMistake(false);
  }}>{labels.reset}</button>}
 </section>;
}
