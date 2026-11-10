import {PRIMARY_SUBJECT_CATALOG} from './primarySubjects.js';

function match(prompt, pairs, feedback) {
 return {kind: 'match', prompt, pairs, feedback};
}

function order(prompt, steps, feedback) {
 return {kind: 'order', prompt, steps, feedback};
}

const groups = [
 {
  title: 'Nombor & Ukuran', icon: '🧮',
  lessons: [
   {
    key: 'coin-values', subject: 'math', year: 1, title: 'Pasar mini: padankan nilai syiling',
    idea: 'Nilai syiling dibaca dalam sen. Jumlah nilai tidak semestinya sama dengan bilangan syiling.',
    example: 'Dua syiling 10 sen bernilai 20 sen. Satu syiling 20 sen mempunyai nilai yang sama.',
    try: 'Lukis syiling 5 sen, 10 sen dan 20 sen. Pilih dua gambar dan tambah nilainya.',
    activity: match('Padankan setiap kumpulan syiling dengan jumlah nilainya.', [
     ['5 sen + 5 sen', '10 sen'], ['10 sen + 10 sen', '20 sen'], ['20 sen + 10 sen', '30 sen'],
    ], 'Tambah nilai syiling satu demi satu.'),
    questions: [
     ['Berapakah nilai 20 sen + 5 sen?', '25', 'Tambah 5 kepada 20 untuk mendapat 25 sen.'],
     ['Dua syiling 5 sen dan satu syiling 10 sen bernilai berapa sen?', '20', '5 + 5 + 10 = 20 sen.'],
    ],
   },
   {
    key: 'duration', subject: 'math', year: 3, title: 'Jejak masa dari mula hingga tamat',
    idea: 'Untuk mencari tempoh, kira minit dari masa mula ke masa tamat. Gunakan jam bulat sebagai hentian jika perlu.',
    example: 'Dari 9:45 pagi hingga 10:10 pagi, lompat 15 minit ke 10:00 dan 10 minit lagi ke 10:10. Jumlahnya 25 minit.',
    try: 'Lukis garis masa bagi 7:50 pagi hingga 8:15 pagi. Tandakan 8:00 sebagai hentian.',
    activity: order('Susun cara mencari tempoh dari 9:45 pagi hingga 10:10 pagi.', [
     'Kira 15 minit dari 9:45 ke 10:00', 'Kira 10 minit dari 10:00 ke 10:10', 'Tambah kedua-dua tempoh',
    ], '15 + 10 = 25 minit.'),
    questions: [
     ['Dari 8:00 hingga 8:20 pagi, berapa minit?', '20', 'Kedua-duanya dalam jam yang sama: 20 − 0 = 20 minit.'],
     ['Dari 8:40 hingga 9:00 pagi, berapa minit?', '20', 'Ada 20 minit lagi sebelum jam 9.'],
     ['Dari 7:50 hingga 8:15 pagi, berapa minit?', '25', '10 minit ke 8:00 dan 15 minit lagi menjadi 25 minit.'],
     ['Aktiviti bermula pada 2:35 dan tamat pada 3:05 petang. Berapa minit?', '30', '25 minit ke 3:00 ditambah 5 minit.'],
     ['Apakah minit pada jam 11 jika aktiviti bermula pada 10:50 dan berlangsung 18 minit? Taip angka minit sahaja.', '8', '10 minit membawa kamu ke 11:00, dengan 8 minit lagi.'],
    ],
   },
   {
    key: 'decimal-comparison', subject: 'math', year: 5, title: 'Banding perpuluhan hingga perseratus',
    idea: 'Bandingkan digit mengikut nilai tempat. Menambah sifar di hujung bahagian perpuluhan tidak mengubah nilainya.',
    example: '0.6 bersamaan 0.60. Oleh itu 0.60 lebih besar daripada 0.56.',
    try: 'Lukis dua petak seratus. Lorek 60 petak pada satu dan 56 pada satu lagi.',
    activity: match('Padankan perpuluhan dengan bilangan perseratus.', [
     ['0.4', '40 perseratus'], ['0.04', '4 perseratus'], ['0.44', '44 perseratus'],
    ], 'Satu persepuluh bersamaan sepuluh perseratus.'),
    questions: [
     ['Berapa perseratus dalam 0.7?', '70', '0.7 = 0.70, iaitu 70 perseratus.'],
     ['Berapa perseratus dalam 0.09?', '9', 'Digit 9 berada pada tempat perseratus.'],
     ['Antara 0.35 dan 0.53, berapa perseratus nilai yang lebih besar?', '53', '5 persepuluh lebih besar daripada 3 persepuluh.'],
     ['Apakah beza 0.80 dan 0.75 dalam perseratus?', '5', '80 − 75 = 5 perseratus.'],
     ['Berapa perseratus perlu ditambah kepada 0.18 untuk mendapat 0.20?', '2', '20 − 18 = 2 perseratus.'],
    ],
   },
   {
    key: 'recipe-ratio', subject: 'math', year: 6, title: 'Resipi berkadar untuk dua kumpulan',
    idea: 'Apabila saiz hidangan berubah, darab atau bahagi semua kuantiti bahan dengan faktor yang sama.',
    example: 'Jika 2 hidangan menggunakan 3 sudu oat, 4 hidangan menggunakan 6 sudu kerana kedua-duanya didarab 2.',
    try: 'Pilih resipi contoh dan tulis kuantiti bahan untuk dua kali ganda hidangan.',
    activity: match('Jika 2 hidangan menggunakan 3 sudu oat, padankan bilangan hidangan dengan sudu oat.', [
     ['2 hidangan', '3 sudu'], ['4 hidangan', '6 sudu'], ['6 hidangan', '9 sudu'],
    ], 'Kekalkan nisbah 3 sudu untuk setiap 2 hidangan.'),
    questions: [
     ['2 hidangan perlukan 3 sudu oat. Berapa sudu untuk 8 hidangan?', '12', '8 ialah empat kali 2, jadi 3 × 4 = 12.'],
     ['4 hidangan menggunakan 8 biji strawberi. Berapa biji untuk 2 hidangan?', '4', 'Separuh hidangan menggunakan separuh bahan.'],
     ['3 hidangan perlukan 6 potong buah. Berapa potong untuk 9 hidangan?', '18', '9 ialah tiga kali 3. Jadi 6 × 3 = 18.'],
     ['Resipi 2 hidangan menggunakan 5 kurma. Berapa kurma untuk 6 hidangan?', '15', 'Darab kedua-dua kuantiti dengan 3.'],
     ['10 hidangan perlukan 20 sudu yogurt. Berapa sudu untuk 5 hidangan?', '10', 'Bahagi kedua-dua kuantiti dengan 2.'],
    ],
   },
  ],
 },
 {
  title: 'Makmal Sains', icon: '🔬',
  lessons: [
   {
    key: 'material-properties', subject: 'science', year: 1, title: 'Detektif bahan: lihat dan sentuh',
    idea: 'Bahan boleh dibandingkan melalui sifat yang boleh diperhatikan, seperti keras, lembut dan licin.',
    example: 'Span kering mudah ditekan. Batu licin biasanya kekal bentuk apabila ditekan perlahan.',
    try: 'Dengan izin orang dewasa, bandingkan satu kain dengan satu sudu menggunakan mata dan sentuhan.',
    activity: match('Padankan objek dengan sifat yang paling mudah diperhatikan.', [
     ['Span kering', 'Mudah ditekan'], ['Pembaris kayu', 'Keras'], ['Jubin berkilat', 'Licin apabila disentuh'],
    ], 'Satu objek boleh mempunyai lebih daripada satu sifat.'),
    questions: [
     ['Antara span dan batu, yang biasanya lebih mudah ditekan?', 'Span', 'Span berubah bentuk lebih mudah apabila ditekan.', ['Span', 'Batu', 'Kedua-duanya sama']],
     ['Bagaimanakah kamu boleh menyemak rupa corak pada kain?', 'Lihat dengan mata', 'Mata digunakan untuk melihat corak.', ['Dengar bunyi', 'Lihat dengan mata', 'Hidu bau']],
    ],
   },
   {
    key: 'bean-observation', subject: 'science', year: 2, title: 'Diari percambahan kacang',
    idea: 'Catatan mengikut hari membantu kita melihat perubahan pada biji benih.',
    example: 'Hari pertama biji masih belum bercambah. Kemudian akar mula kelihatan. Selepas itu pucuk boleh dilihat.',
    try: 'Bersama orang dewasa, perhatikan biji kacang yang ditanam dan lakar perubahan setiap hari.',
    activity: order('Susun catatan percambahan contoh dari awal hingga akhir.', [
     'Biji belum bercambah', 'Akar mula kelihatan', 'Pucuk dapat dilihat',
    ], 'Bandingkan lukisan hari demi hari untuk melihat perubahan.'),
    questions: [
     ['Mengapa tulis tarikh pada lakaran?', 'Supaya perubahan boleh disusun', 'Tarikh menunjukkan bila setiap pemerhatian dibuat.', ['Supaya perubahan boleh disusun', 'Supaya biji cepat tumbuh', 'Supaya akar berubah warna']],
     ['Apakah catatan yang merupakan pemerhatian?', 'Akar kecil kelihatan', 'Akar yang kelihatan boleh diperhatikan secara langsung.', ['Biji itu pasti tinggi esok', 'Akar kecil kelihatan', 'Biji itu mungkin gembira']],
    ],
   },
   {
    key: 'shadow-distance', subject: 'science', year: 4, title: 'Bayang di dinding: satu pemboleh ubah',
    idea: 'Dalam ujian saiz bayang, ubah satu jarak sahaja dan kekalkan lampu, objek serta kedudukan dinding.',
    example: 'Dengan lampu dan dinding kekal, bandingkan bayang kad apabila kad dekat dengan lampu dan apabila kad dekat dengan dinding.',
    try: 'Dengan bantuan orang dewasa, guna lampu suluh dan kad. Halakan lampu ke dinding, jauh daripada mata.',
    activity: order('Susun langkah untuk membuat perbandingan yang adil.', [
     'Tetapkan lampu dan dinding', 'Ubah kedudukan kad sahaja', 'Ukur dan banding saiz bayang',
    ], 'Ujian lebih adil apabila kedudukan lampu dan dinding kekal.'),
    questions: [
     ['Apakah yang diubah dalam contoh?', 'Kedudukan kad', 'Kedudukan kad ialah satu faktor yang kita ubah.', ['Kecerahan lampu', 'Kedudukan kad', 'Bentuk dinding']],
     ['Apakah yang diukur?', 'Saiz bayang', 'Bandingkan saiz bayang bagi setiap kedudukan kad.', ['Bilangan lampu', 'Warna kad', 'Saiz bayang']],
    ],
   },
   {
    key: 'drying-puddles', subject: 'science', year: 5, title: 'Ke mana perginya air di pinggan?',
    idea: 'Penyejatan berlaku apabila air cecair bertukar menjadi wap air di permukaannya.',
    example: 'Lapisan air yang ditinggalkan di pinggan berkurang dari masa ke masa walaupun tidak mendidih.',
    try: 'Catat paras air dalam dua bekas serupa pada waktu yang sama. Terangkan apa yang berubah selepas beberapa jam.',
    activity: match('Padankan setiap istilah dengan maksudnya.', [
     ['Cecair', 'Air yang masih di dalam bekas'], ['Wap air', 'Air dalam bentuk gas'], ['Penyejatan', 'Perubahan daripada cecair kepada gas di permukaan'],
    ], 'Air boleh menyejat pada suhu bilik.'),
    questions: [
     ['Perubahan apakah yang berlaku semasa penyejatan?', 'Cecair menjadi gas', 'Molekul air meninggalkan permukaan sebagai wap.', ['Gas menjadi cecair', 'Cecair menjadi gas', 'Pepejal menjadi cecair']],
     ['Adakah air mesti mendidih untuk menyejat?', 'Tidak', 'Penyejatan boleh berlaku di bawah takat didih.', ['Ya', 'Tidak', 'Hanya air masin']],
    ],
   },
   {
    key: 'repeat-measurements', subject: 'science', year: 6, title: 'Semak ukuran yang berbeza',
    idea: 'Ukuran berulang membantu kita melihat sama ada satu bacaan jauh berbeza. Semak kaedah sebelum membuat kesimpulan.',
    example: 'Tiga ukuran ialah 12 cm, 13 cm dan 22 cm. Semak tanda mula pembaris dan ukur semula sebelum menjelaskan beza itu.',
    try: 'Ukur panjang buku yang sama tiga kali. Semak titik mula dan kedudukan mata setiap kali.',
    activity: order('Susun tindakan apabila satu bacaan berbeza jauh.', [
     'Kenal pasti bacaan yang berbeza', 'Semak alat dan kaedah mengukur', 'Ukur semula dan catat dapatan',
    ], 'Simpan catatan asal supaya perubahan dapat disemak.'),
    questions: [
     ['Bacaan manakah paling berbeza daripada dua yang lain: 12 cm, 13 cm dan 22 cm?', '22', '22 cm paling jauh daripada dua bacaan lain.'],
     ['Apakah langkah yang sesuai selepas mengenal pasti perbezaan?', 'Semak kaedah dan ukur semula', 'Ulangan membantu menyiasat beza tersebut.', ['Semak kaedah dan ukur semula', 'Ubah semua bacaan kepada nombor sama', 'Buang catatan asal']],
    ],
   },
  ],
 },
 {
  title: 'Bahasa & Cerita', icon: '📚',
  lessons: [
   {
    key: 'sequence-story', subject: 'bm', year: 2, title: 'Susun cerita payung',
    idea: 'Perkataan seperti mula-mula, kemudian dan akhirnya membantu pembaca mengikuti turutan.',
    example: 'Mula-mula hujan turun. Kemudian Dina membuka payung. Akhirnya Dina sampai di rumah.',
    try: 'Ceritakan satu perjalanan dalam tiga ayat menggunakan perkataan penanda masa.',
    activity: order('Susun peristiwa cerita Dina.', [
     'Hujan mula turun', 'Dina membuka payung', 'Dina sampai di rumah',
    ], 'Turutan menunjukkan bagaimana satu peristiwa diikuti peristiwa yang lain.'),
    questions: [
     ['Perkataan manakah menandakan permulaan?', 'Mula-mula', 'Mula-mula memperkenalkan peristiwa pertama.', ['Akhirnya', 'Mula-mula', 'Selepas itu']],
     ['Perkataan manakah sesuai untuk menandakan penutup?', 'Akhirnya', 'Akhirnya memperkenalkan peristiwa terakhir.', ['Kemudian', 'Mula-mula', 'Akhirnya']],
    ],
   },
   {
    key: 'connect-sentences', subject: 'bm', year: 5, title: 'Jambatan ayat: sebab dan pertentangan',
    idea: 'Kata hubung menyatakan hubungan antara idea. Kerana menyatakan sebab, tetapi menunjukkan pertentangan, dan menggabungkan idea.',
    example: '“Mira membawa payung kerana hujan.” Bahagian selepas kerana menjelaskan sebab Mira membawa payung.',
    try: 'Tulis dua ayat tentang hobi kamu. Gabungkan satu pasangan idea dengan kerana dan satu lagi dengan tetapi.',
    activity: match('Padankan kata hubung dengan fungsinya.', [
     ['kerana', 'Menerangkan sebab'], ['tetapi', 'Menunjukkan pertentangan'], ['dan', 'Menambah atau menggabungkan idea'],
    ], 'Kenal pasti hubungan idea sebelum memilih kata hubung.'),
    questions: [
     ['Lengkapkan: “Ali mahu bermain, ___ hujan turun.”', 'tetapi', 'Hujan bertentangan dengan rancangan Ali.', ['kerana', 'tetapi', 'dan']],
     ['Lengkapkan: “Sara berlatih ___ dia mahu memperbaiki kemahirannya.”', 'kerana', 'Bahagian kedua menerangkan sebab Sara berlatih.', ['kerana', 'dan', 'tetapi']],
    ],
   },
   {
    key: 'action-verbs', subject: 'en', year: 2, title: 'Action words at the park',
    idea: 'An action verb tells us what a person or thing does.',
    example: 'In “Ben kicks a ball,” kicks is the action. Ball tells us what Ben kicks.',
    try: 'Act out a safe movement and ask someone to say its verb.',
    activity: match('Match the action word to its meaning.', [
     ['hop', 'Jump on one foot'], ['clap', 'Bring your hands together'], ['wave', 'Move your hand to greet someone'],
    ], 'Each verb tells us what someone does.'),
    questions: [
     ['Which word is the action in “Lina opens the gate”?', 'opens', 'Opens tells us what Lina does.', ['Lina', 'opens', 'gate']],
     ['Which word fits “We ___ our hands after the show”?', 'clap', 'We bring our hands together to clap.', ['hop', 'read', 'clap']],
    ],
   },
   {
    key: 'reason-paragraph', subject: 'en', year: 6, title: 'Build a paragraph with a reason',
    idea: 'A clear paragraph can start with a main idea, add a reason, and finish with an example.',
    example: '“Our class could grow herbs. It would help us learn how plants change. For example, we could measure a mint plant each week.”',
    try: 'Choose one school improvement and write a main idea, a reason and an example.',
    activity: order('Build the paragraph in main idea, reason, example order.', [
     'Our class could grow herbs.', 'It would help us learn how plants change.', 'For example, we could measure a mint plant each week.',
    ], 'An example makes the reason more concrete.'),
    questions: [
     ['Which phrase introduces an example?', 'For example', 'For example introduces a particular case.', ['For example', 'Yesterday', 'Good morning']],
     ['Which sentence gives a reason for saving water?', 'It helps us use less water each day.', 'This sentence explains why saving water is worthwhile.', ['The tap is silver.', 'It helps us use less water each day.', 'My bag is on the desk.']],
    ],
   },
   {
    key: 'chinese-animals', subject: 'chinese', year: 2, title: '动物 · Padankan nama haiwan',
    idea: '猫 bermaksud kucing, 狗 bermaksud anjing dan 鸟 bermaksud burung.',
    example: '小猫 bermaksud anak kucing atau kucing kecil.',
    try: 'Lukis tiga haiwan dalam contoh dan letakkan kad aksara yang sesuai di bawahnya.',
    activity: match('Padankan aksara dengan nama haiwan dalam Bahasa Melayu.', [
     ['猫', 'Kucing'], ['狗', 'Anjing'], ['鸟', 'Burung'],
    ], 'Semak bentuk aksara sebelum memilih makna.'),
    questions: [
     ['Pilih aksara untuk burung.', '鸟', '鸟 bermaksud burung.', ['猫', '鸟', '狗']],
     ['Apakah maksud 狗?', 'Anjing', '狗 bermaksud anjing.', ['Kucing', 'Burung', 'Anjing']],
    ],
   },
   {
    key: 'tamil-animals', subject: 'tamil', year: 2, title: 'விலங்குகள் · Kenali nama haiwan',
    idea: 'பூனை bermaksud kucing, நாய் bermaksud anjing dan மீன் bermaksud ikan.',
    example: 'Gambar seekor ikan dipadankan dengan perkataan மீன்.',
    try: 'Susun kad perkataan dan lukisan haiwan. Baca dan semak padanan bersama guru.',
    activity: match('Padankan perkataan Tamil dengan nama haiwan.', [
     ['பூனை', 'Kucing'], ['நாய்', 'Anjing'], ['மீன்', 'Ikan'],
    ], 'Baca semula perkataan dan semak gambar.'),
    questions: [
     ['Pilih perkataan untuk anjing.', 'நாய்', 'நாய் bermaksud anjing.', ['மீன்', 'நாய்', 'பூனை']],
     ['Apakah maksud பூனை?', 'Kucing', 'பூனை bermaksud kucing.', ['Ikan', 'Kucing', 'Anjing']],
    ],
   },
  ],
 },
 {
  title: 'Seni, Reka Cipta & Kehidupan', icon: '🎨',
  lessons: [
   {
    key: 'include-a-friend', subject: 'moral', year: 3, title: 'Ajak rakan menyertai permainan',
    idea: 'Empati bermula apabila kita mendengar dan memberi pilihan kepada orang lain.',
    example: 'Rakan baharu duduk seorang diri. Kamu boleh mengajak dia bermain dan menghormati jawapannya.',
    try: 'Lakonkan cara mengajak rakan menyertai permainan tanpa memaksa.',
    activity: order('Susun tindakan untuk menyambut rakan baharu.', [
     'Tanya sama ada rakan mahu menyertai', 'Dengar dan hormati jawapannya', 'Terangkan cara bermain jika rakan bersetuju',
    ], 'Pelawaan yang baik memberi rakan peluang membuat pilihan.'),
    questions: [
     ['Jika rakan menolak pelawaan, apakah tindakan sesuai?', 'Hormati pilihannya', 'Memberi ruang juga menunjukkan hormat.', ['Paksa rakan bermain', 'Hormati pilihannya', 'Ketawakan rakan']],
     ['Apakah cara membantu rakan yang bersetuju tetapi belum tahu peraturan?', 'Terangkan peraturan dengan baik', 'Penerangan membantu rakan menyertai permainan.', ['Terangkan peraturan dengan baik', 'Tukar peraturan secara senyap', 'Minta rakan meneka semuanya']],
    ],
   },
   {
    key: 'music-directions', subject: 'music', year: 3, title: 'Kad arahan bunyi dan tempo',
    idea: 'Tempo berkaitan dengan kelajuan. Dinamik berkaitan dengan kelantangan.',
    example: 'Kamu boleh menepuk dengan perlahan tetapi kuat. Kelajuan dan kelantangan boleh berubah secara berasingan.',
    try: 'Tepuk empat detik dengan lembut, kemudian tepuk empat detik pada kelajuan yang sama tetapi sedikit lebih kuat.',
    activity: match('Padankan setiap arahan dengan perkara yang berubah.', [
     ['Tepuk lebih cepat', 'Tempo meningkat'], ['Tepuk lebih lembut', 'Kelantangan berkurang'], ['Tepuk lebih kuat', 'Kelantangan meningkat'],
    ], 'Perhatikan sama ada arahan itu tentang kelajuan atau kelantangan.'),
    questions: [
     ['Apakah istilah yang menerangkan kelajuan muzik?', 'Tempo', 'Tempo ialah kelajuan detik.', ['Dinamik', 'Tempo', 'Warna']],
     ['Jika tepukan menjadi lebih lembut pada kelajuan yang sama, apakah yang berubah?', 'Kelantangan', 'Dinamik atau kelantangan berubah, manakala tempo kekal.', ['Kelantangan', 'Tempo', 'Bilangan orang']],
    ],
   },
   {
    key: 'paper-collage', subject: 'psv', year: 3, title: 'Kolaj kertas dengan titik tumpu',
    idea: 'Titik tumpu ialah bahagian yang menarik perhatian dahulu. Warna, saiz atau kedudukan boleh membantunya menonjol.',
    example: 'Satu bulatan jingga besar di tengah kumpulan bentuk biru kecil mudah menarik perhatian.',
    try: 'Susun potongan kertas sebelum melekatkannya. Cuba dua kedudukan untuk bentuk yang ingin ditonjolkan.',
    activity: order('Susun cara merancang kolaj sebelum melekatkan kertas.', [
     'Pilih bentuk yang mahu ditonjolkan', 'Cuba susun bentuk pada latar', 'Semak bahagian yang menarik perhatian dahulu',
    ], 'Susunan boleh diubah dengan mudah sebelum bentuk dilekatkan.'),
    questions: [
     ['Yang manakah satu cara menonjolkan bentuk?', 'Gunakan warna yang berbeza daripada latar', 'Perbezaan warna membantu bentuk dilihat dengan jelas.', ['Tutup bentuk dengan latar', 'Gunakan warna yang berbeza daripada latar', 'Letak semua bentuk di luar kertas']],
     ['Bilakah susunan paling mudah diubah?', 'Sebelum kertas dilekatkan', 'Bentuk masih boleh dialihkan sebelum gam digunakan.', ['Selepas gam kering', 'Selepas kolaj dibingkaikan', 'Sebelum kertas dilekatkan']],
    ],
   },
   {
    key: 'paper-bridge', subject: 'rbt', year: 5, title: 'Uji jambatan kertas lipat',
    idea: 'Ujian model membantu kita melihat kesan bentuk pada kekuatan. Kekalkan bahan dan cara ujian yang sama.',
    example: 'Banding sehelai kertas rata dengan helaian sama jenis yang dilipat. Gunakan jarak penyokong dan jenis pemberat yang sama.',
    try: 'Bersama guru, uji model dengan pemberat kecil satu demi satu dan catat bilangan yang disokong.',
    activity: order('Susun langkah untuk membandingkan dua bentuk jambatan kertas.', [
     'Sediakan dua model daripada kertas sama jenis', 'Uji dengan jarak penyokong dan pemberat yang sama', 'Banding bilangan pemberat yang ditampung',
    ], 'Kekalkan keadaan lain supaya bentuk dapat dibandingkan.'),
    questions: [
     ['Apakah yang diubah dalam contoh?', 'Bentuk kertas', 'Satu model rata dan satu lagi dilipat.', ['Jarak penyokong', 'Jenis pemberat', 'Bentuk kertas']],
     ['Apakah hasil yang boleh direkodkan?', 'Bilangan pemberat yang ditampung', 'Bilangan pemberat membolehkan kedua-dua model dibandingkan.', ['Warna kasut penguji', 'Bilangan pemberat yang ditampung', 'Nama lagu kegemaran']],
    ],
   },
   {
    key: 'timeline-sources', subject: 'history', year: 6, title: 'Bina garis masa daripada tiga sumber',
    idea: 'Tarikh daripada sumber membantu menyusun peristiwa. Gunakan hanya maklumat yang dapat disemak.',
    example: 'Dalam contoh rekaan, nota mesyuarat bertarikh 2 Mac, gambar pembinaan 10 April, dan kad pembukaan 5 Jun. Tarikh menyusun peristiwa itu.',
    try: 'Gunakan tiga dokumen contoh yang dibenarkan oleh guru. Salin tarikh dan nama sumber bagi setiap peristiwa.',
    activity: order('Susun tiga peristiwa rekaan daripada paling awal.', [
     'Mesyuarat pada 2 Mac', 'Pembinaan pada 10 April', 'Pembukaan pada 5 Jun',
    ], 'Baca bulan dahulu apabila tarikh berada dalam tahun yang sama.'),
    questions: [
     ['Peristiwa manakah berlaku selepas 10 April dalam contoh?', 'Pembukaan pada 5 Jun', 'Bulan Jun datang selepas April.', ['Mesyuarat pada 2 Mac', 'Pembukaan pada 5 Jun', 'Tiada peristiwa lain']],
     ['Jika gambar tiada tarikh, apakah tindakan yang sesuai?', 'Cari sumber lain yang boleh disemak', 'Sumber tambahan boleh membantu mengesahkan tarikh.', ['Pilih sebarang tarikh', 'Gunakan tarikh hari ini', 'Cari sumber lain yang boleh disemak']],
    ],
   },
  ],
 },
];

export const DISCOVERY_MODULES = groups.map(group => ({
 ...group,
 lessons: group.lessons.map(item => {
  const subject = PRIMARY_SUBJECT_CATALOG.find(entry => entry.id === item.subject);
  const id = 'discover-' + item.key;
  return {
   id, title: item.title, icon: subject.icon, subject: subject.name, year: item.year,
   school: subject.streams === 'all' ? 'ALL' : subject.streams[0],
   chapter: group.title, status: 'DRAFT_TEACHER_REVIEW', premium: false,
   summary: item.idea, visual: item.example,
   steps: [
    {title: 'Kenali idea', body: item.idea},
    {title: 'Lihat contoh', body: item.example},
    {title: 'Cuba sendiri', body: item.try},
   ],
   mind: [['Idea utama', item.idea], ['Contoh', item.example], ['Cuba sendiri', item.try]],
   activity: {...item.activity, id},
   check: item.questions.map(([text, answer, why, options], index) => ({
    id: id + '-q' + (index + 1), mode: options ? 'choice' : 'number', text, answer, why, ...(options ? {options} : {}),
   })),
  };
 }),
}));

export const DISCOVERY_LESSONS = DISCOVERY_MODULES.flatMap(group => group.lessons);
