import {useEffect,useState} from 'react';
import FreeBooks from './FreeBooks.jsx';
import FriendMatch from './FriendMatch.jsx';
import WordTilesGame from './WordTilesGame.jsx';
import {games, matchPairs, physicalGames, shuffle} from './freeGames.js';
import './free-library.css';

function Challenge({makeRound}){
 const [round,setRound]=useState(makeRound),[trail,setTrail]=useState([]),[result,setResult]=useState('');
 const [points,setPoints]=useState(0),[show,setShow]=useState(true);
 useEffect(()=>{
  if(round.type!=='memory')return;
  const timer=setTimeout(()=>setShow(false),3000);
  return ()=>clearTimeout(timer);
 },[round]);
 const sequence=Array.isArray(round.answer);
 function choose(value){
  if(result)return;
  const answer=sequence?round.answer[trail.length]:round.answer;
  if(value!==answer){setResult(sequence?'That breaks the sequence. Try this round again.':'Try another answer.');return}
  if(sequence)setTrail([...trail,value]);
  if(!sequence||trail.length+1===round.answer.length){setPoints(points+1);setResult('Correct!')}
 }
 function next(){
  if(result==='Correct!'){setRound(makeRound());setShow(true)}
  setTrail([]);setResult('');
 }
 const memory=round.type==='memory';
 return <div className="free-play">
  <p>Rounds solved: {points}</p><h3>{round.prompt}</h3>
  {memory&&show?<p className="free-sequence">{round.answer.join('  ')}</p>:<>
   {sequence&&<p className="free-sequence" aria-live="polite">{trail.length?trail.join(' → '):'Choose the first item.'}</p>}
   <div className="free-controls">{(round.options||['★','●','▲','◆']).map(value=><button key={value} disabled={Boolean(result)||trail.includes(value)} onClick={()=>choose(value)}>{value}</button>)}</div>
  </>}
  {result&&<><p role="status">{result}</p><button onClick={next}>{result==='Correct!'?'Next round':'Try again'}</button></>}
 </div>;
}
function WordMatch(){
 const [pairs,setPairs]=useState(()=>shuffle(matchPairs).slice(0,4));
 const [targets,setTargets]=useState(()=>shuffle(pairs.map(([,word])=>word)));
 const [selected,setSelected]=useState(''),[matched,setMatched]=useState([]),[message,setMessage]=useState('');
 function refresh(){
  const next=shuffle(matchPairs).slice(0,4);
  setPairs(next);setTargets(shuffle(next.map(([,word])=>word)));setSelected('');setMatched([]);setMessage('');
 }
 function match(word){
  if(pairs.find(([label])=>label===selected)?.[1]!==word){setMessage('Try another English word.');return}
  setMatched([...matched,word]);setSelected('');setMessage(matched.length===3?'All four pairs matched!':'Correct pair.');
 }
 return <div className="free-play"><p>Choose a Malay word, then match its English meaning.</p>
  <div className="free-pair-grid"><div><h3>Malay</h3>{pairs.map(([label,word])=><button key={label} aria-pressed={selected===label} disabled={matched.includes(word)} onClick={()=>setSelected(label)}>{label}</button>)}</div>
   <div><h3>English</h3>{targets.map(word=><button key={word} disabled={!selected||matched.includes(word)} onClick={()=>match(word)}>{word}</button>)}</div></div>
  <p role="status">{message}</p><button onClick={refresh}>New word set</button>
 </div>;
}

const sudokuTemplate=[1,0,0,4,0,4,1,0,2,0,4,0,0,3,0,1];
function newPuzzle(){
 const digits=shuffle([1,2,3,4]);
 return sudokuTemplate.map(value=>value?digits[value-1]:0);
}
function Sudoku(){
 const [initial,setInitial]=useState(newPuzzle),[edits,setEdits]=useState({}),[status,setStatus]=useState('');
 const values=initial.map((digit,i)=>digit||Number(edits[i]||0));
 const groups=[...Array.from({length:4},(_,i)=>values.slice(4*i,4*i+4)),...Array.from({length:4},(_,i)=>values.filter((_,j)=>j%4===i)),...[0,2,8,10].map(i=>[values[i],values[i+1],values[i+4],values[i+5]])];
 function check(){
  if(values.includes(0)){setStatus('Fill every empty square first.');return}
  setStatus(groups.every(group=>new Set(group).size===4)?'Solved!':'A row, column, or marked box repeats a number.');
 }
 return <div className="free-play"><p>Use 1–4 once in every row, column and marked 2 × 2 box.</p>
  <div className="free-sudoku">{initial.map((value,i)=><select key={i} aria-label={`Row ${1+Math.floor(i/4)}, column ${1+i%4}`} disabled={Boolean(value)} value={values[i]} onChange={event=>{setEdits({...edits,[i]:event.target.value});setStatus('')}}>
    <option value="0">·</option>{[1,2,3,4].map(d=><option key={d}>{d}</option>)}</select>)}</div>
  <div className="free-controls"><button onClick={check}>Check puzzle</button><button onClick={()=>{setInitial(newPuzzle());setEdits({});setStatus('')}}>New puzzle</button></div><p role="status">{status}</p>
 </div>;
}

function RobotGrid(){
 const [target,setTarget]=useState(()=>shuffle([3,7,11,14,15])[0]),[moves,setMoves]=useState([]),[position,setPosition]=useState(0),[message,setMessage]=useState('');
 const steps={Up:[0,-1],Down:[0,1],Left:[-1,0],Right:[1,0]};
 function run(){
  let x=0,y=0;
  for(const move of moves){
   const [dx,dy]=steps[move];x+=dx;y+=dy;
   if(x<0||x>3||y<0||y>3){setPosition(0);setMessage('The robot would leave the board. Clear the route and try again.');return}
  }
  setPosition(y*4+x);setMessage(y*4+x===target?'You reached the flag!':`The robot stopped at row ${y+1}, column ${x+1}.`);
 }
 return <div className="free-play"><p>Program a route from the top left to the flag at row {1+Math.floor(target/4)}, column {1+target%4}.</p>
 <div aria-hidden="true" className="free-robot">{Array.from({length:16},(_,i)=><span key={i}>{position===i?'🤖':i===target?'⚑':'·'}</span>)}</div>
 <p aria-live="polite">{moves.join(' → ')||'The route is empty.'}</p><div className="free-controls">
 {Object.keys(steps).map(move=><button disabled={moves.length>=12} key={move} onClick={()=>setMoves([...moves,move])}>{move}</button>)}</div>
 <div className="free-controls"><button disabled={!moves.length} onClick={run}>Run route</button><button onClick={()=>{setMoves([]);setPosition(0);setMessage('')}}>Clear</button><button onClick={()=>{setTarget(shuffle([3,7,11,14,15].filter(i=>i!==target))[0]);setMoves([]);setPosition(0);setMessage('')}}>New target</button></div><p role="status">{message}</p>
 </div>;
}

export default function FreeLibrary({request}){
 const [tab,setTab]=useState('Books'),[active,setActive]=useState(null),[filter,setFilter]=useState('All');
 function switchTab(value){setTab(value);setActive(null)}
 const [id,title,,round]=active||[];
 return <section className="free-library"><header><h1>Free Library</h1><p>Read a book, play a learning game, or find an activity to do together.</p></header>
 <div className="free-controls" aria-label="Library sections">{['Books','Learning games','Physical games'].map(item=><button key={item} aria-pressed={tab===item} onClick={()=>switchTab(item)}>{item}</button>)}</div>
 {tab==='Books'&&<FreeBooks/>}
 {tab==='Physical games'&&<section><h2>Physical game rules</h2><div className="free-grid">{physicalGames.map(([name,rules])=><article key={name}><h3>{name}</h3><p>{rules}</p></article>)}</div></section>}
 {tab==='Learning games'&&(active?<section><button onClick={()=>setActive(null)}>Back to games</button><h2>{title}</h2>
 {id==='pairs'?<WordMatch/>:id==='sudoku'?<Sudoku/>:id==='grid'?<RobotGrid/>:id==='friend'?<FriendMatch request={request}/>:id==='tiles'?<WordTilesGame/>:<Challenge key={id} makeRound={round}/>}
 </section>:<section><h2>{games.length} learning games</h2><label>Skill <select value={filter} onChange={e=>setFilter(e.target.value)}>{['All','Words','Maths','Logic','Science'].map(item=><option key={item}>{item}</option>)}</select></label>
 <div className="free-grid">{games.filter(game=>filter==='All'||game[2]===filter).map(game=><button key={game[0]} onClick={()=>setActive(game)}><strong>{game[1]}</strong><small>{game[2]}</small></button>)}</div></section>)}
 </section>;
}
