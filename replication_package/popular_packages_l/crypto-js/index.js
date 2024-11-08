// package.json
{
  "name": "crypto-native-wrapper",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module"
}

// index.js
import { createHash, createHmac, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

export function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

export function hmacSHA512(data, key) {
  return createHmac('sha512', key).update(data).digest('hex');
}

export function base64Encode(data) {
  return Buffer.from(data).toString('base64');
}

export function base64Decode(data) {
  return Buffer.from(data, 'base64').toString('utf8');
}

const algorithm = 'aes-256-cbc';
export function encryptAES(text, secret) {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, Buffer.from(secret, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptAES(encryptedText, secret) {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedTextBuff = Buffer.from(textParts.join(':'), 'hex');
  const decipher = createDecipheriv(algorithm, Buffer.from(secret, 'hex'), iv);
  let decrypted = decipher.update(encryptedTextBuff, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Usage example:
const message = 'Hello';
const nonce = '123';
const path = '/api/endpoint';
const privateKey = 'a1b2c3d4';

const hashDigest = sha256(nonce + message);
const hmacDigest = base64Encode(hmacSHA512(path + hashDigest, privateKey));

console.log('Hash Digest:', hashDigest);
console.log('HMAC Digest:', hmacDigest);

const secretKey = randomBytes(32).toString('hex');
const encryptedMessage = encryptAES('my message', secretKey);
const decryptedMessage = decryptAES(encryptedMessage, secretKey);

console.log('Encrypted Message:', encryptedMessage);
console.log('Decrypted Message:', decryptedMessage);
