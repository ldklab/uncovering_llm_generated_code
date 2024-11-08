// localization.js

const fs = require('fs');
const path = require('path');

class Localization {
  constructor({ directory = './locales', locale = 'en', updateFiles = true, fallbackToLanguage = true } = {}) {
    this.dir = directory;
    this.currentLocale = locale;
    this.shouldUpdateFiles = updateFiles;
    this.fallback = fallbackToLanguage;
  }

  translate(str, ...params) {
    const translatedStr = this._getTranslation(str, this.currentLocale);
    return this._applyParams(translatedStr, params);
  }

  translatePlural(singular, plural, count, ...params) {
    const phrase = count === 1 ? singular : plural;
    let translation = this._getTranslation(phrase, this.currentLocale);
    translation = translation.replace('%d', count);
    return this._applyParams(translation, params);
  }

  updateLocaleData(updateObj) {
    const localePath = path.resolve(this.dir, `${this.currentLocale}.json`);
    let currentData = {};
    if (fs.existsSync(localePath)) {
      currentData = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
    }
    Object.assign(currentData, updateObj);
    fs.writeFileSync(localePath, JSON.stringify(currentData, null, 2));
  }

  setLocale(newLocale) {
    this.currentLocale = newLocale;
  }

  getLocale() {
    return this.currentLocale;
  }

  _getTranslation(key, locale) {
    const localeFilePath = path.join(this.dir, `${locale}.json`);
    const fallbackFilePath = path.join(this.dir, `${locale.split('_')[0]}.json`);
    let translations = {};

    if (fs.existsSync(localeFilePath)) {
      translations = JSON.parse(fs.readFileSync(localeFilePath, 'utf-8'));
    } else if (this.fallback && fs.existsSync(fallbackFilePath)) {
      translations = JSON.parse(fs.readFileSync(fallbackFilePath, 'utf-8'));
    }

    if (!(key in translations) && this.shouldUpdateFiles) {
      translations[key] = key;
      fs.writeFileSync(localeFilePath, JSON.stringify(translations, null, 2));
    }
    
    return translations[key] || key;
  }

  _applyParams(template, params) {
    return template.replace(/%s/g, () => params.shift());
  }
}

module.exports = (config) => new Localization(config);

// Example usage
const loc = require('./localization')({ locale: 'en' });
console.log(loc.translate('my awesome string %s', 'foo')); // Outputs: my awesome string foo
console.log(loc.translatePlural('one fish %s', '%d fishes %s', 2, 'foo')); // Outputs: 2 fishes foo
