const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WK_DIR = path.join(ROOT, 'week-notes');
if (!fs.existsSync(WK_DIR)) {
  console.error('week-notes directory not found:', WK_DIR);
  process.exit(2);
}

function weekStart(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu, 6=Sat
  const diff = day === 0 ? -3 : day === 1 ? -4 : day === 2 ? -5 : day === 3 ? -6 : day === 4 ? 0 : day === 5 ? 1 : 2;
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f);
    const d = path.join(dest, f);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) continue;
    fs.copyFileSync(s, d);
  }
}

(async function main(){
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = WK_DIR + '-backup-' + ts;
  console.log('Backing up', WK_DIR, 'to', backupDir);
  copyDir(WK_DIR, backupDir);

  const files = fs.readdirSync(WK_DIR).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f));
  const summary = { renamed: [], skipped: [], collisions: [] };

  for (const f of files) {
    const date = f.slice(0, -3);
    const actual = weekStart(date);
    const newName = actual + '.md';
    const oldPath = path.join(WK_DIR, f);
    const newPath = path.join(WK_DIR, newName);
    if (f === newName) {
      summary.skipped.push(f);
      continue;
    }
    if (!fs.existsSync(newPath)) {
      fs.renameSync(oldPath, newPath);
      summary.renamed.push({ from: f, to: newName });
      continue;
    }
    // collision: newPath exists
    const oldContent = fs.readFileSync(oldPath, 'utf8');
    const newContent = fs.readFileSync(newPath, 'utf8');
    if (oldContent === newContent) {
      // identical, remove old
      fs.unlinkSync(oldPath);
      summary.renamed.push({ from: f, to: newName, note: 'identical, old removed' });
      continue;
    }
    // different content — keep both, create a suffixed copy
    let idx = 1;
    let candidate;
    do {
      candidate = path.join(WK_DIR, `${actual}__dup${idx}.md`);
      idx++;
    } while (fs.existsSync(candidate));
    fs.renameSync(oldPath, candidate);
    summary.collisions.push({ from: f, to: path.basename(candidate) });
  }

  console.log('Migration complete. Summary:');
  console.log(JSON.stringify(summary, null, 2));
  console.log('\nBackup saved to', backupDir);
})();
