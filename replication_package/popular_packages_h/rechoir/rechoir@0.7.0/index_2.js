const path = require('path');
const extension = require('./lib/extension');
const normalize = require('./lib/normalize');
const register = require('./lib/register');

exports.prepare = (extensions, filepath, cwd = null, nothrow = false) => {
  let config = null, usedExtension = null;
  const attempts = [];
  let onlyErrors = true;

  const exts = extension(filepath);
  if (exts) {
    for (const ext of exts) {
      usedExtension = ext;
      config = normalize(extensions[ext]);
      if (config) break;
    }
  }

  if (Object.keys(require.extensions).includes(usedExtension)) {
    return true;
  }

  if (!config) {
    const errorMessage = `No module loader found for "${usedExtension}".`;
    if (nothrow) return;
    throw new Error(errorMessage);
  }

  cwd = cwd || path.dirname(path.resolve(filepath));
  config = Array.isArray(config) ? config : [config];

  for (const option of config) {
    const attempt = register(cwd, option.module, option.register);
    const error = attempt instanceof Error ? attempt : null;
    attempts.push({ 
      moduleName: option.module, 
      module: error ? null : attempt, 
      error 
    });
    if (!error) {
      onlyErrors = false;
      break;
    }
  }

  if (onlyErrors) {
    const err = new Error(`Unable to use specified module loaders for "${usedExtension}".`);
    err.failures = attempts;
    if (nothrow) return err;
    throw err;
  }
  return attempts;
};
