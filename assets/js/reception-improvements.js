/* Reception queues retain check-ins and photos independently in IndexedDB. */
const ReceptionState = { guests: new Map(), initialized: false, checkInBusy: false, photoBusy: false, lookupBusy: false, currentRequest: null, currentStatus: '', authPaused: false };
const receptionPanel = document.createElement('section');
receptionPanel.className = 'max-w-lg mx-auto px-4 mb-4';
receptionPanel.innerHTML = `<div class="rounded-xl border border-slate-600 bg-slate-800 p-3 text-xs space-y-2">
  <p id="reception-sync-summary" role="status">Menyiapkan penyimpanan antrean…</p>
  <button id="btn-reception-sync" class="underline text-amber-300">Sinkronkan sekarang</button>
  <ul id="reception-sync-details" class="space-y-1 text-slate-300"></ul></div>`;
document.querySelector('main').before(receptionPanel);
const paxPanel = document.createElement('div'); paxPanel.className = 'p-4 rounded-xl border border-slate-700 bg-slate-800';
paxPanel.innerHTML = `<label for="checkin-actual-pax" class="block text-sm font-bold mb-2">Jumlah orang yang datang</label>
  <input id="checkin-actual-pax" type="number" min="1" max="100" step="1" value="1" required class="w-full rounded-lg border border-slate-600 bg-slate-900 p-3 text-white">
  <p class="text-xs text-slate-400 mt-2">Isi jumlah orang yang tiba bersama undangan ini. Angka RSVP tetap disimpan terpisah.</p>`;
document.getElementById('step-2-photo').prepend(paxPanel);
const cancelCheckIn = document.createElement('button'); cancelCheckIn.textContent = 'Kembali ke pemindaian';
cancelCheckIn.className = 'text-xs underline text-slate-300 p-2';
cancelCheckIn.onclick = async () => { stopPhotoCamera(); step2.classList.add('hidden'); step1.classList.remove('hidden'); await startQrScanner(); };
step2.append(cancelCheckIn);
document.getElementById('manual-code-input').setAttribute('list', 'reception-guest-options');
const guestOptions = document.createElement('datalist'); guestOptions.id = 'reception-guest-options'; document.body.append(guestOptions);
document.querySelector('#manual-code-form').previousElementSibling.textContent = 'Cari kode atau nama dari daftar tamu yang sudah dimuat:';

const originalReceptionScanner = startQrScanner;
window.startQrScanner = async function() {
  ReceptionState.authPaused = false;
  try { await initializeReceptionQueue(); }
  catch (error) { document.getElementById('reception-sync-summary').textContent = 'Penyimpanan perangkat tidak tersedia. Check-in belum dapat dicatat: ' + error.message; return; }
  await originalReceptionScanner();
};

async function receptionJobs() {
  return (await WeddingStore.all()).filter(record => record.kind === 'reception-job').sort((a, b) => a.createdAt - b.createdAt);
}
function cacheReceptionGuest(guest) {
  const allowed = ['code', 'name', 'rsvpStatus', 'pax', 'category', 'attendedAt', 'actualPax', 'checkInRequestId'];
  const cached = Object.fromEntries(allowed.map(key => [key, guest[key] ?? '']));
  ReceptionState.guests.set(cached.code, cached); return cached;
}
async function persistReceptionGuests() {
  await WeddingStore.put({ id: 'reception-guests', guests: [...ReceptionState.guests.values()] });
  guestOptions.replaceChildren();
  for (const guest of ReceptionState.guests.values()) {
    const option = document.createElement('option'); option.value = guest.code; option.label = guest.name; guestOptions.append(option);
  }
}
async function initializeReceptionQueue() {
  if (!ReceptionState.initialized) {
    const cached = await WeddingStore.get('reception-guests');
    (cached?.guests || []).forEach(cacheReceptionGuest);
    ReceptionState.initialized = true;
  }
  await refreshReceptionSummary();
  refreshReceptionGuestList();
  flushReceptionCheckIns(); flushReceptionPhotos();
}
async function refreshReceptionGuestList() {
  if (!navigator.onLine || ReceptionState.authPaused) return;
  const response = await WeddingApi.postToGas('listGuests');
  if (response.success && Array.isArray(response.guests)) {
    response.guests.forEach(cacheReceptionGuest); await persistReceptionGuests();
  }
}
async function refreshReceptionSummary() {
  const jobs = await receptionJobs();
  const checkIns = jobs.filter(job => job.phase === 'checkin').length;
  const photos = jobs.filter(job => job.phase === 'photo').length;
  const prefix = ReceptionState.authPaused ? 'Masuk kembali untuk sinkronisasi.' : navigator.onLine ? 'Terhubung.' : 'Koneksi terputus; pencatatan tetap dapat dilakukan.';
  document.getElementById('reception-sync-summary').textContent = `${prefix} ${checkIns} check-in dan ${photos} foto menunggu sinkronisasi.`;
  const details = document.getElementById('reception-sync-details'); details.replaceChildren();
  for (const job of jobs.slice(0, 10)) {
    const line = document.createElement('li'); line.textContent = `${job.name} · ${job.phase === 'checkin' ? job.actualPax + ' orang, kehadiran belum tersimpan di server' : 'kehadiran tersimpan, foto menunggu'}${job.error ? ' · ' + job.error : ''}`; details.append(line);
  }
}

window.handleGuestIdentified = async function(rawCode) {
  if (ReceptionState.lookupBusy) return;
  ReceptionState.lookupBusy = true;
  try {
    let code = String(rawCode || '').trim();
    const byName = [...ReceptionState.guests.values()].filter(g => g.name.toLowerCase() === code.toLowerCase());
    if (byName.length === 1) code = byName[0].code;
    if (!/^[A-Z0-9_-]{1,40}$/i.test(code)) { alert('Pilih kode tamu dari daftar, atau masukkan kode dengan huruf dan angka.'); return; }
    code = code.toUpperCase();
    await stopQrScanner();
    const jobs = await receptionJobs();
    const pending = jobs.find(job => job.code === code);
    let guest = ReceptionState.guests.get(code);
    if (navigator.onLine) {
      const response = await WeddingApi.postToGas('getGuest', { code });
      if (response.authRequired) return;
      if (response.success && response.guest) guest = cacheReceptionGuest(response.guest);
      else if (response.notFound) guest = null;
      else if (!response.networkError) throw new Error(response.error || 'Identitas tamu belum dapat dibaca.');
    }
    currentGuest = guest || { code, name: '', category: 'Reguler', pax: 1 };
    ReceptionState.currentRequest = pending?.id || null;
    if (pending || guest?.attendedAt) {
      if (pending) {
        currentGuest.name = pending.name;
        ReceptionState.currentStatus = pending.phase === 'checkin' ? 'pending' : 'saved';
      } else ReceptionState.currentStatus = 'duplicate';
      step1.classList.add('hidden'); stopPhotoCamera(); showStep3Success(); return;
    }
    step1.classList.add('hidden'); step3.classList.add('hidden'); step2.classList.remove('hidden');
    document.getElementById('checkin-guest-name').value = currentGuest.name;
    document.getElementById('checkin-guest-name').placeholder = 'Isi nama tamu walk-in';
    document.getElementById('checkin-guest-code').textContent = code;
    document.getElementById('checkin-guest-rsvp').textContent = guest ? `RSVP: ${guest.rsvpStatus || 'Belum'} (${guest.pax || 0} orang)` : 'Walk-in: isi nama dan jumlah orang';
    document.getElementById('checkin-actual-pax').value = currentGuest.pax || 1;
    document.getElementById('checkin-vip-banner').classList.toggle('hidden', !['VIP', 'VVIP', 'Keluarga'].includes(currentGuest.category));
    document.getElementById('checkin-vip-label').textContent = 'TAMU ' + currentGuest.category;
    document.getElementById('checkin-vip-tag').textContent = currentGuest.category;
    capturedPhotoBase64 = null; btnConfirm.disabled = false; btnConfirm.textContent = 'Konfirmasi & Simpan';
    photoPreview.classList.add('hidden'); photoVideo.classList.remove('hidden');
    reviewControls.classList.add('hidden'); captureControls.classList.remove('hidden');
    await startPhotoCamera();
  } catch (error) { alert(error.message); step2.classList.add('hidden'); step1.classList.remove('hidden'); await originalReceptionScanner(); }
  finally { ReceptionState.lookupBusy = false; }
};

window.saveCheckIn = async function(photoBase64) {
  if (btnConfirm.disabled) return;
  const name = document.getElementById('checkin-guest-name').value.trim();
  const input = document.getElementById('checkin-actual-pax');
  if (!name) { alert('Isi nama tamu terlebih dahulu.'); return; }
  if (!input.reportValidity()) return;
  btnConfirm.disabled = true; btnConfirm.textContent = 'Menyimpan di perangkat…';
  try {
    const jobs = await receptionJobs();
    if (jobs.some(job => job.code === currentGuest.code)) throw new Error('Tamu ini sudah berada dalam antrean.');
    const job = { id: WeddingApi.newId('checkin'), kind: 'reception-job', phase: 'checkin',
      code: currentGuest.code, name, actualPax: Number(input.value), photoBase64: photoBase64 || '', createdAt: Date.now() };
    await WeddingStore.put(job);
    currentGuest.name = name; currentGuest.actualPax = job.actualPax;
    ReceptionState.currentRequest = job.id; ReceptionState.currentStatus = 'pending';
    stopPhotoCamera(); showStep3Success(); await refreshReceptionSummary();
    flushReceptionCheckIns();
  } catch (error) { alert('Check-in belum dicatat: ' + error.message); }
  finally { btnConfirm.disabled = false; btnConfirm.textContent = 'Konfirmasi & Simpan'; }
};

async function flushReceptionCheckIns() {
  if (ReceptionState.checkInBusy || !navigator.onLine || ReceptionState.authPaused) return;
  ReceptionState.checkInBusy = true;
  try {
    for (const job of (await receptionJobs()).filter(job => job.phase === 'checkin')) {
      const result = await WeddingApi.postToGas('checkIn', { code: job.code, name: job.name, actualPax: job.actualPax, requestId: job.id });
      if (!result.success) {
        job.error = result.error; await WeddingStore.put(job);
        if (result.networkError || result.authRequired) break;
        continue;
      }
      cacheReceptionGuest(result.guest); await persistReceptionGuests();
      const duplicate = result.alreadyCheckedIn && !result.sameRequest;
      if (job.photoBase64 && !duplicate) {
        job.phase = 'photo'; job.error = ''; await WeddingStore.put(job);
      } else await WeddingStore.remove(job.id);
      if (ReceptionState.currentRequest === job.id && currentGuest?.code === job.code) {
        currentGuest = result.guest; ReceptionState.currentStatus = duplicate ? 'duplicate' : 'saved';
        if (!step3.classList.contains('hidden')) showStep3Success();
      }
      // Photo uploading runs independently so the next check-in does not wait for Drive.
      flushReceptionPhotos();
    }
  } catch (error) { document.getElementById('reception-sync-summary').textContent = 'Sinkronisasi tertunda: ' + error.message; }
  finally { ReceptionState.checkInBusy = false; await refreshReceptionSummary(); }
}

async function flushReceptionPhotos() {
  if (ReceptionState.photoBusy || !navigator.onLine || ReceptionState.authPaused) return;
  ReceptionState.photoBusy = true;
  try {
    for (const job of (await receptionJobs()).filter(job => job.phase === 'photo')) {
      const result = await WeddingApi.postToGas('uploadCheckInPhoto', { code: job.code, requestId: job.id, photoBase64: job.photoBase64 });
      if (result.success) await WeddingStore.remove(job.id);
      else { job.error = result.error; await WeddingStore.put(job); if (result.networkError || result.authRequired) break; }
    }
  } finally { ReceptionState.photoBusy = false; await refreshReceptionSummary(); }
}

const originalReceptionSuccess = showStep3Success;
window.showStep3Success = function() {
  originalReceptionSuccess();
  const status = ReceptionState.currentStatus;
  const pending = status === 'pending';
  const title = step3.querySelector('h2');
  title.textContent = pending ? 'Tercatat di perangkat' : status === 'duplicate' ? 'Tamu sudah check-in' : 'Check-in tersimpan!';
  document.getElementById('success-guest-greeting').textContent = `${currentGuest.name} · ${currentGuest.actualPax || '?'} orang${currentGuest.attendedAt ? ' · ' + new Date(currentGuest.attendedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}`;
  document.getElementById('pocket-qrcode').parentElement.classList.toggle('hidden', pending);
  const description = step3.querySelector('p.leading-relaxed');
  description.textContent = pending ? 'Kehadiran menunggu sinkronisasi. Lanjutkan menerima tamu; QR kamera tersedia setelah check-in tersimpan di server.' : 'Scan QR ini untuk membuka Pocket Camera. Foto kedatangan disimpan menyusul jika masih dalam antrean.';
  showReceptionToast(pending ? 'Menunggu sinkronisasi ke server.' : status === 'duplicate' ? 'Kehadiran sebelumnya tetap tersimpan.' : 'Kehadiran tersimpan di server.');
};

document.getElementById('btn-reception-sync').onclick = () => { ReceptionState.authPaused = false; flushReceptionCheckIns(); flushReceptionPhotos(); refreshReceptionGuestList(); };
window.addEventListener('online', () => { flushReceptionCheckIns(); flushReceptionPhotos(); refreshReceptionSummary(); });
window.addEventListener('offline', () => refreshReceptionSummary());
setInterval(() => { if (ReceptionState.initialized) { flushReceptionCheckIns(); flushReceptionPhotos(); } }, 20000);
window.addEventListener('wedding:auth-required', () => {
  ReceptionState.authPaused = true; stopAllCameraStreams();
  WeddingApi.clearStoredPin('reception'); authModal.classList.remove('hidden');
  authLoading.classList.add('hidden'); authForm.classList.remove('hidden');
  authError.textContent = 'Masuk kembali untuk melanjutkan sinkronisasi. Antrean tetap tersimpan di perangkat.'; authError.classList.remove('hidden');
  refreshReceptionSummary();
});
