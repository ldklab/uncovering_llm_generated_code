const path = require('path');
const extension = require('./lib/extension');
const normalize = require('./lib/normalize');
const register = require('./lib/register');

exports.prepare = function (extensions, filepath, cwd = null, nothrow = false) {
  let config, usedExtension;
  const attempts = [];
  let onlyErrors = true;

  const exts = extension(filepath);
  if (exts) {
    usedExtension = exts.find(ext => {
      config = normalize(extensions[ext]);
      return !!config;
    });
  }

  if (Object.keys(require.extensions).includes(usedExtension)) {
    return true;
  }

  if (!config) {
    const errorMsg = `No module loader found for "${usedExtension}".`;
    if (nothrow) return;
    throw new Error(errorMsg);
  }

  cwd = cwd || path.dirname(path.resolve(filepath));
  config = Array.isArray(config) ? config : [config];

  for (const option of config) {
    const attempt = register(cwd, option.module, option.register);
    const error = attempt instanceof Error ? attempt : null;
    attempts.push({ moduleName: option.module, module: attempt, error });
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
