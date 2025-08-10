export const LICENSE_HANDSHAKE_URL =
  import.meta.env.VITE_LICENSE_HANDSHAKE_URL || 'https://license.sstashy.io/license/handshake.php';

export const LICENSE_REFRESH_URL =
  import.meta.env.VITE_LICENSE_REFRESH_URL || 'https://license.sstashy.io/license/refresh.php';

export const STATIC_LICENSE_ID = import.meta.env.VITE_LICENSE_ID || null;

export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.0.1';

export const BUILD_HASH = import.meta.env.VITE_BUILD_HASH || 'dev-hash';

export const API_EXPECTED_VERSION = '1.0.0';

export const FALLBACK_ROTATE_AFTER_SEC = 5 * 60;
