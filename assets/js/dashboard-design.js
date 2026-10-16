(function () {
  'use strict';
  const form = document.getElementById('form-event-settings');
  if (!form) return;
  let loaded = false, pending = {}, previewTimer;
  const fields = new Map();
  const make = (tag, cls, text) => { const node = document.createElement(tag); node.className = cls || ''; if (text) node.textContent = text; return node; };
  const section = make('section', 'bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5'); section.id = 'design-editor';
  section.append(make('h3', 'font-bold text-lg', 'Studio Desain Undangan'), make('p', 'text-sm text-slate-600', 'Atur tampilan setiap bagian tanpa mengubah susunan undangan. Gunakan URL gambar langsung atau link Google Drive yang dapat dilihat siapa saja. Background kosong mengikuti background utama; ornamen PNG transparan memberi efek berlapis.'));
  const guide = make('div', 'rounded-xl bg-amber-50 p-4 text-xs text-amber-900');
  guide.textContent = 'Urutan: cover → foto pembuka → kutipan → profil mempelai → cerita → hitung mundur → acara → galeri → RSVP dan ucapan → penutup. Foto utama, profil, cerita, dan galeri tetap diatur pada kolom foto masing-masing di bawah.'; section.append(guide);
  function group(title, hint, open = false) {
    const details = make('details', 'rounded-2xl border border-slate-200 p-4'); details.open = open;
    const summary = make('summary', 'font-semibold text-sm cursor-pointer', title); details.append(summary);
    if (hint) details.append(make('p', 'text-xs text-slate-500 mt-3 mb-4', hint));
    const grid = make('div', 'grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'); details.append(grid); section.append(details); return grid;
  }
  function field(parent, path, title, type = 'url', note = '') {
    const wrap = make('div', 'min-w-0'); const label = make('label', 'block text-xs font-semibold text-slate-700 mb-2', title);
    const input = make('input', 'w-full rounded-xl border border-slate-200 px-3 py-2 text-xs'); input.type = type; input.id = 'design-' + path.replaceAll('.', '-'); label.htmlFor = input.id;
    if (type === 'url') { input.placeholder = 'https://…'; input.maxLength = 2048; }
    wrap.append(label, input); parent.append(wrap); fields.set(path, input);
    if (note) wrap.append(make('p', 'text-xs text-slate-500 mt-1', note));
    if (type === 'url') {
      const preview = make('img', 'mt-2 rounded-lg border border-slate-100'); preview.alt = 'Pratinjau ' + title; preview.style.cssText = 'height:95px;max-width:100%;object-fit:contain;background:repeating-conic-gradient(#eee 0% 25%,#fff 0% 50%) 50%/14px 14px'; preview.hidden = true;
      const status = make('p', 'text-xs text-slate-500 mt-1'); status.setAttribute('role', 'status'); wrap.append(preview, status);
      const update = () => {
        const url = InvitationDesign.media(input.value); preview.hidden = !url; status.textContent = '';
        if (!url) { preview.removeAttribute('src'); if (input.value) status.textContent = 'Gunakan URL https atau http untuk gambar.'; return; }
        preview.onload = () => { status.textContent = 'Gambar berhasil dimuat'; };
        preview.onerror = () => { preview.hidden = true; status.textContent = 'Gambar belum bisa dimuat. Periksa URL dan akses berbagi.'; };
        preview.src = url;
      };
      input.addEventListener('change', update); input.updatePreview = update;
    }
    return input;
  }
  let grid = group('Warna dasar', 'Warna dipakai saat background gambar belum diisi.', true);
  field(grid, 'colors.paper', 'Warna latar', 'color'); field(grid, 'colors.ink', 'Warna teks', 'color'); field(grid, 'colors.accent', 'Warna aksen dan tombol', 'color');
  grid = group('Background setiap bagian', 'Gambar akan memenuhi area bagian tersebut dan mengikuti ukuran layar. Gunakan desain vertikal untuk tampilan ponsel.');
  const labels = { desktop: 'Panel kiri pada desktop', cover: 'Cover / amplop pembuka', quote: 'Kutipan / ayat', couple: 'Profil mempelai', story: 'Perjalanan cinta', events: 'Hitung mundur dan acara', gallery: 'Galeri foto', rsvp: 'RSVP', gift: 'Wedding gift', closing: 'Penutup' };
  InvitationDesign.scenes.forEach(key => field(grid, 'backgrounds.' + key, labels[key]));
  grid = group('Foto pembuka, ornamen, dan penutup', 'Foto utama memakai Foto Sampul / Prewedding. Dua foto tambahan tampil bergantian setelah undangan dibuka. Ornamen dan bingkai sebaiknya berupa PNG transparan.');
  field(grid, 'heroPhotos.0', 'Foto pembuka tambahan 1'); field(grid, 'heroPhotos.1', 'Foto pembuka tambahan 2');
  field(grid, 'heroForeground', 'Ornamen depan foto pembuka (PNG)'); field(grid, 'profileFrame', 'Bingkai profil (PNG transparan)', 'url', 'Letakkan area transparan di tengah; gambar dipasang mengelilingi foto oval.');
  field(grid, 'ornaments.top', 'Ornamen atas setiap bagian (PNG)'); field(grid, 'ornaments.bottom', 'Ornamen bawah setiap bagian (PNG)'); field(grid, 'closingPhoto', 'Foto penutup', 'url', 'Kosongkan untuk memakai foto utama.');
  grid = group('Posisi foto dan animasi', 'Atur titik fokus vertikal: 0 bagian atas, 50 tengah, 100 bagian bawah. Gerakan mengikuti pilihan aksesibilitas perangkat tamu.');
  [['hero', 'Titik fokus foto pembuka'], ['groom', 'Titik fokus mempelai pria'], ['bride', 'Titik fokus mempelai wanita'], ['closing', 'Titik fokus foto penutup']].forEach(([key, title]) => {
    const input = field(grid, 'focal.' + key, title, 'number'); input.min = 0; input.max = 100;
  });
  const shade = field(grid, 'heroShade', 'Kepekatan lapisan gelap foto (0–0,8)', 'number'); shade.min = 0; shade.max = .8; shade.step = .05;
  const duration = field(grid, 'motion.duration', 'Durasi kemunculan (milidetik)', 'number'); duration.min = 400; duration.max = 1800; duration.step = 100;
  field(grid, 'motion.enabled', 'Aktifkan animasi kemunculan', 'checkbox'); field(grid, 'motion.parallax', 'Aktifkan gerak lembut foto saat digulir', 'checkbox');
  const bar = make('div', 'flex flex-wrap items-center gap-3');
  const open = make('button', 'rounded-xl bg-stone-800 text-white py-3 px-5 text-xs', 'Pratinjau desain'); open.type = 'button';
  const hint = make('p', 'text-xs text-slate-500', 'Gunakan tombol Simpan Semua Pengaturan untuk menerbitkan perubahan.'); bar.append(open, hint); section.append(bar); form.prepend(section);

  function read() {
    const data = {};
    fields.forEach((input, path) => {
      let target = data; const keys = path.split('.');
      keys.slice(0, -1).forEach(key => { target = target[key] ||= {}; });
      target[keys.at(-1)] = input.type === 'checkbox' ? input.checked : ['number', 'range'].includes(input.type) ? Number(input.value) : input.value.trim();
    });
    // Index-addressed inputs are converted to an array by normalize.
    return InvitationDesign.normalize(data);
  }
  function load(settings) {
    pending = settings || {}; const d = InvitationDesign.normalize(pending.DESIGN_JSON);
    fields.forEach((input, path) => {
      const value = path.split('.').reduce((obj, key) => obj?.[key], d);
      if (input.type === 'checkbox') input.checked = !!value; else input.value = value ?? '';
      input.updatePreview?.();
    }); loaded = true;
  }
  window.InvitationDesignEditor = { load, read };
  load(typeof currentRawSettings !== 'undefined' ? currentRawSettings : {});
  const originalSave = WeddingApi.saveSettings;
  WeddingApi.saveSettings = function (settings) {
    // Only the full settings form includes event data; saving a WA template must not save drafts.
    const payload = Object.assign({}, settings);
    if (loaded && Object.hasOwn(payload, 'EVENT_TITLE')) payload.DESIGN_JSON = JSON.stringify(read());
    return originalSave.call(this, payload);
  };

  const dialog = make('dialog', 'rounded-2xl border-0 p-0 bg-stone-100'); dialog.style.cssText = 'width:min(96vw,1100px);height:92vh;max-height:92vh';
  const toolbar = make('div', 'flex items-center justify-between gap-3 p-3 bg-white border-b border-stone-200');
  toolbar.append(make('strong', 'text-sm', 'Pratinjau undangan'));
  const close = make('button', 'rounded-lg border px-4 py-2 text-xs', 'Tutup pratinjau'); close.type = 'button'; toolbar.append(close);
  const iframe = make('iframe', 'block mx-auto'); iframe.title = 'Pratinjau undangan'; iframe.style.cssText = 'width:390px;max-width:100%;height:calc(100% - 61px);border:0;background:#eee6d8';
  dialog.append(toolbar, iframe); document.body.append(dialog); close.onclick = () => dialog.close();
  function previewSettings() {
    const settings = Object.fromEntries(Object.entries(pending).filter(([key]) => !/PIN|SECRET|TOKEN|PASSWORD/i.test(key)));
    const map = { 'cfg-cover-photo': 'COVER_PHOTO', 'cfg-bg-image': 'BG_IMAGE', 'cfg-groom-photo': 'GROOM_PHOTO', 'cfg-bride-photo': 'BRIDE_PHOTO', 'cfg-groom-name': 'GROOM_NAME', 'cfg-bride-name': 'BRIDE_NAME', 'cfg-groom-short': 'GROOM_SHORT', 'cfg-bride-short': 'BRIDE_SHORT', 'cfg-quote-text': 'QUOTE_TEXT', 'cfg-quote-source': 'QUOTE_SOURCE' };
    for (let i = 1; i <= 3; i++) for (const [suffix, key] of [['title','TITLE'],['desc','DESC'],['date','DATE'],['tag','TAG'],['img','IMG']]) map[`cfg-story${i}-${suffix}`] = `STORY${i}_${key}`;
    for (let i = 1; i <= 5; i++) for (const [suffix, key] of [['url','URL'],['title','TITLE'],['cat','CAT']]) map[`cfg-gallery${i}-${suffix}`] = `GALLERY${i}_${key}`;
    Object.entries(map).forEach(([id, key]) => { const input = document.getElementById(id); if (input) settings[key] = input.value.trim(); });
    const metadata = { 'cfg-event-title': 'EVENT_TITLE', 'cfg-event-date-formatted': 'EVENT_DATE_FORMATTED', 'cfg-countdown-target': 'COUNTDOWN_TARGET', 'cfg-groom-bio': 'GROOM_BIO', 'cfg-bride-bio': 'BRIDE_BIO', 'cfg-akad-time': 'AKAD_TIME', 'cfg-akad-venue': 'AKAD_VENUE', 'cfg-akad-address': 'AKAD_ADDRESS', 'cfg-resepsi-time': 'RESEPSI_TIME', 'cfg-resepsi-venue': 'RESEPSI_VENUE', 'cfg-resepsi-address': 'RESEPSI_ADDRESS' };
    Object.entries(metadata).forEach(([id, key]) => { const input = document.getElementById(id); if (input) settings[key] = input.value.trim(); });
    settings.DESIGN_JSON = JSON.stringify(read()); return settings;
  }
  function sendPreview() { if (dialog.open) iframe.contentWindow?.postMessage({ type: 'wedding-design-preview', settings: previewSettings() }, location.origin); }
  open.onclick = () => { dialog.showModal(); if (!iframe.src) iframe.src = 'index.html?design-preview=1'; else sendPreview(); };
  addEventListener('message', event => { if (event.origin === location.origin && event.source === iframe.contentWindow && event.data?.type === 'wedding-design-ready') sendPreview(); });
  form.addEventListener('input', () => { clearTimeout(previewTimer); previewTimer = setTimeout(sendPreview, 180); });
})();
