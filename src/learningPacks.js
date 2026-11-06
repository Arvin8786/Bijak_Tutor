/** Learning packs are curated from actual authored lessons, never invented resources. */
export const PACK_BLUEPRINTS=[
 {id:'number-explorers',title:'Number Explorers',subtitle:'Count, compare and solve!',emoji:'🚀',subjects:['Matematik'],tone:'sunshine'},
 {id:'word-wizards',title:'Word Wizards',subtitle:'Read, spell and express yourself!',emoji:'🪄',subjects:['Bahasa Melayu','Bahasa Inggeris','Bahasa Cina','Bahasa Tamil'],tone:'berry'},
 {id:'science-detectives',title:'Science Detectives',subtitle:'Observe, ask and discover!',emoji:'🔬',subjects:['Sains'],tone:'ocean'},
 {id:'kindness-heroes',title:'Kindness Heroes',subtitle:'Make thoughtful choices!',emoji:'💚',subjects:['Pendidikan Moral','Pendidikan Islam'],tone:'mint'},
 {id:'creative-makers',title:'Creative Makers',subtitle:'Explore music, art and design!',emoji:'🎨',subjects:['Pendidikan Seni Visual','Pendidikan Muzik','Reka Bentuk dan Teknologi'],tone:'violet'},
 {id:'world-explorers',title:'World Explorers',subtitle:'Discover stories, places and people!',emoji:'🌍',subjects:['Sejarah','Pendidikan Jasmani dan Pendidikan Kesihatan'],tone:'peach'}
];
export function buildLearningPacks(lessons=[],year=1,school='SK',size=4){
 const filtered=lessons.filter(l=>Number(l.year)===Number(year)&&(!l.school||l.school==='ALL'||l.school===school));
 return PACK_BLUEPRINTS.map(blueprint=>{
  const candidates=filtered.filter(l=>blueprint.subjects.includes(l.subject));
  // Each subject appears fairly in broad packs; all lessons remain accessible through library.
  const lessonsForPack=[];
  const subjectBuckets=blueprint.subjects.map(subject=>candidates.filter(l=>l.subject===subject));
  while(lessonsForPack.length<size&&subjectBuckets.some(b=>b.length)){
   for(const bucket of subjectBuckets){if(bucket.length&&lessonsForPack.length<size)lessonsForPack.push(bucket.shift())}
  }
  return {...blueprint,lessons:lessonsForPack,available:candidates.length};
 }).filter(p=>p.lessons.length);
}
export function packProgress(pack,attempts={},childId=''){
 const done=pack.lessons.filter(l=>childId&&(attempts[childId+'/'+l.id]?.attempts||[]).length>0).length;
 return {done,total:pack.lessons.length,percent:pack.lessons.length?Math.round(done*100/pack.lessons.length):0};
}
export function featuredLesson(packs,attempts={},childId=''){
 for(const p of packs)for(const l of p.lessons)if(!childId||!(attempts[childId+'/'+l.id]?.attempts||[]).length)return {pack:p,lesson:l};
 return packs[0]?.lessons[0]?{pack:packs[0],lesson:packs[0].lessons[0]}:null;
}
