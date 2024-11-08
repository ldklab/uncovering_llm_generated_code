const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const flatCache = require('flat-cache');

module.exports = {
  createFromFile(filePath, useChecksum) {
    const fname = path.basename(filePath);
    const dir = path.dirname(filePath);
    return this.create(fname, dir, useChecksum);
  },

  create(cacheId, _path, useChecksum) {
    const cache = flatCache.load(cacheId, _path);
    let normalizedEntries = {};

    function removeNotFoundFiles() {
      const cachedEntries = cache.keys();
      cachedEntries.forEach(function remover(fPath) {
        try {
          fs.statSync(fPath);
        } catch (err) {
          if (err.code === 'ENOENT') {
            cache.removeKey(fPath);
          }
        }
      });
    }

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
        const res = {
          changedFiles: [],
          notFoundFiles: [],
          notChangedFiles: [],
        };

        this.normalizeEntries(files).forEach((entry) => {
          if (entry.changed) res.changedFiles.push(entry.key);
          else if (entry.notFound) res.notFoundFiles.push(entry.key);
          else res.notChangedFiles.push(entry.key);
        });

        return res;
      },

      getFileDescriptor(file) {
        try {
          const fstat = fs.statSync(file);
          return useChecksum ? this._getFileDescriptorUsingChecksum(file) : this._getFileDescriptorUsingMtimeAndSize(file, fstat);
        } catch (ex) {
          this.removeEntry(file);
          return { key: file, notFound: true, err: ex };
        }
      },

      _getFileDescriptorUsingMtimeAndSize(file, fstat) {
        const meta = cache.getKey(file) || {};
        const cSize = fstat.size;
        const cTime = fstat.mtime.getTime();
        
        const changed = !meta.mtime || cTime !== meta.mtime || cSize !== meta.size;
        const entry = { key: file, changed, meta: { size: cSize, mtime: cTime } };
        normalizedEntries[file] = entry;
        return entry;
      },

      _getFileDescriptorUsingChecksum(file) {
        let contentBuffer = '';
        try {
          contentBuffer = fs.readFileSync(file);
        } catch {}
        
        const hash = this.getHash(contentBuffer);
        const meta = cache.getKey(file) || {};
        const changed = !meta.hash || hash !== meta.hash;
        const entry = { key: file, changed, meta: { hash: hash } };
        normalizedEntries[file] = entry;
        return entry;
      },

      getUpdatedFiles(files = []) {
        return this.normalizeEntries(files)
          .filter(entry => entry.changed)
          .map(entry => entry.key);
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
        return { ...cacheEntry.meta, hash };
      },

      _getMetaForFileUsingMtimeAndSize(cacheEntry) {
        const stat = fs.statSync(cacheEntry.key);
        return { ...cacheEntry.meta, size: stat.size, mtime: stat.mtime.getTime() };
      },

      reconcile(noPrune = true) {
        removeNotFoundFiles();
        Object.entries(normalizedEntries).forEach(([entryName, cacheEntry]) => {
          try {
            const meta = useChecksum
              ? this._getMetaForFileUsingCheckSum(cacheEntry)
              : this._getMetaForFileUsingMtimeAndSize(cacheEntry);
            cache.setKey(entryName, meta);
          } catch (err) {
            if (err.code !== 'ENOENT') throw err;
          }
        });
        cache.save(noPrune);
      },
    };
  },
};
