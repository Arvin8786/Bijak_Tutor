import {availableSubjects} from './primarySubjects.js';
import {calculateExpression} from './arithmetic.js';

/** Structural and deterministic checks; never a substitute for educator review. */
export function auditContent(lessons) {
 const errors=[], lessonIds=new Set();
 let questions=0, arithmeticChecked=0, recallQuestions=0;
 for(const lesson of lessons){
  const issue=(message,questionId)=>errors.push({lessonId:lesson.id,questionId,message});
  if(!lesson.id||lessonIds.has(lesson.id))issue('Missing or duplicate lesson ID');
  lessonIds.add(lesson.id);
  for(const key of ['title','summary','steps','mind','check'])if(!lesson[key]?.length)issue('Missing '+key);
  if(!['SK','SJKC','SJKT'].some(s=>(!lesson.school||lesson.school==='ALL'||lesson.school===s)&&availableSubjects(s,lesson.year,{includeOptional:true}).some(x=>x.name===lesson.subject)))issue('Lesson is unreachable in the stream/year subject catalogue');
  const ids=new Set(),prompts=new Set();
  for(const question of lesson.check||[]){
   questions++;
   if(!question.id||ids.has(question.id))issue('Missing or duplicate question ID',question.id);
   ids.add(question.id);
   const prompt=String(question.text||'').normalize('NFKC').trim();
   if(!prompt||prompts.has(prompt))issue('Missing or repeated question prompt',question.id);
   prompts.add(prompt);
   if(question.answer===undefined||question.answer===null||!question.why)issue('Missing answer or explanation',question.id);
   if(!['choice','reason','text','number','written'].includes(question.mode))issue('Unsupported answer mode',question.id);
   if(question.options?.length){
    if(new Set(question.options).size!==question.options.length||!question.options.includes(question.answer))issue('Duplicate choices or correct answer absent',question.id);
   }else if(['choice','reason'].includes(question.mode))issue('Choice question has no choices',question.id);
   if(/-(concept|example|recall|write)$/.test(question.id))recallQuestions++;
   // Only direct expressions can be checked mechanically; contextual questions need review.
   if(/^\s*\d+(?:\.\d+)?\s*[+×÷−-]\s*\d+(?:\.\d+)?\s*=\s*\?\s*$/.test(prompt)){
    const result=calculateExpression(prompt.replace(/=\s*\?\s*$/,'').replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-'));
    arithmeticChecked++;
    if(!result||result.error||Math.abs(result.value-Number(question.answer))>1e-9||!Number.isFinite(Number(question.answer)))issue('Arithmetic answer does not match the expression',question.id);
   }
  }
  if(lesson.activity?.options&&(!lesson.activity.options.includes(lesson.activity.answer)||new Set(lesson.activity.options).size!==lesson.activity.options.length))issue('Quick challenge choices are invalid');
 }
 const missing=[];
 for(const school of ['SK','SJKC','SJKT'])for(let year=1;year<=6;year++)for(const subject of availableSubjects(school,year,{includeOptional:true})){
  if(!lessons.some(l=>l.year===year&&l.subject===subject.name&&(!l.school||l.school==='ALL'||l.school===school)))missing.push({school,year,subject:subject.name});
 }
 return {lessons:lessons.length,questions,arithmeticChecked,recallQuestions,teacherApproved:lessons.filter(l=>l.status==='TEACHER_APPROVED').length,
  errors,missingMaterials:missing,limits:['Language accuracy, age suitability, scientific claims and official standards mapping require qualified educator review.','Recall questions check recognition; their count is not evidence of independent mastery.']};
}
