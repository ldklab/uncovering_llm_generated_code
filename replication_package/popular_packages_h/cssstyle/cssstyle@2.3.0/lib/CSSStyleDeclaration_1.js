'use strict';
const CSSOM = require('cssom');
const allProperties = require('./allProperties');
const allExtraProperties = require('./allExtraProperties');
const implementedProperties = require('./implementedProperties');
const { dashedToCamelCase } = require('./parsers');
const getBasicPropertyDescriptor = require('./utils/getBasicPropertyDescriptor');

class CSSStyleDeclaration {
  constructor(onChangeCallback) {
    this._values = {};
    this._importants = {};
    this._length = 0;
    this._onChange = onChangeCallback || (() => {});
  }

  getPropertyValue(name) {
    return this._values.hasOwnProperty(name) ? this._values[name].toString() : '';
  }

  setProperty(name, value, priority) {
    if (value === undefined) return;

    if (value === null || value === '') {
      this.removeProperty(name);
      return;
    }

    const isCustomProperty = name.startsWith('--');
    if (isCustomProperty) {
      this._setProperty(name, value, priority);
      return;
    }

    const lowercaseName = name.toLowerCase();
    if (!allProperties.has(lowercaseName) && !allExtraProperties.has(lowercaseName)) return;

    this[lowercaseName] = value;
    this._importants[lowercaseName] = priority;
  }

  _setProperty(name, value, priority) {
    if (value === undefined) return;

    if (value === null || value === '') {
      this.removeProperty(name);
      return;
    }

    if (this._values[name]) {
      const index = Array.prototype.indexOf.call(this, name);
      if (index < 0) {
        this[this._length] = name;
        this._length++;
      }
    } else {
      this[this._length] = name;
      this._length++;
    }

    this._values[name] = value;
    this._importants[name] = priority;
    this._onChange(this.cssText);
  }

  removeProperty(name) {
    if (!this._values.hasOwnProperty(name)) return '';

    const prevValue = this._values[name];
    delete this._values[name];
    delete this._importants[name];

    const index = Array.prototype.indexOf.call(this, name);
    if (index < 0) return prevValue;

    Array.prototype.splice.call(this, index, 1);
    this._onChange(this.cssText);
    return prevValue;
  }

  getPropertyPriority(name) {
    return this._importants[name] || '';
  }

  getPropertyCSSValue() { return; }

  getPropertyShorthand() { return; }

  isPropertyImplicit() { return; }

  item(index) {
    index = parseInt(index, 10);
    return (index < 0 || index >= this._length) ? '' : this[index];
  }

  get cssText() {
    const properties = [];
    for (let i = 0; i < this._length; i++) {
      const name = this[i];
      const value = this.getPropertyValue(name);
      let priority = this.getPropertyPriority(name);
      priority = (priority !== '') ? ' !' + priority : '';

      properties.push([name, ': ', value, priority, ';'].join(''));
    }
    return properties.join(' ');
  }

  set cssText(value) {
    this._values = {};
    Array.prototype.splice.call(this, 0, this._length);
    this._importants = {};

    try {
      const dummyRule = CSSOM.parse('#bogus{' + value + '}').cssRules[0].style;
      const ruleLength = dummyRule.length;
      
      for (let i = 0; i < ruleLength; ++i) {
        const name = dummyRule[i];
        this.setProperty(name, dummyRule.getPropertyValue(name), dummyRule.getPropertyPriority(name));
      }
      this._onChange(this.cssText);
    } catch (err) {
      // malformed css, do nothing
    }
  }

  get parentRule() { return null; }

  get length() { return this._length; }

  set length(value) {
    for (let i = value; i < this._length; i++) {
      delete this[i];
    }
    this._length = value;
  }
}

Object.defineProperties(CSSStyleDeclaration.prototype, {
  parentRule: { enumerable: true, configurable: true },
  length: { enumerable: true, configurable: true },
  cssText: { enumerable: true, configurable: true }
});

require('./properties')(CSSStyleDeclaration.prototype);

allProperties.forEach(property => {
  if (!implementedProperties.has(property)) {
    const declaration = getBasicPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
    Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
  }
});

allExtraProperties.forEach(property => {
  if (!implementedProperties.has(property)) {
    const declaration = getBasicPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
    Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
  }
});

exports.CSSStyleDeclaration = CSSStyleDeclaration;
