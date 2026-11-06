/** Friendly original word-tile challenge. Not affiliated with any commercial word game.
 * Vocabulary is an explicit curated educational list (not a complete dictionary).
 */
export const WORD_SETS={
 en:[
  {letters:'S T O N E R',words:{stone:'A hard natural material.',tones:'Different sound qualities or pitches.',notes:'Short written messages or musical symbols.',store:'A place where things are sold.',rose:'A fragrant flower.',nest:'A bird’s home.',rest:'A break to regain energy.',tone:'A sound quality.',note:'A short written message.',sent:'Past tense of send.',sort:'Put in a particular order.',rose:'A flowering plant.',ten:'The number after nine.',net:'A mesh used to catch or hold things.',one:'The number before two.',son:'A male child.',set:'A collection.',toe:'A digit on a foot.',ore:'Rock containing useful minerals.',not:'A word used to make a negative statement.'}},
  {letters:'P L A N E T',words:{planet:'A large object orbiting a star.',plant:'A living thing that often grows with light and water.',plane:'An aircraft.',plate:'A flat dish.',panel:'A flat section or group of people.',lean:'Not containing much fat; also to incline.',lane:'A narrow road or marked path.',late:'After the expected time.',neat:'Tidy and orderly.',tape:'A strip used for attaching objects.',pane:'A sheet of glass.',pen:'A tool for writing.',pet:'An animal kept for companionship.',pan:'A cooking vessel.',ant:'A small insect.',tea:'A drink made by steeping leaves.',eat:'To consume food.',net:'A mesh.'}},
  {letters:'G A R D E N',words:{garden:'A place for growing flowers or vegetables.',grade:'A level or score.',danger:'The possibility of harm.',range:'A set of values or an area.',anger:'A strong feeling of displeasure.',read:'To understand written words.',dear:'Loved or valued.',gear:'Tools or equipment.',near:'Close by.',earn:'Receive money for work.',dare:'Have courage to do something.',rang:'Past tense of ring.',rag:'A small piece of old cloth.',red:'A colour.',age:'How old something is.',and:'Joining word.',end:'The final part.',den:'A small animal’s home.'}},
  {letters:'F R I E N D',words:{friend:'Someone you care about and trust.',fired:'Past tense of fire.',finder:'A person or tool that finds things.',fried:'Cooked in hot oil.',find:'To discover something.',fine:'Good or acceptable.',ride:'Travel on a bicycle or vehicle.',dire:'Very serious or urgent.',fire:'Heat and light from burning.',dine:'Eat a meal.',rend:'Tear apart.',red:'A colour.',rid:'Free from something unwanted.',end:'The final part.',die:'Stop living.',fin:'A body part used by fish for swimming.'}}
 ],
 ms:[
  {letters:'B A T U K I',words:{batu:'Benda keras semula jadi.',buka:'Menjadikan sesuatu tidak tertutup.',baki:'Jumlah yang masih tinggal.',baju:'Pakaian pada badan.',tiba:'Sampai di sesuatu tempat.',ikat:'Mengikat sesuatu.',kita:'Saya dan orang lain.',aku:'Kata ganti diri.',ibu:'Emak atau bonda.',ubi:'Tumbuhan berakar yang boleh dimakan.',air:'Cecair yang kita minum.',baik:'Bagus atau elok.',tabi:'Kebiasaan.'}},
  {letters:'B U N G A R',words:{bunga:'Bahagian tumbuhan yang boleh menghasilkan buah.',baru:'Belum lama digunakan.',bang:'Bunyi kuat atau panggilan abang.',buru:'Mengejar sesuatu.',guna:'Memakai sesuatu untuk tujuan tertentu.',rang:'Past tense English; excluded from Malay play.',ruang:'Tempat atau kawasan.',uang:'Wang; bentuk variasi, tidak dipakai.',abu:'Serbuk yang tinggal selepas terbakar.',guru:'Orang yang mengajar.',abu:'Serbuk daripada pembakaran.'}},
  {letters:'S A Y U R K',words:{sayur:'Tumbuhan yang dimakan sebagai makanan.',suka:'Berasa gembira atau gemar.',rasa:'Perasaan atau deria lidah.',kayu:'Bahan keras daripada pokok.',arus:'Aliran air atau elektrik.',saku:'Poket pakaian.',rusa:'Haiwan berkaki empat.',aku:'Kata ganti diri.',isu:'Perkara yang dibincangkan; tidak dapat dibina dengan set ini.',air:'Cecair untuk minum; tidak dapat dibina dengan set ini.',kura:'Sebahagian daripada kata kura-kura.'}}
 ]
};
export const LETTER_POINTS=Object.freeze({A:1,E:1,I:1,O:1,U:1,L:1,N:1,R:1,S:1,T:1,D:2,G:2,B:3,C:3,M:3,P:3,F:4,H:4,V:4,W:4,Y:4,K:5,J:8,X:8,Q:10,Z:10});
export function lettersOf(round){return round.letters.replace(/\s+/g,'').toUpperCase().split('')}
export function canBuild(word,tiles){
 const letters=[...tiles].map(x=>String(x).toUpperCase());
 for(const letter of String(word).toUpperCase()){const i=letters.indexOf(letter);if(i<0)return false;letters.splice(i,1)}
 return Boolean(String(word).length);
}
export function validWords(round){
 const tiles=lettersOf(round);
 return Object.keys(round.words).filter(w=>w.length>=3&&canBuild(w,tiles)&&!/(excluded|cannot be built|tidak dapat dibina|tidak dipakai)/i.test(round.words[w]));
}
export function wordScore(word){return [...String(word).toUpperCase()].reduce((n,ch)=>n+(LETTER_POINTS[ch]||1),0)+Math.max(0,word.length-3)*2}
export function checkTileWord(word,round,used=[]){
 const normalized=String(word).trim().toLowerCase();
 if(!normalized)return {ok:false,message:'Tap the letter tiles to form a word.'};
 if(normalized.length<3)return {ok:false,message:'Use at least three letters.'};
 if(!canBuild(normalized,lettersOf(round)))return {ok:false,message:'That word cannot be made from these letter tiles.'};
 if(used.includes(normalized))return {ok:false,message:'That word has already been played.'};
 if(!validWords(round).includes(normalized))return {ok:false,message:'This word is not in the starter word list. Try another combination.'};
 return {ok:true,word:normalized,score:wordScore(normalized),meaning:round.words[normalized]};
}
export function botTurn(round,used=[],difficulty='normal'){
 const options=validWords(round).filter(w=>!used.includes(w));
 if(!options.length)return null;
 const sorted=options.map(w=>({word:w,score:wordScore(w),meaning:round.words[w]})).sort((a,b)=>b.score-a.score||a.word.localeCompare(b.word));
 return difficulty==='easy'?sorted[sorted.length-1]:difficulty==='hard'?sorted[0]:sorted[Math.min(2,sorted.length-1)];
}
export function getWordRounds(language){return WORD_SETS[language==='ms'?'ms':'en']}
