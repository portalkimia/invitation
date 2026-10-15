# 💍 Zero-Cost Wedding Web App (GitHub Pages + Google Apps Script + Google Drive)

A zero-cost, static wedding web application ready for GitHub Pages hosting, powered by a single unified Google Apps Script (`Code.gs`), Google Sheets (`Guests` & `PocketLogs` tabs), and Google Drive storage.

---

## 🌟 Fitur Utama

1. **Undangan Digital Utama (`index.html`)**:
   - Halaman utama ketika tamu membuka alamat website (`https://portalkimia.github.io/invitation/` atau `?code=G001&to=Nama%20Tamu`).
   - Tampilan mobile-first responsif, elegan & bernuansa pernikahan (cream/gold/vintage floral).
   - **Check-in Digital Pass**: Barcode/QR Code unik per tamu (`qrcodejs`) yang dapat langsung disimpan/diunduh tamu untuk discan di meja resepsi.
   - **Hitung Mundur Dinamis**: Countdown waktu acara yang tersinkronisasi otomatis dari database Google Sheets / `config.js`.
   - **Konfirmasi Kehadiran (RSVP)**: Status kehadiran, jumlah tamu (pax), dan ucapan/doa restu yang tersinkronisasi langsung ke Google Sheets.
   - **Amplop Digital**: Salin nomor rekening/e-wallet 1-klik dengan konfirmasi toast.
   - **Music Player Otomatis**: Memutar background music pernikahan secara otomatis atau via floating play/pause button.
   - **Redirect Alias (`invitation.html`)**: Memastikan tautan lama yang menyertakan `invitation.html` otomatis diteruskan ke `index.html` dengan parameter query utuh.

2. **18-Shot Retro Pocket Camera (`pocket-cam.html`) - Smart Attendance Lock**:
   - Kamera sekali pakai vintage retro 35mm (desain disposable camera klasik).
   - **Smart Dynamic Lock (Opsi A)**: Tamu belum bisa mengambil foto sebelum hadir di acara resepsi (mencegah kuota habis terpakai sebelum hari H). Kunci otomatis terbuka setelah usher melakukan check-in di meja resepsi.
   - Membatasi kuota maksimal 18 jepretan foto per tamu dengan auto-rollback kuota jika terjadi gangguan sinyal/koneksi saat upload.
   - Mengunggah foto ke Google Drive sebagai `[Nama_Tamu]_Moment_[01..18].jpg` dan mencatat riwayat di tab `PocketLogs`.
   - Menampilkan rol film galeri foto sesi tersebut (`renderReel`).

3. **Meja Resepsi Usher Scanner (`reception.html`)**:
   - Akses via link terdedikasi dan dilindungi PIN keamanan resepsi (`5678`), tersimpan aman di browser dengan auto re-verifikasi jika PIN diganti di database.
   - **Barcode / QR Scanner**: Pemindaian kamera langsung via `html5-qrcode` (dengan tombol ganti kamera depan/belakang) + pencarian kode manual.
   - **Check-in Otomatis Tamu Walk-in**: Mendukung pengeditan nama tamu langsung di layar; jika tamu belum terdaftar di database, sistem langsung otomatis mendaftarkannya ke sheet `Guests`.
   - **WebRTC Check-in Camera**: Mengambil foto kedatangan tamu (dengan tombol pembalik kamera) dan upload non-blocking ke Google Drive.
   - **QR Pocket Camera**: Menampilkan QR Code instan berparameter unlock untuk di-scan oleh tamu begitu check-in berhasil.

4. **Admin Dashboard & WhatsApp Sender (`dashboard.html`)**:
   - Akses via link terdedikasi dan dilindungi PIN keamanan admin (`1234`), tersimpan aman di browser dengan auto re-verifikasi jika PIN diganti di database.
   - Ringkasan live statistik: Total Tamu, Undangan Terkirim, Tamu Hadir, Pax RSVP, dan Foto Drive.
   - **Tab Pengaturan Acara**: Form lengkap untuk mengubah nama pengantin, tanggal akad & resepsi, nomor rekening amplop digital, hingga PIN admin/resepsi tanpa perlu mengedit kode HTML/JS. Data tersimpan ke tab `Settings` di Google Sheets.
   - **Import Tamu Massal**: Input teks/CSV fleksibel dengan auto-generate kode tamu `G001..G999`.
   - **1-Click WhatsApp Sender**: Generator pesan undangan personal dengan template dinamis dan pelacakan status pengiriman di Google Sheets.

---

## 📁 Struktur Berkas

```
wedding-app/
├── assets/
│   ├── images/             # Folder foto cover, pengantin, dan background
│   ├── audio/              # Folder lagu pernikahan (.mp3)
│   ├── js/
│   │   ├── config.js       # Konfigurasi acara, PIN, rekening, template WA, dan GAS URL
│   │   └── api.js          # CORS fetch, normalisasi HP, kompresi canvas, audio Web API, PIN auth
│   └── css/                # Custom CSS styling
├── backend/
│   └── Code.gs             # Unified Google Apps Script (Setup DB, LockService, DriveApp, Settings)
├── index.html              # Undangan Digital Utama Tamu (Ticket QR, Countdown, RSVP, Amplop Digital)
├── invitation.html         # Redirect Helper (Mengalihkan link lama invitation.html ke index.html)
├── pocket-cam.html         # 18-Shot Retro Pocket Camera dengan Smart Attendance Lock (Opsi A)
├── reception.html          # Meja Resepsi Usher Scanner & Walk-in Check-in Foto
├── dashboard.html          # Admin Portal, Pengaturan Acara Dinamis, & 1-Click WhatsApp Sender
└── README.md
```

---

## 🚀 Panduan Setup & Deployment (100% Gratis)

### Langkah 1: Siapkan Google Drive & Google Sheets
1. Buka [Google Drive](https://drive.google.com).
2. Buat 1 Google Spreadsheet baru, beri nama misalnya: `Database Undangan Romeo Juliet`.
3. Buat 2 Folder baru di Google Drive Anda:
   - Folder 1: `Foto Check-in Tamu` (Salin Folder ID dari URL di browser)
   - Folder 2: `Foto Pocket Cam Tamu` (Salin Folder ID dari URL di browser)

### Langkah 2: Pasang Google Apps Script
1. Di Google Spreadsheet Anda, klik menu **Extensions (Ekstensi)** > **Apps Script**.
2. Hapus seluruh isi default, lalu salin dan tempel kode dari berkas [`backend/Code.gs`](file:///C:/Users/Tito/.gemini/antigravity/scratch/wedding-app/backend/Code.gs).
3. Di bagian atas `backend/Code.gs`, isi `CONFIG`:
   ```javascript
   const CONFIG = {
     CHECKIN_FOLDER_ID: 'ID_FOLDER_CHECKIN_ANDA',
     POCKET_FOLDER_ID: 'ID_FOLDER_POCKET_ANDA',
     SPREADSHEET_ID: '' // Kosongkan jika script dibuat dari Extensions Spreadsheet
   };
   ```
4. Klik tombol **Deploy (Terapkan)** > **New deployment (Penerapan baru)**.
   - Pilih jenis: **Web app (Aplikasi Web)**.
   - Execute as: **Me (Saya)**.
   - Who has access: **Anyone (Siapa saja)**.
5. Klik **Deploy**, beri izin otorisasi Google, lalu salin **Web app URL** (berakhiran `/exec`).

### Langkah 3: Konfigurasi Frontend
1. Buka berkas [`assets/js/config.js`](file:///C:/Users/Tito/Desktop/wedding-app/assets/js/config.js).
2. URL Web App Apps Script dan GitHub Pages Anda sudah terpasang:
   ```javascript
   GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyu6oRsL1CbppQHf-v2EPoJcjaivYKtdQDHyju0HO5TyODo1GPuPYTg0Ts4dwLvCGX_-A/exec',
   BASE_INVITE_URL: 'https://portalkimia.github.io/invitation/index.html',
   ```
3. Sesuaikan nama kedua mempelai, tanggal acara, rekening bank, alamat kado jika diperlukan.

### Langkah 4: Publikasikan ke GitHub Pages
1. Push atau upload seluruh berkas dari folder `C:\Users\Tito\Desktop\wedding-app` ke repositori GitHub `portalkimia/invitation`.
2. Di repositori GitHub Anda, buka **Settings** > **Pages**.
3. Di bagian **Build and deployment** > **Source**, pilih `Deploy from a branch` (`main` / `/(root)`).
4. Klik **Save**. Undangan Anda dapat diakses di:
   `https://portalkimia.github.io/invitation/index.html`

---

## 🎨 Panduan Kustomisasi Foto, Background & Lagu

Semua pengaturan media dapat diatur langsung di berkas [`assets/js/config.js`](file:///C:/Users/Tito/Desktop/wedding-app/assets/js/config.js):

### 1. Memasukkan Foto (Cover & Profil Pengantin)
- Siapkan foto berformat `.jpg`, `.jpeg`, atau `.png` (rekomendasi rasio 1:1 persegi atau kompresi ringan).
- Masukkan file foto ke folder: `assets/images/`
  - Contoh: `assets/images/cover.jpg` (Foto prewedding sampul cover)
  - Contoh: `assets/images/groom.jpg` (Foto mempelai pria)
  - Contoh: `assets/images/bride.jpg` (Foto mempelai wanita)
- Buka `assets/js/config.js`, lalu isi jalurnya pada objek `couple`:
  ```javascript
  couple: {
    coverPhoto: 'assets/images/cover.jpg',
    groom: {
      name: 'Romeo Montague',
      photo: 'assets/images/groom.jpg',
      ...
    },
    bride: {
      name: 'Juliet Capulet',
      photo: 'assets/images/bride.jpg',
      ...
    }
  }
  ```
  *(Anda juga bisa menggunakan link foto online langsung, misalnya link Google Drive publik atau Unsplash/Imgur).*

### 2. Memasukkan Background (Latar Belakang Undangan)
- Masukkan gambar background/motif tekstur ke folder `assets/images/bg.jpg`.
- Buka `assets/js/config.js` dan isi:
  ```javascript
  event: {
    ...
    backgroundImage: 'assets/images/bg.jpg',
  }
  ```

### 3. Memasukkan Lagu & Musik yang Otomatis Diputar
- **Autoplay Browser Modern**: Sesuai kebijakan browser modern (Google Chrome, Safari iOS, Samsung Internet, Edge), audio dilarang berputar otomatis dengan suara keras sebelum pengunjung melakukan interaksi pertama (*user gesture*).
- Oleh karena itu, aplikasi ini secara pintar memutar lagu tepat saat tamu mengklik tombol **"Buka Undangan"** di halaman sampul (*cover screen*). Begitu amplop terbuka, lagu otomatis mengalun dengan mulus tanpa terblokir oleh browser.
- **Cara Mengganti Lagu**:
  - Salin berkas musik `.mp3` ke folder `assets/audio/wedding-song.mp3` (atau gunakan link URL MP3 online langsung).
  - Buka `assets/js/config.js`, atur bagian `music`:
    ```javascript
    music: {
      audioUrl: 'assets/audio/wedding-song.mp3',
      title: 'Judul Lagu Pernikahan'
    }
    ```
  - Tamu juga dapat menjeda (*pause*) atau memutar kembali musik kapan saja melalui tombol melayang di pojok kanan bawah.

---

## 🔒 Sistem Keamanan PIN & Auto-Login

Aplikasi ini menggunakan sistem **Persistent Auto-Login dengan Validasi Database**:
1. **Auto-Login Cepat**: Begitu pengguna berhasil memasukkan PIN (baik di `dashboard.html` maupun `reception.html`), PIN akan tersimpan di browser sehingga di kemudian hari dapat langsung masuk tanpa harus mengetik PIN berulang kali.
2. **Keamanan Real-Time (Ubah PIN di Database)**:
   - Di Google Sheets, terdapat tab **`Settings`** dengan isi:
     - `ADMIN_PIN`: `1234` (PIN akses Dashboard)
     - `RECEPTION_PIN`: `5678` (PIN akses Meja Resepsi)
   - Jika Anda mengubah PIN di tab `Settings` Google Sheets tersebut (misalnya diubah menjadi `8888`), maka sesi perangkat yang menyimpan PIN lama otomatis ditolak/dihapus, dan pengguna akan diminta memasukkan PIN yang baru.
