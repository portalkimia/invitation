# Deployment aktif

## Optimasi unggahan kamera — 19 Oktober 2026

- Backend aktif diperbarui dari versi 10 menjadi **11** pada deployment dan URL yang sama, tanpa perubahan manifest, pemilik atau hak akses. Integrasi login Wedding Fund tetap disertakan.
- Reservasi lock 1,5 detik, indeks cache dengan pemeriksaan log durable, finalisasi terbatas 10 detik, pemulihan file yang sudah ada, lease 390 detik dan owner token. PocketLogs menambah kolom J attemptToken tanpa menggeser kolom sebelumnya.
- Halaman pocket-cam.html menghormati retryAfterMs dan menyimpan nextAttemptAt agar pemuatan ulang tidak memicu retry serentak. Sukses memerlukan photoUrl dari server.
- Uji final 50 klien HTTP × 3 JPEG dummy 250 KB: 150/150 tersimpan; 0 hilang, duplikat, log tertunda atau kesalahan kuota. Replay 50 ID selesai tanpa file tambahan.
- Median 21,2 detik, p95 103,9 detik, maksimum 133,4 detik; baseline 37,7 / 222,8 / 250,2 detik. Masih ada respons sibuk dan retry. Sukses percobaan pertama 67/150; tidak boleh dianggap unggah 50 pengguna langsung lancar tanpa antrean.
- 71 pemeriksaan backend dan simulasi controller 50 klien lulus. Uji nyata memakai proyek terpisah, bukan 50 HP atau jaringan venue. Tidak mengubah kuota/kehadiran tamu produksi.
- Lihat CAMERA-LOAD-TEST.md untuk perbandingan seluruh percobaan dan batas hasil. Bukti run akhir: 20261019150207.

## Royal Crest Monogram & Sinkronisasi Konfigurasi Live — 19 Oktober 2026

- **Redesain Total Monogram (Royal Crest Emblem)**:
  - Mengganti tipografi kursif yang saling bertumpuk dengan huruf serif klasik (*Cormorant Garamond* 62px) yang berdiri mandiri (`T` di `x=76`, `&` di `x=110`, `V` di `x=144`).
  - Membingkai inisial dengan lingkaran ganda konsentris simetris, 4 aksen intan kardinal (*North, South, East, West*), dan sulur daun laurel di bawah huruf (bebas tabrakan/garis potong).
  - Sub-kapsi nama `TITO & VIRA` dengan *letter-spacing* 0.22em di bawah emblem.
  - Versi stylesheet `20261019-royal-crest`.
- **Sinkronisasi Konfigurasi Live & Zero-Flicker**:
  - `assets/js/config.js` disinkronkan penuh dengan data live Google Sheets (Tito Vanzal, S.Pd & Dhevira Aptia Firmanda, S.Pd, 25 Oktober 2027, rekening, kisah perjalanan cinta, dan galeri).
  - Markup awal `index.html` dan fallback `assets/js/api.js` diperbarui ke `T & V` / `Tito & Vira` sehingga tidak ada kedipan placeholder lama saat pertama kali dimuat.
- **Backend GAS**:
  - Proyek GAS `1WLghP8nsjZew7RMg9MY3yAtAttZMLt0aas_9gvMX1_-g8JUBkhORDO5K` diverifikasi dan disinkronkan via CLASP (backend `Kode.js` & `appsscript.json`).

## Akses dari Wedding Fund — 19 Oktober 2026

- Sidebar Wedding Fund membuka `https://portalkimia.github.io/invitation/dashboard` memakai tiket sekali pakai yang hanya dapat dibuat setelah login Wedding Fund. Tiket berlaku 90 detik dan ditukar oleh backend undangan menjadi sesi admin 12 jam. PIN admin tetap tersedia saat membuka dashboard secara langsung atau jika tiket gagal diverifikasi.
- Backend Wedding Fund dan backend undangan memakai URL Web App lama, masing-masing deployment versi **10**. Proyek undangan telah diberi izin `script.external_request` agar dapat memverifikasi tiket ke backend Wedding Fund.
- Sumber backend: `backend/Code.gs`. Sumber dashboard yang diterbitkan: commit `246cced` di `portalkimia/invitation`. Fungsi otorisasi sementara telah dihapus dari sumber Apps Script setelah izin diberikan.
- Keluar dari Wedding Fund menghapus sesi admin undangan yang tersimpan di browser yang sama. Sesi admin yang sudah disalin ke perangkat lain tetap mengikuti batas masa berlaku dan aturan validasi backend undangan.

## Font inisial yang lebih jelas — 18 Oktober 2026

- Keterangan di bawah monogram memakai Plus Jakarta Sans 18 px, bobot 700, jarak huruf 0,12 em, dan jarak kata 0,3 em. Bagian kutipan mendapat ruang tambahan di bawah logo.
- Versi stylesheet `20261018-monogram-readable`; commit `f5b1614b5ba72c1a50587349aeee4eccc03aa148`.
- GitHub Pages run https://github.com/portalkimia/invitation/actions/runs/39097235522 berhasil. Cover publik sudah ditinjau dan memperlihatkan T & V dengan font tebal serta jarak lebih renggang.

## Tulisan inisial yang terbaca — 18 Oktober 2026

- Monogram kini memiliki keterangan inisial terpisah, misalnya `T & A`, dengan huruf serif tegak 16 px di bawah logo pada cover, desktop, dan kutipan.
- Keterangan mengikuti inisial dari nama panggilan yang sama dengan logo. Versi aset `20261018-monogram-label`.
- Commit tampilan: `21fe1038f9e986681bcf787c4174728dcebe6b7c`. GitHub Pages: https://github.com/portalkimia/invitation/actions/runs/39097063142.

## Monogram bertaut — 18 Oktober 2026

- Logo inisial berupa SVG dengan huruf kaligrafi bertumpuk, bingkai oval tipis, dan garis hias. Mengikuti inisial nama panggilan pada pengaturan.
- Dipakai bersama pada cover, panel desktop, dan bagian kutipan. Aset halaman memakai versi `20261018-monogram`.
- Berkas: `assets/js/story-layout.js`, `invitation-story.css`, dan `index.html`. Sudah terbit pada commit `3380b9c03d0975c8910ae564631d2ddc22c7a13d`.
- GitHub Pages run https://github.com/portalkimia/invitation/actions/runs/39089008801 berhasil. Cover publik ditinjau secara visual; logo T dan A muncul dengan bingkai oval pada cover dan panel desktop.
- Gambar hasil: `C:\Users\Tito\Desktop\wedding-app-backup-garden-theme\monogram-published.png`.

## Tanggal akad dan resepsi — 18 Oktober 2026

- Dashboard menyediakan pilihan tanggal terpisah `AKAD_DATE` dan `RESEPSI_DATE` dalam format ISO YYYY-MM-DD. Kolom kosong mengikuti teks tanggal utama pada kartu undangan.
- Setiap kartu menampilkan tanggal di atas jam. Kalender resepsi mengikuti `RESEPSI_DATE`, lalu tanggal hitung mundur jika belum diisi.
- Template WhatsApp mendukung `{akad_tanggal}` dan `{resepsi_tanggal}`; `{tanggal}` memakai tanggal resepsi jika diisi.
- Pemuatan, penyimpanan, draf, backup, dan pratinjau memakai pengumpul pengaturan yang sama. Backend aktif menerima kunci Settings tambahan tanpa deployment backend.
- API dan modul kalender memakai versi `20261018-event-dates`.
- Commit halaman: `34b64b4d6c82f92b9e4fcf5f5b58e9375f0f29cd`; GitHub Pages https://github.com/portalkimia/invitation/actions/runs/39086040612.

## Kartu acara — 18 Oktober 2026

- Kartu akad dan resepsi mengikuti tinggi konten; batas minimum 340 px dihapus dan footer mengikuti isi dengan jarak 20 px.
- Jarak antarkartu 24 px, padding 52/24/24 px, dan tombol peta memiliki tinggi minimum 44 px.
- Stylesheet memakai versi `20261018-event-spacing`. Commit frontend: `3f9e18edbfd76538523fe11561ace8d60de2746c`.
- GitHub Pages: https://github.com/portalkimia/invitation/actions/runs/39085743944.

Terverifikasi pada 17 Oktober 2026, zona waktu Asia/Jakarta.

## Operasional v3

- Backend aktif: Apps Script **versi deployment 9**, API **3**, diterapkan 17 Oktober 2026 pukul 22.39 WIB pada URL yang sama. Tidak ada perubahan pemilik atau cakupan akses deployment.
- Modul awal: `aad4f33df87dceeff259713715b7eafa854ecfec`; halaman awal: `14b4ce64830963ff2d0fc48cf4dce887cc02d66d`; perapian draf/pratinjau: `c353830aba3ae94b5c7cb6cffe93e4677be627ba`.
- Aset halaman akhir memakai versi URL `20261017-ops3-final`.
- Commit halaman akhir: `1a62b8da88f5335f70e5f4e6edaa420d06369411`. GitHub Pages run `39046120712` berhasil (build dan deploy): https://github.com/portalkimia/invitation/actions/runs/39046120712.
- Fitur: upload/potong/kompres gambar, draf lokal/server dan backup JSON, sakelar bagian, kartu QR, tautan bertoken, identitas petugas, check-in cepat, pemilihan lensa, walk-in eksplisit, simulasi terpisah, panel hari acara, perkiraan kapasitas, bentuk foto dan kebijakan kuota/jadwal kamera.
- Pengaturan acara yang sedang aktif tidak diganti. Kuota tetap 18 jika belum diatur; jadwal kamera kosong berarti tersedia setelah check-in. Akses tautan kode lama tetap aktif sampai admin menonaktifkannya setelah membagikan ulang tautan baru.
- Skema menambah Guests kolom P `checkedInBy`. Draf server memakai sheet `DesignDraft`; gambar desain memakai subfolder `WeddingDesign`. Keduanya dibuat saat fitur terkait pertama digunakan.
- Antrean browser di panel hanya mencakup perangkat ini. Foto moderasi dihitung dari maksimal 500 foto terbaru. Kalkulator penyimpanan adalah perkiraan; tidak menjalankan uji beban.
- Sumber seluruh skrip telah diperiksa sintaksnya. Halaman dashboard, simulasi, dan kontrol kamera ditinjau melalui browser; panel hari acara berhasil membaca backend API 3. Tidak ada RSVP, check-in, pengiriman WhatsApp, atau upload foto produksi yang dibuat untuk peninjauan ini. Lensa fisik Samsung S25 FE dan alur operasi penuh di venue tetap perlu dicoba pada perangkat sebenarnya.
- Backup sumber sebelum perubahan berada di `C:\Users\Tito\Desktop\wedding-app-backup-full-improvements\source`.

Bagian di bawah menyimpan riwayat deployment dan pemeriksaan sebelumnya.

- Situs: https://portalkimia.github.io/invitation/index.html
- Admin: https://portalkimia.github.io/invitation/dashboard.html
- Resepsi: https://portalkimia.github.io/invitation/reception.html
- Kamera: https://portalkimia.github.io/invitation/pocket-cam.html
- Repositori: https://github.com/portalkimia/invitation
- Commit halaman dan stylesheet desain: `ffc688333ff72d2170ddf15e38fb363470469c43`
- Commit aset studio desain: `257e4fd7e1fa8d9d40eaa3e60462bfc67b9ab16b`
- GitHub Pages desain: https://github.com/portalkimia/invitation/actions/runs/38982963608
- Halaman publik sudah menampilkan layout story dan panel desktop pada 17 Oktober 2026.
- Perbaikan galeri terakhir: `516d2a70a77686184a9fd5b0e1ba84188df165e1`; foto terakhir yang tidak berpasangan memenuhi dua kolom. Run: https://github.com/portalkimia/invitation/actions/runs/39003932048.

## Studio desain

### Mode uji coba kamera

- Perbaikan layar/lensa: area bidik memakai ruang layar HP; pilihan lensa manual dan preferensi lokal per depan/belakang; prioritas otomatis hanya untuk label lensa utama yang dikenali. Zoom memakai kemampuan track jika tersedia. Hasil foto mengikuti potongan area pratinjau. Dukungan lensa S25 FE perlu dicoba pada perangkat karena label/akses lensa mengikuti Chrome dan OS.

- `index.html?unlock=true` menampilkan tautan kamera demo, dan `pocket-cam.html?unlock=true` membukanya langsung. `demo=true` juga didukung.
- Demo memakai identitas lokal DEMO dan kunci IndexedDB `demo_camera_v1`, bukan sesi tamu atau antrean upload tamu. Hanya permintaan baca pengaturan/ping yang diizinkan dari halaman demo.
- Kamera dimulai setelah tombol **Aktifkan kamera demo** ditekan. Mendukung 18 foto lokal, watermark DEMO, unduhan, dan reset roll dengan konfirmasi.
- Backend, persyaratan check-in, dan kuota kamera tamu tidak berubah.
- Backup sebelum perubahan: `C:\Users\Tito\Desktop\wedding-app-backup-camera-demo`.

### Jarak isi RSVP

- Form RSVP memakai padding responsif 18–24 px, sudut 24 px, garis tepi dan bayangan lembut. Lapisan putih tetap semi transparan di atas background bagian RSVP.
- URL stylesheet `invitation-story.css?v=20261017-rsvp-spacing` memuat aturan terbaru.

### QR dan galeri tambahan

- Halaman umum menjelaskan bahwa QR check-in tersedia melalui tautan tamu pribadi. Formulir kode memeriksa `getGuest` sebelum membuka undangan pribadi; kegagalan pembuat QR menampilkan pesan dan kode tamu tetap terlihat.
- Editor galeri mendukung hingga 50 foto, tambah/hapus/urutkan, dan pratinjau gambar. Daftar baru memakai `GALLERY_JSON` dengan batas 45.000 karakter; lima foto awal tetap disalin ke kolom lama. Data lama dibaca tanpa perlu migrasi atau penulisan otomatis.
- Versi URL aset editor: `20261017-gallery50` agar browser memuat skrip baru.
- Commit halaman QR: `0a8174229f1fcec60bf9395f41f3ce0ecd1397a6`. Run: https://github.com/portalkimia/invitation/actions/runs/39004444879.
- Backup: `C:\Users\Tito\Desktop\wedding-app-backup-qr-gallery`.

- Dashboard → Pengaturan Acara → Studio Desain Undangan.
- Background per bagian, warna, ornamen PNG, foto hero tambahan, bingkai profil, foto penutup, posisi foto, serta animasi disimpan dalam `DESIGN_JSON`.
- Foto utama, profil, cerita, dan galeri memakai kolom yang sudah ada. Foto utama kosong memakai galeri pertama sebagai pembuka.
- Pratinjau desain di iframe tidak menyimpan pengaturan atau mengizinkan pengiriman RSVP/perubahan data tamu.
- Perubahan ini hanya memerlukan frontend; backend versi 7 tetap digunakan.
- Backup sebelum perubahan: `C:\Users\Tito\Desktop\wedding-app-backup-before-story-layout`.

## Backend

- Project Apps Script: `1WLghP8nsjZew7RMg9MY3yAtAttZMLt0aas_9gvMX1_-g8JUBkhORDO5K`
- Riwayat sebelum operasional v3: versi deployment Apps Script **7**, API aplikasi versi **2**. Versi aktif terkini tercantum pada bagian Operasional v3 di atas.
- URL tetap: https://script.google.com/macros/s/AKfycbyu6oRsL1CbppQHf-v2EPoJcjaivYKtdQDHyju0HO5TyODo1GPuPYTg0Ts4dwLvCGX_-A/exec
- Snapshot rollback sebelumnya: Apps Script versi **6**; commit situs sebelumnya `940f9a11417f2697cee821a32b5f6ea3a43769e5`.
- Database: https://docs.google.com/spreadsheets/d/1IxRvNP3_4cI55agx-oPnUMxeDLTzRXJ8oXTVBT1naSY/edit

Kolom tambahan Guests L:O dan PocketLogs F:I sudah terpasang. Nomor kolom data lama dipertahankan. Tidak ada pengiriman WhatsApp, RSVP, check-in tamu, atau upload foto produksi yang dibuat untuk verifikasi deployment.

## Hasil pemeriksaan

- Dua belas berkas frontend di repositori cocok dengan sumber lokal setelah normalisasi akhir baris.
- Endpoint ping merespons API versi 2.
- Pengaturan publik tidak mengandung field PIN, token, atau secret.
- Permintaan daftar tamu tanpa sesi ditolak dengan `authRequired: true`.
- Undangan memuat pengaturan acara dari backend dan menampilkan unduhan kalender .ics serta album bersama.
- Halaman dashboard dan resepsi menampilkan permintaan login.
- Tidak ada galat JavaScript yang tercatat pada ketiga halaman selama pemeriksaan langsung.

Uji alur check-in offline, pengiriman ulang foto, moderasi album, edit tamu, CSV, dan kalender sudah dijalankan sebelumnya dengan backend simulasi. Pengujian backend lokal tersedia melalui `node tools/verify-backend.cjs`.
