const Utils = require("./util");
const path = require("path");
const ZipEntry = require("./zipEntry");
const ZipFile = require("./zipFile");

function extractBoolean(...vals) {
  return Utils.findLast(vals, val => typeof val === "boolean");
}
function extractString(...vals) {
  return Utils.findLast(vals, val => typeof val === "string");
}
function extractFunction(...vals) {
  return Utils.findLast(vals, val => typeof val === "function");
}

const defaultOptions = {
  noSort: false,
  readEntries: false,
  method: Utils.Constants.NONE,
  fs: null
};

module.exports = function(input, options) {
  let inBuffer = null;
  const opts = Object.assign(Object.create(null), defaultOptions);

  if (input && typeof input === "object") {
    if (!(input instanceof Uint8Array)) {
      Object.assign(opts, input);
      input = opts.input || undefined;
      opts.input && delete opts.input;
    }
    if (Buffer.isBuffer(input)) {
      inBuffer = input;
      opts.method = Utils.Constants.BUFFER;
      input = undefined;
    }
  }

  Object.assign(opts, options);
  const filetools = new Utils(opts);

  opts.decoder =
    typeof opts.decoder === "object" &&
    typeof opts.decoder.encode === "function" &&
    typeof opts.decoder.decode === "function"
      ? opts.decoder
      : Utils.decoder;

  if (input && typeof input === "string") {
    if (filetools.fs.existsSync(input)) {
      opts.method = Utils.Constants.FILE;
      opts.filename = input;
      inBuffer = filetools.fs.readFileSync(input);
    } else {
      throw Utils.Errors.INVALID_FILENAME();
    }
  }

  const _zip = new ZipFile(inBuffer, opts);
  const { canonical, sanitize, zipnamefix } = Utils;

  function getEntry(entry) {
    if (entry && _zip) {
      if (typeof entry === "string") return _zip.getEntry(path.posix.normalize(entry));
      if (typeof entry === "object" && entry.entryName && entry.header)
        return _zip.getEntry(entry.entryName);
    }
    return null;
  }

  function fixPath(zipPath) {
    const { join, normalize, sep } = path.posix;
    return join(".", normalize(sep + zipPath.split("\\").join(sep) + sep));
  }

  function filenameFilter(filter) {
    if (filter instanceof RegExp) {
      return filename => filter.test(filename);
    }
    if (typeof filter !== "function") {
      return () => true;
    }
    return filter;
  }

  const relativePath = (local, entry) => {
    let lastChar = entry.slice(-1);
    lastChar = lastChar === filetools.sep ? filetools.sep : "";
    return path.relative(local, entry) + lastChar;
  };

  return {
    readFile(entry, pass) {
      const item = getEntry(entry);
      return item?.getData(pass) || null;
    },

    childCount(entry) {
      const item = getEntry(entry);
      return item ? _zip.getChildCount(item) : undefined;
    },

    readFileAsync(entry, callback) {
      const item = getEntry(entry);
      if (item) {
        item.getDataAsync(callback);
      } else {
        callback(null, `getEntry failed for: ${entry}`);
      }
    },

    readAsText(entry, encoding) {
      const item = getEntry(entry);
      if (item) {
        const data = item.getData();
        return data ? data.toString(encoding || "utf8") : "";
      }
      return "";
    },

    readAsTextAsync(entry, callback, encoding) {
      const item = getEntry(entry);
      if (item) {
        item.getDataAsync((data, err) => {
          if (err) callback(data, err);
          else callback(data?.toString(encoding || "utf8") || "");
        });
      } else {
        callback("");
      }
    },

    deleteFile(entry, withsubfolders = true) {
      const item = getEntry(entry);
      if (item) {
        _zip.deleteFile(item.entryName, withsubfolders);
      }
    },

    deleteEntry(entry) {
      const item = getEntry(entry);
      if (item) {
        _zip.deleteEntry(item.entryName);
      }
    },

    addZipComment(comment) {
      _zip.comment = comment;
    },

    getZipComment() {
      return _zip.comment || "";
    },

    addZipEntryComment(entry, comment) {
      const item = getEntry(entry);
      if (item) {
        item.comment = comment;
      }
    },

    getZipEntryComment(entry) {
      const item = getEntry(entry);
      return item?.comment || "";
    },

    updateFile(entry, content) {
      const item = getEntry(entry);
      if (item) {
        item.setData(content);
      }
    },

    addLocalFile(localPath, zipPath, zipName, comment) {
      if (filetools.fs.existsSync(localPath)) {
        zipPath = zipPath ? fixPath(zipPath) : "";
        const basename = path.win32.basename(path.win32.normalize(localPath));
        zipPath += zipName || basename;
        const fileStats = filetools.fs.statSync(localPath);
        const isFile = fileStats.isFile();
        const data = isFile ? filetools.fs.readFileSync(localPath) : Buffer.alloc(0);
        if (fileStats.isDirectory()) zipPath += filetools.sep;
        this.addFile(zipPath, data, comment, fileStats);
      } else {
        throw Utils.Errors.FILE_NOT_FOUND(localPath);
      }
    },

    addLocalFileAsync(options, callback) {
      options = typeof options === "object" ? options : { localPath: options };
      const localPath = path.resolve(options.localPath);
      const { comment } = options;
      let { zipPath, zipName } = options;
      const self = this;

      filetools.fs.stat(localPath, (err, stats) => {
        if (err) return callback(err, false);
        zipPath = zipPath ? fixPath(zipPath) : "";
        const basename = path.win32.basename(path.win32.normalize(localPath));
        zipPath += zipName || basename;

        if (stats.isFile()) {
          filetools.fs.readFile(localPath, (err, data) => {
            if (err) return callback(err, false);
            self.addFile(zipPath, data, comment, stats);
            callback(undefined, true);
          });
        } else if (stats.isDirectory()) {
          zipPath += filetools.sep;
          self.addFile(zipPath, Buffer.alloc(0), comment, stats);
          callback(undefined, true);
        }
      });
    },

    addLocalFolder(localPath, zipPath, filter) {
      filter = filenameFilter(filter);
      zipPath = zipPath ? fixPath(zipPath) : "";
      localPath = path.normalize(localPath);

      if (filetools.fs.existsSync(localPath)) {
        const items = filetools.findFiles(localPath);

        if (items.length) {
          for (const filepath of items) {
            const relative = path.join(zipPath, relativePath(localPath, filepath));
            if (filter(relative)) {
              this.addLocalFile(filepath, path.dirname(relative));
            }
          }
        }
      } else {
        throw Utils.Errors.FILE_NOT_FOUND(localPath);
      }
    },

    addLocalFolderAsync(localPath, callback, zipPath, filter) {
      filter = filenameFilter(filter);
      zipPath = zipPath ? fixPath(zipPath) : "";
      localPath = path.normalize(localPath);
      const self = this;

      filetools.fs.open(localPath, 'r', (err) => {
        if (err && err.code === 'ENOENT') {
          callback(undefined, Utils.Errors.FILE_NOT_FOUND(localPath));
        } else if (err) {
          callback(undefined, err);
        } else {
          filetools.findFilesAsync(localPath, (err, files) => {
            if (err) return callback(err);
            files = files.filter(dir => filter(path.join(zipPath, relativePath(localPath, dir))));
            if (!files.length) callback(undefined, false);

            (function next(i = 0) {
              if (i < files.length) {
                const filepath = files[i];
                const relative = path.join(zipPath, filenameFilter(fixPath(relativePath(localPath, filepath))));
                self.addLocalFileAsync({ localPath: filepath, zipPath: path.dirname(relative) }, (err) => {
                  if (err) callback(err, false);
                  else process.nextTick(() => next(i + 1));
                });
              } else callback(true);
            })();
          });
        }
      });
    },

    addLocalFolderAsync2(options, callback) {
      options = typeof options === "object" ? options : { localPath: options };
      const localPath = path.resolve(fixPath(options.localPath));
      let { zipPath, filter, namefix } = options;

      filter = filter instanceof RegExp
        ? filename => filter.test(filename)
        : typeof filter === "function"
        ? filter
        : () => true;

      zipPath = zipPath ? fixPath(zipPath) : "";

      namefix = namefix === "latin1"
        ? str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "")
        : typeof namefix === "function"
        ? namefix
        : str => str;

      const relPathFix = entry => path.join(zipPath, namefix(relativePath(localPath, entry)));
      const fileNameFix = entry => path.win32.basename(path.win32.normalize(namefix(entry)));

      filetools.fs.open(localPath, "r", err => {
        if (err && err.code === "ENOENT") {
          callback(undefined, Utils.Errors.FILE_NOT_FOUND(localPath));
        } else if (err) {
          callback(undefined, err);
        } else {
          filetools.findFilesAsync(localPath, (err, files) => {
            if (err) return callback(err);
            files = files.filter(dir => filter(relPathFix(dir)));
            if (!files.length) callback(undefined, false);

            (function iterate(i = 0) {
              if (i < files.length) {
                const filepath = files[i];
                self.addLocalFileAsync({
                  localPath: filepath,
                  zipPath: path.dirname(relPathFix(filepath)),
                  zipName: fileNameFix(filepath)
                }, (err) => {
                  if (err) callback(err, false);
                  else process.nextTick(() => iterate(i + 1));
                });
              } else callback(true);
            })();
          });
        }
      });
    },

    addLocalFolderPromise(localPath, props) {
      return new Promise((resolve, reject) => {
        this.addLocalFolderAsync2({ ...props, localPath }, (err, done) => {
          if (err) reject(err);
          else if (done) resolve(this);
        });
      });
    },

    addFile(entryName, content, comment, attr) {
      entryName = zipnamefix(entryName);
      let entry = getEntry(entryName);
      const update = !!entry;
      if (!update) {
        entry = new ZipEntry(opts);
        entry.entryName = entryName;
      }
      entry.comment = comment || "";
      const isStat = typeof attr === "object" && attr instanceof filetools.fs.Stats;

      if (isStat) {
        entry.header.time = attr.mtime;
      }

      let fileattr = entry.isDirectory ? 0x10 : 0;
      let unix = entry.isDirectory ? 0x4000 : 0x8000;

      if (isStat) {
        unix |= 0xfff & attr.mode;
      } else if (typeof attr === "number") {
        unix |= 0xfff & attr;
      } else {
        unix |= entry.isDirectory ? 0o755 : 0o644;
      }

      fileattr = (fileattr | (unix << 16)) >>> 0;
      entry.attr = fileattr;
      entry.setData(content);

      if (!update) _zip.setEntry(entry);
      return entry;
    },

    getEntries(password) {
      _zip.password = password;
      return _zip ? _zip.entries : [];
    },

    getEntry(name) {
      return getEntry(name);
    },

    getEntryCount() {
      return _zip.getEntryCount();
    },

    forEach(callback) {
      return _zip.forEach(callback);
    },

    extractEntryTo(entry, targetPath, maintainEntryPath = true, overwrite = false, keepOriginalPermission = false, outFileName) {
      const item = getEntry(entry);
      if (!item) throw Utils.Errors.NO_ENTRY();

      const entryName = canonical(item.entryName);
      const target = sanitize(targetPath, outFileName && !item.isDirectory ? outFileName : maintainEntryPath ? entryName : path.basename(entryName));

      if (item.isDirectory) {
        _zip.getEntryChildren(item).forEach(child => {
          if (child.isDirectory) return;
          const content = child.getData();
          if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();

          const childName = sanitize(targetPath, maintainEntryPath ? canonical(child.entryName) : path.basename(canonical(child.entryName)));
          const fileAttr = keepOriginalPermission ? child.header.fileAttr : undefined;
          filetools.writeFileTo(childName, content, overwrite, fileAttr);
        });
        return true;
      }

      const content = item.getData(_zip.password);
      if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();

      if (filetools.fs.existsSync(target) && !overwrite) {
        throw Utils.Errors.CANT_OVERRIDE();
      }
      const fileAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
      filetools.writeFileTo(target, content, overwrite, fileAttr);
      return true;
    },

    test(pass) {
      if (!_zip) return false;

      for (let entry in _zip.entries) {
        try {
          if (entry.isDirectory) continue;
          const content = _zip.entries[entry].getData(pass);
          if (!content) return false;
        } catch {
          return false;
        }
      }
      return true;
    },

    extractAllTo(targetPath, overwrite = false, keepOriginalPermission = false, pass) {
      if (!_zip) throw Utils.Errors.NO_ZIP();

      _zip.entries.forEach(entry => {
        const entryName = sanitize(targetPath, canonical(entry.entryName));
        if (entry.isDirectory) {
          filetools.makeDir(entryName);
          return;
        }
        const content = entry.getData(pass);
        if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();

        const fileAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
        filetools.writeFileTo(entryName, content, overwrite, fileAttr);

        try {
          filetools.fs.utimesSync(entryName, entry.header.time, entry.header.time);
        } catch {
          throw Utils.Errors.CANT_EXTRACT_FILE();
        }
      });
    },

    extractAllToAsync(targetPath, overwrite = false, keepOriginalPermission = false, callback) {
      callback = extractFunction(callback, overwrite, keepOriginalPermission);
      if (!callback) {
        return new Promise((resolve, reject) => {
          this.extractAllToAsync(targetPath, overwrite, keepOriginalPermission, err => {
            if (err) reject(err);
            else resolve(this);
          });
        });
      }
      if (!_zip) {
        callback(Utils.Errors.NO_ZIP());
        return;
      }
      
      targetPath = path.resolve(targetPath);
      const getPath = entry => sanitize(targetPath, path.normalize(canonical(entry.entryName)));
      const getError = (msg, file) => new Error(`${msg}: "${file}"`);

      const dirEntries = [];
      const fileEntries = [];

      _zip.entries.forEach(e => (e.isDirectory ? dirEntries : fileEntries).push(e));

      dirEntries.forEach(entry => {
        const dirPath = getPath(entry);
        const dirAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
        try {
          filetools.makeDir(dirPath);
          if (dirAttr) filetools.fs.chmodSync(dirPath, dirAttr);
          filetools.fs.utimesSync(dirPath, entry.header.time, entry.header.time);
        } catch {
          callback(getError("Unable to create folder", dirPath));
        }
      });

      fileEntries.reverse().reduce((next, entry) => err => {
        if (err) next(err);
        else {
          const entryName = path.normalize(canonical(entry.entryName));
          const filePath = sanitize(targetPath, entryName);
          entry.getDataAsync((content, err) => {
            if (err) {
              next(err);
            } else if (!content) {
              next(Utils.Errors.CANT_EXTRACT_FILE());
            } else {
              const fileAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
              filetools.writeFileToAsync(filePath, content, overwrite, fileAttr, success => {
                if (!success) {
                  next(getError("Unable to write file", filePath));
                }
                filetools.fs.utimes(filePath, entry.header.time, entry.header.time, err => {
                  if (err) {
                    next(getError("Unable to set times", filePath));
                  } else {
                    next();
                  }
                });
              });
            }
          });
        }
      }, callback)();
    },

    writeZip(targetFileName, callback) {
      if (!targetFileName && opts.filename) targetFileName = opts.filename;
      if (!targetFileName) return;

      const zipData = _zip.compressToBuffer();
      if (zipData) {
        const success = filetools.writeFileTo(targetFileName, zipData, true);
        if (typeof callback === "function") callback(success ? null : new Error("failed"), "");
      }
    },

    writeZipPromise(targetFileName, { overwrite = true, perm } = {}) {
      return new Promise((resolve, reject) => {
        if (!targetFileName && opts.filename) targetFileName = opts.filename;
        if (!targetFileName) reject("ADM-ZIP: ZIP File Name Missing");

        this.toBufferPromise().then(zipData => {
          filetools.writeFileToAsync(targetFileName, zipData, overwrite, perm, resolve, reject);
        }, reject);
      });
    },

    toBufferPromise() {
      return new Promise((resolve, reject) => {
        _zip.toAsyncBuffer(resolve, reject);
      });
    },

    toBuffer(onSuccess, onFail, onItemStart, onItemEnd) {
      if (typeof onSuccess === "function") {
        _zip.toAsyncBuffer(onSuccess, onFail, onItemStart, onItemEnd);
        return null;
      }
      return _zip.compressToBuffer();
    }
  };
};
