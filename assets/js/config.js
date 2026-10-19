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
  // Staff PINs live only in the backend Settings sheet.

  // Couple Information & Photos
  couple: {
    // Prewedding/cover photo
    coverPhoto: 'https://images.unsplash.com/photo-1773020933751-2eb621c517dc?auto=format&fit=crop&w=1400&q=80',
    groom: {
      name: 'Tito Vanzal, S.Pd',
      shortName: 'Tito',
      father: 'Bpk. Bahari Stiok',
      mother: 'Ibu Maryamah',
      bio: 'Putra kelima dari Bpk. Bahari Stiok & Ibu Maryamah',
      photo: 'https://images.unsplash.com/photo-1770217614107-949ac780f22b?auto=format&fit=crop&w=800&q=80'
    },
    bride: {
      name: 'Dhevira Aptia Firmanda, S.Pd',
      shortName: 'Vira',
      father: 'Bpk. M. Firul',
      mother: 'Ibu Suparti',
      bio: 'Putri bungsu dari Bpk. M. Firul & Ibu Suparti',
      photo: 'https://images.unsplash.com/photo-1693605975772-afe6965ae876?auto=format&fit=crop&w=800&q=80'
    }
  },

  // Event Details & Background
  event: {
    title: 'Pernikahan Tivara & Aurelia',
    dateFormatted: 'Senin, 25 Oktober 2027',
    countdownTarget: '2027-10-25T08:00:00+07:00',
    backgroundImage: 'https://images.unsplash.com/photo-1523454131402-131223cdd00e?auto=format&fit=crop&w=1000&q=80',
    akadDate: '2027-10-25',
    resepsiDate: '2027-10-25',
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
      holderName: 'Tito Vanzal'
    },
    {
      bank: 'Bank Mandiri',
      accountNumber: '9876543210123',
      holderName: 'Dhevira Aptia'
    }
  ],

  // Gift Delivery Address
  giftAddress: {
    recipient: 'Tito & Vira',
    phone: '08123456789',
    address: 'Jl. Kebahagiaan No. 10, Kebayoran Baru, Jakarta Selatan, 12180'
  },

  // Love Story Milestones (Kisah Perjalanan Cinta)
  loveStory: [
    {
      date: 'Juli 2024',
      title: 'Pertama Kali Bertemu',
      description: 'Tak sengaja bertegur sapa saat menyelesaikan proyek akhir bersama di kampus, berawal dari tatapan malu hingga percakapan hangat yang tak pernah usai.',
      image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1000&q=80',
      tag: 'Sudut Kampus'
    },
    {
      date: 'Oktober 2025',
      title: 'Memulai Komitmen',
      description: 'Setelah melewati masa persahabatan yang indah, kami sepakat untuk melangkah ke babak baru bersama, saling menjaga dan menguatkan satu sama lain.',
      image: 'https://images.unsplash.com/photo-1773020933751-2eb621c517dc?auto=format&fit=crop&w=1000&q=80',
      tag: 'Senja Bersama'
    },
    {
      date: 'April 2026',
      title: 'Momen Lamaran (She Said Yes!)',
      description: 'Di bawah hangatnya cahaya mentari sore dan restu kedua keluarga, sebuah cincin tersemat sebagai simbol janji suci menuju mahligai pernikahan.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      tag: 'Bukit Pinus'
    }
  ],

  // Pre-Wedding Photo Gallery
  gallery: [
    {
      url: 'https://images.unsplash.com/photo-1773020933751-2eb621c517dc?auto=format&fit=crop&w=1000&q=80',
      title: 'Di Antara Bunga',
      category: 'Garden Romance'
    },
    {
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      title: 'Langkah Menuju Selamanya',
      category: 'Hari Bahagia'
    },
    {
      url: 'https://images.unsplash.com/photo-1484676681417-64a0ea3475fd?auto=format&fit=crop&w=1000&q=80',
      title: 'Bunga dan Janji',
      category: 'Detail Pernikahan'
    },
    {
      url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80',
      title: 'Dalam Genggaman',
      category: 'Momen Bersama'
    },
    {
      url: 'https://images.unsplash.com/photo-1772241824154-ce6e7c985ff9?auto=format&fit=crop&w=1000&q=80',
      title: 'Hari yang Kita Nantikan',
      category: 'Potret Pernikahan'
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
