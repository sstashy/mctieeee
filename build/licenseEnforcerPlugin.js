
import fs from "fs";
import path from "path";
import crypto from "crypto";

export default function licenseEnforcerPlugin(options = {}) {
  const {
    licenseDir = "src/license",
    snapshotFile = ".license_snapshot.json",
    outputManifest = "license-manifest.json",
    failOnMismatch = true
  } = options;

  function sha256(buf) {
    return crypto.createHash("sha256").update(buf).digest("hex");
  }

  function readTree(dir) {
    const out = {};
    function walk(p, relBase) {
      const items = fs.readdirSync(p, { withFileTypes: true });
      for (const it of items) {
        if (it.name === snapshotFile) continue;
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

  return {
    name: "license-enforcer",
    apply: "build",
    buildStart() {
      const snapPath = path.join(process.cwd(), licenseDir, snapshotFile);
      if (!fs.existsSync(licenseDir)) {
        if (failOnMismatch) this.error(`[license-enforcer] ${licenseDir} yok.`);
        else this.warn(`[license-enforcer] ${licenseDir} yok.`);
      }
      if (!fs.existsSync(snapPath)) {
        this.error(`[license-enforcer] Snapshot dosyası eksik: ${snapPath}`);
      }
      const snapshot = JSON.parse(fs.readFileSync(snapPath, "utf8"));
      const current = readTree(path.join(process.cwd(), licenseDir));

      const issues = [];
      for (const [file, hash] of Object.entries(snapshot.files)) {
        if (!(file in current)) issues.push({ file, issue: "missing" });
        else if (current[file] !== hash)
          issues.push({ file, issue: "hash_mismatch", expected: hash, got: current[file] });
      }
      for (const f of Object.keys(current)) {
        if (!(f in snapshot.files)) issues.push({ file: f, issue: "unexpected_file" });
      }

      if (issues.length) {
        if (failOnMismatch) {
          this.error(`[license-enforcer] Lisans klasörü manipüle edilmiş: ${JSON.stringify(issues)}`);
        } else {
          this.warn(`[license-enforcer] Uyuşmazlıklar: ${JSON.stringify(issues)}`);
        }
      } else {
        this.info("[license-enforcer] Lisans snapshot doğrulandı.");
      }
    },
    generateBundle() {
      const snapPath = path.join(process.cwd(), licenseDir, snapshotFile);
      const snapshot = JSON.parse(fs.readFileSync(snapPath, "utf8"));
      this.emitFile({
        type: "asset",
        fileName: outputManifest,
        source: JSON.stringify(snapshot)
      });
    }
  };
}