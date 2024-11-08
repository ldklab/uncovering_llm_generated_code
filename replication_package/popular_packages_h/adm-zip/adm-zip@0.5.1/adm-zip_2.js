const Utils = require("./util");
const fs = Utils.FileSystem.require();
const pth = require("path");

const ZipEntry = require("./zipEntry");
const ZipFile = require("./zipFile");

const isWin = /^win/.test(process.platform);

module.exports = function(input) {
    let _zip;
    let _filename = "";

    if (input && typeof input === "string") {
        if (fs.existsSync(input)) {
            _filename = input;
            _zip = new ZipFile(input, Utils.Constants.FILE);
        } else {
            throw new Error(Utils.Errors.INVALID_FILENAME);
        }
    } else if (input && Buffer.isBuffer(input)) {
        _zip = new ZipFile(input, Utils.Constants.BUFFER);
    } else {
        _zip = new ZipFile(null, Utils.Constants.NONE);
    }

    function sanitize(prefix, name) {
        const resolvedPrefix = pth.resolve(pth.normalize(prefix));
        const parts = name.split('/');
        for (let i = 0, l = parts.length; i < l; i++) {
            const path = pth.normalize(pth.join(resolvedPrefix, parts.slice(i, l).join(pth.sep)));
            if (path.startsWith(resolvedPrefix)) {
                return path;
            }
        }
        return pth.normalize(pth.join(resolvedPrefix, pth.basename(name)));
    }

    function getEntry(entry) {
        if (entry && _zip) {
            if (typeof entry === "string") {
                return _zip.getEntry(entry);
            }
            if (entry.entryName && entry.header !== undefined) {
                return _zip.getEntry(entry.entryName);
            }
        }
        return null;
    }

    function fixPath(zipPath) {
        return zipPath.split("\\").join("/") + (zipPath.endsWith("/") ? "" : "/");
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
            return item ? (item.getData() || "").toString(encoding || "utf8") : "";
        },

        readAsTextAsync(entry, callback, encoding) {
            const item = getEntry(entry);
            if (item) {
                item.getDataAsync((data, err) => {
                    callback(err || "", data ? data.toString(encoding || "utf8") : "");
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

        addLocalFile(localPath, zipPath, zipName, comment) {
            if (!fs.existsSync(localPath)) {
                throw new Error(Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath));
            }

            zipPath = zipPath ? fixPath(zipPath) : "";
            const fileName = pth.basename(localPath);
            zipPath += zipName || fileName;
            const fileAttr = fs.statSync(localPath);
            
            this.addFile(zipPath, fs.readFileSync(localPath), comment, fileAttr);
        },

        addLocalFolder(localPath, zipPath, filter) {
            filter = filter instanceof RegExp ? filename => filter.test(filename) : filter || (() => true);

            zipPath = zipPath ? fixPath(zipPath) : "";
            localPath = pth.normalize(localPath);

            if (!fs.existsSync(localPath)) {
                throw new Error(Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath));
            }

            const items = Utils.findFiles(localPath);
            items.forEach(filepath => {
                const p = pth.relative(localPath, filepath).split("\\").join("/");
                if (filter(p)) {
                    if (filepath.charAt(filepath.length - 1) !== pth.sep) {
                        this.addFile(zipPath + p, fs.readFileSync(filepath), "", fs.statSync(filepath));
                    } else {
                        this.addFile(zipPath + p + '/', Buffer.alloc(0), "", 0);
                    }
                }
            });
        },

        addLocalFolderAsync(localPath, callback, zipPath, filter) {
            filter = typeof filter === 'function' ? filter : filter instanceof RegExp ? filename => filter.test(filename) : () => true;

            zipPath = zipPath ? fixPath(zipPath) : "";
            localPath = pth.normalize(localPath).split("\\").join("/");

            if (!localPath.endsWith("/")) localPath += "/";

            fs.open(localPath, 'r', (err, fd) => {
                if (err && err.code === 'ENOENT') {
                    callback(undefined, Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath));
                } else if (err) {
                    callback(undefined, err);
                } else {
                    const items = Utils.findFiles(localPath);
                    let i = -1;

                    const processItem = () => {
                        i++;
                        if (i >= items.length) {
                            callback(true, undefined);
                            return;
                        }

                        const itemPath = items[i].split("\\").join("/").replace(new RegExp(localPath, 'i'), "");
                        if (filter(itemPath)) {
                            if (!itemPath.endsWith("/")) {
                                fs.readFile(items[i], (err, data) => {
                                    if (err) {
                                        callback(undefined, err);
                                    } else {
                                        this.addFile(zipPath + itemPath, data, '', 0);
                                        processItem();
                                    }
                                });
                            } else {
                                this.addFile(zipPath + itemPath, Buffer.alloc(0), "", 0);
                                processItem();
                            }
                        } else {
                            processItem();
                        }
                    };

                    processItem();
                }
            });
        },

        addFile(entryName, content, comment, attr) {
            const entry = new ZipEntry();
            entry.entryName = entryName;
            entry.comment = comment || "";

            const isStat = (typeof attr === 'object') && (attr instanceof fs.Stats);
            if (isStat) entry.header.time = attr.mtime;

            let fileAttr = entry.isDirectory ? 0x10 : 0; 

            if (process.platform !== 'win32') {
                let unix = entry.isDirectory ? 0x4000 : 0x8000;
                if (isStat) {
                    unix |= (0xfff & attr.mode);
                } else if (typeof attr === 'number') {
                    unix |= (0xfff & attr);
                } else {
                    unix |= entry.isDirectory ? 0o755 : 0o644;
                }
                fileAttr = (fileAttr | (unix << 16)) >>> 0;
            }

            entry.attr = fileAttr;
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
            return _zip ? _zip.getEntryCount() : 0;
        },

        forEach(callback) {
            return _zip ? _zip.forEach(callback) : [];
        },

        extractEntryTo(entry, targetPath, maintainEntryPath = true, overwrite = false, outFileName) {
            const item = getEntry(entry);
            if (!item) {
                throw new Error(Utils.Errors.NO_ENTRY);
            }

            const entryName = item.entryName;
            const target = sanitize(targetPath, outFileName && !item.isDirectory ? outFileName : (maintainEntryPath ? entryName : pth.basename(entryName)));

            if (item.isDirectory) {
                const children = _zip.getEntryChildren(item);
                children.forEach(child => {
                    if (child.isDirectory) return;
                    const content = child.getData();
                    if (!content) throw new Error(Utils.Errors.CANT_EXTRACT_FILE);
                    const childName = sanitize(targetPath, maintainEntryPath ? child.entryName : pth.basename(child.entryName));
                    Utils.writeFileTo(childName, content, overwrite);
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

            for (const entry of _zip.entries) {
                try {
                    if (entry.isDirectory) continue;
                    const content = entry.getData(pass);
                    if (!content) return false;
                } catch {
                    return false;
                }
            }
            return true;
        },

        extractAllTo(targetPath, overwrite = false, pass) {
            if (!_zip) throw new Error(Utils.Errors.NO_ZIP);

            _zip.entries.forEach(entry => {
                const entryName = sanitize(targetPath, entry.entryName.toString());
                if (entry.isDirectory) {
                    Utils.makeDir(entryName);
                    return;
                }
                const content = entry.getData(pass);
                if (!content) throw new Error(Utils.Errors.CANT_EXTRACT_FILE);
                Utils.writeFileTo(entryName, content, overwrite);
                fs.utimesSync(entryName, entry.header.time, entry.header.time);
            });
        },

        extractAllToAsync(targetPath, overwrite = false, callback = () => {}) {
            if (!_zip) {
                callback(new Error(Utils.Errors.NO_ZIP));
                return;
            }

            const entries = _zip.entries;
            let pending = entries.length || 0;

            const checkDone = () => {
                if (--pending === 0) callback(undefined);
            };

            entries.forEach(entry => {
                const entryName = pth.normalize(entry.entryName.toString());
                if (entry.isDirectory) {
                    Utils.makeDir(sanitize(targetPath, entryName));
                    checkDone();
                    return;
                }

                entry.getDataAsync((content, err) => {
                    if (err) {
                        callback(new Error(err));
                        pending = 0;
                        return;
                    }
                    if (!content) {
                        callback(new Error(Utils.Errors.CANT_EXTRACT_FILE));
                        pending = 0;
                        return;
                    }
                    Utils.writeFileToAsync(sanitize(targetPath, entryName), content, overwrite, succ => {
                        fs.utimesSync(pth.resolve(targetPath, entryName), entry.header.time, entry.header.time);
                        if (!succ) {
                            callback(new Error('Unable to write'));
                            pending = 0;
                            return;
                        }
                        checkDone();
                    });
                });
            });
        },

        writeZip(targetFileName, callback) {
            if (typeof targetFileName === "function") {
                callback = targetFileName;
                targetFileName = "";
            }

            targetFileName = targetFileName || _filename;
            if (!targetFileName) return;

            const zipData = _zip.compressToBuffer();
            if (zipData) {
                const ok = Utils.writeFileTo(targetFileName, zipData, true);
                if (callback) callback(!ok ? new Error("failed") : null, "");
            }
        },

        toBuffer(onSuccess, onFail, onItemStart, onItemEnd) {
            if (onSuccess) {
                _zip.toAsyncBuffer(onSuccess, onFail, onItemStart, onItemEnd);
                return null;
            }
            return _zip.compressToBuffer();
        }
    };
};
