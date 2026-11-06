import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LESSONS} from '../src/lessons.js';
import {LANGUAGES,UI_COPY,readLocale,writeLocale} from '../src/localization.js';
import {availablePracticeSubjects,questionBank,selectPractice,markPractice,flashCards} from '../src/practiceBank.js';

test('Four supported UI languages have valid core navigation labels',()=>{
 assert.deepEqual(LANGUAGES.map(x=>x.code),['ms','en','zh','ta']);
 for(const language of LANGUAGES){
  const labels=UI_COPY[language.code];
  for(const key of ['welcome','choose','continue','change','home','preschool','packs','map','tutor','practice','membership','boy','girl','lesson'])assert.ok(labels[key]?.length>1,language.code+':'+key);
 }
});

test('Stored language preference is controlled and ignores unknown codes',()=>{
 const map=new Map();const store={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 assert.equal(readLocale(store),null);
 assert.equal(writeLocale('ta',store),true);assert.equal(readLocale(store),'ta');
 assert.equal(writeLocale('xx',store),false);assert.equal(readLocale(store),'ta');
});

test('Every authored primary subject with lessons has accessible assessment bank in each stream/year',()=>{
 for(const school of ['SK','SJKC','SJKT'])for(let year=1;year<=6;year++){
  const subjects=availablePracticeSubjects(LESSONS,year,school);
  assert.ok(subjects.length>=7,school+' '+year);
  for(const {subject} of subjects){
   const bank=questionBank(LESSONS,year,school,subject);
   assert.ok(bank.length>=2,'Missing assessment bank: '+school+' '+year+' '+subject);
   assert.ok(bank.every(q=>q.text&&q.answer!==undefined&&q.questionKey));
  }
 }
});

test('Assessment sets are bounded, deterministic and answers are normalized',()=>{
 const bank=questionBank(LESSONS,2,'SK','Matematik');
 const first=selectPractice(bank,10,'test');
 assert.equal(first.length,Math.min(10,bank.length));
 assert.deepEqual(first.map(x=>x.questionKey),selectPractice(bank,10,'test').map(x=>x.questionKey));
 assert.equal(markPractice({answer:'Buku'},' buku! '),true);
 assert.equal(markPractice({answer:'5'},'6'),false);
});

test('Flashcards are based on actual authored lesson summaries',()=>{
 const cards=flashCards(LESSONS,1,'SK','Sains');
 assert.ok(cards.length>=1);
 for(const card of cards)assert.ok(card.front&&card.back&&LESSONS.some(l=>l.id===card.id&&l.summary===card.back));
});

test('Mascot PWA branding shows primary uniformed boy and girl and welcome is wired',()=>{
 const icon=fs.readFileSync('public/icons/icon.svg','utf8');
 assert.match(icon,/<!-- boy -->/);assert.match(icon,/<!-- girl -->/);
 const main=fs.readFileSync('src/main.jsx','utf8');
 assert.match(main,/WelcomeGate/);assert.match(main,/MascotFriends/);
 assert.match(main,/PracticeArena/);
 assert.match(main,/if\(!welcomeDone\)return <WelcomeGate/);
});
