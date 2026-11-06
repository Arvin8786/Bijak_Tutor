import React,{useState} from 'react';
import {buildLearningPacks,packProgress,featuredLesson} from './learningPacks.js';

export default function AdventurePacks({lessons=[],year=1,school='SK',childId='',attempts={},onOpen,onPreschool}){
 const [opened,setOpened]=useState('');
 const packs=buildLearningPacks(lessons,year,school);
 const featured=featuredLesson(packs,attempts,childId);
 return <section className="adventure-packs" aria-label="Interactive learning packages">
  <div className="adventure-intro">
   <div><span className="adventure-eyebrow">✨ PICK A LEARNING ADVENTURE</span><h2>Choose your superpower!</h2><p>Short, colourful learning packs made from real lessons for Tahun {year}. Explore at your own pace.</p></div>
   <div className="adventure-illustration" aria-hidden="true"><span>📚</span><span>⭐</span><span>🚀</span></div>
  </div>
  <div className="adventure-quest" aria-label="Suggested learning mission">
   <div className="quest-symbol" aria-hidden="true">🎯</div>
   <div className="quest-copy"><span className="tiny-heading">YOUR NEXT MINI MISSION</span><strong>{featured?featured.lesson.title:'Choose your first adventure'}</strong><small>{featured?featured.pack.title+' • 1 lesson at a time':'Prasekolah games are available too'}</small></div>
   {featured?<button type="button" className="quest-go" onClick={()=>onOpen(featured.lesson.id)}>Start mission <span aria-hidden="true">→</span></button>:<button type="button" className="quest-go" onClick={onPreschool}>Explore ABC <span aria-hidden="true">→</span></button>}
  </div>
  <div className="adventure-grid">
   {packs.map((pack,i)=>{
     const progress=packProgress(pack,attempts,childId);
     const expanded=opened===pack.id;
     return <article className={'adventure-card tone-'+pack.tone} key={pack.id}>
       <div className="pack-decoration" aria-hidden="true">✦</div>
       <div className="pack-top"><span className="pack-emoji" aria-hidden="true">{pack.emoji}</span><span className="pack-index">ADVENTURE {String(i+1).padStart(2,'0')}</span></div>
       <h3>{pack.title}</h3><p>{pack.subtitle}</p>
       <div className="pack-meta"><span>📖 {pack.lessons.length} mini lessons</span><span>🏫 Tahun {year}</span></div>
       {childId?<div className="pack-progress"><div className="pack-progress-copy"><span>Practised</span><strong>{progress.done}/{progress.total}</strong></div><div className="pack-meter" role="progressbar" aria-label={pack.title+' practice progress'} aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}><span style={{width:progress.percent+'%'}}/></div></div>:<div className="pack-no-profile">Explore freely — no learner profile needed</div>}
       <button type="button" className="pack-explore" aria-expanded={expanded} onClick={()=>setOpened(v=>v===pack.id?'':pack.id)}>{expanded?'Hide lessons':'See learning pack'} <span aria-hidden="true">{expanded?'−':'→'}</span></button>
       {expanded&&<ol className="pack-lesson-list">{pack.lessons.map((l,j)=>{
         const practised=childId&&(attempts[childId+'/'+l.id]?.attempts||[]).length>0;
         return <li key={l.id}><button type="button" onClick={()=>onOpen(l.id)}><span className="pack-lesson-step" aria-hidden="true">{practised?'✓':j+1}</span><span className="pack-lesson-details"><strong>{l.title}</strong><small>{l.subject} · {practised?'Practised':'Read & try'}</small></span><span className="pack-lesson-arrow" aria-hidden="true">↗</span></button></li>
       })}</ol>}
     </article>
   })}
  </div>
  <div className="packs-disclaimer"><span>💡</span><p>Learning packs are themed paths through available study materials, not additional paid products. “Practised” means at least one question was attempted — not a certified mastery result. Explore the subject library for every other available lesson.</p></div>
 </section>;
}
