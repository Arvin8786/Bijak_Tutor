import React, {useMemo, useState} from 'react';

/**
 * Original, lightweight SVG learning playground. These are explanatory visuals,
 * not official textbook figures, and deliberately avoid giving quiz answers.
 */
export default function LearningVisuals({title='',subject='Matematik'}){
  const [count,setCount]=useState(5);
  const [parts,setParts]=useState(2);
  const [shape,setShape]=useState(0);
  const [hour,setHour]=useState(3);
  const t=title.toLowerCase();
  const type=useMemo(()=>{
    if(/pecahan|fraction/.test(t))return 'fractions';
    if(/masa|waktu|jam|time/.test(t))return 'clock';
    if(/ruang|bentuk|shape|geometri/.test(t))return 'shapes';
    if(/wang|duit|money/.test(t))return 'money';
    if(/data|graf|carta/.test(t))return 'data';
    return 'numbers';
  },[t]);
  return <section className="visual-playground" aria-label="Interactive learning playground">
    <div className="playground-heading"><div><span className="mini-label">🌈 PLAY & DISCOVER</span><h3>Explore with pictures!</h3><p>Touch the buttons and see what changes. This is a practice visual, not an assessment.</p></div><span className="playground-star" aria-hidden="true">✨</span></div>
    {type==='numbers'&&<div className="visual-stage">
      <svg viewBox="0 0 520 195" role="img" aria-label={`${count} colourful apples arranged in a basket`} className="learning-svg">
        <defs><linearGradient id="basket" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#E7A869"/><stop offset="1" stopColor="#BF7343"/></linearGradient></defs>
        <path d="M71 132 Q260 181 449 132 L413 172 Q260 192 107 172Z" fill="url(#basket)" stroke="#A75E39" strokeWidth="5"/>
        {Array.from({length:count},(_,i)=>{const x=104+(i%10)*35;const y=91-Math.floor(i/10)*30;return <g key={i} transform={`translate(${x} ${y})`}><path d="M-5 -11 C-17 -17 -26 -6 -21 9 C-17 23 -7 24 0 21 C9 25 18 18 20 6 C21 -8 10 -16 -1 -11" fill={i%2?'#F45069':'#FF8B46'} stroke="#C63B4F" strokeWidth="2"/><path d="M0 -9 C-1 -19 8 -20 9 -22" stroke="#66793C" strokeWidth="4" fill="none"/><ellipse cx="9" cy="-19" rx="8" ry="4" transform="rotate(-25 9 -19)" fill="#62B868"/></g>})}
        <g fill="#FFFFFF" opacity=".68"><circle cx="51" cy="42" r="8"/><circle cx="465" cy="62" r="6"/><circle cx="420" cy="24" r="4"/></g>
      </svg>
      <div className="visual-controls"><button type="button" onClick={()=>setCount(c=>Math.max(1,c-1))} aria-label="Take away one apple">− Take away 1</button><strong aria-live="polite">{count} 🍎</strong><button type="button" onClick={()=>setCount(c=>Math.min(10,c+1))} aria-label="Add one apple">+ Add 1</button></div>
    </div>}
    {type==='fractions'&&<div className="visual-stage"><div className="fraction-pie" role="img" aria-label={`One out of ${parts} equal parts coloured`} style={{background:`conic-gradient(#FF6F85 0 ${360/parts}deg,#FFE6B9 ${360/parts}deg 360deg)`}}><span>1/{parts}</span></div><p>One colourful piece out of <strong>{parts}</strong> equal pieces.</p><div className="visual-controls">{[2,3,4].map(n=><button type="button" key={n} aria-pressed={parts===n} className={parts===n?'active':''} onClick={()=>setParts(n)}>1/{n}</button>)}</div></div>}
    {type==='clock'&&<div className="visual-stage"><svg className="clock-drawing" viewBox="0 0 230 230" role="img" aria-label={`Clock showing ${hour} o'clock`}><circle cx="115" cy="115" r="100" fill="#FFFDF7" stroke="#6A9BE8" strokeWidth="12"/>{Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <text key={i} x={115+77*Math.sin(a)} y={120-77*Math.cos(a)} textAnchor="middle" fontSize="14" fontWeight="700" fill="#344975">{i||12}</text>})}<line x1="115" y1="115" x2={115+46*Math.sin(hour*Math.PI/6)} y2={115-46*Math.cos(hour*Math.PI/6)} stroke="#F25B76" strokeWidth="8" strokeLinecap="round"/><line x1="115" y1="115" x2="115" y2="49" stroke="#3B5AA6" strokeWidth="6" strokeLinecap="round"/><circle cx="115" cy="115" r="8" fill="#FFB657"/></svg><div className="visual-controls"><button type="button" onClick={()=>setHour(h=>h===1?12:h-1)}>◀ Earlier</button><strong>{hour}:00</strong><button type="button" onClick={()=>setHour(h=>h===12?1:h+1)}>Later ▶</button></div></div>}
    {type==='shapes'&&<div className="visual-stage"><svg className="shape-drawing" viewBox="0 0 360 220" role="img" aria-label={['A colourful circle','A colourful triangle','A colourful square'][shape]}>{shape===0?<circle cx="180" cy="106" r="82" fill="#F9B44F" stroke="#EA8A35" strokeWidth="8"/>:shape===1?<path d="M180 20L278 192H82Z" fill="#92DBBB" stroke="#42B596" strokeWidth="8" strokeLinejoin="round"/>:<rect x="97" y="25" width="166" height="166" rx="10" fill="#B5ADFB" stroke="#796DE3" strokeWidth="8"/>}</svg><div className="visual-controls">{['Circle','Triangle','Square'].map((n,i)=><button type="button" key={n} aria-pressed={shape===i} className={shape===i?'active':''} onClick={()=>setShape(i)}>{n}</button>)}</div></div>}
    {type==='money'&&<div className="visual-stage"><div className="coin-group" aria-label="Three coins showing one ringgit each">{[1,2,3].map(n=><div key={n} className="coin">RM1</div>)}</div><p>Count the coins together: <strong>RM1 + RM1 + RM1 = RM3</strong></p></div>}
    {type==='data'&&<div className="visual-stage"><div className="mini-chart" role="img" aria-label="Example bar chart: apples 4, bananas 6, oranges 3">{[['🍎',4],['🍌',6],['🍊',3]].map(([name,value])=><div key={name} className="mini-chart-bar"><span style={{height:`${value*24}px`}}/><strong>{name}</strong><small>{value}</small></div>)}</div><p>Which bar is tallest? <strong>🍌 Banana!</strong></p></div>}
    <span className="visual-footnote">Made for learning • Move, compare and explain what you notice</span>
  </section>;
}
