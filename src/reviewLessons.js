const maths = [
  {
    title: 'Tambah dengan melengkapkan sepuluh',
    summary: 'Pecahkan nombor kepada bahagian kecil untuk melengkapkan kumpulan sepuluh.',
    example: '8 + 5 = 8 + 2 + 3 = 13. Lapan memerlukan dua lagi untuk menjadi sepuluh.',
    steps: ['Lukis sepuluh petak dan isi lapan petak.', 'Asingkan 5 kepada 2 dan 3. Isi dua petak yang kosong.', 'Kira 10 petak penuh dan 3 baki. Semak jawapan dengan mengira ke hadapan.'],
    checks: [
      ['7 + 6 = ?', '13', 'Pecahkan 6 kepada 3 dan 3. Kemudian 7 + 3 + 3 = 13.', ['11', '12', '13']],
      ['Nadia ada 9 pelekat dan mendapat 5 lagi. Berapa jumlah pelekat?', '14', '9 + 1 melengkapkan sepuluh. Tambah baki 4 untuk mendapat 14.'],
    ],
  },
  {
    title: 'Tolak dengan melintasi puluh',
    summary: 'Tolak hingga sampai kepada puluh terdekat, kemudian tolak bakinya.',
    example: '34 − 7 = 34 − 4 − 3 = 27.',
    steps: ['Cari puluh di bawah 34, iaitu 30.', 'Pecahkan 7 kepada 4 dan 3. Tolak 4 dahulu untuk sampai ke 30.', 'Tolak 3 lagi. Semak dengan 27 + 7 = 34.'],
    checks: [
      ['42 − 8 = ?', '34', 'Tolak 2 untuk sampai ke 40, kemudian tolak 6.', ['32', '34', '36']],
      ['Ada 53 buku. Sembilan dipinjam. Berapa buku yang tinggal?', '44', '53 − 3 = 50 dan 50 − 6 = 44.'],
    ],
  },
  {
    title: 'Bahagi kepada kumpulan sama banyak',
    summary: 'Pembahagian boleh menunjukkan berapa kumpulan sama besar yang dapat dibentuk.',
    example: '24 biji guli dengan 6 biji setiap kumpulan menghasilkan 4 kumpulan kerana 4 × 6 = 24.',
    steps: ['Kenal pasti jumlah objek dan saiz satu kumpulan.', 'Kira gandaan saiz kumpulan sehingga mencapai jumlah.', 'Semak dengan mendarab bilangan kumpulan dengan saiz setiap kumpulan.'],
    checks: [
      ['Susun 28 kad dalam kumpulan 7 kad. Berapa kumpulan?', '4', '4 × 7 = 28.', ['3', '4', '7']],
      ['36 pensel dimasukkan ke dalam kotak yang memuatkan 6 pensel setiap satu. Berapa kotak penuh?', '6', '36 ÷ 6 = 6.'],
    ],
  },
  {
    title: 'Banding pecahan dengan penyebut sama',
    summary: 'Jika keseluruhan sama besar dan penyebut sama, pembilang lebih besar mewakili bahagian lebih banyak.',
    example: '3/8 lebih kecil daripada 5/8 kerana kedua-duanya dikira dalam bahagian perlapan yang sama saiz.',
    steps: ['Lukis dua jalur sama panjang, masing-masing dibahagi kepada lapan bahagian.', 'Lorek tiga bahagian pada satu jalur dan lima pada satu lagi.', 'Banding bilangan bahagian berlorek. Semak bahawa penyebut kedua-duanya masih 8.'],
    checks: [
      ['Pecahan manakah paling besar?', '7/9', 'Ketiga-tiga pecahan mempunyai penyebut 9 dan 7 ialah pembilang terbesar.', ['2/9', '7/9', '5/9']],
      ['Ali makan 2/8 dan Mei makan 3/8 daripada kek yang sama. Tulis jumlah dalam bentuk a/8.', '5/8', 'Tambah 2 dan 3 bahagian perlapan. Penyebut kekal 8.'],
    ],
  },
  {
    title: 'Kira baki wang dalam ringgit dan sen',
    summary: 'Menukar harga kepada sen membantu kita mengira baki tanpa tersilap nilai tempat.',
    example: 'RM10.00 − RM6.75 = 1,000 sen − 675 sen = 325 sen, iaitu RM3.25.',
    steps: ['Tukar jumlah dibayar dan harga kepada sen. Satu ringgit ialah 100 sen.', 'Tolak harga daripada jumlah yang dibayar.', 'Tukar baki kepada ringgit dan sen. Tambah baki kepada harga untuk menyemak.'],
    checks: [
      ['Farah membayar RM10.00 untuk buku berharga RM7.40. Berapa baki?', 'RM2.60', '1,000 − 740 = 260 sen, iaitu RM2.60.', ['RM2.40', 'RM2.60', 'RM3.40']],
      ['Baki ialah RM4.35. Berapa sen semuanya? Taip angka sahaja.', '435', '4 ringgit ialah 400 sen. Tambah 35 sen.'],
    ],
  },
  {
    title: 'Kira peratus daripada kuantiti',
    summary: 'Peratus bermaksud daripada seratus. Pecahan setara boleh memudahkan pengiraan.',
    example: '25% daripada 48 ialah 48 ÷ 4 = 12 kerana 25/100 = 1/4.',
    steps: ['Tulis peratus sebagai pecahan berpenyebut 100.', 'Permudahkan pecahan jika boleh. Contohnya, 50/100 = 1/2.', 'Gunakan pecahan pada kuantiti dan semak sama ada jawapan munasabah.'],
    checks: [
      ['Berapakah 25% daripada 60?', '15', 'Satu perempat daripada 60 ialah 60 ÷ 4 = 15.', ['12', '15', '25']],
      ['Terdapat 80 kad. Sepuluh peratus daripadanya berwarna biru. Berapa kad biru?', '8', '10% bersamaan satu persepuluh, jadi 80 ÷ 10 = 8.'],
    ],
  },
];

const mathsFollowUps = [
  [
    ['Berapa lagi diperlukan untuk melengkapkan 6 menjadi 10?', '4', '6 + 4 = 10.'],
    ['10 + 3 = ?', '13', 'Selepas sepuluh, kira 11, 12 dan 13.'],
    ['Pecahkan 7 untuk menyelesaikan 8 + 7. Selepas guna 2 untuk melengkapkan 10, berapa baki daripada 7?', '5', '7 = 2 + 5. Tambah baki 5 kepada 10.'],
  ],
  [
    ['31 − 6 = ?', '25', '31 − 1 − 5 = 25.'],
    ['74 − 9 = ?', '65', 'Tolak 4 hingga 70. Tolak baki 5.'],
    ['Selepas menolak 8 daripada 61, semak dengan menambah 8 kepada 53. Apakah hasil semakan?', '61', '53 + 8 = 61, jumlah asal.'],
  ],
  [
    ['Berapa kumpulan 5 dapat dibentuk daripada 35 kad?', '7', '35 ÷ 5 = 7.'],
    ['Ada 48 manik dan setiap gelang menggunakan 8 manik. Berapa gelang dapat dibuat?', '6', '6 × 8 = 48.'],
    ['Enam bekas diisi dengan 4 objek setiap satu. Berapakah jumlah objek?', '24', 'Darab bilangan bekas dengan saiz kumpulan: 6 × 4 = 24.'],
  ],
  [
    ['Tulis pecahan lebih kecil antara 2/5 dan 4/5.', '2/5', 'Kedua-duanya dalam perlima. Dua bahagian lebih sedikit daripada empat.'],
    ['Berapa bahagian persembilan diperlukan untuk mengubah 4/9 kepada 7/9? Taip bilangan bahagian.', '3', '7 − 4 = 3 bahagian persembilan.'],
    ['Tulis jumlah 1/6 + 3/6 dalam bentuk a/6.', '4/6', 'Tambah pembilang. Bahagian masih berukuran satu perenam.'],
  ],
  [
    ['Tukarkan RM5.05 kepada sen. Taip angka sahaja.', '505', '500 + 5 = 505 sen.'],
    ['Bayar dengan 2,000 sen untuk barang 1,260 sen. Berapa sen baki?', '740', '2,000 − 1,260 = 740 sen.'],
    ['Harga ialah 425 sen dan baki 575 sen. Berapa sen jumlah yang dibayar?', '1000', '425 + 575 = 1,000 sen.'],
  ],
  [
    ['50% daripada 86 ialah berapa?', '43', '50% ialah separuh. 86 ÷ 2 = 43.'],
    ['Berapakah 20% daripada 45?', '9', '20/100 = 1/5. 45 ÷ 5 = 9.'],
    ['40% daripada 35 buku ialah buku fiksyen. Berapa buku fiksyen?', '14', '40/100 = 2/5. 35 ÷ 5 × 2 = 14.'],
  ],
];

const science = [
  {
    title: 'Pemerhatian dengan deria',
    summary: 'Pemerhatian menerangkan perkara yang kita kesan secara langsung.',
    example: '“Daun itu hijau” ialah pemerhatian. “Daun itu baru tumbuh” ialah tekaan jika kita tidak melihatnya tumbuh.',
    steps: ['Pilih objek yang selamat seperti sehelai daun yang ditunjukkan guru.', 'Catat satu warna atau bentuk yang boleh dilihat.', 'Bezakan catatan itu daripada tekaan tentang asal objek.'],
    checks: [
      ['Ayat manakah suatu pemerhatian?', 'Daun itu hijau', 'Warna hijau boleh dilihat secara langsung.', ['Daun itu hijau', 'Daun itu baru tumbuh', 'Daun itu mungkin dari taman']],
      ['Deria manakah digunakan untuk melihat warna?', 'Penglihatan', 'Mata membantu kita melihat warna.', ['Pendengaran', 'Penglihatan', 'Sentuhan']],
    ],
  },
  {
    title: 'Kelaskan objek mengikut sifat',
    summary: 'Pengelasan menggunakan satu peraturan yang boleh diuji untuk menyusun objek.',
    example: 'Pembaris plastik yang lutsinar boleh berada dalam kumpulan “cahaya menembusi”; kad tebal berada dalam kumpulan lain.',
    steps: ['Pilih satu sifat seperti lutsinar atau legap.', 'Lihat objek di hadapan cahaya bilik. Jangan pandang matahari.', 'Letakkan setiap objek dalam satu kumpulan dan terangkan peraturan yang digunakan.'],
    checks: [
      ['Objek manakah biasanya lutsinar?', 'Kepingan plastik jernih', 'Cahaya boleh menembusi plastik jernih.', ['Kad tebal', 'Kepingan plastik jernih', 'Kayu']],
      ['Untuk membanding dengan adil, apakah yang perlu digunakan bagi semua objek?', 'Peraturan yang sama', 'Semua objek dinilai mengikut sifat yang sama.', ['Peraturan yang sama', 'Kumpulan berlainan setiap kali', 'Warna kegemaran']],
    ],
  },
  {
    title: 'Ukur panjang dari tanda sifar',
    summary: 'Bacaan panjang memerlukan unit yang sama dan kedudukan pembaris yang betul.',
    example: 'Jika hujung pensel berada pada 0 cm dan 9 cm, panjangnya ialah 9 cm.',
    steps: ['Letakkan satu hujung objek pada tanda sifar, bukan semestinya pada tepi pembaris.', 'Lihat tanda pada hujung satu lagi dari atas.', 'Catat nombor bersama unit. Jika bermula pada tanda bukan sifar, tolak bacaan awal daripada bacaan akhir.'],
    checks: [
      ['Jika objek bermula pada 0 cm dan berakhir pada 8 cm, berapakah panjangnya?', '8 cm', '8 − 0 = 8 cm.', ['7 cm', '8 cm', '9 cm']],
      ['Objek bermula pada 2 cm dan berakhir pada 11 cm. Berapa sentimeter panjangnya?', '9', 'Panjang ialah beza bacaan: 11 − 2 = 9 cm.'],
    ],
  },
  {
    title: 'Banding keputusan dengan ujian adil',
    summary: 'Untuk menguji satu faktor, ubah faktor itu sahaja dan pastikan keadaan lain sama.',
    example: 'Untuk menguji kesan permukaan pada jarak kereta mainan bergerak, gunakan kereta, cerun dan titik mula yang sama.',
    steps: ['Nyatakan faktor yang hendak diubah, seperti jenis permukaan.', 'Nyatakan perkara yang diukur, seperti jarak dalam sentimeter.', 'Ulang ujian menggunakan cara melepaskan kereta yang sama untuk setiap permukaan.'],
    checks: [
      ['Faktor manakah diubah dalam contoh kereta mainan?', 'Jenis permukaan', 'Jenis permukaan ialah perkara yang diuji.', ['Jenis permukaan', 'Kereta mainan', 'Titik mula']],
      ['Yang manakah menjadikan perbandingan kurang adil?', 'Menolak kereta lebih kuat pada satu permukaan', 'Daya tolakan juga boleh mengubah jarak.', ['Menggunakan kereta yang sama', 'Mengukur dengan unit sama', 'Menolak kereta lebih kuat pada satu permukaan']],
    ],
  },
  {
    title: 'Baca pola dalam jadual ukuran',
    summary: 'Jadual membantu kita melihat pola tanpa membuat dakwaan melebihi data.',
    example: 'Anak pokok berukuran 4, 6 dan 7 cm pada hari 1, 3 dan 5. Tingginya meningkat dalam tempoh yang diukur.',
    steps: ['Baca tajuk lajur dan unit sebelum membandingkan nombor.', 'Bandingkan ukuran mengikut urutan masa.', 'Terangkan perubahan yang benar-benar diperhatikan. Jangan reka ukuran pada hari yang tidak dicatat.'],
    checks: [
      ['Berapakah pertambahan tinggi dari 4 cm kepada 7 cm?', '3', '7 − 4 = 3 cm.'],
      ['Kesimpulan manakah disokong oleh data contoh?', 'Anak pokok semakin tinggi antara hari 1 dan hari 5', 'Bacaan terakhir lebih tinggi daripada bacaan awal.', ['Anak pokok semakin tinggi antara hari 1 dan hari 5', 'Anak pokok pasti setinggi 12 cm pada hari 6', 'Anak pokok bertambah tepat 1 cm setiap hari']],
    ],
  },
  {
    title: 'Bina kesimpulan daripada bukti',
    summary: 'Kesimpulan yang baik menyatakan bukti yang menyokongnya dan had ujian.',
    example: 'Pada tiga percubaan, bot kertas A membawa 8, 7 dan 9 syiling; B membawa 5, 6 dan 5. A membawa lebih banyak dalam setiap percubaan ini.',
    steps: ['Bandingkan semua bacaan, bukan hanya bacaan tertinggi.', 'Gunakan nombor untuk menyokong kesimpulan.', 'Nyatakan had seperti bilangan percubaan atau bahan yang diuji sebelum membuat dakwaan yang lebih umum.'],
    checks: [
      ['Dakwaan manakah paling tepat untuk contoh bot?', 'A membawa lebih banyak dalam tiga percubaan ini', 'Ketiga-tiga bacaan A melebihi bacaan B dalam ujian ini.', ['Semua bot A sentiasa lebih kuat', 'A membawa lebih banyak dalam tiga percubaan ini', 'B membawa lebih banyak pada satu percubaan']],
      ['Apakah cara terbaik menambah keyakinan pada keputusan?', 'Ulang ujian dengan keadaan yang sama', 'Ulangan membantu kita melihat sama ada pola berulang.', ['Pilih bacaan tertinggi sahaja', 'Tukar beberapa perkara serentak', 'Ulang ujian dengan keadaan yang sama']],
    ],
  },
];

function makeLessons(materials, subject, key, icon) {
  return materials.map(({title, summary, example, steps, checks}, index) => {
    const id = `review-${key}-y${index + 1}`;
    return {
      id, title, subject, icon, summary, year: index + 1, school: 'ALL',
      chapter: 'Ulang Kaji Berpandu', visual: example,
      status: 'DRAFT_TEACHER_REVIEW', premium: false,
      steps: steps.map((body, step) => ({title: ['Mula', 'Cuba', 'Semak'][step], body})),
      mind: [['Idea utama', summary], ['Contoh', example], ['Semak', steps[2]]],
      check: checks.map(([text, answer, why, options], question) => ({
        id: `${id}-q${question + 1}`, text, answer, why,
        mode: options ? 'choice' : (answer.includes('/') ? 'text' : 'number'), ...(options && {options}), transfer: question > 0,
      })),
    };
  });
}

export const REVIEW_LESSONS = [
  ...makeLessons(
    maths.map((lesson, index) => ({...lesson, checks: [...lesson.checks, ...mathsFollowUps[index]]})),
    'Matematik', 'math', '🧮',
  ),
  ...makeLessons(science, 'Sains', 'science', '🔬'),
];
