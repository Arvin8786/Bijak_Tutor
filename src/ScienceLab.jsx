import React,{useEffect,useMemo,useRef,useState} from 'react';
import {say} from './localization.js';
import {recordActivity} from './dailyStreak.js';
import {MAX_DAYS,simulatePlant,blendPlants,diagnosePlant,OBJECTS,LIQUIDS,floatResult,circuitResult,DISCOVERY_GOALS} from './labModels.js';

const STORE='bijaklearn:lab-discoveries:v1';
const loadFound=()=>{try{const v=JSON.parse(window.localStorage.getItem(STORE)||'[]');return Array.isArray(v)?v.filter(k=>DISCOVERY_GOALS.includes(k)):[]}catch{return[]}};
const saveFound=list=>{try{window.localStorage.setItem(STORE,JSON.stringify(list))}catch{}};
const reducedMotion=()=>{try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch{return false}};

const hex=n=>Math.round(n).toString(16).padStart(2,'0');
const mixHex=(a,b,k)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const [x,y]=[p(a),p(b)];return '#'+x.map((v,i)=>hex(v+(y[i]-v)*k)).join('')};

const PREDICTIONS=[['thrive','predThrive'],['pale','predPale'],['wilt','predWilt'],['hurt','predHurt']];
const category=d=>d==='thriving'||d==='growing'?'thrive':d==='pale_leggy'?'pale':d==='wilting'?'wilt':'hurt';
const PRESETS=[['presetCupboard',0,60],['presetWindow',70,55],['presetFlood',70,100],['presetDry',100,10]];

/* ---------- Plant scene ---------- */
function PlantScene({plant}){
 const {light,water}=plant,dead=plant.dead;
 const base={x:200,y:232};
 const stemPx=Math.min(185,24+plant.height*6.5);
 const bend=(dead?1.2:plant.droop)*70;
 const top={x:base.x+bend,y:base.y-stemPx*(1-Math.min(1,plant.droop)*0.35)};
 const ctrl={x:base.x,y:base.y-stemPx*0.6};
 const at=t=>({x:(1-t)**2*base.x+2*(1-t)*t*ctrl.x+t*t*top.x,y:(1-t)**2*base.y+2*(1-t)*t*ctrl.y+t*t*top.y});
 const leafHue=dead?30:Math.round(30+plant.green*0.85),leafFill=dead?'hsl(30 30% 38%)':'hsl('+leafHue+' 58% '+(36+(100-plant.green)*0.1)+'%)';
 const leaves=Array.from({length:plant.leaves},(_,i)=>{
  const t=plant.leaves<=1?0.6:0.28+0.67*(i/Math.max(1,plant.leaves-1)),side=i%2===0?1:-1,p=at(t);
  const a=-25+Math.min(1,dead?1:plant.droop)*85,rot=side===1?a:180-a,len=20+(plant.health/100)*14;
  return <g key={i} transform={'translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+') rotate('+rot.toFixed(1)+')'}><ellipse cx={len/2} cy="0" rx={len/2} ry={len/4.2} fill={leafFill} stroke="rgba(0,0,0,.12)"/></g>;
 });
 const sky=mixHex('#1c2541','#bfe6ff',Math.pow(light/100,0.55)),soil=mixHex('#c9a46c','#5d3f25',water/100);
 const sunR=16+light*0.22;
 return <svg className="plant-svg" viewBox="0 0 400 300" role="img" aria-hidden="true" focusable="false">
  <rect width="400" height="300" fill={sky}/>
  <g className="sun" opacity={0.15+light/120} transform="translate(332 58)">
   {light>25&&<g className="sun-rays">{Array.from({length:12},(_,i)=><line key={i} x1={sunR+6} y1="0" x2={sunR+6+8+light*0.12} y2="0" stroke="#ffd166" strokeWidth="3" strokeLinecap="round" transform={'rotate('+i*30+')'}/>)}</g>}
   <circle r={sunR} fill="#ffd166"/>
  </g>
  {light<30&&<g fill="#fff" opacity={(30-light)/40}>{[[60,40],[110,70],[250,34],[290,92],[160,24]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="1.6"/>)}</g>}
  <rect y="262" width="400" height="38" fill="#7b5a3a" opacity=".25"/>
  {water>8&&<g className="drips" fill="#4cc3ff">{Array.from({length:Math.max(1,Math.ceil(water/25))},(_,i)=><path key={i} className="drip" style={{animationDelay:i*0.35+'s'}} d={'M'+(120+i*40)+' 60 q-6 10 0 14 q6 -4 0 -14z'}/>)}</g>}
  <path d="M146 232 h108 l-12 58 h-84 z" fill="#c8683b" stroke="#8c4526" strokeWidth="2"/>
  <ellipse cx="200" cy="232" rx="54" ry="9" fill={soil} stroke="#8c4526" strokeWidth="2"/>
  <path d={'M'+base.x+' '+base.y+' Q '+ctrl.x+' '+ctrl.y+' '+top.x+' '+top.y} fill="none" stroke={dead?'#8a6a3c':'hsl('+Math.max(60,leafHue)+' 45% 33%)'} strokeWidth="6" strokeLinecap="round"/>
  {leaves}
  {plant.flower&&!dead&&<g transform={'translate('+top.x+' '+(top.y-6)+')'}>{Array.from({length:6},(_,i)=><ellipse key={i} cx="0" cy="-9" rx="5" ry="8" fill="#ff7aa8" transform={'rotate('+i*60+')'}/>)}<circle r="5" fill="#ffd166"/></g>}
  <rect width="400" height="300" fill="#0b1020" opacity={(1-light/100)*0.3} pointerEvents="none"/>
 </svg>;
}

function GrowthChart({language,timeline,previous,day}){
 const t=(k,v)=>say(language,k,v);
 const max=Math.max(30,...timeline.map(s=>s.height),...(previous||[]).map(s=>s.height));
 const x=i=>12+(i/MAX_DAYS)*276,y=h=>108-(h/max)*96;
 const upto=Math.min(MAX_DAYS,Math.floor(day));
 const line=list=>list.map((s,i)=>x(i).toFixed(1)+','+y(s.height).toFixed(1)).join(' ');
 const shown=timeline.slice(0,upto+1);
 return <figure className="lab-chart"><figcaption>{t('chartTitle')} <small>({t('height')})</small></figcaption>
  <svg viewBox="0 0 300 120" role="img" aria-label={t('chartTitle')}>
   <line x1="12" y1="108" x2="288" y2="108" stroke="currentColor" opacity=".3"/><line x1="12" y1="10" x2="12" y2="108" stroke="currentColor" opacity=".3"/>
   {previous&&<polyline points={line(previous)} fill="none" stroke="currentColor" opacity=".3" strokeDasharray="4 4" strokeWidth="2"/>}
   <polyline points={line(shown)} fill="none" stroke="#2f9e5b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
   <circle cx={x(Math.min(MAX_DAYS,day))} cy={y(blendFor(timeline,day).height)} r="4.5" fill="#2f9e5b"/>
  </svg>
  <div className="chart-key"><span className="k-now">{t('thisPlant')}</span>{previous&&<span className="k-prev">{t('lastPlant')}</span>}</div>
 </figure>;
}
const blendFor=(timeline,day)=>{const d=Math.min(MAX_DAYS,Math.max(0,day)),i=Math.floor(d);return i>=MAX_DAYS?timeline[MAX_DAYS]:blendPlants(timeline[i],timeline[i+1],d-i)};

function Slider({id,label,value,onChange,icon}){
 return <label className="lab-slider" htmlFor={id}><span className="lab-slider-top"><span><span aria-hidden="true">{icon}</span> {label}</span><output>{value}%</output></span>
  <input id={id} type="range" min="0" max="100" step="5" value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
}

function PlantLab({language,found,discover}){
 const t=(k,v)=>say(language,k,v);
 const [light,setLight]=useState(70),[water,setWater]=useState(55),[day,setDay]=useState(0),[playing,setPlaying]=useState(false),[guess,setGuess]=useState(null),[previous,setPrevious]=useState(null);
 const timeline=useMemo(()=>simulatePlant(light,water),[light,water]);
 const current=blendFor(timeline,day);
 const whole=timeline[Math.min(MAX_DAYS,Math.floor(day))];
 const diagnosis=diagnosePlant(whole);
 const stuck=useRef(false);

 useEffect(()=>{
  if(!playing)return;
  const calm=reducedMotion();
  const id=setInterval(()=>setDay(d=>{
   const next=calm?Math.floor(d)+1:d+0.08;
   if(next>=MAX_DAYS){setPlaying(false);return MAX_DAYS}
   return next;
  }),calm?700:70);
  return()=>clearInterval(id);
 },[playing]);

 useEffect(()=>{const key='plant:'+diagnosis;if(whole.day>0&&DISCOVERY_GOALS.includes(key))discover(key)},[diagnosis,whole.day]);

 const changeSetting=fn=>{if(day>0)setPrevious(timeline);fn();setDay(0);setPlaying(false)};
 const wasPredicted=guess&&day>=7;
 const right=wasPredicted&&category(diagnosePlant(timeline[7]))===guess;
 const lastShown=useRef(false);
 useEffect(()=>{if(wasPredicted&&right&&!lastShown.current){lastShown.current=true;recordActivity(1)}if(!wasPredicted)lastShown.current=false},[wasPredicted,right]);

 return <div className="lab-grid">
  <div className="lab-stage-col">
   <div className="lab-stage" data-state={diagnosis}>
    <PlantScene plant={current}/>
    <div className="stage-badges"><span className="day-badge">{t('dayLabel',{n:Math.floor(day)})}</span><span className="stat">{t('height')}: {t('cm',{n:current.height.toFixed(1)})}</span><span className="stat">{t('health')}: {Math.round(current.health)}%</span><span className="stat">{t('leaves')}: {current.leaves}</span></div>
   </div>
   <div className="lab-time">
    <button type="button" className="primary" onClick={()=>{if(day>=MAX_DAYS)setDay(0);setPlaying(p=>!p)}}>{playing?'⏸ '+t('pause'):'▶ '+t('play')}</button>
    <label className="lab-slider time" htmlFor="time-machine"><span className="lab-slider-top"><span><span aria-hidden="true">⏳</span> {t('timeMachine')}</span><output>{t('dayLabel',{n:Math.floor(day)})}</output></span>
     <input id="time-machine" type="range" min="0" max={MAX_DAYS} step="any" value={day} onChange={e=>{setPlaying(false);setDay(Number(e.target.value))}}/></label>
   </div>
   <p className={'lab-observation '+(diagnosis==='dead'?'bad':diagnosis==='thriving'?'good':'')} role="status">
    <strong>{t('obs_'+diagnosis,{n:Math.floor(day)})}</strong>{diagnosis!=='start'&&<><br/><span>{t('why_'+diagnosis)}</span></>}
   </p>
  </div>
  <div className="lab-side">
   <div className="lab-card">
    <h3>{t('presetsLabel')}</h3>
    <div className="preset-row">{PRESETS.map(([key,l,w])=><button type="button" key={key} onClick={()=>changeSetting(()=>{setLight(l);setWater(w)})} className={light===l&&water===w?'on':''}>{t(key)}</button>)}</div>
    <Slider id="light" icon="☀️" label={t('sunlight')} value={light} onChange={v=>changeSetting(()=>setLight(v))}/>
    <Slider id="water" icon="💧" label={t('waterLevel')} value={water} onChange={v=>changeSetting(()=>setWater(v))}/>
    <button type="button" onClick={()=>changeSetting(()=>{setLight(70);setWater(55)})}>🌱 {t('newPlant')}</button>
   </div>
   <div className="lab-card">
    <h3>{t('predictQ')}</h3>
    <div className="preset-row" role="group" aria-label={t('predictQ')}>{PREDICTIONS.map(([key,label])=><button type="button" key={key} className={guess===key?'on':''} aria-pressed={guess===key} onClick={()=>setGuess(key)}>{t(label)}</button>)}</div>
    {wasPredicted&&<p role="status" className={'predict-result '+(right?'good':'')}>{t('predYours',{guess:t(PREDICTIONS.find(p=>p[0]===guess)[1])})} {right?t('predRight'):t('predWrong')}</p>}
   </div>
   <GrowthChart language={language} timeline={timeline} previous={previous} day={day}/>
  </div>
 </div>;
}

/* ---------- Float or sink ---------- */
function FloatLab({language,discover}){
 const t=(k,v)=>say(language,k,v);
 const [objectId,setObjectId]=useState('cork'),[liquidId,setLiquidId]=useState('fresh'),[guess,setGuess]=useState(null),[dropped,setDropped]=useState(false);
 const result=floatResult(objectId,liquidId),object=OBJECTS[objectId],liquid=LIQUIDS[liquidId];
 const choose=fn=>{fn();setDropped(false)};
 const drop=()=>{setDropped(true);discover('float:'+objectId+':'+liquidId)};
 const size=36,surface=140,floor=262;
 const cy=!dropped?44:result.floats?surface-size*(1-result.submerged)+size/2:floor-size/2-4;
 const ok=guess&&dropped&&((guess==='float')===result.floats);
 return <div className="lab-grid">
  <div className="lab-stage-col">
   <div className="lab-stage">
    <svg className="plant-svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
     <rect width="400" height="300" fill="#e8f3ff"/>
     <rect x="130" y="70" width="140" height="200" rx="10" fill="#ffffff" opacity=".45" stroke="#7a8aa8" strokeWidth="3"/>
     <rect x="133" y={surface} width="134" height={270-surface-2} rx="8" fill={liquid.color} opacity=".85" style={{transition:'fill .4s'}}/>
     <line x1="133" y1={surface} x2="267" y2={surface} stroke="#fff" strokeWidth="2" opacity=".7"/>
     <text x="200" y="0" textAnchor="middle" fontSize={size} style={{transform:'translateY('+(cy+size*0.35)+'px)',transition:'transform 1.1s cubic-bezier(.3,.7,.3,1)'}}>{object.icon}</text>
    </svg>
   </div>
   <p className={'lab-observation '+(dropped?(result.floats?'good':''):'')} role="status">
    {dropped?<><strong>{t(result.floats?'float_floats':'float_sinks',{object:t('o_'+objectId),liquid:t('l_'+liquidId)})}</strong><br/><span>{t('densityLine',{object:t('o_'+objectId),a:object.density,liquid:t('l_'+liquidId),b:liquid.density})}</span>{guess&&<><br/><span>{ok?t('predRight'):t('predWrong')}</span></>}</>:<strong>{t('floatPredict')}</strong>}
   </p>
  </div>
  <div className="lab-side">
   <div className="lab-card"><h3>{t('pickObject')}</h3>
    <div className="preset-row">{Object.keys(OBJECTS).map(id=><button type="button" key={id} className={objectId===id?'on':''} aria-pressed={objectId===id} onClick={()=>choose(()=>setObjectId(id))}><span aria-hidden="true">{OBJECTS[id].icon}</span> {t('o_'+id)}</button>)}</div>
    <h3>{t('pickLiquid')}</h3>
    <div className="preset-row">{Object.keys(LIQUIDS).map(id=><button type="button" key={id} className={liquidId===id?'on':''} aria-pressed={liquidId===id} onClick={()=>choose(()=>setLiquidId(id))}>{t('l_'+id)}</button>)}</div>
   </div>
   <div className="lab-card"><h3>{t('floatPredict')}</h3>
    <div className="preset-row"><button type="button" className={guess==='float'?'on':''} aria-pressed={guess==='float'} onClick={()=>setGuess('float')}>{t('guessFloat')}</button><button type="button" className={guess==='sink'?'on':''} aria-pressed={guess==='sink'} onClick={()=>setGuess('sink')}>{t('guessSink')}</button></div>
    <div className="actions"><button type="button" className="primary" onClick={drop} disabled={dropped}>⬇ {t('dropIt')}</button><button type="button" onClick={()=>setDropped(false)} disabled={!dropped}>↺ {t('takeOut')}</button></div>
   </div>
  </div>
 </div>;
}

/* ---------- Circuit ---------- */
function CircuitLab({language,discover}){
 const t=(k,v)=>say(language,k,v);
 const [battery,setBattery]=useState(true),[wire,setWire]=useState(true),[closed,setClosed]=useState(false);
 const result=circuitResult({battery,wire,closed});
 const touched=useRef(false); // only count a discovery after the child has changed something
 useEffect(()=>{if(!touched.current){touched.current=true;return}discover('circuit:'+(result.lit?'ok':result.reason))},[result.lit,result.reason]);
 const loop='M90 90 H310 V210 H90 Z';
 return <div className="lab-grid">
  <div className="lab-stage-col">
   <div className="lab-stage">
    <svg className="plant-svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
     <defs><radialGradient id="glow"><stop offset="0" stopColor="#fff6b0"/><stop offset="1" stopColor="#ffd166" stopOpacity="0"/></radialGradient></defs>
     <rect width="400" height="300" fill={result.lit?'#2b3358':'#1c2541'} style={{transition:'fill .5s'}}/>
     <path d={loop} fill="none" stroke="#b8c2d9" strokeWidth="6" strokeLinejoin="round" strokeDasharray={wire?'none':'0 0'}/>
     {!wire&&<rect x="196" y="82" width="36" height="16" fill="#1c2541"/>}
     {result.lit&&<path className="flow" d={loop} fill="none" stroke="#ffd166" strokeWidth="4" strokeDasharray="4 14" strokeLinecap="round"/>}
     {battery&&<g><rect x="70" y="122" width="40" height="64" rx="6" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="3"/><text x="90" y="146" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700">+</text><text x="90" y="176" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="700">−</text></g>}
     <g transform="translate(310 150)">{result.lit&&<circle r="58" fill="url(#glow)"/>}<circle r="26" fill={result.lit?'#fff3a0':'#6b7490'} stroke="#e5e9f5" strokeWidth="4" style={{transition:'fill .4s'}}/><path d="M-10 8 l5 -14 l5 10 l5 -10 l5 14" fill="none" stroke={result.lit?'#d68a00':'#2b3358'} strokeWidth="3"/></g>
     <g transform="translate(200 210)"><circle cx="-30" cy="0" r="6" fill="#e5e9f5"/><circle cx="30" cy="0" r="6" fill="#e5e9f5"/><line x1="-30" y1="0" x2="30" y2={closed?0:-30} stroke="#ff8a5c" strokeWidth="6" strokeLinecap="round" style={{transition:'all .3s'}}/></g>
    </svg>
   </div>
   <p className={'lab-observation '+(result.lit?'good':'')} role="status"><strong>{t('circuit_'+result.reason)}</strong></p>
  </div>
  <div className="lab-side"><div className="lab-card">
   <div className="toggle-list">
    <button type="button" className={battery?'on':''} aria-pressed={battery} onClick={()=>setBattery(v=>!v)}>🔋 {t('batteryOn')}</button>
    <button type="button" className={wire?'on':''} aria-pressed={wire} onClick={()=>setWire(v=>!v)}>🧵 {t('wiresOn')}</button>
    <button type="button" className={closed?'on':''} aria-pressed={closed} onClick={()=>setClosed(v=>!v)}>🔘 {t('switchClosed')}</button>
   </div>
   <p className="lab-hint">{t('tapSwitch')}</p>
  </div></div>
 </div>;
}

export default function ScienceLab({language='ms'}){
 const t=(k,v)=>say(language,k,v);
 const [kind,setKind]=useState('plant'),[found,setFound]=useState(loadFound),[flash,setFlash]=useState('');
 const foundRef=useRef(found); // the latest list, so saving and the streak run once, outside any state updater
 const discover=key=>{
  if(!DISCOVERY_GOALS.includes(key)||foundRef.current.includes(key))return;
  const next=[...foundRef.current,key];
  foundRef.current=next;
  setFound(next);saveFound(next);recordActivity(1);setFlash(key);
 };
 useEffect(()=>{if(!flash)return;const id=setTimeout(()=>setFlash(''),3500);return()=>clearTimeout(id)},[flash]);
 const tabs=[['plant','🌱','expPlant'],['float','🛟','expFloat'],['circuit','💡','expCircuit']];
 return <section className="panel science-lab" aria-label={t('science')}>
  <div className="studio-head"><div><h1><span aria-hidden="true">🔬</span> {t('sciTitle')}</h1><p>{t('sciIntro')}</p></div>
   <div className="discovery-count" aria-live="polite"><strong>🏅 {t('discoveryCount',{n:found.length,total:DISCOVERY_GOALS.length})}</strong>{flash&&<span className="discovery-new">✨ {t('discoveryNew')} {t('dn_'+flash)}</span>}</div>
  </div>
  <div className="studio-tabs" role="group" aria-label={t('chooseExp')}>{tabs.map(([id,icon,label])=><button type="button" key={id} className={kind===id?'on':''} aria-pressed={kind===id} onClick={()=>setKind(id)}><span aria-hidden="true">{icon}</span> {t(label)}</button>)}</div>
  {kind==='plant'&&<PlantLab language={language} found={found} discover={discover}/>}
  {kind==='float'&&<FloatLab language={language} discover={discover}/>}
  {kind==='circuit'&&<CircuitLab language={language} discover={discover}/>}
  <details className="discovery-list"><summary>{t('discoveries')} · {t('discoveryCount',{n:found.length,total:DISCOVERY_GOALS.length})}</summary>
   <ul>{DISCOVERY_GOALS.map(k=><li key={k} className={found.includes(k)?'got':''}><span aria-hidden="true">{found.includes(k)?'✅':'🔒'}</span> {found.includes(k)?t('dn_'+k):'???'}</li>)}</ul>
  </details>
  <p className="studio-foot">{t('modelNote')}</p>
 </section>;
}
