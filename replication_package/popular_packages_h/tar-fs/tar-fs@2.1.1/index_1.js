const chownr = require('chownr')
const tar = require('tar-stream')
const pump = require('pump')
const mkdirp = require('mkdirp-classic')
const fs = require('fs')
const path = require('path')
const os = require('os')

const isWin32 = os.platform() === 'win32'

const noop = () => {}

const normalizePath = name => isWin32 ? name.replace(/\\/g, '/').replace(/[:?<>|]/g, '_') : name

const statAll = (fs, statOp, cwd, ignore, entries = ['.'], sort) => {
  let queue = entries

  return function traverse(callback) {
    if (!queue.length) return callback()
    const next = queue.shift()
    const nextAbs = path.join(cwd, next)

    statOp.call(fs, nextAbs, (err, stat) => {
      if (err) return callback(err)

      if (!stat.isDirectory()) return callback(null, next, stat)

      fs.readdir(nextAbs, (err, files) => {
        if (err) return callback(err)

        if (sort) files.sort()
        files.forEach(file => {
          if (!ignore(path.join(cwd, next, file))) queue.push(path.join(next, file))
        })

        callback(null, next, stat)
      })
    })
  }
}

const strip = (map, level) => header => {
  header.name = header.name.split('/').slice(level).join('/')
  if (header.linkname && (header.type === 'link' || path.isAbsolute(header.linkname))) {
    header.linkname = header.linkname.split('/').slice(level).join('/')
  }
  return map(header)
}

exports.pack = (cwd = '.', opts = {}) => {
  const {
    fs: xfs = fs,
    ignore = noop,
    map = noop,
    mapStream = name => name,
    dereference,
    entries,
    sort,
    strict = true,
    umask: optUmask,
    dmode = 0,
    fmode = 0,
    pack = tar.pack(),
    finish = noop,
    strip,
    readable,
    writable,
    finalize = true
  } = opts
  const processUmask = () => process.umask ? process.umask() : 0
  const statNext = statAll(xfs, dereference ? xfs.stat : xfs.lstat, cwd, ignore, entries, sort)
  const umask = typeof optUmask === 'number' ? ~optUmask : ~processUmask()

  if (strip) map = strip(map, strip)
  if (readable) {
    dmode |= parseInt(555, 8)
    fmode |= parseInt(444, 8)
  }
  if (writable) {
    dmode |= parseInt(333, 8)
    fmode |= parseInt(222, 8)
  }

  const handleSymlink = (filename, header) => {
    xfs.readlink(path.join(cwd, filename), (err, linkname) => {
      if (err) return pack.destroy(err)
      header.linkname = normalizePath(linkname)
      pack.entry(header, processNextEntry)
    })
  }

  const processStat = (err, filename, stat) => {
    if (err) return pack.destroy(err)
    if (!filename) {
      if (finalize) pack.finalize()
      return finish(pack)
    }

    if (stat.isSocket()) return processNextEntry()

    let header = {
      name: normalizePath(filename),
      mode: (stat.mode | (stat.isDirectory() ? dmode : fmode)) & umask,
      mtime: stat.mtime,
      size: stat.size,
      type: 'file',
      uid: stat.uid,
      gid: stat.gid
    }

    if (stat.isDirectory()) {
      header.size = 0
      header.type = 'directory'
      header = map(header) || header
      return pack.entry(header, processNextEntry)
    }

    if (stat.isSymbolicLink()) {
      header.size = 0
      header.type = 'symlink'
      header = map(header) || header
      return handleSymlink(filename, header)
    }

    header = map(header) || header

    if (!stat.isFile()) {
      if (strict) return pack.destroy(new Error('unsupported type for ' + filename))
      return processNextEntry()
    }

    const entry = pack.entry(header, processNextEntry)
    if (!entry) return

    const rs = mapStream(xfs.createReadStream(path.join(cwd, filename), { start: 0, end: Math.max(header.size - 1, 0) }), header)
    rs.on('error', err => entry.destroy(err))

    pump(rs, entry)
  }

  const processNextEntry = err => {
    if (err) return pack.destroy(err)
    statNext(processStat)
  }

  processNextEntry()

  return pack
}

exports.extract = (cwd = '.', opts = {}) => {
  const {
    fs: xfs = fs,
    ignore = noop,
    map = noop,
    mapStream = name => name,
    chown = true,
    extract = tar.extract(),
    strip,
    readable,
    writable,
    finish,
    ...rest
  } = opts
  const own = chown !== false && !isWin32 && process.getuid() === 0
  const now = new Date()
  const processUmask = () => process.umask ? process.umask() : 0
  const umask = typeof rest.umask === 'number' ? ~rest.umask : ~processUmask()
  const dmode = typeof rest.dmode === 'number' ? rest.dmode : 0
  const fmode = typeof rest.fmode === 'number' ? rest.fmode : 0
  const strict = rest.strict !== false
  const stack = []

  if (strip) map = strip(map, strip)

  if (readable) {
    dmode |= parseInt(555, 8)
    fmode |= parseInt(444, 8)
  }
  if (writable) {
    dmode |= parseInt(333, 8)
    fmode |= parseInt(222, 8)
  }

  const setUtimesParent = (name, cb) => {
    let top
    while ((top = stack[stack.length - 1]) && name.slice(0, top[0].length) !== top[0]) stack.pop()
    if (!top) return cb()
    xfs.utimes(top[0], now, top[1], cb)
  }

  const setUtimes = (name, header, cb) => {
    if (opts.utimes === false) return cb()

    if (header.type === 'directory') return xfs.utimes(name, now, header.mtime, cb)
    if (header.type === 'symlink') return setUtimesParent(name, cb)

    xfs.utimes(name, now, header.mtime, err => {
      if (err) return cb(err)
      setUtimesParent(name, cb)
    })
  }

  const changePermissions = (name, header, cb) => {
    const link = header.type === 'symlink'
    const chmod = link ? xfs.lchmod : xfs.chmod
    const chown = link ? xfs.lchown : xfs.chown

    if (!chmod) return cb()

    const mode = (header.mode | (header.type === 'directory' ? dmode : fmode)) & umask

    if (chown && own) chown.call(xfs, name, header.uid, header.gid, onChown)
    else onChown(null)

    function onChown(err) {
      if (err) return cb(err)
      if (!chmod) return cb()
      chmod.call(xfs, name, mode, cb)
    }
  }

  extract.on('entry', (header, stream, next) => {
    header = map(header) || header
    header.name = normalizePath(header.name)
    const name = path.join(cwd, path.join('/', header.name))

    if (ignore(name, header)) {
      stream.resume()
      return next()
    }

    const afterStat = err => {
      if (err) return next(err)
      setUtimes(name, header, err => {
        if (err) return next(err)
        if (isWin32) return next()
        changePermissions(name, header, next)
      })
    }

    const onSymLink = () => {
      if (isWin32) return next()
      xfs.unlink(name, () => {
        xfs.symlink(header.linkname, name, afterStat)
      })
    }

    const onHardLink = () => {
      if (isWin32) return next()
      xfs.unlink(name, () => {
        const srcpath = path.join(cwd, path.join('/', header.linkname))

        xfs.link(srcpath, name, err => {
          if (err && err.code === 'EPERM' && rest.hardlinkAsFilesFallback) {
            stream = xfs.createReadStream(srcpath)
            return onFile()
          }

          afterStat(err)
        })
      })
    }

    const onFile = () => {
      const ws = xfs.createWriteStream(name)
      const rs = mapStream(stream, header)
      ws.on('error', err => rs.destroy(err))

      pump(rs, ws, err => {
        if (err) return next(err)
        ws.on('close', afterStat)
      })
    }

    if (header.type === 'directory') {
      stack.push([name, header.mtime])
      return ensureDirExists(name, {
        fs: xfs, own, uid: header.uid, gid: header.gid
      }, afterStat)
    }

    const dir = path.dirname(name)

    validatePath(xfs, dir, path.join(cwd, '.'), (err, valid) => {
      if (err) return next(err)
      if (!valid) return next(new Error(`${dir} is not a valid path`))

      ensureDirExists(dir, {
        fs: xfs, own, uid: header.uid, gid: header.gid
      }, err => {
        if (err) return next(err)

        switch (header.type) {
          case 'file': return onFile()
          case 'link': return onHardLink()
          case 'symlink': return onSymLink()
        }

        if (strict) return next(new Error(`unsupported type for ${name} (${header.type})`))

        stream.resume()
        next()
      })
    })
  })

  if (finish) extract.on('finish', finish)

  return extract
}

const validatePath = (fs, name, root, cb) => {
  if (name === root) return cb(null, true)
  fs.lstat(name, (err, st) => {
    if (err && err.code !== 'ENOENT') return cb(err)
    if (err || st.isDirectory()) return validatePath(fs, path.join(name, '..'), root, cb)
    cb(null, false)
  })
}

const ensureDirExists = (name, { fs, own, uid, gid }, cb) => {
  mkdirp(name, { fs }, (err, made) => {
    if (!err && made && own) {
      chownr(made, uid, gid, cb)
    } else {
      cb(err)
    }
  })
}
