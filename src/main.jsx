import React,{useEffect,useRef,useState} from 'react';
import {TRACK_CONSENT,trackingEnabled,setTrackingEnabled,readUsage,wipeUsage,recordUsage,summariseUsage,IDLE_LIMIT_MS,MAX_TICK_MS} from './learningTime.js';
import {createRoot} from 'react-dom/client';
import {LESSONS} from './lessons';
import {availableSubjects,lessonCountForSubject} from './primarySubjects.js';
import {SKILL_CATALOG,CURRICULUM_INFO} from './skillCatalog';
import {initialSkill,recordAttempt,evaluateSkill} from './mastery';
import './style.css';
import './engagement.css';
import LearningVisuals from './LearningVisuals.jsx';
import PreschoolStudio from './PreschoolStudio.jsx';
import './preschool.css';
import './layout-fixes.css';
import {loadDemo,saveDemo,clearDemo} from './demoStore.js';
import AdventurePacks from './AdventurePacks.jsx';
import './adventure.css';
import StudyBuddy from './StudyBuddy.jsx';
import './mobile-tutor.css';
import WelcomeGate,{MascotFriends} from './WelcomeGate.jsx';
import PracticeArena from './PracticeArena.jsx';
import {readLocale,writeLocale,say,LANGUAGES} from './localization.js';
import './welcome.css';
import './practice.css';
import GrowthHub from './GrowthHub.jsx';
import './growth.css';
import WordTilesGame from './WordTilesGame.jsx';
import './word-tiles.css';
import ActivityArcade from './ActivityArcade.jsx';
import LearningMission from './LearningMission.jsx';
import './learning-mission.css';
import './activity-arcade.css';
const isLive=!!window.google?.script?.run;
const langLabels={ms:'Bahasa Melayu',en:'English',ta:'தமிழ்',zh:'中文'};
const DEMO_SAVE_CONSENT='bijaklearn:demo-save-consent';
const savedDemo=()=>{try{return localStorage.getItem(DEMO_SAVE_CONSENT)==='yes'}catch{return false}};
const initialDemo=savedDemo()?loadDemo():{children:[],attempts:{}};
let mockChildren=initialDemo.children,mockAttempts=initialDemo.attempts,mockPin='';
const persistDemo=()=>{if(savedDemo())saveDemo(mockChildren,mockAttempts)};
const fakeUser={name:'Guest',email:''};
const fakeLessons=LESSONS.map(l=>({id:l.id,year:l.year,title:l.title,subject:l.subject,school:l.school||'ALL',icon:l.icon,chapter:l.chapter||'Foundational skills',status:l.status||'DRAFT_TEACHER_REVIEW',premium:false}));
async function localCall(method,args){
 if(method==='getBootstrap')return {parent:fakeUser,children:mockChildren,access:{active:false,plan:'FREE'},lessons:fakeLessons,scholarship:null};
 if(method==='addChild'){const [_,d]=args;const c={id:'demo-'+Date.now(),name:d.name,year:d.year,school:d.school,language:d.language};mockChildren.push(c);persistDemo();return c;}
 if(method==='getLesson'){const l=LESSONS.find(x=>x.id===args[2]);if(!l)throw Error('Lesson not found');return {...l,questions:l.check.map(q=>({id:q.id,mode:q.mode,text:q.text,options:q.options||[],transfer:!!q.transfer}))};}
 if(method==='submitAttempt'){const [_,childId,lessonId,questionId,answer,hints]=args;const l=LESSONS.find(x=>x.id===lessonId),q=l.check.find(x=>x.id===questionId);const correct=String(answer).trim().toLowerCase()===String(q.answer).toLowerCase();const key=childId+'/'+lessonId;mockAttempts[key]=recordAttempt(mockAttempts[key]||initialSkill(),{questionId:q.id,mode:q.mode,correct,hints,transfer:!!q.transfer});persistDemo();return {correct,feedback:correct?q.why:(l.misconceptions?.[answer]||'Try looking at a simpler example.'),mastery:evaluateSkill(mockAttempts[key])};}
 if(method==='setParentPin'){mockPin=args[1];return {ok:true}}
 if(method==='getParentReport'){if(args[2]!==mockPin)throw Error('Incorrect parent PIN');const childId=args[1];const skills=Object.entries(mockAttempts).filter(([k])=>k.startsWith(childId+'/'));const attempts=skills.flatMap(([,s])=>s.attempts);return {attempts:attempts.length,errors:attempts.filter(a=>!a.correct).length,independent:attempts.filter(a=>a.correct&&!a.hints&&a.mode!=='choice').length,mastered:skills.filter(([,s])=>evaluateSkill(s).mastered).length,topics:skills.map(([k,s])=>({lessonId:k.split('/')[1],...evaluateSkill(s)})),recent:attempts.slice(-20)};}
 if(method==='requestScholarship')return {status:'PENDING'};
 throw Error('Unsupported demo operation: '+method)
}
function api(method,...args){if(!isLive)return localCall(method,args);return new Promise((resolve,reject)=>window.google.script.run.withSuccessHandler(resolve).withFailureHandler(e=>reject(new Error(e.message||String(e))))[method](...args));}
function GoogleLogin({onToken}){const [issue,setIssue]=useState('');useEffect(()=>{if(!isLive)return;let tries=0;const timer=setInterval(()=>{const id=window.BIJAKLEARN_GOOGLE_CLIENT_ID;if(window.google?.accounts?.id&&id){clearInterval(timer);try{window.google.accounts.id.initialize({client_id:id,callback:res=>onToken(res.credential),ux_mode:'popup'});window.google.accounts.id.renderButton(document.getElementById('google-signin'),{theme:'outline',size:'large',shape:'pill',text:'signin_with',width:260});}catch(e){setIssue(e.message)}}else if(++tries>80){clearInterval(timer);setIssue('Google sign-in could not load on this browser.')}} ,250);return()=>clearInterval(timer)},[onToken]);return <section className="signin"><div className="mascot">🦁</div><h1>Welcome to BijakLearn Junior</h1><p>Parents sign in securely before managing their children’s learning.</p>{isLive?<div id="google-signin"/>:<button className="primary" onClick={()=>onToken('DEMO')}>Explore learning</button>}{issue&&<p className="error">{issue}</p>}<small>{isLive?'Google account required for parent access.':'Use a fictional nickname for optional practice on this device.'}</small></section>}
function PwaControls(){
 const [online,setOnline]=useState(navigator.onLine);
 const [installEvent,setInstallEvent]=useState(null);
 const [standalone,setStandalone]=useState(window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true);
 const [showHelp,setShowHelp]=useState(false);
 const [updateReady,setUpdateReady]=useState(false);
 const reloaded=useRef(false);
 useEffect(()=>{
  const onOnline=()=>{setOnline(true);checkRelease()};
  const onOffline=()=>setOnline(false);
  const onInstall=e=>{e.preventDefault();setInstallEvent(e)};
  const onInstalled=()=>{setInstallEvent(null);setStandalone(true)};
  const release=__BIJAK_RELEASE__;
  let alive=true;
  async function checkRelease(){
   if(isLive||!navigator.onLine)return;
   try{
    const url=`${import.meta.env.BASE_URL}release.json?check=${Date.now()}`;
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok)return;
    const data=await response.json();
    if(data.version&&data.version!==release&&alive){
      setUpdateReady(true);
      navigator.serviceWorker?.getRegistration().then(reg=>reg?.update()).catch(()=>{});
      const key='bijaklearn:last-reload:'+data.version;
      if(!reloaded.current&&sessionStorage.getItem(key)!=='yes'){
       reloaded.current=true;
       sessionStorage.setItem(key,'yes');
       window.location.reload();
      }
    }
   }catch{ /* Offline release checks must never block studying. */ }
  }
  const onVisible=()=>{if(document.visibilityState==='visible')checkRelease()};
  const hadController=Boolean(navigator.serviceWorker?.controller);
  const onControllerChange=()=>{
   if(hadController&&!reloaded.current){
    reloaded.current=true;window.location.reload();
   }
  };
  const onWorkerMessage=e=>{
   if(e.data?.type==='BIJAK_RELEASE_ACTIVATED'&&e.data.version!=='bijaklearn-static-'+release)setUpdateReady(true);
  };
  window.addEventListener('online',onOnline);
  window.addEventListener('offline',onOffline);
  window.addEventListener('focus',checkRelease);
  window.addEventListener('beforeinstallprompt',onInstall);
  window.addEventListener('appinstalled',onInstalled);
  document.addEventListener('visibilitychange',onVisible);
  navigator.serviceWorker?.addEventListener('controllerchange',onControllerChange);
  navigator.serviceWorker?.addEventListener('message',onWorkerMessage);
  let tick;
  if(!isLive){
   checkRelease();
   tick=window.setInterval(checkRelease,60000);
   if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{updateViaCache:'none'}).then(reg=>reg.update()).catch(err=>console.warn('PWA offline cache unavailable:',err));
   }
  }
  return ()=>{
   alive=false;window.clearInterval(tick);
   window.removeEventListener('online',onOnline);window.removeEventListener('offline',onOffline);
   window.removeEventListener('focus',checkRelease);
   window.removeEventListener('beforeinstallprompt',onInstall);window.removeEventListener('appinstalled',onInstalled);
   document.removeEventListener('visibilitychange',onVisible);
   navigator.serviceWorker?.removeEventListener('controllerchange',onControllerChange);
   navigator.serviceWorker?.removeEventListener('message',onWorkerMessage);
  };
 },[]);
 const install=async()=>{
  if(installEvent){await installEvent.prompt();setInstallEvent(null);return}
  setShowHelp(v=>!v);
 };
 return <div className="pwa-controls" aria-label="App installation and connectivity">
  <span className={'connection '+(online?'connected':'disconnected')} role="status">{online?'● Online':'● Offline: some activities may be unavailable'}</span>
  {!isLive&&!standalone&&<button type="button" className="install-button" onClick={install}>📲 Install app</button>}
  {updateReady&&<span className="pwa-update" role="status">✨ A newer version is available. <button type="button" onClick={()=>window.location.reload()}>Update now</button></span>}
  {showHelp&&<p className="install-help">On iPhone: open this website in Safari, tap Share → Add to Home Screen. On Android: open Chrome's menu → Install app or Add to Home Screen.</p>}
  {!online&&<p className="install-help">Public files may work offline. Private accounts and live assessments require internet.</p>}
 </div>;
}
function App(){
 const [uiLanguage,setUiLanguage]=useState(()=>readLocale()||'ms');
 const [welcomeDone,setWelcomeDone]=useState(()=>!!readLocale());
 useEffect(()=>{document.documentElement.lang=uiLanguage},[uiLanguage]);
 const [token,setToken]=useState(''),[boot,setBoot]=useState(null),[childId,setChildId]=useState(''),[page,setPage]=useState('home'),[lesson,setLesson]=useState(null),[qIndex,setQIndex]=useState(0),[answer,setAnswer]=useState(''),[hints,setHints]=useState(0),[result,setResult]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[pin,setPin]=useState(''),[oldPin,setOldPin]=useState(''),[report,setReport]=useState(null),[newName,setNewName]=useState(''),[year,setYear]=useState(1),[school,setSchool]=useState('SK'),[language,setLanguage]=useState('ms');
 const [growthAudience,setGrowthAudience]=useState('junior'),[growthKind,setGrowthKind]=useState('ai');
 const [browseSubject,setBrowseSubject]=useState('Matematik'),[browseChapter,setBrowseChapter]=useState('all'),[studyTab,setStudyTab]=useState('notes');
 const [rememberDemo,setRememberDemo]=useState(savedDemo());
 const [timeConsent,setTimeConsent]=useState(trackingEnabled);
 const [usageReport,setUsageReport]=useState(null);
 const usageLast=useRef(Date.now()),usageInteraction=useRef(Date.now());
 useEffect(()=>{
  // Active time is measured only with parent consent and a selected profile.
  if(!timeConsent||!childId)return;
  const stamp=()=>Date.now();
  const active=()=>{usageInteraction.current=stamp()};
  const backgrounded={current:false};
  usageLast.current=stamp();usageInteraction.current=stamp();
  const pulse=(event='active')=>{
   const now=stamp(),elapsed=Math.max(0,now-usageLast.current);usageLast.current=now;
   const eligible=document.visibilityState==='visible'&&
     (now-usageInteraction.current)<IDLE_LIMIT_MS&&event==='active';
   recordUsage({childId,at:now,seconds:eligible?Math.min(MAX_TICK_MS,elapsed)/1000:0,activity:page,event});
  };
  const changed=()=>{if(document.visibilityState==='hidden'||document.hasFocus?.()===false){if(backgrounded.current)return;backgrounded.current=true; pulse('background');usageInteraction.current=stamp()}};
  const foreground=()=>{if(!backgrounded.current)return;backgrounded.current=false;usageLast.current=stamp();usageInteraction.current=stamp();recordUsage({childId,at:stamp(),seconds:0,activity:page,event:'foreground'})};
  const tick=window.setInterval(()=>pulse('active'),15000);
  const onVisibility=()=>document.visibilityState==='hidden'?changed():foreground();
  const onBlur=()=>changed();
  window.addEventListener('pointerdown',active,{passive:true});
  window.addEventListener('keydown',active);
  window.addEventListener('focus',foreground);
  window.addEventListener('blur',onBlur);
  window.addEventListener('pagehide',changed);
  document.addEventListener('visibilitychange',onVisibility);
  return()=>{
   window.clearInterval(tick);pulse('pause');
   window.removeEventListener('pointerdown',active);window.removeEventListener('keydown',active);
   window.removeEventListener('focus',foreground);window.removeEventListener('blur',onBlur);
   window.removeEventListener('pagehide',changed);document.removeEventListener('visibilitychange',onVisibility);
  };
 },[timeConsent,childId,page]);
 const optIntoTracking=()=>{
  setTrackingEnabled(true);setTimeConsent(true);setUsageReport(summariseUsage(childId));
 };
 const stopTracking=()=>{
  setTrackingEnabled(false);setTimeConsent(false);setUsageReport(null);
 };
 const clearTracking=()=>{
  wipeUsage();setUsageReport(summariseUsage(childId));
 };
 useEffect(()=>{if(!isLive){api('getBootstrap','PUBLIC_SHOWCASE').then(b=>{setToken('PUBLIC_SHOWCASE');setBoot(b);setChildId(b.children[0]?.id||'')}).catch(e=>setError(e.message))}},[]);
 const child=boot?.children.find(x=>x.id===childId),q=lesson?.questions[qIndex];
 const browseYear=child?.year||year,browseSchool=child?.school||school;
 const [showOptional,setShowOptional]=useState(false);
 const subjectOptions=availableSubjects(browseSchool,browseYear,{includeOptional:showOptional});
 const subjectLessons=(boot?.lessons||[]).filter(l=>l.subject===browseSubject&&Number(l.year)===Number(browseYear)&&(!l.school||l.school==='ALL'||l.school===browseSchool));
 const chapters=[...new Set(subjectLessons.map(l=>l.chapter||'Fundamentals'))];
 const visibleLessons=subjectLessons.filter(l=>browseChapter==='all'||(l.chapter||'Fundamentals')===browseChapter);
 async function call(method,...args){setError('');setBusy(true);try{return await api(method,token,...args)}catch(e){setError(e.message);throw e}finally{setBusy(false)}}
 async function login(t){setToken(t);try{const b=await api('getBootstrap',t);setBoot(b);setChildId(b.children[0]?.id||'');setPage('home')}catch(e){setError(e.message);setToken('')}}
 async function refresh(){const b=await call('getBootstrap');setBoot(b);if(!b.children.some(x=>x.id===childId))setChildId(b.children[0]?.id||'');}
 function toggleDemoSave(enabled){
  setRememberDemo(enabled);
  try{if(enabled){localStorage.setItem(DEMO_SAVE_CONSENT,'yes');persistDemo()}else{localStorage.removeItem(DEMO_SAVE_CONSENT);clearDemo()}}
  catch{setError('Local browser storage is not available on this device')}
 }
 async function resetDemo(){
  mockChildren=[];mockAttempts={};mockPin='';clearDemo();setChildId('');setReport(null);await refresh();setPage('home')
 }
 async function createChild(e){e.preventDefault();try{const x=await call('addChild',{name:newName,year,school,language});await refresh();setChildId(x.id);setNewName('');setPage('home')}catch{}}
 async function openLesson(id){
  setError('');
  const listed=LESSONS.find(item=>item.id===id);
  if(!listed){setError('This study topic could not be found. Please choose another lesson.');return}
  try{
    // Reading is available to everyone in demo mode, even before a profile is made.
    // Never bypass authenticated access controls in the live backend.
    const l=isLive?await call('getLesson',childId,id):{...listed,questions:(listed.check||[]).map(q=>({id:q.id,mode:q.mode,text:q.text,options:q.options||[],transfer:!!q.transfer}))};
    setLesson(l);setStudyTab('notes');setQIndex(0);setAnswer('');setHints(0);setResult(null);setPage('lesson');
    window.scrollTo?.({top:0,behavior:'instant'});
  }catch(e){setError('Unable to open the lesson: '+(e?.message||'unknown error'))}
 }
 async function submit(){if(!q||!answer.trim())return;try{const r=await call('submitAttempt',childId,lesson.id,q.id,answer,hints);setResult(r)}catch{}}
 function next(){setQIndex(x=>x+1);setAnswer('');setHints(0);setResult(null)}
 async function viewReport(){try{const r=await call('getParentReport',childId,pin);setReport(r);setUsageReport(summariseUsage(childId));setPage('parent')}catch{}}
 async function savePin(){try{await call('setParentPin',pin,oldPin);alert('Parent PIN saved. Keep it private.')}catch{}}
 async function scholarship(){try{await call('requestScholarship');await refresh();alert('Scholarship request submitted for private manual review.')}catch{}}
 if(!welcomeDone)return <WelcomeGate language={uiLanguage} onLanguage={setUiLanguage} onContinue={()=>{writeLocale(uiLanguage);setWelcomeDone(true)}}/>;
 if(!token)return isLive?<><PwaControls/><GoogleLogin onToken={login}/></>:<><PwaControls/><main className="showcase-loading" role="status"><span aria-hidden="true">🦁</span><h1>Welcome to BijakLearn Junior</h1><p>Opening your learning adventure…</p></main></>;
 return <div className="app"><PwaControls/><header><button className="logo" onClick={()=>setPage('home')}><img src="./icons/icon.svg" width="44" height="44" alt="BijakLearn Junior schoolchildren logo"/> <span>BijakLearn <b>Junior</b></span></button><div className="topactions"><button type="button" className="language-switch" onClick={()=>setWelcomeDone(false)}>{say(uiLanguage,'change')} · {LANGUAGES.find(l=>l.code===uiLanguage)?.name}</button>{isLive?<><span>{boot?.parent?.name}</span><button onClick={()=>{setToken('');setBoot(null);setReport(null)}}>Sign out</button></>:<span className="showcase-welcome">✨ Learn • Play • Discover</span>}</div></header>
 {error&&<div role="alert" className="error">{error}<button onClick={()=>setError('')}>✕</button></div>}
 <nav className="nav"><button onClick={()=>setPage('home')} aria-label="Home">🏠 {say(uiLanguage,'home')}</button><button onClick={()=>setPage('preschool')} aria-label="Preschool">🐣 {say(uiLanguage,'preschool')}</button><button onClick={()=>setPage('packs')} aria-label="Learning Packs">🚀 {say(uiLanguage,'packs')}</button><button onClick={()=>setPage('map')} aria-label="Learning map">🗺️ {say(uiLanguage,'map')}</button><button onClick={()=>setPage('tutor')} aria-label="Study Buddy">🤖 {say(uiLanguage,'tutor')}</button><button onClick={()=>setPage('practice')} aria-label="Practice Arena">🎯 {say(uiLanguage,'practice')}</button><button onClick={()=>{setGrowthAudience('adult');setGrowthKind('ai');setPage('growth')}} aria-label="Adults Page">🧑‍🎓 Adults</button><button onClick={()=>{setGrowthAudience('junior');setGrowthKind('ai');setPage('growth')}} aria-label="Junior Lab">🎒 Junior Lab</button><button onClick={()=>{setGrowthKind('ai');setPage('growth')}} aria-label="Learn AI">🧠 Learn AI</button><button onClick={()=>{setGrowthKind('hobby');setPage('growth')}} aria-label="Creative Hobbies">🎨 Creative Hobbies</button><button onClick={()=>setPage('wordgame')} aria-label="Word Tiles versus Bot">🔡 Word Tiles vs Bot</button><button onClick={()=>setPage('arcade')} aria-label="Activity Playground">🎪 Activity Playground</button>{isLive&&<button onClick={()=>{setReport(null);setPage('pin')}}>👨‍👩‍👧 Parent insights</button>}<button onClick={()=>setPage('membership')} aria-label="Membership">💚 {say(uiLanguage,'membership')}</button></nav>
 <main>
 {timeConsent&&<p className="time-child-notice" role="status">⏱️ Learning-time recording is on. Your parent can see approximate study time, activities and breaks. You can ask them to pause it.</p>}
 {page==='arcade'&&<ActivityArcade/>}
 {page==='wordgame'&&<WordTilesGame/>}
 {page==='growth'&&<GrowthHub audience={growthAudience} initialKind={growthKind} onAudience={setGrowthAudience} onKind={setGrowthKind} loadTrack={isLive?async id=>await api("getGrowthModule",token,id):null} checkAnswer={isLive?async(lessonId,answerIndex)=>await api("checkGrowthAnswer",token,lessonId,answerIndex):null}/>}
 {page==='practice'&&<PracticeArena lessons={LESSONS} year={browseYear} school={browseSchool} language={uiLanguage} onOpenLesson={openLesson}/>}
 {page==='tutor'&&<StudyBuddy lessons={LESSONS} year={browseYear} subject={lesson?.subject||''} currentLesson={lesson} askOnline={isLive?async(question,context)=>await api('askTutor',token,question,context):null}/>}
 {page==='packs'&&<><div className="library-filters"><label>School stream<select value={browseSchool} disabled={!!child} onChange={e=>setSchool(e.target.value)}>{['SK','SJKC','SJKT'].map(v=><option key={v}>{v}</option>)}</select></label><label>Year<select value={browseYear} disabled={!!child} onChange={e=>setYear(Number(e.target.value))}>{[1,2,3,4,5,6].map(y=><option key={y} value={y}>Tahun {y}</option>)}</select></label><span className="library-hint">Short learning adventures created from available lessons</span></div><AdventurePacks lessons={LESSONS.filter(l=>(!l.school||l.school==='ALL'||l.school===browseSchool))} year={browseYear} school={browseSchool} childId={childId} attempts={isLive?{}:mockAttempts} onOpen={openLesson} onPreschool={()=>setPage('preschool')}/></>}
 {page==='preschool'&&<PreschoolStudio/>}
 {page==='home'&&<><div className="hero"><div><span className="eyebrow">MY LEARNING ADVENTURE</span><h1>Learn, explore and grow! 🌈</h1><p>Learn through pictures, try new questions, and turn mistakes into understanding.</p></div><div className="hero-mascots"><MascotFriends language={uiLanguage} compact/></div><button type="button" className="preschool-launch" onClick={()=>setPage("preschool")}>🐣 Try Prasekolah: ABC, tracing & spelling →</button></div><section className="panel"><h2>Personalise your learning space</h2><div className="demo-save-settings"><div><strong>⭐ Optional practice nickname</strong><p>Explore every lesson without an account. You can use a fictional nickname to remember practice on this device for up to 30 days. Please do not enter a real child’s name or private details.</p></div><label className="demo-save-check"><input type="checkbox" checked={rememberDemo} onChange={e=>toggleDemoSave(e.target.checked)}/> Remember practice on this device</label><button type="button" onClick={resetDemo}>Clear saved practice</button></div>{boot?.children.length?<div className="chips">{boot.children.map(c=><button key={c.id} className={childId===c.id?'selected':''} onClick={()=>setChildId(c.id)}>{c.name} · Tahun {c.year}</button>)}</div>:<p>You can explore all lessons without a profile. Add a fictional practice nickname only if you want to try the progress tools.</p>}<details><summary>+ Add practice nickname</summary><form onSubmit={createChild} className="form"><label>Fictional nickname<input required maxLength={40} value={newName} onChange={e=>setNewName(e.target.value)}/></label><label>Year<select value={year} onChange={e=>setYear(Number(e.target.value))}>{[1,2,3,4,5,6].map(y=><option key={y} value={y}>Tahun {y}</option>)}</select></label><label>School<select value={school} onChange={e=>setSchool(e.target.value)}>{['SK','SJKC','SJKT'].map(v=><option key={v}>{v}</option>)}</select></label><label>Language<select value={language} onChange={e=>setLanguage(e.target.value)}>{Object.entries(langLabels).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select></label><button className="primary" disabled={busy}>Add practice profile</button></form></details></section>

 <button type="button" className="arcade-home-teaser" onClick={()=>setPage('arcade')}><span aria-hidden="true">🎪</span><span><strong>Activity Playground</strong><small>Picture subtraction, word matching, bilingual picture dictionary and Huruf Hijaiyah recognition with tracing.</small></span><span aria-hidden="true">→</span></button>
 <button type="button" className="word-bot-home" onClick={()=>setPage('wordgame')}><span aria-hidden="true">🔡</span><span><strong>Word Tiles vs Bot</strong><small>Build vocabulary and challenge a friendly spelling bot — English and Bahasa Melayu.</small></span><span aria-hidden="true">→</span></button>
 <div className="growth-home-spotlight"><button type="button" className="growth-home-card" onClick={()=>{setGrowthAudience('junior');setGrowthKind('ai');setPage('growth')}}><span className="growth-spot-icon" aria-hidden="true">🤖</span><span><strong>Learn AI</strong><small>Understand smart technology, safe prompts and how to check answers. Junior and Adult lessons.</small></span></button><button type="button" className="growth-home-card" onClick={()=>{setGrowthAudience('junior');setGrowthKind('hobby');setPage('growth')}}><span className="growth-spot-icon" aria-hidden="true">🌿</span><span><strong>Creative Hobbies</strong><small>Try drawing, music, journaling and everyday creative challenges. Junior and Adult tracks.</small></span></button></div>
 <div className="home-mascot-band"><div><span className="mini-label">🌟 BIJAKLEARN JUNIOR</span><h2>{say(uiLanguage,'greeting')}</h2><p>{say(uiLanguage,'touch')}</p></div><MascotFriends language={uiLanguage} compact/></div>
 <div className="tutor-teaser"><span aria-hidden="true">🤖</span><div><strong>Stuck on a question?</strong><p>Ask Study Buddy for a worked calculation, a concept explanation, or listen to the answer.</p></div><button type="button" className="primary" onClick={()=>{setLesson(null);setPage('tutor')}}>Ask Study Buddy →</button></div>
 <div className="home-packs-teaser"><div><span className="mini-label">🎯 NEW PRACTICE MODULES</span><h2>Daily questions and flashcards</h2><p>Choose a subject and a school year, then try short quizzes, daily challenges and flashcards.</p></div><button type="button" className="primary" onClick={()=>setPage('practice')}>🎯 Open Practice Arena</button></div>
 <div className="home-packs-teaser"><div><span className="mini-label">🚀 NEW LEARNING PACKS</span><h2>Ready for a little adventure?</h2><p>Pick a themed mission, explore real study notes, and try short quizzes in a friendly learning journey.</p></div><button type="button" className="primary" onClick={()=>setPage('packs')}>Explore learning packs →</button></div>
 <section className="library-section" id="study-library">
   <div className="section-heading"><div><span className="mini-label">📚 EXPLORE YOUR LIBRARY</span><h2>{say(uiLanguage,'explore')}</h2><p>Pick a colourful subject card to see its learning materials.</p></div><span className="heading-spark" aria-hidden="true">🌟</span></div>
   <div className="library-filters"><label>School stream <select value={browseSchool} disabled={!!child} onChange={e=>{setSchool(e.target.value);setBrowseSubject('Matematik');setBrowseChapter('all')}}>{['SK','SJKC','SJKT'].map(v=><option key={v}>{v}</option>)}</select></label><label>School year <select value={browseYear} disabled={!!child} onChange={e=>{setYear(Number(e.target.value));setBrowseChapter('all')}}>{[1,2,3,4,5,6].map(v=><option key={v} value={v}>Tahun {v}</option>)}</select></label><span className="library-hint">{child?'Showing subjects for '+child.name:'Browse without creating a learner'}</span></div>
   <div className="optional-subject-toggle"><button type="button" aria-pressed={showOptional} onClick={()=>setShowOptional(v=>!v)}>{showOptional?'Hide optional-language catalogues':'Show additional optional languages'} <span aria-hidden="true">{showOptional?'−':'+'}</span></button><small>Optional subjects vary by school and some do not yet have authored study content.</small></div>
   <div className="subjects playful-subjects">{subjectOptions.map((s,i)=>{const total=lessonCountForSubject(boot?.lessons,s.name,browseYear);return <button type="button" className={'subject subject-picker '+(browseSubject===s.name?'active-subject':'')} style={{'--card-hue':(i*43+185)%360}} key={s.id} onClick={()=>{setBrowseSubject(s.name);setBrowseChapter('all')}} aria-pressed={browseSubject===s.name}><span className="subject-illustration" aria-hidden="true">{s.icon}</span><strong>{s.name}</strong><small>{total?total+' lessons to explore':'Content in preparation'}</small>{total>0?<span className="ready-dot">{say(uiLanguage,'lesson')} ✦</span>:<span className="catalog-dot">{say(uiLanguage,'preparing')}</span>}</button>})}</div>
   <div className="learning-shelf">
    <div className="shelf-title"><div><span className="mini-label">📖 STUDY CONTENTS</span><h2>{browseSubject}</h2><p>{subjectLessons.length?subjectLessons.length+' learning activities for Tahun '+browseYear:'Study activities for this subject are in preparation.'}</p></div><span aria-hidden="true" className="book-stack">📚</span></div>
    {subjectLessons.length>0?<><div className="chapter-chips" aria-label="Filter lessons by topic"><button type="button" aria-pressed={browseChapter==='all'} className={browseChapter==='all'?'selected':''} onClick={()=>setBrowseChapter('all')}>All topics ({subjectLessons.length})</button>{chapters.map(ch=><button type="button" key={ch} aria-pressed={browseChapter===ch} className={browseChapter===ch?'selected':''} onClick={()=>setBrowseChapter(ch)}>{ch}</button>)}</div><div className="cards lesson-shelf">{visibleLessons.map((l,i)=><button key={l.id} type="button" className="lesson illustrated-lesson" onClick={()=>openLesson(l.id)} aria-label={'Open '+l.title}><span className="lesson-art" aria-hidden="true">{l.icon}</span><span className="lesson-index">LESSON {String(i+1).padStart(2,'0')}</span><strong>{l.title}</strong><small>{l.chapter||'Foundational skills'} · Tahun {l.year}</small><span className="lesson-link">📖 Read & explore <span aria-hidden="true">→</span></span></button>)}</div></>:<div className="empty-library"><span className="empty-graphic" aria-hidden="true">🪴 📕 ✨</span><h3>Something exciting is growing here!</h3><p>Extra learning adventures for {browseSubject} are still being prepared. You can switch to <button type="button" onClick={()=>{setBrowseSubject('Matematik');setBrowseChapter('all')}}>Tahun 1 Matematik</button> to explore available lessons.</p></div>}
    <p className="draft-note">🛡️ This is supplementary enrichment, not a school syllabus. Topics include introductory concepts and spiral practice; educators are reviewing the content.</p>
   </div>
 </section></>}

 {page==='map'&&<section className="curriculum-map"><div className="section-heading"><div><span className="mini-label">🗺️ EXPLORE ALL LESSONS</span><h1>My Learning Adventure</h1><p>Choose any available subject, year or topic. You can read lessons without creating a child profile.</p></div></div>
 <div className="library-filters"><label>School stream<select value={browseSchool} disabled={!!child} onChange={e=>{setSchool(e.target.value);setBrowseSubject('Matematik');setBrowseChapter('all')}}>{['SK','SJKC','SJKT'].map(v=><option key={v}>{v}</option>)}</select></label><label>Year<select value={browseYear} disabled={!!child} onChange={e=>{setYear(Number(e.target.value));setBrowseChapter('all')}}>{[1,2,3,4,5,6].map(v=><option key={v} value={v}>Tahun {v}</option>)}</select></label><label>Subject<select value={browseSubject} onChange={e=>{setBrowseSubject(e.target.value);setBrowseChapter('all')}}>{subjectOptions.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></label></div>
 <div className="chapter-chips"><button className={browseChapter==='all'?'selected':''} onClick={()=>setBrowseChapter('all')}>All topics</button>{chapters.map(ch=><button key={ch} className={browseChapter===ch?'selected':''} onClick={()=>setBrowseChapter(ch)}>{ch}</button>)}</div>
 <div className="cards lesson-shelf">{visibleLessons.map((l,i)=><button type="button" className="lesson illustrated-lesson" key={l.id} onClick={()=>openLesson(l.id)}><span className="lesson-art" aria-hidden="true">{l.icon}</span><span className="lesson-index">LESSON {i+1}</span><strong>{l.title}</strong><small>{l.chapter||l.subject} · Tahun {l.year}</small><span className="lesson-link">📖 Open lesson →</span></button>)}</div>
 {!visibleLessons.length&&<div className="empty-library"><h2>More lessons are being prepared</h2><p>This subject/year does not yet have reviewed study content. Choose another year or subject to explore currently available lessons.</p><button className="primary" onClick={()=>{setBrowseSubject('Matematik');setYear(1);setBrowseChapter('all')}}>Explore Tahun 1 Mathematics</button></div>}
 <p className="draft-note">Content and curriculum mappings remain under educational review.</p></section>}

 {page==='lesson'&&lesson&&<div className="lesson-reader">
  <div className="reader-toolbar"><button type="button" className="back" onClick={()=>setPage('home')}>← Back to subjects</button><span className="draft-tag">📚 Learning content</span></div>
  <div className="lessonhead colourful-lessonhead"><span className="lesson-head-art" aria-hidden="true">{lesson.icon}</span><div><span className="mini-label">{lesson.subject} • TAHUN {lesson.year}</span><h1>{lesson.title}</h1><p>Discover the idea, study the examples, then test your understanding.</p></div></div>
  <div className="reader-tabs" role="tablist" aria-label="Study or practise"><button type="button" role="tab" aria-selected={studyTab==='notes'} className={studyTab==='notes'?'active':''} onClick={()=>setStudyTab('notes')}>📚 Study content</button><button type="button" onClick={()=>setPage('tutor')} className="tutor-lesson-button">🤖 Ask Study Buddy</button><button type="button" role="tab" aria-selected={studyTab==='quiz'} className={studyTab==='quiz'?'active':''} onClick={()=>setStudyTab('quiz')}>🎯 Try the quiz ({lesson.questions.length})</button></div>
  {studyTab==='notes'?<>
   <LearningVisuals title={lesson.title} subject={lesson.subject}/>
   <div className="panel study-summary"><span className="mini-label">💡 LET'S UNDERSTAND</span><h2>What will I learn?</h2><p className="large-reading">{lesson.summary}</p>{lesson.visual&&<div className="visual-example" role="note"><span className="visual-symbol" aria-hidden="true">{lesson.icon}</span><div><strong>👀 Look at this example</strong><p>{lesson.visual}</p></div></div>}</div>
   <section className="study-chapter"><div className="section-heading"><div><span className="mini-label">🪜 ONE STEP AT A TIME</span><h2>Let's learn together</h2></div></div><div className="study-steps">{(lesson.steps||[]).map((s,i)=><article className="study-step" key={i}><span className="step-number">{i+1}</span><div><h3>{s.title}</h3><p>{s.body}</p></div><span className="step-emoji" aria-hidden="true">{['🔎','🧠','✨'][i%3]}</span></article>)}</div></section>
   {lesson.enrichment&&<LearningMission enrichment={lesson.enrichment} title={lesson.title}/>}
   <section className="panel concept-map-panel"><span className="mini-label">🧠 CONNECT YOUR IDEAS</span><h2>My mini mind map</h2><div className="mindmap colourful-mindmap">{(lesson.mind||[]).map(([a,b],i)=><div key={i}><span aria-hidden="true">{['🌈','🔍','⭐'][i%3]}</span><strong>{a}</strong><p>{b}</p></div>)}</div></section>
   <div className="study-cta"><div><strong>Ready for a challenge?</strong><p>Try the questions when you understand the lesson.</p></div><button type="button" className="primary" onClick={()=>{setStudyTab('quiz');setQIndex(0);setResult(null);setAnswer('')}}>Start practice →</button></div>
  </>:<section className="panel quiz colour-quiz"><div className="quiz-progress"><span>🎯 Practice challenge</span><span>{Math.min(qIndex+1,lesson.questions.length)} / {lesson.questions.length}</span></div><div className="progress-track"><div style={{width:(100*Math.min(qIndex,lesson.questions.length)/Math.max(1,lesson.questions.length))+'%'}}/></div>{q?<><h2>{q.text}</h2>{q.options.length?<div className="choices">{q.options.map(x=><button type="button" className={answer===x?'selected':''} key={x} disabled={!!result} onClick={()=>setAnswer(x)}>{x}</button>)}</div>:<label>Your answer<input value={answer} disabled={!!result} onChange={e=>setAnswer(e.target.value)} placeholder="Type your answer here"/></label>}<div className="actions">{!result?<><button type="button" onClick={()=>setHints(h=>h+1)}>💡 Hint {hints? '('+hints+' used)':''}</button><button type="button" className="primary" disabled={busy||!answer.trim()} onClick={submit}>Check my answer</button></>:<><button type="button" onClick={()=>{setAnswer('');setResult(null);setHints(x=>x+1)}}>Try with guidance</button><button type="button" className="primary" onClick={next}>Next question →</button></>}</div>{hints>0&&!result&&<p className="hint">Try drawing the objects or using your fingers. What changes when you move one?</p>}{result&&<div className={'feedback '+(result.correct?'good':'gentle')}><strong>{result.correct?'🌟 Wonderful effort!':'💛 Good try — we learn from mistakes!'}</strong>{result.correct&&<div className="celebrate-stars" aria-hidden="true">⭐ ✨ 🎉 ✨ ⭐</div>}<p>{result.feedback}</p><p>{result.mastery.mastered?'⭐ Great independent practice! Keep exploring.':'Keep practising in different ways. One correct answer alone never passes a topic.'}</p></div>}</>:<div className="feedback good"><h2>🎉 You explored all the questions!</h2><p>Keep revisiting the study content and try again with fresh examples.</p><button type="button" className="primary" onClick={()=>{setQIndex(0);setAnswer('');setResult(null);setHints(0)}}>Practice again</button><button type="button" onClick={()=>setStudyTab('notes')}>Review study notes</button></div>}</section>}
  <p className="reader-footer-note">Practice feedback supports learning; this is not a certified school assessment.</p>
 </div>}

 {page==='pin'&&<div className="panel narrow"><h1>🔒 Parent-only learning reports</h1><p>Parents use a six-digit PIN to view their child's progress. Set a PIN on your first visit.</p><label>Parent PIN<input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value)} placeholder="6 digits"/></label><label>Existing PIN (only when replacing)<input type="password" inputMode="numeric" maxLength={6} value={oldPin} onChange={e=>setOldPin(e.target.value)} placeholder="Leave blank for first setup"/></label><div className="actions"><button onClick={savePin} disabled={pin.length!==6||busy}>Set or replace PIN</button><button className="primary" onClick={viewReport} disabled={pin.length!==6||!childId||busy}>View child report</button></div><small>{isLive?'Protect this PIN and use separate parent and child accounts.':'This is a local preview, not secure child monitoring. A child with browser access can inspect or clear local information. Use distinct authenticated parent and child accounts for real families.'}</small></div>}
 {page==='parent'&&report&&<section className="panel learning-time-panel" aria-label="Parent learning time report">
 <h2>⏱️ Learning Time & Breaks</h2>
 <p>This optional report measures approximate time while the app is visible and a learner is interacting. It cannot see other apps or confirm why a session stopped.</p>
 {!timeConsent?<div className="time-consent"><p><strong>Parent opt-in required.</strong> Children will see a short notice when this feature is enabled. The detailed report is shown only after the parent PIN check.</p><button type="button" className="primary" onClick={optIntoTracking}>Enable learning-time recording</button></div>:
 <><div className="time-metrics">{[['Active minutes (7 days)',usageReport?.minutes7||0],['Study days (7 days)',usageReport?.activeDays||0],['App backgrounded (7 days)',usageReport?.backgroundEvents7||0]].map(([label,value])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
 <p className="time-small">Last observed activity: {usageReport?.lastSeen?new Date(usageReport.lastSeen).toLocaleString():'No study activity recorded yet'}. “App backgrounded” can mean switching apps, locking the device, navigating away, or an interruption; it is not proof of cheating or force-closing.</p>
 <div className="time-days">{(usageReport?.days||[]).length?(usageReport?.days||[]).map(d=><div key={d.date}><strong>{d.date}</strong><span>{Math.round(d.seconds/60)} active min · {d.backgroundEvents} interruptions</span></div>):<p>No activity in the last seven days.</p>}</div>
 <div className="actions"><button type="button" onClick={()=>setUsageReport(summariseUsage(childId))}>Refresh report</button><button type="button" onClick={stopTracking}>Stop recording</button><button type="button" onClick={clearTracking}>Delete device usage history</button></div></>}
 <p className="time-small">Device-local preview: this report may be cleared or altered through browser settings. Reliable multi-device parent reporting requires separate parent/child accounts, consent controls and a private backend; no remote tracking is active on the public site.</p>
 </section>}
{page==='parent'&&report&&<><h1>👨‍👩‍👧 Parent Learning Intelligence</h1><p>Practice overview for {child?.name} — formative and not independently certified</p><div className="statgrid">{[['Practice milestones',report.mastered],['Practice attempts',report.attempts],['Independent attempts',report.independent],['Learning opportunities',report.errors]].map(([name,n])=><div className="stat" key={name}><strong>{n}</strong><span>{name}</span></div>)}</div><div className="panel"><h2>🕵️ Learning Detective</h2>{report.topics.length?report.topics.map(x=><p key={x.lessonId}><strong>{boot.lessons.find(l=>l.id===x.lessonId)?.title||x.lessonId}</strong> — {x.mastered?'Practice milestone reached (not certified)':'Needs more independent practice'} · {x.independent} independent answers</p>):<p>Complete a few lessons to begin building the learning profile.</p>}<p className="hint">We report observed evidence, not a diagnosis of intelligence or a fixed learning style.</p></div><div className="panel"><h2>💡 Suggested home activity</h2><p>Ask your child to explain a maths problem using household objects, then try a similar example with different quantities.</p></div></>}
 {page==='membership'&&<section className="membership-journey"><div className="adventure-intro"><div><span className="adventure-eyebrow">💚 SUPPORT EVERY LEARNER</span><h1>Learning access & family packages</h1><p>Explore our learning experience and understand the available access options. Family account enrolment and paid memberships are not active on this website.</p></div><div className="adventure-illustration" aria-hidden="true"><span>🎒</span><span>💚</span><span>✨</span></div></div><div className="membership-tiers"><article className="tier-card"><span className="tier-icon">🌱</span><h2>Free Explorer</h2><p>Discover learning activities and find your favourite subjects.</p><ul><li>Browse available study lessons</li><li>Try interactive preschool games</li><li>Explore themed learning packs</li></ul><button type="button" onClick={()=>setPage('packs')}>Explore learning packs →</button></article><article className="tier-card premium-tier"><span className="tier-icon">🚀</span><h2>Premium</h2><p>Planned full learning access for subscribing families, subject to manual verification.</p><ul><li>Premium lesson access in the separately hosted account pilot</li><li>Parent learning progress insights</li><li>Family-managed child profiles</li></ul><div className="tier-status">Enrolment opening later</div></article><article className="tier-card"><span className="tier-icon">💚</span><h2>Premium Kasih</h2><p>A planned full-Premium sponsorship path for eligible families, following private administrator approval.</p><ul><li>Same planned learning access as Premium</li><li>Manual, private eligibility review</li><li>No fee for approved families</li></ul><div className="tier-status">Private application process</div></article></div><div className="panel"><h2>Account status</h2><p>Plan: <strong>{boot?.access.plan}</strong> · {boot?.access.active?'Active test entitlement':'Free access'}</p>{isLive?<><button type="button" onClick={()=>refresh()}>Refresh account status</button><p>Scholarship review status: {boot?.scholarship||'Not requested'}</p><button type="button" className="primary" onClick={scholarship} disabled={busy}>Request private scholarship review</button></>:<p>The website currently offers open access to its available learning activities. Online payments and private document submissions are not enabled.</p>}</div></section>}
 </main><footer><div>BijakLearn Junior · Learn, play and grow · {isLive?'Family learning platform':'Public learning preview'} · Curriculum review in progress</div><div className="proease-footer">A <strong>ProEase Studio™</strong> learning experience · © {new Date().getFullYear()} ProEase Studio. All rights reserved.</div></footer></div>
}
createRoot(document.getElementById('root')).render(<App/>);