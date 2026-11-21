// More Science Lab experiments. Pure, deterministic models (no randomness, no DOM) so they can be unit-tested.
// Added alongside labModels.js; nothing there is changed.

/* ---------- Melting ice ---------- */
export const ICE_MINUTES=12;
export const ICE_WRAPS={none:1,foil:0.55,wool:0.15};
export const ICE_SIZES={big:1,small:1.7};
export function iceStep(left,{temp,wrap,size}){
 const wrapFactor=ICE_WRAPS[wrap],sizeFactor=ICE_SIZES[size];
 if(wrapFactor===undefined||sizeFactor===undefined)return left;
 if(temp<=0)return left; // at or below freezing nothing melts
 return Math.max(0,left-temp*0.55*wrapFactor*sizeFactor);
}
export function simulateIce(settings,minutes=ICE_MINUTES){
 const line=[100];
 for(let i=0;i<minutes;i++)line.push(iceStep(line[i],settings));
 return line;
}
export function iceKind(left,{temp,wrap}={},minute=1){
 if(temp<=0)return 'frozen';
 if(minute===0)return 'start';
 if(left<=0)return 'melted';
 if(wrap==='wool'&&left>=60&&temp>=25)return 'wrapped';
 if(left<=50)return 'slushy';
 return 'solid';
}

/* ---------- Dissolving ---------- */
export const SOLUTES={sugar:{base:40,dissolves:true},salt:{base:50,dissolves:true},sand:{dissolves:false,look:'settles'},flour:{dissolves:false,look:'cloudy'}};
export const WATER_TEMPS=[10,30,60,80];
export function dissolveResult(soluteId,temp,stirred){
 const s=SOLUTES[soluteId];
 if(!s)return null;
 if(!s.dissolves)return {dissolves:false,seconds:null,kind:s.look};
 const seconds=Math.max(3,Math.round(s.base/((0.5+temp/40)*(stirred?2:1))));
 return {dissolves:true,seconds,kind:seconds<=15?'fast':'slow'};
}
export function dissolvedFraction(result,elapsed){
 if(!result?.dissolves)return 0;
 return Math.max(0,Math.min(1,elapsed/result.seconds));
}

/* ---------- Mixing coloured light ---------- */
export const LIGHT_ON=50; // a lamp counts as "on" at this brightness or more
export function lightName({r,g,b}){
 const on=[r>=LIGHT_ON,g>=LIGHT_ON,b>=LIGHT_ON],key=on.map(x=>x?1:0).join('');
 return ({'000':'black','100':'red','010':'green','001':'blue','110':'yellow','101':'magenta','011':'cyan','111':'white'})[key];
}
export function lightHex({r,g,b}){
 const h=v=>Math.round(Math.max(0,Math.min(100,v))*2.55).toString(16).padStart(2,'0');
 return '#'+h(r)+h(g)+h(b);
}

/* ---------- Singing glasses (pitch) ---------- */
export const GLASS_COUNT=5;
// An emptier glass vibrates faster, so it sounds higher. Full glass = one octave lower than empty.
export function glassFrequency(fill){
 const f=Math.max(0,Math.min(100,fill));
 return Math.round(880*Math.pow(0.5,f/100));
}
export function pitchKind(fill){
 const hz=glassFrequency(fill);
 return hz>=700?'high':hz<=520?'low':'mid';
}
export function isScale(fills){
 if(!Array.isArray(fills)||fills.length<2)return false;
 const down=fills.every((v,i)=>i===0||v>fills[i-1]);
 const up=fills.every((v,i)=>i===0||v<fills[i-1]);
 return down||up;
}

/* ---------- Seesaw (levers) ---------- */
export const SEESAW_MAX_TILT=18;
export function seesawResult({w1,d1,w2,d2}){
 const diff=w1*d1-w2*d2;
 const tilt=Math.max(-SEESAW_MAX_TILT,Math.min(SEESAW_MAX_TILT,diff*4)); // positive: left side goes down
 const kind=diff===0?'balanced':diff>0?'left':'right';
 const lighterWins=diff!==0&&((diff>0&&w1<w2)||(diff<0&&w2<w1));
 return {diff,tilt,kind,unequalBalance:diff===0&&w1!==w2,lighterWins};
}

/* ---------- Discoveries added by these experiments ---------- */
export const MORE_DISCOVERY_GOALS=[
 'ice:melted','ice:wool','ice:frozen',
 'dissolve:sugar_fast','dissolve:sand','dissolve:flour',
 'light:yellow','light:cyan','light:white',
 'sound:low','sound:high','sound:scale',
 'seesaw:balanced','seesaw:light_wins'
];
export const MORE_TABS=[['ice','🧊','expIce'],['dissolve','🧂','expDissolve'],['light','🌈','expLight'],['sound','🥂','expSound'],['seesaw','⚖️','expSeesaw']];
