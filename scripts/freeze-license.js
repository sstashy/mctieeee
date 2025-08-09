import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = process.cwd();
const LICENSE_DIR = path.join(ROOT, "src", "license");
const SNAPSHOT_FILE = path.join(LICENSE_DIR, ".license_snapshot.json");

if (!fs.existsSync(LICENSE_DIR)) {
  console.error("src/license klasörü yok. Önce oluştur.");
  process.exit(1);
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function readTree(dir) {
  const out = {};
  function walk(p, relBase) {
    const items = fs.readdirSync(p, { withFileTypes: true });
    for (const it of items) {
      if (it.name === ".license_snapshot.json") continue;
      const full = path.join(p, it.name);
      const rel = path.join(relBase, it.name).replace(/\\/g, "/");
      if (it.isDirectory()) walk(full, rel);
      else {
        const content = fs.readFileSync(full);
        out[rel] = sha256(content);
      }
    }
  }
  walk(dir, "");
  return out;
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  files: readTree(LICENSE_DIR)
};

fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2));
console.log("[license:freeze] Snapshot yazıldı:", SNAPSHOT_FILE);