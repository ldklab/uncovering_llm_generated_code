const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const flatCache = require('flat-cache');

module.exports = {
  createFromFile: function (filePath, useChecksum) {
    const fname = path.basename(filePath);
    const dir = path.dirname(filePath);
    return this.create(fname, dir, useChecksum);
  },

  create: function (cacheId, _path, useChecksum) {
    const cache = flatCache.load(cacheId, _path);
    let normalizedEntries = {};

    const removeNotFoundFiles = () => {
      cache.keys().forEach(fPath => {
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

      getHash: buffer => crypto.createHash('md5').update(buffer).digest('hex'),

      hasFileChanged(file) {
        return this.getFileDescriptor(file).changed;
      },

      analyzeFiles(files = []) {
        let me = this;
        let res = { changedFiles: [], notFoundFiles: [], notChangedFiles: [] };

        me.normalizeEntries(files).forEach(entry => {
          if (entry.changed) res.changedFiles.push(entry.key);
          else if (entry.notFound) res.notFoundFiles.push(entry.key);
          else res.notChangedFiles.push(entry.key);
        });

        return res;
      },

      getFileDescriptor(file) {
        let fstat;
        try {
          fstat = fs.statSync(file);
        } catch (ex) {
          this.removeEntry(file);
          return { key: file, notFound: true, err: ex };
        }

        return useChecksum ? 
          this._getFileDescriptorUsingChecksum(file) :
          this._getFileDescriptorUsingMtimeAndSize(file, fstat);
      },

      _getFileDescriptorUsingMtimeAndSize(file, fstat) {
        let meta = cache.getKey(file);
        let cSize = fstat.size;
        let cTime = fstat.mtime.getTime();
        let isDifferent = !meta || cSize !== meta.size || cTime !== meta.mtime;

        meta = meta || { size: cSize, mtime: cTime };
        normalizedEntries[file] = { key: file, changed: isDifferent, meta };
        return normalizedEntries[file];
      },

      _getFileDescriptorUsingChecksum(file) {
        let meta = cache.getKey(file);
        let contentBuffer = '';
        try {
          contentBuffer = fs.readFileSync(file);
        } catch {}

        const hash = this.getHash(contentBuffer);
        const isDifferent = !meta || hash !== meta.hash;

        meta = meta || { hash };
        normalizedEntries[file] = { key: file, changed: isDifferent, meta };
        return normalizedEntries[file];
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
        return Object.assign(cacheEntry.meta, { hash });
      },

      _getMetaForFileUsingMtimeAndSize(cacheEntry) {
        const stat = fs.statSync(cacheEntry.key);
        return Object.assign(cacheEntry.meta, {
          size: stat.size,
          mtime: stat.mtime.getTime(),
        });
      },

      reconcile(noPrune = true) {
        removeNotFoundFiles();
        const entries = normalizedEntries;
        for (const entryName in entries) {
          const cacheEntry = entries[entryName];
          try {
            const meta = useChecksum 
              ? this._getMetaForFileUsingCheckSum(cacheEntry)
              : this._getMetaForFileUsingMtimeAndSize(cacheEntry);
            cache.setKey(entryName, meta);
          } catch (err) {
            if (err.code !== 'ENOENT') throw err;
          }
        }
        cache.save(noPrune);
      },
    };
  },
};
