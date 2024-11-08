const path = require('path');
const extension = require('./lib/extension');
const normalize = require('./lib/normalize');
const register = require('./lib/register');

exports.prepare = function (extensions, filepath, cwd, nothrow) {
  let config, usedExtension;
  const attempts = [];
  let onlyErrors = true;
  const exts = extension(filepath);

  if (exts) {
    exts.some(ext => {
      usedExtension = ext;
      config = normalize(extensions[ext]);
      return !!config;
    });
  }

  if (Object.keys(require.extensions).includes(usedExtension)) {
    return true;
  }

  if (!config) {
    if (nothrow) {
      return;
    }
    throw new Error(`No module loader found for "${usedExtension}".`);
  }

  if (!cwd) {
    cwd = path.dirname(path.resolve(filepath));
  }
  if (!Array.isArray(config)) {
    config = [config];
  }

  config.forEach(option => {
    const attempt = register(cwd, option.module, option.register);
    const error = attempt instanceof Error ? attempt : null;
    attempts.push({
      moduleName: option.module,
      module: error ? null : attempt,
      error: error
    });

    if (!error) {
      onlyErrors = false;
      return;
    }
  });

  if (onlyErrors) {
    const err = new Error(`Unable to use specified module loaders for "${usedExtension}".`);
    err.failures = attempts;
    if (nothrow) {
      return err;
    }
    throw err;
  }

  return attempts;
};
