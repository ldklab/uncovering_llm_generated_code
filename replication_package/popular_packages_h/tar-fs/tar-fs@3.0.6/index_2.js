const tar = require('tar-stream');
const pump = require('pump');
const fs = require('fs');
const path = require('path');

const win32 = (global.Bare?.platform || process.platform) === 'win32';

exports.pack = function pack(cwd = '.', opts = {}) {
  const xfs = opts.fs || fs;
  const ignore = opts.ignore || opts.filter || noop;
  const mapStream = opts.mapStream || echo;
  const statNext = statAll(xfs, opts.dereference ? xfs.stat : xfs.lstat, cwd, ignore, opts.entries, opts.sort);
  const strict = opts.strict !== false;
  const umask = typeof opts.umask === 'number' ? ~opts.umask : ~processUmask();
  const pack = opts.pack || tar.pack();
  const finish = opts.finish || noop;

  let map = opts.map || noop;
  let dmode = typeof opts.dmode === 'number' ? opts.dmode : 0;
  let fmode = typeof opts.fmode === 'number' ? opts.fmode : 0;

  if (opts.strip) map = strip(map, opts.strip);

  if (opts.readable) {
    dmode |= parseInt(555, 8);
    fmode |= parseInt(444, 8);
  }
  if (opts.writable) {
    dmode |= parseInt(333, 8);
    fmode |= parseInt(222, 8);
  }

  onnextentry();

  function onsymlink(filename, header) {
    xfs.readlink(path.join(cwd, filename), function (err, linkname) {
      if (err) return pack.destroy(err);
      header.linkname = normalize(linkname);
      pack.entry(header, onnextentry);
    });
  }

  function onstat(err, filename, stat) {
    if (pack.destroyed) return;
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
    const rs = mapStream(xfs.createReadStream(path.join(cwd, filename), { start: 0, end: header.size > 0 ? header.size - 1 : header.size }), header);

    rs.on('error', function (err) {
      entry.destroy(err);
    });

    pump(rs, entry);
  }

  function onnextentry(err) {
    if (err) return pack.destroy(err);
    statNext(onstat);
  }

  return pack;
}

function head(list) {
  return list.length ? list[list.length - 1] : null;
}

function processGetuid() {
  return process.getuid ? process.getuid() : -1;
}

function processUmask() {
  return process.umask ? process.umask() : 0;
}

exports.extract = function extract(cwd = '.', opts = {}) {
  const xfs = opts.fs || fs;
  const ignore = opts.ignore || opts.filter || noop;
  const mapStream = opts.mapStream || echo;
  const own = opts.chown !== false && !win32 && processGetuid() === 0;
  const extract = opts.extract || tar.extract();
  const stack = [];
  const now = new Date();
  const umask = typeof opts.umask === 'number' ? ~opts.umask : ~processUmask();
  const strict = opts.strict !== false;

  let map = opts.map || noop;
  let dmode = typeof opts.dmode === 'number' ? opts.dmode : 0;
  let fmode = typeof opts.fmode === 'number' ? opts.fmode : 0;

  if (opts.strip) map = strip(map, opts.strip);

  if (opts.readable) {
    dmode |= parseInt(555, 8);
    fmode |= parseInt(444, 8);
  }
  if (opts.writable) {
    dmode |= parseInt(333, 8);
    fmode |= parseInt(222, 8);
  }

  extract.on('entry', onentry);

  if (opts.finish) extract.on('finish', opts.finish);

  return extract;

  function onentry(header, stream, next) {
    header = map(header) || header;
    header.name = normalize(header.name);

    const name = path.join(cwd, path.join('/', header.name));

    if (ignore(name, header)) {
      stream.resume();
      return next();
    }

    if (header.type === 'directory') {
      stack.push([name, header.mtime]);
      return mkdirfix(name, {
        fs: xfs,
        own,
        uid: header.uid,
        gid: header.gid,
        mode: header.mode
      }, stat);
    }

    const dir = path.dirname(name);

    validate(xfs, dir, path.join(cwd, '.'), function (err, valid) {
      if (err) return next(err);
      if (!valid) return next(new Error(dir + ' is not a valid path'));

      mkdirfix(dir, {
        fs: xfs,
        own,
        uid: header.uid,
        gid: header.gid,
        mode: 0o755
      }, function (err) {
        if (err) return next(err);

        switch (header.type) {
          case 'file': return onfile();
          case 'link': return onlink();
          case 'symlink': return onsymlink();
        }

        if (strict) return next(new Error('unsupported type for ' + name + ' (' + header.type + ')'));

        stream.resume();
        next();
      });
    });

    function stat(err) {
      if (err) return next(err);
      utimes(name, header, function (err) {
        if (err) return next(err);
        if (win32) return next();
        chperm(name, header, next);
      });
    }

    function onsymlink() {
      if (win32) return next();
      xfs.unlink(name, function () {
        xfs.symlink(header.linkname, name, stat);
      });
    }

    function onlink() {
      if (win32) return next();
      xfs.unlink(name, function () {
        const srcpath = path.join(cwd, path.join('/', header.linkname));

        xfs.link(srcpath, name, function (err) {
          if (err && err.code === 'EPERM' && opts.hardlinkAsFilesFallback) {
            stream = xfs.createReadStream(srcpath);
            return onfile();
          }

          stat(err);
        });
      });
    }

    function onfile() {
      const ws = xfs.createWriteStream(name);
      const rs = mapStream(stream, header);

      ws.on('error', function (err) {
        rs.destroy(err);
      });

      pump(rs, ws, function (err) {
        if (err) return next(err);
        ws.on('close', stat);
      });
    }
  }

  function utimesParent(name, cb) {
    let top;
    while ((top = head(stack)) && name.slice(0, top[0].length) !== top[0]) stack.pop();
    if (!top) return cb();
    xfs.utimes(top[0], now, top[1], cb);
  }

  function utimes(name, header, cb) {
    if (opts.utimes === false) return cb();

    if (header.type === 'directory') return xfs.utimes(name, now, header.mtime, cb);
    if (header.type === 'symlink') return utimesParent(name, cb);

    xfs.utimes(name, now, header.mtime, function (err) {
      if (err) return cb(err);
      utimesParent(name, cb);
    });
  }

  function chperm(name, header, cb) {
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
  }

  function mkdirfix(name, opts, cb) {
    xfs.stat(name, function (err) {
      if (!err) return cb(null);
      if (err.code !== 'ENOENT') return cb(err);
      xfs.mkdir(name, { mode: opts.mode, recursive: true }, function (err, made) {
        if (err) return cb(err);
        chperm(name, opts, cb);
      });
    });
  }
}

function validate(fs, name, root, cb) {
  if (name === root) return cb(null, true);
  fs.lstat(name, function (err, st) {
    if (err && err.code === 'ENOENT') return validate(fs, path.join(name, '..'), root, cb);
    else if (err) return cb(err);
    cb(null, st.isDirectory());
  });
}

function noop() {}

function echo(name) {
  return name;
}

function normalize(name) {
  return win32 ? name.replace(/\\/g, '/').replace(/[:?<>|]/g, '_') : name;
}

function statAll(fs, stat, cwd, ignore, entries, sort) {
  if (!entries) entries = ['.'];
  const queue = entries.slice(0);

  return function loop(callback) {
    if (!queue.length) return callback(null);

    const next = queue.shift();
    const nextAbs = path.join(cwd, next);

    stat.call(fs, nextAbs, function (err, stat) {
      if (err) return callback(entries.indexOf(next) === -1 && err.code === 'ENOENT' ? null : err);

      if (!stat.isDirectory()) return callback(null, next, stat);

      fs.readdir(nextAbs, function (err, files) {
        if (err) return callback(err);

        if (sort) files.sort();

        for (let i = 0; i < files.length; i++) {
          if (!ignore(path.join(cwd, next, files[i]))) queue.push(path.join(next, files[i]));
        }

        callback(null, next, stat);
      });
    });
  }
}

function strip(map, level) {
  return function (header) {
    header.name = header.name.split('/').slice(level).join('/');

    const linkname = header.linkname;
    if (linkname && (header.type === 'link' || path.isAbsolute(linkname))) {
      header.linkname = linkname.split('/').slice(level).join('/');
    }

    return map(header);
  }
}
