const path = require('path');
const isexe = require('isexe');

const isWindows = process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';
const PATH_SEPARATOR = isWindows ? ';' : ':';
const DEFAULT_PATH = process.env.PATH || '';
const DEFAULT_PATHEXT = isWindows ? '.EXE;.CMD;.BAT;.COM' : '';

const createNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: 'ENOENT' });

const getPathInfo = (cmd, options) => {
  const separator = options.colon || PATH_SEPARATOR;
  const searchPaths = cmd.includes('/') || (isWindows && cmd.includes('\\')) ? [''] : [
    ...(isWindows ? [process.cwd()] : []),
    ...((options.path || DEFAULT_PATH).split(separator)),
  ];
  const pathExtensions = isWindows ? (options.pathExt || process.env.PATHEXT || DEFAULT_PATHEXT).split(separator) : [''];

  if (isWindows && cmd.includes('.') && pathExtensions[0] !== '') {
    pathExtensions.unshift('');
  }

  return { searchPaths, pathExtensions };
};

const which = (cmd, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  const { searchPaths, pathExtensions } = getPathInfo(cmd, options);
  const foundExecutables = [];

  const findExecutable = (index) =>
    new Promise((resolve, reject) => {
      if (index === searchPaths.length) {
        return options.all && foundExecutables.length ? resolve(foundExecutables) : reject(createNotFoundError(cmd));
      }

      const currentPath = searchPaths[index].replace(/^"|"$/g, '');
      const fullPath = path.join(currentPath, cmd);

      const tryNextExtension = (extIndex) =>
        new Promise((resolve) => {
          if (extIndex === pathExtensions.length) {
            return resolve(findExecutable(index + 1));
          }

          const candidatePath = fullPath + pathExtensions[extIndex];
          isexe(candidatePath, { pathExt: options.pathExt }, (error, exists) => {
            if (!error && exists) {
              if (options.all) {
                foundExecutables.push(candidatePath);
              } else {
                return resolve(candidatePath);
              }
            }
            resolve(tryNextExtension(extIndex + 1));
          });
        });

      resolve(tryNextExtension(0));
    });

  return callback ? findExecutable(0).then((res) => callback(null, res), callback) : findExecutable(0);
};

const whichSync = (cmd, options = {}) => {
  const { searchPaths, pathExtensions } = getPathInfo(cmd, options);
  const foundExecutables = [];

  for (let i = 0; i < searchPaths.length; i++) {
    const currentPath = searchPaths[i].replace(/^"|"$/g, '');
    const fullPath = path.join(currentPath, cmd);

    for (let j = 0; j < pathExtensions.length; j++) {
      const candidatePath = fullPath + pathExtensions[j];
      
      try {
        if (isexe.sync(candidatePath, { pathExt: options.pathExt })) {
          if (options.all) {
            foundExecutables.push(candidatePath);
          } else {
            return candidatePath;
          }
        }
      } catch (e) {}
    }
  }

  if (options.all && foundExecutables.length) {
    return foundExecutables;
  }
  if (options.nothrow) {
    return null;
  }
  throw createNotFoundError(cmd);
};

module.exports = which;
which.sync = whichSync;
