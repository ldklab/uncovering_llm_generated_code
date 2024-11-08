// index.js
const cssWhat = require('css-what');
const domutils = require('domutils');

class CSSselect {
  static selectAll(selector, elems, options = {}) {
    const compiledSelector = this.compile(selector, options);
    return domutils.findAll(compiledSelector, elems, options);
  }

  static compile(selector, options = {}) {
    const parsedSelector = cssWhat.parse(selector);
    const testFunctions = parsedSelector[0].map(part => this.compilePart(part, options));

    return element => testFunctions.every(func => func(element));
  }

  static compilePart(part, options) {
    switch (part.type) {
      case 'tag':
        return elem => elem.tagName === part.name;
      case 'descendant':
        return elem => elem.parentNode != null;
      // Additional selector types can be handled here...
      default:
        throw new Error(`Unsupported selector type: ${part.type}`);
    }
  }

  static is(elem, query, options = {}) {
    const compiledSelector = this.compile(query, options);
    return compiledSelector(elem);
  }

  static selectOne(selector, elems, options = {}) {
    const compiledSelector = this.compile(selector, options);
    return domutils.findOne(compiledSelector, elems, options);
  }
}

module.exports = CSSselect;
