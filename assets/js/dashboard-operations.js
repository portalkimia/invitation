(() => {
  'use strict';
  const form = document.getElementById('form-event-settings');
  const make = (tag, text, cls = '') => { const n = document.createElement(tag); n.textContent = text; n.className = cls; return n; };
  const button = (text, action) => { const b = make('button', text, 'rounded-xl border px-4 py-2 text-sm bg-white'); b.type = 'button'; b.onclick = action; return b; };
  const section = make('section', '', 'bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-4'); section.id = 'operations-settings';
  section.append(make('h3', 'Penerbitan & operasional', 'font-bold text-lg'));
  const status = make('p', 'Perubahan draf tidak tampil kepada tamu sampai diterbitkan.', 'text-sm text-slate-600'); status.setAttribute('role','status'); section.append(status);
  const inputs = {};
  function setting(key, label, type, value) {
    const wrap = make('label', label, 'block text-sm font-semibold'); const input = document.createElement('input'); input.type = type; input.id = 'ops-' + key; input.className = 'block w-full border rounded-xl p-3 mt-2 font-normal';
    if (type === 'checkbox') { input.checked = value; input.className = 'ml-3'; } else input.value = value;
    wrap.append(input); section.append(wrap); inputs[key] = input; return input;
  }
  const quota = setting('CAMERA_QUOTA', 'Kuota Pocket Camera per undangan', 'number',18); quota.min = 1; quota.max = 100; quota.step = 1;
  setting('CAMERA_START','Mulai kamera (waktu lokal perangkat)','datetime-local','');
  setting('CAMERA_END','Tutup kamera dan unggahan (waktu lokal perangkat)','datetime-local','');
  section.append(make('p','Kosongkan jadwal agar kamera tersedia setelah check-in tanpa batas tanggal. Unggah foto antrean sebelum waktu tutup; salinan di HP tetap dapat diunduh.','text-xs text-slate-500'));
  setting('LEGACY_GUEST_ACCESS','Izinkan tautan lama yang hanya memakai kode tamu','checkbox',true);
  section.append(make('p','Tautan baru memakai token pribadi. Nonaktifkan akses kode setelah membagikan ulang tautan terbaru kepada tamu. QR lama tetap bisa dipindai oleh petugas.','text-xs text-slate-500'));
  const actions = make('div','','flex flex-wrap gap-2'); section.append(actions); form.prepend(section);
  const clean = s => Object.fromEntries(Object.entries(s).filter(([k]) => !/PIN|TOKEN|SECRET|PASSWORD/i.test(k)));
  const localDraftKey = 'wedding_design_draft_v3';
  function collect() {
    const d = InvitationDesignEditor.collect();
    const s = { ...d, ...window.collectEventSettings(), DESIGN_JSON: d.DESIGN_JSON, GALLERY_JSON: d.GALLERY_JSON };
    for (const [key,input] of Object.entries(inputs)) s[key] = input.type === 'checkbox' ? String(input.checked) : input.type === 'datetime-local' && input.value ? new Date(input.value).toISOString() : input.value;
    return clean(s);
  }
  function loadOperationSettings(settings) {
    for (const [key,input] of Object.entries(inputs)) {
      if (input.type === 'checkbox') input.checked = String(settings[key] ?? 'true') !== 'false';
      else if (input.type === 'datetime-local') {
        const date = new Date(settings[key]);
        input.value = settings[key] && !isNaN(date) ? new Date(date.getTime() - date.getTimezoneOffset()*60000).toISOString().slice(0,16) : '';
      } else input.value = settings[key] || 18;
    }
  }
  const originalLoad = InvitationDesignEditor.load;
  InvitationDesignEditor.load = s => { originalLoad(s); loadOperationSettings(s || {}); };
  loadOperationSettings(typeof currentRawSettings !== 'undefined' ? currentRawSettings : {});
  function restore(settings) {
    for (const [key,value] of Object.entries(clean(settings))) {
      const input = document.getElementById('cfg-' + key.toLowerCase().replaceAll('_','-'));
      if (input && input.type !== 'password') input.value = value;
    }
    InvitationDesignEditor.load(settings); form.dispatchEvent(new Event('input',{ bubbles:true }));
    status.textContent = 'Draf dimuat. Periksa pratinjau, lalu Terbitkan Pengaturan untuk mengubah situs.';
  }
  const originalSave = WeddingApi.saveSettings;
  WeddingApi.saveSettings = async settings => {
    const payload = { ...settings };
    if (Object.hasOwn(payload,'EVENT_TITLE')) {
      const s = collect();
      for (const key of Object.keys(inputs)) payload[key] = s[key];
      if (payload.LEGACY_GUEST_ACCESS === 'false' && String(currentRawSettings.LEGACY_GUEST_ACCESS || 'true') !== 'false' && !confirm('Akses kode lama akan dihentikan. Pastikan tautan bertoken sudah dibagikan ulang. Terbitkan pengaturan ini?')) return {success:false,error:'Penerbitan dibatalkan.'};
    }
    const result = await originalSave.call(WeddingApi,payload);
    if (result.success && Object.hasOwn(payload,'EVENT_TITLE')) { status.textContent = 'Pengaturan diterbitkan. Draf lokal tetap tersedia.'; currentRawSettings = {...currentRawSettings,...payload}; }
    return result;
  };
  let draftTimer, dirty = false;
  form.addEventListener('input', () => {
    dirty = true; clearTimeout(draftTimer);
    draftTimer = setTimeout(() => { try { localStorage.setItem(localDraftKey,JSON.stringify({schema:1,savedAt:new Date().toISOString(),settings:collect()})); status.textContent = 'Draf tersimpan di browser ini. Belum diterbitkan.'; } catch (_) {status.textContent = 'Draf lokal belum tersimpan. Gunakan Simpan draf ke server.';} },700);
  });
  actions.append(button('Simpan draf ke server',async () => {
    status.textContent = 'Menyimpan draf…';
    const result = await WeddingApi.postToGas('saveDesignDraft',{settings:collect()}); status.textContent = result.success ? 'Draf server tersimpan. Situs tamu belum berubah.' : result.error;
  }),button('Muat draf server',async () => {
    if (dirty && !confirm('Ganti perubahan di formulir dengan draf server?')) return;
    const r = await WeddingApi.postToGas('getDesignDraft'); if (r.success && Object.keys(r.settings || {}).length) restore(r.settings); else status.textContent = r.error || 'Belum ada draf server.';
  }),button('Pulihkan draf browser',() => {
    try {const d = JSON.parse(localStorage.getItem(localDraftKey)); if (!d?.settings) throw Error('Belum ada draf browser.'); if (!dirty || confirm('Ganti formulir dengan draf browser?')) restore(d.settings);} catch(e) {status.textContent = e.message;}
  }),button('Pratinjau',() => InvitationDesignEditor.openPreview()),button('Unduh backup terbit',async () => {
    const r = await WeddingApi.postToGas('getSettingsBackup');
    if (r.success) WeddingApi.download(JSON.stringify({schema:1,exportedAt:new Date().toISOString(),settings:clean(r.settings)},null,2),'wedding-settings-'+new Date().toISOString().slice(0,10)+'.json','application/json'); else status.textContent = r.error;
  }));
  const backupInput = document.createElement('input'); backupInput.type = 'file'; backupInput.accept = 'application/json,.json'; backupInput.hidden = true;
  backupInput.onchange = async () => {
    try {
      const f = backupInput.files[0]; if (!f) return; if (f.size > 300000) throw Error('Backup terlalu besar (maksimal 300 KB).');
      const d = JSON.parse(await f.text()); if (d.schema !== 1 || !d.settings || Array.isArray(d.settings) || typeof d.settings !== 'object') throw Error('Format backup tidak dikenali.');
      if (Object.entries(d.settings).some(([k,v]) => !/^[A-Z][A-Z0-9_]{0,79}$/.test(k) || !['string','number','boolean'].includes(typeof v) || String(v).length > 45000)) throw Error('Isi backup tidak valid.');
      if (!dirty || confirm('Ganti formulir dengan backup yang dipilih?')) restore(clean(d.settings));
    } catch(e) {status.textContent = e.message;} finally {backupInput.value='';}
  };
  actions.append(button('Pulihkan backup ke draf',() => backupInput.click()),backupInput);
  const publish = document.getElementById('btn-save-all-settings');
  if (publish) { publish.setAttribute('aria-label','Terbitkan Pengaturan'); publish.textContent='Terbitkan Pengaturan'; }
  const originalCollect = window.collectEventSettings;
  // Preserve the existing controller and its PIN handling; only new operations fields are added.
  window.collectEventSettings = () => originalCollect();

  // Event-day panel. Browser queues are explicitly local to this device.
  const panel = make('details','','bg-white border rounded-2xl p-5 my-5'); panel.id = 'event-day-panel';
  panel.append(make('summary','Hari acara & kesiapan','font-bold text-lg cursor-pointer'));
  const panelStatus = make('p','Buka panel untuk memuat data.','text-sm my-3'); panelStatus.setAttribute('role','status');
  const metrics = make('div','','grid grid-cols-2 lg:grid-cols-4 gap-3');
  const expected = make('div','','text-sm max-h-60 overflow-auto my-4');
  const recent = make('div','','text-sm max-h-60 overflow-auto my-4');
  const capacity = make('div','','bg-slate-50 rounded-xl p-4 text-sm space-y-3');
  capacity.append(make('h4','Perkiraan kapasitas','font-bold'));
  const sizeLabel=make('label','Perkiraan ukuran rata-rata foto (KB) '), sizeInput=document.createElement('input'); sizeInput.type='number'; sizeInput.min=20; sizeInput.max=3000; sizeInput.value=250; sizeInput.className='border rounded p-2 w-24'; sizeLabel.append(sizeInput); capacity.append(sizeLabel);
  const capacityResult=make('p',''); capacity.append(capacityResult);
  const notes = make('p','Perkiraan ini bukan hasil uji beban. Kapasitas Drive, kuota Apps Script, jaringan venue, dan penggunaan serentak perlu diperiksa sebelum acara.','text-xs text-slate-500'); capacity.append(notes);
  const quotaLink=make('a','Lihat batas Apps Script','text-xs underline'); quotaLink.href='https://developers.google.com/apps-script/guides/services/quotas'; quotaLink.target='_blank'; quotaLink.rel='noopener'; capacity.append(quotaLink);
  const checklist=make('div','','space-y-2 text-sm my-4'); checklist.append(make('h4','Persiapan sebelum tamu datang','font-bold'));
  for(const text of ['Login dan muat daftar tamu di setiap meja penerima','Coba scanner dan foto di HP petugas','Pastikan antrean check-in dan foto kosong','Periksa jadwal, lokasi, dan QR melalui tautan tamu','Unduh backup dan siapkan jaringan cadangan','Lakukan simulasi dengan menu di bawah']) {const l=make('label',text,'block'); const c=document.createElement('input');c.type='checkbox';c.className='mr-2';l.prepend(c);checklist.append(l);}
  let overview = null, panelBusy = false;
  function capacityEstimate(){if(!overview)return;const count=overview.invitations*overview.camera.quota;capacityResult.textContent=`${overview.invitations} undangan × ${overview.camera.quota} foto = hingga ${count.toLocaleString('id-ID')} foto, sekitar ${(count*Math.max(20,Math.min(3000,Number(sizeInput.value)||250))/1024/1024).toFixed(2)} GB (di luar foto kedatangan dan media desain).`;}
  sizeInput.oninput=capacityEstimate;
  async function refreshPanel(){
    if(panelBusy)return;panelBusy=true;panelStatus.textContent='Memuat kondisi acara…';
    try {
      const started=performance.now(), r=await WeddingApi.postToGas('eventOverview');
      if(!r.success){panelStatus.textContent=r.error;return;}overview=r;
      let jobs=[];try{jobs=(await WeddingStore.all()).filter(j=>j.kind==='reception-job');}catch(_){}
      panelStatus.textContent=`${navigator.onLine?'Terhubung':'Offline'} · backend ${Math.round(performance.now()-started)} ms · diperbarui ${new Date(r.timestamp).toLocaleTimeString('id-ID')}`;
      metrics.replaceChildren();
      for(const [label,value] of [['Undangan hadir',r.checkedIn+' / '+r.invitations],['Orang hadir',r.actualPeople+(r.unknownPeople?' + '+r.unknownPeople+' undangan belum diketahui':'')],['Menunggu moderasi*',r.pendingAlbum],['Foto diproses server',r.pendingUploads],['Check-in antrean HP ini',jobs.filter(j=>j.phase==='checkin').length],['Foto antrean HP ini',jobs.filter(j=>j.phase==='photo').length]]) {const c=make('div','','bg-slate-50 p-3 rounded-xl');c.append(make('p',label,'text-xs text-slate-500'),make('strong',String(value),'block text-xl'));metrics.append(c);}
      expected.replaceChildren(make('h4','RSVP hadir, belum datang ('+r.expected.length+')','font-bold mb-2'));
      for(const g of r.expected){expected.append(make('p',g.code+' · '+g.name+' · '+g.pax+' orang'));}
      if(!r.expected.length)expected.append(make('p','Tidak ada dalam daftar saat ini.'));
      recent.replaceChildren(make('h4','Kedatangan terbaru','font-bold mb-2'));
      for(const g of r.recent)recent.append(make('p',`${g.name} · ${g.pax||'?'} orang · ${new Date(g.at).toLocaleTimeString('id-ID')} · ${g.operator||'Petugas belum dicatat'}`));
      capacityEstimate();
    }finally{panelBusy=false;}
  }
  const simulation=make('a','Buka simulasi resepsi','inline-block border rounded-xl px-4 py-2 text-sm');simulation.href='reception.html?simulation=true';simulation.target='_blank';simulation.rel='noopener';
  panel.append(panelStatus,button('Perbarui kondisi',refreshPanel),metrics,make('p','*Moderasi menghitung maksimal 500 foto terbaru. Antrean HP lain hanya terlihat pada perangkat tersebut.','text-xs text-slate-500 mt-2'),expected,recent,capacity,checklist,simulation);
  document.getElementById('main-content').prepend(panel);
  panel.addEventListener('toggle',()=>{if(panel.open)refreshPanel();});
  setInterval(()=>{if(panel.open && !document.hidden && WeddingApi.getStoredPin('admin'))refreshPanel();},60000);
})();
