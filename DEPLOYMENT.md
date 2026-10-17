# Deployment aktif

Terverifikasi pada 17 Oktober 2026, zona waktu Asia/Jakarta.

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
- Versi deployment Apps Script: **7**, API aplikasi versi **2**.
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
