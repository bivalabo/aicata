/**
 * sync-watch.js v3 — FUSE マウント環境用ファイル変更検出スクリプト
 *
 * 問題: VM (Cowork) からファイルを書き込むと、ファイル内容は変わるが
 *       ホスト macOS 側の FSEvents が発火しない。
 *       Turbopack のファイルウォッチャーが変更を検出できない。
 *
 * v1: utimesSync (touch) → FSEvents 発火せず ✗
 * v2: writeFileSync (同じ内容で書き戻し) → FUSE 上では変化なしと見なされる ✗
 * v3: 2段階書き込み方式
 *   1. ファイル内容の MD5 チェックサムを定期的に比較
 *   2. 変更を検出したら：
 *      a. まずファイル末尾にマーカーコメントを追加（内容を変える）
 *      b. 50ms 待機
 *      c. 元の正しい内容で書き戻す
 *   3. これにより Turbopack が「ファイルが変わった」と認識する
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SRC_DIR = path.join(__dirname, "..", "src");
const CONFIG_FILES = [
  path.join(__dirname, "..", "next.config.ts"),
  path.join(__dirname, "..", "tailwind.config.ts"),
];
const POLL_INTERVAL = 1500;
const EXTENSIONS = /\.(tsx?|css|json)$/;
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git"]);

// ファイルごとのチェックサムキャッシュ
const checksums = new Map();
let isFirstRun = true;

function walkDir(dir) {
  const files = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (EXTENSIONS.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function computeHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return { hash: crypto.createHash("md5").update(content).digest("hex"), content };
  } catch {
    return { hash: null, content: null };
  }
}

/**
 * 2段階書き込みで Turbopack にファイル変更を通知する。
 * Step 1: ファイル末尾にダミーコメントを追加（バイト列を変える）
 * Step 2: 50ms 後に正しい内容で書き戻す
 * → Turbopack は Step 1 or Step 2 のどちらかで変更を検出する
 */
function triggerFileChange(filePath, correctContent) {
  try {
    // Step 1: 内容を一時的に変更（ダミーマーカーを追加）
    const marker = `\n/* __sync_trigger_${Date.now()} */`;
    fs.writeFileSync(filePath, correctContent + marker);

    // Step 2: 50ms 後に正しい内容で書き戻す
    setTimeout(() => {
      try {
        fs.writeFileSync(filePath, correctContent);
      } catch {
        // ignore
      }
    }, 50);

    return true;
  } catch (err) {
    return false;
  }
}

function checkAndSync() {
  const srcFiles = walkDir(SRC_DIR);
  const configFiles = CONFIG_FILES.filter((f) => {
    try { fs.statSync(f); return true; } catch { return false; }
  });
  const files = [...srcFiles, ...configFiles];
  let synced = 0;

  // 削除されたファイルのクリーンアップ
  const currentFiles = new Set(files);
  for (const cached of checksums.keys()) {
    if (!currentFiles.has(cached)) {
      checksums.delete(cached);
    }
  }

  for (const file of files) {
    const { hash, content } = computeHash(file);
    if (!hash || !content) continue;

    const prev = checksums.get(file);
    checksums.set(file, hash);

    // 初回はキャッシュ構築のみ
    if (isFirstRun) continue;

    if (prev && prev !== hash) {
      if (triggerFileChange(file, content)) {
        synced++;
        const relative = path.relative(path.join(__dirname, ".."), file);
        console.log(`  ✓ ${relative} (2-step trigger)`);
      }
    }
  }

  if (isFirstRun) {
    console.log(`[sync-watch] 初回スキャン完了: ${files.length} ファイルを監視中`);
    isFirstRun = false;
    return;
  }

  if (synced > 0) {
    console.log(`[sync-watch] ${synced} ファイルの変更を検出・反映しました`);
  }
}

// 初回スキャン
checkAndSync();

// ポーリング開始
const intervalId = setInterval(checkAndSync, POLL_INTERVAL);

console.log(`[sync-watch v3] FUSE ファイル同期を開始 (${POLL_INTERVAL / 1000}秒間隔)`);
console.log(`[sync-watch v3] 方式: 2-step trigger（ダミー書込→正しい内容で書戻し）`);
console.log(`[sync-watch v3] 監視ディレクトリ: ${SRC_DIR}`);
console.log(`[sync-watch v3] Ctrl+C で停止\n`);

// グレースフルシャットダウン
process.on("SIGINT", () => {
  clearInterval(intervalId);
  console.log("\n[sync-watch] 停止しました");
  process.exit(0);
});

process.on("SIGTERM", () => {
  clearInterval(intervalId);
  process.exit(0);
});
