'use strict';

const fs = require('fs');
const util = require('util');
const path = require('path');

class Y18N {
    constructor(opts = {}) {
        this.directory = opts.directory || './locales';
        this.updateFiles = opts.updateFiles ?? true;
        this.locale = opts.locale || 'en';
        this.fallbackToLanguage = opts.fallbackToLanguage ?? true;
        this.cache = Object.create(null);
        this.writeQueue = [];
    }

    __(...args) {
        let str = args.shift();
        let cb = typeof args[args.length - 1] === 'function' ? args.pop() : () => {};

        if (!this.cache[this.locale]) this._readLocaleFile();

        if (!this.cache[this.locale][str] && this.updateFiles) {
            this.cache[this.locale][str] = str;
            this._enqueueWrite({
                directory: this.directory,
                locale: this.locale,
                cb
            });
        } else {
            cb();
        }

        return util.format(this.cache[this.locale][str] || str, ...args);
    }

    __n(singular, plural, quantity, ...args) {
        let cb = typeof args[args.length - 1] === 'function' ? args.pop() : () => {};

        if (!this.cache[this.locale]) this._readLocaleFile();

        let str = quantity === 1 ? singular : plural;

        if (this.cache[this.locale][singular]) {
            let entry = this.cache[this.locale][singular];
            str = entry[quantity === 1 ? 'one' : 'other'];
        }

        if (!this.cache[this.locale][singular] && this.updateFiles) {
            this.cache[this.locale][singular] = { one: singular, other: plural };
            this._enqueueWrite({ directory: this.directory, locale: this.locale, cb });
        } else {
            cb();
        }

        let formattedStr = util.format(str, ...args);
        return ~str.indexOf('%d') ? util.format(formattedStr, quantity) : formattedStr;
    }

    setLocale(locale) {
        this.locale = locale;
    }

    getLocale() {
        return this.locale;
    }

    updateLocale(obj) {
        if (!this.cache[this.locale]) this._readLocaleFile();
        Object.assign(this.cache[this.locale], obj);
    }

    _enqueueWrite(work) {
        this.writeQueue.push(work);
        if (this.writeQueue.length === 1) this._processWriteQueue();
    }

    _processWriteQueue() {
        let { directory, locale, cb } = this.writeQueue[0];
        let languageFile = this._resolveLocaleFile(directory, locale);
        let serializedLocale = JSON.stringify(this.cache[locale], null, 2);

        fs.writeFile(languageFile, serializedLocale, 'utf-8', (err) => {
            this.writeQueue.shift();
            if (this.writeQueue.length > 0) this._processWriteQueue();
            cb(err);
        });
    }

    _readLocaleFile() {
        let localeLookup = {};
        let languageFile = this._resolveLocaleFile(this.directory, this.locale);

        try {
            localeLookup = JSON.parse(fs.readFileSync(languageFile, 'utf-8'));
        } catch (err) {
            if (err instanceof SyntaxError) {
                err.message = 'syntax error in ' + languageFile;
            }
            if (err.code === 'ENOENT') {
                localeLookup = {};
            } else {
                throw err;
            }
        }
        this.cache[this.locale] = localeLookup;
    }

    _resolveLocaleFile(directory, locale) {
        let file = path.resolve(directory, `${locale}.json`);
        if (this.fallbackToLanguage && !this._fileExistsSync(file) && locale.includes('_')) {
            let languageFile = path.resolve(directory, `${locale.split('_')[0]}.json`);
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
}

const y18n = (opts) => {
    return new Y18N(opts);
};

module.exports = y18n;
