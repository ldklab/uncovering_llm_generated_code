const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const del = require('./del');
const writeJSON = utils.writeJSON;

const cache = {
  load(docId, cacheDir) {
    const me = this;
    me._visited = {};
    me._persisted = {};
    me._pathToFile = cacheDir ? path.resolve(cacheDir, docId) : path.resolve(__dirname, '../.cache/', docId);
    if (fs.existsSync(me._pathToFile)) {
      me._persisted = utils.tryParse(me._pathToFile, {});
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
    const me = this;
    const obj = {};
    const keys = Object.keys(me._visited);

    if (keys.length === 0) {
      return;
    }

    keys.forEach(key => {
      obj[key] = me._persisted[key];
    });

    me._visited = {};
    me._persisted = obj;
  },

  save(noPrune = false) {
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
