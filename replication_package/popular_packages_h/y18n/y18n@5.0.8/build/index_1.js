'use strict';

const fs = require('fs');
const util = require('util');
const path = require('path');

let shim;
class Y18N {
    constructor(opts = {}) {
        this.directory = opts.directory || './locales';
        this.updateFiles = opts.updateFiles !== undefined ? opts.updateFiles : true;
        this.locale = opts.locale || 'en';
        this.fallbackToLanguage = opts.fallbackToLanguage !== undefined ? opts.fallbackToLanguage : true;
        this.cache = Object.create(null);
        this.writeQueue = [];
    }

    __(...args) {
        if (typeof args[0] !== 'string') return this._taggedLiteral(args[0], ...args);

        const str = args.shift();
        let cb = typeof args[args.length - 1] === 'function' ? args.pop() : () => {};

        if (!this.cache[this.locale]) this._readLocaleFile();

        if (!this.cache[this.locale][str] && this.updateFiles) {
            this.cache[this.locale][str] = str;
            this._enqueueWrite({ directory: this.directory, locale: this.locale, cb });
        } else {
            cb();
        }

        return shim.format(this.cache[this.locale][str] || str, ...args);
    }

    __n() {
        const args = Array.from(arguments);
        const singular = args.shift();
        const plural = args.shift();
        const quantity = args.shift();
        let cb = typeof args[args.length - 1] === 'function' ? args.pop() : () => {};

        if (!this.cache[this.locale]) this._readLocaleFile();

        let str = this.cache[this.locale][singular]?.[quantity === 1 ? 'one' : 'other'] ?? (quantity === 1 ? singular : plural);

        if (!this.cache[this.locale][singular] && this.updateFiles) {
            this.cache[this.locale][singular] = { one: singular, other: plural };
            this._enqueueWrite({ directory: this.directory, locale: this.locale, cb });
        } else {
            cb();
        }

        return shim.format(str, ~str.indexOf('%d') ? [quantity, ...args] : args);
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

    _taggedLiteral(parts, ...args) {
        let str = '';
        parts.forEach((part, i) => {
            str += part + (args[i + 1] !== undefined ? '%s' : '');
        });
        return this.__(str, ...args.slice(1));
    }

    _enqueueWrite(work) {
        this.writeQueue.push(work);
        if (this.writeQueue.length === 1) this._processWriteQueue();
    }

    _processWriteQueue() {
        const { directory, locale, cb } = this.writeQueue[0];
        const languageFile = this._resolveLocaleFile(directory, locale);
        const serializedLocale = JSON.stringify(this.cache[locale], null, 2);

        shim.fs.writeFile(languageFile, serializedLocale, 'utf-8', (err) => {
            this.writeQueue.shift();
            if (this.writeQueue.length > 0) this._processWriteQueue();
            cb(err);
        });
    }

    _readLocaleFile() {
        const languageFile = this._resolveLocaleFile(this.directory, this.locale);
        let localeLookup = {};

        try {
            if (shim.fs.readFileSync) {
                localeLookup = JSON.parse(shim.fs.readFileSync(languageFile, 'utf-8'));
            }
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }
        this.cache[this.locale] = localeLookup;
    }

    _resolveLocaleFile(directory, locale) {
        let file = shim.resolve(directory, `${locale}.json`);
        if (this.fallbackToLanguage && !this._fileExistsSync(file) && locale.includes('_')) {
            const languageFile = shim.resolve(directory, `${locale.split('_')[0]}.json`);
            if (this._fileExistsSync(languageFile)) file = languageFile;
        }
        return file;
    }

    _fileExistsSync(file) {
        return shim.exists(file);
    }
}

function y18n$1(opts, _shim) {
    shim = _shim;
    const y18n = new Y18N(opts);
    return {
        __: y18n.__.bind(y18n),
        __n: y18n.__n.bind(y18n),
        setLocale: y18n.setLocale.bind(y18n),
        getLocale: y18n.getLocale.bind(y18n),
        updateLocale: y18n.updateLocale.bind(y18n),
        locale: y18n.locale
    };
}

const nodePlatformShim = {
    fs: {
        readFileSync: fs.readFileSync,
        writeFile: fs.writeFile
    },
    format: util.format,
    resolve: path.resolve,
    exists: (file) => {
        try {
            return fs.statSync(file).isFile();
        } catch {
            return false;
        }
    }
};

const y18n = (opts) => y18n$1(opts, nodePlatformShim);

module.exports = y18n;
