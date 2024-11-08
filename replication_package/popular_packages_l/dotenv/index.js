// dotenvx.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from a file into process.env
function loadEnvFile(filePath) {
  const envContent = fs.readFileSync(filePath, { encoding: 'utf8' });
  const envVariables = parse(envContent);
  Object.assign(process.env, envVariables);
}

// Parse environment variables from a file content
function parse(content) {
  const lines = content.split('\n');
  let envVariables = {};
  lines.forEach(line => {
    const match = line.match(/^([\w.-]+)\s*=\s*(.*)?$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\n/g, '\n');
      }
      envVariables[key] = value;
    }
  });
  return envVariables;
}

// Encrypt environment variables and save to .env.vault
function encryptEnvFile(filePath) {
  const envContent = fs.readFileSync(filePath, { encoding: 'utf8' });
  const encryptedContent = encrypt(envContent, getKey());
  fs.writeFileSync('.env.vault', encryptedContent, { encoding: 'base64' });
}

// Basic encryption function using AES-256-GCM
function encrypt(text, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return JSON.stringify({ iv: iv.toString('base64'), content: encrypted, tag: cipher.getAuthTag().toString('base64') });
}

// Decrypt environment variables from .env.vault
function decryptEnvFile() {
  const encryptedContent = fs.readFileSync('.env.vault', { encoding: 'utf8' });
  const decryptedContent = decrypt(encryptedContent, getKey());
  const envVariables = parse(decryptedContent);
  Object.assign(process.env, envVariables);
}

function decrypt(encrypted, key) {
  const { iv, content, tag } = JSON.parse(encrypted);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  let decrypted = decipher.update(content, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Retrieve the encryption key specified by the environment or a runtime setting
function getKey() {
  const key = process.env.DOTENV_KEY;
  if (!key) {
    throw new Error('DOTENV_KEY is required for decryption');
  }
  return Buffer.from(key, 'hex');
}

// A simple CLI interface to use dotenvx functions
function runCLI(args) {
  const command = args[2];
  const fileArgs = args.filter(arg => arg.startsWith('--env-file=')).map(arg => arg.split('=')[1]);
  switch (command) {
    case 'run':
      fileArgs.forEach(filePath => loadEnvFile(filePath));
      require(path.resolve(args[args.length - 1]));
      break;
    case 'encrypt':
      fileArgs.forEach(filePath => encryptEnvFile(filePath));
      console.log('Environment variables encrypted to .env.vault');
      break;
    default:
      console.log('Invalid command');
  }
}

// Export functions and CLI interface
module.exports = {
  loadEnvFile,
  encryptEnvFile,
  decryptEnvFile,
  runCLI
};

// If this script is run directly, process CLI arguments
if (require.main === module) {
  runCLI(process.argv);
}