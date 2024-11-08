const path = require('path');
const isexe = require('isexe');

const isWindows = process.platform === 'win32' || 
                  process.env.OSTYPE === 'cygwin' || 
                  process.env.OSTYPE === 'msys';

const COLON = isWindows ? ';' : ':';

const getNotFoundError = (cmd) => {
  const err = new Error(`not found: ${cmd}`);
  err.code = 'ENOENT';
  return err;
};

const getPathInfo = (cmd, opt) => {
  const colon = opt.colon || COLON;
  const pathEnv = cmd.includes('/') || (isWindows && cmd.includes('\\')) 
    ? [''] 
    : [
        ...(isWindows ? [process.cwd()] : []),
        ...(opt.path || process.env.PATH || '').split(colon),
      ];
  const pathExtExe = isWindows 
    ? opt.pathExt || process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM' 
    : '';
  const pathExt = isWindows ? pathExtExe.split(colon) : [''];

  if (isWindows && cmd.includes('.') && pathExt[0] !== '') {
    pathExt.unshift('');
  }

  return { pathEnv, pathExt, pathExtExe };
};

const which = (cmd, opt = {}, cb) => {
  if (typeof opt === 'function') {
    cb = opt;
    opt = {};
  }

  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  const step = (i) => new Promise((resolve, reject) => {
    if (i === pathEnv.length) {
      return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
    }

    const ppRaw = pathEnv[i];
    const pathPart = ppRaw.startsWith('"') && ppRaw.endsWith('"') ? ppRaw.slice(1, -1) : ppRaw;
    const pCmd = path.join(pathPart, cmd);
    const p = !pathPart && cmd.match(/^[.\\/]/) ? cmd.slice(0, 2) + pCmd : pCmd;

    resolve(subStep(p, i, 0));
  });

  const subStep = (p, i, ii) => new Promise((resolve, reject) => {
    if (ii === pathExt.length) {
      return resolve(step(i + 1));
    }

    const ext = pathExt[ii];
    isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
      if (!er && is) {
        if (opt.all) {
          found.push(p + ext);
        } else {
          return resolve(p + ext);
        }
      }
      return resolve(subStep(p, i, ii + 1));
    });
  });

  return cb ? step(0).then(res => cb(null, res), cb) : step(0);
};

const whichSync = (cmd, opt = {}) => {
  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  for (let i = 0; i < pathEnv.length; i++) {
    const ppRaw = pathEnv[i];
    const pathPart = ppRaw.startsWith('"') && ppRaw.endsWith('"') ? ppRaw.slice(1, -1) : ppRaw;
    const pCmd = path.join(pathPart, cmd);
    const p = !pathPart && cmd.match(/^[.\\/]/) ? cmd.slice(0, 2) + pCmd : pCmd;

    for (let j = 0; j < pathExt.length; j++) {
      const cur = p + pathExt[j];
      try {
        if (isexe.sync(cur, { pathExt: pathExtExe })) {
          if (opt.all) {
            found.push(cur);
          } else {
            return cur;
          }
        }
      } catch {}
    }
  }

  if (opt.all && found.length) {
    return found;
  }

  if (opt.nothrow) {
    return null;
  }

  throw getNotFoundError(cmd);
};

module.exports = which;
which.sync = whichSync;
