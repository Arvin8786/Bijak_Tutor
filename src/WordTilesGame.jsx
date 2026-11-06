import React,{useMemo,useState} from 'react';
import {getWordRounds,lettersOf,checkTileWord,botTurn,validWords} from './wordTilesEngine.js';

/** Word Tiles vs Bot — original vocabulary-building game, not commercial Scrabble. */
export default function WordTilesGame(){
 const [language,setLanguage]=useState('en');
 const [difficulty,setDifficulty]=useState('normal');
 const [roundIndex,setRoundIndex]=useState(0);
 const [chosen,setChosen]=useState([]);
 const [played,setPlayed]=useState([]);
 const [humanScore,setHumanScore]=useState(0);
 const [botScore,setBotScore]=useState(0);
 const [feedback,setFeedback]=useState('Tap letters to make a word, then play your turn.');
 const [botMessage,setBotMessage]=useState('');
 const [turns,setTurns]=useState(0);
 const rounds=useMemo(()=>getWordRounds(language),[language]);
 const round=rounds[roundIndex%rounds.length];
 const letters=lettersOf(round);
 const draft=chosen.map(index=>letters[index]).join('');
 const used=played.map(x=>x.word);
 const remaining=validWords(round).filter(w=>!used.includes(w)).length;
 const changeLanguage=next=>{setLanguage(next);restart()};
 const restart=()=>{setRoundIndex(0);setChosen([]);setPlayed([]);setHumanScore(0);setBotScore(0);setFeedback('Tap letters to make a word, then play your turn.');setBotMessage('');setTurns(0)};
 const nextRound=()=>{setRoundIndex(n=>n+1);setChosen([]);setPlayed([]);setBotMessage('');setFeedback('New letter rack! Find a word to earn points.');setTurns(0)};
 const addTile=index=>{if(chosen.includes(index))return;setChosen(old=>[...old,index]);setFeedback('Build a word, then press Play word.')};
 const play=()=>{
  const answer=checkTileWord(draft,round,used);
  if(!answer.ok){setFeedback(answer.message);return}
  const nextUsed=[...used,answer.word];
  setHumanScore(n=>n+answer.score);
  const nextPlayed=[...played,{...answer,by:'you'}];
  const bot=botTurn(round,nextUsed,difficulty);
  if(bot){
   setBotScore(n=>n+bot.score);
   nextPlayed.push({...bot,by:'bot'});
   setBotMessage(`🤖 Bot played "${bot.word.toUpperCase()}" (+${bot.score}): ${bot.meaning}`);
  }else setBotMessage('🤖 Bot passes — no unused listed words remain!');
  setPlayed(nextPlayed);setChosen([]);setTurns(n=>n+1);
  setFeedback(`⭐ You earned ${answer.score} points for "${answer.word.toUpperCase()}". ${answer.meaning}`);
 };
 const end=remaining===0||turns>=5;
 return <section className="word-bot-game" aria-label="Word Tiles versus learning bot">
  <header className="word-bot-head"><div><span className="growth-kicker">BIJAKLEARN WORD LAB · PROEASE STUDIO™</span><h1>🔡 Word Tiles vs Bot</h1><p>Build real words from letter tiles. Race a friendly bot, earn points and learn what each word means.</p></div><span aria-hidden="true">🎲</span></header>
  <div className="word-bot-settings"><label>Word language<select value={language} onChange={e=>changeLanguage(e.target.value)}><option value="en">English</option><option value="ms">Bahasa Melayu</option></select></label><label>Bot difficulty<select value={difficulty} onChange={e=>{setDifficulty(e.target.value);restart()}}><option value="easy">Starter bot</option><option value="normal">Friendly bot</option><option value="hard">Challenge bot</option></select></label><button type="button" onClick={restart}>↻ Restart match</button></div>
  <div className="word-bot-score"><div><span>🌟 YOU</span><strong>{humanScore}</strong></div><span className="word-bot-versus">VS</span><div><span>🤖 BOT</span><strong>{botScore}</strong></div></div>
  <div className="word-bot-board"><div className="word-bot-progress">Round {roundIndex+1} · {Math.max(0,5-turns)} turn{5-turns===1?'':'s'} available · {remaining} words remaining</div><p className="word-bot-instruction">{language==='ms'?'Sentuh huruf untuk membina perkataan.':'Tap letters to spell a word (at least 3 letters).'}</p>
   <div className="word-bot-draft" role="status" aria-label="Your current word">{draft||' _ _ _ '}</div>
   <div className="word-bot-rack" aria-label="Available letter tiles">{letters.map((letter,i)=><button type="button" key={i} disabled={chosen.includes(i)||end} className={chosen.includes(i)?'used':''} onClick={()=>addTile(i)} aria-label={`Letter ${letter}, tile ${i+1}`}>{letter}<small>{({A:1,E:1,I:1,O:1,U:1,L:1,N:1,R:1,S:1,T:1,D:2,G:2,B:3,C:3,M:3,P:3,F:4,H:4,V:4,W:4,Y:4,K:5,J:8,X:8,Q:10,Z:10})[letter]||1}</small></button>)}</div>
   <div className="word-bot-actions"><button type="button" onClick={()=>setChosen([])} disabled={!chosen.length}>Clear tiles</button><button type="button" className="primary" onClick={play} disabled={!draft||end}>▶ Play word</button><button type="button" onClick={nextRound}>Next rack →</button></div>
   <div className="word-bot-message" aria-live="polite"><p>{feedback}</p>{botMessage&&<p>{botMessage}</p>}</div>
   {end&&<div className="word-bot-finished" role="status"><strong>🏁 Rack finished!</strong><p>{humanScore>=botScore?'Great effort! Keep building your vocabulary.':'The bot scored more this time. Try a new rack and build longer words!'}</p><button type="button" onClick={nextRound}>Play another rack</button></div>}
  </div>
  <section className="word-bot-history"><h2>Words and meanings</h2>{!played.length?<p>New words and their meanings will appear here after each turn.</p>:<div className="word-bot-plays">{played.map((p,i)=><div key={i} className={p.by==='bot'?'by-bot':'by-human'}><span>{p.by==='bot'?'🤖 Bot':'🌟 You'}</span><strong>{p.word.toUpperCase()}</strong><small>+{p.score} pts</small><p>{p.meaning}</p></div>)}</div>}</section>
  <p className="growth-safety">This is an original educational word-building game with a small curated vocabulary, not a complete dictionary or an official Scrabble game. The bot follows a transparent word-scoring rule and does not require an external AI service.</p>
 </section>;
}