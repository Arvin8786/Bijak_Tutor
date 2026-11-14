// Simple, original, qualitative models for the Virtual Science Lab.
// They are teaching models, not measured science: every number is a classroom approximation.

export const MAX_DAYS=14;
const clamp=(v,lo=0,hi=100)=>Math.min(hi,Math.max(lo,v));

/* ---------- Plant growth ---------- */
export const PLANT_START=Object.freeze({day:0,height:4,leaves:2,health:80,green:80,droop:0,flower:false,dead:false,light:60,water:60});

// 0..1: how well the plant can use this much sunlight (percent of a bright sunny day).
export function lightFactor(light){
 if(light<=55)return clamp(light/55,0,1);
 if(light<=85)return 1;
 return 1-((light-85)/15)*0.5;
}
// 0..1: how well the roots cope with this much water (percent of "just right" soaking).
export function waterFactor(water){
 if(water<40)return clamp(water/40,0,1);
 if(water<=70)return 1;
 return 1-((water-70)/30)*0.7;
}

export function stepPlant(state,{light,water}){
 const next={...state,day:state.day+1,light,water};
 if(state.dead||state.health<=0)return {...next,health:0,droop:1,green:Math.max(0,state.green*0.8),dead:true};
 const L=lightFactor(light),W=waterFactor(water);
 const food=Math.min(L,W)*0.7+L*W*0.3; // photosynthesis needs both light and water
 let growth=food*0.9;
 if(light<45)growth+=((45-light)/45)*0.5; // stretching towards the light
 let change=(food-0.5)*10;
 if(water<12)change-=5;
 if(water>92)change-=5;
 if(light<8)change-=3;
 if(light>94&&water<45)change-=5;
 const health=clamp(state.health+change);
 const greenTarget=clamp(health*0.6+L*40);
 const droopTarget=clamp((water<40?(40-water)/40:0)+(health<35?((35-health)/35)*0.5:0),0,1);
 let leaves=state.leaves;
 if(food>0.6&&health>40&&next.day%2===0)leaves=Math.min(12,leaves+1);
 if(health<30)leaves=Math.max(0,leaves-1);
 return {
  ...next,
  height:state.height+(health>0?growth:0),
  leaves,health,
  green:state.green+(greenTarget-state.green)*0.3,
  droop:state.droop+(droopTarget-state.droop)*0.4,
  flower:state.flower||(next.day>=9&&health>=75&&food>0.8),
  dead:health<=0
 };
}

export function simulatePlant(light,water,days=MAX_DAYS){
 const timeline=[{...PLANT_START,light,water}];
 for(let i=0;i<days;i++)timeline.push(stepPlant(timeline[i],{light,water}));
 return timeline;
}

// A short code the interface turns into plain-language text in the chosen language.
export function diagnosePlant(state){
 if(state.dead)return 'dead';
 if(state.day===0)return 'start';
 const {light,water,health,green,droop}=state;
 if(water>70&&health<60)return 'rotting';
 if(light>85&&water<50&&health<60)return 'scorched';
 if(water<40&&droop>=0.3)return 'wilting';
 if(light<45&&(green<65||health<65))return 'pale_leggy';
 if(health>=70&&green>=70&&droop<0.25)return 'thriving';
 return health<60?'struggling':'growing';
}

// Linear blend between two day-states so the time-lapse moves smoothly.
export function blendPlants(a,b,t){
 const k=clamp(t,0,1),mix=(x,y)=>x+(y-x)*k;
 return {...b,height:mix(a.height,b.height),leaves:Math.round(mix(a.leaves,b.leaves)),health:mix(a.health,b.health),green:mix(a.green,b.green),droop:mix(a.droop,b.droop),light:mix(a.light,b.light),water:mix(a.water,b.water),flower:k>0.5?b.flower:a.flower};
}

/* ---------- Float or sink ---------- */
export const OBJECTS={
 cork:{density:0.24,icon:'🟫'},wood:{density:0.5,icon:'🪵'},ice:{density:0.92,icon:'🧊'},
 egg:{density:1.03,icon:'🥚'},glass:{density:2.5,icon:'🔵'},steel:{density:7.8,icon:'⚙️'}
};
export const LIQUIDS={fresh:{density:1.0,color:'#7cc7ee'},salty:{density:1.1,color:'#5fb3d9'},syrup:{density:1.3,color:'#e0a24a'}};

export function floatResult(objectId,liquidId){
 const object=OBJECTS[objectId],liquid=LIQUIDS[liquidId];
 if(!object||!liquid)return null;
 const ratio=object.density/liquid.density;
 return {floats:ratio<1,submerged:ratio<1?ratio:1,ratio};
}

/* ---------- Simple circuit ---------- */
export function circuitResult({battery,wire,closed}){
 if(!battery)return {lit:false,reason:'no_battery'};
 if(!wire)return {lit:false,reason:'broken_wire'};
 if(!closed)return {lit:false,reason:'switch_open'};
 return {lit:true,reason:'ok'};
}

/* ---------- Discoveries (collect them all) ---------- */
export const DISCOVERY_GOALS=[
 'plant:thriving','plant:wilting','plant:pale_leggy','plant:rotting','plant:scorched',
 'float:ice:fresh','float:egg:fresh','float:egg:salty','float:steel:syrup',
 'circuit:ok','circuit:switch_open','circuit:no_battery'
];
