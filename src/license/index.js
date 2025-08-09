export const LICENSE_GUARD_VERSION = "1.0.0";
const MANIFEST_URL = "/license-manifest.json";

function panic(msg) {
  console.error("[LICENSE GUARD PANIC]", msg);
  document.documentElement.innerHTML = `
    <style>
      body{margin:0;font-family:system-ui;background:#0d1117;color:#f87171;
      display:flex;align-items:center;justify-content:center;height:100vh;padding:24px;text-align:center}
      h1{font-size:30px;margin:0 0 12px}
      p{max-width:520px;line-height:1.5;font-size:14px;margin:0}
    </style>
    <div>
      <h1>Lisans Guard Eksik</h1>
      <p>${msg || "Zorunlu lisans bileşenleri doğrulanamadı."}</p>
    </div>
  `;
  throw new Error("LICENSE_GUARD_FAIL: " + msg);
}

if (typeof window !== "undefined") {
  if (window.__LICENSE_GUARD_ACTIVE) {
    panic("Duplicate guard yüklemesi");
  }
  window.__LICENSE_GUARD_ACTIVE = true;
  window.__LICENSE_GUARD_TS = Date.now();
  window.__LICENSE_GUARD_VER = LICENSE_GUARD_VERSION;
}

export async function verifyLicenseIntegrity() {
  if (import.meta.env.DEV) return true;
  try {
    const res = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!res.ok) panic("Manifest alınamadı");
    const json = await res.json().catch(() => null);
    if (!json?.files || Object.keys(json.files).length === 0) {
      panic("Manifest boş veya bozuk");
    }
    return true;
  } catch (e) {
    panic("Integrity hata: " + e.message);
  }
}

export function requireLicenseGuard() {
  if (!window.__LICENSE_GUARD_ACTIVE) {
    panic("Global guard işareti yok");
  }
  return true;
}

export function hasLicensedFeature(feature) {
  return feature !== "blocked_demo";
}