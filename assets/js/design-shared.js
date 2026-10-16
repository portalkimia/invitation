/* The invitation and dashboard share one versioned, validated design document. */
(function () {
  'use strict';
  const scenes = ['desktop', 'cover', 'quote', 'couple', 'story', 'events', 'gallery', 'rsvp', 'gift', 'closing'];
  function media(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (!/^https?:\/\//i.test(raw) && !/^\.?\/?assets\//.test(raw)) return '';
    return WeddingApi.formatImageUrl(raw);
  }
  function normalize(raw) {
    let data = raw;
    if (typeof raw === 'string') { try { data = JSON.parse(raw); } catch (_) { data = {}; } }
    data = data && typeof data === 'object' ? data : {};
    const color = (value, fallback) => /^#[a-f\d]{6}$/i.test(value || '') ? value : fallback;
    const number = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
    return {
      version: 1,
      colors: { paper: color(data.colors?.paper, '#eee6d8'), ink: color(data.colors?.ink, '#443b32'), accent: color(data.colors?.accent, '#92734e') },
      backgrounds: Object.fromEntries(scenes.map(key => [key, media(data.backgrounds?.[key])])),
      ornaments: { top: media(data.ornaments?.top), bottom: media(data.ornaments?.bottom) },
      heroPhotos: [media(data.heroPhotos?.[0]), media(data.heroPhotos?.[1])],
      heroForeground: media(data.heroForeground), profileFrame: media(data.profileFrame), closingPhoto: media(data.closingPhoto),
      focal: Object.fromEntries(['hero', 'groom', 'bride', 'closing'].map(key => [key, number(data.focal?.[key], 50, 0, 100)])),
      motion: { enabled: data.motion?.enabled !== false, parallax: data.motion?.parallax !== false, duration: number(data.motion?.duration, 1100, 400, 1800) },
      heroShade: number(data.heroShade, 0.3, 0, 0.8)
    };
  }
  window.InvitationDesign = { normalize, media, scenes };
  const original = WeddingApi.mapSettingsToConfig;
  WeddingApi.mapSettingsToConfig = function (settings, base) {
    const cfg = original.call(this, settings, base);
    cfg.design = normalize(settings?.DESIGN_JSON || cfg.design);
    const has = key => Object.prototype.hasOwnProperty.call(settings || {}, key);
    if (has('COVER_PHOTO')) cfg.couple.coverPhoto = media(settings.COVER_PHOTO);
    if (has('BG_IMAGE')) cfg.event.backgroundImage = media(settings.BG_IMAGE);
    if (has('GROOM_PHOTO')) cfg.couple.groom.photo = media(settings.GROOM_PHOTO);
    if (has('BRIDE_PHOTO')) cfg.couple.bride.photo = media(settings.BRIDE_PHOTO);
    if ([1, 2, 3, 4, 5].some(i => has(`GALLERY${i}_URL`))) {
      cfg.gallery = [1, 2, 3, 4, 5].filter(i => media(settings[`GALLERY${i}_URL`])).map(i => ({ url: media(settings[`GALLERY${i}_URL`]), title: settings[`GALLERY${i}_TITLE`] || `Kenangan ${i}`, category: settings[`GALLERY${i}_CAT`] || '' }));
    }
    if ([1, 2, 3].some(i => has(`STORY${i}_TITLE`))) {
      cfg.loveStory = [1, 2, 3].map(i => ({ title: settings[`STORY${i}_TITLE`] || '', description: settings[`STORY${i}_DESC`] || '', date: WeddingApi.cleanTimelineDate(settings[`STORY${i}_DATE`] || ''), tag: settings[`STORY${i}_TAG`] || '', image: media(settings[`STORY${i}_IMG`]) })).filter(s => s.title || s.description || s.image);
    }
    return cfg;
  };
})();
