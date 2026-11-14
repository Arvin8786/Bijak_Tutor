/**
 * Optional local-only DEMO persistence. Never an authentication mechanism,
 * student record system, or evidence of production mastery.
 * Stores pseudonymous test profiles and scoring evidence, not raw answers.
 */
export const DEMO_STORAGE_KEY='bijaklearn:test-progress:v1';
const MAX_CHILDREN=5, MAX_TOPICS=250, MAX_ATTEMPTS=60, MAX_AGE_MS=30*86400000;
const text=v=>String(v??'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,40);
const safeYear=x=>Number.isInteger(Number(x))&&Number(x)>=1&&Number(x)<=6?Number(x):1;
export function sanitizeDemo(data){
 const input=data&&typeof data==='object'?data:{};
 const children=(Array.isArray(input.children)?input.children:[]).filter(c=>c&&typeof c==='object').slice(0,MAX_CHILDREN).map(c=>({
   id:text(c.id),name:text(c.name)||'Demo learner',year:safeYear(c.year),
   school:['SK','SJKC','SJKT'].includes(c.school)?c.school:'SK',
   language:['ms','en','ta','zh'].includes(c.language)?c.language:'ms'
 })).filter(c=>c.id);
 const allowed=new Set(children.map(c=>c.id));
 const attempts={};
 for(const [key,skill] of Object.entries(input.attempts||{}).slice(0,MAX_TOPICS)){
   if(!skill||typeof skill!=='object')continue;
   const id=key.split('/')[0];if(!allowed.has(id)||!/^[\w-]+\/[\w-]+$/.test(key))continue;
   attempts[key]={attempts:(Array.isArray(skill.attempts)?skill.attempts:[]).filter(a=>a&&typeof a==='object').slice(-MAX_ATTEMPTS).map(a=>({
     questionId:text(a.questionId),mode:text(a.mode),correct:a.correct===true,
     hints:Math.max(0,Math.min(10,Number(a.hints)||0)),transfer:a.transfer===true,
     at:typeof a.at==='string'&&Number.isFinite(Date.parse(a.at))?a.at:new Date(0).toISOString()
   })),reviewDue:typeof skill.reviewDue==='string'?skill.reviewDue:null,mastered:false};
 }
 const progress={};
 const lessonId=value=>typeof value==='string'&&/^[\w-]{1,80}$/.test(value);
 const ids=values=>Array.isArray(values)?[...new Set(values.filter(lessonId))].slice(-100):[];
 for(const id of allowed){
  const entry=input.progress?.[id];
  if(!entry)continue;
  progress[id]={
   lastLesson:lessonId(entry.lastLesson)?entry.lastLesson:null,
   activities:ids(entry.activities),
   quizzes:ids(entry.quizzes),
  };
 }
 return {children,attempts,progress,savedAt:Date.now()};
}
export function loadDemo(storage,now=Date.now()){
 const empty={children:[],attempts:{},progress:{},savedAt:now};
 try{const data=JSON.parse((storage??globalThis.localStorage).getItem(DEMO_STORAGE_KEY)||'null');if(!data||!data.savedAt||now-data.savedAt>MAX_AGE_MS||data.savedAt>now+60000)return empty;return sanitizeDemo(data)}catch{return empty}
}
export function saveDemo(children,attempts,storage,progress={}){
 try{const data=sanitizeDemo({children,attempts,progress});(storage??globalThis.localStorage).setItem(DEMO_STORAGE_KEY,JSON.stringify(data));return true}catch{return false}
}
export function clearDemo(storage){try{(storage??globalThis.localStorage).removeItem(DEMO_STORAGE_KEY);return true}catch{return false}}
