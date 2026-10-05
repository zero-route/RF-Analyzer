export const GLOSSARY = {
  eirp: {
    title: "EIRP",
    body: "Daya total yang dipancarkan ke arah terkuat antena: daya pemancar ditambah gain antena dikurangi rugi kabel. Angka inilah yang dibandingkan dengan batas aturan.",
  },
  dbm: {
    title: "dBm",
    body: "Satuan daya dalam desibel terhadap 1 mW. 0 dBm sama dengan 1 mW, 20 dBm sama dengan 100 mW, 30 dBm sama dengan 1 W. Naik 3 dB berarti daya dua kali lipat.",
  },
  dbi: {
    title: "dBi",
    body: "Gain antena dibanding antena isotropik, yaitu titik ideal yang memancar rata ke segala arah. Gain tinggi memusatkan sinyal ke arah tertentu, bukan menambah daya total.",
  },
  fspl: {
    title: "Rugi ruang bebas (FSPL)",
    body: "Redaman sinyal di ruang terbuka tanpa halangan. Naik sekitar 6 dB setiap jarak berlipat dua, dan makin besar di frekuensi yang lebih tinggi.",
  },
  pathloss: {
    title: "Eksponen lintasan",
    body: "Seberapa cepat sinyal melemah terhadap jarak. Nilai 2 untuk ruang bebas, lebih besar untuk luar ruangan padat atau di dalam gedung.",
  },
  linkbudget: {
    title: "Link budget",
    body: "Perhitungan daya dari pemancar sampai penerima: semua gain ditambah dan semua rugi dikurangi. Hasil akhirnya dibandingkan dengan sensitivitas penerima.",
  },
  fade: {
    title: "Fade margin",
    body: "Cadangan daya dalam dB untuk menutup fluktuasi sinyal akibat pantulan, cuaca, atau gerakan. Makin besar makin andal, tapi jangkauan makin pendek.",
  },
  sensitivity: {
    title: "Sensitivitas penerima",
    body: "Sinyal terlemah yang masih bisa dibaca penerima. Makin negatif, misalnya −90 dBm, makin sensitif. Laju data tinggi butuh sinyal lebih kuat.",
  },
  snr: {
    title: "Noise floor, SNR, dan SINR",
    body: "SNR adalah selisih sinyal dan noise dalam dB. SINR juga memasukkan interferensi dari pemancar lain. Makin tinggi, makin tinggi laju data yang bisa dipakai.",
  },
  mcs: {
    title: "MCS",
    body: "Tingkat modulasi dan pengkodean Wi-Fi. MCS lebih tinggi memberi laju data lebih besar, tapi butuh SNR lebih tinggi.",
  },
  vswr: {
    title: "VSWR",
    body: "Ukuran ketidakcocokan impedansi antara pemancar, kabel, dan antena. 1:1 ideal, makin besar makin banyak daya terpantul. Di bawah 2:1 umumnya dianggap baik.",
  },
  fresnel: {
    title: "Zona Fresnel",
    body: "Daerah berbentuk elips di sekitar garis pandang. Sebaiknya minimal 60% zona pertama bebas halangan supaya sinyal tidak banyak melemah.",
  },
  powerdensity: {
    title: "Kerapatan daya",
    body: "Ukuran paparan RF di suatu titik dalam W/m², dibandingkan dengan batas keselamatan seperti ICNIRP. Rumusnya berlaku di medan jauh.",
  },
  beamwidth: {
    title: "Lebar sinar",
    body: "Sudut tempat daya antena turun setengah (−3 dB) dari puncaknya. Gain tinggi berarti sinar lebih sempit.",
  },
  dfs: {
    title: "DFS",
    body: "Pada sebagian kanal 5 GHz, perangkat wajib mendeteksi radar dan pindah kanal bila ada. Karena itu kanal DFS bisa berpindah sendiri.",
  },
  status: {
    title: "Ambang status 20 dan 30 dBm",
    body: "Acuan umum di web ini untuk menilai EIRP, bukan keputusan hukum. Batas resmi berbeda tiap negara dan pita, cek di tab Keamanan.",
  },
};
