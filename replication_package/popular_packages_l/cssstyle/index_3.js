// cssstyle.js
class CSSStyleDeclaration {
  constructor() {
    this.properties = {};
  }

  // Sets a CSS property with its value and optional priority
  setProperty(propertyName, value, priority = '') {
    this.properties[propertyName] = {
      value: String(value),
      priority: String(priority)
    };
  }

  // Retrieves the value of a given CSS property
  getPropertyValue(propertyName) {
    return this.properties[propertyName] ? this.properties[propertyName].value : '';
  }

  // Retrieves the priority of a given CSS property, if any
  getPropertyPriority(propertyName) {
    return this.properties[propertyName] ? this.properties[propertyName].priority : '';
  }

  // Removes a CSS property and returns its previous value
  removeProperty(propertyName) {
    const oldValue = this.getPropertyValue(propertyName);
    delete this.properties[propertyName];
    return oldValue;
  }

  // Returns the CSS text representation of the current properties
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
