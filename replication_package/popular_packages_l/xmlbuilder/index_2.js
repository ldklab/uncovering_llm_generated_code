// xmlbuilder.js: Simple XML builder implementation

class XMLElement {
  constructor(name) {
    this.name = name;
    this.attributes = {};
    this.children = [];
    this.text = null;
  }

  att(name, value) {
    this.attributes[name] = value;
    return this;
  }

  ele(name, attrs, text) {
    const child = new XMLElement(name);
    if (attrs && typeof attrs === 'object') {
      Object.entries(attrs).forEach(([key, value]) => child.att(key, value));
    }
    if (typeof text === 'string') {
      child.text = text;
    }
    this.children.push(child);
    return child;
  }

  com(text) {
    this.children.push({ comment: text });
    return this;
  }

  end(options = {}) {
    const { pretty } = options;
    const indentation = pretty ? '  ' : '';
    const newLine = pretty ? '\n' : '';

    const buildXMLString = (node, level = 0) => {
      if ('comment' in node) {
        return `${indentation.repeat(level)}<!-- ${node.comment} -->${newLine}`;
      }

      let attrs = Object.entries(node.attributes)
                        .map(([key, value]) => ` ${key}="${value}"`)
                        .join('');

      let xmlString = `${indentation.repeat(level)}<${node.name}${attrs}`;

      if (node.text) {
        xmlString += `>${node.text}</${node.name}>${newLine}`;
      } else if (node.children.length > 0) {
        xmlString += `>${newLine}${node.children.map(child => buildXMLString(child, level + 1)).join('')}${indentation.repeat(level)}</${node.name}>${newLine}`;
      } else {
        xmlString += `/>${newLine}`;
      }

      return xmlString;
    };

    return `<?xml version="1.0"?>${newLine}` + buildXMLString(this);
  }

  static create(obj) {
    const createFromObject = (obj, name) => {
      const element = new XMLElement(name);
      Object.entries(obj).forEach(([key, value]) => {
        if (key === '#text') {
          element.text = value;
        } else if (key.startsWith('@')) {
          element.att(key.slice(1), value);
        } else if (typeof value === 'object') {
          element.children.push(createFromObject(value, key));
        }
      });
      return element;
    };

    const rootName = Object.keys(obj)[0];
    return createFromObject(obj[rootName], rootName);
  }
}

// Example usage
const builder = {
  create: (name) => new XMLElement(name),
};

// Exporting for use
module.exports = builder;
