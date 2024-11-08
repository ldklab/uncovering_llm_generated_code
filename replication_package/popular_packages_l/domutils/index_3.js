// domutils.js
const htmlparser2 = require('htmlparser2');

// The DomUtils class provides utility methods for working with a DOM-like structure
// parsed using the htmlparser2 library.
class DomUtils {
  // Returns all elements with a given tag name.
  // The search can be recursive and may limit the number of returned elements.
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

  // Extracts and concatenates all text content from a given element and its children.
  static getText(element) {
    if (element.type === 'text') {
      return element.data;
    }
    if (element.children && element.children.length > 0) {
      return element.children.map(child => DomUtils.getText(child)).join('');
    }
    return '';
  }

  // Traverses a list of elements and applies a callback function to each element.
  // Recursively applies the callback to each element's children.
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
// Initialize an HTML parser and write some HTML code to be parsed.
const parser = new htmlparser2.Parser();
parser.write('<html><body><div>Hello World!</div></body></html>');
parser.end();

// Get the parsed DOM structure.
const dom = parser.dom;
const divs = DomUtils.getElementsByTagName('div', dom);

// For each div element found, extract and print its text content.
divs.forEach(div => {
  console.log(DomUtils.getText(div));
});

module.exports = DomUtils;
