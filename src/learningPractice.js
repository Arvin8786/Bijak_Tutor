/**
 * Expand foundational draft quizzes with additional, varied reading tasks.
 * These prompts are for formative practice only, not verified mastery.
 * Every generated option comes from a concrete lesson's authored text.
 */
function rotate(list,seed){if(!list.length)return [];const n=seed%list.length;return [...list.slice(n),...list.slice(0,n)]}
export function enrichPractice(lessons){
 return lessons.map((lesson,index)=>{
  const pool=lessons.filter(other=>other.subject===lesson.subject&&other.year===lesson.year&&other.id!==lesson.id);
  const distractors=rotate(pool,index).slice(0,2);
  const optionsWith=(correct,wrong)=>rotate([correct,...wrong],index+1);
  const first=lesson.check[0];
  const extra=[
   {id:lesson.id+'-concept',mode:'choice',text:'Which explanation belongs to this lesson: '+lesson.title+'?',options:optionsWith(lesson.summary,distractors.map(l=>l.summary)),answer:lesson.summary,why:lesson.summary},
   {id:lesson.id+'-example',mode:'choice',text:'Choose an example of: '+lesson.title,options:optionsWith(lesson.visual,distractors.map(l=>l.visual)),answer:lesson.visual,why:lesson.visual},
   {id:lesson.id+'-recall',mode:'choice',text:'Which lesson title matches this explanation? '+lesson.summary,options:optionsWith(lesson.title,distractors.map(l=>l.title)),answer:lesson.title,why:lesson.title+' — '+lesson.summary},
   {id:lesson.id+'-write',mode:'text',text:'Write the key answer from the first activity: '+first.text,answer:first.answer,why:'Compare your response with the worked example. '+first.why}
  ];
  if(distractors.length<2) return {...lesson,check:[...lesson.check,extra[3]]};
  return {...lesson,check:[...lesson.check,...extra]};
 })
}
