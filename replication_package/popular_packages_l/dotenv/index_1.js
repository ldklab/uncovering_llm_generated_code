// dotenvx.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadEnvFile(filePath) {
  const envContent = fs.readFileSync(filePath, 'utf8');
  const envVariables = parseEnvContent(envContent);
  Object.assign(process.env, envVariables);
}

function parseEnvContent(content) {
  return content.split('\n').reduce((envVars, line) => {
    const match = line.match(/^([\w.-]+)\s*=\s*(.*)?$/);
    if (match) {
      let [_, key, value] = match;
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\n/g, '\n');
      }
      envVars[key] = value || '';
    }
    return envVars;
  }, {});
}

function encryptEnvFile(filePath) {
  const envContent = fs.readFileSync(filePath, 'utf8');
  const encryptedContent = encryptContent(envContent, retrieveEncryptionKey());
  fs.writeFileSync('.env.vault', encryptedContent, 'base64');
}

function encryptContent(text, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return JSON.stringify({
    iv: iv.toString('base64'),
    content: encrypted,
    tag: cipher.getAuthTag().toString('base64')
  });
}

function decryptEnvFile() {
  const encryptedContent = fs.readFileSync('.env.vault', 'utf8');
  const decryptedContent = decryptContent(encryptedContent, retrieveEncryptionKey());
  const envVariables = parseEnvContent(decryptedContent);
  Object.assign(process.env, envVariables);
}

function decryptContent(encrypted, key) {
  const { iv, content, tag } = JSON.parse(encrypted);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  let decrypted = decipher.update(content, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function retrieveEncryptionKey() {
  const keyHex = process.env.DOTENV_KEY;
  if (!keyHex) {
    throw new Error('DOTENV_KEY is required for decryption');
  }
  return Buffer.from(keyHex, 'hex');
}

function runCLI(args) {
  const command = args[2];
  const envFiles = args.filter(arg => arg.startsWith('--env-file=')).map(arg => arg.split('=')[1]);
  if (command === 'run') {
    envFiles.forEach(loadEnvFile);
    require(path.resolve(args[args.length - 1]));
  } else if (command === 'encrypt') {
    envFiles.forEach(encryptEnvFile);
    console.log('Environment variables encrypted to .env.vault');
  } else {
    console.log('Invalid command');
  }
}

module.exports = {
  loadEnvFile,
  encryptEnvFile,
  decryptEnvFile,
  runCLI
};

if (require.main === module) {
  runCLI(process.argv);
}
