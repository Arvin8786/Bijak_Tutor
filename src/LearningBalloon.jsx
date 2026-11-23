import React,{useEffect,useState,useRef} from 'react';
const words=[
 ['Observe','Look closely to notice details.'],['Drift','Move slowly with the wind or water.'],
 ['Estimate','Make a thoughtful guess about an amount.'],['Canopy','The leafy roof formed by trees.'],
 ['Reflect','Think back on something you did or learned.'],['Resilient','Able to recover after a difficulty.'],
 ['Navigate','Find a route from one place to another.'],['Habitat','The natural home of a living thing.']
];
export default function LearningBalloon({request}){
 const [offer,setOffer]=useState(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const mounted=useRef(true),sending=useRef(false);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 useEffect(()=>{
  if(offer||message)return;
  const timer=setTimeout(()=>{
   if(document.visibilityState==='visible')setOffer(crypto.randomUUID());
   else setMessage('hidden');
  },45000+Math.random()*120000);
  return()=>clearTimeout(timer);
 },[offer,message]);
 useEffect(()=>{
  if(message==='hidden'){const wake=()=>{if(!document.hidden)setMessage('')};document.addEventListener('visibilitychange',wake);wake();return()=>document.removeEventListener('visibilitychange',wake)}
  if(!message)return;
  const timer=setTimeout(()=>setMessage(''),12000);return()=>clearTimeout(timer);
 },[message]);
 async function pop(){
  if(sending.current)return;
  sending.current=true;setBusy(true);
  try{
   const result=request?await request('claimLearningBalloon',offer):{points:0};
   if(!mounted.current)return;
   const [word,meaning]=words[Math.floor(Math.random()*words.length)];
   setMessage(result.points>0?'You earned '+result.points+' learning point'+(result.points===1?'!':'s!'):word+' · '+meaning);
   setOffer(null);
  }catch{if(mounted.current)setMessage('Could not open this balloon. Tap to retry.')}
  finally{sending.current=false;if(mounted.current)setBusy(false)}
 }
 return <aside className="balloon-dock" aria-label="Learning balloon">
  {offer&&<button className="learning-balloon" disabled={busy} aria-label="Pop the learning balloon" onClick={pop}><span aria-hidden="true">✦</span></button>}
  {message&&message!=='hidden'&&<div className="balloon-pop" role="status">{message}<button aria-label="Dismiss balloon message" onClick={()=>setMessage('')}>×</button></div>}
 </aside>;
}
