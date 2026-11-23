import {StudyGlyph} from './Brand.jsx';
import LearningBalloon from './LearningBalloon.jsx';
import FieldStudies from './FieldStudies.jsx';
import ReleaseUpdates from './ReleaseUpdates.jsx';
import PictureDictionary from './PictureDictionary.jsx';
import './learning-tools.css';
import {useSheetRefresh} from './sheetRefresh.js';
import Brand,{BrandCredit,PortalGlyph} from './Brand.jsx';
import VideoLibrary from './VideoLibrary.jsx';
// Capture a referral only in this tab; no tracking cookies, email addresses or child data in URLs.
function getReferralCode(){try{const code=new URL(window.location.href).searchParams.get('ref');if(/^[a-f0-9]{32}$/.test(code||''))sessionStorage.setItem('bijaklearn:referral',code);return sessionStorage.getItem('bijaklearn:referral')||''}catch{return ''}}
getReferralCode();
import {ACCOUNT_URL,GOOGLE_CLIENT_ID,AccountConnectionError,directAccountCall,remoteAccountCall} from './accountTransport.js';
import {RolePortals,StudentUsage} from './RolePortals.jsx';
import OAuthLogin from './OAuthLogin.jsx';
import {PasswordSignIn} from './PasswordSignIn.jsx';
import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {tx,setUiLang} from './i18n.js';
import {TRACK_CONSENT,trackingEnabled,setTrackingEnabled,readUsage,wipeUsage,recordUsage,summariseUsage,IDLE_LIMIT_MS,MAX_TICK_MS} from './learningTime.js';
import {createRoot} from 'react-dom/client';
import {LESSONS,RAW_LESSONS} from './lessons';
import {lessonsForSchool,shownInTamil} from './lessonLocale.js';
import TAMIL_CONTENT from './tamilContent.json' with {type:'json'};
import {availableSubjects,lessonCountForSubject,lessonsForSubject} from './primarySubjects.js';
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
import FreeLibrary from './FreeLibrary.jsx';
import MockExams from './MockExams.jsx';
import LanguageStudio from './LanguageStudio.jsx';
import './word-tiles.css';
import ActivityArcade from './ActivityArcade.jsx';
import LearningMission from './LearningMission.jsx';
import './learning-mission.css';
import './activity-arcade.css';
import './study-library.css';
import './interactive-learning.css';
import './learning-journey.css';
import PlayfulScene from './PlayfulScene.jsx';
import './playful-theme.css';
import './polish.css';
import './lab-studio.css';
import StreakChip from './StreakChip.jsx';
import {ContinueLearning, LearningPaths, PracticeLab, ReviewQuestions} from './LearningJourney.jsx';
import {PATHS, missedQuestions} from './learningPaths.js';
import {DiscoveryActivity, DiscoveryLibrary} from './DiscoveryLearning.jsx';
import {LessonNavigation, LearningMindMap, LessonQuickCheck, SubjectMindMap} from './InteractiveLearning.jsx';
import ScienceLab from './ScienceLab.jsx';
import AppBoundary from './AppBoundary.jsx';
import MathsStudio from './MathsStudio.jsx';
import AccountAccessPanel from './AccountAccessPanel.jsx';
import StudentAccessPanel from './StudentAccessPanel.jsx';
import ModuleGate from './ModuleGate.jsx';
import {moduleForPage} from './moduleRegistry.js';
import MembershipPage from './MembershipPage.jsx';
import PremiumKasihApplication from './PremiumKasihApplication.jsx';
import KasihReviewPanel from './KasihReviewPanel.jsx';
import './professional.css';
import './studio-refresh.css';
import './design-system.css';
import './studio.css';
import './bijak-theme.css';
import './learning-editions.css';
import './signin-portal.css';
import LearningEditionList from './LearningEditionList.jsx';
import {JUNIOR,learningEditionForYear,inLearningEdition} from './learningEditions.js';
import {markPractice, normalizedAnswer} from './practiceBank.js';

import './sky-atlas.css';
function LessonSearch({query, onChange, count}) {
 return <div className="lesson-search">
  <label>{tx("Find a lesson")} <input type="search" placeholder={tx("Search lesson titles or topics")} value={query} onChange={event=>onChange(event.target.value)}/></label>
  <span role="status">{count} {count===1?tx('lesson'):tx('lessons')} {tx('shown')}</span>
 </div>;
}
const nativeAccountService=!!window.google?.script?.run;
const demoEnabled=import.meta.env.DEV||import.meta.env.VITE_ENABLE_DEMO==='true';
const isLive=nativeAccountService||(!demoEnabled&&/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(ACCOUNT_URL));
const portalV2=isLive&&(!nativeAccountService||window.BIJAKLEARN_PORTAL_VERSION===2);
const langLabels={ms:'Bahasa Melayu',en:'English',ta:'தமிழ்',zh:'中文'};
const DEMO_SAVE_CONSENT='bijaklearn:demo-save-consent';
const savedDemo=()=>{try{return localStorage.getItem(DEMO_SAVE_CONSENT)==='yes'}catch{return false}};
const initialDemo=savedDemo()?loadDemo():{children:[],attempts:{}};
let mockChildren=initialDemo.children,mockAttempts=initialDemo.attempts,mockProgress=initialDemo.progress||{},mockPin='';
const persistDemo=()=>{if(savedDemo())saveDemo(mockChildren,mockAttempts,undefined,mockProgress)};
const fakeUser={name:'Guest',email:''};
let liveLessons=LESSONS;
const listLesson=l=>({id:l.id,year:l.year,title:l.title,subject:l.subject,school:l.school||'ALL',icon:l.icon,chapter:l.chapter||'Foundational skills',status:l.status||'DRAFT_TEACHER_REVIEW',premium:false});
const fakeLessons=LESSONS.map(listLesson);
async function localCall(method,args){
 if(method==='getBootstrap')return {parent:fakeUser,children:mockChildren,access:{active:false,plan:'FREE'},lessons:fakeLessons,scholarship:null};
 if(method==='addChild'){const [_,d]=args;const c={id:'demo-'+Date.now(),name:d.name,year:d.year,school:d.school,language:d.language};mockChildren.push(c);persistDemo();return c;}
 if(method==='getLesson'){const l=liveLessons.find(x=>x.id===args[2]);if(!l)throw Error('Lesson not found');return {...l,questions:l.check.map(q=>({id:q.id,mode:q.mode,text:q.text,options:q.options||[],transfer:!!q.transfer}))};}
 if(method==='submitAttempt'){const [_,childId,lessonId,questionId,answer,hints]=args;const l=liveLessons.find(x=>x.id===lessonId),q=l.check.find(x=>x.id===questionId);const correct=markPractice(q, answer);const key=childId+'/'+lessonId;mockAttempts[key]=recordAttempt(mockAttempts[key]||initialSkill(),{questionId:q.id,mode:q.mode,correct,hints,transfer:!!q.transfer});persistDemo();return {correct,feedback:correct?q.why:(l.misconceptions?.[answer]||q.why),suggestedAnswer:correct?undefined:q.answer,mastery:evaluateSkill(mockAttempts[key])};}
 if(method==='setParentPin'){mockPin=args[1];return {ok:true}}
 if(method==='getParentReport'){if(args[2]!==mockPin)throw Error('Incorrect parent PIN');const childId=args[1];const skills=Object.entries(mockAttempts).filter(([k])=>k.startsWith(childId+'/'));const attempts=skills.flatMap(([,s])=>s.attempts);return {attempts:attempts.length,errors:attempts.filter(a=>!a.correct).length,independent:attempts.filter(a=>a.correct&&!a.hints&&a.mode!=='choice').length,mastered:skills.filter(([,s])=>evaluateSkill(s).mastered).length,topics:skills.map(([k,s])=>({lessonId:k.split('/')[1],...evaluateSkill(s)})),recent:attempts.slice(-20)};}
 throw Error('Unsupported demo operation: '+method)
}
const directMethods=new Set(['getPasswordSettings','saveParentPassword','saveChildPassword','passwordSignIn','passwordSignOut','friendMatch','mockExamRequest']);
let accountUsesDirect=false;
function api(method,...args){const pending=!isLive?localCall(method,args):directMethods.has(method)||accountUsesDirect?directAccountCall(method,...args):!nativeAccountService?remoteAccountCall(method,...args):new Promise((resolve,reject)=>window.google.script.run.withSuccessHandler(resolve).withFailureHandler(e=>reject(new Error(e.message||String(e))))[method](...args));return pending.catch(error=>{if(error instanceof AccountConnectionError)throw error;throw new Error(String(error.message||error).replace(/\badministrator\b/gi,'BijakLearn Team'))});}
function accountNotice(error) {
 if(error.message.includes('[PASSWORD_SESSION]'))return 'Your session ended. Please sign in again.';
 if(error.message.includes('[STUDENT_NOT_LINKED]'))return 'Your Google account is not linked to a learner profile. Ask your parent or BijakLearn Team to enable student sign-in.';
 if(error.message.includes('[STUDENT_REVOKED]'))return 'Student sign-in is unavailable. Ask your parent or BijakLearn Team to check your profile link.';
 if(error.message.includes('[STUDENT_ONLY]'))return 'This is a student account. Please choose Student sign-in.';
 if (error.message.includes('[ACCOUNT_PENDING]')) return 'Your account is waiting for BijakLearn Team approval. Sign in again once access is granted.';
 if (error.message.includes('[ACCOUNT_REVOKED]')) return 'Your account access has been blocked. Contact your BijakLearn Team.';
 return '';
}
function signInFailure(error,role){
 if(error instanceof AccountConnectionError)return 'BijakLearn could not reach its account service. Please check your connection and try signing in again.';
 const notice=accountNotice(error);
 if(notice)return notice;
 if(/(?:google identity verification failed|invalid google identity|sign in with your google account)/i.test(error.message)){
  return 'Google could not verify this sign-in. Choose your Google account again.';
 }
 if(role==='admin'&&/(?:team access required|team account required|team only)/i.test(error.message)){
  return 'Choose the Google account registered for BijakLearn Team access.';
 }
 return 'BijakLearn could not load your account. Please try signing in again.';
}
function GoogleLogin({onToken,onPassword,notice,signingIn,language}){
 const [issue,setIssue]=useState(''),[googleReady,setGoogleReady]=useState(false);
 const externalGoogle=isLive&&!window.location.hostname.endsWith('-script.googleusercontent.com');
 const initialRole=['parent','student','admin'].includes(window.BIJAKLEARN_LOGIN_ROLE)?window.BIJAKLEARN_LOGIN_ROLE:'parent';
 const [loginRole,setLoginRole]=useState(initialRole);
 const modeRef=useRef(initialRole);
 const googleButtonRef=useRef(null);
 const chooseRole=role=>{modeRef.current=role;setLoginRole(role)};
 const admin=loginRole==='admin',student=loginRole==='student';
 useEffect(()=>{
  if(!isLive||window.location.hostname.endsWith('-script.googleusercontent.com'))return;
  if(!(window.BIJAKLEARN_GOOGLE_CLIENT_ID||GOOGLE_CLIENT_ID)){setIssue('Google sign-in is not configured. Ask the BijakLearn Team to set the OAuth Web client ID in Apps Script.');return;}
  let tries=0;
  const timer=setInterval(()=>{
   const id=window.BIJAKLEARN_GOOGLE_CLIENT_ID||GOOGLE_CLIENT_ID;
   if(window.google?.accounts?.id&&id){
    clearInterval(timer);
    try{
     window.google.accounts.id.initialize({client_id:id,callback:res=>onToken(res.credential,modeRef.current),ux_mode:'popup'});
     const container=googleButtonRef.current;
     if(container){
      container.replaceChildren();
      window.google.accounts.id.renderButton(container,{theme:'outline',size:'medium',shape:'rectangular',text:'signin_with',width:260});
      setGoogleReady(true);
     }
    }catch{setIssue('Google sign-in could not be initialized. Please try again.')}
   }else if(++tries>80){clearInterval(timer);setIssue('Google sign-in could not load on this browser. Please reload to try again.')}
  },250);
  return()=>clearInterval(timer);
 },[onToken]);
 return <main className="signin-page">
  <header className="signin-brandbar">
   <Brand/>
   <PwaControls language={language}/>
  </header>
  <div className="signin-layout">
  <section className="signin-form" aria-labelledby="signin-heading">
   <h1 id="signin-heading">{admin?'BijakLearn Team sign-in':student?'Student sign-in':'Welcome back'}</h1>
   <p>{admin?'Sign in with the BijakLearn Team Google account to review requests and manage access.':student?'Sign in to open your lessons and activities.':'Choose your account and sign in to continue.'}</p>
   <div className="signin-tabs" role="group" aria-label="Sign-in type">
    <button type="button" aria-pressed={loginRole==='parent'} disabled={signingIn} onClick={()=>chooseRole('parent')}><PortalGlyph name="accounts"/>Parent sign-in</button>
    <button type="button" aria-pressed={student} disabled={signingIn} onClick={()=>chooseRole('student')}><PortalGlyph name="tiers"/>Student sign-in</button>
    <button type="button" aria-pressed={admin} disabled={signingIn} onClick={()=>chooseRole('admin')}><PortalGlyph name="overview"/>BijakLearn Team</button>
   </div>
   {isLive&&!admin&&<PasswordSignIn key={loginRole} role={loginRole} onSubmit={onPassword} disabled={signingIn}/>}
   {isLive&&!admin&&<div className="signin-divider"><span>or</span></div>}
   <div className="signin-action">
    <div hidden={signingIn}>
     {isLive?<>{externalGoogle?<div id="google-signin" ref={googleButtonRef}/>:<OAuthLogin onToken={credential=>onToken(credential,modeRef.current)}/>}</>:<p role="status" className="signin-note">Account sign-in is not available on this site yet. Please contact your BijakLearn Team for the private learning app link.</p>}
    </div>
    {signingIn?<p className="signin-progress" role="status"><span aria-hidden="true"/> Signing in…</p>:externalGoogle&&!googleReady&&!issue&&<p className="signin-progress" role="status"><span aria-hidden="true"/> Loading Google sign-in…</p>}
   </div>
   {notice&&<p className="error" role="alert">{notice}</p>}
   {issue&&<p className="error" role="alert">{issue}</p>}
   {!admin&&!student&&<p className="signin-note">New parent accounts need approval from the BijakLearn Team.</p>}
   {!isLive&&demoEnabled&&<button type="button" onClick={()=>onToken('DEMO')}>Explore learning demo</button>}
  </section>
  <aside className="signin-programmes" aria-labelledby="signin-programmes-title">
   <div className="signin-programme-copy">
    <h2 id="signin-programmes-title">Learning for every school year</h2>
    <LearningEditionList/>
   </div>
  </aside>
  </div>
  <footer className="signin-footer"><BrandCredit/></footer>
 </main>;
}
function PwaControls({language='ms'}){
 const [online,setOnline]=useState(navigator.onLine);
 const [installEvent,setInstallEvent]=useState(null);
 const [standalone,setStandalone]=useState(window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true);
 const [showHelp,setShowHelp]=useState(false);
 useEffect(()=>{
  const onOnline=()=>setOnline(true);
  const onOffline=()=>setOnline(false);
  const onInstall=e=>{e.preventDefault();setInstallEvent(e)};
  const onInstalled=()=>{setInstallEvent(null);setStandalone(true)};
  window.addEventListener('online',onOnline);
  window.addEventListener('offline',onOffline);
  window.addEventListener('beforeinstallprompt',onInstall);
  window.addEventListener('appinstalled',onInstalled);
  return ()=>{
   window.removeEventListener('online',onOnline);
   window.removeEventListener('offline',onOffline);
   window.removeEventListener('beforeinstallprompt',onInstall);
   window.removeEventListener('appinstalled',onInstalled);
  };
 },[]);
 const install=async()=>{
  if(installEvent){await installEvent.prompt();setInstallEvent(null);return}
  setShowHelp(v=>!v);
 };
 return <div className="pwa-controls" aria-label={say(language,'install')}>
  <span className={'connection '+(online?'connected':'disconnected')} role="status">{online?'● '+say(language,'online'):'● '+say(language,'offline')}</span>
  {!nativeAccountService&&!standalone&&<button type="button" className="install-button" onClick={install}>📲 {say(language,'install')}</button>}
  {showHelp&&<p className="install-help">{say(language,'installHelp')}</p>}
  {!online&&<p className="install-help">{say(language,'offlineHelp')}</p>}
 </div>;
}
function HomeToolCard({icon,label,description,onOpen}){
 return <button type="button" className="home-tool-card" onClick={onOpen}>
  <span className="home-tool-icon" aria-hidden="true"><StudyGlyph icon={icon}/></span>
  <strong>{label}</strong>
  {description&&<small>{description}</small>}
 </button>;
}

function NavButton({icon,label,active,onClick}){return <button type="button" className={active?'active':''} aria-current={active?'page':undefined} onClick={onClick}><span aria-hidden="true"><StudyGlyph icon={icon}/></span> {label}</button>}
function App(){
 const [uiLanguage,setUiLanguage]=useState(()=>readLocale()||'ms');
 setUiLang(uiLanguage);
 const [welcomeDone,setWelcomeDone]=useState(true);
 useEffect(()=>{document.documentElement.lang=uiLanguage},[uiLanguage]);
 const [token,setToken]=useState(''),[boot,setBoot]=useState(null),[childId,setChildId]=useState(''),[qIndex,setQIndex]=useState(0),[answer,setAnswer]=useState(''),[hints,setHints]=useState(0),[result,setResult]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[pin,setPin]=useState(''),[oldPin,setOldPin]=useState(''),[report,setReport]=useState(null),[newName,setNewName]=useState(''),[year,setYear]=useState(1),[school,setSchool]=useState('SK'),[language,setLanguage]=useState('ms');
 const child=boot?.children?.find(x=>x.id===childId);
 const [previewEdition,setPreviewEdition]=useState(JUNIOR);
 const edition=child?learningEditionForYear(child.year)||JUNIOR:previewEdition;
 const primaryYears=useMemo(()=>edition.years.filter(level=>level>0),[edition]);
 const schoolNow=child?.school||school;
 const activeLessons=useMemo(()=>{
  const catalogue=schoolNow==='SJKT'?lessonsForSchool(RAW_LESSONS,'SJKT',TAMIL_CONTENT):LESSONS;
  return catalogue.filter(item=>inLearningEdition(edition,item.year));
 },[schoolNow,edition]);
 liveLessons=activeLessons;
 const bootLessons=useMemo(()=>isLive?
  (boot?.lessons||[]).filter(item=>inLearningEdition(edition,item.year)):
  activeLessons.map(listLesson),[boot,activeLessons,edition]);
 // Choosing an SJKT pathway switches the whole app to Tamil (the child can still change language afterwards).
 const lastSchool=useRef(schoolNow);
 useEffect(()=>{
  if(lastSchool.current!==schoolNow&&schoolNow==='SJKT'){setUiLanguage('ta');try{writeLocale('ta')}catch{}}
  lastSchool.current=schoolNow;
 },[schoolNow]);
 const [routes,setRoutes]=useState([{page:'home'}]);
 const learningRoute=routes.at(-1);
 const route=learningRoute.editionId&&learningRoute.editionId!==edition.id?routes[0]:learningRoute;
 const editionRef=useRef(edition);
 useEffect(()=>{
  editionRef.current=edition;
  setRoutes(history=>history[1]&&history[1].editionId!==edition.id?history.slice(0,1):history);
 },[edition]);
 useEffect(()=>{
  if(!token||portalV2&&boot?.role!=='STUDENT')return;
  document.title=edition.name;
  return()=>{document.title=JUNIOR.name};
 },[edition,token,boot?.role]);
 const {page,lesson}=route;
 const mainRef=useRef(null);
 const restoreSubject=useRef(null);

 function setPage(next, context={}) {
  setRoutes(history=>{
   if(next==='home')return history.length===1?history:history.slice(0,1);
   const current=history.at(-1);
   if(current.page===next&&current.lesson===context.lesson&&current.subject===context.subject&&current.pathId===context.pathId)return history;
   return [...history,{page:next,editionId:edition.id,...context}];
  });
 }
 function resetLessonPractice() {
  setStudyTab('notes');
  setQIndex(0);
  setAnswer('');
  setHints(0);
  setResult(null);
 }
 function goBack() {
  const previous=routes.at(-2);
  if(!previous)return;
  if(page==='subject'&&previous.page==='home')restoreSubject.current=route;
  if(previous.page==='lesson'&&previous.lesson!==lesson)resetLessonPractice();
  setRoutes(history=>history.length>1?history.slice(0,-1):history);
 }
 useEffect(()=>{
  if(!mainRef.current)return;
  const previousSubject=restoreSubject.current;
  restoreSubject.current=null;
  if(page==='home'&&previousSubject){
   document.getElementById('subject-'+previousSubject.subjectId)?.focus({preventScroll:true});
   window.scrollTo({top:previousSubject.returnScroll,behavior:'instant'});
  }else{
   mainRef.current.focus({preventScroll:true});
   window.scrollTo({top:0,behavior:'instant'});
  }
 },[route]);
 const [progress,setProgress]=useState(mockProgress);
 const learner=childId||'guest';
 const currentProgress=progress[learner]||{lastLesson:null,activities:[],quizzes:[]};
 const selectedPath=PATHS.find(path=>path.id===route.pathId&&inLearningEdition(edition,path.year));
 const missed=!isLive&&(page==='home'||page==='review')?missedQuestions(mockAttempts,childId,activeLessons):[];
 const lastLesson=bootLessons?.find(item=>item.id===currentProgress.lastLesson);
 const relatedLessons=(bootLessons||[]).filter(item=>lesson&&item.subject===lesson.subject&&item.year===lesson.year&&(!item.school||item.school==='ALL'||item.school===(lesson.school||school)));
 const nextLesson=relatedLessons[relatedLessons.findIndex(item=>item.id===lesson?.id)+1];
 function updateProgress(field,value){
  if(isLive)return;
  const previous=mockProgress[learner]||{lastLesson:null,activities:[],quizzes:[]};
  if(field==='lastLesson'?previous.lastLesson===value:previous[field].includes(value))return;
  const updated=field==='lastLesson'?value:[...previous[field],value];
  mockProgress={...mockProgress,[learner]:{...previous,[field]:updated}};
  setProgress(mockProgress);
  persistDemo();
 }
 const [loginNotice,setLoginNotice]=useState('');
 const [signingIn,setSigningIn]=useState(false);
 const activeToken=useRef('');
 const loginAttempt=useRef(0);
 const [growthAudience,setGrowthAudience]=useState('junior'),[growthKind,setGrowthKind]=useState('ai');
 const [subjectPreference,chooseSubject]=useState('Matematik'),[browseChapter,setBrowseChapter]=useState('all'),[studyTab,setStudyTab]=useState('notes');
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

 const q=lesson?.questions[qIndex];
 const requestedYear=Number(child?.year??year);
 const browseYear=primaryYears.includes(requestedYear)?requestedYear:primaryYears[0];
 const browseSchool=schoolNow;
 const [showOptional,setShowOptional]=useState(false);
 const [lessonQuery,setLessonQuery]=useState('');
 const setBrowseSubject=subject=>{chooseSubject(subject);setLessonQuery('')};
 const subjectOptions=availableSubjects(browseSchool,browseYear,{includeOptional:showOptional});
 const selectedSubject=subjectOptions.some(subject=>subject.name===subjectPreference)?subjectPreference:'Matematik';
 const browseSubject=route.subject||selectedSubject;
 const subjectLessons=lessonsForSubject(bootLessons,browseSubject,browseYear,browseSchool);
 const chapters=[...new Set(subjectLessons.map(l=>l.chapter||'Fundamentals'))];
 const activeChapter=chapters.includes(browseChapter)?browseChapter:'all';
 const searchTerms=normalizedAnswer(lessonQuery).split(' ').filter(Boolean);
 const visibleLessons=subjectLessons.filter(lesson=>{
  const topic=lesson.chapter||'Fundamentals';
  const searchable=normalizedAnswer(lesson.title+' '+topic);
  return (activeChapter==='all'||topic===activeChapter)&&searchTerms.every(term=>searchable.includes(term));
 });
 const noSearchResults=subjectLessons.length>0&&visibleLessons.length===0;
 const [accountRevision]=useSheetRefresh(isLive&&!!token&&boot?.role==='STUDENT');
 const endSession=useCallback((notice='')=>{
  loginAttempt.current++;
  setSigningIn(false);
  const previous=activeToken.current;
  if(typeof previous==='string'&&previous.startsWith('bja1.'))directAccountCall('passwordSignOut',previous).catch(()=>{});
  accountUsesDirect=false;
  activeToken.current='';
  setToken('');
  setBoot(null);
  setChildId('');
  setResult(null);
  setReport(null);
  setUsageReport(null);
  setAnswer('');
  setPin('');
  setOldPin('');
  setNewName('');
  setPage('home');
  setError('');
  setLoginNotice(notice);
 },[]);
 useEffect(()=>{
  if(!isLive)return;
  const checkRestoredPage=event=>{
   if(event.persisted&&activeToken.current)endSession('Sign in again to reopen your account.');
  };
  window.addEventListener('pageshow',checkRestoredPage);
  return ()=>window.removeEventListener('pageshow',checkRestoredPage);
 },[endSession]);
 const authRequest=useCallback(async(method,...args)=>{
  const credential=activeToken.current;
  if(!credential)throw Error('Sign in again to continue.');
  try{
   const data=await api(method,credential,...args);
   if(activeToken.current!==credential)throw Error('Sign in again to continue.');
   return data;
  }catch(error){
   const notice=accountNotice(error);
   if(notice&&activeToken.current===credential)endSession(notice);
   throw error;
  }
 },[endSession]);
 const loadGrowthTrack=useCallback(id=>authRequest('getGrowthModule',id),[authRequest]);
 const checkGrowthAnswer=useCallback((id,answer)=>authRequest('checkGrowthAnswer',id,answer),[authRequest]);
 async function call(method,...args){
  setError('');setBusy(true);
  try{return await (isLive?authRequest(method,...args):api(method,token,...args))}
  catch(error){if(!isLive||activeToken.current===token)setError(error.message);throw error}
  finally{setBusy(false)}
 }
 const login=useCallback(async (input,role='parent')=>{
  const attempt=++loginAttempt.current;
  const withPassword=typeof input==='object'&&input!==null;
  const requestedRole=withPassword?input.role:role;
  activeToken.current='';
  accountUsesDirect=false;
  setLoginNotice('');
  setSigningIn(true);
  try{
   const credential=withPassword?(await directAccountCall('passwordSignIn',input)).token:input;
   if(attempt!==loginAttempt.current)return;
   const method=portalV2?'getPortalBootstrap':requestedRole==='student'?'getStudentBootstrap':'getBootstrap';
   const options=portalV2?[requestedRole,getReferralCode(),'owner-roles-v1']:[];
   let data,direct=false;
   if(withPassword||isLive&&!nativeAccountService&&portalV2){
    try{
     data=await directAccountCall('getPortalBootstrap',credential,requestedRole,...options.slice(1));
     direct=true;
    }catch(error){
     if(withPassword||!(error instanceof AccountConnectionError))throw error;
    }
   }
   if(attempt!==loginAttempt.current)return;
   if(!direct)data=await api(method,credential,...options);
   if(attempt!==loginAttempt.current)return;
   if(!data||!Array.isArray(data.children))throw new Error('Incomplete account response');
   if(data.role==='STUDENT'){setGrowthAudience('junior');setGrowthKind('ai');}
   const session=data.ownerRoleAccess?{idToken:credential,role:data.role.toLowerCase(),childId:data.role==='STUDENT'?data.children[0]?.id||'':''}:credential;
   accountUsesDirect=direct;
   activeToken.current=session;
   setBoot({...data,passwordAccess:withPassword});
   setChildId(data.children[0]?.id||'');
   setPage('home');
   setToken(session);
   setSigningIn(false);
  }catch(error){
   if(attempt===loginAttempt.current)endSession(withPassword?(accountNotice(error)||error.message):signInFailure(error,requestedRole));
  }
 },[endSession]);
 async function refresh(){const b=await call(portalV2?'getPortalBootstrap':boot?.role==='STUDENT'?'getStudentBootstrap':'getBootstrap',...(portalV2?[boot?.role?.toLowerCase()]:[]));setBoot(b);if(!b.children.some(x=>x.id===childId))setChildId(b.children[0]?.id||'');}
 useEffect(()=>{if(accountRevision&&isLive&&token&&boot?.role==='STUDENT')refresh().catch(()=>{})},[accountRevision]);
 function toggleDemoSave(enabled){
  setRememberDemo(enabled);
  try{if(enabled){localStorage.setItem(DEMO_SAVE_CONSENT,'yes');persistDemo()}else{localStorage.removeItem(DEMO_SAVE_CONSENT);clearDemo()}}
  catch{setError('Local browser storage is not available on this device')}
 }
 async function resetDemo(){
  mockChildren=[];mockAttempts={};mockProgress={};setProgress({});mockPin='';clearDemo();setChildId('');setReport(null);await refresh();setPage('home')
 }
 async function createChild(e){e.preventDefault();try{const x=await call('addChild',{name:newName,year,school,language});await refresh();setChildId(x.id);setNewName('');setPage('home')}catch{}}
 async function openLesson(id,{quiz=false,questionId}={}){
  setError('');
  const listed=activeLessons.find(item=>item.id===id);
  if(!listed&&!(isLive&&bootLessons.some(item=>item.id===id))){setError('This study topic could not be found. Please choose another lesson.');return}
  try{
    // Reading is available to everyone in demo mode, even before a profile is made.
    // Never bypass authenticated access controls in the live backend.
    const l=isLive?await call('getLesson',childId,id):{...listed,questions:(listed.check||[]).map(q=>({id:q.id,mode:q.mode,text:q.text,options:q.options||[],transfer:!!q.transfer}))};
    if(editionRef.current!==edition||!inLearningEdition(edition,l.year))return;
    resetLessonPractice();
    if(quiz||questionId){
     setStudyTab('quiz');
     setQIndex(Math.max(0,l.questions.findIndex(question=>question.id===questionId)));
    }
    updateProgress('lastLesson',id);
    setPage('lesson',{lesson:{...l,activity:listed?.activity},review:Boolean(questionId)});
  }catch(e){setError('Unable to open the lesson: '+(e?.message||'unknown error'))}
 }
 async function recordPractice(question,response){
  if(isLive||!question.lessonId)return;
  await api('submitAttempt',token,childId,question.lessonId,question.id,response,0);
 }
 async function submit(){if(!q||!answer.trim())return;try{const r=await call('submitAttempt',childId,lesson.id,q.id,answer,hints);setResult(r)}catch{}}
 function next(){
  if(!route.review&&qIndex+1===lesson.questions.length)updateProgress('quizzes',lesson.id);
  setQIndex(x=>x+1);
  setAnswer('');
  setHints(0);
  setResult(null);
 }
 async function viewReport(){try{const r=await call('getParentReport',childId,pin);setReport(r);setUsageReport(summariseUsage(childId));setPage('parent')}catch{}}
 async function savePin(){try{await call('setParentPin',pin,oldPin);alert('Parent PIN saved. Keep it private.')}catch{}}

 if(!welcomeDone)return <WelcomeGate language={uiLanguage} onLanguage={setUiLanguage} onContinue={()=>{writeLocale(uiLanguage);setWelcomeDone(true)}}/>;
 if(!token)return <GoogleLogin onToken={login} onPassword={login} notice={loginNotice} signingIn={signingIn} language={uiLanguage}/>;
 if(portalV2&&['ADMIN','PARENT'].includes(boot?.role))return <RolePortals boot={boot} request={authRequest} onSignOut={()=>endSession()} language={uiLanguage}/>;
 return <div className="app" data-edition={edition.id}><header><button className="logo" onClick={()=>setPage('home')}><Brand edition={edition} subtitle={edition.label}/></button><div className="topactions"><PlayfulScene/><StreakChip language={uiLanguage}/>{isLive&&boot?.role==='STUDENT'&&<button disabled={busy} onClick={()=>refresh().catch(()=>{})}>Refresh account details</button>}<button type="button" className="language-switch" aria-label={say(uiLanguage,'change')} onClick={()=>setWelcomeDone(false)}><span aria-hidden="true">🌐</span> {LANGUAGES.find(l=>l.code===uiLanguage)?.name}</button><PwaControls language={uiLanguage}/><><span>{isLive?(boot?.user?.name||boot?.parent?.name):'Learning demo'}</span><button onClick={()=>endSession()}>{say(uiLanguage,'signOut')}</button></></div></header>
 {error&&<div role="alert" className="error">{error}<button onClick={()=>setError('')}>✕</button></div>}
 {portalV2&&isLive&&boot?.role==='STUDENT'&&<StudentUsage request={authRequest} page={page}/>}
 <nav className="nav" aria-label={say(uiLanguage,'navLabel')}>
  <div className="nav-group" role="group" aria-label={say(uiLanguage,'navLearn')}><span className="nav-title">{say(uiLanguage,'navLearn')}</span>
   <NavButton icon="🏠" label={say(uiLanguage,'home')} active={page==='home'} onClick={()=>setPage('home')}/>
   {edition===JUNIOR&&<NavButton icon="🐣" label={say(uiLanguage,'preschool')} active={page==='preschool'} onClick={()=>setPage('preschool')}/>}
   <NavButton icon="🚀" label={say(uiLanguage,'packs')} active={page==='packs'} onClick={()=>setPage('packs')}/>
   <NavButton icon="🗺️" label={say(uiLanguage,'map')} active={page==='map'} onClick={()=>setPage('map')}/>
   <NavButton icon="🤖" label={say(uiLanguage,'tutor')} active={page==='tutor'} onClick={()=>setPage('tutor')}/>
   <NavButton icon="🔬" label={say(uiLanguage,'science')} active={page==='science-lab'} onClick={()=>setPage('science-lab')}/>
   <NavButton icon="🧭" label="Field Studies" active={page==='field-studies'} onClick={()=>setPage('field-studies')}/>
   <NavButton icon="📚" label="Free Library"  active={page==='free-library'} onClick={()=>setPage('free-library')}/>
   <NavButton icon="🗣️" label="Learn a Language and Skill" active={page==='language-studio'} onClick={()=>setPage('language-studio')}/>
   <NavButton icon="📖" label="Picture Dictionary" active={page==='dictionary'} onClick={()=>setPage('dictionary')}/>
   <NavButton icon="📺" label="Learning Videos" active={page==='videos'} onClick={()=>setPage('videos')}/>
   <NavButton icon="🧮" label={say(uiLanguage,'maths')} active={page==='maths-studio'} onClick={()=>setPage('maths-studio')}/>
  </div>
  <div className="nav-group" role="group" aria-label={say(uiLanguage,'navPlay')}><span className="nav-title">{say(uiLanguage,'navPlay')}</span>
   <NavButton icon="✂️" label="Creative Projects" active={page==='creative-projects'} onClick={()=>setPage('creative-projects')}/>
   {isLive&&boot?.role==='STUDENT'&&child?.year>0&&<NavButton icon="📝" label="Year-end mock exams" active={page==='mock-exams'} onClick={()=>setPage('mock-exams')}/>}
   <NavButton icon="🎯" label={say(uiLanguage,'practice')} active={page==='practice'} onClick={()=>setPage('practice')}/>
   <NavButton icon="🔡" label={say(uiLanguage,'wordGame')} active={page==='wordgame'} onClick={()=>setPage('wordgame')}/>
   <NavButton icon="🎪" label={say(uiLanguage,'arcade')} active={page==='arcade'} onClick={()=>setPage('arcade')}/>
  </div>
  <div className="nav-group" role="group" aria-label={say(uiLanguage,'navGrow')}><span className="nav-title">{say(uiLanguage,'navGrow')}</span>
   {boot?.role!=='STUDENT'&&<NavButton icon="🧑‍🎓" label={say(uiLanguage,'adults')} active={page==='growth'&&growthAudience==='adult'} onClick={()=>{setGrowthAudience('adult');setGrowthKind('ai');setPage('growth')}}/>}
   <NavButton icon="🎒" label={say(uiLanguage,'juniorLab')} active={page==='growth'&&growthAudience==='junior'&&growthKind==='ai'} onClick={()=>{setGrowthAudience('junior');setGrowthKind('ai');setPage('growth')}}/>
   <NavButton icon="🧠" label={say(uiLanguage,'learnAI')} active={false} onClick={()=>{setGrowthKind('ai');setPage('growth')}}/>
   <NavButton icon="🎨" label={say(uiLanguage,'hobbies')} active={page==='growth'&&growthKind==='hobby'} onClick={()=>{setGrowthKind('hobby');setPage('growth')}}/>
   {isLive&&boot?.canManageAccounts&&<NavButton icon="🔑" label={say(uiLanguage,'manageAccess')} active={page==='account-access'} onClick={()=>setPage('account-access')}/>}
   {isLive&&boot?.role!=='STUDENT'&&<NavButton icon="👨‍👩‍👧" label={say(uiLanguage,'parentInsights')} active={page==='pin'} onClick={()=>setPage('pin')}/>}
   <NavButton icon="💚" label={say(uiLanguage,'membership')} active={page==='membership'} onClick={()=>setPage('membership')}/>
  </div>
 </nav>
 {(boot?.role==='STUDENT'||!isLive)&&!['mock-exams','free-library','videos'].includes(page)&&<LearningBalloon key={child?.id||'demo'} request={isLive?authRequest:null}/>}
 <main id="main-content"  ref={mainRef} tabIndex={-1}>
 {page!=='home'&&<nav className="page-controls" aria-label={say(uiLanguage,'pageNavigation')}>
  <button type="button" onClick={goBack}><span aria-hidden="true">←</span> {say(uiLanguage,'back')}</button>
  <button type="button" onClick={()=>setPage('home')}><span aria-hidden="true">🏠</span> {say(uiLanguage,'goHome')}</button>
 </nav>}
 {timeConsent&&<p className="time-child-notice" role="status">⏱️ {say(uiLanguage,'timeNotice')}</p>}
  {page==='home'&&!child&&<LearningEditionList active={edition} onChange={next=>{setPreviewEdition(next);setYear(next.years.find(level=>level>0));setLessonQuery('');setBrowseChapter('all')}}/>}
 <ModuleGate key={edition.id} moduleId={isLive?moduleForPage(page,growthAudience,growthKind):null} request={authRequest} onMembership={()=>setPage('membership')}>
 {page==='paths'&&<LearningPaths lessons={bootLessons} years={primaryYears} onOpen={openLesson} finished={currentProgress.activities}
  onLab={pathId=>setPage('lab',{pathId})} onReview={isLive?undefined:pathId=>setPage('review',{pathId})}/>}
 {page==='lab'&&selectedPath&&<PracticeLab key={selectedPath.id} path={selectedPath} onComplete={()=>updateProgress('activities',selectedPath.id)}/>}
 {page==='review'&&!isLive&&<ReviewQuestions items={selectedPath?missed.filter(item=>selectedPath.lessons.includes(item.lesson.id)):missed}
  onRetry={(id,questionId)=>openLesson(id,{questionId})}/>}
 {['dictionary','creative-projects'].includes(page)&&<PictureDictionary key={page} initialYear={child?.year??browseYear} years={edition.years} initialLanguage={uiLanguage} initialView={page==='creative-projects'?'projects':'words'} onOpenModule={setPage}/>}
 {page==='videos'&&<VideoLibrary request={isLive?authRequest:null} language={uiLanguage} years={primaryYears}/>}
 {page==='discovery'&&<DiscoveryLibrary availableLessons={bootLessons||[]} onOpen={openLesson}/>}
 {isLive&&boot?.canManageAccounts&&page==='account-access'&&<><AccountAccessPanel request={authRequest}/><StudentAccessPanel request={authRequest}/><KasihReviewPanel request={authRequest}/></>}
 {page==='maths-studio'&&<MathsStudio language={uiLanguage} lessons={activeLessons} initialYear={browseYear} years={primaryYears} school={browseSchool} onOpenLesson={openLesson}/>}
 {page==='science-lab'&&<ScienceLab language={uiLanguage}/>}
 {page==='language-studio'&&<LanguageStudio openSkill={()=>setPage('creative-projects')}/>}
 {page==='field-studies'&&<FieldStudies/>}
 {page==='free-library'&&<FreeLibrary openWordTiles={()=>setPage('wordgame')} request={isLive&&boot?.role==='STUDENT'?authRequest:undefined}/>}
 {page==='arcade'&&<ActivityArcade edition={edition}/>}
 {page==='wordgame'&&<WordTilesGame/>}
 {page==='growth'&&<GrowthHub key={growthAudience+'-'+growthKind} studentOnly={boot?.role==='STUDENT'} audience={growthAudience} initialKind={growthKind} onAudience={setGrowthAudience} onKind={setGrowthKind} loadTrack={isLive?loadGrowthTrack:null} checkAnswer={isLive?checkGrowthAnswer:null}/>}
 {page==='mock-exams'&&isLive&&boot?.role==='STUDENT'&&<MockExams request={authRequest}/>}
 {page==='practice'&&<PracticeArena lessons={activeLessons} year={browseYear} school={browseSchool} language={uiLanguage} onOpenLesson={openLesson} onAttempt={isLive?undefined:recordPractice}/>}
 {page==='tutor'&&<StudyBuddy lessons={activeLessons} year={browseYear} subject={lesson?.subject||''} currentLesson={lesson} askOnline={isLive?(question,context)=>authRequest('askTutor',question,context):null}/>}
 {page==='packs'&&<><div className="library-filters"><label>Learning pathway<select value={browseSchool} disabled={!!child} onChange={e=>setSchool(e.target.value)}>{['SK','SJKC','SJKT'].map(v=><option key={v}>{v}</option>)}</select></label><label>Year<select value={browseYear} disabled={!!child} onChange={e=>setYear(Number(e.target.value))}>{primaryYears.map(y=><option key={y} value={y}>Tahun {y}</option>)}</select></label><span className="library-hint">Short learning adventures created from available lessons</span></div><AdventurePacks lessons={activeLessons.filter(l=>(!l.school||l.school==='ALL'||l.school===browseSchool))} year={browseYear} school={browseSchool} childId={childId} attempts={isLive?{}:mockAttempts} onOpen={openLesson} onPreschool={edition===JUNIOR?()=>setPage('preschool'):undefined}/></>}
 {page==='preschool'&&edition===JUNIOR&&<PreschoolStudio/>}
 {page==='home'&&<>
  <div className="hero"><div><span className="eyebrow">{edition.label}</span>
   <h1>{edition===JUNIOR?say(uiLanguage,'heroTitle'):edition.name}</h1>
   <p>{edition===JUNIOR?say(uiLanguage,'heroText'):tx('Explore Years 4–6 lessons, practise across subjects and put your ideas to work in creative projects.')}</p></div>
   <div className="home-hero-actions">
    <a className="hero-plus-link" href="#study-library">{say(uiLanguage,'browseLibrary')}</a>
    {edition===JUNIOR&&<button type="button" className="preschool-launch" onClick={()=>setPage('preschool')}>🐣 {say(uiLanguage,'preschoolCta')}</button>}
   </div>
  </div>
 {boot?.role==='STUDENT'?<section className="panel"><h2>Your learning profile</h2><p>{child?.name} · {Number(child?.year)===0?tx('Preschool'):'Tahun '+browseYear} · {child?.school}</p><p>Your parent or BijakLearn Team manages your profile and membership.</p></section>:<section className="panel"><h2>{say(uiLanguage,'personaliseTitle')}</h2><div className="demo-save-settings"><div><strong>⭐ {say(uiLanguage,'nickTitle')}</strong><p>{say(uiLanguage,'nickText')}</p></div><label className="demo-save-check"><input type="checkbox" checked={rememberDemo} onChange={e=>toggleDemoSave(e.target.checked)}/> {say(uiLanguage,'rememberDevice')}</label><button type="button" onClick={resetDemo}>{say(uiLanguage,'clearSaved')}</button></div>{boot?.children.length?<div className="chips">{boot.children.map(c=><button key={c.id} className={childId===c.id?'selected':''} onClick={()=>setChildId(c.id)}>{c.name} · {say(uiLanguage,'yearWord')} {c.year}</button>)}</div>:<p>{say(uiLanguage,'noProfileText')}</p>}<details><summary>{say(uiLanguage,'addNickname')}</summary><form onSubmit={createChild} className="form"><label>{say(uiLanguage,'fictionalNickname')}<input required maxLength={40} value={newName} onChange={e=>setNewName(e.target.value)}/></label><label>{say(uiLanguage,'yearWord')}<select value={year} onChange={e=>setYear(Number(e.target.value))}>{[1,2,3,4,5,6].map(y=><option key={y} value={y}>{say(uiLanguage,'yearLabel',{n:y})}</option>)}</select></label><label>{say(uiLanguage,'schoolWord')}<select value={school} onChange={e=>setSchool(e.target.value)}>{['SK','SJKC','SJKT'].map(v=><option key={v}>{v}</option>)}</select></label><label>{say(uiLanguage,'languageWord')}<select value={language} onChange={e=>setLanguage(e.target.value)}>{Object.entries(langLabels).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select></label><button className="primary" disabled={busy}>{say(uiLanguage,'addProfile')}</button></form></details></section>}

 {!isLive&&<ContinueLearning lastLesson={lastLesson} activities={currentProgress.activities.length} quizzes={currentProgress.quizzes.length}
  missed={missed.length} onOpen={openLesson} onReview={()=>setPage('review')} onPaths={()=>setPage('paths')}/>}
 <section className="home-tools" aria-labelledby="home-study-tools">
  <h2 id="home-study-tools">{tx('Study and practise')}</h2>
  <div className="home-tool-grid">
   {[
    ['packs','📚','packs','packsTeaserText'],
    ['practice','🎯','practice','practiceTeaserText'],
    ['tutor','🤖','tutorTeaserTitle','tutorTeaserText'],
    ['maths-studio','🧮','maths','mathCardSub'],
    ['science-lab','🔬','science','sciCardSub'],
    ...(isLive?[['paths','🧭','learningPaths']]:[])
   ].map(([route,icon,label,description])=><HomeToolCard key={route} icon={icon} label={say(uiLanguage,label)} description={description&&say(uiLanguage,description)} onOpen={()=>setPage(route)}/>)}
  </div>
 </section>
 <section className="library-section" id="study-library">
   <div className="section-heading"><div><span className="mini-label">{say(uiLanguage,'libraryEyebrow')}</span><h2>{say(uiLanguage,'explore')}</h2><p>{say(uiLanguage,'libraryText')}</p></div><span className="heading-spark" aria-hidden="true">🌟</span></div>
   <div className="library-filters"><label>{tx("Learning pathway")} <select value={browseSchool} disabled={!!child} onChange={e=>{setSchool(e.target.value);setBrowseSubject('Matematik');setBrowseChapter('all')}}>{['SK','SJKC','SJKT'].map(v=><option key={v}>{v}</option>)}</select></label><label>{tx("School year")} <select value={browseYear} disabled={!!child} onChange={e=>{setYear(Number(e.target.value));setLessonQuery('');setBrowseChapter('all')}}>{primaryYears.map(v=><option key={v} value={v}>Tahun {v}</option>)}</select></label><span className="library-hint">{child?'Showing subjects for '+child.name:'Browse without creating a learner'}</span></div>
   <div className="optional-subject-toggle"><button type="button" aria-pressed={showOptional} onClick={()=>setShowOptional(v=>!v)}>{showOptional?'Hide optional-language catalogues':'Show additional optional languages'} <span aria-hidden="true">{showOptional?'−':'+'}</span></button><small>{tx("Optional subjects vary by school.")}</small></div>
   <div className="subjects playful-subjects">{subjectOptions.map((subject,index)=>{
    const total=lessonCountForSubject(bootLessons,subject.name,browseYear,browseSchool);
    return <button type="button" className="subject subject-picker" id={'subject-'+subject.id}
     style={{'--card-hue':(index*43+185)%360}} key={subject.id}
     onClick={()=>{
      setBrowseSubject(subject.name);
      setBrowseChapter('all');
      setPage('subject',{subject:subject.name,subjectId:subject.id,returnScroll:window.scrollY});
     }}>
     <span className="subject-illustration" aria-hidden="true">{subject.icon}</span>
     <strong>{subject.name}</strong>
     <small>{total?total+' lessons to explore':tx('No lessons available')}</small>
     {total>0&&<span className="ready-dot">{say(uiLanguage,'lesson')} →</span>}
    </button>;
   })}</div>
 </section>
 <section className="home-tools" aria-labelledby="home-explore-tools">
  <h2 id="home-explore-tools">{tx('Explore more')}</h2>
  <div className="home-tool-grid">
   <HomeToolCard icon="📚" label="Free Library" description="Read EPUB books and find learning games." onOpen={()=>setPage('free-library')}/>
   <HomeToolCard icon="📖" label="Picture Dictionary" onOpen={()=>setPage('dictionary')}/>
   <HomeToolCard icon="🧩" label={say(uiLanguage,'discovery')} onOpen={()=>setPage('discovery')}/>
   <HomeToolCard icon="🎪" label={say(uiLanguage,'arcade')} description={say(uiLanguage,'arcadeSub')} onOpen={()=>setPage('arcade')}/>
   <HomeToolCard icon="🔡" label={say(uiLanguage,'wordGame')} description={say(uiLanguage,'wordBotSub')} onOpen={()=>setPage('wordgame')}/>
   {[['ai','🤖','learnAI','aiSub'],['hobby','🌿','hobbies','hobbySub']].map(([kind,icon,label,description])=><HomeToolCard key={kind} icon={icon} label={say(uiLanguage,label)} description={say(uiLanguage,description)} onOpen={()=>{setGrowthAudience('junior');setGrowthKind(kind);setPage('growth')}}/>)}
  </div>
 </section>
 <div className="home-mascot-band"><div><h2>{say(uiLanguage,'greeting')}</h2><p>{say(uiLanguage,'touch')}</p></div><MascotFriends language={uiLanguage} compact/></div>
 </>}

 {(page==='map'||page==='subject')&&<section className={page==='subject'?'subject-page':'curriculum-map'}><div className="section-heading"><div><span className="mini-label">{tx("🗺️ EXPLORE ALL LESSONS")}</span><h1>{page==='subject'?browseSubject:tx('My Learning Adventure')}</h1><p>{page==='subject'
 ? 'Tahun '+browseYear+' · '+browseSchool+' · '+subjectLessons.length+' '+(subjectLessons.length===1?tx('lesson'):tx('lessons'))
 : tx('Choose your preferred learning pathway, level and topic. These are supplementary lessons, not school classes or exams.')}</p></div></div>
 {page==='map'&&<><div className="library-filters"><label>{tx("Learning pathway")}<select value={browseSchool} disabled={!!child} onChange={e=>{setSchool(e.target.value);setBrowseSubject('Matematik');setBrowseChapter('all')}}>{['SK','SJKC','SJKT'].map(v=><option key={v}>{v}</option>)}</select></label><label>{tx("Year")}<select value={browseYear} disabled={!!child} onChange={e=>{setYear(Number(e.target.value));setLessonQuery('');setBrowseChapter('all')}}>{primaryYears.map(v=><option key={v} value={v}>Tahun {v}</option>)}</select></label><label>{tx("Subject")}<select value={browseSubject} onChange={e=>{setBrowseSubject(e.target.value);setBrowseChapter('all')}}>{subjectOptions.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></label></div>
 {browseSchool==='SK'&&<label className="map-optional"><input type="checkbox" checked={showOptional} onChange={event=>setShowOptional(event.target.checked)}/> {tx("Show optional languages")}</label>}</>}
 <SubjectMindMap key={browseSubject} subject={browseSubject}/>
 {subjectLessons.length>0&&<LessonSearch query={lessonQuery} onChange={setLessonQuery} count={visibleLessons.length}/>}
 <div className="chapter-chips" aria-label={tx("Filter lessons by topic")}><button type="button" aria-pressed={activeChapter==='all'} className={activeChapter==='all'?'selected':''} onClick={()=>setBrowseChapter('all')}>{tx("All topics")}</button>{chapters.map(ch=><button type="button" key={ch} aria-pressed={activeChapter===ch} className={activeChapter===ch?'selected':''} onClick={()=>setBrowseChapter(ch)}>{ch}</button>)}</div>
 <div className="cards lesson-shelf">{visibleLessons.map((l,i)=><button type="button" className="lesson illustrated-lesson" key={l.id} onClick={()=>openLesson(l.id)}><span className="lesson-art" aria-hidden="true">{l.icon}</span><span className="lesson-index">LESSON {i+1}</span><strong>{l.title}</strong><small>{l.chapter||l.subject} · Tahun {l.year}</small><span className="lesson-link">{tx("📖 Open lesson →")}</span></button>)}</div>
 {noSearchResults&&<p className="lesson-no-results">{tx("No matching lessons.")} <button type="button" onClick={()=>{setLessonQuery('');setBrowseChapter('all')}}>{tx("Clear filters")}</button></p>}
 {!subjectLessons.length&&<div className="empty-library"><h2>{tx("No lessons available")}</h2><p>{tx("Choose another year or subject to find lessons you can open.")}</p><button type="button" className="primary" onClick={()=>{setBrowseSubject('Matematik');setBrowseChapter('all');setPage('map')}}>Explore Tahun {browseYear} Mathematics</button></div>}
 </section>}

 {page==='lesson'&&lesson&&<div className="lesson-reader">
  <div className="lessonhead colourful-lessonhead"><span className="lesson-head-art" aria-hidden="true">{lesson.icon}</span><div><span className="mini-label">{lesson.subject} • TAHUN {lesson.year}</span><h1>{lesson.title}</h1><p>{tx("Discover the idea, study the examples, then test your understanding.")}</p></div></div>
  <LessonNavigation active={studyTab} onChange={setStudyTab} questionCount={lesson.questions.length} onTutor={()=>setPage('tutor',{lesson})}/>
  <div id="lesson-panel" role="tabpanel" aria-labelledby={'lesson-tab-'+studyTab} tabIndex={0}>
  {studyTab==='notes'?<>
   <LearningVisuals title={lesson.title} subject={lesson.subject}/>
   <div className="panel study-summary"><span className="mini-label">{tx("💡 LET'S UNDERSTAND")}</span><h2>{tx("What will I learn?")}</h2><p className="large-reading">{lesson.summary}</p>{lesson.visual&&<div className="visual-example" role="note"><span className="visual-symbol" aria-hidden="true">{lesson.icon}</span><div><strong>{tx("👀 Look at this example")}</strong><p>{lesson.visual}</p></div></div>}</div>
   <section className="study-chapter"><div className="section-heading"><div><span className="mini-label">{tx("🪜 ONE STEP AT A TIME")}</span><h2>{tx("Let's learn together")}</h2></div></div><div className="study-steps">{(lesson.steps||[]).map((s,i)=><article className="study-step" key={i}><span className="step-number">{i+1}</span><div><h3>{s.title}</h3><p>{s.body}</p></div><span className="step-emoji" aria-hidden="true">{['🔎','🧠','✨'][i%3]}</span></article>)}</div></section>
   {lesson.enrichment&&<LearningMission enrichment={lesson.enrichment} title={lesson.title}/>}
   {lesson.activity&&(lesson.activity.kind
    ? <DiscoveryActivity key={lesson.id} activity={lesson.activity} language={uiLanguage} onComplete={()=>updateProgress('activities',lesson.id)}/>
    : <LessonQuickCheck key={lesson.id} question={lesson.activity} onComplete={()=>updateProgress('activities',lesson.id)}/>)}
   <div className="study-cta"><div><strong>{tx("Ready for a challenge?")}</strong><p>{tx("Try the questions when you understand the lesson.")}</p></div><button type="button" className="primary" onClick={()=>{setStudyTab('quiz');setQIndex(0);setResult(null);setAnswer('');setHints(0)}}>{tx("Start practice →")}</button></div>
  </>:studyTab==='map'?<LearningMindMap key={lesson.id} title={lesson.title} icon={lesson.icon}
   branches={lesson.mind?.length?lesson.mind:[['Idea utama',lesson.summary],...lesson.steps.map(step=>[step.title,step.body])]}/>:<section className="panel quiz colour-quiz"><div className="quiz-progress"><span>{tx("🎯 Practice challenge")}</span><span>{Math.min(qIndex+1,lesson.questions.length)} / {lesson.questions.length}</span></div><div className="progress-track"><div style={{width:(100*Math.min(qIndex,lesson.questions.length)/Math.max(1,lesson.questions.length))+'%'}}/></div>{q?<><h2>{q.text}</h2>{q.options.length?<div className="choices">{q.options.map(x=><button type="button" className={answer===x?'selected':''} key={x} disabled={!!result} onClick={()=>setAnswer(x)}>{x}</button>)}</div>:<label>{tx("Your answer")}<input autoComplete="off" inputMode={q.mode==='number'?'decimal':'text'} value={answer} disabled={!!result} onChange={e=>setAnswer(e.target.value)} placeholder={tx("Type your answer here")}/></label>}<div className="actions">{!result?<><button type="button" onClick={()=>setHints(h=>h+1)}>💡 Hint {hints? '('+hints+' used)':''}</button><button type="button" className="primary" disabled={busy||!answer.trim()} onClick={submit}>{tx("Check my answer")}</button></>:<><button type="button" onClick={()=>{setAnswer('');setResult(null);setHints(x=>x+1)}}>{tx("Try with guidance")}</button><button type="button" className="primary" onClick={next}>{tx("Next question →")}</button></>}</div>{hints>0&&!result&&<p className="hint">{tx("Try drawing the objects or using your fingers. What changes when you move one?")}</p>}{result&&<div className={'feedback '+(result.correct?'good':'gentle')}><strong>{result.correct?'🌟 Wonderful effort!':'💛 Good try — we learn from mistakes!'}</strong>{result.correct&&<div className="celebrate-stars" aria-hidden="true">⭐ ✨ 🎉 ✨ ⭐</div>}<p>{result.feedback}</p>{!result.correct&&result.suggestedAnswer!==undefined&&<p>{tx("Worked answer:")} <strong>{result.suggestedAnswer}</strong></p>}<p>{result.mastery.mastered?'⭐ Great independent practice! Keep exploring.':'Keep practising in different ways. One correct answer alone never passes a topic.'}</p></div>}</>:<div className="feedback good"><h2>{tx("🎉 You explored all the questions!")}</h2><p>{tx("Keep revisiting the study content and try again with fresh examples.")}</p><button type="button" className="primary" onClick={()=>{setQIndex(0);setAnswer('');setResult(null);setHints(0)}}>{tx("Practice again")}</button><button type="button" onClick={()=>setStudyTab('notes')}>{tx("Review study notes")}</button>{nextLesson&&<button type="button" onClick={()=>openLesson(nextLesson.id)}>Next lesson: {nextLesson.title}</button>}</div>}</section>}
  </div>
  <p className="reader-footer-note">Practice feedback supports learning; this is not a certified school assessment.</p>
 </div>}

 {page==='pin'&&<div className="panel narrow"><h1>{tx("🔒 Parent-only learning reports")}</h1><p>{tx("Parents use a six-digit PIN to view their child's progress. Set a PIN on your first visit.")}</p><label>{tx("Parent PIN")}<input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value)} placeholder={tx("6 digits")}/></label><label>Existing PIN (only when replacing)<input type="password" inputMode="numeric" maxLength={6} value={oldPin} onChange={e=>setOldPin(e.target.value)} placeholder={tx("Leave blank for first setup")}/></label><div className="actions"><button onClick={savePin} disabled={pin.length!==6||busy}>{tx("Set or replace PIN")}</button><button className="primary" onClick={viewReport} disabled={pin.length!==6||!childId||busy}>{tx("View child report")}</button></div><small>{isLive?'Protect this PIN and use separate parent and child accounts.':'This is a local preview, not secure child monitoring. A child with browser access can inspect or clear local information. Use distinct authenticated parent and child accounts for real families.'}</small></div>}
 {page==='parent'&&report&&<section className="panel learning-time-panel" aria-label={tx("Parent learning time report")}>
 <h2>⏱️ Learning Time & Breaks</h2>
 <p>{tx("This optional report measures approximate time while the app is visible and a learner is interacting. It cannot see other apps or confirm why a session stopped.")}</p>
 {!timeConsent?<div className="time-consent"><p><strong>{tx("Parent opt-in required.")}</strong> {tx("Children will see a short notice when this feature is enabled. The detailed report is shown only after the parent PIN check.")}</p><button type="button" className="primary" onClick={optIntoTracking}>{tx("Enable learning-time recording")}</button></div>:
 <><div className="time-metrics">{[['Active minutes (7 days)',usageReport?.minutes7||0],['Study days (7 days)',usageReport?.activeDays||0],['App backgrounded (7 days)',usageReport?.backgroundEvents7||0]].map(([label,value])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
 <p className="time-small">Last observed activity: {usageReport?.lastSeen?new Date(usageReport.lastSeen).toLocaleString():'No study activity recorded yet'}. “App backgrounded” can mean switching apps, locking the device, navigating away, or an interruption; it is not proof of cheating or force-closing.</p>
 <div className="time-days">{(usageReport?.days||[]).length?(usageReport?.days||[]).map(d=><div key={d.date}><strong>{d.date}</strong><span>{Math.round(d.seconds/60)} active min · {d.backgroundEvents} interruptions</span></div>):<p>{tx("No activity in the last seven days.")}</p>}</div>
 <div className="actions"><button type="button" onClick={()=>setUsageReport(summariseUsage(childId))}>{tx("Refresh report")}</button><button type="button" onClick={stopTracking}>{tx("Stop recording")}</button><button type="button" onClick={clearTracking}>{tx("Delete device usage history")}</button></div></>}
 <p className="time-small">Device-local preview: this report may be cleared or altered through browser settings. Reliable multi-device parent reporting requires separate parent/child accounts, consent controls and a private backend; no remote tracking is active on the public site.</p>
 </section>}
{page==='parent'&&report&&<><h1>👨‍👩‍👧 Parent Learning Intelligence</h1><p>Practice overview for {child?.name} — formative and not independently certified</p><div className="statgrid">{[['Practice milestones',report.mastered],['Practice attempts',report.attempts],['Independent attempts',report.independent],['Learning opportunities',report.errors]].map(([name,n])=><div className="stat" key={name}><strong>{n}</strong><span>{name}</span></div>)}</div><div className="panel"><h2>🕵️ Learning Detective</h2>{report.topics.length?report.topics.map(x=><p key={x.lessonId}><strong>{boot.lessons.find(l=>l.id===x.lessonId)?.title||x.lessonId}</strong> — {x.mastered?'Practice milestone reached (not certified)':'Needs more independent practice'} · {x.independent} independent answers</p>):<p>Complete a few lessons to begin building the learning profile.</p>}<p className="hint">We report observed evidence, not a diagnosis of intelligence or a fixed learning style.</p></div><div className="panel"><h2>💡 Suggested home activity</h2><p>Ask your child to explain a maths problem using household objects, then try a similar example with different quantities.</p></div></>}
 {page==='membership'&&<MembershipPage boot={boot} live={isLive} onApply={()=>setPage('premium-kasih')} onRefresh={()=>refresh().catch(()=>{})} onExplore={()=>setPage('map')}/>}
 {page==='premium-kasih'&&<PremiumKasihApplication student={boot?.role==='STUDENT'} request={authRequest} live={isLive} onSubmitted={()=>refresh().catch(()=>{})}/>}
 </ModuleGate>
 </main><footer><div>{say(uiLanguage,'footerLine',{edition:edition.name,mode:say(uiLanguage,isLive?'modeLive':'modePreview')})}</div><div className="proease-footer">{say(uiLanguage,'footerRights',{year:new Date().getFullYear()})}</div></footer></div>
}
createRoot(document.getElementById('root')).render(<AppBoundary><App/>{!nativeAccountService&&<ReleaseUpdates/>}</AppBoundary>);

