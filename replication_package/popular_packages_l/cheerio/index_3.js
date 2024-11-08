const { parse } = require('node-html-parser');

class SimpleDOM {
  constructor(parsedElement) {
    this.document = parsedElement;
  }
  
  static parseHtml(htmlContent) {
    const documentRoot = parse(`<html><head></head><body>${htmlContent}</body></html>`);
    return new SimpleDOM(documentRoot);
  }
  
  selectElements(selector) {
    return this.document.querySelectorAll(selector);
  }
  
  getTextContent(selector) {
    const matchedElements = this.selectElements(selector);
    return matchedElements.map(element => element.text).join('');
  }
  
  getHtml() {
    return this.document.toString();
  }
  
  modifyAttribute(selector, attributeName, attributeValue) {
    const elements = this.selectElements(selector);
    if (attributeValue !== undefined) {
      elements.forEach(element => element.setAttribute(attributeName, attributeValue));
    } else if (elements.length > 0) {
      return elements[0].getAttribute(attributeName);
    }
  }
}

// Example usage:
const domHandler = SimpleDOM.parseHtml('<ul id="fruits"><li class="apple">Apple</li><li class="orange">Orange</li></ul>');
console.log(domHandler.getHtml());
//=> <html><head></head><body><ul id="fruits"><li class="apple">Apple</li><li class="orange">Orange</li></ul></body></html>

console.log(domHandler.getTextContent('.apple'));
//=> Apple

domHandler.modifyAttribute('li', 'class', 'fruit');
console.log(domHandler.getHtml());
//=> <html><head></head><body><ul id="fruits"><li class="fruit">Apple</li><li class="fruit">Orange</li></ul></body></html>
