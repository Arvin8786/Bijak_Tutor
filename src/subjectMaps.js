import {PRIMARY_SUBJECT_CATALOG} from './primarySubjects.js';

// Each branch offers an idea and one action a learner can try aloud or on paper.
const branches = {
 bm: [
  ['Bunyi', 'Gabungkan suku kata untuk membina perkataan.', 'Sebut “ba” dan “ju”. Apakah perkataan apabila kedua-duanya digabungkan?'],
  ['Baca', 'Cari watak, tempat dan peristiwa utama dalam cerita.', 'Baca satu perenggan. Siapa yang melakukan sesuatu di dalamnya?'],
  ['Tulis', 'Susun perkataan menjadi ayat yang jelas.', 'Tulis satu ayat tentang perkara yang kamu lihat hari ini.'],
 ],
 en: [
  ['Listen', 'Listen for words that tell you who, where and when.', 'Say “A bird sits on a fence.” Where is the bird?'],
  ['Read', 'Use nearby words to work out the meaning of a new word.', 'In “I wore a coat because it was chilly,” what might chilly mean?'],
  ['Speak and write', 'Add a detail to make an idea clearer.', 'Finish “I like this book because …” with a reason.'],
 ],
 math: [
  ['Nombor', 'Pecahkan nombor kepada bahagian yang lebih mudah dikira.', 'Tunjukkan dua cara membuat 10 dengan jari atau objek.'],
  ['Ukuran', 'Pilih unit yang sesuai dan gunakan unit yang sama untuk membanding.', 'Anggarkan panjang pensel dalam sentimeter, kemudian ukur.'],
  ['Data', 'Baca tajuk dan petunjuk sebelum membuat kesimpulan.', 'Buat turus untuk buah pilihan tiga orang, kemudian kira.'],
 ],
 science: [
  ['Perhati', 'Catat apa yang kamu lihat dan bezakan daripada tekaan.', 'Lihat sehelai daun. Nyatakan warna dan bentuknya.'],
  ['Uji', 'Tukar satu perkara sahaja untuk membuat perbandingan yang adil.', 'Bagaimana kamu boleh membanding dua permukaan menggunakan kereta mainan yang sama?'],
  ['Terangkan', 'Gunakan pemerhatian atau ukuran sebagai bukti.', 'Terangkan dapatan menggunakan “Saya perhatikan …”.'],
 ],
 islam: [
  ['Adab', 'Gunakan bahasa yang baik dan hormati orang lain.', 'Bagaimanakah kamu boleh meminta izin sebelum meminjam?'],
  ['Kebersihan', 'Amalkan kebersihan diri dan ruang yang dikongsi.', 'Pilih satu cara menjaga ruang belajar selepas digunakan.'],
  ['Amalan harian', 'Tunjukkan amanah melalui perbuatan kecil.', 'Apakah yang patut kamu lakukan selepas menggunakan buku pinjaman?'],
 ],
 moral: [
  ['Empati', 'Fikir bagaimana tindakan kamu mempengaruhi perasaan orang lain.', 'Apakah yang boleh kamu katakan kepada kawan yang tertinggal permainan?'],
  ['Tanggungjawab', 'Lakukan tugas yang dipersetujui dan jaga barang bersama.', 'Pilih satu tugas kecil dan terangkan cara menyiapkannya.'],
  ['Keputusan', 'Bandingkan pilihan sebelum memilih tindakan yang adil.', 'Dua orang mahu guna pensel yang sama. Bagaimanakah mereka boleh berkongsi?'],
 ],
 pjpk: [
  ['Gerak', 'Cari ruang yang selamat sebelum bergerak.', 'Lihat sekeliling dan kenal pasti halangan sebelum melakukan regangan ringan.'],
  ['Jaga diri', 'Berehat, minum air dan beritahu orang dewasa jika rasa tidak sihat.', 'Apakah tanda yang membuat kamu patut berhenti dan minta bantuan?'],
  ['Kerjasama', 'Ikut peraturan permainan dan beri ruang kepada rakan.', 'Cipta satu peraturan supaya semua orang mendapat giliran.'],
 ],
 psv: [
  ['Garisan', 'Garisan lurus, lengkung dan beralun membawa kesan yang berlainan.', 'Lukis tiga garisan yang menunjukkan air bergerak.'],
  ['Warna', 'Pilih warna untuk membantu menunjukkan bahagian yang penting.', 'Warnakan satu bentuk dengan warna yang berbeza daripada latarnya.'],
  ['Corak', 'Ulang bentuk, garisan atau warna dengan satu peraturan.', 'Bina corak tiga bentuk dan minta seseorang menyambungnya.'],
 ],
 music: [
  ['Detik', 'Detik ialah denyutan tetap yang membantu kita mengikut muzik.', 'Tepuk empat detik sama jarak.'],
  ['Irama', 'Irama menyusun bunyi panjang, pendek dan senyap.', 'Tepuk dua kali, senyap satu detik, kemudian tepuk sekali.'],
  ['Dinamik', 'Bunyi boleh dimainkan secara lembut atau kuat.', 'Tepuk pola yang sama sekali secara lembut dan sekali lebih kuat.'],
 ],
 history: [
  ['Masa', 'Susun peristiwa dari dahulu hingga sekarang.', 'Bina garis masa tiga peristiwa dalam sehari.'],
  ['Sumber', 'Gambar, dokumen dan cerita lisan memberi maklumat yang berbeza.', 'Lihat satu gambar lama yang dibenarkan. Apakah yang boleh dilihat?'],
  ['Bukti', 'Bezakan perkara yang diketahui daripada perkara yang belum pasti.', 'Berikan satu soalan yang tidak dapat dijawab daripada gambar sahaja.'],
 ],
 rbt: [
  ['Keperluan', 'Kenal pasti masalah dan siapa yang akan menggunakan hasil reka bentuk.', 'Pilih satu benda yang sukar disusun di atas meja.'],
  ['Lakaran', 'Lukis idea dan label bahagian yang membantu menyelesaikan masalah.', 'Lakar bekas untuk menyusun benda itu.'],
  ['Uji', 'Cuba model dan ubah satu bahagian berdasarkan hasil ujian.', 'Semak sama ada model stabil apabila diletakkan di atas meja.'],
 ],
 chinese: [
  ['听 · Dengar', 'Dengar sebutan daripada guru atau rakaman pembelajaran.', 'Dengar satu ayat pendek dan ulang dengan perlahan.'],
  ['读 · Baca', 'Cari perkataan utama sebelum membaca keseluruhan ayat.', 'Bulatkan satu perkataan yang kamu kenal.'],
  ['写 · Tulis', 'Gunakan contoh dan semak susunan perkataan.', 'Salin satu contoh daripada bahan guru dan baca semula.'],
 ],
 tamil: [
  ['கேள் · Dengar', 'Perhatikan bunyi dan ulang ayat daripada bahan guru.', 'Dengar satu ayat pendek dan sebut semula.'],
  ['படி · Baca', 'Kenal pasti perkataan biasa dalam ayat.', 'Tunjukkan satu perkataan yang kamu kenal.'],
  ['எழுது · Tulis', 'Semak huruf dan jarak antara perkataan.', 'Salin satu contoh daripada bahan guru, kemudian baca semula.'],
 ],
 arabic: [
  ['استمع · Dengar', 'Dengar sebutan perkataan daripada guru.', 'Ulang satu perkataan selepas mendengarnya.'],
  ['اقرأ · Baca', 'Ikut arah bacaan Arab dari kanan ke kiri.', 'Tunjuk tempat kamu mula membaca satu baris Arab.'],
  ['اكتب · Tulis', 'Perhatikan bentuk huruf dan kedudukan titik.', 'Bandingkan tulisan kamu dengan contoh guru.'],
 ],
};

const languageStudy = [
 ['Dengar', 'Gunakan contoh sebutan daripada guru atau penutur yang membantu pembelajaran kamu.', 'Minta contoh satu perkataan dan dengar sebelum mengulanginya.'],
 ['Padankan', 'Hubungkan contoh yang telah disemak dengan gambar atau benda.', 'Pilih satu gambar untuk mengingat contoh yang baru dipelajari.'],
 ['Semak', 'Minta guru atau penutur menyemak penggunaan dan sebutan kamu.', 'Terangkan maksud contoh itu dalam bahasa yang kamu faham.'],
];

export const SUBJECT_MAPS = Object.fromEntries(PRIMARY_SUBJECT_CATALOG.map(subject => {
 const key = subject.id.replace(/-sk$/, '');
 return [subject.name, {
  title: subject.name,
  icon: subject.icon,
  branches: branches[key] || languageStudy,
  guidedByTeacher: !branches[key],
 }];
}));
