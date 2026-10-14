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
   * Build WhatsApp wa.me direct link
   */
  buildWaMeLink(phone, name, code, customTemplate) {
    const config = (typeof WEDDING_CONFIG !== 'undefined') ? WEDDING_CONFIG : {};
    const cleanPhone = this.sanitizePhone(phone);
    const template = customTemplate || config.defaultWaTemplate || 'Halo {nama}, tautan undangan: {link}';
    const inviteLink = this.buildInviteUrl(code, name);

    const message = template
      .replace(/{nama}/g, name || 'Tamu Undangan')
      .replace(/{kode}/g, code || '')
      .replace(/{link}/g, inviteLink);

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
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

  clearStoredPin(role) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem('wedding_' + role + '_pin');
    } catch (e) {
      console.warn('Gagal menghapus PIN dari localStorage:', e);
    }
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
