import React,{useCallback,useEffect,useRef,useState} from 'react';
import {say} from './localization.js';

const W=1200,H=700;
const COLOURS=[['ink','#1f2a44','colInk'],['blue','#2563eb','colBlue'],['red','#dc2626','colRed'],['green','#15803d','colGreen']];
const SIZES=[['s',3,'sizeS'],['m',7,'sizeM'],['l',16,'sizeL']];

function paint(canvas,strokes){
 const ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,W,H);
 ctx.lineCap='round';ctx.lineJoin='round';
 for(const s of strokes){
  ctx.globalCompositeOperation=s.erase?'destination-out':'source-over';
  ctx.strokeStyle=s.colour;ctx.fillStyle=s.colour;ctx.lineWidth=s.width;
  if(s.points.length===1){ctx.beginPath();ctx.arc(s.points[0][0],s.points[0][1],s.width/2,0,Math.PI*2);ctx.fill();continue}
  ctx.beginPath();ctx.moveTo(s.points[0][0],s.points[0][1]);
  for(let i=1;i<s.points.length;i++){
   const [px,py]=s.points[i-1],[x,y]=s.points[i];
   ctx.quadraticCurveTo(px,py,(px+x)/2,(py+y)/2);
  }
  const last=s.points[s.points.length-1];ctx.lineTo(last[0],last[1]);ctx.stroke();
 }
 ctx.globalCompositeOperation='source-over';
}

// A simple whiteboard: pen, eraser, colours, sizes, undo/redo, clear and a choice of paper.
// The drawing is only kept in memory on this device. It is never uploaded.
export default function Whiteboard({language}){
 const t=key=>say(language,key);
 const canvasRef=useRef(null),drawing=useRef(null);
 const [strokes,setStrokes]=useState([]),[redo,setRedo]=useState([]);
 const [tool,setTool]=useState('pen'),[colour,setColour]=useState('ink'),[size,setSize]=useState('m'),[paper,setPaper]=useState('grid');
 const [confirmClear,setConfirmClear]=useState(false);

 useEffect(()=>{if(canvasRef.current)paint(canvasRef.current,strokes)},[strokes]);
 useEffect(()=>{if(!confirmClear)return;const id=setTimeout(()=>setConfirmClear(false),2500);return()=>clearTimeout(id)},[confirmClear]);

 const toPoint=useCallback(event=>{
  const rect=canvasRef.current.getBoundingClientRect();
  return [Math.round((event.clientX-rect.left)/rect.width*W),Math.round((event.clientY-rect.top)/rect.height*H)];
 },[]);

 const down=event=>{
  if(event.button>0&&event.pointerType==='mouse')return;
  event.preventDefault();
  try{canvasRef.current.setPointerCapture(event.pointerId)}catch{}
  const erase=tool==='eraser',width=SIZES.find(s=>s[0]===size)[1]*(erase?2.5:1);
  const stroke={erase,colour:COLOURS.find(c=>c[0]===colour)[1],width,points:[toPoint(event)]};
  drawing.current=stroke;
  setStrokes(list=>[...list,stroke]);setRedo([]);
 };
 const move=event=>{
  const stroke=drawing.current;if(!stroke)return;
  event.preventDefault();
  const next=toPoint(event),last=stroke.points[stroke.points.length-1];
  if(Math.abs(next[0]-last[0])+Math.abs(next[1]-last[1])<2)return;
  stroke.points.push(next);
  paint(canvasRef.current,[...strokes.slice(0,-1),stroke]);
 };
 const up=()=>{
  if(!drawing.current)return;
  const finished={...drawing.current,points:[...drawing.current.points]};
  drawing.current=null;
  setStrokes(list=>[...list.slice(0,-1),finished]);
 };

 const undo=()=>setStrokes(list=>{if(!list.length)return list;setRedo(r=>[...r,list[list.length-1]]);return list.slice(0,-1)});
 const redoStroke=()=>setRedo(r=>{if(!r.length)return r;setStrokes(list=>[...list,r[r.length-1]]);return r.slice(0,-1)});
 const clear=()=>{if(!strokes.length)return;if(!confirmClear){setConfirmClear(true);return}setStrokes([]);setRedo([]);setConfirmClear(false)};

 return <div className="wb">
  <div className="wb-tools" role="group" aria-label={t('tools')}>
   <div className="wb-group">
    <button type="button" className={tool==='pen'?'on':''} aria-pressed={tool==='pen'} onClick={()=>setTool('pen')}><span aria-hidden="true">✏️</span> {t('pen')}</button>
    <button type="button" className={tool==='eraser'?'on':''} aria-pressed={tool==='eraser'} onClick={()=>setTool('eraser')}><span aria-hidden="true">🧽</span> {t('eraser')}</button>
   </div>
   <div className="wb-group" role="group" aria-label={t('colourLabel')}>
    {COLOURS.map(([id,hex,label])=><button key={id} type="button" className={'wb-swatch'+(colour===id&&tool==='pen'?' on':'')} aria-pressed={colour===id} aria-label={t(label)} title={t(label)} style={{'--swatch':hex}} onClick={()=>{setColour(id);setTool('pen')}}/>)}
   </div>
   <div className="wb-group" role="group" aria-label={t('sizeLabel')}>
    {SIZES.map(([id,px,label])=><button key={id} type="button" className={'wb-size'+(size===id?' on':'')} aria-pressed={size===id} aria-label={t(label)} title={t(label)} onClick={()=>setSize(id)}><span style={{width:Math.max(6,px*1.2),height:Math.max(6,px*1.2)}}/></button>)}
   </div>
   <div className="wb-group">
    <button type="button" onClick={undo} disabled={!strokes.length}><span aria-hidden="true">↶</span> {t('undo')}</button>
    <button type="button" onClick={redoStroke} disabled={!redo.length}><span aria-hidden="true">↷</span> {t('redo')}</button>
    <button type="button" className={confirmClear?'danger':''} onClick={clear} disabled={!strokes.length}>{confirmClear?t('clearSure'):'🗑️ '+t('clearBoard')}</button>
   </div>
   <label className="wb-paper">{t('bgLabel')}
    <select value={paper} onChange={e=>setPaper(e.target.value)}>
     <option value="plain">{t('bgPlain')}</option><option value="grid">{t('bgGrid')}</option><option value="lines">{t('bgLines')}</option>
    </select>
   </label>
  </div>
  <div className={'wb-stage paper-'+paper}>
   <canvas ref={canvasRef} width={W} height={H} role="img" aria-label={t('boardLabel')}
    className={tool==='eraser'?'wb-canvas erasing':'wb-canvas'}
    onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}/>
  </div>
 </div>;
}
