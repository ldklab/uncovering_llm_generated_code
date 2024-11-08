const { isexe, sync: isexeSync } = require('isexe');
const { join, delimiter, sep, posix } = require('path');

const isWindows = process.platform === 'win32';

/* istanbul ignore next */
const rSlash = new RegExp(`[${posix.sep}${sep === posix.sep ? '' : sep}]`.replace(/(\\)/g, '\\$1'));
const rRel = new RegExp(`^\\.${rSlash.source}`);

const getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: 'ENOENT' });

function getPathInfo(cmd, { path: optPath = process.env.PATH, pathExt: optPathExt = process.env.PATHEXT, delimiter: optDelimiter = delimiter }) {
  const pathEnv = cmd.match(rSlash) ? [''] : [
    ...(isWindows ? [process.cwd()] : []),
    ...(optPath || '').split(optDelimiter),
  ];

  if (isWindows) {
    const pathExtExe = optPathExt || ['.EXE', '.CMD', '.BAT', '.COM'].join(optDelimiter);
    const pathExt = pathExtExe.split(optDelimiter).flatMap((item) => [item, item.toLowerCase()]);
    if (cmd.includes('.') && pathExt[0] !== '') {
      pathExt.unshift('');
    }
    return { pathEnv, pathExt, pathExtExe };
  }

  return { pathEnv, pathExt: [''] };
}

function getPathPart(raw, cmd) {
  const pathPart = /^".*"$/.test(raw) ? raw.slice(1, -1) : raw;
  const prefix = !pathPart && rRel.test(cmd) ? cmd.slice(0, 2) : '';
  return prefix + join(pathPart, cmd);
}

async function which(cmd, opt = {}) {
  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  for (const envPart of pathEnv) {
    const p = getPathPart(envPart, cmd);

    for (const ext of pathExt) {
      const withExt = p + ext;
      const is = await isexe(withExt, { pathExt: pathExtExe, ignoreErrors: true });
      if (is) {
        if (!opt.all) {
          return withExt;
        }
        found.push(withExt);
      }
    }
  }

  if (opt.all && found.length) return found;

  if (opt.nothrow) return null;

  throw getNotFoundError(cmd);
}

function whichSync(cmd, opt = {}) {
  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  for (const pathEnvPart of pathEnv) {
    const p = getPathPart(pathEnvPart, cmd);

    for (const ext of pathExt) {
      const withExt = p + ext;
      const is = isexeSync(withExt, { pathExt: pathExtExe, ignoreErrors: true });
      if (is) {
        if (!opt.all) {
          return withExt;
        }
        found.push(withExt);
      }
    }
  }

  if (opt.all && found.length) return found;

  if (opt.nothrow) return null;

  throw getNotFoundError(cmd);
}

module.exports = which;
which.sync = whichSync;
