import {useCallback,useEffect,useRef,useState} from 'react';

export function useSheetRefresh(enabled=true){
 const [revision,setRevision]=useState(0);
 const lastRefresh=useRef(0);
 const refresh=useCallback(()=>{
  lastRefresh.current=Date.now();
  setRevision(value=>value+1);
 },[]);
 useEffect(()=>{
  if(!enabled)return;
  const refreshIfVisible=()=>{
   if(document.visibilityState==='visible'&&Date.now()-lastRefresh.current>=1000)refresh();
  };
  const timer=window.setInterval(refreshIfVisible,15000);
  window.addEventListener('focus',refreshIfVisible);
  document.addEventListener('visibilitychange',refreshIfVisible);
  return ()=>{
   window.clearInterval(timer);
   window.removeEventListener('focus',refreshIfVisible);
   document.removeEventListener('visibilitychange',refreshIfVisible);
  };
 },[enabled,refresh]);
 return [revision,refresh];
}
