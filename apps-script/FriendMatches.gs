/** Short-lived two-player rooms. No chat, names, emails or answers are shared. */
const FRIEND_ROUNDS_ = [
 {letter:'B',choices:[['Bella','Nora','Amir'],['Batu Pahat','Ipoh','Taiping'],['Banana','Mango','Rice'],['Bear','Tiger','Duck']]},
 {letter:'M',choices:[['Mira','Faris','Hana'],['Melaka','Kuantan','Ipoh'],['Mango','Apple','Roti'],['Monkey','Frog','Goat']]},
 {letter:'P',choices:[['Priya','Siti','Daniel'],['Penang','Kuching','Miri'],['Pineapple','Toast','Banana'],['Panda','Rabbit','Cow']]},
 {letter:'S',choices:[['Sofia','Arun','Mira'],['Seremban','Kajang','Klang'],['Sandwich','Noodles','Mango'],['Snake','Bear','Elephant']]}
];
function friendMatch(token,action,payload){
 const user=portalIdentity_(token);
 if(user.role!=='STUDENT'||!user.studentChildId)throw Error('A linked student account is required.');
 const child=requireChild_(user,user.studentChildId);
 const player=String(child.childId);
 if(!['create','join','status','submit'].includes(action))throw Error('Unknown match action.');
 const id=String(payload?.id||'').trim().toUpperCase();
 if(action!=='create'&&!/^M[A-F0-9]{10}$/.test(id))throw Error('Enter the 11-character match ID.');
 const cache=CacheService.getScriptCache();
 function openRoom(){
  const saved=cache.get('friend-match:'+id);
  if(!saved)throw Error('This match expired or could not be found.');
  return JSON.parse(saved);
 }
 function view(room){
  const index=room.players.indexOf(player);
  if(index<0)throw Error('Join this match first.');
  const complete=room.scores.length===2&&room.scores.every(Number.isInteger);
  return {
   id:room.id,joined:room.players.length===2,submitted:Number.isInteger(room.scores[index]),
   completed:complete,score:room.scores[index]??null,friendScore:complete?room.scores[1-index]:null,
   rounds:FRIEND_ROUNDS_.map(({letter,choices})=>({letter,choices:choices.map(words=>[...words].sort())}))
  };
 }
 if(action==='status')return view(openRoom());
 const lock=LockService.getScriptLock();lock.waitLock(5000);
 try{
  let room;
  if(action==='create'){
   const rate='friend-create:'+player;
   if(cache.get(rate))throw Error('Please wait a few seconds before creating another match.');
   cache.put(rate,'1',10);
   const matchId='M'+Utilities.getUuid().replace(/-/g,'').slice(0,10).toUpperCase();
   room={id:matchId,players:[player],scores:[null,null],expires:Date.now()+1800000};
  }else{
   room=openRoom();
   const index=room.players.indexOf(player);
   if(action==='join'){
    if(index>=0)return view(room);
    if(room.players.length===2)throw Error('This match already has two players.');
    room.players.push(player);
   }else{
    if(index<0||room.players.length!==2)throw Error('Wait for your friend to join.');
    if(Number.isInteger(room.scores[index]))return view(room);
    const answers=payload?.answers;
    if(!Array.isArray(answers)||answers.length!==FRIEND_ROUNDS_.length||answers.some(row=>!Array.isArray(row)||row.length!==4||row.some(word=>typeof word!=='string'||word.length>30)))throw Error('Choose an answer for every category.');
    room.scores[index]=FRIEND_ROUNDS_.reduce((score,round,i)=>score+round.choices.filter((words,j)=>words[0]===answers[i][j]).length,0);
   }
  }
  const seconds=Math.ceil((room.expires-Date.now())/1000);
  if(seconds<=0)throw Error('This match has expired.');
  cache.put('friend-match:'+room.id,JSON.stringify(room),seconds);
  return view(room);
 }finally{lock.releaseLock()}
}
