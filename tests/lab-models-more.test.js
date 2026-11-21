import test from 'node:test';
import assert from 'node:assert/strict';
import {ICE_MINUTES,simulateIce,iceKind,dissolveResult,dissolvedFraction,lightName,lightHex,glassFrequency,pitchKind,isScale,seesawResult,MORE_DISCOVERY_GOALS,MORE_TABS} from '../src/labModelsMore.js';
import {DISCOVERY_GOALS} from '../src/labModels.js';

test('ice melts faster when warm, slower when wrapped, never below freezing', () => {
  const warm=simulateIce({temp:35,wrap:'none',size:'big'}),cool=simulateIce({temp:12,wrap:'none',size:'big'});
  assert.ok(warm.at(-1)<cool.at(-1));
  assert.equal(warm.at(-1),0);
  const wool=simulateIce({temp:30,wrap:'wool',size:'big'}),bare=simulateIce({temp:30,wrap:'none',size:'big'});
  assert.ok(wool.at(-1)>bare.at(-1));
  assert.equal(iceKind(wool.at(-1),{temp:30,wrap:'wool'},ICE_MINUTES),'wrapped');
  assert.deepEqual(simulateIce({temp:0,wrap:'none',size:'small'}),Array(ICE_MINUTES+1).fill(100));
  assert.equal(iceKind(100,{temp:-5,wrap:'none'},5),'frozen');
  assert.ok(simulateIce({temp:20,wrap:'none',size:'small'})[3]<simulateIce({temp:20,wrap:'none',size:'big'})[3]);
  const line=simulateIce({temp:30,wrap:'none',size:'big'});
  assert.ok(line.every((v,i)=>i===0||v<=line[i-1]));
});

test('sugar and salt dissolve (faster hot and stirred); sand and flour do not', () => {
  assert.ok(dissolveResult('sugar',80,true).seconds<dissolveResult('sugar',10,false).seconds);
  assert.equal(dissolveResult('sugar',80,true).kind,'fast');
  assert.equal(dissolveResult('salt',10,false).kind,'slow');
  assert.deepEqual(dissolveResult('sand',80,true),{dissolves:false,seconds:null,kind:'settles'});
  assert.equal(dissolveResult('flour',30,true).kind,'cloudy');
  assert.equal(dissolveResult('nothing',30,true),null);
  const r=dissolveResult('sugar',30,false);
  assert.equal(dissolvedFraction(r,0),0);assert.equal(dissolvedFraction(r,r.seconds*2),1);
  assert.equal(dissolvedFraction(dissolveResult('sand',30,false),50),0);
});

test('coloured light mixes additively', () => {
  assert.equal(lightName({r:100,g:100,b:0}),'yellow');
  assert.equal(lightName({r:0,g:100,b:100}),'cyan');
  assert.equal(lightName({r:100,g:0,b:100}),'magenta');
  assert.equal(lightName({r:100,g:100,b:100}),'white');
  assert.equal(lightName({r:10,g:20,b:30}),'black');
  assert.equal(lightHex({r:100,g:0,b:0}),'#ff0000');assert.equal(lightHex({r:0,g:0,b:0}),'#000000');
});

test('fuller glasses sound lower; a rising water line makes a scale', () => {
  assert.equal(glassFrequency(0),880);assert.equal(glassFrequency(100),440);
  assert.ok(glassFrequency(80)<glassFrequency(20));
  assert.equal(pitchKind(5),'high');assert.equal(pitchKind(95),'low');assert.equal(pitchKind(50),'mid');
  assert.ok(isScale([10,30,50,70,90]));assert.ok(isScale([90,70,50,30,10]));
  assert.ok(!isScale([10,10,50,70,90]));assert.ok(!isScale([50,20,60,10,90]));assert.ok(!isScale([]));
});

test('seesaw balances when weight x distance matches on both sides', () => {
  assert.equal(seesawResult({w1:2,d1:3,w2:3,d2:2}).kind,'balanced');
  assert.equal(seesawResult({w1:2,d1:3,w2:3,d2:2}).unequalBalance,true);
  assert.equal(seesawResult({w1:2,d1:2,w2:2,d2:2}).unequalBalance,false);
  const light=seesawResult({w1:1,d1:5,w2:3,d2:1});
  assert.equal(light.kind,'left');assert.equal(light.lighterWins,true);assert.ok(light.tilt>0);
  assert.equal(seesawResult({w1:5,d1:5,w2:1,d2:1}).tilt,18);
  assert.equal(seesawResult({w1:1,d1:1,w2:4,d2:3}).kind,'right');
});

test('new discoveries are additive and never collide with the originals', () => {
  assert.equal(new Set(MORE_DISCOVERY_GOALS).size,MORE_DISCOVERY_GOALS.length);
  for(const key of MORE_DISCOVERY_GOALS)assert.ok(!DISCOVERY_GOALS.includes(key),key);
  assert.equal(DISCOVERY_GOALS.length,21);
  assert.equal(MORE_TABS.length,5);
});
