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
    const translation = this._getTranslation(str, this.locale);
    return this._formatString(translation, args);
  }

  __n(singular, plural, count, ...args) {
    const message = count === 1 ? singular : plural;
    const translation = this._getTranslation(message, this.locale);
    return this._formatString(translation.replace('%d', count), args);
  }

  setLocale(locale) {
    this.locale = locale;
  }

  getLocale() {
    return this.locale;
  }

  updateLocale(updates) {
    const filePath = path.resolve(this.directory, `${this.locale}.json`);
    let currentData = {};

    if (fs.existsSync(filePath)) {
      currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    Object.assign(currentData, updates);
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
  }

  _getTranslation(str, locale) {
    const localePath = path.resolve(this.directory, `${locale}.json`);
    const fallbackLocalePath = path.resolve(this.directory, `${locale.split('_')[0]}.json`);
    
    let translations = {};
    if (fs.existsSync(localePath)) {
      translations = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
    } else if (this.fallbackToLanguage && fs.existsSync(fallbackLocalePath)) {
      translations = JSON.parse(fs.readFileSync(fallbackLocalePath, 'utf-8'));
    }

    if (!translations.hasOwnProperty(str)) {
      if (this.updateFiles) {
        translations[str] = str;
        fs.writeFileSync(localePath, JSON.stringify(translations, null, 2));
      }
      return str;
    }

    return translations[str];
  }

  _formatString(template, args) {
    return template.replace(/%s/g, () => args.shift());
  }
}

module.exports = (config) => new Y18n(config);

// Example usage:
const y18nInstance = require('./y18n')({ locale: 'en' });
console.log(y18nInstance.__('my awesome string %s', 'foo'));
console.log(y18nInstance.__n('one fish %s', '%d fishes %s', 2, 'foo'));
