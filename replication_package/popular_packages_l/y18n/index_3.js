// y18n.js

const fs = require('fs');
const path = require('path');

class Y18n {
  constructor(config = {}) {
    this.directory = config.directory || './locales';
    this.locale = config.locale || 'en';
    this.updateFiles = config.updateFiles !== undefined ? config.updateFiles : true;
    this.fallbackToLanguage = config.fallbackToLanguage !== undefined ? config.fallbackToLanguage : true;
  }

  __(str, ...args) {
    const translation = this._translate(str, this.locale);
    return this._formatString(translation, args);
  }

  __n(singular, plural, count, ...args) {
    const message = count === 1 ? singular : plural;
    const translation = this._translate(message, this.locale);
    const formattedTranslation = translation.replace('%d', count);
    return this._formatString(formattedTranslation, args);
  }

  setLocale(locale) {
    this.locale = locale;
  }

  getLocale() {
    return this.locale;
  }

  updateLocale(obj) {
    const filepath = path.resolve(this.directory, `${this.locale}.json`);
    let localeData = this._getLocaleData(filepath);

    Object.assign(localeData, obj);
    this._writeLocaleData(filepath, localeData);
  }

  _translate(str, locale) {
    const langPath = path.resolve(this.directory, `${locale}.json`);
    const fallbackPath = path.resolve(this.directory, `${locale.split('_')[0]}.json`);

    let translations = this._getLocaleData(langPath) || (this.fallbackToLanguage ? this._getLocaleData(fallbackPath) : {});

    if (!(str in translations)) {
      if (this.updateFiles) {
        translations[str] = str;
        this._writeLocaleData(langPath, translations);
      }
      return str;
    }

    return translations[str];
  }

  _formatString(str, args) {
    return str.replace(/%s/g, () => args.shift());
  }

  _getLocaleData(filepath) {
    return fs.existsSync(filepath) ? JSON.parse(fs.readFileSync(filepath, 'utf-8')) : {};
  }

  _writeLocaleData(filepath, data) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  }
}

module.exports = (config) => new Y18n(config);

// Example usage
const y18nInstance = require('./y18n')({ locale: 'en' });
console.log(y18nInstance.__('my awesome string %s', 'foo'));
console.log(y18nInstance.__n('one fish %s', '%d fishes %s', 2, 'foo'));
