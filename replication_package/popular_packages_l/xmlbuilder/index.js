// xmlbuilder.js: A simple XML builder implementation

class XMLElement {
  constructor(name) {
    this.name = name;
    this.attributes = {};
    this.children = [];
    this.text = null;
  }

  // Add an attribute
  att(name, value) {
    this.attributes[name] = value;
    return this;
  }

  // Add a child element
  ele(name, attrs, text) {
    const child = new XMLElement(name);
    if (typeof attrs === 'object') {
      for (let [key, value] of Object.entries(attrs)) {
        child.att(key, value);
      }
    }
    if (typeof text === 'string') {
      child.text = text;
    }
    this.children.push(child);
    return child;
  }

  // Add a comment
  com(text) {
    this.children.push({ comment: text });
    return this;
  }

  // Recursive function to end the XML document
  end(options = {}) {
    const { pretty } = options;
    const indentation = pretty ? '  ' : '';
    const newLine = pretty ? '\n' : '';

    const buildXMLString = (node, level = 0) => {
      if (node.comment) {
        return `${indentation.repeat(level)}<!-- ${node.comment} -->${newLine}`;
      }

      let attrs = '';
      for (let [key, value] of Object.entries(node.attributes)) {
        attrs += ` ${key}="${value}"`;
      }

      let xmlString = `${indentation.repeat(level)}<${node.name}${attrs}`;

      if (node.text !== null) {
        xmlString += `>${node.text}</${node.name}>${newLine}`;
      } else if (node.children.length > 0) {
        xmlString += `>${newLine}`;
        for (let child of node.children) {
          xmlString += buildXMLString(child, level + 1);
        }
        xmlString += `${indentation.repeat(level)}</${node.name}>${newLine}`;
      } else {
        xmlString += `/>${newLine}`;
      }

      return xmlString;
    };

    return `<?xml version="1.0"?>${newLine}` + buildXMLString(this);
  }

  // Create from object
  static create(obj) {
    const createFromObject = (obj, name) => {
      const element = new XMLElement(name);
      for (let [key, value] of Object.entries(obj)) {
        if (key === '#text') {
          element.text = value;
        } else if (key.startsWith('@')) {
          element.att(key.slice(1), value);
        } else if (typeof value === 'object') {
          const child = createFromObject(value, key);
          element.children.push(child);
        }
      }
      return element;
    };

    const rootName = Object.keys(obj)[0];
    const rootObj = obj[rootName];
    return createFromObject(rootObj, rootName);
  }
}

// Example usage:
const builder = {
  create: (name) => new XMLElement(name),
};

// Exporting for use
module.exports = builder;
