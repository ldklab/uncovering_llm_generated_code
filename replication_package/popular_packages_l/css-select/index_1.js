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
    const funcs = parsedSelector[0].map(part => CSSselect.compilePart(part, options));
    return element => funcs.every(func => func(element));
  }

  static compilePart(part, options) {
    if (part.type === 'tag') {
      return elem => elem.tagName === part.name;
    } else if (part.type === 'descendant') {
      return elem => elem.parentNode != null;
    } else {
      throw new Error(`Unsupported selector type: ${part.type}`);
    }
  }

  static is(elem, query, options = {}) {
    const compiledSelector = CSSselect.compile(query, options);
    return compiledSelector(elem);
  }

  static selectOne(selector, elems, options = {}) {
    const compiledSelector = CSSselect.compile(selector, options);
    return domutils.findOne(compiledSelector, elems, options);
  }
}

module.exports = CSSselect;
