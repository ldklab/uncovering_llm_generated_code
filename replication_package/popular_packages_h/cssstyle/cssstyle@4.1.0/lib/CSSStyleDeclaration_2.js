'use strict';

const CSSOM = require('rrweb-cssom');
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
    this._onChange = onChangeCallback;
    this._setInProgress = false;
  }

  getPropertyValue(name) {
    return this._values.hasOwnProperty(name) ? this._values[name].toString() : '';
  }

  setProperty(name, value, priority) {
    if (value === undefined || value === null || value === '') {
      this.removeProperty(name);
      return;
    }

    const isCustomProperty = name.startsWith('--');
    if (isCustomProperty) {
      this._setProperty(name, value, priority);
      return;
    }

    const lowercaseName = name.toLowerCase();
    if (allProperties.has(lowercaseName) || allExtraProperties.has(lowercaseName)) {
      this[lowercaseName] = value;
      this._importants[lowercaseName] = priority;
    }
  }

  _setProperty(name, value, priority) {
    if (value === undefined || value === null || value === '') {
      this.removeProperty(name);
      return;
    }

    let originalText;
    if (this._onChange) {
      originalText = this.cssText;
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

    if (this._onChange && this.cssText !== originalText && !this._setInProgress) {
      this._onChange(this.cssText);
    }
  }

  removeProperty(name) {
    if (!this._values.hasOwnProperty(name)) {
      return '';
    }

    const prevValue = this._values[name];
    delete this._values[name];
    delete this._importants[name];

    const index = Array.prototype.indexOf.call(this, name);
    if (index < 0) {
      return prevValue;
    }

    Array.prototype.splice.call(this, index, 1);

    if (this._onChange) {
      this._onChange(this.cssText);
    }
    return prevValue;
  }

  getPropertyPriority(name) {
    return this._importants[name] || '';
  }

  getPropertyCSSValue() {
    // To be implemented
  }

  getPropertyShorthand() {
    // To be implemented
  }

  isPropertyImplicit() {
    // To be implemented
  }

  item(index) {
    index = parseInt(index, 10);
    if (index < 0 || index >= this._length) {
      return '';
    }
    return this[index];
  }

  get cssText() {
    const properties = [];
    for (let i = 0; i < this._length; i++) {
      const name = this[i];
      const value = this.getPropertyValue(name);
      let priority = this.getPropertyPriority(name);
      if (priority) {
        priority = ` !${priority}`;
      }
      properties.push(`${name}: ${value}${priority};`);
    }
    return properties.join(' ');
  }

  set cssText(value) {
    this._values = {};
    Array.prototype.splice.call(this, 0, this._length);
    this._importants = {};

    try {
      const dummyRule = CSSOM.parse(`#bogus{${value}}`).cssRules[0].style;
      this._setInProgress = true;
      for (let i = 0; i < dummyRule.length; ++i) {
        const name = dummyRule[i];
        this.setProperty(
          name,
          dummyRule.getPropertyValue(name),
          dummyRule.getPropertyPriority(name)
        );
      }
      this._setInProgress = false;
      if (this._onChange) {
        this._onChange(this.cssText);
      }
    } catch (err) {
      // Do nothing if CSS is malformed
    }
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

allProperties.forEach((property) => {
  if (!implementedProperties.has(property)) {
    const declaration = getBasicPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
    Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
  }
});

allExtraProperties.forEach((property) => {
  if (!implementedProperties.has(property)) {
    const declaration = getBasicPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
    Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
  }
});

exports.CSSStyleDeclaration = CSSStyleDeclaration;
