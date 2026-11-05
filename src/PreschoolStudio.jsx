import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ALPHABET,EARLY_WORDS,BM_SYLLABLES,getLetterTask} from './preschoolData.js';

const SHAPES=[['Bulatan','●'],['Segi empat','■'],['Segi tiga','▲'],['Bintang','★']];
const COLORS=[['Merah','#ef5475'],['Biru','#5684e9'],['Kuning','#ffca54'],['Hijau','#50c49b'],['Ungu','#ac7bef'],['Oren','#ff9b50']];
const MODES=[['letters','🔤','ABC explorer'],['trace','✏️','Trace & draw'],['match','🅰️','Capital & small'],['spell','🧩','Build a word'],['bm','📚','Suku kata'],['numbers','🔢','Numbers 1–20'],['colors','🎨','Colours & shapes']];
function speak(text,lang='en-US'){if(typeof window==='undefined'||!window.speechSynthesis)return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang=lang;utterance.rate=.8;window.speechSynthesis.speak(utterance)}
function DrawingPad({letter,lower=false}) {
 const canvas=useRef(null),drawing=useRef(false),last=useRef(null);
 const [strokes,setStrokes]=useState(0),[guide,setGuide]=useState(true);
 const paint=useCallback((event)=>{
   const el=canvas.current;if(!el)return;
   const rect=el.getBoundingClientRect();
   const x=(event.clientX-rect.left)*el.width/rect.width, y=(event.clientY-rect.top)*el.height/rect.height;
   const ctx=el.getContext('2d');
   if(!drawing.current)return;
   ctx.strokeStyle='#3c69d4';ctx.lineWidth=12;ctx.lineCap='round';ctx.lineJoin='round';
   ctx.beginPath();
   if(last.current)ctx.moveTo(last.current.x,last.current.y);else ctx.moveTo(x,y);
   ctx.lineTo(x,y);ctx.stroke();last.current={x,y};
 },[]);
 const start=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drawing.current=true;last.current=null;e.currentTarget.setPointerCapture?.(e.pointerId);paint(e);setStrokes(n=>n+1)};
 const end=()=>{drawing.current=false;last.current=null};
 const reset=()=>{canvas.current?.getContext('2d')?.clearRect(0,0,500,300);setStrokes(0)};
 useEffect(()=>{reset()},[letter,lower]);
 return <div className="trace-studio">
  <div className="trace-canvas-wrap">
   {guide&&<div aria-hidden="true" className="tracing-guide">{lower?letter.toLowerCase():letter}</div>}
   <canvas ref={canvas} width={500} height={300} onPointerDown={start} onPointerMove={paint} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} className="trace-canvas" aria-label={`Draw the ${lower?'small':'capital'} letter ${letter} with your finger or mouse`} role="img"/>
  </div>
  <div className="early-controls"><button type="button" onClick={()=>setGuide(v=>!v)}>{guide?'👀 Hide guide':'👀 Show guide'}</button><button type="button" onClick={reset}>↺ Clear drawing</button></div>
  <p className="early-footnote">{strokes?'🌟 Nice effort! Keep practising the letter shape.':'Use your finger or mouse to follow the letter.'} Drawing is practice only; it is not automatically graded.</p>
 </div>;
}
function OptionGame({question,options,answer,onNext,icon='🌈'}){
 const [selected,setSelected]=useState(null);
 useEffect(()=>setSelected(null),[question,answer]);
 const correct=selected===answer;
 return <div className="early-game">
   <div className="early-game-icon" aria-hidden="true">{icon}</div><h3>{question}</h3>
   <div className="early-answer-grid">{options.map((item,i)=><button type="button" key={i} aria-pressed={selected===item} className={selected===item?(correct?'answer-right':'answer-try'):''} onClick={()=>setSelected(item)}>{item}</button>)}</div>
   {selected!==null&&<div role="status" className={correct?'early-feedback success':'early-feedback'}>{correct?'⭐ Well done! You found it!':'💛 Good try. Look carefully and try again.'}{correct&&<button type="button" onClick={onNext}>Next challenge →</button>}</div>}
 </div>;
}
function SpellWord({entry,onNext}){
 const [chosen,setChosen]=useState([]);
 const word=entry[1];const letters=word.split('');
 const order=[...letters.map((c,i)=>({c,id:i}))].sort((a,b)=>((a.id*7+3)%11)-((b.id*7+3)%11));
 const built=chosen.map(i=>letters[i]).join('');
 const good=built===word;
 return <div className="spell-board">
 <div className="spell-art" aria-hidden="true">{entry[2]}</div><p>Say the word, then put its letters in order.</p>
 <div className="spell-slots" aria-live="polite">{letters.map((_,i)=><span key={i}>{built[i]||'_'}</span>)}</div>
 <div className="spell-tiles">{order.filter(o=>!chosen.includes(o.id)).map(o=><button key={o.id} type="button" onClick={()=>setChosen(s=>[...s,o.id])}>{o.c}</button>)}</div>
 {chosen.length>0&&<div className="early-controls"><button type="button" onClick={()=>setChosen(s=>s.slice(0,-1))}>↶ Undo</button><button type="button" onClick={()=>setChosen([])}>Start over</button></div>}
 {chosen.length===letters.length&&<div role="status" className={good?'early-feedback success':'early-feedback'}>{good?'🎉 You spelled '+word+'!':'Try another order.'}{good&&<button type="button" onClick={()=>{setChosen([]);onNext()}}>Next word →</button>}</div>}
 </div>;
}
export default function PreschoolStudio(){
 const [mode,setMode]=useState('letters'),[index,setIndex]=useState(0),[lower,setLower]=useState(false),[count,setCount]=useState(5),[colorIndex,setColorIndex]=useState(0),[shapeIndex,setShapeIndex]=useState(0);
 const task=getLetterTask(index),word=EARLY_WORDS[index%EARLY_WORDS.length];
 const next=()=>setIndex(i=>i+1),stepLetter=d=>setIndex(i=>(i+26+d)%26);
 return <section className="preschool-studio" aria-label="Preschool interactive learning">
  <header className="preschool-header"><div><span className="mini-label">🐣 PRASEKOLAH • AGES 4–6</span><h1>Little Learners Adventure!</h1><p>Explore letters, words, numbers and colours, one joyful activity at a time.</p></div><span className="preschool-hero-emoji" aria-hidden="true">🦁🎈</span></header>
  <div className="early-mode-grid">{MODES.map(([id,icon,label])=><button key={id} type="button" className={'early-mode '+(mode===id?'selected':'')} aria-pressed={mode===id} onClick={()=>{setMode(id);setIndex(0)}}><span aria-hidden="true">{icon}</span><strong>{label}</strong></button>)}</div>
  <div className="early-content">
   {mode==='letters'&&<><span className="early-kicker">ALPHABET SAFARI • LETTER {index%26+1} / 26</span><div className="letter-hero"><span className="big-letter">{task.letter} <em>{task.lower}</em></span><span className="word-picture" aria-hidden="true">{task.emoji}</span><strong>{task.word}</strong><small>{task.meaning}</small></div><div className="early-controls"><button type="button" onClick={()=>stepLetter(-1)}>← Previous</button><button type="button" onClick={()=>speak(task.letter+', '+task.word)}>🔊 Hear it</button><button type="button" className="primary" onClick={()=>stepLetter(1)}>Next →</button></div><div className="alphabet-strip">{ALPHABET.map((l,i)=><button type="button" key={l} className={i===index%26?'current':''} onClick={()=>setIndex(i)}>{l}</button>)}</div></>}
   {mode==='trace'&&<><span className="early-kicker">LETTER WRITING STUDIO</span><div className="early-controls"><button onClick={()=>setLower(false)} className={!lower?'active':''} type="button">A Capital</button><button onClick={()=>setLower(true)} className={lower?'active':''} type="button">a Small</button><button type="button" onClick={()=>stepLetter(1)}>Next letter →</button></div><h3>Trace {lower?'small':'capital'} {lower?task.lower:task.letter}</h3><DrawingPad letter={task.letter} lower={lower}/><div className="alphabet-strip">{ALPHABET.map((l,i)=><button key={l} type="button" className={i===index%26?'current':''} onClick={()=>setIndex(i)}>{l}</button>)}</div></>}
   {mode==='match'&&<><span className="early-kicker">CAPITAL ↔ SMALL LETTER</span><OptionGame question={index%2===0?`Find the small letter for ${task.letter}`:`Find the CAPITAL letter for ${task.lower}`} options={index%2===0?[task.lower,ALPHABET[(index+3)%26].toLowerCase(),ALPHABET[(index+9)%26].toLowerCase()]:[task.letter,ALPHABET[(index+3)%26],ALPHABET[(index+9)%26]]} answer={index%2===0?task.lower:task.letter} onNext={next} icon="🅰️"/><div className="early-controls"><button type="button" onClick={()=>speak(task.letter)}>🔊 Hear the letter</button></div></>}
   {mode==='spell'&&<><span className="early-kicker">SOUND OUT & BUILD WORDS</span><SpellWord key={index%26} entry={word} onNext={next}/><div className="early-controls"><button type="button" onClick={()=>speak(word[1])}>🔊 Hear the word</button><button type="button" onClick={next}>Skip →</button></div></>}
   {mode==='bm'&&<><span className="early-kicker">SUKU KATA BAHASA MELAYU</span><div className="letter-hero"><span className="big-letter syllable">{BM_SYLLABLES[index%12][0]}</span><span className="word-picture">{BM_SYLLABLES[index%12][2]}</span><strong>{BM_SYLLABLES[index%12][1]}</strong></div><OptionGame question={`Pilih suku kata awal untuk "${BM_SYLLABLES[index%12][1]}"`} options={[BM_SYLLABLES[index%12][0],BM_SYLLABLES[(index+3)%12][0],BM_SYLLABLES[(index+5)%12][0]]} answer={BM_SYLLABLES[index%12][0]} onNext={next} icon="📚"/><button type="button" onClick={()=>speak(BM_SYLLABLES[index%12][1],'ms-MY')}>🔊 Dengar perkataan</button></>}
   {mode==='numbers'&&<><span className="early-kicker">COUNT THE STARS</span><div className="counting-visual" aria-label={`${count} stars`}>{Array.from({length:count},(_,i)=><span key={i}>⭐</span>)}</div><h3>Count them: <strong>{count}</strong></h3><div className="early-controls"><button type="button" onClick={()=>setCount(n=>Math.max(1,n-1))}>− One less</button><button type="button" onClick={()=>speak(String(count))}>🔊 Hear number</button><button type="button" onClick={()=>setCount(n=>Math.min(20,n+1))}>+ One more</button></div><div className="alphabet-strip">{Array.from({length:20},(_,i)=><button key={i} type="button" className={count===i+1?'current':''} onClick={()=>setCount(i+1)}>{i+1}</button>)}</div></>}
   {mode==='colors'&&<><span className="early-kicker">COLOUR LABORATORY</span><div className="color-ball" style={{background:COLORS[colorIndex][1]}} aria-label={COLORS[colorIndex][0]}/><h3>{COLORS[colorIndex][0]}</h3><div className="early-controls">{COLORS.map(([name,value],i)=><button key={name} type="button" style={{borderBottom:`6px solid ${value}`}} className={i===colorIndex?'active':''} onClick={()=>setColorIndex(i)}>{name}</button>)}</div><p>Find something around you with the same colour!</p><div className="preschool-shapes"><span className="early-kicker">🔶 LEARN YOUR SHAPES</span><div className="preschool-shape" role="img" aria-label={SHAPES[shapeIndex][0]}>{SHAPES[shapeIndex][1]}</div><h3>{SHAPES[shapeIndex][0]}</h3><div className="early-controls">{SHAPES.map(([name],i)=><button key={name} type="button" aria-pressed={shapeIndex===i} className={shapeIndex===i?'active':''} onClick={()=>setShapeIndex(i)}>{name}</button>)}</div></div></>}
  </div>
  <p className="early-safety">🌟 Every drawing and answer is practice. Children should learn with guidance and encouragement, not pressure or rankings. Activities are demonstrations, not formal assessments.</p>
 </section>;
}
