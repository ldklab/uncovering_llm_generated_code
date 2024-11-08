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
    let translation = this._translate(str, this.locale);
    return this._formatString(translation, args);
  }

  __n(singular, plural, count, ...args) {
    const str = count === 1 ? singular : plural;
    let translation = this._translate(str, this.locale);
    return this._formatString(translation.replace('%d', count), args);
  }

  setLocale(locale) {
    this.locale = locale;
  }

  getLocale() {
    return this.locale;
  }

  updateLocale(obj) {
    const localeFile = path.resolve(this.directory, `${this.locale}.json`);
    let localeData = {};

    if (fs.existsSync(localeFile)) {
      localeData = JSON.parse(fs.readFileSync(localeFile, 'utf-8'));
    }

    Object.assign(localeData, obj);

    fs.writeFileSync(localeFile, JSON.stringify(localeData, null, 2));
  }

  _translate(str, locale) {
    const langFile = path.resolve(this.directory, `${locale}.json`);
    const fallbackFile = path.resolve(this.directory, `${locale.split('_')[0]}.json`);

    let translations = {};
    if (fs.existsSync(langFile)) {
      translations = JSON.parse(fs.readFileSync(langFile, 'utf-8'));
    } else if (this.fallbackToLanguage && fs.existsSync(fallbackFile)) {
      translations = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
    }

    if (!(str in translations)) {
      if (this.updateFiles) {
        translations[str] = str;
        fs.writeFileSync(langFile, JSON.stringify(translations, null, 2));
      }
      return str;
    }

    return translations[str];
  }

  _formatString(str, args) {
    return str.replace(/%s/g, () => args.shift());
  }
}

module.exports = (config) => new Y18n(config);

// Example usage
const y18nInstance = require('./y18n')({ locale: 'en' });
console.log(y18nInstance.__('my awesome string %s', 'foo'));
console.log(y18nInstance.__n('one fish %s', '%d fishes %s', 2, 'foo'));
