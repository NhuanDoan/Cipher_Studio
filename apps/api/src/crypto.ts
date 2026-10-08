import { createCipheriv, createDecipheriv, randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

export async function encryptAes(plaintext: string, password: string) {
  if (!password) throw new Error('Enter a password to encrypt with AES.');
  const salt = randomBytes(16);
  const nonce = randomBytes(12);
  const key = (await scrypt(password, salt, 32)) as Buffer;
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const payload = { v: 1, alg: 'A256GCM', salt: salt.toString('base64url'), nonce: nonce.toString('base64url'), tag: cipher.getAuthTag().toString('base64url'), data: ciphertext.toString('base64url') };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export async function decryptAes(encoded: string, password: string) {
  if (!password) throw new Error('Enter the password used to encrypt this message.');
  let payload: { v: number; alg: string; salt: string; nonce: string; tag: string; data: string };
  try { payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')); }
  catch { throw new Error('Invalid AES message format.'); }
  if (payload.v !== 1 || payload.alg !== 'A256GCM' || !payload.salt || !payload.nonce || !payload.tag || typeof payload.data !== 'string') throw new Error('Invalid AES message format.');
  try {
    const salt = Buffer.from(payload.salt, 'base64url');
    const nonce = Buffer.from(payload.nonce, 'base64url');
    const key = (await scrypt(password, salt, 32)) as Buffer;
    const decipher = createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAuthTag(Buffer.from(payload.tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64url')), decipher.final()]).toString('utf8');
  } catch { throw new Error('Could not decrypt. Check the password and encrypted message.'); }
}

export function encryptOtp(plaintext: string) {
  const bytes = encoder.encode(plaintext);
  const pad = randomBytes(bytes.length);
  const encrypted = Buffer.alloc(bytes.length);
  for (let i = 0; i < bytes.length; i++) encrypted[i] = bytes[i]! ^ pad[i]!;
  return { ciphertext: encrypted.toString('base64url'), oneTimePad: pad.toString('base64url') };
}

export function decryptOtp(encoded: string, encodedPad: string) {
  if (!encodedPad) throw new Error('Enter the one-time pad to decrypt this message.');
  let ciphertext: Buffer;
  let pad: Buffer;
  try { ciphertext = Buffer.from(encoded, 'base64url'); pad = Buffer.from(encodedPad, 'base64url'); }
  catch { throw new Error('Invalid OTP message or pad format.'); }
  if (ciphertext.length !== pad.length) throw new Error('The one-time pad must have the same byte length as the ciphertext.');
  const plaintext = Buffer.alloc(ciphertext.length);
  for (let i = 0; i < ciphertext.length; i++) plaintext[i] = ciphertext[i]! ^ pad[i]!;
  try { return decoder.decode(plaintext); } catch { throw new Error('The pad did not produce valid UTF-8 text.'); }
}
