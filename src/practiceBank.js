import {GRADED_CHALLENGES} from './gradedChallenges.js';
/** A new practice experience over authored lesson questions, not fabricated exams.
 * Questions are shared with the existing lesson library and remain formative.
 */
export function availablePracticeSubjects(lessons,year,school){
 const groups=new Map();
 for(const lesson of lessons||[]){
  if(Number(lesson.year)!==Number(year)||lesson.school&&lesson.school!=='ALL'&&lesson.school!==school)continue;
  if(!(lesson.check||[]).length)continue;
  groups.set(lesson.subject,(groups.get(lesson.subject)||0)+lesson.check.length);
 }
 for(const q of GRADED_CHALLENGES)if(q.year===Number(year)&&(!q.school||q.school==='ALL'||q.school===school))groups.set(q.subject,(groups.get(q.subject)||0)+1);
 return [...groups].map(([subject,count])=>({subject,count})).sort((a,b)=>a.subject.localeCompare(b.subject));
}
export function questionBank(lessons,year,school,subject='all'){
 const fromLessons=(lessons||[]).filter(l=>Number(l.year)===Number(year)&&(!l.school||l.school==='ALL'||l.school===school)&&(subject==='all'||l.subject===subject))
 .flatMap(l=>(l.check||[]).filter(q=>q&&q.text&&q.answer!==undefined&&['choice','reason','number','text','written'].includes(q.mode))
 .map(q=>({...q,subject:l.subject,lessonTitle:l.title,lessonId:l.id,questionKey:l.id+':'+q.id})));
 const challenges=GRADED_CHALLENGES.filter(q=>q.year===Number(year)&&(!q.school||q.school==='ALL'||q.school===school)&&(subject==='all'||q.subject===subject)).map(q=>({...q,questionKey:q.id,lessonTitle:'Year-level challenge',lessonId:null}));
 return [...fromLessons,...challenges];
}
function stableHash(value){let n=2166136261;for(const ch of String(value)){n^=ch.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0}
export function selectPractice(questions,count=10,seed='session'){
 const shuffled=[...questions].sort((a,b)=>stableHash(seed+a.questionKey)-stableHash(seed+b.questionKey));
 return shuffled.slice(0,Math.max(0,count));
}
export {normalizedAnswer,markPractice} from './answerMarking.js';
export function flashCards(lessons,year,school,subject='all'){
 return (lessons||[]).filter(l=>Number(l.year)===Number(year)&&(!l.school||l.school==='ALL'||l.school===school)&&(subject==='all'||l.subject===subject))
 .map(l=>({id:l.id,front:l.title,back:l.summary,example:l.visual||l.steps?.[0]?.body||'',subject:l.subject})).filter(c=>c.back);
}
