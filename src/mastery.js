/** Deterministic, conservative skill evidence. This is advisory in a demo, never certified. */
export const TARGET_INDEPENDENT=3;
export function initialSkill(){return {attempts:[],mastered:false,reviewDue:null}}
const isIndependent=a=>a?.correct===true&&Number(a.hints)===0&&['number','text','written'].includes(a.mode)&&!!a.questionId;
/** Multiple-choice explanations (mode='reason' with options) are NOT independent. */
export function evaluateSkill(skill,now=Date.now()){
 const attempts=skill?.attempts||[];
 const independent=attempts.filter(isIndependent);
 const uniqueIds=new Set(independent.map(a=>a.questionId));
 const modes=new Set(independent.map(a=>a.mode));
 const recent=attempts.slice(-3);
 const stable=recent.length===3&&recent.every(isIndependent)&&new Set(recent.map(a=>a.questionId)).size===3;
 const transfer=independent.some(a=>a.transfer===true);
 // Number + free text is preferred; otherwise distinct independent tasks still matter.
 const mastered=uniqueIds.size>=TARGET_INDEPENDENT&&stable&&transfer;
 return {mastered,independent:uniqueIds.size,formats:modes.size,transfer,needsReview:!!skill.reviewDue&&Date.parse(skill.reviewDue)<=now,
 reason:mastered?'Independent responses passed in distinct fresh tasks; review later':!transfer?'Try an unfamiliar real-life situation without help':uniqueIds.size<3?'Complete more different questions without hints':!stable?'Recent answers need more independent practice':'Keep practising'};
}
export function recordAttempt(skill,attempt,now=Date.now()){
 const prev=skill||initialSkill();
 const sanitized={questionId:String(attempt.questionId||''),mode:String(attempt.mode||''),correct:attempt.correct===true,hints:Math.max(0,Math.min(10,Number(attempt.hints)||0)),transfer:attempt.transfer===true,at:new Date(now).toISOString()};
 const updated={...prev,attempts:[...(prev.attempts||[]),sanitized].slice(-60)};
 const report=evaluateSkill(updated,now);updated.mastered=report.mastered;
 if(report.mastered&&!prev.mastered)updated.reviewDue=new Date(now+86400000).toISOString();
 return updated;
}
export function evidenceReport(skills){
 const entries=Object.values(skills||{});
 const mastered=entries.filter(s=>evaluateSkill(s).mastered).length;
 const attempts=entries.flatMap(s=>s.attempts||[]);
 const independent=attempts.filter(isIndependent).length;
 return {mastered,practised:entries.length,attempts:attempts.length,independent,errorCount:attempts.filter(a=>!a.correct).length,reviewed:entries.filter(s=>s.reviewDue).length};
}
export function nextReviewDays(successes){return [1,3,7,14,30][Math.min(Math.max(Math.trunc(Number(successes)||0),0),4)]}
