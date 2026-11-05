import {EXPANDED_LESSONS} from './expandedLessons.js';
import {JUNIOR_FOUNDATION_LESSONS} from './juniorFoundation.js';
import {JUNIOR_ENRICHMENT_LESSONS} from './juniorEnrichment.js';
import {JUNIOR_STREAM_LESSONS} from './juniorStreams.js';
import {enrichPractice} from './learningPractice.js';
/* Original demonstration lessons, not a claimed complete KPM/DSKP mapping. */
export const ORIGINAL_LESSONS=[
 {id:'y1-math-subtract',year:1,subject:'Matematik',title:'Tolak dengan Benda',en:'Taking Away',icon:'🍎',summary:'Tolak bermaksud mengambil sebahagian daripada jumlah asal. Kira benda yang masih tinggal.',mind:[['Mula','8 epal'],['Ambil','3 epal'],['Tinggal','5 epal']],steps:[{title:'Lihat',body:'Aina ada 8 epal. Dia beri 3 kepada kawan.'},{title:'Bayangkan',body:'Ketepikan 3 daripada 8 epal. Jangan campurkan lagi.'},{title:'Kira',body:'Lima epal masih ada. Jadi 8 − 3 = 5.'}],check:[{id:'c1',mode:'choice',text:'Aina ada 8 epal. Dia beri 3. Berapa epal tinggal?',options:['3','5','8','11'],answer:'5',why:'Tiga epal diberikan, jadi lima yang tinggal.'},{id:'c2',mode:'number',text:'9 − 4 = ?',answer:'5',why:'Mulakan dengan 9, keluarkan 4, tinggal 5.'},{id:'c3',mode:'number',text:'Ada 7 pensel. Dua diberikan kepada kawan. Berapa tinggal?',answer:'5',why:'Tujuh kurang dua tinggal lima.',transfer:true},{id:'c4',mode:'reason',text:'Mengapa 6 − 2 = 4? Pilih penerangan yang betul.',options:['Dua diambil daripada enam, empat tinggal','Enam ditambah dua','Semua enam masih ada'],answer:'Dua diambil daripada enam, empat tinggal',why:'Menolak bermaksud mengambil atau mengurangkan jumlah.'}],misconceptions:{'3':'Itu bilangan epal yang diberi. Cuba kira yang masih tinggal.','8':'Itu jumlah asal sebelum tiga epal diberikan.','11':'Itu jawapan jika epal ditambah, bukan diberi keluar.'}},
 {id:'y1-math-add',year:1,subject:'Matematik',title:'Tambah dengan Objek',en:'Adding Groups',icon:'🧸',summary:'Tambah bermaksud menggabungkan dua kumpulan dan mengira jumlah semuanya.',mind:[['Kumpulan A','3 objek'],['Kumpulan B','2 objek'],['Jumlah','5 objek']],steps:[{title:'Kumpulkan',body:'Ada tiga patung beruang. Tambah dua lagi.'},{title:'Gabungkan',body:'Letakkan semua patung dalam satu kumpulan.'},{title:'Kira',body:'Terdapat lima patung semuanya: 3 + 2 = 5.'}],check:[{id:'a1',mode:'choice',text:'Ada 3 beruang, tambah 2 lagi. Berapa semua?',options:['1','3','5','6'],answer:'5',why:'Tiga dicampur dua menjadi lima.'},{id:'a2',mode:'number',text:'4 + 3 = ?',answer:'7',why:'Empat bersama tiga ialah tujuh.'},{id:'a3',mode:'number',text:'Ali ada 2 guli lalu mendapat 5 lagi. Berapa semuanya?',answer:'7',transfer:true,why:'Dua ditambah lima menjadi tujuh.'},{id:'a4',mode:'reason',text:'Apa maksud tambah?',options:['Menggabungkan kumpulan','Mengambil benda keluar','Membahagikan benda'],answer:'Menggabungkan kumpulan',why:'Tambah menggabungkan jumlah.'}]},
 {id:'y1-bm-suku',year:1,subject:'Bahasa Melayu',title:'Kenali Suku Kata',en:'Malay Syllables',icon:'📖',summary:'Perkataan boleh dibahagikan kepada bahagian bunyi kecil yang dipanggil suku kata.',mind:[['Perkataan','buku'],['Bahagian','bu + ku'],['Bunyi','dua suku kata']],steps:[{title:'Dengar',body:'Sebut perkataan “buku” dengan perlahan.'},{title:'Pisahkan',body:'Bunyi pertama “bu”, kemudian “ku”.'},{title:'Cantum',body:'Dua suku kata membentuk “buku”.'}],check:[{id:'b1',mode:'choice',text:'Bagaimana memisahkan “buku”?',options:['bu + ku','buk + u','b + uku','buku + u'],answer:'bu + ku',why:'Bu dan ku ialah dua suku kata.'},{id:'b2',mode:'number',text:'Berapa suku kata dalam “mata” (ma + ta)?',answer:'2',why:'Ma dan ta ialah dua suku kata.'},{id:'b3',mode:'number',text:'Berapa suku kata dalam “bola” (bo + la)?',answer:'2',transfer:true,why:'Bo dan la ialah dua suku kata.'},{id:'b4',mode:'reason',text:'Yang manakah contoh dua suku kata?',options:['ka + ki','a','i'],answer:'ka + ki',why:'Ka dan ki ialah dua bahagian bunyi.'}]}
];
export const SKILL_DEMO_LESSONS = [
  {
    "id": "y1-math-quantity",
    "year": 1,
    "subject": "Matematik",
    "title": "Banyak, Sedikit dan Sama Banyak",
    "icon": "🍊",
    "summary": "Bandingkan dua kumpulan. Padankan objek satu demi satu untuk lihat kumpulan mana lebih banyak.",
    "mind": [
      [
        "Banding",
        "Dua kumpulan"
      ],
      [
        "Padankan",
        "Satu lawan satu"
      ],
      [
        "Kesimpulan",
        "Lebih / kurang / sama"
      ]
    ],
    "steps": [
      {
        "title": "Lihat",
        "body": "Ada 4 oren di bakul A dan 2 oren di bakul B."
      },
      {
        "title": "Padankan",
        "body": "Padankan oren dari A kepada oren dari B, satu-satu."
      },
      {
        "title": "Faham",
        "body": "Bakul A masih ada 2 oren yang tiada pasangan. Bakul A lebih banyak."
      }
    ],
    "check": [
      {
        "id": "qty1",
        "mode": "choice",
        "text": "Kumpulan A ada 4 epal dan B ada 2 epal. Mana lebih banyak?",
        "answer": "A",
        "why": "A mempunyai empat, B hanya dua.",
        "options": [
          "A",
          "B",
          "Sama banyak"
        ]
      },
      {
        "id": "qty2",
        "mode": "number",
        "text": "Kumpulan A ada 6 gula-gula dan B ada 4. Berapa lebihnya A berbanding B?",
        "answer": "2",
        "why": "Enam berbanding empat mempunyai dua lebih."
      },
      {
        "id": "qty3",
        "mode": "number",
        "text": "Ada 5 bunga merah dan 5 bunga kuning. Berapa bunga merah yang tiada pasangan jika dipadankan satu-satu?",
        "answer": "0",
        "why": "Semua bunga merah mempunyai pasangan.",
        "transfer": true
      },
      {
        "id": "qty4",
        "mode": "reason",
        "text": "Jika dua kumpulan dipadankan satu-satu tanpa baki, apakah hubungan mereka?",
        "answer": "Sama banyak",
        "why": "Apabila semua mempunyai pasangan, bilangannya sama.",
        "options": [
          "Lebih banyak",
          "Kurang",
          "Sama banyak"
        ]
      }
    ],
    "premium": false
  },
  {
    "id": "y1-math-count",
    "year": 1,
    "subject": "Matematik",
    "title": "Kira Benda 1 hingga 10",
    "icon": "🍎",
    "summary": "Sentuh atau tunjuk satu benda pada satu masa. Setiap benda dikira sekali sahaja.",
    "mind": [
      [
        "Mula",
        "Objek pertama"
      ],
      [
        "Langkah",
        "Satu demi satu"
      ],
      [
        "Jumlah",
        "Nombor terakhir"
      ]
    ],
    "steps": [
      {
        "title": "Lihat",
        "body": "Bayangkan 5 epal dalam satu baris: 🍎🍎🍎🍎🍎."
      },
      {
        "title": "Kira",
        "body": "Sebut satu, dua, tiga, empat, lima sambil menunjuk setiap epal."
      },
      {
        "title": "Faham",
        "body": "Nombor terakhir yang disebut ialah jumlah epal."
      }
    ],
    "check": [
      {
        "id": "count1",
        "mode": "choice",
        "text": "🍎🍎🍎🍎 Ada berapa epal?",
        "answer": "4",
        "why": "Empat epal dikira satu per satu.",
        "options": [
          "3",
          "4",
          "5",
          "6"
        ]
      },
      {
        "id": "count2",
        "mode": "number",
        "text": "⭐ ⭐ ⭐ ⭐ ⭐ ⭐ Ada berapa bintang?",
        "answer": "6",
        "why": "Enam bintang apabila dikira sekali setiap satu."
      },
      {
        "id": "count3",
        "mode": "number",
        "text": "Di meja ada 3 buku dan satu buku lagi diletakkan. Berapa jumlah buku sekarang?",
        "answer": "4",
        "why": "Tiga buku ditambah satu menjadi empat.",
        "transfer": true
      },
      {
        "id": "count4",
        "mode": "reason",
        "text": "Mengapa kita sentuh setiap objek sekali semasa mengira?",
        "answer": "Supaya tiada objek dikira dua kali",
        "why": "Setiap objek perlu dikira sekali.",
        "options": [
          "Supaya tiada objek dikira dua kali",
          "Supaya nombor jadi lebih besar",
          "Supaya kira dari belakang"
        ]
      }
    ],
    "premium": false
  },
  {
    "id": "y1-math-match",
    "year": 1,
    "subject": "Matematik",
    "title": "Padankan Benda dengan Nombor",
    "icon": "🧸",
    "summary": "Nombor ialah simbol yang menunjukkan berapa banyak objek dalam kumpulan.",
    "mind": [
      [
        "Benda",
        "Kumpulan objek"
      ],
      [
        "Kira",
        "Berapa semuanya?"
      ],
      [
        "Padan",
        "Pilih angka tepat"
      ]
    ],
    "steps": [
      {
        "title": "Lihat",
        "body": "Ada 3 patung beruang: 🧸 🧸 🧸."
      },
      {
        "title": "Kira",
        "body": "Tunjuk setiap patung sambil menyebut 1, 2, 3."
      },
      {
        "title": "Padan",
        "body": "Angka 3 menunjukkan bilangan patung tersebut."
      }
    ],
    "check": [
      {
        "id": "match1",
        "mode": "choice",
        "text": "🐟 🐟 🐟 🐟 Pilih nombor bagi ikan ini.",
        "answer": "4",
        "why": "Empat ikan dipadankan dengan angka 4.",
        "options": [
          "2",
          "3",
          "4",
          "5"
        ]
      },
      {
        "id": "match2",
        "mode": "number",
        "text": "Ada tujuh guli. Taip angka yang mewakili bilangannya.",
        "answer": "7",
        "why": "Angka 7 mewakili tujuh guli."
      },
      {
        "id": "match3",
        "mode": "number",
        "text": "Mira meletakkan 5 sudu di meja. Nombor apakah pada kad bilangan yang sesuai?",
        "answer": "5",
        "why": "Bilangan sudu ialah lima.",
        "transfer": true
      },
      {
        "id": "match4",
        "mode": "reason",
        "text": "Mengapa simbol 2 sesuai untuk 🐰 🐰?",
        "answer": "Ada dua arnab",
        "why": "Dua arnab sepadan dengan angka dua.",
        "options": [
          "Ada dua arnab",
          "Ada tiga arnab",
          "Ada satu arnab"
        ]
      }
    ],
    "premium": false
  },
  {
    "id": "y1-math-order",
    "year": 1,
    "subject": "Matematik",
    "title": "Susun Nombor Mengikut Turutan",
    "icon": "🔢",
    "summary": "Tertib menaik bermula dengan nombor kecil. Tertib menurun bermula dengan nombor besar.",
    "mind": [
      [
        "Menaik",
        "Kecil ke besar"
      ],
      [
        "Menurun",
        "Besar ke kecil"
      ],
      [
        "Semak",
        "Banding nombor jiran"
      ]
    ],
    "steps": [
      {
        "title": "Lihat",
        "body": "Kad bernombor 2, 5 dan 3 berada dalam susunan rawak."
      },
      {
        "title": "Susun",
        "body": "Mula dengan 2, kemudian 3, diikuti 5."
      },
      {
        "title": "Faham",
        "body": "Turutan 2, 3, 5 ialah tertib menaik."
      }
    ],
    "check": [
      {
        "id": "order1",
        "mode": "choice",
        "text": "Pilih susunan menaik untuk 3, 1, 2.",
        "answer": "1, 2, 3",
        "why": "Satu, dua, tiga bergerak dari kecil ke besar.",
        "options": [
          "1, 2, 3",
          "3, 2, 1",
          "2, 3, 1"
        ]
      },
      {
        "id": "order2",
        "mode": "number",
        "text": "Dalam 4, 5, 6, apakah nombor yang berada di tengah?",
        "answer": "5",
        "why": "Lima berada antara empat dan enam."
      },
      {
        "id": "order3",
        "mode": "number",
        "text": "Nombor 8, 6, 7 perlu disusun menaik. Apakah nombor pertama?",
        "answer": "6",
        "why": "Enam ialah nombor terkecil.",
        "transfer": true
      },
      {
        "id": "order4",
        "mode": "reason",
        "text": "Apakah maksud tertib menurun?",
        "answer": "Besar ke kecil",
        "why": "Tertib menurun bermula dengan nombor besar.",
        "options": [
          "Kecil ke besar",
          "Besar ke kecil",
          "Susunan rawak"
        ]
      }
    ],
    "premium": false
  }
];
export const PRIMARY_SUBJECTS=[['Matematik','🧮'],['Bahasa Melayu','📖'],['English','🔤'],['Sains','🔬'],['Sejarah','🌏'],['Bahasa Cina','🀄'],['Bahasa Tamil','✍️'],['Pendidikan Islam','🌙'],['Pendidikan Moral','🤝'],['Reka Bentuk dan Teknologi','🛠️'],['Pendidikan Seni Visual','🎨'],['Pendidikan Muzik','🎼'],['Pendidikan Jasmani dan Kesihatan','🏃']];

export const LESSONS = [...SKILL_DEMO_LESSONS, ...ORIGINAL_LESSONS, ...EXPANDED_LESSONS, ...enrichPractice([...JUNIOR_FOUNDATION_LESSONS,...JUNIOR_ENRICHMENT_LESSONS,...JUNIOR_STREAM_LESSONS])];