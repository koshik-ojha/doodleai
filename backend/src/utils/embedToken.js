import crypto from "crypto";

const ALGO = "aes-256-cbc";

function getKey() {
  const secret = process.env.WIDGET_SECRET;
  if (!secret) throw new Error("WIDGET_SECRET env var is not set");
  return crypto.scryptSync(secret, "doodleai-embed-salt", 32);
}

export function encryptBotId(botId) {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(botId, "utf8"), cipher.final()]);
  return Buffer.concat([iv, encrypted]).toString("base64url");
}

export function decryptBotId(token) {
  const key = getKey();
  const buf = Buffer.from(token, "base64url");
  const iv = buf.slice(0, 16);
  const encrypted = buf.slice(16);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
