# Wedding App

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
- Album bersama: foto baru menunggu persetujuan. Admin dapat menayangkan atau menyembunyikan foto. Album menampilkan hingga 500 foto terbaru sesuai status.

## Memasang atau memperbarui deployment

Frontend dan backend versi ini perlu dipasang bersama. Perubahan di Desktop belum memperbarui situs yang sudah terbit.

1. Siapkan Google Spreadsheet dan dua folder Drive: foto kedatangan dan foto Pocket Camera.
2. Buka Apps Script dari Spreadsheet, lalu gunakan seluruh isi backend/Code.gs. Backend tetap berada dalam satu berkas.
3. Isi CONFIG.CHECKIN_FOLDER_ID dan CONFIG.POCKET_FOLDER_ID. Untuk script yang terikat ke Spreadsheet, SPREADSHEET_ID boleh kosong.
4. Jalankan setupDatabase dari editor Apps Script untuk menyiapkan/merapikan tab. Fungsi ini juga tersedia melalui menu Spreadsheet dan tombol dashboard setelah login.
5. Buat/perbarui deployment Web app, dijalankan sebagai pemilik, dengan akses Anyone. Untuk deployment lama: Manage deployments → Edit → New version → Deploy agar URL /exec tetap sama.
6. Isi GAS_WEB_APP_URL di assets/js/config.js. Publikasikan halaman HTML dan seluruh folder assets ke hosting, misalnya GitHub Pages.
7. Masuk ke dashboard dan atur informasi acara serta PIN. PIN awal backend: admin 1234 dan resepsi 5678. PIN aktif selanjutnya berada di tab Settings.

Kolom tambahan berada di sebelah kanan data lama:

| Tab | Kolom tambahan |
| --- | --- |
| Guests | L actualPax, M checkInRequestId, N waOpenedAt, O group |
| PocketLogs | F requestId, G moderation, H uploadStatus, I leaseUntil |

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

Foto Sampul / Prewedding menjadi foto utama layar penuh. Foto profil, tiga cerita, dan lima foto galeri memakai kolom foto masing-masing. Jika foto utama kosong, foto galeri pertama menjadi pembuka. Background bagian yang kosong mengikuti background utama. PNG transparan dipakai sebagai lapisan di atas background/foto.

Tempel URL gambar langsung atau link Google Drive dengan akses lihat publik. Tidak ada foto atau ilustrasi yang disalin dari situs referensi. Warna krem dan bingkai sederhana menjadi tampilan awal sampai desain sendiri diisi.

**Pratinjau desain** membuka undangan ponsel di dashboard tanpa menyimpan perubahan. Tombol **Simpan Semua Pengaturan** menerbitkan desain. Data desain disimpan sebagai `DESIGN_JSON` di Settings melalui sesi admin yang sudah tersedia; backend tidak memerlukan deployment baru. Pratinjau memblokir pengiriman RSVP dan perubahan data tamu.

Susunan undangan mengikuti alur cover, hero, kutipan, profil berselang, scrapbook cerita, hitung mundur, acara, galeri, fitur tamu, dan penutup. Animasi mendukung preferensi pengurangan gerakan pada perangkat.

