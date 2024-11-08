const Utils = require('./util');
const fs = Utils.FileSystem.require();
const path = require('path');

fs.existsSync = fs.existsSync || path.existsSync;

const ZipEntry = require('./zipEntry');
const ZipFile = require('./zipFile');

const isWindows = /^win/.test(process.platform);

module.exports = function (input) {
    let zipInstance = undefined;
    let filename = "";

    if (typeof input === "string") {
        if (fs.existsSync(input)) {
            filename = input;
            zipInstance = new ZipFile(input, Utils.Constants.FILE);
        } else {
            throw new Error(Utils.Errors.INVALID_FILENAME);
        }
    } else if (Buffer.isBuffer(input)) {
        zipInstance = new ZipFile(input, Utils.Constants.BUFFER);
    } else {
        zipInstance = new ZipFile(null, Utils.Constants.NONE);
    }

    function sanitizeFilePath(prefix, name) {
        prefix = path.resolve(path.normalize(prefix));
        const parts = name.split('/');
        for (let i = 0; i < parts.length; i++) {
            const joinedPath = path.normalize(path.join(prefix, parts.slice(i).join(path.sep)));
            if (joinedPath.startsWith(prefix)) {
                return joinedPath;
            }
        }
        return path.normalize(path.join(prefix, path.basename(name)));
    }

    function fetchEntry(entry) {
        if (entry && zipInstance) {
            let item;
            if (typeof entry === "string") {
                item = zipInstance.getEntry(entry);
            } else if (entry.entryName && entry.header) {
                item = zipInstance.getEntry(entry.entryName);
            }
            return item || null;
        }
        return null;
    }

    function normalizePath(zipPath){
        zipPath = zipPath.split("\\").join("/");
        if (zipPath.charAt(zipPath.length - 1) !== "/") {
            zipPath += "/";
        }        
        return zipPath;
    }

    return {
        readFile: function (entry, pass) {
            const item = fetchEntry(entry);
            return item ? item.getData(pass) : null;
        },

        readFileAsync: function (entry, callback) {
            const item = fetchEntry(entry);
            if (item) {
                item.getDataAsync(callback);
            } else {
                callback(null, "Failed to retrieve entry: " + entry);
            }
        },

        readAsText: function (entry, encoding = "utf8") {
            const item = fetchEntry(entry);
            if (item) {
                const data = item.getData();
                return data ? data.toString(encoding) : "";
            }
            return "";
        },

        readAsTextAsync: function (entry, callback, encoding = "utf8") {
            const item = fetchEntry(entry);
            if (item) {
                item.getDataAsync((data, err) => {
                    if (err) {
                        callback(data, err);
                        return;
                    }
                    callback(data ? data.toString(encoding) : "");
                });
            } else {
                callback("");
            }
        },

        deleteFile: function (entry) {
            const item = fetchEntry(entry);
            if (item) {
                zipInstance.deleteEntry(item.entryName);
            }
        },

        addZipComment: function (comment) {
            zipInstance.comment = comment;
        },

        getZipComment: function () {
            return zipInstance.comment || '';
        },

        addZipEntryComment: function (entry, comment) {
            const item = fetchEntry(entry);
            if (item) {
                item.comment = comment;
            }
        },

        getZipEntryComment: function (entry) {
            const item = fetchEntry(entry);
            return item ? item.comment || '' : '';
        },

        updateFile: function (entry, content) {
            const item = fetchEntry(entry);
            if (item) {
                item.setData(content);
            }
        },

        addLocalFile: function (localPath, zipPath, zipName, comment) {
            if (fs.existsSync(localPath)) {
                zipPath = zipPath ? normalizePath(zipPath) : "";
                const fileName = localPath.split("\\").join("/").split("/").pop();
                zipPath += zipName || fileName;
                const fileAttributes = fs.statSync(localPath);
                this.addFile(zipPath, fs.readFileSync(localPath), comment, fileAttributes);
            } else {
                throw new Error(Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath));
            }
        },

        addLocalFolder: function (localPath, zipPath, filter) {
            if (filter instanceof RegExp) {
                filter = (regex => filename => regex.test(filename))(filter);
            } else if (typeof filter !== 'function') {
                filter = () => true;
            }

            zipPath = zipPath ? normalizePath(zipPath) : "";
            localPath = path.normalize(localPath);

            if (fs.existsSync(localPath)) {
                const items = Utils.findFiles(localPath);
                if (items.length) {
                    items.forEach(filepath => {
                        const relativePath = path.relative(localPath, filepath).split("\\").join("/");
                        if (filter(relativePath)) {
                            if (!filepath.endsWith(path.sep)) {
                                this.addFile(zipPath + relativePath, fs.readFileSync(filepath), "", fs.statSync(filepath));
                            } else {
                                this.addFile(zipPath + relativePath + '/', Buffer.alloc(0), "", 0);
                            }
                        }
                    });
                }
            } else {
                throw new Error(Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath));
            }
        },

        addLocalFolderAsync: function (localPath, callback, zipPath, filter) {
            if (filter === undefined) {
                filter = () => true;
            } else if (filter instanceof RegExp) {
                filter = (regex => filename => regex.test(filename))(filter);
            }

            zipPath = zipPath ? zipPath.split("\\").join("/") : "";
            if (zipPath.charAt(zipPath.length - 1) !== "/") {
                zipPath += "/";
            }
            
            localPath = path.normalize(localPath).split("\\").join("/");
            if (localPath.charAt(localPath.length - 1) !== "/")
                localPath += "/";

            const self = this;
            fs.open(localPath, 'r', (err, fd) => {
                if (err && err.code === 'ENOENT') {
                    callback(undefined, Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath));
                } else if (err) {
                    callback(undefined, err);
                } else {
                    const items = Utils.findFiles(localPath);
                    let i = -1;

                    const processNext = function () {
                        i += 1;
                        if (i < items.length) {
                            let relativePath = items[i].split("\\").join("/").replace(new RegExp(localPath.replace(/(\(|\))/g, '\\$1'), 'i'), ""); 
                            relativePath = relativePath.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '');

                            if (filter(relativePath)) {
                                if (!relativePath.endsWith("/")) {
                                    fs.readFile(items[i], (err, data) => {
                                        if (err) {
                                            callback(undefined, err);
                                        } else {
                                            self.addFile(zipPath + relativePath, data, '', 0);
                                            processNext();
                                        }
                                    });
                                } else {
                                    self.addFile(zipPath + relativePath, Buffer.alloc(0), "", 0);
                                    processNext();
                                }
                            } else {
                                processNext();
                            }
                        } else {
                            callback(true);
                        }
                    };

                    processNext();
                }
            });
        },

        addFile: function (entryName, content, comment, attr) {
            const entry = new ZipEntry();
            entry.entryName = entryName;
            entry.comment = comment || "";

            const isStatAttr = ('object' === typeof attr) && (attr instanceof fs.Stats);
            if (isStatAttr) {
                entry.header.time = attr.mtime;
            }

            let fileAttr = entry.isDirectory ? 0x10 : 0;

            if ('win32' !== process.platform) {
                let unixAttr = entry.isDirectory ? 0x4000 : 0x8000;
                if (isStatAttr) {
                    unixAttr |= (0xfff & attr.mode);
                } else if (typeof attr === 'number') {
                    unixAttr |= (0xfff & attr);
                } else {
                    unixAttr |= entry.isDirectory ? 0o755 : 0o644;
                }

                fileAttr = (fileAttr | (unixAttr << 16)) >>> 0;
            }

            entry.attr = fileAttr;
            entry.setData(content);
            zipInstance.setEntry(entry);
        },

        getEntries: function () {
            return zipInstance ? zipInstance.entries : [];
        },

        getEntry: function (name) {
            return fetchEntry(name);
        },

        getEntryCount: function () {
            return zipInstance.getEntryCount();
        },

        forEach: function (callback) {
            return zipInstance.forEach(callback);
        },

        extractEntryTo: function (entry, targetPath, maintainEntryPath = true, overwrite = false, outFileName) {
            const item = fetchEntry(entry);
            if (!item) {
                throw new Error(Utils.Errors.NO_ENTRY);
            }

            const entryName = outFileName && !item.isDirectory ? outFileName :
                              maintainEntryPath ? item.entryName : path.basename(item.entryName);
            const target = sanitizeFilePath(targetPath, entryName);

            if (item.isDirectory) {
                path.resolve(target, "..");
                const children = zipInstance.getEntryChildren(item);
                children.forEach(child => {
                    if (child.isDirectory) return;
                    const content = child.getData();
                    if (!content) throw new Error(Utils.Errors.CANT_EXTRACT_FILE);
                    const childName = sanitizeFilePath(targetPath, maintainEntryPath ? child.entryName : path.basename(child.entryName));
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

        test: function (pass) {
            if (!zipInstance) return false;

            for (const entryKey in zipInstance.entries) {
                const entry = zipInstance.entries[entryKey];
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

        extractAllTo: function (targetPath, overwrite = false, pass) {
            if (!zipInstance) throw new Error(Utils.Errors.NO_ZIP);

            zipInstance.entries.forEach(entry => {
                const entryName = sanitizeFilePath(targetPath, entry.entryName.toString());
                if (entry.isDirectory) {
                    Utils.makeDir(entryName);
                    return;
                }
                const content = entry.getData(pass);
                if (!content) throw new Error(Utils.Errors.CANT_EXTRACT_FILE);
                Utils.writeFileTo(entryName, content, overwrite);

                try {
                    fs.utimesSync(entryName, entry.header.time, entry.header.time);
                } catch (err) {
                    throw new Error(Utils.Errors.CANT_EXTRACT_FILE);
                }
            });
        },

        extractAllToAsync: function (targetPath, overwrite = false, callback = () => {}) {
            if (!zipInstance) {
                callback(new Error(Utils.Errors.NO_ZIP));
                return;
            }

            const entries = zipInstance.entries;
            let pending = entries.length;

            entries.forEach(entry => {
                if (pending <= 0) return;

                const entryName = path.normalize(entry.entryName.toString());

                if (entry.isDirectory) {
                    Utils.makeDir(sanitizeFilePath(targetPath, entryName));
                    if (--pending === 0) callback();
                    return;
                }

                entry.getDataAsync((content, err) => {
                    if (pending <= 0) return;
                    if (err || !content) {
                        pending = 0;
                        callback(new Error(err || Utils.Errors.CANT_EXTRACT_FILE));
                        return;
                    }

                    Utils.writeFileToAsync(sanitizeFilePath(targetPath, entryName), content, overwrite, success => {
                        try {
                            fs.utimesSync(path.resolve(targetPath, entryName), entry.header.time, entry.header.time);
                        } catch {
                            callback(new Error('Unable to set utimes'));
                        }
                        if (pending <= 0) return;
                        if (!success) {
                            pending = 0;
                            callback(new Error('Unable to write'));
                            return;
                        }
                        if (--pending === 0) callback();
                    });
                });
            });
        },

        writeZip: function (targetFileName, callback) {
            if (arguments.length === 1 && typeof targetFileName === "function") {
                callback = targetFileName;
                targetFileName = "";
            }

            targetFileName = targetFileName || filename;
            if (!targetFileName) return;

            const zipData = zipInstance.compressToBuffer();
            if (zipData) {
                const success = Utils.writeFileTo(targetFileName, zipData, true);
                if (typeof callback === 'function') callback(success ? null : new Error("failed"), "");
            }
        },

        toBuffer: function (onSuccess, onFail, onItemStart, onItemEnd) {
            this.valueOf = 2;
            if (typeof onSuccess === "function") {
                zipInstance.toAsyncBuffer(onSuccess, onFail, onItemStart, onItemEnd);
                return null;
            }
            return zipInstance.compressToBuffer();
        }
    };
};
