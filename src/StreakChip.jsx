import React,{useEffect,useState} from 'react';
import {say} from './localization.js';
import {readStreak,liveStreak} from './dailyStreak.js';

// Shows the daily streak and stars kept on this device. Updates when any activity records progress.
export default function StreakChip({language}){
 const [state,setState]=useState(()=>readStreak());
 useEffect(()=>{
  const refresh=()=>setState(readStreak());
  window.addEventListener('bijak-streak',refresh);window.addEventListener('storage',refresh);
  return()=>{window.removeEventListener('bijak-streak',refresh);window.removeEventListener('storage',refresh)};
 },[]);
 const days=liveStreak(state);
 return <span className={'streak-chip'+(days>0?' on':'')} role="status" title={say(language,days>0?'streakDays':'streakStart',{n:days})}>
  <span aria-hidden="true">{days>0?'🔥':'🌱'}</span> <span>{days>0?say(language,'streakDays',{n:days}):say(language,'streakStart')}</span>
  {state.stars>0&&<span className="chip-stars"><span aria-hidden="true">⭐</span> {state.stars}</span>}
 </span>;
}
