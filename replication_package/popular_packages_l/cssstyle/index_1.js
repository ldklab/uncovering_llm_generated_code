// cssstyle.js
class CSSStyleDeclaration {
  constructor() {
    this.properties = {};
  }

  setProperty(propertyName, value, priority = '') {
    this.properties[propertyName] = {
      value: String(value),
      priority: String(priority)
    };
  }

  getPropertyValue(propertyName) {
    return this.properties[propertyName] ? this.properties[propertyName].value : '';
  }

  getPropertyPriority(propertyName) {
    return this.properties[propertyName] ? this.properties[propertyName].priority : '';
  }

  removeProperty(propertyName) {
    const oldValue = this.getPropertyValue(propertyName);
    delete this.properties[propertyName];
    return oldValue;
  }

  get cssText() {
    return Object.entries(this.properties)
      .map(([prop, { value, priority }]) => `${prop}: ${value}${priority ? ' !' + priority : ''};`)
      .join(' ');
  }
}

module.exports = CSSStyleDeclaration;

// Example usage:
// const CSSStyleDeclaration = require('./cssstyle');
// const style = new CSSStyleDeclaration();
// style.setProperty('color', 'red');
// console.log(style.getPropertyValue('color')); // Outputs: red
// console.log(style.cssText); // Outputs: color: red;
