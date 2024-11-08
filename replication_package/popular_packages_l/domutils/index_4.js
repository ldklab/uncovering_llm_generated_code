// domutils.js
const htmlparser2 = require('htmlparser2');

class DomUtils {
  // Method to find elements by tag name within a specified element.
  static getElementsByTagName(name, element, recurse = true, limit = Infinity) {
    const matches = [];
    const stack = [element];

    // Iterate through the stack to look for matching tag names.
    while (stack.length && matches.length < limit) {
      const el = stack.pop();
      if (el.name === name) {
        matches.push(el);
      }
      // If recurse is true, add children to stack for further exploration.
      if (recurse && el.children) {
        stack.push(...el.children);
      }
    }

    return matches;
  }

  // Method to get text content from an element, including its children recursively.
  static getText(element) {
    if (element.type === 'text') {
      return element.data;
    }
    if (element.children && element.children.length > 0) {
      return element.children.map(child => DomUtils.getText(child)).join('');
    }
    return '';
  }

  // Method to traverse elements and apply a callback function to each element.
  static traverse(elements, callback) {
    elements.forEach(element => {
      callback(element);
      if (element.children) {
        DomUtils.traverse(element.children, callback);
      }
    });
  }
}

// Example usage of the class above.
// Instantiate the HTML parser.
const parser = new htmlparser2.Parser({
  onend() {
    const dom = parser.domHandler.dom;
    const utils = new DomUtils();
    
    // Retrieve all <div> elements.
    const divs = utils.getElementsByTagName('div', dom);
    
    // Print text content of each <div> element.
    divs.forEach(div => console.log(utils.getText(div)));
  }
});

// Define the HTML content to be parsed.
parser.write('<html><body><div>Hello World!</div></body></html>');
parser.end();

// Export the DomUtils class for use in other files.
module.exports = DomUtils;
