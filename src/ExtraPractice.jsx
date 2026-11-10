import React,{useEffect,useMemo,useRef,useState} from 'react';
import {DrawingPad} from './PreschoolStudio.jsx';
import SketchStudio from './SketchStudio.jsx';
import {BODY_PARTS,JOBS,WEATHER,LIFE_CYCLES,PHONICS,SYLLABLE_WORDS,SHAPES,CRAFTS,SEQUENCE_PATTERNS,arithmeticChallenge,getPattern,buildWordSearch} from './extendedPracticeData.js';

export const EXTRA_MODES=[
 ['add','➕','Picture addition','Add objects with 3 difficulty levels'],
 ['count','🔢','Count & Compare','Count, order and compare quantities'],
 ['phonics','🔤','Alphabet Sounds','26 letters, sound and picture'],
 ['syllables','🗣️','Suku Kata','24 Malay syllable pairs'],
 ['spell','✏️','Spelling Builder','Build and spell pictured words'],
 ['wordsearch','🔎','Word Search','Find words inside a letter grid'],
 ['life','🐣','Life Cycles','Order stages of living things'],
 ['body','🧍','Body Parts','Learn and identify your body'],
 ['jobs','🧑‍🚒','People at Work','Recognise 16 occupations'],
 ['weather','🌦️','Weather Lab','Identify weather and safety'],
 ['shapes','🔷','Shape Explorer','Identify forms and corners'],
 ['patterns','🧠','Patterns & Logic','Finish number and picture patterns'],
 ['jigsaw','🧩','Picture Puzzle','Put four picture pieces in order'],
 ['craft','🎨','Make & Create','Ten safe step-by-step craft ideas'],
 ['sketch','🖍️','Creative Sketchbook','Draw, review and improve 10 pictures']
];

const itemsFor=(kind)=>kind==='body'?BODY_PARTS:kind==='jobs'?JOBS:kind==='weather'?WEATHER:kind==='shapes'?SHAPES:[];
function say(text,lang='en-GB'){
 if(!('speechSynthesis' in window))return false;
 window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(String(text).slice(0,450));utterance.lang=lang;utterance.rate=.82;window.speechSynthesis.speak(utterance);return true;
}
function QuickOptions({options,expected,onAnswer,answered,label='Choose an answer'}){
 return <div className="extra-answer-grid" role="group" aria-label={label}>{options.map((item,i)=><button type="button" key={i} disabled={answered} className={answered&&String(item)===String(expected)?'correct':''} onClick={()=>onAnswer(item,expected)}>{item}</button>)}</div>;
}
function chooseAlternatives(items,index,field=0){
 const wanted=items[index%items.length][field];
 const other=[wanted];
 for(let offset=1;other.length<3&&offset<items.length;offset++){const w=items[(index+offset*5)%items.length][field];if(!other.includes(w))other.push(w)}
 return other.slice(0,3).sort((a,b)=>String(a).localeCompare(String(b)));
}
function WordSearch({round,onWin}){
 const {terms,grid}=useMemo(()=>buildWordSearch(round),[round]);
 const [selection,setSelection]=useState([]),[found,setFound]=useState([]);
 useEffect(()=>{setSelection([]);setFound([])},[round]);
 const letters=selection.map(([r,c])=>grid[r][c]).join('');
 const mark=(r,c)=>{
  if(found.length===terms.length)return;
  const last=selection[selection.length-1];
  if(last&&!(last[0]===r&&last[1]+1===c)){setSelection([[r,c]]);return}
  const cells=[...selection,[r,c]],value=cells.map(([x,y])=>grid[x][y]).join('');
  if(terms.includes(value)&&!found.includes(value)){
   const next=[...found,value];
   setFound(next);
   setSelection([]);
   if(next.length===terms.length)onWin();
   return;
  }
  if(terms.some(w=>w.startsWith(value)))setSelection(cells);else setSelection([[r,c]]);
 };
 return <><h2>🔎 Weather & Word Search</h2><p>Tap letters <strong>from left to right</strong> in a single row to find each hidden word.</p>
 <div className="extra-word-grid" role="group" aria-label="Word search letters">{grid.map((row,r)=>row.map((letter,c)=><button type="button" key={r+'-'+c} aria-label={`Row ${r+1} column ${c+1} letter ${letter}`} aria-pressed={selection.some(([x,y])=>x===r&&y===c)} className={selection.some(([x,y])=>x===r&&y===c)?'selected':''} onClick={()=>mark(r,c)}>{letter}</button>))}</div>
 <div className="extra-word-bank">{terms.map(word=><span key={word} className={found.includes(word)?'found':''}>{found.includes(word)?'✅ ':''}{word}</span>)}</div><p className="extra-note" role="status">{found.length} of {terms.length} words found {letters&&' · Selecting: '+letters}</p>
 <button type="button" onClick={()=>setSelection([])}>↶ Clear selected letters</button></>;
}
const PUZZLE_EMOJI=['🐬','🦋','🐘','🐠','🌺','🚒','🐢','🦁','🐳','🦉'];
function PicturePuzzle({index,onWin}){
 const picture=PUZZLE_EMOJI[index%PUZZLE_EMOJI.length];
 const shuffle=()=>[2,0,3,1].map(v=>(v+index)%4);
 const [pieces,setPieces]=useState(shuffle),[first,setFirst]=useState(null),[done,setDone]=useState(false);
 useEffect(()=>{setPieces(shuffle());setFirst(null);setDone(false)},[index]);
 const swap=(pos)=>{
  if(done)return;
  if(first===null){setFirst(pos);return}
  if(first===pos){setFirst(null);return}
  const copy=[...pieces];[copy[first],copy[pos]]=[copy[pos],copy[first]];
  setPieces(copy);setFirst(null);
  if(copy.every((p,i)=>p===i)){setDone(true);onWin()}
 };
 return <><h2>🧩 Picture Puzzle</h2><p>Tap one tile, then another tile to swap them. Rebuild the picture.</p>
 <div className="extra-jigsaw" role="group" aria-label="Four picture pieces">{pieces.map((piece,i)=><button key={i} type="button" onClick={()=>swap(i)} aria-pressed={first===i} aria-label={'Piece '+(i+1)} className={first===i?'selected':''}><span className="extra-puzzle-viewport"><span style={{left:piece%2===0?'0%':'-100%',top:piece<2?'0%':'-100%'}}>{picture}</span></span></button>)}</div>
 <p className="extra-note">{done?'🎉 Picture complete!':first===null?'Select two tiles to exchange their places.':'Now tap a different tile to swap.'}</p><button type="button" onClick={()=>{setPieces(shuffle());setFirst(null);setDone(false)}}>↻ Mix pieces</button></>;
}
function SpellingTiles({index,onWin}){
 const entry=PHONICS[index%PHONICS.length],word=entry[1].toUpperCase(),letters=[...word];
 const scrambled=letters.map((letter,i)=>({letter,id:i})).sort((a,b)=>(a.id*11+3)%letters.length-(b.id*11+3)%letters.length);
 const [chosen,setChosen]=useState([]),[feedback,setFeedback]=useState('');
 useEffect(()=>{setChosen([]);setFeedback('')},[index]);
 const built=chosen.map(i=>letters[i]).join('');
 const solved=chosen.length===letters.length&&built===word;
 useEffect(()=>{if(solved){setFeedback('⭐ Correct spelling!');onWin()}else setFeedback(chosen.length===letters.length?'That is not quite right. Undo a letter and try again.':'')},[chosen.length,built]);
 return <><h2>✏️ Spell the word</h2><div className="extra-pictured">{entry[2]}</div><p>Choose the tiles to spell <strong>{entry[1]}</strong> correctly.</p>
 <div className="extra-spell-slots" aria-live="polite">{letters.map((_,i)=><span key={i}>{built[i]||'_'}</span>)}</div>
 <div className="extra-spell-tiles">{scrambled.filter(x=>!chosen.includes(x.id)).map(x=><button key={x.id} disabled={solved} type="button" onClick={()=>setChosen(s=>[...s,x.id])}>{x.letter}</button>)}</div>
 <div className="extra-ctrls"><button type="button" onClick={()=>setChosen(s=>s.slice(0,-1))}>↶ Undo</button><button type="button" onClick={()=>setChosen([])}>↻ Reset</button><button type="button" onClick={()=>say(entry[1])}>🔊 Say it</button></div><p className="extra-note" role="status">{feedback}</p></>;
}
function LifeCycle({index,onWin}){
 const item=LIFE_CYCLES[index%LIFE_CYCLES.length],len=item.steps.length;
 const [placed,setPlaced]=useState([]),[feedback,setFeedback]=useState('');
 useEffect(()=>{setPlaced([]);setFeedback('')},[index]);
 const options=item.steps.map((stage,i)=>({stage,i})).sort((a,b)=>((a.i+index+1)%len)-((b.i+index+1)%len));
 const choose=(stage,i)=>{if(i===placed.length){const next=[...placed,stage];setPlaced(next);setFeedback('✓ Well done — '+stage[0]);if(next.length===len)onWin()}else setFeedback('Look for the stage that comes next in the life cycle.')};
 return <><h2>{item.emoji} Life Cycle: {item.name}</h2><p>Build the life cycle by choosing its stages in the right order.</p><div className="extra-life-steps">{placed.map(([name,emoji],i)=><span key={i}>{emoji}<small>{name}</small></span>)}{placed.length<len&&<span className="waiting">❓<small>Stage {placed.length+1}</small></span>}</div>
 {placed.length<len?<div className="extra-answer-grid">{options.filter(({i})=>i>=placed.length).map(({stage,i})=><button type="button" key={i} onClick={()=>choose(stage,i)}>{stage[1]} {stage[0]}</button>)}</div>:<p className="extra-fact">🌟 {item.fact}</p>}
 <p className="extra-note" role="status">{feedback}</p></>;
}
export default function ExtraPractice({mode,index,level,onStar}){
 const [answered,setAnswered]=useState(null),[detail,setDetail]=useState('');
 const [language,setLanguage]=useState('en');
 const already=useRef('');
 useEffect(()=>{setAnswered(null);setDetail('');already.current=''},[index,mode,level]);
 const award=()=>{const key=mode+'-'+index+'-'+level;if(already.current!==key){already.current=key;onStar()}};
 const respond=(value,expected,explanation='')=>{
  if(answered!==null)return;
  const yes=String(value)===String(expected);
  setAnswered({yes,expected});setDetail(yes?'🌟 Correct! '+explanation:'💛 Good attempt. Correct answer: '+expected+'. '+explanation);
  if(yes)award();
 };
 const number=arithmeticChallenge(index,level);
 const count=1+(index*7+level*3)%([0,9,20,45][level]||9);
 const shape=SHAPES[index%SHAPES.length];
 const pair=mode==='phonics'?PHONICS[index%PHONICS.length]:null;
 const syllable=SYLLABLE_WORDS[index%SYLLABLE_WORDS.length];
 const source=itemsFor(mode),item=source.length?source[index%source.length]:null;
 const answer=mode==='jobs'||mode==='body'||mode==='weather'||mode==='shapes'?item[language==='ms'?1:0]:'';
 const pattern=getPattern(index),craft=CRAFTS[index%CRAFTS.length];
 const options=source.length?chooseAlternatives(source,index,language==='ms'?1:0):[];
 const currentLanguage=language==='ms'?'ms-MY':'en-GB';
 return <div className="extra-practice">
  {['body','jobs','weather','shapes'].includes(mode)&&<div className="extra-language"><label>Word language <select value={language} onChange={e=>{setLanguage(e.target.value);setAnswered(null);setDetail('')}}><option value="en">English</option><option value="ms">Bahasa Melayu</option></select></label></div>}
  {mode==='add'&&<><h2>➕ Picture addition</h2><p>Count both groups, then find the total.</p><div className="extra-picture-numbers"><span>{number.first>20?<strong>🍎 × {number.first}</strong>:Array.from({length:number.first},(_,i)=><b key={i}>🍎</b>)}</span><strong>+</strong><span>{number.second>20?<strong>🍌 × {number.second}</strong>:Array.from({length:number.second},(_,i)=><b key={i}>🍌</b>)}</span></div>
   <div className="extra-expression">{number.first} + {number.second} = ?</div><QuickOptions options={number.options} expected={number.answer} answered={answered!==null} onAnswer={(v,a)=>respond(v,a,`${number.first} plus ${number.second} is ${a}.`)}/></>}
  {mode==='count'&&<><h2>🔢 Count & Compare</h2>
   {index%2===0?<><p>How many stars are there?</p>
    <div className="extra-counting">{Array.from({length:count},(_,i)=><span key={i}>⭐</span>)}</div>
    <QuickOptions options={[count,count+1,count-1].sort((a,b)=>((a+index*3)%5)-((b+index*3)%5))} expected={count} answered={answered!==null} onAnswer={(v,a)=>respond(v,a,'Count one at a time.')}/>
   </>:<><p>Which group has more objects?</p>
    <div className="extra-picture-numbers">
     <span role="img" aria-label={number.first+' stars'}>{number.first>20?<strong>⭐ × {number.first}</strong>:Array.from({length:number.first},(_,i)=><b key={i}>⭐</b>)}</span>
     <span role="img" aria-label={number.second+' flowers'}>{number.second>20?<strong>🌷 × {number.second}</strong>:Array.from({length:number.second},(_,i)=><b key={i}>🌷</b>)}</span>
    </div>
    <QuickOptions options={['Stars','Flowers','Same number']} expected={number.first===number.second?'Same number':number.first>number.second?'Stars':'Flowers'} answered={answered!==null} onAnswer={(v,a)=>respond(v,a,`There are ${number.first} stars and ${number.second} flowers.`)}/>
   </>}
  </>}
  {mode==='phonics'&&<><h2>🔤 Alphabet Sounds</h2><div className="extra-pictured">{pair[2]}</div><p><strong>{pair[1]}</strong> begins with which letter?</p>
   <QuickOptions options={[pair[0],PHONICS[(index+5)%26][0],PHONICS[(index+11)%26][0]].sort()} expected={pair[0]} onAnswer={(v,a)=>respond(v,a,pair[0]+' is the first letter in '+pair[1]+'.')} answered={answered!==null}/>
   <button type="button" onClick={()=>say(pair[1])}>🔊 Listen to {pair[1]}</button><div className="extra-trace"><DrawingPad letter={pair[0]}/></div></>}
  {mode==='syllables'&&<><h2>🗣️ Membaca Suku Kata</h2><div className="extra-pictured">{syllable[3]}</div><p>Lengkapkan perkataan: <strong>{syllable[1]} + ___</strong></p>
   <QuickOptions options={[syllable[2],SYLLABLE_WORDS[(index+5)%SYLLABLE_WORDS.length][2],SYLLABLE_WORDS[(index+11)%SYLLABLE_WORDS.length][2]].filter((x,i,a)=>a.indexOf(x)===i)} expected={syllable[2]} onAnswer={(v,a)=>respond(v,a,syllable[1]+' + '+syllable[2]+' = '+syllable[0])} answered={answered!==null}/>
   <button type="button" onClick={()=>say(syllable[0],'ms-MY')}>🔊 Dengar: {syllable[0]}</button></>}
  {mode==='spell'&&<SpellingTiles key={index} index={index} onWin={award}/>}
  {mode==='wordsearch'&&<WordSearch round={index} onWin={award}/>}
  {mode==='life'&&<LifeCycle index={index} onWin={award}/>}
  {['body','jobs','weather','shapes'].includes(mode)&&<><h2>{mode==='body'?'🧍 Body Parts':mode==='jobs'?'🧑‍🚒 People at Work':mode==='weather'?'🌦️ Weather Lab':'🔷 Shape Explorer'}</h2>
   <div className="extra-pictured">{mode==='shapes'?shape[2]:item[2]}</div>
   <p>Choose the correct {language==='ms'?'Bahasa Melayu':'English'} word.</p>
   <QuickOptions options={options} expected={answer} answered={answered!==null} onAnswer={(v,a)=>respond(v,a,mode==='jobs'?item[3]:mode==='weather'?item[3]:mode==='shapes'?`It has ${shape[3]} corners in this simple classification.`:`In Bahasa Melayu: ${item[1]}.`)}/>
   <button type="button" onClick={()=>say(answer,currentLanguage)}>🔊 Hear the word</button></>}
  {mode==='patterns'&&<><h2>🧠 Complete the Pattern</h2><p>What should come next?</p><div className="extra-pattern">{pattern.shown.map((s,i)=><span key={i}>{s}</span>)}<strong>?</strong></div>
   <div className="extra-answer-grid">{pattern.options.map(v=><button type="button" key={v} disabled={answered!==null} onClick={()=>respond(v,pattern.answer,'Look for the repeating or growing rule.')}>{v}</button>)}</div></>}
  {mode==='jigsaw'&&<PicturePuzzle index={index} onWin={award}/>}
  {mode==='sketch'&&<SketchStudio key={index} index={index} onStar={award}/>}
  {mode==='craft'&&<><h2>{craft[1]} {craft[0]}</h2><p>Follow these original instructions with appropriate adult help.</p><ol className="extra-craft-steps">{craft[2].map((s,i)=><li key={i}>{s}</li>)}</ol><p className="extra-fact">🛡️ {craft[3]}</p>
   <button type="button" onClick={()=>say(craft[2].join('. '))}>🔊 Read the instructions</button><button type="button" onClick={()=>{setAnswered({yes:true});setDetail('🌟 Great effort!');award()}}>{answered?.yes?'✓ Tried this activity':'⭐ I tried this activity'}</button></>}
  {detail&&<div className={'extra-feedback '+(answered?.yes?'success':'review')} role="status" aria-live="polite">{detail}</div>}
  <p className="extra-footer-note">Practice is not a formal examination. Answers and drawings are learning aids, and adults should supervise physical activities.</p>
 </div>;
}