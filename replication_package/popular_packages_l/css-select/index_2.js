const cssWhat = require('css-what');
const domutils = require('domutils');

class CSSselectorEngine {
  static findAll(selector, elements, options = {}) {
    const filterFunction = CSSselectorEngine.createFilterFunction(selector, options);
    return domutils.findAll(filterFunction, elements, options);
  }

  static createFilterFunction(selector, options = {}) {
    const parsedSelector = cssWhat.parse(selector);
    const filterFunctions = parsedSelector[0].map(part => CSSselectorEngine.createPartFunction(part, options));
    return element => filterFunctions.every(func => func(element));
  }

  static createPartFunction(part, options) {
    switch (part.type) {
      case 'tag':
        return element => element.tagName === part.name;
      case 'descendant':
        return element => element.parentNode !== null;
      default:
        throw new Error(`Unsupported selector type: ${part.type}`);
    }
  }

  static matchesElement(element, selector, options = {}) {
    const filterFunction = CSSselectorEngine.createFilterFunction(selector, options);
    return filterFunction(element);
  }

  static findFirst(selector, elements, options = {}) {
    const filterFunction = CSSselectorEngine.createFilterFunction(selector, options);
    return domutils.findOne(filterFunction, elements, options);
  }
}

module.exports = CSSselectorEngine;
