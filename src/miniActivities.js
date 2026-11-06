/** Original interactive activity catalogue. No third-party worksheet images or brand material. */
export const PICTURE_SUBTRACTION=[
 {emoji:'🍎',item:'apples',start:8,removed:3,context:'A basket of apples'},
 {emoji:'🥕',item:'carrots',start:9,removed:4,context:'A garden of carrots'},
 {emoji:'🎈',item:'balloons',start:7,removed:2,context:'A party with balloons'},
 {emoji:'🦋',item:'butterflies',start:6,removed:3,context:'Butterflies in a garden'},
 {emoji:'🍌',item:'bananas',start:10,removed:5,context:'Bananas at a stall'},
 {emoji:'🧸',item:'teddy bears',start:5,removed:1,context:'Teddy bears on a shelf'},
 {emoji:'🐠',item:'fish',start:9,removed:6,context:'Fish in a pond'},
 {emoji:'🌻',item:'sunflowers',start:12,removed:4,context:'Sunflowers in a field'}
];
export const VOCAB_CARDS=[
 {emoji:'🐟',ms:'ikan',en:'fish',category:'Haiwan / Animals'},
 {emoji:'🐔',ms:'ayam',en:'chicken',category:'Haiwan / Animals'},
 {emoji:'🍎',ms:'epal',en:'apple',category:'Makanan / Food'},
 {emoji:'🍌',ms:'pisang',en:'banana',category:'Makanan / Food'},
 {emoji:'☀️',ms:'matahari',en:'sun',category:'Alam / Nature'},
 {emoji:'🌧️',ms:'hujan',en:'rain',category:'Cuaca / Weather'},
 {emoji:'🐍',ms:'ular',en:'snake',category:'Haiwan / Animals'},
 {emoji:'🐢',ms:'penyu',en:'sea turtle',category:'Haiwan / Animals'},
 {emoji:'🚒',ms:'bomba',en:'firefighter',category:'Pekerjaan / Jobs'},
 {emoji:'👩‍⚕️',ms:'jururawat',en:'nurse',category:'Pekerjaan / Jobs'},
 {emoji:'👩‍🏫',ms:'guru',en:'teacher',category:'Pekerjaan / Jobs'},
 {emoji:'🌷',ms:'bunga',en:'flower',category:'Alam / Nature'},
 {emoji:'🚍',ms:'bas',en:'bus',category:'Kenderaan / Transport'},
 {emoji:'🏠',ms:'rumah',en:'house',category:'Tempat / Places'},
 {emoji:'🧼',ms:'sabun',en:'soap',category:'Kebersihan / Hygiene'},
 {emoji:'📚',ms:'buku',en:'book',category:'Sekolah / School'}
];
export const HIJAIYAH=[
 ['ا','Alif'],['ب','Ba'],['ت','Ta'],['ث','Tha'],['ج','Jim'],['ح','Ha'],['خ','Kha'],
 ['د','Dal'],['ذ','Dhal'],['ر','Ra'],['ز','Zai'],['س','Sin'],['ش','Syin'],
 ['ص','Sad'],['ض','Dad'],['ط','To'],['ظ','Zo'],['ع','Ain'],['غ','Ghain'],
 ['ف','Fa'],['ق','Qaf'],['ك','Kaf'],['ل','Lam'],['م','Mim'],
 ['ن','Nun'],['ه','Ha'],['و','Wau'],['ي','Ya']
];
export const WORDS_TO_MATCH=VOCAB_CARDS.slice(0,12);
export function makeMathOptions(question){
 const answer=question.start-question.removed;const pool=[answer,Math.min(20,answer+1),Math.max(0,answer-1),Math.min(20,answer+2)];
 const unique=[...new Set(pool)];for(let n=0;unique.length<3&&n<20;n++){if(!unique.includes(n))unique.push(n)}
 return unique.slice(0,3).sort((a,b)=>((a*7+question.start)%11)-((b*7+question.start)%11));
}
export function matchOptions(items,index,field='en'){
 const item=items[index%items.length];const used=[item[field]];
 for(let offset=1;used.length<3&&offset<items.length;offset++){const word=items[(index+offset*3)%items.length][field];if(!used.includes(word))used.push(word)}
 return used.sort((a,b)=>a.localeCompare(b));
}
export function makeHijaiyahOptions(index){
 const right=HIJAIYAH[index%HIJAIYAH.length][0];
 const other=[HIJAIYAH[(index+5)%HIJAIYAH.length][0],HIJAIYAH[(index+11)%HIJAIYAH.length][0],HIJAIYAH[(index+17)%HIJAIYAH.length][0]];
 return [...new Set([right,...other])].sort((a,b)=>HIJAIYAH.findIndex(x=>x[0]===a)-HIJAIYAH.findIndex(x=>x[0]===b));
}
