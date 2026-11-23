import fs from 'node:fs';import path from 'node:path';
import {LESSONS} from '../src/lessons.js';
import {HERITAGE_LANGUAGE_LESSONS} from '../src/heritageLanguages.js';
import {APP_MODULES} from '../src/moduleRegistry.js';
import {GROWTH_TRACKS} from '../src/growthCurriculum.js';
const dir='dist';const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const jsPath=html.match(/src="(?:\.\/|\/)?(assets\/[^"]+\.js)"/)?.[1];const cssPath=html.match(/href="(?:\.\/|\/)?(assets\/[^"]+\.css)"/)?.[1];
if(!jsPath) throw new Error('JS asset not found');
const inlineIcon = filename => 'data:image/svg+xml;base64,' +
 fs.readFileSync(path.join(dir, 'icons', filename)).toString('base64');
const js=fs.readFileSync(path.join(dir,jsPath),'utf8')
 .replaceAll('./icons/app-icon.svg',inlineIcon('app-icon.svg'))
 .replaceAll('./icons/icon.svg',inlineIcon('icon.svg'))
 .replace(/<\/script/gi,'<\\/script');
const encodedJs=Buffer.from(js,'utf8').toString('base64');
const css=cssPath?fs.readFileSync(path.join(dir,cssPath),'utf8'):'';
const out=`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>BijakLearn Junior</title><style>${css}</style></head><body><div id="root"><p role="status">Opening BijakLearn…</p></div><script src="https://accounts.google.com/gsi/client" async defer></script><script>window.BIJAKLEARN_GOOGLE_CLIENT_ID=<?!= JSON.stringify(clientId) ?>;window.BIJAKLEARN_PORTAL_VERSION=2;window.BIJAKLEARN_LOGIN_ROLE=<?!= JSON.stringify(loginRole) ?>;</script><script type="module">const bytes=Uint8Array.from(atob("${encodedJs}"),c=>c.charCodeAt(0));const bundleUrl=URL.createObjectURL(new Blob([bytes],{type:'text/javascript'}));import(bundleUrl).catch(error=>{console.error('BijakLearn startup failed',error);document.getElementById('root').textContent='BijakLearn could not start. Please reload the page.';}).finally(()=>URL.revokeObjectURL(bundleUrl));</script></body></html>`;
fs.mkdirSync('release',{recursive:true});fs.writeFileSync('release/App.html',out);fs.copyFileSync('apps-script/Code.gs','release/Code.gs');
fs.copyFileSync('apps-script/CurriculumImport.gs','release/CurriculumImport.gs');
fs.copyFileSync('apps-script/AdminOperations.gs','release/AdminOperations.gs');
fs.copyFileSync('apps-script/AccountAccess.gs','release/AccountAccess.gs');
fs.copyFileSync('apps-script/TutorAI.gs','release/TutorAI.gs');
fs.copyFileSync('apps-script/ModuleService.gs','release/ModuleService.gs');
const exportable=LESSONS.map(l=>({id:l.id,year:l.year,school:l.school||'ALL',subject:l.subject,chapter:l.chapter||'',title:l.title,summary:l.summary||'',visual:l.visual||'',icon:l.icon||'📚',status:l.status||'DRAFT_TEACHER_REVIEW',steps:l.steps||[],mind:l.mind||[],check:l.check||[],misconceptions:l.misconceptions||{}}));
const heritageIds=new Set(HERITAGE_LANGUAGE_LESSONS.map(lesson=>lesson.id));
const additions={lessons:exportable.filter(lesson=>heritageIds.has(lesson.id)),modules:APP_MODULES.filter(module=>['picture-dictionary','creative-projects'].includes(module.moduleId))};
fs.writeFileSync('release/PasswordLearningData.gs','const BIJAK_LEARNING_ADDITIONS_ = '+JSON.stringify(additions)+';\n');
fs.writeFileSync('release/CurriculumData.gs',`const BIJAK_CURRICULUM_BUNDLE = ${JSON.stringify(exportable)};\n`);fs.copyFileSync('apps-script/appsscript.json','release/appsscript.json');console.log(`Ready: release/App.html, Code.gs, CurriculumImport.gs, AdminOperations.gs, AccountAccess.gs, AnswerMarking.gs, TutorAI.gs, ModuleService.gs, CurriculumData.gs, appsscript.json (${LESSONS.length} lessons)`);

fs.writeFileSync('release/AnswerMarking.gs',fs.readFileSync('src/answerMarking.js','utf8').replaceAll('export ','').replace(/\b(markPractice|normalizedAnswer|numericValue)\b/g,'$1_'));

for(const name of ['TierAccess','PremiumKasih','StudentAccess','AiGateway','VideoLibrary'])fs.copyFileSync('apps-script/'+name+'.gs','release/'+name+'.gs');
fs.writeFileSync('release/ModuleData.gs','const BIJAK_APP_MODULES = '+JSON.stringify(APP_MODULES)+';\nconst BIJAK_GROWTH_TRACKS = '+JSON.stringify(GROWTH_TRACKS)+';\n');
fs.writeFileSync('release/ModuleAccess.csv',Object.keys(APP_MODULES[0]).join(',')+'\n'+APP_MODULES.map(m=>Object.values(m).map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n')+'\n');


for(const name of ['RolePortals.gs','Transport.html','EducationalVideos.gs','ParentNotices.gs','PasswordAccounts.gs','AccountHttp.gs','PasswordLearningSetup.gs'])fs.copyFileSync('apps-script/'+name,'release/'+name);

fs.copyFileSync('apps-script/Commerce.gs','release/Commerce.gs');
fs.writeFileSync('release/ArithmeticCheck.gs',fs.readFileSync('src/arithmetic.js','utf8').replaceAll('export ','').replace(/\b(arithmeticExpression|calculateExpression)\b/g,'$1_'));

// Complete Sheet-bound maintenance source, with a separate least-privilege manifest.
const sheetDir='release/sheet-bound';fs.mkdirSync(sheetDir,{recursive:true});
for(const name of fs.readdirSync('release').filter(name=>name.endsWith('.gs')||['App.html','Transport.html'].includes(name)))fs.copyFileSync('release/'+name,sheetDir+'/'+name);
for(const name of ['SheetSetup.gs','appsscript.json'])fs.copyFileSync('apps-script/sheet-bound/'+name,sheetDir+'/'+name);
