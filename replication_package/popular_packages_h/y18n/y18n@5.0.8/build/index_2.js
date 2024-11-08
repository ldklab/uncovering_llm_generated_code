'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

let platformShim;

class Translator {
    constructor(options = {}) {
        this.directory = options.directory || './locales';
        this.updateFiles = options.updateFiles !== undefined ? options.updateFiles : true;
        this.locale = options.locale || 'en';
        this.fallbackToLanguage = options.fallbackToLanguage !== undefined ? options.fallbackToLanguage : true;
        this.cache = {};
        this.writeQueue = [];
    }

    __(...args) {
        const str = args.shift();
        let callback = typeof args[args.length - 1] === 'function' ? args.pop() : () => {};

        if (!this.cache[this.locale]) this._loadLocaleFile();

        if (!this.cache[this.locale][str] && this.updateFiles) {
            this.cache[this.locale][str] = str;
            this._queueFileWrite({ directory: this.directory, locale: this.locale, callback });
        } else {
            callback();
        }

        return platformShim.format(this.cache[this.locale][str] || str, ...args);
    }

    __n(singular, plural, quantity, ...args) {
        let callback = typeof args[args.length - 1] === 'function' ? args.pop() : () => {};
        if (!this.cache[this.locale]) this._loadLocaleFile();

        let str = quantity === 1 ? singular : plural;
        if (this.cache[this.locale][singular]) {
            const entry = this.cache[this.locale][singular];
            str = entry[quantity === 1 ? 'one' : 'other'];
        }

        if (!this.cache[this.locale][singular] && this.updateFiles) {
            this.cache[this.locale][singular] = { one: singular, other: plural };
            this._queueFileWrite({ directory: this.directory, locale: this.locale, callback });
        } else {
            callback();
        }

        return platformShim.format(str.includes('%d') ? `${str} ${quantity}` : str, ...args);
    }

    setLocale(locale) {
        this.locale = locale;
    }

    getLocale() {
        return this.locale;
    }

    updateLocale(updates) {
        if (!this.cache[this.locale]) this._loadLocaleFile();
        Object.assign(this.cache[this.locale], updates);
    }

    _loadLocaleFile() {
        let localeData = {};
        const filePath = this._getLocaleFilePath(this.directory, this.locale);

        try {
            if (platformShim.fs.readFileSync) {
                localeData = JSON.parse(platformShim.fs.readFileSync(filePath, 'utf-8'));
            }
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }
        
        this.cache[this.locale] = localeData;
    }

    _getLocaleFilePath(directory, locale) {
        let file = platformShim.resolve(directory, `${locale}.json`);
        if (this.fallbackToLanguage && !this._fileExists(file) && locale.includes('_')) {
            const langFile = platformShim.resolve(directory, `${locale.split('_')[0]}.json`);
            if (this._fileExists(langFile)) file = langFile;
        }
        return file;
    }

    _fileExists(filePath) {
        return platformShim.fileExists(filePath);
    }

    _queueFileWrite(task) {
        this.writeQueue.push(task);
        if (this.writeQueue.length === 1) this._processWriteQueue();
    }

    _processWriteQueue() {
        const { directory, locale, callback } = this.writeQueue[0];
        const filePath = this._getLocaleFilePath(directory, locale);
        const localeData = JSON.stringify(this.cache[locale], null, 2);

        platformShim.fs.writeFile(filePath, localeData, 'utf-8', (err) => {
            this.writeQueue.shift();
            if (this.writeQueue.length) this._processWriteQueue();
            callback(err);
        });
    }
}

function initializeTranslator(opts, shim) {
    platformShim = shim;
    const translator = new Translator(opts);
    return {
        __: translator.__.bind(translator),
        __n: translator.__n.bind(translator),
        setLocale: translator.setLocale.bind(translator),
        getLocale: translator.getLocale.bind(translator),
        updateLocale: translator.updateLocale.bind(translator),
        locale: translator.locale
    };
}

const nodeShim = {
    fs: {
        readFileSync: fs.readFileSync,
        writeFile: fs.writeFile
    },
    format: util.format,
    resolve: path.resolve,
    fileExists: (filename) => {
        try { return fs.statSync(filename).isFile(); } 
        catch { return false; }
    }
};

module.exports = (options) => initializeTranslator(options, nodeShim);
