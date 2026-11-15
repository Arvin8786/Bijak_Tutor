import test from 'node:test';
import assert from 'node:assert/strict';
import {simulatePlant,diagnosePlant,floatResult,circuitResult,lightFactor,waterFactor,blendPlants,MAX_DAYS,PLANT_START,DISCOVERY_GOALS} from '../src/labModels.js';

const last=(light,water,days=MAX_DAYS)=>{const t=simulatePlant(light,water,days);return t[t.length-1]};

test('plant thrives with balanced sunlight and water and grows tall',()=>{
 const end=last(70,55);
 assert.equal(diagnosePlant(end),'thriving');
 assert.ok(end.height>PLANT_START.height+10,'grows over two weeks');
 assert.ok(end.leaves>PLANT_START.leaves);
});
test('no water makes the plant wilt and decline',()=>{
 const end=last(70,0);
 assert.ok(['wilting','dead'].includes(diagnosePlant(end)),diagnosePlant(end));
 assert.ok(end.droop>0.5);
 assert.ok(end.health<40);
});
test('very little light gives a tall, pale, weak plant',()=>{
 const mid=simulatePlant(5,60)[7];
 assert.equal(diagnosePlant(mid),'pale_leggy');
 assert.ok(mid.green<70);
 assert.ok(mid.health<mid.green+60);
});
test('too much water harms the plant (roots cannot breathe)',()=>{
 assert.ok(['rotting','dead'].includes(diagnosePlant(last(70,100))));
});
test('strong sun with dry soil scorches the plant',()=>{
 assert.ok(['scorched','wilting','dead'].includes(diagnosePlant(last(100,10))));
});
test('more light helps growth up to the comfortable range',()=>{
 const h=l=>last(l,55).height;
 assert.ok(h(20)<h(40)&&h(40)<h(70));
 assert.ok(lightFactor(0)===0&&lightFactor(70)===1&&lightFactor(100)<1);
 assert.ok(waterFactor(0)===0&&waterFactor(55)===1&&waterFactor(100)<0.5);
});
test('a dead plant stays dead and stops growing',()=>{
 const t=simulatePlant(0,0,MAX_DAYS);
 const deadAt=t.findIndex(s=>s.dead);
 assert.ok(deadAt>0,'plant eventually dies without light and water');
 assert.equal(t[MAX_DAYS].height,t[deadAt].height);
});
test('simulation is deterministic and bounded',()=>{
 assert.deepEqual(simulatePlant(33,77),simulatePlant(33,77));
 for(const s of simulatePlant(100,100)){assert.ok(s.health>=0&&s.health<=100&&s.green>=0&&s.green<=100&&s.droop>=0&&s.droop<=1)}
});
test('blending two days stays between them',()=>{
 const t=simulatePlant(70,55,2),m=blendPlants(t[0],t[1],0.5);
 assert.ok(m.height>t[0].height&&m.height<t[1].height);
});
test('floating depends on density of object and liquid',()=>{
 assert.equal(floatResult('steel','fresh').floats,false);
 assert.equal(floatResult('cork','fresh').floats,true);
 assert.equal(floatResult('ice','fresh').floats,true);
 assert.equal(floatResult('egg','fresh').floats,false);
 assert.equal(floatResult('egg','salty').floats,true);
 assert.equal(floatResult('steel','syrup').floats,false);
 assert.ok(floatResult('wood','fresh').submerged<floatResult('ice','fresh').submerged);
 assert.equal(floatResult('nope','fresh'),null);
});
test('circuit lights only when battery, wire and closed switch are all present',()=>{
 assert.deepEqual(circuitResult({battery:true,wire:true,closed:true}),{lit:true,reason:'ok'});
 assert.equal(circuitResult({battery:false,wire:true,closed:true}).reason,'no_battery');
 assert.equal(circuitResult({battery:true,wire:false,closed:true}).reason,'broken_wire');
 assert.equal(circuitResult({battery:true,wire:true,closed:false}).reason,'switch_open');
});
test('every discovery goal can be reached',()=>{
 const reachable=new Set();
 for(const [l,w] of [[70,55],[70,0],[5,60],[70,100],[100,10]]){for(const s of simulatePlant(l,w)){reachable.add('plant:'+diagnosePlant(s))}}
 for(const g of DISCOVERY_GOALS.filter(g=>g.startsWith('plant:')))assert.ok(reachable.has(g),g);
 for(const g of DISCOVERY_GOALS.filter(g=>g.startsWith('float:'))){const [,o,l]=g.split(':');assert.ok(floatResult(o,l))}
});

import {sunElevation,shadowLength,shadowKind,magnetResult,MAGNET_ITEMS,simulatePuddle,puddleKind,rampResult,SURFACES,SHADOW_OBJECTS} from '../src/labModels.js';

test('shadows are longest early and late, shortest at midday, and taller objects cast longer shadows',()=>{
 assert.ok(sunElevation(12)>sunElevation(9)&&sunElevation(9)>sunElevation(7));
 assert.ok(sunElevation(9)===sunElevation(15));
 assert.ok(shadowLength(100,sunElevation(8))>shadowLength(100,sunElevation(10)));
 assert.ok(shadowLength(100,sunElevation(10))>shadowLength(100,sunElevation(12)));
 assert.ok(shadowLength(120,30)>shadowLength(60,30));
 assert.equal(shadowLength(100,45),100);
 assert.equal(shadowKind(7),'long');assert.equal(shadowKind(12),'short');assert.equal(shadowKind(9),'medium');
 assert.ok(Object.values(SHADOW_OBJECTS).every(o=>o.height>0));
});
test('magnets pull only magnetic things, only when close, and pass through paper or glass',()=>{
 for(const id of Object.keys(MAGNET_ITEMS)){
  const near=magnetResult(id,10);
  assert.equal(near.code,MAGNET_ITEMS[id].magnetic?'attract':'ignore',id);
 }
 assert.equal(magnetResult('nail',90).code,'far');
 assert.ok(magnetResult('nail',10).pull>magnetResult('nail',50).pull);
 assert.equal(magnetResult('nail',20,'paper').through,true);
 assert.equal(magnetResult('nail',20,'paper').code,'attract');
 assert.equal(magnetResult('nail',20).through,false);
 assert.equal(magnetResult('foil',5,'glass').code,'ignore');
 assert.equal(magnetResult('nope',5),null);assert.equal(magnetResult('nail',5,'lead'),null);
});
test('puddles dry faster when hot and windy, and barely at all under a lid',()=>{
 const left=(o)=>simulatePuddle(o).at(-1);
 assert.ok(left({temp:35,wind:60,covered:false})<left({temp:20,wind:20,covered:false}));
 assert.ok(left({temp:20,wind:20,covered:false})<left({temp:10,wind:0,covered:false}));
 assert.equal(left({temp:35,wind:60,covered:false}),0);
 assert.ok(left({temp:35,wind:60,covered:true})>=70);
 const line=simulatePuddle({temp:30,wind:30,covered:false});
 assert.ok(line.every((v,i)=>i===0||v<=line[i-1])&&line.every(v=>v>=0&&v<=100));
 assert.equal(puddleKind(100,false,0),'start');assert.equal(puddleKind(0,false,9),'dry');assert.equal(puddleKind(80,true,12),'covered');
 assert.equal(puddleKind(30,false,8),'most');assert.equal(puddleKind(70,false,4),'slow');
});
test('a car on a ramp gets stuck on rough surfaces and slides far on ice',()=>{
 assert.equal(rampResult(10,'wood').kind,'stuck');
 assert.equal(rampResult(10,'wood').moves,false);
 assert.equal(rampResult(30,'ice').kind,'far');
 assert.ok(rampResult(30,'wood').distance>0&&rampResult(30,'wood').distance<rampResult(30,'ice').distance);
 assert.ok(rampResult(45,'carpet').distance<rampResult(45,'ice').distance);
 assert.ok(rampResult(40,'wood').distance>rampResult(25,'wood').distance);
 assert.ok(rampResult(80,'ice').distance<=10);
 assert.equal(rampResult(30,'lava'),null);
 assert.ok(Object.values(SURFACES).every(s=>s.mu>0));
});
test('every new discovery goal is reachable',()=>{
 const reach=new Set();
 for(let h=7;h<=17;h++){const k=shadowKind(h);if(k!=='medium')reach.add('shadow:'+k)}
 for(const id of Object.keys(MAGNET_ITEMS)){const r=magnetResult(id,10,'paper');if(r.code==='attract'){reach.add('magnet:attract');if(r.through)reach.add('magnet:through')}else reach.add('magnet:ignore')}
 if(simulatePuddle({temp:35,wind:60,covered:false}).at(-1)===0)reach.add('puddle:dry');
 if(puddleKind(simulatePuddle({temp:35,wind:60,covered:true}).at(-1),true,12)==='covered')reach.add('puddle:covered');
 if(rampResult(10,'wood').kind==='stuck')reach.add('ramp:stuck');
 if(rampResult(30,'ice').kind==='far')reach.add('ramp:far');
 for(const g of DISCOVERY_GOALS.filter(g=>/^(shadow|magnet|puddle|ramp):/.test(g)))assert.ok(reach.has(g),g);
});
