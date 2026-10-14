# 💍 Zero-Cost Wedding Web App (GitHub Pages + Google Apps Script + Google Drive)

A zero-cost, static wedding web application ready for GitHub Pages hosting, powered by a single unified Google Apps Script (`Code.gs`), Google Sheets (`Guests` & `PocketLogs` tabs), and Google Drive storage.

---

## 🌟 Fitur Utama

1. **Portal Utama & Hub Layanan (`index.html`)**:
   - Halaman utama ketika pengunjung membuka alamat dasar situs (`https://portalkimia.github.io/invitation/`).
   - Menyediakan navigasi lengkap ke: **Undangan Digital**, **Pocket Camera (18 Jepretan)**, **Meja Resepsi Usher**, dan **Admin Dashboard**.
   - Dilengkapi *Smart Auto-Redirect*: Jika tautan diakses dengan parameter kode tamu (misal `?code=G001&to=Nama`), sistem langsung otomatis mengarahkan tamu ke `invitation.html?code=G001&to=Nama` tanpa merusak tautan undangan lama.

2. **Digital Invitation (`invitation.html`)**:
   - Tampilan undangan mobile-first responsif, elegan & bernuansa pernikahan (cream/gold).
   - Membaca parameter tautan `?code=G001&to=Nama%20Tamu`.
   - **Check-in Digital Pass**: Barcode/QR unik per tamu (`qrcodejs`) yang dapat diunduh ke galeri ponsel tamu.
   - **Konfirmasi Kehadiran (RSVP)**: Status kehadiran, jumlah tamu (pax), dan ucapan/doa restu yang tersinkronisasi langsung ke Google Sheets.
   - **Amplop Digital**: Salin nomor rekening BCA/Mandiri 1-klik dengan notifikasi toast.
   - Menyimpan otomatis sesi tamu (`guestCode`) di `localStorage` untuk membuka Pocket Camera tanpa login ulang.

3. **Admin Dashboard & WhatsApp Sender (`dashboard.html`)**:
   - Dilindungi PIN keamanan (`ADMIN_PIN: '1234'`).
   - Kartu ringkasan live: Total Tamu, Undangan Terkirim, Tamu Hadir, Total Pax RSVP, & Foto Drive.
   - **Import Tamu Massal**: Input CSV atau teks fleksibel (`Nama, No_HP`) dengan auto-generate kode tamu `G001..G999`.
   - **Editor Template WhatsApp**: Variabel dinamis `{nama}`, `{link}`, `{kode}` dengan live preview.
   - **1-Click `wa.me` Launcher**: Membuka WhatsApp di tab tunggal terdedikasi (`window.open(url, 'wa_sender')`) dan secara instan menandai status `waSentAt` di Google Sheets.
   - Filter tab: *Semua*, *Belum Kirim WA*, *Sudah Kirim WA*, dan *Hadir*.
   - Tabel rekap kehadiran beserta tautan langsung ke foto check-in di Google Drive.

4. **Meja Resepsi Usher Scanner (`reception.html`)**:
   - Dilindungi PIN keamanan (`RECEPTION_PIN: '5678'`).
   - **Barcode / QR Scanner**: Pemindaian kamera langsung via `html5-qrcode` + fallback pencarian manual kode tamu.
   - **WebRTC Check-in Camera**: Mengambil foto kedatangan tamu, kompresi `<canvas>` JPEG (1280px, 0.75), dan mengunggah ke Google Drive sebagai `[Nama_Tamu]_[Code].jpg`.
   - **Pola Non-Blocking Drive**: Foto diunggah ke Google Drive sebelum mengunci Google Sheets via `LockService`, memastikan pemindaian di meja resepsi tetap instan tanpa jeda antrean.
   - **Modal Pocket Camera QR**: Menampilkan QR Code tautan `pocket-cam.html?code=[Code]` untuk di-scan oleh tamu saat tiba di meja resepsi.

5. **18-Shot Pocket Camera (`pocket-cam.html`)**:
   - Kamera sekali pakai vintage retro 35mm (desain disposable camera klasik).
   - Identifikasi tamu otomatis: URL `?code=`, `localStorage` (dari undangan), atau dropdown pencarian nama tamu (untuk scan QR akrilik meja).
   - Viewfinder WebRTC kamera depan/belakang, flash simulator, dan efek suara klik mekanis shutter (Web Audio API tanpa file audio eksternal).
   - Layar LCD sisa jepretan: Membatasi maksimal 18 foto per tamu.
   - Mengunggah foto ke Google Drive sebagai `[Nama_Tamu]_Moment_[01..18].jpg` dan mencatat riwayat di tab `PocketLogs`.
   - Layar kunci *FILM HABIS* saat mencapai batas 18 foto dengan fitur pratinjau roll foto.

---

## 📁 Struktur Berkas

```
wedding-app/
├── assets/
│   ├── images/             # Folder foto cover, pengantin, dan background
│   ├── audio/              # Folder lagu pernikahan (.mp3)
│   ├── js/
│   │   ├── config.js       # Konfigurasi acara, PIN, rekening, template WA, dan GAS URL
│   │   └── api.js          # CORS fetch, normalisasi HP (08xx -> 628xx), kompresi canvas, audio Web API
│   └── css/                # Custom CSS styling
├── backend/
│   └── Code.gs             # Unified Google Apps Script Web App (setupDatabase, LockService, DriveApp)
├── index.html              # Landing Page Portal Utama (Hub navigasi semua layanan)
├── invitation.html         # Undangan Digital Tamu (Ticket QR, RSVP, Amplop Digital)
├── dashboard.html          # Admin Portal & 1-Click WhatsApp Sender
├── reception.html          # Usher Check-in Barcode Scanner & Drive Photo Snap
├── pocket-cam.html         # 18-Shot Retro Disposable Pocket Camera
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
