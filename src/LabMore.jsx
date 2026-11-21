import React,{useEffect,useRef,useState} from 'react';
import {say} from './localization.js';
import {ICE_MINUTES,simulateIce,iceKind,SOLUTES,WATER_TEMPS,dissolveResult,dissolvedFraction,lightName,lightHex,GLASS_COUNT,glassFrequency,pitchKind,isScale,seesawResult} from './labModelsMore.js';

const reducedMotion=()=>{try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch{return false}};
const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));
// Only count a discovery after the child has changed something, not on first open.
function useChanged(fn,deps){const first=useRef(true);useEffect(()=>{if(first.current){first.current=false;return}fn()},deps)} // eslint-disable-line
function Slider({id,label,value,onChange,icon,min=0,max=100,step=1,format}){
 return <label className="lab-slider" htmlFor={id}><span className="lab-slider-top"><span><span aria-hidden="true">{icon}</span> {label}</span><output>{format?format(value):value}</output></span>
  <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
}
function Choice({label,options,value,onChange}){
 return <div className="lab-choice" role="group" aria-label={label}><span className="lab-choice-label">{label}</span><div className="preset-row">{options.map(([id,text])=><button type="button" key={id} className={value===id?'on':''} aria-pressed={value===id} onClick={()=>onChange(id)}>{text}</button>)}</div></div>;
}

/* ---------------- Melting ice ---------------- */
export function IceLab({language,discover}){
 const t=(k,v)=>say(language,k,v);
 const [temp,setTemp]=useState(28),[wrap,setWrap]=useState('none'),[size,setSize]=useState('big'),[minute,setMinute]=useState(0),[playing,setPlaying]=useState(false);
 const settings={temp,wrap,size},line=simulateIce(settings),i=Math.min(ICE_MINUTES,Math.floor(minute)),left=line[i];
 const kind=iceKind(left,settings,i);
 useEffect(()=>{
  if(!playing)return;
  const calm=reducedMotion();
  const id=setInterval(()=>setMinute(m=>{const n=m+(calm?1:0.08);if(n>=ICE_MINUTES){setPlaying(false);return ICE_MINUTES}return n}),calm?700:70);
  return()=>clearInterval(id);
 },[playing]);
 useChanged(()=>{if(kind==='melted')discover('ice:melted');if(kind==='wrapped')discover('ice:wool');if(kind==='frozen')discover('ice:frozen')},[kind]);
 const change=fn=>{fn();setMinute(0);setPlaying(false)};
 const frac=clamp(left/100),cube=size==='big'?[1]:[1,2,3],puddle=(1-frac)*80;
 return <div className="lab-grid">
  <div className="lab-stage-col"><div className="lab-stage">
   <svg className="plant-svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
    <defs><linearGradient id="ic-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={temp>25?'#ffe6b8':'#d6ecff'}/><stop offset="1" stopColor={temp>25?'#ffd0a0':'#eaf5ff'}/></linearGradient><linearGradient id="ic-ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2fbff"/><stop offset="1" stopColor="#8fd0f5"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#ic-bg)"/><rect y="236" width="400" height="64" fill="#b79c78"/><rect y="236" width="400" height="8" fill="#a28660"/>
    <ellipse cx="200" cy="250" rx={20+puddle} ry={5+puddle*0.12} fill="#6bbcf0" opacity=".85"/>
    {cube.map(n=>{const s=(size==='big'?96:46)*Math.max(0.05,frac),x=size==='big'?200:120+n*80,y=246;
     return <g key={n}><rect x={x-s/2} y={y-s} width={s} height={s} rx={s*0.14} fill="url(#ic-ice)" stroke="#bfe6fb" strokeWidth="2"/><path d={'M'+(x-s*0.3)+' '+(y-s*0.8)+' l'+s*0.2+' '+(-s*0.02)} stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8"/>
      {wrap==='foil'&&<rect x={x-s/2-3} y={y-s-3} width={s+6} height={s+6} rx={s*0.16} fill="#d9dde6" opacity=".72" stroke="#9aa3b5" strokeWidth="2"/>}
      {wrap==='wool'&&<g><rect x={x-s/2-6} y={y-s-6} width={s+12} height={s+12} rx={s*0.22} fill="#e2575f" opacity=".92"/>{[0,1,2].map(r=><path key={r} d={'M'+(x-s/2-6)+' '+(y-s+6+r*s*0.28)+' h'+(s+12)} stroke="#fff" strokeWidth="3" opacity=".7"/>)}</g>}</g>})}
    {left>0&&frac<0.9&&[0,1,2].map(d=><path key={d} className="drip" style={{animationDelay:d*0.4+'s'}} d={'M'+(170+d*30)+' 200 q-5 9 0 13 q5 -4 0 -13'} fill="#4cc3ff"/>)}
    <g transform="translate(340 54)"><circle r="24" fill="#ffd35c" opacity={0.3+clamp((temp-10)/30)*0.7}/><text textAnchor="middle" y="8" fontSize="22" aria-hidden="true">🌡️</text></g>
   </svg>
   <div className="stage-badges"><span className="day-badge">{t('minuteN',{n:i})}</span><span className="stat">{t('iceLeft',{n:Math.round(left)})}</span></div>
  </div>
  <div className="lab-time">
   <button type="button" className="primary" onClick={()=>{if(minute>=ICE_MINUTES)setMinute(0);setPlaying(p=>!p)}}>{playing?'⏸ '+t('pause'):'▶ '+t('playMinutes')}</button>
   <Slider id="ice-min" icon="⏳" label={t('iceMinutes')} value={minute} min={0} max={ICE_MINUTES} step="any" onChange={v=>{setPlaying(false);setMinute(v)}} format={v=>t('minuteN',{n:Math.floor(v)})}/>
  </div>
  <p className={'lab-observation '+(kind==='melted'||kind==='wrapped'?'good':'')} role="status"><strong>{t('ice_'+kind)}</strong></p></div>
  <div className="lab-side"><div className="lab-card">
   <Slider id="ice-temp" icon="🌡️" label={t('mIceTemp')} value={temp} min={-5} max={40} onChange={v=>change(()=>setTemp(v))} format={v=>t('tempC',{n:v})}/>
   <Choice label={t('mIceWrap')} value={wrap} onChange={v=>change(()=>setWrap(v))} options={[['none',t('mWrapNone')],['foil','🪙 '+t('mWrapFoil')],['wool','🧦 '+t('mWrapWool')]]}/>
   <Choice label={t('mIceSize')} value={size} onChange={v=>change(()=>setSize(v))} options={[['big','🧊 '+t('mSizeBig')],['small','🧊🧊 '+t('mSizeSmall')]]}/>
  </div></div>
 </div>;
}

/* ---------------- Dissolving ---------------- */
const SOLUTE_ICON={sugar:'🍬',salt:'🧂',sand:'⏳',flour:'🌾'},SOLUTE_COLOR={sugar:'#ffffff',salt:'#f4f4ee',sand:'#d9b86c',flour:'#f6efe0'};
export function DissolveLab({language,discover}){
 const t=(k,v)=>say(language,k,v);
 const [solute,setSolute]=useState('sugar'),[tempIndex,setTempIndex]=useState(1),[stirred,setStirred]=useState(false),[elapsed,setElapsed]=useState(null);
 const temp=WATER_TEMPS[tempIndex],result=dissolveResult(solute,temp,stirred),started=elapsed!==null;
 const frac=started?(result.dissolves?dissolvedFraction(result,elapsed):1):0;
 useEffect(()=>{
  if(!started||(result.dissolves&&frac>=1))return;
  if(!result.dissolves){if(elapsed>=6)return}
  const calm=reducedMotion(),id=setInterval(()=>setElapsed(e=>e===null?e:e+(calm?result.seconds||3:0.4)),calm?600:60);
  return()=>clearInterval(id);
 },[started,solute,temp,stirred,frac>=1,elapsed>=6]); // eslint-disable-line
 const done=started&&(result.dissolves?frac>=1:elapsed>=3);
 useEffect(()=>{
  if(!done)return;
  if(solute==='sugar'&&result.kind==='fast')discover('dissolve:sugar_fast');
  if(solute==='sand')discover('dissolve:sand');
  if(solute==='flour')discover('dissolve:flour');
 },[done]); // eslint-disable-line
 const change=fn=>{fn();setElapsed(null)};
 const water=started&&solute==='flour'?'#d8cdb4':started&&solute==='sugar'&&frac>=1?'#cfeeff':'#9fdcff';
 const grains=Array.from({length:14},(_,k)=>k);
 const kindKey=!started?'start':result.dissolves?(frac>=1?result.kind:'start'):result.kind;
 return <div className="lab-grid">
  <div className="lab-stage-col"><div className="lab-stage">
   <svg className="plant-svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
    <rect width="400" height="300" fill="#eef5ff"/><rect y="258" width="400" height="42" fill="#c9d4ea"/>
    <path d="M120 70 h160 l-10 190 h-140 z" fill="#ffffff" opacity=".55" stroke="#9db8dd" strokeWidth="4"/>
    <path d="M129 112 h142 l-8 146 h-126 z" fill={water} opacity=".85" style={{transition:'fill 1.2s'}}/>
    {started&&!result.dissolves&&solute==='flour'&&<rect x="129" y="112" width="142" height="146" fill="#e6d9bb" opacity={clamp(1-elapsed/10)*0.35+0.25}/>}
    {grains.map(k=>{const x=146+k*8.6,startY=96+(k%3)*8,rest=solute==='sand'||solute==='flour'?248-(k%4)*3:null,y=!started?startY-24:result.dissolves?startY+(1-frac)*(120+(k%5)*5):(rest??248)-(1-clamp(elapsed/3))*(rest?130:0);
     const op=result.dissolves?(started?clamp(1-frac*1.05):1):1;
     return <circle key={k} cx={x+(started&&stirred?Math.sin(elapsed*3+k)*6:0)} cy={clamp(y,70,256)} r={solute==='sand'?3.4:2.8} fill={SOLUTE_COLOR[solute]} stroke="#b9a785" strokeWidth=".7" opacity={op}/>})}
    <g transform="translate(300 60)"><text fontSize="34" aria-hidden="true">{SOLUTE_ICON[solute]}</text></g>
    {stirred&&started&&<g aria-hidden="true"><rect x="196" y="40" width="8" height="150" rx="4" fill="#b58e5a" transform={'rotate('+Math.sin(elapsed*4)*10+' 200 190)'}/></g>}
   </svg>
   <div className="stage-badges"><span className="day-badge">{t('tempC',{n:temp})}</span>{started&&result.dissolves&&<span className="stat">{t('mSecs',{n:Math.min(Math.round(elapsed),result.seconds)})}</span>}</div>
  </div>
  <div className="lab-time"><button type="button" className="primary" onClick={()=>setElapsed(0)}>🥄 {t('mAddWatch')}</button></div>
  <p className={'lab-observation '+(kindKey==='fast'?'good':'')} role="status"><strong>{t('dis_'+(kindKey==='settles'?'settles':kindKey))}</strong>{done&&result.dissolves&&<span> {t('mSecs',{n:result.seconds})}</span>}</p></div>
  <div className="lab-side"><div className="lab-card">
   <Choice label={t('mSolute')} value={solute} onChange={v=>change(()=>setSolute(v))} options={Object.keys(SOLUTES).map(id=>[id,SOLUTE_ICON[id]+' '+t('sol_'+id)])}/>
   <Slider id="dis-temp" icon="🌡️" label={t('mWaterTemp')} value={tempIndex} min={0} max={WATER_TEMPS.length-1} onChange={v=>change(()=>setTempIndex(v))} format={v=>t('tempC',{n:WATER_TEMPS[v]})}/>
   <div className="toggle-list"><button type="button" className={stirred?'on':''} aria-pressed={stirred} onClick={()=>change(()=>setStirred(s=>!s))}>🥄 {t('mStir')}</button></div>
  </div></div>
 </div>;
}

/* ---------------- Mixing coloured light ---------------- */
export function LightLab({language,discover}){
 const t=(k,v)=>say(language,k,v);
 const [lamps,setLamps]=useState({r:0,g:0,b:0}),name=lightName(lamps),hex=lightHex(lamps);
 useChanged(()=>{if(name==='yellow')discover('light:yellow');if(name==='cyan')discover('light:cyan');if(name==='white')discover('light:white')},[name]);
 const set=key=>v=>setLamps(l=>({...l,[key]:v}));
 const beam=(key,x,fill)=><g key={key}><polygon points={x+',0 '+(x-30)+',0 200,190 '+(x+30)+',190'} fill="none"/><circle cx={x} cy="150" r="78" fill={fill} opacity={lamps[key]/100*0.7} style={{mixBlendMode:'screen'}}/></g>;
 const lampKey=[['r','mLampR','#ff2a2a','🔴'],['g','mLampG','#22e05a','🟢'],['b','mLampB','#2a6cff','🔵']];
 return <div className="lab-grid">
  <div className="lab-stage-col"><div className="lab-stage">
   <svg className="plant-svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
    <rect width="400" height="300" fill="#0b1020"/>
    <g style={{isolation:'isolate'}}>{beam('r',145,'#ff0000')}{beam('g',255,'#00ff00')}{beam('b',200,'#0000ff')}</g>
    <g transform="translate(200 214)"><ellipse rx="60" ry="14" fill="#000" opacity=".35" cy="40"/><rect x="-70" y="-14" width="140" height="10" rx="5" fill="#2a3358"/></g>
    <circle cx="200" cy="150" r="30" fill={hex} stroke="#fff" strokeWidth="3" opacity={name==='black'?0.25:1}/>
    {lampKey.map(([k,,c],n)=><g key={k} transform={'translate('+(105+n*95)+' 30)'}><rect x="-18" y="-6" width="36" height="22" rx="8" fill="#2a3358"/><circle cx="0" cy="22" r="12" fill={c} opacity={0.25+lamps[k]/100*0.75}/></g>)}
   </svg>
   <div className="stage-badges"><span className="day-badge" style={{background:hex==='#000000'?'#2a3358':hex}}>{t('col_'+name)}</span></div>
  </div>
  <p className={'lab-observation '+(name==='white'||name==='yellow'||name==='cyan'?'good':'')} role="status"><strong>{t('lightIs',{name:t('col_'+name)})}</strong></p></div>
  <div className="lab-side"><div className="lab-card">
   {lampKey.map(([k,label,,icon])=><Slider key={k} id={'light-'+k} icon={icon} label={t(label)} value={lamps[k]} onChange={set(k)} format={v=>v+'%'}/>)}
   <p className="lab-hint">{t('light_hint')}</p>
   <div className="preset-row">{[['yellow',{r:100,g:100,b:0}],['cyan',{r:0,g:100,b:100}],['magenta',{r:100,g:0,b:100}],['white',{r:100,g:100,b:100}]].map(([n,v])=><button type="button" key={n} onClick={()=>setLamps(v)}>{t('col_'+n)}</button>)}</div>
  </div></div>
 </div>;
}

/* ---------------- Singing glasses ---------------- */
let audioCtx=null;
function beep(freq){
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  audioCtx=audioCtx||new AC();if(audioCtx.state==='suspended')audioCtx.resume();
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=freq;
  g.gain.setValueAtTime(0.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.28,audioCtx.currentTime+0.02);g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+0.9);
  o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+0.95);
 }catch{}
}
export function SoundLab({language,discover}){
 const t=(k,v)=>say(language,k,v);
 const [fills,setFills]=useState([15,30,45,60,75]),[last,setLast]=useState(null),[ring,setRing]=useState(null);
 const scale=isScale(fills);
 const tap=i=>{const f=fills[i],kind=pitchKind(f);beep(glassFrequency(f));setLast(i);setRing(i);setTimeout(()=>setRing(null),500);
  if(kind==='low')discover('sound:low');if(kind==='high')discover('sound:high');if(scale)discover('sound:scale')};
 const setFill=(i,v)=>setFills(list=>list.map((x,k)=>k===i?v:x));
 const msg=scale&&last!==null?'snd_scale':last===null?'snd_start':'pitch_'+pitchKind(fills[last]);
 return <div className="lab-grid">
  <div className="lab-stage-col"><div className="lab-stage">
   <svg className="plant-svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
    <rect width="400" height="300" fill="#fff4e0"/><rect y="244" width="400" height="56" fill="#c99a62"/>
    {fills.map((f,i)=>{const x=40+i*68,h=150,top=200-h,water=h*f/100;
     return <g key={i} className={ring===i?'jiggle':''}><path d={'M'+x+' '+top+' h52 l-5 '+h+' h-42 z'} fill="#fff" opacity=".5" stroke="#9db8dd" strokeWidth="3"/>
      <path d={'M'+(x+2)+' '+(200-water)+' h48 l-3 '+water+' h-42 z'} fill="#6bbcf0" opacity=".85"/>
      <text x={x+26} y={232} textAnchor="middle" fontSize="12" fill="#6b4b24" fontWeight="700">{t('mHz',{n:glassFrequency(f)})}</text>
      {ring===i&&[0,1].map(r=><circle key={r} cx={x+26} cy={top-8} r={10+r*10} fill="none" stroke="#ff9f43" strokeWidth="3" opacity={0.6-r*0.25}/>)}</g>})}
    <text x="200" y="40" textAnchor="middle" fontSize="28" aria-hidden="true">🥄 🎵</text>
   </svg>
  </div>
  <p className={'lab-observation '+(scale&&last!==null?'good':'')} role="status"><strong>{t(msg)}</strong></p></div>
  <div className="lab-side"><div className="lab-card">
   <div className="preset-row">{fills.map((f,i)=><button type="button" key={i} onClick={()=>tap(i)}>🥂 {t('mTapGlass')} {i+1}</button>)}</div>
   {fills.map((f,i)=><Slider key={i} id={'glass-'+i} icon="💧" label={t('mGlassN',{n:i+1})} value={f} onChange={v=>setFill(i,v)} format={v=>v+'%'}/>)}
  </div></div>
 </div>;
}

/* ---------------- Seesaw ---------------- */
export function SeesawLab({language,discover}){
 const t=(k,v)=>say(language,k,v);
 const [s,setS]=useState({w1:3,d1:3,w2:3,d2:3}),r=seesawResult(s);
 useChanged(()=>{if(r.unequalBalance)discover('seesaw:balanced');if(r.lighterWins)discover('seesaw:light_wins')},[s]);
 const set=key=>v=>setS(o=>({...o,[key]:v}));
 const blocks=(w,x0,dir,d)=>Array.from({length:w},(_,k)=><rect key={k} x={x0-14} y={-20-k*17} width="28" height="16" rx="3" fill={dir<0?'#ff8a5c':'#5b86f0'} stroke="rgba(0,0,0,.2)"/>);
 const px=d=>d*26;
 const msg=r.unequalBalance?'see_unequal':r.lighterWins?'see_light':'see_'+r.kind;
 return <div className="lab-grid">
  <div className="lab-stage-col"><div className="lab-stage">
   <svg className="plant-svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
    <rect width="400" height="300" fill="#e8f6ff"/><rect y="256" width="400" height="44" fill="#8fcf7a"/>
    <path d="M200 262 l-30 0 l30 -70 l30 70 z" fill="#8b5e3c"/>
    <g transform={'translate(200 192) rotate('+(-r.tilt)+')'} style={{transition:'transform .5s cubic-bezier(.34,1.56,.64,1)'}}>
     <rect x="-165" y="-6" width="330" height="12" rx="6" fill="#d9a05b" stroke="#a8702f" strokeWidth="2"/>
     {[1,2,3,4,5].map(n=><g key={n}><line x1={-px(n)} x2={-px(n)} y1="-6" y2="6" stroke="#a8702f"/><line x1={px(n)} x2={px(n)} y1="-6" y2="6" stroke="#a8702f"/></g>)}
     <g transform={'translate('+(-px(s.d1))+' -6)'}>{blocks(s.w1,0,-1)}</g><g transform={'translate('+px(s.d2)+' -6)'}>{blocks(s.w2,0,1)}</g>
    </g>
   </svg>
   <div className="stage-badges"><span className="day-badge">{r.kind==='balanced'?'⚖️ '+t('see_balanced'):'⚖️'}</span></div>
  </div>
  <p className={'lab-observation '+(r.kind==='balanced'||r.lighterWins?'good':'')} role="status"><strong>{t(msg)}</strong> <span>{t('see_tip')}</span></p></div>
  <div className="lab-side"><div className="lab-card">
   <h3>🟧 {t('mLeftSide')}</h3>
   <Slider id="see-w1" icon="🧱" label={t('mWeight')} value={s.w1} min={1} max={5} onChange={set('w1')}/>
   <Slider id="see-d1" icon="↔️" label={t('mDistance')} value={s.d1} min={1} max={5} onChange={set('d1')}/>
   <h3>🟦 {t('mRightSide')}</h3>
   <Slider id="see-w2" icon="🧱" label={t('mWeight')} value={s.w2} min={1} max={5} onChange={set('w2')}/>
   <Slider id="see-d2" icon="↔️" label={t('mDistance')} value={s.d2} min={1} max={5} onChange={set('d2')}/>
  </div></div>
 </div>;
}
