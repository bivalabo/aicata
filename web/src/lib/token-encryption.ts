// ============================================================
// Token Encryption — Shopify アクセストークンの暗号化保存
//
// AES-256-GCM を使用してトークンを暗号化/復号化。
// 環境変数 TOKEN_ENCRYPTION_KEY (hex 64文字 = 32バイト) が必要。
// 未設定の場合はフォールバックとして平文を返す（開発環境向け）。
// ============================================================

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM推奨
const TAG_LENGTH = 16;
// Encrypted format: "enc:v1:<iv_hex>:<tag_hex>:<ciphertext_hex>"
const PREFIX = "enc:v1:";

function getKey(): Buffer | null {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) return null;
  return Buffer.from(hex, "hex");
}

/**
 * トークンを暗号化して保存用文字列を返す。
 * 暗号化キー未設定の場合は平文をそのまま返す。
 */
export function encryptToken(plaintext: string): string {
  const key = getKey();
  if (!key) return plaintext; // Fallback: no encryption

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

/**
 * 暗号化文字列を復号化して平文トークンを返す。
 * 暗号化されていない平文の場合はそのまま返す（後方互換性）。
 */
export function decryptToken(stored: string): string {
  // 暗号化されていない場合（マイグレーション前のデータ）
  if (!stored.startsWith(PREFIX)) return stored;

  const key = getKey();
  if (!key) {
    console.warn("[TokenEncryption] TOKEN_ENCRYPTION_KEY not set, cannot decrypt. Returning raw.");
    return stored;
  }

  const parts = stored.slice(PREFIX.length).split(":");
  if (parts.length !== 3) {
    console.error("[TokenEncryption] Invalid encrypted format");
    return stored;
  }

  const [ivHex, tagHex, cipherHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(cipherHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * トークンが暗号化済みかどうかを判定
 */
export function isEncrypted(token: string): boolean {
  return token.startsWith(PREFIX);
}
