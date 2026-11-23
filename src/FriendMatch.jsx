import {useState} from 'react';

const categories=['Name','Place','Food','Animal'];
export default function FriendMatch({request}){
 const [id,setId]=useState(''),[room,setRoom]=useState(null),[answers,setAnswers]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function play(action){
  setError('');setBusy(true);
  try{
   const next=await request('friendMatch',action,{id:room?.id||id,...(action==='submit'?{answers}:{})});
   if(!room)setAnswers(next.rounds.map(()=>Array(4).fill('')));
   setRoom(next);
  }catch(error){
   setError(error.message==='Unsupported account request'?'Online matches are awaiting the account service update. Other library games are available.':error.message);
  }finally{setBusy(false)}
 }
 function choose(round,category,value){
  setAnswers(previous=>previous.map((row,i)=>i===round?row.map((word,j)=>j===category?value:word):row));
 }
 if(!request)return <p>Sign in with a linked student account to play against a friend.</p>;
 return <div className="free-play"><p>Invite one friend using a private match ID. Each round has a letter. Pick a matching name, place, food and animal.</p>
 {!room?<><button disabled={busy} onClick={()=>play('create')}>Create match</button>
 <form className="free-controls" onSubmit={e=>{e.preventDefault();play('join')}}>
 <label>Friend’s match ID <input value={id} maxLength={11} autoCapitalize="characters" onChange={e=>setId(e.target.value)}/></label>
 <button disabled={busy||id.trim().length!==11}>Join match</button></form></>:<>
 <p>Match ID <strong>{room.id}</strong> · expires 30 minutes after creation</p>
 {room.completed?<p role="status">Your score: {room.score} / 16. Friend’s score: {room.friendScore} / 16. {room.score===room.friendScore?'Draw!':room.score>room.friendScore?'You win!':'Your friend wins!'}</p>
 :!room.joined||room.submitted?<p role="status">{room.joined?'Waiting for your friend to finish.':'Share the match ID with your friend, then check for updates.'}</p>
 :<form className="free-match-form" onSubmit={e=>{e.preventDefault();play('submit')}}>{room.rounds.map(({letter,choices},i)=><fieldset key={letter}><legend>Round {i+1} · {letter}</legend>
 {choices.map((words,j)=><label key={categories[j]}>{categories[j]} <select required value={answers[i]?.[j]||''} onChange={e=>choose(i,j,e.target.value)}>
 <option value="">Choose an answer</option>{words.map(word=><option key={word}>{word}</option>)}</select></label>)}</fieldset>)}<button disabled={busy}>Submit answers</button></form>}
 <div className="free-controls">{!room.completed&&<button disabled={busy} onClick={()=>play('status')}>Check for updates</button>}
 <button disabled={busy} onClick={()=>{setRoom(null);setId('');setError('')}}>Back to match lobby</button></div></>}
 {busy&&<p role="status">Contacting the match service…</p>}{error&&<p role="alert">{error}</p>}
 </div>;
}
