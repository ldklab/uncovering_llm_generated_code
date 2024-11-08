const Utils = require("./util");
const fs = Utils.FileSystem.require();
const path = require("path");
const ZipEntry = require("./zipEntry");
const ZipFile = require("./zipFile");
const isWin = /^win/.test(process.platform);

fs.existsSync = fs.existsSync || path.existsSync;

module.exports = function (input) {
    let _zip;
    let _filename = "";

    if (typeof input === "string") {
        if (fs.existsSync(input)) {
            _filename = input;
            _zip = new ZipFile(input, Utils.Constants.FILE);
        } else {
            throw new Error(Utils.Errors.INVALID_FILENAME);
        }
    } else if (Buffer.isBuffer(input)) {
        _zip = new ZipFile(input, Utils.Constants.BUFFER);
    } else {
        _zip = new ZipFile(null, Utils.Constants.NONE);
    }

    function sanitize(prefix, name) {
        const resolvedPrefix = path.resolve(path.normalize(prefix));
        const parts = name.split('/');
        for (let i = 0; i < parts.length; i++) {
            const filePath = path.normalize(path.join(resolvedPrefix, parts.slice(i).join(path.sep)));
            if (filePath.indexOf(resolvedPrefix) === 0) return filePath;
        }
        return path.normalize(path.join(resolvedPrefix, path.basename(name)));
    }

    function getEntry(entry) {
        if (_zip) {
            if (typeof entry === "string") return _zip.getEntry(entry);
            if (typeof entry === "object" && entry.entryName && entry.header) return _zip.getEntry(entry.entryName);
        }
        return null;
    }

    function fixPath(zipPath) {
        zipPath = zipPath.split("\\").join("/");
        if (!zipPath.endsWith("/")) zipPath += "/";
        return zipPath;
    }

    return {
        readFile(entry, pass) {
            const item = getEntry(entry);
            return item ? item.getData(pass) : null;
        },

        readFileAsync(entry, callback) {
            const item = getEntry(entry);
            item ? item.getDataAsync(callback) : callback(null, "getEntry failed for:" + entry);
        },

        readAsText(entry, encoding) {
            const item = getEntry(entry);
            const data = item ? item.getData() : null;
            return data ? data.toString(encoding || "utf8") : "";
        },

        readAsTextAsync(entry, callback, encoding) {
            const item = getEntry(entry);
            if (item) {
                item.getDataAsync((data, err) => {
                    callback(err ? data : data ? data.toString(encoding || "utf8") : "");
                });
            } else {
                callback("");
            }
        },

        deleteFile(entry) {
            const item = getEntry(entry);
            if (item) _zip.deleteEntry(item.entryName);
        },

        addZipComment(comment) {
            _zip.comment = comment;
        },

        getZipComment() {
            return _zip.comment || '';
        },

        addZipEntryComment(entry, comment) {
            const item = getEntry(entry);
            if (item) item.comment = comment;
        },

        getZipEntryComment(entry) {
            const item = getEntry(entry);
            return item ? item.comment || '' : '';
        },

        updateFile(entry, content) {
            const item = getEntry(entry);
            if (item) item.setData(content);
        },

        addLocalFile(localPath, zipPath = "", zipName, comment) {
            if (fs.existsSync(localPath)) {
                zipPath = fixPath(zipPath);
                const p = localPath.split("\\").join("/").split("/").pop();
                zipPath += zipName || p;
                const attributes = fs.statSync(localPath);
                this.addFile(zipPath, fs.readFileSync(localPath), comment, attributes);
            } else {
                throw new Error(Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath));
            }
        },

        addLocalFolder(localPath, zipPath = "", filter) {
            filter = typeof filter === 'function' ? filter : (filter instanceof RegExp ? (filename) => filter.test(filename) : () => true);
            zipPath = fixPath(zipPath);
            localPath = path.normalize(localPath);

            if (fs.existsSync(localPath)) {
                const items = Utils.findFiles(localPath);
                items.forEach(filepath => {
                    const p = path.relative(localPath, filepath).split("\\").join("/");
                    if (filter(p)) {
                        if (!filepath.endsWith(path.sep)) {
                            this.addFile(zipPath + p, fs.readFileSync(filepath), "", fs.statSync(filepath));
                        } else {
                            this.addFile(zipPath + p + '/', Buffer.alloc(0), "", 0);
                        }
                    }
                });
            } else {
                throw new Error(Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath));
            }
        },

        addLocalFolderAsync(localPath, callback, zipPath = "", filter) {
            filter = typeof filter === 'function' ? filter : (filter instanceof RegExp ? (filename) => filter.test(filename) : () => true);
            zipPath = fixPath(zipPath);
            localPath = path.normalize(localPath).split("\\").join("/");
            if (!localPath.endsWith("/")) localPath += "/";

            fs.open(localPath, 'r', (err, fd) => {
                if (err) {
                    callback(undefined, err.code === 'ENOENT' ? Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath) : err);
                } else {
                    const items = Utils.findFiles(localPath);
                    let i = -1;
                    const next = () => {
                        i++;
                        if (i < items.length) {
                            let p = items[i].split("\\").join("/").replace(new RegExp(localPath.replace(/(\(|\))/g, '\\$1'), 'i'), "");
                            p = p.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '');
                            if (filter(p)) {
                                if (!p.endsWith("/")) {
                                    fs.readFile(items[i], (err, data) => {
                                        if (err) {
                                            callback(undefined, err);
                                        } else {
                                            this.addFile(zipPath + p, data, '', 0);
                                            next();
                                        }
                                    });
                                } else {
                                    this.addFile(zipPath + p, Buffer.alloc(0), "", 0);
                                    next();
                                }
                            } else {
                                next();
                            }
                        } else {
                            callback(true, undefined);
                        }
                    };
                    next();
                }
            });
        },

        addFile(entryName, content, comment, attr) {
            const entry = new ZipEntry();
            entry.entryName = entryName;
            entry.comment = comment || "";
            const isStat = attr instanceof fs.Stats;

            if (isStat) {
                entry.header.time = attr.mtime;
            }

            let fileattr = entry.isDirectory ? 0x10 : 0;
            if (!isWin) {
                let unix = entry.isDirectory ? 0x4000 : 0x8000;
                if (isStat) {
                    unix |= attr.mode & 0xfff;
                } else if (typeof attr === 'number') {
                    unix |= attr & 0xfff;
                } else {
                    unix |= entry.isDirectory ? 0o755 : 0o644;
                }
                fileattr = (fileattr | (unix << 16)) >>> 0;
            }

            entry.attr = fileattr;
            entry.setData(content);
            _zip.setEntry(entry);
        },

        getEntries() {
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

        extractEntryTo(entry, targetPath, maintainEntryPath = true, overwrite = false, outFileName) {
            const item = getEntry(entry);
            if (!item) throw new Error(Utils.Errors.NO_ENTRY);

            const entryName = item.entryName;
            const target = sanitize(targetPath, outFileName && !item.isDirectory ? outFileName : (maintainEntryPath ? entryName : path.basename(entryName)));

            if (item.isDirectory) {
                const children = _zip.getEntryChildren(item);
                children.forEach(child => {
                    if (!child.isDirectory) {
                        const childContent = child.getData();
                        if (!childContent) throw new Error(Utils.Errors.CANT_EXTRACT_FILE);
                        const childPath = sanitize(targetPath, maintainEntryPath ? child.entryName : path.basename(child.entryName));
                        Utils.writeFileTo(childPath, childContent, overwrite);
                    }
                });
                return true;
            }

            const content = item.getData();
            if (!content) throw new Error(Utils.Errors.CANT_EXTRACT_FILE);

            if (fs.existsSync(target) && !overwrite) {
                throw new Error(Utils.Errors.CANT_OVERRIDE);
            }
            Utils.writeFileTo(target, content, overwrite);

            return true;
        },

        test(pass) {
            if (!_zip) return false;
            try {
                for (const entry of _zip.entries) {
                    if (!entry.isDirectory && !entry.getData(pass)) return false;
                }
            } catch (err) {
                return false;
            }
            return true;
        },

        extractAllTo(targetPath, overwrite = false, pass) {
            if (!_zip) throw new Error(Utils.Errors.NO_ZIP);

            _zip.entries.forEach(entry => {
                const entryName = sanitize(targetPath, entry.entryName.toString());
                if (entry.isDirectory) {
                    Utils.makeDir(entryName);
                } else {
                    const content = entry.getData(pass);
                    if (!content) throw new Error(Utils.Errors.CANT_EXTRACT_FILE);
                    Utils.writeFileTo(entryName, content, overwrite);
                    try {
                        fs.utimesSync(entryName, entry.header.time, entry.header.time);
                    } catch (err) {
                        throw new Error(Utils.Errors.CANT_EXTRACT_FILE);
                    }
                }
            });
        },

        extractAllToAsync(targetPath, overwrite = false, callback = () => {}) {
            if (!_zip) return callback(new Error(Utils.Errors.NO_ZIP));

            let entries = _zip.entries;
            let i = entries.length;
            entries.forEach(entry => {
                if (i <= 0) return;

                const entryName = path.normalize(entry.entryName.toString());
                if (entry.isDirectory) {
                    Utils.makeDir(sanitize(targetPath, entryName));
                    if (--i === 0) callback(undefined);
                    return;
                }

                entry.getDataAsync((content, err) => {
                    if (i <= 0) return;
                    if (err || !content) {
                        i = 0;
                        callback(new Error(Utils.Errors.CANT_EXTRACT_FILE));
                        return;
                    }

                    Utils.writeFileToAsync(sanitize(targetPath, entryName), content, overwrite, succ => {
                        try {
                            fs.utimesSync(path.resolve(targetPath, entryName), entry.header.time, entry.header.time);
                        } catch (err) {
                            callback(new Error('Unable to set utimes'));
                        }
                        if (i <= 0) return;
                        if (!succ) {
                            i = 0;
                            callback(new Error('Unable to write'));
                            return;
                        }
                        if (--i === 0) callback(undefined);
                    });
                });
            });
        },

        writeZip(targetFileName = "", callback) {
            if (!targetFileName && _filename) targetFileName = _filename;
            if (!targetFileName) return;

            const zipData = _zip.compressToBuffer();
            if (zipData) {
                const success = Utils.writeFileTo(targetFileName, zipData, true);
                if (typeof callback === 'function') callback(success ? null : new Error("failed"), "");
            }
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
