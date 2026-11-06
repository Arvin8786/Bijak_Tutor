import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {getWordRounds,validWords,canBuild,checkTileWord,wordScore,botTurn} from '../src/wordTilesEngine.js';
test('word-tile rounds have playable curated English and Malay vocabulary',()=>{
 for(const lang of ['en','ms']){
  const rounds=getWordRounds(lang);assert.ok(rounds.length>=3);
  for(const round of rounds){
   const words=validWords(round);assert.ok(words.length>=6,lang+': '+round.letters);
   for(const w of words)assert.ok(canBuild(w,round.letters.replace(/\s/g,'')),w);
  }
 }
});
test('learner moves are valid, scored and have clear feedback',()=>{
 const round=getWordRounds('en')[0];
 const move=checkTileWord('stone',round,[]);
 assert.equal(move.ok,true);assert.ok(move.score>0);assert.ok(move.meaning.length>10);
 assert.equal(checkTileWord('stone',round,['stone']).ok,false);
 assert.equal(checkTileWord('zzzzz',round,[]).ok,false);
 assert.equal(checkTileWord('to',round,[]).ok,false);
 assert.ok(wordScore('STONE')>wordScore('ONE'));
});
test('bot selects a valid unused word and difficulty influences strength',()=>{
 const round=getWordRounds('en')[0];
 const easy=botTurn(round,['stone'],'easy'),hard=botTurn(round,['stone'],'hard');
 assert.ok(easy&&hard);
 assert.ok(validWords(round).includes(easy.word)&&validWords(round).includes(hard.word));
 assert.ok(hard.score>=easy.score);
 assert.equal(botTurn(round,validWords(round)),null);
});
test('Word Tiles is accessible on home screen and navigation and no external AI key is needed',()=>{
 const code=fs.readFileSync('src/main.jsx','utf8'),game=fs.readFileSync('src/WordTilesGame.jsx','utf8');
 assert.match(code,/WordTilesGame/);
 assert.match(code,/Word Tiles vs Bot/);
 assert.match(game,/aria-label="Available letter tiles"/);
 assert.match(game,/word-bot-score/);
 assert.match(game,/checkTileWord/);
 assert.ok(!game.includes('fetch('));
});
