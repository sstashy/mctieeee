/* Central API client (yalınlaştırılmış + site-status cache-bust) */

const DEFAULT_TIMEOUT = 12000;
const API_BASE = (import.meta?.env?.VITE_API_BASE || "https://api.sstashy.io").replace(/\/+$/, "");

const suppressUserErrors = true;

function userError(msg) {
  if (suppressUserErrors) return null;
  return msg || null;
}

/* --- Internal State --- */
let authToken = null;
let lastPlayersController = null;
const playersCache = new Map();
const PLAYERS_TTL_MS = 60_000;

/* --- Auth Helpers --- */
export function setAuthToken(token) { authToken = token || null; }
export function clearAuthToken() { authToken = null; }

/* --- Utils --- */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const tryParseJson = (text) => {
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { raw: text }; }
};

class ApiError extends Error {
  constructor(message, { status, code, cause, payload } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
    this.cause = cause;
  }
}

/* --- Core Request --- */
async function request(path, {
  method = "GET",
  body,
  signal,
  timeout = DEFAULT_TIMEOUT,
  headers = {},
  retry
} = {}) {

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  const compositeSignal = mergeSignals(signal, ctrl.signal);

  const finalHeaders = {
    "Accept": "application/json, text/plain, */*",
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
    ...headers
  };

  const doFetch = async (attempt = 0) => {
    try {
      const url = path.startsWith("http") ? path : API_BASE + path;
      const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: compositeSignal,
        cache: "no-store"
      });

      let rawText = "";
      let data = null;
      try {
        rawText = await res.text();
        if (rawText) data = tryParseJson(rawText);
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          (data && data.error && (data.error.message || data.error.code || data.error)) ||
          data?.error ||
          `HTTP hata: ${res.status}`;
        throw new ApiError(msg, { status: res.status, payload: data });
      }

      // unwrap { ok:true, data:{...} }
      if (data && typeof data === "object" && data !== null &&
          Object.prototype.hasOwnProperty.call(data, "ok") &&
          Object.prototype.hasOwnProperty.call(data, "data")) {
        data = data.data;
      }

      if (data == null) data = {};
      return { ok: true, status: res.status, data, error: null };

    } catch (err) {
      if (err.name === "AbortError") {
        throw new ApiError("ABORTED", { code: "ABORTED", cause: err });
      }
      if (err instanceof ApiError) {
        if (retry && shouldRetry(err.status, attempt, retry.attempts)) {
          await sleep(calcBackoff(attempt, retry.backoffBase));
          return doFetch(attempt + 1);
        }
        throw err;
      }
      if (retry && shouldRetry(undefined, attempt, retry.attempts)) {
        await sleep(calcBackoff(attempt, retry.backoffBase));
        return doFetch(attempt + 1);
      }
      throw new ApiError(err.message || "NETWORK", { code: "NETWORK", cause: err });
    }
  };

  try {
    return await doFetch();
  } finally {
    clearTimeout(timer);
  }
}

function shouldRetry(status, attempt, max) {
  if (attempt >= (max || 0)) return false;
  if (status == null) return true;      // network / abort dışı bilinmeyen
  return status >= 500;
}
function calcBackoff(attempt, base = 300) {
  const exp = base * Math.pow(2, attempt);
  const jitter = Math.random() * base;
  return exp + jitter;
}
function mergeSignals(a, b) {
  if (!a) return b;
  if (!b) return a;
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  a.addEventListener("abort", onAbort);
  b.addEventListener("abort", onAbort);
  return ctrl.signal;
}

/* --- Shape Normalization --- */
function normalizeAuthShape(raw) {
  if (!raw || typeof raw !== "object") return { success: false };
  const token = raw.token;
  const user =
    raw.user && typeof raw.user === "object"
      ? raw.user
      : raw.user
        ? { username: raw.user }
        : null;
  const success =
    raw.success === true ||
    !!token ||
    (user && (user.id || user.username));
  return { success, token: token || null, user };
}

/* ========== Public API Methods ========== */

export async function login(username, password, opts = {}) {
  try {
    const res = await request("/auth/login.php", {
      method: "POST",
      body: { username, password },
      ...opts
    });
    const norm = normalizeAuthShape(res.data);
    return {
      ok: norm.success,
      status: res.status,
      data: res.data,
      token: norm.token,
      user: norm.user,
      error: userError(norm.success ? null : (res.data?.error || "Giriş başarısız"))
    };
  } catch (err) {
    return {
      ok: false,
      status: err.status || 0,
      error: userError(err.message),
      token: null,
      user: null,
      data: null
    };
  }
}

export async function register(username, password, opts = {}) {
  try {
    const res = await request("/auth/register.php", {
      method: "POST",
      body: { username, password },
      ...opts
    });
    const norm = normalizeAuthShape(res.data);
    return {
      ok: norm.success || !!res.data,
      status: res.status,
      data: res.data,
      token: norm.token,
      user: norm.user,
      error: userError(norm.success ? null : (res.data?.error || "Kayıt başarısız"))
    };
  } catch (err) {
    return {
      ok: false,
      status: err.status || 0,
      error: userError(err.message),
      token: null,
      user: null,
      data: null
    };
  }
}

export async function getPlayers(mode, {
  force = false,
  cacheTtl = PLAYERS_TTL_MS,
  abortPrevious = true,
  retry = { attempts: 1, backoffBase: 250 }
} = {}) {
  const key = String(mode || "default");
  const cached = playersCache.get(key);
  const now = Date.now();

  if (!force && cached && (now - cached.timestamp) < cacheTtl) {
    return { ok: true, status: 200, data: cached.data, error: null, cached: true };
  }

  if (abortPrevious && lastPlayersController) {
    lastPlayersController.abort();
  }
  lastPlayersController = new AbortController();

  try {
    const res = await request(`/api.php?route=tiers&mode=${encodeURIComponent(mode)}`, {
      signal: lastPlayersController.signal,
      retry
    });
    if (res.ok) playersCache.set(key, { timestamp: now, data: res.data });
    return { ...res, cached: false, error: null };
  } catch (err) {
    if (err instanceof ApiError && err.code === "ABORTED") {
      return { ok: false, status: err.status, error: userError(null), data: null, aborted: true };
    }
    return { ok: false, status: err.status || 0, error: userError(null), data: null };
  }
}

// ... (dosyanın kalanını aynen bırak)

const STATUS_URL = import.meta.env.DEV
  ? "/_status/site-status.php"
  : "https://api.sstashy.io/site-status.php";

export async function getSiteStatus({ signal } = {}) {
  const qs = "_=" + Date.now();
  try {
    const res = await fetch(STATUS_URL + "?" + qs, {
      cache: "no-store",
      signal,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Accept": "application/json"
      }
    });
    const text = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch { /* plain text */ }

    if (!res.ok) {
      return { ok: false, status: res.status, data: null, raw: text };
    }
    // unwrap
    if (parsed && parsed.ok && parsed.data) {
      return { ok: true, status: res.status, data: parsed.data };
    }
    return { ok: true, status: res.status, data: parsed ?? {} };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e.message };
  }
}

export async function getComments(playerId, opts = {}) {
  if (playerId == null) {
    return { ok: false, status: 0, error: userError(null), data: [], aborted: false };
  }
  try {
    const res = await request(`/api.php?route=comments&player_id=${encodeURIComponent(playerId)}`, opts);
    const arr = Array.isArray(res.data) ? res.data : (res.data?.comments || []);
    return { ok: true, status: res.status, data: arr, error: null, aborted: false };
  } catch (err) {
    if (err instanceof ApiError && (err.code === "ABORTED" || err.message === "ABORTED")) {
      return { ok: false, status: 0, error: null, data: [], aborted: true };
    }
    return { ok: false, status: err.status || 0, error: userError(null), data: [], aborted: false };
  }
}

export async function addComment(playerId, userId, username, comment, opts = {}) {
  if (!comment || !comment.trim()) {
    return { ok: false, status: 0, error: userError(null), data: null };
  }
  try {
    const res = await request("/api.php?route=add-comment", {
      method: "POST",
      body: { player_id: playerId, user_id: userId, username, comment: comment.trim() },
      ...opts
    });
    const createdComment = res.data?.comment || res.data;
    return { ok: true, status: res.status, data: createdComment, error: null };
  } catch (err) {
    if (err instanceof ApiError && err.code === "ABORTED") {
      return { ok: false, status: 0, error: null, data: null, aborted: true };
    }
    return { ok: false, status: err.status || 0, error: userError(null), data: null };
  }
}

/* --- Cache Helpers --- */
export function clearPlayersCache(mode) {
  if (mode) playersCache.delete(String(mode));
  else playersCache.clear();
}
export function prefetchPlayers(mode) {
  getPlayers(mode, { force: true, abortPrevious: false }).catch(() => {});
}