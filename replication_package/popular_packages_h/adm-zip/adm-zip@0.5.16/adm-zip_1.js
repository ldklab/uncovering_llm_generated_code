const Utils = require("./util");
const path = require("path");
const ZipEntry = require("./zipEntry");
const ZipFile = require("./zipFile");

const getBoolean = (...values) => Utils.findLast(values, value => typeof value === "boolean");
const getString = (...values) => Utils.findLast(values, value => typeof value === "string");
const getFunction = (...values) => Utils.findLast(values, value => typeof value === "function");

const defaultOptions = {
    noSort: false,
    readEntries: false,
    method: Utils.Constants.NONE,
    fs: null
};

module.exports = function (input, options) {
    let inBuffer = null;
    const opts = { ...defaultOptions };

    if (input && typeof input === "object") {
        if (!(input instanceof Uint8Array)) {
            Object.assign(opts, input);
            input = opts.input ? opts.input : undefined;
            delete opts.input;
        }

        if (Buffer.isBuffer(input)) {
            inBuffer = input;
            opts.method = Utils.Constants.BUFFER;
            input = undefined;
        }
    }

    Object.assign(opts, options);

    const fileTools = new Utils(opts);

    if (typeof opts.decoder !== "object" || typeof opts.decoder.encode !== "function" || typeof opts.decoder.decode !== "function") {
        opts.decoder = Utils.decoder;
    }

    if (input && typeof input === "string") {
        if (fileTools.fs.existsSync(input)) {
            opts.method = Utils.Constants.FILE;
            opts.filename = input;
            inBuffer = fileTools.fs.readFileSync(input);
        } else {
            throw Utils.Errors.INVALID_FILENAME();
        }
    }

    const _zip = new ZipFile(inBuffer, opts);

    const { canonical, sanitize, zipnamefix } = Utils;

    function getEntry(entry) {
        if (entry && _zip) {
            let item;
            if (typeof entry === "string") item = _zip.getEntry(path.posix.normalize(entry));
            if (typeof entry === "object" && entry.entryName !== undefined && entry.header !== undefined) item = _zip.getEntry(entry.entryName);
            return item || null;
        }
        return null;
    }

    function fixPath(zipPath) {
        const { join, normalize, sep } = path.posix;
        return join(".", normalize(sep + zipPath.split("\\").join(sep) + sep));
    }

    function filenameFilter(filterfn) {
        if (filterfn instanceof RegExp) {
            return filename => filterfn.test(filename);
        } else if (typeof filterfn !== "function") {
            return () => true;
        }
        return filterfn;
    }

    const relativePath = (local, entry) => {
        const lastChar = entry.slice(-1) === fileTools.sep ? fileTools.sep : "";
        return path.relative(local, entry) + lastChar;
    };

    return {
        readFile(entry, pass) {
            const item = getEntry(entry);
            return (item && item.getData(pass)) || null;
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

        readAsText(entry, encoding = "utf8") {
            const item = getEntry(entry);
            if (item) {
                const data = item.getData();
                return data?.length ? data.toString(encoding) : "";
            }
            return "";
        },

        readAsTextAsync(entry, callback, encoding = "utf8") {
            const item = getEntry(entry);
            if (item) {
                item.getDataAsync((data, err) => {
                    if (err) {
                        callback(data, err);
                    } else if (data?.length) {
                        callback(data.toString(encoding));
                    } else {
                        callback("");
                    }
                });
            } else {
                callback("");
            }
        },

        deleteFile(entry, withSubfolders = true) {
            const item = getEntry(entry);
            if (item) {
                _zip.deleteFile(item.entryName, withSubfolders);
            }
        },

        deleteEntry(entry) {
            const item = getEntry(entry);
            if (item) {
                _zip.deleteEntry(item.entryName);
            }
        },

        addZipComment(comment) {
            _zip.comment = comment || "";
        },

        getZipComment() {
            return _zip.comment || "";
        },

        addZipEntryComment(entry, comment) {
            const item = getEntry(entry);
            if (item) {
                item.comment = comment || "";
            }
        },

        getZipEntryComment(entry) {
            const item = getEntry(entry);
            return item ? item.comment || "" : "";
        },

        updateFile(entry, content) {
            const item = getEntry(entry);
            if (item) {
                item.setData(content);
            }
        },

        addLocalFile(localPath, zipPath, zipName, comment) {
            if (fileTools.fs.existsSync(localPath)) {
                zipPath = zipPath ? fixPath(zipPath) : "";
                const localFileName = path.win32.basename(path.win32.normalize(localPath));
                zipPath += zipName ? zipName : localFileName;
                const fileAttr = fileTools.fs.statSync(localPath);
                const data = fileAttr.isFile() ? fileTools.fs.readFileSync(localPath) : Buffer.alloc(0);
                if (fileAttr.isDirectory()) zipPath += fileTools.sep;
                this.addFile(zipPath, data, comment, fileAttr);
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

            fileTools.fs.stat(localPath, (err, stats) => {
                if (err) return callback(err, false);
                zipPath = zipPath ? fixPath(zipPath) : "";
                const localFileName = path.win32.basename(path.win32.normalize(localPath));
                zipPath += zipName ? zipName : localFileName;

                if (stats.isFile()) {
                    fileTools.fs.readFile(localPath, (err, data) => {
                        if (err) return callback(err, false);
                        self.addFile(zipPath, data, comment, stats);
                        return setImmediate(callback, undefined, true);
                    });
                } else if (stats.isDirectory()) {
                    zipPath += fileTools.sep;
                    self.addFile(zipPath, Buffer.alloc(0), comment, stats);
                    return setImmediate(callback, undefined, true);
                }
            });
        },

        addLocalFolder(localPath, zipPath, filter) {
            filter = filenameFilter(filter);
            zipPath = zipPath ? fixPath(zipPath) : "";
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

        addLocalFolderAsync(localPath, callback, zipPath, filter) {
            filter = filenameFilter(filter);
            zipPath = zipPath ? fixPath(zipPath) : "";
            localPath = path.normalize(localPath);

            fileTools.fs.open(localPath, "r", (err) => {
                if (err && err.code === "ENOENT") {
                    callback(undefined, Utils.Errors.FILE_NOT_FOUND(localPath));
                } else if (err) {
                    callback(undefined, err);
                } else {
                    const items = fileTools.findFiles(localPath);
                    let i = -1;
                    const next = () => {
                        i += 1;
                        if (i < items.length) {
                            const filepath = items[i];
                            let p = relativePath(localPath, filepath).split("\\").join("/");
                            p = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
                            if (filter(p)) {
                                fileTools.fs.stat(filepath, (er0, stats) => {
                                    if (er0) callback(undefined, er0);
                                    if (stats.isFile()) {
                                        fileTools.fs.readFile(filepath, (er1, data) => {
                                            if (er1) {
                                                callback(undefined, er1);
                                            } else {
                                                this.addFile(zipPath + p, data, "", stats);
                                                next();
                                            }
                                        });
                                    } else {
                                        this.addFile(zipPath + p + "/", Buffer.alloc(0), "", stats);
                                        next();
                                    }
                                });
                            } else {
                                process.nextTick(next);
                            }
                        } else {
                            callback(true, undefined);
                        }
                    };
                    next();
                }
            });
        },

        addLocalFolderAsync2(options, callback) {
            const self = this;
            options = typeof options === "object" ? options : { localPath: options };
            localPath = path.resolve(fixPath(options.localPath));
            let { zipPath, filter, namefix } = options;

            if (filter instanceof RegExp) {
                filter = filename => filter.test(filename);
            } else if (typeof filter !== "function") {
                filter = () => true;
            }

            zipPath = zipPath ? fixPath(zipPath) : "";

            if (namefix === "latin1") {
                namefix = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
            }

            if (typeof namefix !== "function") namefix = str => str;

            const relPathFix = entry => path.join(zipPath, namefix(relativePath(localPath, entry)));
            const fileNameFix = entry => path.win32.basename(path.win32.normalize(namefix(entry)));

            fileTools.fs.open(localPath, "r", (err) => {
                if (err && err.code === "ENOENT") {
                    callback(undefined, Utils.Errors.FILE_NOT_FOUND(localPath));
                } else if (err) {
                    callback(undefined, err);
                } else {
                    fileTools.findFilesAsync(localPath, (err, fileEntries) => {
                        if (err) return callback(err);
                        fileEntries = fileEntries.filter(dir => filter(relPathFix(dir)));
                        if (!fileEntries.length) return callback(undefined, false);

                        setImmediate(
                            fileEntries.reverse().reduce((next, entry) => {
                                return function (err, done) {
                                    if (err || done === false) return setImmediate(next, err, false);

                                    self.addLocalFileAsync(
                                        {
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
                }
            });
        },

        addLocalFolderPromise(localPath, props) {
            return new Promise((resolve, reject) => {
                this.addLocalFolderAsync2({ localPath, ...props }, (err, done) => {
                    if (err) reject(err);
                    if (done) resolve(this);
                });
            });
        },

        addFile(entryName, content, comment, attr) {
            entryName = zipnamefix(entryName);
            let entry = getEntry(entryName);
            const update = entry != null;

            if (!update) {
                entry = new ZipEntry(opts);
                entry.entryName = entryName;
            }
            entry.comment = comment || "";

            const isStat = attr instanceof fileTools.fs.Stats;

            if (isStat) {
                entry.header.time = attr.mtime;
            }

            let unix = entry.isDirectory ? 0x4000 : 0x8000;
            if (isStat) {
                unix |= 0xfff & attr.mode;
            } else if (typeof attr === "number") {
                unix |= 0xfff & attr;
            } else {
                unix |= entry.isDirectory ? 0o755 : 0o644;
            }

            const fileAttr = (entry.isDirectory ? 0x10 : 0) | (unix << 16) >>> 0;

            entry.attr = fileAttr;
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
            overwrite = getBoolean(overwrite);
            keepOriginalPermission = getBoolean(keepOriginalPermission);
            maintainEntryPath = getBoolean(maintainEntryPath);
            outFileName = getString(outFileName);

            const item = getEntry(entry);
            if (!item) {
                throw Utils.Errors.NO_ENTRY();
            }

            const entryName = canonical(item.entryName);
            const target = sanitize(targetPath, outFileName && !item.isDirectory ? outFileName : maintainEntryPath ? entryName : path.basename(entryName));

            if (item.isDirectory) {
                const children = _zip.getEntryChildren(item);
                children.forEach(child => {
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

            const content = item.getData(_zip.password);
            if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();

            if (fileTools.fs.existsSync(target) && !overwrite) {
                throw Utils.Errors.CANT_OVERRIDE();
            }

            const fileAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
            fileTools.writeFileTo(target, content, overwrite, fileAttr);

            return true;
        },

        test(pass) {
            if (!_zip) return false;

            for (let entry in _zip.entries) {
                try {
                    if (entry.isDirectory) continue;
                    const content = _zip.entries[entry].getData(pass);
                    if (!content) return false;
                } catch (err) {
                    return false;
                }
            }
            return true;
        },

        extractAllTo(targetPath, overwrite = false, keepOriginalPermission = false, pass) {
            keepOriginalPermission = getBoolean(keepOriginalPermission);
            pass = getString(pass);
            overwrite = getBoolean(overwrite);
            if (!_zip) throw Utils.Errors.NO_ZIP();

            _zip.entries.forEach(entry => {
                const entryName = sanitize(targetPath, canonical(entry.entryName));
                if (entry.isDirectory) {
                    fileTools.makeDir(entryName);
                    return;
                }
                const content = entry.getData(pass);
                if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();
                const fileAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
                fileTools.writeFileTo(entryName, content, overwrite, fileAttr);
                try {
                    fileTools.fs.utimesSync(entryName, entry.header.time, entry.header.time);
                } catch (err) {
                    throw Utils.Errors.CANT_EXTRACT_FILE();
                }
            });
        },

        extractAllToAsync(targetPath, overwrite = false, keepOriginalPermission = false, callback) {
            callback = getFunction(overwrite, keepOriginalPermission, callback);
            keepOriginalPermission = getBoolean(keepOriginalPermission);
            overwrite = getBoolean(overwrite);
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

            if (!_zip) return callback(Utils.Errors.NO_ZIP());

            targetPath = path.resolve(targetPath);
            const getPath = entry => sanitize(targetPath, path.normalize(canonical(entry.entryName)));
            const getError = (msg, file) => new Error(`${msg}: "${file}"`);

            const dirEntries = [];
            const fileEntries = [];
            _zip.entries.forEach(entry => entry.isDirectory ? dirEntries.push(entry) : fileEntries.push(entry));

            for (const entry of dirEntries) {
                const dirPath = getPath(entry);
                const dirAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
                try {
                    fileTools.makeDir(dirPath);
                    if (dirAttr) fileTools.fs.chmodSync(dirPath, dirAttr);
                    fileTools.fs.utimesSync(dirPath, entry.header.time, entry.header.time);
                } catch (err) {
                    return callback(getError("Unable to create folder", dirPath));
                }
            }

            fileEntries.reverse().reduce((next, entry) => {
                return err => {
                    if (err) return next(err);

                    const entryName = path.normalize(canonical(entry.entryName));
                    const filePath = sanitize(targetPath, entryName);
                    entry.getDataAsync((content, err) => {
                        if (err) return next(err);
                        if (!content) return next(Utils.Errors.CANT_EXTRACT_FILE());

                        const fileAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
                        fileTools.writeFileToAsync(filePath, content, overwrite, fileAttr, success => {
                            if (!success) return next(getError("Unable to write file", filePath));
                            fileTools.fs.utimes(filePath, entry.header.time, entry.header.time, err => {
                                if (err) return next(getError("Unable to set times", filePath));
                                next();
                            });
                        });
                    });
                };
            }, callback)();
        },

        writeZip(targetFileName, callback) {
            if (arguments.length === 1 && typeof targetFileName === "function") {
                callback = targetFileName;
                targetFileName = "";
            }

            if (!targetFileName && opts.filename) {
                targetFileName = opts.filename;
            }
            if (!targetFileName) return;

            const zipData = _zip.compressToBuffer();
            if (zipData) {
                const ok = fileTools.writeFileTo(targetFileName, zipData, true);
                if (typeof callback === "function") callback(!ok ? new Error("failed") : null, "");
            }
        },

        writeZipPromise(targetFileName, props) {
            const { overwrite, perm } = { overwrite: true, ...props };

            return new Promise((resolve, reject) => {
                if (!targetFileName && opts.filename) targetFileName = opts.filename;
                if (!targetFileName) return reject("ADM-ZIP: ZIP File Name Missing");

                this.toBufferPromise().then(zipData => {
                    const ret = done => done ? resolve(done) : reject("ADM-ZIP: Wasn't able to write zip file");
                    fileTools.writeFileToAsync(targetFileName, zipData, overwrite, perm, ret);
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
