const chownr = require('chownr');
const tar = require('tar-stream');
const pump = require('pump');
const mkdirp = require('mkdirp-classic');
const fs = require('fs');
const path = require('path');
const os = require('os');

const win32 = os.platform() === 'win32';

const noop = () => {};

const echo = (name) => name;

const normalize = !win32 ? echo : (name) =>
  name.replace(/\\/g, '/').replace(/[:?<>|]/g, '_');

const statAll = (fs, statFn, cwd, ignore, entries, sort) => {
  const queue = entries || ['.'];

  return function loop(callback) {
    if (!queue.length) return callback();
    const next = queue.shift();
    const nextAbs = path.join(cwd, next);

    statFn.call(fs, nextAbs, (err, stats) => {
      if (err) return callback(err);

      if (!stats.isDirectory()) return callback(null, next, stats);

      fs.readdir(nextAbs, (err, files) => {
        if (err) return callback(err);

        if (sort) files.sort();
        for (const file of files) {
          if (!ignore(path.join(cwd, next, file))) {
            queue.push(path.join(next, file));
          }
        }

        callback(null, next, stats);
      });
    });
  };
};

const strip = (map, level) => (header) => {
  header.name = header.name.split('/').slice(level).join('/');
  const linkname = header.linkname;
  if (linkname && (header.type === 'link' || path.isAbsolute(linkname))) {
    header.linkname = linkname.split('/').slice(level).join('/');
  }
  return map(header);
};

exports.pack = (cwd = '.', opts = {}) => {
  const xfs = opts.fs || fs;
  const ignore = opts.ignore || opts.filter || noop;
  let map = opts.map || noop;
  const mapStream = opts.mapStream || echo;
  const statNext = statAll(
    xfs,
    opts.dereference ? xfs.stat : xfs.lstat,
    cwd,
    ignore,
    opts.entries,
    opts.sort
  );
  const strict = opts.strict !== false;
  const umask = typeof opts.umask === 'number' ? ~opts.umask : ~process.umask();
  const dmode = typeof opts.dmode === 'number' ? opts.dmode : 0;
  const fmode = typeof opts.fmode === 'number' ? opts.fmode : 0;
  const pack = opts.pack || tar.pack();
  const finish = opts.finish || noop;

  if (opts.strip) map = strip(map, opts.strip);

  if (opts.readable) {
    dmode |= parseInt('555', 8);
    fmode |= parseInt('444', 8);
  }
  if (opts.writable) {
    dmode |= parseInt('333', 8);
    fmode |= parseInt('222', 8);
  }

  const onsymlink = (filename, header) => {
    xfs.readlink(path.join(cwd, filename), (err, linkname) => {
      if (err) return pack.destroy(err);
      header.linkname = normalize(linkname);
      pack.entry(header, onnextentry);
    });
  };

  const onstat = (err, filename, stats) => {
    if (err) return pack.destroy(err);
    if (!filename) {
      if (opts.finalize !== false) pack.finalize();
      return finish(pack);
    }

    if (stats.isSocket()) return onnextentry(); // tar does not support sockets...

    let header = {
      name: normalize(filename),
      mode: (stats.mode | (stats.isDirectory() ? dmode : fmode)) & umask,
      mtime: stats.mtime,
      size: stats.size,
      type: 'file',
      uid: stats.uid,
      gid: stats.gid,
    };

    if (stats.isDirectory()) {
      header.size = 0;
      header.type = 'directory';
      header = map(header) || header;
      return pack.entry(header, onnextentry);
    }

    if (stats.isSymbolicLink()) {
      header.size = 0;
      header.type = 'symlink';
      header = map(header) || header;
      return onsymlink(filename, header);
    }

    // Unsupported types (e.g., FIFO, sockets)
    header = map(header) || header;

    if (!stats.isFile()) {
      if (strict) return pack.destroy(new Error(`unsupported type for ${filename}`));
      return onnextentry();
    }

    const entry = pack.entry(header, onnextentry);
    if (!entry) return;

    const rs = mapStream(
      xfs.createReadStream(path.join(cwd, filename), { start: 0, end: header.size - 1 }),
      header
    );

    rs.on('error', (err) => {
      entry.destroy(err);
    });

    pump(rs, entry);
  };

  const onnextentry = (err) => {
    if (err) return pack.destroy(err);
    statNext(onstat);
  };

  onnextentry();
  return pack;
};

const head = (list) => (list.length ? list[list.length - 1] : null);

const processUmask = () => (typeof process.umask === 'function' ? process.umask() : 0);

exports.extract = (cwd = '.', opts = {}) => {
  const xfs = opts.fs || fs;
  const ignore = opts.ignore || opts.filter || noop;
  let map = opts.map || noop;
  const mapStream = opts.mapStream || echo;
  const own = opts.chown !== false && !win32 && process.getuid && process.getuid() === 0;
  const extract = opts.extract || tar.extract();
  const stack = [];
  const now = new Date();
  const umask = typeof opts.umask === 'number' ? ~opts.umask : ~processUmask();
  const dmode = typeof opts.dmode === 'number' ? opts.dmode : 0;
  const fmode = typeof opts.fmode === 'number' ? opts.fmode : 0;
  const strict = opts.strict !== false;

  if (opts.strip) map = strip(map, opts.strip);

  if (opts.readable) {
    dmode |= parseInt('555', 8);
    fmode |= parseInt('444', 8);
  }
  if (opts.writable) {
    dmode |= parseInt('333', 8);
    fmode |= parseInt('222', 8);
  }

  const utimesParent = (name, cb) => {
    let top;
    while ((top = head(stack)) && !name.startsWith(top[0])) stack.pop();
    if (!top) return cb();
    xfs.utimes(top[0], now, top[1], cb);
  };

  const utimes = (name, header, cb) => {
    if (opts.utimes === false) return cb();

    const updateParentTime = () => utimesParent(name, cb);
    if (header.type === 'directory') {
      return xfs.utimes(name, now, header.mtime, cb);
    }
    if (header.type === 'symlink') return updateParentTime();

    xfs.utimes(name, now, header.mtime, (err) => {
      if (err) return cb(err);
      updateParentTime();
    });
  };

  const chperm = (name, header, cb) => {
    const link = header.type === 'symlink';
    const chmod = link ? xfs.lchmod : xfs.chmod;
    const chown = link ? xfs.lchown : xfs.chown;
    const mode = (header.mode | (header.type === 'directory' ? dmode : fmode)) & umask;

    if (chown && own) chown.call(xfs, name, header.uid, header.gid, onchown);
    else onchown(null);

    function onchown(err) {
      if (err) return cb(err);
      if (!chmod) return cb();
      chmod.call(xfs, name, mode, cb);
    }
  };

  extract.on('entry', (header, stream, next) => {
    header = map(header) || header;
    header.name = normalize(header.name);
    const name = path.join(cwd, path.join('/', header.name));

    if (ignore(name, header)) {
      stream.resume();
      return next();
    }

    const handleStat = (err) => {
      if (err) return next(err);
      utimes(name, header, (err) => {
        if (err) return next(err);
        if (win32) return next();
        chperm(name, header, next);
      });
    };

    const handleSymlink = () => {
      if (win32) return next();

      xfs.unlink(name, () => {
        xfs.symlink(header.linkname, name, handleStat);
      });
    };

    const handleLink = () => {
      if (win32) return next();

      xfs.unlink(name, () => {
        const srcpath = path.join(cwd, path.join('/', header.linkname));
        xfs.link(srcpath, name, (err) => {
          if (err && err.code === 'EPERM' && opts.hardlinkAsFilesFallback) {
            stream = xfs.createReadStream(srcpath);
            return handleFile();
          }
          handleStat(err);
        });
      });
    };

    const handleFile = () => {
      const ws = xfs.createWriteStream(name);
      const rs = mapStream(stream, header);

      ws.on('error', (err) => {
        rs.destroy(err);
      });

      pump(rs, ws, (err) => {
        if (err) return next(err);
        ws.on('close', handleStat);
      });
    };

    if (header.type === 'directory') {
      stack.push([name, header.mtime]);
      return mkdirfix(name, { fs: xfs, own, uid: header.uid, gid: header.gid }, handleStat);
    }

    const dir = path.dirname(name);
    validate(xfs, dir, path.join(cwd, '.'), (err, valid) => {
      if (err) return next(err);
      if (!valid) return next(new Error(`${dir} is not a valid path`));

      mkdirfix(dir, { fs: xfs, own, uid: header.uid, gid: header.gid }, (err) => {
        if (err) return next(err);

        switch (header.type) {
          case 'file':
            return handleFile();
          case 'link':
            return handleLink();
          case 'symlink':
            return handleSymlink();
        }

        if (strict) {
          return next(new Error(`unsupported type for ${name} (${header.type})`));
        }

        stream.resume();
        next();
      });
    });
  });

  if (opts.finish) extract.on('finish', opts.finish);

  return extract;
};

const validate = (fs, name, root, cb) => {
  if (name === root) return cb(null, true);
  fs.lstat(name, (err, st) => {
    if (err && err.code !== 'ENOENT') return cb(err);
    if (err || st.isDirectory()) return validate(fs, path.join(name, '..'), root, cb);
    cb(null, false);
  });
};

const mkdirfix = (name, opts, cb) => {
  mkdirp(name, { fs: opts.fs }, (err, made) => {
    if (!err && made && opts.own) {
      chownr(made, opts.uid, opts.gid, cb);
    } else {
      cb(err);
    }
  });
};
