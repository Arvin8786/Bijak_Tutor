// Daily streak and star count, kept only on this device (no account, no personal data).
export const STREAK_KEY='bijaklearn:streak:v1';
export const EMPTY_STREAK=Object.freeze({streak:0,best:0,last:'',stars:0});

export const dayKey=(date=new Date())=>{
 const pad=n=>String(n).padStart(2,'0');
 return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate());
};
const dayNumber=key=>{const [y,m,d]=key.split('-').map(Number);return Math.round(Date.UTC(y,m-1,d)/86400000)};

// Pure: returns the new state after learning something on `today` and earning `stars`.
export function applyActivity(state,today,stars=0){
 const current={...EMPTY_STREAK,...state};
 let streak=current.streak;
 if(current.last!==today){
  streak=current.last&&dayNumber(today)-dayNumber(current.last)===1?current.streak+1:1;
 }
 return {streak,best:Math.max(current.best,streak),last:today,stars:Math.max(0,current.stars+Math.max(0,Math.floor(stars)))};
}

export function readStreak(storage=typeof window!=='undefined'?window.localStorage:null){
 try{
  const value=JSON.parse(storage?.getItem(STREAK_KEY)||'null');
  if(value&&Number.isFinite(value.streak)&&Number.isFinite(value.stars))return {...EMPTY_STREAK,...value};
 }catch{}
 return {...EMPTY_STREAK};
}

export function recordActivity(stars=0,{storage=typeof window!=='undefined'?window.localStorage:null,date=new Date()}={}){
 const next=applyActivity(readStreak(storage),dayKey(date),stars);
 try{storage?.setItem(STREAK_KEY,JSON.stringify(next))}catch{}
 try{if(typeof window!=='undefined')window.dispatchEvent(new Event('bijak-streak'))}catch{}
 return next;
}

// A streak is only "alive" if the last activity was today or yesterday.
export function liveStreak(state,date=new Date()){
 if(!state.last)return 0;
 const gap=dayNumber(dayKey(date))-dayNumber(state.last);
 return gap<=1?state.streak:0;
}
