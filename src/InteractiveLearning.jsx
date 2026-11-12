import React, {useId, useState} from 'react';
import {SUBJECT_MAPS} from './subjectMaps.js';

const branchIcons = ['💡', '🔍', '✨'];

export function LessonNavigation({active, onChange, questionCount, onTutor}) {
 const tabs = [['notes', '📚 Study content'], ['map', '🧠 Mind map'], ['quiz', '🎯 Try the quiz (' + questionCount + ')']];
 return <div className="lesson-navigation">
  <div className="reader-tabs" role="tablist" aria-label="Ways to learn">
   {tabs.map(([id, label], index) => <button type="button" role="tab" key={id}
    id={'lesson-tab-' + id} aria-controls="lesson-panel" aria-selected={active === id}
    tabIndex={active === id ? 0 : -1} className={active === id ? 'active' : ''}
    onClick={() => onChange(id)}
    onKeyDown={event => {
     const next = {ArrowLeft: (index + 2) % 3, ArrowRight: (index + 1) % 3, Home: 0, End: 2}[event.key];
     if (next === undefined) return;
     event.preventDefault();
     onChange(tabs[next][0]);
     event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
    }}>{label}</button>)}
  </div>
  <button type="button" className="tutor-lesson-button" onClick={onTutor}>🤖 Ask Study Buddy</button>
 </div>;
}

export function LearningMindMap({title, icon, branches}) {
 const [active, setActive] = useState(null);
 const panel = useId();
 if (!branches?.length) return null;

 return <section className="learning-mind-map" aria-label={'Mind map for ' + title}>
  <div className="mind-map-centre"><span aria-hidden="true">{icon}</span><strong dir="auto">{title}</strong></div>
  <p className="mind-map-hint">Tap a branch to explore an idea.</p>
  <div className="mind-map-branches">
   {branches.map(([label, detail, prompt], index) => {
    const open = active === index;
    const id = panel + '-' + index;
    return <div className="mind-map-branch" key={label + '-' + index}>
     <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setActive(open ? null : index)}>
      <span aria-hidden="true">{branchIcons[index % branchIcons.length]}</span><strong dir="auto">{label}</strong>
      <span aria-hidden="true">{open ? '−' : '+'}</span>
     </button>
     <div id={id} className="mind-map-detail" hidden={!open}>
      <p dir="auto">{detail}</p>
      {prompt && <p dir="auto"><strong>Try it</strong> {prompt}</p>}
     </div>
    </div>;
   })}
  </div>
 </section>;
}

export function SubjectMindMap({subject}) {
 const map = SUBJECT_MAPS[subject];
 if (!map) return null;
 return <details className="subject-mind-map">
  <summary><span aria-hidden="true">🧠</span> Explore the {subject} mind map</summary>
  {map.guidedByTeacher && <p>Use this study guide with your teacher’s language materials.</p>}
  <LearningMindMap {...map}/>
 </details>;
}

export function LessonQuickCheck({question,onComplete}) {
 const [choice, setChoice] = useState(null);
 const correct = choice === question.answer;
 return <section className="lesson-quick-check" aria-label="Quick lesson challenge">
  <span className="mini-label">🎮 QUICK CHALLENGE</span>
  <h2>Give it a go!</h2>
  <p dir="auto">{question.text}</p>
  <div className="quick-check-choices" role="group" aria-label="Choose an answer">
   {question.options.map(option => <button type="button" key={option} dir="auto"
    aria-pressed={choice === option} disabled={correct}
    onClick={() => {setChoice(option);if(option===question.answer)onComplete?.()}}>{option}</button>)}
  </div>
  {choice !== null && <p role="status" className={correct ? 'quick-check-right' : 'quick-check-retry'}>
   {correct ? '⭐ ' + question.why : '🌱 Good try! Look at the example and pick another answer.'}
  </p>}
  {correct && <button type="button" onClick={() => setChoice(null)}>Try again</button>}
 </section>;
}
