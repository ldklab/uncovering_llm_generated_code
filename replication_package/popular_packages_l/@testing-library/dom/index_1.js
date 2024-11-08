// dom-testing-library.js

class DOMTestingLibrary {
  constructor(domString) {
    // Initializes the DOM by parsing the input HTML string
    const parser = new DOMParser();
    this.dom = parser.parseFromString(domString, 'text/html');
  }

  // Method to find elements containing specific text
  getByText(text) {
    const elements = this.dom.body.querySelectorAll("*");
    return Array.from(elements).filter(element => element.textContent.includes(text));
  }

  // Method to find an element by its ID attribute
  getById(id) {
    return this.dom.getElementById(id);
  }

  // Method to find elements by their tag name
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
const paragraphs = library.getByTagName('p'); // HTMLCollection of <p> elements
const textElement = library.getByText('Welcome'); // Array containing <h1>

// Export for usage in node environment
module.exports = DOMTestingLibrary;
