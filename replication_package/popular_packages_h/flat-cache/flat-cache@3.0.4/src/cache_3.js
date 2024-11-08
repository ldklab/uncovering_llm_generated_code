const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const del = require('./del');
const { writeJSON } = utils;

const cache = {
  load(docId, cacheDir) {
    this._visited = {};
    this._persisted = {};
    this._pathToFile = cacheDir ? path.resolve(cacheDir, docId) : path.resolve(__dirname, '../.cache/', docId);

    if (fs.existsSync(this._pathToFile)) {
      this._persisted = utils.tryParse(this._pathToFile, {});
    }
  },

  loadFile(pathToFile) {
    this.load(path.basename(pathToFile), path.dirname(pathToFile));
  },

  all() {
    return this._persisted;
  },

  keys() {
    return Object.keys(this._persisted);
  },

  setKey(key, value) {
    this._visited[key] = true;
    this._persisted[key] = value;
  },

  removeKey(key) {
    delete this._visited[key];
    delete this._persisted[key];
  },

  getKey(key) {
    this._visited[key] = true;
    return this._persisted[key];
  },

  _prune() {
    const pruned = Object.keys(this._visited).reduce((acc, key) => {
      acc[key] = this._persisted[key];
      return acc;
    }, {});

    this._visited = {};
    this._persisted = pruned;
  },

  save(noPrune = false) {
    if (!noPrune) this._prune();
    writeJSON(this._pathToFile, this._persisted);
  },

  removeCacheFile() {
    return del(this._pathToFile);
  },

  destroy() {
    this._visited = {};
    this._persisted = {};
    this.removeCacheFile();
  },
};

module.exports = {
  load: function (docId, cacheDir) {
    return this.create(docId, cacheDir);
  },

  create(docId, cacheDir) {
    const instance = Object.create(cache);
    instance.load(docId, cacheDir);
    return instance;
  },

  createFromFile(filePath) {
    const instance = Object.create(cache);
    instance.loadFile(filePath);
    return instance;
  },

  clearCacheById(docId, cacheDir) {
    const filePath = cacheDir ? path.resolve(cacheDir, docId) : path.resolve(__dirname, '../.cache/', docId);
    return del(filePath);
  },

  clearAll(cacheDir) {
    const filePath = cacheDir ? path.resolve(cacheDir) : path.resolve(__dirname, '../.cache/');
    return del(filePath);
  },
};
