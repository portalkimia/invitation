/**
 * WEDDING APP CONFIGURATION
 * 
 * Edit this file to customize event details, couple information,
 * bank accounts, and your deployed Google Apps Script Web App URL.
 */

const WEDDING_CONFIG = {
  // Google Apps Script Web App Deployment URL
  GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyu6oRsL1CbppQHf-v2EPoJcjaivYKtdQDHyju0HO5TyODo1GPuPYTg0Ts4dwLvCGX_-A/exec',

  // Base URL for digital invitations (Auto-detects current location or uses GitHub Pages)
  BASE_INVITE_URL: (typeof window !== 'undefined' && window.location && window.location.origin.includes('github.io'))
    ? 'https://portalkimia.github.io/invitation/index.html'
    : ((typeof window !== 'undefined' && window.location && window.location.origin.startsWith('http'))
        ? window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') + '/index.html'
        : 'https://portalkimia.github.io/invitation/index.html'),

  // Pocket camera URL
  POCKET_CAM_URL: (typeof window !== 'undefined' && window.location && window.location.origin.includes('github.io'))
    ? 'https://portalkimia.github.io/invitation/pocket-cam.html'
    : ((typeof window !== 'undefined' && window.location && window.location.origin.startsWith('http'))
        ? window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') + '/pocket-cam.html'
        : 'https://portalkimia.github.io/invitation/pocket-cam.html'),

  // Security Access PINs
  ADMIN_PIN: '1234',      // PIN to unlock dashboard.html
  RECEPTION_PIN: '5678',  // PIN to unlock reception.html

  // Couple Information & Photos
  couple: {
    // Optional prewedding/cover photo (e.g. 'assets/images/cover.jpg' or online URL)
    coverPhoto: '',
    groom: {
      name: 'Romeo Montague',
      shortName: 'Romeo',
      father: 'Bpk. Montague',
      mother: 'Ibu Montague',
      bio: 'Putra pertama dari Bpk. Montague & Ibu Montague',
      // Foto mempelai pria (e.g. 'assets/images/groom.jpg' or online URL)
      photo: ''
    },
    bride: {
      name: 'Juliet Capulet',
      shortName: 'Juliet',
      father: 'Bpk. Capulet',
      mother: 'Ibu Capulet',
      bio: 'Putri bungsu dari Bpk. Capulet & Ibu Capulet',
      // Foto mempelai wanita (e.g. 'assets/images/bride.jpg' or online URL)
      photo: ''
    }
  },

  // Event Details & Background
  event: {
    title: 'Pernikahan Romeo & Juliet',
    dateFormatted: 'Minggu, 25 Oktober 2026',
    countdownTarget: '2026-10-25T08:00:00+07:00',
    // Optional background image for invitation (e.g. 'assets/images/bg.jpg' or online URL)
    backgroundImage: '',
    akadTime: '08:00 - 10:00 WIB',
    akadVenue: 'Masjid Agung Al-Azhar',
    akadAddress: 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan',
    akadNote: 'Khusus Keluarga & Kerabat Dekat',
    resepsiTime: '11:00 - 14:00 WIB',
    resepsiVenue: 'Grand Ballroom Hotel Mulia Senayan',
    resepsiAddress: 'Jl. Asia Afrika No.6, Gelora, Senayan, Jakarta Pusat',
    mapsUrl: 'https://maps.google.com/?q=Hotel+Mulia+Senayan+Jakarta',
    akad: {
      title: 'Akad Nikah',
      time: '08:00 - 10:00 WIB',
      venue: 'Masjid Agung Al-Azhar',
      address: 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan'
    },
    reception: {
      title: 'Resepsi Pernikahan',
      time: '11:00 - 14:00 WIB',
      venue: 'Grand Ballroom Hotel Mulia Senayan',
      address: 'Jl. Asia Afrika No.6, Gelora, Senayan, Jakarta Pusat'
    }
  },

  // Quran / Holy Scripture Quote
  quote: {
    text: 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
    source: 'QS. Ar-Rum: 21'
  },

  // Wedding Background Music
  // Can be a local file 'assets/audio/song.mp3' or any direct mp3 URL
  music: {
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-wedding-113824.mp3',
    title: 'Romantic Wedding Ambient'
  },

  // Digital Envelope / Bank Gifts
  bankAccounts: [
    {
      bank: 'BCA',
      accountNumber: '1234567890',
      holderName: 'Romeo Montague'
    },
    {
      bank: 'Bank Mandiri',
      accountNumber: '9876543210123',
      holderName: 'Juliet Capulet'
    }
  ],

  // Gift Delivery Address
  giftAddress: {
    recipient: 'Romeo & Juliet',
    phone: '08123456789',
    address: 'Jl. Kebahagiaan No. 10, Kebayoran Baru, Jakarta Selatan, 12180'
  },

  // Love Story Milestones (Kisah Perjalanan Cinta)
  loveStory: [
    {
      date: 'September 2021',
      title: 'Pertama Kali Bertemu',
      description: 'Tak sengaja bertegur sapa saat menyelesaikan proyek akhir bersama di kampus, berawal dari tatapan malu hingga percakapan hangat yang tak pernah usai.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
      tag: 'Sudut Kampus'
    },
    {
      date: 'Desember 2023',
      title: 'Memulai Komitmen',
      description: 'Setelah melewati masa persahabatan yang indah, kami sepakat untuk melangkah ke babak baru bersama, saling menjaga dan menguatkan satu sama lain.',
      image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80',
      tag: 'Senja Bersama'
    },
    {
      date: 'November 2025',
      title: 'Momen Lamaran (She Said Yes!)',
      description: 'Di bawah hangatnya cahaya mentari sore dan restu kedua keluarga, sebuah cincin tersemat sebagai simbol janji suci menuju mahligai pernikahan.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
      tag: 'Bukit Pinus'
    }
  ],

  // Pre-Wedding Photo Gallery
  gallery: [
    {
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80',
      title: 'Harmoni di Balutan Sutra',
      category: 'Potret Elegan'
    },
    {
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
      title: 'Gelak Tawa di Bawah Mentari',
      category: 'Momen Spontan'
    },
    {
      url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop&q=80',
      title: 'Simbol Pengikat Janji',
      category: 'Detail Cincin'
    },
    {
      url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop&q=80',
      title: 'Tatapan Penuh Ketulusan',
      category: 'Potret Mempelai'
    },
    {
      url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1000&auto=format&fit=crop&q=80',
      title: 'Janji di Cakrawala Senja',
      category: 'Siluet Sunset'
    }
  ],

  // Default WhatsApp Message Template
  // Supported placeholders: {nama}, {link}, {kode}, {mempelai}, {tanggal}, {tempat}, {alamat}, {waktu}, {kategori}, {pax}
  defaultWaTemplate: `Halo {nama},

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

👰🤵 *{mempelai}*
📅 {tanggal}
📍 {tempat}
{alamat}

Tautan undangan resmi & barcode kehadiran Anda dapat diakses di:
🔗 {link}

Kode Tamu Anda: *{kode}*
(Mohon simpan dan tunjukkan barcode di atas kepada penerima tamu saat tiba di lokasi).

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.

Salam hangat,
*{mempelai}*`
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WEDDING_CONFIG;
}
if (typeof window !== 'undefined') {
  window.WEDDING_CONFIG = WEDDING_CONFIG;
}
