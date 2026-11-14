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
