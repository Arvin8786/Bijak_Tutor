/**
 * Privacy-respecting learning-time telemetry (device-local preview).
 * No webcam, microphone, location, app spying, or reliable force-close detection.
 * Enabled only after an authorised parent opts in, with a visible student notice.
 * Session data: 30-day retention, summed active seconds capped between ticks.
 */
export const TRACK_CONSENT='bijaklearn:time-report:consent:v1';
export const TRACK_DATA='bijaklearn:time-report:daily:v1';
export const IDLE_LIMIT_MS=90000;
export const MAX_TICK_MS=20000;
export const KEEP_DAYS=30;
const safeStore=()=>typeof localStorage==='undefined'?null:localStorage;
export function trackingEnabled(){try{return safeStore()?.getItem(TRACK_CONSENT)==='yes'}catch{return false}}
export function setTrackingEnabled(enabled){
 try{if(enabled)safeStore()?.setItem(TRACK_CONSENT,'yes');else safeStore()?.removeItem(TRACK_CONSENT)}catch{}
}
export function readUsage(){
 try{const x=JSON.parse(safeStore()?.getItem(TRACK_DATA)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}
}
export function wipeUsage(){try{safeStore()?.removeItem(TRACK_DATA)}catch{}}
const day=timestamp=>new Date(timestamp).toISOString().slice(0,10);
function isSafeId(id){return /^[a-zA-Z0-9_-]{1,70}$/.test(String(id||''))}
export function addUsageSlice(store,{childId,at,seconds,activity,event='active'}){
 if(!isSafeId(childId)||!Number.isFinite(at))return store;
 const date=day(at),previous=store[childId]||{},bucket=previous[date]||{seconds:0,activities:{},lastSeen:null,interruptionCount:0};
 const duration=Math.min(20,Math.max(0,Number(seconds)||0));
 const key=String(activity||'learning').slice(0,50);
 const validEvent=['active','background','foreground','pause'].includes(event)?event:'active';
 const next={...bucket,seconds:bucket.seconds+duration,activities:{...bucket.activities,[key]:(bucket.activities[key]||0)+duration},lastSeen:new Date(at).toISOString(),lastEvent:validEvent,interruptionCount:bucket.interruptionCount+(validEvent==='background'?1:0)};
 const cutoff=day(at-KEEP_DAYS*86400000);
 return {...store,[childId]:Object.fromEntries(Object.entries({...previous,[date]:next}).filter(([dateKey])=>dateKey>=cutoff))};
}
export function recordUsage(payload){
 const before=readUsage(),updated=addUsageSlice(before,payload);
 try{safeStore()?.setItem(TRACK_DATA,JSON.stringify(updated))}catch{}
 return updated;
}
export function summariseUsage(childId,store=readUsage(),now=Date.now()){
 const days=Object.entries(store[childId]||{}).filter(([date])=>date>=day(now-7*86400000)).sort((a,b)=>b[0].localeCompare(a[0]));
 const all=Object.entries(store[childId]||{}).sort((a,b)=>b[0].localeCompare(a[0]));
 const seconds7=days.reduce((sum,[,row])=>sum+Number(row.seconds||0),0);
 const last=all[0]?.[1];
 return {seconds7:Math.round(seconds7),minutes7:Math.round(seconds7/60),activeDays:days.filter(([,row])=>row.seconds>0).length,
  lastSeen:last?.lastSeen||null,lastEvent:last?.lastEvent||null,backgroundEvents7:days.reduce((sum,[,row])=>sum+(row.interruptionCount||0),0),
  days:days.map(([date,row])=>({date,seconds:Math.round(row.seconds||0),activities:row.activities||{},backgroundEvents:row.interruptionCount||0})),
  note:'Presence and activity estimates are not proof of attention, dishonesty or intentional app closure.'};
}
