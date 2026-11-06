import React,{useState} from 'react';
import {PICTURE_SUBTRACTION,VOCAB_CARDS,HIJAIYAH,makeMathOptions,matchOptions,makeHijaiyahOptions} from './miniActivities.js';
import {DrawingPad} from './PreschoolStudio.jsx';
const MODES=[
 ['subtract','🍎','Picture subtraction','Count, take away and solve'],
 ['match','🧩','Read & Match','Match pictures with words'],
 ['vocab','📚','Picture dictionary','Hear and learn Malay + English'],
 ['hijaiyah','🌙','Huruf Hijaiyah','Recognise and trace Arabic letters']
];
function say(text,lang='en-US'){
 if(!('speechSynthesis' in window))return false;
 window.speechSynthesis.cancel();
 const utterance=new SpeechSynthesisUtterance(String(text));utterance.lang=lang;utterance.rate=.84;
 window.speechSynthesis.speak(utterance);return true;
}
export default function ActivityArcade(){
 const [mode,setMode]=useState('subtract'),[index,setIndex]=useState(0),[choice,setChoice]=useState(null),[stars,setStars]=useState(0),[lang,setLang]=useState('ms'),[guide,setGuide]=useState(false),[message,setMessage]=useState('');
 const next=()=>{setIndex(i=>i+1);setChoice(null);setGuide(false);setMessage('')};
 const switchMode=m=>{setMode(m);setIndex(0);setChoice(null);setGuide(false);setMessage('')};
 const answer=(value,expected)=>{
  if(choice!==null)return;
  const correct=String(value)===String(expected);
  setChoice({value,correct});
  setMessage(correct?'🌟 Great work! You earned a star.':'💛 Good try. Look at the picture and learn the correct answer.');
  if(correct)setStars(x=>x+1);
 };
 const q=PICTURE_SUBTRACTION[index%PICTURE_SUBTRACTION.length],n=q.start-q.removed;
 const word=VOCAB_CARDS[index%VOCAB_CARDS.length],label=word[lang],target=HIJAIYAH[index%HIJAIYAH.length];
 const options=mode==='match'?matchOptions(VOCAB_CARDS,index,lang):[];
 const expected=mode==='subtract'?n:mode==='match'?label:mode==='hijaiyah'?target[0]:'';
 const solved=choice!==null;
 return <section className="activity-arcade" aria-label="Interactive games and activities">
  <div className="arcade-hero"><div><span className="growth-kicker">🌈 BIJAKLEARN JUNIOR • ACTIVITY PLAYGROUND</span><h1>Learn by playing!</h1><p>Tap, count, match, trace and explore. These are original interactive activities, inspired by everyday early-learning themes.</p></div><span aria-hidden="true">🎪</span></div>
  <div className="arcade-modes">{MODES.map(([id,icon,title,desc])=><button key={id} type="button" aria-pressed={mode===id} onClick={()=>switchMode(id)} className={mode===id?'selected':''}><span aria-hidden="true">{icon}</span><strong>{title}</strong><small>{desc}</small></button>)}</div>
  <div className="arcade-stage">
   <div className="arcade-meta"><span>⭐ {stars} stars earned</span><span>Activity {index+1}</span>{mode==='match'||mode==='vocab'?<label>Language <select value={lang} onChange={e=>{setLang(e.target.value);setChoice(null)}}><option value="ms">Bahasa Melayu</option><option value="en">English</option></select></label>:null}</div>
   {mode==='subtract'&&<>
     <h2>🍎 Picture subtraction</h2><p>Count {q.start} {q.item}, then take away {q.removed}. How many are left?</p>
     <div className="arcade-counter" role="img" aria-label={q.start+' '+q.item+' with '+q.removed+' crossed out'}>
      {Array.from({length:q.start},(_,i)=><span key={i} className={i>=n?'taken':''}>{q.emoji}</span>)}
     </div>
     <div className="arcade-equation"><strong>{q.start}</strong><span>−</span><strong>{q.removed}</strong><span>=</span><strong>{solved?n:'?'}</strong></div>
     <div className="arcade-answers" role="group" aria-label="Choose your subtraction answer">{makeMathOptions(q).map(v=><button key={v} disabled={solved} className={solved&&v===n?'right':''} type="button" onClick={()=>answer(v,n)}>{v}</button>)}</div>
     {solved&&<p className="arcade-explanation">We started with {q.start}. Take away {q.removed}. The remaining {n} {q.item} are not crossed out.</p>}
   </>}
   {mode==='match'&&<>
     <h2>🧩 Read and match</h2><p>Look at the picture and choose the correct {lang==='ms'?'Bahasa Melayu':'English'} word.</p>
     <div className="arcade-picture" role="img" aria-label="Picture clue">{word.emoji}</div>
     <div className="arcade-answers" role="group" aria-label="Choose the matching word">{options.map(v=><button key={v} type="button" disabled={solved} className={solved&&v===label?'right':''} onClick={()=>answer(v,label)}>{v}</button>)}</div>
     {solved&&<p className="arcade-explanation">{word.emoji} {word.ms} = {word.en} · {word.category}</p>}
   </>}
   {mode==='vocab'&&<>
     <h2>📚 My picture dictionary</h2><p>Look, listen and learn two names for the same object.</p>
     <div className="arcade-picture" role="img" aria-label={word.ms+' or '+word.en}>{word.emoji}</div>
     <div className="arcade-vocab"><div><small>Bahasa Melayu</small><strong>{word.ms}</strong><button type="button" onClick={()=>say(word.ms,'ms-MY')}>🔊 Dengar</button></div><div><small>English</small><strong>{word.en}</strong><button type="button" onClick={()=>say(word.en,'en-GB')}>🔊 Listen</button></div></div>
     <p className="arcade-explanation">{word.category}</p>
   </>}
   {mode==='hijaiyah'&&<>
     <h2>🌙 Kenal Huruf Hijaiyah</h2><p>Kenal huruf <strong>{target[1]}</strong>, pilih huruf yang sama, kemudian cuba menulisnya.</p>
     <div className="arcade-hijaiyah-symbol" dir="rtl" lang="ar" role="img" aria-label={'Arabic letter '+target[1]}>{target[0]}</div>
     <div className="arcade-answers" dir="rtl" role="group" aria-label="Pilih huruf yang sama">{makeHijaiyahOptions(index).map(v=><button key={v} type="button" dir="rtl" lang="ar" disabled={solved} className={solved&&v===target[0]?'right':''} onClick={()=>answer(v,target[0])}>{v}</button>)}</div>
     <button type="button" className="arcade-guide-toggle" aria-expanded={guide} onClick={()=>setGuide(g=>!g)}>{guide?'Hide writing pad':'✍️ Cuba jejak huruf (Trace letter)'}</button>
     {guide&&<div className="arcade-arabic-pad" dir="rtl"><DrawingPad letter={target[0]}/></div>}
     {solved&&<p className="arcade-explanation">Betul: {target[0]} · {target[1]}. Tulisan Arab dibaca dari kanan ke kiri.</p>}
   </>}
   {message&&<div role="status" aria-live="polite" className={'arcade-result '+(choice?.correct?'success':'try')}>{message}{!choice?.correct&&<span> Correct answer: <strong>{expected}</strong></span>}</div>}
   <div className="arcade-actions"><button type="button" onClick={()=>{setChoice(null);setMessage('')}}>↻ Try again</button><button className="primary" type="button" onClick={next}>Next activity →</button></div>
  </div>
  <p className="growth-safety">The activities are formative, not official assessment scores. The writing pad detects drawing strokes but does not grade handwriting. Text-to-speech requires a compatible browser voice. Children should explore with adult guidance.</p>
 </section>;
}
