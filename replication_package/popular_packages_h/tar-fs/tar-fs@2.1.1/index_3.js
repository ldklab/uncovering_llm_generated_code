const chownr = require('chownr');
const tar = require('tar-stream');
const pump = require('pump');
const mkdirp = require('mkdirp-classic');
const fs = require('fs');
const path = require('path');
const os = require('os');

const win32 = os.platform() === 'win32';

const noop = () => {};

const normalize = win32 ? (name) => name.replace(/\\/g, '/').replace(/[:?<>|]/g, '_') : (name) => name;

const statAll = (fs, stat, cwd, ignore, entries, sort) => {
  const queue = entries || ['.'];

  const loop = (callback) => {
    if (!queue.length) return callback();
    const next = queue.shift();
    const nextAbs = path.join(cwd, next);

    stat.call(fs, nextAbs, (err, stat) => {
      if (err) return callback(err);
      if (!stat.isDirectory()) return callback(null, next, stat);

      fs.readdir(nextAbs, (err, files) => {
        if (err) return callback(err);
        if (sort) files.sort();
        files.forEach(file => {
          if (!ignore(path.join(cwd, next, file))) queue.push(path.join(next, file));
        });

        callback(null, next, stat);
      });
    });
  };

  return loop;
};

const strip = (map, level) => (header) => {
  header.name = header.name.split('/').slice(level).join('/');
  if (header.linkname && (header.type === 'link' || path.isAbsolute(header.linkname))) {
    header.linkname = header.linkname.split('/').slice(level).join('/');
  }
  return map(header);
};

exports.pack = (cwd = '.', opts = {}) => {
  const xfs = opts.fs || fs;
  const ignore = opts.ignore || opts.filter || noop;
  let map = opts.map || noop;
  const mapStream = opts.mapStream || ((stream) => stream);
  const statNext = statAll(xfs, opts.dereference ? xfs.stat : xfs.lstat, cwd, ignore, opts.entries, opts.sort);
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

  const onstat = (err, filename, stat) => {
    if (err) return pack.destroy(err);
    if (!filename) {
      if (opts.finalize !== false) pack.finalize();
      return finish(pack);
    }

    if (stat.isSocket()) return onnextentry(); // tar does not support sockets...

    let header = {
      name: normalize(filename),
      mode: (stat.mode | (stat.isDirectory() ? dmode : fmode)) & umask,
      mtime: stat.mtime,
      size: stat.size,
      type: 'file',
      uid: stat.uid,
      gid: stat.gid
    };

    if (stat.isDirectory()) {
      header.size = 0;
      header.type = 'directory';
      header = map(header) || header;
      return pack.entry(header, onnextentry);
    }

    if (stat.isSymbolicLink()) {
      header.size = 0;
      header.type = 'symlink';
      header = map(header) || header;
      return onsymlink(filename, header);
    }

    header = map(header) || header;

    if (!stat.isFile()) {
      if (strict) return pack.destroy(new Error('unsupported type for ' + filename));
      return onnextentry();
    }

    const entry = pack.entry(header, onnextentry);
    if (!entry) return;

    const rs = mapStream(xfs.createReadStream(path.join(cwd, filename), { start: 0, end: header.size > 0 ? header.size - 1 : 0 }), header);

    rs.on('error', (err) => entry.destroy(err));

    pump(rs, entry);
  };

  const onnextentry = (err) => {
    if (err) return pack.destroy(err);
    statNext(onstat);
  };

  onnextentry();

  return pack;
};

exports.extract = (cwd = '.', opts = {}) => {
  const xfs = opts.fs || fs;
  const ignore = opts.ignore || opts.filter || noop;
  let map = opts.map || noop;
  const mapStream = opts.mapStream || ((stream) => stream);
  const own = opts.chown !== false && !win32 && process.getuid && process.getuid() === 0;
  const extract = opts.extract || tar.extract();
  const stack = [];
  const now = new Date();
  const umask = typeof opts.umask === 'number' ? ~opts.umask : ~process.umask();
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
    while ((top = stack[stack.length - 1]) && name.slice(0, top[0].length) !== top[0]) stack.pop();
    if (!top) return cb();
    xfs.utimes(top[0], now, top[1], cb);
  };

  const utimes = (name, header, cb) => {
    if (opts.utimes === false) return cb();
    if (header.type === 'directory') return xfs.utimes(name, now, header.mtime, cb);
    if (header.type === 'symlink') return utimesParent(name, cb);

    xfs.utimes(name, now, header.mtime, (err) => {
      if (err) return cb(err);
      utimesParent(name, cb);
    });
  };

  const chperm = (name, header, cb) => {
    const link = header.type === 'symlink';
    const chmod = link ? xfs.lchmod : xfs.chmod;
    const chown = link ? xfs.lchown : xfs.chown;

    if (!chmod) return cb();

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

    const stat = (err) => {
      if (err) return next(err);
      utimes(name, header, (err) => {
        if (err) return next(err);
        if (win32) return next();
        chperm(name, header, next);
      });
    };

    const onsymlink = () => {
      if (win32) return next();
      xfs.unlink(name, () => {
        xfs.symlink(header.linkname, name, stat);
      });
    };

    const onlink = () => {
      if (win32) return next();
      xfs.unlink(name, () => {
        const srcpath = path.join(cwd, path.join('/', header.linkname));

        xfs.link(srcpath, name, (err) => {
          if (err && err.code === 'EPERM' && opts.hardlinkAsFilesFallback) {
            stream = xfs.createReadStream(srcpath);
            return onfile();
          }

          stat(err);
        });
      });
    };

    const onfile = () => {
      const ws = xfs.createWriteStream(name);
      const rs = mapStream(stream, header);

      ws.on('error', (err) => rs.destroy(err));

      pump(rs, ws, (err) => {
        if (err) return next(err);
        ws.on('close', stat);
      });
    };

    if (header.type === 'directory') {
      stack.push([name, header.mtime]);
      return mkdirfix(name, { fs: xfs, own, uid: header.uid, gid: header.gid }, stat);
    }

    const dir = path.dirname(name);

    validate(xfs, dir, path.join(cwd, '.'), (err, valid) => {
      if (err) return next(err);
      if (!valid) return next(new Error(`${dir} is not a valid path`));

      mkdirfix(dir, { fs: xfs, own, uid: header.uid, gid: header.gid }, (err) => {
        if (err) return next(err);

        switch (header.type) {
          case 'file': return onfile();
          case 'link': return onlink();
          case 'symlink': return onsymlink();
        }

        if (strict) return next(new Error(`unsupported type for ${name} (${header.type})`));

        stream.resume();
        next();
      });
    });
  });

  if (opts.finish) extract.on('finish', opts.finish);

  return extract;
};

function validate(fs, name, root, cb) {
  if (name === root) return cb(null, true);
  fs.lstat(name, function (err, st) {
    if (err && err.code !== 'ENOENT') return cb(err);
    if (err || st.isDirectory()) return validate(fs, path.join(name, '..'), root, cb);
    cb(null, false);
  });
}

function mkdirfix(name, opts, cb) {
  mkdirp(name, { fs: opts.fs }, function (err, made) {
    if (!err && made && opts.own) {
      chownr(made, opts.uid, opts.gid, cb);
    } else {
      cb(err);
    }
  });
}
