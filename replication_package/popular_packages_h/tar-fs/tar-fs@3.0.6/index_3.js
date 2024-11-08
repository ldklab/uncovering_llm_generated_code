const tar = require('tar-stream');
const pump = require('pump');
const fs = require('fs');
const path = require('path');

const isWindows = (global.Bare?.platform || process.platform) === 'win32';

const defaults = {
  pack: tar.pack,
  extract: tar.extract,
  fs,
  identity: (v) => v,
  noOp: () => {},
};

function normalizeName(name) {
  return isWindows ? name.replace(/\\/g, '/').replace(/[:?<>|]/g, '_') : name;
}

function getProcessUmask() {
  return process.umask ? process.umask() : 0;
}

function headStack(stack) {
  return stack.length ? stack[stack.length - 1] : null;
}

function checkDirectoryExists(fs, name, callback) {
  fs.stat(name, (err) => {
    if (!err) return callback(null);
    if (err.code !== 'ENOENT') return callback(err);
    fs.mkdir(name, { mode: 0o755, recursive: true }, (err, made) => {
      if (err) return callback(err);
      callback(null);
    });
  });
}

function validatePath(fs, name, root, callback) {
  if (name === root) return callback(null, true);
  fs.lstat(name, (err, stat) => {
    if (err && err.code === 'ENOENT') return validatePath(fs, path.join(name, '..'), root, callback);
    else if (err) return callback(err);
    callback(null, stat.isDirectory());
  });
}

function statResolver(fs, stat, cwd, ignore, entries, sort) {
  if (!entries) entries = ['.'];
  const queue = [...entries];

  return function loop(callback) {
    if (!queue.length) return callback(null);

    const next = queue.shift();
    const nextAbs = path.join(cwd, next);

    stat.call(fs, nextAbs, (err, stat) => {
      if (err) return callback(entries.indexOf(next) === -1 && err.code === 'ENOENT' ? null : err);

      if (!stat.isDirectory()) return callback(null, next, stat);

      fs.readdir(nextAbs, (err, files) => {
        if (err) return callback(err);

        if (sort) files.sort();

        for (let file of files) {
          const filePath = path.join(cwd, next, file);
          if (!ignore(filePath)) queue.push(filePath);
        }

        callback(null, next, stat);
      });
    });
  };
}

function pack(cwd = '.', options = {}) {
  const {
    fs: xfs = defaults.fs,
    ignore = defaults.noOp,
    mapStream = defaults.identity,
    dereference = false,
    finalize = true,
    entries,
    sort,
    strict = true,
    umask = ~getProcessUmask(),
    pack: packStream = defaults.pack(),
    finish = defaults.noOp,
    map = defaults.noOp,
    dmode = 0,
    fmode = 0,
    strip,
    readable,
    writable,
  } = options;

  const fsmethod = dereference ? xfs.stat : xfs.lstat;
  const statNext = statResolver(xfs, fsmethod, cwd, ignore, entries, sort);

  let currentMap = strip ? createStripFunction(strip, map) : map;

  if (readable) {
    dmode |= parseInt(555, 8);
    fmode |= parseInt(444, 8);
  }
  if (writable) {
    dmode |= parseInt(333, 8);
    fmode |= parseInt(222, 8);
  }

  processNextEntry();

  function processNextEntry(error) {
    if (error) return packStream.destroy(error);
    statNext(handleStat);
  }

  function handleStat(err, filename, stat) {
    if (packStream.destroyed) return;
    if (err) return packStream.destroy(err);
    if (!filename) {
      if (finalize) packStream.finalize();
      return finish(packStream);
    }

    if (stat.isSocket()) return processNextEntry();

    let header = {
      name: normalizeName(filename),
      mode: (stat.mode | (stat.isDirectory() ? dmode : fmode)) & umask,
      mtime: stat.mtime,
      size: stat.size,
      type: stat.isDirectory() ? 'directory' : 'file',
      uid: stat.uid,
      gid: stat.gid,
    };

    if (stat.isDirectory()) {
      header.size = 0;
      header = currentMap(header) || header;
      return packStream.entry(header, processNextEntry);
    }

    if (stat.isSymbolicLink()) {
      header.size = 0;
      header.type = 'symlink';
      header = currentMap(header) || header;
      return handleSymlink(filename, header);
    }

    header = currentMap(header) || header;

    if (!stat.isFile()) {
      if (strict) return packStream.destroy(new Error(`Unsupported type for ${filename}`));
      return processNextEntry();
    }

    const entry = packStream.entry(header, processNextEntry);
    const readStream = mapStream(xfs.createReadStream(path.join(cwd, filename), { start: 0, end: header.size - 1 }), header);

    readStream.on('error', (err) => entry.destroy(err));
    pump(readStream, entry);
  }

  function handleSymlink(filename, header) {
    xfs.readlink(path.join(cwd, filename), (err, linkname) => {
      if (err) return packStream.destroy(err);
      header.linkname = normalizeName(linkname);
      packStream.entry(header, processNextEntry);
    });
  }

  return packStream;
}

function createStripFunction(level, map) {
  return function (header) {
    header.name = header.name.split('/').slice(level).join('/');
    if (header.linkname && (header.type === 'link' || path.isAbsolute(header.linkname))) {
      header.linkname = header.linkname.split('/').slice(level).join('/');
    }
    return map(header);
  };
}

function extract(cwd = '.', options = {}) {
  const {
    fs: xfs = defaults.fs,
    ignore = defaults.noOp,
    mapStream = defaults.identity,
    finish,
    extract: extractStream = defaults.extract(),
    chown = true,
    umask = ~getProcessUmask(),
    strict = true,
    dmode = 0,
    fmode = 0,
    strip,
    readable,
    writable,
  } = options;

  const isRoot = !isWindows && process.getuid?.() === 0;
  const stack = [];
  const currentDate = new Date();

  let currentMap = strip ? createStripFunction(strip, (entry) => entry) : defaults.noOp;

  if (readable) {
    dmode |= parseInt(555, 8);
    fmode |= parseInt(444, 8);
  }
  if (writable) {
    dmode |= parseInt(333, 8);
    fmode |= parseInt(222, 8);
  }

  extractStream.on('entry', handleEntry);

  if (finish) extractStream.on('finish', finish);

  function handleEntry(header, stream, next) {
    header = currentMap(header) || header;
    header.name = normalizeName(header.name);

    const fullPath = path.join(cwd, path.join('/', header.name));

    if (ignore(fullPath, header)) {
      stream.resume();
      return next();
    }

    if (header.type === 'directory') {
      stack.push([fullPath, header.mtime]);
      return checkDirectoryExists(xfs, fullPath, () =>
        setTimes(fullPath, header, () => chmodAndChown(fullPath, header, next))
      );
    }

    validatePath(xfs, path.dirname(fullPath), path.join(cwd, '.'), (err, valid) => {
      if (err) return next(err);
      if (!valid) return next(new Error(`${path.dirname(fullPath)} is not a valid path`));

      checkDirectoryExists(xfs, path.dirname(fullPath), () => {
        switch (header.type) {
          case 'file':
            return writeFile(header);
          case 'link':
            return createLink(header);
          case 'symlink':
            return createSymlink(header);
        }

        if (strict) return next(new Error(`Unsupported type for ${fullPath} (${header.type})`));

        stream.resume();
        next();
      });
    });
  }

  function writeFile(header) {
    const writeStream = xfs.createWriteStream(fullPath);
    const readStream = mapStream(stream, header);

    writeStream.on('error', (err) => readStream.destroy(err));

    pump(readStream, writeStream, (err) => {
      if (err) return next(err);
      writeStream.on('close', () => setTimes(fullPath, header, () => chmodAndChown(fullPath, header, next)));
    });
  }

  function createSymlink(header) {
    if (isWindows) return next();
    xfs.unlink(fullPath, () => xfs.symlink(header.linkname, fullPath, () => setTimes(fullPath, header, next)));
  }

  function createLink(header) {
    if (isWindows) return next();
    xfs.unlink(fullPath, () => {
      const srcpath = path.join(cwd, path.join('/', header.linkname));

      xfs.link(srcpath, fullPath, (err) => {
        if (err && err.code === 'EPERM' && options.hardlinkAsFilesFallback) {
          stream = xfs.createReadStream(srcpath);
          return writeFile(header);
        }

        setTimes(fullPath, header, next(err));
      });
    });
  }

  function setTimes(name, header, callback) {
    if (options.utimes === false) return callback();

    if (header.type === 'directory') return xfs.utimes(name, currentDate, header.mtime, callback);
    if (header.type === 'symlink') return updateParentTimes(name, callback);

    xfs.utimes(name, currentDate, header.mtime, (err) => callback(err, updateParentTimes(name, callback)));
  }

  function updateParentTimes(name, callback) {
    let top;
    while ((top = headStack(stack)) && name.slice(0, top[0].length) !== top[0]) stack.pop();
    if (!top) return callback();
    xfs.utimes(top[0], currentDate, top[1], callback);
  }

  function chmodAndChown(name, header, callback) {
    const link = header.type === 'symlink';

    const chmod = link ? xfs.lchmod : xfs.chmod;
    const chown = link ? xfs.lchown : xfs.chown;

    if (!chmod) return callback();

    const mode = (header.mode | (header.type === 'directory' ? dmode : fmode)) & umask;

    if (chown && chown && isRoot) chown.call(xfs, name, header.uid, header.gid, onChown);
    else onChown(null);

    function onChown(err) {
      if (err) return callback(err);
      if (!chmod) return callback();
      chmod.call(xfs, name, mode, callback);
    }
  }

  return extractStream;
}

module.exports = { pack, extract };
