import React,{useState} from 'react';
/**
 * Short age-appropriate retrieval and hands-on practice.
 * A reflection is not a test score; no child text is stored or transmitted.
 */
export default function LearningMission({enrichment,title}){
 const [response,setResponse]=useState('');
 const [confidence,setConfidence]=useState('');
 const [feedback,setFeedback]=useState('');
 if(!enrichment)return null;
 const check=()=>{
  const count=response.trim().split(/\s+/).filter(Boolean).length;
  if(!response.trim()){setFeedback('Try writing one thing you noticed, or tell it to a family member. No perfect answer is needed.');return}
  if(count<5){setFeedback('You have started. Add an example or explain why the idea works in your own words.');return}
  setFeedback('You explained your thinking with detail! Now compare your idea with the example above, correct any mistakes, and try a new situation.');
 };
 return <section className="discovery-mission" aria-label="Explore and reflect on this supplementary lesson">
  <div className="discovery-mission-head"><span aria-hidden="true">🚀</span><div><span className="mini-label">SUPPLEMENTARY LEARNING MISSION</span><h2>Explore beyond the lesson</h2><p>Learning level: {enrichment.stage}. There is no exam or pressure to get everything right.</p></div></div>
  <div className="discovery-mission-task"><strong>🎯 Try this at home or with an adult</strong><p>{enrichment.mission}</p><p className="discovery-mission-prompt">{enrichment.prompt}</p></div>
  <label className="discovery-reflection"><strong>💬 Teach it back: what did you discover?</strong><span>You can type an idea here or explain it aloud to someone you trust. Keep names and private details out.</span><textarea rows={3} value={response} maxLength={500} onChange={e=>{setResponse(e.target.value);setFeedback('')}} placeholder={'For '+title+', I noticed that…'}/></label>
  <div className="discovery-reflect-actions"><button type="button" onClick={check}>✨ Get reflection tips</button><button type="button" onClick={()=>{setResponse('');setConfidence('');setFeedback('')}}>↺ Try a new explanation</button></div>
  {feedback&&<div className="discovery-feedback" role="status" aria-live="polite">{feedback}</div>}
  <div className="discovery-confidence"><p>How do you feel about the idea?</p><div role="group" aria-label="Choose how confident you feel">{[['explore','🌱 Still exploring'],['progress','🌟 Getting better'],['share','🚀 I can explain']].map(([id,label])=><button type="button" key={id} aria-pressed={confidence===id} onClick={()=>setConfidence(id)}>{label}</button>)}</div>{confidence&&<small role="status">{confidence==='explore'?'Go back to the example and try a smaller part.':confidence==='progress'?'Practise one more example to strengthen your understanding.':'Explain it to someone else and ask them a question.'}</small>}</div>
  <p className="discovery-privacy">This note stays on this screen only. It is not saved, sent to an AI service or used as a correctness grade.</p>
 </section>;
}
