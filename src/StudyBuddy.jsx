import React,{useEffect,useRef,useState} from 'react';
import {tutorReply} from './tutorEngine.js';

const EXAMPLES=['Show 28 + 15 step by step','How do fractions work?','Explain why plants need water','What is a noun?','84 ÷ 4'];
function getSpeechLang(text){
 if(/[\u0B80-\u0BFF]/.test(text))return 'ta-IN';
 if(/[\u4E00-\u9FFF]/.test(text))return 'zh-CN';
 if(/[\u0600-\u06FF]/.test(text))return 'ar-SA';
 return /\b(berapa|mengapa|apakah|pecahan|suku kata|tumbuhan|tolak|tambah|darab|bahagi)\b/i.test(text)?'ms-MY':'en-US';
}
export default function StudyBuddy({lessons=[],year=1,subject='',currentLesson=null,askOnline=null}){
 const [question,setQuestion]=useState('');
 const [response,setResponse]=useState(null);
 const [busy,setBusy]=useState(false);
 const [status,setStatus]=useState('');
 const voiceRef=useRef(null),mounted=useRef(true);
 useEffect(()=>()=>{mounted.current=false;try{window.speechSynthesis?.cancel();voiceRef.current?.stop?.()}catch{}},[]);
 const speak=(text)=>{
   if(!('speechSynthesis' in window)){setStatus('Voice playback is not supported by this browser.');return}
   const read=String(text||'').slice(0,3000);
   window.speechSynthesis.cancel();
   const utterance=new SpeechSynthesisUtterance(read);
   utterance.lang=getSpeechLang(read);utterance.rate=.86;utterance.pitch=1.03;
   utterance.onerror=()=>setStatus('A suitable voice is not available on this device.');
   window.speechSynthesis.speak(utterance);
   setStatus('Reading the explanation aloud.');
 };
 const stopSpeech=()=>{window.speechSynthesis?.cancel();setStatus('Voice stopped.')};
 const listen=()=>{
   const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
   if(!SpeechRecognition){setStatus('Microphone dictation is not supported by this browser. You can type instead.');return}
   try{
     const rec=new SpeechRecognition();voiceRef.current=rec;rec.lang=subject==='Bahasa Melayu'?'ms-MY':subject==='Bahasa Cina'?'zh-CN':subject==='Bahasa Tamil'?'ta-IN':'en-US';rec.interimResults=false;rec.maxAlternatives=1;
     rec.onresult=e=>{const text=e.results?.[0]?.[0]?.transcript;if(text){setQuestion(text);setStatus('I heard: '+text)}};
     rec.onerror=e=>setStatus('Microphone unavailable: '+(e.error||'permission denied')+'. Try typing instead.');
     rec.onend=()=>{voiceRef.current=null};
     rec.start();setStatus('Listening… speak your question.');
   }catch{setStatus('Could not start microphone recognition. Try typing instead.')}
 };
 const ask=async(q=question)=>{
   const text=String(q||'').trim();if(!text)return;
   setQuestion(text);setBusy(true);setStatus('');
   try{
     let result=null;
     if(askOnline)try{result=await askOnline(text,{year,subject,lessonId:currentLesson?.id||null})}catch(e){setStatus('Online tutor unavailable. Showing available on-device guidance instead.')}
     if(!result||!Array.isArray(result.steps))result=tutorReply(text,lessons,{year,subject});
     if(mounted.current)setResponse(result);
   }finally{if(mounted.current)setBusy(false)}
 };
 const context=currentLesson?.title||subject||'All subjects';
 return <section className="tutor-page" aria-label="Interactive Study Buddy">
  <div className="tutor-hero"><div><span className="mini-label">🧠 STUDY BUDDY • ASK & LEARN</span><h1>Ask a question, understand each step!</h1><p>Try a calculation, ask about a topic or listen to a short explanation. Learn at your own pace.</p></div><span className="tutor-mascot" aria-hidden="true">🤖</span></div>
  <div className="tutor-box">
   <div className="tutor-context">📘 Current learning area: <strong>{context}</strong> · Tahun {year}</div>
   <div className="tutor-quick">{EXAMPLES.map(q=><button type="button" key={q} onClick={()=>ask(q)}>{q}</button>)}{currentLesson&&<button type="button" onClick={()=>ask('Explain '+currentLesson.title)}>Explain this lesson</button>}</div>
   <label htmlFor="study-buddy-question">What would you like to learn?</label>
   <textarea id="study-buddy-question" maxLength={500} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Example: Please show me how to calculate 28 + 15, step by step." onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();ask()}}}/>
   <div className="tutor-actions"><button type="button" className="primary" disabled={busy||!question.trim()} onClick={()=>ask()}>{busy?'Thinking…':'✨ Explain to me'}</button><button type="button" onClick={listen} aria-label="Speak your question">🎙️ Ask by voice</button>{response&&<><button type="button" onClick={()=>speak([response.title,...response.steps].join('. '))}>🔊 Read answer</button><button type="button" onClick={stopSpeech}>⏹ Stop</button></>}</div>
   {status&&<p role="status" className="tutor-status">{status}</p>}
   {response&&<section className="tutor-answer" aria-live="polite"><span className="mini-label">{response.kind==='math'?'🧮 WORKED METHOD':response.kind==='lesson'?'📚 EXPLAIN A CONCEPT':'💡 STUDY GUIDANCE'}</span><h2>{response.title}</h2><ol>{response.steps.map((step,i)=><li key={i}>{step}</li>)}</ol>{response.source&&<p className="tutor-answer-note">Source: {response.source}</p>}{response.lessonId&&<p className="tutor-answer-note">You can open the matching topic in the subject library for its practice activities.</p>}</section>}
   <p className="tutor-footnote">This on-device helper explains checked arithmetic and retrieves explanations from available lessons. It is not a live generative AI chatbot on the public site. Speech recognition and text-to-speech depend on browser permissions and installed voices; responses may contain mistakes and should be checked with a teacher.</p>
  </div>
 </section>;
}
