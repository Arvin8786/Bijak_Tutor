/** Explainable, deterministic skill mastery; never let the language model award progression. */
export const TARGET_INDEPENDENT = 3;
export function initialSkill() {return {attempts:[],mastered:false,reviewDue:null};}
export function evaluateSkill(skill, now=Date.now()) {
 const attempts=skill.attempts||[];
 const independent=attempts.filter(a=>a.correct&&a.hints===0&&a.mode!=='choice');
 const modes=new Set(independent.map(a=>a.mode));
 const latest=attempts.slice(-4);
 const stable=latest.length>=3 && latest.slice(-3).every(a=>a.correct&&a.hints===0);
 const transfer=independent.some(a=>a.transfer);
 const mastered=independent.length>=TARGET_INDEPENDENT && modes.size>=2 && stable && transfer;
 return {mastered,independent:independent.length,formats:modes.size,transfer,needsReview:!!skill.reviewDue&&Date.parse(skill.reviewDue)<=now,reason:mastered?'Verified with independent answers in varied formats, including transfer':!transfer?'Try a new real-life situation without hints':modes.size<2?'Show the idea in another way':!stable?'Practise consistently without hints':'One more independent explanation or demonstration'};
}
export function recordAttempt(skill,attempt,now=Date.now()){
 const newSkill={...skill,attempts:[...(skill.attempts||[]),{...attempt,at:new Date(now).toISOString()}].slice(-60)};
 const report=evaluateSkill(newSkill,now);
 newSkill.mastered=report.mastered;
 if(report.mastered&&!skill.mastered)newSkill.reviewDue=new Date(now+24*60*60*1000).toISOString();
 return newSkill;
}
export function evidenceReport(skills){
 const entries=Object.values(skills||{}); const mastered=entries.filter(s=>evaluateSkill(s).mastered).length;
 const attempts=entries.flatMap(s=>s.attempts||[]); const independent=attempts.filter(a=>a.correct&&a.hints===0&&a.mode!=='choice').length;
 const errorCount=attempts.filter(a=>!a.correct).length;
 const reviewed=entries.filter(s=>s.reviewDue).length;
 return {mastered,practised:entries.length,attempts:attempts.length,independent,errorCount,reviewed};
}
export function nextReviewDays(successes){return [1,3,7,14,30][Math.min(Math.max(successes,0),4)];}