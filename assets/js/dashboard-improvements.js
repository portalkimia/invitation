/* Guest editing, confirmed message status, CSV export, and photo moderation. */
function refreshGuestGroups() {
  const select = document.getElementById('guest-group-filter');
  const selected = select.value;
  const groups = [...new Set(allGuests.map(g => g.group || '').filter(Boolean))].sort();
  select.innerHTML = '<option value="">Semua kelompok</option>' + groups.map(group =>
    `<option value="${WeddingApi.escape(group)}">${WeddingApi.escape(group)}</option>`).join('');
  select.value = groups.includes(selected) ? selected : '';
}

function findImportDuplicates(items) {
  const phones = new Map(allGuests.filter(g => g.phone).map(g => [WeddingApi.sanitizePhone(g.phone), g.code]));
  const codes = new Set(), errors = [];
  for (const guest of items) {
    if (codes.has(guest.code)) errors.push(`Kode ${guest.code} muncul lebih dari sekali.`);
    codes.add(guest.code);
    const phone = WeddingApi.sanitizePhone(guest.phone);
    if (phone && phones.has(phone) && phones.get(phone) !== guest.code) errors.push(`${guest.name}: nomor ${phone} juga digunakan ${phones.get(phone)}.`);
    if (phone) phones.set(phone, guest.code);
  }
  return errors.slice(0, 20);
}

async function markGuestSent(code, reset) {
  const result = await WeddingApi.postToGas('markWaSent', { code, reset });
  if (!result.success) { showToast(result.error || 'Status belum tersimpan.'); return; }
  const guest = allGuests.find(g => g.code === code);
  if (guest) guest.waSentAt = result.timestamp;
  renderDashboard();
  showToast(reset ? 'Status pengiriman dibatalkan.' : 'Pengiriman dikonfirmasi oleh admin.');
}

const guestEditor = document.createElement('dialog');
guestEditor.className = 'rounded-2xl p-6 w-full max-w-md shadow-2xl';
guestEditor.innerHTML = `<form id="guest-editor-form" class="space-y-4">
  <h2 class="text-lg font-bold">Edit tamu</h2><p id="guest-editor-code" class="text-xs text-slate-500"></p>
  <label class="block text-sm">Nama<input name="name" required maxlength="200" class="block border rounded-lg p-2 w-full"></label>
  <label class="block text-sm">Nomor HP<input name="phone" type="tel" class="block border rounded-lg p-2 w-full"></label>
  <label class="block text-sm">Kelompok<input name="group" maxlength="200" placeholder="Contoh: Teman kantor, Keluarga pria" class="block border rounded-lg p-2 w-full"></label>
  <label id="guest-editor-pax-label" class="block text-sm">Jumlah orang yang datang<input name="actualPax" type="number" min="1" max="100" step="1" class="block border rounded-lg p-2 w-full"></label>
  <p id="guest-editor-error" role="alert" class="text-sm text-rose-700"></p>
  <div class="flex justify-end gap-2"><button type="button" id="guest-editor-cancel" class="border rounded-lg p-2">Batal</button><button id="guest-editor-save" class="rounded-lg p-2 bg-slate-900 text-white">Simpan</button></div>
</form>`;
document.body.append(guestEditor);
let editingGuestCode;
function editGuest(code) {
  const guest = allGuests.find(g => g.code === code);
  if (!guest) return;
  editingGuestCode = code;
  const form = document.getElementById('guest-editor-form');
  form.elements.name.value = guest.name;
  form.elements.phone.value = guest.phone || '';
  form.elements.group.value = guest.group || '';
  form.elements.actualPax.value = guest.actualPax || '';
  form.elements.actualPax.required = !!guest.attendedAt;
  form.elements.actualPax.disabled = !guest.attendedAt;
  document.getElementById('guest-editor-pax-label').hidden = !guest.attendedAt;
  document.getElementById('guest-editor-code').textContent = code;
  document.getElementById('guest-editor-error').textContent = '';
  guestEditor.showModal();
}
document.getElementById('guest-editor-cancel').onclick = () => guestEditor.close();
document.getElementById('guest-editor-form').onsubmit = async event => {
  event.preventDefault();
  const form = event.currentTarget, button = document.getElementById('guest-editor-save');
  button.disabled = true;
  try {
    const data = Object.fromEntries(new FormData(form));
    const result = await WeddingApi.postToGas('updateGuest', { ...data, code: editingGuestCode });
    if (!result.success) { document.getElementById('guest-editor-error').textContent = result.error; return; }
    guestEditor.close(); await loadDashboardData(); showToast('Data tamu diperbarui.');
  } finally { button.disabled = false; }
};
document.getElementById('guest-group-filter').onchange = () => renderTable();
document.getElementById('btn-export-guests').onclick = () => {
  const columns = ['code', 'name', 'phone', 'category', 'group', 'rsvpStatus', 'pax', 'attendedAt', 'actualPax', 'waOpenedAt', 'waSentAt', 'checkInPhotoUrl', 'pocketPhotoCount'];
  const cell = value => {
    let text = String(value ?? '');
    if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  const csv = '\ufeff' + [columns, ...allGuests.map(g => columns.map(key => g[key]))].map(row => row.map(cell).join(',')).join('\r\n');
  WeddingApi.download(csv, 'rekap-tamu-' + new Date().toISOString().slice(0, 10) + '.csv', 'text/csv;charset=utf-8');
};

const albumDialog = document.createElement('dialog');
albumDialog.className = 'rounded-2xl p-5 w-full max-w-5xl shadow-2xl';
albumDialog.innerHTML = `<div class="flex justify-between gap-4"><div><h2 class="font-bold text-lg">Album tamu</h2><p class="text-xs text-slate-500">Hanya foto yang disetujui muncul pada album bersama. Menampilkan hingga 500 foto terbaru.</p></div><button id="close-admin-album" class="border rounded-lg p-2">Tutup</button></div>
  <p id="admin-album-message" role="status" class="my-3 text-sm"></p><div id="admin-album-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[65vh] overflow-y-auto"></div>`;
document.body.append(albumDialog);
document.getElementById('close-admin-album').onclick = () => albumDialog.close();
document.getElementById('btn-moderate-album').onclick = async () => { albumDialog.showModal(); await loadAdminAlbum(); };
async function loadAdminAlbum() {
  const message = document.getElementById('admin-album-message');
  message.textContent = 'Memuat foto…';
  const result = await WeddingApi.postToGas('listAlbumAdmin');
  if (!result.success) { message.textContent = result.error; return; }
  const grid = document.getElementById('admin-album-grid'); grid.replaceChildren();
  message.textContent = result.photos.length ? result.photos.length + ' foto · periksa sebelum menayangkan.' : 'Belum ada foto tamu.';
  for (const photo of result.photos) {
    const card = document.createElement('article'); card.className = 'border rounded-xl p-2 space-y-2';
    const image = document.createElement('img'); image.src = WeddingApi.photoPreview(photo.url); image.alt = 'Foto oleh ' + photo.name;
    image.loading = 'lazy'; image.className = 'aspect-square w-full object-cover rounded-lg';
    const link = document.createElement('a'); link.href = photo.url; link.target = '_blank'; link.rel = 'noopener'; link.append(image);
    const name = document.createElement('p'); name.textContent = photo.name; name.className = 'text-xs font-semibold';
    const status = document.createElement('p'); status.textContent = ({ pending: 'Menunggu persetujuan', approved: 'Ditayangkan', rejected: 'Disembunyikan' })[photo.status]; status.className = 'text-xs text-slate-500';
    const actions = document.createElement('div'); actions.className = 'flex flex-wrap gap-2';
    for (const [label, value] of [['Tayangkan', 'approved'], ['Sembunyikan', 'rejected']]) {
      const button = document.createElement('button'); button.textContent = label; button.className = 'border rounded p-1 text-xs'; button.disabled = photo.status === value;
      button.onclick = async () => {
        button.disabled = true;
        const update = await WeddingApi.postToGas('moderatePhoto', { row: photo.row, id: photo.id, status: value });
        if (update.success) await loadAdminAlbum();
        else { message.textContent = update.error; button.disabled = false; }
      };
      actions.append(button);
    }
    card.append(link, name, status, actions); grid.append(card);
  }
}

window.addEventListener('wedding:auth-required', () => {
  WeddingApi.clearStoredPin('admin');
  mainContent.classList.add('hidden'); authModal.classList.remove('hidden');
  authLoading.classList.add('hidden'); authForm.classList.remove('hidden');
  authError.textContent = 'Sesi login telah berakhir demi keamanan. Silakan masukkan PIN admin Anda kembali.';
  authError.classList.remove('hidden');
  if (guestEditor.open) guestEditor.close(); if (albumDialog.open) albumDialog.close();
});
