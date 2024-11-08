// domutils.js
const htmlparser2 = require('htmlparser2');

class DomUtils {
  static getElementsByTagName(name, element, recurse = true, limit = Infinity) {
    const matches = [];
    const stack = [element];

    while (stack.length && matches.length < limit) {
      const el = stack.pop();
      if (el.name === name) {
        matches.push(el);
      }
      if (recurse && el.children) {
        stack.push(...el.children);
      }
    }

    return matches;
  }

  static getText(element) {
    if (element.type === 'text') {
      return element.data;
    }
    if (element.children && element.children.length > 0) {
      return element.children.map(child => DomUtils.getText(child)).join('');
    }
    return '';
  }

  static traverse(elements, callback) {
    elements.forEach(element => {
      callback(element);
      if (element.children) {
        DomUtils.traverse(element.children, callback);
      }
    });
  }
}

// Example usage:
const parser = new htmlparser2.Parser();
parser.write('<html><body><div>Hello World!</div></body></html>');
parser.end();

const dom = parser.dom;
const utils = new DomUtils();
const divs = utils.getElementsByTagName('div', dom);
divs.forEach(div => console.log(utils.getText(div)));

module.exports = DomUtils;
