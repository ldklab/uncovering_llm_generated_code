// xml-serializer.js

class XMLSerializer {
  serializeToString(node, options = {}) {
    const requireWellFormed = !!options.requireWellFormed;
    if (requireWellFormed && !this.isWellFormed(node)) {
      throw new Error("Node is not well-formed");
    }
    return this.serializeNode(node);
  }

  serializeNode(node) {
    switch (node.nodeType) {
      case node.ELEMENT_NODE:
        return this.serializeElement(node);
      case node.TEXT_NODE:
        return this.escapeXML(node.nodeValue);
      case node.COMMENT_NODE:
        return `<!--${node.nodeValue}-->`;
      default:
        return '';
    }
  }

  serializeElement(element) {
    let tagOpen = `<${element.tagName.toLowerCase()}`;
    if (!element.hasAttribute('xmlns')) {
      tagOpen += ` xmlns="http://www.w3.org/1999/xhtml"`;
    }
    for (let attr of Array.from(element.attributes)) {
      tagOpen += ` ${attr.name}="${this.escapeAttributeValue(attr.value)}"`;
    }
    if (element.childNodes.length === 0) {
      return `${tagOpen}></${element.tagName.toLowerCase()}>`;
    }
    let tagContent = '';
    for (let child of Array.from(element.childNodes)) {
      tagContent += this.serializeNode(child);
    }
    return `${tagOpen}>${tagContent}</${element.tagName.toLowerCase()}>`;
  }

  escapeXML(value) {
    return value.replace(/[<>&'"]/g, char => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return char;
      }
    });
  }

  escapeAttributeValue(value) {
    return this.escapeXML(value.replace(/"/g, '&quot;'));
  }

  isWellFormed(node) {
    const nameRegex = /^[A-Za-z_][\w.-]*$/;
    if (node.nodeType === node.ELEMENT_NODE) {
      if (!nameRegex.test(node.tagName)) {
        return false;
      }
      for (let attr of Array.from(node.attributes)) {
        if (!nameRegex.test(attr.name)) {
          return false;
        }
      }
    }
    for (let child of Array.from(node.childNodes)) {
      if (!this.isWellFormed(child)) {
        return false;
      }
    }
    return true;
  }
}

module.exports = function(node, options) {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(node, options);
};
