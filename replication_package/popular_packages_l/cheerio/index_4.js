const { parse } = require('node-html-parser');

class SimpleCheerio {
  constructor(rootElement) {
    this.root = rootElement;
  }

  static load(htmlContent) {
    const root = parse(`<html><head></head><body>${htmlContent}</body></html>`);
    return new SimpleCheerio(root);
  }

  find(selector) {
    return this.root.querySelectorAll(selector);
  }

  text(selector) {
    const selectedElements = this.find(selector);
    return selectedElements.map(element => element.text).join('');
  }

  html() {
    return this.root.toString();
  }

  attr(selector, attribute, newValue) {
    const targetedElements = this.find(selector);
    if (newValue !== undefined) {
      targetedElements.forEach(element => element.setAttribute(attribute, newValue));
    } else if (targetedElements.length > 0) {
      return targetedElements[0].getAttribute(attribute);
    }
  }
}

// Example usage:
const cheerioInstance = SimpleCheerio.load('<ul id="fruits"><li class="apple">Apple</li><li class="orange">Orange</li></ul>');
console.log(cheerioInstance.html());

console.log(cheerioInstance.text('.apple'));

cheerioInstance.attr('li', 'class', 'fruit');
console.log(cheerioInstance.html());
