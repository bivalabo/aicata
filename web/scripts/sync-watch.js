/**
 * sync-watch.js — FUSE マウント環境用ファイル変更検出スクリプト
 *
 * 問題: VM (Cowork) からファイルを書き込むと、ファイル内容は変わるが
 *       ホスト macOS 側の inotify/FSEvents が発火しない。
 *       そのため webpack の polling watcher も mtime 変更を検出できない。
 *
 * 解決: ファイル内容の MD5 チェックサムを定期的に比較し、
 *       内容が変わったファイルだけ touch して mtime を強制更新する。
 *       これで webpack が変更を検出してホットリロードが発動する。
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SRC_DIR = path.join(__dirname, "..", "src");
const POLL_INTERVAL = 2000; // 2秒ごとにチェック
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
    return crypto.createHash("md5").update(content).digest("hex");
  } catch {
    return null;
  }
}

function checkAndTouch() {
  const files = walkDir(SRC_DIR);
  let touched = 0;

  // 削除されたファイルのクリーンアップ
  const currentFiles = new Set(files);
  for (const cached of checksums.keys()) {
    if (!currentFiles.has(cached)) {
      checksums.delete(cached);
    }
  }

  for (const file of files) {
    const hash = computeHash(file);
    if (!hash) continue;

    const prev = checksums.get(file);
    checksums.set(file, hash);

    // 初回はキャッシュ構築のみ（touch しない）
    if (isFirstRun) continue;

    if (prev && prev !== hash) {
      try {
        const now = new Date();
        fs.utimesSync(file, now, now);
        touched++;
        const relative = path.relative(path.join(__dirname, ".."), file);
        console.log(`  ✓ ${relative}`);
      } catch (err) {
        // touch 失敗は無視
      }
    }
  }

  if (isFirstRun) {
    console.log(`[sync-watch] 初回スキャン完了: ${files.length} ファイルを監視中`);
    isFirstRun = false;
    return;
  }

  if (touched > 0) {
    console.log(`[sync-watch] ${touched} ファイルの変更を検出・反映しました`);
  }
}

// 初回スキャン
checkAndTouch();

// ポーリング開始
const intervalId = setInterval(checkAndTouch, POLL_INTERVAL);

console.log(`[sync-watch] FUSE ファイル同期を開始 (${POLL_INTERVAL / 1000}秒間隔)`);
console.log(`[sync-watch] 監視ディレクトリ: ${SRC_DIR}`);
console.log(`[sync-watch] Ctrl+C で停止\n`);

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
