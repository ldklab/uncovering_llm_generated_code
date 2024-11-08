const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const del = require('./del');
const writeJSON = utils.writeJSON;

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
    const dir = path.dirname(pathToFile);
    const fName = path.basename(pathToFile);
    this.load(fName, dir);
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
    const keys = Object.keys(this._visited);
    if (keys.length === 0) return;

    const obj = {};
    keys.forEach(key => {
      obj[key] = this._persisted[key];
    });

    this._visited = {};
    this._persisted = obj;
  },

  save(noPrune) {
    !noPrune && this._prune();
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
  load(docId, cacheDir) {
    return this.create(docId, cacheDir);
  },

  create(docId, cacheDir) {
    const obj = Object.create(cache);
    obj.load(docId, cacheDir);
    return obj;
  },

  createFromFile(filePath) {
    const obj = Object.create(cache);
    obj.loadFile(filePath);
    return obj;
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
