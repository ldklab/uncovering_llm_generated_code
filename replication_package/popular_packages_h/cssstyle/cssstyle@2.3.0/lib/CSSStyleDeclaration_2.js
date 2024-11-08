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

  setProperty(name, value, priority = null) {
    if (value == null || value === '') {
      this.removeProperty(name);
      return;
    }

    const isCustomProperty = name.startsWith('--');
    if (isCustomProperty) {
      this._setProperty(name, value, priority);
      return;
    }

    const lowercaseName = name.toLowerCase();
    if (!allProperties.has(lowercaseName) && !allExtraProperties.has(lowercaseName)) {
      return;
    }

    this[lowercaseName] = value;
    this._importants[lowercaseName] = priority;
  }

  _setProperty(name, value, priority) {
    if (value == null || value === '') {
      this.removeProperty(name);
      return;
    }

    if (!this._values[name]) {
      this[this._length++] = name;
    }

    this._values[name] = value;
    this._importants[name] = priority;
    this._onChange(this.cssText);
  }

  removeProperty(name) {
    if (!this._values.hasOwnProperty(name)) {
      return '';
    }

    const prevValue = this._values[name];
    delete this._values[name];
    delete this._importants[name];
   
    const index = Array.prototype.indexOf.call(this, name);
    if (index >= 0) {
      Array.prototype.splice.call(this, index, 1);
    }

    this._onChange(this.cssText);
    return prevValue;
  }

  getPropertyPriority(name) {
    return this._importants[name] || '';
  }

  item(index) {
    index = parseInt(index, 10);
    return index >= 0 && index < this._length ? this[index] : '';
  }

  get cssText() {
    return Array.from({ length: this._length }, (_, i) => {
      const name = this[i];
      const value = this.getPropertyValue(name);
      const priority = this.getPropertyPriority(name);
      return `${name}: ${value}${priority ? ' !' + priority : ''};`;
    }).join(' ');
  }

  set cssText(value) {
    try {
      const dummyRule = CSSOM.parse(`#bogus{${value}}`).cssRules[0].style;
      this._values = {};
      Array.prototype.splice.call(this, 0, this._length);
      this._importants = {};

      for (let i = 0; i < dummyRule.length; i++) {
        const name = dummyRule[i];
        this.setProperty(name, dummyRule.getPropertyValue(name), dummyRule.getPropertyPriority(name));
      }
    } catch {
      return;
    }

    this._onChange(this.cssText);
  }

  get parentRule() {
    return null;
  }

  get length() {
    return this._length;
  }

  set length(value) {
    for (let i = value; i < this._length; i++) {
      delete this[i];
    }
    this._length = value;
  }
}

require('./properties')(CSSStyleDeclaration.prototype);

[allProperties, allExtraProperties].forEach(properties => {
  properties.forEach(property => {
    if (!implementedProperties.has(property)) {
      const descriptor = getBasicPropertyDescriptor(property);
      Object.defineProperty(CSSStyleDeclaration.prototype, property, descriptor);
      Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), descriptor);
    }
  });
});

module.exports = CSSStyleDeclaration;
