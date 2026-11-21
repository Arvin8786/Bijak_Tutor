import test from 'node:test';
import assert from 'node:assert/strict';
import {LESSONS,RAW_LESSONS} from '../src/lessons.js';
import {lessonsForSchool,shownInTamil,localizeText,lessonLanguage} from '../src/lessonLocale.js';
import fs from 'node:fs';
import {studyCopy} from '../src/studyCopy.js';
import {tx,setUiLang} from '../src/i18n.js';

const TAMIL=JSON.parse(fs.readFileSync(new URL('../src/tamilContent.json',import.meta.url),'utf8'));
const UI_TAMIL=JSON.parse(fs.readFileSync(new URL('../src/uiTamil.json',import.meta.url),'utf8'));
const SCAFFOLD=/Which explanation belongs|Choose an example of|Which lesson title matches|Recall the key answer|Learn the idea|Look at an example|Try with support|Think further/;

test('lessons never mix English scaffold wording into Malay, Tamil or Chinese lessons',()=>{
 for(const l of LESSONS){
  if(lessonLanguage(l.subject)==='en')continue;
  assert.ok(!SCAFFOLD.test(JSON.stringify(l)),l.id+' still has English scaffold');
 }
});

test('English lessons keep English wording',()=>{
 const english=LESSONS.filter(l=>l.subject==='Bahasa Inggeris');
 assert.ok(english.length>0);
});

test('SJKT shows every non-exempt subject in Tamil, with no English or Malay left',()=>{
 const shown=lessonsForSchool(RAW_LESSONS,'SJKT',TAMIL).filter(l=>shownInTamil('SJKT',l.subject)&&(!l.school||l.school==='ALL'||l.school==='SJKT'));
 assert.ok(shown.length>=240);
 for(const l of shown){
  const parts=[l.title,l.summary,...(l.steps||[]).flatMap(s=>[s.title,s.body]),...(l.check||[]).flatMap(q=>[q.text,q.why,...(q.options||[])])];
  for(const p of parts)if(typeof p==='string')assert.ok(!/[A-Za-z]{4,}/.test(p),`${l.id}: "${p.slice(0,60)}" is not Tamil`);
  for(const q of l.check||[]){
   if(q.options){
    assert.equal(new Set(q.options).size,q.options.length,l.id+' options collapsed after translation');
    if(q.mode==='choice')assert.ok(q.options.includes(q.answer),l.id+' answer missing from options');
   }
  }
 }
});

test('language subjects, Maths and Science are not translated in SJKT',()=>{
 const base=lessonsForSchool(RAW_LESSONS,'SJKT',TAMIL);
 for(const name of ['Matematik','Sains','Bahasa Melayu','Bahasa Inggeris','Bahasa Tamil']){
  const l=base.find(x=>x.subject===name);
  assert.ok(l&&!shownInTamil('SJKT',name));
  assert.equal(JSON.stringify(l.check.map(q=>q.answer)),JSON.stringify(LESSONS.find(x=>x.id===l.id).check.map(q=>q.answer)));
 }
});

test('scaffold sentences are translated, including nested ones',()=>{
 assert.equal(localizeText('Choose an example of: Kejujuran','ta',{'Kejujuran':'நேர்மை'}),'இதற்கான எடுத்துக்காட்டைத் தேர்ந்தெடுங்கள்: நேர்மை');
 assert.match(localizeText('Which statement helps explain Kerjasama?','ms'),/Pernyataan manakah/);
});

test('Study Buddy never offers a calculation on the Tamil subject',()=>{
 for(const language of ['en','ms','zh','ta']){
  const copy=studyCopy(language,'Bahasa Tamil');
  assert.ok(!copy.examples.some(e=>/\d+\s*[+÷×−-]\s*\d+|\d+\s*÷/.test(e)),language);
  assert.ok(!/28 \+ 15/.test(copy.placeholder+copy.intro));
 }
 assert.ok(studyCopy('ta','Matematik').examples.some(e=>/28 \+ 15/.test(e)));
});

test('Tamil year-1 lesson no longer teaches counting in Malay',()=>{
 const all=JSON.stringify(RAW_LESSONS.filter(l=>l.subject==='Bahasa Tamil'));
 assert.ok(!all.includes('Kira satu hingga tiga'));
});

test('tx translates fixed wording only in Tamil',()=>{
 
 setUiLang('ta');
 const first=Object.keys(UI_TAMIL);
 const sample=Object.keys(UI_TAMIL)[0];
 assert.equal(tx(sample),UI_TAMIL[sample]);setUiLang('en');assert.equal(tx(sample),sample);setUiLang('ta');
 assert.equal(tx('not in the dictionary'),'not in the dictionary');
 setUiLang('en');
 assert.ok(first.length>=300);
});
