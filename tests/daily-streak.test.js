import test from 'node:test';
import assert from 'node:assert/strict';
import {applyActivity,readStreak,recordActivity,liveStreak,dayKey,EMPTY_STREAK} from '../src/dailyStreak.js';

const store=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)}};

test('first activity starts a streak; same day does not double count',()=>{
 let s=applyActivity(EMPTY_STREAK,'2026-11-14',2);
 assert.deepEqual(s,{streak:1,best:1,last:'2026-11-14',stars:2});
 s=applyActivity(s,'2026-11-14',1);
 assert.equal(s.streak,1);assert.equal(s.stars,3);
});
test('consecutive days grow the streak, a gap resets it, best is kept',()=>{
 let s=applyActivity(EMPTY_STREAK,'2026-11-12');
 s=applyActivity(s,'2026-11-13');s=applyActivity(s,'2026-11-14');
 assert.equal(s.streak,3);
 s=applyActivity(s,'2026-11-17');
 assert.equal(s.streak,1);assert.equal(s.best,3);
 assert.equal(applyActivity({streak:5,best:5,last:'2026-02-28',stars:0},'2026-03-01').streak,6);
});
test('stars never go negative or fractional',()=>{
 assert.equal(applyActivity(EMPTY_STREAK,'2026-11-14',-5).stars,0);
 assert.equal(applyActivity(EMPTY_STREAK,'2026-11-14',2.9).stars,2);
});
test('saved on this device only, and broken storage is tolerated',()=>{
 const storage=store();
 recordActivity(3,{storage,date:new Date(2026,10,14)});
 assert.equal(readStreak(storage).streak,1);
 assert.equal(readStreak({getItem(){throw Error('blocked')}}).streak,0);
 assert.equal(readStreak(store()).stars,0);
 storage.setItem('bijaklearn:streak:v1','{bad');
 assert.equal(readStreak(storage).streak,0);
});
test('a streak that was not continued yesterday or today is no longer shown',()=>{
 const state={streak:4,best:4,last:'2026-11-10',stars:9};
 assert.equal(liveStreak(state,new Date(2026,10,11)),4);
 assert.equal(liveStreak(state,new Date(2026,10,14)),0);
 assert.equal(dayKey(new Date(2026,0,5)),'2026-01-05');
});
