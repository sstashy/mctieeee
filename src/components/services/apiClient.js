/*
 * Central API Client + Lisans / Kill Switch / Short Token Rotation
 * Handshake: https://license.sstashy.io/license/handshake.php
 * Refresh:   https://license.sstashy.io/license/refresh.php
 */

import {
  LICENSE_HANDSHAKE_URL,
  LICENSE_REFRESH_URL,
  STATIC_LICENSE_ID,
  APP_VERSION,
  BUILD_HASH,
  API_EXPECTED_VERSION,
  FALLBACK_ROTATE_AFTER_SEC,
} from './licenseConfig';

// Normal API tabanı (oyuncular vb.)
const DEFAULT_TIMEOUT = 12000;
const API_BASE = (import.meta.env.VITE_API_BASE || 'https://api.sstashy.io').replace(/\/+$/, '');

const suppressUserErrors = true;
const userError = (msg) => (suppressUserErrors ? null : msg || null);

// ---- Dahili Durum ----
let authToken = null; // Kullanıcı oturum token (login)
let shortToken = null; // Lisans kısa token
let licenseId = STATIC_LICENSE_ID || null;
let tokenExpiresAt = 0;
let rotateAfterSec = 0;
let features = [];
let killFlag = false;
let rotating = false;
let globalKilled = false;
let lastHandshakeTs = 0;

let lastPlayersController = null;
const playersCache = new Map();
const PLAYERS_TTL_MS = 60_000;

// Callback’ler (UI entegre)
let onKillCallback = null;
let onLicenseChange = null;

// ---------- Utils ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tryParseJson = (t) => {
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return { raw: t };
  }
};
const nowSec = () => Math.floor(Date.now() / 1000);

function computeFingerprint() {
  const ua = navigator.userAgent.slice(0, 40);
  const src = window.location.hostname + '|' + BUILD_HASH + '|' + ua;
  let h = 0;
  for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

// ---------- Dış erişim ----------
export function setAuthToken(token) {
  authToken = token || null;
}
export function clearAuthToken() {
  authToken = null;
}

export function getLicenseInfo() {
  return {
    licenseId,
    features: [...features],
    kill: killFlag,
    valid: !!shortToken && !globalKilled && !killFlag,
    expiresAt: tokenExpiresAt,
  };
}
export function setOnKill(cb) {
  onKillCallback = cb;
}
export function setOnLicenseChange(cb) {
  onLicenseChange = cb;
}
export function hasFeature(flag) {
  return features.includes(flag);
}

// ---------- Kill ----------
function markKilled(reason = 'killed') {
  if (globalKilled) return;
  globalKilled = true;
  console.warn('[apiClient] Global kill:', reason);
  if (onKillCallback) {
    try {
      onKillCallback(reason);
    } catch {}
  } else {
    document.body.innerHTML = `
      <div style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f1117;color:#f87171;text-align:center;padding:24px">
        <div>
          <h1 style="margin:0 0 12px;font-size:28px;">Lisans Devre Dışı</h1>
          <p style="font-size:14px;line-height:1.5;max-width:520px;margin:0 0 18px;opacity:.85">
            Lisans iptal edildi veya kill switch tetiklendi. (${reason})
          </p>
          <button onclick="location.reload()" style="background:#2563eb;color:#fff;border:none;padding:8px 16px;border-radius:8px;font-weight:600;cursor:pointer">
            Yeniden Dene
          </button>
        </div>
      </div>`;
  }
}

// ---------- Handshake ----------
export async function apiBoot({ force = false, providedLicenseId } = {}) {
  if (globalKilled) return false;
  const since = Date.now() - lastHandshakeTs;
  if (!force && since < 4000 && shortToken) return true;

  lastHandshakeTs = Date.now();

  if (providedLicenseId) {
    licenseId = providedLicenseId;
  }
  if (!licenseId) {
    console.warn('[apiClient] licenseId yok; STATIC_LICENSE_ID veya parametre ile ver.');
  }

  const fp = computeFingerprint();
  const body = {
    domain: window.location.hostname,
    appVersion: APP_VERSION,
    buildHash: BUILD_HASH,
    fingerprint: fp,
  };
  if (licenseId) body.licenseId = licenseId;

  try {
    const res = await rawFetchAbsolute(LICENSE_HANDSHAKE_URL, {
      method: 'POST',
      body,
      timeout: 10000,
      ignoreAuth: true,
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 410) {
        markKilled(res.error?.code || res.error?.message || 'revoked');
      }
      return false;
    }

    const d = res.data;

    licenseId = d.licenseId;
    shortToken = d.shortToken;
    tokenExpiresAt = d.expiresAt;
    rotateAfterSec = d.rotateAfter || FALLBACK_ROTATE_AFTER_SEC;
    features = Array.isArray(d.features) ? d.features : [];
    killFlag = !!d.kill;

    if (killFlag) {
      markKilled('server_kill_flag');
      return false;
    }
    if (d.apiVersion && d.apiVersion !== API_EXPECTED_VERSION) {
      console.warn(
        '[apiClient] apiVersion mismatch server=',
        d.apiVersion,
        ' expected=',
        API_EXPECTED_VERSION,
      );
    }

    scheduleRotation();
    if (onLicenseChange)
      try {
        onLicenseChange(getLicenseInfo());
      } catch {}
    return true;
  } catch (e) {
    console.error('[apiClient] Handshake error:', e);
    return false;
  }
}

// ---------- Refresh ----------
async function rotateToken() {
  if (rotating || globalKilled) return;
  rotating = true;
  try {
    if (!licenseId || !shortToken) {
      rotating = false;
      return;
    }
    const res = await rawFetchAbsolute(LICENSE_REFRESH_URL, {
      method: 'POST',
      body: { licenseId },
      timeout: 9000,
    });
    if (!res.ok) {
      if (res.status === 403 || res.status === 410) {
        markKilled(res.error?.code || 'revoked');
      }
      return;
    }
    const d = res.data;
    shortToken = d.shortToken;
    tokenExpiresAt = d.expiresAt;
    rotateAfterSec = d.rotateAfter || rotateAfterSec;
    features = Array.isArray(d.features) ? d.features : features;
    killFlag = !!d.kill;
    if (killFlag) {
      markKilled('server_kill_flag');
      return;
    }
    scheduleRotation();
    if (onLicenseChange)
      try {
        onLicenseChange(getLicenseInfo());
      } catch {}
  } catch (e) {
    console.warn('[apiClient] rotateToken err:', e.message);
    setTimeout(() => rotateToken().catch(() => {}), 8000);
  } finally {
    rotating = false;
  }
}

function scheduleRotation() {
  if (!shortToken || !tokenExpiresAt) return;
  const now = nowSec();
  const ttl = tokenExpiresAt - now;
  if (ttl <= 0) {
    rotateToken().catch(() => {});
    return;
  }
  // rotation süresi: expires - 15sn veya rotateAfterSec
  const rotateIn = Math.max(10, Math.min(ttl - 15, rotateAfterSec || Math.floor(ttl / 2)));
  setTimeout(() => {
    rotateToken().catch(() => {});
  }, rotateIn * 1000);
}

// ---------- Düşük Seviye Fetch (ABSOLUTE) ----------
async function rawFetchAbsolute(
  url,
  { method = 'GET', body, headers = {}, timeout = DEFAULT_TIMEOUT, ignoreAuth = false } = {},
) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);

  const finalHeaders = {
    Accept: 'application/json, text/plain, */*',
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(licenseId ? { 'X-License-ID': licenseId } : {}),
    'X-Client-Version': APP_VERSION,
    'X-Client-Fingerprint': computeFingerprint(),
    ...(shortToken && !ignoreAuth ? { Authorization: `Bearer ${shortToken}` } : {}),
    ...(authToken ? { 'X-User-Auth': `Bearer ${authToken}` } : {}),
    ...headers,
  };

  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      cache: 'no-store',
    });

    let rawText = '';
    let data = null;
    try {
      rawText = await res.text();
      if (rawText) data = tryParseJson(rawText);
    } catch {
      /* ignore */
    }

    if (!res.ok) {
      const code = data?.error?.code || data?.error || data?.code;
      if (res.status === 403 && (code === 'revoked' || code === 'license_revoked')) {
        markKilled('revoked');
      } else if (res.status === 410 && (code === 'killed' || code === 'license_killed')) {
        markKilled('killed');
      }
      return {
        ok: false,
        status: res.status,
        data,
        error: { message: data?.message || data?.error || `HTTP_${res.status}`, code },
      };
    }

    if (
      data &&
      typeof data === 'object' &&
      Object.prototype.hasOwnProperty.call(data, 'ok') &&
      Object.prototype.hasOwnProperty.call(data, 'data')
    ) {
      data = data.data;
    }

    return { ok: true, status: res.status, data, error: null };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: { message: e.name === 'AbortError' ? 'ABORTED' : e.message || 'NETWORK' },
    };
  } finally {
    clearTimeout(timer);
  }
}

async function rawFetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : API_BASE + path;
  return rawFetchAbsolute(url, opts);
}

async function request(path, opts = {}) {
  if (!shortToken && !opts.ignoreAuth) {
    await apiBoot();
  }
  return rawFetch(path, opts);
}

export async function ensureLicenseBoot({ licenseId: lic } = {}) {
  await apiBoot({ providedLicenseId: lic });
  return getLicenseInfo();
}

export async function login(username, password, opts = {}) {
  const res = await request('/auth/login.php', {
    method: 'POST',
    body: { username, password },
    ...opts,
  });
  if (res.ok && res.data?.token) setAuthToken(res.data.token);
  return {
    ok: res.ok,
    status: res.status,
    data: res.data,
    token: res.data?.token || null,
    error: userError(res.ok ? null : res.error?.message),
  };
}

export async function register(username, password, opts = {}) {
  const res = await request('/auth/register.php', {
    method: 'POST',
    body: { username, password },
    ...opts,
  });
  if (res.ok && res.data?.token) setAuthToken(res.data.token);
  return {
    ok: res.ok,
    status: res.status,
    data: res.data,
    token: res.data?.token || null,
    error: userError(res.ok ? null : res.error?.message),
  };
}

// ---------- Players (cache) ----------
export async function getPlayers(
  mode,
  { force = false, cacheTtl = PLAYERS_TTL_MS, abortPrevious = true } = {},
) {
  const key = String(mode || 'default');
  const cached = playersCache.get(key);
  const now = Date.now();
  if (!force && cached && now - cached.timestamp < cacheTtl) {
    return { ok: true, status: 200, data: cached.data, cached: true, error: null };
  }
  if (abortPrevious && lastPlayersController) lastPlayersController.abort();
  lastPlayersController = new AbortController();

  const res = await request(`/api.php?route=tiers&mode=${encodeURIComponent(mode)}`, {
    signal: lastPlayersController.signal,
  });
  if (res.ok) playersCache.set(key, { timestamp: now, data: res.data });
  return { ...res, cached: false };
}

export function clearPlayersCache(mode) {
  if (mode) playersCache.delete(String(mode));
  else playersCache.clear();
}
export function prefetchPlayers(mode) {
  getPlayers(mode, { force: true, abortPrevious: false }).catch(() => {});
}

// ---------- Comments ----------
export async function getComments(playerId) {
  if (playerId == null) {
    return { ok: false, status: 0, data: [], error: userError(null) };
  }
  const res = await request(`/api.php?route=comments&player_id=${encodeURIComponent(playerId)}`);
  if (!res.ok) {
    if (res.error?.message === 'ABORTED') {
      return { ok: false, status: 0, data: [], error: null, aborted: true };
    }
    return { ok: false, status: res.status, data: [], error: userError(null) };
  }
  const arr = Array.isArray(res.data) ? res.data : res.data?.comments || [];
  return { ok: true, status: res.status, data: arr, error: null };
}

export async function addComment(playerId, userId, username, comment) {
  if (!comment || !comment.trim()) {
    return { ok: false, status: 0, data: null, error: userError(null) };
  }
  const res = await request('/api.php?route=add-comment', {
    method: 'POST',
    body: { player_id: playerId, user_id: userId, username, comment: comment.trim() },
  });
  if (!res.ok) {
    return { ok: false, status: res.status, data: null, error: userError(null) };
  }
  const created = res.data?.comment || res.data;
  return { ok: true, status: res.status, data: created, error: null };
}

// ---------- Site Status ----------
const STATUS_URL = import.meta.env.DEV ? '/_status/site-status.php' : API_BASE + '/site-status.php';

export async function getSiteStatus({ signal } = {}) {
  const qs = '_=' + Date.now();
  try {
    const res = await fetch(STATUS_URL + '?' + qs, {
      cache: 'no-store',
      signal,
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    });
    const text = await res.text();
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {}
    if (!res.ok) {
      return { ok: false, status: res.status, data: null, raw: text };
    }
    if (parsed && parsed.ok && parsed.data) {
      return { ok: true, status: res.status, data: parsed.data };
    }
    return { ok: true, status: res.status, data: parsed ?? {} };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e.message };
  }
}
