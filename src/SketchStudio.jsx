import React,{useState} from 'react';
import {DrawingPad} from './PreschoolStudio.jsx';
const TASKS=[
 {title:'Draw a friendly whale',icon:'🐳',steps:['Start with a long, rounded oval for the body.','Add a tail at one end and a small eye.','Draw a spout and a few waves around the whale.'],tip:'Look at how the whale body joins to the tail.'},
 {title:'Draw a little house',icon:'🏠',steps:['Start with a big square or rectangle.','Add a triangle for the roof.','Draw a door, windows and something in the garden.'],tip:'Try using straight lines and clear corners.'},
 {title:'Draw a tree through the seasons',icon:'🌳',steps:['Draw a tall trunk and two branches.','Add a cloud of leaves above the branches.','Try adding flowers, fruit or falling leaves.'],tip:'Try small shapes as leaves to give the picture detail.'},
 {title:'Draw a cheerful sun',icon:'☀️',steps:['Draw a large circle in the middle.','Add several short rays around it.','Add a face, a cloud or a rainbow if you like.'],tip:'Practise making the rays spread out from the centre.'},
 {title:'Draw a colourful fish',icon:'🐠',steps:['Draw an oval for the body.','Add a triangular tail and two fins.','Draw scales or dots in a repeating pattern.'],tip:'Look at the difference between the round body and pointed tail.'},
 {title:'Draw a flowering plant',icon:'🌺',steps:['Draw a stem rising from a small patch of ground.','Add two leaves on either side.','Draw petals around the flower centre.'],tip:'Petals may be different sizes: practise gently rounded lines.'},
 {title:'Draw a butterfly',icon:'🦋',steps:['Draw a small long body.','Add a large wing on each side.','Make a matching pattern of dots and curves.'],tip:'Try making both sides similar, without needing perfection.'},
 {title:'Draw a bus',icon:'🚌',steps:['Start with a long rectangle.','Add two round wheels underneath.','Draw a front window and passenger windows.'],tip:'Compare the round wheels with the straight bus body.'},
 {title:'Draw a paper kite',icon:'🪁',steps:['Draw a large diamond shape.','Add crossed lines through its centre.','Draw a long tail with small bows.'],tip:'Try joining the four corners with straight lines.'},
 {title:'Draw your own story character',icon:'🧙',steps:['Start with a head shape and a simple body.','Choose a hairstyle, hat or uniform.','Add a prop and think of a friendly story.'],tip:'What makes your character special? Choose one detail and build on it.'}
];
export default function SketchStudio({index=0,onStar=()=>{}}){
 const task=TASKS[index%TASKS.length];
 const [checks,setChecks]=useState([]);
 const [finished,setFinished]=useState(false);
 const prompts=['I tried the main shape','I added a detail or pattern','I looked again and improved one part'];
 const complete=()=>{
  setFinished(true);
  if(checks.length>0)onStar();
 };
 return <div className="sketch-studio" aria-label="Free drawing practice with coaching">
   <h2>🖍️ Creative Sketchbook</h2>
   <div className="sketch-idea"><span aria-hidden="true">{task.icon}</span><div><h3>{task.title}</h3><p>Draw your own version. There is no single right picture.</p></div></div>
   <ol className="extra-craft-steps">{task.steps.map((step,i)=><li key={i}>{step}</li>)}</ol>
   <div className="sketch-paper"><DrawingPad letter="" freeDraw key={task.title}/></div>
   <div className="sketch-self-review"><strong>🎨 My artist check-in</strong><p>Before you finish, think about what you tried. Use the drawing check above for guidance on your lines.</p>
     {prompts.map((prompt,i)=><label key={i}><input type="checkbox" checked={checks.includes(i)} onChange={e=>setChecks(prev=>e.target.checked?[...prev,i]:prev.filter(v=>v!==i))}/>{prompt}</label>)}
     <button type="button" className="primary" onClick={complete}>🌟 Reflect on my picture</button>
     {finished&&<div className="extra-feedback success" role="status">{checks.length===0?'Choose a step you tried. You can improve one small part and try again.':checks.length===1?'Nice beginning! '+task.tip:checks.length===2?'Great progress! '+task.tip:'You reflected on shapes, details and improvement. That is how artists grow! '+task.tip}</div>}
   </div>
   <p className="extra-footer-note">The sketch feedback measures pen movement and uses your own check-in. It cannot see and understand your artwork or award a meaningful artistic grade.</p>
 </div>;
}
