import React,{useEffect,useRef,useState} from 'react';
import {say} from './localization.js';
import {SHADOW_OBJECTS,sunElevation,shadowLength,shadowKind,MAGNET_ITEMS,MAGNET_BARRIERS,magnetResult,PUDDLE_HOURS,simulatePuddle,puddleKind,SURFACES,rampResult} from './labModels.js';

const reducedMotion=()=>{try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch{return false}};
const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));
const hex=n=>Math.round(n).toString(16).padStart(2,'0');
const mixHex=(a,b,k)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const [x,y]=[p(a),p(b)];return '#'+x.map((v,i)=>hex(v+(y[i]-v)*k)).join('')};

// Only count a discovery after the child has changed something, not on first open.
function useChanged(fn,deps){
 const first=useRef(true);
 useEffect(()=>{if(first.current){first.current=false;return}fn()},deps); // eslint-disable-line
}

function MiniChart({label,values,upto,max=100,colour='#2f9e5b'}){
 const n=values.length-1,x=i=>12+(i/n)*276,y=v=>108-(v/max)*96;
 const shown=values.slice(0,Math.min(n,Math.floor(upto))+1);
 return <figure className="lab-chart"><figcaption>{label}</figcaption>
  <svg viewBox="0 0 300 120" role="img" aria-label={label}>
   <line x1="12" y1="108" x2="288" y2="108" stroke="currentColor" opacity=".3"/><line x1="12" y1="10" x2="12" y2="108" stroke="currentColor" opacity=".3"/>
   <polyline points={shown.map((v,i)=>x(i).toFixed(1)+','+y(v).toFixed(1)).join(' ')} fill="none" stroke={colour} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
   <circle cx={x(Math.min(n,Math.floor(upto)))} cy={y(shown[shown.length-1])} r="4.5" fill={colour}/>
  </svg></figure>;
}

function Slider({id,label,value,onChange,icon,min=0,max=100,step=1,format}){
 return <label className="lab-slider" htmlFor={id}><span className="lab-slider-top"><span><span aria-hidden="true">{icon}</span> {label}</span><output>{format?format(value):value}</output></span>
  <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
}

/* ---------------- Shadows ---------------- */
function ShadowObject({id,H,x,y}){
 if(id==='tree')return <g><rect x={x-6} y={y-H*0.42} width="12" height={H*0.42} rx="3" fill="url(#sh-trunk)"/><circle cx={x} cy={y-H*0.62} r={H*0.3} fill="url(#sh-leaf)"/><circle cx={x-H*0.17} cy={y-H*0.5} r={H*0.2} fill="url(#sh-leaf)"/><circle cx={x+H*0.17} cy={y-H*0.52} r={H*0.2} fill="url(#sh-leaf)"/></g>;
 if(id==='child')return <g><circle cx={x} cy={y-H+9} r="9" fill="#f1c27d"/><path d={'M'+(x-9)+' '+(y-H+3)+' q9 -10 18 0 z'} fill="#3b2a1e"/><rect x={x-9} y={y-H+18} width="18" height={H*0.42} rx="6" fill="#3b82f6"/><rect x={x-8} y={y-H*0.42+14} width="6" height={H*0.42-14} rx="3" fill="#1e3a8a"/><rect x={x+2} y={y-H*0.42+14} width="6" height={H*0.42-14} rx="3" fill="#1e3a8a"/></g>;
 return <g><rect x={x-2} y={y-H} width="4" height={H} rx="2" fill="#cfd6e6"/><circle cx={x} cy={y-H} r="4" fill="#ffd166"/><path d={'M'+(x+2)+' '+(y-H+4)+' h26 l-7 8 l7 8 h-26 z'} fill="#ef476f"/></g>;
}
export function ShadowLab({language,discover}){
 const t=(k,v)=>say(language,k,v);
 const [hour,setHour]=useState(9),[objectId,setObjectId]=useState('tree'),[playing,setPlaying]=useState(false);
 const obj=SHADOW_OBJECTS[objectId],elev=sunElevation(hour),len=shadowLength(obj.height,elev),kind=shadowKind(hour);
 useEffect(()=>{
  if(!playing)return;
  const calm=reducedMotion();
  const id=setInterval(()=>setHour(h=>{const n=h+(calm?1:0.05);if(n>=17){setPlaying(false);return 17}return n}),calm?900:60);
  return()=>clearInterval(id);
 },[playing]);
 useChanged(()=>{if(kind==='long')discover('shadow:long');if(kind==='short')discover('shadow:short')},[kind]);
 const k=clamp(elev/70),sx=36+(hour-7)/10*328,sy=250-(elev/90)*205,dir=sx<200?1:-1;
 const H=obj.height*0.9,px=Math.min(185,len*0.9),base=244;
 return <div className="lab-grid">
  <div className="lab-stage-col">
   <div className="lab-stage">
    <svg className="plant-svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
     <defs>
      <linearGradient id="sh-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mixHex('#f58f5c','#4fa8ee',k)}/><stop offset="1" stopColor={mixHex('#ffd9a8','#d9f0ff',k)}/></linearGradient>
      <linearGradient id="sh-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#86cf7f"/><stop offset="1" stopColor="#4a9e5c"/></linearGradient>
      <radialGradient id="sh-sun"><stop offset="0" stopColor="#fff6c2"/><stop offset=".55" stopColor="#ffd35c"/><stop offset="1" stopColor="#ffd35c" stopOpacity="0"/></radialGradient>
      <linearGradient id="sh-trunk" x1="0" x2="1"><stop offset="0" stopColor="#7a4a2a"/><stop offset="1" stopColor="#9c6538"/></linearGradient>
      <radialGradient id="sh-leaf" cx=".35" cy=".3"><stop offset="0" stopColor="#7fd36b"/><stop offset="1" stopColor="#2f8a45"/></radialGradient>
     </defs>
     <rect width="400" height="300" fill="url(#sh-sky)"/>
     <g className="cloud-drift" fill="#fff" opacity=".85"><ellipse cx="90" cy="62" rx="34" ry="11"/><ellipse cx="116" cy="54" rx="22" ry="11"/><ellipse cx="300" cy="96" rx="30" ry="9"/><ellipse cx="320" cy="89" rx="18" ry="9"/></g>
     <circle cx={sx} cy={sy} r="46" fill="url(#sh-sun)"/><circle cx={sx} cy={sy} r="17" fill="#ffd35c"/>
     <path d="M0 224 Q80 196 170 216 T400 208 V300 H0 Z" fill="#7dc47a" opacity=".55"/>
     <rect y="232" width="400" height="68" fill="url(#sh-grass)"/>
     <path d={'M'+(200-10)+' '+(base)+' L'+(200+dir*px)+' '+(base+12)+' L'+(200+10)+' '+base+' Z'} fill="#12304a" opacity=".32" style={{transition:'all .2s'}}/>
     <ShadowObject id={objectId} H={H} x={200} y={base}/>
     <line x1="40" y1="286" x2={40+Math.min(320,len*0.9)} y2="286" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8"/>
     <circle cx="40" cy="286" r="4" fill="#fff"/><circle cx={40+Math.min(320,len*0.9)} cy="286" r="4" fill="#fff"/>
    </svg>
    <div className="stage-badges"><span className="day-badge">{t('hourClock',{n:Math.floor(hour)})}</span><span className="stat">{t('sunHeight',{n:Math.round(elev)})}</span></div>
   </div>
   <div className="lab-time">
    <button type="button" className="primary" onClick={()=>{if(hour>=17)setHour(7);setPlaying(p=>!p)}}>{playing?'⏸ '+t('pause'):'▶ '+t('playHours')}</button>
    <Slider id="hour" icon="🕒" label={t('timeOfDay')} value={hour} min={7} max={17} step={0.25} onChange={v=>{setPlaying(false);setHour(v)}} format={v=>t('hourClock',{n:Math.floor(v)})}/>
   </div>
   <p className={'lab-observation '+(kind==='short'?'good':'')} role="status"><strong>{t('sh_'+kind)}</strong><br/><span>{t('shadowRatio',{n:(len/obj.height).toFixed(1),object:t('sho_'+objectId)})}.</span><br/><span>{t('sh_why')}</span></p>
  </div>
  <div className="lab-side"><div className="lab-card"><h3>{t('pickShadowObject')}</h3>
   <div className="preset-row">{Object.keys(SHADOW_OBJECTS).map(id=><button type="button" key={id} className={objectId===id?'on':''} aria-pressed={objectId===id} onClick={()=>setObjectId(id)}><span aria-hidden="true">{SHADOW_OBJECTS[id].icon}</span> {t('sho_'+id)}</button>)}</div>
  </div></div>
 </div>;
}

/* ---------------- Magnets ---------------- */
export function MagnetLab({language,discover}){
 const t=(k,v)=>say(language,k,v);
 const [itemId,setItemId]=useState('nail'),[dist,setDist]=useState(85),[barrier,setBarrier]=useState('none');
 const res=magnetResult(itemId,dist,barrier),item=MAGNET_ITEMS[itemId];
 useChanged(()=>{if(res.code==='attract'){discover('magnet:attract');if(res.through)discover('magnet:through')}if(res.code==='ignore'&&dist<=40)discover('magnet:ignore')},[res.code,res.through,dist,itemId]);
 const x=res.code==='attract'?(barrier==='none'?124:176):118+dist*2.3;
 const text=res.code==='attract'?t('mag_attract',{item:t('mi_'+itemId)})+(res.through?' '+t('mag_through',{barrier:t('bar_'+barrier).toLowerCase()}):''):res.code==='ignore'?t('mag_ignore',{item:t('mi_'+itemId)}):dist>60&&MAGNET_ITEMS[itemId].magnetic?t('mag_far',{item:t('mi_'+itemId)}):t('mag_start');
 return <div className="lab-grid">
  <div className="lab-stage-col">
   <div className="lab-stage">
    <svg className="plant-svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
     <defs>
      <linearGradient id="mg-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9f0ff"/><stop offset="1" stopColor="#cfdcf7"/></linearGradient>
      <linearGradient id="mg-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9b383"/><stop offset="1" stopColor="#a8764a"/></linearGradient>
      <linearGradient id="mg-red" x1="0" x2="1"><stop offset="0" stopColor="#ff6b6b"/><stop offset="1" stopColor="#c92a2a"/></linearGradient>
      <linearGradient id="mg-blue" x1="0" x2="1"><stop offset="0" stopColor="#5c9dff"/><stop offset="1" stopColor="#1c4fc4"/></linearGradient>
     </defs>
     <rect width="400" height="300" fill="url(#mg-bg)"/>
     <rect y="236" width="400" height="64" fill="url(#mg-table)"/><rect y="236" width="400" height="5" fill="#fff" opacity=".25"/>
     {[0,1,2].map(i=><path key={i} className={res.code==='attract'?'flow':''} d={'M104 '+(190+i*8)+' q70 '+(-60+i*14)+' 150 0'} fill="none" stroke="#7c93f5" strokeWidth="2.5" strokeDasharray="5 8" opacity={res.code==='attract'?0.9:0.28}/>)}
     <g transform="translate(34 160)">
      <path d="M0 0 h26 v50 a14 14 0 0 0 28 0 v-50 h26 v50 a40 40 0 0 1 -80 0 z" transform="rotate(90 40 40) translate(-8 -34)" fill="#9aa4bf" opacity="0"/>
      <rect x="0" y="14" width="58" height="22" rx="6" fill="url(#mg-red)"/><rect x="0" y="50" width="58" height="22" rx="6" fill="url(#mg-blue)"/>
      <path d="M0 36 h-22 a22 22 0 0 0 0 28 h22 z" fill="#8c95ad"/><rect x="-22" y="30" width="22" height="40" rx="8" fill="#a3acc4"/>
      <text x="29" y="30" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">N</text><text x="29" y="66" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">S</text>
     </g>
     {barrier!=='none'&&<rect x="146" y="150" width={barrier==='glass'?12:5} height="86" rx="2" fill={barrier==='glass'?'#a9d6ff':'#fff'} stroke={barrier==='glass'?'#6fb0ee':'#cfd6e6'} opacity={barrier==='glass'?0.75:0.98}/>}
     <g style={{transform:'translate('+x+'px,204px)',transition:'transform .55s cubic-bezier(.3,.8,.3,1.2)'}}><text textAnchor="middle" fontSize="34" y="26">{item.icon}</text></g>
    </svg>
   </div>
   <p className={'lab-observation '+(res.code==='attract'?'good':'')} role="status"><strong>{text}</strong></p>
  </div>
  <div className="lab-side">
   <div className="lab-card"><h3>{t('pickItem')}</h3>
    <div className="preset-row">{Object.keys(MAGNET_ITEMS).map(id=><button type="button" key={id} className={itemId===id?'on':''} aria-pressed={itemId===id} onClick={()=>setItemId(id)}><span aria-hidden="true">{MAGNET_ITEMS[id].icon}</span> {t('mi_'+id)}</button>)}</div>
    <Slider id="mag-dist" icon="↔️" label={t('magDistance')} value={dist} onChange={setDist} step={5} format={v=>v+'%'}/>
    <h3>{t('magBarrier')}</h3>
    <div className="preset-row">{MAGNET_BARRIERS.map(b=><button type="button" key={b} className={barrier===b?'on':''} aria-pressed={barrier===b} onClick={()=>setBarrier(b)}>{t('bar_'+b)}</button>)}</div>
   </div>
  </div>
 </div>;
}

/* ---------------- Drying puddle ---------------- */
export function PuddleLab({language,discover}){
 const t=(k,v)=>say(language,k,v);
 const [temp,setTemp]=useState(28),[wind,setWind]=useState(30),[covered,setCovered]=useState(false),[hour,setHour]=useState(0),[playing,setPlaying]=useState(false);
 const line=simulatePuddle({temp,wind,covered}),i=Math.min(PUDDLE_HOURS,Math.floor(hour)),left=line[i],prev=line[Math.max(0,i-1)];
 const kind=puddleKind(left,covered,i),rate=clamp(prev-left,0,12);
 useEffect(()=>{
  if(!playing)return;
  const calm=reducedMotion();
  const id=setInterval(()=>setHour(h=>{const n=h+(calm?1:0.08);if(n>=PUDDLE_HOURS){setPlaying(false);return PUDDLE_HOURS}return n}),calm?700:70);
  return()=>clearInterval(id);
 },[playing]);
 useChanged(()=>{if(kind==='dry')discover('puddle:dry');if(kind==='covered')discover('puddle:covered')},[kind]);
 const change=fn=>{fn();setHour(0);setPlaying(false)};
 const frac=clamp(left/100),rx=6+frac*88,ry=2+frac*13,vapour=Math.ceil(rate/2);
 const skyK=clamp((temp-10)/30);
 return <div className="lab-grid">
  <div className="lab-stage-col">
   <div className="lab-stage">
    <svg className="plant-svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
     <defs>
      <linearGradient id="pd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mixHex('#9fb9d8','#4fa8ee',skyK)}/><stop offset="1" stopColor={mixHex('#dfe8f2','#d9f0ff',skyK)}/></linearGradient>
      <linearGradient id="pd-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b89a73"/><stop offset="1" stopColor="#8d7352"/></linearGradient>
      <radialGradient id="pd-water" cx=".4" cy=".3"><stop offset="0" stopColor="#8fd3ff"/><stop offset="1" stopColor="#3a8fd6"/></radialGradient>
      <radialGradient id="pd-sun"><stop offset="0" stopColor="#fff6c2"/><stop offset=".6" stopColor="#ffd35c"/><stop offset="1" stopColor="#ffd35c" stopOpacity="0"/></radialGradient>
     </defs>
     <rect width="400" height="300" fill="url(#pd-sky)"/>
     <circle cx="330" cy="58" r={30+skyK*26} fill="url(#pd-sun)" opacity={0.35+skyK*0.65}/><circle cx="330" cy="58" r="15" fill="#ffd35c" opacity={0.5+skyK*0.5}/>
     {wind>15&&[0,1,2].map(k=><path key={k} className="wind-line" style={{animationDelay:k*0.5+'s',opacity:0.25+wind/160}} d={'M30 '+(80+k*26)+' h'+(60+wind*0.6)+' q14 0 14 -9'} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>)}
     <path d="M0 214 Q100 190 200 208 T400 200 V300 H0 Z" fill="#7dc47a" opacity=".6"/>
     <rect y="226" width="400" height="74" fill="url(#pd-ground)"/>
     <ellipse cx="200" cy="248" rx={rx+5} ry={ry+3} fill="#6e5a3e" opacity=".6"/>
     {left>0&&<g><ellipse cx="200" cy="248" rx={rx} ry={ry} fill="url(#pd-water)"/><ellipse cx={200-rx*0.3} cy={248-ry*0.3} rx={rx*0.35} ry={ry*0.28} fill="#fff" opacity=".45"/></g>}
     {!covered&&Array.from({length:vapour},(_,k)=><circle key={k} className="vapour" style={{animationDelay:k*0.45+'s'}} cx={170+k*20} cy="236" r="5" fill="#fff" opacity=".7"/>)}
     {covered&&<g><path d="M96 248 A104 108 0 0 1 304 248 Z" fill="#cfeaff" opacity=".28" stroke="#8ec3ee" strokeWidth="3"/>{[0,1,2,3,4,5,6,7].map(k=>{const a=Math.PI*(0.12+k*0.108);return <circle key={k} cx={200-Math.cos(a)*92} cy={248-Math.sin(a)*96} r="3.5" fill="#9fd4ff" opacity={clamp(i/PUDDLE_HOURS*1.5)}/>})}</g>}
    </svg>
    <div className="stage-badges"><span className="day-badge">{t('hourN',{n:i})}</span><span className="stat">{t('pudLeft',{n:Math.round(left)})}</span></div>
   </div>
   <div className="lab-time">
    <button type="button" className="primary" onClick={()=>{if(hour>=PUDDLE_HOURS)setHour(0);setPlaying(p=>!p)}}>{playing?'⏸ '+t('pause'):'▶ '+t('playHours')}</button>
    <Slider id="pud-hours" icon="⏳" label={t('pudHours')} value={hour} min={0} max={PUDDLE_HOURS} step="any" onChange={v=>{setPlaying(false);setHour(v)}} format={v=>t('hourN',{n:Math.floor(v)})}/>
   </div>
   <p className={'lab-observation '+(kind==='dry'||kind==='covered'?'good':'')} role="status"><strong>{t('pud_'+(kind==='most'?'most':kind))}</strong></p>
  </div>
  <div className="lab-side">
   <div className="lab-card">
    <div className="preset-row">
     <button type="button" onClick={()=>change(()=>{setTemp(35);setWind(70);setCovered(false)})}>{t('pudWarm')}</button>
     <button type="button" onClick={()=>change(()=>{setTemp(12);setWind(0);setCovered(false)})}>{t('pudCool')}</button>
     <button type="button" onClick={()=>change(()=>{setTemp(35);setWind(70);setCovered(true)})}>{t('pudLid')}</button>
    </div>
    <Slider id="pud-temp" icon="🌡️" label={t('pudTemp')} value={temp} min={10} max={40} onChange={v=>change(()=>setTemp(v))} format={v=>t('tempC',{n:v})}/>
    <Slider id="pud-wind" icon="💨" label={t('pudWind')} value={wind} step={10} onChange={v=>change(()=>setWind(v))} format={v=>v+'%'}/>
    <div className="toggle-list"><button type="button" className={covered?'on':''} aria-pressed={covered} onClick={()=>change(()=>setCovered(c=>!c))}>🥣 {t('pudCover')}</button></div>
   </div>
   <MiniChart label={t('pudLeft',{n:Math.round(left)})} values={line} upto={hour} colour="#3a8fd6"/>
  </div>
 </div>;
}

/* ---------------- Ramp race ---------------- */
const SURFACE_NAMES={carpet:'sf_carpet',wood:'sf_wood',ice:'sf_ice'};
export function RampLab({language,discover}){
 const t=(k,v)=>say(language,k,v);
 const [slope,setSlope]=useState(25),[surface,setSurface]=useState('wood'),[released,setReleased]=useState(false),[p,setP]=useState(0);
 const res=rampResult(slope,surface);
 useEffect(()=>{
  if(!released){setP(0);return}
  if(!res.moves||reducedMotion()){setP(1);return}
  let raf,start=null;
  const step=ts=>{if(start===null)start=ts;const k=Math.min(1,(ts-start)/2400);setP(k);if(k<1)raf=requestAnimationFrame(step)};
  raf=requestAnimationFrame(step);
  return()=>cancelAnimationFrame(raf);
 },[released,slope,surface]); // eslint-disable-line
 useEffect(()=>{if(released&&p>=1){if(res.kind==='stuck')discover('ramp:stuck');if(res.kind==='far')discover('ramp:far')}},[released,p]); // eslint-disable-line
 const change=fn=>{fn();setReleased(false)};
 const a=slope*Math.PI/180,L=190,x0=36,floorY=240,topY=floorY-L*Math.sin(a),botX=x0+L*Math.cos(a);
 const maxPx=Math.max(20,372-botX),distPx=Math.min(maxPx,res.distance*32);
 let cx,cy,rot;
 if(p<0.4){const q=Math.pow(p/0.4,2);cx=x0+(botX-x0)*q;cy=topY+(floorY-topY)*q;rot=slope}
 else{const r=(p-0.4)/0.6,e=1-Math.pow(1-r,2);cx=botX+distPx*e;cy=floorY;rot=0}
 const off=11,nx=Math.sin(rot*Math.PI/180)*off,ny=Math.cos(rot*Math.PI/180)*off;
 const colour=SURFACES[surface].color;
 const shown=p>=1&&released;
 const text=!released?t('ramp_start'):!shown?'…':res.kind==='stuck'?t('ramp_stuck',{surface:t(SURFACE_NAMES[surface]).toLowerCase()}):t(res.kind==='far'?'ramp_far':'ramp_near',{n:res.distance,surface:t(SURFACE_NAMES[surface]).toLowerCase()});
 return <div className="lab-grid">
  <div className="lab-stage-col">
   <div className="lab-stage">
    <svg className="plant-svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
     <defs>
      <linearGradient id="rp-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dff0ff"/><stop offset="1" stopColor="#f5f9ff"/></linearGradient>
      <linearGradient id="rp-car" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff6b6b"/><stop offset="1" stopColor="#d62839"/></linearGradient>
     </defs>
     <rect width="400" height="300" fill="url(#rp-bg)"/>
     <g fill="#fff" opacity=".9"><ellipse cx="300" cy="50" rx="30" ry="10"/><ellipse cx="322" cy="43" rx="18" ry="9"/></g>
     <rect x="0" y={floorY} width="400" height={300-floorY} fill={colour}/><rect x="0" y={floorY} width="400" height="5" fill="#fff" opacity=".3"/>
     {surface==='ice'&&<path d={'M30 '+(floorY+16)+' h60 M130 '+(floorY+30)+' h80 M250 '+(floorY+14)+' h70'} stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7"/>}
     {surface==='carpet'&&<path d={'M0 '+(floorY+18)+' h400 M0 '+(floorY+34)+' h400'} stroke="#8c3f2a" strokeWidth="2" strokeDasharray="3 5" opacity=".5"/>}
     <path d={'M'+x0+' '+floorY+' L'+x0+' '+topY+' L'+botX+' '+floorY+' Z'} fill={colour} stroke="#4a3a2a" strokeWidth="2" strokeLinejoin="round"/>
     <path d={'M'+x0+' '+topY+' L'+botX+' '+floorY} stroke="#fff" strokeWidth="3" opacity=".35"/>
     {[1,2,3,4,5,6,7,8].map(m=>{const x=botX+m*32;return x<390?<g key={m}><line x1={x} y1={floorY} x2={x} y2={floorY+9} stroke="#fff" strokeWidth="2"/><text x={x} y={floorY+22} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">{m}</text></g>:null})}
     <g className={released&&!res.moves?'jiggle':''} transform={'translate('+(cx-nx)+' '+(cy-ny)+') rotate('+rot+')'}>
      <rect x="-17" y="-9" width="34" height="11" rx="4" fill="url(#rp-car)"/><path d="M-8 -9 l4 -7 h10 l5 7 z" fill="#ffb3b3"/>
      <circle cx="-9" cy="3" r="5" fill="#2b2d42"/><circle cx="9" cy="3" r="5" fill="#2b2d42"/><circle cx="-9" cy="3" r="2" fill="#ccd"/><circle cx="9" cy="3" r="2" fill="#ccd"/>
     </g>
    </svg>
    <div className="stage-badges"><span className="day-badge">{t('rampDeg',{n:slope})}</span>{shown&&<span className="stat">{t('rampDist',{n:res.distance})}</span>}</div>
   </div>
   <p className={'lab-observation '+(shown&&res.kind==='far'?'good':shown&&res.kind==='stuck'?'bad':'')} role="status"><strong>{text}</strong>{shown&&<><br/><span>{t('rampWhy')}</span></>}</p>
  </div>
  <div className="lab-side">
   <div className="lab-card">
    <Slider id="ramp-slope" icon="📐" label={t('rampSlope')} value={slope} min={5} max={60} onChange={v=>change(()=>setSlope(v))} format={v=>t('rampDeg',{n:v})}/>
    <h3>{t('rampSurface')}</h3>
    <div className="preset-row">{Object.keys(SURFACES).map(id=><button type="button" key={id} className={surface===id?'on':''} aria-pressed={surface===id} onClick={()=>change(()=>setSurface(id))}>{t(SURFACE_NAMES[id])}</button>)}</div>
    <div className="actions"><button type="button" className="primary" onClick={()=>setReleased(true)} disabled={released&&p<1}>🚗 {t('rampGo')}</button><button type="button" onClick={()=>setReleased(false)} disabled={!released}>↺ {t('rampReset')}</button></div>
   </div>
  </div>
 </div>;
}
