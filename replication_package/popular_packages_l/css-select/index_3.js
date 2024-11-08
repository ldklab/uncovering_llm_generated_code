// index.js
const cssWhat = require('css-what');
const domutils = require('domutils');

class CSSselect {
  static selectAll(selector, elems, options = {}) {
    const compiledSelector = CSSselect.compile(selector, options);
    return domutils.findAll(compiledSelector, elems, options);
  }

  static compile(selector, options = {}) {
    const parsedSelector = cssWhat.parse(selector);
    const matchFunctions = parsedSelector[0].map(part => CSSselect.compilePart(part, options));

    return element => matchFunctions.every(func => func(element));
  }

  static compilePart(part, options) {
    switch (part.type) {
      case 'tag':
        return elem => elem.tagName === part.name;
      case 'descendant':
        return elem => elem.parentNode !== null;
      // Further cases for other selector parts...
      default:
        throw new Error(`Unsupported selector type: ${part.type}`);
    }
  }

  static is(element, selector, options = {}) {
    const compiledSelector = CSSselect.compile(selector, options);
    return compiledSelector(element);
  }

  static selectOne(selector, elems, options = {}) {
    const compiledSelector = CSSselect.compile(selector, options);
    return domutils.findOne(compiledSelector, elems, options);
  }
}

module.exports = CSSselect;
