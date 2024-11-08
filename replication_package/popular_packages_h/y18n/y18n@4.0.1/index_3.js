const fs = require('fs');
const path = require('path');
const util = require('util');

class Y18N {
  constructor(opts = {}) {
    this.directory = opts.directory || './locales';
    this.updateFiles = typeof opts.updateFiles === 'boolean' ? opts.updateFiles : true;
    this.locale = opts.locale || 'en';
    this.fallbackToLanguage = typeof opts.fallbackToLanguage === 'boolean' ? opts.fallbackToLanguage : true;

    this.cache = Object.create(null);
    this.writeQueue = [];
  }

  __(...args) {
    if (typeof args[0] !== 'string') {
      return this._taggedLiteral(...args);
    }
    
    let str = args.shift();
    let cb = typeof args[args.length - 1] === 'function' ? args.pop() : () => {};

    if (!this.cache[this.locale]) this._readLocaleFile();

    if (!this.cache[this.locale][str] && this.updateFiles) {
      this.cache[this.locale][str] = str;
      this._enqueueWrite([this.directory, this.locale, cb]);
    } else {
      cb();
    }

    return util.format(this.cache[this.locale][str] || str, ...args);
  }

  _taggedLiteral(parts, ...args) {
    let str = '';
    parts.forEach((part, i) => {
      str += part + (typeof args[i] !== 'undefined' ? '%s' : '');
    });
    return this.__(str, ...args);
  }

  _enqueueWrite(work) {
    this.writeQueue.push(work);
    if (this.writeQueue.length === 1) this._processWriteQueue();
  }

  _processWriteQueue() {
    const [directory, locale, cb] = this.writeQueue[0];
    const languageFile = this._resolveLocaleFile(directory, locale);
    const serializedLocale = JSON.stringify(this.cache[locale], null, 2);

    fs.writeFile(languageFile, serializedLocale, 'utf-8', (err) => {
      this.writeQueue.shift();
      if (this.writeQueue.length > 0) this._processWriteQueue();
      cb(err);
    });
  }

  _readLocaleFile() {
    const languageFile = this._resolveLocaleFile(this.directory, this.locale);

    try {
      this.cache[this.locale] = JSON.parse(fs.readFileSync(languageFile, 'utf-8'));
    } catch (err) {
      if (err instanceof SyntaxError) err.message = `syntax error in ${languageFile}`;
      if (err.code === 'ENOENT') this.cache[this.locale] = {};
      else throw err;
    }
  }

  _resolveLocaleFile(dir, loc) {
    let file = path.resolve(dir, `${loc}.json`);
    if (this.fallbackToLanguage && !this._fileExistsSync(file) && loc.lastIndexOf('_') > -1) {
      const languageFile = path.resolve(dir, `${loc.split('_')[0]}.json`);
      if (this._fileExistsSync(languageFile)) file = languageFile;
    }
    return file;
  }

  _fileExistsSync(file) {
    try {
      return fs.statSync(file).isFile();
    } catch {
      return false;
    }
  }

  __n(singular, plural, quantity, ...args) {
    let cb = typeof args[args.length - 1] === 'function' ? args.pop() : () => {};

    if (!this.cache[this.locale]) this._readLocaleFile();

    let str = quantity === 1 ? singular : plural;
    if (this.cache[this.locale][singular]) {
      str = this.cache[this.locale][singular][quantity === 1 ? 'one' : 'other'];
    }

    if (!this.cache[this.locale][singular] && this.updateFiles) {
      this.cache[this.locale][singular] = { one: singular, other: plural };
      this._enqueueWrite([this.directory, this.locale, cb]);
    } else {
      cb();
    }

    const values = (str.includes('%d') ? [str, quantity] : [str]);
    return util.format(...values.concat(args));
  }

  setLocale(locale) {
    this.locale = locale;
  }

  getLocale() {
    return this.locale;
  }

  updateLocale(obj) {
    if (!this.cache[this.locale]) this._readLocaleFile();
    for (const [key, value] of Object.entries(obj)) {
      this.cache[this.locale][key] = value;
    }
  }
}

module.exports = (opts) => {
  const y18n = new Y18N(opts);
  Object.keys(y18n).forEach((key) => {
    if (typeof y18n[key] === 'function') y18n[key] = y18n[key].bind(y18n);
  });
  return y18n;
};
