// dom-testing-library.js

const { JSDOM } = require('jsdom');

class DOMTestingLibrary {
  constructor(domString) {
    // Use JSDOM to simulate a DOM environment from the input HTML string
    this.dom = new JSDOM(domString).window.document;
  }

  // Query elements by text content
  getByText(text) {
    return Array.from(this.dom.body.querySelectorAll("*"))
      .filter(element => element.textContent.includes(text));
  }

  // Query elements by ID
  getById(id) {
    return this.dom.getElementById(id);
  }

  // Query elements by tag name
  getByTagName(tagName) {
    return this.dom.getElementsByTagName(tagName);
  }
}

// USAGE EXAMPLE
const htmlString = `
  <div>
    <h1 id="header">Welcome</h1>
    <p>This is a paragraph of text.</p>
  </div>
`;

const library = new DOMTestingLibrary(htmlString);

const heading = library.getById('header'); // <h1 id="header">Welcome</h1>
const paragraphs = library.getByTagName('p'); // HTMLCollection of <p>
const textElement = library.getByText('Welcome'); // Array containing <h1>

// Export for usage in node environment
module.exports = DOMTestingLibrary;
