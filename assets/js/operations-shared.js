/* Shared invitation credentials and operations settings. Loaded before page controllers. */
(() => {
  'use strict';
  const tokens = new Map();
  const params = new URLSearchParams(location.search);
  const initialCode = (params.get('code') || '').toUpperCase();
  const initialToken = params.get('token') || '';
  if (initialCode && initialToken) tokens.set(initialCode, initialToken);
  const tokenKey = code => 'wedding_guest_access_v1_' + String(code).toUpperCase();
  const tokenFor = code => {
    const key = String(code || '').toUpperCase();
    try { return tokens.get(key) || sessionStorage.getItem(tokenKey(key)) || ''; } catch (_) { return tokens.get(key) || ''; }
  };
  const remember = (code, token) => {
    if (!code || !token) return;
    tokens.set(String(code).toUpperCase(), token);
    // Guest tokens remain in this tab session; staff lists stay in memory.
    if (!/dashboard|reception/.test(location.pathname)) try { sessionStorage.setItem(tokenKey(code), token); } catch (_) {}
  };
  remember(initialCode, initialToken);
  WeddingApi.guestToken = tokenFor;
  WeddingApi.rememberGuestToken = remember;
  const build = WeddingApi.buildInviteUrl.bind(WeddingApi);
  WeddingApi.buildInviteUrl = (code, name) => {
    const url = new URL(build(code, name), location.href);
    const token = tokenFor(code); if (token) url.searchParams.set('token', token);
    return url.href;
  };
  const post = WeddingApi.postToGas.bind(WeddingApi);
  WeddingApi.postToGas = async (action, data = {}) => {
    const payload = { ...data };
    if (['getGuest', 'submitRsvp', 'uploadPocketPhoto'].includes(action)) payload.guestToken = data.guestToken || tokenFor(data.code);
    const result = await post(action, payload);
    if (result.guests) result.guests.forEach(g => remember(g.code, g.inviteToken));
    if (result.guest?.inviteToken) remember(result.guest.code, result.guest.inviteToken);
    return result;
  };
  WeddingApi.qrPayload = code => {
    const token = tokenFor(code);
    return token ? 'W1:' + String(code).toUpperCase() + ':' + token : String(code).toUpperCase();
  };
  WeddingApi.cameraPolicy = settings => {
    const s = settings || WeddingApi.getCachedSettings() || {};
    return { quota: Math.min(100, Math.max(1, Number(s.CAMERA_QUOTA) || 18)), start: s.CAMERA_START || '', end: s.CAMERA_END || '' };
  };
})();
