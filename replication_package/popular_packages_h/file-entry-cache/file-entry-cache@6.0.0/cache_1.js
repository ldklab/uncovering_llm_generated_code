const path = require('path');
const crypto = require('crypto');

module.exports = {
  createFromFile(filePath, useChecksum) {
    const fname = path.basename(filePath);
    const dir = path.dirname(filePath);
    return this.create(fname, dir, useChecksum);
  },

  create(cacheId, cachePath, useChecksum) {
    const fs = require('fs');
    const flatCache = require('flat-cache');
    const cache = flatCache.load(cacheId, cachePath);
    let normalizedEntries = {};

    const removeNotFoundFiles = () => {
      const cachedEntries = cache.keys();
      cachedEntries.forEach((fPath) => {
        try {
          fs.statSync(fPath);
        } catch (err) {
          if (err.code === 'ENOENT') {
            cache.removeKey(fPath);
          }
        }
      });
    };

    removeNotFoundFiles();

    return {
      cache,

      getHash(buffer) {
        return crypto.createHash('md5').update(buffer).digest('hex');
      },

      hasFileChanged(file) {
        return this.getFileDescriptor(file).changed;
      },

      analyzeFiles(files = []) {
        const result = {
          changedFiles: [],
          notFoundFiles: [],
          notChangedFiles: [],
        };

        this.normalizeEntries(files).forEach((entry) => {
          if (entry.changed) {
            result.changedFiles.push(entry.key);
          } else if (entry.notFound) {
            result.notFoundFiles.push(entry.key);
          } else {
            result.notChangedFiles.push(entry.key);
          }
        });

        return result;
      },

      getFileDescriptor(file) {
        let fstat;
        try {
          fstat = fs.statSync(file);
        } catch (ex) {
          this.removeEntry(file);
          return { key: file, notFound: true, err: ex };
        }

        return useChecksum ? this._getFileDescriptorUsingChecksum(file) : this._getFileDescriptorUsingMtimeAndSize(file, fstat);
      },

      _getFileDescriptorUsingMtimeAndSize(file, fstat) {
        const meta = cache.getKey(file) || { size: fstat.size, mtime: fstat.mtime.getTime() };
        const changed = meta.size !== fstat.size || meta.mtime !== fstat.mtime.getTime();
        normalizedEntries[file] = { key: file, changed: changed, meta: meta };
        return normalizedEntries[file];
      },

      _getFileDescriptorUsingChecksum(file) {
        const meta = cache.getKey(file) || {};
        const contentBuffer = fs.existsSync(file) ? fs.readFileSync(file) : Buffer.from('');
        const hash = this.getHash(contentBuffer);
        const changed = meta.hash !== hash;
        normalizedEntries[file] = { key: file, changed: changed, meta: { hash: hash } };
        return normalizedEntries[file];
      },

      getUpdatedFiles(files = []) {
        return this.normalizeEntries(files).filter(entry => entry.changed).map(entry => entry.key);
      },

      normalizeEntries(files = []) {
        return files.map(file => this.getFileDescriptor(file));
      },

      removeEntry(entryName) {
        delete normalizedEntries[entryName];
        cache.removeKey(entryName);
      },

      deleteCacheFile() {
        cache.removeCacheFile();
      },

      destroy() {
        normalizedEntries = {};
        cache.destroy();
      },

      _getMetaForFileUsingCheckSum(cacheEntry) {
        const contentBuffer = fs.readFileSync(cacheEntry.key);
        const hash = this.getHash(contentBuffer);
        return { ...cacheEntry.meta, hash: hash };
      },

      _getMetaForFileUsingMtimeAndSize(cacheEntry) {
        const stat = fs.statSync(cacheEntry.key);
        return { ...cacheEntry.meta, size: stat.size, mtime: stat.mtime.getTime() };
      },

      reconcile(noPrune = true) {
        removeNotFoundFiles();

        const entries = normalizedEntries;
        const keys = Object.keys(entries);

        if (!keys.length) return;

        keys.forEach((entryName) => {
          const cacheEntry = entries[entryName];

          try {
            const meta = useChecksum ? this._getMetaForFileUsingCheckSum(cacheEntry) : this._getMetaForFileUsingMtimeAndSize(cacheEntry);
            cache.setKey(entryName, meta);
          } catch (err) {
            if (err.code !== 'ENOENT') throw err;
          }
        });

        cache.save(noPrune);
      }
    };
  }
};
