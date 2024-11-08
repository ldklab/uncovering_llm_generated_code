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
      case Node.ELEMENT_NODE:
        return this.serializeElement(node);
      case Node.TEXT_NODE:
        return this.escapeXML(node.nodeValue);
      case Node.COMMENT_NODE:
        return `<!--${node.nodeValue}-->`;
      default:
        return '';
    }
  }

  serializeElement(element) {
    const tagName = element.tagName.toLowerCase();
    let result = `<${tagName}`;
    const namespaceURI = 'http://www.w3.org/1999/xhtml';

    if (!element.hasAttribute('xmlns')) {
      result += ` xmlns="${namespaceURI}"`;
    }

    for (const attr of Array.from(element.attributes)) {
      result += ` ${attr.name}="${this.escapeAttributeValue(attr.value)}"`;
    }

    if (element.childNodes.length === 0) {
      return `${result}></${tagName}>`;
    }

    result += '>';
    for (const child of Array.from(element.childNodes)) {
      result += this.serializeNode(child);
    }
    
    return `${result}</${tagName}>`;
  }

  escapeXML(value) {
    return value.replace(/[<>&'"]/g, char => {
      const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };
      return entities[char] || char;
    });
  }

  escapeAttributeValue(value) {
    return this.escapeXML(value.replace(/"/g, '&quot;'));
  }

  isWellFormed(node) {
    const namePattern = /^[A-Za-z_][\w.-]*$/;

    if (node.nodeType === Node.ELEMENT_NODE) {
      if (!namePattern.test(node.tagName)) {
        return false;
      }
      for (const attr of Array.from(node.attributes)) {
        if (!namePattern.test(attr.name)) {
          return false;
        }
      }
    }

    for (const child of Array.from(node.childNodes)) {
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
