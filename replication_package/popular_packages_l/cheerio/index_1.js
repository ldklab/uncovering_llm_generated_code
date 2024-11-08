const { parse } = require('node-html-parser');

class Cheerio {
  constructor(rootElement) {
    this.root = rootElement;
  }
  
  static load(html) {
    const root = parse(`<html><head></head><body>${html}</body></html>`);
    return new Cheerio(root);
  }
  
  find(selector) {
    return this.root.querySelectorAll(selector);
  }
  
  text(selector) {
    return this.find(selector).map(el => el.text).join('');
  }
  
  html() {
    return this.root.toString();
  }
  
  attr(selector, attribute, value) {
    const elements = this.find(selector);
    if (value !== undefined) {
      elements.forEach(el => el.setAttribute(attribute, value));
    } else if (elements.length > 0) {
      return elements[0].getAttribute(attribute);
    }
  }
}

// Example usage:
const cheerio = Cheerio.load('<ul id="fruits"><li class="apple">Apple</li><li class="orange">Orange</li></ul>');
console.log(cheerio.html());
//=> <html><head></head><body><ul id="fruits"><li class="apple">Apple</li><li class="orange">Orange</li></ul></body></html>

console.log(cheerio.text('.apple'));
//=> Apple

cheerio.attr('li', 'class', 'fruit');
console.log(cheerio.html());
//=> <html><head></head><body><ul id="fruits"><li class="fruit">Apple</li><li class="fruit">Orange</li></ul></body></html>
