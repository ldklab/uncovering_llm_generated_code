const isWindows = process.platform === 'win32' ||
    process.env.OSTYPE === 'cygwin' ||
    process.env.OSTYPE === 'msys';

const path = require('path');
const COLON = isWindows ? ';' : ':';
const isexe = require('isexe');

const getNotFoundError = (cmd) =>
  Object.assign(new Error(`not found: ${cmd}`), { code: 'ENOENT' });

const getPathInfo = (cmd, opt) => {
  const colon = opt.colon || COLON;
  const pathEnv = cmd.includes('/') || (isWindows && cmd.includes('\\')) ? [''] :
    (isWindows ? [process.cwd()] : []).concat((opt.path || process.env.PATH || '').split(colon));
  
  const pathExtExe = isWindows ? (opt.pathExt || process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM') : '';
  const pathExt = isWindows ? pathExtExe.split(colon) : [''];

  if (isWindows && cmd.includes('.') && pathExt[0] !== '') {
    pathExt.unshift('');
  }

  return { pathEnv, pathExt, pathExtExe };
}

const which = (cmd, opt, cb) => {
  if (typeof opt === 'function') {
    cb = opt;
    opt = {};
  } else {
    opt = opt || {};
  }

  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  const searchPath = (index) => new Promise((resolve, reject) => {
    if (index === pathEnv.length) {
      return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
    }

    const pathPartRaw = pathEnv[index];
    const pathPart = /^".*"$/.test(pathPartRaw) ? pathPartRaw.slice(1, -1) : pathPartRaw;
    const commandPath = path.join(pathPart, cmd);
    const prefixedPath = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + commandPath : commandPath;

    resolve(searchExtensions(prefixedPath, index, 0));
  });

  const searchExtensions = (filePath, pathIndex, extIndex) => new Promise((resolve, reject) => {
    if (extIndex === pathExt.length) {
      return resolve(searchPath(pathIndex + 1));
    }
    const fileWithExt = filePath + pathExt[extIndex];
    isexe(fileWithExt, { pathExt: pathExtExe }, (error, isExecutable) => {
      if (!error && isExecutable) {
        if (opt.all) {
          found.push(fileWithExt);
        } else {
          return resolve(fileWithExt);
        }
      }
      resolve(searchExtensions(filePath, pathIndex, extIndex + 1));
    });
  });

  return cb ? searchPath(0).then(result => cb(null, result), cb) : searchPath(0);
}

const whichSync = (cmd, opt = {}) => {
  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  for (let i = 0; i < pathEnv.length; i++) {
    const pathPartRaw = pathEnv[i];
    const pathPart = /^".*"$/.test(pathPartRaw) ? pathPartRaw.slice(1, -1) : pathPartRaw;
    const commandPath = path.join(pathPart, cmd);
    const prefixedPath = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + commandPath : commandPath;

    for (let j = 0; j < pathExt.length; j++) {
      const currentPath = prefixedPath + pathExt[j];
      try {
        if (isexe.sync(currentPath, { pathExt: pathExtExe })) {
          if (opt.all) {
            found.push(currentPath);
          } else {
            return currentPath;
          }
        }
      } catch (ex) { }
    }
  }

  if (opt.all && found.length) {
    return found;
  }

  if (opt.nothrow) {
    return null;
  }

  throw getNotFoundError(cmd);
}

module.exports = which;
which.sync = whichSync;
