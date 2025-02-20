const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const packageJson = require('../package.json');

const version = packageJson.version;

const LINE_REGEX = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;

function parse(src) {
  const obj = {};
  let lines = src.toString().replace(/\r\n?/mg, '\n');
  let match;
  while ((match = LINE_REGEX.exec(lines)) !== null) {
    const key = match[1];
    let value = match[2] || '';
    value = value.trim().replace(/^(['"`])([\s\S]*)\1$/mg, '$2');
    if (value[0] === '"') {
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
    throw new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
  }

  const keys = _dotenvKey(options).split(',');
  let decrypted;
  for (const key of keys) {
    try {
      const attrs = _instructions(result, key.trim());
      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
      break;
    } catch (error) {
      if (keys[keys.length - 1] === key) {
        throw error;
      }
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
  if (options && options.DOTENV_KEY) {
    return options.DOTENV_KEY;
  }
  return process.env.DOTENV_KEY || '';
}

function _instructions(result, dotenvKey) {
  try {
    const uri = new URL(dotenvKey);

    if (!uri.password) {
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

    return { ciphertext, key: uri.password };

  } catch (error) {
    if (error.code === 'ERR_INVALID_URL') {
      throw new Error('INVALID_DOTENV_KEY: Format must be a valid URI like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development');
    }
    throw error;
  }
}

function _vaultPath(options) {
  let paths = options && options.path ? (Array.isArray(options.path) ? options.path : [options.path]) : [path.resolve(process.cwd(), '.env.vault')];
  for (const filepath of paths) {
    const resolvedPath = filepath.endsWith('.vault') ? filepath : `${filepath}.vault`;
    if (fs.existsSync(resolvedPath)) {
      return resolvedPath;
    }
  }
  return null;
}

function _resolveHome(envPath) {
  return envPath.startsWith('~') ? path.join(os.homedir(), envPath.slice(1)) : envPath;
}

function _configVault(options) {
  _log('Loading env from encrypted .env.vault');
  const parsed = DotenvModule._parseVault(options);
  DotenvModule.populate(options.processEnv || process.env, parsed, options);
  return { parsed };
}

function configDotenv(options) {
  const dotenvPath = path.resolve(process.cwd(), '.env');
  const encoding = options && options.encoding || 'utf8';
  const debug = options && options.debug;

  const paths = options && options.path ? 
    (Array.isArray(options.path) ? options.path.map(_resolveHome) : [_resolveHome(options.path)]) : 
    [dotenvPath];

  const parsedAll = {};
  let lastError;
  for (const filepath of paths) {
    try {
      const parsed = DotenvModule.parse(fs.readFileSync(filepath, { encoding }));
      DotenvModule.populate(parsedAll, parsed, options);
    } catch (e) {
      if (debug) _debug(`Failed to load ${filepath}: ${e.message}`);
      lastError = e;
    }
  }

  DotenvModule.populate(options.processEnv || process.env, parsedAll, options);
  
  if (lastError) {
    return { parsed: parsedAll, error: lastError };
  }
  return { parsed: parsedAll };
}

function config(options) {
  if (!_dotenvKey(options)) {
    return configDotenv(options);
  }

  const vaultPath = _vaultPath(options);
  if (!vaultPath) {
    _warn(`DOTENV_KEY set but missing .env.vault file at ${vaultPath}`);
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
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAuthTag(authTag);
    return decipher.update(ciphertext).toString() + decipher.final('utf8');
  } catch (error) {
    const isError = error.code === 'ERR_CRYPTO_INVALID_TAG' || error.code === 'ERR_CRYPTO_INVALID_KEY';
    const errMsg = isError ? 'INVALID_DOTENV_KEY: Wrong key length or decryption failed' : error.message;
    throw new Error(errMsg);
  }
}

function populate(processEnv, parsed, options = {}) {
  const debug = options.debug;
  const override = options.override;

  if (typeof parsed !== 'object') {
    throw new Error('OBJECT_REQUIRED: Invalid parsed data');
  }

  for (const key of Object.keys(parsed)) {
    if (processEnv.hasOwnProperty(key)) {
      if (override) {
        processEnv[key] = parsed[key];
      }
      if (debug) {
        _debug(`"${key}" is ${override ? 'overwritten' : 'not overwritten'}`);
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
