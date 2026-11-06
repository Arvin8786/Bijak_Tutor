/** Original interactive activity catalogue. No third-party worksheet images or brand material. */
export const PICTURE_SUBTRACTION=[
 {emoji:'🍎',item:'apples',start:8,removed:3,context:'A basket of apples'},
 {emoji:'🥕',item:'carrots',start:9,removed:4,context:'A garden of carrots'},
 {emoji:'🎈',item:'balloons',start:7,removed:2,context:'A party with balloons'},
 {emoji:'🦋',item:'butterflies',start:6,removed:3,context:'Butterflies in a garden'},
 {emoji:'🍌',item:'bananas',start:10,removed:5,context:'Bananas at a stall'},
 {emoji:'🧸',item:'teddy bears',start:5,removed:1,context:'Teddy bears on a shelf'},
 {emoji:'🐠',item:'fish',start:9,removed:6,context:'Fish in a pond'},
 {emoji:'🌻',item:'sunflowers',start:12,removed:4,context:'Sunflowers in a field'},
 ...Array.from({length:72},(_,i)=>{const subjects=[['🍎','apples'],['🐥','chicks'],['🥕','carrots'],['🚗','cars'],['⚽','balls'],['🌸','flowers'],['🥚','eggs'],['🍓','strawberries'],['🦋','butterflies'],['🍪','cookies'],['🎈','balloons'],['🐟','fish']];const [emoji,item]=subjects[i%subjects.length];const start=5+(i*7)%16;const removed=1+(i*11)%(start-1);return {emoji,item,start,removed,context:'Count the '+item+' and take some away.'}})
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
 {emoji:'📚',ms:'buku',en:'book',category:'Sekolah / School'},
 {emoji:'🐱',ms:'kucing',en:'cat',category:'Haiwan / Animals'},
 {emoji:'🐶',ms:'anjing',en:'dog',category:'Haiwan / Animals'},
 {emoji:'🐘',ms:'gajah',en:'elephant',category:'Haiwan / Animals'},
 {emoji:'🐯',ms:'harimau',en:'tiger',category:'Haiwan / Animals'},
 {emoji:'🦋',ms:'rama-rama',en:'butterfly',category:'Haiwan / Animals'},
 {emoji:'🐝',ms:'lebah',en:'bee',category:'Haiwan / Animals'},
 {emoji:'🐸',ms:'katak',en:'frog',category:'Haiwan / Animals'},
 {emoji:'🦁',ms:'singa',en:'lion',category:'Haiwan / Animals'},
 {emoji:'🦉',ms:'burung hantu',en:'owl',category:'Haiwan / Animals'},
 {emoji:'🐻',ms:'beruang',en:'bear',category:'Haiwan / Animals'},
 {emoji:'🍐',ms:'pir',en:'pear',category:'Makanan / Food'},
 {emoji:'🥕',ms:'lobak merah',en:'carrot',category:'Makanan / Food'},
 {emoji:'🍇',ms:'anggur',en:'grapes',category:'Makanan / Food'},
 {emoji:'🍉',ms:'tembikai',en:'watermelon',category:'Makanan / Food'},
 {emoji:'🍞',ms:'roti',en:'bread',category:'Makanan / Food'},
 {emoji:'🥚',ms:'telur',en:'egg',category:'Makanan / Food'},
 {emoji:'🍚',ms:'nasi',en:'rice',category:'Makanan / Food'},
 {emoji:'🥛',ms:'susu',en:'milk',category:'Makanan / Food'},
 {emoji:'🌳',ms:'pokok',en:'tree',category:'Alam / Nature'},
 {emoji:'🍃',ms:'daun',en:'leaf',category:'Alam / Nature'},
 {emoji:'🌙',ms:'bulan',en:'moon',category:'Alam / Nature'},
 {emoji:'⭐',ms:'bintang',en:'star',category:'Alam / Nature'},
 {emoji:'☁️',ms:'awan',en:'cloud',category:'Cuaca / Weather'},
 {emoji:'🌬️',ms:'angin',en:'wind',category:'Cuaca / Weather'},
 {emoji:'❄️',ms:'salji',en:'snow',category:'Cuaca / Weather'},
 {emoji:'👩‍🍳',ms:'cef',en:'chef',category:'Pekerjaan / Jobs'},
 {emoji:'👩‍🔬',ms:'saintis',en:'scientist',category:'Pekerjaan / Jobs'},
 {emoji:'✈️',ms:'kapal terbang',en:'airplane',category:'Kenderaan / Transport'},
 {emoji:'🚲',ms:'basikal',en:'bicycle',category:'Kenderaan / Transport'},
 {emoji:'🚂',ms:'kereta api',en:'train',category:'Kenderaan / Transport'},
 {emoji:'✏️',ms:'pensel',en:'pencil',category:'Sekolah / School'},
 {emoji:'📏',ms:'pembaris',en:'ruler',category:'Sekolah / School'},
 {emoji:'🎒',ms:'beg sekolah',en:'schoolbag',category:'Sekolah / School'},
 {emoji:'⏰',ms:'jam',en:'clock',category:'Rumah / Home'},
 {emoji:'🛏️',ms:'katil',en:'bed',category:'Rumah / Home'},
 {emoji:'🪑',ms:'kerusi',en:'chair',category:'Rumah / Home'}
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
