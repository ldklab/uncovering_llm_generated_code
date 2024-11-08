const path = require('path');

const extension = require('./lib/extension');
const normalize = require('./lib/normalize');
const register = require('./lib/register');

exports.prepare = function(extensions, filepath, cwd, nothrow) {
  let config = null;
  let usedExtension = null;
  const attempts = [];
  let onlyErrors = true;

  // Get possible extensions and find the first valid config
  const exts = extension(filepath);
  if (exts) {
    for (const ext of exts) {
      usedExtension = ext;
      config = normalize(extensions[ext]);
      if (config) break;
    }
  }

  // Check if module loader is already registered
  if (require.extensions.hasOwnProperty(usedExtension)) {
    return true;
  }

  // Handle missing configuration error
  if (!config) {
    if (nothrow) return;
    throw new Error(`No module loader found for "${usedExtension}".`);
  }

  // Resolve the current working directory
  if (!cwd) {
    cwd = path.dirname(path.resolve(filepath));
  }

  // Ensure config is an array for iteration
  if (!Array.isArray(config)) {
    config = [config];
  }

  // Attempt to register each configuration option
  for (const option of config) {
    const attempt = register(cwd, option.module, option.register);
    const error = (attempt instanceof Error) ? attempt : null;
    attempts.push({ moduleName: option.module, module: attempt, error });

    if (!error) {
      onlyErrors = false;
      break;
    }
  }

  // Handle situation where all attempts failed
  if (onlyErrors) {
    const err = new Error(`Unable to use specified module loaders for "${usedExtension}".`);
    err.failures = attempts;
    if (nothrow) return err;
    throw err;
  }

  return attempts;
};
