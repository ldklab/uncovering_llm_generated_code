const Utils = require("./util");
const path = require("path");
const ZipEntry = require("./zipEntry");
const ZipFile = require("./zipFile");

const getLastBool = (...values) => Utils.findLast(values, (item) => typeof item === "boolean");
const getLastString = (...values) => Utils.findLast(values, (item) => typeof item === "string");
const getLastFunction = (...values) => Utils.findLast(values, (item) => typeof item === "function");

const defaultOptions = {
    noSort: false,
    readEntries: false,
    method: Utils.Constants.NONE,
    fs: null
};

module.exports = function (input, options) {
    let inBuffer = null;
    const opts = Object.assign(Object.create(null), defaultOptions);

    if (input && typeof input === "object") {
        if (!(input instanceof Uint8Array)) {
            Object.assign(opts, input);
            input = opts.input ? opts.input : undefined;
            if (opts.input) delete opts.input;
        }

        if (Buffer.isBuffer(input)) {
            inBuffer = input;
            opts.method = Utils.Constants.BUFFER;
            input = undefined;
        }
    }

    Object.assign(opts, options);

    const filetools = new Utils(opts);

    if (typeof opts.decoder !== "object" || typeof opts.decoder.encode !== "function" || typeof opts.decoder.decode !== "function") {
        opts.decoder = Utils.decoder;
    }

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

    const getEntry = (entry) => {
        if (entry && _zip) {
            let item;
            if (typeof entry === "string") {
                item = _zip.getEntry(path.posix.normalize(entry));
            } else if (typeof entry === "object" && typeof entry.entryName !== "undefined" && typeof entry.header !== "undefined") {
                item = _zip.getEntry(entry.entryName);
            }

            return item || null;
        }
        return null;
    };

    const fixPath = (zipPath) => {
        const { join, normalize, sep } = path.posix;
        return join(".", normalize(sep + zipPath.split("\\").join(sep) + sep));
    };

    const filenameFilter = (filterfn) => {
        if (filterfn instanceof RegExp) {
            return (filename) => filterfn.test(filename);
        } else if (typeof filterfn !== "function") {
            return () => true;
        }
        return filterfn;
    };

    const relativePath = (local, entry) => {
        const lastChar = entry.slice(-1) === filetools.sep ? filetools.sep : "";
        return path.relative(local, entry) + lastChar;
    };

    return {
        readFile: (entry, pass) => {
            const item = getEntry(entry);
            return (item && item.getData(pass)) || null;
        },

        childCount: (entry) => {
            const item = getEntry(entry);
            return item ? _zip.getChildCount(item) : 0;
        },

        readFileAsync: (entry, callback) => {
            const item = getEntry(entry);
            if (item) {
                item.getDataAsync(callback);
            } else {
                callback(null, "getEntry failed for:" + entry);
            }
        },

        readAsText: (entry, encoding = "utf8") => {
            const item = getEntry(entry);
            if (item) {
                const data = item.getData();
                return data && data.length ? data.toString(encoding) : "";
            }
            return "";
        },

        readAsTextAsync: (entry, callback, encoding = "utf8") => {
            const item = getEntry(entry);
            if (item) {
                item.getDataAsync((data, err) => {
                    if (err) {
                        callback(data, err);
                    } else {
                        callback(data && data.length ? data.toString(encoding) : "");
                    }
                });
            } else {
                callback("");
            }
        },

        deleteFile: (entry, withsubfolders = true) => {
            const item = getEntry(entry);
            if (item) {
                _zip.deleteFile(item.entryName, withsubfolders);
            }
        },

        deleteEntry: (entry) => {
            const item = getEntry(entry);
            if (item) {
                _zip.deleteEntry(item.entryName);
            }
        },

        addZipComment: (comment) => {
            _zip.comment = comment;
        },

        getZipComment: () => _zip.comment || "",

        addZipEntryComment: (entry, comment) => {
            const item = getEntry(entry);
            if (item) {
                item.comment = comment;
            }
        },

        getZipEntryComment: (entry) => {
            const item = getEntry(entry);
            return item ? item.comment || "" : "";
        },

        updateFile: (entry, content) => {
            const item = getEntry(entry);
            if (item) {
                item.setData(content);
            }
        },

        addLocalFile: (localPath, zipPath, zipName, comment) => {
            if (filetools.fs.existsSync(localPath)) {
                zipPath = zipPath ? fixPath(zipPath) : "";
                const p = path.win32.basename(path.win32.normalize(localPath));
                zipPath += zipName || p;

                const _attr = filetools.fs.statSync(localPath);
                const data = _attr.isFile() ? filetools.fs.readFileSync(localPath) : Buffer.alloc(0);

                if (_attr.isDirectory()) zipPath += filetools.sep;
                this.addFile(zipPath, data, comment, _attr);
            } else {
                throw Utils.Errors.FILE_NOT_FOUND(localPath);
            }
        },

        addLocalFileAsync: (options, callback) => {
            options = typeof options === "object" ? options : { localPath: options };
            const localPath = path.resolve(options.localPath);
            const { comment } = options;
            let { zipPath, zipName } = options;
            const self = this;

            filetools.fs.stat(localPath, (err, stats) => {
                if (err) return callback(err, false);
                zipPath = zipPath ? fixPath(zipPath) : "";
                const p = path.win32.basename(path.win32.normalize(localPath));
                zipPath += zipName ? zipName : p;

                if (stats.isFile()) {
                    filetools.fs.readFile(localPath, (err, data) => {
                        if (err) return callback(err, false);
                        self.addFile(zipPath, data, comment, stats);
                        setImmediate(callback, undefined, true);
                    });
                } else if (stats.isDirectory()) {
                    zipPath += filetools.sep;
                    self.addFile(zipPath, Buffer.alloc(0), comment, stats);
                    setImmediate(callback, undefined, true);
                }
            });
        },

        addLocalFolder: (localPath, zipPath, filter) => {
            filter = filenameFilter(filter);
            zipPath = zipPath ? fixPath(zipPath) : "";
            localPath = path.normalize(localPath);

            if (filetools.fs.existsSync(localPath)) {
                const items = filetools.findFiles(localPath);
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

        addLocalFolderAsync: (localPath, callback, zipPath, filter) => {
            filter = filenameFilter(filter);
            zipPath = zipPath ? fixPath(zipPath) : "";
            localPath = path.normalize(localPath);

            filetools.fs.open(localPath, "r", function (err) {
                if (err && err.code === "ENOENT") {
                    callback(undefined, Utils.Errors.FILE_NOT_FOUND(localPath));
                } else if (err) {
                    callback(undefined, err);
                } else {
                    const items = filetools.findFiles(localPath);
                    let i = -1;

                    const next = () => {
                        i += 1;
                        if (i < items.length) {
                            const filepath = items[i];
                            const p = relativePath(localPath, filepath).split("\\").join("/"); 
                            if (filter(p)) {
                                filetools.fs.stat(filepath, (statsErr, stats) => {
                                    if (statsErr) callback(undefined, statsErr);
                                    if (stats.isFile()) {
                                        filetools.fs.readFile(filepath, (readErr, data) => {
                                            if (readErr) {
                                                callback(undefined, readErr);
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

        addLocalFolderAsync2: (options, callback) => {
            const self = this;
            options = typeof options === "object" ? options : { localPath: options };
            const localPath = path.resolve(fixPath(options.localPath));
            let { zipPath, filter, namefix } = options;

            if (filter instanceof RegExp) {
                filter = (filename) => filter.test(filename);
            } else if (typeof filter !== "function") {
                filter = () => true;
            }

            zipPath = zipPath ? fixPath(zipPath) : "";
            if (namefix === "latin1") {
                namefix = (str) =>
                    str
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^\x20-\x7E]/g, "");
            }

            if (typeof namefix !== "function") {
                namefix = (str) => str;
            }

            const relPathFix = (entry) => path.join(zipPath, namefix(relativePath(localPath, entry)));
            const fileNameFix = (entry) => path.win32.basename(path.win32.normalize(namefix(entry)));

            filetools.fs.open(localPath, "r", (err) => {
                if (err && err.code === "ENOENT") {
                    callback(undefined, Utils.Errors.FILE_NOT_FOUND(localPath));
                } else if (err) {
                    callback(undefined, err);
                } else {
                    filetools.findFilesAsync(localPath, (err, fileEntries) => {
                        if (err) return callback(err);
                        fileEntries = fileEntries.filter((dir) => filter(relPathFix(dir)));
                        if (!fileEntries.length) callback(undefined, false);

                        setImmediate(
                            fileEntries.reverse().reduce((next, entry) => (err, done) => {
                                    if (err || done === false) return setImmediate(next, err, false);

                                    this.addLocalFileAsync(
                                        {
                                            localPath: entry,
                                            zipPath: path.dirname(relPathFix(entry)),
                                            zipName: fileNameFix(entry)
                                        },
                                        next
                                    );
                                }
                                , callback)
                        );
                    });
                }
            });
        },

        addLocalFolderPromise: (localPath, props) => {
            return new Promise((resolve, reject) => {
                this.addLocalFolderAsync2(Object.assign({ localPath }, props), (err, done) => {
                    if (err) reject(err);
                    if (done) resolve(this);
                });
            });
        },

        addFile: (entryName, content, comment, attr) => {
            entryName = zipnamefix(entryName);
            let entry = getEntry(entryName);
            const update = entry != null;

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

        getEntries: (password) => {
            _zip.password = password;
            return _zip.entries || [];
        },

        getEntry: (name) => getEntry(name),

        getEntryCount: () => _zip.getEntryCount(),

        forEach: (callback) => _zip.forEach(callback),

        extractEntryTo: (entry, targetPath, maintainEntryPath = true, overwrite = false, keepOriginalPermission = false, outFileName) => {
            overwrite = getLastBool(false, overwrite);
            keepOriginalPermission = getLastBool(false, keepOriginalPermission);
            maintainEntryPath = getLastBool(true, maintainEntryPath);
            outFileName = getLastString(keepOriginalPermission, outFileName);

            const item = getEntry(entry);
            if (!item) {
                throw Utils.Errors.NO_ENTRY();
            }

            const entryName = canonical(item.entryName);

            const target = sanitize(targetPath, outFileName && !item.isDirectory ? outFileName : maintainEntryPath ? entryName : path.basename(entryName));

            if (item.isDirectory) {
                const children = _zip.getEntryChildren(item);
                children.forEach((child) => {
                    if (child.isDirectory) return;
                    const content = child.getData();
                    if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();

                    const name = canonical(child.entryName);
                    const childName = sanitize(targetPath, maintainEntryPath ? name : path.basename(name));
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

        test: (pass) => {
            if (!_zip) return false;

            for (const entry of _zip.entries) {
                try {
                    if (entry.isDirectory) continue;
                    const content = entry.getData(pass);
                    if (!content) return false;
                } catch (err) {
                    return false;
                }
            }
            return true;
        },

        extractAllTo: (targetPath, overwrite = false, keepOriginalPermission = false, pass) => {
            keepOriginalPermission = getLastBool(false, keepOriginalPermission);
            pass = getLastString(keepOriginalPermission, pass);
            overwrite = getLastBool(false, overwrite);
            if (!_zip) throw Utils.Errors.NO_ZIP();

            _zip.entries.forEach((entry) => {
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
                } catch (err) {
                    throw Utils.Errors.CANT_EXTRACT_FILE();
                }
            });
        },

        extractAllToAsync: (targetPath, overwrite = false, keepOriginalPermission = false, callback) => {
            callback = getLastFunction(overwrite, keepOriginalPermission, callback);
            keepOriginalPermission = getLastBool(false, keepOriginalPermission);
            overwrite = getLastBool(false, overwrite);
            if (!callback) {
                return new Promise((resolve, reject) => {
                    this.extractAllToAsync(targetPath, overwrite, keepOriginalPermission, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this);
                        }
                    });
                });
            }
            if (!_zip) {
                callback(Utils.Errors.NO_ZIP());
                return;
            }

            targetPath = path.resolve(targetPath);
            const getPath = (entry) => sanitize(targetPath, path.normalize(canonical(entry.entryName)));
            const getError = (msg, file) => new Error(msg + ': "' + file + '"');

            const dirEntries = [];
            const fileEntries = [];
            _zip.entries.forEach((entry) => {
                if (entry.isDirectory) {
                    dirEntries.push(entry);
                } else {
                    fileEntries.push(entry);
                }
            });

            for (const entry of dirEntries) {
                const dirPath = getPath(entry);
                const dirAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
                try {
                    filetools.makeDir(dirPath);
                    if (dirAttr) filetools.fs.chmodSync(dirPath, dirAttr);
                    filetools.fs.utimesSync(dirPath, entry.header.time, entry.header.time);
                } catch (err) {
                    callback(getError("Unable to create folder", dirPath));
                }
            }

            fileEntries.reverse().reduce((next, entry) => (err) => {
                    if (err) next(err);
                    const entryName = path.normalize(canonical(entry.entryName));
                    const filePath = sanitize(targetPath, entryName);
                    entry.getDataAsync((content, err_1) => {
                        if (err_1) {
                            next(err_1);
                        } else if (!content) {
                            next(Utils.Errors.CANT_EXTRACT_FILE());
                        } else {
                            const fileAttr = keepOriginalPermission ? entry.header.fileAttr : undefined;
                            filetools.writeFileToAsync(filePath, content, overwrite, fileAttr, (success) => {
                                if (!success) {
                                    next(getError("Unable to write file", filePath));
                                }
                                filetools.fs.utimes(filePath, entry.header.time, entry.header.time, (err_2) => {
                                    if (err_2) {
                                        next(getError("Unable to set times", filePath));
                                    } else {
                                        next();
                                    }
                                });
                            });
                        }
                    });
                },
                callback)();
        },

        writeZip: (targetFileName, callback) => {
            if (arguments.length === 1 && typeof targetFileName === "function") {
                callback = targetFileName;
                targetFileName = "";
            }

            targetFileName = targetFileName || opts.filename;
            if (!targetFileName) return;

            const zipData = _zip.compressToBuffer();
            if (zipData) {
                const success = filetools.writeFileTo(targetFileName, zipData, true);
                if (typeof callback === "function") callback(!success ? new Error("failed") : null, "");
            }
        },

        writeZipPromise: (targetFileName, props) => {
            const { overwrite, perm } = Object.assign({ overwrite: true }, props);

            return new Promise((resolve, reject) => {
                targetFileName = targetFileName || opts.filename;
                if (!targetFileName) reject("ADM-ZIP: ZIP File Name Missing");

                this.toBufferPromise().then((zipData) => {
                    const resultHandler = (done) => done ? resolve(done) : reject("ADM-ZIP: Wasn't able to write zip file");
                    filetools.writeFileToAsync(targetFileName, zipData, overwrite, perm, resultHandler);
                }, reject);
            });
        },

        toBufferPromise: () => new Promise((resolve, reject) => {
            _zip.toAsyncBuffer(resolve, reject);
        }),

        toBuffer: function (onSuccess, onFail, onItemStart, onItemEnd) {
            if (typeof onSuccess === "function") {
                _zip.toAsyncBuffer(onSuccess, onFail, onItemStart, onItemEnd);
                return null;
            }
            return _zip.compressToBuffer();
        }
    };
};
