# Optimasi Pocket Camera — 19 Oktober 2026

Target: 50 pengguna mengunggah foto bersamaan.

## Hasil uji nyata

Setiap run memakai 50 klien HTTP serentak × 3 JPEG dummy 256.000 byte. Layanan Google Apps Script, Sheets, dan Drive benar-benar dipanggil pada proyek uji terpisah. Tidak memakai tamu/foto produksi.

| Ukuran | Sebelum | Percobaan optimasi pertama | Versi akhir |
| --- | ---: | ---: | ---: |
| Run ID (UTC) | 20261019092431 | 20261019145601 | 20261019150207 |
| Log sebelum run | 0 | 150 | 300 |
| Foto selesai | 150/150 | 150/150 | 150/150 |
| File duplikat / ID hilang | 0 / 0 | 0 / 0 | 0 / 0 |
| Kuota tamu tidak sesuai | 0 | 0 | 0 |
| Sukses percobaan pertama | 100/150 | 40/150 | 67/150 |
| Seluruh request, termasuk retry/replay | 351 | 614 | 449 |
| Respons gagal/sibuk sementara | 143 | 410 | 241 |
| Median waktu selesai per foto | 37,7 dtk | 34,2 dtk | 21,2 dtk |
| p95 waktu selesai per foto | 222,8 dtk | 136,1 dtk | 103,9 dtk |
| Waktu maksimum per foto | 250,2 dtk | 167,6 dtk | 133,4 dtk |
| Replay 50 ID lama | 50/50 | 50/50 | 50/50 |
| Respons sukses sengaja diabaikan | 8 | 4 | 8 |

Versi akhir menyelesaikan 95% foto sekitar 53% lebih cepat dari baseline dalam kondisi uji ini. Respons sibuk lebih sering karena server sekarang menolak menunggu lock terlalu lama dan meminta klien mencoba kembali. Angka ini bukan penurunan jumlah percobaan gagal dibanding baseline; yang membaik adalah waktu selesai dan pemulihan. Data awal serta kondisi layanan berbeda antar-run sehingga ini bukan benchmark terkontrol dengan dataset identik.

Audit tiap run mencocokkan nama file, URL, ukuran, ID, status uploaded, dan kenaikan kuota tepat 3 per tamu. Tidak ditemukan ketidakcocokan atau log tertunda. Audit tidak menghitung hash seluruh isi file atau menilai kualitas gambar.

Pada versi akhir terdapat 216 respons sibuk yang disengaja, 24 respons jalur GET privat proyek uji, dan 1 respons non-JSON. Seluruhnya pulih melalui retry. Tidak ada timeout script lock yang tercatat pada run akhir. Respons jalur GET tersebut berasal dari handler uji, bukan bukti bahwa foto sempat diproses; setiap sukses akhir tetap dicocokkan dengan file dan log.

## Perbaikan yang diterapkan

- Reservasi kuota memakai lock singkat 1,5 detik; pekerjaan Drive dikerjakan di luar lock. Server mengirim retryAfterMs ketika sibuk.
- Indeks cache per tamu mengurangi pembacaan seluruh log. Cache hanya membantu menemukan baris; reservasi kuota tetap memeriksa data durable di dalam lock. Cache hilang atau baris berubah kembali membaca log.
- Foto yang sudah selesai dapat menerima konfirmasi dari log tanpa ikut antre lock reservasi lagi. Finalisasi mendapat waktu tunggu terbatas 10 detik.
- Lease 390 detik dan attemptToken mencegah pekerja lama mengambil alih proses pemulihan yang lebih baru. Retry dapat menemukan file Drive yang sudah dibuat dan menyelesaikan log tanpa mengunggah ulang.
- PocketLogs mendapat kolom J attemptToken; sembilan kolom sebelumnya tetap pada posisi yang sama. Status moderasi dipertahankan.
- Klien memakai saran waktu tunggu server, jeda acak, dan nextAttemptAt yang disimpan bersama antrean. Memuat ulang halaman menghormati jadwal tersebut. Foto baru dianggap selesai setelah server memberi URL.
- ID tetap sama saat retry; kuota hanya bertambah untuk ID baru. Jika unggahan sempat tertunda, foto tetap berada dalam antrean perangkat untuk dicoba kembali.

## Pemeriksaan lokal

- 71 pemeriksaan backend lulus, termasuk kuota/idempotensi, lock sibuk, file Drive sudah ada tetapi finalisasi tertunda, cache hilang/salah baris, perbaikan log parsial, dan konfirmasi tanpa lock.
- Controller antrean asli dijalankan dalam 50 konteks JavaScript: 150 foto utama selesai, 0 hilang/duplikat. Total 159 commit termasuk skenario tambahan.
- Simulasi mencakup 32 gangguan sementara, 19 respons sukses hilang, offline/resume, retry manual, guard worker, saran waktu tunggu server, dan jadwal setelah pemuatan ulang.
- Simulasi memakai storage/transport palsu serta timer dipercepat. Ini bukan pengukuran waktu server atau IndexedDB fisik.

Perintah lokal: node tools/verify-backend.cjs dan node tools/verify-camera-queue.cjs.

## Bukti dan batas hasil

Bukti request JSONL, audit JSON, ringkasan JSON dan laporan per-run disimpan di C:/Users/Tito/Desktop/wedding-app-camera-loadtest-20261019/results/. Fungsi inti versi akhir memiliki SHA-256 ff13af5b79459eef699440da2708711146ba9cb52c842768b5b04fbde568c432.

Pengujian tidak memakai 50 HP fisik, tidak mengukur lensa/izin kamera, IndexedDB nyata atau Wi-Fi venue. Ukuran foto, pertumbuhan log, beban akun dan jaringan dapat mengubah hasil. Penutupan halaman menghentikan pengiriman sampai dibuka kembali; data browser yang dihapus tidak bisa dipulihkan dari antrean lokal. Hasil ini tidak menjamin setiap foto langsung terkirim tanpa menunggu.

Server uji hanya berisi kode kamera minimal dan data sintetis. Konfigurasi produksi, PIN dan integrasi akun tidak disalin. Kunci privat proyek uji tidak boleh dipublikasikan.
