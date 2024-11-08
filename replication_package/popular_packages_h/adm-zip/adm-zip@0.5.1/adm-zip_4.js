const Utils = require("./util");
const fs = Utils.FileSystem.require();
const path = require("path");

fs.existsSync = fs.existsSync || path.existsSync;

const ZipEntry = require("./zipEntry");
const ZipFile = require("./zipFile");

const isWindows = /^win/.test(process.platform);

module.exports = function(input) {
  let zipFile, filename = "";

  if (typeof input === "string") {
    if (fs.existsSync(input)) {
      filename = input;
      zipFile = new ZipFile(input, Utils.Constants.FILE);
    } else {
      throw new Error(Utils.Errors.INVALID_FILENAME);
    }
  } else if (Buffer.isBuffer(input)) {
    zipFile = new ZipFile(input, Utils.Constants.BUFFER);
  } else {
    zipFile = new ZipFile(null, Utils.Constants.NONE);
  }

  function sanitize(directory, name) {
    const fullPath = path.resolve(path.normalize(directory));
    const segments = name.split('/');
    for (let i = 0; i < segments.length; i++) {
      const combinedPath = path.normalize(path.join(fullPath, segments.slice(i).join(path.sep)));
      if (combinedPath.startsWith(fullPath)) return combinedPath;
    }
    return path.normalize(path.join(fullPath, path.basename(name)));
  }

  function getEntry(entryIdentifier) {
    if (entryIdentifier && zipFile) {
      return typeof entryIdentifier === "string" 
        ? zipFile.getEntry(entryIdentifier)
        : (entryIdentifier.entryName && entryIdentifier.header && zipFile.getEntry(entryIdentifier.entryName));
    }
    return null;
  }

  function fixPath(zipPath){
    zipPath = zipPath.replace(/\\/g, "/");
    if (!zipPath.endsWith("/")) zipPath += "/";
    return zipPath;
  }

  return {
    readFile(entry, pass) {
      const zipEntry = getEntry(entry);
      return zipEntry ? zipEntry.getData(pass) : null;
    },

    readFileAsync(entry, callback) {
      const zipEntry = getEntry(entry);
      if (zipEntry) {
        zipEntry.getDataAsync(callback);
      } else {
        callback(null, `getEntry failed for: ${entry}`);
      }
    },

    readAsText(entry, encoding = "utf8") {
      const zipEntry = getEntry(entry);
      const data = zipEntry ? zipEntry.getData() : null;
      return data ? data.toString(encoding) : "";
    },

    readAsTextAsync(entry, callback, encoding = "utf8") {
      const zipEntry = getEntry(entry);
      if (zipEntry) {
        zipEntry.getDataAsync((data, error) => {
          if (error) return callback(data, error);
          callback(data ? data.toString(encoding) : "");
        });
      } else {
        callback("");
      }
    },

    deleteFile(entry) {
      const zipEntry = getEntry(entry);
      if (zipEntry) zipFile.deleteEntry(zipEntry.entryName);
    },

    addZipComment(comment) {
      zipFile.comment = comment;
    },

    getZipComment() {
      return zipFile.comment || '';
    },

    addZipEntryComment(entry, comment) {
      const zipEntry = getEntry(entry);
      if (zipEntry) zipEntry.comment = comment;
    },

    getZipEntryComment(entry) {
      const zipEntry = getEntry(entry);
      return zipEntry ? zipEntry.comment || '' : '';
    },

    updateFile(entry, content) {
      const zipEntry = getEntry(entry);
      if (zipEntry) zipEntry.setData(content);
    },

    addLocalFile(localPath, zipPath = "", zipName = "", comment) {
      if (fs.existsSync(localPath)) {
        zipPath = fixPath(zipPath);
        const filename = path.basename(localPath);
        const internalPath = path.join(zipPath, zipName || filename);
        const attributes = fs.statSync(localPath);
        this.addFile(internalPath, fs.readFileSync(localPath), comment, attributes);
      } else {
        throw new Error(Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath));
      }
    },

    addLocalFolder(localPath, zipPath = "", filter = () => true) {
      if (typeof filter === "object" && filter instanceof RegExp) {
        const regex = filter;
        filter = name => regex.test(name);
      }
      
      zipPath = fixPath(zipPath);
      localPath = path.normalize(localPath);

      if (fs.existsSync(localPath)) {
        const items = Utils.findFiles(localPath);

        items.forEach(filepath => {
          const relativePath = path.relative(localPath, filepath).replace(/\\/g, "/");
          if (filter(relativePath)) {
            const entryPath = path.join(zipPath, relativePath);
            const entryContent = fs.readFileSync(filepath);
            this.addFile(entryPath, entryContent, "", fs.statSync(filepath));
          }
        });
      } else {
        throw new Error(Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath));
      }
    },

    addLocalFolderAsync(localPath, callback, zipPath = "", filter = () => true) {
      if (typeof filter === "object" && filter instanceof RegExp) {
        const regex = filter;
        filter = filename => regex.test(filename);
      }

      zipPath = fixPath(zipPath);
      localPath = pth.normalize(localPath).replace(/\\/g, "/");
      localPath += localPath.endsWith("/") ? "" : "/";

      fs.open(localPath, 'r', (err, fd) => {
        if (err) {
          return err.code === 'ENOENT'
            ? callback(undefined, Utils.Errors.FILE_NOT_FOUND.replace("%s", localPath))
            : callback(undefined, err);
        }

        const items = Utils.findFiles(localPath);
        let index = -1;

        const processNext = () => {
          index += 1;
          if (index < items.length) {
            const fullPath = items[index].replace(/\\/g, "/");
            const relativePath = fullPath.replace(new RegExp(localPath.replace(/(\(|\))/g, '\\$1'), 'i'), "")
                                         .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '');
            if (filter(relativePath)) {
              if (!fullPath.endsWith("/")) {
                fs.readFile(items[index], (readErr, data) => {
                  if (readErr) return callback(undefined, readErr);
                  this.addFile(zipPath + relativePath, data, '', 0);
                  processNext();
                });
              } else {
                this.addFile(zipPath + relativePath, Buffer.alloc(0), "", 0);
                processNext();
              }
            } else {
              processNext();
            }
          } else {
            callback(true, undefined);
          }
        };
        processNext();
      });
    },

    addFile(entryName, content, comment, attr) {
      const entry = new ZipEntry();
      entry.entryName = entryName;
      entry.comment = comment || "";

      if (typeof attr === 'object' && attr instanceof fs.Stats) {
        entry.header.time = attr.mtime;
      }

      let fileattr = entry.isDirectory ? 0x10 : 0;

      if (!isWindows) {
        let unixAttr = entry.isDirectory ? 0x4000 : 0x8000;
        
        if (typeof attr === 'object') {
          unixAttr |= (0xfff & attr.mode);
        } else if (typeof attr === 'number') {
          unixAttr |= (0xfff & attr);
        } else {
          unixAttr |= entry.isDirectory ? 0o755 : 0o644;
        }

        fileattr = (fileattr | (unixAttr << 16)) >>> 0;
      }

      entry.attr = fileattr;
      entry.setData(content);
      zipFile.setEntry(entry);
    },

    getEntries() {
      return zipFile ? zipFile.entries : [];
    },

    getEntry(name) {
      return getEntry(name);
    },

    getEntryCount() {
      return zipFile.getEntryCount();
    },

    forEach(callback) {
      return zipFile.forEach(callback);
    },

    extractEntryTo(entry, targetPath, maintainEntryPath = true, overwrite = false, outFileName) {
      const zipEntry = getEntry(entry);
      if (!zipEntry) {
        throw new Error(Utils.Errors.NO_ENTRY);
      }

      const entryName = zipEntry.entryName;
      const outputPath = sanitize(targetPath, outFileName && !zipEntry.isDirectory ? outFileName : (maintainEntryPath ? entryName : path.basename(entryName)));

      if (zipEntry.isDirectory) {
        path.resolve(outputPath, "..");
        zipFile.getEntryChildren(zipEntry).forEach(child => {
          if (!child.isDirectory) {
            const content = child.getData();
            if (!content) throw new Error(Utils.Errors.CANT_EXTRACT_FILE);
            const childPath = sanitize(targetPath, maintainEntryPath ? child.entryName : path.basename(child.entryName));
            Utils.writeFileTo(childPath, content, overwrite);
          }
        });

        return true;
      }

      const content = zipEntry.getData();
      if (!content) throw new Error(Utils.Errors.CANT_EXTRACT_FILE);

      if (fs.existsSync(outputPath) && !overwrite) {
        throw new Error(Utils.Errors.CANT_OVERRIDE);
      }
      Utils.writeFileTo(outputPath, content, overwrite);
      return true;
    },

    test(pass) {
      if (!zipFile) return false;

      for (const entryName in zipFile.entries) {
        const entry = zipFile.entries[entryName];
        if (entry.isDirectory) continue;

        const content = entry.getData(pass);
        if (!content) return false;
      }
      return true;
    },

    extractAllTo(targetPath, overwrite = false, pass) {
      if (!zipFile) {
        throw new Error(Utils.Errors.NO_ZIP);
      }

      zipFile.entries.forEach(entry => {
        const entryPath = sanitize(targetPath, entry.entryName);

        if (entry.isDirectory) {
          Utils.makeDir(entryPath);
          return;
        }

        const content = entry.getData(pass);
        if (!content) {
          throw new Error(Utils.Errors.CANT_EXTRACT_FILE);
        }

        Utils.writeFileTo(entryPath, content, overwrite);
        try {
          fs.utimesSync(entryPath, entry.header.time, entry.header.time);
        } catch {
          throw new Error(Utils.Errors.CANT_EXTRACT_FILE);
        }
      });
    },

    extractAllToAsync(targetPath, overwrite = false, callback = () => {}) {
      if (!zipFile) {
        callback(new Error(Utils.Errors.NO_ZIP));
        return;
      }

      let fileCount = zipFile.entries.length;

      zipFile.entries.forEach(entry => {
        if (fileCount <= 0) return;

        const entryName = path.normalize(entry.entryName);
        if (entry.isDirectory) {
          Utils.makeDir(sanitize(targetPath, entryName));
          if (--fileCount === 0) callback(undefined);
          return;
        }

        entry.getDataAsync((content, error) => {
          if (fileCount <= 0) return;

          if (error) {
            callback(new Error(error));
            return;
          }
          
          if (!content) {
            fileCount = 0;
            callback(new Error(Utils.Errors.CANT_EXTRACT_FILE));
            return;
          }

          Utils.writeFileToAsync(sanitize(targetPath, entryName), content, overwrite, success => {
            try {
              fs.utimesSync(path.resolve(targetPath, entryName), entry.header.time, entry.header.time);
            } catch {
              callback(new Error('Unable to set utimes'));
            }

            if (fileCount <= 0) return;
            if (!success) {
              fileCount = 0;
              callback(new Error('Unable to write'));
              return;
            }
            if (--fileCount === 0) callback(undefined);
          });
        });
      });
    },

    writeZip(targetFileName = filename, callback) {
      if (!targetFileName) return;

      const zipData = zipFile.compressToBuffer();
      if (zipData) {
        const success = Utils.writeFileTo(targetFileName, zipData, true);
        if (typeof callback === 'function') callback(success ? null : new Error("failed"), "");
      }
    },

    toBuffer(onSuccess, onFail, onItemStart, onItemEnd) {
      this.valueOf = 2;
      if (typeof onSuccess === "function") {
        zipFile.toAsyncBuffer(onSuccess, onFail, onItemStart, onItemEnd);
        return null;
      }
      return zipFile.compressToBuffer();
    }
  };
};
