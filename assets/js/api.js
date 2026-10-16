/**
 * WEDDING APP - SHARED API & CLIENT UTILITIES
 * 
 * Features:
 * 1. CORS-safe Google Apps Script fetch (Content-Type: text/plain;charset=utf-8)
 * 2. Indonesian Phone Number Normalizer (08xx / +628xx -> 628xx)
 * 3. WhatsApp wa.me Link Generator with custom template support
 * 4. Canvas JPEG Image Compressor (max 1280px, 0.75 quality)
 * 5. LocalStorage Guest Session Manager
 * 6. Zero-dependency Web Audio API Sound Synthesizer (Chime & Shutter)
 */

const WeddingApi = {
  /**
   * Send CORS-safe POST request to Google Apps Script Web App
   * Using text/plain;charset=utf-8 prevents browser CORS preflight (OPTIONS)
   */
  async postToGas(action, data = {}) {
    const config = (typeof WEDDING_CONFIG !== 'undefined') ? WEDDING_CONFIG : {};
    const url = config.GAS_WEB_APP_URL;

    if (!url || url.indexOf('YOUR_GAS_DEPLOYMENT_ID_HERE') !== -1) {
      console.warn('[WeddingApi] GAS_WEB_APP_URL belum dikonfigurasi.');
      if (action === 'verifyPin') {
        const expected = (data.role === 'admin') ? (config.ADMIN_PIN || '1234') : (config.RECEPTION_PIN || '5678');
        const isValid = String(data.pin || '').trim() === expected;
        return {
          success: isValid,
          valid: isValid,
          mock: true
        };
      }
      // Return simulated success for local preview testing
      return {
        success: true,
        mock: true,
        message: 'Mock response (GAS URL belum diset di config.js)',
        action: action,
        data: data
      };
    }

    const payload = JSON.stringify({ action: action, ...data });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: payload
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json;
    } catch (err) {
      console.error('[WeddingApi] postToGas error:', err);
      return {
        success: false,
        error: err.message || err.toString()
      };
    }
  },

  /**
   * Send GET request to Google Apps Script Web App
   */
  async getFromGas(action, params = {}) {
    const config = (typeof WEDDING_CONFIG !== 'undefined') ? WEDDING_CONFIG : {};
    const baseUrl = config.GAS_WEB_APP_URL;

    if (!baseUrl || baseUrl.indexOf('YOUR_GAS_DEPLOYMENT_ID_HERE') !== -1) {
      return {
        success: true,
        mock: true,
        guests: []
      };
    }

    const queryParams = new URLSearchParams({ action: action, ...params });
    const fullUrl = `${baseUrl}?${queryParams.toString()}`;

    try {
      const response = await fetch(fullUrl, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const json = await response.json();
      return json;
    } catch (err) {
      console.error('[WeddingApi] getFromGas error:', err);
      return {
        success: false,
        error: err.message || err.toString()
      };
    }
  },

  /**
   * Normalize Indonesian phone numbers to standard international format (628xxx)
   * Examples:
   *   '0812-3456-7890' -> '6281234567890'
   *   '+62 812 3456'   -> '628123456'
   *   '81234567890'    -> '6281234567890'
   *   '6281234567890'  -> '6281234567890'
   */
  sanitizePhone(rawPhone) {
    if (!rawPhone) return '';
    let cleaned = String(rawPhone).replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }

    return cleaned;
  },

  /**
   * Build personal invitation link for a guest
   */
  buildInviteUrl(code, name) {
    const config = (typeof WEDDING_CONFIG !== 'undefined') ? WEDDING_CONFIG : {};
    const base = config.BASE_INVITE_URL || 'index.html';
    const params = new URLSearchParams();
    if (code) params.set('code', code);
    if (name) params.set('to', name);
    return `${base}?${params.toString()}`;
  },

  /**
   * Formats a WhatsApp message template by dynamically substituting all guest
   * and event configuration placeholders ({nama}, {mempelai}, {tanggal}, {tempat}, etc.)
   */
  formatWaMessage(template, guest = {}, config = null) {
    const raw = this.getCachedSettings() || {};
    const base = (typeof WEDDING_CONFIG !== 'undefined') ? WEDDING_CONFIG : {};
    const cfg = config || this.mapSettingsToConfig(raw, base);

    const groomShort = cfg.couple?.groom?.shortName || cfg.couple?.groomShort || raw.GROOM_SHORT || 'Romeo';
    const brideShort = cfg.couple?.bride?.shortName || cfg.couple?.brideShort || raw.BRIDE_SHORT || 'Juliet';
    const couplePair = `${groomShort} & ${brideShort}`;
    const groomName = cfg.couple?.groom?.name || raw.GROOM_NAME || groomShort;
    const brideName = cfg.couple?.bride?.name || raw.BRIDE_NAME || brideShort;
    const eventTitle = cfg.event?.title || raw.EVENT_TITLE || `The Wedding of ${couplePair}`;
    const eventDate = cfg.event?.dateFormatted || raw.EVENT_DATE_FORMATTED || 'Minggu, 25 Oktober 2026';

    const akadTime = cfg.event?.akadTime || cfg.event?.akad?.time || raw.AKAD_TIME || '08:00 - 10:00 WIB';
    const akadVenue = cfg.event?.akadVenue || cfg.event?.akad?.venue || raw.AKAD_VENUE || 'Masjid Agung Al-Azhar';
    const akadAddress = cfg.event?.akadAddress || cfg.event?.akad?.address || raw.AKAD_ADDRESS || '';

    const resepsiTime = cfg.event?.resepsiTime || cfg.event?.reception?.time || raw.RESEPSI_TIME || '11:00 - 14:00 WIB';
    const resepsiVenue = cfg.event?.resepsiVenue || cfg.event?.reception?.venue || raw.RESEPSI_VENUE || akadVenue || 'Grand Ballroom Hotel Mulia Senayan';
    const resepsiAddress = cfg.event?.resepsiAddress || cfg.event?.reception?.address || raw.RESEPSI_ADDRESS || akadAddress || '';

    const mainVenue = resepsiVenue || akadVenue;
    const mainAddress = resepsiAddress || akadAddress;
    const mainTime = resepsiTime || akadTime;
    const mapsUrl = cfg.event?.mapsUrl || raw.MAPS_URL || '';

    const guestName = guest.name || 'Tamu Undangan';
    const guestCode = guest.code || '';
    const guestLink = guest.link || this.buildInviteUrl(guestCode, guestName);
    const guestPax = (guest.pax !== undefined && guest.pax !== null && guest.pax !== '') ? String(guest.pax) : '1';
    const guestCategory = guest.category || 'Reguler';

    let msg = template || raw.WA_TEMPLATE || cfg.defaultWaTemplate || base.defaultWaTemplate || 'Halo {nama}, tautan undangan: {link}';

    msg = msg.replace(/\{nama\}/gi, guestName);
    msg = msg.replace(/\{kode\}/gi, guestCode);
    msg = msg.replace(/\{link\}/gi, guestLink);
    msg = msg.replace(/\{pax\}/gi, guestPax);
    msg = msg.replace(/\{kategori\}/gi, guestCategory);

    msg = msg.replace(/\{mempelai\}/gi, couplePair);
    msg = msg.replace(/\{pria\}|\{groom\}/gi, groomShort);
    msg = msg.replace(/\{wanita\}|\{bride\}/gi, brideShort);
    msg = msg.replace(/\{nama_pria\}/gi, groomName);
    msg = msg.replace(/\{nama_wanita\}/gi, brideName);
    msg = msg.replace(/\{judul\}/gi, eventTitle);
    msg = msg.replace(/\{tanggal\}/gi, eventDate);
    msg = msg.replace(/\{tempat\}/gi, mainVenue);
    msg = msg.replace(/\{alamat\}/gi, mainAddress);
    msg = msg.replace(/\{waktu\}|\{jam\}/gi, mainTime);
    msg = msg.replace(/\{maps\}/gi, mapsUrl);

    msg = msg.replace(/\{akad_waktu\}/gi, akadTime);
    msg = msg.replace(/\{akad_tempat\}/gi, akadVenue);
    msg = msg.replace(/\{akad_alamat\}/gi, akadAddress);

    msg = msg.replace(/\{resepsi_waktu\}/gi, resepsiTime);
    msg = msg.replace(/\{resepsi_tempat\}/gi, resepsiVenue);
    msg = msg.replace(/\{resepsi_alamat\}/gi, resepsiAddress);

    return msg;
  },

  /**
   * Build WhatsApp wa.me direct link
   */
  buildWaMeLink(phone, name, code, customTemplate, guest = {}, config = null) {
    const cleanPhone = this.sanitizePhone(phone);
    const inviteLink = this.buildInviteUrl(code, name);
    const guestData = { name, code, link: inviteLink, ...guest };
    const message = this.formatWaMessage(customTemplate, guestData, config);

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Build Google Calendar 1-Click "Add to Calendar" URL
   */
  buildGoogleCalendarUrl(cfg = {}) {
    const groom = cfg.couple?.groom?.shortName || cfg.couple?.groomShort || 'Romeo';
    const bride = cfg.couple?.bride?.shortName || cfg.couple?.brideShort || 'Juliet';
    const title = cfg.event?.title || `The Wedding of ${groom} & ${bride}`;

    let startDate = new Date();
    if (cfg.event?.countdownTarget) {
      const parsed = new Date(cfg.event.countdownTarget);
      if (!isNaN(parsed.getTime())) {
        startDate = parsed;
      }
    }
    const endDate = new Date(startDate.getTime() + (3 * 60 * 60 * 1000)); // +3 hours default

    const formatGCal = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const dates = `${formatGCal(startDate)}/${formatGCal(endDate)}`;

    const venue = cfg.event?.resepsiVenue || cfg.event?.akadVenue || '';
    const address = cfg.event?.resepsiAddress || cfg.event?.akadAddress || '';
    const location = [venue, address].filter(Boolean).join(', ');

    const details = `Undangan Pernikahan ${groom} & ${bride}.\n` +
      (cfg.event?.dateFormatted ? `Tanggal: ${cfg.event.dateFormatted}\n` : '') +
      (cfg.event?.mapsUrl ? `Lokasi Maps: ${cfg.event.mapsUrl}\n` : '') +
      `Website: ${window.location ? window.location.origin + window.location.pathname : ''}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: dates,
      details: details,
      location: location
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  },

  /**
   * Compress image via HTML5 Canvas
   * Max width: 1280px, Quality: 0.75 JPEG
   * Returns Promise<string> Base64 JPEG data URL
   */
  compressImage(source, maxWidth = 1280, quality = 0.75) {
    return new Promise((resolve, reject) => {
      // If running outside browser (e.g. Node tests), return directly
      if (typeof Image === 'undefined' || typeof document === 'undefined') {
        resolve(typeof source === 'string' ? source : '');
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Fill white background in case of transparent PNG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = (err) => reject(new Error('Gagal memproses gambar: ' + err));

      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof Blob || source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(source);
      } else {
        reject(new Error('Format sumber gambar tidak didukung'));
      }
    });
  },

  /**
   * Guest LocalStorage Session Management
   */
  saveGuestSession(code, name) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('wedding_guest_code', String(code).trim().toUpperCase());
      if (name) {
        localStorage.setItem('wedding_guest_name', String(name).trim());
      }
    } catch (e) {
      console.warn('LocalStorage tidak tersedia:', e);
    }
  },

  getGuestSession() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const code = localStorage.getItem('wedding_guest_code');
      const name = localStorage.getItem('wedding_guest_name');
      if (code) {
        return { code: code, name: name || '' };
      }
    } catch (e) {
      console.warn('Gagal membaca localStorage:', e);
    }
    return null;
  },

  clearGuestSession() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem('wedding_guest_code');
      localStorage.removeItem('wedding_guest_name');
    } catch (e) {
      console.warn('Gagal membersihkan localStorage:', e);
    }
  },

  /**
   * Verify PIN for a given role ('admin' or 'reception') against the backend database
   */
  async verifyPin(role, pin) {
    const config = (typeof WEDDING_CONFIG !== 'undefined') ? WEDDING_CONFIG : {};
    const cleanPin = String(pin || '').trim();

    try {
      const res = await this.postToGas('verifyPin', { role: role, pin: cleanPin });
      return res;
    } catch (err) {
      console.error('[WeddingApi] verifyPin error:', err);
      return {
        success: false,
        valid: false,
        error: err.message || err.toString()
      };
    }
  },

  /**
   * Stored Admin/Reception PIN Session Management
   * Enables auto-login across page reloads while validating against database
   */
  getStoredPin(role) {
    if (typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem('wedding_' + role + '_pin');
    } catch (e) {
      return null;
    }
  },

  saveStoredPin(role, pin) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('wedding_' + role + '_pin', String(pin).trim());
    } catch (e) {
      console.warn('Gagal menyimpan PIN ke localStorage:', e);
    }
  },

  /**
   * Fetch event settings from Google Sheets backend
   */
  async getSettings() {
    try {
      const res = await this.postToGas('getSettings');
      if (res && res.success && res.settings) {
        this.saveCachedSettings(res.settings);
        return res.settings;
      }
    } catch (e) {
      console.warn('[WeddingApi] Gagal memuat settings dari GAS:', e);
    }
    return this.getCachedSettings() || {};
  },

  /**
   * Save event settings to Google Sheets backend
   */
  async saveSettings(settingsObj) {
    try {
      const res = await this.postToGas('saveSettings', { settings: settingsObj });
      if (res && res.success) {
        this.saveCachedSettings(res.settings || settingsObj);
      }
      return res;
    } catch (e) {
      console.error('[WeddingApi] Gagal menyimpan settings:', e);
      return { success: false, error: e.message || e.toString() };
    }
  },

  getCachedSettings() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const str = localStorage.getItem('wedding_cached_settings');
      return str ? JSON.parse(str) : null;
    } catch (e) {
      return null;
    }
  },

  saveCachedSettings(settings) {
    if (typeof localStorage === 'undefined' || !settings) return;
    try {
      localStorage.setItem('wedding_cached_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Gagal menyimpan cache settings:', e);
    }
  },

  /**
   * Maps flat settings dictionary from Sheets into structured config object
   */
  mapSettingsToConfig(settings, baseConfig = {}) {
    if (!settings || typeof settings !== 'object') return baseConfig;
    const cfg = JSON.parse(JSON.stringify(baseConfig));
    cfg.couple = cfg.couple || {};
    cfg.couple.groom = cfg.couple.groom || {};
    cfg.couple.bride = cfg.couple.bride || {};
    cfg.event = cfg.event || {};
    cfg.music = cfg.music || {};
    cfg.giftAddress = cfg.giftAddress || {};

    if (settings.EVENT_TITLE) cfg.event.title = settings.EVENT_TITLE;
    if (settings.EVENT_DATE_FORMATTED) cfg.event.dateFormatted = settings.EVENT_DATE_FORMATTED;
    if (settings.COUNTDOWN_TARGET) cfg.event.countdownTarget = settings.COUNTDOWN_TARGET;
    if (settings.COVER_PHOTO !== undefined && settings.COVER_PHOTO !== '') cfg.couple.coverPhoto = this.formatImageUrl(settings.COVER_PHOTO);
    if (settings.BG_IMAGE !== undefined && settings.BG_IMAGE !== '') cfg.event.backgroundImage = this.formatImageUrl(settings.BG_IMAGE);
    if (settings.MUSIC_URL !== undefined && settings.MUSIC_URL !== '') cfg.music.audioUrl = settings.MUSIC_URL;

    // Groom
    if (settings.GROOM_NAME) cfg.couple.groom.name = settings.GROOM_NAME;
    if (settings.GROOM_SHORT) {
      cfg.couple.groom.shortName = settings.GROOM_SHORT;
      cfg.couple.groomShort = settings.GROOM_SHORT;
    }
    if (settings.GROOM_FATHER) cfg.couple.groom.father = settings.GROOM_FATHER;
    if (settings.GROOM_MOTHER) cfg.couple.groom.mother = settings.GROOM_MOTHER;
    if (settings.GROOM_BIO) cfg.couple.groom.bio = settings.GROOM_BIO;
    if (settings.GROOM_PHOTO !== undefined && settings.GROOM_PHOTO !== '') cfg.couple.groom.photo = this.formatImageUrl(settings.GROOM_PHOTO);

    // Bride
    if (settings.BRIDE_NAME) cfg.couple.bride.name = settings.BRIDE_NAME;
    if (settings.BRIDE_SHORT) {
      cfg.couple.bride.shortName = settings.BRIDE_SHORT;
      cfg.couple.brideShort = settings.BRIDE_SHORT;
    }
    if (settings.BRIDE_FATHER) cfg.couple.bride.father = settings.BRIDE_FATHER;
    if (settings.BRIDE_MOTHER) cfg.couple.bride.mother = settings.BRIDE_MOTHER;
    if (settings.BRIDE_BIO) cfg.couple.bride.bio = settings.BRIDE_BIO;
    if (settings.BRIDE_PHOTO !== undefined && settings.BRIDE_PHOTO !== '') cfg.couple.bride.photo = this.formatImageUrl(settings.BRIDE_PHOTO);

    // Akad & Resepsi
    if (settings.AKAD_TIME) cfg.event.akadTime = settings.AKAD_TIME;
    if (settings.AKAD_VENUE) cfg.event.akadVenue = settings.AKAD_VENUE;
    if (settings.AKAD_ADDRESS) cfg.event.akadAddress = settings.AKAD_ADDRESS;
    if (settings.AKAD_NOTE) cfg.event.akadNote = settings.AKAD_NOTE;

    if (settings.RESEPSI_TIME) cfg.event.resepsiTime = settings.RESEPSI_TIME;
    if (settings.RESEPSI_VENUE) cfg.event.resepsiVenue = settings.RESEPSI_VENUE;
    if (settings.RESEPSI_ADDRESS) cfg.event.resepsiAddress = settings.RESEPSI_ADDRESS;
    if (settings.MAPS_URL) cfg.event.mapsUrl = settings.MAPS_URL;

    // Bank Accounts
    const bankAccounts = [];
    if (settings.BANK1_NAME && settings.BANK1_NUMBER) {
      bankAccounts.push({
        bank: settings.BANK1_NAME,
        accountNumber: settings.BANK1_NUMBER,
        holderName: settings.BANK1_HOLDER || ''
      });
    }
    if (settings.BANK2_NAME && settings.BANK2_NUMBER) {
      bankAccounts.push({
        bank: settings.BANK2_NAME,
        accountNumber: settings.BANK2_NUMBER,
        holderName: settings.BANK2_HOLDER || ''
      });
    }
    if (bankAccounts.length > 0) {
      cfg.bankAccounts = bankAccounts;
    }

    // Gift Address
    if (settings.GIFT_RECIPIENT) cfg.giftAddress.recipient = settings.GIFT_RECIPIENT;
    if (settings.GIFT_PHONE) cfg.giftAddress.phone = settings.GIFT_PHONE;
    if (settings.GIFT_ADDRESS) cfg.giftAddress.address = settings.GIFT_ADDRESS;

    // Quote / Ayat Suci
    cfg.quote = cfg.quote || {};
    if (settings.QUOTE_TEXT) cfg.quote.text = settings.QUOTE_TEXT;
    if (settings.QUOTE_SOURCE) cfg.quote.source = settings.QUOTE_SOURCE;

    // Love Story Milestones (Up to 3 milestones)
    const customStory = [];
    for (let i = 1; i <= 3; i++) {
      const rawDate = settings[`STORY${i}_DATE`];
      const date = this.cleanTimelineDate ? this.cleanTimelineDate(rawDate) : (rawDate || '');
      const title = settings[`STORY${i}_TITLE`];
      const desc = settings[`STORY${i}_DESC`];
      const rawImg = settings[`STORY${i}_IMG`];
      const img = this.formatImageUrl ? this.formatImageUrl(rawImg) : (rawImg || '');
      const tag = settings[`STORY${i}_TAG`];
      if (title || desc || img) {
        customStory.push({
          date: date || '',
          title: title || '',
          description: desc || '',
          image: img || '',
          tag: tag || ''
        });
      }
    }
    if (customStory.length > 0) {
      cfg.loveStory = customStory;
    }

    // Pre-Wedding Gallery Photos (Up to 5 photos)
    const customGallery = [];
    for (let i = 1; i <= 5; i++) {
      const rawUrl = settings[`GALLERY${i}_URL`];
      const url = this.formatImageUrl ? this.formatImageUrl(rawUrl) : (rawUrl || '');
      const title = settings[`GALLERY${i}_TITLE`];
      const cat = settings[`GALLERY${i}_CAT`];
      if (url) {
        customGallery.push({
          url: url,
          title: title || `Foto Prewed ${i}`,
          category: cat || 'Pre-Wedding'
        });
      }
    }
    if (customGallery.length > 0) {
      cfg.gallery = customGallery;
    }

    // WA Template
    if (settings.WA_TEMPLATE) cfg.defaultWaTemplate = settings.WA_TEMPLATE;

    return cfg;
  },

  /**
   * Normalizes image URLs from external cloud providers (Google Drive, Dropbox, etc.)
   * into direct embeddable image URLs.
   */
  formatImageUrl(url) {
    if (!url) return '';
    const str = String(url).trim();
    if (!str) return '';

    // Google Drive share link -> direct CDN URL (lh3.googleusercontent.com/d/FILE_ID)
    const driveMatch = str.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+)|uc\?(?:.*&)?id=([a-zA-Z0-9_-]+))/i);
    if (driveMatch) {
      const fileId = driveMatch[1] || driveMatch[2] || driveMatch[3];
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    // Dropbox share link -> direct raw image
    if (str.includes('dropbox.com')) {
      return str.replace(/[?&]dl=0/, '?raw=1');
    }

    return str;
  },

  /**
   * Checks if a URL is an unsupported Google Photos webpage link
   */
  isGooglePhotosUrl(url) {
    if (!url) return false;
    const str = String(url).trim().toLowerCase();
    return str.includes('photos.app.goo.gl') || str.includes('photos.google.com');
  },

  /**
   * Sanitizes date strings from Google Sheets (e.g. Wed Oct 01 2025 00:00:00 GMT+0700)
   * into clean Indonesian milestone dates like "Oktober 2025" or "15 Oktober 2025".
   */
  cleanTimelineDate(dateStr) {
    if (!dateStr) return '';
    const str = String(dateStr).trim();
    if (str.includes('GMT') || str.includes('T00:00') || /^\d{4}-\d{2}-\d{2}/.test(str) || (str.length > 25 && !isNaN(Date.parse(str)))) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return (d.getDate() === 1) ? `${months[d.getMonth()]} ${d.getFullYear()}` : `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      }
    }
    return str;
  },

  /**
   * Audio Synthesis using Web Audio API (Zero external audio file needed)
   */
  playSuccessChime() {
    if (typeof window === 'undefined' || !(window.AudioContext || window.webkitAudioContext)) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      
      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Two-tone cheerful greeting chime (E5 -> A5)
      playTone(659.25, 0.0, 0.25);
      playTone(880.00, 0.15, 0.45);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  },

  playShutterSound() {
    if (typeof window === 'undefined' || !(window.AudioContext || window.webkitAudioContext)) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      
      // Vintage camera click sound using filtered noise + click osc
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);

      // Secondary click (shutter curtain closing)
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(180, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);
          gain2.gain.setValueAtTime(0.25, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.05);
        } catch (_) {}
      }, 70);
    } catch (e) {
      console.warn('Shutter sound error:', e);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeddingApi;
}
if (typeof window !== 'undefined') {
  window.WeddingApi = WeddingApi;
}
