const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadEnvFile(filePath) {
  const envContent = fs.readFileSync(filePath, 'utf8');
  const envVariables = parseEnvContent(envContent);
  Object.assign(process.env, envVariables);
}

function parseEnvContent(content) {
  let envVariables = {};
  content.split('\n').forEach(line => {
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

function encryptEnvFile(filePath) {
  const envContent = fs.readFileSync(filePath, 'utf8');
  const encryptedContent = encryptText(envContent, retrieveKey());
  fs.writeFileSync('.env.vault', encryptedContent, 'base64');
}

function encryptText(text, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return JSON.stringify({ iv: iv.toString('base64'), content: encrypted, tag: cipher.getAuthTag().toString('base64') });
}

function decryptEnvFile() {
  const encryptedContent = fs.readFileSync('.env.vault', 'utf8');
  const decryptedContent = decryptText(encryptedContent, retrieveKey());
  const envVariables = parseEnvContent(decryptedContent);
  Object.assign(process.env, envVariables);
}

function decryptText(encrypted, key) {
  const { iv, content, tag } = JSON.parse(encrypted);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  let decrypted = decipher.update(content, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function retrieveKey() {
  const key = process.env.DOTENV_KEY;
  if (!key) throw new Error('DOTENV_KEY is required for decryption');
  return Buffer.from(key, 'hex');
}

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

module.exports = {
  loadEnvFile,
  encryptEnvFile,
  decryptEnvFile,
  runCLI
};

if (require.main === module) {
  runCLI(process.argv);
}
