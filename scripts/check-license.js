import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const LICENSE_DIR = path.join(ROOT, 'src', 'license');
const SNAPSHOT_FILE = path.join(LICENSE_DIR, '.license_snapshot.json');

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function readTree(dir) {
  const out = {};
  function walk(p, relBase) {
    const items = fs.readdirSync(p, { withFileTypes: true });
    for (const it of items) {
      if (it.name === '.license_snapshot.json') continue;
      const full = path.join(p, it.name);
      const rel = path.join(relBase, it.name).replace(/\\/g, '/');
      if (it.isDirectory()) walk(full, rel);
      else {
        const content = fs.readFileSync(full);
        out[rel] = sha256(content);
      }
    }
  }
  walk(dir, '');
  return out;
}

function fail(msg) {
  console.error('[license-check] ERROR:', msg);
  process.exit(1);
}

if (!fs.existsSync(LICENSE_DIR)) fail('src/license klasörü yok!');

if (!fs.existsSync(SNAPSHOT_FILE)) {
  fail(".license_snapshot.json yok. Önce 'npm run license:freeze' çalıştır.");
}

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
const current = readTree(LICENSE_DIR);

const issues = [];

for (const [file, hash] of Object.entries(snapshot.files)) {
  if (!(file in current)) {
    issues.push({ file, issue: 'missing' });
  } else if (current[file] !== hash) {
    issues.push({ file, issue: 'hash_mismatch', expected: hash, got: current[file] });
  }
}

// İstersen yeni dosyaları da engelle:
for (const f of Object.keys(current)) {
  if (!(f in snapshot.files)) {
    issues.push({ file: f, issue: 'unexpected_file' });
  }
}

if (issues.length) {
  console.error('[license-check] Lisans modülü bütünlük sorunları:');
  for (const it of issues) console.error(' -', it);
  fail('Lisans klasörü manipüle edilmiş görünüyor.');
} else {
  console.log('[license-check] OK');
}
