# Radio Frequency Analyzer

Kalkulator Radio Frequency, link budget, pola antena, jangkauan, kanal Wi-Fi, dan perencana denah sinyal. Dibangun dengan Next.js (App Router, JSX) dan di-deploy ke Vercel. Semua perhitungan berjalan di browser, tidak ada server atau akun.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | Pemeriksaan ESLint |
| `npm test` | Menjalankan tes rumus (Vitest) |

## Fitur per tab

- **Ringkasan**: angka kunci, gauge EIRP, skala daya, rantai sinyal
- **Pola**: lobe 3D, potongan azimuth dan elevasi, metrik lebar sinar
- **Link**: lingkungan dan dinding, link budget, jangkauan maksimum
- **Jangkauan**: peta cakupan, zona Fresnel, dan tinggi menara minimum (lengkung bumi)
- **Denah**: gambar dinding, taruh AP dan penerima, peta sinyal, kuota, interferensi, saran posisi, ekspor PNG
- **Kanal**: peta kanal 2.4, 5, dan 6 GHz, plus saran kanal terbaik dari daftar Wi-Fi tetangga
- **Keamanan**: jarak aman paparan RF dan acuan batas EIRP per wilayah
- **Bandingkan**: membandingkan profil tersimpan
- **Alat**: hitung terbalik, konverter, VSWR, noise dan SNR, estimasi kecepatan, panduan istilah

## Laporan PDF

Tombol **Laporan PDF** di kartu "Profil dan bagikan" membuka halaman `/laporan` yang berisi ringkasan perhitungan (dan denah bila ada AP). Pilih "Simpan sebagai PDF" di jendela cetak browser. Laporan dibangun dari parameter di URL, tanpa server.

## Mode offline (PWA)

`public/sw.js` menyimpan halaman dan aset statis setelah kunjungan pertama, jadi web tetap bisa dibuka tanpa sinyal. Service worker hanya aktif di build produksi. Untuk bisa dipasang sebagai aplikasi di semua browser, tambahkan ikon PNG 192 dan 512 px di `public/` dan daftarkan di `manifest.json`. Naikkan nama cache (`rf-analyzer-v1`) di `sw.js` bila ingin memaksa pembaruan.

## Struktur folder

```
src/
  app/            layout, halaman utama, gaya global (token warna)
  components/
    ui/           komponen dasar (Card, Slider, Tooltip, InfoTip, ...)
    layout/       Shell, Header, Sidebar, TabBar
    controls/     kartu input di sidebar
    gauges/       gauge dan indikator status
    charts/       grafik link budget
    pattern/      pola radiasi 2D dan 3D
    coverage/     peta cakupan dan zona Fresnel
    floorplan/    kanvas denah
    channel/      peta kanal
    safety/       paparan RF dan regulasi
    tools/        kalkulator di tab Alat
    tabs/         isi tiap tab
  lib/
    rf/           rumus murni tanpa React (bisa dites)
    data/         tabel referensi: antena, kabel, kanal, regulasi, glosarium
    utils/        pembantu: format, warna, berbagi tautan, ekspor PNG
  store/          state global (Zustand)
  hooks/          hook bersama
tests/            tes rumus (Vitest)
public/           ikon dan manifest
```

Aturan sederhana: rumus ada di `src/lib/rf`, angka referensi ada di `src/lib/data`, tampilan ada di `src/components`. Komponen tidak menulis ulang rumus.

## Sumber rumus dan asumsi

- **EIRP** = daya TX + gain antena − rugi kabel (+ gain susunan bila antena sefase).
- **Rugi ruang bebas** = 20·log10(d) + 20·log10(f MHz) − 27.55, d dalam meter. Model lintasan memakai eksponen n: `FSPL(1 m) + 10·n·log10(d)`.
- **Link budget**: daya terima = EIRP − rugi lintasan − halangan + gain RX − rugi kabel RX.
- **Denah**: model multi-dinding (rugi ruang bebas ditambah rugi tiap dinding yang dilewati garis lurus AP ke titik).
- **Interferensi**: dua AP dianggap mengganggu bila kanalnya tumpang tindih dan sinyal pengganggu berada dalam 10 dB dari sinyal utama. SINR memasukkan interferensi ke noise.
- **Kecepatan**: tabel MCS Wi-Fi 6 (GI 0.8 µs) dengan ambang SNR umum, throughput nyata 60% dari laju PHY.
- **Paparan RF**: kerapatan daya medan jauh `P / (4πd²)`, dibandingkan dengan batas ICNIRP.

Semua hasil adalah perkiraan untuk perencanaan, bukan pengukuran.

## Data yang perlu ditinjau berkala

Nilai berikut perkiraan umum dan sebaiknya diverifikasi:

- `src/lib/data/regulations.js`: batas EIRP per wilayah. Profil Indonesia **belum diverifikasi** dan bisa diedit di tab Keamanan.
- `src/lib/rf/propagation.js`: rugi dinding dan eksponen lintasan.
- `src/lib/data/cables.js`: rugi kabel per meter.
- `src/lib/rf/throughput.js`: ambang SNR dan laju tiap MCS.

## Tes

```bash
npm test
```

Tes ada di folder `tests/` dan mencakup konversi satuan, EIRP, rugi lintasan, link budget, VSWR, paparan RF, Fresnel, kecepatan, hitung terbalik, denah, interferensi, penempatan AP, tautan bagikan, dan profil aturan. Jalankan sebelum mengubah rumus di `src/lib/rf`.

## Data yang disimpan di perangkat

- Profil: `localStorage` kunci `eirp-profiles`
- Denah: `localStorage` kunci `eirp-floorplan`
- Tema: `localStorage` kunci `theme`
- Wi-Fi tetangga: `localStorage` kunci `eirp-neighbors`

Tautan bagikan hanya berisi input kalkulator di parameter URL, tidak termasuk denah.

## Deploy

Hubungkan repositori ke Vercel. Setiap push ke `main` membangun ulang otomatis. Ikon ada di `public/icon.svg`.

## Catatan penggunaan

Status "Bahaya" menandai EIRP di atas 30 dBm, yang berpotensi mengganggu perangkat lain dan bisa menyerupai pengacau sinyal. Gunakan hanya sesuai aturan setempat, dan uji dengan dummy load atau ruang terisolasi.
