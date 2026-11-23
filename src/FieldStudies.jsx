import React,{useState} from 'react';
const fields={
 'Everyday decisions':[
 ['Build a habit','A cue reminds you to start. A small action is easier to repeat.','After breakfast, which plan is easiest to repeat?',['Read one page','Read an entire library','Wait for a perfect day'],0,'Breakfast gives the action a regular starting point.'],
 ['Listen and check','People can hear the same message differently. Repeat the important detail in your own words.','A friend explains a meeting place. What checks your understanding?',['Walk away','Describe the place back to them','Repeat a different plan'],1,'Your friend can confirm or correct your description.'],
 ['Choose a fair test','Change one part of a routine and keep track of what happens.','How could you check whether packing at night helps?',['Guess on Monday','Compare two different families','Count forgotten items before and after'],2,'A record gives you something to compare.']
 ],
 'Map and earth skills':[
 ['Read a key','A map key explains what symbols mean. Different maps can use different symbols.','What should you check before calling a blue mark a pond?',['Paper size','The map key','The street name'],1,'The key tells you what that mapmaker meant.'],
 ['Follow a scale','A scale compares distance on paper with distance on the ground.','On a map, 1 cm means 2 km. What does 3 cm mean?',['6 km','5 km','3 km'],0,'Three equal sections of 2 km make 6 km.'],
 ['Trace water','Water flows downhill. A watershed is land that drains to a common outlet.','Where will rain running off a hill usually travel?',['Straight uphill','Into the sky','Towards lower ground'],2,'Gravity moves runoff downhill.']
 ]
};
export default function FieldStudies(){
 const [track,setTrack]=useState(Object.keys(fields)[0]),[index,setIndex]=useState(0),[answer,setAnswer]=useState(null);
 const lessons=fields[track],[title,body,question,choices,correct,why]=lessons[index];
 function move(i){setIndex(i);setAnswer(null)}
 return <section className="field-studies panel"><h1>Field Studies</h1><label>Study module <select value={track} onChange={e=>{setTrack(e.target.value);move(0)}}>{Object.keys(fields).map(k=><option key={k}>{k}</option>)}</select></label>
 <nav aria-label="Field lessons">{lessons.map(([name],i)=><button key={name} aria-pressed={index===i} onClick={()=>move(i)}>{name}</button>)}</nav>
 <article><h2>{title}</h2><p>{body}</p><h3>{question}</h3>{choices.map((c,i)=><button key={c} onClick={()=>setAnswer(i)}>{c}</button>)}
 {answer!==null&&<p role="status">{answer===correct?'Correct. '+why:'Try again. Look for the clue in the lesson.'}</p>}{answer===correct&&index+1<lessons.length&&<button onClick={()=>move(index+1)}>Next lesson →</button>}</article></section>
}
