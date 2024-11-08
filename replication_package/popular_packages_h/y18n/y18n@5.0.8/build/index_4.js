'use strict';

const fs = require('fs');
const util = require('util');
const path = require('path');

let shim;

class Y18N {
    constructor(options = {}) {
        this.directory = options.directory || './locales';
        this.updateFiles = (typeof options.updateFiles === 'boolean') ? options.updateFiles : true;
        this.locale = options.locale || 'en';
        this.fallbackToLanguage = (typeof options.fallbackToLanguage === 'boolean') ? options.fallbackToLanguage : true;
        this.cache = Object.create(null);
        this.writeQueue = [];
    }

    __(...args) {
        const str = (typeof args[0] === 'string') ? args.shift() : this._taggedLiteral(args[0], ...args);
        let callback = (typeof args[args.length - 1] === 'function') ? args.pop() : () => {};
        
        this._loadLocaleCache();

        if (!this.cache[this.locale][str] && this.updateFiles) {
            this.cache[this.locale][str] = str;
            this._enqueueWrite({ directory: this.directory, locale: this.locale, cb: callback });
        } else {
            callback();
        }

        return shim.format(this.cache[this.locale][str] || str, ...args);
    }

    __n(...args) {
        const [singular, plural, quantity, ...restArgs] = args;
        let callback = (typeof restArgs[restArgs.length - 1] === 'function') ? restArgs.pop() : () => {};

        this._loadLocaleCache();

        let str = (quantity === 1) ? singular : plural;
        if (this.cache[this.locale][singular]) {
            const entry = this.cache[this.locale][singular];
            str = (quantity === 1) ? entry.one : entry.other;
        } else if (this.updateFiles) {
            this.cache[this.locale][singular] = { one: singular, other: plural };
            this._enqueueWrite({ directory: this.directory, locale: this.locale, cb: callback });
        }
        
        const formattedStr = ~str.indexOf('%d') ? [str, quantity] : [str];
        return shim.format(...formattedStr, ...restArgs);
    }

    setLocale(locale) {
        this.locale = locale;
    }

    getLocale() {
        return this.locale;
    }

    updateLocale(updates) {
        this._loadLocaleCache();
        Object.assign(this.cache[this.locale], updates);
    }

    _taggedLiteral(parts, ...args) {
        const str = parts.reduce((acc, part, i) => {
            return `${acc}${part}${(typeof args[i] !== 'undefined') ? '%s' : ''}`;
        }, '');
        return this.__.apply(this, [str, ...args]);
    }

    _enqueueWrite(work) {
        this.writeQueue.push(work);
        if (this.writeQueue.length === 1) this._processWriteQueue();
    }

    _processWriteQueue() {
        const { directory, locale, cb } = this.writeQueue[0];
        const languageFile = this._resolveLocaleFile(directory, locale);
        const data = JSON.stringify(this.cache[locale], null, 2);

        shim.fs.writeFile(languageFile, data, 'utf-8', (err) => {
            this.writeQueue.shift();
            if (this.writeQueue.length > 0) this._processWriteQueue();
            cb(err);
        });
    }

    _loadLocaleCache() {
        if (!this.cache[this.locale]) {
            const localeFile = this._resolveLocaleFile(this.directory, this.locale);
            try {
                const data = shim.fs.readFileSync ? shim.fs.readFileSync(localeFile, 'utf-8') : '{}';
                this.cache[this.locale] = JSON.parse(data);
            } catch (err) {
                if (err.code === 'ENOENT') this.cache[this.locale] = {};
                else throw err;
            }
        }
    }

    _resolveLocaleFile(directory, locale) {
        let file = path.join(directory, `${locale}.json`);
        if (this.fallbackToLanguage && !shim.exists(file) && locale.includes('_')) {
            const fallbackFile = path.join(directory, `${locale.split('_')[0]}.json`);
            if (shim.exists(fallbackFile)) file = fallbackFile;
        }
        return file;
    }
}

function y18n(opts, platformShim = defaultShim) {
    shim = platformShim;
    const instance = new Y18N(opts);
    return {
        __: instance.__.bind(instance),
        __n: instance.__n.bind(instance),
        setLocale: instance.setLocale.bind(instance),
        getLocale: instance.getLocale.bind(instance),
        updateLocale: instance.updateLocale.bind(instance),
        locale: instance.locale
    };
}

const defaultShim = {
    fs: {
        readFileSync: fs.readFileSync,
        writeFile: fs.writeFile
    },
    format: util.format,
    exists: (file) => fs.existsSync(file)
};

module.exports = y18n;
