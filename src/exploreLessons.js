import {PRIMARY_SUBJECT_CATALOG} from './primarySubjects.js';

const activities = [
 {
  subject: 'bm', year: 2, title: 'Detektif ayat: siapa buat apa?',
  idea: 'Ayat mudah menyampaikan siapa atau apa yang diceritakan dan apa yang berlaku.',
  example: 'Dalam “Aina menyiram pokok,” Aina ialah orangnya dan menyiram ialah perbuatannya.',
  try: 'Tunjuk pada orang dan perbuatan dalam satu ayat daripada buku cerita.',
  questions: [
   ['Siapakah yang melukis dalam “Ravi melukis awan”?', ['Ravi', 'Awan', 'Melukis'], 0, 'Ravi ialah orang yang melakukan perbuatan itu.'],
   ['Apakah perbuatan dalam “Mei membaca buku”?', ['Mei', 'Buku', 'Membaca'], 2, 'Membaca menerangkan perbuatan Mei.'],
   ['Ayat manakah menyatakan siapa dan apa yang dilakukan?', ['Di tepi meja', 'Sara membuka pintu', 'Pintu dan tingkap'], 1, 'Sara ialah orangnya dan membuka ialah perbuatannya.'],
  ],
 },
 {
  subject: 'en', year: 2, title: 'Where is the little bear?',
  idea: 'Position words tell us where something is in relation to another thing.',
  example: 'In “The bear is under the chair,” under tells us the bear is below the chair.',
  try: 'Move a small toy beside, under and behind a chair. Say a sentence for each position.',
  questions: [
   ['The toy is next to the box. Which word fits?', ['under', 'beside', 'inside'], 1, 'Beside means next to something.'],
   ['Which word means the toy is within the box?', ['behind', 'on', 'inside'], 2, 'Inside tells us that the toy is within the box.'],
   ['The toy rests on top of a book. Which word fits?', ['on', 'under', 'behind'], 0, 'On tells us that the toy is supported by the top of the book.'],
  ],
 },
 {
  subject: 'math', year: 1, title: 'Pasangan rahsia untuk membuat 10',
  idea: 'Dua bahagian boleh digabungkan menjadi 10. Jika kita tahu satu bahagian, kita boleh mencari bahagian yang lain.',
  example: 'Jika 6 petak sudah diisi daripada 10 petak, 4 petak masih kosong. Jadi 6 + 4 = 10.',
  try: 'Lukis sepuluh petak, isi lapan dan kira petak yang masih kosong.',
  questions: [
   ['Ada 7 bintang. Berapa lagi diperlukan untuk membuat 10?', ['2', '3', '4'], 1, '7 + 3 = 10.'],
   ['Pasangan manakah menghasilkan 10?', ['3 dan 5', '2 dan 7', '4 dan 6'], 2, '4 + 6 = 10.'],
   ['Satu kotak muat 10 kad. Jika sudah ada 9 kad, berapa ruang masih kosong?', ['1', '2', '3'], 0, '10 − 9 = 1.'],
  ],
 },
 {
  subject: 'science', year: 3, title: 'Uji titisan: bahan mana menyerap air?',
  idea: 'Kita boleh membandingkan bahan dengan meletakkan jumlah air yang sama pada setiap bahan.',
  example: 'Apabila satu titis air meresap ke dalam tisu dan satu lagi kekal di atas pinggan, tisu menyerap air dalam ujian ini.',
  try: 'Dengan bantuan orang dewasa, cuba satu titis air pada tisu dan pada pinggan. Catat apa yang berlaku.',
  questions: [
   ['Bagaimanakah kita membandingkan dua bahan dengan adil?', ['Jumlah air yang sama', 'Air lebih banyak pada satu bahan', 'Tukar jumlah air dan masa'], 0, 'Kekalkan jumlah air yang sama supaya perbezaan bahan boleh diperhatikan.'],
   ['Apakah contoh pemerhatian?', ['Tisu mungkin murah', 'Air meresap ke dalam tisu', 'Tisu pasti terbaik untuk semua tugas'], 1, 'Peresapan air boleh dilihat semasa ujian.'],
   ['Apakah yang patut dicatat selepas ujian?', ['Warna kegemaran', 'Tekaan sebelum melihat', 'Apa yang berlaku kepada titisan'], 2, 'Catat peristiwa yang benar-benar diperhatikan.'],
  ],
 },
 {
  subject: 'islam', year: 2, title: 'Amanah menjaga barang pinjaman',
  idea: 'Amanah termasuk menjaga barang yang dipinjam dan memulangkannya seperti yang dijanjikan.',
  example: 'Amin meminta izin meminjam pembaris dan memulangkannya selepas aktiviti.',
  try: 'Lakonkan cara meminta izin dan cara berterima kasih apabila memulangkan barang.',
  questions: [
   ['Apakah tindakan pertama sebelum meminjam?', ['Ambil sahaja', 'Minta izin', 'Sembunyikan barang'], 1, 'Minta izin daripada pemilik terlebih dahulu.'],
   ['Apakah yang menunjukkan amanah?', ['Pulangkan tepat pada masa', 'Simpan tanpa memberitahu', 'Serahkan kepada orang lain'], 0, 'Memulangkan barang seperti dijanjikan menunjukkan amanah.'],
   ['Jika barang yang dipinjam rosak, apakah tindakan yang sesuai?', ['Sembunyikannya', 'Salahkan orang lain', 'Beritahu pemilik dengan jujur'], 2, 'Terangkan perkara yang berlaku dengan jujur.'],
  ],
 },
 {
  subject: 'moral', year: 2, title: 'Giliran yang adil di meja seni',
  idea: 'Adil boleh bermaksud memberi peluang yang munasabah kepada setiap orang.',
  example: 'Tiga orang berkongsi satu gunting dengan menggunakan giliran yang dipersetujui.',
  try: 'Cipta peraturan giliran yang mudah diterangkan dan boleh diikuti oleh semua rakan.',
  questions: [
   ['Apakah cara yang adil untuk berkongsi satu krayon?', ['Bergilir menggunakannya', 'Orang pertama simpan semuanya', 'Sorok krayon'], 0, 'Bergilir memberi setiap orang peluang menggunakan krayon.'],
   ['Seorang rakan belum mendapat giliran. Apakah yang boleh kamu lakukan?', ['Abaikan rakan', 'Jemput rakan menggunakan alat selepas giliran semasa', 'Ambil semua alat'], 1, 'Jemput rakan mendapat giliran dengan cara yang dipersetujui.'],
   ['Bilakah peraturan giliran sebaiknya dipersetujui?', ['Selepas semua pulang', 'Apabila barang hilang', 'Sebelum mula berkongsi'], 2, 'Persetujuan awal membantu semua orang memahami giliran mereka.'],
  ],
 },
 {
  subject: 'pjpk', year: 2, title: 'Semak ruang sebelum bergerak',
  idea: 'Kenal pasti objek, permukaan dan jarak daripada rakan sebelum memulakan aktiviti.',
  example: 'Sebelum membuat regangan, alihkan beg daripada ruang dan pastikan kamu tidak menyentuh rakan ketika menghulur tangan.',
  try: 'Dengan bantuan guru, tunjuk tiga perkara yang menjadikan ruang aktiviti lebih selamat.',
  questions: [
   ['Kamu nampak beg di tempat bergerak. Apa yang patut dibuat?', ['Lompat atas beg', 'Alihkan beg dengan izin', 'Lari lebih laju'], 1, 'Kosongkan ruang supaya tiada orang tersadung.'],
   ['Apakah yang patut kamu buat jika lantai licin?', ['Pilih tempat kering atau beritahu guru', 'Berlari di atasnya', 'Ajak rakan berlumba'], 0, 'Elakkan permukaan licin dan beritahu orang dewasa.'],
   ['Jika rasa pening semasa aktiviti, apakah tindakan sesuai?', ['Teruskan dengan lebih laju', 'Sembunyikan daripada guru', 'Berhenti dan beritahu orang dewasa'], 2, 'Berhenti dan dapatkan bantuan daripada orang dewasa.'],
  ],
 },
 {
  subject: 'psv', year: 2, title: 'Bina corak dengan cap bentuk',
  idea: 'Corak berulang apabila unit yang sama digunakan dalam susunan tetap.',
  example: 'Bulat, segi tiga, segi tiga ialah satu unit yang boleh diulang dalam satu jalur.',
  try: 'Lukis unit corak sendiri, ulang tiga kali dan minta rakan meneka bentuk seterusnya.',
  questions: [
   ['Apakah bentuk selepas bulat, segi tiga, segi tiga, bulat, segi tiga?', ['Bulat', 'Segi tiga', 'Segi empat'], 1, 'Segi tiga melengkapkan unit bulat, segi tiga, segi tiga.'],
   ['Unit manakah berulang dalam merah, biru, merah, biru?', ['Merah, biru', 'Merah, merah', 'Biru, biru'], 0, 'Merah diikuti biru dan pasangan itu berulang.'],
   ['Yang manakah menggunakan unit sama dua kali?', ['Bulat, bintang, segi tiga, bulat', 'Bulat, bintang, bintang, bulat', 'Bulat, bintang, bulat, bintang'], 2, 'Pasangan bulat, bintang muncul dua kali dalam susunan sama.'],
  ],
 },
 {
  subject: 'music', year: 2, title: 'Empat detik dengan satu ruang senyap',
  idea: 'Detik terus bergerak sama rata walaupun satu detik digunakan untuk diam.',
  example: 'Kira satu, dua, tiga, empat. Tepuk pada satu, dua dan empat, tetapi diam pada tiga.',
  try: 'Ulang pola pada contoh dua kali tanpa mempercepat kiraan.',
  questions: [
   ['Pada detik manakah kita diam dalam contoh?', ['Satu', 'Dua', 'Tiga'], 2, 'Detik tiga senyap tetapi tetap dikira.'],
   ['Berapa tepukan dalam contoh empat detik itu?', ['2', '3', '4'], 1, 'Tepukan berlaku pada satu, dua dan empat.'],
   ['Apakah yang perlu kekal sama ketika menepuk semula?', ['Jarak antara detik', 'Warna pakaian', 'Kedudukan kerusi'], 0, 'Detik yang sama jarak membantu pola kekal teratur.'],
  ],
 },
 {
  subject: 'history', year: 4, title: 'Jadi penyiasat gambar lama',
  idea: 'Sumber gambar boleh memberi bukti yang dapat dilihat dan juga menimbulkan soalan.',
  example: 'Dalam gambar sebuah kelas lama, kamu boleh mengira meja yang kelihatan. Nama semua murid mungkin tidak diketahui.',
  try: 'Gunakan gambar lama yang dibenarkan oleh guru. Tulis dua pemerhatian dan satu soalan.',
  questions: [
   ['Yang manakah boleh diperhatikan daripada gambar kelas?', ['Bilangan meja yang kelihatan', 'Nama semua murid', 'Perasaan semua murid'], 0, 'Meja yang kelihatan boleh dikira daripada gambar.'],
   ['Apakah yang membantu kita mengetahui tarikh gambar?', ['Teka daripada warna sahaja', 'Semak kapsyen atau sumber asal', 'Tanya siapa paling tinggi'], 1, 'Kapsyen atau sumber asal mungkin mencatat tarikh.'],
   ['Jika satu perkara tidak dapat dipastikan, apakah langkah yang sesuai?', ['Nyatakan tekaan sebagai fakta', 'Padam gambar', 'Cari sumber lain'], 2, 'Sumber tambahan boleh membantu menyemak andaian.'],
  ],
 },
 {
  subject: 'rbt', year: 4, title: 'Lakar tempat pensel yang stabil',
  idea: 'Reka bentuk bermula dengan masalah yang jelas dan diuji menggunakan kriteria yang boleh diperhatikan.',
  example: 'Bekas yang tidak mudah tumbang ketika memegang lima pensel memenuhi satu kriteria ujian.',
  try: 'Lakar dua bentuk bekas. Tandakan tapak dan terangkan bagaimana kamu akan menguji kestabilannya.',
  questions: [
   ['Apakah masalah yang hendak diselesaikan?', ['Pensel bertaburan di meja', 'Kertas berwarna biru', 'Meja mempunyai empat kaki'], 0, 'Bekas membantu menyusun pensel yang bertaburan.'],
   ['Apakah cara menguji dua model dengan adil?', ['Uji satu sahaja', 'Gunakan bilangan pensel dan permukaan sama', 'Letak satu model di atas tilam'], 1, 'Gunakan keadaan sama supaya bentuk model boleh dibandingkan.'],
   ['Jika model mudah tumbang, apa yang patut dibuat?', ['Berhenti membuat sebarang ujian', 'Tukar semua bahagian serentak', 'Ubah satu bahagian dan uji semula'], 2, 'Satu perubahan membantu kamu menilai kesannya pada kestabilan.'],
  ],
 },
 {
  subject: 'chinese', year: 1, title: '数一数 · Kira satu hingga tiga',
  idea: '一, 二 dan 三 ialah aksara bagi nombor satu, dua dan tiga.',
  example: '三本书 bermaksud tiga buah buku.',
  try: 'Letak tiga objek di meja. Padankan kumpulan kecil dengan kad 一, 二 atau 三.',
  questions: [
   ['Pilih aksara untuk dua.', ['一', '二', '三'], 1, '二 bermaksud dua.'],
   ['Pilih aksara untuk tiga.', ['二', '一', '三'], 2, '三 bermaksud tiga.'],
   ['Apakah nilai 一?', ['Satu', 'Dua', 'Tiga'], 0, '一 bermaksud satu.'],
  ],
 },
 {
  subject: 'tamil', year: 1, title: 'எண்ணுவோம் · Kira satu hingga tiga',
  idea: 'ஒன்று, இரண்டு dan மூன்று ialah perkataan Tamil untuk satu, dua dan tiga.',
  example: 'இரண்டு bermaksud dua. Letak dua pensel di atas meja untuk memadankannya.',
  try: 'Susun satu, dua dan tiga benda. Padankan setiap kumpulan dengan perkataan nombor yang sesuai.',
  questions: [
   ['Apakah maksud மூன்று?', ['Satu', 'Tiga', 'Dua'], 1, 'மூன்று bermaksud tiga.'],
   ['Pilih perkataan untuk satu.', ['ஒன்று', 'இரண்டு', 'மூன்று'], 0, 'ஒன்று bermaksud satu.'],
   ['Pilih perkataan untuk dua.', ['மூன்று', 'ஒன்று', 'இரண்டு'], 2, 'இரண்டு bermaksud dua.'],
  ],
 },
 {
  subject: 'arabic', year: 1, title: 'الألوان · Kenali tiga warna',
  idea: 'أَحْمَر ialah merah, أَزْرَق ialah biru dan أَخْضَر ialah hijau.',
  example: 'Padankan kad warna biru dengan perkataan أَزْرَق.',
  try: 'Lukis tiga petak warna dan padankan petak dengan perkataan dalam contoh. Baca bersama guru.',
  questions: [
   ['Apakah warna أَخْضَر?', ['Biru', 'Hijau', 'Merah'], 1, 'أَخْضَر ialah hijau.'],
   ['Pilih perkataan untuk merah.', ['أَحْمَر', 'أَزْرَق', 'أَخْضَر'], 0, 'أَحْمَر ialah merah.'],
   ['Apakah warna أَزْرَق?', ['Hijau', 'Merah', 'Biru'], 2, 'أَزْرَق ialah biru.'],
  ],
 },
 {
  subject: 'chinese-sk', year: 1, title: '水果 · Padankan nama buah',
  idea: '苹果 bermaksud epal, 香蕉 bermaksud pisang dan 西瓜 bermaksud tembikai.',
  example: 'Untuk gambar pisang, pilih kad 香蕉.',
  try: 'Lukis tiga buah dan padankan setiap lukisan dengan nama yang dipelajari.',
  questions: [
   ['Pilih nama bagi tembikai.', ['苹果', '西瓜', '香蕉'], 1, '西瓜 bermaksud tembikai.'],
   ['Apakah maksud 苹果?', ['Epal', 'Pisang', 'Tembikai'], 0, '苹果 bermaksud epal.'],
   ['Pilih nama bagi pisang.', ['西瓜', '苹果', '香蕉'], 2, '香蕉 bermaksud pisang.'],
  ],
 },
 {
  subject: 'tamil-sk', year: 1, title: 'நிறங்கள் · Padankan nama warna',
  idea: 'சிவப்பு bermaksud merah, நீலம் bermaksud biru dan பச்சை bermaksud hijau.',
  example: 'Kad hijau dipadankan dengan perkataan பச்சை.',
  try: 'Lukis tiga bulatan dengan tiga warna itu dan padankan nama warna bersama guru.',
  questions: [
   ['Apakah maksud நீலம்?', ['Merah', 'Biru', 'Hijau'], 1, 'நீலம் bermaksud biru.'],
   ['Pilih perkataan untuk merah.', ['சிவப்பு', 'பச்சை', 'நீலம்'], 0, 'சிவப்பு bermaksud merah.'],
   ['Pilih perkataan untuk hijau.', ['நீலம்', 'சிவப்பு', 'பச்சை'], 2, 'பச்சை bermaksud hijau.'],
  ],
 },
];

export const EXPLORE_LESSONS = activities.map(item => {
 const subject = PRIMARY_SUBJECT_CATALOG.find(entry => entry.id === item.subject);
 const id = 'explore-' + subject.id;
 const check = item.questions.map(([text, options, correct, why], index) => ({
  id: id + '-q' + (index + 1), mode: 'choice', text, options, answer: options[correct], why,
 }));
 return {
  id, title: item.title, icon: subject.icon, subject: subject.name, year: item.year,
  school: subject.streams === 'all' ? 'ALL' : subject.streams[0],
  chapter: 'Jom Teroka', status: 'DRAFT_TEACHER_REVIEW', premium: false,
  summary: item.idea, visual: item.example,
  steps: [
   {title: 'Kenali idea', body: item.idea},
   {title: 'Lihat contoh', body: item.example},
   {title: 'Cuba sendiri', body: item.try},
  ],
  mind: [
   ['Idea utama', item.idea],
   ['Contoh', item.example],
   ['Cuba sendiri', item.try],
  ],
  activity: check[0],
  check: check.slice(1),
 };
});
