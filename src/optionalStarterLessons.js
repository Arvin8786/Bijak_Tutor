import {JUNIOR_STREAM_LESSONS} from './juniorStreams.js';

/** Introductory, original draft SK optional-language learning activities.
 * Chinese/Tamil starter literacy examples are adapted from our own SJK content;
 * they are NOT a claim of identical school-stream DSKP coverage.
 * Indigenous languages need fluent educator authors before adding text.
 */
function adapt(source,target,oldPrefix,newPrefix){
 return JUNIOR_STREAM_LESSONS.filter(l=>l.subject===source).map(l=>{
  const newId=l.id.replace(oldPrefix,newPrefix);
  return {...l,id:newId,subject:target,school:'SK',status:'DRAFT_TEACHER_REVIEW',
    check:(l.check||[]).map(q=>({...q,id:q.id.replace(l.id,newId)}))};
 });
}
const arabicTopics=[
 [1,'Huruf Alif, Ba dan Ta','Huruf Arab ditulis dari kanan ke kiri. Tiga huruf awal ialah ا (alif), ب (ba) dan ت (ta).','ا ، ب ، ت','Huruf manakah ba?','ب','ا','ت'],
 [1,'Memberi salam','Ucapan السَّلَامُ عَلَيْكُمْ bermaksud semoga sejahtera ke atas kamu. Balas dengan وَعَلَيْكُمُ السَّلَامُ.','السَّلَامُ عَلَيْكُمْ','Yang manakah ucapan salam?','السَّلَامُ عَلَيْكُمْ','كِتَابٌ','بَيْتٌ'],
 [2,'Nombor satu hingga tiga','Nombor satu, dua dan tiga dalam bahasa Arab ialah وَاحِدٌ, اِثْنَانِ dan ثَلَاثَةٌ.','١ = وَاحِدٌ، ٢ = اِثْنَانِ، ٣ = ثَلَاثَةٌ','Yang manakah bermaksud tiga?','ثَلَاثَةٌ','وَاحِدٌ','اِثْنَانِ'],
 [2,'Warna asas','أَحْمَرُ bermaksud merah, أَزْرَقُ bermaksud biru, أَخْضَرُ bermaksud hijau.','أَحْمَرُ = merah','Yang manakah bermaksud merah?','أَحْمَرُ','أَزْرَقُ','أَخْضَرُ'],
 [3,'Perkataan benda','كِتَابٌ ialah buku, بَيْتٌ ialah rumah dan قَلَمٌ ialah pen.','كِتَابٌ = buku','Perkataan untuk buku ialah?','كِتَابٌ','بَيْتٌ','قَلَمٌ'],
 [3,'Kata ganti diri','أَنَا bermaksud saya, أَنْتَ bermaksud awak (lelaki), dan أَنْتِ bermaksud awak (perempuan).','أَنَا = saya','Yang manakah bermaksud saya?','أَنَا','أَنْتَ','أَنْتِ'],
 [4,'Ini buku','هَذَا bermaksud ini untuk kata nama maskulin. هَذَا كِتَابٌ bermaksud ini sebuah buku.','هَذَا كِتَابٌ','Ayat yang bermaksud ini buku ialah?','هَذَا كِتَابٌ','هَذَا قَلَمٌ','هَذَا بَيْتٌ'],
 [4,'Kata sendi tempat','فِي bermaksud di dalam dan عَلَى bermaksud di atas.','الْكِتَابُ عَلَى الْمَكْتَبِ = Buku di atas meja.','Yang manakah bermaksud di atas?','عَلَى','فِي','مِنْ'],
 [5,'Sifat besar dan kecil','كَبِيرٌ bermaksud besar dan صَغِيرٌ bermaksud kecil untuk bentuk maskulin.','بَيْتٌ كَبِيرٌ = rumah besar','Yang manakah bermaksud besar?','كَبِيرٌ','صَغِيرٌ','جَدِيدٌ'],
 [5,'Jamak mudah','Kata nama Arab ada bentuk jamak. كِتَابٌ (sebuah buku) boleh menjadi كُتُبٌ (buku-buku).','كِتَابٌ ← كُتُبٌ','Bentuk jamak untuk كِتَابٌ ialah?','كُتُبٌ','بَيْتٌ','قَلَمٌ'],
 [6,'Bertanya lokasi','أَيْنَ bermaksud di mana. أَيْنَ الْكِتَابُ؟ bermaksud di mana buku itu?','أَيْنَ الْكِتَابُ؟','Kata tanya untuk di mana ialah?','أَيْنَ','مَاذَا','مَنْ'],
 [6,'Ayat perkenalan','أَنَا طَالِبٌ bermaksud saya seorang murid lelaki. أَنَا طَالِبَةٌ ialah bentuk untuk murid perempuan.','أَنَا طَالِبٌ','Yang manakah bermaksud saya?','أَنَا','أَنْتَ','هُوَ']
];
const arabic=arabicTopics.map(([year,title,summary,example,question,answer,a,b],i)=>{
 const id='jr-arabic-'+year+'-'+(i%2+1);
 return {id,school:'SK',year,subject:'Bahasa Arab',title,chapter:'Asas Bahasa Arab · '+title,icon:'✍️',summary,visual:example,status:'DRAFT_TEACHER_REVIEW',premium:false,
  steps:[{title:'Baca dan perhatikan',body:summary},{title:'Lihat contoh',body:example},{title:'Cuba sendiri',body:'Sebut atau tulis perkataan tersebut, kemudian pilih jawapan yang sesuai.'}],
  mind:[['Topik',title],['Idea penting',summary],['Contoh',example]],
  check:[{id:id+'-q1',mode:'choice',text:question,options:[answer,a,b],answer,why:example+'. '+summary}]};
});
export const OPTIONAL_STARTER_LESSONS=[
 ...arabic,
 ...adapt('Bahasa Cina','Bahasa Cina SK','jr-zh-','jr-zh-sk-'),
 ...adapt('Bahasa Tamil','Bahasa Tamil SK','jr-ta-','jr-ta-sk-')
];
