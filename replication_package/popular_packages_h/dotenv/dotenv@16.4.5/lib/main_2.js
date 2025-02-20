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
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];
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
  const result = DotenvModule.configDotenv({ path: vaultPath });
  if (!result.parsed) {
    const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
    err.code = 'MISSING_DATA';
    throw err;
  }

  const keys = _dotenvKey(options).split(',');
  let decrypted;
  for (let key of keys) {
    try {
      const attrs = _instructions(result, key.trim());
      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
      break;
    } catch (error) {
      if (keys.indexOf(key) + 1 >= keys.length) throw error;
    }
  }

  return DotenvModule.parse(decrypted);
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
  if (options?.DOTENV_KEY?.length > 0) return options.DOTENV_KEY;
  if (process.env.DOTENV_KEY?.length > 0) return process.env.DOTENV_KEY;
  return '';
}

function _instructions(result, dotenvKey) {
  let uri;
  try {
    uri = new URL(dotenvKey);
  } catch (error) {
    if (error.code === 'ERR_INVALID_URL') {
      const err = new Error('INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development');
      err.code = 'INVALID_DOTENV_KEY';
      throw err;
    }
    throw error;
  }

  const key = uri.password;
  if (!key) {
    throw new Error('INVALID_DOTENV_KEY: Missing key part');
  }

  const environment = uri.searchParams.get('environment');
  if (!environment) {
    throw new Error('INVALID_DOTENV_KEY: Missing environment part');
  }

  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
  const ciphertext = result.parsed[environmentKey];
  if (!ciphertext) {
    throw new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
  }

  return { ciphertext, key };
}

function _vaultPath(options) {
  let possibleVaultPath = options?.path
    ? (_resolvePaths(options.path).find(filepath => fs.existsSync(filepath)) || null)
    : path.resolve(process.cwd(), '.env.vault');

  if (fs.existsSync(possibleVaultPath)) {
    return possibleVaultPath;
  }
  return null;
}

function _resolvePaths(paths) {
  return Array.isArray(paths)
    ? paths.map(filepath => filepath.endsWith('.vault') ? filepath : `${filepath}.vault`)
    : [paths.endsWith('.vault') ? paths : `${paths}.vault`];
}

function _resolveHome(envPath) {
  return envPath.startsWith('~') ? path.join(os.homedir(), envPath.slice(1)) : envPath;
}

function _configVault(options) {
  _log('Loading env from encrypted .env.vault');
  const parsed = DotenvModule._parseVault(options);

  const processEnv = options?.processEnv || process.env;
  DotenvModule.populate(processEnv, parsed, options);

  return { parsed };
}

function configDotenv(options) {
  const dotenvPath = path.resolve(process.cwd(), '.env');
  const encoding = options?.encoding || 'utf8';
  const debug = Boolean(options?.debug);

  if (debug && !options?.encoding) {
    _debug('No encoding is specified. UTF-8 is used by default');
  }

  const optionPaths = options?.path
    ? (Array.isArray(options.path) ? options.path.map(_resolveHome) : [_resolveHome(options.path)])
    : [dotenvPath];

  let lastError;
  const parsedAll = {};

  for (const path of optionPaths) {
    try {
      const parsed = DotenvModule.parse(fs.readFileSync(path, { encoding }));
      DotenvModule.populate(parsedAll, parsed, options);
    } catch (e) {
      if (debug) _debug(`Failed to load ${path} ${e.message}`);
      lastError = e;
    }
  }

  const processEnv = options?.processEnv || process.env;
  DotenvModule.populate(processEnv, parsedAll, options);

  return lastError ? { parsed: parsedAll, error: lastError } : { parsed: parsedAll };
}

function config(options) {
  if (_dotenvKey(options).length === 0) {
    return DotenvModule.configDotenv(options);
  }

  const vaultPath = _vaultPath(options);
  if (!vaultPath) {
    _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
    return DotenvModule.configDotenv(options);
  }

  return DotenvModule._configVault(options);
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
    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
  } catch (error) {
    if (error instanceof RangeError || error.message === 'Invalid key length') {
      throw new Error('INVALID_DOTENV_KEY: It must be 64 characters long (or more)');
    } else if (error.message === 'Unsupported state or unable to authenticate data') {
      throw new Error('DECRYPTION_FAILED: Please check your DOTENV_KEY');
    }
    throw error;
  }
}

function populate(processEnv, parsed, options = {}) {
  const debug = Boolean(options?.debug);
  const override = Boolean(options?.override);

  if (typeof parsed !== 'object') {
    throw new Error('OBJECT_REQUIRED: Please check the processEnv argument being passed to populate');
  }

  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      if (override) processEnv[key] = parsed[key];

      if (debug) {
        _debug(`"${key}" is already defined and ${override ? 'WAS' : 'was NOT'} overwritten`);
      }
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
