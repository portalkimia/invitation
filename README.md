# Wedding App

## Optimasi unggahan kamera (19 Oktober 2026)

Antrean kamera mengikuti waktu tunggu server dan mempertahankan jadwal retry setelah pemuatan ulang. Backend mengurangi pekerjaan di dalam lock dan memulihkan file yang sudah masuk Drive tanpa duplikasi. PocketLogs menambah kolom J attemptToken; jangan gunakan kolom ini untuk data lain. Uji nyata 50 klien berhasil menyimpan 150/150 foto, tetapi unggahan tetap dapat mengantre. Lihat CAMERA-LOAD-TEST.md untuk angka, bukti, dan batas hasil.

## Peningkatan operasional v3 (17 Oktober 2026)

- **Desain:** tombol Upload / potong foto pada kolom gambar, pratinjau potongan asli/4:5/1:1/16:9, zoom dan geser titik fokus, kompres maksimal 1600 px. PNG mempertahankan transparansi. Gambar diunggah melalui sesi admin ke subfolder `WeddingDesign` pada folder foto yang sudah dikonfigurasi. Upload memasukkan URL ke draf; penerbitan tetap terpisah.
- **Draf:** otomatis tersimpan di browser tanpa PIN. Draf server disimpan terpisah pada sheet `DesignDraft`; muat draf dan pratinjau sebelum **Terbitkan Pengaturan**. Backup JSON pengaturan terbit dapat diunduh dan dipulihkan ke draf. Backup tidak memuat PIN, token sesi, daftar tamu, atau foto. Daftar tamu tetap diekspor lewat CSV.
- **Bagian undangan:** sakelar kutipan, cerita, galeri, RSVP/ucapan, hadiah, album tamu, dan kamera pada Studio Desain.
- **Resepsi:** isi nama petugas dan meja/pintu, lalu buka scanner. Identitas dicatat pada Guests kolom P (`checkedInBy`); memakai sesi petugas yang ada, bukan akun/password terpisah. Mode cepat melewati kamera foto dan tetap meminta konfirmasi jumlah orang. Lensa scanner dan foto dapat dipilih setelah izin kamera. Kode tidak terdaftar ditolak; **Tambah tamu walk-in** membuat kode baru secara sengaja.
- **QR:** tautan personal baru dan QR memakai token HMAC yang tidak dapat diturunkan dari kode berurutan. Kode tetap tersedia untuk pencarian petugas. **LEGACY_GUEST_ACCESS** awalnya tetap aktif agar undangan yang sudah dikirim tidak terputus. Setelah membagikan ulang tautan dari dashboard terbaru, nonaktifkan akses kode dan terbitkan. Token salah selalu ditolak, sekalipun akses lama masih aktif. Token tidak ditambahkan ke pengaturan publik; tersedia bagi petugas/admin terautentikasi dan tautan tamu yang bersangkutan.
- **Kartu undangan:** tamu dapat menyimpan gambar berisi nama, jadwal, lokasi, dan QR; tombol **QR saya** tersedia setelah undangan pribadi dibuka.
- **Kamera:** pilih potongan mengikuti layar, tegak 4:5, atau persegi. Indikator memisahkan foto di HP, menunggu unggah, sudah diunggah, dan perlu tindakan. Peringatan tampil pada tiga foto terakhir. Kuota 1–100 foto **per undangan**, jadwal mulai/tutup diatur pada Penerbitan & operasional. Jadwal kosong berarti tanpa batas tanggal setelah check-in. Jadwal tutup juga membatasi unggahan baru; unduh salinan HP jika belum sempat tersinkron. Upload yang telah dicatat server memakai ID yang sama ketika dicoba ulang.
- **Hari acara:** panel jumlah undangan/orang hadir, daftar RSVP hadir yang belum datang, kedatangan terakhir beserta petugas, foto menunggu moderasi (500 terbaru), antrean server, koneksi dan waktu respons. Antrean browser hanya dapat dilihat pada perangkat tersebut; antrean offline perangkat lain belum diketahui server.
- **Simulasi:** buka `reception.html?simulation=true`. Tamu `SIM001`–`SIM003`, walk-in, antrean, dan pencatatan disimpan dalam ruang lokal tersendiri. Seluruh panggilan API diganti dengan simulasi; tidak membuat kehadiran atau upload produksi. Scanner opsional diaktifkan lewat tombol, dan QR kamera mengarah ke mode demo. Reset hanya membersihkan data simulasi.
- **Kesiapan:** checklist hari acara serta kalkulator jumlah maksimum foto dan kebutuhan penyimpanan. Ini perkiraan, bukan hasil uji beban atau jaminan kapasitas Apps Script. Ukuran foto, jumlah tamu, jaringan venue, dan kuota akun perlu diperiksa untuk acara yang sebenarnya.

Frontend dan backend v3 harus diterbitkan bersama. Backend memperluas Guests ke kolom P saat dibaca; kolom sebelumnya tetap di posisi yang sama. Pengaturan kuota/jadwal dan akses lama mengikuti nilai aktif atau default yang dijelaskan di atas.

Undangan digital dengan pengelolaan tamu, meja resepsi, Pocket Camera, dan album bersama. Frontend HTML/JavaScript, backend Google Apps Script, database Google Sheets, dan penyimpanan foto Google Drive.

## Alur penggunaan

1. Admin membuka dashboard.html, mengatur acara, memasukkan daftar tamu, dan membagikan tautan pribadi melalui WhatsApp.
2. Tamu membuka index.html?code=G001&to=Nama, membaca undangan, mengisi RSVP, menyimpan QR, dan menambahkan jadwal resepsi ke kalender.
3. Petugas membuka reception.html, memindai QR atau memilih kode/nama dari daftar, lalu mengisi jumlah orang yang benar-benar datang. Foto kedatangan opsional.
4. Tamu yang sudah check-in membuka pocket-cam.html dari tautan atau QR resepsi dan menggunakan kuota 18 foto.
5. Admin memilih foto melalui tombol Kelola album tamu. Foto yang disetujui muncul pada bagian Momen dari Tamu di undangan.

## Fitur

- Undangan responsif: profil mempelai, jadwal, lokasi, kisah cinta, galeri, musik, RSVP, ucapan, amplop digital, dan alamat hadiah.
- Kalender Google dan unduhan .ics mengikuti tanggal/jam resepsi dengan pengenalan WIB/WITA/WIT. Jika rentang jam tidak tersedia, digunakan waktu countdown dan durasi tiga jam.
- Daftar tamu: impor CSV/teks, normalisasi nomor Indonesia, pemeriksaan kode/nomor duplikat, edit nama/nomor/kelompok, filter kelompok, dan ekspor semua tamu ke CSV.
- Status WhatsApp: belum dibuka, WhatsApp dibuka, dan terkirim dikonfirmasi admin. Membuka WhatsApp tidak otomatis mengirim pesan. Status terkirim dapat dibatalkan.
- Jumlah undangan check-in, orang menurut RSVP, dan orang yang benar-benar datang dicatat terpisah. Admin dapat memperbaiki jumlah aktual melalui edit tamu.
- Pemindaian QR berulang tidak menimpa jumlah orang maupun waktu check-in pertama. Percobaan ulang memakai ID permintaan yang sama.
- Meja resepsi menyimpan check-in dan foto dalam antrean IndexedDB. Kehadiran disinkronkan terlebih dahulu; foto diproses terpisah. Panel menampilkan antrean dan kegagalan sinkronisasi.
- Pocket Camera memeriksa kuota dan kehadiran di server. Foto/antrean disimpan di IndexedDB, upload diulang dengan ID foto yang sama, dan setiap foto dapat diunduh ke HP.
- Uji coba kamera: buka `pocket-cam.html?unlock=true` atau `index.html?unlock=true` lalu pilih **Coba Pocket Camera**. `demo=true` juga didukung. Klik **Aktifkan kamera demo** dan izinkan kamera. Roll demo 18 foto disimpan terpisah di perangkat, dapat diunduh dan direset, tanpa upload, perubahan kehadiran, atau kuota tamu. Foto diberi watermark DEMO. Mode normal tetap memerlukan check-in yang terverifikasi.
- Area bidik Pocket Camera mengikuti ruang layar HP. Foto dipotong sesuai area yang terlihat pada pratinjau. Menu **Pilih kamera** menampilkan kamera/lensa yang dibagikan browser setelah izin diberikan. Kamera belakang utama diprioritaskan jika nama lensanya dapat dikenali; pilihan manual diingat pada perangkat. Nama/nomor kamera generik tidak dianggap pasti sebagai lensa utama. Kontrol zoom tampil jika didukung kamera/browser.
- Album bersama: foto baru menunggu persetujuan. Admin dapat menayangkan atau menyembunyikan foto. Album menampilkan hingga 500 foto terbaru sesuai status.

## Memasang atau memperbarui deployment

Frontend dan backend versi ini perlu dipasang bersama. Perubahan di Desktop belum memperbarui situs yang sudah terbit.

1. Siapkan Google Spreadsheet dan dua folder Drive: foto kedatangan dan foto Pocket Camera.
2. Buka Apps Script dari Spreadsheet, lalu gunakan seluruh isi backend/Kode.js. Backend tetap berada dalam satu berkas.
3. Isi CONFIG.CHECKIN_FOLDER_ID dan CONFIG.POCKET_FOLDER_ID. Untuk script yang terikat ke Spreadsheet, SPREADSHEET_ID boleh kosong.
4. Jalankan setupDatabase dari editor Apps Script untuk menyiapkan/merapikan tab. Fungsi ini juga tersedia melalui menu Spreadsheet dan tombol dashboard setelah login.
5. Buat/perbarui deployment Web app, dijalankan sebagai pemilik, dengan akses Anyone. Untuk deployment lama: Manage deployments → Edit → New version → Deploy agar URL /exec tetap sama.
6. Isi GAS_WEB_APP_URL di assets/js/config.js. Publikasikan halaman HTML dan seluruh folder assets ke hosting, misalnya GitHub Pages.
7. Masuk ke dashboard dan atur informasi acara serta PIN. PIN awal backend: admin 1234 dan resepsi 5678. PIN aktif selanjutnya berada di tab Settings.

Kolom tambahan berada di sebelah kanan data lama:

| Tab | Kolom tambahan |
| --- | --- |
| Guests | L actualPax, M checkInRequestId, N waOpenedAt, O group |
| PocketLogs | F requestId, G moderation, H uploadStatus, I leaseUntil, J attemptToken |

Jangan menggeser kolom lama atau memakai kolom tambahan untuk data lain. Check-in lama tanpa jumlah aktual ditampilkan sebagai jumlah belum tercatat. Angka RSVP tidak otomatis dianggap sebagai jumlah orang hadir. Foto lama menunggu persetujuan sebelum ditampilkan. Status WhatsApp lama dipertahankan dan dapat dikoreksi melalui pembatalan status.

## Login dan akses

- PIN diperiksa backend. Browser menyimpan token sesi bertanda tangan selama 12 jam; PIN tidak disimpan sebagai sesi browser atau dikirim dalam pengaturan publik.
- Pengaturan, impor/edit tamu, konfirmasi WhatsApp, dan moderasi album memerlukan sesi admin. Check-in dan foto kedatangan memerlukan sesi admin/resepsi.
- Mengubah PIN membatalkan token lama untuk peran tersebut pada permintaan berikutnya. Dashboard yang mengubah PIN admin mendapat token pengganti.
- Kolom PIN kosong mempertahankan PIN. PIN baru terdiri atas 4–12 angka.
- Tautan/kode pribadi diperlukan untuk RSVP dan kamera. Halaman kamera umum menyediakan input kode tanpa memublikasikan daftar tamu dan nomor HP.

## Saat koneksi terputus

Masuk dan muat daftar tamu ketika masih tersambung. Selama halaman resepsi sudah terbuka, petugas dapat terus mencatat ketika jaringan terputus. Sesi resepsi yang masih berlaku dapat memakai daftar lokal; login baru tetap memerlukan koneksi.

Status Tercatat di perangkat berarti kehadiran belum tersimpan di server. QR kamera tersedia setelah check-in tersinkron. Antrean dicoba lagi saat jaringan pulih, secara berkala, atau lewat Sinkronkan sekarang. Login kembali jika sesi habis/PIN berubah; antrean tetap tersimpan.

Penyimpanan lokal terikat pada browser, profil, dan alamat situs. Jangan menghapus data browser ketika masih ada antrean. Membuka situs pertama kali tanpa koneksi belum didukung. Kamera memerlukan HTTPS/localhost dan izin kamera.

## Impor tamu

Contoh CSV:

```csv
Nama,No_HP,Kategori,Kelompok
Budi Santoso,081234567890,VIP,Teman kantor
"Ayu, dr.",081234567891,Reguler,Keluarga wanita
```

Tanpa judul kolom: Nama,Nomor_HP,Kategori,Kelompok. Kode dapat disertakan sebagai kolom pertama: G001,Nama,Nomor_HP,Kategori,Kelompok. Kategori: Reguler, VIP, VVIP, Keluarga; kelompok bebas. Tanda kutip CSV, titik koma, dan tab didukung. CSV hasil ekspor dapat diimpor lagi untuk data identitas; impor tidak menimpa RSVP atau kehadiran.

## Kustomisasi

Tab pengaturan dashboard mengubah acara, rekening, foto, cerita, galeri, musik, dan PIN. Konfigurasi dasar/URL backend berada di assets/js/config.js. Media lokal berada di assets/images/ dan assets/audio/, lalu dirujuk melalui path relatif atau URL media.

Musik mulai diputar setelah Buka Undangan ditekan. Akses foto dan kapasitas upload mengikuti izin Drive serta kuota akun Google.

## Pemeriksaan lokal

```powershell
node tools/verify-backend.cjs
```

Pemeriksaan memakai Sheets/Drive simulasi dalam memori. Tidak menghubungi backend aktif atau mengubah data acara. Mencakup akses per peran, kolom lama/baru, impor duplikat, RSVP/kehadiran, check-in berulang, upload yang diulang, kuota kamera, album, dan perubahan PIN.
# Studio Desain Undangan

Di **Dashboard → Pengaturan Acara → Studio Desain Undangan**, atur warna, background per bagian, dua foto pembuka tambahan, ornamen atas/bawah, ornamen depan hero, bingkai profil PNG transparan, foto penutup, posisi foto, dan animasi.

Foto Sampul / Prewedding menjadi foto utama layar penuh. Foto profil dan tiga cerita memakai kolom foto masing-masing. Di bagian **Galeri Foto Pre-Wedding**, gunakan **+ Tambah foto galeri**, isi URL, judul, dan kategori, lalu atur urutan atau hapus foto sesuai kebutuhan. Galeri mendukung hingga 50 foto; daftar disimpan sebagai `GALLERY_JSON` dan lima foto awal tetap disalin ke kolom lama untuk kompatibilitas. Total JSON dibatasi 45.000 karakter agar muat dalam satu sel Settings. Jika foto utama kosong, foto galeri pertama menjadi pembuka. Background bagian yang kosong mengikuti background utama. PNG transparan dipakai sebagai lapisan di atas background/foto.

QR check-in muncul pada tautan pribadi yang berisi kode tamu, misalnya `index.html?code=KODE_TAMU&to=NAMA_TAMU`, yang disalin atau dibagikan dari daftar tamu dashboard. Undangan umum menampilkan penjelasan serta formulir untuk memasukkan kode yang sudah diterima; kode diperiksa sebelum undangan pribadi dibuka. Jika pembuat QR gagal dimuat, kode tamu tetap dapat ditunjukkan kepada petugas.

Tempel URL gambar langsung atau link Google Drive dengan akses lihat publik. Tidak ada foto atau ilustrasi yang disalin dari situs referensi. Warna krem dan bingkai sederhana menjadi tampilan awal sampai desain sendiri diisi.

**Pratinjau desain** membuka undangan ponsel di dashboard tanpa menyimpan perubahan. Tombol **Simpan Semua Pengaturan** menerbitkan desain. Data desain disimpan sebagai `DESIGN_JSON` di Settings melalui sesi admin yang sudah tersedia; backend tidak memerlukan deployment baru. Pratinjau memblokir pengiriman RSVP dan perubahan data tamu.

Susunan undangan mengikuti alur cover, hero, kutipan, profil berselang, scrapbook cerita, hitung mundur, acara, galeri, fitur tamu, dan penutup. Animasi mendukung preferensi pengurangan gerakan pada perangkat.

