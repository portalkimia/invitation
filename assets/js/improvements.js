/* Shared session, durable storage, and safe display utilities. */
(() => {
  const role = /dashboard/i.test(location.pathname) ? 'admin' :
    /reception/i.test(location.pathname) ? 'reception' : null;
  const sessionKey = name => 'wedding_session_v2_' + name;
  const readSession = name => {
    try { return JSON.parse(localStorage.getItem(sessionKey(name)) || 'null'); }
    catch (_) { return null; }
  };
  const storeSession = (name, token, expiry) => {
    if (!name || !token) return;
    localStorage.setItem(sessionKey(name), JSON.stringify({ token, expiresAt: expiry || Date.now() + 12 * 3600000 }));
    localStorage.removeItem('wedding_' + name + '_pin');
  };
  WeddingApi.getStoredPin = name => {
    const saved = readSession(name);
    return saved && saved.expiresAt > Date.now() ? saved.token : null;
  };
  WeddingApi.saveStoredPin = name => localStorage.removeItem('wedding_' + name + '_pin');
  WeddingApi.clearStoredPin = name => {
    localStorage.removeItem(sessionKey(name));
    localStorage.removeItem('wedding_' + name + '_pin');
  };
  WeddingApi.postToGas = async function(action, data = {}) {
    const url = WEDDING_CONFIG.GAS_WEB_APP_URL;
    if (!url || url.includes('YOUR_GAS_DEPLOYMENT_ID_HERE')) return { success: false, error: 'Backend belum dikonfigurasi.' };
    const saved = role ? readSession(role) : null;
    const payload = { ...data, action };
    if (saved && saved.expiresAt > Date.now()) payload.sessionToken = saved.token;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), action.includes('Photo') || action === 'uploadDesignMedia' ? 90000 : 25000);
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload), signal: controller.signal });
      if (!response.ok) return { success: false, networkError: response.status >= 500 || response.status === 429, error: 'Server merespons HTTP ' + response.status };
      const result = await response.json();
      if (result.sessionToken) storeSession(data.role || role, result.sessionToken, result.expiresAt);
      if (result.authRequired) window.dispatchEvent(new CustomEvent('wedding:auth-required', { detail: result }));
      return result;
    } catch (error) {
      return { success: false, networkError: true, error: error.name === 'AbortError' ? 'Waktu tunggu habis. Data akan dicoba kembali.' : 'Koneksi terputus. Coba kembali saat tersambung.' };
    } finally { clearTimeout(timer); }
  };
  WeddingApi.getFromGas = (action, data) => WeddingApi.postToGas(action, data);
  WeddingApi.verifyPin = async (name, value) => {
    const saved = readSession(name);
    if (saved && saved.token === value) {
      const result = await WeddingApi.postToGas('verifySession', { sessionToken: value });
      // An existing, unexpired reception session may keep recording pending check-ins offline.
      if (name === 'reception' && result.networkError && saved.expiresAt > Date.now()) return { valid: true, offline: true };
      return result;
    }
    return WeddingApi.postToGas('verifyPin', { role: name, pin: value });
  };
  const originalCache = WeddingApi.saveCachedSettings.bind(WeddingApi);
  WeddingApi.saveCachedSettings = settings => {
    const clean = { ...settings };
    Object.keys(clean).forEach(key => { if (/PIN|TOKEN|SECRET|PASSWORD/i.test(key)) delete clean[key]; });
    originalCache(clean);
  };
  WeddingApi.saveCachedSettings(WeddingApi.getCachedSettings() || {});
  ['admin', 'reception'].forEach(name => localStorage.removeItem('wedding_' + name + '_pin'));

  let dbPromise;
  function openDB() {
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('wedding-durable-v2', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('records', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Tutup tab lama lalu buka kembali aplikasi.'));
    });
    return dbPromise;
  }
  async function dbOperation(mode, operation) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('records', mode);
      let request;
      try { request = operation(tx.objectStore('records')); }
      catch (error) { reject(error); return; }
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Penyimpanan dibatalkan.'));
    });
  }
  window.WeddingStore = {
    get: id => dbOperation('readonly', store => store.get(id)),
    put: record => dbOperation('readwrite', store => store.put(record)),
    remove: id => dbOperation('readwrite', store => store.delete(id)),
    all: () => dbOperation('readonly', store => store.getAll())
  };
  WeddingApi.escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  WeddingApi.jsArg = value => WeddingApi.escape(JSON.stringify(String(value ?? '')));
  WeddingApi.newId = prefix => prefix + '_' + (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Date.now() + '_' + Math.random().toString(36).slice(2));
  WeddingApi.download = (data, name, mime) => {
    const url = data.startsWith('data:') ? data : URL.createObjectURL(new Blob([data], { type: mime }));
    const link = document.createElement('a'); link.href = url; link.download = name;
    document.body.append(link); link.click(); link.remove();
    if (url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  WeddingApi.photoPreview = url => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === 'drive.google.com') {
        const id = parsed.searchParams.get('id') || parsed.pathname.match(/\/d\/([^/]+)/)?.[1];
        if (id) return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w600';
      }
      return parsed.protocol === 'https:' ? parsed.href : '';
    } catch (_) { return ''; }
  };
  WeddingApi.parseGuestImport = (text, guests) => {
    const firstLine = text.split(/\r?\n/)[0] || '';
    const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';
    const rows = []; let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        if (quoted && text[i + 1] === '"') { field += '"'; i++; }
        else quoted = !quoted;
      } else if (!quoted && ch === delimiter) { row.push(field.trim()); field = ''; }
      else if (!quoted && (ch === '\n' || ch === '\r')) {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(field.trim()); if (row.some(Boolean)) rows.push(row); row = []; field = '';
      } else field += ch;
    }
    if (field || row.length) { row.push(field.trim()); if (row.some(Boolean)) rows.push(row); }
    if (quoted) throw new Error('Tanda kutip CSV belum ditutup.');
    const header = rows[0]?.map(value => value.replace(/^\ufeff/, '').toLowerCase()) || [];
    const hasHeader = header.some(value => ['name', 'nama'].includes(value)) && header.some(value => ['phone', 'no_hp', 'nomor hp', 'telepon'].includes(value));
    let next = Math.max(0, ...guests.map(g => Number(String(g.code).match(/^G(\d+)$/i)?.[1] || 0))) + 1;
    const col = aliases => header.findIndex(value => aliases.includes(value));
    return (hasHeader ? rows.slice(1) : rows).map(values => {
      const explicitCode = /^G\d+$/i.test(values[0]) && values.length >= 3;
      const pick = (aliases, index) => values[hasHeader ? col(aliases) : index] || '';
      const code = pick(['code', 'kode'], explicitCode ? 0 : -1).toUpperCase() || 'G' + String(next++).padStart(3, '0');
      const name = pick(['name', 'nama'], explicitCode ? 1 : 0);
      const phone = WeddingApi.sanitizePhone(pick(['phone', 'no_hp', 'nomor hp', 'telepon'], explicitCode ? 2 : 1));
      const rawCategory = pick(['category', 'kategori'], explicitCode ? 3 : 2).toLowerCase();
      const category = ({ vip: 'VIP', vvip: 'VVIP', keluarga: 'Keluarga' })[rawCategory] || 'Reguler';
      return { code, name, phone, category, group: pick(['group', 'kelompok'], explicitCode ? 4 : 3) };
    }).filter(g => g.name);
  };
})();
