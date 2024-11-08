'use strict';

const CSSOM = require('cssom');
const allProperties = require('./allProperties');
const allExtraProperties = require('./allExtraProperties');
const implementedProperties = require('./implementedProperties');
const { dashedToCamelCase } = require('./parsers');
const getBasicPropertyDescriptor = require('./utils/getBasicPropertyDescriptor');

class CSSStyleDeclaration {
  constructor(onChangeCallback = () => {}) {
    this._values = {};
    this._importants = {};
    this._length = 0;
    this._onChange = onChangeCallback;
  }

  get cssText() {
    const properties = [];
    for (let i = 0; i < this._length; i++) {
      const name = this[i];
      const value = this.getPropertyValue(name);
      let priority = this.getPropertyPriority(name);
      if (priority !== '') {
        priority = ' !' + priority;
      }
      properties.push(`${name}: ${value}${priority};`);
    }
    return properties.join(' ');
  }

  set cssText(value) {
    this._values = {};
    Array.prototype.splice.call(this, 0, this._length);
    this._importants = {};
    let dummyRule;
    try {
      dummyRule = CSSOM.parse(`#bogus{${value}}`).cssRules[0].style;
    } catch {
      return;
    }
    for (let i = 0; i < dummyRule.length; ++i) {
      const name = dummyRule[i];
      this.setProperty(name, dummyRule.getPropertyValue(name), dummyRule.getPropertyPriority(name));
    }
    this._onChange(this.cssText);
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

  get parentRule() {
    return null;
  }

  getPropertyValue(name) {
    return this._values[name]?.toString() || '';
  }

  setProperty(name, value, priority = null) {
    if (value == null || value === '') {
      return this.removeProperty(name);
    }
    const isCustomProperty = name.startsWith('--');
    if (isCustomProperty) {
      return this._setProperty(name, value, priority);
    }
    const lowercaseName = name.toLowerCase();
    if (!allProperties.has(lowercaseName) && !allExtraProperties.has(lowercaseName)) {
      return;
    }
    this[lowercaseName] = value;
    this._importants[lowercaseName] = priority;
  }

  _setProperty(name, value, priority) {
    if (value === undefined) return;
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
    if (!this._values.hasOwnProperty(name)) {
      return '';
    }
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

  getPropertyCSSValue() {
    // Not implemented
    return;
  }

  getPropertyShorthand() {
    // Not implemented
    return;
  }

  isPropertyImplicit() {
    // Not implemented
    return;
  }

  item(index) {
    index = parseInt(index, 10);
    return index < 0 || index >= this._length ? '' : this[index];
  }
}

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
