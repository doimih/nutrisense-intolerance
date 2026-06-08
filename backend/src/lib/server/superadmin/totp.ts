import { createHmac, randomBytes } from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function normalizeSecret(secret: string): string {
  return secret.replace(/\s+/g, '').replace(/=+$/g, '').toUpperCase();
}

function base32Decode(secret: string): Buffer {
  const normalized = normalizeSecret(secret);
  let bits = 0;
  let value = 0;
  const out: number[] = [];

  for (const char of normalized) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx < 0) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(out);
}

function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function toHotp(secret: string, counter: number, digits = 6): string {
  const key = base32Decode(secret);
  const msg = Buffer.alloc(8);
  msg.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  msg.writeUInt32BE(counter & 0xffffffff, 4);

  const hmac = createHmac('sha1', key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 10 ** digits).padStart(digits, '0');
}

export function generateTotpSecret(length = 20): string {
  return base32Encode(randomBytes(length));
}

export function verifyTotpCode(secret: string, code: string, window = 1): boolean {
  const sanitizedCode = code.replace(/\D+/g, '');
  if (sanitizedCode.length !== 6) return false;

  const timestep = 30;
  const nowCounter = Math.floor(Date.now() / 1000 / timestep);

  for (let offset = -window; offset <= window; offset += 1) {
    const expected = toHotp(secret, nowCounter + offset);
    if (expected === sanitizedCode) return true;
  }

  return false;
}

export function createOtpAuthUrl(params: {
  issuer: string;
  accountName: string;
  secret: string;
}): string {
  const issuer = encodeURIComponent(params.issuer);
  const account = encodeURIComponent(params.accountName);
  const secret = encodeURIComponent(params.secret);
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}
