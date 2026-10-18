(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const make = (tag, cls, text) => { const node = document.createElement(tag); node.className = cls || ''; if (text) node.textContent = text; return node; };
  const image = (url, alt, cls) => {
    const img = make('img', cls); img.src = InvitationDesign.media(url); img.alt = alt; img.loading = 'lazy'; img.decoding = 'async';
    img.onerror = () => { img.hidden = true; img.closest('.story-photo, .gallery-photo')?.classList.add('photo-unavailable'); };
    return img;
  };
  let design, observer, slidesTimer, parallaxFrame;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff = () => reduced.matches || !design?.motion.enabled;
  revealObserver?.disconnect();
  document.querySelectorAll('.is-revealed').forEach(node => node.classList.remove('is-revealed'));
  window.observeRevealElements = function (parent = document) {
    if (!isInvitationOpened) return;
    parent.querySelectorAll('.reveal:not(.is-revealed)').forEach(node => {
      if (motionOff() || !observer) node.classList.add('is-revealed'); else observer.observe(node);
    });
  };
  observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-revealed'); observer.unobserve(entry.target);
  }), { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  window.renderLoveStory = function (items) {
    const container = $('love-story-container'); container.replaceChildren();
    const list = Array.isArray(items) ? items : [];
    $('love-story-section').hidden = !list.length;
    list.forEach((item, i) => {
      const article = make('article', 'story-entry ' + (i % 2 ? 'story-right' : 'story-left'));
      const direction = i % 2 ? 'reveal-right' : 'reveal-left';
      if (InvitationDesign.media(item.image)) {
        const button = make('button', 'story-photo reveal ' + direction); button.type = 'button'; button.setAttribute('aria-label', 'Perbesar foto ' + item.title);
        button.append(image(item.image, item.title || 'Kenangan kami', 'parallax-photo'));
        button.onclick = () => openLightbox(InvitationDesign.media(item.image), item.title, item.date);
        article.append(button);
      }
      const copy = make('div', 'story-copy reveal reveal-up delay-200');
      copy.append(make('p', 'story-date', [item.tag, item.date].filter(Boolean).join(' · ')), make('h4', 'story-heading', item.title), make('p', 'story-description', item.description));
      article.append(copy); container.append(article);
    });
    observeRevealElements(container);
  };
  window.renderGallery = function (items) {
    const container = $('gallery-container'); container.replaceChildren();
    const list = (Array.isArray(items) ? items : []).filter(photo => InvitationDesign.media(photo.url));
    $('gallery-section').hidden = !list.length;
    list.forEach((photo, i) => {
      const button = make('button', 'gallery-photo reveal reveal-zoom ' + (i % 2 ? 'delay-200' : ''));
      button.type = 'button'; button.setAttribute('aria-label', 'Perbesar ' + (photo.title || 'foto kenangan'));
      button.append(image(photo.url, photo.title || 'Kenangan pernikahan', ''));
      const caption = make('span', 'gallery-caption', photo.title); button.append(caption);
      button.onclick = () => openLightbox(InvitationDesign.media(photo.url), photo.title, photo.category);
      container.append(button);
    });
    observeRevealElements(container);
  };

  function background(node, url) {
    if (!node) return;
    node.style.setProperty('--scene-image', url ? `url(${JSON.stringify(InvitationDesign.media(url))})` : 'none');
  }
  function ornament(node, url) { if (!node) return; node.hidden = !url; if (url) node.src = url; else node.removeAttribute('src'); }
  function renderMonogram(cfg) {
    const initials = ['groom', 'bride'].map(key => {
      const person = cfg.couple?.[key];
      return Array.from(String(person?.shortName || cfg.couple?.[key + 'Short'] || person?.name || '').trim())[0]?.toLocaleUpperCase('id-ID') || '';
    });
    const svgNode = (tag, attrs) => {
      const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      return node;
    };
    document.querySelectorAll('.couple-monogram').forEach(node => {
      const svg = svgNode('svg', { viewBox: '0 0 220 220', class: 'wedding-monogram', role: 'img', 'aria-label': 'Monogram ' + initials.filter(Boolean).join(' dan '), focusable: 'false' });
      svg.append(svgNode('path', { class: 'monogram-ring', d: 'M164 24C206 52 209 135 177 179C148 218 75 213 43 177C9 139 16 57 55 29C85 8 131 8 157 20' }));
      svg.append(svgNode('path', { class: 'monogram-ring monogram-ring-inner', d: 'M53 44C25 78 28 141 55 172C81 202 139 207 169 175C199 141 199 78 176 47' }));
      initials.forEach((letter, i) => {
        const text = svgNode('text', { x: i ? '135' : '83', y: i ? '159' : '143', 'text-anchor': 'middle', class: 'monogram-initial ' + (i ? 'monogram-initial-front' : 'monogram-initial-back') });
        text.textContent = letter; svg.append(text);
      });
      svg.append(svgNode('path', { class: 'monogram-flourish', d: 'M68 178C95 162 133 184 155 170M85 182C108 176 122 185 136 179' }));
      node.replaceChildren(svg);
    });
  }
  function updateDesign(cfg) {
    design = InvitationDesign.normalize(cfg.design);
    const visibility = { quote: ['quote-scene'], story: ['love-story-section'], gallery: ['gallery-section'], rsvp: ['rsvp-section'], gift: ['gift-section'], album: ['shared-album-section'], camera: ['pocket-cam-section'] };
    Object.entries(visibility).forEach(([key, ids]) => ids.forEach(id => {
      const node = $(id); if (!node) return;
      if (design.sections[key] === false) node.style.setProperty('display', 'none', 'important'); else node.style.removeProperty('display');
    }));
    const wishesSection = $('wishes-container')?.closest('section');
    if (wishesSection) { if (design.sections.rsvp === false) wishesSection.style.setProperty('display', 'none', 'important'); else wishesSection.style.removeProperty('display'); }
    document.body.classList.add('story-layout'); document.body.style.backgroundImage = 'none';
    const root = document.documentElement;
    Object.entries(design.colors).forEach(([key, value]) => root.style.setProperty('--' + key, value));
    const paper = design.colors.paper.slice(1);
    root.style.setProperty('--scene-tint', `rgba(${parseInt(paper.slice(0,2),16)},${parseInt(paper.slice(2,4),16)},${parseInt(paper.slice(4,6),16)},${design.backgroundWash})`);
    root.style.setProperty('--reveal-duration', design.motion.duration + 'ms');
    document.body.classList.toggle('motion-off', motionOff());
    const pair = $('hero-couple-title').textContent;
    $('desktop-couple').textContent = pair; $('closing-couple').textContent = pair;
    $('desktop-date').textContent = cfg.event?.dateFormatted || '';
    $('desktop-guest').textContent = $('cover-guest-name').textContent;
    renderMonogram(cfg);
    document.querySelectorAll('[data-scene]').forEach(node => background(node, design.backgrounds[node.dataset.scene] || cfg.event?.backgroundImage || ''));
    document.querySelectorAll('.scene-ornament-top').forEach(node => ornament(node, design.ornaments.top));
    document.querySelectorAll('.scene-ornament-bottom').forEach(node => ornament(node, design.ornaments.bottom));
    document.querySelectorAll('.profile-frame-overlay').forEach(node => ornament(node, design.profileFrame));
    ornament($('hero-foreground'), design.heroForeground);
    $('hero-scene').style.setProperty('--hero-shade', design.heroShade);
    for (const key of ['groom', 'bride']) {
      const photo = $(key + '-photo'); photo.style.objectPosition = `50% ${design.focal[key]}%`;
      if (!cfg.couple?.[key]?.photo) { photo.removeAttribute('src'); photo.classList.add('hidden'); $(key + '-icon').classList.remove('hidden'); }
      $(key + '-bio').textContent = cfg.couple?.[key]?.bio || '';
    }
    const urls = [cfg.couple?.coverPhoto, ...design.heroPhotos].map(InvitationDesign.media).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
    if (!urls.length && cfg.gallery?.[0]?.url) urls.push(InvitationDesign.media(cfg.gallery[0].url));
    const slides = $('hero-slides'); slides.replaceChildren(); clearInterval(slidesTimer);
    urls.forEach((url, i) => { const img = image(url, 'Foto pengantin ' + (i + 1), 'hero-slide' + (i === 0 ? ' active' : '')); img.loading = i ? 'lazy' : 'eager'; img.style.objectPosition = `50% ${design.focal.hero}%`; slides.append(img); });
    if (urls.length > 1 && !motionOff()) {
      let active = 0;
      slidesTimer = setInterval(() => {
        if (document.hidden || !isInvitationOpened) return;
        slides.children[active]?.classList.remove('active'); active = (active + 1) % urls.length; slides.children[active]?.classList.add('active');
      }, 6500);
    }
    const closing = design.closingPhoto || cfg.couple?.coverPhoto || urls[0];
    ornament($('closing-photo'), InvitationDesign.media(closing));
    $('closing-photo').style.objectPosition = `50% ${design.focal.closing}%`;
    observeRevealElements(); scheduleParallax();
  }
  const previousRender = window.renderInvitationData;
  window.renderInvitationData = cfg => { previousRender(cfg); updateDesign(cfg); };
  const previousOpen = window.openInvitation;
  window.openInvitation = function () {
    previousOpen(); document.body.classList.add('invitation-open'); $('invitation-main').inert = false;
    $('cover-screen').setAttribute('aria-hidden', 'true');
    setTimeout(() => { observeRevealElements(); $('hero-couple-title').focus({ preventScroll: true }); }, motionOff() ? 0 : 650);
  };
  function scheduleParallax() {
    if (parallaxFrame) return;
    parallaxFrame = requestAnimationFrame(() => {
      parallaxFrame = null;
      const enabled = isInvitationOpened && design?.motion.parallax && !motionOff();
      document.querySelectorAll('.parallax-photo').forEach(img => {
        const rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) return;
        img.style.transform = enabled ? `translateY(${Math.max(-12, Math.min(12, (innerHeight / 2 - rect.top - rect.height / 2) * 0.035))}px) scale(1.08)` : 'none';
      });
    });
  }
  addEventListener('scroll', scheduleParallax, { passive: true });
  reduced.addEventListener('change', () => updateDesign(currentConfig));
  const album = $('load-shared-album')?.closest('section');
  if (album) { album.id = 'shared-album-section'; $('closing-scene').before(album); }
  const footer = document.querySelector('main footer'); if (footer) $('closing-scene').after(footer);
  $('invitation-main').inert = !isInvitationOpened;
  renderInvitationData(currentConfig);

  /* Preview messages carry public presentation settings only. No guest writes. */
  if (new URLSearchParams(location.search).has('design-preview')) {
    document.body.classList.add('design-preview');
    const banner = make('div', 'preview-banner', 'Pratinjau desain · perubahan belum disimpan'); document.body.append(banner);
    const previousPost = WeddingApi.postToGas;
    WeddingApi.postToGas = function (action, payload) {
      if (!['getSettings', 'listWishes', 'listAlbum', 'getGuest', 'ping'].includes(action)) return Promise.resolve({ success: false, error: 'Tindakan ini tidak tersedia dalam pratinjau.' });
      return previousPost.call(this, action, payload);
    };
    let previewConfig = null;
    const previewRender = window.renderInvitationData;
    window.renderInvitationData = cfg => previewRender(previewConfig || cfg);
    addEventListener('message', event => {
      if (event.origin !== location.origin || event.source !== parent || event.data?.type !== 'wedding-design-preview') return;
      previewConfig = WeddingApi.mapSettingsToConfig(event.data.settings, WEDDING_CONFIG); previewRender(previewConfig);
    });
    parent.postMessage({ type: 'wedding-design-ready' }, location.origin);
  }
})();
