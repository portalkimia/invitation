/* Reception calendar entries and an album containing approved photos only. */
WeddingApi.calendarEvent = function(cfg) {
  const event = cfg.event || {};
  const date = String(event.countdownTarget || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (!date) return null;
  const hours = String(event.resepsiTime || event.reception?.time || '').match(/(\d{1,2})[:.](\d{2})\s*[-–—]\s*(\d{1,2})[:.](\d{2})/);
  const label = String(event.resepsiTime || event.reception?.time || '');
  const offset = /WITA/i.test(label) ? '+08:00' : /WIT\b/i.test(label) ? '+09:00' : '+07:00';
  const timeZone = /WITA/i.test(label) ? 'Asia/Makassar' : /WIT\b/i.test(label) ? 'Asia/Jayapura' : 'Asia/Jakarta';
  let start, end;
  if (hours) {
    start = new Date(`${date}T${hours[1].padStart(2, '0')}:${hours[2]}:00${offset}`);
    end = new Date(`${date}T${hours[3].padStart(2, '0')}:${hours[4]}:00${offset}`);
    if (end <= start) end = new Date(end.getTime() + 86400000);
  } else {
    const target = String(event.countdownTarget);
    start = new Date(/(Z|[+-]\d{2}:\d{2})$/.test(target) ? target : target + offset);
    end = new Date(start.getTime() + 3 * 3600000);
  }
  if (isNaN(start) || isNaN(end)) return null;
  return {
    title: event.title || 'Resepsi Pernikahan', start, end, timeZone,
    location: [event.resepsiVenue || event.reception?.venue, event.resepsiAddress || event.reception?.address].filter(Boolean).join(', '),
    details: [event.dateFormatted, event.mapsUrl, WeddingApi.buildInviteUrl(guestCodeParam, guestNameParam)].filter(Boolean).join('\n')
  };
};
const calendarStamp = date => date.toISOString().replace(/[-:]|\.\d{3}/g, '');
WeddingApi.buildGoogleCalendarUrl = function(cfg) {
  const event = WeddingApi.calendarEvent(cfg);
  if (!event) return '#';
  return 'https://calendar.google.com/calendar/render?' + new URLSearchParams({ action: 'TEMPLATE', text: event.title,
    dates: calendarStamp(event.start) + '/' + calendarStamp(event.end), details: event.details, location: event.location, ctz: event.timeZone });
};
const calendarButton = document.getElementById('btn-add-calendar');
const icsButton = document.createElement('button'); icsButton.type = 'button';
icsButton.className = calendarButton.className; icsButton.textContent = 'Unduh kalender (.ics)';
calendarButton.after(icsButton);
function refreshGuestCalendar(cfg) {
  const event = WeddingApi.calendarEvent(cfg);
  calendarButton.href = WeddingApi.buildGoogleCalendarUrl(cfg);
  icsButton.disabled = !event;
}
const previousInvitationRender = renderInvitationData;
window.renderInvitationData = function(cfg) { previousInvitationRender(cfg); refreshGuestCalendar(cfg); };
refreshGuestCalendar(currentConfig);
icsButton.onclick = () => {
  const event = WeddingApi.calendarEvent(currentConfig); if (!event) return;
  const escape = text => String(text || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding App//Invitation//ID', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    'UID:wedding-' + calendarStamp(event.start) + '@' + location.hostname, 'DTSTAMP:' + calendarStamp(new Date()),
    'DTSTART:' + calendarStamp(event.start), 'DTEND:' + calendarStamp(event.end),
    'SUMMARY:' + escape(event.title), 'LOCATION:' + escape(event.location), 'DESCRIPTION:' + escape(event.details), 'END:VEVENT', 'END:VCALENDAR'];
  const encoder = new TextEncoder();
  const folded = lines.map(line => {
    let result = '', bytes = 0;
    for (const char of line) {
      const size = encoder.encode(char).length;
      if (bytes + size > 73) { result += '\r\n '; bytes = 1; }
      result += char; bytes += size;
    }
    return result;
  });
  WeddingApi.download(folded.join('\r\n') + '\r\n', 'resepsi-pernikahan.ics', 'text/calendar;charset=utf-8');
};

const sharedAlbum = document.createElement('section'); sharedAlbum.className = 'text-center space-y-5';
sharedAlbum.innerHTML = `<h2 class="font-serif text-3xl text-gold-800">Momen dari Tamu</h2>
  <p class="text-sm text-stone-600">Kenangan dari Pocket Camera yang telah dipilih oleh pengantin.</p>
  <button id="load-shared-album" class="rounded-xl border border-gold-300 py-2 px-5 text-gold-800">Lihat album bersama</button>
  <p id="shared-album-message" role="status" class="text-sm text-stone-500"></p>
  <div id="shared-album-grid" class="grid grid-cols-2 sm:grid-cols-3 gap-3"></div>`;
document.querySelector('main').append(sharedAlbum);
document.getElementById('load-shared-album').onclick = async event => {
  const button = event.currentTarget, message = document.getElementById('shared-album-message');
  button.disabled = true; message.textContent = 'Memuat kenangan…';
  try {
    const result = await WeddingApi.postToGas('listAlbum');
    if (!result.success) { message.textContent = result.error || 'Album belum dapat dimuat.'; return; }
    const grid = document.getElementById('shared-album-grid'); grid.replaceChildren();
    message.textContent = result.photos.length ? result.photos.length + ' foto pilihan terbaru' : 'Foto pilihan akan muncul di sini setelah disetujui pengantin.';
    for (const photo of result.photos) {
      const preview = WeddingApi.photoPreview(photo.url); if (!preview) continue;
      const card = document.createElement('a'); card.href = photo.url; card.target = '_blank'; card.rel = 'noopener'; card.className = 'rounded-xl overflow-hidden border border-gold-200 bg-white';
      const image = document.createElement('img'); image.src = preview; image.alt = 'Momen oleh ' + photo.name;
      image.loading = 'lazy'; image.className = 'w-full aspect-square object-cover';
      const caption = document.createElement('p'); caption.textContent = photo.name; caption.className = 'p-2 text-xs text-stone-600';
      card.append(image, caption); grid.append(card);
    }
  } finally { button.disabled = false; }
};
