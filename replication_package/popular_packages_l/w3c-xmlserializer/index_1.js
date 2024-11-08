class XMLSerializer {
  serializeToString(node, options = {}) {
    if (options.requireWellFormed && !this.isWellFormed(node)) {
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
    let tag = `<${element.tagName.toLowerCase()}`;
    if (!element.hasAttribute('xmlns')) {
      tag += ' xmlns="http://www.w3.org/1999/xhtml"';
    }
    Array.from(element.attributes).forEach(attr => {
      tag += ` ${attr.name}="${this.escapeAttributeValue(attr.value)}"`;
    });
    if (element.childNodes.length === 0) {
      return `${tag}></${element.tagName.toLowerCase()}>`;
    }
    return `${tag}>${
      Array.from(element.childNodes).map(child => this.serializeNode(child)).join('')
    }</${element.tagName.toLowerCase()}>`;
  }

  escapeXML(value) {
    return value.replace(/[<>&'"]/g, char => ({
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;',
    })[char] || char);
  }

  escapeAttributeValue(value) {
    return this.escapeXML(value.replace(/"/g, '&quot;'));
  }

  isWellFormed(node) {
    const nameRegex = /^[A-Za-z_][\w.-]*$/;
    if (node.nodeType === Node.ELEMENT_NODE && !nameRegex.test(node.tagName)) {
      return false;
    }
    return Array.from(node.attributes).every(attr => nameRegex.test(attr.name))
      && Array.from(node.childNodes).every(child => this.isWellFormed(child));
  }
}

module.exports = function(node, options) {
  return new XMLSerializer().serializeToString(node, options);
};
