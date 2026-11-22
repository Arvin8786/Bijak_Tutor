/** Stable IDs shared by route gates and the generated Google Sheets catalogue. */
export const APP_MODULES = [
 ['study-library','Study library','subject',true,3],
 ['preschool','Preschool Studio','preschool',true,0],
 ['learning-packs','Learning Packs','packs',false,0],
 ['learning-map','Learning Map','map',true,0],
 ['learning-paths','Learning Paths','paths',false,0],
 ['practice-lab','Practice Lab','lab',false,0],
 ['discovery','Discovery Library','discovery',true,0],
 ['study-buddy','Study Buddy','tutor',false,0],
 ['science-lab','Science Lab','science-lab',false,0],
 ['maths-studio','Maths Studio','maths-studio',true,0],
 ['practice-arena','Practice Arena','practice',false,0],
 ['word-tiles','Word Tiles vs Bot','wordgame',true,0],
 ['activity-arcade','Activity Playground','arcade',false,0],
 ['junior-ai','Junior Learn AI','growth',true,0],
 ['adult-ai','Adult Learn AI','growth',false,0],
 ['junior-hobby','Junior Creative Hobbies','growth',true,0],
 ['adult-hobby','Adult Creative Hobbies','growth',false,0],
 ['parent-reports','Parent Learning Insights','parent',false,0]
].map(([moduleId,title,route,free,freeLessonLimit])=>({moduleId,title,route,enabled:true,free,premium:true,premiumKasih:true,freeLessonLimit,notes:moduleId==='study-library'?'Free limit per subject, year and stream. 0 denies free lessons.':'Module access; 0 means no additional lesson-count limit.'}));
export function moduleForPage(page,audience='junior',kind='ai'){
 if(page==='growth')return `${audience==='adult'?'adult':'junior'}-${kind==='hobby'?'hobby':'ai'}`;
 if(page==='videos')return 'study-library';
 if(page==='lesson')return 'study-library';
 if(page==='pin')return 'parent-reports';
 return APP_MODULES.find(m=>m.route===page)?.moduleId||null;
}

