json
// package.json
{
  "name": "crypto-native-wrapper",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module"
}

// index.js
import {
  createHash,
  createHmac,
  randomBytes,
  createCipheriv,
  createDecipheriv
} from 'crypto';

// Function to generate SHA-256 hash of input data
export function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

// Function to generate HMAC with SHA-512 of input data with a given key
export function hmacSHA512(data, key) {
  return createHmac('sha512', key).update(data).digest('hex');
}

// Function to encode data to Base64
export function base64Encode(data) {
  return Buffer.from(data).toString('base64');
}

// Function to decode data from Base64
export function base64Decode(data) {
  return Buffer.from(data, 'base64').toString('utf8');
}

// Encryption/Decryption algorithm configuration
const algorithm = 'aes-256-cbc';

// Function to encrypt text using AES-256-CBC with a secret key
export function encryptAES(text, secret) {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, Buffer.from(secret, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Function to decrypt text using AES-256-CBC with a secret key
export function decryptAES(encryptedText, secret) {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedTextBuff = Buffer.from(textParts.join(':'), 'hex');
  const decipher = createDecipheriv(algorithm, Buffer.from(secret, 'hex'), iv);
  let decrypted = decipher.update(encryptedTextBuff, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Usage example demonstrating the functions
const message = 'Hello';
const nonce = '123';
const path = '/api/endpoint';
const privateKey = 'a1b2c3d4';

// Generate SHA-256 hash
const hashDigest = sha256(nonce + message);
// Generate HMAC SHA-512 and encode it in Base64
const hmacDigest = base64Encode(hmacSHA512(path + hashDigest, privateKey));

console.log('Hash Digest:', hashDigest);
console.log('HMAC Digest:', hmacDigest);

// Generate a random secret key for encryption/decryption
const secretKey = randomBytes(32).toString('hex');
// Encrypt and decrypt a message using AES
const encryptedMessage = encryptAES('my message', secretKey);
const decryptedMessage = decryptAES(encryptedMessage, secretKey);

console.log('Encrypted Message:', encryptedMessage);
console.log('Decrypted Message:', decryptedMessage);
