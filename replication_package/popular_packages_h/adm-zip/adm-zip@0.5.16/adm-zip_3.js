const Utils = require("./util");
const path = require("path");
const ZipEntry = require("./zipEntry");
const ZipFile = require("./zipFile");

const isBoolean = (...args) => Utils.findLast(args, arg => typeof arg === "boolean");
const isString = (...args) => Utils.findLast(args, arg => typeof arg === "string");
const isFunction = (...args) => Utils.findLast(args, arg => typeof arg === "function");

const defaultOptions = {
    noSort: false,
    readEntries: false,
    method: Utils.Constants.NONE,
    fs: null
};

module.exports = function(input, options) {
    let buffer = null;
    const opts = { ...defaultOptions };

    if (input && typeof input === "object") {
        if (!(input instanceof Uint8Array)) {
            Object.assign(opts, input);
            input = opts.input;
            delete opts.input;
        }
        if (Buffer.isBuffer(input)) {
            buffer = input;
            opts.method = Utils.Constants.BUFFER;
            input = undefined;
        }
    }

    Object.assign(opts, options);

    const fileTools = new Utils(opts);

    if (typeof opts.decoder !== "object" || !opts.decoder.encode || !opts.decoder.decode) {
        opts.decoder = Utils.decoder;
    }

    if (input && typeof input === "string") {
        if (fileTools.fs.existsSync(input)) {
            opts.method = Utils.Constants.FILE;
            opts.filename = input;
            buffer = fileTools.fs.readFileSync(input);
        } else {
            throw Utils.Errors.INVALID_FILENAME();
        }
    }

    const zipFile = new ZipFile(buffer, opts);
    const { canonical, sanitize, zipnamefix } = Utils;

    const getEntry = entry => {
        if (entry && zipFile) {
            return typeof entry === "string"
                ? zipFile.getEntry(path.posix.normalize(entry))
                : typeof entry === "object" && entry.entryName && entry.header
                ? zipFile.getEntry(entry.entryName)
                : null;
        }
        return null;
    };

    const fixPath = zipPath =>
        path.posix.join(".", path.posix.normalize(path.posix.sep + zipPath.split("\\").join(path.posix.sep) + path.posix.sep));
    
    const filenameFilter = filter => {
      if (filter instanceof RegExp) {
          return filename => filter.test(filename);
      }
      return typeof filter === "function" ? filter : () => true;
    };

    const relativePath = (local, entry) => {
        return path.relative(local, entry) + (entry.endsWith(fileTools.sep) ? fileTools.sep : "");
    };

    return {
        readFile: function(entry, pass) {
            const item = getEntry(entry);
            return item ? item.getData(pass) : null;
        },
        childCount: function(entry) {
            const item = getEntry(entry);
            return item ? zipFile.getChildCount(item) : 0;
        },
        readFileAsync: function(entry, callback) {
            const item = getEntry(entry);
            item ? item.getDataAsync(callback) : callback(null, "getEntry failed for:" + entry);
        },
        readAsText: function(entry, encoding = "utf8") {
            const item = getEntry(entry);
            if (item) {
                const data = item.getData();
                return data ? data.toString(encoding) : "";
            }
            return "";
        },
        readAsTextAsync: function(entry, callback, encoding = "utf8") {
            const item = getEntry(entry);
            if (item) {
                item.getDataAsync((data, err) => {
                    if (err) {
                        callback(data, err);
                    } else {
                        callback(data ? data.toString(encoding) : "");
                    }
                });
            } else {
                callback("");
            }
        },
        deleteFile: function(entry, withsubfolders = true) {
            const item = getEntry(entry);
            if (item) zipFile.deleteFile(item.entryName, withsubfolders);
        },
        deleteEntry: function(entry) {
          const item = getEntry(entry);
          if (item) zipFile.deleteEntry(item.entryName);
        },
        addZipComment: function(comment) {
          zipFile.comment = comment;
        },
        getZipComment: function() {
            return zipFile.comment || "";
        },
        addZipEntryComment: function(entry, comment) {
            const item = getEntry(entry);
            if (item) item.comment = comment;
        },
        getZipEntryComment: function(entry) {
            const item = getEntry(entry);
            return item ? item.comment || "" : "";
        },
        updateFile: function(entry, content) {
            const item = getEntry(entry);
            if (item) item.setData(content);
        },
        addLocalFile: function(localPath, zipPath = "", zipName, comment) {
            if (fileTools.fs.existsSync(localPath)) {
                zipPath = fixPath(zipPath);
                const p = path.win32.basename(path.win32.normalize(localPath));
                zipPath += zipName || p;
                const _attr = fileTools.fs.statSync(localPath);
                const data = _attr.isFile() ? fileTools.fs.readFileSync(localPath) : Buffer.alloc(0);
                if (_attr.isDirectory()) zipPath += fileTools.sep;
                this.addFile(zipPath, data, comment, _attr);
            } else {
                throw Utils.Errors.FILE_NOT_FOUND(localPath);
            }
        },
        addLocalFileAsync: function(options, callback) {
            options = typeof options === "object" ? options : { localPath: options };
            const localPath = path.resolve(options.localPath);
            const { comment } = options;
            let { zipPath, zipName } = options;

            fileTools.fs.stat(localPath, (err, stats) => {
                if (err) return callback(err, false);
                zipPath = zipPath ? fixPath(zipPath) : "";
                const p = path.win32.basename(path.win32.normalize(localPath));
                zipPath += zipName || p;
                if (stats.isFile()) {
                    fileTools.fs.readFile(localPath, (err, data) => {
                        if (err) return callback(err, false);
                        this.addFile(zipPath, data, comment, stats);
                        setImmediate(callback, undefined, true);
                    });
                } else if (stats.isDirectory()) {
                    zipPath += fileTools.sep;
                    this.addFile(zipPath, Buffer.alloc(0), comment, stats);
                    setImmediate(callback, undefined, true);
                }
            });
        },
        addLocalFolder: function(localPath, zipPath = "", filter) {
            filter = filenameFilter(filter);
            zipPath = fixPath(zipPath);
            localPath = path.normalize(localPath);

            if (fileTools.fs.existsSync(localPath)) {
                const items = fileTools.findFiles(localPath);
                if (items.length) {
                    for (const filepath of items) {
                        const p = path.join(zipPath, relativePath(localPath, filepath));
                        if (filter(p)) {
                            this.addLocalFile(filepath, path.dirname(p));
                        }
                    }
                }
            } else {
                throw Utils.Errors.FILE_NOT_FOUND(localPath);
            }
        },
        addLocalFolderAsync: function(localPath, callback, zipPath = "", filter) {
            filter = filenameFilter(filter);
            zipPath = fixPath(zipPath);
            localPath = path.normalize(localPath);

            fileTools.fs.open(localPath, "r", (err) => {
                if (err) {
                    callback(undefined, err.code === "ENOENT" ? Utils.Errors.FILE_NOT_FOUND(localPath) : err);
                    return;
                }
                const items = fileTools.findFiles(localPath);
                let i = -1;

                const next = () => {
                    i += 1;
                    if (i < items.length) {
                        const filepath = items[i];
                        const relative = path.relative(localPath, filepath).split("\\").join("/"); // windows fix
                        const p = relative.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, ""); // accent fix
                        if (filter(p)) {
                            fileTools.fs.stat(filepath, (err, stats) => {
                                if (err) return callback(undefined, err);
                                if (stats.isFile()) {
                                    fileTools.fs.readFile(filepath, (err, data) => {
                                        if (err) return callback(undefined, err);
                                        this.addFile(zipPath + p, data, "", stats);
                                        process.nextTick(next);
                                    });
                                } else {
                                    this.addFile(zipPath + p + "/", Buffer.alloc(0), "", stats);
                                    process.nextTick(next);
                                }
                            });
                        } else {
                            process.nextTick(next);
                        }
                    } else {
                        callback(true);
                    }
                };

                process.nextTick(next);
            });
        },
        addLocalFolderAsync2: function(options, callback) {
            options = typeof options === "object" ? options : { localPath: options };
            const localPath = path.resolve(fixPath(options.localPath));
            let { zipPath, filter, namefix } = options;
            filter = filter instanceof RegExp ? filename => filter.test(filename) : filter || (() => true);
            zipPath = fixPath(zipPath || "");

            if (namefix === "latin1") {
                namefix = str =>
                    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
            }
            namefix = typeof namefix === "function" ? namefix : str => str;

            const relPathFix = entry => path.join(zipPath, namefix(relativePath(localPath, entry)));
            const fileNameFix = entry => path.win32.basename(path.win32.normalize(namefix(entry)));

            fileTools.fs.open(localPath, "r", err => {
                if (err) {
                    callback(undefined, err.code === "ENOENT" ? Utils.Errors.FILE_NOT_FOUND(localPath) : err);
                    return;
                }
                fileTools.findFilesAsync(localPath, (err, fileEntries) => {
                    if (err) return callback(err);
                    fileEntries = fileEntries.filter(dir => filter(relPathFix(dir)));
                    if (!fileEntries.length) return callback(undefined);

                    setImmediate(
                        fileEntries.reverse().reduce((next, entry) => {
                            return (err, done) => {
                                if (err || done === false) return setImmediate(next, err, false);

                                this.addLocalFileAsync({
                                      localPath: entry,
                                      zipPath: path.dirname(relPathFix(entry)),
                                      zipName: fileNameFix(entry)
                                    },
                                    next
                                );
                            };
                        }, callback)
                    );
                });
            });
        },
        addLocalFolderPromise: function(localPath, props) {
            return new Promise((resolve, reject) => {
                this.addLocalFolderAsync2({...props, localPath }, (err, done) => {
                    if (err) reject(err);
                    if (done) resolve(this);
                });
            });
        },
        addFile: function(entryName, content, comment, attr) {
            entryName = zipnamefix(entryName);
            let entry = getEntry(entryName);
            const update = entry !== null;

            if (!update) {
                entry = new ZipEntry(opts);
                entry.entryName = entryName;
            }
            entry.comment = comment || "";

            const isStat = typeof attr === "object" && attr instanceof fileTools.fs.Stats;
            if (isStat) {
                entry.header.time = attr.mtime;
            }

            let fileattr = entry.isDirectory ? 0x10 : 0;
            let unix = entry.isDirectory ? 0x4000 : 0x8000;
            unix |= isStat ? attr.mode & 0xfff : attr || (entry.isDirectory ? 0o755 : 0o644);

            entry.attr = (fileattr | (unix << 16)) >>> 0;

            entry.setData(content);
            if (!update) zipFile.setEntry(entry);

            return entry;
        },
        getEntries: function(password) {
            zipFile.password = password;
            return zipFile.entries;
        },
        getEntry: function(name) {
            return getEntry(name);
        },
        getEntryCount: function() {
            return zipFile.getEntryCount();
        },
        forEach: function(callback) {
            return zipFile.forEach(callback);
        },
        extractEntryTo: function(entry, targetPath, maintainEntryPath = true, overwrite = false, keepOriginalPermission = false, outFileName) {
            overwrite = isBoolean(false, overwrite);
            keepOriginalPermission = isBoolean(false, keepOriginalPermission);
            maintainEntryPath = isBoolean(true, maintainEntryPath);
            outFileName = isString(keepOriginalPermission, outFileName);

            const item = getEntry(entry);
            if (!item) throw Utils.Errors.NO_ENTRY();

            const entryName = canonical(item.entryName);
            const target = sanitize(targetPath, outFileName && !item.isDirectory ? outFileName : maintainEntryPath ? entryName : path.basename(entryName));

            if (item.isDirectory) {
                zipFile.getEntryChildren(item).forEach(child => {
                    if (child.isDirectory) return;
                    const content = child.getData();
                    if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();
                    const name = canonical(child.entryName);
                    const childName = sanitize(targetPath, maintainEntryPath ? name : path.basename(name));
                    const fileAttr = keepOriginalPermission ? child.header.fileAttr : undefined;
                    fileTools.writeFileTo(childName, content, overwrite, fileAttr);
                });
                return true;
            }

            const content = item.getData(zipFile.password);
            if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();
            if (!overwrite && fileTools.fs.existsSync(target)) throw Utils.Errors.CANT_OVERRIDE();

            const fileAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
            fileTools.writeFileTo(target, content, overwrite, fileAttr);

            return true;
        },
        test: function(pass) {
            if (!zipFile) return false;
            for (const entry in zipFile.entries) {
                try {
                    if (entry.isDirectory) continue;
                    const content = zipFile.entries[entry].getData(pass);
                    if (!content) return false;
                } catch (err) {
                    return false;
                }
            }
            return true;
        },
        extractAllTo: function(targetPath, overwrite = false, keepOriginalPermission = false, pass) {
            keepOriginalPermission = isBoolean(false, keepOriginalPermission);
            pass = isString(keepOriginalPermission, pass);
            overwrite = isBoolean(false, overwrite);

            if (!zipFile) throw Utils.Errors.NO_ZIP();

            zipFile.entries.forEach(entry => {
                const entryName = sanitize(targetPath, canonical(entry.entryName));
                if (entry.isDirectory) {
                    fileTools.makeDir(entryName);
                } else {
                    const content = entry.getData(pass);
                    if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();
                    const fileAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
                    fileTools.writeFileTo(entryName, content, overwrite, fileAttr);
                    fileTools.fs.utimesSync(entryName, entry.header.time, entry.header.time);
                }
            });
        },
        extractAllToAsync: function(targetPath, overwrite = false, keepOriginalPermission = false, callback) {
            callback = isFunction(overwrite, keepOriginalPermission, callback);
            keepOriginalPermission = isBoolean(false, keepOriginalPermission);
            overwrite = isBoolean(false, overwrite);

            if (!callback) {
                return new Promise((resolve, reject) => {
                    this.extractAllToAsync(targetPath, overwrite, keepOriginalPermission, err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this);
                        }
                    });
                });
            }

            if (!zipFile) {
                callback(Utils.Errors.NO_ZIP());
                return;
            }

            targetPath = path.resolve(targetPath);

            const getPath = entry => sanitize(targetPath, path.normalize(canonical(entry.entryName)));
            const getError = (msg, file) => new Error(`${msg}: "${file}"`);

            const dirEntries = zipFile.entries.filter(e => e.isDirectory);
            const fileEntries = zipFile.entries.filter(e => !e.isDirectory);

            for (const entry of dirEntries) {
                const dirPath = getPath(entry);
                const dirAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
                try {
                    fileTools.makeDir(dirPath);
                    if (dirAttr) fileTools.fs.chmodSync(dirPath, dirAttr);
                    fileTools.fs.utimesSync(dirPath, entry.header.time, entry.header.time);
                } catch (er) {
                    callback(getError("Unable to create folder", dirPath));
                }
            }

            fileEntries.reduce((next, entry) => {
                return err => {
                    if (err) {
                        next(err);
                    } else {
                        const entryName = path.normalize(canonical(entry.entryName));
                        const filePath = sanitize(targetPath, entryName);
                        entry.getDataAsync((content, err) => {
                            if (err) {
                                next(err);
                            } else if (!content) {
                                next(Utils.Errors.CANT_EXTRACT_FILE());
                            } else {
                                const fileAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
                                fileTools.writeFileToAsync(filePath, content, overwrite, fileAttr, success => {
                                    if (!success) {
                                        next(getError("Unable to write file", filePath));
                                    } else {
                                        fileTools.fs.utimes(filePath, entry.header.time, entry.header.time, err => {
                                            if (err) {
                                                next(getError("Unable to set times", filePath));
                                            } else {
                                                next();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                };
            }, callback)();
        },
        writeZip: function(targetFileName, callback) {
            if (typeof targetFileName === "function") {
                callback = targetFileName;
                targetFileName = opts.filename;
            }
            if (!targetFileName) return;

            const zipData = zipFile.compressToBuffer();
            if (zipData) {
                const success = fileTools.writeFileTo(targetFileName, zipData, true);
                if (callback) callback(success ? null : new Error("failed"), "");
            }
        },
        writeZipPromise: function(targetFileName, { overwrite = true, perm } = {}) {
            return new Promise((resolve, reject) => {
                targetFileName = targetFileName || opts.filename;
                if (!targetFileName) return reject("ADM-ZIP: ZIP File Name Missing");

                this.toBufferPromise()
                    .then(zipData => {
                        fileTools.writeFileToAsync(targetFileName, zipData, overwrite, perm, resolve);
                    })
                    .catch(reject);
            });
        },
        toBufferPromise: function() {
            return new Promise((resolve, reject) => {
                zipFile.toAsyncBuffer(resolve, reject);
            });
        },
        toBuffer: function(onSuccess, onFail, onItemStart, onItemEnd) {
            if (typeof onSuccess === "function") {
                zipFile.toAsyncBuffer(onSuccess, onFail, onItemStart, onItemEnd);
                return null;
            }
            return zipFile.compressToBuffer();
        }
    };
};
