// domutils.js
const { Parser } = require('htmlparser2');

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
const parser = new Parser({
  onopentagname(name) {
    currentNode = { name, type: 'tag', children: [], parent: currentNode };
    currentNode.parent.children.push(currentNode);
  },
  ontext(text) {
    currentNode.children.push({ type: 'text', data: text, parent: currentNode });
  },
  onclosetag() {
    currentNode = currentNode.parent;
  }
});

let currentNode = { type: 'root', children: [] };
parser.write('<html><body><div>Hello World!</div></body></html>');
parser.end();

const dom = currentNode.children;
const divs = DomUtils.getElementsByTagName('div', dom[0]);
divs.forEach(div => console.log(DomUtils.getText(div)));

module.exports = DomUtils;
