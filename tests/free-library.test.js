import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {runInNewContext} from 'node:vm';
import {games,matchPairs} from '../src/freeGames.js';

test('free games have distinct entries and every generated round contains its answers',()=>{
 assert.ok(games.length>=30);
 assert.equal(new Set(games.map(([id])=>id)).size,games.length);
 assert.equal(new Set(matchPairs.map(pair=>pair[1])).size,matchPairs.length);
 for(const [id,,,round] of games){
  if(!round)continue;
  for(let i=0;i<50;i++){
   const {answer,options,type}=round();
   if(type==='memory'){assert.equal(new Set(answer).size,4);continue}
   assert.equal(new Set(options).size,options.length,id);
   for(const value of [answer].flat())assert.ok(options.includes(value),id);
  }
 }
});

test('two linked learners can complete a private match while others are refused',()=>{
 const store=new Map();
 const source=readFileSync(new URL('../apps-script/FriendMatches.gs',import.meta.url),'utf8');
 const match=runInNewContext(source+'\nfriendMatch',{
  requireModule_(){},portalIdentity_:studentChildId=>({role:studentChildId==='parent'?'PARENT':'STUDENT',studentChildId}),
  requireChild_:(_,childId)=>({childId}),
  CacheService:{getScriptCache:()=>({get:key=>store.get(key),put:(key,value)=>store.set(key,value)})},
  LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
  Utilities:{getUuid:()=>'aaaaa11111-bbbb-cccc-dddd-eeeeeeeeeeee'}
 });
 const {id}=match('one','create');
 assert.throws(()=>match('parent','join',{id}),/linked student/);
 assert.throws(()=>match('three','status',{id}),/Join/);
 const joined=match('two','join',{id});
 assert.equal(joined.joined,true);
 assert.throws(()=>match('three','join',{id}),/two players/);
 const correct=[['Bella','Batu Pahat','Banana','Bear'],['Mira','Melaka','Mango','Monkey'],['Priya','Penang','Pineapple','Panda'],['Sofia','Seremban','Sandwich','Snake']];
 const incorrect=correct.map(row=>row.map(()=>'?'));
 assert.equal(match('one','submit',{id,answers:correct}).score,16);
 assert.equal(match('one','submit',{id,answers:incorrect}).score,16);
 assert.equal(match('two','status',{id}).friendScore,null);
 const done=match('two','submit',{id,answers:incorrect});
 assert.equal(done.completed,true);
 assert.equal(done.score,0);
 assert.equal(done.friendScore,16);
 assert.equal(match('one','status',{id}).friendScore,0);
 assert.ok(!JSON.stringify(done).includes('players'));
});
