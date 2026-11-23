// Supplementary language practice with Malay instructions and source-attested vocabulary.
const subjects=[
 {
  id:'iban',name:'Bahasa Iban',
  entries:[['satu','1'],['dua','2'],['tiga','3'],['empat','4'],['lima','5'],['tujuh','7'],['lapan','8'],['sembilan','9'],['sepuluh','10'],['dua puluh','20'],['tiga puluh','30'],['empat puluh','40']]
 },
 {
  id:'kadazandusun',name:'Bahasa Kadazandusun',
  entries:[['iso','1'],['duo','2'],['tolu','3'],['apat','4'],['limo','5'],['turu','7'],['walu','8'],['siam','9'],['hopod','10'],['hopod om iso','11'],['hopod om duo','12'],['hopod om tolu','13']]
 },
 {
  id:'semai',name:'Bahasa Semai',
  entries:[['bor huper','selamat pagi'],['muh eng','nama saya'],['nar','dua'],['sekulah','sekolah'],['bob','buku'],['bungak','bunga'],['senglop','alas'],['pepustakadan','perpustakaan']]
 }
];

const counting=[
 {title:'Kad nombor pertama',entries:[0,1,2],scene:'Lukis satu bola, dua pensel dan tiga bintang pada kad berasingan.',mission:'Tutup angka dan padankan label dengan gambar.'},
 {title:'Bilangan di atas meja',entries:[2,3,4],scene:'Susun tiga pemadam, empat pensel dan lima penutup botol.',mission:'Tukar susunan benda dan lihat sama ada bilangan itu berubah.'},
 {title:'Cari kad yang hilang',entries:[4,5,6],scene:'Sediakan kad untuk lima, tujuh dan lapan. Minta rakan menyembunyikan satu kad.',mission:'Kira objek di setiap stesen dan terangkan cara mencari label yang hilang.'},
 {title:'Kiraan di gerai',entries:[6,7,8],scene:'Bayangkan tiga pinggan di gerai. Letak lapan, sembilan dan sepuluh objek kecil di atasnya.',mission:'Pindahkan satu objek dari pinggan dengan sembilan objek ke pinggan dengan lapan. Tukar label.'},
 {title:'Nombor dua digit',entries:[8,9,10],scene:'Buat kumpulan sepuluh dengan membalut sepuluh batang aiskrim dalam satu ikatan.',mission:'Gunakan ikatan dan batang tunggal untuk menunjukkan setiap angka, kemudian tulis labelnya.'},
 {title:'Bina permainan label nombor',entries:[9,10,11],scene:'Tulis tiga angka pada kad. Pada tiga kad lain, tulis perkataan yang sepadan.',mission:'Beri kad kepada rakan tanpa menunjukkan jawapan. Minta mereka menerangkan sebab padanan mereka.'}
];
const semai=[
 {title:'Sapaan pagi dan nama',entries:[0,1,3],scene:'Bayangkan kamu sampai di sekolah dan bertemu seorang rakan baharu.',mission:'Tunjuk kad sapaan dahulu, kemudian gunakan kad nama dengan nama pilihan kamu.'},
 {title:'Kad perkataan di sekolah',entries:[2,3,4],scene:'Sediakan gambar sekolah dan buku. Lukis dua titik pada kad ketiga.',mission:'Padankan tiga perkataan dengan gambar. Tunjukkan apa yang berubah jika bilangan buku bertambah.'},
 {title:'Buku dan bunga',entries:[3,4,5],scene:'Lukis sekolah, sebuah buku dan sekuntum bunga pada tiga kad.',mission:'Minta rakan memilih sebuah kad gambar. Cari label Semai untuk gambar pilihan itu.'},
 {title:'Barang di ruang belajar',entries:[4,5,6],scene:'Bayangkan kamu menyusun buku, bunga dan alas di sudut bacaan.',mission:'Bina pelan sudut bacaan pada kertas dan tambah label pada setiap benda.'},
 {title:'Peta perpustakaan',entries:[3,4,7],scene:'Lukis peta ringkas yang menunjukkan sekolah, perpustakaan dan sebuah rak buku.',mission:'Tunjuk seorang rakan tempat meminjam buku. Gunakan tiga kad perkataan untuk melabel peta.'},
 {title:'Galeri kad Semai',entries:[0,5,7],scene:'Sediakan kad dengan gambar matahari pagi, bunga dan perpustakaan.',mission:'Buat galeri mini. Bagi setiap kad, beritahu rakan maknanya dan situasi kad itu patut digunakan.'}
];

export const HERITAGE_LANGUAGE_LESSONS=subjects.flatMap(subject=>
 (subject.id==='semai'?semai:counting).map((lesson,i)=>{
  const year=i+1;
  const terms=lesson.entries.map(index=>subject.entries[index]);
  const correct=terms[year%3];
  const second=terms[(year+1)%3];
  const last=terms[(year+2)%3];
  return {
   id:`sk-y${year}-${subject.id}-starter`,school:'SK',year,subject:subject.name,
   title:lesson.title,chapter:'Latihan kosa kata',icon:'🌿',status:'DRAFT_TEACHER_REVIEW',
   summary:'Padankan perkataan dalam '+subject.name+' dengan makna dan gunakan perkataan itu dalam aktiviti.',
   mind:terms,
   steps:[
    {title:'Kenal perkataan',body:terms.map(([word,meaning])=>word+' → '+meaning).join(' · ')},
    {title:'Buat kad',body:lesson.scene},
    {title:'Cuba sendiri',body:lesson.mission}
   ],
   check:[
    {id:'meaning',mode:'choice',text:`Apakah makna “${correct[0]}”?`,options:terms.map(([,meaning])=>meaning),answer:correct[1],why:`“${correct[0]}” bermaksud ${correct[1]}.`},
    {id:'recall',mode:'text',text:`Tulis perkataan untuk “${second[1]}”.`,answer:second[0],why:`Perkataan yang sepadan ialah “${second[0]}”.`},
    {id:'transfer',mode:'choice',text:`Untuk melabel kad “${last[1]}”, perkataan manakah patut dipilih?`,options:terms.map(([word])=>word).reverse(),answer:last[0],why:`Label yang betul ialah “${last[0]}”.`,transfer:true}
   ]
  };
 })
);
