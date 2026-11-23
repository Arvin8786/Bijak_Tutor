import {NoticePublisher,ParentNoticePopup} from './ParentNotices.jsx';
import {learningEditionForYear} from './learningEditions.js';
import {useSheetRefresh} from './sheetRefresh.js';
import Brand,{APP_ICON,PortalGlyph,BrandCredit} from './Brand.jsx';
import React,{useEffect,useRef,useState} from 'react';
import AccountAccessPanel from './AccountAccessPanel.jsx';
import StudentAccessPanel from './StudentAccessPanel.jsx';
import KasihReviewPanel from './KasihReviewPanel.jsx';
import FamilyCommerce from './FamilyCommerce.jsx';
import {ParentMockResults} from './MockExams.jsx';
import VideoAdminPanel from './VideoAdminPanel.jsx';
import PremiumKasihApplication from './PremiumKasihApplication.jsx';
import {setUiLang} from './i18n.js';
import {PORTAL_LANGUAGES,portalText,readPortalLanguage,writePortalLanguage} from './portalLocale.js';
import './role-portals.css';
import {ChildPasswordFields,FamilyPasswordSettings} from './PasswordSettings.jsx';

const minutes=seconds=>Math.round((seconds||0)/60)+' min';
function useRemote(request,method,refresh){
 const [result,setResult]=useState({data:null,error:''});
 useEffect(()=>{if(!method)return;let active=true;request(method).then(data=>{if(active)setResult({data,error:''})}).catch(error=>{if(active)setResult({data:null,error:error.message})});return()=>{active=false}},[request,method,refresh]);return result;
}
function RemoteState({result}){return result.error?<p role="alert" className="error">{result.error}</p>:!result.data?<p role="status">Loading…</p>:null}
export function StudentUsage({request,page}){
 useEffect(()=>{
  let lastActivity=Date.now(),lastTick=Date.now(),busy=false;
  const touch=()=>{lastActivity=Date.now()};
  const tick=async baseline=>{
   const now=Date.now(),elapsed=Math.min(60,Math.floor((now-lastTick)/1000));lastTick=now;
   if(busy||(!baseline&&(document.visibilityState!=='visible'||now-lastActivity>90000)))return;
   busy=true;try{await request('recordStudentUsage',crypto.randomUUID(),String(page).replace(/[^a-z0-9-]/g,'').slice(0,50)||'home',baseline?0:elapsed)}catch{}finally{busy=false}
  };
  tick(true);const timer=setInterval(()=>tick(false),30000);
  for(const event of ['pointerdown','keydown','scroll'])window.addEventListener(event,touch,{passive:true});
  return()=>{clearInterval(timer);for(const event of ['pointerdown','keydown','scroll'])window.removeEventListener(event,touch)};
 },[request,page]);return null;
}
export function RolePortals({boot,request,onSignOut}){
 const admin=boot.role==='ADMIN';
 const tabs=admin?[['overview','Overview & usage'],['accounts','Access & family links'],['enrolments','Enrolment approvals'],['tiers','Module & tier settings'],['videos','Educational videos'],['payments','Payment controls'],['offers','Discounts & referrals'],['kasih','Premium Kasih approvals'],['feedback','Parent feedback'],['notices','Parent notices']]:[['reports','Child reports'],['mock-results','Mock exam results'],['enrol','Enrol a child'],['feedback','Comments & suggestions'],['membership','Membership & payments'],['referrals','Referrals & earnings'],['kasih','Premium Kasih'],['password','Password sign-in']];
 const [language,setLanguage]=useState(()=>admin?'en':readPortalLanguage());
 const lang=admin?'en':language,t=text=>portalText(lang,text);
 setUiLang(lang);
 const chooseLanguage=code=>{setLanguage(code);writePortalLanguage(code)};
 const [page,setPage]=useState(tabs[0][0]),[refresh,setRefresh]=useState(0),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [sheetRevision,reloadSheets]=useSheetRefresh();
 const [selectedChild,setSelectedChild]=useState(''),[editingChild,setEditingChild]=useState('');
 const overview=useRemote(request,admin?'getAdministrationOverview':'getParentDashboard',refresh+sheetRevision);
 async function mutate(method,...args){setBusy(true);setNotice('');try{const result=await request(method,...args);setRefresh(n=>n+1);setNotice(t('Saved successfully.'));return result}catch(error){setNotice(error.message);throw error}finally{setBusy(false)}}
 const passwordSettings=useRemote(request,!admin&&(page==='password'||editingChild)?'getPasswordSettings':null,refresh);
 const data=overview.data;
 const [dismissedExpiry,setDismissedExpiry]=useState('');
 const expiry=(data?.access??boot.access)?.expiresAt;
 const daysRemaining=(Date.parse(expiry)-Date.now())/86400000;
 const warnExpiry=!admin&&expiry!==dismissedExpiry&&daysRemaining<=7&&daysRemaining>=-1;
 const reportChildren=!admin&&Array.isArray(data?.children)?data.children:null;
 const children=reportChildren??boot.children??[];
 const editing=children.find(child=>child.id===editingChild);
 const selection=children.some(child=>child.id===selectedChild)?selectedChild:'';
 function openChild(id,edit=false){
  setSelectedChild(id);
  setEditingChild(edit?id:'');
  setPage('reports');
  setNotice('');
 }
 useEffect(()=>{
  if(page!=='reports'||!selection)return;
  const target=document.getElementById(editing?'child-profile-editor':'child-report-'+selection);
  if(target){target.focus({preventScroll:true});target.scrollIntoView({block:'start'});}
 },[selection,editing?.id,page,reportChildren?.some(child=>child.id===selection)]);

 const name=overview.data?.parent?.name||boot.user?.name||boot.parent?.name||'Welcome';
 const initials=name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
 return <div lang={lang} className={'portal-shell portal-'+(admin?'admin':'parent')}><header className="portal-header"><Brand subtitle={admin?'BijakLearn Team console':t('Parent dashboard')}/><div className="portal-user"><span className="portal-avatar" aria-hidden="true">{initials}</span><span className="portal-user-copy"><strong>{name}</strong></span>{!admin&&<label className="portal-language"><span>{t('Language')}</span><select aria-label={t('Language')} value={language} onChange={e=>chooseLanguage(e.target.value)}>{PORTAL_LANGUAGES.map(([code,name])=><option key={code} value={code}>{name}</option>)}</select></label>}<button onClick={onSignOut}>{admin?'Sign out':t('Sign out')}</button></div></header>
 <nav className="portal-nav" aria-label={admin?'BijakLearn Team navigation':t('Parent navigation')}><div className="portal-nav-label">{admin?'YOUR WORKSPACE':t('YOUR FAMILY SPACE')}</div>{tabs.map(([id,label])=><button key={id} aria-current={page===id?'page':undefined} onClick={()=>{setPage(id);setNotice('')}}><span className="portal-nav-icon"><PortalGlyph name={id}/></span><span>{admin?label:t(label)}</span><span className="portal-nav-arrow" aria-hidden="true">›</span></button>)}</nav>
  {warnExpiry&&<ExpiryNotice expiry={expiry} days={daysRemaining} onDismiss={()=>setDismissedExpiry(expiry)} onRenew={()=>{setDismissedExpiry(expiry);setPage('membership')}}/>}
 <main className="portal-main">{admin&&Number(data?.pendingReceiptCount)>0&&<p className="subscription-alert" role="status"><button type="button" onClick={()=>setPage('payments')}>Review {data.pendingReceiptCount} pending payment {data.pendingReceiptCount===1?'receipt':'receipts'}</button></p>}<section className="portal-welcome"><div><h1>{(label=>admin?label:t(label))(tabs.find(tab=>tab[0]===page)?.[1])}</h1>{(admin||page==='reports')&&<p className="portal-subtitle">{admin?'Manage accounts, memberships and parent notices.':t('Private reports for children linked to your verified parent Google account.')}</p>}</div><div className="portal-welcome-art" aria-hidden="true"><span className="portal-spark spark-one">✦</span><img src={APP_ICON} alt=""/><span className="portal-spark spark-two">✧</span></div></section>{notice&&<p className="portal-notice" role="status">{notice}</p>}<div className="actions"><button type="button" onClick={reloadSheets} disabled={busy}>Refresh records</button><small>Updates automatically every 15 seconds while this page is visible.</small>{admin&&data?.databaseUrl&&<a href={data.databaseUrl} target="_blank" rel="noopener noreferrer">Open linked database</a>}</div><RemoteState result={overview}/>
 {!admin&&page==='reports'&&<section className="panel child-directory" aria-labelledby="child-directory-title">
  <div className="child-directory-heading"><h2 id="child-directory-title">{t('Linked children')}</h2><button type="button" onClick={()=>{setPage('enrol');setNotice('')}}>{t('Add a child')}</button></div>
  {!children.length&&data&&<p>{t('No linked children yet.')}</p>}
  <div className="child-directory-grid">
   {children.map(child=>{
    const link=data?.enrolments?.find(record=>String(record.childId)===String(child.id));
    return <article className="child-directory-card" key={child.id}>
     <strong>{child.name}</strong>
     <span>{child.year===0?t('Preschool'):t('Year')+' '+child.year} · {child.school}</span>
     <span>{learningEditionForYear(child.year)?.name}</span>
     {link?.studentEmail&&<span>{link.studentEmail}</span>}
     <div><button type="button" aria-label={t('View progress')+' · '+child.name} onClick={()=>openChild(child.id)}>{t('View progress')}</button>
     <button type="button" aria-label={t('Edit profile')+' · '+child.name} onClick={()=>openChild(child.id,true)}>{t('Edit profile')}</button></div>
    </article>;
   })}
  </div>
 </section>}
 {!admin&&page==='reports'&&editing&&<ChildProfileEditor key={editing.id} child={editing} mutate={mutate} busy={busy} t={t} onClose={()=>setEditingChild('')}/>}
 {!admin&&page==='reports'&&editing&&<><RemoteState result={passwordSettings}/>{passwordSettings.data&&<FamilyPasswordSettings key={editing.id} child={editing} record={passwordSettings.data.children.find(row=>row.id===editing.id)} mutate={mutate} busy={busy}/>}</>}
 {!admin&&page==='password'&&<><RemoteState result={passwordSettings}/>{passwordSettings.data&&<FamilyPasswordSettings record={passwordSettings.data.parent} mutate={mutate} busy={busy} passwordAccess={boot.passwordAccess} email={boot.parent?.signInEmail||boot.parent?.email}/>}</>}

 {!admin&&page==='reports'&&selection&&children.length>1&&<button type="button" onClick={()=>{setSelectedChild('');setEditingChild('')}}>{t('Show all child reports')}</button>}
 {data&&admin&&page==='overview'&&<><div className="statgrid"><article className="stat"><strong>{data.children}</strong><span>Linked learner profiles</span></article><article className="stat"><strong>{minutes(data.reportedSeconds7Days)}</strong><span>Reported learning time · last 7 days</span></article></div><section className="panel service-settings"><h2>Service settings</h2><div className="service-status-grid">{Object.entries(data.settings||{}).map(([key,value])=><div className={'service-status '+(value?'is-ready':'needs-setup')} key={key}><span className="service-status-dot" aria-hidden="true"/><span>{({clientIdConfigured:'Google sign-in',spreadsheetConfigured:'Learning database',adminConfigured:'BijakLearn Team identity',pinPepperConfigured:'Private security settings',documentsConfigured:'Private document storage'})[key]||key.replace(/([A-Z])/g,' $1')}<strong>{value?'Configured':'Not configured'}</strong></span></div>)}</div><p>Secrets and private identifiers are never displayed here. Usage time is approximate activity reporting, not verified attendance.</p></section></>}
 {admin&&page==='accounts'&&<><AccountAccessPanel request={request} revision={sheetRevision+refresh}/><StudentAccessPanel request={request} revision={sheetRevision+refresh}/></>}
 {admin&&page==='enrolments'&&<EnrolmentApprovals request={request} refresh={refresh+sheetRevision} mutate={mutate} busy={busy}/>}
 {admin&&data&&page==='tiers'&&<><p>These controls determine which learning modules each membership can use. Account blocking always takes priority.</p>{data.modules.map(module=><ModulePolicy key={module.moduleId+refresh} module={module} mutate={mutate} busy={busy}/>)}</>}
 {admin&&page==='notices'&&<NoticePublisher request={request}/>}
 {admin&&page==='videos'&&<VideoAdminPanel request={request}/>}
 {admin&&page==='payments'&&<FamilyCommerce revision={sheetRevision+refresh} request={request} admin section="payments"/>}
 {admin&&page==='offers'&&<FamilyCommerce revision={sheetRevision+refresh} request={request} admin section="offers"/>}
 {admin&&page==='kasih'&&<KasihReviewPanel request={request} revision={sheetRevision+refresh}/>}
 {admin&&page==='feedback'&&<AdminFeedback request={request} refresh={refresh+sheetRevision} mutate={mutate} busy={busy}/>}
 {!admin&&data&&page==='reports'&&<><p>{t('Results below come from server-marked lesson checks. Games and practice that do not submit an assessment are not counted as test results. Reported activity time excludes hidden pages and extended inactivity and is approximate.')}</p>{data.children.filter(child=>!selection||selection===child.id).map(child=><section className="panel child-report" key={child.id} id={'child-report-'+child.id} tabIndex={-1}><h2>{child.name} · {child.year===0?t('Preschool'):t('Year')+' '+child.year}</h2><div className="statgrid">{[['Test attempts',child.attempts],['Correct answers',child.correct],['Accuracy',Number.isFinite(child.accuracy)?child.accuracy+'%':t('No tests yet')],['Practice milestones',child.mastered],['Reported learning time',minutes(child.reportedSeconds)]].map(([label,value])=><article className="stat" key={label}><strong>{value}</strong><span>{t(label)}</span></article>)}</div><h3>{t('Daily usage')}</h3>{child.dailyUsage.length?<ul>{child.dailyUsage.map(day=><li key={day.date}>{day.date}: {minutes(day.seconds)}</li>)}</ul>:<p>{t('No usage reported yet.')}</p>}<h3>{t('Recent test results')}</h3>{child.recent.length?<ul>{child.recent.map((attempt,i)=><li key={i}>{attempt.createdAt.slice(0,16).replace('T',' ')} · {attempt.lessonId}: {attempt.correct?t('Correct'):t('Needs practice')} · {attempt.hints} {t('hints')}</li>)}</ul>:<p>{t('No test results yet.')}</p>}</section>)}</>}
 {!admin&&data&&page==='enrol'&&<ParentEnrolment parent={data.parent} enrolments={data.enrolments} mutate={mutate} busy={busy} t={t}/>}
 {!admin&&data&&page==='feedback'&&<ParentFeedback feedback={data.feedback} mutate={mutate} busy={busy} t={t}/>}
 {!admin&&['membership','referrals'].includes(page)&&<FamilyCommerce revision={sheetRevision+refresh} request={request} section={page}/>}
 {!admin&&page==='mock-results'&&<ParentMockResults request={request} children={children}/>}
 {!admin&&page==='kasih'&&<PremiumKasihApplication request={request} live={true} student={false} onSubmitted={()=>setRefresh(n=>n+1)}/>}
 </main>{!admin&&<ParentNoticePopup request={request}/>}<footer className="portal-footer">BijakLearn Junior · {admin?'BijakLearn Team operations':t('Family reports')} · {t('Google account access is checked by the server.')}<BrandCredit language={lang}/></footer></div>;
}
function ChildProfileEditor({child,mutate,busy,t,onClose}){
 const [form,setForm]=useState({name:child.name,year:child.year,school:child.school||'SK',language:child.language||'ms'});
 function field(event){const {name,value}=event.target;setForm(previous=>({...previous,[name]:value}));}
 return <section className="panel child-report" id="child-profile-editor" tabIndex={-1}>
  <h2>{t('Edit profile')} · {child.name}</h2>
  <form className="portal-form" onSubmit={async event=>{
   event.preventDefault();
   try{await mutate('updateChildDetails',child.id,{...form,year:Number(form.year)});onClose()}catch{}
  }}>
   <label>{t('Child nickname')}<input name="name" value={form.name} onChange={field} required maxLength={40}/></label>
   <label>{t('School year')}<select name="year" value={form.year} onChange={field}>{[0,1,2,3,4,5,6].map(year=><option key={year} value={year}>{year===0?t('Preschool'):year}</option>)}</select></label>
   <label>{t('School stream')}<select name="school" value={form.school} onChange={field}>{['SK','SJKC','SJKT'].map(school=><option key={school}>{school}</option>)}</select></label>
   <label>{t('Learning language')}<select name="language" value={form.language} onChange={field}>{PORTAL_LANGUAGES.map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></label>
   <div className="actions"><button type="submit" className="primary" disabled={busy}>{t('Save profile')}</button><button type="button" onClick={onClose}>{t('Cancel')}</button></div>
  </form>
 </section>;
}
function ParentEnrolment({parent,enrolments,mutate,busy,t=x=>x}){
 const [form,setForm]=useState({requestId:crypto.randomUUID(),name:'',studentEmail:'',username:'',password:'',phoneNumber:'',year:1,school:'SK',language:'ms',consent:false});
 const [saved,setSaved]=useState(null);
 const change=(key,value)=>setForm(f=>({...f,[key]:value}));
 async function submit(event){
  event.preventDefault();
  try{
   const result=await mutate('submitParentEnrolment',{...form,year:Number(form.year)});
   setSaved(result.signIn);
   setForm(f=>({...f,requestId:crypto.randomUUID(),name:'',studentEmail:'',username:'',password:'',phoneNumber:'',consent:false}));
  }catch{}
 }
 return <>
  <section className="panel">
   <h2>{t('Add a child')}</h2>
   <p>{t('Parent account:')} <strong>{parent.email}</strong></p>
   {saved?.userId&&<p role="status" style={{overflowWrap:'anywhere'}}>Student username: <strong>{saved.username}</strong>. User ID: <strong>{saved.userId}</strong>.</p>}
   <form className="portal-form" onSubmit={submit}>
    <label>{t('Child nickname')}<input required maxLength={40} value={form.name} onChange={e=>change('name',e.target.value)}/></label>
    <ChildPasswordFields form={form} change={change}/>
    <label>Student Google email (optional)<input type="email" autoComplete="off" maxLength={254} value={form.studentEmail} onChange={e=>change('studentEmail',e.target.value)}/></label>
    <label>{t('School year')}<select value={form.year} onChange={e=>change('year',e.target.value)}>{[0,1,2,3,4,5,6].map(year=><option key={year} value={year}>{year===0?t('Preschool'):year}</option>)}</select></label>
    <label>{t('School stream')}<select value={form.school} onChange={e=>change('school',e.target.value)}>{['SK','SJKC','SJKT'].map(stream=><option key={stream}>{stream}</option>)}</select></label>
    <label>{t('Learning language')}<select value={form.language} onChange={e=>change('language',e.target.value)}>{PORTAL_LANGUAGES.map(([code,name])=><option value={code} key={code}>{name}</option>)}</select></label>
    <label className="portal-check"><input type="checkbox" required checked={form.consent} onChange={e=>change('consent',e.target.checked)}/>{t('I am the parent or guardian and consent to pairing this student account and viewing its learning reports.')}</label>
    <button className="primary" disabled={busy}>{t('Add child account')}</button>
   </form>
  </section>
  <h2>{t('Enrolment requests')}</h2>
  {enrolments.length?enrolments.filter(r=>!['REMOVED','DECLINED'].includes(r.status)).map(r=><p key={r.id}>{r.name}{r.studentEmail?' · '+r.studentEmail:''} · {r.status==='PROFILE_MISSING'?'Disabled — profile missing; contact BijakLearn Team':r.status==='UNLINKED'&&!r.studentEmail?'Password sign-in':r.status}</p>):<p>{t('No enrolment requests yet.')}</p>}
 </>;
}
function EnrolmentApprovals({request,refresh,mutate,busy}){const result=useRemote(request,'listEnrolments',refresh);return <><RemoteState result={result}/>{result.data?.length===0&&<p>No enrolment requests.</p>}{result.data?.map(r=><section className="panel" key={r.requestId}><h2>{r.nickname}</h2><p>Parent: {r.parentEmail} · Student: {r.studentEmail}</p><p>Year {r.year} · {r.school} · Guardian consent recorded {r.consentAt} · {r.status}</p>{r.status==='PENDING'&&<div className="actions"><button disabled={busy} onClick={()=>mutate('reviewEnrolment',r.requestId,true).catch(()=>{})}>Approve pairing</button><button disabled={busy} onClick={()=>mutate('reviewEnrolment',r.requestId,false).catch(()=>{})}>Decline pairing</button></div>}</section>)}</>}
function ParentFeedback({feedback,mutate,busy,t=x=>x}){const [category,setCategory]=useState('SUGGESTION'),[text,setText]=useState('');return <><form className="panel portal-form" onSubmit={async e=>{e.preventDefault();try{await mutate('submitParentFeedback',category,text);setText('')}catch{}}}><h2>{t('Share a comment or improvement idea')}</h2><label>{t('Category')}<select value={category} onChange={e=>setCategory(e.target.value)}><option value="SUGGESTION">{t('Improvement suggestion')}</option><option value="COMMENT">{t('Comment')}</option><option value="ISSUE">{t('Report an issue')}</option></select></label><label>{t('Your message')}<textarea required minLength={5} maxLength={2000} value={text} onChange={e=>setText(e.target.value)}/></label><p>{t('Please do not include passwords, payment-card details or sensitive documents.')}</p><button disabled={busy} className="primary">{t('Send to BijakLearn Team')}</button></form><h2>{t('Your messages and replies')}</h2>{feedback.length?feedback.map(item=><article className="panel" key={item.id}><strong>{item.category} · {item.status}</strong><p>{item.message}</p>{item.reply&&<><h3>{t('BijakLearn Team reply')}</h3><p>{item.reply}</p></>}</article>):<p>{t('No messages yet.')}</p>}</>}
function AdminFeedback({request,refresh,mutate,busy}){const result=useRemote(request,'listParentFeedback',refresh),[drafts,setDrafts]=useState({});return <><RemoteState result={result}/>{result.data?.length===0&&<p>No parent feedback yet.</p>}{result.data?.map(item=><section className="panel" key={item.feedbackId}><h2>{item.category} · {item.status}</h2><p>{item.parentEmail} · {item.createdAt}</p><p>{item.message}</p>{item.reply&&<p>Previous reply: {item.reply}</p>}<form className="portal-form" onSubmit={e=>{e.preventDefault();mutate('replyParentFeedback',item.feedbackId,drafts[item.feedbackId]||'').catch(()=>{})}}><label>Reply to parent<textarea required maxLength={1500} value={drafts[item.feedbackId]||''} onChange={e=>setDrafts(d=>({...d,[item.feedbackId]:e.target.value}))}/></label><button disabled={busy}>Save reply</button></form></section>)}</>}
function ModulePolicy({module,mutate,busy}){const [form,setForm]=useState({...module,...Object.fromEntries(['enabled','free','premium','premiumKasih'].map(k=>[k,module[k]===true||String(module[k]).toUpperCase()==='TRUE']))});return <form className="panel portal-form" onSubmit={e=>{e.preventDefault();mutate('setModulePolicy',module.moduleId,{...form,freeLessonLimit:Number(form.freeLessonLimit)}).catch(()=>{})}}><h2>{module.title}</h2><div className="actions">{[['enabled','Enabled'],['free','Free'],['premium','Premium'],['premiumKasih','Premium Kasih']].map(([key,label])=><label className="portal-check" key={key}><input type="checkbox" checked={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.checked}))}/>{label}</label>)}</div><label>Free lesson limit<input type="number" min="0" max="1000" value={form.freeLessonLimit||0} onChange={e=>setForm(f=>({...f,freeLessonLimit:e.target.value}))}/></label><button disabled={busy}>Save {module.title} policy</button></form>}
function PaymentControls({data,mutate,busy}){const [form,setForm]=useState({accountKey:'',reference:'',amountRM:'',status:'VERIFIED',note:''});return <><p>Manual payment review ledger. Verify evidence independently. These controls do not charge cards, transfer money, issue refunds or automatically grant membership. Assign membership under Access & family links after verification.</p><form className="panel portal-form" onSubmit={async e=>{e.preventDefault();try{await mutate('recordPaymentReview',{...form,amountRM:Number(form.amountRM)});setForm({...form,reference:'',amountRM:'',note:''})}catch{}}}><label>Family account<select required value={form.accountKey} onChange={e=>setForm(f=>({...f,accountKey:e.target.value}))}><option value="">Choose a family</option>{data.parents.map(p=><option key={p.id} value={p.id}>{p.email}</option>)}</select></label><label>Payment reference<input required minLength={3} maxLength={100} value={form.reference} onChange={e=>setForm(f=>({...f,reference:e.target.value}))}/></label><label>Amount (RM)<input required type="number" min="0.01" max="100000" step="0.01" value={form.amountRM} onChange={e=>setForm(f=>({...f,amountRM:e.target.value}))}/></label><label>Review status<select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="VERIFIED">Verified manually</option><option value="REJECTED">Rejected</option></select></label><label>Review note<textarea required maxLength={250} value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/></label><button disabled={busy}>Record payment review</button></form><h2>Recent payment records</h2>{data.payments.length?<div className="portal-table"><table><thead><tr><th>Reference</th><th>RM</th><th>Status</th><th>Reviewed</th></tr></thead><tbody>{data.payments.map(p=><tr key={p.paymentId}><td>{p.reference}</td><td>{Number(p.amountRM).toFixed(2)}</td><td>{p.status}</td><td>{p.verifiedAt}</td></tr>)}</tbody></table></div>:<p>No payment records.</p>}</>}

function ExpiryNotice({expiry,days,onDismiss,onRenew}){
 const dialog=useRef(null);
 useEffect(()=>{dialog.current?.showModal()},[]);
 const expiryLabel=new Intl.DateTimeFormat('en-MY',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(expiry));
 return <dialog ref={dialog} className="subscription-dialog" aria-labelledby="subscription-expiry-title" onCancel={onDismiss}>
  <h2 id="subscription-expiry-title">{days<=0?'Your renewal grace period':'Your subscription ends soon'}</h2>
  <p>Premium {days<=0?'ended':'ends'} on {expiryLabel} (Malaysia time).</p>
  <p>{days<=0?'Premium remains available for 24 hours after expiry while the team reviews any pending payment.':'Open memberships to renew monthly or choose a 12-month bundle.'}</p>
  <div className="actions"><button type="button" onClick={onRenew}>View renewal options</button><button type="button" onClick={onDismiss}>Close</button></div>
 </dialog>;
}
