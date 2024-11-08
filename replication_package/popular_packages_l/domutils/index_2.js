// domutils.js
const htmlparser2 = require('htmlparser2');

class DomUtils {
  static getElementsByTagName(tagName, rootElement, recurse = true, limit = Infinity) {
    const results = [];
    const elementsToProcess = [rootElement];

    while (elementsToProcess.length > 0 && results.length < limit) {
      const currentElement = elementsToProcess.pop();
      if (currentElement.name === tagName) {
        results.push(currentElement);
      }
      if (recurse && currentElement.children) {
        elementsToProcess.push(...currentElement.children);
      }
    }

    return results;
  }

  static getText(domElement) {
    if (domElement.type === 'text') {
      return domElement.data;
    }
    if (domElement.children) {
      return domElement.children.map(child => DomUtils.getText(child)).join('');
    }
    return '';
  }

  static traverse(domElements, callback) {
    domElements.forEach(domElement => {
      callback(domElement);
      if (domElement.children) {
        DomUtils.traverse(domElement.children, callback);
      }
    });
  }
}

// Example usage
const parser = new htmlparser2.Parser();
parser.write('<html><body><div>Hello World!</div></body></html>');
parser.end();

const parsedDOM = parser.dom;
const domUtilsInstance = new DomUtils();
const divElements = domUtilsInstance.getElementsByTagName('div', parsedDOM);
divElements.forEach(div => {
  console.log(domUtilsInstance.getText(div));
});

module.exports = DomUtils;
