const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const packageJson = require('../package.json');

const version = packageJson.version;

const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;

function parse(src) {
  const obj = {};
  let lines = src.toString().replace(/\r\n?/mg, '\n');

  let match;
  while ((match = LINE.exec(lines)) !== null) {
    let key = match[1];
    let value = (match[2] || '').trim();
    const maybeQuote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2');

    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    }
    obj[key] = value;
  }
  return obj;
}

function _parseVault(options) {
  const vaultPath = _vaultPath(options);
  const result = configDotenv({ path: vaultPath });
  if (!result.parsed) throw new Error(`MISSING_DATA`);

  const keys = _dotenvKey(options).split(',');
  for (const key of keys) {
    try {
      const attrs = _instructions(result, key.trim());
      const decrypted = decrypt(attrs.ciphertext, attrs.key);
      return parse(decrypted);
    } catch (error) {
      if (key === keys[keys.length - 1]) throw error;
    }
  }
}

function _log(message) {
  console.log(`[dotenv@${version}][INFO] ${message}`);
}

function _warn(message) {
  console.log(`[dotenv@${version}][WARN] ${message}`);
}

function _debug(message) {
  console.log(`[dotenv@${version}][DEBUG] ${message}`);
}

function _dotenvKey(options) {
  return options?.DOTENV_KEY || process.env.DOTENV_KEY || '';
}

function _instructions(result, dotenvKey) {
  let uri;
  try {
    uri = new URL(dotenvKey);
  } catch {
    throw new Error('INVALID_DOTENV_KEY');
  }

  const key = uri.password;
  if (!key) throw new Error('INVALID_DOTENV_KEY');

  const environment = uri.searchParams.get('environment');
  if (!environment) throw new Error('INVALID_DOTENV_KEY');

  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
  const ciphertext = result.parsed[environmentKey];
  if (!ciphertext) throw new Error(`NOT_FOUND_DOTENV_ENVIRONMENT`);
  return { ciphertext, key };
}

function _vaultPath(options) {
  if (options?.path && options.path.length > 0) {
    const paths = Array.isArray(options.path) ? options.path : [options.path];
    for (const p of paths) {
      const possiblePath = p.endsWith('.vault') ? p : `${p}.vault`;
      if (fs.existsSync(possiblePath)) return possiblePath;
    }
  } else {
    const defaultPath = path.resolve(process.cwd(), '.env.vault');
    if (fs.existsSync(defaultPath)) return defaultPath;
  }
  return null;
}

function _resolveHome(envPath) {
  return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath;
}

function _configVault(options) {
  _log('Loading env from encrypted .env.vault');

  const parsed = _parseVault(options);
  const processEnv = options?.processEnv || process.env;

  populate(processEnv, parsed, options);
  return { parsed };
}

function configDotenv(options) {
  const dotenvPath = path.resolve(process.cwd(), '.env');
  const encoding = options?.encoding || 'utf8';
  const debug = Boolean(options?.debug);

  let paths = [dotenvPath];
  if (options?.path) {
    paths = Array.isArray(options.path) ? options.path.map(_resolveHome) : [_resolveHome(options.path)];
  }

  let lastError;
  const parsedAll = {};
  for (const p of paths) {
    try {
      const parsed = parse(fs.readFileSync(p, { encoding }));
      populate(parsedAll, parsed, options);
    } catch (e) {
      if (debug) _debug(`Failed to load ${p} ${e.message}`);
      lastError = e;
    }
  }

  const processEnv = options?.processEnv || process.env;
  populate(processEnv, parsedAll, options);

  if (lastError) return { parsed: parsedAll, error: lastError };
  return { parsed: parsedAll };
}

function config(options) {
  if (_dotenvKey(options).length === 0) {
    return configDotenv(options);
  }

  const vaultPath = _vaultPath(options);
  if (!vaultPath) {
    _warn(`You set DOTENV_KEY but you are missing a .env.vault file.`);
    return configDotenv(options);
  }

  return _configVault(options);
}

function decrypt(encrypted, keyStr) {
  const key = Buffer.from(keyStr.slice(-64), 'hex');
  let ciphertext = Buffer.from(encrypted, 'base64');

  const nonce = ciphertext.subarray(0, 12);
  const authTag = ciphertext.subarray(-16);
  ciphertext = ciphertext.subarray(12, -16);

  try {
    const aesgcm = crypto.createDecipheriv('aes-256-gcm', key, nonce);
    aesgcm.setAuthTag(authTag);
    return Buffer.concat([aesgcm.update(ciphertext), aesgcm.final()]).toString();
  } catch (error) {
    const err = new Error(error.message.includes('key length') ? 'INVALID_DOTENV_KEY' : 'DECRYPTION_FAILED');
    err.code = error instanceof RangeError || error.message.includes('key length') ? 'INVALID_DOTENV_KEY' : 'DECRYPTION_FAILED';
    throw err;
  }
}

function populate(processEnv, parsed, options = {}) {
  const debug = Boolean(options.debug);
  const override = Boolean(options.override);

  if (typeof parsed !== 'object') throw new Error('OBJECT_REQUIRED');

  for (const key of Object.keys(parsed)) {
    if (processEnv.hasOwnProperty(key)) {
      if (override) processEnv[key] = parsed[key];
      if (debug) _debug(`"${key}" is already defined and ${override ? 'WAS' : 'was NOT'} overwritten`);
    } else {
      processEnv[key] = parsed[key];
    }
  }
}

const DotenvModule = {
  configDotenv,
  _configVault,
  _parseVault,
  config,
  decrypt,
  parse,
  populate
};

module.exports = DotenvModule;
